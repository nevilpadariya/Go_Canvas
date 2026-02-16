import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Modal, FlatList, TextInput } from 'react-native';
import { getApi, getCurrentSemesterCode, postApi } from '@gocanvas/shared';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, Check, UserPlus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface User {
  Userid: number;
  Userfirstname: string;
  Userlastname: string;
  Userrole: string;
}

interface Course {
  Courseid: number;
  Coursename: string;
}

export default function AdminStudentAssignScreen() {
  const navigation = useNavigation();
  
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [semester, setSemester] = useState(getCurrentSemesterCode());

  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState<'student' | 'course' | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userData, courseData] = await Promise.all([
        getApi<User[]>('/admin/users'),
        getApi<Course[]>('/admin/view_courses')
      ]);
      setStudents(userData.filter(u => u.Userrole === 'Student'));
      setCourses(courseData);
    } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load form data");
    }
  };

  const handleEnroll = async () => {
    if (!selectedCourse || !selectedStudent || !semester) {
        Alert.alert("Missing Fields", "Please select Student, Course, and Semester");
        return;
    }

    setLoading(true);
    try {
        await postApi('/admin/assign_course_student', {
            student_id: selectedStudent.Userid,
            course_id: selectedCourse.Courseid,
            semester: semester
        });
        Alert.alert("Success", `Enrolled ${selectedStudent.Userfirstname} in ${selectedCourse.Coursename}`);
        // Reset parts of form
        setSelectedStudent(null);
    } catch (error: any) {
        const msg = error.response?.data?.detail || "Failed to enroll student.";
        Alert.alert("Error", msg);
    } finally {
        setLoading(false);
    }
  };

  const renderPicker = (label: string, value: string, placeholder: string, onPress: () => void) => (
       <View style={styles.inputGroup}>
           <Text style={styles.label}>{label}</Text>
           <TouchableOpacity style={styles.pickerButton} onPress={onPress}>
               <Text style={[styles.pickerText, !value && styles.placeholderText]}>
                   {value || placeholder}
               </Text>
               <ChevronDown size={20} color={Colors.mutedForeground} />
           </TouchableOpacity>
       </View>
     );
   
     const renderModalContent = () => {
       let data : any[] = [];
       let title = "";
       let onSelect: (item: any) => void = () => {};
       let renderItem: (item: any) => React.ReactNode = () => null;
   
       if (modalType === 'student') {
           data = students;
           title = "Select Student";
           onSelect = (item) => { setSelectedStudent(item); setModalType(null); };
           renderItem = ({item}) => (
               <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                   <Text style={styles.modalItemText}>{item.Userfirstname} {item.Userlastname} ({item.Userid})</Text>
                   {selectedStudent?.Userid === item.Userid && <Check size={20} color={Colors.primary} />}
               </TouchableOpacity>
           );
       } else if (modalType === 'course') {
           data = courses;
           title = "Select Course";
           onSelect = (item) => { setSelectedCourse(item); setModalType(null); };
           renderItem = ({item}) => (
               <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                   <Text style={styles.modalItemText}>{item.Coursename}</Text>
                   {selectedCourse?.Courseid === item.Courseid && <Check size={20} color={Colors.primary} />}
               </TouchableOpacity>
           );
       }
   
       return (
        <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                <TouchableOpacity onPress={() => setModalType(null)}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={data}
                keyExtractor={(item) => item.Userid ? item.Userid.toString() : item.Courseid.toString()}
                renderItem={({ item }) => {
                    if (modalType === 'student') {
                        return (
                        <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                            <Text style={styles.modalItemText}>{item.Userfirstname} {item.Userlastname} ({item.Userid})</Text>
                            {selectedStudent?.Userid === item.Userid && <Check size={20} color={Colors.primary} />}
                        </TouchableOpacity>
                        )
                    } else {
                        return (
                        <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                            <Text style={styles.modalItemText}>{item.Coursename}</Text>
                            {selectedCourse?.Courseid === item.Courseid && <Check size={20} color={Colors.primary} />}
                        </TouchableOpacity>
                        )
                    }
                }}
            />
        </View>
    );
     };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Enrollment</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
            {renderPicker("Student", selectedStudent ? `${selectedStudent.Userfirstname} ${selectedStudent.Userlastname}` : "", "Select Student", () => setModalType('student'))}
            {renderPicker("Course", selectedCourse?.Coursename || "", "Select Course", () => setModalType('course'))}
            
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Semester</Text>
                <TextInput 
                    style={styles.input} 
                    value={semester} 
                    onChangeText={setSemester} 
                    placeholder="e.g. SPRING24"
                />
            </View>

            <TouchableOpacity 
                style={[styles.assignButton, loading && { opacity: 0.7 }]} 
                onPress={handleEnroll}
                disabled={loading}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <UserPlus size={20} color="white" />
                    <Text style={styles.assignButtonText}>{loading ? "Enrolling..." : "Enroll Student"}</Text>
                </View>
            </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={!!modalType} onRequestClose={() => setModalType(null)}>
         <View style={styles.modalOverlay}>
             {renderModalContent()}
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
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.foreground, marginBottom: 8 },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 14,
    backgroundColor: Colors.secondary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 14,
    backgroundColor: Colors.secondary,
    fontSize: 16,
    color: Colors.foreground,
  },
  pickerText: { fontSize: 16, color: Colors.foreground },
  placeholderText: { color: Colors.mutedForeground },
  
  assignButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  assignButtonText: { color: Colors.background, fontSize: 16, fontWeight: 'bold' },

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
