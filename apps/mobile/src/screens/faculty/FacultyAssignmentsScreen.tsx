import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, ScrollView, Switch } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApi, postApi } from '@gocanvas/shared';
import { Colors } from '../../constants/Colors';
import { ArrowLeft, Check, Plus, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type FacultyAssignmentsRouteProp = RouteProp<{
  FacultyAssignments: {
    courseId: number;
    courseName: string;
  };
}, 'FacultyAssignments'>;

interface Assignment {
  Assignmentid: number;
  Assignmentname: string;
  Assignmentdescription: string;
  Duedate?: string;
  Points?: number;
}

export default function FacultyAssignmentsScreen() {
  const route = useRoute<FacultyAssignmentsRouteProp>();
  const navigation = useNavigation();
  const { courseId } = route.params;

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("100");
  const [dueDate, setDueDate] = useState(new Date());
  
  // Logic to show/hide date picker
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await getApi<Assignment[]>(`/faculty/view_assignment_by_courseid?courseid=${courseId}`);
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name || !description) {
        Alert.alert("Error", "Name and Description are required");
        return;
    }

    try {
        await postApi("/faculty/add_assignment", {
            Courseid: courseId,
            Assignmentname: name,
            Assignmentdescription: description,
            Semester: "SPRING24",
            Duedate: dueDate.toISOString(),
            Points: parseInt(points) || 100,
            Submissiontype: "text_and_file"
        });
        
        Alert.alert("Success", "Assignment created!");
        setModalVisible(false);
        resetForm();
        fetchAssignments();
    } catch (error) {
        console.error("Error creating assignment:", error);
        Alert.alert("Error", "Failed to create assignment");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPoints("100");
    setDueDate(new Date());
  };

  const renderItem = ({ item }: { item: Assignment }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.Assignmentname}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.Assignmentdescription}</Text>
        <View style={styles.cardFooter}>
            <Text style={styles.points}>{item.Points} pts</Text>
            {item.Duedate && <Text style={styles.date}>Due: {new Date(item.Duedate).toLocaleDateString()}</Text>}
        </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assignments</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Plus size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={assignments}
        keyExtractor={(item, index) => item.Assignmentid?.toString() || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No assignments created yet.</Text>}
      />

      {/* CREATE MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>New Assignment</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <X size={24} color={Colors.mutedForeground} />
                    </TouchableOpacity>
                </View>
                
                <ScrollView contentContainerStyle={styles.formContent}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Assignment Name" />

                    <Text style={styles.label}>Description</Text>
                    <TextInput 
                        style={[styles.input, styles.textArea]} 
                        value={description} 
                        onChangeText={setDescription} 
                        multiline 
                        placeholder="Description"
                        textAlignVertical="top"
                    />

                    <Text style={styles.label}>Points</Text>
                    <TextInput 
                        style={styles.input} 
                        value={points} 
                        onChangeText={setPoints} 
                        keyboardType="numeric" 
                        placeholder="100"
                    />

                    <Text style={styles.label}>Due Date</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                        <Text>{dueDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    
                    {showDatePicker && (
                        <DateTimePicker
                            value={dueDate}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) setDueDate(selectedDate);
                            }}
                        />
                    )}

                    <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                        <Text style={styles.createButtonText}>Create Assignment</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
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
  addButton: { marginLeft: 'auto' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.foreground },
  listContent: { padding: 16 },
  card: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: Colors.mutedForeground, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  points: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  date: { fontSize: 12, color: Colors.mutedForeground },
  
  emptyText: { textAlign: 'center', marginTop: 24, color: Colors.mutedForeground },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  formContent: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: Colors.foreground },
  input: {
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  textArea: { height: 100 },
  dateButton: {
    backgroundColor: Colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  createButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
