import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAirQualityData } from '../hooks/useAirQualityData';
import AppHeader from './AppHeader';
import MainPMDisplay from './MainPMDisplay';
import HealthRecommendation from './HealthRecommendation';
import TemperatureAndHumidity from './TemperatureAndHumidity';
import ParticleSection from './ParticleSection';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { airData, loading, error } = useAirQualityData('latest');

  useEffect(() => {
    console.log('this is home page');
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

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
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        <AppHeader />
        <MainPMDisplay pm={airData.pm0_1} />
        <HealthRecommendation pmValue={airData.pm0_1} />
        <TemperatureAndHumidity temperature={airData.temperature} humidity={airData.humidity} />
        <ParticleSection pm2_5={airData.pm2_5} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
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

export default HomeScreen;