function Re(e){return typeof e=="object"&&e!==null?e.role:e}function ue(e){const n=Re(e);return n==="admin"||n==="manager"}const Ne=ue;function Pe(e){const n=Re(e);return n==="admin"||n==="manager"||n==="deal_breaker"}const Vt={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function me(e){return e?Vt[e]??[]:[]}function Ue(e){return me(e).includes("pipeline")?"tasks":"pipeline"}function R(){return window.WEIN_PORTAL_LEGACY??{}}function te(){const e=R().supabaseClient;if(!e)throw new Error("Portal Supabase client is not available yet.");return e}function ne(){const e=R().getSupabaseUrl?.();if(!e)throw new Error("Portal Supabase URL is not available yet.");return e}function Qt(){const e=R().getSupabaseAnonKey?.();if(!e)throw new Error("Portal Supabase anon key is not available yet.");return e}function ae(){return R().getAccessToken?.()??null}function Yt(){return{client:te(),accessToken:ae()}}class Kt extends Error{constructor(n,t,r){super(n),this.status=t,this.body=r,this.name="PortalApiError"}status;body}function G(){const e=R().headers?.();if(e)return e;const n=Qt();return{apikey:n,Authorization:`Bearer ${ae()||n}`,"Content-Type":"application/json"}}async function he(e,n){if(e.ok)return;const t=await e.text();throw new Kt(`Supabase ${n} failed: ${e.status}${t?` ${t}`:""}`,e.status,t)}async function Jt(e){const n=R().get;if(n)return n(e);const t=await fetch(`${ne()}/rest/v1/${e}`,{headers:G()});return await he(t,"GET"),t.json()}async function Xt(e,n){const t=R().post;if(t)return t(e,n);const r=await fetch(`${ne()}/rest/v1/${e}`,{method:"POST",headers:{...G(),Prefer:"return=representation"},body:JSON.stringify(n)});return await he(r,"POST"),r.json()}async function Zt(e,n){const t=R().patch;return t?t(e,n):(await fetch(`${ne()}/rest/v1/${e}`,{method:"PATCH",headers:G(),body:JSON.stringify(n)})).ok}async function en(e){const n=R().delete;if(n)return n(e);const t=await fetch(`${ne()}/rest/v1/${e}`,{method:"DELETE",headers:G()});return await he(t,"DELETE"),!0}const Fe={headers:G,get:Jt,post:Xt,patch:Zt,delete:en},tn={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function nn(){const e=R().getCaches?.();return e?{providers:e.providers??[],offers:e.offers??[],negotiations:e.negotiations??[],files:e.files??[],leads:e.leads??[],outcomes:e.outcomes??[],tasks:e.tasks??[],profiles:e.profiles??[],redemptions:e.redemptions??[],campaigns:e.campaigns??[],calendarNotes:e.calendarNotes??[]}:tn}function L(e){return nn()[e]}function je(e,n){const t=R().setCache;if(!t)throw new Error("Portal cache bridge is not available yet.");t(e,[...n])}function an(e,n){je(e,n(L(e)))}const Be={get providers(){return L("providers")},get offers(){return L("offers")},get negotiations(){return L("negotiations")},get files(){return L("files")},get leads(){return L("leads")},get outcomes(){return L("outcomes")},get tasks(){return L("tasks")},get profiles(){return L("profiles")},get redemptions(){return L("redemptions")},get campaigns(){return L("campaigns")},get calendarNotes(){return L("calendarNotes")},getCache:L,replaceCache:je,updateCache:an};function X(){const e=window.WEIN??{};return{user:e.user,role:e.role??sessionStorage.getItem("weinRole"),fullName:e.fullName??null,accessToken:ae(),client:te()}}function sn(){const e=X();return{api:Fe,store:Be,session:e,permissions:{canDelete:()=>ue(X()),canManageDeals:()=>Ne(X()),canEditProviderProfile:()=>Pe(X()),navHiddenForRole:me,defaultViewForRole:Ue},navigate(n,t){window.showView?.(n,t)}}}const z=new Map;let Z=null;function se(e){if(!e.id)throw new Error("View id is required.");if(z.has(e.id))throw new Error(`View already registered: ${e.id}`);z.set(e.id,e)}function xe(e){return z.get(e)}function rn(){return[...z.keys()]}function on(){if(!Z)return;const e=Z;Z=null,e()}function cn(e,n,t){const r=xe(e);if(!r)throw new Error(`Unknown portal view: ${e}`);on();const l=r.mount(n,t);Z=typeof l=="function"?l:null}function ln(){z.has("__dummy_cleanup_probe")||se({id:"__dummy_cleanup_probe",mount(e){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,e.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function dn(e="chat"){const n=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${e}-${n}`}function ce(e,n){return e.kind==="group"?e.title||"Untitled group":e.kind==="channel"?e.title||"Untitled channel":(e.members||[]).map(r=>r.profile).find(r=>r&&r.id!==n)?.full_name||"Direct message"}function un(e){return[...e].sort((n,t)=>{const r=n.last_message?.created_at||n.created_at,l=t.last_message?.created_at||t.created_at;return new Date(l).getTime()-new Date(r).getTime()})}function mn(e,n){const t=(e.members||[]).find(l=>l.user_id===n),r=e.last_message?.message_seq||0;return Math.max(0,r-(t?.last_read_seq||0))}function hn(e){if(!e)return"No messages yet";const n=(e.deleted_at?"Message deleted":e.body||"").trim();return n.length>82?`${n.slice(0,79)}...`:n}const fn=/[\s\p{P}]/u,pn=/[\s\p{P}]/u;function He(e,n){return n===0?!0:fn.test(e[n-1])}function gn(e,n){return n>=e.length?!0:pn.test(e[n])}function ee(e="",n=[]){const t=String(e??"");if(!t.includes("@"))return[];const r=n.filter(p=>p&&p.id&&p.full_name).map(p=>({id:p.id,name:String(p.full_name)})).sort((p,E)=>E.name.length-p.name.length);if(!r.length)return[];const l=t.toLowerCase(),c=[],m=new Set;for(let p=0;p<t.length;p+=1){if(t[p]!=="@"||!He(t,p))continue;const E=p+1;for(const y of r){const h=E+y.name.length;if(l.startsWith(y.name.toLowerCase(),E)&&gn(t,h)){m.has(y.id)||(m.add(y.id),c.push(y.id)),p=h-1;break}}}return c}function vn(e="",n=[]){const t=new Set(ee(e,n));return n.filter(r=>r&&t.has(r.id)&&r.full_name).map(r=>String(r.full_name)).sort((r,l)=>l.length-r.length)}function _n(e="",n=0){const t=String(e??""),r=Math.max(0,Math.min(Number(n)||0,t.length)),l=40;for(let c=r-1;c>=0&&r-c<=l;c-=1){const m=t[c];if(m==="@")return He(t,c)?{query:t.slice(c+1,r),start:c}:null;if(m===`
`)return null}return null}function u(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function W(e){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[e]||e}function bn(e){return`${e}-${Math.random().toString(16).slice(2)}-${Date.now().toString(36)}`}function Ee(e){return typeof e=="string"&&e.startsWith("image/")}function yn(e){const n=Number(e)||0;return n<1024?`${n} B`:n<1024*1024?`${(n/1024).toFixed(1)} KB`:`${(n/(1024*1024)).toFixed(1)} MB`}function Me(e){return e==="application/pdf"?"ti-file-type-pdf":e?.includes("word")?"ti-file-type-doc":e?.includes("sheet")||e?.includes("excel")?"ti-file-type-xls":"ti-file"}function wn(e,n=new Date){if(!e)return"";const t=new Date(e);if(Number.isNaN(t.getTime()))return"";const r=n.getTime()-t.getTime(),l=Math.floor(r/6e4);if(l<1)return"now";if(l<60)return`${l}m`;const c=Math.floor(l/60);return c<24?`${c}h`:r<6*864e5?t.toLocaleDateString(void 0,{weekday:"short"}):t.toLocaleDateString(void 0,{month:"short",day:"numeric"})}const Sn=300*1e3;function $n(e,n){if(!n||e.sender_id!==n.sender_id)return!0;const t=new Date(e.created_at).getTime()-new Date(n.created_at).getTime();return!(t>=0&&t<Sn)}function kn(){return{id:"team-chat",mount(e,n){const t={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,composeOpen:!1,composeSearch:"",composeGroupTitle:"",composeChannelTitle:"",composeSelectedMemberIds:new Set,browseChannelsOpen:!1,browseChannelsList:[],browseChannelsLoading:!1,browseChannelsError:null,membersOpen:!1,memberAddOpen:!1,memberSearch:"",memberSelectedIds:new Set,renameOpen:!1,renameDraft:"",archiveConfirmOpen:!1,mentionQuery:null,mentionIndex:0,mentionStart:0,mentionDraft:"",pendingAttachments:[],openMessageMenuId:null,confirmingDeleteMessageId:null,searchOpen:!1,searchQuery:"",searchResults:[],searchLoading:!1,searchError:null,loading:!0,error:null},r=new Map,l=new Set;let c=!1,m=n.initialConversationId||null,p=null,E=null,y=!1,h=null,$=0;function I(){const a=e.querySelector(".chat-message-list");return a?a.scrollHeight-a.scrollTop-a.clientHeight<80:!0}function q(){const a=e.querySelector(".chat-message-list");a&&(a.scrollTop=a.scrollHeight)}function v(a){a.style.height="auto",a.style.height=`${Math.min(a.scrollHeight,120)}px`}function M(a){return a?a.members.filter(s=>!s.left_at&&s.profile).map(s=>s.profile):[]}function w(a){const s=String(t.mentionQuery||"").trim().toLowerCase(),i=M(a).filter(d=>d.id!==n.currentUser.id);return s?i.filter(d=>(d.full_name||"").toLowerCase().includes(s)):i}function x({rerender:a=!0}={}){t.mentionQuery!==null&&(t.mentionQuery=null,t.mentionIndex=0,a&&f())}function H(a){t.mentionDraft=a.value;const s=_n(a.value,a.selectionStart??a.value.length),i=s?s.query:null;return i===t.mentionQuery?!1:(t.mentionQuery=i,t.mentionStart=s?s.start:0,t.mentionIndex=0,!0)}function Q(a,s){const i=e.querySelector("[data-chat-composer]");if(!i||!s)return;const d=i.selectionStart??i.value.length,g=i.value.slice(0,t.mentionStart),S=i.value.slice(d),k=`@${s.full_name} `,_=`${g}${k}${S}`,T=g.length+k.length;t.mentionQuery=null,t.mentionIndex=0,t.mentionDraft=_,f();const C=e.querySelector("[data-chat-composer]");C&&(C.value=_,v(C),C.focus(),C.setSelectionRange?.(T,T))}function ve(a,s){const i=w(a);if(!i.length)return;const d=(t.mentionIndex+s+i.length)%i.length;t.mentionIndex=d;const g=e.querySelector("[data-chat-composer]")?.value??t.mentionDraft,S=e.querySelector("[data-chat-composer]")?.selectionStart??g.length;t.mentionDraft=g,f();const k=e.querySelector("[data-chat-composer]");k&&(k.value=g,v(k),k.focus(),k.setSelectionRange?.(S,S))}e.classList.add("wein-chat-root"),typeof document<"u"&&document.body?.classList.add("wein-chat-root");function _e(a){const s=a.target;if(s instanceof Element){if(t.composeOpen&&!s.closest("[data-chat-compose-popover]")&&!s.closest("[data-chat-compose-toggle]")){Y();return}if(t.membersOpen&&!s.closest("[data-chat-members-panel]")&&!s.closest("[data-chat-members-toggle]")){K();return}t.openMessageMenuId&&!s.closest("[data-chat-message-menu-panel]")&&!s.closest("[data-chat-message-menu]")&&(t.openMessageMenuId=null,f())}}function be(a){if(a.key==="Escape"){if(t.composeOpen){Y();return}if(t.membersOpen){K();return}(t.openMessageMenuId||t.confirmingDeleteMessageId)&&(t.openMessageMenuId=null,t.confirmingDeleteMessageId=null,f())}}e.addEventListener?.("click",_e),typeof document<"u"&&document.addEventListener("keydown",be);async function D({keepMessages:a=!0}={}){try{t.error=null;const[s,i]=await Promise.all([n.service.listProfiles(),n.service.listConversations()]);if(t.profiles=s,t.conversations=un(i),m&&(t.conversations.some(d=>d.id===m)&&(t.selectedConversationId=m),m=null),!t.selectedConversationId&&t.conversations.length&&(t.selectedConversationId=t.conversations[0].id),t.selectedConversationId&&a){t.messages=await n.service.listMessages(t.selectedConversationId);const d=t.messages.at(-1)?.message_seq||0;if(d)try{await n.service.markRead(t.selectedConversationId,d)}catch(g){console.error("Failed to mark chat messages as read",g)}}}catch(s){t.error=s.message||String(s)}finally{t.loading=!1,c||f()}}async function F(a){t.selectedConversationId=a,t.membersOpen=!1,t.memberAddOpen=!1,t.memberSearch="",t.memberSelectedIds=new Set,t.renameOpen=!1,t.renameDraft="",t.archiveConfirmOpen=!1,t.pendingAttachments=[],e.classList.add("chat-has-selection"),t.messages=await n.service.listMessages(a),y=!0,c||f();const s=t.messages.at(-1)?.message_seq||0;if(s)try{await n.service.markRead(a,s)}catch(i){console.error("Failed to mark chat messages as read",i)}await D()}function ye(){e.classList.remove("chat-has-selection")}function re(a){const s=t.selectedConversationId;if(!s)return;const i=[...a||[]];for(const d of i){const g={id:bn("pending"),name:d.name,mime:d.type||"application/octet-stream",size:d.size,status:"uploading",error:null,uploaded:null};t.pendingAttachments=[...t.pendingAttachments,g],n.service.uploadAttachment(s,d).then(S=>{g.status="done",g.uploaded=S,c||f()}).catch(S=>{g.status="error",g.error=S?.message||"Upload failed",c||f()})}f()}function Ke(a){t.pendingAttachments=t.pendingAttachments.filter(s=>s.id!==a),f()}async function Je(a){const s=a.querySelector("[data-chat-composer]"),i=s.value.trim(),d=t.pendingAttachments.some(C=>C.status==="uploading"),g=t.pendingAttachments.filter(C=>C.status==="done").map(C=>C.uploaded);if(d||!i&&!g.length||!t.selectedConversationId)return;const S=t.replyToMessageId,k=t.conversations.find(C=>C.id===t.selectedConversationId)||null,_=ee(i,M(k));s.value="",t.replyToMessageId=null,t.mentionQuery=null,t.mentionDraft="",t.pendingAttachments=[];const T=await n.service.sendMessage({conversationId:t.selectedConversationId,body:i,clientNonce:dn("portal-chat"),replyToId:S,mentionedUserIds:_,attachments:g});t.messages=[...t.messages,T],y=!0,c||f();try{await n.service.markRead(t.selectedConversationId,T.message_seq)}catch(C){console.error("Failed to mark chat message as read",C)}await D()}function Xe(a){a&&(t.replyToMessageId=a,f(),e.querySelector("[data-chat-composer]")?.focus())}function Ze(){t.replyToMessageId=null,f()}function et(){t.composeOpen=!0,t.searchOpen=!1,t.browseChannelsOpen=!1,f(),e.querySelector("[data-chat-compose-search]")?.focus()}function Y({reset:a=!1}={}){t.composeOpen=!1,a&&(t.composeSearch="",t.composeGroupTitle="",t.composeChannelTitle="",t.composeSelectedMemberIds=new Set),f()}function tt(){t.searchOpen=!0,t.composeOpen=!1,t.browseChannelsOpen=!1,f(),e.querySelector("[data-chat-search-input]")?.focus()}function ie(){t.searchOpen=!1,t.searchQuery="",t.searchResults=[],t.searchLoading=!1,t.searchError=null,h&&clearTimeout(h),f()}async function nt(a){const s=a.trim();if(!s){t.searchResults=[],t.searchLoading=!1,t.searchError=null,c||f();return}const i=++$;t.searchLoading=!0,t.searchError=null,c||f();try{const d=await n.service.searchMessages(s);if(c||i!==$)return;t.searchResults=d,t.searchLoading=!1,f()}catch(d){if(c||i!==$)return;t.searchError=d instanceof Error?d.message:String(d),t.searchLoading=!1,f()}}function at(a){t.searchQuery=a,h&&clearTimeout(h),h=setTimeout(()=>nt(a),300)}async function st(a,s){if(ie(),await F(a),c)return;const i=Array.from(e.querySelectorAll("[data-chat-message-id]")).find(d=>d.dataset.chatMessageId===s);i&&(i.scrollIntoView({block:"center"}),i.classList.add("chat-message-jumped"),setTimeout(()=>i.classList.remove("chat-message-jumped"),1600))}function rt(a,s){const i=new Set(t.composeSelectedMemberIds);s?i.add(a):i.delete(a),t.composeSelectedMemberIds=i,f()}function we(a){return a.members.find(i=>i.user_id===n.currentUser.id&&!i.left_at)?.membership_role==="owner"||["admin","manager"].includes(n.currentUser.role)}function Se(a){return!a||!["group","channel"].includes(a.kind)?!1:we(a)}function it(a){return a?we(a):!1}function ot(){t.membersOpen=!0,f()}function K({reset:a=!1}={}){t.membersOpen=!1,t.memberAddOpen=!1,a&&(t.memberSearch="",t.memberSelectedIds=new Set),f()}function ct(){t.memberAddOpen=!t.memberAddOpen,f(),t.memberAddOpen&&e.querySelector("[data-chat-member-search]")?.focus()}function lt(a,s){const i=new Set(t.memberSelectedIds);s?i.add(a):i.delete(a),t.memberSelectedIds=i,f()}async function dt(a){const s=[...t.memberSelectedIds];if(!(!a||!s.length)){for(const i of s)await n.service.addMember(a,i);t.memberSearch="",t.memberSelectedIds=new Set,t.memberAddOpen=!1,c||f(),await D()}}async function ut(a,s){!a||!s||(await n.service.removeMember(a,s),t.conversations=t.conversations.map(i=>i.id!==a?i:{...i,members:i.members.map(d=>d.user_id===s?{...d,left_at:d.left_at||new Date().toISOString()}:d)}),s===n.currentUser.id&&(t.membersOpen=!1,t.memberAddOpen=!1),c||f(),await D())}function mt(a){const s=t.messages.find(d=>d.id===a);if(!s)return;t.editingMessageId=a,t.editDraft=s.body||"",f();const i=e.querySelector(`[data-chat-edit-input="${CSS.escape(a)}"]`);i?.focus(),i?.select?.()}function ht(){t.editingMessageId=null,t.editDraft="",f()}async function ft(a){const s=a.dataset.chatEditForm,d=a.querySelector("[data-chat-edit-input]").value.trim();if(!s||!d)return;const g=t.conversations.find(k=>k.id===t.selectedConversationId)||null,S=await n.service.updateMessage(s,d,ee(d,M(g)));t.messages=t.messages.map(k=>k.id===S.id?S:k),t.editingMessageId=null,t.editDraft="",c||f(),await D()}async function pt(a){if(!a)return;const s=await n.service.deleteMessage(a);t.messages=t.messages.map(i=>i.id===a?{...i,...s,body:"Message deleted",deleted_at:s.deleted_at||new Date().toISOString()}:i),t.replyToMessageId===a&&(t.replyToMessageId=null),t.confirmingDeleteMessageId=null,t.openMessageMenuId=null,c||f(),await D()}async function gt(a){const i=a.members.find(d=>d.user_id===n.currentUser.id)?.notification_level==="muted"?"all":"muted";await n.service.setNotificationLevel(a.id,i),t.conversations=t.conversations.map(d=>d.id!==a.id?d:{...d,members:d.members.map(g=>g.user_id===n.currentUser.id?{...g,notification_level:i}:g)}),c||f(),await D()}function vt(a){t.renameOpen=!0,t.renameDraft=a.title||"",f(),e.querySelector("[data-chat-rename-input]")?.focus()}function _t(){t.renameOpen=!1,t.renameDraft="",f()}async function bt(a,s){const i=(s||"").trim();i&&(await n.service.renameConversation(a.id,i),t.conversations=t.conversations.map(d=>d.id===a.id?{...d,title:i}:d),t.renameOpen=!1,t.renameDraft="",c||f(),await D())}function yt(){t.archiveConfirmOpen=!0,f()}function wt(){t.archiveConfirmOpen=!1,f()}async function St(a,s){await n.service.setConversationArchived(a.id,s),t.archiveConfirmOpen=!1,t.selectedConversationId===a.id&&(t.selectedConversationId=null,ye()),t.conversations=t.conversations.map(i=>i.id===a.id?{...i,archived_at:new Date().toISOString()}:i),c||f(),await D()}async function $t(a,s,i){!a||!s||(await n.service.setMembershipRole(a,s,i),t.conversations=t.conversations.map(d=>d.id!==a?d:{...d,members:d.members.map(g=>g.user_id===s?{...g,membership_role:i}:g)}),c||f(),await D())}async function kt(a){if(!a)return;const s=await n.service.getOrCreateDm(a);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await F(s)}async function Ct(a,s){if(a=a.trim(),!a)return;const i=await n.service.createGroup(a,s);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await F(i)}async function Et(a){if(a=a.trim(),!a)return;const s=await n.service.createChannel(a);t.composeOpen=!1,t.composeChannelTitle="",await F(s)}async function Mt(){t.browseChannelsOpen=!0,t.composeOpen=!1,t.searchOpen=!1,t.browseChannelsError=null,t.browseChannelsLoading=!0,f();try{const a=await n.service.listChannels(),s=new Set(t.conversations.map(i=>i.id));t.browseChannelsList=a.filter(i=>!s.has(i.id)),t.browseChannelsLoading=!1,c||f()}catch(a){t.browseChannelsError=a instanceof Error?a.message:String(a),t.browseChannelsLoading=!1,c||f()}}function oe(){t.browseChannelsOpen=!1,t.browseChannelsList=[],t.browseChannelsError=null,f()}async function It(a){await n.service.joinChannel(a),oe(),await F(a)}function Lt(){c||D()}function Tt(a){const s=a.id===t.selectedConversationId?" selected":"",i=a.unread_count?`<span class="chat-count">${a.unread_count}</span>`:"",d=ce(a,n.currentUser.id),g=a.kind==="channel"?'<span class="chat-conversation-hash" aria-hidden="true">#</span>':a.kind==="group"?'<span class="chat-conversation-hash" aria-hidden="true"><i class="ti ti-lock"></i></span>':`<span class="chat-conversation-avatar" aria-hidden="true">${u((d||"?").slice(0,1).toUpperCase())}</span>`;return`
          <button type="button" class="chat-conversation${s}" data-chat-select="${u(a.id)}">
            ${g}
            <span class="chat-conversation-title">${u(d)}</span>
            ${i}
          </button>
        `}function qt(a){const s=t.conversations.find(S=>S.id===a.conversation_id),i=s?ce(s,n.currentUser.id):"Archived conversation",d=wn(a.created_at),g=a.sender?.full_name||"Unknown";return`
          <button type="button" class="chat-search-result" data-chat-search-result="${u(a.conversation_id)}" data-chat-search-message="${u(a.id)}">
            <span class="chat-search-result-row">
              <span class="chat-search-result-title">${u(i)}</span>
              ${d?`<span class="chat-search-result-time">${u(d)}</span>`:""}
            </span>
            <span class="chat-search-result-snippet"><strong>${u(g)}:</strong> ${u(hn(a))}</span>
          </button>
        `}function At(){const a=t.searchQuery.trim();return`
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
              ${t.searchLoading?"":t.searchResults.map(qt).join("")}
            </div>
          </div>
        `}function $e(){return["admin","manager"].includes(n.currentUser.role)}function Dt(a){if(!t.composeOpen)return"";const s=t.composeSearch.trim().toLowerCase(),i=a.filter(S=>!s||(S.full_name||"").toLowerCase().includes(s)),d=t.composeSelectedMemberIds.size,g=d===1?[...t.composeSelectedMemberIds][0]:"";return`
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
                      <span>${u(W(S.role))}</span>
                    </span>
                  </label>
                `}).join("")}
              ${i.length?"":'<div class="chat-muted">No matching people.</div>'}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${u(g)}"${d===1?"":" disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${u(t.composeGroupTitle)}">
                <button type="button" data-chat-create-group${t.composeGroupTitle.trim()?"":" disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
              </div>
              ${$e()?`
                <div class="chat-compose-group">
                  <input data-chat-channel-title type="text" placeholder="Channel name" value="${u(t.composeChannelTitle)}">
                  <button type="button" data-chat-create-channel${t.composeChannelTitle.trim()?"":" disabled"}><i class="ti ti-hash"></i><span>Create channel</span></button>
                </div>
              `:""}
            </div>
          </div>
        `}function Ot(){return`
          <div class="chat-search-panel">
            <div class="chat-compose-popover-head">
              <strong>Browse channels</strong>
              <button type="button" class="chat-icon-btn" data-chat-browse-channels-close aria-label="Close browse channels"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-search-results">
              ${t.browseChannelsLoading?'<div class="chat-muted">Loading...</div>':""}
              ${t.browseChannelsError?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${u(t.browseChannelsError)}</span></div>`:""}
              ${!t.browseChannelsLoading&&!t.browseChannelsError&&!t.browseChannelsList.length?`<div class="chat-muted">No channels to join -- you're already in every one that exists.</div>`:""}
              ${t.browseChannelsList.map(a=>`
                <div class="chat-search-result">
                  <span class="chat-search-result-row">
                    <span class="chat-search-result-title">#${u(a.title||"Untitled channel")}</span>
                    <button type="button" class="chat-member-add-toggle" data-chat-join-channel="${u(a.id)}"><i class="ti ti-plus"></i><span>Join</span></button>
                  </span>
                </div>
              `).join("")}
            </div>
          </div>
        `}function Rt(a){if(t.mentionQuery===null||!a)return"";const s=w(a);if(!s.length)return"";const i=Math.min(t.mentionIndex,s.length-1);return`
          <div class="chat-compose-popover chat-mention-picker" data-chat-mention-picker role="listbox" aria-label="Mention someone">
            ${s.map((d,g)=>`
              <button
                type="button"
                class="chat-compose-person chat-mention-option${g===i?" active":""}"
                data-chat-mention-pick="${u(d.id)}"
                role="option"
                aria-selected="${g===i}"
              >
                <span class="chat-compose-avatar">${u((d.full_name||"?").slice(0,1))}</span>
                <span class="chat-compose-person-copy">
                  <strong>${u(d.full_name||"Unknown")}</strong>
                  <span>${u(W(d.role))}</span>
                </span>
              </button>
            `).join("")}
          </div>
        `}function Nt(a){if(!t.membersOpen||!a||!["group","channel"].includes(a.kind))return"";const s=a.members.filter(_=>!_.left_at),i=Se(a),d=new Set(s.map(_=>_.user_id)),g=t.memberSearch.trim().toLowerCase(),S=t.profiles.filter(_=>_.id!==n.currentUser.id&&!d.has(_.id)&&(!g||(_.full_name||"").toLowerCase().includes(g))),k=t.memberSelectedIds.size;return`
          <div class="chat-compose-popover chat-members-panel" data-chat-members-panel role="dialog" aria-label="Manage members">
            <div class="chat-compose-popover-head">
              <strong>Manage members</strong>
              <button type="button" class="chat-icon-btn" data-chat-members-close aria-label="Close member management"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-member-panel-list">
              ${s.map(_=>{const T=_.profile||{},C=_.user_id===n.currentUser.id,J=i||C;return`
                  <div class="chat-member-row" data-chat-member-row="${u(_.user_id)}">
                    <span class="chat-compose-avatar">${u((T.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${u(T.full_name||_.user_id)}</strong>
                      <span>${u(T.role?W(T.role):"Member")}</span>
                    </span>
                    ${_.membership_role==="owner"?'<span class="chat-owner-badge">Owner</span>':""}
                    ${i?`
                      <button type="button" class="chat-member-promote" data-chat-promote-member="${u(_.user_id)}" data-chat-role="${_.membership_role==="owner"?"member":"owner"}">
                        <i class="ti ${_.membership_role==="owner"?"ti-user-minus":"ti-shield-plus"}"></i><span>${_.membership_role==="owner"?"Remove owner":"Make owner"}</span>
                      </button>
                    `:""}
                    ${J?`
                      <button type="button" class="chat-member-remove" data-chat-remove-member="${u(_.user_id)}">
                        <i class="ti ${C?"ti-logout":"ti-user-minus"}"></i><span>${C?"Leave":"Remove"}</span>
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
                    ${S.map(_=>{const T=t.memberSelectedIds.has(_.id)?" checked":"";return`
                        <label class="chat-compose-person">
                          <input type="checkbox" data-chat-member-pick="${u(_.id)}"${T}>
                          <span class="chat-compose-avatar">${u((_.full_name||"?").slice(0,1))}</span>
                          <span class="chat-compose-person-copy">
                            <strong>${u(_.full_name||"Unknown")}</strong>
                            <span>${u(W(_.role))}</span>
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
        `}function ke(a){const s=a.deleted_at?"Message deleted":a.body||"";return s.length>90?`${s.slice(0,87)}...`:s}function Pt(a){if(!a?.reply_to_id)return"";const s=t.messages.find(i=>i.id===a.reply_to_id);return s?`
          <div class="chat-quote">
            <strong>${u(s.sender?.full_name||"Unknown")}</strong>
            <span>${u(ke(s))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function Ut(){const a=t.messages.find(s=>s.id===t.replyToMessageId);return a?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${u(a.sender?.full_name||"Unknown")}</strong>
              <span>${u(ke(a))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function Ft(){return t.pendingAttachments.length?`
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
        `:""}function jt(a){const s=r.get(a.path),i=s&&s.expiresAt>Date.now()?s.url:null;return Ee(a.mime)?i?`<a class="chat-attachment-image-link" href="${u(i)}" target="_blank" rel="noopener">
                 <img class="chat-attachment-image" src="${u(i)}" alt="${u(a.name)}">
               </a>`:'<div class="chat-attachment-image chat-attachment-image-loading"><i class="ti ti-photo"></i></div>':`
          <a class="chat-attachment-file" href="${i?u(i):"#"}" target="_blank" rel="noopener" data-chat-attachment-path="${u(a.path)}">
            <i class="ti ${Me(a.mime)}"></i>
            <span class="chat-attachment-file-copy">
              <strong>${u(a.name)}</strong>
              <span>${u(yn(a.size))}</span>
            </span>
            <i class="ti ti-download"></i>
          </a>
        `}function Bt(a){return a.attachments?.length?`<div class="chat-message-attachments">${a.attachments.map(jt).join("")}</div>`:""}async function xt(){const a=new Set;for(const i of t.messages)for(const d of i.attachments||[])a.add(d.path);let s=!1;for(const i of a){const d=r.get(i);if(!(d&&d.expiresAt>Date.now()||l.has(i))){l.add(i);try{const g=await n.service.getSignedAttachmentUrl(i);r.set(i,{url:g,expiresAt:Date.now()+3300*1e3}),s=!0}catch(g){console.error("Failed to sign chat attachment URL",g)}finally{l.delete(i)}}}s&&!c&&f()}function Ht(a){return`
          <form class="chat-edit-form" data-chat-edit-form="${u(a.id)}">
            <input data-chat-edit-input="${u(a.id)}" type="text" value="${u(t.editDraft)}">
            <button type="submit" aria-label="Save edit"><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
          </form>
        `}function Wt(a){const s=u(a.body),i=t.conversations.find(_=>_.id===a.conversation_id)||t.conversations.find(_=>_.id===t.selectedConversationId)||null,d=M(i),g=vn(a.body,d);if(!g.length)return s;const S=new Set(d.filter(_=>_.id===n.currentUser.id).map(_=>String(_.full_name)));let k=s;for(const _ of g){const T=`@${u(_)}`,C=S.has(_)?"chat-mention chat-mention-self":"chat-mention";k=k.split(T).join(`<span class="${C}">${T}</span>`)}return k}function zt(a,s=!0){const i=a.sender_id===n.currentUser.id?" mine":"",d=!!a.deleted_at,g=i&&!d,S=!d&&(i||$e()),k=a.edited_at&&!d?'<span class="chat-edited">(edited)</span>':"",_=d?"":`
            <button type="button" data-chat-reply="${u(a.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${g?`<button type="button" data-chat-edit="${u(a.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
            ${S?`<button type="button" data-chat-delete="${u(a.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>`:""}
        `,T=d?"":`
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
            ${Pt(a)}
            ${t.editingMessageId===a.id?Ht(a):`
              ${a.body.trim()?`<div class="chat-message-body">${d?u("Message deleted"):Wt(a)}</div>`:""}
              ${d?"":Bt(a)}
            `}
            ${T}
          </div>
        `}function f(){const a=y||I();y=!1;const s=t.conversations.find(o=>o.id===t.selectedConversationId)||null,i=t.profiles.filter(o=>o.id!==n.currentUser.id),g=s?.members.find(o=>o.user_id===n.currentUser.id)?.notification_level==="muted",S=s?.members.filter(o=>!o.left_at)||[],k=s?Se(s):!1,_=s?it(s):!1;e.innerHTML=`
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <div class="chat-sidebar-tools">
                  <span class="chat-user-pill">${u(W(n.currentUser.role))}</span>
                  <button type="button" class="chat-icon-btn${t.browseChannelsOpen?" active":""}" data-chat-browse-channels-toggle aria-label="Browse channels" title="Browse channels"><i class="ti ti-hash"></i></button>
                  <button type="button" class="chat-icon-btn" data-chat-compose-toggle aria-label="New conversation" title="New conversation"><i class="ti ti-pencil-plus"></i></button>
                </div>
              </div>
              ${t.searchOpen?At():t.browseChannelsOpen?Ot():`
                ${Dt(i)}
                <div class="chat-conversation-list">
                  ${t.loading?'<div class="chat-muted">Loading...</div>':""}
                  ${t.conversations.map(Tt).join("")}
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
                    <div class="chat-eyebrow">${s.kind==="dm"?"Direct message":s.kind==="channel"?"Channel":"Group"}</div>
                    ${t.renameOpen?`
                      <form class="chat-rename-form" data-chat-rename-form>
                        <input data-chat-rename-input type="text" value="${u(t.renameDraft)}" placeholder="${s.kind==="channel"?"Channel name":"Group name"}">
                        <button type="submit" aria-label="Save name"><i class="ti ti-check"></i></button>
                        <button type="button" data-chat-rename-cancel aria-label="Cancel rename"><i class="ti ti-x"></i></button>
                      </form>
                    `:`<h2>${u(ce(s,n.currentUser.id))}</h2>`}
                  </div>
                  <div class="chat-thread-tools">
                    ${["group","channel"].includes(s.kind)?`
                      <button type="button" class="chat-icon-btn chat-member-count${t.membersOpen?" active":""}" data-chat-members-toggle aria-label="Manage members" title="Manage members">
                        <i class="ti ti-users"></i><span>${S.length}</span>
                      </button>
                    `:""}
                    <button type="button" class="chat-icon-btn${t.searchOpen?" active":""}" data-chat-search-toggle aria-label="Search messages" title="Search messages">
                      <i class="ti ti-search"></i>
                    </button>
                    <button type="button" class="chat-icon-btn${g?" active":""}" data-chat-toggle-mute aria-label="${g?"Unmute conversation":"Mute conversation"}" title="${g?"Unmute conversation":"Mute conversation"}">
                      <i class="ti ${g?"ti-bell-off":"ti-bell"}"></i>
                    </button>
                    ${["group","channel"].includes(s.kind)&&k?`
                      <button type="button" class="chat-icon-btn" data-chat-rename-toggle aria-label="Rename ${s.kind==="channel"?"channel":"group"}" title="Rename ${s.kind==="channel"?"channel":"group"}">
                        <i class="ti ti-edit"></i>
                      </button>
                    `:""}
                    ${_?`
                      <button type="button" class="chat-icon-btn" data-chat-archive-toggle aria-label="Archive conversation" title="Archive conversation">
                        <i class="ti ti-archive"></i>
                      </button>
                    `:""}
                  </div>
                  ${Nt(s)}
                  ${t.archiveConfirmOpen?`
                    <div class="chat-delete-confirm chat-archive-confirm">
                      <span>Archive this ${s.kind==="channel"?"channel":s.kind==="group"?"group":"conversation"}?</span>
                      <button type="button" data-chat-confirm-archive>Confirm</button>
                      <button type="button" data-chat-cancel-archive>Cancel</button>
                    </div>
                  `:""}
                </header>
                <div class="chat-message-list">
                  ${t.messages.map((o,b)=>zt(o,$n(o,t.messages[b-1]))).join("")}
                  ${t.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  ${Ut()}
                  ${Ft()}
                  ${Rt(s)}
                  <input type="file" data-chat-file-input multiple accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" hidden>
                  <button type="button" class="chat-attach-btn" data-chat-attach-toggle aria-label="Attach a file" title="Attach a file">
                    <i class="ti ti-paperclip"></i>
                  </button>
                  <textarea data-chat-composer rows="1" placeholder="Write a message..."></textarea>
                  <button type="submit"><i class="ti ti-send"></i><span>Send</span></button>
                </form>
              `:`
                <header class="chat-thread-head chat-thread-head-empty">
                  <div></div>
                  <div class="chat-thread-tools">
                    <button type="button" class="chat-icon-btn${t.searchOpen?" active":""}" data-chat-search-toggle aria-label="Search messages" title="Search messages">
                      <i class="ti ti-search"></i>
                    </button>
                  </div>
                </header>
                <div class="chat-empty-panel">
                  <i class="ti ti-messages"></i>
                  <h2>No conversation selected</h2>
                  <p>Start a DM or create a group to begin.</p>
                </div>
              `}
            </main>
          </section>
        `,e.querySelectorAll("[data-chat-select]").forEach(o=>{o.addEventListener("click",()=>F(o.dataset.chatSelect))}),e.querySelector("[data-chat-back]")?.addEventListener("click",()=>ye()),e.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{s&&gt(s)}),e.querySelector("[data-chat-members-toggle]")?.addEventListener("click",()=>{s&&(t.membersOpen?K():ot())}),e.querySelector("[data-chat-members-close]")?.addEventListener("click",()=>K({reset:!0})),e.querySelector("[data-chat-rename-toggle]")?.addEventListener("click",()=>{s&&vt(s)}),e.querySelector("[data-chat-rename-cancel]")?.addEventListener("click",()=>_t()),e.querySelector("[data-chat-rename-form]")?.addEventListener("submit",o=>{o.preventDefault(),s&&bt(s,t.renameDraft)}),e.querySelector("[data-chat-rename-input]")?.addEventListener("input",o=>{t.renameDraft=o.currentTarget.value}),e.querySelector("[data-chat-archive-toggle]")?.addEventListener("click",()=>yt()),e.querySelector("[data-chat-confirm-archive]")?.addEventListener("click",()=>{s&&St(s,!0)}),e.querySelector("[data-chat-cancel-archive]")?.addEventListener("click",()=>wt()),e.querySelector("[data-chat-member-add-toggle]")?.addEventListener("click",()=>ct()),e.querySelector("[data-chat-member-search]")?.addEventListener("input",o=>{t.memberSearch=o.currentTarget.value,f();const b=e.querySelector("[data-chat-member-search]");b?.focus(),b?.setSelectionRange?.(b.value.length,b.value.length)}),e.querySelectorAll("[data-chat-member-pick]").forEach(o=>{o.addEventListener("change",()=>lt(o.dataset.chatMemberPick,o.checked))}),e.querySelector("[data-chat-add-members]")?.addEventListener("click",o=>{dt(o.currentTarget.dataset.chatAddMembers)}),e.querySelectorAll("[data-chat-remove-member]").forEach(o=>{o.addEventListener("click",()=>{s&&ut(s.id,o.dataset.chatRemoveMember)})}),e.querySelectorAll("[data-chat-promote-member]").forEach(o=>{o.addEventListener("click",()=>{s&&$t(s.id,o.dataset.chatPromoteMember,o.dataset.chatRole)})}),e.querySelector("[data-chat-search-toggle]")?.addEventListener("click",()=>{t.searchOpen?ie():tt()}),e.querySelector("[data-chat-search-close]")?.addEventListener("click",()=>ie()),e.querySelector("[data-chat-search-input]")?.addEventListener("input",o=>{at(o.currentTarget.value),f();const b=e.querySelector("[data-chat-search-input]");b?.focus(),b?.setSelectionRange?.(b.value.length,b.value.length)}),e.querySelectorAll("[data-chat-search-result]").forEach(o=>{o.addEventListener("click",()=>{st(o.dataset.chatSearchResult,o.dataset.chatSearchMessage)})}),e.querySelector("[data-chat-browse-channels-toggle]")?.addEventListener("click",()=>{t.browseChannelsOpen?oe():Mt()}),e.querySelector("[data-chat-browse-channels-close]")?.addEventListener("click",()=>oe()),e.querySelectorAll("[data-chat-join-channel]").forEach(o=>{o.addEventListener("click",()=>It(o.dataset.chatJoinChannel))}),e.querySelector("[data-chat-channel-title]")?.addEventListener("input",o=>{t.composeChannelTitle=o.currentTarget.value,f();const b=e.querySelector("[data-chat-channel-title]");b?.focus(),b?.setSelectionRange?.(b.value.length,b.value.length)}),e.querySelector("[data-chat-create-channel]")?.addEventListener("click",()=>{Et(t.composeChannelTitle)}),e.querySelector("[data-chat-compose-toggle]")?.addEventListener("click",()=>{t.composeOpen?Y():et()}),e.querySelector("[data-chat-compose-close]")?.addEventListener("click",()=>Y()),e.querySelector("[data-chat-compose-search]")?.addEventListener("input",o=>{t.composeSearch=o.currentTarget.value,f();const b=e.querySelector("[data-chat-compose-search]");b?.focus(),b?.setSelectionRange?.(b.value.length,b.value.length)}),e.querySelectorAll("[data-chat-compose-member]").forEach(o=>{o.addEventListener("change",()=>rt(o.dataset.chatComposeMember,o.checked))}),e.querySelector("[data-chat-group-title]")?.addEventListener("input",o=>{t.composeGroupTitle=o.currentTarget.value,f();const b=e.querySelector("[data-chat-group-title]");b?.focus(),b?.setSelectionRange?.(b.value.length,b.value.length)}),e.querySelector("[data-chat-start-dm]")?.addEventListener("click",o=>{kt(o.currentTarget.dataset.chatStartDm)}),e.querySelector("[data-chat-create-group]")?.addEventListener("click",()=>{Ct(t.composeGroupTitle,[...t.composeSelectedMemberIds])});const T=e.querySelector("[data-chat-send-form]");T?.addEventListener("submit",o=>{o.preventDefault(),Je(o.currentTarget)});const C=e.querySelector("[data-chat-composer]");C?.addEventListener("input",()=>{if(v(C),!H(C))return;const{value:o,selectionStart:b}=C;f();const P=e.querySelector("[data-chat-composer]");P&&(P.value=o,v(P),P.focus(),P.setSelectionRange?.(b,b))}),C?.addEventListener("keydown",o=>{if(t.mentionQuery!==null&&s){const b=w(s);if(b.length){if(o.key==="ArrowDown"){o.preventDefault(),ve(s,1);return}if(o.key==="ArrowUp"){o.preventDefault(),ve(s,-1);return}if(o.key==="Enter"||o.key==="Tab"){o.preventDefault(),Q(s,b[Math.min(t.mentionIndex,b.length-1)]);return}}if(o.key==="Escape"){o.preventDefault(),x();return}}o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),T?.requestSubmit())}),e.querySelectorAll("[data-chat-mention-pick]").forEach(o=>{o.addEventListener("mousedown",b=>{b.preventDefault();const P=M(s).find(Gt=>Gt.id===o.dataset.chatMentionPick);P&&Q(s,P)})}),e.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>Ze()),e.querySelectorAll("[data-chat-reply]").forEach(o=>{o.addEventListener("click",()=>Xe(o.dataset.chatReply))}),e.querySelectorAll("[data-chat-edit]").forEach(o=>{o.addEventListener("click",()=>mt(o.dataset.chatEdit))}),e.querySelectorAll("[data-chat-delete]").forEach(o=>{o.addEventListener("click",()=>{t.confirmingDeleteMessageId=o.dataset.chatDelete,t.openMessageMenuId=null,f()})}),e.querySelectorAll("[data-chat-message-menu]").forEach(o=>{o.addEventListener("click",()=>{t.openMessageMenuId=t.openMessageMenuId===o.dataset.chatMessageMenu?null:o.dataset.chatMessageMenu,t.confirmingDeleteMessageId=null,f()})}),e.querySelectorAll("[data-chat-confirm-delete]").forEach(o=>{o.addEventListener("click",()=>pt(o.dataset.chatConfirmDelete))}),e.querySelectorAll("[data-chat-cancel-delete]").forEach(o=>{o.addEventListener("click",()=>{t.confirmingDeleteMessageId===o.dataset.chatCancelDelete&&(t.confirmingDeleteMessageId=null),f()})}),e.querySelectorAll("[data-chat-edit-form]").forEach(o=>{o.addEventListener("submit",b=>{b.preventDefault(),ft(b.currentTarget)})}),e.querySelectorAll("[data-chat-cancel-edit]").forEach(o=>{o.addEventListener("click",()=>ht())});const J=e.querySelector("[data-chat-file-input]");e.querySelector("[data-chat-attach-toggle]")?.addEventListener("click",()=>J?.click()),J?.addEventListener("change",o=>{re(o.currentTarget.files),o.currentTarget.value=""}),e.querySelectorAll("[data-chat-remove-pending]").forEach(o=>{o.addEventListener("click",()=>Ke(o.dataset.chatRemovePending))});const Ce=e.querySelector("[data-chat-send-form]");Ce?.addEventListener("dragover",o=>o.preventDefault()),Ce?.addEventListener("drop",o=>{o.preventDefault(),o.dataTransfer?.files?.length&&re(o.dataTransfer.files)}),C?.addEventListener("paste",o=>{const b=[...o.clipboardData?.files||[]];b.length&&re(b)}),a&&q(),xt()}return D(),p=setInterval(()=>D(),3e4),typeof n.service.subscribeToConversationEvents=="function"&&(E=n.service.subscribeToConversationEvents(()=>Lt())),()=>{c=!0,p&&clearInterval(p),h&&clearTimeout(h),E&&E(),e.removeEventListener?.("click",_e),typeof document<"u"&&(document.removeEventListener("keydown",be),document.body?.classList.remove("wein-chat-root")),e.classList.remove("wein-chat-root"),e.classList.remove("chat-has-selection"),e.innerHTML=""}}}}const Ie="chat-attachments",Le=5;function We(e){return String(e||"file").replace(/[^a-zA-Z0-9._-]+/g,"_")}function Cn(e,n){const t=`${Date.now().toString(36)}-${Math.random().toString(16).slice(2,8)}`;return`${e}/${t}-${We(n)}`}function En(e){return String(e).replace(/[\\%_]/g,n=>`\\${n}`)}function N(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data||[]}function U(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data}function fe(e){return e?{id:e.id,full_name:e.full_name,role:e.role,email:e.email??null}:null}function Mn(e){return{conversation_id:e.conversation_id,user_id:e.user_id,membership_role:e.membership_role,joined_at:e.joined_at,left_at:e.left_at,last_read_seq:Number(e.last_read_seq||0),notification_level:e.notification_level,profile:fe(e.profile||e.profiles)}}function B(e){return{id:e.id,conversation_id:e.conversation_id,message_seq:Number(e.message_seq||0),sender_id:e.sender_id,body:e.body,reply_to_id:e.reply_to_id,client_nonce:e.client_nonce,created_at:e.created_at,edited_at:e.edited_at,deleted_at:e.deleted_at,mentioned_user_ids:e.mentioned_user_ids||[],attachments:e.attachments||[],sender:fe(e.sender||e.profiles)}}function Te(e,n){const t=(e.members||e.wein_chat_members||[]).map(Mn),r=e.last_message||e.wein_chat_messages||[],l=Array.isArray(r)?r.find(p=>p.deleted_at==null):null,c=l?B(l):null,m={id:e.id,kind:e.kind,title:e.title,created_by:e.created_by,created_at:e.created_at,archived_at:e.archived_at,members:t,last_message:c,unread_count:0};return m.unread_count=mn(m,n),m}function ze({supabase:e,currentUserId:n}){if(!e)throw new Error("supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(r){const l=await e.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",r).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(Le,{referencedTable:"wein_chat_messages"}).single();if(l.error)throw new Error(`fetch conversation: ${l.error.message||l.error}`);return Te(l.data,n)}return{async listProfiles(){const r=await e.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return N(r,"list profiles").map(fe)},async listConversations(){const r=await e.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(Le,{referencedTable:"wein_chat_messages"});return N(r,"list conversations").map(l=>Te(l,n))},async listMessages(r){const l=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",r).is("deleted_at",null).order("message_seq",{ascending:!0});return N(l,"list messages").map(B)},async searchMessages(r){const l=(r||"").trim();if(!l)return[];const c=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).is("deleted_at",null).ilike("body",`%${En(l)}%`).order("created_at",{ascending:!1}).limit(50);return N(c,"search messages").map(B)},async createGroup(r,l=[]){const c=U(await e.rpc("wein_chat_create_group",{p_title:r}),"create group");for(const m of l)await this.addMember(c,m);return c},async createChannel(r){return U(await e.rpc("wein_chat_create_channel",{p_title:r}),"create channel")},async joinChannel(r){U(await e.rpc("wein_chat_join_channel",{p_conversation_id:r}),"join channel")},async listChannels(){const r=await e.from("wein_chat_conversations").select("id, kind, title, created_by, created_at, archived_at").eq("kind","channel").is("archived_at",null).order("title",{ascending:!0});return N(r,"list channels")},async getOrCreateDm(r){return U(await e.rpc("wein_chat_get_or_create_dm",{p_other_user_id:r}),"get or create DM")},async addMember(r,l){U(await e.rpc("wein_chat_add_member",{p_conversation_id:r,p_user_id:l}),"add member")},async removeMember(r,l){U(await e.rpc("wein_chat_remove_member",{p_conversation_id:r,p_user_id:l}),"remove member")},async renameConversation(r,l){const c=(l||"").trim();if(!c)throw new Error("Group title is required");const m=await e.from("wein_chat_conversations").update({title:c}).eq("id",r).select("id, title");if(!N(m,"rename conversation").length)throw new Error("rename conversation affected zero rows")},async setConversationArchived(r,l){const c=await e.from("wein_chat_conversations").update({archived_at:l?new Date().toISOString():null}).eq("id",r).select("id, archived_at");if(!N(c,"set conversation archived").length)throw new Error("set conversation archived affected zero rows")},async setMembershipRole(r,l,c){U(await e.rpc("wein_chat_set_membership_role",{p_conversation_id:r,p_user_id:l,p_role:c}),"set membership role")},async uploadAttachment(r,l){const c=Cn(r,l.name),m=await e.storage.from(Ie).upload(c,l,{contentType:l.type||"application/octet-stream",upsert:!1});if(m.error)throw new Error(`upload attachment: ${m.error.message||m.error}`);return{path:c,name:l.name||We(l.name),mime:l.type||"application/octet-stream",size:l.size||0}},async getSignedAttachmentUrl(r,l=3600){const c=await e.storage.from(Ie).createSignedUrl(r,l);if(c.error)throw new Error(`sign attachment url: ${c.error.message||c.error}`);const m=c.data?.signedUrl;if(!m)throw new Error("sign attachment url: no signed URL returned");return m},async sendMessage({conversationId:r,body:l,clientNonce:c,replyToId:m=null,mentionedUserIds:p=[],attachments:E=[]}){const y=await e.from("wein_chat_messages").insert({conversation_id:r,sender_id:n,body:l,client_nonce:c,reply_to_id:m,mentioned_user_ids:p.length?p:null,attachments:E}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(y.error)throw new Error(`send message: ${y.error.message||y.error}`);return B(y.data)},async updateMessage(r,l,c=[]){const m=await e.from("wein_chat_messages").update({body:l,edited_at:new Date().toISOString(),mentioned_user_ids:c.length?c:null}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(m.error)throw new Error(`update message: ${m.error.message||m.error}`);return B(m.data)},async deleteMessage(r){const l=await e.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(l.error)throw new Error(`delete message: ${l.error.message||l.error}`);return B(l.data)},async markRead(r,l){const c=await e.from("wein_chat_members").update({last_read_seq:l}).eq("conversation_id",r).eq("user_id",n).select("conversation_id, user_id, last_read_seq");if(!N(c,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(r,l){const c=await e.from("wein_chat_members").update({notification_level:l}).eq("conversation_id",r).eq("user_id",n).select("conversation_id, user_id, notification_level");if(!N(c,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(r){if(typeof e.channel!="function")return()=>{};const l=e.channel(`wein-chat:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},r).subscribe();return()=>{typeof e.removeChannel=="function"?e.removeChannel(l):typeof l.unsubscribe=="function"&&l.unsubscribe()}},fetchConversation:t}}function In(e){return typeof e.session.user=="object"&&e.session.user!==null?e.session.user:{}}function Ln(e){const n=In(e),t=n.id;if(!t)throw new Error("Team chat requires an authenticated user id.");return{id:t,full_name:e.session.fullName||n.email||"Portal user",role:e.session.role||"team",email:n.email||null}}let le=null;function Tn(e){le=e||null}function qn(){const e=kn();se({id:"team-chat",mount(n,t){const r=le;le=null;const l=Ln(t),c=ze({supabase:t.session.client,currentUserId:l.id});return e.mount(n,{currentUser:l,service:c,initialConversationId:r})}})}function An(e=[]){return e.reduce((n,t)=>{const r=Number(t?.unread_count);return n+(Number.isFinite(r)&&r>0?r:0)},0)}function Dn(e,n){const t=String(e??"");return n>0?`(${n}) ${t}`:t}function On(e,n={}){return e?e.author_id&&n[e.author_id]?.full_name?n[e.author_id].full_name:e.author_name||"Unknown":"Unknown"}function Ge(e){return!!e?.resolved_at}function Rn(e=[]){const n=new Map,t=[];e.forEach(c=>{n.set(c.id,{...c,replies:[]})}),n.forEach(c=>{c.reply_to_id&&n.has(c.reply_to_id)?n.get(c.reply_to_id).replies.push(c):t.push(c)});const r=(c,m)=>String(c.created_at||"").localeCompare(String(m.created_at||"")),l=c=>{c.replies.sort(r),c.replies.forEach(l)};return t.sort(r),t.forEach(l),t}function Nn(e=[]){return e.filter(n=>!Ge(n)).length}function qe(e,n=90){const t=String(e?.body||"").replace(/\s+/g," ").trim();return t.length<=n?t:`${t.slice(0,Math.max(0,n-1)).trimEnd()}…`}function A(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function Ae(e={}){return e.taskId?"Task discussion":e.providerId?"Provider discussion":e.offerId?"Offer discussion":"Record discussion"}function Pn(e={}){return e.taskId?`Task ${e.taskId}`:e.providerId?`Provider ${e.providerId}`:e.offerId?`Offer ${e.offerId}`:"No record scope"}function Un(){return{id:"record-discussion",mount(e,n){const t={comments:[],peopleById:Object.fromEntries((n.people||[]).map(v=>[v.id,v])),loading:!0,error:null,replyToId:null,taskSourceCommentId:null};let r=!1,l=null,c=null;e.classList.add("wein-discussion-root");async function m(){try{t.error=null,t.comments=await n.service.listComments(n.scope||{})}catch(v){t.error=v.message||String(v)}finally{t.loading=!1,r||q()}}async function p(v){const M=v.querySelector("[data-discussion-body]"),w=M.value.trim();w&&(M.value="",await n.service.postComment({...n.scope||{},body:w,replyToId:t.replyToId,people:n.people||[]}),t.replyToId=null,await m())}async function E(v){const M=e.querySelector(`[data-resolve-note="${CSS.escape(v)}"]`)?.value||"";await n.service.resolveComment(v,M),await m()}async function y(v){await n.service.reopenComment(v),await m()}async function h(v){const M=v.querySelector("[data-task-title]"),w=M.value.trim();!w||!t.taskSourceCommentId||(await n.service.createTaskFromComment(t.taskSourceCommentId,w,n.currentUser?.id||null),M.value="",t.taskSourceCommentId=null,await m())}function $(v,M=0){const w=Ge(v),x=On(v,t.peopleById);return`
          <article class="discussion-comment${w?" resolved":""}" style="--depth:${Math.min(M,4)}">
            <div class="discussion-comment-meta">
              <span>${A(x)}</span>
              <span>${A(v.created_at||"")}</span>
              ${w?'<span class="discussion-resolved-pill">Resolved</span>':""}
            </div>
            <div class="discussion-comment-body">${A(v.body)}</div>
            ${v.resolved_note?`<div class="discussion-resolved-note">${A(v.resolved_note)}</div>`:""}
            <div class="discussion-actions">
              <button type="button" data-discussion-reply="${A(v.id)}">Reply</button>
              ${w?`<button type="button" data-discussion-reopen="${A(v.id)}">Reopen</button>`:`<button type="button" data-discussion-resolve="${A(v.id)}">Resolve</button>`}
              <button type="button" data-discussion-task="${A(v.id)}">Create task</button>
            </div>
            ${w?"":`<input class="discussion-resolve-note" data-resolve-note="${A(v.id)}" placeholder="Optional resolve note">`}
            ${v.replies?.length?`<div class="discussion-replies">${v.replies.map(H=>$(H,M+1)).join("")}</div>`:""}
          </article>
        `}function I(){if(!t.taskSourceCommentId)return"";const v=t.comments.find(M=>M.id===t.taskSourceCommentId);return`
          <form class="discussion-task-box" data-discussion-task-form>
            <div>
              <div class="discussion-eyebrow">Create task from comment</div>
              <p>${A(qe(v))}</p>
            </div>
            <input data-task-title type="text" placeholder="Task title">
            <div class="discussion-task-actions">
              <button type="submit">Create task</button>
              <button type="button" data-discussion-task-cancel>Cancel</button>
            </div>
          </form>
        `}function q(){const v=Rn(t.comments),M=t.replyToId?t.comments.find(w=>w.id===t.replyToId):null;e.innerHTML=`
          <section class="discussion-shell" aria-label="${A(Ae(n.scope))}">
            <header class="discussion-header">
              <div>
                <div class="discussion-eyebrow">${A(Ae(n.scope))}</div>
                <h2>Discussion</h2>
                <p>${A(Pn(n.scope))}</p>
              </div>
              <span class="discussion-count">${Nn(t.comments)} unresolved</span>
            </header>
            ${t.error?`<div class="discussion-error">${A(t.error)}</div>`:""}
            ${I()}
            <div class="discussion-list">
              ${t.loading?'<div class="discussion-muted">Loading discussion...</div>':""}
              ${v.map(w=>$(w)).join("")}
              ${!t.loading&&!v.length?'<div class="discussion-muted">No comments yet.</div>':""}
            </div>
            <form class="discussion-composer" data-discussion-form>
              ${M?`
                <div class="discussion-replying">
                  Replying to: ${A(qe(M,70))}
                  <button type="button" data-discussion-cancel-reply>Cancel</button>
                </div>
              `:""}
              <textarea data-discussion-body rows="3" placeholder="Write a record-attached note..."></textarea>
              <button type="submit">${M?"Reply":"Post comment"}</button>
            </form>
          </section>
        `,e.querySelector("[data-discussion-form]")?.addEventListener("submit",w=>{w.preventDefault(),p(w.currentTarget)}),e.querySelector("[data-discussion-cancel-reply]")?.addEventListener("click",()=>{t.replyToId=null,q()}),e.querySelector("[data-discussion-task-cancel]")?.addEventListener("click",()=>{t.taskSourceCommentId=null,q()}),e.querySelector("[data-discussion-task-form]")?.addEventListener("submit",w=>{w.preventDefault(),h(w.currentTarget)}),e.querySelectorAll("[data-discussion-reply]").forEach(w=>{w.addEventListener("click",()=>{t.replyToId=w.dataset.discussionReply,q()})}),e.querySelectorAll("[data-discussion-resolve]").forEach(w=>{w.addEventListener("click",()=>E(w.dataset.discussionResolve))}),e.querySelectorAll("[data-discussion-reopen]").forEach(w=>{w.addEventListener("click",()=>y(w.dataset.discussionReopen))}),e.querySelectorAll("[data-discussion-task]").forEach(w=>{w.addEventListener("click",()=>{t.taskSourceCommentId=w.dataset.discussionTask,q()})})}return m(),l=setInterval(()=>m(),3e4),typeof n.service.subscribeToDiscussionEvents=="function"&&(c=n.service.subscribeToDiscussionEvents(()=>m())),()=>{r=!0,l&&clearInterval(l),c&&c(),e.classList.remove("wein-discussion-root"),e.innerHTML=""}}}}function j(e){if(e)throw e}function Fn({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t({taskId:y,providerId:h,offerId:$}={}){let I=e.from("wein_comments").select("*").order("created_at",{ascending:!0});y&&(I=I.eq("task_id",y)),h&&(I=I.eq("provider_id",h)),$&&(I=I.eq("offer_id",$));const{data:q,error:v}=await I;return j(v),q||[]}async function r({body:y,taskId:h=null,providerId:$=null,offerId:I=null,replyToId:q=null,people:v=[]}){const M=h?{task_id:h}:$?{provider_id:$}:I?{offer_id:I}:null;if(!M)throw new Error("postComment requires taskId, providerId, or offerId");const{data:w,error:x}=await e.from("wein_comments").insert({...M,reply_to_id:q,body:y,author_role:"team"}).select("*").single();j(x);for(const H of ee(y,v))try{await m(w.id,H)}catch(Q){console.error("Failed to record comment mention",Q)}return w}async function l(y,h=""){const{data:$,error:I}=await e.from("wein_comments").update({resolved_at:new Date().toISOString(),resolved_note:h}).eq("id",y).select("*");if(j(I),!$?.length)throw new Error("Resolve affected zero comments");return $[0]}async function c(y){const{data:h,error:$}=await e.from("wein_comments").update({resolved_at:null,resolved_note:null}).eq("id",y).select("*");if(j($),!h?.length)throw new Error("Reopen affected zero comments");return h[0]}async function m(y,h){const{data:$,error:I}=await e.from("wein_comment_mentions").insert({comment_id:y,mentioned_user_id:h}).select("*");return j(I),$?.[0]||null}async function p(y,h,$=null,I=null){const{data:q,error:v}=await e.rpc("wein_create_task_from_comment",{p_comment_id:y,p_title:h,p_assigned_to_user_id:$,p_due_date:I});return j(v),q}function E(y){if(!e.channel)return()=>{};const h=e.channel(`record-discussion:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},y).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},y).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_task_links"},y).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(h);if(h?.unsubscribe)return h.unsubscribe()}}return{listComments:t,postComment:r,resolveComment:l,reopenComment:c,addMention:m,createTaskFromComment:p,subscribeToDiscussionEvents:E}}function O(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}const jn={critical:"Critical",high:"High",medium:"Medium",low:"Low"},Bn={task:"Task",mention:"Mention",discussion:"Discussion",review:"Review"};function xn(e){if(!e)return"No due date";const n=new Date(e);return Number.isNaN(n.getTime())?String(e):n.toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function Hn(e=[]){return["critical","high","medium","low"].map(n=>({severity:n,items:e.filter(t=>t.severity===n)})).filter(n=>n.items.length)}function Wn(){return{id:"work-inbox",mount(e,n){const t={items:[],loading:!0,error:null};let r=!1,l=null,c=null;e.classList.add("wein-work-inbox-root");async function m(){try{t.error=null,t.items=await n.service.loadInbox()}catch(h){t.error=h.message||String(h)}finally{t.loading=!1,r||y()}}function p(h){if(typeof n.onSelectItem=="function"){n.onSelectItem(h);return}h.href&&(window.location.hash=h.href)}function E(h){return`
          <button type="button" class="work-inbox-item severity-${O(h.severity)}" data-inbox-item="${O(h.kind)}:${O(h.entity_id)}:${O(h.reason_code)}">
            <span class="work-inbox-kind">${O(Bn[h.kind]||h.kind)}</span>
            <span class="work-inbox-title">${O(h.title)}</span>
            <span class="work-inbox-reason">${O(h.reason_code.replaceAll("_"," "))}</span>
            <span class="work-inbox-due">${O(xn(h.due_at))}</span>
            <span class="work-inbox-action">${O(h.next_action)}</span>
          </button>
        `}function y(){const h=Hn(t.items);e.innerHTML=`
          <section class="work-inbox-shell" aria-label="Work inbox">
            <header class="work-inbox-header">
              <div>
                <div class="work-inbox-eyebrow">Today extension</div>
                <h2>Work inbox</h2>
                <p>Normalized tasks, mentions, discussion replies, and review signals.</p>
              </div>
              <div class="work-inbox-total">${t.items.length} item${t.items.length===1?"":"s"}</div>
            </header>
            ${t.error?`<div class="work-inbox-error">${O(t.error)}</div>`:""}
            <div class="work-inbox-toolbar">
              <button type="button" data-inbox-refresh>Refresh</button>
            </div>
            <div class="work-inbox-list">
              ${t.loading?'<div class="work-inbox-muted">Loading inbox...</div>':""}
              ${h.map($=>`
                <section class="work-inbox-group">
                  <h3>${O(jn[$.severity])}</h3>
                  ${$.items.map(E).join("")}
                </section>
              `).join("")}
              ${!t.loading&&!t.items.length?'<div class="work-inbox-muted">No attention items right now.</div>':""}
            </div>
          </section>
        `,e.querySelector("[data-inbox-refresh]")?.addEventListener("click",()=>m()),e.querySelectorAll("[data-inbox-item]").forEach($=>{$.addEventListener("click",()=>{const I=$.dataset.inboxItem,q=t.items.find(v=>`${v.kind}:${v.entity_id}:${v.reason_code}`===I);q&&p(q)})})}return m(),l=setInterval(()=>m(),6e4),typeof n.service.subscribeToInboxEvents=="function"&&(c=n.service.subscribeToInboxEvents(()=>m())),()=>{r=!0,l&&clearInterval(l),c&&c(),e.classList.remove("wein-work-inbox-root"),e.innerHTML=""}}}}const De={critical:0,high:1,medium:2,low:3};function pe(e,n=new Date){if(!e)return"low";const t=new Date(e);if(Number.isNaN(t.getTime()))return"low";const r=t.getTime()-n.getTime();return r<0?"critical":r<=1440*60*1e3?"high":r<=4320*60*1e3?"medium":"low"}function zn(e,{now:n=new Date}={}){return{kind:"task",entity_id:e.id,title:e.title||"Untitled task",reason_code:e.due_date?"task_due":"task_open",severity:pe(e.due_date,n),owner_id:e.assigned_to_user_id||e.owner_id||null,due_at:e.due_date||null,next_action:"Open task",href:`#tasks/${e.id}`,source:e}}function Gn(e,{comment:n,currentUserId:t}={}){return{kind:"mention",entity_id:e.comment_id,title:n?.body?`Mention: ${n.body}`:"Mention in discussion",reason_code:"unresolved_mention",severity:n?.resolved_at?"low":"high",owner_id:t||e.mentioned_user_id,due_at:n?.created_at||e.created_at||null,next_action:"Reply or resolve",href:`#comments/${e.comment_id}`,source:{mention:e,comment:n}}}function Vn(e,{currentUserId:n,now:t=new Date}={}){return{kind:"discussion",entity_id:e.id,title:e.body||"Discussion awaiting reply",reason_code:"thread_awaiting_reply",severity:pe(e.next_reply_due_at||e.created_at,t),owner_id:n||null,due_at:e.next_reply_due_at||null,next_action:"Reply in thread",href:`#comments/${e.id}`,source:e}}function Qn(e,{now:n=new Date}={}){return{kind:e.kind||"review",entity_id:e.id,title:e.title||e.offer_title||"Founder review needed",reason_code:e.reason_code||"founder_review",severity:pe(e.due_at||e.created_at,n),owner_id:e.owner_id||null,due_at:e.due_at||e.created_at||null,next_action:"Review",href:e.href||`#review/${e.id}`,source:e}}function Yn(e=[]){return[...e].sort((n,t)=>{const r=(De[n.severity]??9)-(De[t.severity]??9);return r||String(n.due_at||"").localeCompare(String(t.due_at||""))})}function Kn(e=[]){const n=new Set;return e.filter(t=>{const r=`${t.kind}:${t.entity_id}:${t.reason_code}`;return n.has(r)?!1:(n.add(r),!0)})}function Jn({tasks:e=[],mentions:n=[],commentsById:t={},awaitingReplies:r=[],founderReviews:l=[]},c={}){const m=[...e.map(p=>zn(p,c)),...n.map(p=>Gn(p,{...c,comment:t[p.comment_id]})),...r.map(p=>Vn(p,c)),...l.map(p=>Qn(p,c))];return Yn(Kn(m))}function Oe(e){if(e)throw e}function Xn({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(){let m=e.from("wein_tasks").select("*").neq("status","done").order("due_date",{ascending:!0,nullsFirst:!1});n&&(m=m.eq("assigned_to_user_id",n));const{data:p,error:E}=await m;return Oe(E),p||[]}async function r(){const{data:m,error:p}=await e.from("wein_comment_mentions").select("comment_id,mentioned_user_id,created_at,wein_comments(*)").eq("mentioned_user_id",n).is("wein_comments.resolved_at",null).order("created_at",{ascending:!0});return Oe(p),m||[]}async function l(){const[m,p]=await Promise.all([t(),r()]),E={},y=p.map(h=>{const $=h.wein_comments||h.comment||null;return $?.id&&(E[$.id]=$),{comment_id:h.comment_id,mentioned_user_id:h.mentioned_user_id,created_at:h.created_at}});return Jn({tasks:m,mentions:y,commentsById:E},{currentUserId:n})}function c(m){if(!e.channel)return()=>{};const p=e.channel(`work-inbox:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_tasks"},m).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},m).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},m).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(p);if(p?.unsubscribe)return p.unsubscribe()}}return{fetchOpenTasks:t,fetchUnresolvedMentions:r,loadInbox:l,subscribeToInboxEvents:c}}const Ve=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function Zn(e){for(const n of Ve)se({id:n,mount:()=>{e[n]()}})}function ge(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const ea=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function ta(e,n){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${ea.map(t=>`<button class="chip ${e===t?"active":""}" type="button" onclick="${n}('${t.replace(/'/g,"\\'")}')">${t==="all"?"All":ge(t)}</button>`).join("")}</div>`}function na(e,n){return n==="all"||String(e||"")===n}function aa(e){return String(e?.category||e?.vertical||"-")}function sa(e){const n=String(e||"").toLowerCase();return n.includes("dining")?"dining":n.includes("health")?"health":n.includes("fun")?"fun":n.includes("hotel")?"hotels":""}function ra(e,n=Date.now()){return e?Math.floor((n-new Date(e).getTime())/864e5):0}function de(e=new Date){const n=new Date(e);return n.setHours(0,0,0,0),n}function ia(e,n=new Date){return e?Math.round((de(n).getTime()-de(e).getTime())/864e5):null}function Qe(e,n){let t=String(e||"").replace(/\D/g,"");if(!t)return null;t.startsWith("0")&&(t=`20${t.slice(1)}`);const r=`Hi! Following up on the WeIN offer sheet for ${n} - do you have 5 minutes today?`;return`https://wa.me/${t}?text=${encodeURIComponent(r)}`}function oa(e,n){const t=Qe(e,n);return t?`<a class="mini-btn" href="${ge(t)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function V(e){return e.id}function ca(e){return L("profiles").find(n=>V(n)===e)??null}function la(e){return L("providers").find(n=>V(n)===e)??null}function da(e){return L("leads").find(n=>V(n)===e)??null}function ua(e){return L("tasks").find(n=>V(n)===e)??null}function ma(e){return L("offers").find(n=>V(n)===e)??null}function ha(e){return L("offers").filter(n=>n.provider_id===e)}function fa(e){return L("tasks").filter(n=>n.provider_id===e)}function pa(e){return L("tasks").filter(n=>n.lead_id===e)}const ga=Object.freeze(Object.defineProperty({__proto__:null,leadById:da,offerById:ma,offersForProvider:ha,profileById:ca,providerById:la,taskById:ua,tasksForLead:pa,tasksForProvider:fa},Symbol.toStringTag,{value:"Module"}));function va(){const e=document.title;let n=!1;async function t(){const l=window.WEIN?.user?.id;if(l)try{const m=await ze({supabase:te(),currentUserId:l}).listConversations(),p=An(m),E=document.querySelector("[data-chat-unread-badge]");E&&(E.textContent=String(p),E.style.display=p>0?"inline-flex":"none"),document.title=Dn(e,p)}catch{}}const r=setInterval(()=>{window.WEIN?.user?.id&&!n&&(n=!0,clearInterval(r),setInterval(t,3e4)),t()},2e3)}ln();qn();va();const Ye={api:Fe,auth:{canDelete:ue,canManageDeals:Ne,canEditProviderProfile:Pe,navHiddenForRole:me,defaultViewForRole:Ue},platform:{getSupabaseClient:te,getAccessToken:ae,getSessionContext:Yt},shared:{escapeHtml:ge,daysSince:ra,startOfLocalDay:de,dayDiffFromToday:ia,whatsappLink:Qe,whatsappButtonHtml:oa,categoryChipsHtml:ta,matchesCategoryFilter:na,categoryLabel:aa,catBadgeClass:sa},core:{createPortalContext:sn,getView:xe,mountView:cn,registeredViewIds:rn,registerView:se},legacy:{LEGACY_VIEW_IDS:Ve,registerLegacyViews:Zn},features:{requestOpenChatConversation:Tn,createDiscussionViewModule:Un,createSupabaseDiscussionService:Fn,createWorkInboxViewModule:Wn,createSupabaseWorkInboxService:Xn},store:Be,selectors:ga};window.WEIN_PORTAL_MODULES=Ye;for(const e of window.WEIN_PORTAL_MODULES_READY??[])e(Ye);window.WEIN_PORTAL_MODULES_READY=[];
