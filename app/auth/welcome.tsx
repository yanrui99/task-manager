import React from 'react';
import { StyleSheet, View, Text, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function WelcomeScreen() {
  const { signInWithGoogle, loading } = useAuth();
  const colorScheme = useColorScheme();
  // Provide a fallback to 'light' if colorScheme is null or undefined
  const themeColors = Colors[colorScheme || 'light'];

  const handleSignIn = async () => {
    await signInWithGoogle();
    // If successful, the AuthContext listener will redirect users
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={[styles.title, { color: themeColors.text }]}>Task Manager</Text>
        <Text style={[styles.subtitle, { color: themeColors.text }]}>Organise your tasks efficiently</Text>
        
        <TouchableOpacity 
          style={styles.googleButton}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Image 
                source={require('../../assets/images/google-logo.png')} 
                style={styles.googleIcon} 
              />
              <Text style={styles.buttonText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    // Color applied dynamically
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    // Color applied dynamically
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginTop: 20,
    minWidth: 220,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});