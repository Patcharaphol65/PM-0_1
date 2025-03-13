// AppHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AppHeader = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>คุณภาพอากาศปัจจุบัน</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '300',
  },
});

export default AppHeader;