import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { postApi } from '@gocanvas/shared';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function AdminCreateCourseScreen() {
  const navigation = useNavigation();
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!courseName.trim()) {
      Alert.alert("Error", "Course name is required");
      return;
    }

    setLoading(true);
    try {
      await postApi('/admin/courses', { Coursename: courseName });
      Alert.alert("Success", "Course created successfully", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error("Create course error:", error);
      Alert.alert("Error", "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Course</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Course Name</Text>
        <TextInput
          style={styles.input}
          value={courseName}
          onChangeText={setCourseName}
          placeholder="e.g. Introduction to Computer Science"
          placeholderTextColor={Colors.mutedForeground}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color="white" />
          ) : (
             <Text style={styles.buttonText}>Create Course</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.foreground },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: Colors.foreground },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.secondary,
    color: Colors.foreground,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
