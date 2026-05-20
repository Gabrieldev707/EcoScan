import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { fonts, useAppFonts } from './src/theme/fonts';
import { AuthProvider } from './src/context/AuthContext';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { colors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    if (fontError) console.warn('Font error:', fontError);
  }, [fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashText}>EcoScan</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <AuthNavigator />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashText: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    letterSpacing: 2,
  },
});
