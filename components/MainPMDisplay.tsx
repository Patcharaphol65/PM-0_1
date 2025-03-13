// MainPMDisplay.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getSafetyStatus } from '../utils/airQualityUtils';

interface MainPMDisplayProps {
  pm: number;
}

const MainPMDisplay: React.FC<MainPMDisplayProps> = ({ pm }) => {
  const statusInfo = getSafetyStatus(pm);
  
  // Format PM value to show 2 decimal places with leading zeros if needed
  const formattedPm = pm.toFixed(2).padStart(5, '0');
  
  return (
    <View style={styles.mainPmContainer}>
      <Text style={styles.pmLabel}>PM 0.1</Text>
      <View style={styles.pmValueContainer}>
        <Text style={[styles.pmValue, { color: statusInfo.color }]}>{formattedPm}</Text>
        <Text style={styles.pmUnit}>μg/m³</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
          <Text style={[styles.statusText, { color: statusInfo.textColor }]}>{statusInfo.status}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainPmContainer: {
    marginBottom: 24,
  },
  pmLabel: {
    fontSize: 18,
    color: 'white',
    marginBottom: 4,
  },
  pmValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pmValue: {
    fontSize: 72,
    fontWeight: '200',
    letterSpacing: 1,
  },
  pmUnit: {
    fontSize: 14,
    color: '#aaaaaa',
    alignSelf: 'flex-start',
    marginTop: 24,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 16,
  },
});

export default MainPMDisplay;