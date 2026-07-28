import {
  buildCommentTree,
  commentPreview,
  displayAuthor,
  isResolved,
  unresolvedCount,
} from "./discussion-domain.mjs";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function scopeLabel(scope = {}) {
  if (scope.taskId) return "Task discussion";
  if (scope.providerId) return "Provider discussion";
  if (scope.offerId) return "Offer discussion";
  return "Record discussion";
}

function scopeSummary(scope = {}) {
  if (scope.taskId) return `Task ${scope.taskId}`;
  if (scope.providerId) return `Provider ${scope.providerId}`;
  if (scope.offerId) return `Offer ${scope.offerId}`;
  return "No record scope";
}

export function createDiscussionViewModule() {
  return {
    id: "record-discussion",
    mount(root, context) {
      const state = {
        comments: [],
        peopleById: Object.fromEntries((context.people || []).map((person) => [person.id, person])),
        loading: true,
        error: null,
        replyToId: null,
        taskSourceCommentId: null,
      };
      let disposed = false;
      let refreshTimer = null;
      let unsubscribeRealtime = null;

      root.classList.add("wein-discussion-root");

      async function refresh() {
        try {
          state.error = null;
          state.comments = await context.service.listComments(context.scope || {});
        } catch (error) {
          state.error = error.message || String(error);
        } finally {
          state.loading = false;
          if (!disposed) render();
        }
      }

      async function postComment(form) {
        const input = form.querySelector("[data-discussion-body]");
        const body = input.value.trim();
        if (!body) return;
        input.value = "";
        await context.service.postComment({
          ...(context.scope || {}),
          body,
          replyToId: state.replyToId,
          people: context.people || [],
        });
        state.replyToId = null;
        await refresh();
      }

      async function resolveComment(commentId) {
        const note = root.querySelector(`[data-resolve-note="${CSS.escape(commentId)}"]`)?.value || "";
        await context.service.resolveComment(commentId, note);
        await refresh();
      }

      async function reopenComment(commentId) {
        await context.service.reopenComment(commentId);
        await refresh();
      }

      async function createTask(form) {
        const titleInput = form.querySelector("[data-task-title]");
        const title = titleInput.value.trim();
        if (!title || !state.taskSourceCommentId) return;
        await context.service.createTaskFromComment(state.taskSourceCommentId, title, context.currentUser?.id || null);
        titleInput.value = "";
        state.taskSourceCommentId = null;
        await refresh();
      }

      function commentNode(comment, depth = 0) {
        const resolved = isResolved(comment);
        const author = displayAuthor(comment, state.peopleById);
        return `
          <article class="discussion-comment${resolved ? " resolved" : ""}" style="--depth:${Math.min(depth, 4)}">
            <div class="discussion-comment-meta">
              <span>${escapeHtml(author)}</span>
              <span>${escapeHtml(comment.created_at || "")}</span>
              ${resolved ? `<span class="discussion-resolved-pill">Resolved</span>` : ""}
            </div>
            <div class="discussion-comment-body">${escapeHtml(comment.body)}</div>
            ${comment.resolved_note ? `<div class="discussion-resolved-note">${escapeHtml(comment.resolved_note)}</div>` : ""}
            <div class="discussion-actions">
              <button type="button" data-discussion-reply="${escapeHtml(comment.id)}">Reply</button>
              ${resolved
                ? `<button type="button" data-discussion-reopen="${escapeHtml(comment.id)}">Reopen</button>`
                : `<button type="button" data-discussion-resolve="${escapeHtml(comment.id)}">Resolve</button>`}
              <button type="button" data-discussion-task="${escapeHtml(comment.id)}">Create task</button>
            </div>
            ${!resolved ? `<input class="discussion-resolve-note" data-resolve-note="${escapeHtml(comment.id)}" placeholder="Optional resolve note">` : ""}
            ${comment.replies?.length ? `<div class="discussion-replies">${comment.replies.map((reply) => commentNode(reply, depth + 1)).join("")}</div>` : ""}
          </article>
        `;
      }

      function renderTaskDrawer() {
        if (!state.taskSourceCommentId) return "";
        const comment = state.comments.find((item) => item.id === state.taskSourceCommentId);
        return `
          <form class="discussion-task-box" data-discussion-task-form>
            <div>
              <div class="discussion-eyebrow">Create task from comment</div>
              <p>${escapeHtml(commentPreview(comment))}</p>
            </div>
            <input data-task-title type="text" placeholder="Task title">
            <div class="discussion-task-actions">
              <button type="submit">Create task</button>
              <button type="button" data-discussion-task-cancel>Cancel</button>
            </div>
          </form>
        `;
      }

      function render() {
        const tree = buildCommentTree(state.comments);
        const replyingTo = state.replyToId ? state.comments.find((comment) => comment.id === state.replyToId) : null;
        root.innerHTML = `
          <section class="discussion-shell" aria-label="${escapeHtml(scopeLabel(context.scope))}">
            <header class="discussion-header">
              <div>
                <div class="discussion-eyebrow">${escapeHtml(scopeLabel(context.scope))}</div>
                <h2>Discussion</h2>
                <p>${escapeHtml(scopeSummary(context.scope))}</p>
              </div>
              <span class="discussion-count">${unresolvedCount(state.comments)} unresolved</span>
            </header>
            ${state.error ? `<div class="discussion-error">${escapeHtml(state.error)}</div>` : ""}
            ${renderTaskDrawer()}
            <div class="discussion-list">
              ${state.loading ? `<div class="discussion-muted">Loading discussion...</div>` : ""}
              ${tree.map((comment) => commentNode(comment)).join("")}
              ${!state.loading && !tree.length ? `<div class="discussion-muted">No comments yet.</div>` : ""}
            </div>
            <form class="discussion-composer" data-discussion-form>
              ${replyingTo ? `
                <div class="discussion-replying">
                  Replying to: ${escapeHtml(commentPreview(replyingTo, 70))}
                  <button type="button" data-discussion-cancel-reply>Cancel</button>
                </div>
              ` : ""}
              <textarea data-discussion-body rows="3" placeholder="Write a record-attached note..."></textarea>
              <button type="submit">${replyingTo ? "Reply" : "Post comment"}</button>
            </form>
          </section>
        `;

        root.querySelector("[data-discussion-form]")?.addEventListener("submit", (event) => {
          event.preventDefault();
          postComment(event.currentTarget);
        });
        root.querySelector("[data-discussion-cancel-reply]")?.addEventListener("click", () => {
          state.replyToId = null;
          render();
        });
        root.querySelector("[data-discussion-task-cancel]")?.addEventListener("click", () => {
          state.taskSourceCommentId = null;
          render();
        });
        root.querySelector("[data-discussion-task-form]")?.addEventListener("submit", (event) => {
          event.preventDefault();
          createTask(event.currentTarget);
        });
        root.querySelectorAll("[data-discussion-reply]").forEach((button) => {
          button.addEventListener("click", () => {
            state.replyToId = button.dataset.discussionReply;
            render();
          });
        });
        root.querySelectorAll("[data-discussion-resolve]").forEach((button) => {
          button.addEventListener("click", () => resolveComment(button.dataset.discussionResolve));
        });
        root.querySelectorAll("[data-discussion-reopen]").forEach((button) => {
          button.addEventListener("click", () => reopenComment(button.dataset.discussionReopen));
        });
        root.querySelectorAll("[data-discussion-task]").forEach((button) => {
          button.addEventListener("click", () => {
            state.taskSourceCommentId = button.dataset.discussionTask;
            render();
          });
        });
      }

      refresh();
      refreshTimer = setInterval(() => refresh(), 30000);
      if (typeof context.service.subscribeToDiscussionEvents === "function") {
        unsubscribeRealtime = context.service.subscribeToDiscussionEvents(() => refresh());
      }

      return () => {
        disposed = true;
        if (refreshTimer) clearInterval(refreshTimer);
        if (unsubscribeRealtime) unsubscribeRealtime();
        root.classList.remove("wein-discussion-root");
        root.innerHTML = "";
      };
    },
  };
}
