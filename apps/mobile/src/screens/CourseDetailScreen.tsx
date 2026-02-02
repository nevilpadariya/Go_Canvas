import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getApi } from '@gocanvas/shared';
import { Colors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Megaphone, FileText, Brain, ChevronRight, ArrowLeft } from 'lucide-react-native';

// Interfaces matching Web App
interface Announcement {
  Courseid: number;
  Coursename: string;
  Announcementid: number;
  Announcementname: string;
  Announcementdescription: string;
}

interface Assignment {
  Courseid: number;
  Coursename: string;
  Assignmentid: number;
  Assignmentname: string;
  Assignmentdescription: string;
}

interface Quiz {
  Courseid: number;
  Coursename: string;
  Quizid: number;
  Quizname: string;
  Quizdescription: string;
}

// Navigation Prop Types
type RootStackParamList = {
  Dashboard: undefined;
  CourseDetail: { courseId: number; courseName: string; courseDescription: string; courseSemester: string };
  AssignmentDetail: { 
    assignmentId: number; 
    assignmentName: string; 
    assignmentDescription: string;
    courseName?: string;
  };
};

type CourseDetailRouteProp = RouteProp<RootStackParamList, 'CourseDetail'>;
type CourseDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CourseDetailScreen() {
  const route = useRoute<CourseDetailRouteProp>();
  const navigation = useNavigation<CourseDetailNavigationProp>();
  const { courseId, courseName, courseDescription, courseSemester } = route.params;

  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    fetchAllData();
  }, [courseId]);

  const getCurrentSemester = () => {
    const date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear().toString().slice(-2);
    
    if (month <= 4) return `Spring${year}`;
    if (month <= 6) return `Summer${year}`;
    return `Fall${year}`;
  };

  const fetchAllData = async () => {
    try {
      const semester = getCurrentSemester().toUpperCase();
      
      // Parallel fetching for speed
      const [annData, assignData, quizData] = await Promise.all([
        getApi<Announcement[]>(`/student/view_announcements_published?current_semester=${semester}`),
        getApi<Assignment[]>(`/student/view_assignment_published?current_semester=${semester}`),
        getApi<Quiz[]>(`/student/view_quizzes_published?current_semester=${semester}`)
      ]);

      setAnnouncements(annData.filter(item => item.Courseid == courseId));
      setAssignments(assignData.filter(item => item.Courseid == courseId));
      setQuizzes(quizData.filter(item => item.Courseid == courseId));

    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderEmptyState = (text: string) => (
    <Text style={styles.emptyText}>{text}</Text>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{courseName}</Text>
            <Text style={styles.headerSubtitle}>{courseSemester}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Course Description Card */}
        <View style={styles.card}>
            <Text style={styles.cardTitle}>About this Course</Text>
            <Text style={styles.cardBody}>{courseDescription}</Text>
        </View>

        {/* Announcements */}
        <View style={styles.section}>
            {renderSectionHeader("Announcements", <Megaphone size={20} color={Colors.primary} />)}
            {announcements.length === 0 ? renderEmptyState("No announcements") : (
                announcements.map(ann => (
                    <View key={ann.Announcementid} style={styles.itemCard}>
                        <Text style={styles.itemTitle}>{ann.Announcementname}</Text>
                        <Text style={styles.itemDesc}>{ann.Announcementdescription}</Text>
                    </View>
                ))
            )}
        </View>

        {/* Assignments */}
        <View style={styles.section}>
            {renderSectionHeader("Assignments", <FileText size={20} color={Colors.primary} />)}
            {assignments.length === 0 ? renderEmptyState("No assignments") : (
                assignments.map(assign => (
                    <TouchableOpacity 
                        key={assign.Assignmentid} 
                        style={styles.itemCardInteractive}
                        onPress={() => navigation.navigate('AssignmentDetail', {
                            assignmentId: assign.Assignmentid,
                            assignmentName: assign.Assignmentname,
                            assignmentDescription: assign.Assignmentdescription,
                            courseName: courseName
                        })}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemTitle}>{assign.Assignmentname}</Text>
                            <Text style={styles.itemDesc} numberOfLines={2}>{assign.Assignmentdescription}</Text>
                        </View>
                         <ChevronRight size={20} color={Colors.mutedForeground} />
                    </TouchableOpacity>
                ))
            )}
        </View>

        {/* Quizzes */}
        <View style={styles.section}>
            {renderSectionHeader("Quizzes", <Brain size={20} color={Colors.primary} />)}
            {quizzes.length === 0 ? renderEmptyState("No quizzes") : (
                quizzes.map(quiz => (
                    <TouchableOpacity key={quiz.Quizid} style={styles.itemCardInteractive}>
                         <View style={{ flex: 1 }}>
                            <Text style={styles.itemTitle}>{quiz.Quizname}</Text>
                            <Text style={styles.itemDesc} numberOfLines={2}>{quiz.Quizdescription}</Text>
                        </View>
                        <ChevronRight size={20} color={Colors.mutedForeground} />
                    </TouchableOpacity>
                ))
            )}
        </View>
        
        <View style={{ height: 40 }} /> 
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.foreground,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.foreground,
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    color: Colors.mutedForeground,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.foreground,
  },
  emptyText: {
    fontStyle: 'italic',
    color: Colors.mutedForeground,
    marginLeft: 4,
  },
  itemCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.indigo100,
  },
  itemCardInteractive: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.foreground,
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 13,
    color: Colors.mutedForeground,
  },
});
