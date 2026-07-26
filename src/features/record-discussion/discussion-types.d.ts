export type DiscussionComment = {
  id: string;
  task_id?: string | null;
  provider_id?: string | null;
  offer_id?: string | null;
  author_id?: string | null;
  author_name?: string | null;
  author_role?: string | null;
  reply_to_id?: string | null;
  body: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
  resolved_note?: string | null;
  created_at: string;
  replies?: DiscussionComment[];
};

export type DiscussionPerson = {
  id: string;
  full_name: string;
  role?: string | null;
};

export type DiscussionService = {
  listComments(scope: { taskId?: string; providerId?: string; offerId?: string }): Promise<DiscussionComment[]>;
  postComment(input: {
    body: string;
    taskId?: string | null;
    providerId?: string | null;
    offerId?: string | null;
    replyToId?: string | null;
  }): Promise<DiscussionComment>;
  resolveComment(commentId: string, note?: string): Promise<DiscussionComment>;
  reopenComment(commentId: string): Promise<DiscussionComment>;
  createTaskFromComment(
    commentId: string,
    title: string,
    assignedToUserId?: string | null,
    dueDate?: string | null,
  ): Promise<string>;
  subscribeToDiscussionEvents?(onEvent: () => void): () => void;
};
