import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { ScannerScreen } from '../screens/ScannerScreen';
import { MapScreen } from '../screens/MapScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export type AppTabParamList = {
  Scanner: undefined;
  Mapa: undefined;
  Dashboard: undefined;
  Perfil: { name: string };
  Comunidade: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export function AppNavigator({ userName }: { userName: string }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 10 },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, React.ComponentProps<typeof Feather>['name']> = {
            Scanner: 'camera',
            Mapa: 'map',
            Dashboard: 'bar-chart-2',
            Perfil: 'user',
            Comunidade: 'users',
          };
          return <Feather name={icons[route.name] ?? 'circle'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Scanner" component={ScannerScreen} />
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} initialParams={{ name: userName }} />
      <Tab.Screen name="Comunidade" component={CommunityScreen} />
    </Tab.Navigator>
  );
}
