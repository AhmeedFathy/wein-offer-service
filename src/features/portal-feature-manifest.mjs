import { createChatViewModule } from "./chat/chat-view.mjs";
import { createDiscussionViewModule } from "./record-discussion/discussion-view.mjs";
import { createWorkInboxViewModule } from "./work-inbox/work-inbox-view.mjs";

export const PORTAL_FEATURE_MANIFEST = [
  {
    id: "team-chat",
    label: "Team chat",
    phase: 3,
    styles: ["src/features/chat/chat-styles.css"],
    createModule: createChatViewModule,
    requiredContext: ["currentUser", "service"],
    requiredServiceMethods: [
      "listProfiles",
      "listConversations",
      "listMessages",
      "createGroup",
      "getOrCreateDm",
      "sendMessage",
      "updateMessage",
      "deleteMessage",
      "markRead",
      "setNotificationLevel",
      "subscribeToConversationEvents",
    ],
    integrationTarget: "future view registry",
  },
  {
    id: "record-discussion",
    label: "Record discussion",
    phase: 7,
    styles: ["src/features/record-discussion/discussion-styles.css"],
    createModule: createDiscussionViewModule,
    requiredContext: ["currentUser", "service", "scope"],
    requiredServiceMethods: [
      "listComments",
      "postComment",
      "resolveComment",
      "reopenComment",
      "createTaskFromComment",
      "subscribeToDiscussionEvents",
    ],
    integrationTarget: "record detail panels",
  },
  {
    id: "work-inbox",
    label: "Work inbox",
    phase: 8,
    styles: ["src/features/work-inbox/work-inbox-styles.css"],
    createModule: createWorkInboxViewModule,
    requiredContext: ["service"],
    requiredServiceMethods: [
      "loadInbox",
      "subscribeToInboxEvents",
    ],
    integrationTarget: "existing Today aggregator",
  },
];

export function createPortalFeatureModules() {
  return PORTAL_FEATURE_MANIFEST.map((entry) => entry.createModule());
}

export function getPortalFeatureManifestEntry(id) {
  return PORTAL_FEATURE_MANIFEST.find((entry) => entry.id === id) || null;
}
