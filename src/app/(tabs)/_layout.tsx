import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../components/FloatingTabBar';
import { useColors } from '../../lib/theme';

export default function TabsLayout() {
  const colors = useColors();
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="ayuno" />
      <Tabs.Screen name="progreso" />
      <Tabs.Screen name="ajustes" />
    </Tabs>
  );
}
