import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import * as Animatable from 'react-native-animatable';

const { width: sWidth, height: sHeight } = Dimensions.get('window');

export default function FacultyDetails({ route }) {
  const { colors } = useTheme();
  const { teacher } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animatable.View
          animation={{
            0: { opacity: 0, translateY: -50 },
            1: { opacity: 1, translateY: 0 },
          }}
          duration={1000}
          style={styles.headerContainer}
        >
          <Text style={[styles.headerText, { color: colors.accent }]}>
            {teacher.name}
          </Text>
          <View
            style={[
              styles.waveDivider,
              { backgroundColor: colors.accent + '44' },
            ]}
          />
        </Animatable.View>

        <Animatable.View
          animation="bounceIn"
          duration={1200}
          style={styles.avatarContainer}
        >
          <View
            style={[
              styles.avatarOverlay,
              { backgroundColor: colors.accent + '11' },
            ]}
          />
          {teacher.avatar ? (
            <View
              style={[
                styles.avatarWrapper,
                { borderColor: colors.accent + '55' },
              ]}
            >
              <Image
                source={{ uri: teacher.avatar }}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: colors.accent },
              ]}
            >
              <Text style={styles.avatarInitial}>{teacher.name[0]}</Text>
            </View>
          )}
          {/* <Animatable.Text
            animation="fadeIn"
            duration={1000}
            delay={200}
            style={[
              styles.roleBadge,
              { backgroundColor: colors.accent + '33', color: colors.accent },
            ]}
          >
            {teacher.role || 'Professor'}
          </Animatable.Text> */}
        </Animatable.View>

        <Animatable.View
          animation={{
            0: { opacity: 0, translateY: 50, rotate: '-1deg' },
            1: { opacity: 1, translateY: 0, rotate: '0deg' },
          }}
          duration={1000}
          style={[
            styles.card,
            {
              backgroundColor: colors.card + 'CC',
              shadowColor: colors.shadow,
              borderColor: colors.accent + '33',
            },
          ]}
        >
          {[
            ['Department', teacher.department],
            ['Subject', teacher.subject],
            ['Email', teacher.email],
            ['Phone', teacher.phone],
            ['Qualification', teacher.qualification],
          ].map(([label, value], index) =>
            value ? (
              <Animatable.View
                key={label}
                animation="fadeInUp"
                duration={1000}
                delay={300 * index}
                style={[
                  styles.infoRow,
                  {
                    borderBottomColor: colors.text,
                  },
                ]}
              >
                <Text style={[styles.label, { color: colors.placeholder }]}>
                  {label}:
                </Text>
                <Text style={[styles.info, { color: colors.text }]}>
                  {value}
                </Text>
              </Animatable.View>
            ) : null,
          )}
        </Animatable.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: sWidth * 0.04,
    alignItems: 'center',
    // paddingTop: sHeight * 0.06,
    paddingBottom: sHeight * 0.05,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: sWidth * 0.04,
  },
  headerText: {
    fontSize: sWidth * 0.05,
    fontWeight: '600',
    letterSpacing: 1.5,
    textAlign: 'center',
    // textShadowColor: 'rgba(0, 0, 0, 0.2)',
    // textShadowOffset: { width: 1, height: 1 },
    // textShadowRadius: 6,
  },
  waveDivider: {
    // width: sWidth * 0.4,
    // height: 3,
    // marginTop: sHeight * 0.015,
    // borderRadius: 3,
    // opacity: 0.7,
  },
  avatarContainer: {
    marginBottom: sHeight * 0.05,
    alignItems: 'center',
    position: 'relative',
  },
  avatarOverlay: {
    position: 'absolute',
    width: sWidth * 0.75,
    height: sWidth * 0.75,
    borderRadius: sWidth * 0.375,
    opacity: 0.2,
  },
  avatarWrapper: {
    borderRadius: sWidth * 0.4,
    borderWidth: 2,
    padding: 5,
    // backgroundColor: 'rgba(255,255,255,0.2)',
    // shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
  },
  avatar: {
    width: sWidth * 0.65,
    height: sWidth * 0.65,
    borderRadius: sWidth * 0.325,
  },
  avatarPlaceholder: {
    width: sWidth * 0.65,
    height: sWidth * 0.65,
    borderRadius: sWidth * 0.325,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
  },
  avatarInitial: {
    fontSize: sWidth * 0.28,
    color: '#fff',
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -sHeight * 0.02,
    fontSize: sWidth * 0.035,
    fontWeight: '600',
    paddingVertical: sHeight * 0.01,
    paddingHorizontal: sWidth * 0.04,
    borderRadius: 12,
    overflow: 'hidden',
    opacity: 0.9,
  },
  card: {
    width: '100%',
    borderRadius: 22,
    paddingHorizontal: sWidth * 0.07,
    borderWidth: 2,
    
    shadowOpacity: 0.5,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    // elevation: 12,
    // backgroundColor: 'rgba(255,255,255,0.8)', // Subtle translucency
  },
  infoRow: {
    flexDirection: 'row',
    // marginBottom: sHeight * 0.018,
    paddingVertical: sHeight * 0.012,
    // borderBottomWidth: 0.5,
    // borderBottomColor: colors.text,
  },
  label: {
    flex: 4,
    fontSize: sWidth * 0.042,
    fontWeight: '600',
  },
  info: {
    flex: 5,
    fontSize: sWidth * 0.044,
    fontWeight: '400',
    // lineHeight: sWidth * 0.062,
  },
});
