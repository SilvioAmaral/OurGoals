import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { CategoriesStack } from './CategoriesStack';
import { ProgressScreen } from '../screens/ProgressScreen';
import { MatchScreen } from '../screens/MatchScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { useTheme } from '../theme/ThemeContext';
import { STATIC, font } from '../theme';

const Tab = createBottomTabNavigator();

function icon(name: string, focused: boolean, color: string) {
  const icons: Record<string, string> = {
    List: '☰',
    Progress: '◎',
    Match: '♡',
    Account: '◯',
  };
  return <Text style={{ fontSize: 20, color }}>{icons[name]}</Text>;
}

export function TabNavigator() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: STATIC.textFaint,
        tabBarLabelStyle: { fontFamily: font.sans, fontSize: 11 },
        tabBarStyle: {
          borderTopColor: STATIC.border,
          backgroundColor: '#fff',
        },
        tabBarIcon: ({ focused, color }) => icon(route.name, focused, color),
      })}
    >
      <Tab.Screen name="List" component={CategoriesStack} options={{ title: 'List' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Match" component={MatchScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
