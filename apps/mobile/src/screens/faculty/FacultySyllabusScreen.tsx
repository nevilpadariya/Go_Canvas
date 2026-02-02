import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApi, putApi } from '@gocanvas/shared';
import { Colors } from '../../constants/Colors';
import { ArrowLeft, Save } from 'lucide-react-native';

type FacultySyllabusRouteProp = RouteProp<{
  FacultySyllabus: {
    courseId: number;
    courseName: string;
  };
}, 'FacultySyllabus'>;

interface Syllabus {
  Courseid: number;
  Coursesemester: string;
  Coursedescription: string;
}

export default function FacultySyllabusScreen() {
  const route = useRoute<FacultySyllabusRouteProp>();
  const navigation = useNavigation();
  const { courseId } = route.params;

  const [loading, setLoading] = useState(true);
  const [syllabusList, setSyllabusList] = useState<Syllabus[]>([]);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const fetchSyllabus = async () => {
    try {
      const data = await getApi<Syllabus[]>(`/faculty/view_content_by_courseid?courseid=${courseId}`);
      setSyllabusList(data);
    } catch (error) {
       console.error("Error fetching syllabus:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!description.trim()) {
        Alert.alert("Error", "Description cannot be empty");
        return;
    }

    setSaving(true);
    try {
        const newSyllabus = await putApi<Syllabus>("/faculty/update-syllabus/", {
            Courseid: courseId,
            Coursesemester: "SPRING24", // Hardcoded per web app logic
            Coursedescription: description
        });
        setSyllabusList([...syllabusList, newSyllabus]);
        setDescription("");
        Alert.alert("Success", "Syllabus updated!");
    } catch (error) {
        Alert.alert("Error", "Failed to update syllabus");
    } finally {
        setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Syllabus</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Add New Entry</Text>
            <TextInput 
                style={styles.input} 
                multiline 
                placeholder="Enter syllabus description..."
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="white" /> : (
                    <>
                        <Save size={20} color="white" />
                        <Text style={styles.saveButtonText}>Save Syllabus</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>Current Syllabus</Text>
        {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
        ) : syllabusList.length === 0 ? (
            <Text style={styles.emptyText}>No syllabus available.</Text>
        ) : (
            syllabusList.map((item, index) => (
                <View key={index} style={styles.syllabusItem}>
                    <Text style={styles.semesterBadge}>{item.Coursesemester}</Text>
                    <Text style={styles.syllabusText}>{item.Coursedescription}</Text>
                </View>
            ))
        )}
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
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.foreground },
  content: { padding: 20 },
  card: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    height: 100,
    backgroundColor: Colors.secondary,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: Colors.foreground },
  syllabusItem: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  semesterBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  syllabusText: { fontSize: 14, color: Colors.foreground, lineHeight: 20 },
  emptyText: { textAlign: 'center', color: Colors.mutedForeground, marginTop: 20 },
});
