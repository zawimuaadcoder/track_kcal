import { ReactNode } from 'react';
import { Platform, useColorScheme, useWindowDimensions, View } from 'react-native';

const MAX_WIDTH = 520;

/** En web y pantallas anchas, centra la app como un móvil para que no se estire. */
export function WebFrame({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const dark = useColorScheme() === 'dark';
  if (Platform.OS !== 'web' || width <= MAX_WIDTH) return <>{children}</>;
  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: dark ? '#0B0912' : '#DCD8EA' }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: MAX_WIDTH,
          overflow: 'hidden',
          boxShadow: dark ? '0 0 60px rgba(0,0,0,0.6)' : '0 0 60px rgba(40,20,90,0.15)',
        }}
      >
        {children}
      </View>
    </View>
  );
}
