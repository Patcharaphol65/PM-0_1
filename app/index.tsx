import React from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';

// import pages
import HomeScreen from '../components/HomeScreen';
import AverageAirQualityScreen from '../components/AverageAirQualityScreen';
import DailyAirQualityScreen from '../components/DailyAirQualityScreen';
import StatsScreen from '../components/StatsScreen';

import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Ionicons
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <NavigationIndependentTree>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                backgroundColor: '#333', 
                borderTopWidth: 0, 
                height: 60, 
                paddingBottom: 10,
                paddingTop: 5, 
              },
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap;

                switch (route.name) {
                  case 'Home':
                    iconName = focused ? 'home' : 'home-outline';
                    break;
                  case 'History':
                    iconName = focused ? 'time' : 'time-outline';
                    break;
                  case 'Daily':
                    iconName = focused ? 'calendar' : 'calendar-outline';
                    break;
                  case 'Stats':
                    iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                    break;
                  default:
                    iconName = 'help-circle-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#4CAF50', 
              tabBarInactiveTintColor: '#888',
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="History" component={AverageAirQualityScreen} />
            <Tab.Screen name="Daily" component={DailyAirQualityScreen} />
            <Tab.Screen name="Stats" component={StatsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </NavigationIndependentTree>
    </View>
  );
};

export default App;