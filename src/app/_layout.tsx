import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/figtree';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { WebFrame } from '../components/WebFrame';
import { SessionProvider, useSession } from '../lib/session';
import { StoreProvider, useStore } from '../lib/store';
import { Appearance } from '../lib/types';
import { fonts, PALETTES, ThemeContext, useColors } from '../lib/theme';

function Loading() {
  const colors = useColors();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

/** Navegación: sin sesión solo se ve el selector de perfiles; sin datos de perfil, el cuestionario. */
function RootStack({ hasSession, hasProfile }: { hasSession: boolean; hasProfile: boolean }) {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.bg },
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.text, fontFamily: fonts.bold },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Protected guard={!hasSession}>
        <Stack.Screen name="perfiles" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={hasSession && !hasProfile}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={hasSession && hasProfile}>
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

function usePalette(accent: Appearance['accent'], mode: Appearance['mode']) {
  const system = useColorScheme();
  const dark = mode === 'dark' || (mode === 'system' && system === 'dark');
  return { dark, palette: PALETTES[accent][dark ? 'dark' : 'light'] };
}

function ProfileApp() {
  const { data, loaded } = useStore();
  const { dark, palette } = usePalette(data.appearance.accent, data.appearance.mode);
  return (
    <ThemeContext.Provider value={palette}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {loaded ? <RootStack hasSession hasProfile={!!data.profile} /> : <Loading />}
    </ThemeContext.Provider>
  );
}

function Shell() {
  const { session, ready, dropSession } = useSession();
  const { dark, palette } = usePalette('violeta', 'system');
  const [fontsLoaded, fontError] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
  });
  if (!ready || (!fontsLoaded && !fontError)) {
    return (
      <ThemeContext.Provider value={palette}>
        <Loading />
      </ThemeContext.Provider>
    );
  }
  if (!session) {
    return (
      <ThemeContext.Provider value={palette}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <RootStack hasSession={false} hasProfile={false} />
      </ThemeContext.Provider>
    );
  }
  return (
    <StoreProvider
      key={session.token}
      token={session.token}
      profileId={session.profile.id}
      onSessionExpired={dropSession}
    >
      <ProfileApp />
    </StoreProvider>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <WebFrame>
        <Shell />
      </WebFrame>
    </SessionProvider>
  );
}
