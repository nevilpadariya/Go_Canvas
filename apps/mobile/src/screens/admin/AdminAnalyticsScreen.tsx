import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { getApi } from '@gocanvas/shared';
import { ArrowLeft, Users, BookOpen, FileText, CheckCircle } from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';

interface AnalyticsData {
  total_users: number;
  total_courses: number;
  total_students: number;
  total_faculty: number;
  submissions_last_7_days: number;
  submissions_last_30_days: number;
}

export default function AdminAnalyticsScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await getApi<AnalyticsData>('/admin/analytics');
      setData(response);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) => (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={24} color={color} />
      </View>
      <View>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
       <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Platform Analytics</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : data ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Overview</Text>
            <View style={styles.grid}>
              <StatCard title="Total Users" value={data.total_users} icon={Users} color={Colors.primary} />
              <StatCard title="Students" value={data.total_students} icon={CheckCircle} color={Colors.green600} />
              <StatCard title="Faculty" value={data.total_faculty} icon={BookOpen} color={Colors.orange500} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content Overview</Text>
            <View style={styles.grid}>
               <StatCard title="Total Courses" value={data.total_courses} icon={BookOpen} color={Colors.indigo500} />
               <StatCard title="Submissions (7d)" value={data.submissions_last_7_days} icon={FileText} color={Colors.blue500} />
               <StatCard title="Submissions (30d)" value={data.submissions_last_30_days} icon={FileText} color={Colors.purple500} />
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.centered}>
          <Text>Failed to load data</Text>
        </View>
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
  content: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: Colors.foreground },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 10,
    marginRight: 12,
  },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: Colors.foreground },
  cardTitle: { fontSize: 12, color: Colors.mutedForeground },
});
