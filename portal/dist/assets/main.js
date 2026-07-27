function me(e){return typeof e=="object"&&e!==null?e.role:e}function X(e){const n=me(e);return n==="admin"||n==="manager"}const fe=X;function pe(e){const n=me(e);return n==="admin"||n==="manager"||n==="deal_breaker"}const Ke={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function Z(e){return e?Ke[e]??[]:[]}function he(e){return Z(e).includes("pipeline")?"tasks":"pipeline"}function D(){return window.WEIN_PORTAL_LEGACY??{}}function ee(){const e=D().supabaseClient;if(!e)throw new Error("Portal Supabase client is not available yet.");return e}function x(){const e=D().getSupabaseUrl?.();if(!e)throw new Error("Portal Supabase URL is not available yet.");return e}function Je(){const e=D().getSupabaseAnonKey?.();if(!e)throw new Error("Portal Supabase anon key is not available yet.");return e}function V(){return D().getAccessToken?.()??null}function Qe(){return{client:ee(),accessToken:V()}}class Xe extends Error{constructor(n,t,a){super(n),this.status=t,this.body=a,this.name="PortalApiError"}status;body}function P(){const e=D().headers?.();if(e)return e;const n=Je();return{apikey:n,Authorization:`Bearer ${V()||n}`,"Content-Type":"application/json"}}async function te(e,n){if(e.ok)return;const t=await e.text();throw new Xe(`Supabase ${n} failed: ${e.status}${t?` ${t}`:""}`,e.status,t)}async function Ze(e){const n=D().get;if(n)return n(e);const t=await fetch(`${x()}/rest/v1/${e}`,{headers:P()});return await te(t,"GET"),t.json()}async function et(e,n){const t=D().post;if(t)return t(e,n);const a=await fetch(`${x()}/rest/v1/${e}`,{method:"POST",headers:{...P(),Prefer:"return=representation"},body:JSON.stringify(n)});return await te(a,"POST"),a.json()}async function tt(e,n){const t=D().patch;return t?t(e,n):(await fetch(`${x()}/rest/v1/${e}`,{method:"PATCH",headers:P(),body:JSON.stringify(n)})).ok}async function nt(e){const n=D().delete;if(n)return n(e);const t=await fetch(`${x()}/rest/v1/${e}`,{method:"DELETE",headers:P()});return await te(t,"DELETE"),!0}const _e={headers:P,get:Ze,post:et,patch:tt,delete:nt},st={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function at(){const e=D().getCaches?.();return e?{providers:e.providers??[],offers:e.offers??[],negotiations:e.negotiations??[],files:e.files??[],leads:e.leads??[],outcomes:e.outcomes??[],tasks:e.tasks??[],profiles:e.profiles??[],redemptions:e.redemptions??[],campaigns:e.campaigns??[],calendarNotes:e.calendarNotes??[]}:st}function M(e){return at()[e]}function ge(e,n){const t=D().setCache;if(!t)throw new Error("Portal cache bridge is not available yet.");t(e,[...n])}function rt(e,n){ge(e,n(M(e)))}const ve={get providers(){return M("providers")},get offers(){return M("offers")},get negotiations(){return M("negotiations")},get files(){return M("files")},get leads(){return M("leads")},get outcomes(){return M("outcomes")},get tasks(){return M("tasks")},get profiles(){return M("profiles")},get redemptions(){return M("redemptions")},get campaigns(){return M("campaigns")},get calendarNotes(){return M("calendarNotes")},getCache:M,replaceCache:ge,updateCache:rt};function W(){const e=window.WEIN??{};return{user:e.user,role:e.role??sessionStorage.getItem("weinRole"),fullName:e.fullName??null,accessToken:V(),client:ee()}}function it(){const e=W();return{api:_e,store:ve,session:e,permissions:{canDelete:()=>X(W()),canManageDeals:()=>fe(W()),canEditProviderProfile:()=>pe(W()),navHiddenForRole:Z,defaultViewForRole:he},navigate(n,t){window.showView?.(n,t)}}}const N=new Map;let G=null;function z(e){if(!e.id)throw new Error("View id is required.");if(N.has(e.id))throw new Error(`View already registered: ${e.id}`);N.set(e.id,e)}function be(e){return N.get(e)}function ot(){return[...N.keys()]}function ct(){if(!G)return;const e=G;G=null,e()}function lt(e,n,t){const a=be(e);if(!a)throw new Error(`Unknown portal view: ${e}`);ct();const o=a.mount(n,t);G=typeof o=="function"?o:null}function dt(){N.has("__dummy_cleanup_probe")||z({id:"__dummy_cleanup_probe",mount(e){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,e.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function ut(e="chat"){const n=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${e}-${n}`}function ie(e,n){return e.kind==="group"?e.title||"Untitled group":(e.members||[]).map(a=>a.profile).find(a=>a&&a.id!==n)?.full_name||"Direct message"}function mt(e){return[...e].sort((n,t)=>{const a=n.last_message?.created_at||n.created_at,o=t.last_message?.created_at||t.created_at;return new Date(o).getTime()-new Date(a).getTime()})}function ft(e,n){const t=(e.members||[]).find(o=>o.user_id===n),a=e.last_message?.message_seq||0;return Math.max(0,a-(t?.last_read_seq||0))}function pt(e){if(!e)return"No messages yet";const n=(e.deleted_at?"Message deleted":e.body||"").trim();return n.length>82?`${n.slice(0,79)}...`:n}function m(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function j(e){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[e]||e}function ht(e,n=new Date){if(!e)return"";const t=new Date(e);if(Number.isNaN(t.getTime()))return"";const a=n.getTime()-t.getTime(),o=Math.floor(a/6e4);if(o<1)return"now";if(o<60)return`${o}m`;const c=Math.floor(o/60);return c<24?`${c}h`:a<6*864e5?t.toLocaleDateString(void 0,{weekday:"short"}):t.toLocaleDateString(void 0,{month:"short",day:"numeric"})}const _t=300*1e3;function gt(e,n){if(!n||e.sender_id!==n.sender_id)return!0;const t=new Date(e.created_at).getTime()-new Date(n.created_at).getTime();return!(t>=0&&t<_t)}function vt(){return{id:"team-chat",mount(e,n){const t={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,composeOpen:!1,composeSearch:"",composeGroupTitle:"",composeSelectedMemberIds:new Set,membersOpen:!1,memberAddOpen:!1,memberSearch:"",memberSelectedIds:new Set,openMessageMenuId:null,confirmingDeleteMessageId:null,loading:!0,error:null};let a=!1,o=n.initialConversationId||null,c=null,f=null,_=!1;function T(){const s=e.querySelector(".chat-message-list");return s?s.scrollHeight-s.scrollTop-s.clientHeight<80:!0}function $(){const s=e.querySelector(".chat-message-list");s&&(s.scrollTop=s.scrollHeight)}function d(s){s.style.height="auto",s.style.height=`${Math.min(s.scrollHeight,120)}px`}e.classList.add("wein-chat-root");function g(s){const r=s.target;if(r instanceof Element){if(t.composeOpen&&!r.closest("[data-chat-compose-popover]")&&!r.closest("[data-chat-compose-toggle]")){F();return}if(t.membersOpen&&!r.closest("[data-chat-members-panel]")&&!r.closest("[data-chat-members-toggle]")){H();return}t.openMessageMenuId&&!r.closest("[data-chat-message-menu-panel]")&&!r.closest("[data-chat-message-menu]")&&(t.openMessageMenuId=null,v())}}function S(s){if(s.key==="Escape"){if(t.composeOpen){F();return}if(t.membersOpen){H();return}(t.openMessageMenuId||t.confirmingDeleteMessageId)&&(t.openMessageMenuId=null,t.confirmingDeleteMessageId=null,v())}}e.addEventListener?.("click",g),typeof document<"u"&&document.addEventListener("keydown",S);async function w({keepMessages:s=!0}={}){try{t.error=null;const[r,l]=await Promise.all([n.service.listProfiles(),n.service.listConversations()]);if(t.profiles=r,t.conversations=mt(l),o&&(t.conversations.some(p=>p.id===o)&&(t.selectedConversationId=o),o=null),!t.selectedConversationId&&t.conversations.length&&(t.selectedConversationId=t.conversations[0].id),t.selectedConversationId&&s){t.messages=await n.service.listMessages(t.selectedConversationId);const p=t.messages.at(-1)?.message_seq||0;if(p)try{await n.service.markRead(t.selectedConversationId,p)}catch(y){console.error("Failed to mark chat messages as read",y)}}}catch(r){t.error=r.message||String(r)}finally{t.loading=!1,a||v()}}async function u(s){t.selectedConversationId=s,t.membersOpen=!1,t.memberAddOpen=!1,t.memberSearch="",t.memberSelectedIds=new Set,e.classList.add("chat-has-selection"),t.messages=await n.service.listMessages(s),_=!0,a||v();const r=t.messages.at(-1)?.message_seq||0;if(r)try{await n.service.markRead(s,r)}catch(l){console.error("Failed to mark chat messages as read",l)}await w()}function E(){e.classList.remove("chat-has-selection")}async function h(s){const r=s.querySelector("[data-chat-composer]"),l=r.value.trim();if(!l||!t.selectedConversationId)return;const p=t.replyToMessageId;r.value="",t.replyToMessageId=null;const y=await n.service.sendMessage({conversationId:t.selectedConversationId,body:l,clientNonce:ut("portal-chat"),replyToId:p});t.messages=[...t.messages,y],_=!0,a||v();try{await n.service.markRead(t.selectedConversationId,y.message_seq)}catch(C){console.error("Failed to mark chat message as read",C)}await w()}function Y(s){s&&(t.replyToMessageId=s,v(),e.querySelector("[data-chat-composer]")?.focus())}function K(){t.replyToMessageId=null,v()}function ke(){t.composeOpen=!0,v(),e.querySelector("[data-chat-compose-search]")?.focus()}function F({reset:s=!1}={}){t.composeOpen=!1,s&&(t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set),v()}function Me(s,r){const l=new Set(t.composeSelectedMemberIds);r?l.add(s):l.delete(s),t.composeSelectedMemberIds=l,v()}function Ee(s){return!s||s.kind!=="group"?!1:s.members.find(l=>l.user_id===n.currentUser.id&&!l.left_at)?.membership_role==="owner"||["admin","manager"].includes(n.currentUser.role)}function Ce(){t.membersOpen=!0,v()}function H({reset:s=!1}={}){t.membersOpen=!1,t.memberAddOpen=!1,s&&(t.memberSearch="",t.memberSelectedIds=new Set),v()}function Ie(){t.memberAddOpen=!t.memberAddOpen,v(),t.memberAddOpen&&e.querySelector("[data-chat-member-search]")?.focus()}function Te(s,r){const l=new Set(t.memberSelectedIds);r?l.add(s):l.delete(s),t.memberSelectedIds=l,v()}async function qe(s){const r=[...t.memberSelectedIds];if(!(!s||!r.length)){for(const l of r)await n.service.addMember(s,l);t.memberSearch="",t.memberSelectedIds=new Set,t.memberAddOpen=!1,a||v(),await w()}}async function De(s,r){!s||!r||(await n.service.removeMember(s,r),t.conversations=t.conversations.map(l=>l.id!==s?l:{...l,members:l.members.map(p=>p.user_id===r?{...p,left_at:p.left_at||new Date().toISOString()}:p)}),r===n.currentUser.id&&(t.membersOpen=!1,t.memberAddOpen=!1),a||v(),await w())}function Le(s){const r=t.messages.find(p=>p.id===s);if(!r)return;t.editingMessageId=s,t.editDraft=r.body||"",v();const l=e.querySelector(`[data-chat-edit-input="${CSS.escape(s)}"]`);l?.focus(),l?.select?.()}function Ae(){t.editingMessageId=null,t.editDraft="",v()}async function Oe(s){const r=s.dataset.chatEditForm,p=s.querySelector("[data-chat-edit-input]").value.trim();if(!r||!p)return;const y=await n.service.updateMessage(r,p);t.messages=t.messages.map(C=>C.id===y.id?y:C),t.editingMessageId=null,t.editDraft="",a||v(),await w()}async function Re(s){if(!s)return;const r=await n.service.deleteMessage(s);t.messages=t.messages.map(l=>l.id===s?{...l,...r,body:"Message deleted",deleted_at:r.deleted_at||new Date().toISOString()}:l),t.replyToMessageId===s&&(t.replyToMessageId=null),t.confirmingDeleteMessageId=null,t.openMessageMenuId=null,a||v(),await w()}async function Ne(s){const l=s.members.find(p=>p.user_id===n.currentUser.id)?.notification_level==="muted"?"all":"muted";await n.service.setNotificationLevel(s.id,l),t.conversations=t.conversations.map(p=>p.id!==s.id?p:{...p,members:p.members.map(y=>y.user_id===n.currentUser.id?{...y,notification_level:l}:y)}),a||v(),await w()}async function Pe(s){if(!s)return;const r=await n.service.getOrCreateDm(s);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await u(r)}async function Ue(s,r){if(s=s.trim(),!s)return;const l=await n.service.createGroup(s,r);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await u(l)}function Fe(){a||w()}function He(s){const r=s.id===t.selectedConversationId?" selected":"",l=s.unread_count?`<span class="chat-count">${s.unread_count}</span>`:"",p=ie(s,n.currentUser.id),y=ht(s.last_message?.created_at);return`
          <button type="button" class="chat-conversation${r}" data-chat-select="${m(s.id)}">
            <span class="chat-conversation-avatar" aria-hidden="true">${m((p||"?").slice(0,1).toUpperCase())}</span>
            <span class="chat-conversation-body">
              <span class="chat-conversation-row">
                <span class="chat-conversation-title">${m(p)}</span>
                ${y?`<span class="chat-conversation-timestamp">${m(y)}</span>`:""}
                ${l}
              </span>
              <span class="chat-conversation-preview">${m(pt(s.last_message))}</span>
            </span>
          </button>
        `}function We(){return["admin","manager"].includes(n.currentUser.role)}function je(s){if(!t.composeOpen)return"";const r=t.composeSearch.trim().toLowerCase(),l=s.filter(C=>!r||(C.full_name||"").toLowerCase().includes(r)),p=t.composeSelectedMemberIds.size,y=p===1?[...t.composeSelectedMemberIds][0]:"";return`
          <div class="chat-compose-popover" data-chat-compose-popover role="dialog" aria-label="New conversation">
            <div class="chat-compose-popover-head">
              <strong>New conversation</strong>
              <button type="button" class="chat-icon-btn" data-chat-compose-close aria-label="Close new conversation"><i class="ti ti-x"></i></button>
            </div>
            <input data-chat-compose-search type="search" placeholder="Search people..." value="${m(t.composeSearch)}" autocomplete="off">
            <div class="chat-compose-summary">${p} selected</div>
            <div class="chat-compose-list">
              ${l.map(C=>{const L=t.composeSelectedMemberIds.has(C.id)?" checked":"";return`
                  <label class="chat-compose-person">
                    <input type="checkbox" data-chat-compose-member="${m(C.id)}"${L}>
                    <span class="chat-compose-avatar">${m((C.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${m(C.full_name||"Unknown")}</strong>
                      <span>${m(j(C.role))}</span>
                    </span>
                  </label>
                `}).join("")}
              ${l.length?"":'<div class="chat-muted">No matching people.</div>'}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${m(y)}"${p===1?"":" disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${m(t.composeGroupTitle)}">
                <button type="button" data-chat-create-group${t.composeGroupTitle.trim()?"":" disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
              </div>
            </div>
          </div>
        `}function Be(s){if(!t.membersOpen||!s||s.kind!=="group")return"";const r=s.members.filter(b=>!b.left_at),l=Ee(s),p=new Set(r.map(b=>b.user_id)),y=t.memberSearch.trim().toLowerCase(),C=t.profiles.filter(b=>b.id!==n.currentUser.id&&!p.has(b.id)&&(!y||(b.full_name||"").toLowerCase().includes(y))),L=t.memberSelectedIds.size;return`
          <div class="chat-compose-popover chat-members-panel" data-chat-members-panel role="dialog" aria-label="Manage members">
            <div class="chat-compose-popover-head">
              <strong>Manage members</strong>
              <button type="button" class="chat-icon-btn" data-chat-members-close aria-label="Close member management"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-member-panel-list">
              ${r.map(b=>{const i=b.profile||{},k=b.user_id===n.currentUser.id,Ye=l||k;return`
                  <div class="chat-member-row" data-chat-member-row="${m(b.user_id)}">
                    <span class="chat-compose-avatar">${m((i.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${m(i.full_name||b.user_id)}</strong>
                      <span>${m(i.role?j(i.role):"Member")}</span>
                    </span>
                    ${b.membership_role==="owner"?'<span class="chat-owner-badge">Owner</span>':""}
                    ${Ye?`
                      <button type="button" class="chat-member-remove" data-chat-remove-member="${m(b.user_id)}">
                        <i class="ti ${k?"ti-logout":"ti-user-minus"}"></i><span>${k?"Leave":"Remove"}</span>
                      </button>
                    `:""}
                  </div>
                `}).join("")}
            </div>
            ${l?`
              <div class="chat-member-add">
                <button type="button" class="chat-member-add-toggle" data-chat-member-add-toggle>
                  <i class="ti ti-user-plus"></i><span>Add member</span>
                </button>
                ${t.memberAddOpen?`
                  <input data-chat-member-search type="search" placeholder="Search people..." value="${m(t.memberSearch)}" autocomplete="off">
                  <div class="chat-compose-summary">${L} selected</div>
                  <div class="chat-compose-list">
                    ${C.map(b=>{const i=t.memberSelectedIds.has(b.id)?" checked":"";return`
                        <label class="chat-compose-person">
                          <input type="checkbox" data-chat-member-pick="${m(b.id)}"${i}>
                          <span class="chat-compose-avatar">${m((b.full_name||"?").slice(0,1))}</span>
                          <span class="chat-compose-person-copy">
                            <strong>${m(b.full_name||"Unknown")}</strong>
                            <span>${m(j(b.role))}</span>
                          </span>
                        </label>
                      `}).join("")}
                    ${C.length?"":'<div class="chat-muted">No matching people.</div>'}
                  </div>
                  <div class="chat-compose-actions">
                    <button type="button" data-chat-add-members="${m(s.id)}"${L?"":" disabled"}><i class="ti ti-users-plus"></i><span>Add selected</span></button>
                  </div>
                `:""}
              </div>
            `:""}
          </div>
        `}function re(s){const r=s.deleted_at?"Message deleted":s.body||"";return r.length>90?`${r.slice(0,87)}...`:r}function Ge(s){if(!s?.reply_to_id)return"";const r=t.messages.find(l=>l.id===s.reply_to_id);return r?`
          <div class="chat-quote">
            <strong>${m(r.sender?.full_name||"Unknown")}</strong>
            <span>${m(re(r))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function xe(){const s=t.messages.find(r=>r.id===t.replyToMessageId);return s?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${m(s.sender?.full_name||"Unknown")}</strong>
              <span>${m(re(s))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function Ve(s){return`
          <form class="chat-edit-form" data-chat-edit-form="${m(s.id)}">
            <input data-chat-edit-input="${m(s.id)}" type="text" value="${m(t.editDraft)}">
            <button type="submit" aria-label="Save edit"><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
          </form>
        `}function ze(s,r=!0){const l=s.sender_id===n.currentUser.id?" mine":"",p=!!s.deleted_at,y=l&&!p,C=!p&&(l||We()),L=s.edited_at&&!p?'<span class="chat-edited">(edited)</span>':"",b=p?"":`
            <button type="button" data-chat-reply="${m(s.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${y?`<button type="button" data-chat-edit="${m(s.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
            ${C?`<button type="button" data-chat-delete="${m(s.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>`:""}
        `,i=p?"":`
          <div class="chat-message-actions" aria-label="Message actions">
            ${b}
          </div>
          <button type="button" class="chat-message-menu-btn" data-chat-message-menu="${m(s.id)}" aria-label="Message actions"><i class="ti ti-dots"></i></button>
          ${t.openMessageMenuId===s.id?`
            <div class="chat-message-menu" data-chat-message-menu-panel="${m(s.id)}">
              ${b}
            </div>
          `:""}
          ${t.confirmingDeleteMessageId===s.id?`
            <div class="chat-delete-confirm">
              <span>Delete message?</span>
              <button type="button" data-chat-confirm-delete="${m(s.id)}">Confirm</button>
              <button type="button" data-chat-cancel-delete="${m(s.id)}">Cancel</button>
            </div>
          `:""}
        `;return`
          <div class="chat-message${l}${p?" deleted":""}${r?"":" chat-message-grouped"}" tabindex="0" data-chat-message-id="${m(s.id)}">
            ${r?`
              <div class="chat-message-meta">
                <span>${m(s.sender?.full_name||"Unknown")}</span>
                <span>#${s.message_seq} ${L}</span>
              </div>
            `:""}
            ${Ge(s)}
            ${t.editingMessageId===s.id?Ve(s):`<div class="chat-message-body">${m(p?"Message deleted":s.body)}</div>`}
            ${i}
          </div>
        `}function v(){const s=_||T();_=!1;const r=t.conversations.find(i=>i.id===t.selectedConversationId)||null,l=t.profiles.filter(i=>i.id!==n.currentUser.id),y=r?.members.find(i=>i.user_id===n.currentUser.id)?.notification_level==="muted",C=r?.members.filter(i=>!i.left_at)||[];e.innerHTML=`
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <div class="chat-sidebar-tools">
                  <span class="chat-user-pill">${m(j(n.currentUser.role))}</span>
                  <button type="button" class="chat-icon-btn" data-chat-compose-toggle aria-label="New conversation" title="New conversation"><i class="ti ti-pencil-plus"></i></button>
                </div>
              </div>
              ${je(l)}
              <div class="chat-conversation-list">
                ${t.loading?'<div class="chat-muted">Loading...</div>':""}
                ${t.conversations.map(He).join("")}
                ${!t.loading&&!t.conversations.length?'<div class="chat-muted">No conversations yet.</div>':""}
              </div>
            </aside>
            <main class="chat-thread">
              ${t.error?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${m(t.error)}</span></div>`:""}
              ${r?`
                <header class="chat-thread-head">
                  <button type="button" class="chat-back-btn" data-chat-back aria-label="Back to conversations"><i class="ti ti-arrow-left"></i></button>
                  <div>
                    <div class="chat-eyebrow">${r.kind==="dm"?"Direct message":"Group"}</div>
                    <h2>${m(ie(r,n.currentUser.id))}</h2>
                  </div>
                  <div class="chat-thread-tools">
                    ${r.kind==="group"?`
                      <button type="button" class="chat-icon-btn${t.membersOpen?" active":""}" data-chat-members-toggle aria-label="Manage members" title="Manage members">
                        <i class="ti ti-users"></i>
                      </button>
                    `:""}
                    <button type="button" class="chat-icon-btn${y?" active":""}" data-chat-toggle-mute aria-label="${y?"Unmute conversation":"Mute conversation"}" title="${y?"Unmute conversation":"Mute conversation"}">
                      <i class="ti ${y?"ti-bell-off":"ti-bell"}"></i>
                    </button>
                    <div class="chat-member-stack">
                      ${C.map(i=>`<span title="${m(i.profile?.full_name||i.user_id)}">${m((i.profile?.full_name||"?").slice(0,1))}</span>`).join("")}
                    </div>
                  </div>
                  ${Be(r)}
                </header>
                <div class="chat-message-list">
                  ${t.messages.map((i,k)=>ze(i,gt(i,t.messages[k-1]))).join("")}
                  ${t.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  ${xe()}
                  <textarea data-chat-composer rows="1" placeholder="Write a message..."></textarea>
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
        `,e.querySelectorAll("[data-chat-select]").forEach(i=>{i.addEventListener("click",()=>u(i.dataset.chatSelect))}),e.querySelector("[data-chat-back]")?.addEventListener("click",()=>E()),e.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{r&&Ne(r)}),e.querySelector("[data-chat-members-toggle]")?.addEventListener("click",()=>{r&&(t.membersOpen?H():Ce())}),e.querySelector("[data-chat-members-close]")?.addEventListener("click",()=>H({reset:!0})),e.querySelector("[data-chat-member-add-toggle]")?.addEventListener("click",()=>Ie()),e.querySelector("[data-chat-member-search]")?.addEventListener("input",i=>{t.memberSearch=i.currentTarget.value,v();const k=e.querySelector("[data-chat-member-search]");k?.focus(),k?.setSelectionRange?.(k.value.length,k.value.length)}),e.querySelectorAll("[data-chat-member-pick]").forEach(i=>{i.addEventListener("change",()=>Te(i.dataset.chatMemberPick,i.checked))}),e.querySelector("[data-chat-add-members]")?.addEventListener("click",i=>{qe(i.currentTarget.dataset.chatAddMembers)}),e.querySelectorAll("[data-chat-remove-member]").forEach(i=>{i.addEventListener("click",()=>{r&&De(r.id,i.dataset.chatRemoveMember)})}),e.querySelector("[data-chat-compose-toggle]")?.addEventListener("click",()=>{t.composeOpen?F():ke()}),e.querySelector("[data-chat-compose-close]")?.addEventListener("click",()=>F()),e.querySelector("[data-chat-compose-search]")?.addEventListener("input",i=>{t.composeSearch=i.currentTarget.value,v();const k=e.querySelector("[data-chat-compose-search]");k?.focus(),k?.setSelectionRange?.(k.value.length,k.value.length)}),e.querySelectorAll("[data-chat-compose-member]").forEach(i=>{i.addEventListener("change",()=>Me(i.dataset.chatComposeMember,i.checked))}),e.querySelector("[data-chat-group-title]")?.addEventListener("input",i=>{t.composeGroupTitle=i.currentTarget.value,v();const k=e.querySelector("[data-chat-group-title]");k?.focus(),k?.setSelectionRange?.(k.value.length,k.value.length)}),e.querySelector("[data-chat-start-dm]")?.addEventListener("click",i=>{Pe(i.currentTarget.dataset.chatStartDm)}),e.querySelector("[data-chat-create-group]")?.addEventListener("click",()=>{Ue(t.composeGroupTitle,[...t.composeSelectedMemberIds])});const L=e.querySelector("[data-chat-send-form]");L?.addEventListener("submit",i=>{i.preventDefault(),h(i.currentTarget)});const b=e.querySelector("[data-chat-composer]");b?.addEventListener("input",()=>d(b)),b?.addEventListener("keydown",i=>{i.key==="Enter"&&!i.shiftKey&&(i.preventDefault(),L?.requestSubmit())}),e.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>K()),e.querySelectorAll("[data-chat-reply]").forEach(i=>{i.addEventListener("click",()=>Y(i.dataset.chatReply))}),e.querySelectorAll("[data-chat-edit]").forEach(i=>{i.addEventListener("click",()=>Le(i.dataset.chatEdit))}),e.querySelectorAll("[data-chat-delete]").forEach(i=>{i.addEventListener("click",()=>{t.confirmingDeleteMessageId=i.dataset.chatDelete,t.openMessageMenuId=null,v()})}),e.querySelectorAll("[data-chat-message-menu]").forEach(i=>{i.addEventListener("click",()=>{t.openMessageMenuId=t.openMessageMenuId===i.dataset.chatMessageMenu?null:i.dataset.chatMessageMenu,t.confirmingDeleteMessageId=null,v()})}),e.querySelectorAll("[data-chat-confirm-delete]").forEach(i=>{i.addEventListener("click",()=>Re(i.dataset.chatConfirmDelete))}),e.querySelectorAll("[data-chat-cancel-delete]").forEach(i=>{i.addEventListener("click",()=>{t.confirmingDeleteMessageId===i.dataset.chatCancelDelete&&(t.confirmingDeleteMessageId=null),v()})}),e.querySelectorAll("[data-chat-edit-form]").forEach(i=>{i.addEventListener("submit",k=>{k.preventDefault(),Oe(k.currentTarget)})}),e.querySelectorAll("[data-chat-cancel-edit]").forEach(i=>{i.addEventListener("click",()=>Ae())}),s&&$()}return w(),c=setInterval(()=>w(),3e4),typeof n.service.subscribeToConversationEvents=="function"&&(f=n.service.subscribeToConversationEvents(()=>Fe())),()=>{a=!0,c&&clearInterval(c),f&&f(),e.removeEventListener?.("click",g),typeof document<"u"&&document.removeEventListener("keydown",S),e.classList.remove("wein-chat-root"),e.classList.remove("chat-has-selection"),e.innerHTML=""}}}}function O(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data||[]}function B(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data}function ne(e){return e?{id:e.id,full_name:e.full_name,role:e.role,email:e.email??null}:null}function bt(e){return{conversation_id:e.conversation_id,user_id:e.user_id,membership_role:e.membership_role,joined_at:e.joined_at,left_at:e.left_at,last_read_seq:Number(e.last_read_seq||0),notification_level:e.notification_level,profile:ne(e.profile||e.profiles)}}function R(e){return{id:e.id,conversation_id:e.conversation_id,message_seq:Number(e.message_seq||0),sender_id:e.sender_id,body:e.body,reply_to_id:e.reply_to_id,client_nonce:e.client_nonce,created_at:e.created_at,edited_at:e.edited_at,deleted_at:e.deleted_at,sender:ne(e.sender||e.profiles)}}function oe(e,n){const t=(e.members||e.wein_chat_members||[]).map(bt),a=e.last_message||e.wein_chat_messages||[],o=Array.isArray(a)&&a.length?R(a[0]):null,c={id:e.id,kind:e.kind,title:e.title,created_by:e.created_by,created_at:e.created_at,archived_at:e.archived_at,members:t,last_message:o,unread_count:0};return c.unread_count=ft(c,n),c}function yt({supabase:e,currentUserId:n}){if(!e)throw new Error("supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(a){const o=await e.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",a).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"}).single();if(o.error)throw new Error(`fetch conversation: ${o.error.message||o.error}`);return oe(o.data,n)}return{async listProfiles(){const a=await e.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return O(a,"list profiles").map(ne)},async listConversations(){const a=await e.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"});return O(a,"list conversations").map(o=>oe(o,n))},async listMessages(a){const o=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",a).is("deleted_at",null).order("message_seq",{ascending:!0});return O(o,"list messages").map(R)},async createGroup(a,o=[]){const c=B(await e.rpc("wein_chat_create_group",{p_title:a}),"create group");for(const f of o)await this.addMember(c,f);return c},async getOrCreateDm(a){return B(await e.rpc("wein_chat_get_or_create_dm",{p_other_user_id:a}),"get or create DM")},async addMember(a,o){B(await e.rpc("wein_chat_add_member",{p_conversation_id:a,p_user_id:o}),"add member")},async removeMember(a,o){B(await e.rpc("wein_chat_remove_member",{p_conversation_id:a,p_user_id:o}),"remove member")},async sendMessage({conversationId:a,body:o,clientNonce:c,replyToId:f=null}){const _=await e.from("wein_chat_messages").insert({conversation_id:a,sender_id:n,body:o,client_nonce:c,reply_to_id:f}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(_.error)throw new Error(`send message: ${_.error.message||_.error}`);return R(_.data)},async updateMessage(a,o){const c=await e.from("wein_chat_messages").update({body:o,edited_at:new Date().toISOString()}).eq("id",a).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(c.error)throw new Error(`update message: ${c.error.message||c.error}`);return R(c.data)},async deleteMessage(a){const o=await e.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",a).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(o.error)throw new Error(`delete message: ${o.error.message||o.error}`);return R(o.data)},async markRead(a,o){const c=await e.from("wein_chat_members").update({last_read_seq:o}).eq("conversation_id",a).eq("user_id",n).select("conversation_id, user_id, last_read_seq");if(!O(c,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(a,o){const c=await e.from("wein_chat_members").update({notification_level:o}).eq("conversation_id",a).eq("user_id",n).select("conversation_id, user_id, notification_level");if(!O(c,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(a){if(typeof e.channel!="function")return()=>{};const o=e.channel(`wein-chat:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},a).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},a).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},a).subscribe();return()=>{typeof e.removeChannel=="function"?e.removeChannel(o):typeof o.unsubscribe=="function"&&o.unsubscribe()}},fetchConversation:t}}function wt(e){return typeof e.session.user=="object"&&e.session.user!==null?e.session.user:{}}function $t(e){const n=wt(e),t=n.id;if(!t)throw new Error("Team chat requires an authenticated user id.");return{id:t,full_name:e.session.fullName||n.email||"Portal user",role:e.session.role||"team",email:n.email||null}}let J=null;function St(e){J=e||null}function kt(){const e=vt();z({id:"team-chat",mount(n,t){const a=J;J=null;const o=$t(t),c=yt({supabase:t.session.client,currentUserId:o.id});return e.mount(n,{currentUser:o,service:c,initialConversationId:a})}})}function Mt(e,n={}){return e?e.author_id&&n[e.author_id]?.full_name?n[e.author_id].full_name:e.author_name||"Unknown":"Unknown"}function ye(e){return!!e?.resolved_at}function Et(e=[]){const n=new Map,t=[];e.forEach(c=>{n.set(c.id,{...c,replies:[]})}),n.forEach(c=>{c.reply_to_id&&n.has(c.reply_to_id)?n.get(c.reply_to_id).replies.push(c):t.push(c)});const a=(c,f)=>String(c.created_at||"").localeCompare(String(f.created_at||"")),o=c=>{c.replies.sort(a),c.replies.forEach(o)};return t.sort(a),t.forEach(o),t}function Ct(e=[]){return e.filter(n=>!ye(n)).length}function ce(e,n=90){const t=String(e?.body||"").replace(/\s+/g," ").trim();return t.length<=n?t:`${t.slice(0,Math.max(0,n-1)).trimEnd()}…`}function I(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function le(e={}){return e.taskId?"Task discussion":e.providerId?"Provider discussion":e.offerId?"Offer discussion":"Record discussion"}function It(e={}){return e.taskId?`Task ${e.taskId}`:e.providerId?`Provider ${e.providerId}`:e.offerId?`Offer ${e.offerId}`:"No record scope"}function Tt(){return{id:"record-discussion",mount(e,n){const t={comments:[],peopleById:Object.fromEntries((n.people||[]).map(u=>[u.id,u])),loading:!0,error:null,replyToId:null,taskSourceCommentId:null};let a=!1,o=null,c=null;e.classList.add("wein-discussion-root");async function f(){try{t.error=null,t.comments=await n.service.listComments(n.scope||{})}catch(u){t.error=u.message||String(u)}finally{t.loading=!1,a||w()}}async function _(u){const E=u.querySelector("[data-discussion-body]"),h=E.value.trim();h&&(E.value="",await n.service.postComment({...n.scope||{},body:h,replyToId:t.replyToId}),t.replyToId=null,await f())}async function T(u){const E=e.querySelector(`[data-resolve-note="${CSS.escape(u)}"]`)?.value||"";await n.service.resolveComment(u,E),await f()}async function $(u){await n.service.reopenComment(u),await f()}async function d(u){const E=u.querySelector("[data-task-title]"),h=E.value.trim();!h||!t.taskSourceCommentId||(await n.service.createTaskFromComment(t.taskSourceCommentId,h,n.currentUser?.id||null),E.value="",t.taskSourceCommentId=null,await f())}function g(u,E=0){const h=ye(u),Y=Mt(u,t.peopleById);return`
          <article class="discussion-comment${h?" resolved":""}" style="--depth:${Math.min(E,4)}">
            <div class="discussion-comment-meta">
              <span>${I(Y)}</span>
              <span>${I(u.created_at||"")}</span>
              ${h?'<span class="discussion-resolved-pill">Resolved</span>':""}
            </div>
            <div class="discussion-comment-body">${I(u.body)}</div>
            ${u.resolved_note?`<div class="discussion-resolved-note">${I(u.resolved_note)}</div>`:""}
            <div class="discussion-actions">
              <button type="button" data-discussion-reply="${I(u.id)}">Reply</button>
              ${h?`<button type="button" data-discussion-reopen="${I(u.id)}">Reopen</button>`:`<button type="button" data-discussion-resolve="${I(u.id)}">Resolve</button>`}
              <button type="button" data-discussion-task="${I(u.id)}">Create task</button>
            </div>
            ${h?"":`<input class="discussion-resolve-note" data-resolve-note="${I(u.id)}" placeholder="Optional resolve note">`}
            ${u.replies?.length?`<div class="discussion-replies">${u.replies.map(K=>g(K,E+1)).join("")}</div>`:""}
          </article>
        `}function S(){if(!t.taskSourceCommentId)return"";const u=t.comments.find(E=>E.id===t.taskSourceCommentId);return`
          <form class="discussion-task-box" data-discussion-task-form>
            <div>
              <div class="discussion-eyebrow">Create task from comment</div>
              <p>${I(ce(u))}</p>
            </div>
            <input data-task-title type="text" placeholder="Task title">
            <div class="discussion-task-actions">
              <button type="submit">Create task</button>
              <button type="button" data-discussion-task-cancel>Cancel</button>
            </div>
          </form>
        `}function w(){const u=Et(t.comments),E=t.replyToId?t.comments.find(h=>h.id===t.replyToId):null;e.innerHTML=`
          <section class="discussion-shell" aria-label="${I(le(n.scope))}">
            <header class="discussion-header">
              <div>
                <div class="discussion-eyebrow">${I(le(n.scope))}</div>
                <h2>Discussion</h2>
                <p>${I(It(n.scope))}</p>
              </div>
              <span class="discussion-count">${Ct(t.comments)} unresolved</span>
            </header>
            ${t.error?`<div class="discussion-error">${I(t.error)}</div>`:""}
            ${S()}
            <div class="discussion-list">
              ${t.loading?'<div class="discussion-muted">Loading discussion...</div>':""}
              ${u.map(h=>g(h)).join("")}
              ${!t.loading&&!u.length?'<div class="discussion-muted">No comments yet.</div>':""}
            </div>
            <form class="discussion-composer" data-discussion-form>
              ${E?`
                <div class="discussion-replying">
                  Replying to: ${I(ce(E,70))}
                  <button type="button" data-discussion-cancel-reply>Cancel</button>
                </div>
              `:""}
              <textarea data-discussion-body rows="3" placeholder="Write a record-attached note..."></textarea>
              <button type="submit">${E?"Reply":"Post comment"}</button>
            </form>
          </section>
        `,e.querySelector("[data-discussion-form]")?.addEventListener("submit",h=>{h.preventDefault(),_(h.currentTarget)}),e.querySelector("[data-discussion-cancel-reply]")?.addEventListener("click",()=>{t.replyToId=null,w()}),e.querySelector("[data-discussion-task-cancel]")?.addEventListener("click",()=>{t.taskSourceCommentId=null,w()}),e.querySelector("[data-discussion-task-form]")?.addEventListener("submit",h=>{h.preventDefault(),d(h.currentTarget)}),e.querySelectorAll("[data-discussion-reply]").forEach(h=>{h.addEventListener("click",()=>{t.replyToId=h.dataset.discussionReply,w()})}),e.querySelectorAll("[data-discussion-resolve]").forEach(h=>{h.addEventListener("click",()=>T(h.dataset.discussionResolve))}),e.querySelectorAll("[data-discussion-reopen]").forEach(h=>{h.addEventListener("click",()=>$(h.dataset.discussionReopen))}),e.querySelectorAll("[data-discussion-task]").forEach(h=>{h.addEventListener("click",()=>{t.taskSourceCommentId=h.dataset.discussionTask,w()})})}return f(),o=setInterval(()=>f(),3e4),typeof n.service.subscribeToDiscussionEvents=="function"&&(c=n.service.subscribeToDiscussionEvents(()=>f())),()=>{a=!0,o&&clearInterval(o),c&&c(),e.classList.remove("wein-discussion-root"),e.innerHTML=""}}}}function A(e){if(e)throw e}function qt({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t({taskId:$,providerId:d,offerId:g}={}){let S=e.from("wein_comments").select("*").order("created_at",{ascending:!0});$&&(S=S.eq("task_id",$)),d&&(S=S.eq("provider_id",d)),g&&(S=S.eq("offer_id",g));const{data:w,error:u}=await S;return A(u),w||[]}async function a({body:$,taskId:d=null,providerId:g=null,offerId:S=null,replyToId:w=null}){const u=d?{task_id:d}:g?{provider_id:g}:S?{offer_id:S}:null;if(!u)throw new Error("postComment requires taskId, providerId, or offerId");const{data:E,error:h}=await e.from("wein_comments").insert({...u,reply_to_id:w,body:$,author_role:"team"}).select("*").single();return A(h),E}async function o($,d=""){const{data:g,error:S}=await e.from("wein_comments").update({resolved_at:new Date().toISOString(),resolved_note:d}).eq("id",$).select("*");if(A(S),!g?.length)throw new Error("Resolve affected zero comments");return g[0]}async function c($){const{data:d,error:g}=await e.from("wein_comments").update({resolved_at:null,resolved_note:null}).eq("id",$).select("*");if(A(g),!d?.length)throw new Error("Reopen affected zero comments");return d[0]}async function f($,d){const{data:g,error:S}=await e.from("wein_comment_mentions").insert({comment_id:$,mentioned_user_id:d}).select("*");return A(S),g?.[0]||null}async function _($,d,g=null,S=null){const{data:w,error:u}=await e.rpc("wein_create_task_from_comment",{p_comment_id:$,p_title:d,p_assigned_to_user_id:g,p_due_date:S});return A(u),w}function T($){if(!e.channel)return()=>{};const d=e.channel(`record-discussion:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},$).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},$).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_task_links"},$).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(d);if(d?.unsubscribe)return d.unsubscribe()}}return{listComments:t,postComment:a,resolveComment:o,reopenComment:c,addMention:f,createTaskFromComment:_,subscribeToDiscussionEvents:T}}function q(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}const Dt={critical:"Critical",high:"High",medium:"Medium",low:"Low"},Lt={task:"Task",mention:"Mention",discussion:"Discussion",review:"Review"};function At(e){if(!e)return"No due date";const n=new Date(e);return Number.isNaN(n.getTime())?String(e):n.toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function Ot(e=[]){return["critical","high","medium","low"].map(n=>({severity:n,items:e.filter(t=>t.severity===n)})).filter(n=>n.items.length)}function Rt(){return{id:"work-inbox",mount(e,n){const t={items:[],loading:!0,error:null};let a=!1,o=null,c=null;e.classList.add("wein-work-inbox-root");async function f(){try{t.error=null,t.items=await n.service.loadInbox()}catch(d){t.error=d.message||String(d)}finally{t.loading=!1,a||$()}}function _(d){if(typeof n.onSelectItem=="function"){n.onSelectItem(d);return}d.href&&(window.location.hash=d.href)}function T(d){return`
          <button type="button" class="work-inbox-item severity-${q(d.severity)}" data-inbox-item="${q(d.kind)}:${q(d.entity_id)}:${q(d.reason_code)}">
            <span class="work-inbox-kind">${q(Lt[d.kind]||d.kind)}</span>
            <span class="work-inbox-title">${q(d.title)}</span>
            <span class="work-inbox-reason">${q(d.reason_code.replaceAll("_"," "))}</span>
            <span class="work-inbox-due">${q(At(d.due_at))}</span>
            <span class="work-inbox-action">${q(d.next_action)}</span>
          </button>
        `}function $(){const d=Ot(t.items);e.innerHTML=`
          <section class="work-inbox-shell" aria-label="Work inbox">
            <header class="work-inbox-header">
              <div>
                <div class="work-inbox-eyebrow">Today extension</div>
                <h2>Work inbox</h2>
                <p>Normalized tasks, mentions, discussion replies, and review signals.</p>
              </div>
              <div class="work-inbox-total">${t.items.length} item${t.items.length===1?"":"s"}</div>
            </header>
            ${t.error?`<div class="work-inbox-error">${q(t.error)}</div>`:""}
            <div class="work-inbox-toolbar">
              <button type="button" data-inbox-refresh>Refresh</button>
            </div>
            <div class="work-inbox-list">
              ${t.loading?'<div class="work-inbox-muted">Loading inbox...</div>':""}
              ${d.map(g=>`
                <section class="work-inbox-group">
                  <h3>${q(Dt[g.severity])}</h3>
                  ${g.items.map(T).join("")}
                </section>
              `).join("")}
              ${!t.loading&&!t.items.length?'<div class="work-inbox-muted">No attention items right now.</div>':""}
            </div>
          </section>
        `,e.querySelector("[data-inbox-refresh]")?.addEventListener("click",()=>f()),e.querySelectorAll("[data-inbox-item]").forEach(g=>{g.addEventListener("click",()=>{const S=g.dataset.inboxItem,w=t.items.find(u=>`${u.kind}:${u.entity_id}:${u.reason_code}`===S);w&&_(w)})})}return f(),o=setInterval(()=>f(),6e4),typeof n.service.subscribeToInboxEvents=="function"&&(c=n.service.subscribeToInboxEvents(()=>f())),()=>{a=!0,o&&clearInterval(o),c&&c(),e.classList.remove("wein-work-inbox-root"),e.innerHTML=""}}}}const de={critical:0,high:1,medium:2,low:3};function se(e,n=new Date){if(!e)return"low";const t=new Date(e);if(Number.isNaN(t.getTime()))return"low";const a=t.getTime()-n.getTime();return a<0?"critical":a<=1440*60*1e3?"high":a<=4320*60*1e3?"medium":"low"}function Nt(e,{now:n=new Date}={}){return{kind:"task",entity_id:e.id,title:e.title||"Untitled task",reason_code:e.due_date?"task_due":"task_open",severity:se(e.due_date,n),owner_id:e.assigned_to_user_id||e.owner_id||null,due_at:e.due_date||null,next_action:"Open task",href:`#tasks/${e.id}`,source:e}}function Pt(e,{comment:n,currentUserId:t}={}){return{kind:"mention",entity_id:e.comment_id,title:n?.body?`Mention: ${n.body}`:"Mention in discussion",reason_code:"unresolved_mention",severity:n?.resolved_at?"low":"high",owner_id:t||e.mentioned_user_id,due_at:n?.created_at||e.created_at||null,next_action:"Reply or resolve",href:`#comments/${e.comment_id}`,source:{mention:e,comment:n}}}function Ut(e,{currentUserId:n,now:t=new Date}={}){return{kind:"discussion",entity_id:e.id,title:e.body||"Discussion awaiting reply",reason_code:"thread_awaiting_reply",severity:se(e.next_reply_due_at||e.created_at,t),owner_id:n||null,due_at:e.next_reply_due_at||null,next_action:"Reply in thread",href:`#comments/${e.id}`,source:e}}function Ft(e,{now:n=new Date}={}){return{kind:e.kind||"review",entity_id:e.id,title:e.title||e.offer_title||"Founder review needed",reason_code:e.reason_code||"founder_review",severity:se(e.due_at||e.created_at,n),owner_id:e.owner_id||null,due_at:e.due_at||e.created_at||null,next_action:"Review",href:e.href||`#review/${e.id}`,source:e}}function Ht(e=[]){return[...e].sort((n,t)=>{const a=(de[n.severity]??9)-(de[t.severity]??9);return a||String(n.due_at||"").localeCompare(String(t.due_at||""))})}function Wt(e=[]){const n=new Set;return e.filter(t=>{const a=`${t.kind}:${t.entity_id}:${t.reason_code}`;return n.has(a)?!1:(n.add(a),!0)})}function jt({tasks:e=[],mentions:n=[],commentsById:t={},awaitingReplies:a=[],founderReviews:o=[]},c={}){const f=[...e.map(_=>Nt(_,c)),...n.map(_=>Pt(_,{...c,comment:t[_.comment_id]})),...a.map(_=>Ut(_,c)),...o.map(_=>Ft(_,c))];return Ht(Wt(f))}function ue(e){if(e)throw e}function Bt({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(){let f=e.from("wein_tasks").select("*").neq("status","done").order("due_date",{ascending:!0,nullsFirst:!1});n&&(f=f.eq("assigned_to_user_id",n));const{data:_,error:T}=await f;return ue(T),_||[]}async function a(){const{data:f,error:_}=await e.from("wein_comment_mentions").select("comment_id,mentioned_user_id,created_at,wein_comments(*)").eq("mentioned_user_id",n).is("wein_comments.resolved_at",null).order("created_at",{ascending:!0});return ue(_),f||[]}async function o(){const[f,_]=await Promise.all([t(),a()]),T={},$=_.map(d=>{const g=d.wein_comments||d.comment||null;return g?.id&&(T[g.id]=g),{comment_id:d.comment_id,mentioned_user_id:d.mentioned_user_id,created_at:d.created_at}});return jt({tasks:f,mentions:$,commentsById:T},{currentUserId:n})}function c(f){if(!e.channel)return()=>{};const _=e.channel(`work-inbox:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_tasks"},f).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},f).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},f).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(_);if(_?.unsubscribe)return _.unsubscribe()}}return{fetchOpenTasks:t,fetchUnresolvedMentions:a,loadInbox:o,subscribeToInboxEvents:c}}const we=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function Gt(e){for(const n of we)z({id:n,mount:()=>{e[n]()}})}function ae(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const xt=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function Vt(e,n){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${xt.map(t=>`<button class="chip ${e===t?"active":""}" type="button" onclick="${n}('${t.replace(/'/g,"\\'")}')">${t==="all"?"All":ae(t)}</button>`).join("")}</div>`}function zt(e,n){return n==="all"||String(e||"")===n}function Yt(e){return String(e?.category||e?.vertical||"-")}function Kt(e){const n=String(e||"").toLowerCase();return n.includes("dining")?"dining":n.includes("health")?"health":n.includes("fun")?"fun":n.includes("hotel")?"hotels":""}function Jt(e,n=Date.now()){return e?Math.floor((n-new Date(e).getTime())/864e5):0}function Q(e=new Date){const n=new Date(e);return n.setHours(0,0,0,0),n}function Qt(e,n=new Date){return e?Math.round((Q(n).getTime()-Q(e).getTime())/864e5):null}function $e(e,n){let t=String(e||"").replace(/\D/g,"");if(!t)return null;t.startsWith("0")&&(t=`20${t.slice(1)}`);const a=`Hi! Following up on the WeIN offer sheet for ${n} - do you have 5 minutes today?`;return`https://wa.me/${t}?text=${encodeURIComponent(a)}`}function Xt(e,n){const t=$e(e,n);return t?`<a class="mini-btn" href="${ae(t)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function U(e){return e.id}function Zt(e){return M("profiles").find(n=>U(n)===e)??null}function en(e){return M("providers").find(n=>U(n)===e)??null}function tn(e){return M("leads").find(n=>U(n)===e)??null}function nn(e){return M("tasks").find(n=>U(n)===e)??null}function sn(e){return M("offers").find(n=>U(n)===e)??null}function an(e){return M("offers").filter(n=>n.provider_id===e)}function rn(e){return M("tasks").filter(n=>n.provider_id===e)}function on(e){return M("tasks").filter(n=>n.lead_id===e)}const cn=Object.freeze(Object.defineProperty({__proto__:null,leadById:tn,offerById:sn,offersForProvider:an,profileById:Zt,providerById:en,taskById:nn,tasksForLead:on,tasksForProvider:rn},Symbol.toStringTag,{value:"Module"}));dt();kt();const Se={api:_e,auth:{canDelete:X,canManageDeals:fe,canEditProviderProfile:pe,navHiddenForRole:Z,defaultViewForRole:he},platform:{getSupabaseClient:ee,getAccessToken:V,getSessionContext:Qe},shared:{escapeHtml:ae,daysSince:Jt,startOfLocalDay:Q,dayDiffFromToday:Qt,whatsappLink:$e,whatsappButtonHtml:Xt,categoryChipsHtml:Vt,matchesCategoryFilter:zt,categoryLabel:Yt,catBadgeClass:Kt},core:{createPortalContext:it,getView:be,mountView:lt,registeredViewIds:ot,registerView:z},legacy:{LEGACY_VIEW_IDS:we,registerLegacyViews:Gt},features:{requestOpenChatConversation:St,createDiscussionViewModule:Tt,createSupabaseDiscussionService:qt,createWorkInboxViewModule:Rt,createSupabaseWorkInboxService:Bt},store:ve,selectors:cn};window.WEIN_PORTAL_MODULES=Se;for(const e of window.WEIN_PORTAL_MODULES_READY??[])e(Se);window.WEIN_PORTAL_MODULES_READY=[];
