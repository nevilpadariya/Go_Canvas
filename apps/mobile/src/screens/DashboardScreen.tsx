import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { getApi, getCurrentSemesterCode } from '@gocanvas/shared';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookOpen, LogOut } from 'lucide-react-native';

interface Course {
  Courseid: number;
  Coursename: string;
  Coursedescription: string;
  Coursesemester?: string;
  EnrollmentSemester?: string;
}

type RootStackParamList = {
  Dashboard: undefined;
  CourseDetail: {
    courseId: number;
    courseName: string;
    courseDescription: string;
    courseSemester?: string;
  };
};

export default function DashboardScreen() {
  const { signOut } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const currentSemester = getCurrentSemesterCode();

  const fetchCourses = async () => {
    try {
        // getApi handles base URL and headers if configured correctly in App.tsx using getToken
        const data = await getApi<Course[]>('/student/view_contents');
        // Filter for current semester
        const currentCourses = data.filter((c: any) => 
             (c.Coursesemester || c.EnrollmentSemester || "").toUpperCase() === currentSemester
        );
        setCourses(currentCourses);
    } catch (error: any) {
      console.error('Failed to fetch courses', error);
      Alert.alert('Error', 'Failed to load courses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses();
  }, []);

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('CourseDetail', {
            courseId: item.Courseid,
            courseName: item.Coursename,
            courseDescription: item.Coursedescription,
            courseSemester: item.Coursesemester || item.EnrollmentSemester
        })} 
    >
      <View style={styles.cardIcon}>
         <BookOpen size={24} color={Colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.courseName}>{item.Coursename}</Text>
        <Text style={styles.courseDescription} numberOfLines={2}>
            {item.Coursedescription}
        </Text>
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.Coursesemester || item.EnrollmentSemester}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back!</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <LogOut size={20} color={Colors.destructive} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
            <FlatList
                data={courses}
                renderItem={renderCourseItem}
                keyExtractor={(item) => item.Courseid.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <BookOpen size={48} color={Colors.mutedForeground} />
                        <Text style={styles.emptyText}>No courses assigned yet.</Text>
                        <Text style={styles.emptySubtext}>Contact your department to register.</Text>
                    </View>
                }
            />
        )}
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
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.indigo100, // Or similar light accent
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.foreground,
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: Colors.mutedForeground,
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.foreground,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginTop: 8,
  },
});
