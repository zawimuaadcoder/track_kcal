import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui';
import { getProductByBarcode } from '../lib/openFoodFacts';
import { fonts, Palette, useThemed } from '../lib/theme';

export default function Scan() {
  const { colors, styles } = useThemed(makeStyles);
  const { date, meal } = useLocalSearchParams<{ date: string; meal: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<'scanning' | 'loading' | 'notfound' | 'error'>('scanning');
  const busy = useRef(false);
  const [manual, setManual] = useState(false);
  const [code, setCode] = useState('');
  const validCode = /^\d{8,14}$/.test(code);

  const onScanned = async (code: string) => {
    if (busy.current) return;
    busy.current = true;
    setStatus('loading');
    try {
      const food = await getProductByBarcode(code);
      if (!food) {
        setStatus('notfound');
        if (manual) busy.current = false;
        return;
      }
      router.replace({ pathname: '/food', params: { date, meal, food: JSON.stringify(food) } });
    } catch {
      setStatus('error');
      if (manual) busy.current = false;
    }
  };

  const retry = () => {
    busy.current = false;
    setStatus('scanning');
  };

  const manualPanel = (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Escribir el código</Text>
      <Text style={styles.panelText}>Son los números que hay debajo de las barras (8 a 14 cifras).</Text>
      <TextInput
        value={code}
        onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
        placeholder="3017620422003"
        placeholderTextColor={colors.muted}
        keyboardType="number-pad"
        maxLength={14}
        autoFocus
        onSubmitEditing={() => validCode && onScanned(code)}
        keyboardAppearance={colors.dark ? 'dark' : 'light'}
        style={styles.codeInput}
      />
      {status === 'loading' ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 14 }} />
      ) : (
        <Button title="Buscar producto" onPress={() => onScanned(code)} disabled={!validCode} />
      )}
      {(status === 'notfound' || status === 'error') && (
        <Text style={[styles.panelText, { color: colors.danger, marginTop: 10, marginBottom: 0 }]}>
          {status === 'notfound' ? 'No hemos encontrado ese código.' : 'Error de conexión. Inténtalo otra vez.'}
        </Text>
      )}
    </View>
  );

  if (!permission) return <View style={styles.black} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg, padding: 24 }]}>
        {manual ? (
          manualPanel
        ) : (
          <>
            <Text style={styles.permText}>Necesitamos la cámara para escanear códigos de barras.</Text>
            <Button title="Permitir cámara" onPress={requestPermission} />
            <Button
              title="Escribir el código a mano"
              variant="secondary"
              onPress={() => setManual(true)}
              style={{ marginTop: 10 }}
            />
          </>
        )}
        <Button title="Cancelar" variant="secondary" onPress={() => router.back()} style={{ marginTop: 10 }} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.black}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={status === 'scanning' && !manual ? (r) => onScanned(r.data) : undefined}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <SafeAreaView style={styles.overlay}>
          <Pressable onPress={() => router.back()} style={styles.close} hitSlop={12}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
          <View style={styles.frame} />
          <View style={styles.bottom}>
            {manual ? (
              manualPanel
            ) : (
              <>
                {status === 'scanning' && (
                  <>
                    <Text style={styles.hint}>Apunta al código de barras</Text>
                    <Pressable
                      onPress={() => {
                        busy.current = false;
                        setManual(true);
                      }}
                      style={({ pressed }) => [styles.manualBtn, pressed && { opacity: 0.8 }]}
                    >
                      <Ionicons name="keypad-outline" size={20} color="#fff" />
                      <Text style={styles.manualText}>Escribir el código</Text>
                    </Pressable>
                  </>
                )}
                {status === 'loading' && <ActivityIndicator color="#fff" />}
                {(status === 'notfound' || status === 'error') && (
                  <View style={styles.panel}>
                    <Text style={styles.panelText}>
                      {status === 'notfound'
                        ? 'Producto no encontrado en Open Food Facts.'
                        : 'Error de conexión. Inténtalo otra vez.'}
                    </Text>
                    <Button title="Escanear otro" onPress={retry} />
                    <Button
                      title="Crear manualmente"
                      variant="secondary"
                      style={{ marginTop: 8 }}
                      onPress={() => router.replace({ pathname: '/food', params: { date, meal, custom: '1' } })}
                    />
                  </View>
                )}
              </>
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: { flex: 1, justifyContent: 'center' },
    black: { flex: 1, backgroundColor: '#000' },
    permText: { fontFamily: fonts.regular, fontSize: 17, textAlign: 'center', marginBottom: 24, color: colors.text },
    overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
    close: { alignSelf: 'flex-start', margin: 16 },
    frame: { width: 280, height: 170, borderWidth: 3, borderColor: '#fff', borderRadius: 16 },
    bottom: { minHeight: 160, width: '100%', alignItems: 'center', justifyContent: 'center', padding: 16 },
    hint: { color: '#fff', fontSize: 16, fontFamily: fonts.medium },
    panel: { backgroundColor: colors.card, borderRadius: 16, padding: 16, width: '100%' },
    panelTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, textAlign: 'center', marginBottom: 4 },
    manualBtn: {
      marginTop: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderRadius: 999,
      paddingVertical: 12,
      paddingHorizontal: 18,
    },
    manualText: { color: '#fff', fontSize: 16, fontFamily: fonts.semibold },
    codeInput: {
      outlineWidth: 0,
      fontFamily: fonts.bold,
      fontSize: 22,
      letterSpacing: 2,
      textAlign: 'center',
      color: colors.text,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 12,
      marginBottom: 12,
    },
    panelText: { fontFamily: fonts.regular, fontSize: 15, color: colors.text, textAlign: 'center', marginBottom: 12 },
  });
