import { useFonts } from 'expo-font';
import { AuthProvider } from '@/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import AuthLayout from './AuthLayout';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AuthLayout />
    </AuthProvider>
  );
}
