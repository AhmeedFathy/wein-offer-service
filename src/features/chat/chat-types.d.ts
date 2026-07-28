export type ChatConversationKind = "dm" | "group";
export type ChatMembershipRole = "owner" | "member";
export type ChatNotificationLevel = "all" | "mentions" | "muted";

export interface ChatProfile {
  id: string;
  full_name: string;
  role: "admin" | "manager" | "deal_breaker" | "team";
  email?: string | null;
}

export interface ChatConversation {
  id: string;
  kind: ChatConversationKind;
  title: string | null;
  created_by: string;
  created_at: string;
  archived_at?: string | null;
  members: ChatMember[];
  last_message?: ChatMessage | null;
  unread_count: number;
}

export interface ChatMember {
  conversation_id: string;
  user_id: string;
  membership_role: ChatMembershipRole;
  joined_at: string;
  left_at?: string | null;
  last_read_seq: number;
  notification_level: ChatNotificationLevel;
  profile?: ChatProfile;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  message_seq: number;
  sender_id: string;
  body: string;
  reply_to_id?: string | null;
  client_nonce: string;
  created_at: string;
  edited_at?: string | null;
  deleted_at?: string | null;
  mentioned_user_ids?: string[];
  attachments?: ChatAttachment[];
  sender?: ChatProfile;
}

export interface ChatAttachment {
  path: string;
  name: string;
  mime: string;
  size: number;
}

export interface ChatService {
  listProfiles(): Promise<ChatProfile[]>;
  listConversations(): Promise<ChatConversation[]>;
  listMessages(conversationId: string): Promise<ChatMessage[]>;
  createGroup(title: string, memberIds: string[]): Promise<string>;
  getOrCreateDm(otherUserId: string): Promise<string>;
  addMember(conversationId: string, userId: string): Promise<void>;
  removeMember(conversationId: string, userId: string): Promise<void>;
  renameConversation(conversationId: string, title: string): Promise<void>;
  setConversationArchived(conversationId: string, archived: boolean): Promise<void>;
  setMembershipRole(conversationId: string, userId: string, role: ChatMembershipRole): Promise<void>;
  uploadAttachment(conversationId: string, file: File): Promise<ChatAttachment>;
  getSignedAttachmentUrl(path: string, expiresInSeconds?: number): Promise<string>;
  sendMessage(input: {
    conversationId: string;
    body: string;
    clientNonce: string;
    replyToId?: string | null;
    mentionedUserIds?: string[];
    attachments?: ChatAttachment[];
  }): Promise<ChatMessage>;
  updateMessage(messageId: string, body: string, mentionedUserIds?: string[]): Promise<ChatMessage>;
  deleteMessage(messageId: string): Promise<ChatMessage>;
  markRead(conversationId: string, lastReadSeq: number): Promise<void>;
  setNotificationLevel(conversationId: string, level: ChatNotificationLevel): Promise<void>;
  subscribeToConversationEvents?(onEvent: () => void): () => void;
}

export interface ChatPortalContext {
  currentUser: ChatProfile;
  service: ChatService;
  initialConversationId?: string | null;
  now?(): Date;
}

export interface ViewModule {
  id: string;
  mount(root: HTMLElement, context: ChatPortalContext): void | (() => void);
}
