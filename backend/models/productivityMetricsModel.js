import mongoose from 'mongoose';

const productivityMetricsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  // Daily metrics
  totalTodos: {
    type: Number,
    default: 0
  },
  completedTodos: {
    type: Number,
    default: 0
  },
  totalTimeLogged: {
    type: Number, // in minutes
    default: 0
  },
  productiveTime: {
    type: Number, // in minutes (productivity >= 4)
    default: 0
  },
  // Productivity scores (1-5)
  avgProductivity: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  avgMood: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  avgEnergy: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  // Completion rates
  todoCompletionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  productivityScore: {
    type: Number, // Calculated overall score
    default: 0,
    min: 0,
    max: 100
  },
  // Category breakdown
  categoryBreakdown: [{
    category: String,
    duration: Number, // in minutes
    percentage: Number
  }],
  // Goals and achievements
  dailyGoal: {
    type: Number, // target productive hours
    default: 8
  },
  goalAchieved: {
    type: Boolean,
    default: false
  },
  streakDays: {
    type: Number,
    default: 0
  },
  // Week/Month aggregates
  weeklyAvgProductivity: {
    type: Number,
    default: 0
  },
  monthlyAvgProductivity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create compound indexes
productivityMetricsSchema.index({ userId: 1, date: 1 }, { unique: true });
productivityMetricsSchema.index({ userId: 1, productivityScore: -1, date: 1 });

// Pre-save middleware to calculate productivity score
productivityMetricsSchema.pre('save', function(next) {
  // Calculate productivity score based on multiple factors
  const todoWeight = 0.3;
  const timeWeight = 0.3;
  const qualityWeight = 0.4;

  const todoScore = this.todoCompletionRate;
  const timeScore = Math.min(100, (this.productiveTime / (this.dailyGoal * 60)) * 100);
  const qualityScore = (this.avgProductivity / 5) * 100;

  this.productivityScore = Math.round(
    (todoScore * todoWeight) + 
    (timeScore * timeWeight) + 
    (qualityScore * qualityWeight)
  );

  // Check if daily goal is achieved
  this.goalAchieved = (this.productiveTime / 60) >= this.dailyGoal;

  next();
});

// Static method to update or create daily metrics
productivityMetricsSchema.statics.updateDailyMetrics = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Import models (avoid circular dependency)
  const CalendarTodo = mongoose.model('CalendarTodo');
  const TimeLog = mongoose.model('TimeLog');

  // Get todo metrics
  const todos = await CalendarTodo.find({
    userId,
    dueDate: { $gte: startOfDay, $lte: endOfDay }
  });

  const completedTodos = todos.filter(t => t.isCompleted).length;

  // Get time log metrics
  const timeLogs = await TimeLog.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });

  const totalTimeLogged = timeLogs.reduce((sum, log) => sum + log.duration, 0);
  const productiveTime = timeLogs
    .filter(log => log.productivity >= 4)
    .reduce((sum, log) => sum + log.duration, 0);

  const avgProductivity = timeLogs.length > 0 
    ? timeLogs.reduce((sum, log) => sum + log.productivity, 0) / timeLogs.length 
    : 0;

  const avgMood = timeLogs.length > 0 
    ? timeLogs.reduce((sum, log) => sum + log.mood, 0) / timeLogs.length 
    : 0;

  const avgEnergy = timeLogs.length > 0 
    ? timeLogs.reduce((sum, log) => sum + log.energy, 0) / timeLogs.length 
    : 0;

  // Calculate category breakdown
  const categoryMap = new Map();
  timeLogs.forEach(log => {
    const current = categoryMap.get(log.category) || 0;
    categoryMap.set(log.category, current + log.duration);
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, duration]) => ({
    category,
    duration,
    percentage: totalTimeLogged > 0 ? Math.round((duration / totalTimeLogged) * 100) : 0
  }));

  // Update or create metrics
  const metrics = await this.findOneAndUpdate(
    { userId, date: startOfDay },
    {
      totalTodos: todos.length,
      completedTodos,
      totalTimeLogged,
      productiveTime,
      avgProductivity,
      avgMood,
      avgEnergy,
      todoCompletionRate: todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0,
      categoryBreakdown
    },
    { upsert: true, new: true }
  );

  return metrics;
};

// Static method to get weekly/monthly aggregates
productivityMetricsSchema.statics.getAggregateMetrics = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        avgProductivityScore: { $avg: '$productivityScore' },
        avgTodoCompletion: { $avg: '$todoCompletionRate' },
        avgProductivity: { $avg: '$avgProductivity' },
        avgMood: { $avg: '$avgMood' },
        avgEnergy: { $avg: '$avgEnergy' },
        totalProductiveTime: { $sum: '$productiveTime' },
        totalTimeLogged: { $sum: '$totalTimeLogged' },
        totalTodos: { $sum: '$totalTodos' },
        totalCompletedTodos: { $sum: '$completedTodos' },
        goalsAchieved: { $sum: { $cond: ['$goalAchieved', 1, 0] } },
        daysTracked: { $sum: 1 }
      }
    }
  ]);
};

const ProductivityMetrics = mongoose.model('ProductivityMetrics', productivityMetricsSchema);

export default ProductivityMetrics;