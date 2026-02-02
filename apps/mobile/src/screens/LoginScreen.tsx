import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { postApi, getApiUrl } from '@gocanvas/shared'; // Imported getApiUrl
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

// Note: jwt-decode usually works in RN, but if it fails, we can just skip decoding for now or use a shim.
// For now, let's assume we just need the token.

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      // Calls the same shared API as the web app!
      // Format data as x-www-form-urlencoded manually or adjust backend to accept JSON
      // The backend expects form data for OAuth2 password flow usually.
      
      // Let's create the form body string
      const body = `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&scope=&client_id=string&client_secret=string`;
      
      // We need to use fetch directly or update shared API to handle form-urlencoded if postApi sends JSON.
      // Checking shared api.ts: postApi sends "Content-Type": "application/json".
      // So we must use fetchApi directly or add a new helper.
      
      // We'll use fetch directly for this specific endpoint since it's unique (OAuth standard)
      // BUT we can use the helper `fetchApi` if we override headers? No, postApi forces json.
      
      // Let's use the shared `fetchApi` but we might need to modify it or just use fetch here.
      // Ideally we should add `postFormApi` to shared, but for now let's keep it simple here.
      
      // Wait! Shared API `configureApi` sets the base URL, so `getApiUrl` works.
      const { getApiUrl } = require('@gocanvas/shared'); 
      
      const response = await fetch(getApiUrl('/token'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      const token = data.access_token;
      
      // Retrieve role if needed (decode token)
      // For now just sign in
      await signIn(token);
      
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          {/* Placeholder for Logo */}
          <Text style={styles.logoText}>Go-Canvas</Text>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Please log in to continue</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email or ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email or ID"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary, // Match indigo-50/blue-50 vibe or just secondary
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary, // Brand Green
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.foreground,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.mutedForeground,
    marginTop: 8,
  },
  form: {
    backgroundColor: Colors.background,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.foreground,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.input,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.foreground,
    backgroundColor: Colors.background,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: Colors.background, // White text on green button
    fontSize: 16,
    fontWeight: '600',
  },
});
