import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal } from 'react-native';
import { getApi, putApi, delApi } from '@gocanvas/shared';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User as UserIcon, Check, Trash2, Ban, Power } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface User {
  Userid: number;
  Useremail: string;
  Userrole: string;
  Userfirstname: string;
  Userlastname: string;
  Createdat: string | null;
  Isactive: boolean;
}

export default function AdminUserListScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getApi<User[]>('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (newRole: string) => {
    if (!selectedUser) return;
    
    try {
      await putApi(`/admin/users/${selectedUser.Userid}/role`, { role: newRole });
      
      // Optimistic Update
      setUsers(users.map(u => u.Userid === selectedUser.Userid ? { ...u, Userrole: newRole } : u));
      Alert.alert("Success", "User role updated");
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating role:", error);
      Alert.alert("Error", "Failed to update user role");
    }
  };

  const handleToggleStatus = (user: User) => {
    const isActive = user.Isactive;
    const action = isActive ? "Deactivate" : "Activate";
    const endpoint = isActive ? "deactivate" : "activate";
    
    Alert.alert(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} ${user.Userfirstname}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: action, 
          style: isActive ? "destructive" : "default",
          onPress: async () => {
            try {
              await putApi(`/admin/users/${user.Userid}/${endpoint}`, {});
              setUsers(users.map(u => u.Userid === user.Userid ? { ...u, Isactive: !isActive } : u));
              Alert.alert("Success", `User ${action.toLowerCase()}d`);
            } catch (error) {
              console.error(`Error ${action.toLowerCase()}ing user:`, error);
              Alert.alert("Error", `Failed to ${action.toLowerCase()} user`);
            }
          }
        }
      ]
    );
  };

  const handleHardDelete = (user: User) => {
    Alert.alert(
        "Delete User Forever",
        `Are you sure you want to PERMANENTLY delete ${user.Userfirstname}? This action cannot be undone.`,
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete Forever",
                style: "destructive",
                onPress: async () => {
                    try {
                        await delApi(`/admin/users/${user.Userid}`);
                        setUsers(users.filter(u => u.Userid !== user.Userid));
                        Alert.alert("Success", "User deleted permanently");
                    } catch (error) {
                         console.error("Error deleting user:", error);
                         Alert.alert("Error", "Failed to delete user");
                    }
                }
            }
        ]
    );
  };


  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <UserIcon size={24} color={Colors.primary} style={styles.userIcon} />
        <View>
            <Text style={[styles.userName, !item.Isactive && styles.inactiveText]}>
              {item.Userfirstname} {item.Userlastname} 
              {!item.Isactive && " (Inactive)"}
            </Text>
            <Text style={styles.userEmail}>{item.Useremail}</Text>
            <Text style={styles.userRole}>
                Role: <Text style={{ fontWeight: 'bold', color: getRoleColor(item.Userrole) }}>{item.Userrole}</Text>
            </Text>
            {item.Createdat && (
               <Text style={styles.joinedDate}>Joined: {new Date(item.Createdat).toLocaleDateString()}</Text>
            )}
        </View>
      </View>
      {item.Userrole !== 'Admin' && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => openRoleModal(item)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Role</Text>
          </TouchableOpacity>
          {item.Isactive ? (
            <TouchableOpacity onPress={() => handleToggleStatus(item)} style={[styles.editButton, styles.deleteButton]}>
              <Ban size={16} color="red" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => handleToggleStatus(item)} style={[styles.editButton, { backgroundColor: '#DCFCE7' }]}>
               <Check size={16} color="#166534" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity onPress={() => handleHardDelete(item)} style={[styles.editButton, styles.deleteButton]}>
             <Trash2 size={16} color="red" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getRoleColor = (role: string) => {
    switch(role) {
        case 'Admin': return 'red';
        case 'Faculty': return Colors.primary;
        default: return Colors.mutedForeground;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
            data={users}
            keyExtractor={item => item.Userid.toString()}
            renderItem={renderUserItem}
            contentContainerStyle={styles.listContent}
        />
      )}

      {/* Role Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Role</Text>
                <Text style={styles.modalSubtitle}>For {selectedUser?.Userfirstname} {selectedUser?.Userlastname}</Text>
                
                {['Student', 'Faculty'].map((role) => (
                    <TouchableOpacity 
                        key={role} 
                        style={[styles.roleOption, selectedUser?.Userrole === role && styles.roleOptionSelected]}
                        onPress={() => handleRoleUpdate(role)}
                    >
                        <Text style={[styles.roleOptionText, selectedUser?.Userrole === role && styles.roleOptionTextSelected]}>{role}</Text>
                        {selectedUser?.Userrole === role && <Check size={20} color="white" />}
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.foreground },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userIcon: { marginRight: 12 },
  userName: { fontSize: 16, fontWeight: '600', color: Colors.foreground },
  userEmail: { fontSize: 12, color: Colors.mutedForeground },
  userRole: { fontSize: 12, marginTop: 2, color: Colors.foreground },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.indigo50,
    borderRadius: 6,
  },
  editButtonText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  
  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 16, padding: 24, paddingBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: Colors.mutedForeground, marginBottom: 24, textAlign: 'center' },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  roleOptionSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roleOptionText: { fontSize: 16, color: Colors.foreground },
  roleOptionTextSelected: { color: 'white', fontWeight: 'bold' },
  cancelButton: { marginTop: 8, padding: 12, alignItems: 'center' },
  cancelButtonText: { color: Colors.mutedForeground, fontSize: 16 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deleteButton: { backgroundColor: '#FEE2E2', marginLeft: 8 },
  inactiveText: { textDecorationLine: 'line-through', color: Colors.mutedForeground },
  joinedDate: { fontSize: 10, color: Colors.mutedForeground, marginTop: 2 }
});
