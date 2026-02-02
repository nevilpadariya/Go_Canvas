import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { ArrowLeft, Users, FileText, CheckSquare, BarChart2 } from 'lucide-react-native';

type FacultyCourseDetailRouteProp = RouteProp<{
  FacultyCourseDetail: {
    courseId: number;
    courseName: string;
    courseDescription: string;
    courseSemester: string;
  };
}, 'FacultyCourseDetail'>;

export default function FacultyCourseDetailScreen() {
  const route = useRoute<FacultyCourseDetailRouteProp>();
  const navigation = useNavigation();
  const { courseId, courseName, courseSemester } = route.params;

  const navigateTo = (screen: string) => {
    // We will implement these screens next
    navigation.navigate(screen as never, { courseId, courseName } as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{courseName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.semesterText}>{courseSemester}</Text>
        <Text style={styles.sectionTitle}>Course Management</Text>
        
        <View style={styles.grid}>
            <TouchableOpacity style={styles.card} onPress={() => navigateTo('FacultySyllabus')}>
                <FileText size={32} color={Colors.primary} />
                <Text style={styles.cardText}>Syllabus</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigateTo('FacultyStudentList')}>
                <Users size={32} color={Colors.primary} />
                <Text style={styles.cardText}>Students</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigateTo('FacultyAssignments')}>
                <CheckSquare size={32} color={Colors.primary} />
                <Text style={styles.cardText}>Assignments</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigateTo('FacultyGrades')}>
                <BarChart2 size={32} color={Colors.primary} />
                <Text style={styles.cardText}>Grades</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.secondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.foreground, flex: 1 },
  content: { padding: 20 },
  semesterText: { fontSize: 14, color: Colors.mutedForeground, marginBottom: 8 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.foreground, marginBottom: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%',
    backgroundColor: Colors.background,
    padding: 24,
    borderRadius: 16,
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
  },
});
