import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Modal, FlatList } from 'react-native';
import { getApi, getCurrentSemesterCode, postApi } from '@gocanvas/shared';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react-native';

type FacultyGradesRouteProp = RouteProp<{
  FacultyGrades: {
    courseId: number;
    courseName: string;
  };
}, 'FacultyGrades'>;

interface Student {
  Studentid: number;
  Studentname: string;
}

const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

export default function FacultyGradesScreen() {
  const route = useRoute<FacultyGradesRouteProp>();
  const navigation = useNavigation();
  const { courseId } = route.params;
  
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [modalType, setModalType] = useState<'student' | 'grade' | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await getApi<Student[]>(`/faculty/view_students?courseid=${courseId}`);
      setStudents(data);
    } catch (error) {
       console.error("Error fetching students:", error);
    }
  };

  const handleAssignGrade = async () => {
    if (!selectedStudent || !selectedGrade) {
        Alert.alert("Error", "Select student and grade");
        return;
    }

    setLoading(true);
    try {
        await postApi("/faculty/assign_grades", {
            Studentid: selectedStudent.Studentid,
            Courseid: courseId,
            Semester: getCurrentSemesterCode(),
            Grade: selectedGrade
        });
        Alert.alert("Success", `Assigned ${selectedGrade} to ${selectedStudent.Studentname}`);
        setSelectedStudent(null);
        setSelectedGrade("");
    } catch (error) {
        Alert.alert("Error", "Failed to assign grade");
    } finally {
        setLoading(false);
    }
  };

  const renderModalContent = () => {
    const isStudent = modalType === 'student';
    
    return (
        <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{isStudent ? "Select Student" : "Select Grade"}</Text>
                <TouchableOpacity onPress={() => setModalType(null)}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
            </View>
            {isStudent ? (
              <FlatList
                data={students}
                keyExtractor={(item) => item.Studentid.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedStudent(item);
                      setModalType(null);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.Studentname}</Text>
                    {selectedStudent?.Studentid === item.Studentid && (
                      <Check size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            ) : (
              <FlatList
                data={GRADES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedGrade(item);
                      setModalType(null);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item}</Text>
                    {selectedGrade === item && <Check size={20} color={Colors.primary} />}
                  </TouchableOpacity>
                )}
              />
            )}
        </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Grades</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
            <Text style={styles.label}>Student</Text>
            <TouchableOpacity style={styles.picker} onPress={() => setModalType('student')}>
                <Text style={selectedStudent ? styles.pickerValue : styles.pickerPlaceholder}>
                    {selectedStudent?.Studentname || "Select Student"}
                </Text>
                <ChevronDown size={20} color={Colors.mutedForeground} />
            </TouchableOpacity>

            <Text style={styles.label}>Grade</Text>
            <TouchableOpacity style={styles.picker} onPress={() => setModalType('grade')}>
                <Text style={selectedGrade ? styles.pickerValue : styles.pickerPlaceholder}>
                    {selectedGrade || "Select Grade"}
                </Text>
                <ChevronDown size={20} color={Colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.saveButton, loading && { opacity: 0.7 }]} 
                onPress={handleAssignGrade}
                disabled={loading}
            >
                <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Save Grade"}</Text>
            </TouchableOpacity>
        </View>
      </View>

       <Modal visible={!!modalType} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                {!!modalType && renderModalContent()}
            </View>
       </Modal>
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
  content: { padding: 20 },
  card: {
    backgroundColor: Colors.background,
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: Colors.foreground },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    backgroundColor: Colors.secondary,
  },
  pickerValue: { fontSize: 16, color: Colors.foreground },
  pickerPlaceholder: { fontSize: 16, color: Colors.mutedForeground },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

   // Modal
   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
   modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%', paddingBottom: 20 },
   modalHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     padding: 16,
     borderBottomWidth: 1,
     borderBottomColor: Colors.border,
   },
   modalTitle: { fontSize: 18, fontWeight: 'bold' },
   closeText: { color: Colors.primary, fontSize: 16 },
   modalItem: {
     padding: 16,
     borderBottomWidth: 1,
     borderBottomColor: Colors.gray100,
     flexDirection: 'row',
     justifyContent: 'space-between',
   },
   modalItemText: { fontSize: 16, color: Colors.foreground },
});
