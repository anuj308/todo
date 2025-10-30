import DailyDiary from '../models/dailyDiaryModel.js';

const normalizeToUTCStartOfDay = (input) => {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export const getDailyDiaryEntry = async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required (YYYY-MM-DD).' });
    }

    const normalizedDate = normalizeToUTCStartOfDay(date);
    if (!normalizedDate) {
      return res.status(400).json({ message: 'Invalid date provided.' });
    }

    const entry = await DailyDiary.findOne({ userId, date: normalizedDate });

    if (!entry) {
      return res.status(200).json({
        id: null,
        userId,
        date: normalizedDate.toISOString(),
        content: ''
      });
    }

    return res.status(200).json(entry);
  } catch (error) {
    console.error('Error fetching diary entry:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const upsertDailyDiaryEntry = async (req, res) => {
  try {
    const { date, content = '' } = req.body;
    const userId = req.user.id;

    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }

    const normalizedDate = normalizeToUTCStartOfDay(date);
    if (!normalizedDate) {
      return res.status(400).json({ message: 'Invalid date provided.' });
    }

    const updatedEntry = await DailyDiary.findOneAndUpdate(
      { userId, date: normalizedDate },
      {
        userId,
        date: normalizedDate,
        content: content.trim()
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json(updatedEntry);
  } catch (error) {
    console.error('Error saving diary entry:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
