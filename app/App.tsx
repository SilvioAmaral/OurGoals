import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Lora_500Medium, Lora_600SemiBold, Lora_700Bold } from '@expo-google-fonts/lora';
import {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
} from '@expo-google-fonts/work-sans';
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
