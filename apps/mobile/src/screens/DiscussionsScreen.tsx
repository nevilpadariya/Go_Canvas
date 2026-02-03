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
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  MessageSquare,
  Pin,
  Lock,
  Send,
  Plus,
  ChevronRight,
  User,
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { getApi, postApi } from '@gocanvas/shared';

interface Discussion {
  Discussionid: number;
  Discussiontitle: string;
  Discussioncontent: string;
  Discussionpinned: boolean;
  Discussionlocked: boolean;
  Authorname: string;
  Authorrole: string;
  Replycount: number;
  Points: number | null;
  Createdat: string;
}

interface DiscussionReply {
  Replyid: number;
  Replycontent: string;
  Authorname: string;
  Authorrole: string;
  Createdat: string;
  Parentreplyid: number | null;
}

interface DiscussionDetail extends Discussion {
  replies: DiscussionReply[];
}

export default function DiscussionsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId, courseName } = route.params as { courseId: number; courseName: string };

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [courseId]);

  const fetchDiscussions = async () => {
    try {
      const data = await getApi<Discussion[]>(`/discussions/course/${courseId}`);
      // Sort: pinned first, then by date
      const sorted = data.sort((a, b) => {
        if (a.Discussionpinned !== b.Discussionpinned) {
          return a.Discussionpinned ? -1 : 1;
        }
        return new Date(b.Createdat).getTime() - new Date(a.Createdat).getTime();
      });
      setDiscussions(sorted);
    } catch (error: any) {
      console.error('Failed to fetch discussions', error);
      Alert.alert('Error', 'Failed to load discussions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDiscussionDetail = async (discussionId: number) => {
    setLoadingDetail(true);
    try {
      const data = await getApi<DiscussionDetail>(`/discussions/${discussionId}`);
      setSelectedDiscussion(data);
      setShowDetail(true);
    } catch (error: any) {
      console.error('Failed to fetch discussion detail', error);
      Alert.alert('Error', 'Failed to load discussion');
    } finally {
      setLoadingDetail(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDiscussions();
  }, []);

  const handleReply = async () => {
    if (!replyText.trim() || !selectedDiscussion) return;

    setSubmittingReply(true);
    try {
      await postApi(`/discussions/${selectedDiscussion.Discussionid}/replies`, {
        replycontent: replyText.trim(),
      });
      setReplyText('');
      // Refresh the discussion detail
      await fetchDiscussionDetail(selectedDiscussion.Discussionid);
      // Also refresh the list to update reply count
      fetchDiscussions();
    } catch (error: any) {
      console.error('Failed to post reply', error);
      Alert.alert('Error', error.message || 'Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const renderDiscussionItem = ({ item }: { item: Discussion }) => (
    <TouchableOpacity
      style={styles.discussionCard}
      onPress={() => fetchDiscussionDetail(item.Discussionid)}
      disabled={loadingDetail}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          {item.Discussionpinned && (
            <Pin size={14} color={Colors.orange500} style={styles.pinIcon} />
          )}
          <Text style={styles.discussionTitle} numberOfLines={2}>
            {item.Discussiontitle}
          </Text>
          {item.Discussionlocked && (
            <Lock size={14} color={Colors.mutedForeground} />
          )}
        </View>
        {item.Points && (
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{item.Points} pts</Text>
          </View>
        )}
      </View>

      <Text style={styles.discussionContent} numberOfLines={2}>
        {item.Discussioncontent}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.authorInfo}>
          <View style={styles.avatarSmall}>
            <User size={12} color={Colors.mutedForeground} />
          </View>
          <Text style={styles.authorText}>
            {item.Authorname} ({item.Authorrole})
          </Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.replyStat}>
            <MessageSquare size={14} color={Colors.mutedForeground} />
            <Text style={styles.replyCount}>{item.Replycount}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.Createdat)}</Text>
          <ChevronRight size={16} color={Colors.mutedForeground} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderReply = (reply: DiscussionReply, isNested: boolean = false) => (
    <View
      key={reply.Replyid}
      style={[styles.replyContainer, isNested && styles.nestedReply]}
    >
      <View style={styles.replyHeader}>
        <View style={styles.avatar}>
          <User size={16} color={Colors.mutedForeground} />
        </View>
        <View style={styles.replyAuthor}>
          <Text style={styles.replyAuthorName}>{reply.Authorname}</Text>
          <Text style={styles.replyAuthorRole}>{reply.Authorrole}</Text>
        </View>
        <Text style={styles.replyDate}>{formatDate(reply.Createdat)}</Text>
      </View>
      <Text style={styles.replyContent}>{reply.Replycontent}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Discussions</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {courseName}
          </Text>
        </View>
      </View>

      {/* Discussions List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={discussions}
          renderItem={renderDiscussionItem}
          keyExtractor={(item) => item.Discussionid.toString()}
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
              <MessageSquare size={48} color={Colors.mutedForeground} />
              <Text style={styles.emptyText}>No discussions yet</Text>
              <Text style={styles.emptySubtext}>
                Check back later for course discussions
              </Text>
            </View>
          }
        />
      )}

      {/* Discussion Detail Modal */}
      <Modal visible={showDetail} animationType="slide" onRequestClose={() => setShowDetail(false)}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowDetail(false)} style={styles.backIcon}>
              <ArrowLeft size={24} color={Colors.foreground} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {selectedDiscussion?.Discussiontitle}
              </Text>
            </View>
          </View>

          <KeyboardAvoidingView
            style={styles.flex1}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
          >
            <FlatList
              data={selectedDiscussion?.replies || []}
              keyExtractor={(item) => item.Replyid.toString()}
              contentContainerStyle={styles.detailContent}
              ListHeaderComponent={
                selectedDiscussion ? (
                  <View style={styles.originalPost}>
                    <View style={styles.postHeader}>
                      <View style={styles.avatar}>
                        <User size={20} color={Colors.mutedForeground} />
                      </View>
                      <View style={styles.postAuthorInfo}>
                        <Text style={styles.postAuthorName}>
                          {selectedDiscussion.Authorname}
                        </Text>
                        <Text style={styles.postDate}>
                          {formatDate(selectedDiscussion.Createdat)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.postContent}>
                      {selectedDiscussion.Discussioncontent}
                    </Text>
                    <View style={styles.repliesDivider}>
                      <Text style={styles.repliesLabel}>
                        {selectedDiscussion.replies?.length || 0} Replies
                      </Text>
                    </View>
                  </View>
                ) : null
              }
              renderItem={({ item }) => renderReply(item)}
              ListEmptyComponent={
                <View style={styles.noReplies}>
                  <Text style={styles.noRepliesText}>No replies yet. Be the first!</Text>
                </View>
              }
            />

            {/* Reply Input */}
            {selectedDiscussion && !selectedDiscussion.Discussionlocked && (
              <View style={styles.replyInputContainer}>
                <TextInput
                  style={styles.replyInput}
                  placeholder="Write a reply..."
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline
                  maxLength={2000}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!replyText.trim() || submittingReply) && styles.sendButtonDisabled,
                  ]}
                  onPress={handleReply}
                  disabled={!replyText.trim() || submittingReply}
                >
                  {submittingReply ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Send size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            )}

            {selectedDiscussion?.Discussionlocked && (
              <View style={styles.lockedBanner}>
                <Lock size={16} color={Colors.mutedForeground} />
                <Text style={styles.lockedText}>This discussion is locked</Text>
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
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
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  discussionCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinIcon: {
    marginRight: 4,
  },
  discussionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.foreground,
  },
  pointsBadge: {
    backgroundColor: Colors.indigo100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  pointsText: {
    fontSize: 12,
    color: Colors.indigo600,
    fontWeight: '500',
  },
  discussionContent: {
    fontSize: 14,
    color: Colors.mutedForeground,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyCount: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  dateText: {
    fontSize: 12,
    color: Colors.mutedForeground,
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
  // Detail Modal Styles
  detailContent: {
    padding: 16,
    paddingBottom: 100,
  },
  originalPost: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAuthorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  postAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.foreground,
  },
  postDate: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  postContent: {
    fontSize: 16,
    color: Colors.foreground,
    lineHeight: 24,
  },
  repliesDivider: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  repliesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.mutedForeground,
  },
  replyContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  nestedReply: {
    marginLeft: 20,
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyAuthor: {
    flex: 1,
    marginLeft: 12,
  },
  replyAuthorName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.foreground,
  },
  replyAuthorRole: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  replyDate: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  replyContent: {
    fontSize: 14,
    color: Colors.foreground,
    lineHeight: 20,
  },
  noReplies: {
    padding: 20,
    alignItems: 'center',
  },
  noRepliesText: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  replyInput: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: Colors.secondary,
    gap: 8,
  },
  lockedText: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
});
