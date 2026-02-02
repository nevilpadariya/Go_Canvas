import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { Users, BookOpen, GraduationCap, BarChart, PlusCircle } from 'lucide-react-native';

export default function AdminDashboardScreen() {
  const { signOut } = useAuth();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Welcome, Admin</Text>
        
        <View style={styles.grid}>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AdminUserList' as never)}>
                <Users size={32} color={Colors.primary} />
                <Text style={styles.cardText}>Manage Users</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AdminCourseAssign' as never)}>
                <BookOpen size={32} color={Colors.primary} />
                <Text style={styles.cardText}>Assign Faculty</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AdminStudentAssign' as never)}>
                <GraduationCap size={32} color={Colors.primary} />
                <Text style={styles.cardText}>Enroll Students</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AdminCreateCourse' as never)}>
                <PlusCircle size={32} color={Colors.primary} />
                <Text style={styles.cardText}>Create Course</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AdminAnalytics' as never)}>
                <BarChart size={32} color={Colors.primary} />
                <Text style={styles.cardText}>Platform Analytics</Text>
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.foreground,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.mutedForeground,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%', // roughly half - gap consideration
    backgroundColor: Colors.background,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.foreground,
    textAlign: 'center',
  },
});
