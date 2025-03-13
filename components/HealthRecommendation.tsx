// HealthRecommendation.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getSafetyStatus } from '../utils/airQualityUtils';

interface HealthRecommendationProps {
  pmValue: number;
}

const HealthRecommendation: React.FC<HealthRecommendationProps> = ({ pmValue }) => {
  const statusInfo = getSafetyStatus(pmValue);
  const recommendation = getRecommendation(pmValue);
  
  return (
    <View style={styles.recommendationContainer}>
      <Text style={styles.sectionTitle}>คำแนะนำด้านสุขภาพ</Text>
      <View style={styles.recommendationContent}>
        <Text style={styles.recommendationEmoji}>☺</Text>
        <Text style={styles.recommendationText}>{recommendation}</Text>
      </View>
    </View>
  );
};

// ฟังก์ชันส่งคำแนะนำตามค่า PM
const getRecommendation = (value: number): string => {
  if (value <= 25) {
    return "ทุกคนสามารถทำกิจกรรมต่างๆ ได้ตามปกติ";
  } else if (value <= 100) {
    return "ควรหลีกเลี่ยงกิจกรรมกลางแจ้งหากรู้สึกไม่สบาย";
  } else {
    return "ควรหลีกเลี่ยงกิจกรรมกลางแจ้งทุกชนิด";
  }
};

const styles = StyleSheet.create({
  recommendationContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 8,
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationEmoji: {
    fontSize: 36,
    marginRight: 16,
    color: 'white',
  },
  recommendationText: {
    fontSize: 18,
    color: 'white',
    flex: 1,
  },
});

export default HealthRecommendation;