import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { getApi, postApi } from '@gocanvas/shared';
import { getCurrentSemesterCode, getSemesterOptions } from '@gocanvas/shared';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface Faculty {
  Facultyid: number;
  Facultyname: string;
}

interface Course {
  Courseid: number;
  Coursename: string;
}

export default function AdminCourseAssignScreen() {
  const navigation = useNavigation();
  const semesterOptions = getSemesterOptions(new Date(), { includeSummer: false });
  
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>(getCurrentSemesterCode());

  const [loading, setLoading] = useState(false);

  // Modal States
  const [modalType, setModalType] = useState<'faculty' | 'course' | 'semester' | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [facultyData, courseData] = await Promise.all([
        getApi<Faculty[]>('/admin/view_faculties'),
        getApi<Course[]>('/admin/view_courses')
      ]);
      setFaculties(facultyData);
      setCourses(courseData);
    } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load form data");
    }
  };

  const handleAssign = async () => {
    if (!selectedCourse || !selectedFaculty || !selectedSemester) {
        Alert.alert("Missing Fields", "Please select Course, Faculty, and Semester");
        return;
    }

    setLoading(true);
    try {
        await postApi('/admin/assign_course', {
            Courseid: selectedCourse.Courseid,
            Facultyid: selectedFaculty.Facultyid,
            Coursesemester: selectedSemester
        });
        Alert.alert("Success", `Assigned ${selectedCourse.Coursename} to ${selectedFaculty.Facultyname}`);
        // Reset form
        setSelectedCourse(null);
        setSelectedFaculty(null);
        setSelectedSemester("");
    } catch (error: any) {
        if (error.response?.status === 409) {
            Alert.alert("Conflict", "This course is already assigned.");
        } else {
            Alert.alert("Error", "Failed to assign course.");
        }
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

    if (modalType === 'faculty') {
        data = faculties;
        title = "Select Faculty";
        onSelect = (item) => { setSelectedFaculty(item); setModalType(null); };
        renderItem = ({item}) => (
            <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                <Text style={styles.modalItemText}>{item.Facultyname}</Text>
                {selectedFaculty?.Facultyid === item.Facultyid && <Check size={20} color={Colors.primary} />}
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
    } else if (modalType === 'semester') {
        data = semesterOptions;
        title = "Select Semester";
        onSelect = (item) => { setSelectedSemester(item); setModalType(null); };
        renderItem = ({item}) => (
            <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                <Text style={styles.modalItemText}>{item}</Text>
                {selectedSemester === item && <Check size={20} color={Colors.primary} />}
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
                keyExtractor={(item, index) => modalType === 'semester' ? item : item.Facultyid ? item.Facultyid.toString() : item.Courseid.toString()}
                renderItem={({ item }) => {
                    if (modalType === 'faculty') {
                       return (
                        <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                            <Text style={styles.modalItemText}>{item.Facultyname}</Text>
                            {selectedFaculty?.Facultyid === item.Facultyid && <Check size={20} color={Colors.primary} />}
                        </TouchableOpacity>
                       ) 
                    } else if (modalType === 'course') {
                        return (
                        <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                            <Text style={styles.modalItemText}>{item.Coursename}</Text>
                            {selectedCourse?.Courseid === item.Courseid && <Check size={20} color={Colors.primary} />}
                        </TouchableOpacity>
                        )
                    } else {
                        return (
                        <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                            <Text style={styles.modalItemText}>{item}</Text>
                            {selectedSemester === item && <Check size={20} color={Colors.primary} />}
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
        <Text style={styles.headerTitle}>Assign Course</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Assign Faculty to Course</Text>
        <Text style={styles.subtitle}>Select a course, a faculty member, and the semester.</Text>

        <View style={styles.card}>
            {renderPicker("Semester", selectedSemester, "Select Semester", () => setModalType('semester'))}
            {renderPicker("Course", selectedCourse?.Coursename || "", "Select Course", () => setModalType('course'))}
            {renderPicker("Faculty", selectedFaculty?.Facultyname || "", "Select Faculty", () => setModalType('faculty'))}

            <TouchableOpacity 
                style={[styles.assignButton, loading && { opacity: 0.7 }]} 
                onPress={handleAssign}
                disabled={loading}
            >
                <Text style={styles.assignButtonText}>{loading ? "Assigning..." : "Assign Course"}</Text>
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
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.foreground, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.mutedForeground, marginBottom: 24 },
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
  pickerText: { fontSize: 16, color: Colors.foreground },
  placeholderText: { color: Colors.mutedForeground },
  
  assignButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
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
