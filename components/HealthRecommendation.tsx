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
      <Text style={styles.recommendationEmoji}>{statusInfo.emoji}</Text>
        <Text style={styles.recommendationText}>{recommendation}</Text>
      </View>
    </View>
  );
};

// ฟังก์ชันส่งคำแนะนำตามค่า PM
const getRecommendation = (value: number): string => {
  if (value <= 15) {
    return "อากาศดีมาก ทุกคนสามารถทำกิจกรรมต่างๆ ได้ตามปกติ";
  } else if (value <= 25) {
    return "อากาศดี สามารถทำกิจกรรมกลางแจ้งได้";
  } else if (value <= 37) {
    return "เริ่มมีผลกระทบกับกลุ่มเสี่ยง เช่น ผู้ป่วยโรคทางเดินหายใจ ควรลดกิจกรรมกลางแจ้งหากมีอาการผิดปกติ";
  } else if (value <= 50) {
    return "กลุ่มเสี่ยง (เด็ก, ผู้สูงอายุ, ผู้ป่วยโรคปอด) ควรหลีกเลี่ยงกิจกรรมกลางแจ้ง";
  } else if (value <= 90) {
    return "ควรลดกิจกรรมกลางแจ้ง และสวมหน้ากาก N95 หากจำเป็นต้องออกนอกอาคาร";
  } else {
    return "อันตราย ควรอยู่ภายในอาคารที่มีการกรองอากาศ และหลีกเลี่ยงกิจกรรมกลางแจ้งทุกชนิด";
  }
};


const styles = StyleSheet.create({
  recommendationContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: 'Black',
    marginBottom: 8,
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationEmoji: {
    fontSize: 36,
    marginRight: 16,
    color: 'Black',
  },
  recommendationText: {
    fontSize: 18,
    color: 'Black',
    flex: 1,
  },
});

export default HealthRecommendation;