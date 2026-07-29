function Oe(e){return typeof e=="object"&&e!==null?e.role:e}function de(e){const n=Oe(e);return n==="admin"||n==="manager"}const Ne=de;function Pe(e){const n=Oe(e);return n==="admin"||n==="manager"||n==="deal_breaker"}const Wt={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function ue(e){return e?Wt[e]??[]:[]}function Ue(e){return ue(e).includes("pipeline")?"tasks":"pipeline"}function O(){return window.WEIN_PORTAL_LEGACY??{}}function te(){const e=O().supabaseClient;if(!e)throw new Error("Portal Supabase client is not available yet.");return e}function ne(){const e=O().getSupabaseUrl?.();if(!e)throw new Error("Portal Supabase URL is not available yet.");return e}function zt(){const e=O().getSupabaseAnonKey?.();if(!e)throw new Error("Portal Supabase anon key is not available yet.");return e}function ae(){return O().getAccessToken?.()??null}function Gt(){return{client:te(),accessToken:ae()}}class Vt extends Error{constructor(n,t,r){super(n),this.status=t,this.body=r,this.name="PortalApiError"}status;body}function z(){const e=O().headers?.();if(e)return e;const n=zt();return{apikey:n,Authorization:`Bearer ${ae()||n}`,"Content-Type":"application/json"}}async function me(e,n){if(e.ok)return;const t=await e.text();throw new Vt(`Supabase ${n} failed: ${e.status}${t?` ${t}`:""}`,e.status,t)}async function Qt(e){const n=O().get;if(n)return n(e);const t=await fetch(`${ne()}/rest/v1/${e}`,{headers:z()});return await me(t,"GET"),t.json()}async function Yt(e,n){const t=O().post;if(t)return t(e,n);const r=await fetch(`${ne()}/rest/v1/${e}`,{method:"POST",headers:{...z(),Prefer:"return=representation"},body:JSON.stringify(n)});return await me(r,"POST"),r.json()}async function Kt(e,n){const t=O().patch;return t?t(e,n):(await fetch(`${ne()}/rest/v1/${e}`,{method:"PATCH",headers:z(),body:JSON.stringify(n)})).ok}async function Jt(e){const n=O().delete;if(n)return n(e);const t=await fetch(`${ne()}/rest/v1/${e}`,{method:"DELETE",headers:z()});return await me(t,"DELETE"),!0}const Fe={headers:z,get:Qt,post:Yt,patch:Kt,delete:Jt},Xt={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function Zt(){const e=O().getCaches?.();return e?{providers:e.providers??[],offers:e.offers??[],negotiations:e.negotiations??[],files:e.files??[],leads:e.leads??[],outcomes:e.outcomes??[],tasks:e.tasks??[],profiles:e.profiles??[],redemptions:e.redemptions??[],campaigns:e.campaigns??[],calendarNotes:e.calendarNotes??[]}:Xt}function T(e){return Zt()[e]}function xe(e,n){const t=O().setCache;if(!t)throw new Error("Portal cache bridge is not available yet.");t(e,[...n])}function en(e,n){xe(e,n(T(e)))}const Be={get providers(){return T("providers")},get offers(){return T("offers")},get negotiations(){return T("negotiations")},get files(){return T("files")},get leads(){return T("leads")},get outcomes(){return T("outcomes")},get tasks(){return T("tasks")},get profiles(){return T("profiles")},get redemptions(){return T("redemptions")},get campaigns(){return T("campaigns")},get calendarNotes(){return T("calendarNotes")},getCache:T,replaceCache:xe,updateCache:en};function X(){const e=window.WEIN??{};return{user:e.user,role:e.role??sessionStorage.getItem("weinRole"),fullName:e.fullName??null,accessToken:ae(),client:te()}}function tn(){const e=X();return{api:Fe,store:Be,session:e,permissions:{canDelete:()=>de(X()),canManageDeals:()=>Ne(X()),canEditProviderProfile:()=>Pe(X()),navHiddenForRole:ue,defaultViewForRole:Ue},navigate(n,t){window.showView?.(n,t)}}}const W=new Map;let Z=null;function se(e){if(!e.id)throw new Error("View id is required.");if(W.has(e.id))throw new Error(`View already registered: ${e.id}`);W.set(e.id,e)}function He(e){return W.get(e)}function nn(){return[...W.keys()]}function an(){if(!Z)return;const e=Z;Z=null,e()}function sn(e,n,t){const r=He(e);if(!r)throw new Error(`Unknown portal view: ${e}`);an();const l=r.mount(n,t);Z=typeof l=="function"?l:null}function rn(){W.has("__dummy_cleanup_probe")||se({id:"__dummy_cleanup_probe",mount(e){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,e.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function on(e="chat"){const n=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${e}-${n}`}function oe(e,n){return e.kind==="group"?e.title||"Untitled group":(e.members||[]).map(r=>r.profile).find(r=>r&&r.id!==n)?.full_name||"Direct message"}function cn(e){return[...e].sort((n,t)=>{const r=n.last_message?.created_at||n.created_at,l=t.last_message?.created_at||t.created_at;return new Date(l).getTime()-new Date(r).getTime()})}function ln(e,n){const t=(e.members||[]).find(l=>l.user_id===n),r=e.last_message?.message_seq||0;return Math.max(0,r-(t?.last_read_seq||0))}function ke(e){if(!e)return"No messages yet";const n=(e.deleted_at?"Message deleted":e.body||"").trim();return n.length>82?`${n.slice(0,79)}...`:n}const dn=/[\s\p{P}]/u,un=/[\s\p{P}]/u;function je(e,n){return n===0?!0:dn.test(e[n-1])}function mn(e,n){return n>=e.length?!0:un.test(e[n])}function ee(e="",n=[]){const t=String(e??"");if(!t.includes("@"))return[];const r=n.filter(p=>p&&p.id&&p.full_name).map(p=>({id:p.id,name:String(p.full_name)})).sort((p,M)=>M.name.length-p.name.length);if(!r.length)return[];const l=t.toLowerCase(),c=[],m=new Set;for(let p=0;p<t.length;p+=1){if(t[p]!=="@"||!je(t,p))continue;const M=p+1;for(const b of r){const f=M+b.name.length;if(l.startsWith(b.name.toLowerCase(),M)&&mn(t,f)){m.has(b.id)||(m.add(b.id),c.push(b.id)),p=f-1;break}}}return c}function fn(e="",n=[]){const t=new Set(ee(e,n));return n.filter(r=>r&&t.has(r.id)&&r.full_name).map(r=>String(r.full_name)).sort((r,l)=>l.length-r.length)}function pn(e="",n=0){const t=String(e??""),r=Math.max(0,Math.min(Number(n)||0,t.length)),l=40;for(let c=r-1;c>=0&&r-c<=l;c-=1){const m=t[c];if(m==="@")return je(t,c)?{query:t.slice(c+1,r),start:c}:null;if(m===`
`)return null}return null}function u(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function H(e){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[e]||e}function hn(e){return`${e}-${Math.random().toString(16).slice(2)}-${Date.now().toString(36)}`}function Ee(e){return typeof e=="string"&&e.startsWith("image/")}function gn(e){const n=Number(e)||0;return n<1024?`${n} B`:n<1024*1024?`${(n/1024).toFixed(1)} KB`:`${(n/(1024*1024)).toFixed(1)} MB`}function Me(e){return e==="application/pdf"?"ti-file-type-pdf":e?.includes("word")?"ti-file-type-doc":e?.includes("sheet")||e?.includes("excel")?"ti-file-type-xls":"ti-file"}function Ce(e,n=new Date){if(!e)return"";const t=new Date(e);if(Number.isNaN(t.getTime()))return"";const r=n.getTime()-t.getTime(),l=Math.floor(r/6e4);if(l<1)return"now";if(l<60)return`${l}m`;const c=Math.floor(l/60);return c<24?`${c}h`:r<6*864e5?t.toLocaleDateString(void 0,{weekday:"short"}):t.toLocaleDateString(void 0,{month:"short",day:"numeric"})}const vn=300*1e3;function _n(e,n){if(!n||e.sender_id!==n.sender_id)return!0;const t=new Date(e.created_at).getTime()-new Date(n.created_at).getTime();return!(t>=0&&t<vn)}function bn(){return{id:"team-chat",mount(e,n){const t={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,composeOpen:!1,composeSearch:"",composeGroupTitle:"",composeSelectedMemberIds:new Set,membersOpen:!1,memberAddOpen:!1,memberSearch:"",memberSelectedIds:new Set,renameOpen:!1,renameDraft:"",archiveConfirmOpen:!1,mentionQuery:null,mentionIndex:0,mentionStart:0,mentionDraft:"",pendingAttachments:[],openMessageMenuId:null,confirmingDeleteMessageId:null,searchOpen:!1,searchQuery:"",searchResults:[],searchLoading:!1,searchError:null,loading:!0,error:null},r=new Map,l=new Set;let c=!1,m=n.initialConversationId||null,p=null,M=null,b=!1,f=null,$=0;function I(){const a=e.querySelector(".chat-message-list");return a?a.scrollHeight-a.scrollTop-a.clientHeight<80:!0}function L(){const a=e.querySelector(".chat-message-list");a&&(a.scrollTop=a.scrollHeight)}function v(a){a.style.height="auto",a.style.height=`${Math.min(a.scrollHeight,120)}px`}function C(a){return a?a.members.filter(s=>!s.left_at&&s.profile).map(s=>s.profile):[]}function y(a){const s=String(t.mentionQuery||"").trim().toLowerCase(),i=C(a).filter(d=>d.id!==n.currentUser.id);return s?i.filter(d=>(d.full_name||"").toLowerCase().includes(s)):i}function x({rerender:a=!0}={}){t.mentionQuery!==null&&(t.mentionQuery=null,t.mentionIndex=0,a&&g())}function B(a){t.mentionDraft=a.value;const s=pn(a.value,a.selectionStart??a.value.length),i=s?s.query:null;return i===t.mentionQuery?!1:(t.mentionQuery=i,t.mentionStart=s?s.start:0,t.mentionIndex=0,!0)}function V(a,s){const i=e.querySelector("[data-chat-composer]");if(!i||!s)return;const d=i.selectionStart??i.value.length,h=i.value.slice(0,t.mentionStart),S=i.value.slice(d),k=`@${s.full_name} `,_=`${h}${k}${S}`,q=h.length+k.length;t.mentionQuery=null,t.mentionIndex=0,t.mentionDraft=_,g();const E=e.querySelector("[data-chat-composer]");E&&(E.value=_,v(E),E.focus(),E.setSelectionRange?.(q,q))}function ge(a,s){const i=y(a);if(!i.length)return;const d=(t.mentionIndex+s+i.length)%i.length;t.mentionIndex=d;const h=e.querySelector("[data-chat-composer]")?.value??t.mentionDraft,S=e.querySelector("[data-chat-composer]")?.selectionStart??h.length;t.mentionDraft=h,g();const k=e.querySelector("[data-chat-composer]");k&&(k.value=h,v(k),k.focus(),k.setSelectionRange?.(S,S))}e.classList.add("wein-chat-root"),typeof document<"u"&&document.body?.classList.add("wein-chat-root");function ve(a){const s=a.target;if(s instanceof Element){if(t.composeOpen&&!s.closest("[data-chat-compose-popover]")&&!s.closest("[data-chat-compose-toggle]")){Y();return}if(t.membersOpen&&!s.closest("[data-chat-members-panel]")&&!s.closest("[data-chat-members-toggle]")){K();return}t.openMessageMenuId&&!s.closest("[data-chat-message-menu-panel]")&&!s.closest("[data-chat-message-menu]")&&(t.openMessageMenuId=null,g())}}function _e(a){if(a.key==="Escape"){if(t.composeOpen){Y();return}if(t.membersOpen){K();return}(t.openMessageMenuId||t.confirmingDeleteMessageId)&&(t.openMessageMenuId=null,t.confirmingDeleteMessageId=null,g())}}e.addEventListener?.("click",ve),typeof document<"u"&&document.addEventListener("keydown",_e);async function D({keepMessages:a=!0}={}){try{t.error=null;const[s,i]=await Promise.all([n.service.listProfiles(),n.service.listConversations()]);if(t.profiles=s,t.conversations=cn(i),m&&(t.conversations.some(d=>d.id===m)&&(t.selectedConversationId=m),m=null),!t.selectedConversationId&&t.conversations.length&&(t.selectedConversationId=t.conversations[0].id),t.selectedConversationId&&a){t.messages=await n.service.listMessages(t.selectedConversationId);const d=t.messages.at(-1)?.message_seq||0;if(d)try{await n.service.markRead(t.selectedConversationId,d)}catch(h){console.error("Failed to mark chat messages as read",h)}}}catch(s){t.error=s.message||String(s)}finally{t.loading=!1,c||g()}}async function Q(a){t.selectedConversationId=a,t.membersOpen=!1,t.memberAddOpen=!1,t.memberSearch="",t.memberSelectedIds=new Set,t.renameOpen=!1,t.renameDraft="",t.archiveConfirmOpen=!1,t.pendingAttachments=[],e.classList.add("chat-has-selection"),t.messages=await n.service.listMessages(a),b=!0,c||g();const s=t.messages.at(-1)?.message_seq||0;if(s)try{await n.service.markRead(a,s)}catch(i){console.error("Failed to mark chat messages as read",i)}await D()}function be(){e.classList.remove("chat-has-selection")}function re(a){const s=t.selectedConversationId;if(!s)return;const i=[...a||[]];for(const d of i){const h={id:hn("pending"),name:d.name,mime:d.type||"application/octet-stream",size:d.size,status:"uploading",error:null,uploaded:null};t.pendingAttachments=[...t.pendingAttachments,h],n.service.uploadAttachment(s,d).then(S=>{h.status="done",h.uploaded=S,c||g()}).catch(S=>{h.status="error",h.error=S?.message||"Upload failed",c||g()})}g()}function Ke(a){t.pendingAttachments=t.pendingAttachments.filter(s=>s.id!==a),g()}async function Je(a){const s=a.querySelector("[data-chat-composer]"),i=s.value.trim(),d=t.pendingAttachments.some(E=>E.status==="uploading"),h=t.pendingAttachments.filter(E=>E.status==="done").map(E=>E.uploaded);if(d||!i&&!h.length||!t.selectedConversationId)return;const S=t.replyToMessageId,k=t.conversations.find(E=>E.id===t.selectedConversationId)||null,_=ee(i,C(k));s.value="",t.replyToMessageId=null,t.mentionQuery=null,t.mentionDraft="",t.pendingAttachments=[];const q=await n.service.sendMessage({conversationId:t.selectedConversationId,body:i,clientNonce:on("portal-chat"),replyToId:S,mentionedUserIds:_,attachments:h});t.messages=[...t.messages,q],b=!0,c||g();try{await n.service.markRead(t.selectedConversationId,q.message_seq)}catch(E){console.error("Failed to mark chat message as read",E)}await D()}function Xe(a){a&&(t.replyToMessageId=a,g(),e.querySelector("[data-chat-composer]")?.focus())}function Ze(){t.replyToMessageId=null,g()}function et(){t.composeOpen=!0,g(),e.querySelector("[data-chat-compose-search]")?.focus()}function Y({reset:a=!1}={}){t.composeOpen=!1,a&&(t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set),g()}function tt(){t.searchOpen=!0,t.composeOpen=!1,g(),e.querySelector("[data-chat-search-input]")?.focus()}function ie(){t.searchOpen=!1,t.searchQuery="",t.searchResults=[],t.searchLoading=!1,t.searchError=null,f&&clearTimeout(f),g()}async function nt(a){const s=a.trim();if(!s){t.searchResults=[],t.searchLoading=!1,t.searchError=null,c||g();return}const i=++$;t.searchLoading=!0,t.searchError=null,c||g();try{const d=await n.service.searchMessages(s);if(c||i!==$)return;t.searchResults=d,t.searchLoading=!1,g()}catch(d){if(c||i!==$)return;t.searchError=d instanceof Error?d.message:String(d),t.searchLoading=!1,g()}}function at(a){t.searchQuery=a,f&&clearTimeout(f),f=setTimeout(()=>nt(a),300)}async function st(a,s){if(ie(),await Q(a),c)return;const i=Array.from(e.querySelectorAll("[data-chat-message-id]")).find(d=>d.dataset.chatMessageId===s);i&&(i.scrollIntoView({block:"center"}),i.classList.add("chat-message-jumped"),setTimeout(()=>i.classList.remove("chat-message-jumped"),1600))}function rt(a,s){const i=new Set(t.composeSelectedMemberIds);s?i.add(a):i.delete(a),t.composeSelectedMemberIds=i,g()}function ye(a){return a.members.find(i=>i.user_id===n.currentUser.id&&!i.left_at)?.membership_role==="owner"||["admin","manager"].includes(n.currentUser.role)}function we(a){return!a||a.kind!=="group"?!1:ye(a)}function it(a){return a?ye(a):!1}function ot(){t.membersOpen=!0,g()}function K({reset:a=!1}={}){t.membersOpen=!1,t.memberAddOpen=!1,a&&(t.memberSearch="",t.memberSelectedIds=new Set),g()}function ct(){t.memberAddOpen=!t.memberAddOpen,g(),t.memberAddOpen&&e.querySelector("[data-chat-member-search]")?.focus()}function lt(a,s){const i=new Set(t.memberSelectedIds);s?i.add(a):i.delete(a),t.memberSelectedIds=i,g()}async function dt(a){const s=[...t.memberSelectedIds];if(!(!a||!s.length)){for(const i of s)await n.service.addMember(a,i);t.memberSearch="",t.memberSelectedIds=new Set,t.memberAddOpen=!1,c||g(),await D()}}async function ut(a,s){!a||!s||(await n.service.removeMember(a,s),t.conversations=t.conversations.map(i=>i.id!==a?i:{...i,members:i.members.map(d=>d.user_id===s?{...d,left_at:d.left_at||new Date().toISOString()}:d)}),s===n.currentUser.id&&(t.membersOpen=!1,t.memberAddOpen=!1),c||g(),await D())}function mt(a){const s=t.messages.find(d=>d.id===a);if(!s)return;t.editingMessageId=a,t.editDraft=s.body||"",g();const i=e.querySelector(`[data-chat-edit-input="${CSS.escape(a)}"]`);i?.focus(),i?.select?.()}function ft(){t.editingMessageId=null,t.editDraft="",g()}async function pt(a){const s=a.dataset.chatEditForm,d=a.querySelector("[data-chat-edit-input]").value.trim();if(!s||!d)return;const h=t.conversations.find(k=>k.id===t.selectedConversationId)||null,S=await n.service.updateMessage(s,d,ee(d,C(h)));t.messages=t.messages.map(k=>k.id===S.id?S:k),t.editingMessageId=null,t.editDraft="",c||g(),await D()}async function ht(a){if(!a)return;const s=await n.service.deleteMessage(a);t.messages=t.messages.map(i=>i.id===a?{...i,...s,body:"Message deleted",deleted_at:s.deleted_at||new Date().toISOString()}:i),t.replyToMessageId===a&&(t.replyToMessageId=null),t.confirmingDeleteMessageId=null,t.openMessageMenuId=null,c||g(),await D()}async function gt(a){const i=a.members.find(d=>d.user_id===n.currentUser.id)?.notification_level==="muted"?"all":"muted";await n.service.setNotificationLevel(a.id,i),t.conversations=t.conversations.map(d=>d.id!==a.id?d:{...d,members:d.members.map(h=>h.user_id===n.currentUser.id?{...h,notification_level:i}:h)}),c||g(),await D()}function vt(a){t.renameOpen=!0,t.renameDraft=a.title||"",g(),e.querySelector("[data-chat-rename-input]")?.focus()}function _t(){t.renameOpen=!1,t.renameDraft="",g()}async function bt(a,s){const i=(s||"").trim();i&&(await n.service.renameConversation(a.id,i),t.conversations=t.conversations.map(d=>d.id===a.id?{...d,title:i}:d),t.renameOpen=!1,t.renameDraft="",c||g(),await D())}function yt(){t.archiveConfirmOpen=!0,g()}function wt(){t.archiveConfirmOpen=!1,g()}async function St(a,s){await n.service.setConversationArchived(a.id,s),t.archiveConfirmOpen=!1,t.selectedConversationId===a.id&&(t.selectedConversationId=null,be()),t.conversations=t.conversations.map(i=>i.id===a.id?{...i,archived_at:new Date().toISOString()}:i),c||g(),await D()}async function $t(a,s,i){!a||!s||(await n.service.setMembershipRole(a,s,i),t.conversations=t.conversations.map(d=>d.id!==a?d:{...d,members:d.members.map(h=>h.user_id===s?{...h,membership_role:i}:h)}),c||g(),await D())}async function kt(a){if(!a)return;const s=await n.service.getOrCreateDm(a);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await Q(s)}async function Et(a,s){if(a=a.trim(),!a)return;const i=await n.service.createGroup(a,s);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await Q(i)}function Mt(){c||D()}function Ct(a){const s=a.id===t.selectedConversationId?" selected":"",i=a.unread_count?`<span class="chat-count">${a.unread_count}</span>`:"",d=oe(a,n.currentUser.id),h=Ce(a.last_message?.created_at);return`
          <button type="button" class="chat-conversation${s}" data-chat-select="${u(a.id)}">
            <span class="chat-conversation-avatar" aria-hidden="true">${u((d||"?").slice(0,1).toUpperCase())}</span>
            <span class="chat-conversation-body">
              <span class="chat-conversation-row">
                <span class="chat-conversation-title">${u(d)}</span>
                ${h?`<span class="chat-conversation-timestamp">${u(h)}</span>`:""}
                ${i}
              </span>
              <span class="chat-conversation-preview">${u(ke(a.last_message))}</span>
            </span>
          </button>
        `}function It(a){const s=t.conversations.find(S=>S.id===a.conversation_id),i=s?oe(s,n.currentUser.id):"Archived conversation",d=Ce(a.created_at),h=a.sender?.full_name||"Unknown";return`
          <button type="button" class="chat-search-result" data-chat-search-result="${u(a.conversation_id)}" data-chat-search-message="${u(a.id)}">
            <span class="chat-search-result-row">
              <span class="chat-search-result-title">${u(i)}</span>
              ${d?`<span class="chat-search-result-time">${u(d)}</span>`:""}
            </span>
            <span class="chat-search-result-snippet"><strong>${u(h)}:</strong> ${u(ke(a))}</span>
          </button>
        `}function Tt(){const a=t.searchQuery.trim();return`
          <div class="chat-search-panel">
            <div class="chat-search-input-row">
              <i class="ti ti-search"></i>
              <input data-chat-search-input type="search" placeholder="Search messages..." value="${u(t.searchQuery)}" autocomplete="off">
              <button type="button" data-chat-search-close aria-label="Close search"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-search-results">
              ${t.searchLoading?'<div class="chat-muted">Searching...</div>':""}
              ${t.searchError?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${u(t.searchError)}</span></div>`:""}
              ${!t.searchLoading&&!t.searchError&&a&&!t.searchResults.length?'<div class="chat-muted">No messages found.</div>':""}
              ${!t.searchLoading&&!a?`<div class="chat-muted">Type to search across every conversation you're in.</div>`:""}
              ${t.searchLoading?"":t.searchResults.map(It).join("")}
            </div>
          </div>
        `}function qt(){return["admin","manager"].includes(n.currentUser.role)}function Lt(a){if(!t.composeOpen)return"";const s=t.composeSearch.trim().toLowerCase(),i=a.filter(S=>!s||(S.full_name||"").toLowerCase().includes(s)),d=t.composeSelectedMemberIds.size,h=d===1?[...t.composeSelectedMemberIds][0]:"";return`
          <div class="chat-compose-popover" data-chat-compose-popover role="dialog" aria-label="New conversation">
            <div class="chat-compose-popover-head">
              <strong>New conversation</strong>
              <button type="button" class="chat-icon-btn" data-chat-compose-close aria-label="Close new conversation"><i class="ti ti-x"></i></button>
            </div>
            <input data-chat-compose-search type="search" placeholder="Search people..." value="${u(t.composeSearch)}" autocomplete="off">
            <div class="chat-compose-summary">${d} selected</div>
            <div class="chat-compose-list">
              ${i.map(S=>{const k=t.composeSelectedMemberIds.has(S.id)?" checked":"";return`
                  <label class="chat-compose-person">
                    <input type="checkbox" data-chat-compose-member="${u(S.id)}"${k}>
                    <span class="chat-compose-avatar">${u((S.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${u(S.full_name||"Unknown")}</strong>
                      <span>${u(H(S.role))}</span>
                    </span>
                  </label>
                `}).join("")}
              ${i.length?"":'<div class="chat-muted">No matching people.</div>'}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${u(h)}"${d===1?"":" disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${u(t.composeGroupTitle)}">
                <button type="button" data-chat-create-group${t.composeGroupTitle.trim()?"":" disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
              </div>
            </div>
          </div>
        `}function At(a){if(t.mentionQuery===null||!a)return"";const s=y(a);if(!s.length)return"";const i=Math.min(t.mentionIndex,s.length-1);return`
          <div class="chat-compose-popover chat-mention-picker" data-chat-mention-picker role="listbox" aria-label="Mention someone">
            ${s.map((d,h)=>`
              <button
                type="button"
                class="chat-compose-person chat-mention-option${h===i?" active":""}"
                data-chat-mention-pick="${u(d.id)}"
                role="option"
                aria-selected="${h===i}"
              >
                <span class="chat-compose-avatar">${u((d.full_name||"?").slice(0,1))}</span>
                <span class="chat-compose-person-copy">
                  <strong>${u(d.full_name||"Unknown")}</strong>
                  <span>${u(H(d.role))}</span>
                </span>
              </button>
            `).join("")}
          </div>
        `}function Dt(a){if(!t.membersOpen||!a||a.kind!=="group")return"";const s=a.members.filter(_=>!_.left_at),i=we(a),d=new Set(s.map(_=>_.user_id)),h=t.memberSearch.trim().toLowerCase(),S=t.profiles.filter(_=>_.id!==n.currentUser.id&&!d.has(_.id)&&(!h||(_.full_name||"").toLowerCase().includes(h))),k=t.memberSelectedIds.size;return`
          <div class="chat-compose-popover chat-members-panel" data-chat-members-panel role="dialog" aria-label="Manage members">
            <div class="chat-compose-popover-head">
              <strong>Manage members</strong>
              <button type="button" class="chat-icon-btn" data-chat-members-close aria-label="Close member management"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-member-panel-list">
              ${s.map(_=>{const q=_.profile||{},E=_.user_id===n.currentUser.id,J=i||E;return`
                  <div class="chat-member-row" data-chat-member-row="${u(_.user_id)}">
                    <span class="chat-compose-avatar">${u((q.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${u(q.full_name||_.user_id)}</strong>
                      <span>${u(q.role?H(q.role):"Member")}</span>
                    </span>
                    ${_.membership_role==="owner"?'<span class="chat-owner-badge">Owner</span>':""}
                    ${i?`
                      <button type="button" class="chat-member-promote" data-chat-promote-member="${u(_.user_id)}" data-chat-role="${_.membership_role==="owner"?"member":"owner"}">
                        <i class="ti ${_.membership_role==="owner"?"ti-user-minus":"ti-shield-plus"}"></i><span>${_.membership_role==="owner"?"Remove owner":"Make owner"}</span>
                      </button>
                    `:""}
                    ${J?`
                      <button type="button" class="chat-member-remove" data-chat-remove-member="${u(_.user_id)}">
                        <i class="ti ${E?"ti-logout":"ti-user-minus"}"></i><span>${E?"Leave":"Remove"}</span>
                      </button>
                    `:""}
                  </div>
                `}).join("")}
            </div>
            ${i?`
              <div class="chat-member-add">
                <button type="button" class="chat-member-add-toggle" data-chat-member-add-toggle>
                  <i class="ti ti-user-plus"></i><span>Add member</span>
                </button>
                ${t.memberAddOpen?`
                  <input data-chat-member-search type="search" placeholder="Search people..." value="${u(t.memberSearch)}" autocomplete="off">
                  <div class="chat-compose-summary">${k} selected</div>
                  <div class="chat-compose-list">
                    ${S.map(_=>{const q=t.memberSelectedIds.has(_.id)?" checked":"";return`
                        <label class="chat-compose-person">
                          <input type="checkbox" data-chat-member-pick="${u(_.id)}"${q}>
                          <span class="chat-compose-avatar">${u((_.full_name||"?").slice(0,1))}</span>
                          <span class="chat-compose-person-copy">
                            <strong>${u(_.full_name||"Unknown")}</strong>
                            <span>${u(H(_.role))}</span>
                          </span>
                        </label>
                      `}).join("")}
                    ${S.length?"":'<div class="chat-muted">No matching people.</div>'}
                  </div>
                  <div class="chat-compose-actions">
                    <button type="button" data-chat-add-members="${u(a.id)}"${k?"":" disabled"}><i class="ti ti-users-plus"></i><span>Add selected</span></button>
                  </div>
                `:""}
              </div>
            `:""}
          </div>
        `}function Se(a){const s=a.deleted_at?"Message deleted":a.body||"";return s.length>90?`${s.slice(0,87)}...`:s}function Rt(a){if(!a?.reply_to_id)return"";const s=t.messages.find(i=>i.id===a.reply_to_id);return s?`
          <div class="chat-quote">
            <strong>${u(s.sender?.full_name||"Unknown")}</strong>
            <span>${u(Se(s))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function Ot(){const a=t.messages.find(s=>s.id===t.replyToMessageId);return a?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${u(a.sender?.full_name||"Unknown")}</strong>
              <span>${u(Se(a))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function Nt(){return t.pendingAttachments.length?`
          <div class="chat-pending-attachments">
            ${t.pendingAttachments.map(a=>`
              <div class="chat-pending-attachment${a.status==="error"?" error":""}" data-chat-pending-attachment="${u(a.id)}">
                <i class="ti ${a.status==="error"?"ti-alert-triangle":Ee(a.mime)?"ti-photo":Me(a.mime)}"></i>
                <span class="chat-pending-attachment-name">${u(a.name)}</span>
                ${a.status==="uploading"?'<span class="chat-pending-attachment-status">Uploading…</span>':""}
                ${a.status==="error"?`<span class="chat-pending-attachment-status">${u(a.error||"Failed")}</span>`:""}
                <button type="button" data-chat-remove-pending="${u(a.id)}" aria-label="Remove attachment"><i class="ti ti-x"></i></button>
              </div>
            `).join("")}
          </div>
        `:""}function Pt(a){const s=r.get(a.path),i=s&&s.expiresAt>Date.now()?s.url:null;return Ee(a.mime)?i?`<a class="chat-attachment-image-link" href="${u(i)}" target="_blank" rel="noopener">
                 <img class="chat-attachment-image" src="${u(i)}" alt="${u(a.name)}">
               </a>`:'<div class="chat-attachment-image chat-attachment-image-loading"><i class="ti ti-photo"></i></div>':`
          <a class="chat-attachment-file" href="${i?u(i):"#"}" target="_blank" rel="noopener" data-chat-attachment-path="${u(a.path)}">
            <i class="ti ${Me(a.mime)}"></i>
            <span class="chat-attachment-file-copy">
              <strong>${u(a.name)}</strong>
              <span>${u(gn(a.size))}</span>
            </span>
            <i class="ti ti-download"></i>
          </a>
        `}function Ut(a){return a.attachments?.length?`<div class="chat-message-attachments">${a.attachments.map(Pt).join("")}</div>`:""}async function Ft(){const a=new Set;for(const i of t.messages)for(const d of i.attachments||[])a.add(d.path);let s=!1;for(const i of a){const d=r.get(i);if(!(d&&d.expiresAt>Date.now()||l.has(i))){l.add(i);try{const h=await n.service.getSignedAttachmentUrl(i);r.set(i,{url:h,expiresAt:Date.now()+3300*1e3}),s=!0}catch(h){console.error("Failed to sign chat attachment URL",h)}finally{l.delete(i)}}}s&&!c&&g()}function xt(a){return`
          <form class="chat-edit-form" data-chat-edit-form="${u(a.id)}">
            <input data-chat-edit-input="${u(a.id)}" type="text" value="${u(t.editDraft)}">
            <button type="submit" aria-label="Save edit"><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
          </form>
        `}function Bt(a){const s=u(a.body),i=t.conversations.find(_=>_.id===a.conversation_id)||t.conversations.find(_=>_.id===t.selectedConversationId)||null,d=C(i),h=fn(a.body,d);if(!h.length)return s;const S=new Set(d.filter(_=>_.id===n.currentUser.id).map(_=>String(_.full_name)));let k=s;for(const _ of h){const q=`@${u(_)}`,E=S.has(_)?"chat-mention chat-mention-self":"chat-mention";k=k.split(q).join(`<span class="${E}">${q}</span>`)}return k}function Ht(a,s=!0){const i=a.sender_id===n.currentUser.id?" mine":"",d=!!a.deleted_at,h=i&&!d,S=!d&&(i||qt()),k=a.edited_at&&!d?'<span class="chat-edited">(edited)</span>':"",_=d?"":`
            <button type="button" data-chat-reply="${u(a.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${h?`<button type="button" data-chat-edit="${u(a.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
            ${S?`<button type="button" data-chat-delete="${u(a.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>`:""}
        `,q=d?"":`
          <div class="chat-message-actions" aria-label="Message actions">
            ${_}
          </div>
          <button type="button" class="chat-message-menu-btn" data-chat-message-menu="${u(a.id)}" aria-label="Message actions"><i class="ti ti-dots"></i></button>
          ${t.openMessageMenuId===a.id?`
            <div class="chat-message-menu" data-chat-message-menu-panel="${u(a.id)}">
              ${_}
            </div>
          `:""}
          ${t.confirmingDeleteMessageId===a.id?`
            <div class="chat-delete-confirm">
              <span>Delete message?</span>
              <button type="button" data-chat-confirm-delete="${u(a.id)}">Confirm</button>
              <button type="button" data-chat-cancel-delete="${u(a.id)}">Cancel</button>
            </div>
          `:""}
        `;return`
          <div class="chat-message${i}${d?" deleted":""}${s?"":" chat-message-grouped"}" tabindex="0" data-chat-message-id="${u(a.id)}">
            ${s?`
              <div class="chat-message-meta">
                <span>${u(a.sender?.full_name||"Unknown")}</span>
                <span>#${a.message_seq} ${k}</span>
              </div>
            `:""}
            ${Rt(a)}
            ${t.editingMessageId===a.id?xt(a):`
              ${a.body.trim()?`<div class="chat-message-body">${d?u("Message deleted"):Bt(a)}</div>`:""}
              ${d?"":Ut(a)}
            `}
            ${q}
          </div>
        `}function g(){const a=b||I();b=!1;const s=t.conversations.find(o=>o.id===t.selectedConversationId)||null,i=t.profiles.filter(o=>o.id!==n.currentUser.id),h=s?.members.find(o=>o.user_id===n.currentUser.id)?.notification_level==="muted",S=s?.members.filter(o=>!o.left_at)||[],k=s?we(s):!1,_=s?it(s):!1;e.innerHTML=`
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <div class="chat-sidebar-tools">
                  <span class="chat-user-pill">${u(H(n.currentUser.role))}</span>
                  <button type="button" class="chat-icon-btn${t.searchOpen?" active":""}" data-chat-search-toggle aria-label="Search messages" title="Search messages"><i class="ti ti-search"></i></button>
                  <button type="button" class="chat-icon-btn" data-chat-compose-toggle aria-label="New conversation" title="New conversation"><i class="ti ti-pencil-plus"></i></button>
                </div>
              </div>
              ${t.searchOpen?Tt():`
                ${Lt(i)}
                <div class="chat-conversation-list">
                  ${t.loading?'<div class="chat-muted">Loading...</div>':""}
                  ${t.conversations.map(Ct).join("")}
                  ${!t.loading&&!t.conversations.length?'<div class="chat-muted">No conversations yet.</div>':""}
                </div>
              `}
            </aside>
            <main class="chat-thread">
              ${t.error?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${u(t.error)}</span></div>`:""}
              ${s?`
                <header class="chat-thread-head">
                  <button type="button" class="chat-back-btn" data-chat-back aria-label="Back to conversations"><i class="ti ti-arrow-left"></i></button>
                  <div>
                    <div class="chat-eyebrow">${s.kind==="dm"?"Direct message":"Group"}</div>
                    ${t.renameOpen?`
                      <form class="chat-rename-form" data-chat-rename-form>
                        <input data-chat-rename-input type="text" value="${u(t.renameDraft)}" placeholder="Group name">
                        <button type="submit" aria-label="Save name"><i class="ti ti-check"></i></button>
                        <button type="button" data-chat-rename-cancel aria-label="Cancel rename"><i class="ti ti-x"></i></button>
                      </form>
                    `:`<h2>${u(oe(s,n.currentUser.id))}</h2>`}
                  </div>
                  <div class="chat-thread-tools">
                    ${s.kind==="group"?`
                      <button type="button" class="chat-icon-btn${t.membersOpen?" active":""}" data-chat-members-toggle aria-label="Manage members" title="Manage members">
                        <i class="ti ti-users"></i>
                      </button>
                    `:""}
                    ${s.kind==="group"&&k?`
                      <button type="button" class="chat-icon-btn" data-chat-rename-toggle aria-label="Rename group" title="Rename group">
                        <i class="ti ti-edit"></i>
                      </button>
                    `:""}
                    ${_?`
                      <button type="button" class="chat-icon-btn" data-chat-archive-toggle aria-label="Archive conversation" title="Archive conversation">
                        <i class="ti ti-archive"></i>
                      </button>
                    `:""}
                    <button type="button" class="chat-icon-btn${h?" active":""}" data-chat-toggle-mute aria-label="${h?"Unmute conversation":"Mute conversation"}" title="${h?"Unmute conversation":"Mute conversation"}">
                      <i class="ti ${h?"ti-bell-off":"ti-bell"}"></i>
                    </button>
                    <div class="chat-member-stack">
                      ${S.map(o=>`<span title="${u(o.profile?.full_name||o.user_id)}">${u((o.profile?.full_name||"?").slice(0,1))}</span>`).join("")}
                    </div>
                  </div>
                  ${Dt(s)}
                  ${t.archiveConfirmOpen?`
                    <div class="chat-delete-confirm chat-archive-confirm">
                      <span>Archive this ${s.kind==="group"?"group":"conversation"}?</span>
                      <button type="button" data-chat-confirm-archive>Confirm</button>
                      <button type="button" data-chat-cancel-archive>Cancel</button>
                    </div>
                  `:""}
                </header>
                <div class="chat-message-list">
                  ${t.messages.map((o,w)=>Ht(o,_n(o,t.messages[w-1]))).join("")}
                  ${t.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  ${Ot()}
                  ${Nt()}
                  ${At(s)}
                  <input type="file" data-chat-file-input multiple accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" hidden>
                  <button type="button" class="chat-attach-btn" data-chat-attach-toggle aria-label="Attach a file" title="Attach a file">
                    <i class="ti ti-paperclip"></i>
                  </button>
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
        `,e.querySelectorAll("[data-chat-select]").forEach(o=>{o.addEventListener("click",()=>Q(o.dataset.chatSelect))}),e.querySelector("[data-chat-back]")?.addEventListener("click",()=>be()),e.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{s&&gt(s)}),e.querySelector("[data-chat-members-toggle]")?.addEventListener("click",()=>{s&&(t.membersOpen?K():ot())}),e.querySelector("[data-chat-members-close]")?.addEventListener("click",()=>K({reset:!0})),e.querySelector("[data-chat-rename-toggle]")?.addEventListener("click",()=>{s&&vt(s)}),e.querySelector("[data-chat-rename-cancel]")?.addEventListener("click",()=>_t()),e.querySelector("[data-chat-rename-form]")?.addEventListener("submit",o=>{o.preventDefault(),s&&bt(s,t.renameDraft)}),e.querySelector("[data-chat-rename-input]")?.addEventListener("input",o=>{t.renameDraft=o.currentTarget.value}),e.querySelector("[data-chat-archive-toggle]")?.addEventListener("click",()=>yt()),e.querySelector("[data-chat-confirm-archive]")?.addEventListener("click",()=>{s&&St(s,!0)}),e.querySelector("[data-chat-cancel-archive]")?.addEventListener("click",()=>wt()),e.querySelector("[data-chat-member-add-toggle]")?.addEventListener("click",()=>ct()),e.querySelector("[data-chat-member-search]")?.addEventListener("input",o=>{t.memberSearch=o.currentTarget.value,g();const w=e.querySelector("[data-chat-member-search]");w?.focus(),w?.setSelectionRange?.(w.value.length,w.value.length)}),e.querySelectorAll("[data-chat-member-pick]").forEach(o=>{o.addEventListener("change",()=>lt(o.dataset.chatMemberPick,o.checked))}),e.querySelector("[data-chat-add-members]")?.addEventListener("click",o=>{dt(o.currentTarget.dataset.chatAddMembers)}),e.querySelectorAll("[data-chat-remove-member]").forEach(o=>{o.addEventListener("click",()=>{s&&ut(s.id,o.dataset.chatRemoveMember)})}),e.querySelectorAll("[data-chat-promote-member]").forEach(o=>{o.addEventListener("click",()=>{s&&$t(s.id,o.dataset.chatPromoteMember,o.dataset.chatRole)})}),e.querySelector("[data-chat-search-toggle]")?.addEventListener("click",()=>{t.searchOpen?ie():tt()}),e.querySelector("[data-chat-search-close]")?.addEventListener("click",()=>ie()),e.querySelector("[data-chat-search-input]")?.addEventListener("input",o=>{at(o.currentTarget.value),g();const w=e.querySelector("[data-chat-search-input]");w?.focus(),w?.setSelectionRange?.(w.value.length,w.value.length)}),e.querySelectorAll("[data-chat-search-result]").forEach(o=>{o.addEventListener("click",()=>{st(o.dataset.chatSearchResult,o.dataset.chatSearchMessage)})}),e.querySelector("[data-chat-compose-toggle]")?.addEventListener("click",()=>{t.composeOpen?Y():et()}),e.querySelector("[data-chat-compose-close]")?.addEventListener("click",()=>Y()),e.querySelector("[data-chat-compose-search]")?.addEventListener("input",o=>{t.composeSearch=o.currentTarget.value,g();const w=e.querySelector("[data-chat-compose-search]");w?.focus(),w?.setSelectionRange?.(w.value.length,w.value.length)}),e.querySelectorAll("[data-chat-compose-member]").forEach(o=>{o.addEventListener("change",()=>rt(o.dataset.chatComposeMember,o.checked))}),e.querySelector("[data-chat-group-title]")?.addEventListener("input",o=>{t.composeGroupTitle=o.currentTarget.value,g();const w=e.querySelector("[data-chat-group-title]");w?.focus(),w?.setSelectionRange?.(w.value.length,w.value.length)}),e.querySelector("[data-chat-start-dm]")?.addEventListener("click",o=>{kt(o.currentTarget.dataset.chatStartDm)}),e.querySelector("[data-chat-create-group]")?.addEventListener("click",()=>{Et(t.composeGroupTitle,[...t.composeSelectedMemberIds])});const q=e.querySelector("[data-chat-send-form]");q?.addEventListener("submit",o=>{o.preventDefault(),Je(o.currentTarget)});const E=e.querySelector("[data-chat-composer]");E?.addEventListener("input",()=>{if(v(E),!B(E))return;const{value:o,selectionStart:w}=E;g();const N=e.querySelector("[data-chat-composer]");N&&(N.value=o,v(N),N.focus(),N.setSelectionRange?.(w,w))}),E?.addEventListener("keydown",o=>{if(t.mentionQuery!==null&&s){const w=y(s);if(w.length){if(o.key==="ArrowDown"){o.preventDefault(),ge(s,1);return}if(o.key==="ArrowUp"){o.preventDefault(),ge(s,-1);return}if(o.key==="Enter"||o.key==="Tab"){o.preventDefault(),V(s,w[Math.min(t.mentionIndex,w.length-1)]);return}}if(o.key==="Escape"){o.preventDefault(),x();return}}o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),q?.requestSubmit())}),e.querySelectorAll("[data-chat-mention-pick]").forEach(o=>{o.addEventListener("mousedown",w=>{w.preventDefault();const N=C(s).find(jt=>jt.id===o.dataset.chatMentionPick);N&&V(s,N)})}),e.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>Ze()),e.querySelectorAll("[data-chat-reply]").forEach(o=>{o.addEventListener("click",()=>Xe(o.dataset.chatReply))}),e.querySelectorAll("[data-chat-edit]").forEach(o=>{o.addEventListener("click",()=>mt(o.dataset.chatEdit))}),e.querySelectorAll("[data-chat-delete]").forEach(o=>{o.addEventListener("click",()=>{t.confirmingDeleteMessageId=o.dataset.chatDelete,t.openMessageMenuId=null,g()})}),e.querySelectorAll("[data-chat-message-menu]").forEach(o=>{o.addEventListener("click",()=>{t.openMessageMenuId=t.openMessageMenuId===o.dataset.chatMessageMenu?null:o.dataset.chatMessageMenu,t.confirmingDeleteMessageId=null,g()})}),e.querySelectorAll("[data-chat-confirm-delete]").forEach(o=>{o.addEventListener("click",()=>ht(o.dataset.chatConfirmDelete))}),e.querySelectorAll("[data-chat-cancel-delete]").forEach(o=>{o.addEventListener("click",()=>{t.confirmingDeleteMessageId===o.dataset.chatCancelDelete&&(t.confirmingDeleteMessageId=null),g()})}),e.querySelectorAll("[data-chat-edit-form]").forEach(o=>{o.addEventListener("submit",w=>{w.preventDefault(),pt(w.currentTarget)})}),e.querySelectorAll("[data-chat-cancel-edit]").forEach(o=>{o.addEventListener("click",()=>ft())});const J=e.querySelector("[data-chat-file-input]");e.querySelector("[data-chat-attach-toggle]")?.addEventListener("click",()=>J?.click()),J?.addEventListener("change",o=>{re(o.currentTarget.files),o.currentTarget.value=""}),e.querySelectorAll("[data-chat-remove-pending]").forEach(o=>{o.addEventListener("click",()=>Ke(o.dataset.chatRemovePending))});const $e=e.querySelector("[data-chat-send-form]");$e?.addEventListener("dragover",o=>o.preventDefault()),$e?.addEventListener("drop",o=>{o.preventDefault(),o.dataTransfer?.files?.length&&re(o.dataTransfer.files)}),E?.addEventListener("paste",o=>{const w=[...o.clipboardData?.files||[]];w.length&&re(w)}),a&&L(),Ft()}return D(),p=setInterval(()=>D(),3e4),typeof n.service.subscribeToConversationEvents=="function"&&(M=n.service.subscribeToConversationEvents(()=>Mt())),()=>{c=!0,p&&clearInterval(p),f&&clearTimeout(f),M&&M(),e.removeEventListener?.("click",ve),typeof document<"u"&&(document.removeEventListener("keydown",_e),document.body?.classList.remove("wein-chat-root")),e.classList.remove("wein-chat-root"),e.classList.remove("chat-has-selection"),e.innerHTML=""}}}}const Ie="chat-attachments",Te=5;function We(e){return String(e||"file").replace(/[^a-zA-Z0-9._-]+/g,"_")}function yn(e,n){const t=`${Date.now().toString(36)}-${Math.random().toString(16).slice(2,8)}`;return`${e}/${t}-${We(n)}`}function wn(e){return String(e).replace(/[\\%_]/g,n=>`\\${n}`)}function P(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data||[]}function j(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data}function fe(e){return e?{id:e.id,full_name:e.full_name,role:e.role,email:e.email??null}:null}function Sn(e){return{conversation_id:e.conversation_id,user_id:e.user_id,membership_role:e.membership_role,joined_at:e.joined_at,left_at:e.left_at,last_read_seq:Number(e.last_read_seq||0),notification_level:e.notification_level,profile:fe(e.profile||e.profiles)}}function F(e){return{id:e.id,conversation_id:e.conversation_id,message_seq:Number(e.message_seq||0),sender_id:e.sender_id,body:e.body,reply_to_id:e.reply_to_id,client_nonce:e.client_nonce,created_at:e.created_at,edited_at:e.edited_at,deleted_at:e.deleted_at,mentioned_user_ids:e.mentioned_user_ids||[],attachments:e.attachments||[],sender:fe(e.sender||e.profiles)}}function qe(e,n){const t=(e.members||e.wein_chat_members||[]).map(Sn),r=e.last_message||e.wein_chat_messages||[],l=Array.isArray(r)?r.find(p=>p.deleted_at==null):null,c=l?F(l):null,m={id:e.id,kind:e.kind,title:e.title,created_by:e.created_by,created_at:e.created_at,archived_at:e.archived_at,members:t,last_message:c,unread_count:0};return m.unread_count=ln(m,n),m}function ze({supabase:e,currentUserId:n}){if(!e)throw new Error("supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(r){const l=await e.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",r).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(Te,{referencedTable:"wein_chat_messages"}).single();if(l.error)throw new Error(`fetch conversation: ${l.error.message||l.error}`);return qe(l.data,n)}return{async listProfiles(){const r=await e.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return P(r,"list profiles").map(fe)},async listConversations(){const r=await e.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(Te,{referencedTable:"wein_chat_messages"});return P(r,"list conversations").map(l=>qe(l,n))},async listMessages(r){const l=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",r).is("deleted_at",null).order("message_seq",{ascending:!0});return P(l,"list messages").map(F)},async searchMessages(r){const l=(r||"").trim();if(!l)return[];const c=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).is("deleted_at",null).ilike("body",`%${wn(l)}%`).order("created_at",{ascending:!1}).limit(50);return P(c,"search messages").map(F)},async createGroup(r,l=[]){const c=j(await e.rpc("wein_chat_create_group",{p_title:r}),"create group");for(const m of l)await this.addMember(c,m);return c},async getOrCreateDm(r){return j(await e.rpc("wein_chat_get_or_create_dm",{p_other_user_id:r}),"get or create DM")},async addMember(r,l){j(await e.rpc("wein_chat_add_member",{p_conversation_id:r,p_user_id:l}),"add member")},async removeMember(r,l){j(await e.rpc("wein_chat_remove_member",{p_conversation_id:r,p_user_id:l}),"remove member")},async renameConversation(r,l){const c=(l||"").trim();if(!c)throw new Error("Group title is required");const m=await e.from("wein_chat_conversations").update({title:c}).eq("id",r).select("id, title");if(!P(m,"rename conversation").length)throw new Error("rename conversation affected zero rows")},async setConversationArchived(r,l){const c=await e.from("wein_chat_conversations").update({archived_at:l?new Date().toISOString():null}).eq("id",r).select("id, archived_at");if(!P(c,"set conversation archived").length)throw new Error("set conversation archived affected zero rows")},async setMembershipRole(r,l,c){j(await e.rpc("wein_chat_set_membership_role",{p_conversation_id:r,p_user_id:l,p_role:c}),"set membership role")},async uploadAttachment(r,l){const c=yn(r,l.name),m=await e.storage.from(Ie).upload(c,l,{contentType:l.type||"application/octet-stream",upsert:!1});if(m.error)throw new Error(`upload attachment: ${m.error.message||m.error}`);return{path:c,name:l.name||We(l.name),mime:l.type||"application/octet-stream",size:l.size||0}},async getSignedAttachmentUrl(r,l=3600){const c=await e.storage.from(Ie).createSignedUrl(r,l);if(c.error)throw new Error(`sign attachment url: ${c.error.message||c.error}`);const m=c.data?.signedUrl;if(!m)throw new Error("sign attachment url: no signed URL returned");return m},async sendMessage({conversationId:r,body:l,clientNonce:c,replyToId:m=null,mentionedUserIds:p=[],attachments:M=[]}){const b=await e.from("wein_chat_messages").insert({conversation_id:r,sender_id:n,body:l,client_nonce:c,reply_to_id:m,mentioned_user_ids:p.length?p:null,attachments:M}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(b.error)throw new Error(`send message: ${b.error.message||b.error}`);return F(b.data)},async updateMessage(r,l,c=[]){const m=await e.from("wein_chat_messages").update({body:l,edited_at:new Date().toISOString(),mentioned_user_ids:c.length?c:null}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(m.error)throw new Error(`update message: ${m.error.message||m.error}`);return F(m.data)},async deleteMessage(r){const l=await e.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(l.error)throw new Error(`delete message: ${l.error.message||l.error}`);return F(l.data)},async markRead(r,l){const c=await e.from("wein_chat_members").update({last_read_seq:l}).eq("conversation_id",r).eq("user_id",n).select("conversation_id, user_id, last_read_seq");if(!P(c,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(r,l){const c=await e.from("wein_chat_members").update({notification_level:l}).eq("conversation_id",r).eq("user_id",n).select("conversation_id, user_id, notification_level");if(!P(c,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(r){if(typeof e.channel!="function")return()=>{};const l=e.channel(`wein-chat:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},r).subscribe();return()=>{typeof e.removeChannel=="function"?e.removeChannel(l):typeof l.unsubscribe=="function"&&l.unsubscribe()}},fetchConversation:t}}function $n(e){return typeof e.session.user=="object"&&e.session.user!==null?e.session.user:{}}function kn(e){const n=$n(e),t=n.id;if(!t)throw new Error("Team chat requires an authenticated user id.");return{id:t,full_name:e.session.fullName||n.email||"Portal user",role:e.session.role||"team",email:n.email||null}}let ce=null;function En(e){ce=e||null}function Mn(){const e=bn();se({id:"team-chat",mount(n,t){const r=ce;ce=null;const l=kn(t),c=ze({supabase:t.session.client,currentUserId:l.id});return e.mount(n,{currentUser:l,service:c,initialConversationId:r})}})}function Cn(e=[]){return e.reduce((n,t)=>{const r=Number(t?.unread_count);return n+(Number.isFinite(r)&&r>0?r:0)},0)}function In(e,n){const t=String(e??"");return n>0?`(${n}) ${t}`:t}function Tn(e,n={}){return e?e.author_id&&n[e.author_id]?.full_name?n[e.author_id].full_name:e.author_name||"Unknown":"Unknown"}function Ge(e){return!!e?.resolved_at}function qn(e=[]){const n=new Map,t=[];e.forEach(c=>{n.set(c.id,{...c,replies:[]})}),n.forEach(c=>{c.reply_to_id&&n.has(c.reply_to_id)?n.get(c.reply_to_id).replies.push(c):t.push(c)});const r=(c,m)=>String(c.created_at||"").localeCompare(String(m.created_at||"")),l=c=>{c.replies.sort(r),c.replies.forEach(l)};return t.sort(r),t.forEach(l),t}function Ln(e=[]){return e.filter(n=>!Ge(n)).length}function Le(e,n=90){const t=String(e?.body||"").replace(/\s+/g," ").trim();return t.length<=n?t:`${t.slice(0,Math.max(0,n-1)).trimEnd()}…`}function A(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function Ae(e={}){return e.taskId?"Task discussion":e.providerId?"Provider discussion":e.offerId?"Offer discussion":"Record discussion"}function An(e={}){return e.taskId?`Task ${e.taskId}`:e.providerId?`Provider ${e.providerId}`:e.offerId?`Offer ${e.offerId}`:"No record scope"}function Dn(){return{id:"record-discussion",mount(e,n){const t={comments:[],peopleById:Object.fromEntries((n.people||[]).map(v=>[v.id,v])),loading:!0,error:null,replyToId:null,taskSourceCommentId:null};let r=!1,l=null,c=null;e.classList.add("wein-discussion-root");async function m(){try{t.error=null,t.comments=await n.service.listComments(n.scope||{})}catch(v){t.error=v.message||String(v)}finally{t.loading=!1,r||L()}}async function p(v){const C=v.querySelector("[data-discussion-body]"),y=C.value.trim();y&&(C.value="",await n.service.postComment({...n.scope||{},body:y,replyToId:t.replyToId,people:n.people||[]}),t.replyToId=null,await m())}async function M(v){const C=e.querySelector(`[data-resolve-note="${CSS.escape(v)}"]`)?.value||"";await n.service.resolveComment(v,C),await m()}async function b(v){await n.service.reopenComment(v),await m()}async function f(v){const C=v.querySelector("[data-task-title]"),y=C.value.trim();!y||!t.taskSourceCommentId||(await n.service.createTaskFromComment(t.taskSourceCommentId,y,n.currentUser?.id||null),C.value="",t.taskSourceCommentId=null,await m())}function $(v,C=0){const y=Ge(v),x=Tn(v,t.peopleById);return`
          <article class="discussion-comment${y?" resolved":""}" style="--depth:${Math.min(C,4)}">
            <div class="discussion-comment-meta">
              <span>${A(x)}</span>
              <span>${A(v.created_at||"")}</span>
              ${y?'<span class="discussion-resolved-pill">Resolved</span>':""}
            </div>
            <div class="discussion-comment-body">${A(v.body)}</div>
            ${v.resolved_note?`<div class="discussion-resolved-note">${A(v.resolved_note)}</div>`:""}
            <div class="discussion-actions">
              <button type="button" data-discussion-reply="${A(v.id)}">Reply</button>
              ${y?`<button type="button" data-discussion-reopen="${A(v.id)}">Reopen</button>`:`<button type="button" data-discussion-resolve="${A(v.id)}">Resolve</button>`}
              <button type="button" data-discussion-task="${A(v.id)}">Create task</button>
            </div>
            ${y?"":`<input class="discussion-resolve-note" data-resolve-note="${A(v.id)}" placeholder="Optional resolve note">`}
            ${v.replies?.length?`<div class="discussion-replies">${v.replies.map(B=>$(B,C+1)).join("")}</div>`:""}
          </article>
        `}function I(){if(!t.taskSourceCommentId)return"";const v=t.comments.find(C=>C.id===t.taskSourceCommentId);return`
          <form class="discussion-task-box" data-discussion-task-form>
            <div>
              <div class="discussion-eyebrow">Create task from comment</div>
              <p>${A(Le(v))}</p>
            </div>
            <input data-task-title type="text" placeholder="Task title">
            <div class="discussion-task-actions">
              <button type="submit">Create task</button>
              <button type="button" data-discussion-task-cancel>Cancel</button>
            </div>
          </form>
        `}function L(){const v=qn(t.comments),C=t.replyToId?t.comments.find(y=>y.id===t.replyToId):null;e.innerHTML=`
          <section class="discussion-shell" aria-label="${A(Ae(n.scope))}">
            <header class="discussion-header">
              <div>
                <div class="discussion-eyebrow">${A(Ae(n.scope))}</div>
                <h2>Discussion</h2>
                <p>${A(An(n.scope))}</p>
              </div>
              <span class="discussion-count">${Ln(t.comments)} unresolved</span>
            </header>
            ${t.error?`<div class="discussion-error">${A(t.error)}</div>`:""}
            ${I()}
            <div class="discussion-list">
              ${t.loading?'<div class="discussion-muted">Loading discussion...</div>':""}
              ${v.map(y=>$(y)).join("")}
              ${!t.loading&&!v.length?'<div class="discussion-muted">No comments yet.</div>':""}
            </div>
            <form class="discussion-composer" data-discussion-form>
              ${C?`
                <div class="discussion-replying">
                  Replying to: ${A(Le(C,70))}
                  <button type="button" data-discussion-cancel-reply>Cancel</button>
                </div>
              `:""}
              <textarea data-discussion-body rows="3" placeholder="Write a record-attached note..."></textarea>
              <button type="submit">${C?"Reply":"Post comment"}</button>
            </form>
          </section>
        `,e.querySelector("[data-discussion-form]")?.addEventListener("submit",y=>{y.preventDefault(),p(y.currentTarget)}),e.querySelector("[data-discussion-cancel-reply]")?.addEventListener("click",()=>{t.replyToId=null,L()}),e.querySelector("[data-discussion-task-cancel]")?.addEventListener("click",()=>{t.taskSourceCommentId=null,L()}),e.querySelector("[data-discussion-task-form]")?.addEventListener("submit",y=>{y.preventDefault(),f(y.currentTarget)}),e.querySelectorAll("[data-discussion-reply]").forEach(y=>{y.addEventListener("click",()=>{t.replyToId=y.dataset.discussionReply,L()})}),e.querySelectorAll("[data-discussion-resolve]").forEach(y=>{y.addEventListener("click",()=>M(y.dataset.discussionResolve))}),e.querySelectorAll("[data-discussion-reopen]").forEach(y=>{y.addEventListener("click",()=>b(y.dataset.discussionReopen))}),e.querySelectorAll("[data-discussion-task]").forEach(y=>{y.addEventListener("click",()=>{t.taskSourceCommentId=y.dataset.discussionTask,L()})})}return m(),l=setInterval(()=>m(),3e4),typeof n.service.subscribeToDiscussionEvents=="function"&&(c=n.service.subscribeToDiscussionEvents(()=>m())),()=>{r=!0,l&&clearInterval(l),c&&c(),e.classList.remove("wein-discussion-root"),e.innerHTML=""}}}}function U(e){if(e)throw e}function Rn({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t({taskId:b,providerId:f,offerId:$}={}){let I=e.from("wein_comments").select("*").order("created_at",{ascending:!0});b&&(I=I.eq("task_id",b)),f&&(I=I.eq("provider_id",f)),$&&(I=I.eq("offer_id",$));const{data:L,error:v}=await I;return U(v),L||[]}async function r({body:b,taskId:f=null,providerId:$=null,offerId:I=null,replyToId:L=null,people:v=[]}){const C=f?{task_id:f}:$?{provider_id:$}:I?{offer_id:I}:null;if(!C)throw new Error("postComment requires taskId, providerId, or offerId");const{data:y,error:x}=await e.from("wein_comments").insert({...C,reply_to_id:L,body:b,author_role:"team"}).select("*").single();U(x);for(const B of ee(b,v))try{await m(y.id,B)}catch(V){console.error("Failed to record comment mention",V)}return y}async function l(b,f=""){const{data:$,error:I}=await e.from("wein_comments").update({resolved_at:new Date().toISOString(),resolved_note:f}).eq("id",b).select("*");if(U(I),!$?.length)throw new Error("Resolve affected zero comments");return $[0]}async function c(b){const{data:f,error:$}=await e.from("wein_comments").update({resolved_at:null,resolved_note:null}).eq("id",b).select("*");if(U($),!f?.length)throw new Error("Reopen affected zero comments");return f[0]}async function m(b,f){const{data:$,error:I}=await e.from("wein_comment_mentions").insert({comment_id:b,mentioned_user_id:f}).select("*");return U(I),$?.[0]||null}async function p(b,f,$=null,I=null){const{data:L,error:v}=await e.rpc("wein_create_task_from_comment",{p_comment_id:b,p_title:f,p_assigned_to_user_id:$,p_due_date:I});return U(v),L}function M(b){if(!e.channel)return()=>{};const f=e.channel(`record-discussion:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},b).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},b).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_task_links"},b).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(f);if(f?.unsubscribe)return f.unsubscribe()}}return{listComments:t,postComment:r,resolveComment:l,reopenComment:c,addMention:m,createTaskFromComment:p,subscribeToDiscussionEvents:M}}function R(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}const On={critical:"Critical",high:"High",medium:"Medium",low:"Low"},Nn={task:"Task",mention:"Mention",discussion:"Discussion",review:"Review"};function Pn(e){if(!e)return"No due date";const n=new Date(e);return Number.isNaN(n.getTime())?String(e):n.toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function Un(e=[]){return["critical","high","medium","low"].map(n=>({severity:n,items:e.filter(t=>t.severity===n)})).filter(n=>n.items.length)}function Fn(){return{id:"work-inbox",mount(e,n){const t={items:[],loading:!0,error:null};let r=!1,l=null,c=null;e.classList.add("wein-work-inbox-root");async function m(){try{t.error=null,t.items=await n.service.loadInbox()}catch(f){t.error=f.message||String(f)}finally{t.loading=!1,r||b()}}function p(f){if(typeof n.onSelectItem=="function"){n.onSelectItem(f);return}f.href&&(window.location.hash=f.href)}function M(f){return`
          <button type="button" class="work-inbox-item severity-${R(f.severity)}" data-inbox-item="${R(f.kind)}:${R(f.entity_id)}:${R(f.reason_code)}">
            <span class="work-inbox-kind">${R(Nn[f.kind]||f.kind)}</span>
            <span class="work-inbox-title">${R(f.title)}</span>
            <span class="work-inbox-reason">${R(f.reason_code.replaceAll("_"," "))}</span>
            <span class="work-inbox-due">${R(Pn(f.due_at))}</span>
            <span class="work-inbox-action">${R(f.next_action)}</span>
          </button>
        `}function b(){const f=Un(t.items);e.innerHTML=`
          <section class="work-inbox-shell" aria-label="Work inbox">
            <header class="work-inbox-header">
              <div>
                <div class="work-inbox-eyebrow">Today extension</div>
                <h2>Work inbox</h2>
                <p>Normalized tasks, mentions, discussion replies, and review signals.</p>
              </div>
              <div class="work-inbox-total">${t.items.length} item${t.items.length===1?"":"s"}</div>
            </header>
            ${t.error?`<div class="work-inbox-error">${R(t.error)}</div>`:""}
            <div class="work-inbox-toolbar">
              <button type="button" data-inbox-refresh>Refresh</button>
            </div>
            <div class="work-inbox-list">
              ${t.loading?'<div class="work-inbox-muted">Loading inbox...</div>':""}
              ${f.map($=>`
                <section class="work-inbox-group">
                  <h3>${R(On[$.severity])}</h3>
                  ${$.items.map(M).join("")}
                </section>
              `).join("")}
              ${!t.loading&&!t.items.length?'<div class="work-inbox-muted">No attention items right now.</div>':""}
            </div>
          </section>
        `,e.querySelector("[data-inbox-refresh]")?.addEventListener("click",()=>m()),e.querySelectorAll("[data-inbox-item]").forEach($=>{$.addEventListener("click",()=>{const I=$.dataset.inboxItem,L=t.items.find(v=>`${v.kind}:${v.entity_id}:${v.reason_code}`===I);L&&p(L)})})}return m(),l=setInterval(()=>m(),6e4),typeof n.service.subscribeToInboxEvents=="function"&&(c=n.service.subscribeToInboxEvents(()=>m())),()=>{r=!0,l&&clearInterval(l),c&&c(),e.classList.remove("wein-work-inbox-root"),e.innerHTML=""}}}}const De={critical:0,high:1,medium:2,low:3};function pe(e,n=new Date){if(!e)return"low";const t=new Date(e);if(Number.isNaN(t.getTime()))return"low";const r=t.getTime()-n.getTime();return r<0?"critical":r<=1440*60*1e3?"high":r<=4320*60*1e3?"medium":"low"}function xn(e,{now:n=new Date}={}){return{kind:"task",entity_id:e.id,title:e.title||"Untitled task",reason_code:e.due_date?"task_due":"task_open",severity:pe(e.due_date,n),owner_id:e.assigned_to_user_id||e.owner_id||null,due_at:e.due_date||null,next_action:"Open task",href:`#tasks/${e.id}`,source:e}}function Bn(e,{comment:n,currentUserId:t}={}){return{kind:"mention",entity_id:e.comment_id,title:n?.body?`Mention: ${n.body}`:"Mention in discussion",reason_code:"unresolved_mention",severity:n?.resolved_at?"low":"high",owner_id:t||e.mentioned_user_id,due_at:n?.created_at||e.created_at||null,next_action:"Reply or resolve",href:`#comments/${e.comment_id}`,source:{mention:e,comment:n}}}function Hn(e,{currentUserId:n,now:t=new Date}={}){return{kind:"discussion",entity_id:e.id,title:e.body||"Discussion awaiting reply",reason_code:"thread_awaiting_reply",severity:pe(e.next_reply_due_at||e.created_at,t),owner_id:n||null,due_at:e.next_reply_due_at||null,next_action:"Reply in thread",href:`#comments/${e.id}`,source:e}}function jn(e,{now:n=new Date}={}){return{kind:e.kind||"review",entity_id:e.id,title:e.title||e.offer_title||"Founder review needed",reason_code:e.reason_code||"founder_review",severity:pe(e.due_at||e.created_at,n),owner_id:e.owner_id||null,due_at:e.due_at||e.created_at||null,next_action:"Review",href:e.href||`#review/${e.id}`,source:e}}function Wn(e=[]){return[...e].sort((n,t)=>{const r=(De[n.severity]??9)-(De[t.severity]??9);return r||String(n.due_at||"").localeCompare(String(t.due_at||""))})}function zn(e=[]){const n=new Set;return e.filter(t=>{const r=`${t.kind}:${t.entity_id}:${t.reason_code}`;return n.has(r)?!1:(n.add(r),!0)})}function Gn({tasks:e=[],mentions:n=[],commentsById:t={},awaitingReplies:r=[],founderReviews:l=[]},c={}){const m=[...e.map(p=>xn(p,c)),...n.map(p=>Bn(p,{...c,comment:t[p.comment_id]})),...r.map(p=>Hn(p,c)),...l.map(p=>jn(p,c))];return Wn(zn(m))}function Re(e){if(e)throw e}function Vn({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(){let m=e.from("wein_tasks").select("*").neq("status","done").order("due_date",{ascending:!0,nullsFirst:!1});n&&(m=m.eq("assigned_to_user_id",n));const{data:p,error:M}=await m;return Re(M),p||[]}async function r(){const{data:m,error:p}=await e.from("wein_comment_mentions").select("comment_id,mentioned_user_id,created_at,wein_comments(*)").eq("mentioned_user_id",n).is("wein_comments.resolved_at",null).order("created_at",{ascending:!0});return Re(p),m||[]}async function l(){const[m,p]=await Promise.all([t(),r()]),M={},b=p.map(f=>{const $=f.wein_comments||f.comment||null;return $?.id&&(M[$.id]=$),{comment_id:f.comment_id,mentioned_user_id:f.mentioned_user_id,created_at:f.created_at}});return Gn({tasks:m,mentions:b,commentsById:M},{currentUserId:n})}function c(m){if(!e.channel)return()=>{};const p=e.channel(`work-inbox:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_tasks"},m).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},m).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},m).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(p);if(p?.unsubscribe)return p.unsubscribe()}}return{fetchOpenTasks:t,fetchUnresolvedMentions:r,loadInbox:l,subscribeToInboxEvents:c}}const Ve=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function Qn(e){for(const n of Ve)se({id:n,mount:()=>{e[n]()}})}function he(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const Yn=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function Kn(e,n){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${Yn.map(t=>`<button class="chip ${e===t?"active":""}" type="button" onclick="${n}('${t.replace(/'/g,"\\'")}')">${t==="all"?"All":he(t)}</button>`).join("")}</div>`}function Jn(e,n){return n==="all"||String(e||"")===n}function Xn(e){return String(e?.category||e?.vertical||"-")}function Zn(e){const n=String(e||"").toLowerCase();return n.includes("dining")?"dining":n.includes("health")?"health":n.includes("fun")?"fun":n.includes("hotel")?"hotels":""}function ea(e,n=Date.now()){return e?Math.floor((n-new Date(e).getTime())/864e5):0}function le(e=new Date){const n=new Date(e);return n.setHours(0,0,0,0),n}function ta(e,n=new Date){return e?Math.round((le(n).getTime()-le(e).getTime())/864e5):null}function Qe(e,n){let t=String(e||"").replace(/\D/g,"");if(!t)return null;t.startsWith("0")&&(t=`20${t.slice(1)}`);const r=`Hi! Following up on the WeIN offer sheet for ${n} - do you have 5 minutes today?`;return`https://wa.me/${t}?text=${encodeURIComponent(r)}`}function na(e,n){const t=Qe(e,n);return t?`<a class="mini-btn" href="${he(t)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function G(e){return e.id}function aa(e){return T("profiles").find(n=>G(n)===e)??null}function sa(e){return T("providers").find(n=>G(n)===e)??null}function ra(e){return T("leads").find(n=>G(n)===e)??null}function ia(e){return T("tasks").find(n=>G(n)===e)??null}function oa(e){return T("offers").find(n=>G(n)===e)??null}function ca(e){return T("offers").filter(n=>n.provider_id===e)}function la(e){return T("tasks").filter(n=>n.provider_id===e)}function da(e){return T("tasks").filter(n=>n.lead_id===e)}const ua=Object.freeze(Object.defineProperty({__proto__:null,leadById:ra,offerById:oa,offersForProvider:ca,profileById:aa,providerById:sa,taskById:ia,tasksForLead:da,tasksForProvider:la},Symbol.toStringTag,{value:"Module"}));function ma(){const e=document.title;let n=!1;async function t(){const l=window.WEIN?.user?.id;if(l)try{const m=await ze({supabase:te(),currentUserId:l}).listConversations(),p=Cn(m),M=document.querySelector("[data-chat-unread-badge]");M&&(M.textContent=String(p),M.style.display=p>0?"inline-flex":"none"),document.title=In(e,p)}catch{}}const r=setInterval(()=>{window.WEIN?.user?.id&&!n&&(n=!0,clearInterval(r),setInterval(t,3e4)),t()},2e3)}rn();Mn();ma();const Ye={api:Fe,auth:{canDelete:de,canManageDeals:Ne,canEditProviderProfile:Pe,navHiddenForRole:ue,defaultViewForRole:Ue},platform:{getSupabaseClient:te,getAccessToken:ae,getSessionContext:Gt},shared:{escapeHtml:he,daysSince:ea,startOfLocalDay:le,dayDiffFromToday:ta,whatsappLink:Qe,whatsappButtonHtml:na,categoryChipsHtml:Kn,matchesCategoryFilter:Jn,categoryLabel:Xn,catBadgeClass:Zn},core:{createPortalContext:tn,getView:He,mountView:sn,registeredViewIds:nn,registerView:se},legacy:{LEGACY_VIEW_IDS:Ve,registerLegacyViews:Qn},features:{requestOpenChatConversation:En,createDiscussionViewModule:Dn,createSupabaseDiscussionService:Rn,createWorkInboxViewModule:Fn,createSupabaseWorkInboxService:Vn},store:Be,selectors:ua};window.WEIN_PORTAL_MODULES=Ye;for(const e of window.WEIN_PORTAL_MODULES_READY??[])e(Ye);window.WEIN_PORTAL_MODULES_READY=[];
