export type WorkInboxItem = {
  kind: "task" | "mention" | "discussion" | "review" | string;
  entity_id: string;
  title: string;
  reason_code: string;
  severity: "critical" | "high" | "medium" | "low";
  owner_id: string | null;
  due_at: string | null;
  next_action: string;
  href: string;
  source?: unknown;
};

export type WorkInboxSource = {
  tasks?: unknown[];
  mentions?: unknown[];
  commentsById?: Record<string, unknown>;
  awaitingReplies?: unknown[];
  founderReviews?: unknown[];
};

export type WorkInboxService = {
  loadInbox(): Promise<WorkInboxItem[]>;
  subscribeToInboxEvents?(onEvent: () => void): () => void;
};

export type WorkInboxContext = {
  service: WorkInboxService;
  onSelectItem?(item: WorkInboxItem): void;
};
