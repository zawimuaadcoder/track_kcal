import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, ProfileSummary } from '../lib/api';
import { useSession } from '../lib/session';
import { fonts, Palette, useThemed } from '../lib/theme';
import { Mascot } from './Mascot';
import { Button } from './ui';

const PROFILE_COLORS = ['#6E4BFF', '#F2456A', '#FF7A1A', '#14A37F', '#2E9CF2', '#1B1F24'];

type Mode = { kind: 'pick' } | { kind: 'password'; profile: ProfileSummary } | { kind: 'create' };

export function ProfileAvatar({ color, size }: { color: string; size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.26,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: -size * 0.3,
          right: -size * 0.3,
          width: size,
          height: size,
          borderRadius: size,
          backgroundColor: 'rgba(255,255,255,0.18)',
        }}
      />
      <Mascot size={size * 0.78} variant="white" />
    </View>
  );
}

/** Selector de perfiles con contraseña, al estilo Netflix. */
export function ProfileGate() {
  const { colors, styles } = useThemed(makeStyles);
  const { signIn } = useSession();
  const [profiles, setProfiles] = useState<ProfileSummary[] | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: 'pick' });
  const [loadError, setLoadError] = useState<string | null>(null);
  const fade = useRef(new Animated.Value(0)).current;

  const refresh = useCallback(() => {
    setLoadError(null);
    api
      .listProfiles()
      .then(setProfiles)
      .catch((e) => setLoadError(e.message));
  }, []);

  useEffect(refresh, [refresh]);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [mode, fade]);

  const slide = fade.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Animated.View
            style={{ opacity: fade, transform: [{ translateY: slide }], width: '100%', alignItems: 'center' }}
          >
            {mode.kind === 'pick' && (
              <>
                <Text style={styles.brand}>MyFitPalace</Text>
                <Text style={styles.title}>¿Quién va a registrar hoy?</Text>
                {loadError ? (
                  <View style={{ alignItems: 'center', gap: 12 }}>
                    <Text style={styles.error}>{loadError}</Text>
                    <Button title="Reintentar" variant="secondary" onPress={refresh} />
                  </View>
                ) : !profiles ? (
                  <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
                ) : (
                  <View style={styles.grid}>
                    {profiles.map((p) => (
                      <Tile key={p.id} label={p.name} onPress={() => setMode({ kind: 'password', profile: p })}>
                        <ProfileAvatar color={p.color} size={104} />
                      </Tile>
                    ))}
                    <Tile label="Añadir perfil" muted onPress={() => setMode({ kind: 'create' })}>
                      <View style={styles.addTile}>
                        <Ionicons name="add" size={44} color={colors.muted} />
                      </View>
                    </Tile>
                  </View>
                )}
              </>
            )}

            {mode.kind === 'password' && (
              <PasswordForm
                profile={mode.profile}
                onBack={() => setMode({ kind: 'pick' })}
                onSubmit={(pw) => signIn(mode.profile, pw)}
              />
            )}

            {mode.kind === 'create' && (
              <CreateForm
                onBack={() => setMode({ kind: 'pick' })}
                onCreated={async (profile, pw) => {
                  refresh();
                  await signIn(profile, pw);
                }}
              />
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Tile({
  label,
  muted,
  onPress,
  children,
}: {
  label: string;
  muted?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const { styles } = useThemed(makeStyles);
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(scale, { toValue: v, friction: 5, useNativeDriver: true }).start();
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => to(0.94)}
      onPressOut={() => to(1)}
      onHoverIn={() => to(1.05)}
      onHoverOut={() => to(1)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.tile}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
      <Text style={[styles.tileLabel, muted && styles.tileLabelMuted]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function PasswordForm({
  profile,
  onBack,
  onSubmit,
}: {
  profile: ProfileSummary;
  onBack: () => void;
  onSubmit: (password: string) => Promise<boolean>;
}) {
  const { colors, styles } = useThemed(makeStyles);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shake = useRef(new Animated.Value(0)).current;

  const submit = async () => {
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    try {
      const ok = await onSubmit(password);
      if (!ok) {
        setError('Contraseña incorrecta');
        setPassword('');
        Animated.sequence(
          [10, -10, 7, -7, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 55, useNativeDriver: true })),
        ).start();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.form}>
      <ProfileAvatar color={profile.color} size={120} />
      <Text style={styles.formTitle}>{profile.name}</Text>
      <Text style={styles.formHint}>Introduce tu contraseña</Text>
      <Animated.View style={{ alignSelf: 'stretch', transform: [{ translateX: shake }] }}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          placeholderTextColor={colors.muted}
          secureTextEntry
          autoFocus
          autoCapitalize="none"
          onSubmitEditing={submit}
          returnKeyType="go"
          keyboardAppearance={colors.dark ? 'dark' : 'light'}
          style={[styles.input, error && { borderColor: colors.danger }]}
        />
      </Animated.View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={busy ? 'Entrando…' : 'Entrar'} onPress={submit} disabled={!password || busy} style={styles.cta} />
      <Pressable onPress={onBack} style={styles.back} hitSlop={8}>
        <Text style={styles.backText}>Cambiar de perfil</Text>
      </Pressable>
    </View>
  );
}

function CreateForm({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: (profile: ProfileSummary, password: string) => Promise<void>;
}) {
  const { colors, styles } = useThemed(makeStyles);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [color, setColor] = useState(PROFILE_COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = name.trim().length > 0 && password.length >= 4;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const id = await api.createProfile(name.trim(), password, color);
      await onCreated({ id, name: name.trim(), color }, password);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <View style={styles.form}>
      <ProfileAvatar color={color} size={120} />
      <Text style={styles.formTitle}>Nuevo perfil</Text>
      <View style={styles.colors}>
        {PROFILE_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            accessibilityLabel={`Color ${c}`}
            style={[styles.colorDot, { backgroundColor: c }, color === c && { borderColor: colors.text }]}
          />
        ))}
      </View>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nombre"
        placeholderTextColor={colors.muted}
        maxLength={30}
        autoFocus
        keyboardAppearance={colors.dark ? 'dark' : 'light'}
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña (mínimo 4 caracteres)"
        placeholderTextColor={colors.muted}
        secureTextEntry
        autoCapitalize="none"
        onSubmitEditing={submit}
        keyboardAppearance={colors.dark ? 'dark' : 'light'}
        style={[styles.input, { marginTop: 10 }]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        title={busy ? 'Creando…' : 'Crear perfil'}
        onPress={submit}
        disabled={!valid || busy}
        style={styles.cta}
      />
      <Pressable onPress={onBack} style={styles.back} hitSlop={8}>
        <Text style={styles.backText}>Volver</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    brand: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.primary, letterSpacing: 0.2 },
    title: {
      fontFamily: fonts.extrabold,
      fontSize: 30,
      color: colors.text,
      textAlign: 'center',
      marginTop: 6,
      marginBottom: 32,
      letterSpacing: -0.5,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 22, maxWidth: 560 },
    tile: { alignItems: 'center', width: 112, gap: 10 },
    tileLabel: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
    tileLabelMuted: { color: colors.muted },
    addTile: {
      width: 104,
      height: 104,
      borderRadius: 27,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    form: { width: '100%', maxWidth: 360, alignItems: 'center' },
    formTitle: { fontFamily: fonts.extrabold, fontSize: 26, color: colors.text, marginTop: 16 },
    formHint: { fontFamily: fonts.regular, fontSize: 15, color: colors.muted, marginTop: 4, marginBottom: 20 },
    input: {
      outlineWidth: 0,
      alignSelf: 'stretch',
      fontFamily: fonts.medium,
      fontSize: 17,
      color: colors.text,
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    colors: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 20 },
    colorDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 3, borderColor: 'transparent' },
    error: { fontFamily: fonts.semibold, fontSize: 14, color: colors.danger, marginTop: 10, textAlign: 'center' },
    cta: { alignSelf: 'stretch', marginTop: 18 },
    back: { marginTop: 18 },
    backText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.primary },
  });
