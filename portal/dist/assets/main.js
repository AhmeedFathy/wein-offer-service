function Q(e){return typeof e=="object"&&e!==null?e.role:e}function G(e){const a=Q(e);return a==="admin"||a==="manager"}const X=G;function Z(e){const a=Q(e);return a==="admin"||a==="manager"||a==="deal_breaker"}const Ne={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function j(e){return e?Ne[e]??[]:[]}function x(e){return j(e).includes("pipeline")?"tasks":"pipeline"}function _(){return window.WEIN_PORTAL_LEGACY??{}}function H(){const e=_().supabaseClient;if(!e)throw new Error("Portal Supabase client is not available yet.");return e}function A(){const e=_().getSupabaseUrl?.();if(!e)throw new Error("Portal Supabase URL is not available yet.");return e}function Re(){const e=_().getSupabaseAnonKey?.();if(!e)throw new Error("Portal Supabase anon key is not available yet.");return e}function O(){return _().getAccessToken?.()??null}function Ue(){return{client:H(),accessToken:O()}}class Fe extends Error{constructor(a,t,i){super(a),this.status=t,this.body=i,this.name="PortalApiError"}status;body}function E(){const e=_().headers?.();if(e)return e;const a=Re();return{apikey:a,Authorization:`Bearer ${O()||a}`,"Content-Type":"application/json"}}async function V(e,a){if(e.ok)return;const t=await e.text();throw new Fe(`Supabase ${a} failed: ${e.status}${t?` ${t}`:""}`,e.status,t)}async function Ge(e){const a=_().get;if(a)return a(e);const t=await fetch(`${A()}/rest/v1/${e}`,{headers:E()});return await V(t,"GET"),t.json()}async function je(e,a){const t=_().post;if(t)return t(e,a);const i=await fetch(`${A()}/rest/v1/${e}`,{method:"POST",headers:{...E(),Prefer:"return=representation"},body:JSON.stringify(a)});return await V(i,"POST"),i.json()}async function He(e,a){const t=_().patch;return t?t(e,a):(await fetch(`${A()}/rest/v1/${e}`,{method:"PATCH",headers:E(),body:JSON.stringify(a)})).ok}async function Ve(e){const a=_().delete;if(a)return a(e);const t=await fetch(`${A()}/rest/v1/${e}`,{method:"DELETE",headers:E()});return await V(t,"DELETE"),!0}const ee={headers:E,get:Ge,post:je,patch:He,delete:Ve},We={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function Be(){const e=_().getCaches?.();return e?{providers:e.providers??[],offers:e.offers??[],negotiations:e.negotiations??[],files:e.files??[],leads:e.leads??[],outcomes:e.outcomes??[],tasks:e.tasks??[],profiles:e.profiles??[],redemptions:e.redemptions??[],campaigns:e.campaigns??[],calendarNotes:e.calendarNotes??[]}:We}function h(e){return Be()[e]}function te(e,a){const t=_().setCache;if(!t)throw new Error("Portal cache bridge is not available yet.");t(e,[...a])}function Ye(e,a){te(e,a(h(e)))}const ae={get providers(){return h("providers")},get offers(){return h("offers")},get negotiations(){return h("negotiations")},get files(){return h("files")},get leads(){return h("leads")},get outcomes(){return h("outcomes")},get tasks(){return h("tasks")},get profiles(){return h("profiles")},get redemptions(){return h("redemptions")},get campaigns(){return h("campaigns")},get calendarNotes(){return h("calendarNotes")},getCache:h,replaceCache:te,updateCache:Ye};function q(){const e=window.WEIN??{};return{user:e.user,role:e.role??sessionStorage.getItem("weinRole"),fullName:e.fullName??null,accessToken:O(),client:H()}}function ze(){const e=q();return{api:ee,store:ae,session:e,permissions:{canDelete:()=>G(q()),canManageDeals:()=>X(q()),canEditProviderProfile:()=>Z(q()),navHiddenForRole:j,defaultViewForRole:x},navigate(a,t){window.showView?.(a,t)}}}const $=new Map;let T=null;function P(e){if(!e.id)throw new Error("View id is required.");if($.has(e.id))throw new Error(`View already registered: ${e.id}`);$.set(e.id,e)}function se(e){return $.get(e)}function Ke(){return[...$.keys()]}function Je(){if(!T)return;const e=T;T=null,e()}function Qe(e,a,t){const i=se(e);if(!i)throw new Error(`Unknown portal view: ${e}`);Je();const c=i.mount(a,t);T=typeof c=="function"?c:null}function Xe(){$.has("__dummy_cleanup_probe")||P({id:"__dummy_cleanup_probe",mount(e){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,e.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function Ze(e="chat"){const a=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${e}-${a}`}function K(e,a){return e.kind==="group"?e.title||"Untitled group":(e.members||[]).map(i=>i.profile).find(i=>i&&i.id!==a)?.full_name||"Direct message"}function xe(e){return[...e].sort((a,t)=>{const i=a.last_message?.created_at||a.created_at,c=t.last_message?.created_at||t.created_at;return new Date(c).getTime()-new Date(i).getTime()})}function et(e,a){const t=(e.members||[]).find(c=>c.user_id===a),i=e.last_message?.message_seq||0;return Math.max(0,i-(t?.last_read_seq||0))}function tt(e){if(!e)return"No messages yet";const a=(e.deleted_at?"Message deleted":e.body||"").trim();return a.length>82?`${a.slice(0,79)}...`:a}function l(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function D(e){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[e]||e}function at(){return{id:"team-chat",mount(e,a){const t={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,composeOpen:!1,composeSearch:"",composeGroupTitle:"",composeSelectedMemberIds:new Set,membersOpen:!1,memberAddOpen:!1,memberSearch:"",memberSelectedIds:new Set,openMessageMenuId:null,confirmingDeleteMessageId:null,loading:!0,error:null};let i=!1,c=a.initialConversationId||null,p=null,b=null;e.classList.add("wein-chat-root");function y(s){const r=s.target;if(r instanceof Element){if(t.composeOpen&&!r.closest("[data-chat-compose-popover]")&&!r.closest("[data-chat-compose-toggle]")){C();return}if(t.membersOpen&&!r.closest("[data-chat-members-panel]")&&!r.closest("[data-chat-members-toggle]")){I();return}t.openMessageMenuId&&!r.closest("[data-chat-message-menu-panel]")&&!r.closest("[data-chat-message-menu]")&&(t.openMessageMenuId=null,u())}}function Y(s){if(s.key==="Escape"){if(t.composeOpen){C();return}if(t.membersOpen){I();return}(t.openMessageMenuId||t.confirmingDeleteMessageId)&&(t.openMessageMenuId=null,t.confirmingDeleteMessageId=null,u())}}e.addEventListener?.("click",y),typeof document<"u"&&document.addEventListener("keydown",Y);async function v({keepMessages:s=!0}={}){try{t.error=null;const[r,o]=await Promise.all([a.service.listProfiles(),a.service.listConversations()]);if(t.profiles=r,t.conversations=xe(o),c&&(t.conversations.some(d=>d.id===c)&&(t.selectedConversationId=c),c=null),!t.selectedConversationId&&t.conversations.length&&(t.selectedConversationId=t.conversations[0].id),t.selectedConversationId&&s){t.messages=await a.service.listMessages(t.selectedConversationId);const d=t.messages.at(-1)?.message_seq||0;if(d)try{await a.service.markRead(t.selectedConversationId,d)}catch(g){console.error("Failed to mark chat messages as read",g)}}}catch(r){t.error=r.message||String(r)}finally{t.loading=!1,i||u()}}async function N(s){t.selectedConversationId=s,t.membersOpen=!1,t.memberAddOpen=!1,t.memberSearch="",t.memberSelectedIds=new Set,e.classList.add("chat-has-selection"),t.messages=await a.service.listMessages(s),i||u();const r=t.messages.at(-1)?.message_seq||0;if(r)try{await a.service.markRead(s,r)}catch(o){console.error("Failed to mark chat messages as read",o)}await v()}function oe(){e.classList.remove("chat-has-selection")}async function ce(s){const r=s.querySelector("[data-chat-composer]"),o=r.value.trim();if(!o||!t.selectedConversationId)return;const d=t.replyToMessageId;r.value="",t.replyToMessageId=null;const g=await a.service.sendMessage({conversationId:t.selectedConversationId,body:o,clientNonce:Ze("portal-chat"),replyToId:d});t.messages=[...t.messages,g],i||u();try{await a.service.markRead(t.selectedConversationId,g.message_seq)}catch(n){console.error("Failed to mark chat message as read",n)}await v()}function le(s){s&&(t.replyToMessageId=s,u(),e.querySelector("[data-chat-composer]")?.focus())}function de(){t.replyToMessageId=null,u()}function ue(){t.composeOpen=!0,u(),e.querySelector("[data-chat-compose-search]")?.focus()}function C({reset:s=!1}={}){t.composeOpen=!1,s&&(t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set),u()}function me(s,r){const o=new Set(t.composeSelectedMemberIds);r?o.add(s):o.delete(s),t.composeSelectedMemberIds=o,u()}function pe(s){return!s||s.kind!=="group"?!1:s.members.find(o=>o.user_id===a.currentUser.id&&!o.left_at)?.membership_role==="owner"||["admin","manager"].includes(a.currentUser.role)}function fe(){t.membersOpen=!0,u()}function I({reset:s=!1}={}){t.membersOpen=!1,t.memberAddOpen=!1,s&&(t.memberSearch="",t.memberSelectedIds=new Set),u()}function he(){t.memberAddOpen=!t.memberAddOpen,u(),t.memberAddOpen&&e.querySelector("[data-chat-member-search]")?.focus()}function ge(s,r){const o=new Set(t.memberSelectedIds);r?o.add(s):o.delete(s),t.memberSelectedIds=o,u()}async function _e(s){const r=[...t.memberSelectedIds];if(!(!s||!r.length)){for(const o of r)await a.service.addMember(s,o);t.memberSearch="",t.memberSelectedIds=new Set,t.memberAddOpen=!1,i||u(),await v()}}async function ve(s,r){!s||!r||(await a.service.removeMember(s,r),t.conversations=t.conversations.map(o=>o.id!==s?o:{...o,members:o.members.map(d=>d.user_id===r?{...d,left_at:d.left_at||new Date().toISOString()}:d)}),r===a.currentUser.id&&(t.membersOpen=!1,t.memberAddOpen=!1),i||u(),await v())}function be(s){const r=t.messages.find(d=>d.id===s);if(!r)return;t.editingMessageId=s,t.editDraft=r.body||"",u();const o=e.querySelector(`[data-chat-edit-input="${CSS.escape(s)}"]`);o?.focus(),o?.select?.()}function ye(){t.editingMessageId=null,t.editDraft="",u()}async function we(s){const r=s.dataset.chatEditForm,d=s.querySelector("[data-chat-edit-input]").value.trim();if(!r||!d)return;const g=await a.service.updateMessage(r,d);t.messages=t.messages.map(n=>n.id===g.id?g:n),t.editingMessageId=null,t.editDraft="",i||u(),await v()}async function Se(s){if(!s)return;const r=await a.service.deleteMessage(s);t.messages=t.messages.map(o=>o.id===s?{...o,...r,body:"Message deleted",deleted_at:r.deleted_at||new Date().toISOString()}:o),t.replyToMessageId===s&&(t.replyToMessageId=null),t.confirmingDeleteMessageId=null,t.openMessageMenuId=null,i||u(),await v()}async function Me(s){const o=s.members.find(d=>d.user_id===a.currentUser.id)?.notification_level==="muted"?"all":"muted";await a.service.setNotificationLevel(s.id,o),t.conversations=t.conversations.map(d=>d.id!==s.id?d:{...d,members:d.members.map(g=>g.user_id===a.currentUser.id?{...g,notification_level:o}:g)}),i||u(),await v()}async function $e(s){if(!s)return;const r=await a.service.getOrCreateDm(s);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await N(r)}async function Ee(s,r){if(s=s.trim(),!s)return;const o=await a.service.createGroup(s,r);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await N(o)}function ke(){i||v()}function Ce(s){const r=s.id===t.selectedConversationId?" selected":"",o=s.unread_count?`<span class="chat-count">${s.unread_count}</span>`:"";return`
          <button type="button" class="chat-conversation${r}" data-chat-select="${l(s.id)}">
            <span class="chat-conversation-title">${l(K(s,a.currentUser.id))}</span>
            ${o}
            <span class="chat-conversation-preview">${l(tt(s.last_message))}</span>
          </button>
        `}function Ie(){return["admin","manager"].includes(a.currentUser.role)}function qe(s){if(!t.composeOpen)return"";const r=t.composeSearch.trim().toLowerCase(),o=s.filter(n=>!r||(n.full_name||"").toLowerCase().includes(r)),d=t.composeSelectedMemberIds.size,g=d===1?[...t.composeSelectedMemberIds][0]:"";return`
          <div class="chat-compose-popover" data-chat-compose-popover role="dialog" aria-label="New conversation">
            <div class="chat-compose-popover-head">
              <strong>New conversation</strong>
              <button type="button" class="chat-icon-btn" data-chat-compose-close aria-label="Close new conversation"><i class="ti ti-x"></i></button>
            </div>
            <input data-chat-compose-search type="search" placeholder="Search people..." value="${l(t.composeSearch)}" autocomplete="off">
            <div class="chat-compose-summary">${d} selected</div>
            <div class="chat-compose-list">
              ${o.map(n=>{const m=t.composeSelectedMemberIds.has(n.id)?" checked":"";return`
                  <label class="chat-compose-person">
                    <input type="checkbox" data-chat-compose-member="${l(n.id)}"${m}>
                    <span class="chat-compose-avatar">${l((n.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${l(n.full_name||"Unknown")}</strong>
                      <span>${l(D(n.role))}</span>
                    </span>
                  </label>
                `}).join("")}
              ${o.length?"":'<div class="chat-muted">No matching people.</div>'}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${l(g)}"${d===1?"":" disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${l(t.composeGroupTitle)}">
                <button type="button" data-chat-create-group${t.composeGroupTitle.trim()?"":" disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
              </div>
            </div>
          </div>
        `}function De(s){if(!t.membersOpen||!s||s.kind!=="group")return"";const r=s.members.filter(f=>!f.left_at),o=pe(s),d=new Set(r.map(f=>f.user_id)),g=t.memberSearch.trim().toLowerCase(),n=t.profiles.filter(f=>f.id!==a.currentUser.id&&!d.has(f.id)&&(!g||(f.full_name||"").toLowerCase().includes(g))),m=t.memberSelectedIds.size;return`
          <div class="chat-compose-popover chat-members-panel" data-chat-members-panel role="dialog" aria-label="Manage members">
            <div class="chat-compose-popover-head">
              <strong>Manage members</strong>
              <button type="button" class="chat-icon-btn" data-chat-members-close aria-label="Close member management"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-member-panel-list">
              ${r.map(f=>{const w=f.profile||{},R=f.user_id===a.currentUser.id,Pe=o||R;return`
                  <div class="chat-member-row" data-chat-member-row="${l(f.user_id)}">
                    <span class="chat-compose-avatar">${l((w.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${l(w.full_name||f.user_id)}</strong>
                      <span>${l(w.role?D(w.role):"Member")}</span>
                    </span>
                    ${f.membership_role==="owner"?'<span class="chat-owner-badge">Owner</span>':""}
                    ${Pe?`
                      <button type="button" class="chat-member-remove" data-chat-remove-member="${l(f.user_id)}">
                        <i class="ti ${R?"ti-logout":"ti-user-minus"}"></i><span>${R?"Leave":"Remove"}</span>
                      </button>
                    `:""}
                  </div>
                `}).join("")}
            </div>
            ${o?`
              <div class="chat-member-add">
                <button type="button" class="chat-member-add-toggle" data-chat-member-add-toggle>
                  <i class="ti ti-user-plus"></i><span>Add member</span>
                </button>
                ${t.memberAddOpen?`
                  <input data-chat-member-search type="search" placeholder="Search people..." value="${l(t.memberSearch)}" autocomplete="off">
                  <div class="chat-compose-summary">${m} selected</div>
                  <div class="chat-compose-list">
                    ${n.map(f=>{const w=t.memberSelectedIds.has(f.id)?" checked":"";return`
                        <label class="chat-compose-person">
                          <input type="checkbox" data-chat-member-pick="${l(f.id)}"${w}>
                          <span class="chat-compose-avatar">${l((f.full_name||"?").slice(0,1))}</span>
                          <span class="chat-compose-person-copy">
                            <strong>${l(f.full_name||"Unknown")}</strong>
                            <span>${l(D(f.role))}</span>
                          </span>
                        </label>
                      `}).join("")}
                    ${n.length?"":'<div class="chat-muted">No matching people.</div>'}
                  </div>
                  <div class="chat-compose-actions">
                    <button type="button" data-chat-add-members="${l(s.id)}"${m?"":" disabled"}><i class="ti ti-users-plus"></i><span>Add selected</span></button>
                  </div>
                `:""}
              </div>
            `:""}
          </div>
        `}function z(s){const r=s.deleted_at?"Message deleted":s.body||"";return r.length>90?`${r.slice(0,87)}...`:r}function Le(s){if(!s?.reply_to_id)return"";const r=t.messages.find(o=>o.id===s.reply_to_id);return r?`
          <div class="chat-quote">
            <strong>${l(r.sender?.full_name||"Unknown")}</strong>
            <span>${l(z(r))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function Te(){const s=t.messages.find(r=>r.id===t.replyToMessageId);return s?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${l(s.sender?.full_name||"Unknown")}</strong>
              <span>${l(z(s))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function Ae(s){return`
          <form class="chat-edit-form" data-chat-edit-form="${l(s.id)}">
            <input data-chat-edit-input="${l(s.id)}" type="text" value="${l(t.editDraft)}">
            <button type="submit" aria-label="Save edit"><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
          </form>
        `}function Oe(s){const r=s.sender_id===a.currentUser.id?" mine":"",o=!!s.deleted_at,d=r&&!o,g=!o&&(r||Ie()),n=s.edited_at&&!o?'<span class="chat-edited">(edited)</span>':"",m=o?"":`
            <button type="button" data-chat-reply="${l(s.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${d?`<button type="button" data-chat-edit="${l(s.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
            ${g?`<button type="button" data-chat-delete="${l(s.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>`:""}
        `,f=o?"":`
          <div class="chat-message-actions" aria-label="Message actions">
            ${m}
          </div>
          <button type="button" class="chat-message-menu-btn" data-chat-message-menu="${l(s.id)}" aria-label="Message actions"><i class="ti ti-dots"></i></button>
          ${t.openMessageMenuId===s.id?`
            <div class="chat-message-menu" data-chat-message-menu-panel="${l(s.id)}">
              ${m}
            </div>
          `:""}
          ${t.confirmingDeleteMessageId===s.id?`
            <div class="chat-delete-confirm">
              <span>Delete message?</span>
              <button type="button" data-chat-confirm-delete="${l(s.id)}">Confirm</button>
              <button type="button" data-chat-cancel-delete="${l(s.id)}">Cancel</button>
            </div>
          `:""}
        `;return`
          <div class="chat-message${r}${o?" deleted":""}" tabindex="0" data-chat-message-id="${l(s.id)}">
            <div class="chat-message-meta">
              <span>${l(s.sender?.full_name||"Unknown")}</span>
              <span>#${s.message_seq} ${n}</span>
            </div>
            ${Le(s)}
            ${t.editingMessageId===s.id?Ae(s):`<div class="chat-message-body">${l(o?"Message deleted":s.body)}</div>`}
            ${f}
          </div>
        `}function u(){const s=t.conversations.find(n=>n.id===t.selectedConversationId)||null,r=t.profiles.filter(n=>n.id!==a.currentUser.id),d=s?.members.find(n=>n.user_id===a.currentUser.id)?.notification_level==="muted",g=s?.members.filter(n=>!n.left_at)||[];e.innerHTML=`
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <div class="chat-sidebar-tools">
                  <span class="chat-user-pill">${l(D(a.currentUser.role))}</span>
                  <button type="button" class="chat-icon-btn" data-chat-compose-toggle aria-label="New conversation" title="New conversation"><i class="ti ti-pencil-plus"></i></button>
                </div>
              </div>
              ${qe(r)}
              <div class="chat-conversation-list">
                ${t.loading?'<div class="chat-muted">Loading...</div>':""}
                ${t.conversations.map(Ce).join("")}
                ${!t.loading&&!t.conversations.length?'<div class="chat-muted">No conversations yet.</div>':""}
              </div>
            </aside>
            <main class="chat-thread">
              ${t.error?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${l(t.error)}</span></div>`:""}
              ${s?`
                <header class="chat-thread-head">
                  <button type="button" class="chat-back-btn" data-chat-back aria-label="Back to conversations"><i class="ti ti-arrow-left"></i></button>
                  <div>
                    <div class="chat-eyebrow">${s.kind==="dm"?"Direct message":"Group"}</div>
                    <h2>${l(K(s,a.currentUser.id))}</h2>
                  </div>
                  <div class="chat-thread-tools">
                    ${s.kind==="group"?`
                      <button type="button" class="chat-icon-btn${t.membersOpen?" active":""}" data-chat-members-toggle aria-label="Manage members" title="Manage members">
                        <i class="ti ti-users"></i>
                      </button>
                    `:""}
                    <button type="button" class="chat-icon-btn${d?" active":""}" data-chat-toggle-mute aria-label="${d?"Unmute conversation":"Mute conversation"}" title="${d?"Unmute conversation":"Mute conversation"}">
                      <i class="ti ${d?"ti-bell-off":"ti-bell"}"></i>
                    </button>
                    <div class="chat-member-stack">
                      ${g.map(n=>`<span title="${l(n.profile?.full_name||n.user_id)}">${l((n.profile?.full_name||"?").slice(0,1))}</span>`).join("")}
                    </div>
                  </div>
                  ${De(s)}
                </header>
                <div class="chat-message-list">
                  ${t.messages.map(Oe).join("")}
                  ${t.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  ${Te()}
                  <input data-chat-composer type="text" placeholder="Write a message...">
                  <button type="submit"><i class="ti ti-send"></i><span>Send</span></button>
                </form>
              `:`
                <div class="chat-empty-panel">
                  <i class="ti ti-messages"></i>
                  <h2>No conversation selected</h2>
                  <p>Start a DM or create a group to begin.</p>
                </div>
              `}
            </main>
          </section>
        `,e.querySelectorAll("[data-chat-select]").forEach(n=>{n.addEventListener("click",()=>N(n.dataset.chatSelect))}),e.querySelector("[data-chat-back]")?.addEventListener("click",()=>oe()),e.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{s&&Me(s)}),e.querySelector("[data-chat-members-toggle]")?.addEventListener("click",()=>{s&&(t.membersOpen?I():fe())}),e.querySelector("[data-chat-members-close]")?.addEventListener("click",()=>I({reset:!0})),e.querySelector("[data-chat-member-add-toggle]")?.addEventListener("click",()=>he()),e.querySelector("[data-chat-member-search]")?.addEventListener("input",n=>{t.memberSearch=n.currentTarget.value,u();const m=e.querySelector("[data-chat-member-search]");m?.focus(),m?.setSelectionRange?.(m.value.length,m.value.length)}),e.querySelectorAll("[data-chat-member-pick]").forEach(n=>{n.addEventListener("change",()=>ge(n.dataset.chatMemberPick,n.checked))}),e.querySelector("[data-chat-add-members]")?.addEventListener("click",n=>{_e(n.currentTarget.dataset.chatAddMembers)}),e.querySelectorAll("[data-chat-remove-member]").forEach(n=>{n.addEventListener("click",()=>{s&&ve(s.id,n.dataset.chatRemoveMember)})}),e.querySelector("[data-chat-compose-toggle]")?.addEventListener("click",()=>{t.composeOpen?C():ue()}),e.querySelector("[data-chat-compose-close]")?.addEventListener("click",()=>C()),e.querySelector("[data-chat-compose-search]")?.addEventListener("input",n=>{t.composeSearch=n.currentTarget.value,u();const m=e.querySelector("[data-chat-compose-search]");m?.focus(),m?.setSelectionRange?.(m.value.length,m.value.length)}),e.querySelectorAll("[data-chat-compose-member]").forEach(n=>{n.addEventListener("change",()=>me(n.dataset.chatComposeMember,n.checked))}),e.querySelector("[data-chat-group-title]")?.addEventListener("input",n=>{t.composeGroupTitle=n.currentTarget.value,u();const m=e.querySelector("[data-chat-group-title]");m?.focus(),m?.setSelectionRange?.(m.value.length,m.value.length)}),e.querySelector("[data-chat-start-dm]")?.addEventListener("click",n=>{$e(n.currentTarget.dataset.chatStartDm)}),e.querySelector("[data-chat-create-group]")?.addEventListener("click",()=>{Ee(t.composeGroupTitle,[...t.composeSelectedMemberIds])}),e.querySelector("[data-chat-send-form]")?.addEventListener("submit",n=>{n.preventDefault(),ce(n.currentTarget)}),e.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>de()),e.querySelectorAll("[data-chat-reply]").forEach(n=>{n.addEventListener("click",()=>le(n.dataset.chatReply))}),e.querySelectorAll("[data-chat-edit]").forEach(n=>{n.addEventListener("click",()=>be(n.dataset.chatEdit))}),e.querySelectorAll("[data-chat-delete]").forEach(n=>{n.addEventListener("click",()=>{t.confirmingDeleteMessageId=n.dataset.chatDelete,t.openMessageMenuId=null,u()})}),e.querySelectorAll("[data-chat-message-menu]").forEach(n=>{n.addEventListener("click",()=>{t.openMessageMenuId=t.openMessageMenuId===n.dataset.chatMessageMenu?null:n.dataset.chatMessageMenu,t.confirmingDeleteMessageId=null,u()})}),e.querySelectorAll("[data-chat-confirm-delete]").forEach(n=>{n.addEventListener("click",()=>Se(n.dataset.chatConfirmDelete))}),e.querySelectorAll("[data-chat-cancel-delete]").forEach(n=>{n.addEventListener("click",()=>{t.confirmingDeleteMessageId===n.dataset.chatCancelDelete&&(t.confirmingDeleteMessageId=null),u()})}),e.querySelectorAll("[data-chat-edit-form]").forEach(n=>{n.addEventListener("submit",m=>{m.preventDefault(),we(m.currentTarget)})}),e.querySelectorAll("[data-chat-cancel-edit]").forEach(n=>{n.addEventListener("click",()=>ye())})}return v(),p=setInterval(()=>v(),3e4),typeof a.service.subscribeToConversationEvents=="function"&&(b=a.service.subscribeToConversationEvents(()=>ke())),()=>{i=!0,p&&clearInterval(p),b&&b(),e.removeEventListener?.("click",y),typeof document<"u"&&document.removeEventListener("keydown",Y),e.classList.remove("wein-chat-root"),e.classList.remove("chat-has-selection"),e.innerHTML=""}}}}function S(e,a){if(e.error)throw new Error(`${a}: ${e.error.message||e.error}`);return e.data||[]}function L(e,a){if(e.error)throw new Error(`${a}: ${e.error.message||e.error}`);return e.data}function W(e){return e?{id:e.id,full_name:e.full_name,role:e.role,email:e.email??null}:null}function st(e){return{conversation_id:e.conversation_id,user_id:e.user_id,membership_role:e.membership_role,joined_at:e.joined_at,left_at:e.left_at,last_read_seq:Number(e.last_read_seq||0),notification_level:e.notification_level,profile:W(e.profile||e.profiles)}}function M(e){return{id:e.id,conversation_id:e.conversation_id,message_seq:Number(e.message_seq||0),sender_id:e.sender_id,body:e.body,reply_to_id:e.reply_to_id,client_nonce:e.client_nonce,created_at:e.created_at,edited_at:e.edited_at,deleted_at:e.deleted_at,sender:W(e.sender||e.profiles)}}function J(e,a){const t=(e.members||e.wein_chat_members||[]).map(st),i=e.last_message||e.wein_chat_messages||[],c=Array.isArray(i)&&i.length?M(i[0]):null,p={id:e.id,kind:e.kind,title:e.title,created_by:e.created_by,created_at:e.created_at,archived_at:e.archived_at,members:t,last_message:c,unread_count:0};return p.unread_count=et(p,a),p}function nt({supabase:e,currentUserId:a}){if(!e)throw new Error("supabase client is required");if(!a)throw new Error("currentUserId is required");async function t(i){const c=await e.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",i).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"}).single();if(c.error)throw new Error(`fetch conversation: ${c.error.message||c.error}`);return J(c.data,a)}return{async listProfiles(){const i=await e.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return S(i,"list profiles").map(W)},async listConversations(){const i=await e.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"});return S(i,"list conversations").map(c=>J(c,a))},async listMessages(i){const c=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",i).is("deleted_at",null).order("message_seq",{ascending:!0});return S(c,"list messages").map(M)},async createGroup(i,c=[]){const p=L(await e.rpc("wein_chat_create_group",{p_title:i}),"create group");for(const b of c)await this.addMember(p,b);return p},async getOrCreateDm(i){return L(await e.rpc("wein_chat_get_or_create_dm",{p_other_user_id:i}),"get or create DM")},async addMember(i,c){L(await e.rpc("wein_chat_add_member",{p_conversation_id:i,p_user_id:c}),"add member")},async removeMember(i,c){L(await e.rpc("wein_chat_remove_member",{p_conversation_id:i,p_user_id:c}),"remove member")},async sendMessage({conversationId:i,body:c,clientNonce:p,replyToId:b=null}){const y=await e.from("wein_chat_messages").insert({conversation_id:i,sender_id:a,body:c,client_nonce:p,reply_to_id:b}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(y.error)throw new Error(`send message: ${y.error.message||y.error}`);return M(y.data)},async updateMessage(i,c){const p=await e.from("wein_chat_messages").update({body:c,edited_at:new Date().toISOString()}).eq("id",i).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(p.error)throw new Error(`update message: ${p.error.message||p.error}`);return M(p.data)},async deleteMessage(i){const c=await e.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",i).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(c.error)throw new Error(`delete message: ${c.error.message||c.error}`);return M(c.data)},async markRead(i,c){const p=await e.from("wein_chat_members").update({last_read_seq:c}).eq("conversation_id",i).eq("user_id",a).select("conversation_id, user_id, last_read_seq");if(!S(p,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(i,c){const p=await e.from("wein_chat_members").update({notification_level:c}).eq("conversation_id",i).eq("user_id",a).select("conversation_id, user_id, notification_level");if(!S(p,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(i){if(typeof e.channel!="function")return()=>{};const c=e.channel(`wein-chat:${a}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},i).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},i).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},i).subscribe();return()=>{typeof e.removeChannel=="function"?e.removeChannel(c):typeof c.unsubscribe=="function"&&c.unsubscribe()}},fetchConversation:t}}function rt(e){return typeof e.session.user=="object"&&e.session.user!==null?e.session.user:{}}function it(e){const a=rt(e),t=a.id;if(!t)throw new Error("Team chat requires an authenticated user id.");return{id:t,full_name:e.session.fullName||a.email||"Portal user",role:e.session.role||"team",email:a.email||null}}let U=null;function ot(e){U=e||null}function ct(){const e=at();P({id:"team-chat",mount(a,t){const i=U;U=null;const c=it(t),p=nt({supabase:t.session.client,currentUserId:c.id});return e.mount(a,{currentUser:c,service:p,initialConversationId:i})}})}const ne=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function lt(e){for(const a of ne)P({id:a,mount:()=>{e[a]()}})}function B(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const dt=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function ut(e,a){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${dt.map(t=>`<button class="chip ${e===t?"active":""}" type="button" onclick="${a}('${t.replace(/'/g,"\\'")}')">${t==="all"?"All":B(t)}</button>`).join("")}</div>`}function mt(e,a){return a==="all"||String(e||"")===a}function pt(e){return String(e?.category||e?.vertical||"-")}function ft(e){const a=String(e||"").toLowerCase();return a.includes("dining")?"dining":a.includes("health")?"health":a.includes("fun")?"fun":a.includes("hotel")?"hotels":""}function ht(e,a=Date.now()){return e?Math.floor((a-new Date(e).getTime())/864e5):0}function F(e=new Date){const a=new Date(e);return a.setHours(0,0,0,0),a}function gt(e,a=new Date){return e?Math.round((F(a).getTime()-F(e).getTime())/864e5):null}function re(e,a){let t=String(e||"").replace(/\D/g,"");if(!t)return null;t.startsWith("0")&&(t=`20${t.slice(1)}`);const i=`Hi! Following up on the WeIN offer sheet for ${a} - do you have 5 minutes today?`;return`https://wa.me/${t}?text=${encodeURIComponent(i)}`}function _t(e,a){const t=re(e,a);return t?`<a class="mini-btn" href="${B(t)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function k(e){return e.id}function vt(e){return h("profiles").find(a=>k(a)===e)??null}function bt(e){return h("providers").find(a=>k(a)===e)??null}function yt(e){return h("leads").find(a=>k(a)===e)??null}function wt(e){return h("tasks").find(a=>k(a)===e)??null}function St(e){return h("offers").find(a=>k(a)===e)??null}function Mt(e){return h("offers").filter(a=>a.provider_id===e)}function $t(e){return h("tasks").filter(a=>a.provider_id===e)}function Et(e){return h("tasks").filter(a=>a.lead_id===e)}const kt=Object.freeze(Object.defineProperty({__proto__:null,leadById:yt,offerById:St,offersForProvider:Mt,profileById:vt,providerById:bt,taskById:wt,tasksForLead:Et,tasksForProvider:$t},Symbol.toStringTag,{value:"Module"}));Xe();ct();const ie={api:ee,auth:{canDelete:G,canManageDeals:X,canEditProviderProfile:Z,navHiddenForRole:j,defaultViewForRole:x},platform:{getSupabaseClient:H,getAccessToken:O,getSessionContext:Ue},shared:{escapeHtml:B,daysSince:ht,startOfLocalDay:F,dayDiffFromToday:gt,whatsappLink:re,whatsappButtonHtml:_t,categoryChipsHtml:ut,matchesCategoryFilter:mt,categoryLabel:pt,catBadgeClass:ft},core:{createPortalContext:ze,getView:se,mountView:Qe,registeredViewIds:Ke,registerView:P},legacy:{LEGACY_VIEW_IDS:ne,registerLegacyViews:lt},features:{requestOpenChatConversation:ot},store:ae,selectors:kt};window.WEIN_PORTAL_MODULES=ie;for(const e of window.WEIN_PORTAL_MODULES_READY??[])e(ie);window.WEIN_PORTAL_MODULES_READY=[];
