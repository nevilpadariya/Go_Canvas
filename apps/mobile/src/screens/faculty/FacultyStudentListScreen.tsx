import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApi } from '@gocanvas/shared';
import { Colors } from '../../constants/Colors';
import { ArrowLeft, Mail, Phone, User } from 'lucide-react-native';

type FacultyStudentListRouteProp = RouteProp<{
  FacultyStudentList: {
    courseId: number;
    courseName: string;
  };
}, 'FacultyStudentList'>;

interface StudentRow {
  Studentid: string;
  Studentname: string;
  Studentemail: string;
  Studentcontactnumber: string;
  Coursegrade: string;
}

export default function FacultyStudentListScreen() {
  const route = useRoute<FacultyStudentListRouteProp>();
  const navigation = useNavigation();
  const { courseId } = route.params;

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentRow[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await getApi<StudentRow[]>(`/faculty/view_students?courseid=${courseId}`);
      setStudents(data);
    } catch (error) {
       console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStudentItem = ({ item }: { item: StudentRow }) => (
    <View style={styles.card}>
        <View style={styles.studentHeader}>
            <View style={styles.avatar}>
                <User size={20} color={Colors.primary} />
            </View>
            <View>
                <Text style={styles.studentName}>{item.Studentname}</Text>
                <Text style={styles.studentId}>ID: {item.Studentid}</Text>
            </View>
            <View style={styles.gradeContainer}>
                <Text style={styles.gradeLabel}>Grade</Text>
                <Text style={styles.gradeValue}>{item.Coursegrade || "-"}</Text>
            </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.actions}>
            <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => Linking.openURL(`mailto:${item.Studentemail}`)}
            >
                <Mail size={16} color={Colors.mutedForeground} />
                <Text style={styles.actionText}>{item.Studentemail}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => Linking.openURL(`tel:${item.Studentcontactnumber}`)}
            >
                <Phone size={16} color={Colors.mutedForeground} />
                <Text style={styles.actionText}>{item.Studentcontactnumber}</Text>
            </TouchableOpacity>
        </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enrolled Students</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
            data={students}
            keyExtractor={(item) => item.Studentid}
            renderItem={renderStudentItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <Text style={styles.emptyText}>No students enrolled yet.</Text>
            }
        />
      )}
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
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.foreground },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.indigo50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentName: { fontSize: 16, fontWeight: '600', color: Colors.foreground },
  studentId: { fontSize: 12, color: Colors.mutedForeground },
  gradeContainer: { marginLeft: 'auto', alignItems: 'flex-end' },
  gradeLabel: { fontSize: 10, color: Colors.mutedForeground, textTransform: 'uppercase' },
  gradeValue: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  actions: { flexDirection: 'column', gap: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionText: { fontSize: 12, color: Colors.mutedForeground },
  emptyText: { textAlign: 'center', color: Colors.mutedForeground, marginTop: 20 },
});
