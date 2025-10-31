import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, borderRadius } from '../../styles/theme';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const AnalyticsDashboardScreen = () => {
  const { metrics, timeLogs, loading, error } = useAnalytics();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (loading && !metrics) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Calculating Analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No analytics data available yet.</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${hexToRgb(colors.primary)}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${hexToRgb(colors.textSecondary)}, ${opacity})`,
    style: {
      borderRadius: borderRadius.lg,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primaryDark,
    },
  };

  const weeklyCompletionData = {
    labels: metrics.completionRateLast7Days.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [
      {
        data: metrics.completionRateLast7Days.map(d => d.rate),
      },
    ],
  };

  const tasksPerDayData = {
    labels: metrics.tasksCompletedLast7Days.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        data: metrics.tasksCompletedLast7Days.map(d => d.count),
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Analytics Dashboard</Text>

      <View style={styles.grid}>
        <MetricCard title="Tasks Completed (Week)" value={metrics.tasksCompleted.thisWeek} />
        <MetricCard title="Current Streak" value={`${metrics.streaks.current} days`} />
        <MetricCard title="Avg. Daily Completion" value={`${metrics.dailyAvgCompletionRate.toFixed(1)}%`} />
        <MetricCard title="Total Time Logged" value={`${(metrics.timeLogged.total / 3600).toFixed(1)}h`} />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Daily Completion Rate (%) - Last 7 Days</Text>
        <LineChart
          data={weeklyCompletionData}
          width={screenWidth - spacing.lg * 2}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tasks Completed - Last 7 Days</Text>
        <BarChart
          data={tasksPerDayData}
          width={screenWidth - spacing.lg * 2}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Time Logs</Text>
        {timeLogs.slice(0, 5).map(log => (
          <View key={log.id} style={styles.logItem}>
            <Text style={styles.logText}>{log.taskName || 'Unnamed Task'}</Text>
            <Text style={styles.logDuration}>{`${(log.duration / 60).toFixed(0)} min`}</Text>
          </View>
        ))}
        {timeLogs.length === 0 && <Text style={styles.emptyText}>No time logs recorded.</Text>}
      </View>
    </ScrollView>
  );
};

const MetricCard = ({ title, value }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
};

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '0, 0, 0';
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '48%',
    marginBottom: spacing.md,
    ...colors.shadow,
  },
  metricTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  metricValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    ...colors.shadow,
  },
  chartTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  logText: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  logDuration: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});

export default AnalyticsDashboardScreen;
