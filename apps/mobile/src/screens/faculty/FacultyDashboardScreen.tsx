import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getApi } from '@gocanvas/shared';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Calendar, LogOut } from 'lucide-react-native';

interface Course {
  Courseid: number;
  Coursename: string;
  Coursedescription: string;
  Coursesemester: string;
  Coursecode?: string;
}

type FacultyStackParamList = {
  FacultyCourseDetail: {
    courseId: number;
    courseName: string;
    courseDescription: string;
    courseSemester: string;
  };
};

export default function FacultyDashboardScreen() {
  const { signOut } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<FacultyStackParamList>>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = async () => {
    try {
      // Endpoint to view courses taught by the logged-in faculty
      // Assuming /faculty/view_courses exists or similar. 
      // Based on previous analysis, we might need to check the exact endpoint.
      // Re-using logic from web: apps/web/src/pages/faculty/facultydashboard.tsx
      const data = await getApi<Course[]>('/faculty/courses_taught');
      setCourses(data);
    } catch (error) {
      console.error("Error fetching faculty courses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('FacultyCourseDetail', {
            courseId: item.Courseid,
            courseName: item.Coursename,
            courseDescription: item.Coursedescription,
            courseSemester: item.Coursesemester
        })} 
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
            <BookOpen size={24} color={Colors.primary} />
        </View>
        <View style={styles.headerText}>
            <Text style={styles.courseName}>{item.Coursename}</Text>
            <Text style={styles.courseCode}>{item.Coursecode || `CS-${item.Courseid}`}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
         <View style={styles.semesterTag}>
            <Calendar size={14} color={Colors.mutedForeground} />
            <Text style={styles.semesterText}>{item.Coursesemester}</Text>
         </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.title}>Faculty Dashboard</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
            <LogOut size={24} color={Colors.destructive} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.Courseid.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No courses assigned yet.</Text>
            </View>
          }
        />
      )}
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
    padding: 24,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.foreground,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.indigo50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.foreground,
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 14,
    color: Colors.mutedForeground,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  semesterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gray100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  semesterText: {
    fontSize: 12,
    color: Colors.mutedForeground,
    fontWeight: '500',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.mutedForeground,
  },
});
