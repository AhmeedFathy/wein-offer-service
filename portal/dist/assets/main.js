function pe(e){return typeof e=="object"&&e!==null?e.role:e}function Z(e){const n=pe(e);return n==="admin"||n==="manager"}const he=Z;function _e(e){const n=pe(e);return n==="admin"||n==="manager"||n==="deal_breaker"}const nt={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function ee(e){return e?nt[e]??[]:[]}function ve(e){return ee(e).includes("pipeline")?"tasks":"pipeline"}function L(){return window.WEIN_PORTAL_LEGACY??{}}function te(){const e=L().supabaseClient;if(!e)throw new Error("Portal Supabase client is not available yet.");return e}function V(){const e=L().getSupabaseUrl?.();if(!e)throw new Error("Portal Supabase URL is not available yet.");return e}function at(){const e=L().getSupabaseAnonKey?.();if(!e)throw new Error("Portal Supabase anon key is not available yet.");return e}function z(){return L().getAccessToken?.()??null}function st(){return{client:te(),accessToken:z()}}class rt extends Error{constructor(n,t,s){super(n),this.status=t,this.body=s,this.name="PortalApiError"}status;body}function F(){const e=L().headers?.();if(e)return e;const n=at();return{apikey:n,Authorization:`Bearer ${z()||n}`,"Content-Type":"application/json"}}async function ne(e,n){if(e.ok)return;const t=await e.text();throw new rt(`Supabase ${n} failed: ${e.status}${t?` ${t}`:""}`,e.status,t)}async function it(e){const n=L().get;if(n)return n(e);const t=await fetch(`${V()}/rest/v1/${e}`,{headers:F()});return await ne(t,"GET"),t.json()}async function ot(e,n){const t=L().post;if(t)return t(e,n);const s=await fetch(`${V()}/rest/v1/${e}`,{method:"POST",headers:{...F(),Prefer:"return=representation"},body:JSON.stringify(n)});return await ne(s,"POST"),s.json()}async function ct(e,n){const t=L().patch;return t?t(e,n):(await fetch(`${V()}/rest/v1/${e}`,{method:"PATCH",headers:F(),body:JSON.stringify(n)})).ok}async function lt(e){const n=L().delete;if(n)return n(e);const t=await fetch(`${V()}/rest/v1/${e}`,{method:"DELETE",headers:F()});return await ne(t,"DELETE"),!0}const ge={headers:F,get:it,post:ot,patch:ct,delete:lt},dt={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function ut(){const e=L().getCaches?.();return e?{providers:e.providers??[],offers:e.offers??[],negotiations:e.negotiations??[],files:e.files??[],leads:e.leads??[],outcomes:e.outcomes??[],tasks:e.tasks??[],profiles:e.profiles??[],redemptions:e.redemptions??[],campaigns:e.campaigns??[],calendarNotes:e.calendarNotes??[]}:dt}function E(e){return ut()[e]}function be(e,n){const t=L().setCache;if(!t)throw new Error("Portal cache bridge is not available yet.");t(e,[...n])}function mt(e,n){be(e,n(E(e)))}const ye={get providers(){return E("providers")},get offers(){return E("offers")},get negotiations(){return E("negotiations")},get files(){return E("files")},get leads(){return E("leads")},get outcomes(){return E("outcomes")},get tasks(){return E("tasks")},get profiles(){return E("profiles")},get redemptions(){return E("redemptions")},get campaigns(){return E("campaigns")},get calendarNotes(){return E("calendarNotes")},getCache:E,replaceCache:be,updateCache:mt};function j(){const e=window.WEIN??{};return{user:e.user,role:e.role??sessionStorage.getItem("weinRole"),fullName:e.fullName??null,accessToken:z(),client:te()}}function ft(){const e=j();return{api:ge,store:ye,session:e,permissions:{canDelete:()=>Z(j()),canManageDeals:()=>he(j()),canEditProviderProfile:()=>_e(j()),navHiddenForRole:ee,defaultViewForRole:ve},navigate(n,t){window.showView?.(n,t)}}}const U=new Map;let x=null;function Y(e){if(!e.id)throw new Error("View id is required.");if(U.has(e.id))throw new Error(`View already registered: ${e.id}`);U.set(e.id,e)}function we(e){return U.get(e)}function pt(){return[...U.keys()]}function ht(){if(!x)return;const e=x;x=null,e()}function _t(e,n,t){const s=we(e);if(!s)throw new Error(`Unknown portal view: ${e}`);ht();const o=s.mount(n,t);x=typeof o=="function"?o:null}function vt(){U.has("__dummy_cleanup_probe")||Y({id:"__dummy_cleanup_probe",mount(e){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,e.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function gt(e="chat"){const n=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${e}-${n}`}function ce(e,n){return e.kind==="group"?e.title||"Untitled group":(e.members||[]).map(s=>s.profile).find(s=>s&&s.id!==n)?.full_name||"Direct message"}function bt(e){return[...e].sort((n,t)=>{const s=n.last_message?.created_at||n.created_at,o=t.last_message?.created_at||t.created_at;return new Date(o).getTime()-new Date(s).getTime()})}function yt(e,n){const t=(e.members||[]).find(o=>o.user_id===n),s=e.last_message?.message_seq||0;return Math.max(0,s-(t?.last_read_seq||0))}function wt(e){if(!e)return"No messages yet";const n=(e.deleted_at?"Message deleted":e.body||"").trim();return n.length>82?`${n.slice(0,79)}...`:n}function f(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function B(e){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[e]||e}function St(e,n=new Date){if(!e)return"";const t=new Date(e);if(Number.isNaN(t.getTime()))return"";const s=n.getTime()-t.getTime(),o=Math.floor(s/6e4);if(o<1)return"now";if(o<60)return`${o}m`;const l=Math.floor(o/60);return l<24?`${l}h`:s<6*864e5?t.toLocaleDateString(void 0,{weekday:"short"}):t.toLocaleDateString(void 0,{month:"short",day:"numeric"})}const $t=300*1e3;function kt(e,n){if(!n||e.sender_id!==n.sender_id)return!0;const t=new Date(e.created_at).getTime()-new Date(n.created_at).getTime();return!(t>=0&&t<$t)}function Mt(){return{id:"team-chat",mount(e,n){const t={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,composeOpen:!1,composeSearch:"",composeGroupTitle:"",composeSelectedMemberIds:new Set,membersOpen:!1,memberAddOpen:!1,memberSearch:"",memberSelectedIds:new Set,renameOpen:!1,renameDraft:"",archiveConfirmOpen:!1,openMessageMenuId:null,confirmingDeleteMessageId:null,loading:!0,error:null};let s=!1,o=n.initialConversationId||null,l=null,p=null,_=!1;function q(){const a=e.querySelector(".chat-message-list");return a?a.scrollHeight-a.scrollTop-a.clientHeight<80:!0}function S(){const a=e.querySelector(".chat-message-list");a&&(a.scrollTop=a.scrollHeight)}function u(a){a.style.height="auto",a.style.height=`${Math.min(a.scrollHeight,120)}px`}e.classList.add("wein-chat-root");function g(a){const r=a.target;if(r instanceof Element){if(t.composeOpen&&!r.closest("[data-chat-compose-popover]")&&!r.closest("[data-chat-compose-toggle]")){G();return}if(t.membersOpen&&!r.closest("[data-chat-members-panel]")&&!r.closest("[data-chat-members-toggle]")){W();return}t.openMessageMenuId&&!r.closest("[data-chat-message-menu-panel]")&&!r.closest("[data-chat-message-menu]")&&(t.openMessageMenuId=null,v())}}function $(a){if(a.key==="Escape"){if(t.composeOpen){G();return}if(t.membersOpen){W();return}(t.openMessageMenuId||t.confirmingDeleteMessageId)&&(t.openMessageMenuId=null,t.confirmingDeleteMessageId=null,v())}}e.addEventListener?.("click",g),typeof document<"u"&&document.addEventListener("keydown",$);async function w({keepMessages:a=!0}={}){try{t.error=null;const[r,c]=await Promise.all([n.service.listProfiles(),n.service.listConversations()]);if(t.profiles=r,t.conversations=bt(c),o&&(t.conversations.some(d=>d.id===o)&&(t.selectedConversationId=o),o=null),!t.selectedConversationId&&t.conversations.length&&(t.selectedConversationId=t.conversations[0].id),t.selectedConversationId&&a){t.messages=await n.service.listMessages(t.selectedConversationId);const d=t.messages.at(-1)?.message_seq||0;if(d)try{await n.service.markRead(t.selectedConversationId,d)}catch(b){console.error("Failed to mark chat messages as read",b)}}}catch(r){t.error=r.message||String(r)}finally{t.loading=!1,s||v()}}async function m(a){t.selectedConversationId=a,t.membersOpen=!1,t.memberAddOpen=!1,t.memberSearch="",t.memberSelectedIds=new Set,t.renameOpen=!1,t.renameDraft="",t.archiveConfirmOpen=!1,e.classList.add("chat-has-selection"),t.messages=await n.service.listMessages(a),_=!0,s||v();const r=t.messages.at(-1)?.message_seq||0;if(r)try{await n.service.markRead(a,r)}catch(c){console.error("Failed to mark chat messages as read",c)}await w()}function k(){e.classList.remove("chat-has-selection")}async function h(a){const r=a.querySelector("[data-chat-composer]"),c=r.value.trim();if(!c||!t.selectedConversationId)return;const d=t.replyToMessageId;r.value="",t.replyToMessageId=null;const b=await n.service.sendMessage({conversationId:t.selectedConversationId,body:c,clientNonce:gt("portal-chat"),replyToId:d});t.messages=[...t.messages,b],_=!0,s||v();try{await n.service.markRead(t.selectedConversationId,b.message_seq)}catch(C){console.error("Failed to mark chat message as read",C)}await w()}function K(a){a&&(t.replyToMessageId=a,v(),e.querySelector("[data-chat-composer]")?.focus())}function J(){t.replyToMessageId=null,v()}function Ee(){t.composeOpen=!0,v(),e.querySelector("[data-chat-compose-search]")?.focus()}function G({reset:a=!1}={}){t.composeOpen=!1,a&&(t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set),v()}function Ce(a,r){const c=new Set(t.composeSelectedMemberIds);r?c.add(a):c.delete(a),t.composeSelectedMemberIds=c,v()}function ie(a){return!a||a.kind!=="group"?!1:a.members.find(c=>c.user_id===n.currentUser.id&&!c.left_at)?.membership_role==="owner"||["admin","manager"].includes(n.currentUser.role)}function Ie(){t.membersOpen=!0,v()}function W({reset:a=!1}={}){t.membersOpen=!1,t.memberAddOpen=!1,a&&(t.memberSearch="",t.memberSelectedIds=new Set),v()}function qe(){t.memberAddOpen=!t.memberAddOpen,v(),t.memberAddOpen&&e.querySelector("[data-chat-member-search]")?.focus()}function Te(a,r){const c=new Set(t.memberSelectedIds);r?c.add(a):c.delete(a),t.memberSelectedIds=c,v()}async function De(a){const r=[...t.memberSelectedIds];if(!(!a||!r.length)){for(const c of r)await n.service.addMember(a,c);t.memberSearch="",t.memberSelectedIds=new Set,t.memberAddOpen=!1,s||v(),await w()}}async function Le(a,r){!a||!r||(await n.service.removeMember(a,r),t.conversations=t.conversations.map(c=>c.id!==a?c:{...c,members:c.members.map(d=>d.user_id===r?{...d,left_at:d.left_at||new Date().toISOString()}:d)}),r===n.currentUser.id&&(t.membersOpen=!1,t.memberAddOpen=!1),s||v(),await w())}function Ae(a){const r=t.messages.find(d=>d.id===a);if(!r)return;t.editingMessageId=a,t.editDraft=r.body||"",v();const c=e.querySelector(`[data-chat-edit-input="${CSS.escape(a)}"]`);c?.focus(),c?.select?.()}function Oe(){t.editingMessageId=null,t.editDraft="",v()}async function Re(a){const r=a.dataset.chatEditForm,d=a.querySelector("[data-chat-edit-input]").value.trim();if(!r||!d)return;const b=await n.service.updateMessage(r,d);t.messages=t.messages.map(C=>C.id===b.id?b:C),t.editingMessageId=null,t.editDraft="",s||v(),await w()}async function Ne(a){if(!a)return;const r=await n.service.deleteMessage(a);t.messages=t.messages.map(c=>c.id===a?{...c,...r,body:"Message deleted",deleted_at:r.deleted_at||new Date().toISOString()}:c),t.replyToMessageId===a&&(t.replyToMessageId=null),t.confirmingDeleteMessageId=null,t.openMessageMenuId=null,s||v(),await w()}async function Pe(a){const c=a.members.find(d=>d.user_id===n.currentUser.id)?.notification_level==="muted"?"all":"muted";await n.service.setNotificationLevel(a.id,c),t.conversations=t.conversations.map(d=>d.id!==a.id?d:{...d,members:d.members.map(b=>b.user_id===n.currentUser.id?{...b,notification_level:c}:b)}),s||v(),await w()}function Ue(a){t.renameOpen=!0,t.renameDraft=a.title||"",v(),e.querySelector("[data-chat-rename-input]")?.focus()}function Fe(){t.renameOpen=!1,t.renameDraft="",v()}async function He(a,r){const c=(r||"").trim();c&&(await n.service.renameConversation(a.id,c),t.conversations=t.conversations.map(d=>d.id===a.id?{...d,title:c}:d),t.renameOpen=!1,t.renameDraft="",s||v(),await w())}function Ge(){t.archiveConfirmOpen=!0,v()}function We(){t.archiveConfirmOpen=!1,v()}async function je(a,r){await n.service.setConversationArchived(a.id,r),t.archiveConfirmOpen=!1,t.selectedConversationId===a.id&&(t.selectedConversationId=null,k()),t.conversations=t.conversations.map(c=>c.id===a.id?{...c,archived_at:new Date().toISOString()}:c),s||v(),await w()}async function Be(a,r,c){!a||!r||(await n.service.setMembershipRole(a,r,c),t.conversations=t.conversations.map(d=>d.id!==a?d:{...d,members:d.members.map(b=>b.user_id===r?{...b,membership_role:c}:b)}),s||v(),await w())}async function xe(a){if(!a)return;const r=await n.service.getOrCreateDm(a);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await m(r)}async function Ve(a,r){if(a=a.trim(),!a)return;const c=await n.service.createGroup(a,r);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await m(c)}function ze(){s||w()}function Ye(a){const r=a.id===t.selectedConversationId?" selected":"",c=a.unread_count?`<span class="chat-count">${a.unread_count}</span>`:"",d=ce(a,n.currentUser.id),b=St(a.last_message?.created_at);return`
          <button type="button" class="chat-conversation${r}" data-chat-select="${f(a.id)}">
            <span class="chat-conversation-avatar" aria-hidden="true">${f((d||"?").slice(0,1).toUpperCase())}</span>
            <span class="chat-conversation-body">
              <span class="chat-conversation-row">
                <span class="chat-conversation-title">${f(d)}</span>
                ${b?`<span class="chat-conversation-timestamp">${f(b)}</span>`:""}
                ${c}
              </span>
              <span class="chat-conversation-preview">${f(wt(a.last_message))}</span>
            </span>
          </button>
        `}function Ke(){return["admin","manager"].includes(n.currentUser.role)}function Je(a){if(!t.composeOpen)return"";const r=t.composeSearch.trim().toLowerCase(),c=a.filter(C=>!r||(C.full_name||"").toLowerCase().includes(r)),d=t.composeSelectedMemberIds.size,b=d===1?[...t.composeSelectedMemberIds][0]:"";return`
          <div class="chat-compose-popover" data-chat-compose-popover role="dialog" aria-label="New conversation">
            <div class="chat-compose-popover-head">
              <strong>New conversation</strong>
              <button type="button" class="chat-icon-btn" data-chat-compose-close aria-label="Close new conversation"><i class="ti ti-x"></i></button>
            </div>
            <input data-chat-compose-search type="search" placeholder="Search people..." value="${f(t.composeSearch)}" autocomplete="off">
            <div class="chat-compose-summary">${d} selected</div>
            <div class="chat-compose-list">
              ${c.map(C=>{const A=t.composeSelectedMemberIds.has(C.id)?" checked":"";return`
                  <label class="chat-compose-person">
                    <input type="checkbox" data-chat-compose-member="${f(C.id)}"${A}>
                    <span class="chat-compose-avatar">${f((C.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${f(C.full_name||"Unknown")}</strong>
                      <span>${f(B(C.role))}</span>
                    </span>
                  </label>
                `}).join("")}
              ${c.length?"":'<div class="chat-muted">No matching people.</div>'}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${f(b)}"${d===1?"":" disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${f(t.composeGroupTitle)}">
                <button type="button" data-chat-create-group${t.composeGroupTitle.trim()?"":" disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
              </div>
            </div>
          </div>
        `}function Qe(a){if(!t.membersOpen||!a||a.kind!=="group")return"";const r=a.members.filter(y=>!y.left_at),c=ie(a),d=new Set(r.map(y=>y.user_id)),b=t.memberSearch.trim().toLowerCase(),C=t.profiles.filter(y=>y.id!==n.currentUser.id&&!d.has(y.id)&&(!b||(y.full_name||"").toLowerCase().includes(b))),A=t.memberSelectedIds.size;return`
          <div class="chat-compose-popover chat-members-panel" data-chat-members-panel role="dialog" aria-label="Manage members">
            <div class="chat-compose-popover-head">
              <strong>Manage members</strong>
              <button type="button" class="chat-icon-btn" data-chat-members-close aria-label="Close member management"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-member-panel-list">
              ${r.map(y=>{const T=y.profile||{},i=y.user_id===n.currentUser.id,M=c||i;return`
                  <div class="chat-member-row" data-chat-member-row="${f(y.user_id)}">
                    <span class="chat-compose-avatar">${f((T.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${f(T.full_name||y.user_id)}</strong>
                      <span>${f(T.role?B(T.role):"Member")}</span>
                    </span>
                    ${y.membership_role==="owner"?'<span class="chat-owner-badge">Owner</span>':""}
                    ${c?`
                      <button type="button" class="chat-member-promote" data-chat-promote-member="${f(y.user_id)}" data-chat-role="${y.membership_role==="owner"?"member":"owner"}">
                        <i class="ti ${y.membership_role==="owner"?"ti-user-minus":"ti-shield-plus"}"></i><span>${y.membership_role==="owner"?"Remove owner":"Make owner"}</span>
                      </button>
                    `:""}
                    ${M?`
                      <button type="button" class="chat-member-remove" data-chat-remove-member="${f(y.user_id)}">
                        <i class="ti ${i?"ti-logout":"ti-user-minus"}"></i><span>${i?"Leave":"Remove"}</span>
                      </button>
                    `:""}
                  </div>
                `}).join("")}
            </div>
            ${c?`
              <div class="chat-member-add">
                <button type="button" class="chat-member-add-toggle" data-chat-member-add-toggle>
                  <i class="ti ti-user-plus"></i><span>Add member</span>
                </button>
                ${t.memberAddOpen?`
                  <input data-chat-member-search type="search" placeholder="Search people..." value="${f(t.memberSearch)}" autocomplete="off">
                  <div class="chat-compose-summary">${A} selected</div>
                  <div class="chat-compose-list">
                    ${C.map(y=>{const T=t.memberSelectedIds.has(y.id)?" checked":"";return`
                        <label class="chat-compose-person">
                          <input type="checkbox" data-chat-member-pick="${f(y.id)}"${T}>
                          <span class="chat-compose-avatar">${f((y.full_name||"?").slice(0,1))}</span>
                          <span class="chat-compose-person-copy">
                            <strong>${f(y.full_name||"Unknown")}</strong>
                            <span>${f(B(y.role))}</span>
                          </span>
                        </label>
                      `}).join("")}
                    ${C.length?"":'<div class="chat-muted">No matching people.</div>'}
                  </div>
                  <div class="chat-compose-actions">
                    <button type="button" data-chat-add-members="${f(a.id)}"${A?"":" disabled"}><i class="ti ti-users-plus"></i><span>Add selected</span></button>
                  </div>
                `:""}
              </div>
            `:""}
          </div>
        `}function oe(a){const r=a.deleted_at?"Message deleted":a.body||"";return r.length>90?`${r.slice(0,87)}...`:r}function Xe(a){if(!a?.reply_to_id)return"";const r=t.messages.find(c=>c.id===a.reply_to_id);return r?`
          <div class="chat-quote">
            <strong>${f(r.sender?.full_name||"Unknown")}</strong>
            <span>${f(oe(r))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function Ze(){const a=t.messages.find(r=>r.id===t.replyToMessageId);return a?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${f(a.sender?.full_name||"Unknown")}</strong>
              <span>${f(oe(a))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function et(a){return`
          <form class="chat-edit-form" data-chat-edit-form="${f(a.id)}">
            <input data-chat-edit-input="${f(a.id)}" type="text" value="${f(t.editDraft)}">
            <button type="submit" aria-label="Save edit"><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
          </form>
        `}function tt(a,r=!0){const c=a.sender_id===n.currentUser.id?" mine":"",d=!!a.deleted_at,b=c&&!d,C=!d&&(c||Ke()),A=a.edited_at&&!d?'<span class="chat-edited">(edited)</span>':"",y=d?"":`
            <button type="button" data-chat-reply="${f(a.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${b?`<button type="button" data-chat-edit="${f(a.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
            ${C?`<button type="button" data-chat-delete="${f(a.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>`:""}
        `,T=d?"":`
          <div class="chat-message-actions" aria-label="Message actions">
            ${y}
          </div>
          <button type="button" class="chat-message-menu-btn" data-chat-message-menu="${f(a.id)}" aria-label="Message actions"><i class="ti ti-dots"></i></button>
          ${t.openMessageMenuId===a.id?`
            <div class="chat-message-menu" data-chat-message-menu-panel="${f(a.id)}">
              ${y}
            </div>
          `:""}
          ${t.confirmingDeleteMessageId===a.id?`
            <div class="chat-delete-confirm">
              <span>Delete message?</span>
              <button type="button" data-chat-confirm-delete="${f(a.id)}">Confirm</button>
              <button type="button" data-chat-cancel-delete="${f(a.id)}">Cancel</button>
            </div>
          `:""}
        `;return`
          <div class="chat-message${c}${d?" deleted":""}${r?"":" chat-message-grouped"}" tabindex="0" data-chat-message-id="${f(a.id)}">
            ${r?`
              <div class="chat-message-meta">
                <span>${f(a.sender?.full_name||"Unknown")}</span>
                <span>#${a.message_seq} ${A}</span>
              </div>
            `:""}
            ${Xe(a)}
            ${t.editingMessageId===a.id?et(a):`<div class="chat-message-body">${f(d?"Message deleted":a.body)}</div>`}
            ${T}
          </div>
        `}function v(){const a=_||q();_=!1;const r=t.conversations.find(i=>i.id===t.selectedConversationId)||null,c=t.profiles.filter(i=>i.id!==n.currentUser.id),b=r?.members.find(i=>i.user_id===n.currentUser.id)?.notification_level==="muted",C=r?.members.filter(i=>!i.left_at)||[],A=r?ie(r):!1;e.innerHTML=`
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <div class="chat-sidebar-tools">
                  <span class="chat-user-pill">${f(B(n.currentUser.role))}</span>
                  <button type="button" class="chat-icon-btn" data-chat-compose-toggle aria-label="New conversation" title="New conversation"><i class="ti ti-pencil-plus"></i></button>
                </div>
              </div>
              ${Je(c)}
              <div class="chat-conversation-list">
                ${t.loading?'<div class="chat-muted">Loading...</div>':""}
                ${t.conversations.map(Ye).join("")}
                ${!t.loading&&!t.conversations.length?'<div class="chat-muted">No conversations yet.</div>':""}
              </div>
            </aside>
            <main class="chat-thread">
              ${t.error?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${f(t.error)}</span></div>`:""}
              ${r?`
                <header class="chat-thread-head">
                  <button type="button" class="chat-back-btn" data-chat-back aria-label="Back to conversations"><i class="ti ti-arrow-left"></i></button>
                  <div>
                    <div class="chat-eyebrow">${r.kind==="dm"?"Direct message":"Group"}</div>
                    ${t.renameOpen?`
                      <form class="chat-rename-form" data-chat-rename-form>
                        <input data-chat-rename-input type="text" value="${f(t.renameDraft)}" placeholder="Group name">
                        <button type="submit" aria-label="Save name"><i class="ti ti-check"></i></button>
                        <button type="button" data-chat-rename-cancel aria-label="Cancel rename"><i class="ti ti-x"></i></button>
                      </form>
                    `:`<h2>${f(ce(r,n.currentUser.id))}</h2>`}
                  </div>
                  <div class="chat-thread-tools">
                    ${r.kind==="group"?`
                      <button type="button" class="chat-icon-btn${t.membersOpen?" active":""}" data-chat-members-toggle aria-label="Manage members" title="Manage members">
                        <i class="ti ti-users"></i>
                      </button>
                    `:""}
                    ${r.kind==="group"&&A?`
                      <button type="button" class="chat-icon-btn" data-chat-rename-toggle aria-label="Rename group" title="Rename group">
                        <i class="ti ti-edit"></i>
                      </button>
                      <button type="button" class="chat-icon-btn" data-chat-archive-toggle aria-label="Archive conversation" title="Archive conversation">
                        <i class="ti ti-archive"></i>
                      </button>
                    `:""}
                    <button type="button" class="chat-icon-btn${b?" active":""}" data-chat-toggle-mute aria-label="${b?"Unmute conversation":"Mute conversation"}" title="${b?"Unmute conversation":"Mute conversation"}">
                      <i class="ti ${b?"ti-bell-off":"ti-bell"}"></i>
                    </button>
                    <div class="chat-member-stack">
                      ${C.map(i=>`<span title="${f(i.profile?.full_name||i.user_id)}">${f((i.profile?.full_name||"?").slice(0,1))}</span>`).join("")}
                    </div>
                  </div>
                  ${Qe(r)}
                  ${t.archiveConfirmOpen?`
                    <div class="chat-delete-confirm chat-archive-confirm">
                      <span>Archive this group?</span>
                      <button type="button" data-chat-confirm-archive>Confirm</button>
                      <button type="button" data-chat-cancel-archive>Cancel</button>
                    </div>
                  `:""}
                </header>
                <div class="chat-message-list">
                  ${t.messages.map((i,M)=>tt(i,kt(i,t.messages[M-1]))).join("")}
                  ${t.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  ${Ze()}
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
        `,e.querySelectorAll("[data-chat-select]").forEach(i=>{i.addEventListener("click",()=>m(i.dataset.chatSelect))}),e.querySelector("[data-chat-back]")?.addEventListener("click",()=>k()),e.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{r&&Pe(r)}),e.querySelector("[data-chat-members-toggle]")?.addEventListener("click",()=>{r&&(t.membersOpen?W():Ie())}),e.querySelector("[data-chat-members-close]")?.addEventListener("click",()=>W({reset:!0})),e.querySelector("[data-chat-rename-toggle]")?.addEventListener("click",()=>{r&&Ue(r)}),e.querySelector("[data-chat-rename-cancel]")?.addEventListener("click",()=>Fe()),e.querySelector("[data-chat-rename-form]")?.addEventListener("submit",i=>{i.preventDefault(),r&&He(r,t.renameDraft)}),e.querySelector("[data-chat-rename-input]")?.addEventListener("input",i=>{t.renameDraft=i.currentTarget.value}),e.querySelector("[data-chat-archive-toggle]")?.addEventListener("click",()=>Ge()),e.querySelector("[data-chat-confirm-archive]")?.addEventListener("click",()=>{r&&je(r,!0)}),e.querySelector("[data-chat-cancel-archive]")?.addEventListener("click",()=>We()),e.querySelector("[data-chat-member-add-toggle]")?.addEventListener("click",()=>qe()),e.querySelector("[data-chat-member-search]")?.addEventListener("input",i=>{t.memberSearch=i.currentTarget.value,v();const M=e.querySelector("[data-chat-member-search]");M?.focus(),M?.setSelectionRange?.(M.value.length,M.value.length)}),e.querySelectorAll("[data-chat-member-pick]").forEach(i=>{i.addEventListener("change",()=>Te(i.dataset.chatMemberPick,i.checked))}),e.querySelector("[data-chat-add-members]")?.addEventListener("click",i=>{De(i.currentTarget.dataset.chatAddMembers)}),e.querySelectorAll("[data-chat-remove-member]").forEach(i=>{i.addEventListener("click",()=>{r&&Le(r.id,i.dataset.chatRemoveMember)})}),e.querySelectorAll("[data-chat-promote-member]").forEach(i=>{i.addEventListener("click",()=>{r&&Be(r.id,i.dataset.chatPromoteMember,i.dataset.chatRole)})}),e.querySelector("[data-chat-compose-toggle]")?.addEventListener("click",()=>{t.composeOpen?G():Ee()}),e.querySelector("[data-chat-compose-close]")?.addEventListener("click",()=>G()),e.querySelector("[data-chat-compose-search]")?.addEventListener("input",i=>{t.composeSearch=i.currentTarget.value,v();const M=e.querySelector("[data-chat-compose-search]");M?.focus(),M?.setSelectionRange?.(M.value.length,M.value.length)}),e.querySelectorAll("[data-chat-compose-member]").forEach(i=>{i.addEventListener("change",()=>Ce(i.dataset.chatComposeMember,i.checked))}),e.querySelector("[data-chat-group-title]")?.addEventListener("input",i=>{t.composeGroupTitle=i.currentTarget.value,v();const M=e.querySelector("[data-chat-group-title]");M?.focus(),M?.setSelectionRange?.(M.value.length,M.value.length)}),e.querySelector("[data-chat-start-dm]")?.addEventListener("click",i=>{xe(i.currentTarget.dataset.chatStartDm)}),e.querySelector("[data-chat-create-group]")?.addEventListener("click",()=>{Ve(t.composeGroupTitle,[...t.composeSelectedMemberIds])});const y=e.querySelector("[data-chat-send-form]");y?.addEventListener("submit",i=>{i.preventDefault(),h(i.currentTarget)});const T=e.querySelector("[data-chat-composer]");T?.addEventListener("input",()=>u(T)),T?.addEventListener("keydown",i=>{i.key==="Enter"&&!i.shiftKey&&(i.preventDefault(),y?.requestSubmit())}),e.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>J()),e.querySelectorAll("[data-chat-reply]").forEach(i=>{i.addEventListener("click",()=>K(i.dataset.chatReply))}),e.querySelectorAll("[data-chat-edit]").forEach(i=>{i.addEventListener("click",()=>Ae(i.dataset.chatEdit))}),e.querySelectorAll("[data-chat-delete]").forEach(i=>{i.addEventListener("click",()=>{t.confirmingDeleteMessageId=i.dataset.chatDelete,t.openMessageMenuId=null,v()})}),e.querySelectorAll("[data-chat-message-menu]").forEach(i=>{i.addEventListener("click",()=>{t.openMessageMenuId=t.openMessageMenuId===i.dataset.chatMessageMenu?null:i.dataset.chatMessageMenu,t.confirmingDeleteMessageId=null,v()})}),e.querySelectorAll("[data-chat-confirm-delete]").forEach(i=>{i.addEventListener("click",()=>Ne(i.dataset.chatConfirmDelete))}),e.querySelectorAll("[data-chat-cancel-delete]").forEach(i=>{i.addEventListener("click",()=>{t.confirmingDeleteMessageId===i.dataset.chatCancelDelete&&(t.confirmingDeleteMessageId=null),v()})}),e.querySelectorAll("[data-chat-edit-form]").forEach(i=>{i.addEventListener("submit",M=>{M.preventDefault(),Re(M.currentTarget)})}),e.querySelectorAll("[data-chat-cancel-edit]").forEach(i=>{i.addEventListener("click",()=>Oe())}),a&&S()}return w(),l=setInterval(()=>w(),3e4),typeof n.service.subscribeToConversationEvents=="function"&&(p=n.service.subscribeToConversationEvents(()=>ze())),()=>{s=!0,l&&clearInterval(l),p&&p(),e.removeEventListener?.("click",g),typeof document<"u"&&document.removeEventListener("keydown",$),e.classList.remove("wein-chat-root"),e.classList.remove("chat-has-selection"),e.innerHTML=""}}}}function O(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data||[]}function N(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data}function ae(e){return e?{id:e.id,full_name:e.full_name,role:e.role,email:e.email??null}:null}function Et(e){return{conversation_id:e.conversation_id,user_id:e.user_id,membership_role:e.membership_role,joined_at:e.joined_at,left_at:e.left_at,last_read_seq:Number(e.last_read_seq||0),notification_level:e.notification_level,profile:ae(e.profile||e.profiles)}}function P(e){return{id:e.id,conversation_id:e.conversation_id,message_seq:Number(e.message_seq||0),sender_id:e.sender_id,body:e.body,reply_to_id:e.reply_to_id,client_nonce:e.client_nonce,created_at:e.created_at,edited_at:e.edited_at,deleted_at:e.deleted_at,sender:ae(e.sender||e.profiles)}}function le(e,n){const t=(e.members||e.wein_chat_members||[]).map(Et),s=e.last_message||e.wein_chat_messages||[],o=Array.isArray(s)&&s.length?P(s[0]):null,l={id:e.id,kind:e.kind,title:e.title,created_by:e.created_by,created_at:e.created_at,archived_at:e.archived_at,members:t,last_message:o,unread_count:0};return l.unread_count=yt(l,n),l}function Ct({supabase:e,currentUserId:n}){if(!e)throw new Error("supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(s){const o=await e.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",s).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"}).single();if(o.error)throw new Error(`fetch conversation: ${o.error.message||o.error}`);return le(o.data,n)}return{async listProfiles(){const s=await e.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return O(s,"list profiles").map(ae)},async listConversations(){const s=await e.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"});return O(s,"list conversations").map(o=>le(o,n))},async listMessages(s){const o=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",s).is("deleted_at",null).order("message_seq",{ascending:!0});return O(o,"list messages").map(P)},async createGroup(s,o=[]){const l=N(await e.rpc("wein_chat_create_group",{p_title:s}),"create group");for(const p of o)await this.addMember(l,p);return l},async getOrCreateDm(s){return N(await e.rpc("wein_chat_get_or_create_dm",{p_other_user_id:s}),"get or create DM")},async addMember(s,o){N(await e.rpc("wein_chat_add_member",{p_conversation_id:s,p_user_id:o}),"add member")},async removeMember(s,o){N(await e.rpc("wein_chat_remove_member",{p_conversation_id:s,p_user_id:o}),"remove member")},async renameConversation(s,o){const l=(o||"").trim();if(!l)throw new Error("Group title is required");const p=await e.from("wein_chat_conversations").update({title:l}).eq("id",s).select("id, title");if(!O(p,"rename conversation").length)throw new Error("rename conversation affected zero rows")},async setConversationArchived(s,o){const l=await e.from("wein_chat_conversations").update({archived_at:o?new Date().toISOString():null}).eq("id",s).select("id, archived_at");if(!O(l,"set conversation archived").length)throw new Error("set conversation archived affected zero rows")},async setMembershipRole(s,o,l){N(await e.rpc("wein_chat_set_membership_role",{p_conversation_id:s,p_user_id:o,p_role:l}),"set membership role")},async sendMessage({conversationId:s,body:o,clientNonce:l,replyToId:p=null}){const _=await e.from("wein_chat_messages").insert({conversation_id:s,sender_id:n,body:o,client_nonce:l,reply_to_id:p}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(_.error)throw new Error(`send message: ${_.error.message||_.error}`);return P(_.data)},async updateMessage(s,o){const l=await e.from("wein_chat_messages").update({body:o,edited_at:new Date().toISOString()}).eq("id",s).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(l.error)throw new Error(`update message: ${l.error.message||l.error}`);return P(l.data)},async deleteMessage(s){const o=await e.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",s).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(o.error)throw new Error(`delete message: ${o.error.message||o.error}`);return P(o.data)},async markRead(s,o){const l=await e.from("wein_chat_members").update({last_read_seq:o}).eq("conversation_id",s).eq("user_id",n).select("conversation_id, user_id, last_read_seq");if(!O(l,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(s,o){const l=await e.from("wein_chat_members").update({notification_level:o}).eq("conversation_id",s).eq("user_id",n).select("conversation_id, user_id, notification_level");if(!O(l,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(s){if(typeof e.channel!="function")return()=>{};const o=e.channel(`wein-chat:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},s).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},s).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},s).subscribe();return()=>{typeof e.removeChannel=="function"?e.removeChannel(o):typeof o.unsubscribe=="function"&&o.unsubscribe()}},fetchConversation:t}}function It(e){return typeof e.session.user=="object"&&e.session.user!==null?e.session.user:{}}function qt(e){const n=It(e),t=n.id;if(!t)throw new Error("Team chat requires an authenticated user id.");return{id:t,full_name:e.session.fullName||n.email||"Portal user",role:e.session.role||"team",email:n.email||null}}let Q=null;function Tt(e){Q=e||null}function Dt(){const e=Mt();Y({id:"team-chat",mount(n,t){const s=Q;Q=null;const o=qt(t),l=Ct({supabase:t.session.client,currentUserId:o.id});return e.mount(n,{currentUser:o,service:l,initialConversationId:s})}})}function Lt(e,n={}){return e?e.author_id&&n[e.author_id]?.full_name?n[e.author_id].full_name:e.author_name||"Unknown":"Unknown"}function Se(e){return!!e?.resolved_at}function At(e=[]){const n=new Map,t=[];e.forEach(l=>{n.set(l.id,{...l,replies:[]})}),n.forEach(l=>{l.reply_to_id&&n.has(l.reply_to_id)?n.get(l.reply_to_id).replies.push(l):t.push(l)});const s=(l,p)=>String(l.created_at||"").localeCompare(String(p.created_at||"")),o=l=>{l.replies.sort(s),l.replies.forEach(o)};return t.sort(s),t.forEach(o),t}function Ot(e=[]){return e.filter(n=>!Se(n)).length}function de(e,n=90){const t=String(e?.body||"").replace(/\s+/g," ").trim();return t.length<=n?t:`${t.slice(0,Math.max(0,n-1)).trimEnd()}…`}function I(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function ue(e={}){return e.taskId?"Task discussion":e.providerId?"Provider discussion":e.offerId?"Offer discussion":"Record discussion"}function Rt(e={}){return e.taskId?`Task ${e.taskId}`:e.providerId?`Provider ${e.providerId}`:e.offerId?`Offer ${e.offerId}`:"No record scope"}function Nt(){return{id:"record-discussion",mount(e,n){const t={comments:[],peopleById:Object.fromEntries((n.people||[]).map(m=>[m.id,m])),loading:!0,error:null,replyToId:null,taskSourceCommentId:null};let s=!1,o=null,l=null;e.classList.add("wein-discussion-root");async function p(){try{t.error=null,t.comments=await n.service.listComments(n.scope||{})}catch(m){t.error=m.message||String(m)}finally{t.loading=!1,s||w()}}async function _(m){const k=m.querySelector("[data-discussion-body]"),h=k.value.trim();h&&(k.value="",await n.service.postComment({...n.scope||{},body:h,replyToId:t.replyToId}),t.replyToId=null,await p())}async function q(m){const k=e.querySelector(`[data-resolve-note="${CSS.escape(m)}"]`)?.value||"";await n.service.resolveComment(m,k),await p()}async function S(m){await n.service.reopenComment(m),await p()}async function u(m){const k=m.querySelector("[data-task-title]"),h=k.value.trim();!h||!t.taskSourceCommentId||(await n.service.createTaskFromComment(t.taskSourceCommentId,h,n.currentUser?.id||null),k.value="",t.taskSourceCommentId=null,await p())}function g(m,k=0){const h=Se(m),K=Lt(m,t.peopleById);return`
          <article class="discussion-comment${h?" resolved":""}" style="--depth:${Math.min(k,4)}">
            <div class="discussion-comment-meta">
              <span>${I(K)}</span>
              <span>${I(m.created_at||"")}</span>
              ${h?'<span class="discussion-resolved-pill">Resolved</span>':""}
            </div>
            <div class="discussion-comment-body">${I(m.body)}</div>
            ${m.resolved_note?`<div class="discussion-resolved-note">${I(m.resolved_note)}</div>`:""}
            <div class="discussion-actions">
              <button type="button" data-discussion-reply="${I(m.id)}">Reply</button>
              ${h?`<button type="button" data-discussion-reopen="${I(m.id)}">Reopen</button>`:`<button type="button" data-discussion-resolve="${I(m.id)}">Resolve</button>`}
              <button type="button" data-discussion-task="${I(m.id)}">Create task</button>
            </div>
            ${h?"":`<input class="discussion-resolve-note" data-resolve-note="${I(m.id)}" placeholder="Optional resolve note">`}
            ${m.replies?.length?`<div class="discussion-replies">${m.replies.map(J=>g(J,k+1)).join("")}</div>`:""}
          </article>
        `}function $(){if(!t.taskSourceCommentId)return"";const m=t.comments.find(k=>k.id===t.taskSourceCommentId);return`
          <form class="discussion-task-box" data-discussion-task-form>
            <div>
              <div class="discussion-eyebrow">Create task from comment</div>
              <p>${I(de(m))}</p>
            </div>
            <input data-task-title type="text" placeholder="Task title">
            <div class="discussion-task-actions">
              <button type="submit">Create task</button>
              <button type="button" data-discussion-task-cancel>Cancel</button>
            </div>
          </form>
        `}function w(){const m=At(t.comments),k=t.replyToId?t.comments.find(h=>h.id===t.replyToId):null;e.innerHTML=`
          <section class="discussion-shell" aria-label="${I(ue(n.scope))}">
            <header class="discussion-header">
              <div>
                <div class="discussion-eyebrow">${I(ue(n.scope))}</div>
                <h2>Discussion</h2>
                <p>${I(Rt(n.scope))}</p>
              </div>
              <span class="discussion-count">${Ot(t.comments)} unresolved</span>
            </header>
            ${t.error?`<div class="discussion-error">${I(t.error)}</div>`:""}
            ${$()}
            <div class="discussion-list">
              ${t.loading?'<div class="discussion-muted">Loading discussion...</div>':""}
              ${m.map(h=>g(h)).join("")}
              ${!t.loading&&!m.length?'<div class="discussion-muted">No comments yet.</div>':""}
            </div>
            <form class="discussion-composer" data-discussion-form>
              ${k?`
                <div class="discussion-replying">
                  Replying to: ${I(de(k,70))}
                  <button type="button" data-discussion-cancel-reply>Cancel</button>
                </div>
              `:""}
              <textarea data-discussion-body rows="3" placeholder="Write a record-attached note..."></textarea>
              <button type="submit">${k?"Reply":"Post comment"}</button>
            </form>
          </section>
        `,e.querySelector("[data-discussion-form]")?.addEventListener("submit",h=>{h.preventDefault(),_(h.currentTarget)}),e.querySelector("[data-discussion-cancel-reply]")?.addEventListener("click",()=>{t.replyToId=null,w()}),e.querySelector("[data-discussion-task-cancel]")?.addEventListener("click",()=>{t.taskSourceCommentId=null,w()}),e.querySelector("[data-discussion-task-form]")?.addEventListener("submit",h=>{h.preventDefault(),u(h.currentTarget)}),e.querySelectorAll("[data-discussion-reply]").forEach(h=>{h.addEventListener("click",()=>{t.replyToId=h.dataset.discussionReply,w()})}),e.querySelectorAll("[data-discussion-resolve]").forEach(h=>{h.addEventListener("click",()=>q(h.dataset.discussionResolve))}),e.querySelectorAll("[data-discussion-reopen]").forEach(h=>{h.addEventListener("click",()=>S(h.dataset.discussionReopen))}),e.querySelectorAll("[data-discussion-task]").forEach(h=>{h.addEventListener("click",()=>{t.taskSourceCommentId=h.dataset.discussionTask,w()})})}return p(),o=setInterval(()=>p(),3e4),typeof n.service.subscribeToDiscussionEvents=="function"&&(l=n.service.subscribeToDiscussionEvents(()=>p())),()=>{s=!0,o&&clearInterval(o),l&&l(),e.classList.remove("wein-discussion-root"),e.innerHTML=""}}}}function R(e){if(e)throw e}function Pt({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t({taskId:S,providerId:u,offerId:g}={}){let $=e.from("wein_comments").select("*").order("created_at",{ascending:!0});S&&($=$.eq("task_id",S)),u&&($=$.eq("provider_id",u)),g&&($=$.eq("offer_id",g));const{data:w,error:m}=await $;return R(m),w||[]}async function s({body:S,taskId:u=null,providerId:g=null,offerId:$=null,replyToId:w=null}){const m=u?{task_id:u}:g?{provider_id:g}:$?{offer_id:$}:null;if(!m)throw new Error("postComment requires taskId, providerId, or offerId");const{data:k,error:h}=await e.from("wein_comments").insert({...m,reply_to_id:w,body:S,author_role:"team"}).select("*").single();return R(h),k}async function o(S,u=""){const{data:g,error:$}=await e.from("wein_comments").update({resolved_at:new Date().toISOString(),resolved_note:u}).eq("id",S).select("*");if(R($),!g?.length)throw new Error("Resolve affected zero comments");return g[0]}async function l(S){const{data:u,error:g}=await e.from("wein_comments").update({resolved_at:null,resolved_note:null}).eq("id",S).select("*");if(R(g),!u?.length)throw new Error("Reopen affected zero comments");return u[0]}async function p(S,u){const{data:g,error:$}=await e.from("wein_comment_mentions").insert({comment_id:S,mentioned_user_id:u}).select("*");return R($),g?.[0]||null}async function _(S,u,g=null,$=null){const{data:w,error:m}=await e.rpc("wein_create_task_from_comment",{p_comment_id:S,p_title:u,p_assigned_to_user_id:g,p_due_date:$});return R(m),w}function q(S){if(!e.channel)return()=>{};const u=e.channel(`record-discussion:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},S).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},S).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_task_links"},S).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(u);if(u?.unsubscribe)return u.unsubscribe()}}return{listComments:t,postComment:s,resolveComment:o,reopenComment:l,addMention:p,createTaskFromComment:_,subscribeToDiscussionEvents:q}}function D(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}const Ut={critical:"Critical",high:"High",medium:"Medium",low:"Low"},Ft={task:"Task",mention:"Mention",discussion:"Discussion",review:"Review"};function Ht(e){if(!e)return"No due date";const n=new Date(e);return Number.isNaN(n.getTime())?String(e):n.toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function Gt(e=[]){return["critical","high","medium","low"].map(n=>({severity:n,items:e.filter(t=>t.severity===n)})).filter(n=>n.items.length)}function Wt(){return{id:"work-inbox",mount(e,n){const t={items:[],loading:!0,error:null};let s=!1,o=null,l=null;e.classList.add("wein-work-inbox-root");async function p(){try{t.error=null,t.items=await n.service.loadInbox()}catch(u){t.error=u.message||String(u)}finally{t.loading=!1,s||S()}}function _(u){if(typeof n.onSelectItem=="function"){n.onSelectItem(u);return}u.href&&(window.location.hash=u.href)}function q(u){return`
          <button type="button" class="work-inbox-item severity-${D(u.severity)}" data-inbox-item="${D(u.kind)}:${D(u.entity_id)}:${D(u.reason_code)}">
            <span class="work-inbox-kind">${D(Ft[u.kind]||u.kind)}</span>
            <span class="work-inbox-title">${D(u.title)}</span>
            <span class="work-inbox-reason">${D(u.reason_code.replaceAll("_"," "))}</span>
            <span class="work-inbox-due">${D(Ht(u.due_at))}</span>
            <span class="work-inbox-action">${D(u.next_action)}</span>
          </button>
        `}function S(){const u=Gt(t.items);e.innerHTML=`
          <section class="work-inbox-shell" aria-label="Work inbox">
            <header class="work-inbox-header">
              <div>
                <div class="work-inbox-eyebrow">Today extension</div>
                <h2>Work inbox</h2>
                <p>Normalized tasks, mentions, discussion replies, and review signals.</p>
              </div>
              <div class="work-inbox-total">${t.items.length} item${t.items.length===1?"":"s"}</div>
            </header>
            ${t.error?`<div class="work-inbox-error">${D(t.error)}</div>`:""}
            <div class="work-inbox-toolbar">
              <button type="button" data-inbox-refresh>Refresh</button>
            </div>
            <div class="work-inbox-list">
              ${t.loading?'<div class="work-inbox-muted">Loading inbox...</div>':""}
              ${u.map(g=>`
                <section class="work-inbox-group">
                  <h3>${D(Ut[g.severity])}</h3>
                  ${g.items.map(q).join("")}
                </section>
              `).join("")}
              ${!t.loading&&!t.items.length?'<div class="work-inbox-muted">No attention items right now.</div>':""}
            </div>
          </section>
        `,e.querySelector("[data-inbox-refresh]")?.addEventListener("click",()=>p()),e.querySelectorAll("[data-inbox-item]").forEach(g=>{g.addEventListener("click",()=>{const $=g.dataset.inboxItem,w=t.items.find(m=>`${m.kind}:${m.entity_id}:${m.reason_code}`===$);w&&_(w)})})}return p(),o=setInterval(()=>p(),6e4),typeof n.service.subscribeToInboxEvents=="function"&&(l=n.service.subscribeToInboxEvents(()=>p())),()=>{s=!0,o&&clearInterval(o),l&&l(),e.classList.remove("wein-work-inbox-root"),e.innerHTML=""}}}}const me={critical:0,high:1,medium:2,low:3};function se(e,n=new Date){if(!e)return"low";const t=new Date(e);if(Number.isNaN(t.getTime()))return"low";const s=t.getTime()-n.getTime();return s<0?"critical":s<=1440*60*1e3?"high":s<=4320*60*1e3?"medium":"low"}function jt(e,{now:n=new Date}={}){return{kind:"task",entity_id:e.id,title:e.title||"Untitled task",reason_code:e.due_date?"task_due":"task_open",severity:se(e.due_date,n),owner_id:e.assigned_to_user_id||e.owner_id||null,due_at:e.due_date||null,next_action:"Open task",href:`#tasks/${e.id}`,source:e}}function Bt(e,{comment:n,currentUserId:t}={}){return{kind:"mention",entity_id:e.comment_id,title:n?.body?`Mention: ${n.body}`:"Mention in discussion",reason_code:"unresolved_mention",severity:n?.resolved_at?"low":"high",owner_id:t||e.mentioned_user_id,due_at:n?.created_at||e.created_at||null,next_action:"Reply or resolve",href:`#comments/${e.comment_id}`,source:{mention:e,comment:n}}}function xt(e,{currentUserId:n,now:t=new Date}={}){return{kind:"discussion",entity_id:e.id,title:e.body||"Discussion awaiting reply",reason_code:"thread_awaiting_reply",severity:se(e.next_reply_due_at||e.created_at,t),owner_id:n||null,due_at:e.next_reply_due_at||null,next_action:"Reply in thread",href:`#comments/${e.id}`,source:e}}function Vt(e,{now:n=new Date}={}){return{kind:e.kind||"review",entity_id:e.id,title:e.title||e.offer_title||"Founder review needed",reason_code:e.reason_code||"founder_review",severity:se(e.due_at||e.created_at,n),owner_id:e.owner_id||null,due_at:e.due_at||e.created_at||null,next_action:"Review",href:e.href||`#review/${e.id}`,source:e}}function zt(e=[]){return[...e].sort((n,t)=>{const s=(me[n.severity]??9)-(me[t.severity]??9);return s||String(n.due_at||"").localeCompare(String(t.due_at||""))})}function Yt(e=[]){const n=new Set;return e.filter(t=>{const s=`${t.kind}:${t.entity_id}:${t.reason_code}`;return n.has(s)?!1:(n.add(s),!0)})}function Kt({tasks:e=[],mentions:n=[],commentsById:t={},awaitingReplies:s=[],founderReviews:o=[]},l={}){const p=[...e.map(_=>jt(_,l)),...n.map(_=>Bt(_,{...l,comment:t[_.comment_id]})),...s.map(_=>xt(_,l)),...o.map(_=>Vt(_,l))];return zt(Yt(p))}function fe(e){if(e)throw e}function Jt({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(){let p=e.from("wein_tasks").select("*").neq("status","done").order("due_date",{ascending:!0,nullsFirst:!1});n&&(p=p.eq("assigned_to_user_id",n));const{data:_,error:q}=await p;return fe(q),_||[]}async function s(){const{data:p,error:_}=await e.from("wein_comment_mentions").select("comment_id,mentioned_user_id,created_at,wein_comments(*)").eq("mentioned_user_id",n).is("wein_comments.resolved_at",null).order("created_at",{ascending:!0});return fe(_),p||[]}async function o(){const[p,_]=await Promise.all([t(),s()]),q={},S=_.map(u=>{const g=u.wein_comments||u.comment||null;return g?.id&&(q[g.id]=g),{comment_id:u.comment_id,mentioned_user_id:u.mentioned_user_id,created_at:u.created_at}});return Kt({tasks:p,mentions:S,commentsById:q},{currentUserId:n})}function l(p){if(!e.channel)return()=>{};const _=e.channel(`work-inbox:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_tasks"},p).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},p).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},p).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(_);if(_?.unsubscribe)return _.unsubscribe()}}return{fetchOpenTasks:t,fetchUnresolvedMentions:s,loadInbox:o,subscribeToInboxEvents:l}}const $e=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function Qt(e){for(const n of $e)Y({id:n,mount:()=>{e[n]()}})}function re(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const Xt=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function Zt(e,n){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${Xt.map(t=>`<button class="chip ${e===t?"active":""}" type="button" onclick="${n}('${t.replace(/'/g,"\\'")}')">${t==="all"?"All":re(t)}</button>`).join("")}</div>`}function en(e,n){return n==="all"||String(e||"")===n}function tn(e){return String(e?.category||e?.vertical||"-")}function nn(e){const n=String(e||"").toLowerCase();return n.includes("dining")?"dining":n.includes("health")?"health":n.includes("fun")?"fun":n.includes("hotel")?"hotels":""}function an(e,n=Date.now()){return e?Math.floor((n-new Date(e).getTime())/864e5):0}function X(e=new Date){const n=new Date(e);return n.setHours(0,0,0,0),n}function sn(e,n=new Date){return e?Math.round((X(n).getTime()-X(e).getTime())/864e5):null}function ke(e,n){let t=String(e||"").replace(/\D/g,"");if(!t)return null;t.startsWith("0")&&(t=`20${t.slice(1)}`);const s=`Hi! Following up on the WeIN offer sheet for ${n} - do you have 5 minutes today?`;return`https://wa.me/${t}?text=${encodeURIComponent(s)}`}function rn(e,n){const t=ke(e,n);return t?`<a class="mini-btn" href="${re(t)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function H(e){return e.id}function on(e){return E("profiles").find(n=>H(n)===e)??null}function cn(e){return E("providers").find(n=>H(n)===e)??null}function ln(e){return E("leads").find(n=>H(n)===e)??null}function dn(e){return E("tasks").find(n=>H(n)===e)??null}function un(e){return E("offers").find(n=>H(n)===e)??null}function mn(e){return E("offers").filter(n=>n.provider_id===e)}function fn(e){return E("tasks").filter(n=>n.provider_id===e)}function pn(e){return E("tasks").filter(n=>n.lead_id===e)}const hn=Object.freeze(Object.defineProperty({__proto__:null,leadById:ln,offerById:un,offersForProvider:mn,profileById:on,providerById:cn,taskById:dn,tasksForLead:pn,tasksForProvider:fn},Symbol.toStringTag,{value:"Module"}));vt();Dt();const Me={api:ge,auth:{canDelete:Z,canManageDeals:he,canEditProviderProfile:_e,navHiddenForRole:ee,defaultViewForRole:ve},platform:{getSupabaseClient:te,getAccessToken:z,getSessionContext:st},shared:{escapeHtml:re,daysSince:an,startOfLocalDay:X,dayDiffFromToday:sn,whatsappLink:ke,whatsappButtonHtml:rn,categoryChipsHtml:Zt,matchesCategoryFilter:en,categoryLabel:tn,catBadgeClass:nn},core:{createPortalContext:ft,getView:we,mountView:_t,registeredViewIds:pt,registerView:Y},legacy:{LEGACY_VIEW_IDS:$e,registerLegacyViews:Qt},features:{requestOpenChatConversation:Tt,createDiscussionViewModule:Nt,createSupabaseDiscussionService:Pt,createWorkInboxViewModule:Wt,createSupabaseWorkInboxService:Jt},store:ye,selectors:hn};window.WEIN_PORTAL_MODULES=Me;for(const e of window.WEIN_PORTAL_MODULES_READY??[])e(Me);window.WEIN_PORTAL_MODULES_READY=[];
