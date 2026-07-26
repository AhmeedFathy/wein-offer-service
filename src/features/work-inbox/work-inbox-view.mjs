function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const SEVERITY_LABELS = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const KIND_LABELS = {
  task: "Task",
  mention: "Mention",
  discussion: "Discussion",
  review: "Review",
};

function formatDue(value) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function groupBySeverity(items = []) {
  return ["critical", "high", "medium", "low"].map((severity) => ({
    severity,
    items: items.filter((item) => item.severity === severity),
  })).filter((group) => group.items.length);
}

export function createWorkInboxViewModule() {
  return {
    id: "work-inbox",
    mount(root, context) {
      const state = {
        items: [],
        loading: true,
        error: null,
      };
      let disposed = false;
      let refreshTimer = null;
      let unsubscribeRealtime = null;

      root.classList.add("wein-work-inbox-root");

      async function refresh() {
        try {
          state.error = null;
          state.items = await context.service.loadInbox();
        } catch (error) {
          state.error = error.message || String(error);
        } finally {
          state.loading = false;
          if (!disposed) render();
        }
      }

      function selectItem(item) {
        if (typeof context.onSelectItem === "function") {
          context.onSelectItem(item);
          return;
        }
        if (item.href) window.location.hash = item.href;
      }

      function itemRow(item) {
        return `
          <button type="button" class="work-inbox-item severity-${escapeHtml(item.severity)}" data-inbox-item="${escapeHtml(item.kind)}:${escapeHtml(item.entity_id)}:${escapeHtml(item.reason_code)}">
            <span class="work-inbox-kind">${escapeHtml(KIND_LABELS[item.kind] || item.kind)}</span>
            <span class="work-inbox-title">${escapeHtml(item.title)}</span>
            <span class="work-inbox-reason">${escapeHtml(item.reason_code.replaceAll("_", " "))}</span>
            <span class="work-inbox-due">${escapeHtml(formatDue(item.due_at))}</span>
            <span class="work-inbox-action">${escapeHtml(item.next_action)}</span>
          </button>
        `;
      }

      function render() {
        const groups = groupBySeverity(state.items);
        root.innerHTML = `
          <section class="work-inbox-shell" aria-label="Work inbox">
            <header class="work-inbox-header">
              <div>
                <div class="work-inbox-eyebrow">Today extension</div>
                <h2>Work inbox</h2>
                <p>Normalized tasks, mentions, discussion replies, and review signals.</p>
              </div>
              <div class="work-inbox-total">${state.items.length} item${state.items.length === 1 ? "" : "s"}</div>
            </header>
            ${state.error ? `<div class="work-inbox-error">${escapeHtml(state.error)}</div>` : ""}
            <div class="work-inbox-toolbar">
              <button type="button" data-inbox-refresh>Refresh</button>
            </div>
            <div class="work-inbox-list">
              ${state.loading ? `<div class="work-inbox-muted">Loading inbox...</div>` : ""}
              ${groups.map((group) => `
                <section class="work-inbox-group">
                  <h3>${escapeHtml(SEVERITY_LABELS[group.severity])}</h3>
                  ${group.items.map(itemRow).join("")}
                </section>
              `).join("")}
              ${!state.loading && !state.items.length ? `<div class="work-inbox-muted">No attention items right now.</div>` : ""}
            </div>
          </section>
        `;

        root.querySelector("[data-inbox-refresh]")?.addEventListener("click", () => refresh());
        root.querySelectorAll("[data-inbox-item]").forEach((button) => {
          button.addEventListener("click", () => {
            const key = button.dataset.inboxItem;
            const item = state.items.find((candidate) => `${candidate.kind}:${candidate.entity_id}:${candidate.reason_code}` === key);
            if (item) selectItem(item);
          });
        });
      }

      refresh();
      refreshTimer = setInterval(() => refresh(), 60000);
      if (typeof context.service.subscribeToInboxEvents === "function") {
        unsubscribeRealtime = context.service.subscribeToInboxEvents(() => refresh());
      }

      return () => {
        disposed = true;
        if (refreshTimer) clearInterval(refreshTimer);
        if (unsubscribeRealtime) unsubscribeRealtime();
        root.classList.remove("wein-work-inbox-root");
        root.innerHTML = "";
      };
    },
  };
}
