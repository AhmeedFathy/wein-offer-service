function ensureOk(error) {
  if (error) throw error;
}

export function createSupabaseDiscussionService({ supabase, currentUserId }) {
  if (!supabase) throw new Error("Supabase client is required");
  if (!currentUserId) throw new Error("currentUserId is required");

  async function listComments({ taskId, providerId, offerId } = {}) {
    let query = supabase
      .from("wein_comments")
      .select("*")
      .order("created_at", { ascending: true });
    if (taskId) query = query.eq("task_id", taskId);
    if (providerId) query = query.eq("provider_id", providerId);
    if (offerId) query = query.eq("offer_id", offerId);
    const { data, error } = await query;
    ensureOk(error);
    return data || [];
  }

  async function postComment({ body, taskId = null, providerId = null, offerId = null, replyToId = null }) {
    // wein_comments' one-target CHECK constraint requires exactly one of
    // negotiation_id/lead_id/task_id/campaign_id/provider_id/offer_id to be
    // non-null -- and PostgREST rejects an insert that names any column
    // outside its schema cache, even with a null value. So only the one
    // target key that's actually set gets included in the payload, never
    // all three as null placeholders (that was a real bug: it broke every
    // postComment call, including the task-only path, until fixed).
    const targetField = taskId
      ? { task_id: taskId }
      : providerId
        ? { provider_id: providerId }
        : offerId
          ? { offer_id: offerId }
          : null;
    if (!targetField) throw new Error("postComment requires taskId, providerId, or offerId");
    const { data, error } = await supabase
      .from("wein_comments")
      .insert({
        ...targetField,
        reply_to_id: replyToId,
        body,
        author_role: "team",
      })
      .select("*")
      .single();
    ensureOk(error);
    return data;
  }

  async function resolveComment(commentId, note = "") {
    const { data, error } = await supabase
      .from("wein_comments")
      .update({ resolved_at: new Date().toISOString(), resolved_note: note })
      .eq("id", commentId)
      .select("*");
    ensureOk(error);
    if (!data?.length) throw new Error("Resolve affected zero comments");
    return data[0];
  }

  async function reopenComment(commentId) {
    const { data, error } = await supabase
      .from("wein_comments")
      .update({ resolved_at: null, resolved_note: null })
      .eq("id", commentId)
      .select("*");
    ensureOk(error);
    if (!data?.length) throw new Error("Reopen affected zero comments");
    return data[0];
  }

  async function addMention(commentId, mentionedUserId) {
    const { data, error } = await supabase
      .from("wein_comment_mentions")
      .insert({ comment_id: commentId, mentioned_user_id: mentionedUserId })
      .select("*");
    ensureOk(error);
    return data?.[0] || null;
  }

  async function createTaskFromComment(commentId, title, assignedToUserId = null, dueDate = null) {
    const { data, error } = await supabase.rpc("wein_create_task_from_comment", {
      p_comment_id: commentId,
      p_title: title,
      p_assigned_to_user_id: assignedToUserId,
      p_due_date: dueDate,
    });
    ensureOk(error);
    return data;
  }

  function subscribeToDiscussionEvents(onEvent) {
    if (!supabase.channel) return () => {};
    const channel = supabase
      .channel(`record-discussion:${currentUserId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "wein_comments" }, onEvent)
      .on("postgres_changes", { event: "*", schema: "public", table: "wein_comment_mentions" }, onEvent)
      .on("postgres_changes", { event: "*", schema: "public", table: "wein_comment_task_links" }, onEvent)
      .subscribe();
    return () => {
      if (supabase.removeChannel) return supabase.removeChannel(channel);
      if (channel?.unsubscribe) return channel.unsubscribe();
      return undefined;
    };
  }

  return {
    listComments,
    postComment,
    resolveComment,
    reopenComment,
    addMention,
    createTaskFromComment,
    subscribeToDiscussionEvents,
  };
}
