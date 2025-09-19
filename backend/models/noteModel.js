import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [100, 'Note title cannot exceed 100 characters']
  },
  content: {
    type: String,
    default: '',
    trim: true
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: false,
    index: true
  },
  order: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
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

// Create text indexes for search functionality
noteSchema.index({ title: 'text', content: 'text' });

// Create compound indexes for efficient queries
noteSchema.index({ userId: 1, folderId: 1, order: 1 });
noteSchema.index({ userId: 1, isPinned: 1, updatedAt: -1 });

// Pre-save middleware to update the updatedAt field
noteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for folder information
noteSchema.virtual('folder', {
  ref: 'Folder',
  localField: 'folderId',
  foreignField: '_id',
  justOne: true
});

// Instance method to move note to different folder
noteSchema.methods.moveToFolder = async function(newFolderId) {
  this.folderId = newFolderId;
  await this.save();
  return this;
};

const Note = mongoose.model('Note', noteSchema);

export default Note;