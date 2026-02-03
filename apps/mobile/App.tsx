import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CourseDetailScreen from './src/screens/CourseDetailScreen';
import AssignmentDetailScreen from './src/screens/AssignmentDetailScreen';
import TakeQuizScreen from './src/screens/TakeQuizScreen';
import DiscussionsScreen from './src/screens/DiscussionsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import AdminUserListScreen from './src/screens/admin/AdminUserListScreen';
import AdminCourseAssignScreen from './src/screens/admin/AdminCourseAssignScreen';
import AdminStudentAssignScreen from './src/screens/admin/AdminStudentAssignScreen';
import AdminCreateCourseScreen from './src/screens/admin/AdminCreateCourseScreen';
import AdminAnalyticsScreen from './src/screens/admin/AdminAnalyticsScreen';
import FacultyDashboardScreen from './src/screens/faculty/FacultyDashboardScreen';
import FacultyCourseDetailScreen from './src/screens/faculty/FacultyCourseDetailScreen';
import FacultySyllabusScreen from './src/screens/faculty/FacultySyllabusScreen';
import FacultyStudentListScreen from './src/screens/faculty/FacultyStudentListScreen';
import FacultyAssignmentsScreen from './src/screens/faculty/FacultyAssignmentsScreen';
import FacultyGradesScreen from './src/screens/faculty/FacultyGradesScreen';
import { configureApi } from '@gocanvas/shared';
import { ActivityIndicator, View } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure Shared API
// Replace with your local IP if testing on real device
const API_URL = "https://squid-app-bgn4p.ondigitalocean.app"; 
configureApi({
  baseUrl: API_URL,
  getToken: () => AsyncStorage.getItem('token')
});

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { token, role, isLoading } = useAuth(); // Get role

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        role === 'Admin' ? (
             // ADMIN STACK
            <>
                <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
                <Stack.Screen name="AdminUserList" component={AdminUserListScreen} />
                <Stack.Screen name="AdminCourseAssign" component={AdminCourseAssignScreen} />
                <Stack.Screen name="AdminStudentAssign" component={AdminStudentAssignScreen} />
                <Stack.Screen name="AdminCreateCourse" component={AdminCreateCourseScreen} />
                <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
            </>
        ) : role === 'Faculty' ? (
             // FACULTY STACK
            <>
                <Stack.Screen name="FacultyDashboard" component={FacultyDashboardScreen} />
                <Stack.Screen name="FacultyCourseDetail" component={FacultyCourseDetailScreen} />
                <Stack.Screen name="FacultySyllabus" component={FacultySyllabusScreen} />
                <Stack.Screen name="FacultyStudentList" component={FacultyStudentListScreen} />
                <Stack.Screen name="FacultyAssignments" component={FacultyAssignmentsScreen} />
                <Stack.Screen name="FacultyGrades" component={FacultyGradesScreen} />
            </>
        ) : (
             // STUDENT STACK
            <>
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
                <Stack.Screen name="AssignmentDetail" component={AssignmentDetailScreen} />
                <Stack.Screen name="TakeQuiz" component={TakeQuizScreen} />
                <Stack.Screen name="Discussions" component={DiscussionsScreen} />
                <Stack.Screen name="Calendar" component={CalendarScreen} />
                <Stack.Screen name="Messages" component={MessagesScreen} />
            </>
        )
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
