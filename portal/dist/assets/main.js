function Y(e){return typeof e=="object"&&e!==null?e.role:e}function P(e){const a=Y(e);return a==="admin"||a==="manager"}const z=P;function K(e){const a=Y(e);return a==="admin"||a==="manager"||a==="deal_breaker"}const Ee={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function N(e){return e?Ee[e]??[]:[]}function J(e){return N(e).includes("pipeline")?"tasks":"pipeline"}function h(){return window.WEIN_PORTAL_LEGACY??{}}function O(){const e=h().supabaseClient;if(!e)throw new Error("Portal Supabase client is not available yet.");return e}function I(){const e=h().getSupabaseUrl?.();if(!e)throw new Error("Portal Supabase URL is not available yet.");return e}function Ce(){const e=h().getSupabaseAnonKey?.();if(!e)throw new Error("Portal Supabase anon key is not available yet.");return e}function D(){return h().getAccessToken?.()??null}function ke(){return{client:O(),accessToken:D()}}class Ie extends Error{constructor(a,t,r){super(a),this.status=t,this.body=r,this.name="PortalApiError"}status;body}function M(){const e=h().headers?.();if(e)return e;const a=Ce();return{apikey:a,Authorization:`Bearer ${D()||a}`,"Content-Type":"application/json"}}async function R(e,a){if(e.ok)return;const t=await e.text();throw new Ie(`Supabase ${a} failed: ${e.status}${t?` ${t}`:""}`,e.status,t)}async function De(e){const a=h().get;if(a)return a(e);const t=await fetch(`${I()}/rest/v1/${e}`,{headers:M()});return await R(t,"GET"),t.json()}async function qe(e,a){const t=h().post;if(t)return t(e,a);const r=await fetch(`${I()}/rest/v1/${e}`,{method:"POST",headers:{...M(),Prefer:"return=representation"},body:JSON.stringify(a)});return await R(r,"POST"),r.json()}async function Te(e,a){const t=h().patch;return t?t(e,a):(await fetch(`${I()}/rest/v1/${e}`,{method:"PATCH",headers:M(),body:JSON.stringify(a)})).ok}async function Le(e){const a=h().delete;if(a)return a(e);const t=await fetch(`${I()}/rest/v1/${e}`,{method:"DELETE",headers:M()});return await R(t,"DELETE"),!0}const Q={headers:M,get:De,post:qe,patch:Te,delete:Le},Ae={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function Pe(){const e=h().getCaches?.();return e?{providers:e.providers??[],offers:e.offers??[],negotiations:e.negotiations??[],files:e.files??[],leads:e.leads??[],outcomes:e.outcomes??[],tasks:e.tasks??[],profiles:e.profiles??[],redemptions:e.redemptions??[],campaigns:e.campaigns??[],calendarNotes:e.calendarNotes??[]}:Ae}function f(e){return Pe()[e]}function X(e,a){const t=h().setCache;if(!t)throw new Error("Portal cache bridge is not available yet.");t(e,[...a])}function Ne(e,a){X(e,a(f(e)))}const Z={get providers(){return f("providers")},get offers(){return f("offers")},get negotiations(){return f("negotiations")},get files(){return f("files")},get leads(){return f("leads")},get outcomes(){return f("outcomes")},get tasks(){return f("tasks")},get profiles(){return f("profiles")},get redemptions(){return f("redemptions")},get campaigns(){return f("campaigns")},get calendarNotes(){return f("calendarNotes")},getCache:f,replaceCache:X,updateCache:Ne};function C(){const e=window.WEIN??{};return{user:e.user,role:e.role??sessionStorage.getItem("weinRole"),fullName:e.fullName??null,accessToken:D(),client:O()}}function Oe(){const e=C();return{api:Q,store:Z,session:e,permissions:{canDelete:()=>P(C()),canManageDeals:()=>z(C()),canEditProviderProfile:()=>K(C()),navHiddenForRole:N,defaultViewForRole:J},navigate(a,t){window.showView?.(a,t)}}}const w=new Map;let k=null;function q(e){if(!e.id)throw new Error("View id is required.");if(w.has(e.id))throw new Error(`View already registered: ${e.id}`);w.set(e.id,e)}function x(e){return w.get(e)}function Re(){return[...w.keys()]}function Ue(){if(!k)return;const e=k;k=null,e()}function Fe(e,a,t){const r=x(e);if(!r)throw new Error(`Unknown portal view: ${e}`);Ue();const o=r.mount(a,t);k=typeof o=="function"?o:null}function Ge(){w.has("__dummy_cleanup_probe")||q({id:"__dummy_cleanup_probe",mount(e){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,e.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function He(e="chat"){const a=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${e}-${a}`}function j(e,a){return e.kind==="group"?e.title||"Untitled group":(e.members||[]).map(r=>r.profile).find(r=>r&&r.id!==a)?.full_name||"Direct message"}function je(e){return[...e].sort((a,t)=>{const r=a.last_message?.created_at||a.created_at,o=t.last_message?.created_at||t.created_at;return new Date(o).getTime()-new Date(r).getTime()})}function Ve(e,a){const t=(e.members||[]).find(o=>o.user_id===a),r=e.last_message?.message_seq||0;return Math.max(0,r-(t?.last_read_seq||0))}function We(e){if(!e)return"No messages yet";const a=(e.deleted_at?"Message deleted":e.body||"").trim();return a.length>82?`${a.slice(0,79)}...`:a}function l(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function V(e){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[e]||e}function Be(){return{id:"team-chat",mount(e,a){const t={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,composeOpen:!1,composeSearch:"",composeGroupTitle:"",composeSelectedMemberIds:new Set,openMessageMenuId:null,confirmingDeleteMessageId:null,loading:!0,error:null};let r=!1,o=a.initialConversationId||null,m=null,g=null;e.classList.add("wein-chat-root");function v(n){const i=n.target;if(i instanceof Element){if(t.composeOpen&&!i.closest("[data-chat-compose-popover]")&&!i.closest("[data-chat-compose-toggle]")){S();return}t.openMessageMenuId&&!i.closest("[data-chat-message-menu-panel]")&&!i.closest("[data-chat-message-menu]")&&(t.openMessageMenuId=null,p())}}function G(n){if(n.key==="Escape"){if(t.composeOpen){S();return}(t.openMessageMenuId||t.confirmingDeleteMessageId)&&(t.openMessageMenuId=null,t.confirmingDeleteMessageId=null,p())}}e.addEventListener?.("click",v),typeof document<"u"&&document.addEventListener("keydown",G);async function _({keepMessages:n=!0}={}){try{t.error=null;const[i,c]=await Promise.all([a.service.listProfiles(),a.service.listConversations()]);if(t.profiles=i,t.conversations=je(c),o&&(t.conversations.some(d=>d.id===o)&&(t.selectedConversationId=o),o=null),!t.selectedConversationId&&t.conversations.length&&(t.selectedConversationId=t.conversations[0].id),t.selectedConversationId&&n){t.messages=await a.service.listMessages(t.selectedConversationId);const d=t.messages.at(-1)?.message_seq||0;if(d)try{await a.service.markRead(t.selectedConversationId,d)}catch(s){console.error("Failed to mark chat messages as read",s)}}}catch(i){t.error=i.message||String(i)}finally{t.loading=!1,r||p()}}async function T(n){t.selectedConversationId=n,e.classList.add("chat-has-selection"),t.messages=await a.service.listMessages(n),r||p();const i=t.messages.at(-1)?.message_seq||0;if(i)try{await a.service.markRead(n,i)}catch(c){console.error("Failed to mark chat messages as read",c)}await _()}function ne(){e.classList.remove("chat-has-selection")}async function se(n){const i=n.querySelector("[data-chat-composer]"),c=i.value.trim();if(!c||!t.selectedConversationId)return;const d=t.replyToMessageId;i.value="",t.replyToMessageId=null;const s=await a.service.sendMessage({conversationId:t.selectedConversationId,body:c,clientNonce:He("portal-chat"),replyToId:d});t.messages=[...t.messages,s],r||p();try{await a.service.markRead(t.selectedConversationId,s.message_seq)}catch(u){console.error("Failed to mark chat message as read",u)}await _()}function re(n){n&&(t.replyToMessageId=n,p(),e.querySelector("[data-chat-composer]")?.focus())}function ie(){t.replyToMessageId=null,p()}function oe(){t.composeOpen=!0,p(),e.querySelector("[data-chat-compose-search]")?.focus()}function S({reset:n=!1}={}){t.composeOpen=!1,n&&(t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set),p()}function ce(n,i){const c=new Set(t.composeSelectedMemberIds);i?c.add(n):c.delete(n),t.composeSelectedMemberIds=c,p()}function le(n){const i=t.messages.find(d=>d.id===n);if(!i)return;t.editingMessageId=n,t.editDraft=i.body||"",p();const c=e.querySelector(`[data-chat-edit-input="${CSS.escape(n)}"]`);c?.focus(),c?.select?.()}function de(){t.editingMessageId=null,t.editDraft="",p()}async function ue(n){const i=n.dataset.chatEditForm,d=n.querySelector("[data-chat-edit-input]").value.trim();if(!i||!d)return;const s=await a.service.updateMessage(i,d);t.messages=t.messages.map(u=>u.id===s.id?s:u),t.editingMessageId=null,t.editDraft="",r||p(),await _()}async function me(n){if(!n)return;const i=await a.service.deleteMessage(n);t.messages=t.messages.map(c=>c.id===n?{...c,...i,body:"Message deleted",deleted_at:i.deleted_at||new Date().toISOString()}:c),t.replyToMessageId===n&&(t.replyToMessageId=null),t.confirmingDeleteMessageId=null,t.openMessageMenuId=null,r||p(),await _()}async function fe(n){const c=n.members.find(d=>d.user_id===a.currentUser.id)?.notification_level==="muted"?"all":"muted";await a.service.setNotificationLevel(n.id,c),t.conversations=t.conversations.map(d=>d.id!==n.id?d:{...d,members:d.members.map(s=>s.user_id===a.currentUser.id?{...s,notification_level:c}:s)}),r||p(),await _()}async function pe(n){if(!n)return;const i=await a.service.getOrCreateDm(n);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await T(i)}async function he(n,i){if(n=n.trim(),!n)return;const c=await a.service.createGroup(n,i);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await T(c)}function ge(){r||_()}function _e(n){const i=n.id===t.selectedConversationId?" selected":"",c=n.unread_count?`<span class="chat-count">${n.unread_count}</span>`:"";return`
          <button type="button" class="chat-conversation${i}" data-chat-select="${l(n.id)}">
            <span class="chat-conversation-title">${l(j(n,a.currentUser.id))}</span>
            ${c}
            <span class="chat-conversation-preview">${l(We(n.last_message))}</span>
          </button>
        `}function ve(){return["admin","manager"].includes(a.currentUser.role)}function ye(n){if(!t.composeOpen)return"";const i=t.composeSearch.trim().toLowerCase(),c=n.filter(u=>!i||(u.full_name||"").toLowerCase().includes(i)),d=t.composeSelectedMemberIds.size,s=d===1?[...t.composeSelectedMemberIds][0]:"";return`
          <div class="chat-compose-popover" data-chat-compose-popover role="dialog" aria-label="New conversation">
            <div class="chat-compose-popover-head">
              <strong>New conversation</strong>
              <button type="button" class="chat-icon-btn" data-chat-compose-close aria-label="Close new conversation"><i class="ti ti-x"></i></button>
            </div>
            <input data-chat-compose-search type="search" placeholder="Search people..." value="${l(t.composeSearch)}" autocomplete="off">
            <div class="chat-compose-summary">${d} selected</div>
            <div class="chat-compose-list">
              ${c.map(u=>{const E=t.composeSelectedMemberIds.has(u.id)?" checked":"";return`
                  <label class="chat-compose-person">
                    <input type="checkbox" data-chat-compose-member="${l(u.id)}"${E}>
                    <span class="chat-compose-avatar">${l((u.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${l(u.full_name||"Unknown")}</strong>
                      <span>${l(V(u.role))}</span>
                    </span>
                  </label>
                `}).join("")}
              ${c.length?"":'<div class="chat-muted">No matching people.</div>'}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${l(s)}"${d===1?"":" disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${l(t.composeGroupTitle)}">
                <button type="button" data-chat-create-group${t.composeGroupTitle.trim()?"":" disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
              </div>
            </div>
          </div>
        `}function H(n){const i=n.deleted_at?"Message deleted":n.body||"";return i.length>90?`${i.slice(0,87)}...`:i}function be(n){if(!n?.reply_to_id)return"";const i=t.messages.find(c=>c.id===n.reply_to_id);return i?`
          <div class="chat-quote">
            <strong>${l(i.sender?.full_name||"Unknown")}</strong>
            <span>${l(H(i))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function we(){const n=t.messages.find(i=>i.id===t.replyToMessageId);return n?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${l(n.sender?.full_name||"Unknown")}</strong>
              <span>${l(H(n))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function Me(n){return`
          <form class="chat-edit-form" data-chat-edit-form="${l(n.id)}">
            <input data-chat-edit-input="${l(n.id)}" type="text" value="${l(t.editDraft)}">
            <button type="submit" aria-label="Save edit"><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
          </form>
        `}function $e(n){const i=n.sender_id===a.currentUser.id?" mine":"",c=!!n.deleted_at,d=i&&!c,s=!c&&(i||ve()),u=n.edited_at&&!c?'<span class="chat-edited">(edited)</span>':"",E=c?"":`
            <button type="button" data-chat-reply="${l(n.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${d?`<button type="button" data-chat-edit="${l(n.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
            ${s?`<button type="button" data-chat-delete="${l(n.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>`:""}
        `,Se=c?"":`
          <div class="chat-message-actions" aria-label="Message actions">
            ${E}
          </div>
          <button type="button" class="chat-message-menu-btn" data-chat-message-menu="${l(n.id)}" aria-label="Message actions"><i class="ti ti-dots"></i></button>
          ${t.openMessageMenuId===n.id?`
            <div class="chat-message-menu" data-chat-message-menu-panel="${l(n.id)}">
              ${E}
            </div>
          `:""}
          ${t.confirmingDeleteMessageId===n.id?`
            <div class="chat-delete-confirm">
              <span>Delete message?</span>
              <button type="button" data-chat-confirm-delete="${l(n.id)}">Confirm</button>
              <button type="button" data-chat-cancel-delete="${l(n.id)}">Cancel</button>
            </div>
          `:""}
        `;return`
          <div class="chat-message${i}${c?" deleted":""}" tabindex="0" data-chat-message-id="${l(n.id)}">
            <div class="chat-message-meta">
              <span>${l(n.sender?.full_name||"Unknown")}</span>
              <span>#${n.message_seq} ${u}</span>
            </div>
            ${be(n)}
            ${t.editingMessageId===n.id?Me(n):`<div class="chat-message-body">${l(c?"Message deleted":n.body)}</div>`}
            ${Se}
          </div>
        `}function p(){const n=t.conversations.find(s=>s.id===t.selectedConversationId)||null,i=t.profiles.filter(s=>s.id!==a.currentUser.id),d=n?.members.find(s=>s.user_id===a.currentUser.id)?.notification_level==="muted";e.innerHTML=`
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <div class="chat-sidebar-tools">
                  <span class="chat-user-pill">${l(V(a.currentUser.role))}</span>
                  <button type="button" class="chat-icon-btn" data-chat-compose-toggle aria-label="New conversation" title="New conversation"><i class="ti ti-pencil-plus"></i></button>
                </div>
              </div>
              ${ye(i)}
              <div class="chat-conversation-list">
                ${t.loading?'<div class="chat-muted">Loading...</div>':""}
                ${t.conversations.map(_e).join("")}
                ${!t.loading&&!t.conversations.length?'<div class="chat-muted">No conversations yet.</div>':""}
              </div>
            </aside>
            <main class="chat-thread">
              ${t.error?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${l(t.error)}</span></div>`:""}
              ${n?`
                <header class="chat-thread-head">
                  <button type="button" class="chat-back-btn" data-chat-back aria-label="Back to conversations"><i class="ti ti-arrow-left"></i></button>
                  <div>
                    <div class="chat-eyebrow">${n.kind==="dm"?"Direct message":"Group"}</div>
                    <h2>${l(j(n,a.currentUser.id))}</h2>
                  </div>
                  <div class="chat-thread-tools">
                    <button type="button" class="chat-icon-btn${d?" active":""}" data-chat-toggle-mute aria-label="${d?"Unmute conversation":"Mute conversation"}" title="${d?"Unmute conversation":"Mute conversation"}">
                      <i class="ti ${d?"ti-bell-off":"ti-bell"}"></i>
                    </button>
                    <div class="chat-member-stack">
                      ${n.members.map(s=>`<span title="${l(s.profile?.full_name||s.user_id)}">${l((s.profile?.full_name||"?").slice(0,1))}</span>`).join("")}
                    </div>
                  </div>
                </header>
                <div class="chat-message-list">
                  ${t.messages.map($e).join("")}
                  ${t.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  ${we()}
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
        `,e.querySelectorAll("[data-chat-select]").forEach(s=>{s.addEventListener("click",()=>T(s.dataset.chatSelect))}),e.querySelector("[data-chat-back]")?.addEventListener("click",()=>ne()),e.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{n&&fe(n)}),e.querySelector("[data-chat-compose-toggle]")?.addEventListener("click",()=>{t.composeOpen?S():oe()}),e.querySelector("[data-chat-compose-close]")?.addEventListener("click",()=>S()),e.querySelector("[data-chat-compose-search]")?.addEventListener("input",s=>{t.composeSearch=s.currentTarget.value,p();const u=e.querySelector("[data-chat-compose-search]");u?.focus(),u?.setSelectionRange?.(u.value.length,u.value.length)}),e.querySelectorAll("[data-chat-compose-member]").forEach(s=>{s.addEventListener("change",()=>ce(s.dataset.chatComposeMember,s.checked))}),e.querySelector("[data-chat-group-title]")?.addEventListener("input",s=>{t.composeGroupTitle=s.currentTarget.value,p();const u=e.querySelector("[data-chat-group-title]");u?.focus(),u?.setSelectionRange?.(u.value.length,u.value.length)}),e.querySelector("[data-chat-start-dm]")?.addEventListener("click",s=>{pe(s.currentTarget.dataset.chatStartDm)}),e.querySelector("[data-chat-create-group]")?.addEventListener("click",()=>{he(t.composeGroupTitle,[...t.composeSelectedMemberIds])}),e.querySelector("[data-chat-send-form]")?.addEventListener("submit",s=>{s.preventDefault(),se(s.currentTarget)}),e.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>ie()),e.querySelectorAll("[data-chat-reply]").forEach(s=>{s.addEventListener("click",()=>re(s.dataset.chatReply))}),e.querySelectorAll("[data-chat-edit]").forEach(s=>{s.addEventListener("click",()=>le(s.dataset.chatEdit))}),e.querySelectorAll("[data-chat-delete]").forEach(s=>{s.addEventListener("click",()=>{t.confirmingDeleteMessageId=s.dataset.chatDelete,t.openMessageMenuId=null,p()})}),e.querySelectorAll("[data-chat-message-menu]").forEach(s=>{s.addEventListener("click",()=>{t.openMessageMenuId=t.openMessageMenuId===s.dataset.chatMessageMenu?null:s.dataset.chatMessageMenu,t.confirmingDeleteMessageId=null,p()})}),e.querySelectorAll("[data-chat-confirm-delete]").forEach(s=>{s.addEventListener("click",()=>me(s.dataset.chatConfirmDelete))}),e.querySelectorAll("[data-chat-cancel-delete]").forEach(s=>{s.addEventListener("click",()=>{t.confirmingDeleteMessageId===s.dataset.chatCancelDelete&&(t.confirmingDeleteMessageId=null),p()})}),e.querySelectorAll("[data-chat-edit-form]").forEach(s=>{s.addEventListener("submit",u=>{u.preventDefault(),ue(u.currentTarget)})}),e.querySelectorAll("[data-chat-cancel-edit]").forEach(s=>{s.addEventListener("click",()=>de())})}return _(),m=setInterval(()=>_(),3e4),typeof a.service.subscribeToConversationEvents=="function"&&(g=a.service.subscribeToConversationEvents(()=>ge())),()=>{r=!0,m&&clearInterval(m),g&&g(),e.removeEventListener?.("click",v),typeof document<"u"&&document.removeEventListener("keydown",G),e.classList.remove("wein-chat-root"),e.classList.remove("chat-has-selection"),e.innerHTML=""}}}}function y(e,a){if(e.error)throw new Error(`${a}: ${e.error.message||e.error}`);return e.data||[]}function W(e,a){if(e.error)throw new Error(`${a}: ${e.error.message||e.error}`);return e.data}function U(e){return e?{id:e.id,full_name:e.full_name,role:e.role,email:e.email??null}:null}function Ye(e){return{conversation_id:e.conversation_id,user_id:e.user_id,membership_role:e.membership_role,joined_at:e.joined_at,left_at:e.left_at,last_read_seq:Number(e.last_read_seq||0),notification_level:e.notification_level,profile:U(e.profile||e.profiles)}}function b(e){return{id:e.id,conversation_id:e.conversation_id,message_seq:Number(e.message_seq||0),sender_id:e.sender_id,body:e.body,reply_to_id:e.reply_to_id,client_nonce:e.client_nonce,created_at:e.created_at,edited_at:e.edited_at,deleted_at:e.deleted_at,sender:U(e.sender||e.profiles)}}function B(e,a){const t=(e.members||e.wein_chat_members||[]).map(Ye),r=e.last_message||e.wein_chat_messages||[],o=Array.isArray(r)&&r.length?b(r[0]):null,m={id:e.id,kind:e.kind,title:e.title,created_by:e.created_by,created_at:e.created_at,archived_at:e.archived_at,members:t,last_message:o,unread_count:0};return m.unread_count=Ve(m,a),m}function ze({supabase:e,currentUserId:a}){if(!e)throw new Error("supabase client is required");if(!a)throw new Error("currentUserId is required");async function t(r){const o=await e.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",r).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"}).single();if(o.error)throw new Error(`fetch conversation: ${o.error.message||o.error}`);return B(o.data,a)}return{async listProfiles(){const r=await e.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return y(r,"list profiles").map(U)},async listConversations(){const r=await e.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"});return y(r,"list conversations").map(o=>B(o,a))},async listMessages(r){const o=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",r).is("deleted_at",null).order("message_seq",{ascending:!0});return y(o,"list messages").map(b)},async createGroup(r,o=[]){const m=W(await e.rpc("wein_chat_create_group",{p_title:r}),"create group");for(const g of o)await this.addMember(m,g);return m},async getOrCreateDm(r){return W(await e.rpc("wein_chat_get_or_create_dm",{p_other_user_id:r}),"get or create DM")},async addMember(r,o){const m=await e.from("wein_chat_members").insert({conversation_id:r,user_id:o,membership_role:"member"}).select("conversation_id, user_id");if(!y(m,"add member").length)throw new Error("add member affected zero rows")},async sendMessage({conversationId:r,body:o,clientNonce:m,replyToId:g=null}){const v=await e.from("wein_chat_messages").insert({conversation_id:r,sender_id:a,body:o,client_nonce:m,reply_to_id:g}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(v.error)throw new Error(`send message: ${v.error.message||v.error}`);return b(v.data)},async updateMessage(r,o){const m=await e.from("wein_chat_messages").update({body:o,edited_at:new Date().toISOString()}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(m.error)throw new Error(`update message: ${m.error.message||m.error}`);return b(m.data)},async deleteMessage(r){const o=await e.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(o.error)throw new Error(`delete message: ${o.error.message||o.error}`);return b(o.data)},async markRead(r,o){const m=await e.from("wein_chat_members").update({last_read_seq:o}).eq("conversation_id",r).eq("user_id",a).select("conversation_id, user_id, last_read_seq");if(!y(m,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(r,o){const m=await e.from("wein_chat_members").update({notification_level:o}).eq("conversation_id",r).eq("user_id",a).select("conversation_id, user_id, notification_level");if(!y(m,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(r){if(typeof e.channel!="function")return()=>{};const o=e.channel(`wein-chat:${a}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},r).subscribe();return()=>{typeof e.removeChannel=="function"?e.removeChannel(o):typeof o.unsubscribe=="function"&&o.unsubscribe()}},fetchConversation:t}}function Ke(e){return typeof e.session.user=="object"&&e.session.user!==null?e.session.user:{}}function Je(e){const a=Ke(e),t=a.id;if(!t)throw new Error("Team chat requires an authenticated user id.");return{id:t,full_name:e.session.fullName||a.email||"Portal user",role:e.session.role||"team",email:a.email||null}}let L=null;function Qe(e){L=e||null}function Xe(){const e=Be();q({id:"team-chat",mount(a,t){const r=L;L=null;const o=Je(t),m=ze({supabase:t.session.client,currentUserId:o.id});return e.mount(a,{currentUser:o,service:m,initialConversationId:r})}})}const ee=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function Ze(e){for(const a of ee)q({id:a,mount:()=>{e[a]()}})}function F(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const xe=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function et(e,a){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${xe.map(t=>`<button class="chip ${e===t?"active":""}" type="button" onclick="${a}('${t.replace(/'/g,"\\'")}')">${t==="all"?"All":F(t)}</button>`).join("")}</div>`}function tt(e,a){return a==="all"||String(e||"")===a}function at(e){return String(e?.category||e?.vertical||"-")}function nt(e){const a=String(e||"").toLowerCase();return a.includes("dining")?"dining":a.includes("health")?"health":a.includes("fun")?"fun":a.includes("hotel")?"hotels":""}function st(e,a=Date.now()){return e?Math.floor((a-new Date(e).getTime())/864e5):0}function A(e=new Date){const a=new Date(e);return a.setHours(0,0,0,0),a}function rt(e,a=new Date){return e?Math.round((A(a).getTime()-A(e).getTime())/864e5):null}function te(e,a){let t=String(e||"").replace(/\D/g,"");if(!t)return null;t.startsWith("0")&&(t=`20${t.slice(1)}`);const r=`Hi! Following up on the WeIN offer sheet for ${a} - do you have 5 minutes today?`;return`https://wa.me/${t}?text=${encodeURIComponent(r)}`}function it(e,a){const t=te(e,a);return t?`<a class="mini-btn" href="${F(t)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function $(e){return e.id}function ot(e){return f("profiles").find(a=>$(a)===e)??null}function ct(e){return f("providers").find(a=>$(a)===e)??null}function lt(e){return f("leads").find(a=>$(a)===e)??null}function dt(e){return f("tasks").find(a=>$(a)===e)??null}function ut(e){return f("offers").find(a=>$(a)===e)??null}function mt(e){return f("offers").filter(a=>a.provider_id===e)}function ft(e){return f("tasks").filter(a=>a.provider_id===e)}function pt(e){return f("tasks").filter(a=>a.lead_id===e)}const ht=Object.freeze(Object.defineProperty({__proto__:null,leadById:lt,offerById:ut,offersForProvider:mt,profileById:ot,providerById:ct,taskById:dt,tasksForLead:pt,tasksForProvider:ft},Symbol.toStringTag,{value:"Module"}));Ge();Xe();const ae={api:Q,auth:{canDelete:P,canManageDeals:z,canEditProviderProfile:K,navHiddenForRole:N,defaultViewForRole:J},platform:{getSupabaseClient:O,getAccessToken:D,getSessionContext:ke},shared:{escapeHtml:F,daysSince:st,startOfLocalDay:A,dayDiffFromToday:rt,whatsappLink:te,whatsappButtonHtml:it,categoryChipsHtml:et,matchesCategoryFilter:tt,categoryLabel:at,catBadgeClass:nt},core:{createPortalContext:Oe,getView:x,mountView:Fe,registeredViewIds:Re,registerView:q},legacy:{LEGACY_VIEW_IDS:ee,registerLegacyViews:Ze},features:{requestOpenChatConversation:Qe},store:Z,selectors:ht};window.WEIN_PORTAL_MODULES=ae;for(const e of window.WEIN_PORTAL_MODULES_READY??[])e(ae);window.WEIN_PORTAL_MODULES_READY=[];
