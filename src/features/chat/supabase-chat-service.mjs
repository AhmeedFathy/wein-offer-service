import { unreadCount } from "./chat-domain.mjs";

// Private bucket; object access is enforced by storage.objects RLS keyed off
// the object path's first folder segment (see 059_chat_attachments.sql).
const CHAT_ATTACHMENTS_BUCKET = "chat-attachments";
const LAST_MESSAGE_EMBED_LIMIT = 5;

function sanitizeFileName(name) {
  return String(name || "file").replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function attachmentUploadPath(conversationId, fileName) {
  const nonce = `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
  return `${conversationId}/${nonce}-${sanitizeFileName(fileName)}`;
}

function escapeIlikePattern(value) {
  // %, _, and \ are ILIKE wildcards/escape chars -- a literal search for e.g.
  // "50%" or "file_name" must not have those reinterpreted as pattern syntax.
  return String(value).replace(/[\\%_]/g, (char) => `\\${char}`);
}

function requireRows(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message || result.error}`);
  return result.data || [];
}

function requireRpc(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message || result.error}`);
  return result.data;
}

function profileFromRow(row) {
  return row
    ? {
        id: row.id,
        full_name: row.full_name,
        role: row.role,
        email: row.email ?? null,
      }
    : null;
}

function memberFromRow(row) {
  return {
    conversation_id: row.conversation_id,
    user_id: row.user_id,
    membership_role: row.membership_role,
    joined_at: row.joined_at,
    left_at: row.left_at,
    last_read_seq: Number(row.last_read_seq || 0),
    notification_level: row.notification_level,
    profile: profileFromRow(row.profile || row.profiles),
  };
}

function messageFromRow(row) {
  return {
    id: row.id,
    conversation_id: row.conversation_id,
    message_seq: Number(row.message_seq || 0),
    sender_id: row.sender_id,
    body: row.body,
    reply_to_id: row.reply_to_id,
    client_nonce: row.client_nonce,
    created_at: row.created_at,
    edited_at: row.edited_at,
    deleted_at: row.deleted_at,
    mentioned_user_ids: row.mentioned_user_ids || [],
    attachments: row.attachments || [],
    sender: profileFromRow(row.sender || row.profiles),
  };
}

function conversationFromRow(row, currentUserId) {
  const members = (row.members || row.wein_chat_members || []).map(memberFromRow);
  const lastMessageRows = row.last_message || row.wein_chat_messages || [];
  const lastVisibleMessage = Array.isArray(lastMessageRows)
    ? lastMessageRows.find((message) => message.deleted_at == null)
    : null;
  const lastMessage = lastVisibleMessage
    ? messageFromRow(lastVisibleMessage)
    : null;
  const conversation = {
    id: row.id,
    kind: row.kind,
    title: row.title,
    created_by: row.created_by,
    created_at: row.created_at,
    archived_at: row.archived_at,
    members,
    last_message: lastMessage,
    unread_count: 0,
  };
  conversation.unread_count = unreadCount(conversation, currentUserId);
  return conversation;
}

export function createSupabaseChatService({ supabase, currentUserId }) {
  if (!supabase) throw new Error("supabase client is required");
  if (!currentUserId) throw new Error("currentUserId is required");

  async function fetchConversation(conversationId) {
    const result = await supabase
      .from("wein_chat_conversations")
      .select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        )
      `)
      .eq("id", conversationId)
      .order("message_seq", { referencedTable: "wein_chat_messages", ascending: false })
      .limit(LAST_MESSAGE_EMBED_LIMIT, { referencedTable: "wein_chat_messages" })
      .single();
    if (result.error) throw new Error(`fetch conversation: ${result.error.message || result.error}`);
    return conversationFromRow(result.data, currentUserId);
  }

  return {
    async listProfiles() {
      const result = await supabase
        .from("profiles")
        .select("id, full_name, role, email")
        .order("full_name", { ascending: true });
      return requireRows(result, "list profiles").map(profileFromRow);
    },

    async listConversations() {
      const result = await supabase
        .from("wein_chat_conversations")
        .select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
            sender:profiles(id, full_name, role, email)
          )
        `)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .order("message_seq", { referencedTable: "wein_chat_messages", ascending: false })
        .limit(LAST_MESSAGE_EMBED_LIMIT, { referencedTable: "wein_chat_messages" });
      return requireRows(result, "list conversations").map((row) => conversationFromRow(row, currentUserId));
    },

    async listMessages(conversationId) {
      const result = await supabase
        .from("wein_chat_messages")
        .select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `)
        .eq("conversation_id", conversationId)
        .is("deleted_at", null)
        .order("message_seq", { ascending: true });
      return requireRows(result, "list messages").map(messageFromRow);
    },

    async searchMessages(query) {
      const trimmed = (query || "").trim();
      if (!trimmed) return [];
      const result = await supabase
        .from("wein_chat_messages")
        .select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `)
        .is("deleted_at", null)
        .ilike("body", `%${escapeIlikePattern(trimmed)}%`)
        .order("created_at", { ascending: false })
        .limit(50);
      // RLS (chat_messages_select_member) already scopes rows to conversations
      // the current user is an active member of -- no extra filtering needed.
      return requireRows(result, "search messages").map(messageFromRow);
    },

    async createGroup(title, memberIds = []) {
      const conversationId = requireRpc(
        await supabase.rpc("wein_chat_create_group", { p_title: title }),
        "create group",
      );
      for (const memberId of memberIds) {
        await this.addMember(conversationId, memberId);
      }
      return conversationId;
    },

    async getOrCreateDm(otherUserId) {
      return requireRpc(
        await supabase.rpc("wein_chat_get_or_create_dm", { p_other_user_id: otherUserId }),
        "get or create DM",
      );
    },

    async addMember(conversationId, userId) {
      requireRpc(
        await supabase.rpc("wein_chat_add_member", { p_conversation_id: conversationId, p_user_id: userId }),
        "add member",
      );
    },

    async removeMember(conversationId, userId) {
      requireRpc(
        await supabase.rpc("wein_chat_remove_member", { p_conversation_id: conversationId, p_user_id: userId }),
        "remove member",
      );
    },

    async renameConversation(conversationId, title) {
      const trimmed = (title || "").trim();
      if (!trimmed) throw new Error("Group title is required");
      const result = await supabase
        .from("wein_chat_conversations")
        .update({ title: trimmed })
        .eq("id", conversationId)
        .select("id, title");
      const rows = requireRows(result, "rename conversation");
      if (!rows.length) throw new Error("rename conversation affected zero rows");
    },

    async setConversationArchived(conversationId, archived) {
      const result = await supabase
        .from("wein_chat_conversations")
        .update({ archived_at: archived ? new Date().toISOString() : null })
        .eq("id", conversationId)
        .select("id, archived_at");
      const rows = requireRows(result, "set conversation archived");
      if (!rows.length) throw new Error("set conversation archived affected zero rows");
    },

    async setMembershipRole(conversationId, userId, role) {
      requireRpc(
        await supabase.rpc("wein_chat_set_membership_role", {
          p_conversation_id: conversationId,
          p_user_id: userId,
          p_role: role,
        }),
        "set membership role",
      );
    },

    async uploadAttachment(conversationId, file) {
      const path = attachmentUploadPath(conversationId, file.name);
      const result = await supabase.storage.from(CHAT_ATTACHMENTS_BUCKET).upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (result.error) throw new Error(`upload attachment: ${result.error.message || result.error}`);
      return {
        path,
        name: file.name || sanitizeFileName(file.name),
        mime: file.type || "application/octet-stream",
        size: file.size || 0,
      };
    },

    async getSignedAttachmentUrl(path, expiresInSeconds = 3600) {
      const result = await supabase.storage.from(CHAT_ATTACHMENTS_BUCKET).createSignedUrl(path, expiresInSeconds);
      if (result.error) throw new Error(`sign attachment url: ${result.error.message || result.error}`);
      const url = result.data?.signedUrl;
      if (!url) throw new Error("sign attachment url: no signed URL returned");
      return url;
    },

    async sendMessage({ conversationId, body, clientNonce, replyToId = null, mentionedUserIds = [], attachments = [] }) {
      const result = await supabase
        .from("wein_chat_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          body,
          client_nonce: clientNonce,
          reply_to_id: replyToId,
          // Set in the same INSERT so the AFTER INSERT notify trigger can see
          // it -- a second round trip would fire the trigger with no mentions.
          mentioned_user_ids: mentionedUserIds.length ? mentionedUserIds : null,
          attachments,
        })
        .select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `)
        .single();
      if (result.error) throw new Error(`send message: ${result.error.message || result.error}`);
      return messageFromRow(result.data);
    },

    async updateMessage(messageId, body, mentionedUserIds = []) {
      const result = await supabase
        .from("wein_chat_messages")
        .update({
          body,
          edited_at: new Date().toISOString(),
          mentioned_user_ids: mentionedUserIds.length ? mentionedUserIds : null,
        })
        .eq("id", messageId)
        .select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `)
        .single();
      if (result.error) throw new Error(`update message: ${result.error.message || result.error}`);
      return messageFromRow(result.data);
    },

    async deleteMessage(messageId) {
      const result = await supabase
        .from("wein_chat_messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", messageId)
        .select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `)
        .single();
      if (result.error) throw new Error(`delete message: ${result.error.message || result.error}`);
      return messageFromRow(result.data);
    },

    async markRead(conversationId, lastReadSeq) {
      const result = await supabase
        .from("wein_chat_members")
        .update({ last_read_seq: lastReadSeq })
        .eq("conversation_id", conversationId)
        .eq("user_id", currentUserId)
        .select("conversation_id, user_id, last_read_seq");
      const rows = requireRows(result, "mark read");
      if (!rows.length) throw new Error("mark read affected zero rows");
    },

    async setNotificationLevel(conversationId, level) {
      const result = await supabase
        .from("wein_chat_members")
        .update({ notification_level: level })
        .eq("conversation_id", conversationId)
        .eq("user_id", currentUserId)
        .select("conversation_id, user_id, notification_level");
      const rows = requireRows(result, "set notification level");
      if (!rows.length) throw new Error("set notification level affected zero rows");
    },

    subscribeToConversationEvents(onEvent) {
      if (typeof supabase.channel !== "function") return () => {};
      const channel = supabase
        .channel(`wein-chat:${currentUserId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "wein_chat_conversations" }, onEvent)
        .on("postgres_changes", { event: "*", schema: "public", table: "wein_chat_members" }, onEvent)
        .on("postgres_changes", { event: "*", schema: "public", table: "wein_chat_messages" }, onEvent)
        .subscribe();
      return () => {
        if (typeof supabase.removeChannel === "function") {
          supabase.removeChannel(channel);
        } else if (typeof channel.unsubscribe === "function") {
          channel.unsubscribe();
        }
      };
    },

    fetchConversation,
  };
}
