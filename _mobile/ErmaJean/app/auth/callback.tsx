import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/libs/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      // Get the URL parameters
      const { access_token, refresh_token, error, error_description } = params;

      if (error) {
        console.error('OAuth error:', error, error_description);
        router.replace('/sign-in');
        return;
      }

      if (access_token && refresh_token) {
        // Set the session with the tokens from the OAuth callback
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: access_token as string,
          refresh_token: refresh_token as string,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          router.replace('/sign-in');
          return;
        }

        // Successfully authenticated, redirect to main app
        router.replace('/(tabs)');
      } else {
        // No tokens found, redirect back to sign in
        router.replace('/sign-in');
      }
    } catch (err) {
      console.error('Callback error:', err);
      router.replace('/sign-in');
    }
  }

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#ffffff'
    }}>
      <ActivityIndicator size="large" color="#5B7396" />
      <Text style={{ 
        marginTop: 16, 
        fontSize: 16, 
        color: '#6b7280' 
      }}>
        Completing sign in...
      </Text>
    </View>
  );
}
