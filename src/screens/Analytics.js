import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../theme/ThemeContext'; // adjust path
import { sHeight, sWidth } from '../assets/utils';

const formatCurrency = amount => `₹${amount.toFixed(2)}`;

export default function AnalyticsPage() {
  const students = useSelector(state => state.students) || [];
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedClasses, setExpandedClasses] = useState({});

  const [aggregates, setAggregates] = useState({
    totalStudents: 0,
    totalMale: 0,
    totalFemale: 0,
    totalOthers: 0,
    byClass: {},
  });

  const calculateAggregates = () => {
    const byClass = {};
    let totalStudents = 0;
    let totalMale = 0;
    let totalFemale = 0;
    let totalOthers = 0;

    students.forEach(student => {
      const cls = student.class || 'Unknown';
      const gender = (student.gender || 'Unknown').toLowerCase();
      const stream = student.stream || 'None';
      const course =
        student.stream === 'Science' && student.scienceGroup
          ? student.scienceGroup
          : null;

      // Aggregate total counts
      totalStudents++;
      if (gender === 'male') totalMale++;
      else if (gender === 'female') totalFemale++;
      else totalOthers++;

      // Aggregate class-wise
      if (!byClass[cls]) {
        byClass[cls] = {
          count: 0,
          maleCount: 0,
          femaleCount: 0,
          otherGenderCount: 0,
          streams: {},
          courses: {},
        };
      }

      const classData = byClass[cls];
      classData.count++;

      if (gender === 'male') classData.maleCount++;
      else if (gender === 'female') classData.femaleCount++;
      else classData.otherGenderCount++;

      // Detail streams and courses for classes 11 and 12
      if (cls === '11' || cls === '12') {
        if (!classData.streams[stream]) {
          classData.streams[stream] = {
            count: 0,
            maleCount: 0,
            femaleCount: 0,
            otherGenderCount: 0,
            courses: {},
          };
        }
        const streamData = classData.streams[stream];
        streamData.count++;
        if (gender === 'male') streamData.maleCount++;
        else if (gender === 'female') streamData.femaleCount++;
        else streamData.otherGenderCount++;

        if (stream === 'Science' && course) {
          if (!streamData.courses[course]) {
            streamData.courses[course] = {
              count: 0,
              maleCount: 0,
              femaleCount: 0,
              otherGenderCount: 0,
            };
          }
          const courseData = streamData.courses[course];
          courseData.count++;
          if (gender === 'male') courseData.maleCount++;
          else if (gender === 'female') courseData.femaleCount++;
          else courseData.otherGenderCount++;
        }
      }
    });

    setAggregates({
      totalStudents,
      totalMale,
      totalFemale,
      totalOthers,
      byClass,
    });
  };

  useEffect(() => {
    calculateAggregates();
  }, [students]);

  const onRefresh = () => {
    setRefreshing(true);
    // Add your real data refresh here if applicable
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleClassExpand = cls => {
    setExpandedClasses(prev => ({ ...prev, [cls]: !prev[cls] }));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
      contentContainerStyle={{ paddingBottom: sHeight * 0.05 }}
    >
      {/* Overall summary */}
      <Animatable.View
        animation="fadeInDown"
        style={[
          styles.summaryCard,
          { backgroundColor: colors.card, shadowColor: colors.border },
        ]}
      >
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          Total Students: {aggregates.totalStudents}
        </Text>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          Male: {aggregates.totalMale} | Female: {aggregates.totalFemale} |
          Others: {aggregates.totalOthers}
        </Text>
      </Animatable.View>

      {/* Classes list */}
      {Object.keys(aggregates.byClass).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.border }]}>
            No student data available.
          </Text>
        </View>
      ) : (
        Object.entries(aggregates.byClass).map(([cls, classData]) => {
          const isExpanded = !!expandedClasses[cls];
          return (
            <Animatable.View
              key={cls}
              animation="fadeInUp"
              duration={600}
              style={[
                styles.classCard,
                { backgroundColor: colors.card, shadowColor: colors.border },
              ]}
            >
              <TouchableOpacity
                onPress={() => toggleClassExpand(cls)}
                activeOpacity={0.8}
              >
                <Text style={[styles.classTitle, { color: colors.text }]}>
                  Class {cls}
                </Text>
                <Text style={[styles.classSubtitle, { color: colors.text }]}>
                  Total: {classData.count} | Male: {classData.maleCount} |
                  Female: {classData.femaleCount} | Others:{' '}
                  {classData.otherGenderCount}
                </Text>
              </TouchableOpacity>

              {isExpanded && (cls === '11' || cls === '12') && (
                <View style={styles.streamContainer}>
                  {Object.entries(classData.streams).map(
                    ([streamName, streamData]) => (
                      <View key={streamName} style={styles.streamCard}>
                        <Text
                          style={[styles.streamTitle, { color: colors.accent }]}
                        >
                          Stream: {streamName}
                        </Text>
                        <Text
                          style={[styles.classSubtitle, { color: colors.text }]}
                        >
                          Students: {streamData.count} | Male:{' '}
                          {streamData.maleCount} | Female:{' '}
                          {streamData.femaleCount} | Others:{' '}
                          {streamData.otherGenderCount}
                        </Text>

                        {streamName === 'Science' &&
                          Object.keys(streamData.courses).length > 0 && (
                            <View style={styles.coursesContainer}>
                              {Object.entries(streamData.courses).map(
                                ([courseName, courseData]) => (
                                  <View
                                    key={courseName}
                                    style={styles.courseCard}
                                  >
                                    <Text
                                      style={[
                                        styles.courseTitle,
                                        { color: colors.accent },
                                      ]}
                                    >
                                      Course: {courseName}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.classSubtitle,
                                        { color: colors.text },
                                      ]}
                                    >
                                      Students: {courseData.count} | Male:{' '}
                                      {courseData.maleCount} | Female:{' '}
                                      {courseData.femaleCount} | Others:{' '}
                                      {courseData.otherGenderCount}
                                    </Text>
                                  </View>
                                ),
                              )}
                            </View>
                          )}
                      </View>
                    ),
                  )}
                </View>
              )}

              {isExpanded && !(cls === '11' || cls === '12') && (
                <Text style={[styles.expandedNote, { color: colors.text }]}>
                  No stream/course breakdown for this class.
                </Text>
              )}
            </Animatable.View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    borderRadius: sWidth * 0.03,
    padding: sWidth * 0.05,
    margin: sWidth * 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: sWidth * 0.06,
    fontWeight: '700',
  },
  summaryText: {
    fontSize: sWidth * 0.045,
    marginTop: sHeight * 0.003,
  },
  emptyContainer: {
    marginTop: sHeight * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: sWidth * 0.045,
  },
  classCard: {
    borderRadius: sWidth * 0.03,
    padding: sWidth * 0.04,
    marginHorizontal: sWidth * 0.05,
    marginBottom: sHeight * 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  classTitle: {
    fontSize: sWidth * 0.05,
    fontWeight: '700',
    marginBottom: sHeight * 0.005,
  },
  classSubtitle: {
    fontSize: sWidth * 0.038,
    fontWeight: '600',
  },
  streamContainer: {
    marginTop: sHeight * 0.015,
    paddingLeft: sWidth * 0.04,
  },
  streamCard: {
    marginBottom: sHeight * 0.015,
  },
  streamTitle: {
    fontSize: sWidth * 0.045,
    fontWeight: '700',
  },
  coursesContainer: {
    marginTop: sHeight * 0.01,
    paddingLeft: sWidth * 0.04,
  },
  courseCard: {
    marginBottom: sHeight * 0.012,
  },
  courseTitle: {
    fontSize: sWidth * 0.043,
    fontWeight: '600',
  },
  expandedNote: {
    marginTop: sHeight * 0.015,
    fontSize: sWidth * 0.04,
    fontStyle: 'italic',
    paddingLeft: sWidth * 0.04,
  },
});
