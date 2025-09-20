import ProductivityMetrics from '../models/productivityMetricsModel.js';
import CalendarTodo from '../models/calendarTodoModel.js';
import TimeLog from '../models/timeLogModel.js';

// @desc    Get productivity metrics for a specific date
// @route   GET /api/productivity-metrics?date=YYYY-MM-DD
// @access  Private
export const getProductivityMetrics = async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    if (!date) {
      return res.status(400).json({ 
        message: 'Date parameter is required (YYYY-MM-DD format)' 
      });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    let metrics = await ProductivityMetrics.findOne({ 
      userId, 
      date: targetDate 
    });

    // If no metrics exist, create them
    if (!metrics) {
      metrics = await ProductivityMetrics.updateDailyMetrics(userId, targetDate);
    }

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching productivity metrics:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update daily metrics
// @route   POST /api/productivity-metrics/update-daily
// @access  Private
export const updateDailyMetrics = async (req, res) => {
  try {
    const { date } = req.body;
    const userId = req.user.id;

    if (!date) {
      return res.status(400).json({ 
        message: 'Date is required' 
      });
    }

    const metrics = await ProductivityMetrics.updateDailyMetrics(userId, new Date(date));

    res.status(200).json({
      message: 'Daily metrics updated successfully',
      metrics
    });
  } catch (error) {
    console.error('Error updating daily metrics:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get productivity trends for date range
// @route   GET /api/productivity-metrics/trends?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private
export const getProductivityTrends = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Start date and end date are required' 
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const trends = await ProductivityMetrics.find({
      userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    // Calculate trend statistics
    const stats = calculateTrendStats(trends);

    res.status(200).json({
      trends,
      stats,
      dateRange: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error fetching productivity trends:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get weekly metrics aggregation
// @route   GET /api/productivity-metrics/weekly?date=YYYY-MM-DD
// @access  Private
export const getWeeklyMetrics = async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    if (!date) {
      return res.status(400).json({ 
        message: 'Date parameter is required' 
      });
    }

    const targetDate = new Date(date);
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyData = await ProductivityMetrics.getAggregateMetrics(userId, startOfWeek, endOfWeek);
    const dailyMetrics = await ProductivityMetrics.find({
      userId,
      date: { $gte: startOfWeek, $lte: endOfWeek }
    }).sort({ date: 1 });

    res.status(200).json({
      weekRange: {
        start: startOfWeek.toISOString().split('T')[0],
        end: endOfWeek.toISOString().split('T')[0]
      },
      aggregateMetrics: weeklyData[0] || {},
      dailyBreakdown: dailyMetrics
    });
  } catch (error) {
    console.error('Error fetching weekly metrics:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get monthly metrics aggregation
// @route   GET /api/productivity-metrics/monthly?date=YYYY-MM-DD
// @access  Private
export const getMonthlyMetrics = async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    if (!date) {
      return res.status(400).json({ 
        message: 'Date parameter is required' 
      });
    }

    const targetDate = new Date(date);
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const monthlyData = await ProductivityMetrics.getAggregateMetrics(userId, startOfMonth, endOfMonth);
    const dailyMetrics = await ProductivityMetrics.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: 1 });

    // Group daily metrics by week
    const weeklyBreakdown = groupByWeek(dailyMetrics, startOfMonth);

    res.status(200).json({
      monthRange: {
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0]
      },
      aggregateMetrics: monthlyData[0] || {},
      dailyBreakdown: dailyMetrics,
      weeklyBreakdown
    });
  } catch (error) {
    console.error('Error fetching monthly metrics:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Set daily goal
// @route   PUT /api/productivity-metrics/goal
// @access  Private
export const setDailyGoal = async (req, res) => {
  try {
    const { date, dailyGoal } = req.body;
    const userId = req.user.id;

    if (!date || dailyGoal === undefined) {
      return res.status(400).json({ 
        message: 'Date and daily goal are required' 
      });
    }

    if (dailyGoal < 0 || dailyGoal > 24) {
      return res.status(400).json({ 
        message: 'Daily goal must be between 0 and 24 hours' 
      });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const metrics = await ProductivityMetrics.findOneAndUpdate(
      { userId, date: targetDate },
      { dailyGoal },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Daily goal updated successfully',
      metrics
    });
  } catch (error) {
    console.error('Error setting daily goal:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Helper function to calculate trend statistics
const calculateTrendStats = (trends) => {
  if (trends.length === 0) {
    return {
      averageProductivityScore: 0,
      averageTodoCompletion: 0,
      averageMood: 0,
      averageEnergy: 0,
      totalProductiveHours: 0,
      streak: 0,
      trend: 'stable'
    };
  }

  const totals = trends.reduce((acc, day) => {
    acc.productivityScore += day.productivityScore || 0;
    acc.todoCompletion += day.todoCompletionRate || 0;
    acc.mood += day.avgMood || 0;
    acc.energy += day.avgEnergy || 0;
    acc.productiveTime += day.productiveTime || 0;
    return acc;
  }, {
    productivityScore: 0,
    todoCompletion: 0,
    mood: 0,
    energy: 0,
    productiveTime: 0
  });

  const count = trends.length;
  const averages = {
    averageProductivityScore: Math.round(totals.productivityScore / count),
    averageTodoCompletion: Math.round(totals.todoCompletion / count),
    averageMood: Math.round((totals.mood / count) * 10) / 10,
    averageEnergy: Math.round((totals.energy / count) * 10) / 10,
    totalProductiveHours: Math.round((totals.productiveTime / 60) * 10) / 10
  };

  // Calculate current streak of goal achievements
  let streak = 0;
  for (let i = trends.length - 1; i >= 0; i--) {
    if (trends[i].goalAchieved) {
      streak++;
    } else {
      break;
    }
  }

  // Determine trend direction (comparing first half to second half)
  let trend = 'stable';
  if (trends.length >= 4) {
    const midPoint = Math.floor(trends.length / 2);
    const firstHalf = trends.slice(0, midPoint);
    const secondHalf = trends.slice(midPoint);
    
    const firstAvg = firstHalf.reduce((sum, day) => sum + (day.productivityScore || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, day) => sum + (day.productivityScore || 0), 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    if (difference > 5) trend = 'improving';
    else if (difference < -5) trend = 'declining';
  }

  return {
    ...averages,
    streak,
    trend
  };
};

// Helper function to group daily metrics by week
const groupByWeek = (dailyMetrics, startOfMonth) => {
  const weeks = [];
  let currentWeek = [];
  let weekStart = new Date(startOfMonth);
  
  // Find the first Sunday of the month or before
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  
  dailyMetrics.forEach(day => {
    const dayDate = new Date(day.date);
    const daysSinceWeekStart = Math.floor((dayDate - weekStart) / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(daysSinceWeekStart / 7);
    
    if (!weeks[weekIndex]) {
      weeks[weekIndex] = [];
    }
    
    weeks[weekIndex].push(day);
  });
  
  return weeks.filter(week => week && week.length > 0);
};