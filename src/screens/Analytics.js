import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../theme/ThemeContext';
import { sHeight, sWidth } from '../assets/utils';

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
    totalFeesExpected: 0,
    totalFeesCollected: 0,
    byClass: {},
  });

  const calculateAggregates = () => {
    const byClass = {};
    let totalStudents = 0;
    let totalMale = 0;
    let totalFemale = 0;
    let totalOthers = 0;
    let totalFeesExpected = 0;
    let totalFeesCollected = 0;

    students.forEach(student => {
      const cls = student.class || 'Unknown';
      const gender = (student.gender || 'Unknown').toLowerCase();
      const stream = student.stream || 'None';
      const course =
        student.stream === 'Science' && student.scienceGroup
          ? student.scienceGroup
          : null;

      totalStudents++;
      if (gender === 'male') totalMale++;
      else if (gender === 'female') totalFemale++;
      else totalOthers++;

      const feeExpected = parseFloat(student.totalFees) || 0;
      totalFeesExpected += feeExpected;

      let feeCollected = 0;
      if (student.submittedFees && Array.isArray(student.submittedFees)) {
        student.submittedFees.forEach(f => {
          feeCollected += parseFloat(f.amount) || 0;
        });
      }
      totalFeesCollected += feeCollected;

      if (!byClass[cls]) {
        byClass[cls] = {
          count: 0,
          maleCount: 0,
          femaleCount: 0,
          otherGenderCount: 0,
          streams: {},
          courses: {},
          feesExpected: 0,
          feesCollected: 0,
        };
      }

      const classData = byClass[cls];
      classData.count++;
      if (gender === 'male') classData.maleCount++;
      else if (gender === 'female') classData.femaleCount++;
      else classData.otherGenderCount++;

      classData.feesExpected += feeExpected;
      classData.feesCollected += feeCollected;

      // Streams (11 & 12)
      if (cls === '11' || cls === '12') {
        if (!classData.streams[stream]) {
          classData.streams[stream] = {
            count: 0,
            maleCount: 0,
            femaleCount: 0,
            otherGenderCount: 0,
            courses: {},
            feesExpected: 0,
            feesCollected: 0,
          };
        }
        const streamData = classData.streams[stream];
        streamData.count++;
        if (gender === 'male') streamData.maleCount++;
        else if (gender === 'female') streamData.femaleCount++;
        else streamData.otherGenderCount++;

        streamData.feesExpected += feeExpected;
        streamData.feesCollected += feeCollected;

        if (stream === 'Science' && course) {
          if (!streamData.courses[course]) {
            streamData.courses[course] = {
              count: 0,
              maleCount: 0,
              femaleCount: 0,
              otherGenderCount: 0,
              feesExpected: 0,
              feesCollected: 0,
            };
          }
          const courseData = streamData.courses[course];
          courseData.count++;
          if (gender === 'male') courseData.maleCount++;
          else if (gender === 'female') courseData.femaleCount++;
          else courseData.otherGenderCount++;

          courseData.feesExpected += feeExpected;
          courseData.feesCollected += feeCollected;
        }
      }
    });

    setAggregates({
      totalStudents,
      totalMale,
      totalFemale,
      totalOthers,
      totalFeesExpected,
      totalFeesCollected,
      byClass,
    });
  };

  useEffect(() => {
    calculateAggregates();
  }, [students]);

  const onRefresh = () => {
    setRefreshing(true);
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
      {/* Summary */}
      <Animatable.View
        animation="fadeInDown"
        style={[
          styles.summaryCard,
          { backgroundColor: colors.card, shadowColor: colors.border },
        ]}
      >
        <Text style={[styles.summaryTitle, { color: colors.accent }]}>
          Analytics Overview
        </Text>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          Total Students: {aggregates.totalStudents}
        </Text>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          Male: {aggregates.totalMale} | Female: {aggregates.totalFemale} |
          Others: {aggregates.totalOthers}
        </Text>
        <View style={{ marginTop: sHeight * 0.012 }}>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            Fees Expected: ₹{aggregates.totalFeesExpected.toFixed(2)}
          </Text>
          <Text style={[styles.summaryText, { color: colors.accent }]}>
            Collected: ₹{aggregates.totalFeesCollected.toFixed(2)}
          </Text>
          <Text style={[styles.summaryText, { color: colors.error }]}>
            Remaining: ₹
            {(
              aggregates.totalFeesExpected - aggregates.totalFeesCollected
            ).toFixed(2)}
          </Text>
        </View>
      </Animatable.View>

      {/* By Class */}
      {Object.keys(aggregates.byClass).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.placeholder }]}>
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
                <Text style={[styles.classTitle, { color: colors.accent }]}>
                  Class {cls}
                </Text>
                <Text style={[styles.classSubtitle, { color: colors.text }]}>
                  Total: {classData.count} | Male: {classData.maleCount} |
                  Female: {classData.femaleCount} | Others:{' '}
                  {classData.otherGenderCount}
                </Text>
                <Text style={[styles.classSubtitle, { color: colors.text }]}>
                  Fees Expected: ₹{classData.feesExpected.toFixed(2)}
                </Text>
                <Text style={[styles.classSubtitle, { color: colors.accent }]}>
                  Collected: ₹{classData.feesCollected.toFixed(2)}
                </Text>
                <Text style={[styles.classSubtitle, { color: colors.error }]}>
                  Remaining: ₹
                  {(classData.feesExpected - classData.feesCollected).toFixed(
                    2,
                  )}
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
                          Students: {streamData.count}
                        </Text>
                        <Text
                          style={[styles.classSubtitle, { color: colors.text }]}
                        >
                          Fees Expected: ₹{streamData.feesExpected.toFixed(2)}
                        </Text>
                        <Text
                          style={[
                            styles.classSubtitle,
                            { color: colors.accent },
                          ]}
                        >
                          Collected: ₹{streamData.feesCollected.toFixed(2)}
                        </Text>
                        <Text
                          style={[
                            styles.classSubtitle,
                            { color: colors.error },
                          ]}
                        >
                          Remaining: ₹
                          {(
                            streamData.feesExpected - streamData.feesCollected
                          ).toFixed(2)}
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
                                      Students: {courseData.count}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.classSubtitle,
                                        { color: colors.text },
                                      ]}
                                    >
                                      Fees Expected: ₹
                                      {courseData.feesExpected.toFixed(2)}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.classSubtitle,
                                        { color: colors.accent },
                                      ]}
                                    >
                                      Collected: ₹
                                      {courseData.feesCollected.toFixed(2)}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.classSubtitle,
                                        { color: colors.error },
                                      ]}
                                    >
                                      Remaining: ₹
                                      {(
                                        courseData.feesExpected -
                                        courseData.feesCollected
                                      ).toFixed(2)}
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
            </Animatable.View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryCard: {
    borderRadius: sWidth * 0.04,
    padding: sWidth * 0.06,
    margin: sWidth * 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: sWidth * 0.06,
    fontWeight: '700',
    marginBottom: sHeight * 0.01,
  },
  summaryText: {
    fontSize: sWidth * 0.042,
    marginTop: sHeight * 0.004,
    fontWeight: '500',
  },
  emptyContainer: {
    marginTop: sHeight * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { fontSize: sWidth * 0.045 },
  classCard: {
    borderRadius: sWidth * 0.04,
    padding: sWidth * 0.05,
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
    marginBottom: sHeight * 0.006,
  },
  classSubtitle: {
    fontSize: sWidth * 0.04,
    marginTop: sHeight * 0.003,
  },
  streamContainer: {
    marginTop: sHeight * 0.015,
    paddingLeft: sWidth * 0.04,
  },
  streamCard: { marginBottom: sHeight * 0.015 },
  streamTitle: { fontSize: sWidth * 0.043, fontWeight: '600' },
  coursesContainer: {
    marginTop: sHeight * 0.01,
    paddingLeft: sWidth * 0.05,
  },
  courseCard: { marginBottom: sHeight * 0.012 },
  courseTitle: { fontSize: sWidth * 0.042, fontWeight: '500' },
});
