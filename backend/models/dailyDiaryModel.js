import mongoose from 'mongoose';

const normalizeToUTCStartOfDay = (date) => {
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
};

const dailyDiarySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true,
    get: (value) => value,
    set: normalizeToUTCStartOfDay
  },
  content: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function transform(doc, ret) {
      ret.id = ret._id.toString();
      ret.date = ret.date ? ret.date.toISOString() : null;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Unique diary entry per user per day
dailyDiarySchema.index({ userId: 1, date: 1 }, { unique: true });

dailyDiarySchema.pre('validate', function preValidate(next) {
  if (this.date) {
    this.date = normalizeToUTCStartOfDay(this.date);
  }
  next();
});

const DailyDiary = mongoose.model('DailyDiary', dailyDiarySchema);

export default DailyDiary;
