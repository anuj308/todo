import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Folder name is required'],
    trim: true,
    maxlength: [50, 'Folder name cannot exceed 50 characters']
  },
  color: {
    type: String,
    default: '#3b82f6', // Default blue color
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  icon: {
    type: String,
    default: '📁',
    maxlength: [10, 'Icon cannot exceed 10 characters']
  },
  order: {
    type: Number,
    default: 0
  },
  isDefault: {
    type: Boolean,
    default: false
  },
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

// Add virtual for notes count
folderSchema.virtual('notesCount', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'folderId',
  count: true
});

// Create compound index for user and order
folderSchema.index({ userId: 1, order: 1 });

// Pre-save middleware to update the updatedAt field
folderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to create default folder for new users
folderSchema.statics.createDefaultFolder = async function(userId) {
  const defaultFolder = await this.create({
    name: 'My Notes',
    color: '#3b82f6',
    icon: '📝',
    order: 0,
    isDefault: true,
    userId: userId
  });
  return defaultFolder;
};

// Instance method to reorder folders
folderSchema.methods.reorder = async function(newOrder) {
  const Folder = this.constructor;
  
  // Update all folders with order >= newOrder to increment by 1
  await Folder.updateMany(
    { 
      userId: this.userId, 
      order: { $gte: newOrder },
      _id: { $ne: this._id }
    },
    { $inc: { order: 1 } }
  );
  
  // Update this folder's order
  this.order = newOrder;
  await this.save();
};

const Folder = mongoose.model('Folder', folderSchema);

export default Folder;