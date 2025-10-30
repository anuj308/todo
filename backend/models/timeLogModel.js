import mongoose from 'mongoose';

const timeLogSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  duration: {
    type: Number, // in minutes
    // Not required since it's calculated in pre-save middleware
  },
  category: {
    type: String,
    enum: [
      'work',
      'study',
      'exercise',
      'sleep',
      'meal',
      'social',
      'entertainment',
      'commute',
      'shopping',
      'chores',
      'break',
      'deepwork',
      'meeting',
      'learning',
      'personal',
      'other'
    ],
    required: [true, 'Category is required'],
    index: true
  },
  subcategory: {
    type: String,
    default: '',
    trim: true
  },
  activity: {
    type: String,
    required: [true, 'Activity description is required'],
    trim: true,
    maxlength: [200, 'Activity description cannot exceed 200 characters']
  },
  productivity: {
    type: Number,
    min: 1,
    max: 5,
    default: 3 // 1 = very low, 5 = very high
  },
  mood: {
    type: Number,
    min: 1,
    max: 5,
    default: 3 // 1 = very bad, 5 = very good
  },
  energy: {
    type: Number,
    min: 1,
    max: 5,
    default: 3 // 1 = very low, 5 = very high
  },
  notes: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  linkedTodoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CalendarTodo',
    default: null
  },
  isPlanned: {
    type: Boolean,
    default: false // true if planned ahead, false if logged after
  },
  userId: {
    type: String,
    required: true,
    index: true
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
  },
  toObject: { virtuals: true }
});

// Create compound indexes for efficient queries
timeLogSchema.index({ userId: 1, date: 1, startTime: 1 });
timeLogSchema.index({ userId: 1, category: 1, date: 1 });
timeLogSchema.index({ userId: 1, productivity: 1, date: 1 });

// Pre-save middleware to calculate duration
timeLogSchema.pre('save', function(next) {
  console.log('Pre-save middleware - startTime:', this.startTime);
  console.log('Pre-save middleware - endTime:', this.endTime);
  console.log('Pre-save middleware - existing duration:', this.duration);
  
  if (this.startTime && this.endTime) {
    const calculatedDuration = Math.round((this.endTime - this.startTime) / (1000 * 60));
    console.log('Pre-save middleware - calculated duration:', calculatedDuration);
    this.duration = calculatedDuration;
  }
  
  console.log('Pre-save middleware - final duration:', this.duration);
  next();
});

// Virtual for duration in hours
timeLogSchema.virtual('durationHours').get(function() {
  return (this.duration / 60).toFixed(2);
});

// Static method to get daily summary
timeLogSchema.statics.getDailySummary = function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: '$category',
        totalDuration: { $sum: '$duration' },
        avgProductivity: { $avg: '$productivity' },
        avgMood: { $avg: '$mood' },
        avgEnergy: { $avg: '$energy' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalDuration: -1 }
    }
  ]);
};

// Static method to get productivity trends
timeLogSchema.statics.getProductivityTrends = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        },
        avgProductivity: { $avg: '$productivity' },
        avgMood: { $avg: '$mood' },
        avgEnergy: { $avg: '$energy' },
        totalDuration: { $sum: '$duration' },
        date: { $first: '$date' }
      }
    },
    {
      $sort: { date: 1 }
    }
  ]);
};

const TimeLog = mongoose.model('TimeLog', timeLogSchema);

export default TimeLog;