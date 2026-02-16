import { FormEvent, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Mail, RefreshCw, Send, Users } from "lucide-react";

import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import { MainContentWrapper } from "@/components/MainContentWrapper";
import { getApi, postApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface Participant {
  Userid: number;
  Userrole: string;
  Username?: string | null;
  Isunread: boolean;
}

interface Conversation {
  Conversationid: number;
  Conversationsubject: string;
  Lastmessagedate?: string | null;
  Participants: Participant[];
  Unreadcount: number;
  Lastmessage?: string | null;
}

interface Message {
  Messageid: number;
  Messagecontent: string;
  Conversationid: number;
  Senderid: number;
  Senderrole: string;
  Sendername?: string | null;
  Createdat?: string | null;
}

interface InboxResponse {
  Totalconversations: number;
  Unreadconversations: number;
  Conversations: Conversation[];
}

interface ConversationDetail {
  Conversationid: number;
  Conversationsubject: string;
  Participants: Participant[];
  Messages: Message[];
}

function StudentInbox() {
  const [inbox, setInbox] = useState<InboxResponse | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null);
  const [messageText, setMessageText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload?.userid) setCurrentUserId(Number(payload.userid));
    } catch {
      // no-op
    }
  }, []);

  const fetchInbox = async () => {
    setLoadingInbox(true);
    setError("");

    try {
      const data = await getApi<InboxResponse>("/messages/inbox");
      setInbox(data);

      const firstId = data.Conversations?.[0]?.Conversationid ?? null;
      setSelectedConversationId((prev) => prev ?? firstId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load inbox");
      setInbox({ Totalconversations: 0, Unreadconversations: 0, Conversations: [] });
    } finally {
      setLoadingInbox(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchConversation = async (conversationId: number) => {
    setLoadingConversation(true);
    setError("");

    try {
      const data = await getApi<ConversationDetail>(`/messages/conversations/${conversationId}`);
      setConversationDetail(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conversation");
      setConversationDetail(null);
    } finally {
      setLoadingConversation(false);
    }
  };

  useEffect(() => {
    if (selectedConversationId) {
      fetchConversation(selectedConversationId);
    }
  }, [selectedConversationId]);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedConversationId || !messageText.trim()) return;

    setSendingMessage(true);
    setError("");

    try {
      await postApi(`/messages/conversations/${selectedConversationId}/messages`, {
        Messagecontent: messageText.trim(),
      });
      setMessageText("");
      await fetchConversation(selectedConversationId);
      await fetchInbox();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const conversationPreview = useMemo(() => {
    const conversations = inbox?.Conversations ?? [];
    return conversations.map((conversation) => {
      const participantNames = conversation.Participants
        .map((participant) => participant.Username)
        .filter(Boolean)
        .join(", ");
      return {
        ...conversation,
        participantNames: participantNames || "Unknown participants",
      };
    });
  }, [inbox]);

  return (
    <>
      <Helmet>
        <title>Inbox | Go-Canvas</title>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 sidebar-overlay hidden"
          onClick={() => document.body.classList.remove("sidebar-open")}
        ></div>

        <Header />
        <Sidebar />

        <MainContentWrapper className="pt-16 transition-all duration-200">
          <div className="container mx-auto p-6 md:p-8 max-w-7xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
                <p className="text-muted-foreground mt-1">Course conversations and direct messages</p>
              </div>

              <Button variant="outline" onClick={fetchInbox} disabled={loadingInbox}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">Conversations</CardTitle>
                    {inbox && inbox.Unreadconversations > 0 ? (
                      <Badge>{inbox.Unreadconversations} unread</Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loadingInbox ? (
                    <p className="text-sm text-muted-foreground">Loading conversations...</p>
                  ) : conversationPreview.length === 0 ? (
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>No conversations yet.</p>
                      <p>Conversations appear once faculty or classmates message you.</p>
                    </div>
                  ) : (
                    conversationPreview.map((conversation) => (
                      <button
                        type="button"
                        key={conversation.Conversationid}
                        onClick={() => setSelectedConversationId(conversation.Conversationid)}
                        className={`w-full text-left rounded-lg border p-3 transition-colors ${
                          selectedConversationId === conversation.Conversationid
                            ? "bg-accent border-primary/40"
                            : "hover:bg-accent/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium line-clamp-1">{conversation.Conversationsubject}</p>
                          {conversation.Unreadcount > 0 ? <Badge variant="destructive">New</Badge> : null}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Users className="h-3.5 w-3.5" />
                          <span className="line-clamp-1">{conversation.participantNames}</span>
                        </div>
                        {conversation.Lastmessage ? (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{conversation.Lastmessage}</p>
                        ) : null}
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {conversationDetail?.Conversationsubject || "Conversation"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!selectedConversationId ? (
                    <p className="text-sm text-muted-foreground">Select a conversation to read and reply.</p>
                  ) : loadingConversation ? (
                    <p className="text-sm text-muted-foreground">Loading messages...</p>
                  ) : !conversationDetail ? (
                    <p className="text-sm text-muted-foreground">Unable to load this conversation.</p>
                  ) : (
                    <>
                      <div className="max-h-[420px] overflow-auto rounded-md border p-3 space-y-3">
                        {conversationDetail.Messages.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No messages in this thread yet.</p>
                        ) : (
                          conversationDetail.Messages.map((message) => {
                            const isMine = currentUserId != null && message.Senderid === currentUserId;
                            return (
                              <div
                                key={message.Messageid}
                                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                                    isMine
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-foreground"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{message.Sendername || message.Senderrole}</span>
                                    {message.Createdat ? (
                                      <span>{new Date(message.Createdat).toLocaleString()}</span>
                                    ) : null}
                                  </div>
                                  <p className="text-sm whitespace-pre-wrap">{message.Messagecontent}</p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <form onSubmit={handleSend} className="space-y-2">
                        <Textarea
                          value={messageText}
                          onChange={(event) => setMessageText(event.target.value)}
                          placeholder="Write a message..."
                          rows={4}
                        />
                        <div className="flex justify-end">
                          <Button type="submit" disabled={sendingMessage || !messageText.trim()}>
                            <Send className="mr-2 h-4 w-4" />
                            {sendingMessage ? "Sending..." : "Send Message"}
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </>
  );
}

export default StudentInbox;
