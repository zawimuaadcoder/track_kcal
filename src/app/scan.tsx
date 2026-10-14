import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui';
import { getProductByBarcode } from '../lib/openFoodFacts';
import { colors } from '../lib/theme';

export default function Scan() {
  const { date, meal } = useLocalSearchParams<{ date: string; meal: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<'scanning' | 'loading' | 'notfound' | 'error'>('scanning');
  const busy = useRef(false);

  const onScanned = async (code: string) => {
    if (busy.current) return;
    busy.current = true;
    setStatus('loading');
    try {
      const food = await getProductByBarcode(code);
      if (!food) {
        setStatus('notfound');
        return;
      }
      router.replace({ pathname: '/food', params: { date, meal, food: JSON.stringify(food) } });
    } catch {
      setStatus('error');
    }
  };

  const retry = () => {
    busy.current = false;
    setStatus('scanning');
  };

  if (!permission) return <View style={styles.black} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg, padding: 24 }]}>
        <Text style={styles.permText}>Necesitamos la cámara para escanear códigos de barras.</Text>
        <Button title="Permitir cámara" onPress={requestPermission} />
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
        onBarcodeScanned={status === 'scanning' ? (r) => onScanned(r.data) : undefined}
      />
      <SafeAreaView style={styles.overlay}>
        <Pressable onPress={() => router.back()} style={styles.close} hitSlop={12}>
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
        <View style={styles.frame} />
        <View style={styles.bottom}>
          {status === 'scanning' && <Text style={styles.hint}>Apunta al código de barras</Text>}
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
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  black: { flex: 1, backgroundColor: '#000' },
  permText: { fontSize: 17, textAlign: 'center', marginBottom: 24, color: colors.text },
  overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  close: { alignSelf: 'flex-start', margin: 16 },
  frame: { width: 280, height: 170, borderWidth: 3, borderColor: '#fff', borderRadius: 16 },
  bottom: { minHeight: 160, width: '100%', alignItems: 'center', justifyContent: 'center', padding: 16 },
  hint: { color: '#fff', fontSize: 16, fontWeight: '500' },
  panel: { backgroundColor: colors.card, borderRadius: 16, padding: 16, width: '100%' },
  panelText: { fontSize: 15, color: colors.text, textAlign: 'center', marginBottom: 12 },
});
