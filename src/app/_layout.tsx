import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { StoreProvider, useStore } from '../lib/store';
import { PALETTES, ThemeContext, useColors } from '../lib/theme';

function RootStack() {
  const { loaded, data } = useStore();
  const colors = useColors();
  if (!loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  const hasProfile = !!data.profile;
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.bg },
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Protected guard={!hasProfile}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={hasProfile}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-food" options={{ title: 'Añadir alimento', presentation: 'modal' }} />
        <Stack.Screen
          name="scan"
          options={{ title: 'Escanear', presentation: 'fullScreenModal', headerShown: false }}
        />
        <Stack.Screen name="food" options={{ title: 'Alimento' }} />
      </Stack.Protected>
    </Stack>
  );
}

function ThemedApp() {
  const { data } = useStore();
  const system = useColorScheme();
  const { accent, mode } = data.appearance;
  const dark = mode === 'dark' || (mode === 'system' && system === 'dark');
  const palette = PALETTES[accent][dark ? 'dark' : 'light'];
  return (
    <ThemeContext.Provider value={palette}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <RootStack />
    </ThemeContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <ThemedApp />
    </StoreProvider>
  );
}
