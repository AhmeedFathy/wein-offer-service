function V(e){return typeof e=="object"&&e!==null?e.role:e}function L(e){const t=V(e);return t==="admin"||t==="manager"}const W=L;function B(e){const t=V(e);return t==="admin"||t==="manager"||t==="deal_breaker"}const ge={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function A(e){return e?ge[e]??[]:[]}function G(e){return A(e).includes("pipeline")?"tasks":"pipeline"}function p(){return window.WEIN_PORTAL_LEGACY??{}}function P(){const e=p().supabaseClient;if(!e)throw new Error("Portal Supabase client is not available yet.");return e}function k(){const e=p().getSupabaseUrl?.();if(!e)throw new Error("Portal Supabase URL is not available yet.");return e}function ve(){const e=p().getSupabaseAnonKey?.();if(!e)throw new Error("Portal Supabase anon key is not available yet.");return e}function M(){return p().getAccessToken?.()??null}function ye(){return{client:P(),accessToken:M()}}class be extends Error{constructor(t,a,r){super(t),this.status=a,this.body=r,this.name="PortalApiError"}status;body}function $(){const e=p().headers?.();if(e)return e;const t=ve();return{apikey:t,Authorization:`Bearer ${M()||t}`,"Content-Type":"application/json"}}async function N(e,t){if(e.ok)return;const a=await e.text();throw new be(`Supabase ${t} failed: ${e.status}${a?` ${a}`:""}`,e.status,a)}async function we(e){const t=p().get;if(t)return t(e);const a=await fetch(`${k()}/rest/v1/${e}`,{headers:$()});return await N(a,"GET"),a.json()}async function $e(e,t){const a=p().post;if(a)return a(e,t);const r=await fetch(`${k()}/rest/v1/${e}`,{method:"POST",headers:{...$(),Prefer:"return=representation"},body:JSON.stringify(t)});return await N(r,"POST"),r.json()}async function Ee(e,t){const a=p().patch;return a?a(e,t):(await fetch(`${k()}/rest/v1/${e}`,{method:"PATCH",headers:$(),body:JSON.stringify(t)})).ok}async function Ce(e){const t=p().delete;if(t)return t(e);const a=await fetch(`${k()}/rest/v1/${e}`,{method:"DELETE",headers:$()});return await N(a,"DELETE"),!0}const Y={headers:$,get:we,post:$e,patch:Ee,delete:Ce},Se={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function ke(){const e=p().getCaches?.();return e?{providers:e.providers??[],offers:e.offers??[],negotiations:e.negotiations??[],files:e.files??[],leads:e.leads??[],outcomes:e.outcomes??[],tasks:e.tasks??[],profiles:e.profiles??[],redemptions:e.redemptions??[],campaigns:e.campaigns??[],calendarNotes:e.calendarNotes??[]}:Se}function f(e){return ke()[e]}function z(e,t){const a=p().setCache;if(!a)throw new Error("Portal cache bridge is not available yet.");a(e,[...t])}function Me(e,t){z(e,t(f(e)))}const K={get providers(){return f("providers")},get offers(){return f("offers")},get negotiations(){return f("negotiations")},get files(){return f("files")},get leads(){return f("leads")},get outcomes(){return f("outcomes")},get tasks(){return f("tasks")},get profiles(){return f("profiles")},get redemptions(){return f("redemptions")},get campaigns(){return f("campaigns")},get calendarNotes(){return f("calendarNotes")},getCache:f,replaceCache:z,updateCache:Me};function C(){const e=window.WEIN??{};return{user:e.user,role:e.role??sessionStorage.getItem("weinRole"),fullName:e.fullName??null,accessToken:M(),client:P()}}function qe(){const e=C();return{api:Y,store:K,session:e,permissions:{canDelete:()=>L(C()),canManageDeals:()=>W(C()),canEditProviderProfile:()=>B(C()),navHiddenForRole:A,defaultViewForRole:G},navigate(t,a){window.showView?.(t,a)}}}const w=new Map;let S=null;function q(e){if(!e.id)throw new Error("View id is required.");if(w.has(e.id))throw new Error(`View already registered: ${e.id}`);w.set(e.id,e)}function J(e){return w.get(e)}function Te(){return[...w.keys()]}function De(){if(!S)return;const e=S;S=null,e()}function Ie(e,t,a){const r=J(e);if(!r)throw new Error(`Unknown portal view: ${e}`);De();const i=r.mount(t,a);S=typeof i=="function"?i:null}function Le(){w.has("__dummy_cleanup_probe")||q({id:"__dummy_cleanup_probe",mount(e){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,e.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function Ae(e="chat"){const t=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${e}-${t}`}function F(e,t){return e.kind==="group"?e.title||"Untitled group":(e.members||[]).map(r=>r.profile).find(r=>r&&r.id!==t)?.full_name||"Direct message"}function Pe(e){return[...e].sort((t,a)=>{const r=t.last_message?.created_at||t.created_at,i=a.last_message?.created_at||a.created_at;return new Date(i).getTime()-new Date(r).getTime()})}function Ne(e,t){const a=(e.members||[]).find(i=>i.user_id===t),r=e.last_message?.message_seq||0;return Math.max(0,r-(a?.last_read_seq||0))}function Re(e){if(!e)return"No messages yet";const t=(e.deleted_at?"Message deleted":e.body||"").trim();return t.length>82?`${t.slice(0,79)}...`:t}function u(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function Ue(e){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[e]||e}function Oe(){return{id:"team-chat",mount(e,t){const a={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,loading:!0,error:null};let r=!1,i=t.initialConversationId||null,d=null,h=null;e.classList.add("wein-chat-root");async function m({keepMessages:n=!0}={}){try{a.error=null;const[o,l]=await Promise.all([t.service.listProfiles(),t.service.listConversations()]);if(a.profiles=o,a.conversations=Pe(l),i&&(a.conversations.some(c=>c.id===i)&&(a.selectedConversationId=i),i=null),!a.selectedConversationId&&a.conversations.length&&(a.selectedConversationId=a.conversations[0].id),a.selectedConversationId&&n){a.messages=await t.service.listMessages(a.selectedConversationId);const c=a.messages.at(-1)?.message_seq||0;if(c)try{await t.service.markRead(a.selectedConversationId,c)}catch(s){console.error("Failed to mark chat messages as read",s)}}}catch(o){a.error=o.message||String(o)}finally{a.loading=!1,r||g()}}async function T(n){a.selectedConversationId=n,e.classList.add("chat-has-selection"),a.messages=await t.service.listMessages(n),r||g();const o=a.messages.at(-1)?.message_seq||0;if(o)try{await t.service.markRead(n,o)}catch(l){console.error("Failed to mark chat messages as read",l)}await m()}function x(){e.classList.remove("chat-has-selection")}async function ee(n){const o=n.querySelector("[data-chat-composer]"),l=o.value.trim();if(!l||!a.selectedConversationId)return;const c=a.replyToMessageId;o.value="",a.replyToMessageId=null;const s=await t.service.sendMessage({conversationId:a.selectedConversationId,body:l,clientNonce:Ae("portal-chat"),replyToId:c});a.messages=[...a.messages,s],r||g();try{await t.service.markRead(a.selectedConversationId,s.message_seq)}catch(_){console.error("Failed to mark chat message as read",_)}await m()}function te(n){n&&(a.replyToMessageId=n,g(),e.querySelector("[data-chat-composer]")?.focus())}function ae(){a.replyToMessageId=null,g()}function ne(n){const o=a.messages.find(c=>c.id===n);if(!o)return;a.editingMessageId=n,a.editDraft=o.body||"",g();const l=e.querySelector(`[data-chat-edit-input="${CSS.escape(n)}"]`);l?.focus(),l?.select?.()}function re(){a.editingMessageId=null,a.editDraft="",g()}async function se(n){const o=n.dataset.chatEditForm,c=n.querySelector("[data-chat-edit-input]").value.trim();if(!o||!c)return;const s=await t.service.updateMessage(o,c);a.messages=a.messages.map(_=>_.id===s.id?s:_),a.editingMessageId=null,a.editDraft="",r||g(),await m()}async function ie(n){if(!n)return;const o=await t.service.deleteMessage(n);a.messages=a.messages.map(l=>l.id===n?{...l,...o,body:"Message deleted",deleted_at:o.deleted_at||new Date().toISOString()}:l),a.replyToMessageId===n&&(a.replyToMessageId=null),r||g(),await m()}async function oe(n){const l=n.members.find(c=>c.user_id===t.currentUser.id)?.notification_level==="muted"?"all":"muted";await t.service.setNotificationLevel(n.id,l),a.conversations=a.conversations.map(c=>c.id!==n.id?c:{...c,members:c.members.map(s=>s.user_id===t.currentUser.id?{...s,notification_level:l}:s)}),r||g(),await m()}async function le(n){const o=n.value;if(!o)return;const l=await t.service.getOrCreateDm(o);n.value="",await T(l)}async function ce(n){const o=n.querySelector("[data-chat-group-title]"),l=n.querySelector("[data-chat-group-members]"),c=o.value.trim(),s=[...l.selectedOptions].map(y=>y.value);if(!c)return;const _=await t.service.createGroup(c,s);o.value="";for(const y of l.options)y.selected=!1;await T(_)}function de(){r||m()}function ue(n){const o=n.id===a.selectedConversationId?" selected":"",l=n.unread_count?`<span class="chat-count">${n.unread_count}</span>`:"";return`
          <button type="button" class="chat-conversation${o}" data-chat-select="${u(n.id)}">
            <span class="chat-conversation-title">${u(F(n,t.currentUser.id))}</span>
            ${l}
            <span class="chat-conversation-preview">${u(Re(n.last_message))}</span>
          </button>
        `}function fe(){return["admin","manager"].includes(t.currentUser.role)}function O(n){const o=n.deleted_at?"Message deleted":n.body||"";return o.length>90?`${o.slice(0,87)}...`:o}function me(n){if(!n?.reply_to_id)return"";const o=a.messages.find(l=>l.id===n.reply_to_id);return o?`
          <div class="chat-quote">
            <strong>${u(o.sender?.full_name||"Unknown")}</strong>
            <span>${u(O(o))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function _e(){const n=a.messages.find(o=>o.id===a.replyToMessageId);return n?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${u(n.sender?.full_name||"Unknown")}</strong>
              <span>${u(O(n))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function pe(n){return`
          <form class="chat-edit-form" data-chat-edit-form="${u(n.id)}">
            <input data-chat-edit-input="${u(n.id)}" type="text" value="${u(a.editDraft)}">
            <button type="submit" aria-label="Save edit"><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
          </form>
        `}function he(n){const o=n.sender_id===t.currentUser.id?" mine":"",l=!!n.deleted_at,c=o&&!l,s=!l&&(o||fe()),_=n.edited_at&&!l?'<span class="chat-edited">(edited)</span>':"",y=l?"":`
          <div class="chat-message-actions">
            <button type="button" data-chat-reply="${u(n.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${c?`<button type="button" data-chat-edit="${u(n.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
            ${s?`<button type="button" data-chat-delete="${u(n.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>`:""}
          </div>
        `;return`
          <div class="chat-message${o}${l?" deleted":""}">
            <div class="chat-message-meta">
              <span>${u(n.sender?.full_name||"Unknown")}</span>
              <span>#${n.message_seq} ${_}</span>
            </div>
            ${me(n)}
            ${a.editingMessageId===n.id?pe(n):`<div class="chat-message-body">${u(l?"Message deleted":n.body)}</div>`}
            ${y}
          </div>
        `}function g(){const n=a.conversations.find(s=>s.id===a.selectedConversationId)||null,o=a.profiles.filter(s=>s.id!==t.currentUser.id),c=n?.members.find(s=>s.user_id===t.currentUser.id)?.notification_level==="muted";e.innerHTML=`
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <span class="chat-user-pill">${u(Ue(t.currentUser.role))}</span>
              </div>
              <label class="chat-field">
                <span>Start DM</span>
                <select data-chat-dm>
                  <option value="">Choose person...</option>
                  ${o.map(s=>`<option value="${u(s.id)}">${u(s.full_name)}</option>`).join("")}
                </select>
              </label>
              <form class="chat-group-form" data-chat-group-form>
                <input data-chat-group-title type="text" placeholder="New group name">
                <select data-chat-group-members multiple size="3">
                  ${o.map(s=>`<option value="${u(s.id)}">${u(s.full_name)}</option>`).join("")}
                </select>
                <button type="submit"><i class="ti ti-users-plus"></i><span>Create group</span></button>
              </form>
              <div class="chat-conversation-list">
                ${a.loading?'<div class="chat-muted">Loading...</div>':""}
                ${a.conversations.map(ue).join("")}
                ${!a.loading&&!a.conversations.length?'<div class="chat-muted">No conversations yet.</div>':""}
              </div>
            </aside>
            <main class="chat-thread">
              ${a.error?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${u(a.error)}</span></div>`:""}
              ${n?`
                <header class="chat-thread-head">
                  <button type="button" class="chat-back-btn" data-chat-back aria-label="Back to conversations"><i class="ti ti-arrow-left"></i></button>
                  <div>
                    <div class="chat-eyebrow">${n.kind==="dm"?"Direct message":"Group"}</div>
                    <h2>${u(F(n,t.currentUser.id))}</h2>
                  </div>
                  <div class="chat-thread-tools">
                    <button type="button" class="chat-icon-btn${c?" active":""}" data-chat-toggle-mute aria-label="${c?"Unmute conversation":"Mute conversation"}" title="${c?"Unmute conversation":"Mute conversation"}">
                      <i class="ti ${c?"ti-bell-off":"ti-bell"}"></i>
                    </button>
                    <div class="chat-member-stack">
                      ${n.members.map(s=>`<span title="${u(s.profile?.full_name||s.user_id)}">${u((s.profile?.full_name||"?").slice(0,1))}</span>`).join("")}
                    </div>
                  </div>
                </header>
                <div class="chat-message-list">
                  ${a.messages.map(he).join("")}
                  ${a.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  ${_e()}
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
        `,e.querySelectorAll("[data-chat-select]").forEach(s=>{s.addEventListener("click",()=>T(s.dataset.chatSelect))}),e.querySelector("[data-chat-back]")?.addEventListener("click",()=>x()),e.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{n&&oe(n)}),e.querySelector("[data-chat-dm]")?.addEventListener("change",s=>le(s.currentTarget)),e.querySelector("[data-chat-group-form]")?.addEventListener("submit",s=>{s.preventDefault(),ce(s.currentTarget)}),e.querySelector("[data-chat-send-form]")?.addEventListener("submit",s=>{s.preventDefault(),ee(s.currentTarget)}),e.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>ae()),e.querySelectorAll("[data-chat-reply]").forEach(s=>{s.addEventListener("click",()=>te(s.dataset.chatReply))}),e.querySelectorAll("[data-chat-edit]").forEach(s=>{s.addEventListener("click",()=>ne(s.dataset.chatEdit))}),e.querySelectorAll("[data-chat-delete]").forEach(s=>{s.addEventListener("click",()=>ie(s.dataset.chatDelete))}),e.querySelectorAll("[data-chat-edit-form]").forEach(s=>{s.addEventListener("submit",_=>{_.preventDefault(),se(_.currentTarget)})}),e.querySelectorAll("[data-chat-cancel-edit]").forEach(s=>{s.addEventListener("click",()=>re())})}return m(),d=setInterval(()=>m(),3e4),typeof t.service.subscribeToConversationEvents=="function"&&(h=t.service.subscribeToConversationEvents(()=>de())),()=>{r=!0,d&&clearInterval(d),h&&h(),e.classList.remove("wein-chat-root"),e.classList.remove("chat-has-selection"),e.innerHTML=""}}}}function v(e,t){if(e.error)throw new Error(`${t}: ${e.error.message||e.error}`);return e.data||[]}function H(e,t){if(e.error)throw new Error(`${t}: ${e.error.message||e.error}`);return e.data}function R(e){return e?{id:e.id,full_name:e.full_name,role:e.role,email:e.email??null}:null}function Fe(e){return{conversation_id:e.conversation_id,user_id:e.user_id,membership_role:e.membership_role,joined_at:e.joined_at,left_at:e.left_at,last_read_seq:Number(e.last_read_seq||0),notification_level:e.notification_level,profile:R(e.profile||e.profiles)}}function b(e){return{id:e.id,conversation_id:e.conversation_id,message_seq:Number(e.message_seq||0),sender_id:e.sender_id,body:e.body,reply_to_id:e.reply_to_id,client_nonce:e.client_nonce,created_at:e.created_at,edited_at:e.edited_at,deleted_at:e.deleted_at,sender:R(e.sender||e.profiles)}}function j(e,t){const a=(e.members||e.wein_chat_members||[]).map(Fe),r=e.last_message||e.wein_chat_messages||[],i=Array.isArray(r)&&r.length?b(r[0]):null,d={id:e.id,kind:e.kind,title:e.title,created_by:e.created_by,created_at:e.created_at,archived_at:e.archived_at,members:a,last_message:i,unread_count:0};return d.unread_count=Ne(d,t),d}function He({supabase:e,currentUserId:t}){if(!e)throw new Error("supabase client is required");if(!t)throw new Error("currentUserId is required");async function a(r){const i=await e.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",r).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"}).single();if(i.error)throw new Error(`fetch conversation: ${i.error.message||i.error}`);return j(i.data,t)}return{async listProfiles(){const r=await e.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return v(r,"list profiles").map(R)},async listConversations(){const r=await e.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"});return v(r,"list conversations").map(i=>j(i,t))},async listMessages(r){const i=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",r).is("deleted_at",null).order("message_seq",{ascending:!0});return v(i,"list messages").map(b)},async createGroup(r,i=[]){const d=H(await e.rpc("wein_chat_create_group",{p_title:r}),"create group");for(const h of i)await this.addMember(d,h);return d},async getOrCreateDm(r){return H(await e.rpc("wein_chat_get_or_create_dm",{p_other_user_id:r}),"get or create DM")},async addMember(r,i){const d=await e.from("wein_chat_members").insert({conversation_id:r,user_id:i,membership_role:"member"}).select("conversation_id, user_id");if(!v(d,"add member").length)throw new Error("add member affected zero rows")},async sendMessage({conversationId:r,body:i,clientNonce:d,replyToId:h=null}){const m=await e.from("wein_chat_messages").insert({conversation_id:r,sender_id:t,body:i,client_nonce:d,reply_to_id:h}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(m.error)throw new Error(`send message: ${m.error.message||m.error}`);return b(m.data)},async updateMessage(r,i){const d=await e.from("wein_chat_messages").update({body:i,edited_at:new Date().toISOString()}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(d.error)throw new Error(`update message: ${d.error.message||d.error}`);return b(d.data)},async deleteMessage(r){const i=await e.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at,
          sender:profiles(id, full_name, role, email)
        `).single();if(i.error)throw new Error(`delete message: ${i.error.message||i.error}`);return b(i.data)},async markRead(r,i){const d=await e.from("wein_chat_members").update({last_read_seq:i}).eq("conversation_id",r).eq("user_id",t).select("conversation_id, user_id, last_read_seq");if(!v(d,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(r,i){const d=await e.from("wein_chat_members").update({notification_level:i}).eq("conversation_id",r).eq("user_id",t).select("conversation_id, user_id, notification_level");if(!v(d,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(r){if(typeof e.channel!="function")return()=>{};const i=e.channel(`wein-chat:${t}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},r).subscribe();return()=>{typeof e.removeChannel=="function"?e.removeChannel(i):typeof i.unsubscribe=="function"&&i.unsubscribe()}},fetchConversation:a}}function je(e){return typeof e.session.user=="object"&&e.session.user!==null?e.session.user:{}}function Ve(e){const t=je(e),a=t.id;if(!a)throw new Error("Team chat requires an authenticated user id.");return{id:a,full_name:e.session.fullName||t.email||"Portal user",role:e.session.role||"team",email:t.email||null}}let D=null;function We(e){D=e||null}function Be(){const e=Oe();q({id:"team-chat",mount(t,a){const r=D;D=null;const i=Ve(a),d=He({supabase:a.session.client,currentUserId:i.id});return e.mount(t,{currentUser:i,service:d,initialConversationId:r})}})}const Q=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function Ge(e){for(const t of Q)q({id:t,mount:()=>{e[t]()}})}function U(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const Ye=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function ze(e,t){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${Ye.map(a=>`<button class="chip ${e===a?"active":""}" type="button" onclick="${t}('${a.replace(/'/g,"\\'")}')">${a==="all"?"All":U(a)}</button>`).join("")}</div>`}function Ke(e,t){return t==="all"||String(e||"")===t}function Je(e){return String(e?.category||e?.vertical||"-")}function Qe(e){const t=String(e||"").toLowerCase();return t.includes("dining")?"dining":t.includes("health")?"health":t.includes("fun")?"fun":t.includes("hotel")?"hotels":""}function Xe(e,t=Date.now()){return e?Math.floor((t-new Date(e).getTime())/864e5):0}function I(e=new Date){const t=new Date(e);return t.setHours(0,0,0,0),t}function Ze(e,t=new Date){return e?Math.round((I(t).getTime()-I(e).getTime())/864e5):null}function X(e,t){let a=String(e||"").replace(/\D/g,"");if(!a)return null;a.startsWith("0")&&(a=`20${a.slice(1)}`);const r=`Hi! Following up on the WeIN offer sheet for ${t} - do you have 5 minutes today?`;return`https://wa.me/${a}?text=${encodeURIComponent(r)}`}function xe(e,t){const a=X(e,t);return a?`<a class="mini-btn" href="${U(a)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function E(e){return e.id}function et(e){return f("profiles").find(t=>E(t)===e)??null}function tt(e){return f("providers").find(t=>E(t)===e)??null}function at(e){return f("leads").find(t=>E(t)===e)??null}function nt(e){return f("tasks").find(t=>E(t)===e)??null}function rt(e){return f("offers").find(t=>E(t)===e)??null}function st(e){return f("offers").filter(t=>t.provider_id===e)}function it(e){return f("tasks").filter(t=>t.provider_id===e)}function ot(e){return f("tasks").filter(t=>t.lead_id===e)}const lt=Object.freeze(Object.defineProperty({__proto__:null,leadById:at,offerById:rt,offersForProvider:st,profileById:et,providerById:tt,taskById:nt,tasksForLead:ot,tasksForProvider:it},Symbol.toStringTag,{value:"Module"}));Le();Be();const Z={api:Y,auth:{canDelete:L,canManageDeals:W,canEditProviderProfile:B,navHiddenForRole:A,defaultViewForRole:G},platform:{getSupabaseClient:P,getAccessToken:M,getSessionContext:ye},shared:{escapeHtml:U,daysSince:Xe,startOfLocalDay:I,dayDiffFromToday:Ze,whatsappLink:X,whatsappButtonHtml:xe,categoryChipsHtml:ze,matchesCategoryFilter:Ke,categoryLabel:Je,catBadgeClass:Qe},core:{createPortalContext:qe,getView:J,mountView:Ie,registeredViewIds:Te,registerView:q},legacy:{LEGACY_VIEW_IDS:Q,registerLegacyViews:Ge},features:{requestOpenChatConversation:We},store:K,selectors:lt};window.WEIN_PORTAL_MODULES=Z;for(const e of window.WEIN_PORTAL_MODULES_READY??[])e(Z);window.WEIN_PORTAL_MODULES_READY=[];
