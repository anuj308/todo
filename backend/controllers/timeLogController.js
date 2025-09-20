import TimeLog from '../models/timeLogModel.js';

// @desc    Get time logs for a specific date
// @route   GET /api/time-logs?date=YYYY-MM-DD
// @access  Private
export const getTimeLogs = async (req, res) => {
  try {
    const { date, category } = req.query;
    const userId = req.user.id;

    console.log('Getting time logs - date:', date, 'category:', category, 'userId:', userId);

    if (!date) {
      return res.status(400).json({ 
        message: 'Date parameter is required (YYYY-MM-DD format)' 
      });
    }

    // Create date range for the entire day
    // Parse the date string and create start/end of day in UTC
    const inputDate = new Date(date + 'T00:00:00.000Z'); // Force UTC interpretation
    const startOfDay = new Date(inputDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(inputDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log('Input date string:', date);
    console.log('Parsed input date (UTC):', inputDate);
    console.log('Date range for time logs query:', startOfDay, 'to', endOfDay);

    // Build query
    let query = {
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    };

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    console.log('Time logs query:', query);

    const timeLogs = await TimeLog.find(query)
      .populate('linkedTodoId', 'title category')
      .sort({ startTime: 1 });

    console.log('Found time logs:', timeLogs.length, 'logs');
    console.log('Time logs data:', timeLogs.map(t => ({ 
      id: t._id, 
      activity: t.activity, 
      startTime: t.startTime, 
      endTime: t.endTime,
      date: t.date 
    })));

    res.status(200).json(timeLogs);
  } catch (error) {
    console.error('Error fetching time logs:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Create new time log
// @route   POST /api/time-logs
// @access  Private
export const createTimeLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const logData = {
      ...req.body,
      userId
    };

    console.log('Creating time log - received data:', logData);
    console.log('Start time type:', typeof logData.startTime, logData.startTime);
    console.log('End time type:', typeof logData.endTime, logData.endTime);
    console.log('Duration from frontend:', logData.duration);

    // Validate required fields
    if (!logData.date || !logData.startTime || !logData.endTime || !logData.category || !logData.activity) {
      return res.status(400).json({ 
        message: 'Date, start time, end time, category, and activity are required' 
      });
    }

    // Validate time range
    const startTime = new Date(logData.startTime);
    const endTime = new Date(logData.endTime);
    
    console.log('Parsed start time:', startTime);
    console.log('Parsed end time:', endTime);
    console.log('Time difference (ms):', endTime - startTime);
    
    if (endTime <= startTime) {
      return res.status(400).json({ 
        message: 'End time must be after start time' 
      });
    }

    // Check for overlapping time logs
    const overlapping = await TimeLog.findOne({
      userId,
      date: new Date(logData.date),
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ 
        message: 'Time log overlaps with existing entry' 
      });
    }

    const timeLog = await TimeLog.create(logData);
    
    // Populate linked todo if exists
    await timeLog.populate('linkedTodoId', 'title category');

    res.status(201).json(timeLog);
  } catch (error) {
    console.error('Error creating time log:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update time log
// @route   PUT /api/time-logs/:id
// @access  Private
export const updateTimeLog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const timeLog = await TimeLog.findOne({ _id: id, userId });

    if (!timeLog) {
      return res.status(404).json({ 
        message: 'Time log not found' 
      });
    }

    // Validate time range if being updated
    if (updates.startTime || updates.endTime) {
      const startTime = new Date(updates.startTime || timeLog.startTime);
      const endTime = new Date(updates.endTime || timeLog.endTime);
      
      if (endTime <= startTime) {
        return res.status(400).json({ 
          message: 'End time must be after start time' 
        });
      }

      // Check for overlapping time logs (excluding current one)
      const overlapping = await TimeLog.findOne({
        userId,
        _id: { $ne: id },
        date: new Date(updates.date || timeLog.date),
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ]
      });

      if (overlapping) {
        return res.status(400).json({ 
          message: 'Time log overlaps with existing entry' 
        });
      }
    }

    Object.assign(timeLog, updates);
    await timeLog.save();
    
    await timeLog.populate('linkedTodoId', 'title category');

    res.status(200).json(timeLog);
  } catch (error) {
    console.error('Error updating time log:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Delete time log
// @route   DELETE /api/time-logs/:id
// @access  Private
export const deleteTimeLog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const timeLog = await TimeLog.findOne({ _id: id, userId });

    if (!timeLog) {
      return res.status(404).json({ 
        message: 'Time log not found' 
      });
    }

    await TimeLog.deleteOne({ _id: id, userId });

    res.status(200).json({ 
      message: 'Time log deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting time log:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get daily summary of time logs
// @route   GET /api/time-logs/summary/daily?date=YYYY-MM-DD
// @access  Private
export const getDailySummary = async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    if (!date) {
      return res.status(400).json({ 
        message: 'Date parameter is required (YYYY-MM-DD format)' 
      });
    }

    const summary = await TimeLog.getDailySummary(userId, new Date(date));

    // Calculate total time and add percentages
    const totalDuration = summary.reduce((sum, item) => sum + item.totalDuration, 0);
    
    const summaryWithPercentages = summary.map(item => ({
      ...item,
      percentage: totalDuration > 0 ? Math.round((item.totalDuration / totalDuration) * 100) : 0,
      durationHours: Math.round((item.totalDuration / 60) * 100) / 100
    }));

    res.status(200).json({
      date,
      totalDuration,
      totalHours: Math.round((totalDuration / 60) * 100) / 100,
      categories: summaryWithPercentages
    });
  } catch (error) {
    console.error('Error getting daily summary:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get weekly summary of time logs
// @route   GET /api/time-logs/summary/weekly?startDate=YYYY-MM-DD
// @access  Private
export const getWeeklySummary = async (req, res) => {
  try {
    const { startDate } = req.query;
    const userId = req.user.id;

    if (!startDate) {
      return res.status(400).json({ 
        message: 'Start date parameter is required (YYYY-MM-DD format)' 
      });
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const timeLogs = await TimeLog.find({
      userId,
      date: { $gte: start, $lte: end }
    });

    // Group by date and category
    const dailyBreakdown = {};
    const categoryTotals = {};

    timeLogs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0];
      
      if (!dailyBreakdown[dateKey]) {
        dailyBreakdown[dateKey] = {};
      }
      
      if (!dailyBreakdown[dateKey][log.category]) {
        dailyBreakdown[dateKey][log.category] = 0;
      }
      
      if (!categoryTotals[log.category]) {
        categoryTotals[log.category] = 0;
      }
      
      dailyBreakdown[dateKey][log.category] += log.duration;
      categoryTotals[log.category] += log.duration;
    });

    const totalDuration = Object.values(categoryTotals).reduce((sum, duration) => sum + duration, 0);

    res.status(200).json({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      totalDuration,
      totalHours: Math.round((totalDuration / 60) * 100) / 100,
      dailyBreakdown,
      categoryTotals,
      weeklyAverage: Math.round((totalDuration / 7) * 100) / 100
    });
  } catch (error) {
    console.error('Error getting weekly summary:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};