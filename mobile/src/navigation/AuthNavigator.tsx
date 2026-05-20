import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { AppNavigator } from './AppNavigator';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  App: { name: string };
};

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        cardStyle: { backgroundColor: '#07090a' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="App">
        {({ route, navigation }) => (
          <AppNavigator
            userName={route.params.name}
            onLogout={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
