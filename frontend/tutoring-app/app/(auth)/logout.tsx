import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

export default function Logout() {
  const { token, setToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await AsyncStorage.removeItem('jwtToken');
        setToken(null);
        setTimeout(() => {
          router.replace('/login');
        }, 500);
      } catch (error) {
        console.error('Logout error:', error);
        router.replace('/login'); 
      }
    };
    if (token) {
      performLogout();
    } else {
      router.replace('/login'); 
    }
  }, [token]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
};
