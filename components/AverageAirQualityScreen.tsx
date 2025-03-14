import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useAirQualityData } from '../hooks/useAirQualityData';
import MainPMDisplay from './MainPMDisplay';
import HealthRecommendation from './HealthRecommendation';
import TemperatureAndHumidity from './TemperatureAndHumidity';
import ParticleSection from './ParticleSection';
import { useEffect } from 'react';

interface AverageAirQualityScreenProps {
  navigation?: any;
}

const AverageAirQualityScreen: React.FC<AverageAirQualityScreenProps> = ({ navigation }) => {
  const { airData, loading, error } = useAirQualityData('average');
  
  useEffect(()=>{
    console.log('this is history page')
  }, [])
  
  // แสดงตัวโหลดระหว่างดึงข้อมูล
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  // แสดงข้อความเมื่อเกิดข้อผิดพลาด
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>เกิดข้อผิดพลาด: {error}</Text>
        <Text style={styles.errorSubtext}>กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CustomHeader />
        <MainPMDisplay pm={airData.pm0_1} />
        <HealthRecommendation pmValue={airData.pm0_1} />
        <TemperatureAndHumidity temperature={airData.temperature} humidity={airData.humidity} />
        <ParticleSection pm2_5={airData.pm2_5} />
      </View>
    </SafeAreaView>
  );
};

// แยกเฮดเดอร์เป็นคอมโพเนนต์ใหม่เพื่อแสดงข้อความ "คุณภาพอากาศเฉลี่ย 1 ชั่วโมง"
const CustomHeader = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>คุณภาพอากาศเฉลี่ย 1 ชั่วโมง</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    color: 'Black',
    fontWeight: '300',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    color: '#aaaaaa',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default AverageAirQualityScreen;