import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { AuthScreen } from '../screens/AuthScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { TabNavigator } from './TabNavigator';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { user, loading, loadMe, setupDone } = useAuthStore();
  const { fetchCategories, fetchPartner, theme } = useAppStore();

  useEffect(() => { loadMe(); }, []);

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchPartner();
    }
  }, [user?._id]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show Setup for new users until they tap "Start rating together"
  const isSetup = user && !user.coupleId && !setupDone;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : isSetup ? (
        <Stack.Screen name="Setup" component={SetupScreen} />
      ) : (
        <Stack.Screen name="Main" component={TabNavigator} />
      )}
    </Stack.Navigator>
  );
}
