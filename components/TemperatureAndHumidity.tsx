import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TemperatureAndHumidityProps {
  temperature: number;
  humidity: number;
}

// Function to determine emoji and color based on temperature using standard ranges
const getTemperatureEmoji = (temp: number): { emoji: string, color: string } => {
  if (temp < 0) {
    return { emoji: "❄️", color: "#0D47A1" }; // Freezing
  } else if (temp < 10) {
    return { emoji: "🥶", color: "#2196F3" }; // Very cold
  } else if (temp < 18) {
    return { emoji: "😬", color: "#64B5F6" }; // Cold
  } else if (temp < 24) {
    return { emoji: "😊", color: "#4CAF50" }; // Comfortable
  } else if (temp < 29) {
    return { emoji: "🙂", color: "#FFC107" }; // Warm
  } else if (temp < 35) {
    return { emoji: "🥵", color: "#FF9800" }; // Hot
  } else {
    return { emoji: "🥵", color: "#F44336" }; // Extreme heat
  }
};

// Function to determine emoji and color based on humidity using standard ranges
const getHumidityEmoji = (humidity: number): { emoji: string, color: string } => {
  if (humidity < 20) {
    return { emoji: "🏜️", color: "#F44336" }; // Very dry
  } else if (humidity < 30) {
    return { emoji: "📄", color: "#FF9800" }; // Dry
  } else if (humidity < 40) {
    return { emoji: "🙂", color: "#FFC107" }; // Slightly dry
  } else if (humidity < 60) {
    return { emoji: "😊", color: "#4CAF50" }; // Comfortable/Ideal
  } else if (humidity < 70) {
    return { emoji: "💦", color: "#64B5F6" }; // Slightly humid
  } else if (humidity < 80) {
    return { emoji: "💧", color: "#2196F3" }; // Humid
  } else {
    return { emoji: "💧", color: "#0D47A1" }; // Very humid
  }
};

const TemperatureAndHumidity: React.FC<TemperatureAndHumidityProps> = ({ temperature, humidity }) => {
  const tempInfo = getTemperatureEmoji(temperature);
  const humidityInfo = getHumidityEmoji(humidity);

  return (
    <View style={styles.infoSectionContainer}>
      <Text style={styles.sectionTitle}>สภาพอากาศรู้สึก</Text>
      
      {/* Temperature Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>อุณหภูมิ</Text>
        <Text style={styles.infoValue}>{temperature.toFixed(0)} °C</Text>
        <Text style={[styles.infoEmoji, { color: tempInfo.color }]}>{tempInfo.emoji}</Text>
      </View>
      
      {/* Humidity Card */}
      <View style={[styles.infoCard, styles.marginTop]}>
        <Text style={styles.infoLabel}>ความชื้น</Text>
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
    color: 'Black',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#FDFBEE',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marginTop: {
    marginTop: 12,
  },
  infoLabel: {
    color: 'Black',
    fontSize: 16,
  },
  infoValue: {
    color: 'Black',
    fontSize: 24,
    textAlign: 'center',
  },
  infoEmoji: {
    fontSize: 30,
  },
});

export default TemperatureAndHumidity;