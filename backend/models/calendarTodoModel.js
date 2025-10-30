import mongoose from 'mongoose';

const calendarTodoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Todo title is required'],
    trim: true,
    maxlength: [200, 'Todo title cannot exceed 200 characters']
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    index: true
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['today', 'week', 'month', 'year', 'someday'],
    default: 'today',
    index: true
  },
  timeCategory: {
    type: String,
    enum: ['work', 'study', 'personal', 'health', 'social', 'hobby', 'shopping', 'chores', 'other'],
    default: 'personal'
  },
  estimatedHours: {
    type: Number,
    default: 1,
    min: 0.25,
    max: 24
  },
  actualHours: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: function() { return this.isRecurring; }
  },
  recurringEndDate: {
    type: Date,
    required: function() { return this.isRecurring; }
  },
  parentTodoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CalendarTodo',
    default: null
  },
  subtasks: [{
    title: String,
    isCompleted: { type: Boolean, default: false },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 }
  }],
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
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

// Create indexes for efficient queries
calendarTodoSchema.index({ userId: 1, dueDate: 1, category: 1 });
calendarTodoSchema.index({ userId: 1, isCompleted: 1, dueDate: 1 });
calendarTodoSchema.index({ userId: 1, timeCategory: 1, dueDate: 1 });

// Pre-save middleware to auto-update completion status and timestamps
calendarTodoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-complete if percentage is 100%
  if (this.completionPercentage >= 100 && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
  } else if (this.completionPercentage < 100 && this.isCompleted) {
    this.isCompleted = false;
    this.completedAt = null;
  }
  
  next();
});

// Virtual for days until due
calendarTodoSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const today = new Date();
  const diffTime = this.dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
calendarTodoSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.isCompleted) return false;
  return new Date() > this.dueDate;
});

// Instance method to update completion percentage
calendarTodoSchema.methods.updateProgress = async function(percentage) {
  this.completionPercentage = Math.max(0, Math.min(100, percentage));
  await this.save();
  return this;
};

// Static method to get todos by date range
calendarTodoSchema.statics.getTodosByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    dueDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ dueDate: 1, priority: -1 });
};

const CalendarTodo = mongoose.model('CalendarTodo', calendarTodoSchema);

export default CalendarTodo;