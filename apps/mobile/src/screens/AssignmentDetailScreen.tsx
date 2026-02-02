import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { ArrowLeft, Clock, FileText } from 'lucide-react-native';

type RootStackParamList = {
  AssignmentDetail: { 
    assignmentId: number; 
    assignmentName: string; 
    assignmentDescription: string;
    courseName?: string;
  };
};

type AssignmentDetailRouteProp = RouteProp<RootStackParamList, 'AssignmentDetail'>;

export default function AssignmentDetailScreen() {
  const route = useRoute<AssignmentDetailRouteProp>();
  const navigation = useNavigation();
  const { assignmentName, assignmentDescription, courseName } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{assignmentName}</Text>
            {courseName && <Text style={styles.headerSubtitle}>{courseName}</Text>}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
            <View style={styles.iconRow}>
                <FileText size={24} color={Colors.primary} />
                <Text style={styles.cardTitle}>Instructions</Text>
            </View>
            <Text style={styles.description}>{assignmentDescription}</Text>
        </View>

        <View style={styles.card}>
             <View style={styles.iconRow}>
                <Clock size={24} color={'#f97316'} />
                <Text style={styles.cardTitle}>Status</Text>
            </View>
            <Text style={styles.statusText}>
                Mobile submissions are currently read-only. Please visit the web portal to upload files.
            </Text>
        </View>
      </ScrollView>
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
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.foreground,
  },
  description: {
    fontSize: 16,
    color: Colors.foreground,
    lineHeight: 24,
  },
  statusText: {
    fontSize: 14,
    color: Colors.mutedForeground,
    fontStyle: 'italic',
  },
});
