import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Picker } from '@react-native-picker/picker';
import { getApiUrl } from '@gocanvas/shared';

interface SignupResponse {
  message: string;
  userid: number;
  assigned_id: number;
  id_type: string;
  useremail: string;
  userrole: string;
}

export default function SignupScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SignupResponse | null>(null);

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 8) return 'Password must be at least 8 characters long';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.role) return 'Please select a role';
    return null;
  };

  const handleSignup = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Userfirstname: formData.firstName,
          Userlastname: formData.lastName,
          Useremail: formData.email,
          Userpassword: formData.password,
          Userrole: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data);
      } else {
        Alert.alert('Signup Failed', data.detail || 'Please try again');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>✓ Account Created!</Text>
            <Text style={styles.successMessage}>{success.message}</Text>
            <View style={styles.idContainer}>
              <Text style={styles.idLabel}>Your {success.id_type}:</Text>
              <Text style={styles.idValue}>{success.assigned_id}</Text>
            </View>
            <Text style={styles.idNote}>
              Please save this ID. You can use it to login along with your email.
            </Text>
            
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.replace('Login')}
            >
              <Text style={styles.buttonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logoText}>Go-Canvas</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Go-Canvas today</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              />
            </View>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="john.doe@example.com"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>I am a...</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.role}
              onValueChange={(itemValue: string) => setFormData({ ...formData, role: itemValue })}
              style={styles.picker}
            >
              <Picker.Item label="Select your role" value="" />
              <Picker.Item label="Student" value="Student" />
              <Picker.Item label="Faculty" value="Faculty" />
            </Picker>
          </View>

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkBold}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  scrollContent: {
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfField: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.foreground,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.input,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: Colors.foreground,
    backgroundColor: Colors.background,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.input,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: Colors.background,
  },
  picker: {
    height: 50,
    color: Colors.foreground,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    textAlign: 'center',
    marginTop: 16,
    color: Colors.mutedForeground,
    fontSize: 14,
  },
  linkBold: {
    color: Colors.primary,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: Colors.background,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: Colors.foreground,
    marginBottom: 20,
    textAlign: 'center',
  },
  idContainer: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  idLabel: {
    fontSize: 14,
    color: Colors.mutedForeground,
    marginBottom: 8,
  },
  idValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  idNote: {
    fontSize: 12,
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 24,
  },
});
