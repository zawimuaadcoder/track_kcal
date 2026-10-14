import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { StoreProvider, useStore } from '../lib/store';
import { colors } from '../lib/theme';

function RootStack() {
  const { loaded, data } = useStore();
  if (!loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator />
      </View>
    );
  }
  const hasProfile = !!data.profile;
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.bg }, headerTintColor: colors.primary }}>
      <Stack.Protected guard={!hasProfile}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={hasProfile}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-food" options={{ title: 'Añadir alimento', presentation: 'modal' }} />
        <Stack.Screen name="scan" options={{ title: 'Escanear', presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen name="food" options={{ title: 'Alimento' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <RootStack />
    </StoreProvider>
  );
}
