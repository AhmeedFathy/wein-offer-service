function be(e){return typeof e=="object"&&e!==null?e.role:e}function ae(e){const n=be(e);return n==="admin"||n==="manager"}const ye=ae;function we(e){const n=be(e);return n==="admin"||n==="manager"||n==="deal_breaker"}const pt={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function se(e){return e?pt[e]??[]:[]}function Se(e){return se(e).includes("pipeline")?"tasks":"pipeline"}function O(){return window.WEIN_PORTAL_LEGACY??{}}function re(){const e=O().supabaseClient;if(!e)throw new Error("Portal Supabase client is not available yet.");return e}function J(){const e=O().getSupabaseUrl?.();if(!e)throw new Error("Portal Supabase URL is not available yet.");return e}function ht(){const e=O().getSupabaseAnonKey?.();if(!e)throw new Error("Portal Supabase anon key is not available yet.");return e}function X(){return O().getAccessToken?.()??null}function _t(){return{client:re(),accessToken:X()}}class vt extends Error{constructor(n,t,r){super(n),this.status=t,this.body=r,this.name="PortalApiError"}status;body}function W(){const e=O().headers?.();if(e)return e;const n=ht();return{apikey:n,Authorization:`Bearer ${X()||n}`,"Content-Type":"application/json"}}async function ie(e,n){if(e.ok)return;const t=await e.text();throw new vt(`Supabase ${n} failed: ${e.status}${t?` ${t}`:""}`,e.status,t)}async function gt(e){const n=O().get;if(n)return n(e);const t=await fetch(`${J()}/rest/v1/${e}`,{headers:W()});return await ie(t,"GET"),t.json()}async function bt(e,n){const t=O().post;if(t)return t(e,n);const r=await fetch(`${J()}/rest/v1/${e}`,{method:"POST",headers:{...W(),Prefer:"return=representation"},body:JSON.stringify(n)});return await ie(r,"POST"),r.json()}async function yt(e,n){const t=O().patch;return t?t(e,n):(await fetch(`${J()}/rest/v1/${e}`,{method:"PATCH",headers:W(),body:JSON.stringify(n)})).ok}async function wt(e){const n=O().delete;if(n)return n(e);const t=await fetch(`${J()}/rest/v1/${e}`,{method:"DELETE",headers:W()});return await ie(t,"DELETE"),!0}const $e={headers:W,get:gt,post:bt,patch:yt,delete:wt},St={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function $t(){const e=O().getCaches?.();return e?{providers:e.providers??[],offers:e.offers??[],negotiations:e.negotiations??[],files:e.files??[],leads:e.leads??[],outcomes:e.outcomes??[],tasks:e.tasks??[],profiles:e.profiles??[],redemptions:e.redemptions??[],campaigns:e.campaigns??[],calendarNotes:e.calendarNotes??[]}:St}function I(e){return $t()[e]}function ke(e,n){const t=O().setCache;if(!t)throw new Error("Portal cache bridge is not available yet.");t(e,[...n])}function kt(e,n){ke(e,n(I(e)))}const Me={get providers(){return I("providers")},get offers(){return I("offers")},get negotiations(){return I("negotiations")},get files(){return I("files")},get leads(){return I("leads")},get outcomes(){return I("outcomes")},get tasks(){return I("tasks")},get profiles(){return I("profiles")},get redemptions(){return I("redemptions")},get campaigns(){return I("campaigns")},get calendarNotes(){return I("calendarNotes")},getCache:I,replaceCache:ke,updateCache:kt};function Y(){const e=window.WEIN??{};return{user:e.user,role:e.role??sessionStorage.getItem("weinRole"),fullName:e.fullName??null,accessToken:X(),client:re()}}function Mt(){const e=Y();return{api:$e,store:Me,session:e,permissions:{canDelete:()=>ae(Y()),canManageDeals:()=>ye(Y()),canEditProviderProfile:()=>we(Y()),navHiddenForRole:se,defaultViewForRole:Se},navigate(n,t){window.showView?.(n,t)}}}const j=new Map;let Q=null;function Z(e){if(!e.id)throw new Error("View id is required.");if(j.has(e.id))throw new Error(`View already registered: ${e.id}`);j.set(e.id,e)}function Ee(e){return j.get(e)}function Et(){return[...j.keys()]}function Ct(){if(!Q)return;const e=Q;Q=null,e()}function It(e,n,t){const r=Ee(e);if(!r)throw new Error(`Unknown portal view: ${e}`);Ct();const c=r.mount(n,t);Q=typeof c=="function"?c:null}function qt(){j.has("__dummy_cleanup_probe")||Z({id:"__dummy_cleanup_probe",mount(e){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,e.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function Dt(e="chat"){const n=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${e}-${n}`}function fe(e,n){return e.kind==="group"?e.title||"Untitled group":(e.members||[]).map(r=>r.profile).find(r=>r&&r.id!==n)?.full_name||"Direct message"}function Tt(e){return[...e].sort((n,t)=>{const r=n.last_message?.created_at||n.created_at,c=t.last_message?.created_at||t.created_at;return new Date(c).getTime()-new Date(r).getTime()})}function Lt(e,n){const t=(e.members||[]).find(c=>c.user_id===n),r=e.last_message?.message_seq||0;return Math.max(0,r-(t?.last_read_seq||0))}function At(e){if(!e)return"No messages yet";const n=(e.deleted_at?"Message deleted":e.body||"").trim();return n.length>82?`${n.slice(0,79)}...`:n}const Ot=/[\s\p{P}]/u,Rt=/[\s\p{P}]/u;function Ce(e,n){return n===0?!0:Ot.test(e[n-1])}function Nt(e,n){return n>=e.length?!0:Rt.test(e[n])}function K(e="",n=[]){const t=String(e??"");if(!t.includes("@"))return[];const r=n.filter(p=>p&&p.id&&p.full_name).map(p=>({id:p.id,name:String(p.full_name)})).sort((p,E)=>E.name.length-p.name.length);if(!r.length)return[];const c=t.toLowerCase(),l=[],u=new Set;for(let p=0;p<t.length;p+=1){if(t[p]!=="@"||!Ce(t,p))continue;const E=p+1;for(const w of r){const m=E+w.name.length;if(c.startsWith(w.name.toLowerCase(),E)&&Nt(t,m)){u.has(w.id)||(u.add(w.id),l.push(w.id)),p=m-1;break}}}return l}function Pt(e="",n=[]){const t=new Set(K(e,n));return n.filter(r=>r&&t.has(r.id)&&r.full_name).map(r=>String(r.full_name)).sort((r,c)=>c.length-r.length)}function Ut(e="",n=0){const t=String(e??""),r=Math.max(0,Math.min(Number(n)||0,t.length)),c=40;for(let l=r-1;l>=0&&r-l<=c;l-=1){const u=t[l];if(u==="@")return Ce(t,l)?{query:t.slice(l+1,r),start:l}:null;if(u===`
`)return null}return null}function f(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function H(e){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[e]||e}function Ft(e,n=new Date){if(!e)return"";const t=new Date(e);if(Number.isNaN(t.getTime()))return"";const r=n.getTime()-t.getTime(),c=Math.floor(r/6e4);if(c<1)return"now";if(c<60)return`${c}m`;const l=Math.floor(c/60);return l<24?`${l}h`:r<6*864e5?t.toLocaleDateString(void 0,{weekday:"short"}):t.toLocaleDateString(void 0,{month:"short",day:"numeric"})}const Ht=300*1e3;function Bt(e,n){if(!n||e.sender_id!==n.sender_id)return!0;const t=new Date(e.created_at).getTime()-new Date(n.created_at).getTime();return!(t>=0&&t<Ht)}function xt(){return{id:"team-chat",mount(e,n){const t={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,composeOpen:!1,composeSearch:"",composeGroupTitle:"",composeSelectedMemberIds:new Set,membersOpen:!1,memberAddOpen:!1,memberSearch:"",memberSelectedIds:new Set,renameOpen:!1,renameDraft:"",archiveConfirmOpen:!1,mentionQuery:null,mentionIndex:0,mentionStart:0,mentionDraft:"",openMessageMenuId:null,confirmingDeleteMessageId:null,loading:!0,error:null};let r=!1,c=n.initialConversationId||null,l=null,u=null,p=!1;function E(){const a=e.querySelector(".chat-message-list");return a?a.scrollHeight-a.scrollTop-a.clientHeight<80:!0}function w(){const a=e.querySelector(".chat-message-list");a&&(a.scrollTop=a.scrollHeight)}function m(a){a.style.height="auto",a.style.height=`${Math.min(a.scrollHeight,120)}px`}function y(a){return a?a.members.filter(s=>!s.left_at&&s.profile).map(s=>s.profile):[]}function M(a){const s=String(t.mentionQuery||"").trim().toLowerCase(),o=y(a).filter(d=>d.id!==n.currentUser.id);return s?o.filter(d=>(d.full_name||"").toLowerCase().includes(s)):o}function D({rerender:a=!0}={}){t.mentionQuery!==null&&(t.mentionQuery=null,t.mentionIndex=0,a&&b())}function _(a){t.mentionDraft=a.value;const s=Ut(a.value,a.selectionStart??a.value.length),o=s?s.query:null;return o===t.mentionQuery?!1:(t.mentionQuery=o,t.mentionStart=s?s.start:0,t.mentionIndex=0,!0)}function C(a,s){const o=e.querySelector("[data-chat-composer]");if(!o||!s)return;const d=o.selectionStart??o.value.length,v=o.value.slice(0,t.mentionStart),k=o.value.slice(d),$=`@${s.full_name} `,h=`${v}${$}${k}`,q=v.length+$.length;t.mentionQuery=null,t.mentionIndex=0,t.mentionDraft=h,b();const i=e.querySelector("[data-chat-composer]");i&&(i.value=h,m(i),i.focus(),i.setSelectionRange?.(q,q))}function g(a,s){const o=M(a);if(!o.length)return;const d=(t.mentionIndex+s+o.length)%o.length;t.mentionIndex=d;const v=e.querySelector("[data-chat-composer]")?.value??t.mentionDraft,k=e.querySelector("[data-chat-composer]")?.selectionStart??v.length;t.mentionDraft=v,b();const $=e.querySelector("[data-chat-composer]");$&&($.value=v,m($),$.focus(),$.setSelectionRange?.(k,k))}e.classList.add("wein-chat-root");function P(a){const s=a.target;if(s instanceof Element){if(t.composeOpen&&!s.closest("[data-chat-compose-popover]")&&!s.closest("[data-chat-compose-toggle]")){V();return}if(t.membersOpen&&!s.closest("[data-chat-members-panel]")&&!s.closest("[data-chat-members-toggle]")){z();return}t.openMessageMenuId&&!s.closest("[data-chat-message-menu-panel]")&&!s.closest("[data-chat-message-menu]")&&(t.openMessageMenuId=null,b())}}function U(a){if(a.key==="Escape"){if(t.composeOpen){V();return}if(t.membersOpen){z();return}(t.openMessageMenuId||t.confirmingDeleteMessageId)&&(t.openMessageMenuId=null,t.confirmingDeleteMessageId=null,b())}}e.addEventListener?.("click",P),typeof document<"u"&&document.addEventListener("keydown",U);async function T({keepMessages:a=!0}={}){try{t.error=null;const[s,o]=await Promise.all([n.service.listProfiles(),n.service.listConversations()]);if(t.profiles=s,t.conversations=Tt(o),c&&(t.conversations.some(d=>d.id===c)&&(t.selectedConversationId=c),c=null),!t.selectedConversationId&&t.conversations.length&&(t.selectedConversationId=t.conversations[0].id),t.selectedConversationId&&a){t.messages=await n.service.listMessages(t.selectedConversationId);const d=t.messages.at(-1)?.message_seq||0;if(d)try{await n.service.markRead(t.selectedConversationId,d)}catch(v){console.error("Failed to mark chat messages as read",v)}}}catch(s){t.error=s.message||String(s)}finally{t.loading=!1,r||b()}}async function ee(a){t.selectedConversationId=a,t.membersOpen=!1,t.memberAddOpen=!1,t.memberSearch="",t.memberSelectedIds=new Set,t.renameOpen=!1,t.renameDraft="",t.archiveConfirmOpen=!1,e.classList.add("chat-has-selection"),t.messages=await n.service.listMessages(a),p=!0,r||b();const s=t.messages.at(-1)?.message_seq||0;if(s)try{await n.service.markRead(a,s)}catch(o){console.error("Failed to mark chat messages as read",o)}await T()}function de(){e.classList.remove("chat-has-selection")}async function Le(a){const s=a.querySelector("[data-chat-composer]"),o=s.value.trim();if(!o||!t.selectedConversationId)return;const d=t.replyToMessageId,v=t.conversations.find(h=>h.id===t.selectedConversationId)||null,k=K(o,y(v));s.value="",t.replyToMessageId=null,t.mentionQuery=null,t.mentionDraft="";const $=await n.service.sendMessage({conversationId:t.selectedConversationId,body:o,clientNonce:Dt("portal-chat"),replyToId:d,mentionedUserIds:k});t.messages=[...t.messages,$],p=!0,r||b();try{await n.service.markRead(t.selectedConversationId,$.message_seq)}catch(h){console.error("Failed to mark chat message as read",h)}await T()}function Ae(a){a&&(t.replyToMessageId=a,b(),e.querySelector("[data-chat-composer]")?.focus())}function Oe(){t.replyToMessageId=null,b()}function Re(){t.composeOpen=!0,b(),e.querySelector("[data-chat-compose-search]")?.focus()}function V({reset:a=!1}={}){t.composeOpen=!1,a&&(t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set),b()}function Ne(a,s){const o=new Set(t.composeSelectedMemberIds);s?o.add(a):o.delete(a),t.composeSelectedMemberIds=o,b()}function ue(a){return!a||a.kind!=="group"?!1:a.members.find(o=>o.user_id===n.currentUser.id&&!o.left_at)?.membership_role==="owner"||["admin","manager"].includes(n.currentUser.role)}function Pe(){t.membersOpen=!0,b()}function z({reset:a=!1}={}){t.membersOpen=!1,t.memberAddOpen=!1,a&&(t.memberSearch="",t.memberSelectedIds=new Set),b()}function Ue(){t.memberAddOpen=!t.memberAddOpen,b(),t.memberAddOpen&&e.querySelector("[data-chat-member-search]")?.focus()}function Fe(a,s){const o=new Set(t.memberSelectedIds);s?o.add(a):o.delete(a),t.memberSelectedIds=o,b()}async function He(a){const s=[...t.memberSelectedIds];if(!(!a||!s.length)){for(const o of s)await n.service.addMember(a,o);t.memberSearch="",t.memberSelectedIds=new Set,t.memberAddOpen=!1,r||b(),await T()}}async function Be(a,s){!a||!s||(await n.service.removeMember(a,s),t.conversations=t.conversations.map(o=>o.id!==a?o:{...o,members:o.members.map(d=>d.user_id===s?{...d,left_at:d.left_at||new Date().toISOString()}:d)}),s===n.currentUser.id&&(t.membersOpen=!1,t.memberAddOpen=!1),r||b(),await T())}function xe(a){const s=t.messages.find(d=>d.id===a);if(!s)return;t.editingMessageId=a,t.editDraft=s.body||"",b();const o=e.querySelector(`[data-chat-edit-input="${CSS.escape(a)}"]`);o?.focus(),o?.select?.()}function je(){t.editingMessageId=null,t.editDraft="",b()}async function We(a){const s=a.dataset.chatEditForm,d=a.querySelector("[data-chat-edit-input]").value.trim();if(!s||!d)return;const v=t.conversations.find($=>$.id===t.selectedConversationId)||null,k=await n.service.updateMessage(s,d,K(d,y(v)));t.messages=t.messages.map($=>$.id===k.id?k:$),t.editingMessageId=null,t.editDraft="",r||b(),await T()}async function Ge(a){if(!a)return;const s=await n.service.deleteMessage(a);t.messages=t.messages.map(o=>o.id===a?{...o,...s,body:"Message deleted",deleted_at:s.deleted_at||new Date().toISOString()}:o),t.replyToMessageId===a&&(t.replyToMessageId=null),t.confirmingDeleteMessageId=null,t.openMessageMenuId=null,r||b(),await T()}async function Ve(a){const o=a.members.find(d=>d.user_id===n.currentUser.id)?.notification_level==="muted"?"all":"muted";await n.service.setNotificationLevel(a.id,o),t.conversations=t.conversations.map(d=>d.id!==a.id?d:{...d,members:d.members.map(v=>v.user_id===n.currentUser.id?{...v,notification_level:o}:v)}),r||b(),await T()}function ze(a){t.renameOpen=!0,t.renameDraft=a.title||"",b(),e.querySelector("[data-chat-rename-input]")?.focus()}function Ye(){t.renameOpen=!1,t.renameDraft="",b()}async function Qe(a,s){const o=(s||"").trim();o&&(await n.service.renameConversation(a.id,o),t.conversations=t.conversations.map(d=>d.id===a.id?{...d,title:o}:d),t.renameOpen=!1,t.renameDraft="",r||b(),await T())}function Ke(){t.archiveConfirmOpen=!0,b()}function Je(){t.archiveConfirmOpen=!1,b()}async function Xe(a,s){await n.service.setConversationArchived(a.id,s),t.archiveConfirmOpen=!1,t.selectedConversationId===a.id&&(t.selectedConversationId=null,de()),t.conversations=t.conversations.map(o=>o.id===a.id?{...o,archived_at:new Date().toISOString()}:o),r||b(),await T()}async function Ze(a,s,o){!a||!s||(await n.service.setMembershipRole(a,s,o),t.conversations=t.conversations.map(d=>d.id!==a?d:{...d,members:d.members.map(v=>v.user_id===s?{...v,membership_role:o}:v)}),r||b(),await T())}async function et(a){if(!a)return;const s=await n.service.getOrCreateDm(a);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await ee(s)}async function tt(a,s){if(a=a.trim(),!a)return;const o=await n.service.createGroup(a,s);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await ee(o)}function nt(){r||T()}function at(a){const s=a.id===t.selectedConversationId?" selected":"",o=a.unread_count?`<span class="chat-count">${a.unread_count}</span>`:"",d=fe(a,n.currentUser.id),v=Ft(a.last_message?.created_at);return`
          <button type="button" class="chat-conversation${s}" data-chat-select="${f(a.id)}">
            <span class="chat-conversation-avatar" aria-hidden="true">${f((d||"?").slice(0,1).toUpperCase())}</span>
            <span class="chat-conversation-body">
              <span class="chat-conversation-row">
                <span class="chat-conversation-title">${f(d)}</span>
                ${v?`<span class="chat-conversation-timestamp">${f(v)}</span>`:""}
                ${o}
              </span>
              <span class="chat-conversation-preview">${f(At(a.last_message))}</span>
            </span>
          </button>
        `}function st(){return["admin","manager"].includes(n.currentUser.role)}function rt(a){if(!t.composeOpen)return"";const s=t.composeSearch.trim().toLowerCase(),o=a.filter(k=>!s||(k.full_name||"").toLowerCase().includes(s)),d=t.composeSelectedMemberIds.size,v=d===1?[...t.composeSelectedMemberIds][0]:"";return`
          <div class="chat-compose-popover" data-chat-compose-popover role="dialog" aria-label="New conversation">
            <div class="chat-compose-popover-head">
              <strong>New conversation</strong>
              <button type="button" class="chat-icon-btn" data-chat-compose-close aria-label="Close new conversation"><i class="ti ti-x"></i></button>
            </div>
            <input data-chat-compose-search type="search" placeholder="Search people..." value="${f(t.composeSearch)}" autocomplete="off">
            <div class="chat-compose-summary">${d} selected</div>
            <div class="chat-compose-list">
              ${o.map(k=>{const $=t.composeSelectedMemberIds.has(k.id)?" checked":"";return`
                  <label class="chat-compose-person">
                    <input type="checkbox" data-chat-compose-member="${f(k.id)}"${$}>
                    <span class="chat-compose-avatar">${f((k.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${f(k.full_name||"Unknown")}</strong>
                      <span>${f(H(k.role))}</span>
                    </span>
                  </label>
                `}).join("")}
              ${o.length?"":'<div class="chat-muted">No matching people.</div>'}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${f(v)}"${d===1?"":" disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${f(t.composeGroupTitle)}">
                <button type="button" data-chat-create-group${t.composeGroupTitle.trim()?"":" disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
              </div>
            </div>
          </div>
        `}function it(a){if(t.mentionQuery===null||!a)return"";const s=M(a);if(!s.length)return"";const o=Math.min(t.mentionIndex,s.length-1);return`
          <div class="chat-compose-popover chat-mention-picker" data-chat-mention-picker role="listbox" aria-label="Mention someone">
            ${s.map((d,v)=>`
              <button
                type="button"
                class="chat-compose-person chat-mention-option${v===o?" active":""}"
                data-chat-mention-pick="${f(d.id)}"
                role="option"
                aria-selected="${v===o}"
              >
                <span class="chat-compose-avatar">${f((d.full_name||"?").slice(0,1))}</span>
                <span class="chat-compose-person-copy">
                  <strong>${f(d.full_name||"Unknown")}</strong>
                  <span>${f(H(d.role))}</span>
                </span>
              </button>
            `).join("")}
          </div>
        `}function ot(a){if(!t.membersOpen||!a||a.kind!=="group")return"";const s=a.members.filter(h=>!h.left_at),o=ue(a),d=new Set(s.map(h=>h.user_id)),v=t.memberSearch.trim().toLowerCase(),k=t.profiles.filter(h=>h.id!==n.currentUser.id&&!d.has(h.id)&&(!v||(h.full_name||"").toLowerCase().includes(v))),$=t.memberSelectedIds.size;return`
          <div class="chat-compose-popover chat-members-panel" data-chat-members-panel role="dialog" aria-label="Manage members">
            <div class="chat-compose-popover-head">
              <strong>Manage members</strong>
              <button type="button" class="chat-icon-btn" data-chat-members-close aria-label="Close member management"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-member-panel-list">
              ${s.map(h=>{const q=h.profile||{},i=h.user_id===n.currentUser.id,S=o||i;return`
                  <div class="chat-member-row" data-chat-member-row="${f(h.user_id)}">
                    <span class="chat-compose-avatar">${f((q.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${f(q.full_name||h.user_id)}</strong>
                      <span>${f(q.role?H(q.role):"Member")}</span>
                    </span>
                    ${h.membership_role==="owner"?'<span class="chat-owner-badge">Owner</span>':""}
                    ${o?`
                      <button type="button" class="chat-member-promote" data-chat-promote-member="${f(h.user_id)}" data-chat-role="${h.membership_role==="owner"?"member":"owner"}">
                        <i class="ti ${h.membership_role==="owner"?"ti-user-minus":"ti-shield-plus"}"></i><span>${h.membership_role==="owner"?"Remove owner":"Make owner"}</span>
                      </button>
                    `:""}
                    ${S?`
                      <button type="button" class="chat-member-remove" data-chat-remove-member="${f(h.user_id)}">
                        <i class="ti ${i?"ti-logout":"ti-user-minus"}"></i><span>${i?"Leave":"Remove"}</span>
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
                  <input data-chat-member-search type="search" placeholder="Search people..." value="${f(t.memberSearch)}" autocomplete="off">
                  <div class="chat-compose-summary">${$} selected</div>
                  <div class="chat-compose-list">
                    ${k.map(h=>{const q=t.memberSelectedIds.has(h.id)?" checked":"";return`
                        <label class="chat-compose-person">
                          <input type="checkbox" data-chat-member-pick="${f(h.id)}"${q}>
                          <span class="chat-compose-avatar">${f((h.full_name||"?").slice(0,1))}</span>
                          <span class="chat-compose-person-copy">
                            <strong>${f(h.full_name||"Unknown")}</strong>
                            <span>${f(H(h.role))}</span>
                          </span>
                        </label>
                      `}).join("")}
                    ${k.length?"":'<div class="chat-muted">No matching people.</div>'}
                  </div>
                  <div class="chat-compose-actions">
                    <button type="button" data-chat-add-members="${f(a.id)}"${$?"":" disabled"}><i class="ti ti-users-plus"></i><span>Add selected</span></button>
                  </div>
                `:""}
              </div>
            `:""}
          </div>
        `}function me(a){const s=a.deleted_at?"Message deleted":a.body||"";return s.length>90?`${s.slice(0,87)}...`:s}function ct(a){if(!a?.reply_to_id)return"";const s=t.messages.find(o=>o.id===a.reply_to_id);return s?`
          <div class="chat-quote">
            <strong>${f(s.sender?.full_name||"Unknown")}</strong>
            <span>${f(me(s))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function lt(){const a=t.messages.find(s=>s.id===t.replyToMessageId);return a?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${f(a.sender?.full_name||"Unknown")}</strong>
              <span>${f(me(a))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function dt(a){return`
          <form class="chat-edit-form" data-chat-edit-form="${f(a.id)}">
            <input data-chat-edit-input="${f(a.id)}" type="text" value="${f(t.editDraft)}">
            <button type="submit" aria-label="Save edit"><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
          </form>
        `}function ut(a){const s=f(a.body),o=t.conversations.find(h=>h.id===a.conversation_id)||t.conversations.find(h=>h.id===t.selectedConversationId)||null,d=y(o),v=Pt(a.body,d);if(!v.length)return s;const k=new Set(d.filter(h=>h.id===n.currentUser.id).map(h=>String(h.full_name)));let $=s;for(const h of v){const q=`@${f(h)}`,i=k.has(h)?"chat-mention chat-mention-self":"chat-mention";$=$.split(q).join(`<span class="${i}">${q}</span>`)}return $}function mt(a,s=!0){const o=a.sender_id===n.currentUser.id?" mine":"",d=!!a.deleted_at,v=o&&!d,k=!d&&(o||st()),$=a.edited_at&&!d?'<span class="chat-edited">(edited)</span>':"",h=d?"":`
            <button type="button" data-chat-reply="${f(a.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${v?`<button type="button" data-chat-edit="${f(a.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
            ${k?`<button type="button" data-chat-delete="${f(a.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>`:""}
        `,q=d?"":`
          <div class="chat-message-actions" aria-label="Message actions">
            ${h}
          </div>
          <button type="button" class="chat-message-menu-btn" data-chat-message-menu="${f(a.id)}" aria-label="Message actions"><i class="ti ti-dots"></i></button>
          ${t.openMessageMenuId===a.id?`
            <div class="chat-message-menu" data-chat-message-menu-panel="${f(a.id)}">
              ${h}
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
          <div class="chat-message${o}${d?" deleted":""}${s?"":" chat-message-grouped"}" tabindex="0" data-chat-message-id="${f(a.id)}">
            ${s?`
              <div class="chat-message-meta">
                <span>${f(a.sender?.full_name||"Unknown")}</span>
                <span>#${a.message_seq} ${$}</span>
              </div>
            `:""}
            ${ct(a)}
            ${t.editingMessageId===a.id?dt(a):`<div class="chat-message-body">${d?f("Message deleted"):ut(a)}</div>`}
            ${q}
          </div>
        `}function b(){const a=p||E();p=!1;const s=t.conversations.find(i=>i.id===t.selectedConversationId)||null,o=t.profiles.filter(i=>i.id!==n.currentUser.id),v=s?.members.find(i=>i.user_id===n.currentUser.id)?.notification_level==="muted",k=s?.members.filter(i=>!i.left_at)||[],$=s?ue(s):!1;e.innerHTML=`
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <div class="chat-sidebar-tools">
                  <span class="chat-user-pill">${f(H(n.currentUser.role))}</span>
                  <button type="button" class="chat-icon-btn" data-chat-compose-toggle aria-label="New conversation" title="New conversation"><i class="ti ti-pencil-plus"></i></button>
                </div>
              </div>
              ${rt(o)}
              <div class="chat-conversation-list">
                ${t.loading?'<div class="chat-muted">Loading...</div>':""}
                ${t.conversations.map(at).join("")}
                ${!t.loading&&!t.conversations.length?'<div class="chat-muted">No conversations yet.</div>':""}
              </div>
            </aside>
            <main class="chat-thread">
              ${t.error?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${f(t.error)}</span></div>`:""}
              ${s?`
                <header class="chat-thread-head">
                  <button type="button" class="chat-back-btn" data-chat-back aria-label="Back to conversations"><i class="ti ti-arrow-left"></i></button>
                  <div>
                    <div class="chat-eyebrow">${s.kind==="dm"?"Direct message":"Group"}</div>
                    ${t.renameOpen?`
                      <form class="chat-rename-form" data-chat-rename-form>
                        <input data-chat-rename-input type="text" value="${f(t.renameDraft)}" placeholder="Group name">
                        <button type="submit" aria-label="Save name"><i class="ti ti-check"></i></button>
                        <button type="button" data-chat-rename-cancel aria-label="Cancel rename"><i class="ti ti-x"></i></button>
                      </form>
                    `:`<h2>${f(fe(s,n.currentUser.id))}</h2>`}
                  </div>
                  <div class="chat-thread-tools">
                    ${s.kind==="group"?`
                      <button type="button" class="chat-icon-btn${t.membersOpen?" active":""}" data-chat-members-toggle aria-label="Manage members" title="Manage members">
                        <i class="ti ti-users"></i>
                      </button>
                    `:""}
                    ${s.kind==="group"&&$?`
                      <button type="button" class="chat-icon-btn" data-chat-rename-toggle aria-label="Rename group" title="Rename group">
                        <i class="ti ti-edit"></i>
                      </button>
                      <button type="button" class="chat-icon-btn" data-chat-archive-toggle aria-label="Archive conversation" title="Archive conversation">
                        <i class="ti ti-archive"></i>
                      </button>
                    `:""}
                    <button type="button" class="chat-icon-btn${v?" active":""}" data-chat-toggle-mute aria-label="${v?"Unmute conversation":"Mute conversation"}" title="${v?"Unmute conversation":"Mute conversation"}">
                      <i class="ti ${v?"ti-bell-off":"ti-bell"}"></i>
                    </button>
                    <div class="chat-member-stack">
                      ${k.map(i=>`<span title="${f(i.profile?.full_name||i.user_id)}">${f((i.profile?.full_name||"?").slice(0,1))}</span>`).join("")}
                    </div>
                  </div>
                  ${ot(s)}
                  ${t.archiveConfirmOpen?`
                    <div class="chat-delete-confirm chat-archive-confirm">
                      <span>Archive this group?</span>
                      <button type="button" data-chat-confirm-archive>Confirm</button>
                      <button type="button" data-chat-cancel-archive>Cancel</button>
                    </div>
                  `:""}
                </header>
                <div class="chat-message-list">
                  ${t.messages.map((i,S)=>mt(i,Bt(i,t.messages[S-1]))).join("")}
                  ${t.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  ${lt()}
                  ${it(s)}
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
        `,e.querySelectorAll("[data-chat-select]").forEach(i=>{i.addEventListener("click",()=>ee(i.dataset.chatSelect))}),e.querySelector("[data-chat-back]")?.addEventListener("click",()=>de()),e.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{s&&Ve(s)}),e.querySelector("[data-chat-members-toggle]")?.addEventListener("click",()=>{s&&(t.membersOpen?z():Pe())}),e.querySelector("[data-chat-members-close]")?.addEventListener("click",()=>z({reset:!0})),e.querySelector("[data-chat-rename-toggle]")?.addEventListener("click",()=>{s&&ze(s)}),e.querySelector("[data-chat-rename-cancel]")?.addEventListener("click",()=>Ye()),e.querySelector("[data-chat-rename-form]")?.addEventListener("submit",i=>{i.preventDefault(),s&&Qe(s,t.renameDraft)}),e.querySelector("[data-chat-rename-input]")?.addEventListener("input",i=>{t.renameDraft=i.currentTarget.value}),e.querySelector("[data-chat-archive-toggle]")?.addEventListener("click",()=>Ke()),e.querySelector("[data-chat-confirm-archive]")?.addEventListener("click",()=>{s&&Xe(s,!0)}),e.querySelector("[data-chat-cancel-archive]")?.addEventListener("click",()=>Je()),e.querySelector("[data-chat-member-add-toggle]")?.addEventListener("click",()=>Ue()),e.querySelector("[data-chat-member-search]")?.addEventListener("input",i=>{t.memberSearch=i.currentTarget.value,b();const S=e.querySelector("[data-chat-member-search]");S?.focus(),S?.setSelectionRange?.(S.value.length,S.value.length)}),e.querySelectorAll("[data-chat-member-pick]").forEach(i=>{i.addEventListener("change",()=>Fe(i.dataset.chatMemberPick,i.checked))}),e.querySelector("[data-chat-add-members]")?.addEventListener("click",i=>{He(i.currentTarget.dataset.chatAddMembers)}),e.querySelectorAll("[data-chat-remove-member]").forEach(i=>{i.addEventListener("click",()=>{s&&Be(s.id,i.dataset.chatRemoveMember)})}),e.querySelectorAll("[data-chat-promote-member]").forEach(i=>{i.addEventListener("click",()=>{s&&Ze(s.id,i.dataset.chatPromoteMember,i.dataset.chatRole)})}),e.querySelector("[data-chat-compose-toggle]")?.addEventListener("click",()=>{t.composeOpen?V():Re()}),e.querySelector("[data-chat-compose-close]")?.addEventListener("click",()=>V()),e.querySelector("[data-chat-compose-search]")?.addEventListener("input",i=>{t.composeSearch=i.currentTarget.value,b();const S=e.querySelector("[data-chat-compose-search]");S?.focus(),S?.setSelectionRange?.(S.value.length,S.value.length)}),e.querySelectorAll("[data-chat-compose-member]").forEach(i=>{i.addEventListener("change",()=>Ne(i.dataset.chatComposeMember,i.checked))}),e.querySelector("[data-chat-group-title]")?.addEventListener("input",i=>{t.composeGroupTitle=i.currentTarget.value,b();const S=e.querySelector("[data-chat-group-title]");S?.focus(),S?.setSelectionRange?.(S.value.length,S.value.length)}),e.querySelector("[data-chat-start-dm]")?.addEventListener("click",i=>{et(i.currentTarget.dataset.chatStartDm)}),e.querySelector("[data-chat-create-group]")?.addEventListener("click",()=>{tt(t.composeGroupTitle,[...t.composeSelectedMemberIds])});const h=e.querySelector("[data-chat-send-form]");h?.addEventListener("submit",i=>{i.preventDefault(),Le(i.currentTarget)});const q=e.querySelector("[data-chat-composer]");q?.addEventListener("input",()=>{if(m(q),!_(q))return;const{value:i,selectionStart:S}=q;b();const R=e.querySelector("[data-chat-composer]");R&&(R.value=i,m(R),R.focus(),R.setSelectionRange?.(S,S))}),q?.addEventListener("keydown",i=>{if(t.mentionQuery!==null&&s){const S=M(s);if(S.length){if(i.key==="ArrowDown"){i.preventDefault(),g(s,1);return}if(i.key==="ArrowUp"){i.preventDefault(),g(s,-1);return}if(i.key==="Enter"||i.key==="Tab"){i.preventDefault(),C(s,S[Math.min(t.mentionIndex,S.length-1)]);return}}if(i.key==="Escape"){i.preventDefault(),D();return}}i.key==="Enter"&&!i.shiftKey&&(i.preventDefault(),h?.requestSubmit())}),e.querySelectorAll("[data-chat-mention-pick]").forEach(i=>{i.addEventListener("mousedown",S=>{S.preventDefault();const R=y(s).find(ft=>ft.id===i.dataset.chatMentionPick);R&&C(s,R)})}),e.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>Oe()),e.querySelectorAll("[data-chat-reply]").forEach(i=>{i.addEventListener("click",()=>Ae(i.dataset.chatReply))}),e.querySelectorAll("[data-chat-edit]").forEach(i=>{i.addEventListener("click",()=>xe(i.dataset.chatEdit))}),e.querySelectorAll("[data-chat-delete]").forEach(i=>{i.addEventListener("click",()=>{t.confirmingDeleteMessageId=i.dataset.chatDelete,t.openMessageMenuId=null,b()})}),e.querySelectorAll("[data-chat-message-menu]").forEach(i=>{i.addEventListener("click",()=>{t.openMessageMenuId=t.openMessageMenuId===i.dataset.chatMessageMenu?null:i.dataset.chatMessageMenu,t.confirmingDeleteMessageId=null,b()})}),e.querySelectorAll("[data-chat-confirm-delete]").forEach(i=>{i.addEventListener("click",()=>Ge(i.dataset.chatConfirmDelete))}),e.querySelectorAll("[data-chat-cancel-delete]").forEach(i=>{i.addEventListener("click",()=>{t.confirmingDeleteMessageId===i.dataset.chatCancelDelete&&(t.confirmingDeleteMessageId=null),b()})}),e.querySelectorAll("[data-chat-edit-form]").forEach(i=>{i.addEventListener("submit",S=>{S.preventDefault(),We(S.currentTarget)})}),e.querySelectorAll("[data-chat-cancel-edit]").forEach(i=>{i.addEventListener("click",()=>je())}),a&&w()}return T(),l=setInterval(()=>T(),3e4),typeof n.service.subscribeToConversationEvents=="function"&&(u=n.service.subscribeToConversationEvents(()=>nt())),()=>{r=!0,l&&clearInterval(l),u&&u(),e.removeEventListener?.("click",P),typeof document<"u"&&document.removeEventListener("keydown",U),e.classList.remove("wein-chat-root"),e.classList.remove("chat-has-selection"),e.innerHTML=""}}}}function N(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data||[]}function B(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data}function oe(e){return e?{id:e.id,full_name:e.full_name,role:e.role,email:e.email??null}:null}function jt(e){return{conversation_id:e.conversation_id,user_id:e.user_id,membership_role:e.membership_role,joined_at:e.joined_at,left_at:e.left_at,last_read_seq:Number(e.last_read_seq||0),notification_level:e.notification_level,profile:oe(e.profile||e.profiles)}}function x(e){return{id:e.id,conversation_id:e.conversation_id,message_seq:Number(e.message_seq||0),sender_id:e.sender_id,body:e.body,reply_to_id:e.reply_to_id,client_nonce:e.client_nonce,created_at:e.created_at,edited_at:e.edited_at,deleted_at:e.deleted_at,mentioned_user_ids:e.mentioned_user_ids||[],sender:oe(e.sender||e.profiles)}}function pe(e,n){const t=(e.members||e.wein_chat_members||[]).map(jt),r=e.last_message||e.wein_chat_messages||[],c=Array.isArray(r)&&r.length?x(r[0]):null,l={id:e.id,kind:e.kind,title:e.title,created_by:e.created_by,created_at:e.created_at,archived_at:e.archived_at,members:t,last_message:c,unread_count:0};return l.unread_count=Lt(l,n),l}function Wt({supabase:e,currentUserId:n}){if(!e)throw new Error("supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(r){const c=await e.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",r).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"}).single();if(c.error)throw new Error(`fetch conversation: ${c.error.message||c.error}`);return pe(c.data,n)}return{async listProfiles(){const r=await e.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return N(r,"list profiles").map(oe)},async listConversations(){const r=await e.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"});return N(r,"list conversations").map(c=>pe(c,n))},async listMessages(r){const c=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",r).is("deleted_at",null).order("message_seq",{ascending:!0});return N(c,"list messages").map(x)},async createGroup(r,c=[]){const l=B(await e.rpc("wein_chat_create_group",{p_title:r}),"create group");for(const u of c)await this.addMember(l,u);return l},async getOrCreateDm(r){return B(await e.rpc("wein_chat_get_or_create_dm",{p_other_user_id:r}),"get or create DM")},async addMember(r,c){B(await e.rpc("wein_chat_add_member",{p_conversation_id:r,p_user_id:c}),"add member")},async removeMember(r,c){B(await e.rpc("wein_chat_remove_member",{p_conversation_id:r,p_user_id:c}),"remove member")},async renameConversation(r,c){const l=(c||"").trim();if(!l)throw new Error("Group title is required");const u=await e.from("wein_chat_conversations").update({title:l}).eq("id",r).select("id, title");if(!N(u,"rename conversation").length)throw new Error("rename conversation affected zero rows")},async setConversationArchived(r,c){const l=await e.from("wein_chat_conversations").update({archived_at:c?new Date().toISOString():null}).eq("id",r).select("id, archived_at");if(!N(l,"set conversation archived").length)throw new Error("set conversation archived affected zero rows")},async setMembershipRole(r,c,l){B(await e.rpc("wein_chat_set_membership_role",{p_conversation_id:r,p_user_id:c,p_role:l}),"set membership role")},async sendMessage({conversationId:r,body:c,clientNonce:l,replyToId:u=null,mentionedUserIds:p=[]}){const E=await e.from("wein_chat_messages").insert({conversation_id:r,sender_id:n,body:c,client_nonce:l,reply_to_id:u,mentioned_user_ids:p.length?p:null}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids,
          sender:profiles(id, full_name, role, email)
        `).single();if(E.error)throw new Error(`send message: ${E.error.message||E.error}`);return x(E.data)},async updateMessage(r,c,l=[]){const u=await e.from("wein_chat_messages").update({body:c,edited_at:new Date().toISOString(),mentioned_user_ids:l.length?l:null}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids,
          sender:profiles(id, full_name, role, email)
        `).single();if(u.error)throw new Error(`update message: ${u.error.message||u.error}`);return x(u.data)},async deleteMessage(r){const c=await e.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids,
          sender:profiles(id, full_name, role, email)
        `).single();if(c.error)throw new Error(`delete message: ${c.error.message||c.error}`);return x(c.data)},async markRead(r,c){const l=await e.from("wein_chat_members").update({last_read_seq:c}).eq("conversation_id",r).eq("user_id",n).select("conversation_id, user_id, last_read_seq");if(!N(l,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(r,c){const l=await e.from("wein_chat_members").update({notification_level:c}).eq("conversation_id",r).eq("user_id",n).select("conversation_id, user_id, notification_level");if(!N(l,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(r){if(typeof e.channel!="function")return()=>{};const c=e.channel(`wein-chat:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},r).subscribe();return()=>{typeof e.removeChannel=="function"?e.removeChannel(c):typeof c.unsubscribe=="function"&&c.unsubscribe()}},fetchConversation:t}}function Gt(e){return typeof e.session.user=="object"&&e.session.user!==null?e.session.user:{}}function Vt(e){const n=Gt(e),t=n.id;if(!t)throw new Error("Team chat requires an authenticated user id.");return{id:t,full_name:e.session.fullName||n.email||"Portal user",role:e.session.role||"team",email:n.email||null}}let te=null;function zt(e){te=e||null}function Yt(){const e=xt();Z({id:"team-chat",mount(n,t){const r=te;te=null;const c=Vt(t),l=Wt({supabase:t.session.client,currentUserId:c.id});return e.mount(n,{currentUser:c,service:l,initialConversationId:r})}})}function Qt(e,n={}){return e?e.author_id&&n[e.author_id]?.full_name?n[e.author_id].full_name:e.author_name||"Unknown":"Unknown"}function Ie(e){return!!e?.resolved_at}function Kt(e=[]){const n=new Map,t=[];e.forEach(l=>{n.set(l.id,{...l,replies:[]})}),n.forEach(l=>{l.reply_to_id&&n.has(l.reply_to_id)?n.get(l.reply_to_id).replies.push(l):t.push(l)});const r=(l,u)=>String(l.created_at||"").localeCompare(String(u.created_at||"")),c=l=>{l.replies.sort(r),l.replies.forEach(c)};return t.sort(r),t.forEach(c),t}function Jt(e=[]){return e.filter(n=>!Ie(n)).length}function he(e,n=90){const t=String(e?.body||"").replace(/\s+/g," ").trim();return t.length<=n?t:`${t.slice(0,Math.max(0,n-1)).trimEnd()}…`}function L(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function _e(e={}){return e.taskId?"Task discussion":e.providerId?"Provider discussion":e.offerId?"Offer discussion":"Record discussion"}function Xt(e={}){return e.taskId?`Task ${e.taskId}`:e.providerId?`Provider ${e.providerId}`:e.offerId?`Offer ${e.offerId}`:"No record scope"}function Zt(){return{id:"record-discussion",mount(e,n){const t={comments:[],peopleById:Object.fromEntries((n.people||[]).map(_=>[_.id,_])),loading:!0,error:null,replyToId:null,taskSourceCommentId:null};let r=!1,c=null,l=null;e.classList.add("wein-discussion-root");async function u(){try{t.error=null,t.comments=await n.service.listComments(n.scope||{})}catch(_){t.error=_.message||String(_)}finally{t.loading=!1,r||D()}}async function p(_){const C=_.querySelector("[data-discussion-body]"),g=C.value.trim();g&&(C.value="",await n.service.postComment({...n.scope||{},body:g,replyToId:t.replyToId,people:n.people||[]}),t.replyToId=null,await u())}async function E(_){const C=e.querySelector(`[data-resolve-note="${CSS.escape(_)}"]`)?.value||"";await n.service.resolveComment(_,C),await u()}async function w(_){await n.service.reopenComment(_),await u()}async function m(_){const C=_.querySelector("[data-task-title]"),g=C.value.trim();!g||!t.taskSourceCommentId||(await n.service.createTaskFromComment(t.taskSourceCommentId,g,n.currentUser?.id||null),C.value="",t.taskSourceCommentId=null,await u())}function y(_,C=0){const g=Ie(_),P=Qt(_,t.peopleById);return`
          <article class="discussion-comment${g?" resolved":""}" style="--depth:${Math.min(C,4)}">
            <div class="discussion-comment-meta">
              <span>${L(P)}</span>
              <span>${L(_.created_at||"")}</span>
              ${g?'<span class="discussion-resolved-pill">Resolved</span>':""}
            </div>
            <div class="discussion-comment-body">${L(_.body)}</div>
            ${_.resolved_note?`<div class="discussion-resolved-note">${L(_.resolved_note)}</div>`:""}
            <div class="discussion-actions">
              <button type="button" data-discussion-reply="${L(_.id)}">Reply</button>
              ${g?`<button type="button" data-discussion-reopen="${L(_.id)}">Reopen</button>`:`<button type="button" data-discussion-resolve="${L(_.id)}">Resolve</button>`}
              <button type="button" data-discussion-task="${L(_.id)}">Create task</button>
            </div>
            ${g?"":`<input class="discussion-resolve-note" data-resolve-note="${L(_.id)}" placeholder="Optional resolve note">`}
            ${_.replies?.length?`<div class="discussion-replies">${_.replies.map(U=>y(U,C+1)).join("")}</div>`:""}
          </article>
        `}function M(){if(!t.taskSourceCommentId)return"";const _=t.comments.find(C=>C.id===t.taskSourceCommentId);return`
          <form class="discussion-task-box" data-discussion-task-form>
            <div>
              <div class="discussion-eyebrow">Create task from comment</div>
              <p>${L(he(_))}</p>
            </div>
            <input data-task-title type="text" placeholder="Task title">
            <div class="discussion-task-actions">
              <button type="submit">Create task</button>
              <button type="button" data-discussion-task-cancel>Cancel</button>
            </div>
          </form>
        `}function D(){const _=Kt(t.comments),C=t.replyToId?t.comments.find(g=>g.id===t.replyToId):null;e.innerHTML=`
          <section class="discussion-shell" aria-label="${L(_e(n.scope))}">
            <header class="discussion-header">
              <div>
                <div class="discussion-eyebrow">${L(_e(n.scope))}</div>
                <h2>Discussion</h2>
                <p>${L(Xt(n.scope))}</p>
              </div>
              <span class="discussion-count">${Jt(t.comments)} unresolved</span>
            </header>
            ${t.error?`<div class="discussion-error">${L(t.error)}</div>`:""}
            ${M()}
            <div class="discussion-list">
              ${t.loading?'<div class="discussion-muted">Loading discussion...</div>':""}
              ${_.map(g=>y(g)).join("")}
              ${!t.loading&&!_.length?'<div class="discussion-muted">No comments yet.</div>':""}
            </div>
            <form class="discussion-composer" data-discussion-form>
              ${C?`
                <div class="discussion-replying">
                  Replying to: ${L(he(C,70))}
                  <button type="button" data-discussion-cancel-reply>Cancel</button>
                </div>
              `:""}
              <textarea data-discussion-body rows="3" placeholder="Write a record-attached note..."></textarea>
              <button type="submit">${C?"Reply":"Post comment"}</button>
            </form>
          </section>
        `,e.querySelector("[data-discussion-form]")?.addEventListener("submit",g=>{g.preventDefault(),p(g.currentTarget)}),e.querySelector("[data-discussion-cancel-reply]")?.addEventListener("click",()=>{t.replyToId=null,D()}),e.querySelector("[data-discussion-task-cancel]")?.addEventListener("click",()=>{t.taskSourceCommentId=null,D()}),e.querySelector("[data-discussion-task-form]")?.addEventListener("submit",g=>{g.preventDefault(),m(g.currentTarget)}),e.querySelectorAll("[data-discussion-reply]").forEach(g=>{g.addEventListener("click",()=>{t.replyToId=g.dataset.discussionReply,D()})}),e.querySelectorAll("[data-discussion-resolve]").forEach(g=>{g.addEventListener("click",()=>E(g.dataset.discussionResolve))}),e.querySelectorAll("[data-discussion-reopen]").forEach(g=>{g.addEventListener("click",()=>w(g.dataset.discussionReopen))}),e.querySelectorAll("[data-discussion-task]").forEach(g=>{g.addEventListener("click",()=>{t.taskSourceCommentId=g.dataset.discussionTask,D()})})}return u(),c=setInterval(()=>u(),3e4),typeof n.service.subscribeToDiscussionEvents=="function"&&(l=n.service.subscribeToDiscussionEvents(()=>u())),()=>{r=!0,c&&clearInterval(c),l&&l(),e.classList.remove("wein-discussion-root"),e.innerHTML=""}}}}function F(e){if(e)throw e}function en({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t({taskId:w,providerId:m,offerId:y}={}){let M=e.from("wein_comments").select("*").order("created_at",{ascending:!0});w&&(M=M.eq("task_id",w)),m&&(M=M.eq("provider_id",m)),y&&(M=M.eq("offer_id",y));const{data:D,error:_}=await M;return F(_),D||[]}async function r({body:w,taskId:m=null,providerId:y=null,offerId:M=null,replyToId:D=null,people:_=[]}){const C=m?{task_id:m}:y?{provider_id:y}:M?{offer_id:M}:null;if(!C)throw new Error("postComment requires taskId, providerId, or offerId");const{data:g,error:P}=await e.from("wein_comments").insert({...C,reply_to_id:D,body:w,author_role:"team"}).select("*").single();F(P);for(const U of K(w,_))try{await u(g.id,U)}catch(T){console.error("Failed to record comment mention",T)}return g}async function c(w,m=""){const{data:y,error:M}=await e.from("wein_comments").update({resolved_at:new Date().toISOString(),resolved_note:m}).eq("id",w).select("*");if(F(M),!y?.length)throw new Error("Resolve affected zero comments");return y[0]}async function l(w){const{data:m,error:y}=await e.from("wein_comments").update({resolved_at:null,resolved_note:null}).eq("id",w).select("*");if(F(y),!m?.length)throw new Error("Reopen affected zero comments");return m[0]}async function u(w,m){const{data:y,error:M}=await e.from("wein_comment_mentions").insert({comment_id:w,mentioned_user_id:m}).select("*");return F(M),y?.[0]||null}async function p(w,m,y=null,M=null){const{data:D,error:_}=await e.rpc("wein_create_task_from_comment",{p_comment_id:w,p_title:m,p_assigned_to_user_id:y,p_due_date:M});return F(_),D}function E(w){if(!e.channel)return()=>{};const m=e.channel(`record-discussion:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},w).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},w).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_task_links"},w).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(m);if(m?.unsubscribe)return m.unsubscribe()}}return{listComments:t,postComment:r,resolveComment:c,reopenComment:l,addMention:u,createTaskFromComment:p,subscribeToDiscussionEvents:E}}function A(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}const tn={critical:"Critical",high:"High",medium:"Medium",low:"Low"},nn={task:"Task",mention:"Mention",discussion:"Discussion",review:"Review"};function an(e){if(!e)return"No due date";const n=new Date(e);return Number.isNaN(n.getTime())?String(e):n.toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function sn(e=[]){return["critical","high","medium","low"].map(n=>({severity:n,items:e.filter(t=>t.severity===n)})).filter(n=>n.items.length)}function rn(){return{id:"work-inbox",mount(e,n){const t={items:[],loading:!0,error:null};let r=!1,c=null,l=null;e.classList.add("wein-work-inbox-root");async function u(){try{t.error=null,t.items=await n.service.loadInbox()}catch(m){t.error=m.message||String(m)}finally{t.loading=!1,r||w()}}function p(m){if(typeof n.onSelectItem=="function"){n.onSelectItem(m);return}m.href&&(window.location.hash=m.href)}function E(m){return`
          <button type="button" class="work-inbox-item severity-${A(m.severity)}" data-inbox-item="${A(m.kind)}:${A(m.entity_id)}:${A(m.reason_code)}">
            <span class="work-inbox-kind">${A(nn[m.kind]||m.kind)}</span>
            <span class="work-inbox-title">${A(m.title)}</span>
            <span class="work-inbox-reason">${A(m.reason_code.replaceAll("_"," "))}</span>
            <span class="work-inbox-due">${A(an(m.due_at))}</span>
            <span class="work-inbox-action">${A(m.next_action)}</span>
          </button>
        `}function w(){const m=sn(t.items);e.innerHTML=`
          <section class="work-inbox-shell" aria-label="Work inbox">
            <header class="work-inbox-header">
              <div>
                <div class="work-inbox-eyebrow">Today extension</div>
                <h2>Work inbox</h2>
                <p>Normalized tasks, mentions, discussion replies, and review signals.</p>
              </div>
              <div class="work-inbox-total">${t.items.length} item${t.items.length===1?"":"s"}</div>
            </header>
            ${t.error?`<div class="work-inbox-error">${A(t.error)}</div>`:""}
            <div class="work-inbox-toolbar">
              <button type="button" data-inbox-refresh>Refresh</button>
            </div>
            <div class="work-inbox-list">
              ${t.loading?'<div class="work-inbox-muted">Loading inbox...</div>':""}
              ${m.map(y=>`
                <section class="work-inbox-group">
                  <h3>${A(tn[y.severity])}</h3>
                  ${y.items.map(E).join("")}
                </section>
              `).join("")}
              ${!t.loading&&!t.items.length?'<div class="work-inbox-muted">No attention items right now.</div>':""}
            </div>
          </section>
        `,e.querySelector("[data-inbox-refresh]")?.addEventListener("click",()=>u()),e.querySelectorAll("[data-inbox-item]").forEach(y=>{y.addEventListener("click",()=>{const M=y.dataset.inboxItem,D=t.items.find(_=>`${_.kind}:${_.entity_id}:${_.reason_code}`===M);D&&p(D)})})}return u(),c=setInterval(()=>u(),6e4),typeof n.service.subscribeToInboxEvents=="function"&&(l=n.service.subscribeToInboxEvents(()=>u())),()=>{r=!0,c&&clearInterval(c),l&&l(),e.classList.remove("wein-work-inbox-root"),e.innerHTML=""}}}}const ve={critical:0,high:1,medium:2,low:3};function ce(e,n=new Date){if(!e)return"low";const t=new Date(e);if(Number.isNaN(t.getTime()))return"low";const r=t.getTime()-n.getTime();return r<0?"critical":r<=1440*60*1e3?"high":r<=4320*60*1e3?"medium":"low"}function on(e,{now:n=new Date}={}){return{kind:"task",entity_id:e.id,title:e.title||"Untitled task",reason_code:e.due_date?"task_due":"task_open",severity:ce(e.due_date,n),owner_id:e.assigned_to_user_id||e.owner_id||null,due_at:e.due_date||null,next_action:"Open task",href:`#tasks/${e.id}`,source:e}}function cn(e,{comment:n,currentUserId:t}={}){return{kind:"mention",entity_id:e.comment_id,title:n?.body?`Mention: ${n.body}`:"Mention in discussion",reason_code:"unresolved_mention",severity:n?.resolved_at?"low":"high",owner_id:t||e.mentioned_user_id,due_at:n?.created_at||e.created_at||null,next_action:"Reply or resolve",href:`#comments/${e.comment_id}`,source:{mention:e,comment:n}}}function ln(e,{currentUserId:n,now:t=new Date}={}){return{kind:"discussion",entity_id:e.id,title:e.body||"Discussion awaiting reply",reason_code:"thread_awaiting_reply",severity:ce(e.next_reply_due_at||e.created_at,t),owner_id:n||null,due_at:e.next_reply_due_at||null,next_action:"Reply in thread",href:`#comments/${e.id}`,source:e}}function dn(e,{now:n=new Date}={}){return{kind:e.kind||"review",entity_id:e.id,title:e.title||e.offer_title||"Founder review needed",reason_code:e.reason_code||"founder_review",severity:ce(e.due_at||e.created_at,n),owner_id:e.owner_id||null,due_at:e.due_at||e.created_at||null,next_action:"Review",href:e.href||`#review/${e.id}`,source:e}}function un(e=[]){return[...e].sort((n,t)=>{const r=(ve[n.severity]??9)-(ve[t.severity]??9);return r||String(n.due_at||"").localeCompare(String(t.due_at||""))})}function mn(e=[]){const n=new Set;return e.filter(t=>{const r=`${t.kind}:${t.entity_id}:${t.reason_code}`;return n.has(r)?!1:(n.add(r),!0)})}function fn({tasks:e=[],mentions:n=[],commentsById:t={},awaitingReplies:r=[],founderReviews:c=[]},l={}){const u=[...e.map(p=>on(p,l)),...n.map(p=>cn(p,{...l,comment:t[p.comment_id]})),...r.map(p=>ln(p,l)),...c.map(p=>dn(p,l))];return un(mn(u))}function ge(e){if(e)throw e}function pn({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(){let u=e.from("wein_tasks").select("*").neq("status","done").order("due_date",{ascending:!0,nullsFirst:!1});n&&(u=u.eq("assigned_to_user_id",n));const{data:p,error:E}=await u;return ge(E),p||[]}async function r(){const{data:u,error:p}=await e.from("wein_comment_mentions").select("comment_id,mentioned_user_id,created_at,wein_comments(*)").eq("mentioned_user_id",n).is("wein_comments.resolved_at",null).order("created_at",{ascending:!0});return ge(p),u||[]}async function c(){const[u,p]=await Promise.all([t(),r()]),E={},w=p.map(m=>{const y=m.wein_comments||m.comment||null;return y?.id&&(E[y.id]=y),{comment_id:m.comment_id,mentioned_user_id:m.mentioned_user_id,created_at:m.created_at}});return fn({tasks:u,mentions:w,commentsById:E},{currentUserId:n})}function l(u){if(!e.channel)return()=>{};const p=e.channel(`work-inbox:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_tasks"},u).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},u).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},u).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(p);if(p?.unsubscribe)return p.unsubscribe()}}return{fetchOpenTasks:t,fetchUnresolvedMentions:r,loadInbox:c,subscribeToInboxEvents:l}}const qe=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function hn(e){for(const n of qe)Z({id:n,mount:()=>{e[n]()}})}function le(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const _n=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function vn(e,n){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${_n.map(t=>`<button class="chip ${e===t?"active":""}" type="button" onclick="${n}('${t.replace(/'/g,"\\'")}')">${t==="all"?"All":le(t)}</button>`).join("")}</div>`}function gn(e,n){return n==="all"||String(e||"")===n}function bn(e){return String(e?.category||e?.vertical||"-")}function yn(e){const n=String(e||"").toLowerCase();return n.includes("dining")?"dining":n.includes("health")?"health":n.includes("fun")?"fun":n.includes("hotel")?"hotels":""}function wn(e,n=Date.now()){return e?Math.floor((n-new Date(e).getTime())/864e5):0}function ne(e=new Date){const n=new Date(e);return n.setHours(0,0,0,0),n}function Sn(e,n=new Date){return e?Math.round((ne(n).getTime()-ne(e).getTime())/864e5):null}function De(e,n){let t=String(e||"").replace(/\D/g,"");if(!t)return null;t.startsWith("0")&&(t=`20${t.slice(1)}`);const r=`Hi! Following up on the WeIN offer sheet for ${n} - do you have 5 minutes today?`;return`https://wa.me/${t}?text=${encodeURIComponent(r)}`}function $n(e,n){const t=De(e,n);return t?`<a class="mini-btn" href="${le(t)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function G(e){return e.id}function kn(e){return I("profiles").find(n=>G(n)===e)??null}function Mn(e){return I("providers").find(n=>G(n)===e)??null}function En(e){return I("leads").find(n=>G(n)===e)??null}function Cn(e){return I("tasks").find(n=>G(n)===e)??null}function In(e){return I("offers").find(n=>G(n)===e)??null}function qn(e){return I("offers").filter(n=>n.provider_id===e)}function Dn(e){return I("tasks").filter(n=>n.provider_id===e)}function Tn(e){return I("tasks").filter(n=>n.lead_id===e)}const Ln=Object.freeze(Object.defineProperty({__proto__:null,leadById:En,offerById:In,offersForProvider:qn,profileById:kn,providerById:Mn,taskById:Cn,tasksForLead:Tn,tasksForProvider:Dn},Symbol.toStringTag,{value:"Module"}));qt();Yt();const Te={api:$e,auth:{canDelete:ae,canManageDeals:ye,canEditProviderProfile:we,navHiddenForRole:se,defaultViewForRole:Se},platform:{getSupabaseClient:re,getAccessToken:X,getSessionContext:_t},shared:{escapeHtml:le,daysSince:wn,startOfLocalDay:ne,dayDiffFromToday:Sn,whatsappLink:De,whatsappButtonHtml:$n,categoryChipsHtml:vn,matchesCategoryFilter:gn,categoryLabel:bn,catBadgeClass:yn},core:{createPortalContext:Mt,getView:Ee,mountView:It,registeredViewIds:Et,registerView:Z},legacy:{LEGACY_VIEW_IDS:qe,registerLegacyViews:hn},features:{requestOpenChatConversation:zt,createDiscussionViewModule:Zt,createSupabaseDiscussionService:en,createWorkInboxViewModule:rn,createSupabaseWorkInboxService:pn},store:Me,selectors:Ln};window.WEIN_PORTAL_MODULES=Te;for(const e of window.WEIN_PORTAL_MODULES_READY??[])e(Te);window.WEIN_PORTAL_MODULES_READY=[];
