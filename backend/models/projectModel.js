import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'on-hold'],
      default: 'not-started',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    goalDate: {
      type: Date,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    completedDate: {
      type: Date,
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ userId: 1, createdAt: -1 });

// Virtual for related todos (will be populated from Todo model)
projectSchema.virtual('todos', {
  ref: 'CalendarTodo',
  localField: '_id',
  foreignField: 'projectId',
});

// Transform output
projectSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
