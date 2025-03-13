// TemperatureAndHumidity.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TemperatureAndHumidityProps {
  temperature: number;
  humidity: number;
}

// ฟังก์ชันกำหนดอีโมจิและสีตามค่าอุณหภูมิ
const getTemperatureEmoji = (temp: number): { emoji: string, color: string } => {
  if (temp < 18) {
    return { emoji: "☺", color: "#2196F3" }; // เย็น
  } else if (temp < 26) {
    return { emoji: "☺", color: "#4CAF50" }; // สบาย
  } else if (temp < 32) {
    return { emoji: "☺", color: "#FFC107" }; // อุ่น
  } else {
    return { emoji: "☺", color: "#4CAF50" }; // ร้อน (เปลี่ยนตามภาพ)
  }
};

// ฟังก์ชันกำหนดอีโมจิและสีตามค่าความชื้น
const getHumidityEmoji = (humidity: number): { emoji: string, color: string } => {
  if (humidity < 30) {
    return { emoji: "☺", color: "#F44336" }; // แห้งมาก
  } else if (humidity < 50) {
    return { emoji: "☺", color: "#FFC107" }; // แห้ง
  } else if (humidity < 70) {
    return { emoji: "☺", color: "#4CAF50" }; // เหมาะสม
  } else {
    return { emoji: "☺", color: "#4CAF50" }; // ชื้น (เปลี่ยนตามภาพ)
  }
};

const TemperatureAndHumidity: React.FC<TemperatureAndHumidityProps> = ({ temperature, humidity }) => {
  const tempInfo = getTemperatureEmoji(temperature);
  const humidityInfo = getHumidityEmoji(humidity);
  
  return (
    <View style={styles.infoSectionContainer}>
      <Text style={styles.sectionTitle}>อุณหภูมิรู้สึก</Text>
      
      {/* Temperature Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoLabelContainer}>
          <Text style={styles.infoLabel}>อุณหภูมิ</Text>
        </View>
        <Text style={styles.infoValue}>{temperature.toFixed(0)} °C</Text>
        <Text style={[styles.infoEmoji, { color: tempInfo.color }]}>{tempInfo.emoji}</Text>
      </View>
      
      {/* Humidity Card */}
      <View style={[styles.infoCard, styles.marginTop]}>
        <View style={styles.infoLabelContainer}>
          <Text style={styles.infoLabel}>ความชื้น</Text>
        </View>
        <Text style={styles.infoValue}>{humidity.toFixed(0)} %</Text>
        <Text style={[styles.infoEmoji, { color: humidityInfo.color }]}>{humidityInfo.emoji}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoSectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marginTop: {
    marginTop: 12,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#888888',
    fontSize: 16,
  },
  infoValue: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
  },
  infoEmoji: {
    fontSize: 30,
  },
});

export default TemperatureAndHumidity;