import { buildWorkInbox } from "./work-inbox-domain.mjs";

function ensureOk(error) {
  if (error) throw error;
}

export function createSupabaseWorkInboxService({ supabase, currentUserId }) {
  if (!supabase) throw new Error("Supabase client is required");
  if (!currentUserId) throw new Error("currentUserId is required");

  async function fetchOpenTasks() {
    let query = supabase
      .from("wein_tasks")
      .select("*")
      .neq("status", "done")
      .order("due_date", { ascending: true, nullsFirst: false });
    if (currentUserId) query = query.eq("assigned_to_user_id", currentUserId);
    const { data, error } = await query;
    ensureOk(error);
    return data || [];
  }

  async function fetchUnresolvedMentions() {
    const { data, error } = await supabase
      .from("wein_comment_mentions")
      .select("comment_id,mentioned_user_id,created_at,wein_comments(*)")
      .eq("mentioned_user_id", currentUserId)
      .is("wein_comments.resolved_at", null)
      .order("created_at", { ascending: true });
    ensureOk(error);
    return data || [];
  }

  async function loadInbox() {
    const [tasks, mentionRows] = await Promise.all([fetchOpenTasks(), fetchUnresolvedMentions()]);
    const commentsById = {};
    const mentions = mentionRows.map((row) => {
      const comment = row.wein_comments || row.comment || null;
      if (comment?.id) commentsById[comment.id] = comment;
      return {
        comment_id: row.comment_id,
        mentioned_user_id: row.mentioned_user_id,
        created_at: row.created_at,
      };
    });
    return buildWorkInbox({ tasks, mentions, commentsById }, { currentUserId });
  }

  function subscribeToInboxEvents(onEvent) {
    if (!supabase.channel) return () => {};
    const channel = supabase
      .channel(`work-inbox:${currentUserId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "wein_tasks" }, onEvent)
      .on("postgres_changes", { event: "*", schema: "public", table: "wein_comments" }, onEvent)
      .on("postgres_changes", { event: "*", schema: "public", table: "wein_comment_mentions" }, onEvent)
      .subscribe();
    return () => {
      if (supabase.removeChannel) return supabase.removeChannel(channel);
      if (channel?.unsubscribe) return channel.unsubscribe();
      return undefined;
    };
  }

  return { fetchOpenTasks, fetchUnresolvedMentions, loadInbox, subscribeToInboxEvents };
}
