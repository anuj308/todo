import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true
  },
  content: {
    type: String,
    default: '',
    trim: true
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
    required: true
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

const Note = mongoose.model('Note', noteSchema);

export default Note;