import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getSafetyStatus, getPMIndicatorColor } from '../utils/airQualityUtils';

interface ParticleSectionProps {
  pm2_5: number;
}

const ParticleSection: React.FC<ParticleSectionProps> = ({ pm2_5 }) => {
  const pm2_5Status = getSafetyStatus(pm2_5);
  
  return (
    <View style={styles.particleSectionContainer}>
      <Text style={styles.sectionTitle}>ฝุ่นละอองในอากาศ</Text>
      
      {/* PM2.5 Card */}
      <View style={styles.pmDetailCard}>
        <View style={[styles.pmIndicator, { backgroundColor: getPMIndicatorColor(pm2_5) }]} />
        <View style={styles.pmDetailContent}>
          <Text style={styles.pmDetailLabel}>PM 2.5</Text>
          <Text style={[styles.pmDetailValue, { color: pm2_5Status.color }]}>{pm2_5.toFixed(0)}</Text>
          <Text style={styles.pmDetailUnit}>μg/m³</Text>
        </View>
        <View style={styles.pmDetailStatus}>
          <Text style={[styles.pmDetailEmoji, { color: pm2_5Status.color }]}>{pm2_5Status.emoji}</Text>
          <Text style={[styles.pmDetailStatusText, { color: pm2_5Status.color }]}>{pm2_5Status.status}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  particleSectionContainer: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 8,
  },
  pmDetailCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
  },
  pmIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  pmDetailContent: {
    paddingLeft: 12,
    flex: 1,
  },
  pmDetailLabel: {
    color: 'white',
    fontSize: 16,
  },
  pmDetailValue: {
    fontSize: 42,
  },
  pmDetailUnit: {
    color: '#888888',
    fontSize: 12,
  },
  pmDetailStatus: {
    alignItems: 'center',
  },
  pmDetailEmoji: {
    fontSize: 30,
  },
  pmDetailStatusText: {
    fontSize: 14,
  },
});

export default ParticleSection;