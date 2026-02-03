import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Mail,
  MailOpen,
  Send,
  Plus,
  User,
  Users,
  Search,
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { getApi, postApi } from '@gocanvas/shared';

interface Conversation {
  Conversationid: number;
  Conversationsubject: string;
  Lastmessagedate: string;
  participants: {
    Username: string;
    Userrole: string;
    Isunread: boolean;
  }[];
  lastMessage?: string;
  unreadCount?: number;
}

interface Message {
  Messageid: number;
  Messagecontent: string;
  Sendername: string;
  Senderrole: string;
  Isread: boolean;
  Createdat: string;
}

interface ConversationDetail {
  Conversationid: number;
  Conversationsubject: string;
  participants: {
    Username: string;
    Userrole: string;
  }[];
  messages: Message[];
}

export default function MessagesScreen() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [showConversation, setShowConversation] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    try {
      const data = await getApi<Conversation[]>('/messages/inbox');
      setConversations(data);
    } catch (error: any) {
      console.error('Failed to fetch inbox', error);
      // Don't show alert - just show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchConversation = async (conversationId: number) => {
    setLoadingConversation(true);
    try {
      const data = await getApi<ConversationDetail>(
        `/messages/conversations/${conversationId}`
      );
      setSelectedConversation(data);
      setShowConversation(true);
    } catch (error: any) {
      console.error('Failed to fetch conversation', error);
      Alert.alert('Error', 'Failed to load conversation');
    } finally {
      setLoadingConversation(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInbox();
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      await postApi(
        `/messages/conversations/${selectedConversation.Conversationid}/messages`,
        { messagecontent: messageText.trim() }
      );
      setMessageText('');
      // Refresh the conversation
      await fetchConversation(selectedConversation.Conversationid);
      // Also refresh inbox to update last message
      fetchInbox();
    } catch (error: any) {
      console.error('Failed to send message', error);
      Alert.alert('Error', error.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getParticipantNames = (conversation: Conversation): string => {
    return conversation.participants
      .map((p) => p.Username)
      .filter(Boolean)
      .join(', ') || 'Unknown';
  };

  const hasUnread = (conversation: Conversation): boolean => {
    return conversation.participants.some((p) => p.Isunread);
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.Conversationsubject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getParticipantNames(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const unread = hasUnread(item);

    return (
      <TouchableOpacity
        style={[styles.conversationCard, unread && styles.unreadCard]}
        onPress={() => fetchConversation(item.Conversationid)}
        disabled={loadingConversation}
      >
        <View style={styles.conversationIcon}>
          {item.participants.length > 2 ? (
            <Users size={20} color={unread ? Colors.primary : Colors.mutedForeground} />
          ) : (
            <User size={20} color={unread ? Colors.primary : Colors.mutedForeground} />
          )}
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text
              style={[styles.participantNames, unread && styles.unreadText]}
              numberOfLines={1}
            >
              {getParticipantNames(item)}
            </Text>
            <Text style={styles.dateText}>{formatDate(item.Lastmessagedate)}</Text>
          </View>
          <Text
            style={[styles.subjectText, unread && styles.unreadText]}
            numberOfLines={1}
          >
            {item.Conversationsubject}
          </Text>
          {item.lastMessage && (
            <Text style={styles.previewText} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          )}
        </View>
        {unread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.Senderrole === 'Student'; // Adjust based on current user

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.messageContainerRight : styles.messageContainerLeft,
        ]}
      >
        {!isMe && (
          <View style={styles.messageAvatar}>
            <User size={16} color={Colors.mutedForeground} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.messageBubbleRight : styles.messageBubbleLeft,
          ]}
        >
          {!isMe && (
            <Text style={styles.messageSender}>{item.Sendername}</Text>
          )}
          <Text
            style={[
              styles.messageText,
              isMe && styles.messageTextRight,
            ]}
          >
            {item.Messagecontent}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMe && styles.messageTimeRight,
            ]}
          >
            {formatDate(item.Createdat)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={18} color={Colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Conversations List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.Conversationid.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Mail size={48} color={Colors.mutedForeground} />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? 'No conversations match your search'
                  : 'Your inbox is empty'}
              </Text>
            </View>
          }
        />
      )}

      {/* Conversation Detail Modal */}
      <Modal
        visible={showConversation}
        animationType="slide"
        onRequestClose={() => setShowConversation(false)}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setShowConversation(false)}
              style={styles.backIcon}
            >
              <ArrowLeft size={24} color={Colors.foreground} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {selectedConversation?.Conversationsubject}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {selectedConversation?.participants
                  .map((p) => p.Username)
                  .join(', ')}
              </Text>
            </View>
          </View>

          <KeyboardAvoidingView
            style={styles.flex1}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
          >
            <FlatList
              data={selectedConversation?.messages || []}
              renderItem={renderMessage}
              keyExtractor={(item) => item.Messageid.toString()}
              contentContainerStyle={styles.messagesContent}
              inverted={false}
              ListEmptyComponent={
                <View style={styles.emptyMessages}>
                  <Text style={styles.emptyMessagesText}>
                    Start the conversation!
                  </Text>
                </View>
              }
            />

            {/* Message Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type a message..."
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={2000}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!messageText.trim() || sendingMessage) && styles.sendButtonDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={!messageText.trim() || sendingMessage}
              >
                {sendingMessage ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Send size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backIcon: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.foreground,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.foreground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  unreadCard: {
    backgroundColor: Colors.indigo50,
    borderColor: Colors.indigo100,
  },
  conversationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantNames: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.foreground,
  },
  dateText: {
    fontSize: 12,
    color: Colors.mutedForeground,
    marginLeft: 8,
  },
  subjectText: {
    fontSize: 14,
    color: Colors.foreground,
    marginTop: 2,
  },
  unreadText: {
    fontWeight: '600',
  },
  previewText: {
    fontSize: 13,
    color: Colors.mutedForeground,
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.foreground,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginTop: 8,
  },
  // Messages styles
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyMessages: {
    alignItems: 'center',
    padding: 40,
  },
  emptyMessagesText: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageContainerLeft: {
    justifyContent: 'flex-start',
  },
  messageContainerRight: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleLeft: {
    backgroundColor: Colors.secondary,
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: Colors.foreground,
    lineHeight: 20,
  },
  messageTextRight: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: Colors.mutedForeground,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeRight: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
