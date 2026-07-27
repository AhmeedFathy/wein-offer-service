function ue(e){return typeof e=="object"&&e!==null?e.role:e}function Q(e){const n=ue(e);return n==="admin"||n==="manager"}const me=Q;function fe(e){const n=ue(e);return n==="admin"||n==="manager"||n==="deal_breaker"}const xe={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function X(e){return e?xe[e]??[]:[]}function pe(e){return X(e).includes("pipeline")?"tasks":"pipeline"}function q(){return window.WEIN_PORTAL_LEGACY??{}}function Z(){const e=q().supabaseClient;if(!e)throw new Error("Portal Supabase client is not available yet.");return e}function B(){const e=q().getSupabaseUrl?.();if(!e)throw new Error("Portal Supabase URL is not available yet.");return e}function Ve(){const e=q().getSupabaseAnonKey?.();if(!e)throw new Error("Portal Supabase anon key is not available yet.");return e}function G(){return q().getAccessToken?.()??null}function ze(){return{client:Z(),accessToken:G()}}class Ye extends Error{constructor(n,t,a){super(n),this.status=t,this.body=a,this.name="PortalApiError"}status;body}function N(){const e=q().headers?.();if(e)return e;const n=Ve();return{apikey:n,Authorization:`Bearer ${G()||n}`,"Content-Type":"application/json"}}async function ee(e,n){if(e.ok)return;const t=await e.text();throw new Ye(`Supabase ${n} failed: ${e.status}${t?` ${t}`:""}`,e.status,t)}async function Ke(e){const n=q().get;if(n)return n(e);const t=await fetch(`${B()}/rest/v1/${e}`,{headers:N()});return await ee(t,"GET"),t.json()}async function Je(e,n){const t=q().post;if(t)return t(e,n);const a=await fetch(`${B()}/rest/v1/${e}`,{method:"POST",headers:{...N(),Prefer:"return=representation"},body:JSON.stringify(n)});return await ee(a,"POST"),a.json()}async function Qe(e,n){const t=q().patch;return t?t(e,n):(await fetch(`${B()}/rest/v1/${e}`,{method:"PATCH",headers:N(),body:JSON.stringify(n)})).ok}async function Xe(e){const n=q().delete;if(n)return n(e);const t=await fetch(`${B()}/rest/v1/${e}`,{method:"DELETE",headers:N()});return await ee(t,"DELETE"),!0}const he={headers:N,get:Ke,post:Je,patch:Qe,delete:Xe},Ze={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function et(){const e=q().getCaches?.();return e?{providers:e.providers??[],offers:e.offers??[],negotiations:e.negotiations??[],files:e.files??[],leads:e.leads??[],outcomes:e.outcomes??[],tasks:e.tasks??[],profiles:e.profiles??[],redemptions:e.redemptions??[],campaigns:e.campaigns??[],calendarNotes:e.calendarNotes??[]}:Ze}function S(e){return et()[e]}function _e(e,n){const t=q().setCache;if(!t)throw new Error("Portal cache bridge is not available yet.");t(e,[...n])}function tt(e,n){_e(e,n(S(e)))}const ve={get providers(){return S("providers")},get offers(){return S("offers")},get negotiations(){return S("negotiations")},get files(){return S("files")},get leads(){return S("leads")},get outcomes(){return S("outcomes")},get tasks(){return S("tasks")},get profiles(){return S("profiles")},get redemptions(){return S("redemptions")},get campaigns(){return S("campaigns")},get calendarNotes(){return S("calendarNotes")},getCache:S,replaceCache:_e,updateCache:tt};function F(){const e=window.WEIN??{};return{user:e.user,role:e.role??sessionStorage.getItem("weinRole"),fullName:e.fullName??null,accessToken:G(),client:Z()}}function nt(){const e=F();return{api:he,store:ve,session:e,permissions:{canDelete:()=>Q(F()),canManageDeals:()=>me(F()),canEditProviderProfile:()=>fe(F()),navHiddenForRole:X,defaultViewForRole:pe},navigate(n,t){window.showView?.(n,t)}}}const R=new Map;let W=null;function x(e){if(!e.id)throw new Error("View id is required.");if(R.has(e.id))throw new Error(`View already registered: ${e.id}`);R.set(e.id,e)}function ge(e){return R.get(e)}function st(){return[...R.keys()]}function at(){if(!W)return;const e=W;W=null,e()}function rt(e,n,t){const a=ge(e);if(!a)throw new Error(`Unknown portal view: ${e}`);at();const o=a.mount(n,t);W=typeof o=="function"?o:null}function it(){R.has("__dummy_cleanup_probe")||x({id:"__dummy_cleanup_probe",mount(e){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,e.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function ot(e="chat"){const n=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${e}-${n}`}function re(e,n){return e.kind==="group"?e.title||"Untitled group":(e.members||[]).map(a=>a.profile).find(a=>a&&a.id!==n)?.full_name||"Direct message"}function ct(e){return[...e].sort((n,t)=>{const a=n.last_message?.created_at||n.created_at,o=t.last_message?.created_at||t.created_at;return new Date(o).getTime()-new Date(a).getTime()})}function lt(e,n){const t=(e.members||[]).find(o=>o.user_id===n),a=e.last_message?.message_seq||0;return Math.max(0,a-(t?.last_read_seq||0))}function dt(e){if(!e)return"No messages yet";const n=(e.deleted_at?"Message deleted":e.body||"").trim();return n.length>82?`${n.slice(0,79)}...`:n}function m(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function H(e){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[e]||e}function ut(){return{id:"team-chat",mount(e,n){const t={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,composeOpen:!1,composeSearch:"",composeGroupTitle:"",composeSelectedMemberIds:new Set,membersOpen:!1,memberAddOpen:!1,memberSearch:"",memberSelectedIds:new Set,openMessageMenuId:null,confirmingDeleteMessageId:null,loading:!0,error:null};let a=!1,o=n.initialConversationId||null,l=null,f=null;e.classList.add("wein-chat-root");function v(s){const i=s.target;if(i instanceof Element){if(t.composeOpen&&!i.closest("[data-chat-compose-popover]")&&!i.closest("[data-chat-compose-toggle]")){p();return}if(t.membersOpen&&!i.closest("[data-chat-members-panel]")&&!i.closest("[data-chat-members-toggle]")){U();return}t.openMessageMenuId&&!i.closest("[data-chat-message-menu-panel]")&&!i.closest("[data-chat-message-menu]")&&(t.openMessageMenuId=null,b())}}function C(s){if(s.key==="Escape"){if(t.composeOpen){p();return}if(t.membersOpen){U();return}(t.openMessageMenuId||t.confirmingDeleteMessageId)&&(t.openMessageMenuId=null,t.confirmingDeleteMessageId=null,b())}}e.addEventListener?.("click",v),typeof document<"u"&&document.addEventListener("keydown",C);async function _({keepMessages:s=!0}={}){try{t.error=null;const[i,c]=await Promise.all([n.service.listProfiles(),n.service.listConversations()]);if(t.profiles=i,t.conversations=ct(c),o&&(t.conversations.some(h=>h.id===o)&&(t.selectedConversationId=o),o=null),!t.selectedConversationId&&t.conversations.length&&(t.selectedConversationId=t.conversations[0].id),t.selectedConversationId&&s){t.messages=await n.service.listMessages(t.selectedConversationId);const h=t.messages.at(-1)?.message_seq||0;if(h)try{await n.service.markRead(t.selectedConversationId,h)}catch(M){console.error("Failed to mark chat messages as read",M)}}}catch(i){t.error=i.message||String(i)}finally{t.loading=!1,a||b()}}async function d(s){t.selectedConversationId=s,t.membersOpen=!1,t.memberAddOpen=!1,t.memberSearch="",t.memberSelectedIds=new Set,e.classList.add("chat-has-selection"),t.messages=await n.service.listMessages(s),a||b();const i=t.messages.at(-1)?.message_seq||0;if(i)try{await n.service.markRead(s,i)}catch(c){console.error("Failed to mark chat messages as read",c)}await _()}function g(){e.classList.remove("chat-has-selection")}async function w(s){const i=s.querySelector("[data-chat-composer]"),c=i.value.trim();if(!c||!t.selectedConversationId)return;const h=t.replyToMessageId;i.value="",t.replyToMessageId=null;const M=await n.service.sendMessage({conversationId:t.selectedConversationId,body:c,clientNonce:ot("portal-chat"),replyToId:h});t.messages=[...t.messages,M],a||b();try{await n.service.markRead(t.selectedConversationId,M.message_seq)}catch(r){console.error("Failed to mark chat message as read",r)}await _()}function E(s){s&&(t.replyToMessageId=s,b(),e.querySelector("[data-chat-composer]")?.focus())}function u(){t.replyToMessageId=null,b()}function k(){t.composeOpen=!0,b(),e.querySelector("[data-chat-compose-search]")?.focus()}function p({reset:s=!1}={}){t.composeOpen=!1,s&&(t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set),b()}function V(s,i){const c=new Set(t.composeSelectedMemberIds);i?c.add(s):c.delete(s),t.composeSelectedMemberIds=c,b()}function z(s){return!s||s.kind!=="group"?!1:s.members.find(c=>c.user_id===n.currentUser.id&&!c.left_at)?.membership_role==="owner"||["admin","manager"].includes(n.currentUser.role)}function Se(){t.membersOpen=!0,b()}function U({reset:s=!1}={}){t.membersOpen=!1,t.memberAddOpen=!1,s&&(t.memberSearch="",t.memberSelectedIds=new Set),b()}function ke(){t.memberAddOpen=!t.memberAddOpen,b(),t.memberAddOpen&&e.querySelector("[data-chat-member-search]")?.focus()}function Me(s,i){const c=new Set(t.memberSelectedIds);i?c.add(s):c.delete(s),t.memberSelectedIds=c,b()}async function Ee(s){const i=[...t.memberSelectedIds];if(!(!s||!i.length)){for(const c of i)await n.service.addMember(s,c);t.memberSearch="",t.memberSelectedIds=new Set,t.memberAddOpen=!1,a||b(),await _()}}async function Ie(s,i){!s||!i||(await n.service.removeMember(s,i),t.conversations=t.conversations.map(c=>c.id!==s?c:{...c,members:c.members.map(h=>h.user_id===i?{...h,left_at:h.left_at||new Date().toISOString()}:h)}),i===n.currentUser.id&&(t.membersOpen=!1,t.memberAddOpen=!1),a||b(),await _())}function Ce(s){const i=t.messages.find(h=>h.id===s);if(!i)return;t.editingMessageId=s,t.editDraft=i.body||"",b();const c=e.querySelector(`[data-chat-edit-input="${CSS.escape(s)}"]`);c?.focus(),c?.select?.()}function Te(){t.editingMessageId=null,t.editDraft="",b()}async function qe(s){const i=s.dataset.chatEditForm,h=s.querySelector("[data-chat-edit-input]").value.trim();if(!i||!h)return;const M=await n.service.updateMessage(i,h);t.messages=t.messages.map(r=>r.id===M.id?M:r),t.editingMessageId=null,t.editDraft="",a||b(),await _()}async function Le(s){if(!s)return;const i=await n.service.deleteMessage(s);t.messages=t.messages.map(c=>c.id===s?{...c,...i,body:"Message deleted",deleted_at:i.deleted_at||new Date().toISOString()}:c),t.replyToMessageId===s&&(t.replyToMessageId=null),t.confirmingDeleteMessageId=null,t.openMessageMenuId=null,a||b(),await _()}async function De(s){const c=s.members.find(h=>h.user_id===n.currentUser.id)?.notification_level==="muted"?"all":"muted";await n.service.setNotificationLevel(s.id,c),t.conversations=t.conversations.map(h=>h.id!==s.id?h:{...h,members:h.members.map(M=>M.user_id===n.currentUser.id?{...M,notification_level:c}:M)}),a||b(),await _()}async function Ae(s){if(!s)return;const i=await n.service.getOrCreateDm(s);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await d(i)}async function Oe(s,i){if(s=s.trim(),!s)return;const c=await n.service.createGroup(s,i);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await d(c)}function Re(){a||_()}function Ne(s){const i=s.id===t.selectedConversationId?" selected":"",c=s.unread_count?`<span class="chat-count">${s.unread_count}</span>`:"";return`
          <button type="button" class="chat-conversation${i}" data-chat-select="${m(s.id)}">
            <span class="chat-conversation-title">${m(re(s,n.currentUser.id))}</span>
            ${c}
            <span class="chat-conversation-preview">${m(dt(s.last_message))}</span>
          </button>
        `}function Pe(){return["admin","manager"].includes(n.currentUser.role)}function Ue(s){if(!t.composeOpen)return"";const i=t.composeSearch.trim().toLowerCase(),c=s.filter(r=>!i||(r.full_name||"").toLowerCase().includes(i)),h=t.composeSelectedMemberIds.size,M=h===1?[...t.composeSelectedMemberIds][0]:"";return`
          <div class="chat-compose-popover" data-chat-compose-popover role="dialog" aria-label="New conversation">
            <div class="chat-compose-popover-head">
              <strong>New conversation</strong>
              <button type="button" class="chat-icon-btn" data-chat-compose-close aria-label="Close new conversation"><i class="ti ti-x"></i></button>
            </div>
            <input data-chat-compose-search type="search" placeholder="Search people..." value="${m(t.composeSearch)}" autocomplete="off">
            <div class="chat-compose-summary">${h} selected</div>
            <div class="chat-compose-list">
              ${c.map(r=>{const y=t.composeSelectedMemberIds.has(r.id)?" checked":"";return`
                  <label class="chat-compose-person">
                    <input type="checkbox" data-chat-compose-member="${m(r.id)}"${y}>
                    <span class="chat-compose-avatar">${m((r.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${m(r.full_name||"Unknown")}</strong>
                      <span>${m(H(r.role))}</span>
                    </span>
                  </label>
                `}).join("")}
              ${c.length?"":'<div class="chat-muted">No matching people.</div>'}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${m(M)}"${h===1?"":" disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${m(t.composeGroupTitle)}">
                <button type="button" data-chat-create-group${t.composeGroupTitle.trim()?"":" disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
              </div>
            </div>
          </div>
        `}function Fe(s){if(!t.membersOpen||!s||s.kind!=="group")return"";const i=s.members.filter($=>!$.left_at),c=z(s),h=new Set(i.map($=>$.user_id)),M=t.memberSearch.trim().toLowerCase(),r=t.profiles.filter($=>$.id!==n.currentUser.id&&!h.has($.id)&&(!M||($.full_name||"").toLowerCase().includes(M))),y=t.memberSelectedIds.size;return`
          <div class="chat-compose-popover chat-members-panel" data-chat-members-panel role="dialog" aria-label="Manage members">
            <div class="chat-compose-popover-head">
              <strong>Manage members</strong>
              <button type="button" class="chat-icon-btn" data-chat-members-close aria-label="Close member management"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-member-panel-list">
              ${i.map($=>{const L=$.profile||{},Y=$.user_id===n.currentUser.id,Ge=c||Y;return`
                  <div class="chat-member-row" data-chat-member-row="${m($.user_id)}">
                    <span class="chat-compose-avatar">${m((L.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${m(L.full_name||$.user_id)}</strong>
                      <span>${m(L.role?H(L.role):"Member")}</span>
                    </span>
                    ${$.membership_role==="owner"?'<span class="chat-owner-badge">Owner</span>':""}
                    ${Ge?`
                      <button type="button" class="chat-member-remove" data-chat-remove-member="${m($.user_id)}">
                        <i class="ti ${Y?"ti-logout":"ti-user-minus"}"></i><span>${Y?"Leave":"Remove"}</span>
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
                  <input data-chat-member-search type="search" placeholder="Search people..." value="${m(t.memberSearch)}" autocomplete="off">
                  <div class="chat-compose-summary">${y} selected</div>
                  <div class="chat-compose-list">
                    ${r.map($=>{const L=t.memberSelectedIds.has($.id)?" checked":"";return`
                        <label class="chat-compose-person">
                          <input type="checkbox" data-chat-member-pick="${m($.id)}"${L}>
                          <span class="chat-compose-avatar">${m(($.full_name||"?").slice(0,1))}</span>
                          <span class="chat-compose-person-copy">
                            <strong>${m($.full_name||"Unknown")}</strong>
                            <span>${m(H($.role))}</span>
                          </span>
                        </label>
                      `}).join("")}
                    ${r.length?"":'<div class="chat-muted">No matching people.</div>'}
                  </div>
                  <div class="chat-compose-actions">
                    <button type="button" data-chat-add-members="${m(s.id)}"${y?"":" disabled"}><i class="ti ti-users-plus"></i><span>Add selected</span></button>
                  </div>
                `:""}
              </div>
            `:""}
          </div>
        `}function ae(s){const i=s.deleted_at?"Message deleted":s.body||"";return i.length>90?`${i.slice(0,87)}...`:i}function He(s){if(!s?.reply_to_id)return"";const i=t.messages.find(c=>c.id===s.reply_to_id);return i?`
          <div class="chat-quote">
            <strong>${m(i.sender?.full_name||"Unknown")}</strong>
            <span>${m(ae(i))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function je(){const s=t.messages.find(i=>i.id===t.replyToMessageId);return s?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${m(s.sender?.full_name||"Unknown")}</strong>
              <span>${m(ae(s))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function We(s){return`
          <form class="chat-edit-form" data-chat-edit-form="${m(s.id)}">
            <input data-chat-edit-input="${m(s.id)}" type="text" value="${m(t.editDraft)}">
            <button type="submit" aria-label="Save edit"><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
          </form>
        `}function Be(s){const i=s.sender_id===n.currentUser.id?" mine":"",c=!!s.deleted_at,h=i&&!c,M=!c&&(i||Pe()),r=s.edited_at&&!c?'<span class="chat-edited">(edited)</span>':"",y=c?"":`
            <button type="button" data-chat-reply="${m(s.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${h?`<button type="button" data-chat-edit="${m(s.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
            ${M?`<button type="button" data-chat-delete="${m(s.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>`:""}
        `,$=c?"":`
          <div class="chat-message-actions" aria-label="Message actions">
            ${y}
          </div>
          <button type="button" class="chat-message-menu-btn" data-chat-message-menu="${m(s.id)}" aria-label="Message actions"><i class="ti ti-dots"></i></button>
          ${t.openMessageMenuId===s.id?`
            <div class="chat-message-menu" data-chat-message-menu-panel="${m(s.id)}">
              ${y}
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
          <div class="chat-message${i}${c?" deleted":""}" tabindex="0" data-chat-message-id="${m(s.id)}">
            <div class="chat-message-meta">
              <span>${m(s.sender?.full_name||"Unknown")}</span>
              <span>#${s.message_seq} ${r}</span>
            </div>
            ${He(s)}
            ${t.editingMessageId===s.id?We(s):`<div class="chat-message-body">${m(c?"Message deleted":s.body)}</div>`}
            ${$}
          </div>
        `}function b(){const s=t.conversations.find(r=>r.id===t.selectedConversationId)||null,i=t.profiles.filter(r=>r.id!==n.currentUser.id),h=s?.members.find(r=>r.user_id===n.currentUser.id)?.notification_level==="muted",M=s?.members.filter(r=>!r.left_at)||[];e.innerHTML=`
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <div class="chat-sidebar-tools">
                  <span class="chat-user-pill">${m(H(n.currentUser.role))}</span>
                  <button type="button" class="chat-icon-btn" data-chat-compose-toggle aria-label="New conversation" title="New conversation"><i class="ti ti-pencil-plus"></i></button>
                </div>
              </div>
              ${Ue(i)}
              <div class="chat-conversation-list">
                ${t.loading?'<div class="chat-muted">Loading...</div>':""}
                ${t.conversations.map(Ne).join("")}
                ${!t.loading&&!t.conversations.length?'<div class="chat-muted">No conversations yet.</div>':""}
              </div>
            </aside>
            <main class="chat-thread">
              ${t.error?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${m(t.error)}</span></div>`:""}
              ${s?`
                <header class="chat-thread-head">
                  <button type="button" class="chat-back-btn" data-chat-back aria-label="Back to conversations"><i class="ti ti-arrow-left"></i></button>
                  <div>
                    <div class="chat-eyebrow">${s.kind==="dm"?"Direct message":"Group"}</div>
                    <h2>${m(re(s,n.currentUser.id))}</h2>
                  </div>
                  <div class="chat-thread-tools">
                    ${s.kind==="group"?`
                      <button type="button" class="chat-icon-btn${t.membersOpen?" active":""}" data-chat-members-toggle aria-label="Manage members" title="Manage members">
                        <i class="ti ti-users"></i>
                      </button>
                    `:""}
                    <button type="button" class="chat-icon-btn${h?" active":""}" data-chat-toggle-mute aria-label="${h?"Unmute conversation":"Mute conversation"}" title="${h?"Unmute conversation":"Mute conversation"}">
                      <i class="ti ${h?"ti-bell-off":"ti-bell"}"></i>
                    </button>
                    <div class="chat-member-stack">
                      ${M.map(r=>`<span title="${m(r.profile?.full_name||r.user_id)}">${m((r.profile?.full_name||"?").slice(0,1))}</span>`).join("")}
                    </div>
                  </div>
                  ${Fe(s)}
                </header>
                <div class="chat-message-list">
                  ${t.messages.map(Be).join("")}
                  ${t.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  ${je()}
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
        `,e.querySelectorAll("[data-chat-select]").forEach(r=>{r.addEventListener("click",()=>d(r.dataset.chatSelect))}),e.querySelector("[data-chat-back]")?.addEventListener("click",()=>g()),e.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{s&&De(s)}),e.querySelector("[data-chat-members-toggle]")?.addEventListener("click",()=>{s&&(t.membersOpen?U():Se())}),e.querySelector("[data-chat-members-close]")?.addEventListener("click",()=>U({reset:!0})),e.querySelector("[data-chat-member-add-toggle]")?.addEventListener("click",()=>ke()),e.querySelector("[data-chat-member-search]")?.addEventListener("input",r=>{t.memberSearch=r.currentTarget.value,b();const y=e.querySelector("[data-chat-member-search]");y?.focus(),y?.setSelectionRange?.(y.value.length,y.value.length)}),e.querySelectorAll("[data-chat-member-pick]").forEach(r=>{r.addEventListener("change",()=>Me(r.dataset.chatMemberPick,r.checked))}),e.querySelector("[data-chat-add-members]")?.addEventListener("click",r=>{Ee(r.currentTarget.dataset.chatAddMembers)}),e.querySelectorAll("[data-chat-remove-member]").forEach(r=>{r.addEventListener("click",()=>{s&&Ie(s.id,r.dataset.chatRemoveMember)})}),e.querySelector("[data-chat-compose-toggle]")?.addEventListener("click",()=>{t.composeOpen?p():k()}),e.querySelector("[data-chat-compose-close]")?.addEventListener("click",()=>p()),e.querySelector("[data-chat-compose-search]")?.addEventListener("input",r=>{t.composeSearch=r.currentTarget.value,b();const y=e.querySelector("[data-chat-compose-search]");y?.focus(),y?.setSelectionRange?.(y.value.length,y.value.length)}),e.querySelectorAll("[data-chat-compose-member]").forEach(r=>{r.addEventListener("change",()=>V(r.dataset.chatComposeMember,r.checked))}),e.querySelector("[data-chat-group-title]")?.addEventListener("input",r=>{t.composeGroupTitle=r.currentTarget.value,b();const y=e.querySelector("[data-chat-group-title]");y?.focus(),y?.setSelectionRange?.(y.value.length,y.value.length)}),e.querySelector("[data-chat-start-dm]")?.addEventListener("click",r=>{Ae(r.currentTarget.dataset.chatStartDm)}),e.querySelector("[data-chat-create-group]")?.addEventListener("click",()=>{Oe(t.composeGroupTitle,[...t.composeSelectedMemberIds])}),e.querySelector("[data-chat-send-form]")?.addEventListener("submit",r=>{r.preventDefault(),w(r.currentTarget)}),e.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>u()),e.querySelectorAll("[data-chat-reply]").forEach(r=>{r.addEventListener("click",()=>E(r.dataset.chatReply))}),e.querySelectorAll("[data-chat-edit]").forEach(r=>{r.addEventListener("click",()=>Ce(r.dataset.chatEdit))}),e.querySelectorAll("[data-chat-delete]").forEach(r=>{r.addEventListener("click",()=>{t.confirmingDeleteMessageId=r.dataset.chatDelete,t.openMessageMenuId=null,b()})}),e.querySelectorAll("[data-chat-message-menu]").forEach(r=>{r.addEventListener("click",()=>{t.openMessageMenuId=t.openMessageMenuId===r.dataset.chatMessageMenu?null:r.dataset.chatMessageMenu,t.confirmingDeleteMessageId=null,b()})}),e.querySelectorAll("[data-chat-confirm-delete]").forEach(r=>{r.addEventListener("click",()=>Le(r.dataset.chatConfirmDelete))}),e.querySelectorAll("[data-chat-cancel-delete]").forEach(r=>{r.addEventListener("click",()=>{t.confirmingDeleteMessageId===r.dataset.chatCancelDelete&&(t.confirmingDeleteMessageId=null),b()})}),e.querySelectorAll("[data-chat-edit-form]").forEach(r=>{r.addEventListener("submit",y=>{y.preventDefault(),qe(y.currentTarget)})}),e.querySelectorAll("[data-chat-cancel-edit]").forEach(r=>{r.addEventListener("click",()=>Te())})}return _(),l=setInterval(()=>_(),3e4),typeof n.service.subscribeToConversationEvents=="function"&&(f=n.service.subscribeToConversationEvents(()=>Re())),()=>{a=!0,l&&clearInterval(l),f&&f(),e.removeEventListener?.("click",v),typeof document<"u"&&document.removeEventListener("keydown",C),e.classList.remove("wein-chat-root"),e.classList.remove("chat-has-selection"),e.innerHTML=""}}}}function A(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data||[]}function j(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data}function te(e){return e?{id:e.id,full_name:e.full_name,role:e.role,email:e.email??null}:null}function mt(e){return{conversation_id:e.conversation_id,user_id:e.user_id,membership_role:e.membership_role,joined_at:e.joined_at,left_at:e.left_at,last_read_seq:Number(e.last_read_seq||0),notification_level:e.notification_level,profile:te(e.profile||e.profiles)}}function O(e){return{id:e.id,conversation_id:e.conversation_id,message_seq:Number(e.message_seq||0),sender_id:e.sender_id,body:e.body,reply_to_id:e.reply_to_id,client_nonce:e.client_nonce,created_at:e.created_at,edited_at:e.edited_at,deleted_at:e.deleted_at,sender:te(e.sender||e.profiles)}}function ie(e,n){const t=(e.members||e.wein_chat_members||[]).map(mt),a=e.last_message||e.wein_chat_messages||[],o=Array.isArray(a)&&a.length?O(a[0]):null,l={id:e.id,kind:e.kind,title:e.title,created_by:e.created_by,created_at:e.created_at,archived_at:e.archived_at,members:t,last_message:o,unread_count:0};return l.unread_count=lt(l,n),l}function ft({supabase:e,currentUserId:n}){if(!e)throw new Error("supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(a){const o=await e.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",a).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"}).single();if(o.error)throw new Error(`fetch conversation: ${o.error.message||o.error}`);return ie(o.data,n)}return{async listProfiles(){const a=await e.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return A(a,"list profiles").map(te)},async listConversations(){const a=await e.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"});return A(a,"list conversations").map(o=>ie(o,n))},async listMessages(a){const o=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",a).is("deleted_at",null).order("message_seq",{ascending:!0});return A(o,"list messages").map(O)},async createGroup(a,o=[]){const l=j(await e.rpc("wein_chat_create_group",{p_title:a}),"create group");for(const f of o)await this.addMember(l,f);return l},async getOrCreateDm(a){return j(await e.rpc("wein_chat_get_or_create_dm",{p_other_user_id:a}),"get or create DM")},async addMember(a,o){j(await e.rpc("wein_chat_add_member",{p_conversation_id:a,p_user_id:o}),"add member")},async removeMember(a,o){j(await e.rpc("wein_chat_remove_member",{p_conversation_id:a,p_user_id:o}),"remove member")},async sendMessage({conversationId:a,body:o,clientNonce:l,replyToId:f=null}){const v=await e.from("wein_chat_messages").insert({conversation_id:a,sender_id:n,body:o,client_nonce:l,reply_to_id:f}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(v.error)throw new Error(`send message: ${v.error.message||v.error}`);return O(v.data)},async updateMessage(a,o){const l=await e.from("wein_chat_messages").update({body:o,edited_at:new Date().toISOString()}).eq("id",a).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(l.error)throw new Error(`update message: ${l.error.message||l.error}`);return O(l.data)},async deleteMessage(a){const o=await e.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",a).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(o.error)throw new Error(`delete message: ${o.error.message||o.error}`);return O(o.data)},async markRead(a,o){const l=await e.from("wein_chat_members").update({last_read_seq:o}).eq("conversation_id",a).eq("user_id",n).select("conversation_id, user_id, last_read_seq");if(!A(l,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(a,o){const l=await e.from("wein_chat_members").update({notification_level:o}).eq("conversation_id",a).eq("user_id",n).select("conversation_id, user_id, notification_level");if(!A(l,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(a){if(typeof e.channel!="function")return()=>{};const o=e.channel(`wein-chat:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},a).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},a).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},a).subscribe();return()=>{typeof e.removeChannel=="function"?e.removeChannel(o):typeof o.unsubscribe=="function"&&o.unsubscribe()}},fetchConversation:t}}function pt(e){return typeof e.session.user=="object"&&e.session.user!==null?e.session.user:{}}function ht(e){const n=pt(e),t=n.id;if(!t)throw new Error("Team chat requires an authenticated user id.");return{id:t,full_name:e.session.fullName||n.email||"Portal user",role:e.session.role||"team",email:n.email||null}}let K=null;function _t(e){K=e||null}function vt(){const e=ut();x({id:"team-chat",mount(n,t){const a=K;K=null;const o=ht(t),l=ft({supabase:t.session.client,currentUserId:o.id});return e.mount(n,{currentUser:o,service:l,initialConversationId:a})}})}function gt(e,n={}){return e?e.author_id&&n[e.author_id]?.full_name?n[e.author_id].full_name:e.author_name||"Unknown":"Unknown"}function be(e){return!!e?.resolved_at}function bt(e=[]){const n=new Map,t=[];e.forEach(l=>{n.set(l.id,{...l,replies:[]})}),n.forEach(l=>{l.reply_to_id&&n.has(l.reply_to_id)?n.get(l.reply_to_id).replies.push(l):t.push(l)});const a=(l,f)=>String(l.created_at||"").localeCompare(String(f.created_at||"")),o=l=>{l.replies.sort(a),l.replies.forEach(o)};return t.sort(a),t.forEach(o),t}function yt(e=[]){return e.filter(n=>!be(n)).length}function oe(e,n=90){const t=String(e?.body||"").replace(/\s+/g," ").trim();return t.length<=n?t:`${t.slice(0,Math.max(0,n-1)).trimEnd()}…`}function I(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function ce(e={}){return e.taskId?"Task discussion":e.providerId?"Provider discussion":e.offerId?"Offer discussion":"Record discussion"}function wt(e={}){return e.taskId?`Task ${e.taskId}`:e.providerId?`Provider ${e.providerId}`:e.offerId?`Offer ${e.offerId}`:"No record scope"}function $t(){return{id:"record-discussion",mount(e,n){const t={comments:[],peopleById:Object.fromEntries((n.people||[]).map(u=>[u.id,u])),loading:!0,error:null,replyToId:null,taskSourceCommentId:null};let a=!1,o=null,l=null;e.classList.add("wein-discussion-root");async function f(){try{t.error=null,t.comments=await n.service.listComments(n.scope||{})}catch(u){t.error=u.message||String(u)}finally{t.loading=!1,a||E()}}async function v(u){const k=u.querySelector("[data-discussion-body]"),p=k.value.trim();p&&(k.value="",await n.service.postComment({...n.scope||{},body:p,replyToId:t.replyToId}),t.replyToId=null,await f())}async function C(u){const k=e.querySelector(`[data-resolve-note="${CSS.escape(u)}"]`)?.value||"";await n.service.resolveComment(u,k),await f()}async function _(u){await n.service.reopenComment(u),await f()}async function d(u){const k=u.querySelector("[data-task-title]"),p=k.value.trim();!p||!t.taskSourceCommentId||(await n.service.createTaskFromComment(t.taskSourceCommentId,p,n.currentUser?.id||null),k.value="",t.taskSourceCommentId=null,await f())}function g(u,k=0){const p=be(u),V=gt(u,t.peopleById);return`
          <article class="discussion-comment${p?" resolved":""}" style="--depth:${Math.min(k,4)}">
            <div class="discussion-comment-meta">
              <span>${I(V)}</span>
              <span>${I(u.created_at||"")}</span>
              ${p?'<span class="discussion-resolved-pill">Resolved</span>':""}
            </div>
            <div class="discussion-comment-body">${I(u.body)}</div>
            ${u.resolved_note?`<div class="discussion-resolved-note">${I(u.resolved_note)}</div>`:""}
            <div class="discussion-actions">
              <button type="button" data-discussion-reply="${I(u.id)}">Reply</button>
              ${p?`<button type="button" data-discussion-reopen="${I(u.id)}">Reopen</button>`:`<button type="button" data-discussion-resolve="${I(u.id)}">Resolve</button>`}
              <button type="button" data-discussion-task="${I(u.id)}">Create task</button>
            </div>
            ${p?"":`<input class="discussion-resolve-note" data-resolve-note="${I(u.id)}" placeholder="Optional resolve note">`}
            ${u.replies?.length?`<div class="discussion-replies">${u.replies.map(z=>g(z,k+1)).join("")}</div>`:""}
          </article>
        `}function w(){if(!t.taskSourceCommentId)return"";const u=t.comments.find(k=>k.id===t.taskSourceCommentId);return`
          <form class="discussion-task-box" data-discussion-task-form>
            <div>
              <div class="discussion-eyebrow">Create task from comment</div>
              <p>${I(oe(u))}</p>
            </div>
            <input data-task-title type="text" placeholder="Task title">
            <div class="discussion-task-actions">
              <button type="submit">Create task</button>
              <button type="button" data-discussion-task-cancel>Cancel</button>
            </div>
          </form>
        `}function E(){const u=bt(t.comments),k=t.replyToId?t.comments.find(p=>p.id===t.replyToId):null;e.innerHTML=`
          <section class="discussion-shell" aria-label="${I(ce(n.scope))}">
            <header class="discussion-header">
              <div>
                <div class="discussion-eyebrow">${I(ce(n.scope))}</div>
                <h2>Discussion</h2>
                <p>${I(wt(n.scope))}</p>
              </div>
              <span class="discussion-count">${yt(t.comments)} unresolved</span>
            </header>
            ${t.error?`<div class="discussion-error">${I(t.error)}</div>`:""}
            ${w()}
            <div class="discussion-list">
              ${t.loading?'<div class="discussion-muted">Loading discussion...</div>':""}
              ${u.map(p=>g(p)).join("")}
              ${!t.loading&&!u.length?'<div class="discussion-muted">No comments yet.</div>':""}
            </div>
            <form class="discussion-composer" data-discussion-form>
              ${k?`
                <div class="discussion-replying">
                  Replying to: ${I(oe(k,70))}
                  <button type="button" data-discussion-cancel-reply>Cancel</button>
                </div>
              `:""}
              <textarea data-discussion-body rows="3" placeholder="Write a record-attached note..."></textarea>
              <button type="submit">${k?"Reply":"Post comment"}</button>
            </form>
          </section>
        `,e.querySelector("[data-discussion-form]")?.addEventListener("submit",p=>{p.preventDefault(),v(p.currentTarget)}),e.querySelector("[data-discussion-cancel-reply]")?.addEventListener("click",()=>{t.replyToId=null,E()}),e.querySelector("[data-discussion-task-cancel]")?.addEventListener("click",()=>{t.taskSourceCommentId=null,E()}),e.querySelector("[data-discussion-task-form]")?.addEventListener("submit",p=>{p.preventDefault(),d(p.currentTarget)}),e.querySelectorAll("[data-discussion-reply]").forEach(p=>{p.addEventListener("click",()=>{t.replyToId=p.dataset.discussionReply,E()})}),e.querySelectorAll("[data-discussion-resolve]").forEach(p=>{p.addEventListener("click",()=>C(p.dataset.discussionResolve))}),e.querySelectorAll("[data-discussion-reopen]").forEach(p=>{p.addEventListener("click",()=>_(p.dataset.discussionReopen))}),e.querySelectorAll("[data-discussion-task]").forEach(p=>{p.addEventListener("click",()=>{t.taskSourceCommentId=p.dataset.discussionTask,E()})})}return f(),o=setInterval(()=>f(),3e4),typeof n.service.subscribeToDiscussionEvents=="function"&&(l=n.service.subscribeToDiscussionEvents(()=>f())),()=>{a=!0,o&&clearInterval(o),l&&l(),e.classList.remove("wein-discussion-root"),e.innerHTML=""}}}}function D(e){if(e)throw e}function St({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t({taskId:_,providerId:d,offerId:g}={}){let w=e.from("wein_comments").select("*").order("created_at",{ascending:!0});_&&(w=w.eq("task_id",_)),d&&(w=w.eq("provider_id",d)),g&&(w=w.eq("offer_id",g));const{data:E,error:u}=await w;return D(u),E||[]}async function a({body:_,taskId:d=null,providerId:g=null,offerId:w=null,replyToId:E=null}){const u=d?{task_id:d}:g?{provider_id:g}:w?{offer_id:w}:null;if(!u)throw new Error("postComment requires taskId, providerId, or offerId");const{data:k,error:p}=await e.from("wein_comments").insert({...u,reply_to_id:E,body:_,author_role:"team"}).select("*").single();return D(p),k}async function o(_,d=""){const{data:g,error:w}=await e.from("wein_comments").update({resolved_at:new Date().toISOString(),resolved_note:d}).eq("id",_).select("*");if(D(w),!g?.length)throw new Error("Resolve affected zero comments");return g[0]}async function l(_){const{data:d,error:g}=await e.from("wein_comments").update({resolved_at:null,resolved_note:null}).eq("id",_).select("*");if(D(g),!d?.length)throw new Error("Reopen affected zero comments");return d[0]}async function f(_,d){const{data:g,error:w}=await e.from("wein_comment_mentions").insert({comment_id:_,mentioned_user_id:d}).select("*");return D(w),g?.[0]||null}async function v(_,d,g=null,w=null){const{data:E,error:u}=await e.rpc("wein_create_task_from_comment",{p_comment_id:_,p_title:d,p_assigned_to_user_id:g,p_due_date:w});return D(u),E}function C(_){if(!e.channel)return()=>{};const d=e.channel(`record-discussion:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},_).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},_).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_task_links"},_).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(d);if(d?.unsubscribe)return d.unsubscribe()}}return{listComments:t,postComment:a,resolveComment:o,reopenComment:l,addMention:f,createTaskFromComment:v,subscribeToDiscussionEvents:C}}function T(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}const kt={critical:"Critical",high:"High",medium:"Medium",low:"Low"},Mt={task:"Task",mention:"Mention",discussion:"Discussion",review:"Review"};function Et(e){if(!e)return"No due date";const n=new Date(e);return Number.isNaN(n.getTime())?String(e):n.toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function It(e=[]){return["critical","high","medium","low"].map(n=>({severity:n,items:e.filter(t=>t.severity===n)})).filter(n=>n.items.length)}function Ct(){return{id:"work-inbox",mount(e,n){const t={items:[],loading:!0,error:null};let a=!1,o=null,l=null;e.classList.add("wein-work-inbox-root");async function f(){try{t.error=null,t.items=await n.service.loadInbox()}catch(d){t.error=d.message||String(d)}finally{t.loading=!1,a||_()}}function v(d){if(typeof n.onSelectItem=="function"){n.onSelectItem(d);return}d.href&&(window.location.hash=d.href)}function C(d){return`
          <button type="button" class="work-inbox-item severity-${T(d.severity)}" data-inbox-item="${T(d.kind)}:${T(d.entity_id)}:${T(d.reason_code)}">
            <span class="work-inbox-kind">${T(Mt[d.kind]||d.kind)}</span>
            <span class="work-inbox-title">${T(d.title)}</span>
            <span class="work-inbox-reason">${T(d.reason_code.replaceAll("_"," "))}</span>
            <span class="work-inbox-due">${T(Et(d.due_at))}</span>
            <span class="work-inbox-action">${T(d.next_action)}</span>
          </button>
        `}function _(){const d=It(t.items);e.innerHTML=`
          <section class="work-inbox-shell" aria-label="Work inbox">
            <header class="work-inbox-header">
              <div>
                <div class="work-inbox-eyebrow">Today extension</div>
                <h2>Work inbox</h2>
                <p>Normalized tasks, mentions, discussion replies, and review signals.</p>
              </div>
              <div class="work-inbox-total">${t.items.length} item${t.items.length===1?"":"s"}</div>
            </header>
            ${t.error?`<div class="work-inbox-error">${T(t.error)}</div>`:""}
            <div class="work-inbox-toolbar">
              <button type="button" data-inbox-refresh>Refresh</button>
            </div>
            <div class="work-inbox-list">
              ${t.loading?'<div class="work-inbox-muted">Loading inbox...</div>':""}
              ${d.map(g=>`
                <section class="work-inbox-group">
                  <h3>${T(kt[g.severity])}</h3>
                  ${g.items.map(C).join("")}
                </section>
              `).join("")}
              ${!t.loading&&!t.items.length?'<div class="work-inbox-muted">No attention items right now.</div>':""}
            </div>
          </section>
        `,e.querySelector("[data-inbox-refresh]")?.addEventListener("click",()=>f()),e.querySelectorAll("[data-inbox-item]").forEach(g=>{g.addEventListener("click",()=>{const w=g.dataset.inboxItem,E=t.items.find(u=>`${u.kind}:${u.entity_id}:${u.reason_code}`===w);E&&v(E)})})}return f(),o=setInterval(()=>f(),6e4),typeof n.service.subscribeToInboxEvents=="function"&&(l=n.service.subscribeToInboxEvents(()=>f())),()=>{a=!0,o&&clearInterval(o),l&&l(),e.classList.remove("wein-work-inbox-root"),e.innerHTML=""}}}}const le={critical:0,high:1,medium:2,low:3};function ne(e,n=new Date){if(!e)return"low";const t=new Date(e);if(Number.isNaN(t.getTime()))return"low";const a=t.getTime()-n.getTime();return a<0?"critical":a<=1440*60*1e3?"high":a<=4320*60*1e3?"medium":"low"}function Tt(e,{now:n=new Date}={}){return{kind:"task",entity_id:e.id,title:e.title||"Untitled task",reason_code:e.due_date?"task_due":"task_open",severity:ne(e.due_date,n),owner_id:e.assigned_to_user_id||e.owner_id||null,due_at:e.due_date||null,next_action:"Open task",href:`#tasks/${e.id}`,source:e}}function qt(e,{comment:n,currentUserId:t}={}){return{kind:"mention",entity_id:e.comment_id,title:n?.body?`Mention: ${n.body}`:"Mention in discussion",reason_code:"unresolved_mention",severity:n?.resolved_at?"low":"high",owner_id:t||e.mentioned_user_id,due_at:n?.created_at||e.created_at||null,next_action:"Reply or resolve",href:`#comments/${e.comment_id}`,source:{mention:e,comment:n}}}function Lt(e,{currentUserId:n,now:t=new Date}={}){return{kind:"discussion",entity_id:e.id,title:e.body||"Discussion awaiting reply",reason_code:"thread_awaiting_reply",severity:ne(e.next_reply_due_at||e.created_at,t),owner_id:n||null,due_at:e.next_reply_due_at||null,next_action:"Reply in thread",href:`#comments/${e.id}`,source:e}}function Dt(e,{now:n=new Date}={}){return{kind:e.kind||"review",entity_id:e.id,title:e.title||e.offer_title||"Founder review needed",reason_code:e.reason_code||"founder_review",severity:ne(e.due_at||e.created_at,n),owner_id:e.owner_id||null,due_at:e.due_at||e.created_at||null,next_action:"Review",href:e.href||`#review/${e.id}`,source:e}}function At(e=[]){return[...e].sort((n,t)=>{const a=(le[n.severity]??9)-(le[t.severity]??9);return a||String(n.due_at||"").localeCompare(String(t.due_at||""))})}function Ot(e=[]){const n=new Set;return e.filter(t=>{const a=`${t.kind}:${t.entity_id}:${t.reason_code}`;return n.has(a)?!1:(n.add(a),!0)})}function Rt({tasks:e=[],mentions:n=[],commentsById:t={},awaitingReplies:a=[],founderReviews:o=[]},l={}){const f=[...e.map(v=>Tt(v,l)),...n.map(v=>qt(v,{...l,comment:t[v.comment_id]})),...a.map(v=>Lt(v,l)),...o.map(v=>Dt(v,l))];return At(Ot(f))}function de(e){if(e)throw e}function Nt({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(){let f=e.from("wein_tasks").select("*").neq("status","done").order("due_date",{ascending:!0,nullsFirst:!1});n&&(f=f.eq("assigned_to_user_id",n));const{data:v,error:C}=await f;return de(C),v||[]}async function a(){const{data:f,error:v}=await e.from("wein_comment_mentions").select("comment_id,mentioned_user_id,created_at,wein_comments(*)").eq("mentioned_user_id",n).is("wein_comments.resolved_at",null).order("created_at",{ascending:!0});return de(v),f||[]}async function o(){const[f,v]=await Promise.all([t(),a()]),C={},_=v.map(d=>{const g=d.wein_comments||d.comment||null;return g?.id&&(C[g.id]=g),{comment_id:d.comment_id,mentioned_user_id:d.mentioned_user_id,created_at:d.created_at}});return Rt({tasks:f,mentions:_,commentsById:C},{currentUserId:n})}function l(f){if(!e.channel)return()=>{};const v=e.channel(`work-inbox:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_tasks"},f).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},f).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},f).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(v);if(v?.unsubscribe)return v.unsubscribe()}}return{fetchOpenTasks:t,fetchUnresolvedMentions:a,loadInbox:o,subscribeToInboxEvents:l}}const ye=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function Pt(e){for(const n of ye)x({id:n,mount:()=>{e[n]()}})}function se(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const Ut=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function Ft(e,n){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${Ut.map(t=>`<button class="chip ${e===t?"active":""}" type="button" onclick="${n}('${t.replace(/'/g,"\\'")}')">${t==="all"?"All":se(t)}</button>`).join("")}</div>`}function Ht(e,n){return n==="all"||String(e||"")===n}function jt(e){return String(e?.category||e?.vertical||"-")}function Wt(e){const n=String(e||"").toLowerCase();return n.includes("dining")?"dining":n.includes("health")?"health":n.includes("fun")?"fun":n.includes("hotel")?"hotels":""}function Bt(e,n=Date.now()){return e?Math.floor((n-new Date(e).getTime())/864e5):0}function J(e=new Date){const n=new Date(e);return n.setHours(0,0,0,0),n}function Gt(e,n=new Date){return e?Math.round((J(n).getTime()-J(e).getTime())/864e5):null}function we(e,n){let t=String(e||"").replace(/\D/g,"");if(!t)return null;t.startsWith("0")&&(t=`20${t.slice(1)}`);const a=`Hi! Following up on the WeIN offer sheet for ${n} - do you have 5 minutes today?`;return`https://wa.me/${t}?text=${encodeURIComponent(a)}`}function xt(e,n){const t=we(e,n);return t?`<a class="mini-btn" href="${se(t)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function P(e){return e.id}function Vt(e){return S("profiles").find(n=>P(n)===e)??null}function zt(e){return S("providers").find(n=>P(n)===e)??null}function Yt(e){return S("leads").find(n=>P(n)===e)??null}function Kt(e){return S("tasks").find(n=>P(n)===e)??null}function Jt(e){return S("offers").find(n=>P(n)===e)??null}function Qt(e){return S("offers").filter(n=>n.provider_id===e)}function Xt(e){return S("tasks").filter(n=>n.provider_id===e)}function Zt(e){return S("tasks").filter(n=>n.lead_id===e)}const en=Object.freeze(Object.defineProperty({__proto__:null,leadById:Yt,offerById:Jt,offersForProvider:Qt,profileById:Vt,providerById:zt,taskById:Kt,tasksForLead:Zt,tasksForProvider:Xt},Symbol.toStringTag,{value:"Module"}));it();vt();const $e={api:he,auth:{canDelete:Q,canManageDeals:me,canEditProviderProfile:fe,navHiddenForRole:X,defaultViewForRole:pe},platform:{getSupabaseClient:Z,getAccessToken:G,getSessionContext:ze},shared:{escapeHtml:se,daysSince:Bt,startOfLocalDay:J,dayDiffFromToday:Gt,whatsappLink:we,whatsappButtonHtml:xt,categoryChipsHtml:Ft,matchesCategoryFilter:Ht,categoryLabel:jt,catBadgeClass:Wt},core:{createPortalContext:nt,getView:ge,mountView:rt,registeredViewIds:st,registerView:x},legacy:{LEGACY_VIEW_IDS:ye,registerLegacyViews:Pt},features:{requestOpenChatConversation:_t,createDiscussionViewModule:$t,createSupabaseDiscussionService:St,createWorkInboxViewModule:Ct,createSupabaseWorkInboxService:Nt},store:ve,selectors:en};window.WEIN_PORTAL_MODULES=$e;for(const e of window.WEIN_PORTAL_MODULES_READY??[])e($e);window.WEIN_PORTAL_MODULES_READY=[];
