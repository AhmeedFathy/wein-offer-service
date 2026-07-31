function je(e){return typeof e=="object"&&e!==null?e.role:e}function fe(e){const n=je(e);return n==="admin"||n==="manager"}const Fe=fe;function Be(e){const n=je(e);return n==="admin"||n==="manager"||n==="deal_breaker"}const Kt={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function pe(e){return e?Kt[e]??[]:[]}function xe(e){return pe(e).includes("pipeline")?"tasks":"pipeline"}function U(){return window.WEIN_PORTAL_LEGACY??{}}function ne(){const e=U().supabaseClient;if(!e)throw new Error("Portal Supabase client is not available yet.");return e}function ae(){const e=U().getSupabaseUrl?.();if(!e)throw new Error("Portal Supabase URL is not available yet.");return e}function Jt(){const e=U().getSupabaseAnonKey?.();if(!e)throw new Error("Portal Supabase anon key is not available yet.");return e}function se(){return U().getAccessToken?.()??null}function Xt(){return{client:ne(),accessToken:se()}}class Zt extends Error{constructor(n,t,r){super(n),this.status=t,this.body=r,this.name="PortalApiError"}status;body}function Q(){const e=U().headers?.();if(e)return e;const n=Jt();return{apikey:n,Authorization:`Bearer ${se()||n}`,"Content-Type":"application/json"}}async function ge(e,n){if(e.ok)return;const t=await e.text();throw new Zt(`Supabase ${n} failed: ${e.status}${t?` ${t}`:""}`,e.status,t)}async function en(e){const n=U().get;if(n)return n(e);const t=await fetch(`${ae()}/rest/v1/${e}`,{headers:Q()});return await ge(t,"GET"),t.json()}async function tn(e,n){const t=U().post;if(t)return t(e,n);const r=await fetch(`${ae()}/rest/v1/${e}`,{method:"POST",headers:{...Q(),Prefer:"return=representation"},body:JSON.stringify(n)});return await ge(r,"POST"),r.json()}async function nn(e,n){const t=U().patch;return t?t(e,n):(await fetch(`${ae()}/rest/v1/${e}`,{method:"PATCH",headers:Q(),body:JSON.stringify(n)})).ok}async function an(e){const n=U().delete;if(n)return n(e);const t=await fetch(`${ae()}/rest/v1/${e}`,{method:"DELETE",headers:Q()});return await ge(t,"DELETE"),!0}const He={headers:Q,get:en,post:tn,patch:nn,delete:an},sn={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function rn(){const e=U().getCaches?.();return e?{providers:e.providers??[],offers:e.offers??[],negotiations:e.negotiations??[],files:e.files??[],leads:e.leads??[],outcomes:e.outcomes??[],tasks:e.tasks??[],profiles:e.profiles??[],redemptions:e.redemptions??[],campaigns:e.campaigns??[],calendarNotes:e.calendarNotes??[]}:sn}function L(e){return rn()[e]}function We(e,n){const t=U().setCache;if(!t)throw new Error("Portal cache bridge is not available yet.");t(e,[...n])}function on(e,n){We(e,n(L(e)))}const ze={get providers(){return L("providers")},get offers(){return L("offers")},get negotiations(){return L("negotiations")},get files(){return L("files")},get leads(){return L("leads")},get outcomes(){return L("outcomes")},get tasks(){return L("tasks")},get profiles(){return L("profiles")},get redemptions(){return L("redemptions")},get campaigns(){return L("campaigns")},get calendarNotes(){return L("calendarNotes")},getCache:L,replaceCache:We,updateCache:on};function Z(){const e=window.WEIN??{};return{user:e.user,role:e.role??sessionStorage.getItem("weinRole"),fullName:e.fullName??null,accessToken:se(),client:ne()}}function cn(){const e=Z();return{api:He,store:ze,session:e,permissions:{canDelete:()=>fe(Z()),canManageDeals:()=>Fe(Z()),canEditProviderProfile:()=>Be(Z()),navHiddenForRole:pe,defaultViewForRole:xe},navigate(n,t){window.showView?.(n,t)}}}const V=new Map;let ee=null;function re(e){if(!e.id)throw new Error("View id is required.");if(V.has(e.id))throw new Error(`View already registered: ${e.id}`);V.set(e.id,e)}function Ge(e){return V.get(e)}function ln(){return[...V.keys()]}function dn(){if(!ee)return;const e=ee;ee=null,e()}function un(e,n,t){const r=Ge(e);if(!r)throw new Error(`Unknown portal view: ${e}`);dn();const l=r.mount(n,t);ee=typeof l=="function"?l:null}function mn(){V.has("__dummy_cleanup_probe")||re({id:"__dummy_cleanup_probe",mount(e){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,e.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function hn(e="chat"){const n=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${e}-${n}`}function ue(e,n){return e.kind==="group"?e.title||"Untitled group":e.kind==="channel"?e.title||"Untitled channel":(e.members||[]).map(r=>r.profile).find(r=>r&&r.id!==n)?.full_name||"Direct message"}function fn(e){return[...e].sort((n,t)=>{const r=n.last_message?.created_at||n.created_at,l=t.last_message?.created_at||t.created_at;return new Date(l).getTime()-new Date(r).getTime()})}function pn(e,n){const t=(e.members||[]).find(l=>l.user_id===n),r=e.last_message?.message_seq||0;return Math.max(0,r-(t?.last_read_seq||0))}function gn(e){if(!e)return"No messages yet";const n=(e.deleted_at?"Message deleted":e.body||"").trim();return n.length>82?`${n.slice(0,79)}...`:n}function vn(e,n){return{...e,[n]:{pending:!0,error:null}}}function _n(e,n){return{...e,[n]:{pending:!1,error:null}}}function bn(e,n,t){return{...e,[n]:{pending:!1,error:t}}}function O(e,n){return!!e?.[n]?.pending}function T(e,n){return e?.[n]?.error??null}const yn=[["only an admin or manager may create a channel","Only an admin or manager can create a channel."],["channel name is required","Enter a channel name."],["only channels can be joined this way","That conversation can't be joined this way."],["this channel has been archived","This channel has been archived and can no longer be joined."],["conversation not found","This conversation no longer exists."],["chat conversation immutable columns cannot be updated","That change isn't allowed."],["only group or channel conversations can be renamed","Direct messages can't be renamed."]];function wn(e){const n=(e instanceof Error?e.message:String(e??"")).toLowerCase(),t=yn.find(([r])=>n.includes(r));return t?t[1]:"Something went wrong. Please try again."}const $n=/[\s\p{P}]/u,Sn=/[\s\p{P}]/u;function Ve(e,n){return n===0?!0:$n.test(e[n-1])}function kn(e,n){return n>=e.length?!0:Sn.test(e[n])}function te(e="",n=[]){const t=String(e??"");if(!t.includes("@"))return[];const r=n.filter(h=>h&&h.id&&h.full_name).map(h=>({id:h.id,name:String(h.full_name)})).sort((h,E)=>E.name.length-h.name.length);if(!r.length)return[];const l=t.toLowerCase(),c=[],m=new Set;for(let h=0;h<t.length;h+=1){if(t[h]!=="@"||!Ve(t,h))continue;const E=h+1;for(const w of r){const v=E+w.name.length;if(l.startsWith(w.name.toLowerCase(),E)&&kn(t,v)){m.has(w.id)||(m.add(w.id),c.push(w.id)),h=v-1;break}}}return c}function Cn(e="",n=[]){const t=new Set(te(e,n));return n.filter(r=>r&&t.has(r.id)&&r.full_name).map(r=>String(r.full_name)).sort((r,l)=>l.length-r.length)}function En(e="",n=0){const t=String(e??""),r=Math.max(0,Math.min(Number(n)||0,t.length)),l=40;for(let c=r-1;c>=0&&r-c<=l;c-=1){const m=t[c];if(m==="@")return Ve(t,c)?{query:t.slice(c+1,r),start:c}:null;if(m===`
`)return null}return null}function u(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function G(e){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[e]||e}function Mn(e){return`${e}-${Math.random().toString(16).slice(2)}-${Date.now().toString(36)}`}function Le(e){return typeof e=="string"&&e.startsWith("image/")}function In(e){const n=Number(e)||0;return n<1024?`${n} B`:n<1024*1024?`${(n/1024).toFixed(1)} KB`:`${(n/(1024*1024)).toFixed(1)} MB`}function qe(e){return e==="application/pdf"?"ti-file-type-pdf":e?.includes("word")?"ti-file-type-doc":e?.includes("sheet")||e?.includes("excel")?"ti-file-type-xls":"ti-file"}function Tn(e,n=new Date){if(!e)return"";const t=new Date(e);if(Number.isNaN(t.getTime()))return"";const r=n.getTime()-t.getTime(),l=Math.floor(r/6e4);if(l<1)return"now";if(l<60)return`${l}m`;const c=Math.floor(l/60);return c<24?`${c}h`:r<6*864e5?t.toLocaleDateString(void 0,{weekday:"short"}):t.toLocaleDateString(void 0,{month:"short",day:"numeric"})}const Ln=300*1e3;function qn(e,n){if(!n||e.sender_id!==n.sender_id)return!0;const t=new Date(e.created_at).getTime()-new Date(n.created_at).getTime();return!(t>=0&&t<Ln)}function An(){return{id:"team-chat",mount(e,n){const t={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,composeOpen:!1,composeSearch:"",composeGroupTitle:"",composeChannelTitle:"",composeSelectedMemberIds:new Set,browseChannelsOpen:!1,browseChannelsList:[],browseChannelsLoading:!1,browseChannelsError:null,membersOpen:!1,memberAddOpen:!1,memberSearch:"",memberSelectedIds:new Set,renameOpen:!1,renameDraft:"",archiveConfirmOpen:!1,mentionQuery:null,mentionIndex:0,mentionStart:0,mentionDraft:"",pendingAttachments:[],openMessageMenuId:null,confirmingDeleteMessageId:null,searchOpen:!1,searchQuery:"",searchResults:[],searchLoading:!1,searchError:null,loading:!0,error:null,actionState:{}},r=new Map,l=new Set;let c=!1,m=n.initialConversationId||null;async function h(a,s){if(!O(t.actionState,a)){t.actionState=vn(t.actionState,a),p();try{if(await s(),c)return;t.actionState=_n(t.actionState,a)}catch(i){if(c)return;t.actionState=bn(t.actionState,a,wn(i))}p()}}let E=null,w=null,v=!1,$=null,M=0;function A(){const a=e.querySelector(".chat-message-list");return a?a.scrollHeight-a.scrollTop-a.clientHeight<80:!0}function b(){const a=e.querySelector(".chat-message-list");a&&(a.scrollTop=a.scrollHeight)}function I(a){a.style.height="auto",a.style.height=`${Math.min(a.scrollHeight,120)}px`}function y(a){return a?a.members.filter(s=>!s.left_at&&s.profile).map(s=>s.profile):[]}function F(a){const s=String(t.mentionQuery||"").trim().toLowerCase(),i=y(a).filter(d=>d.id!==n.currentUser.id);return s?i.filter(d=>(d.full_name||"").toLowerCase().includes(s)):i}function z({rerender:a=!0}={}){t.mentionQuery!==null&&(t.mentionQuery=null,t.mentionIndex=0,a&&p())}function ie(a){t.mentionDraft=a.value;const s=En(a.value,a.selectionStart??a.value.length),i=s?s.query:null;return i===t.mentionQuery?!1:(t.mentionQuery=i,t.mentionStart=s?s.start:0,t.mentionIndex=0,!0)}function ye(a,s){const i=e.querySelector("[data-chat-composer]");if(!i||!s)return;const d=i.selectionStart??i.value.length,g=i.value.slice(0,t.mentionStart),S=i.value.slice(d),k=`@${s.full_name} `,_=`${g}${k}${S}`,q=g.length+k.length;t.mentionQuery=null,t.mentionIndex=0,t.mentionDraft=_,p();const C=e.querySelector("[data-chat-composer]");C&&(C.value=_,I(C),C.focus(),C.setSelectionRange?.(q,q))}function we(a,s){const i=F(a);if(!i.length)return;const d=(t.mentionIndex+s+i.length)%i.length;t.mentionIndex=d;const g=e.querySelector("[data-chat-composer]")?.value??t.mentionDraft,S=e.querySelector("[data-chat-composer]")?.selectionStart??g.length;t.mentionDraft=g,p();const k=e.querySelector("[data-chat-composer]");k&&(k.value=g,I(k),k.focus(),k.setSelectionRange?.(S,S))}e.classList.add("wein-chat-root"),typeof document<"u"&&document.body?.classList.add("wein-chat-root");function $e(a){const s=a.target;if(s instanceof Element){if(t.composeOpen&&!s.closest("[data-chat-compose-popover]")&&!s.closest("[data-chat-compose-toggle]")){K();return}if(t.membersOpen&&!s.closest("[data-chat-members-panel]")&&!s.closest("[data-chat-members-toggle]")){J();return}t.openMessageMenuId&&!s.closest("[data-chat-message-menu-panel]")&&!s.closest("[data-chat-message-menu]")&&(t.openMessageMenuId=null,p())}}function Se(a){if(a.key==="Escape"){if(t.composeOpen){K();return}if(t.membersOpen){J();return}(t.openMessageMenuId||t.confirmingDeleteMessageId)&&(t.openMessageMenuId=null,t.confirmingDeleteMessageId=null,p())}}e.addEventListener?.("click",$e),typeof document<"u"&&document.addEventListener("keydown",Se);async function N({keepMessages:a=!0}={}){try{t.error=null;const[s,i]=await Promise.all([n.service.listProfiles(),n.service.listConversations()]);if(t.profiles=s,t.conversations=fn(i),m&&(t.conversations.some(d=>d.id===m)&&(t.selectedConversationId=m),m=null),!t.selectedConversationId&&t.conversations.length&&(t.selectedConversationId=t.conversations[0].id),t.selectedConversationId&&a){t.messages=await n.service.listMessages(t.selectedConversationId);const d=t.messages.at(-1)?.message_seq||0;if(d)try{await n.service.markRead(t.selectedConversationId,d)}catch(g){console.error("Failed to mark chat messages as read",g)}}}catch(s){t.error=s.message||String(s)}finally{t.loading=!1,c||p()}}async function x(a){t.selectedConversationId=a,t.membersOpen=!1,t.memberAddOpen=!1,t.memberSearch="",t.memberSelectedIds=new Set,t.renameOpen=!1,t.renameDraft="",t.archiveConfirmOpen=!1,t.pendingAttachments=[],e.classList.add("chat-has-selection"),t.messages=await n.service.listMessages(a),v=!0,c||p();const s=t.messages.at(-1)?.message_seq||0;if(s)try{await n.service.markRead(a,s)}catch(i){console.error("Failed to mark chat messages as read",i)}await N()}function ke(){e.classList.remove("chat-has-selection")}function oe(a){const s=t.selectedConversationId;if(!s)return;const i=[...a||[]];for(const d of i){const g={id:Mn("pending"),name:d.name,mime:d.type||"application/octet-stream",size:d.size,status:"uploading",error:null,uploaded:null};t.pendingAttachments=[...t.pendingAttachments,g],n.service.uploadAttachment(s,d).then(S=>{g.status="done",g.uploaded=S,c||p()}).catch(S=>{g.status="error",g.error=S?.message||"Upload failed",c||p()})}p()}function et(a){t.pendingAttachments=t.pendingAttachments.filter(s=>s.id!==a),p()}async function tt(a){const s=a.querySelector("[data-chat-composer]"),i=s.value.trim(),d=t.pendingAttachments.some(C=>C.status==="uploading"),g=t.pendingAttachments.filter(C=>C.status==="done").map(C=>C.uploaded);if(d||!i&&!g.length||!t.selectedConversationId)return;const S=t.replyToMessageId,k=t.conversations.find(C=>C.id===t.selectedConversationId)||null,_=te(i,y(k));s.value="",t.replyToMessageId=null,t.mentionQuery=null,t.mentionDraft="",t.pendingAttachments=[];const q=await n.service.sendMessage({conversationId:t.selectedConversationId,body:i,clientNonce:hn("portal-chat"),replyToId:S,mentionedUserIds:_,attachments:g});t.messages=[...t.messages,q],v=!0,c||p();try{await n.service.markRead(t.selectedConversationId,q.message_seq)}catch(C){console.error("Failed to mark chat message as read",C)}await N()}function nt(a){a&&(t.replyToMessageId=a,p(),e.querySelector("[data-chat-composer]")?.focus())}function at(){t.replyToMessageId=null,p()}function st(){t.composeOpen=!0,t.searchOpen=!1,t.browseChannelsOpen=!1,p(),e.querySelector("[data-chat-compose-search]")?.focus()}function K({reset:a=!1}={}){t.composeOpen=!1,a&&(t.composeSearch="",t.composeGroupTitle="",t.composeChannelTitle="",t.composeSelectedMemberIds=new Set),p()}function rt(){t.searchOpen=!0,t.composeOpen=!1,t.browseChannelsOpen=!1,p(),e.querySelector("[data-chat-search-input]")?.focus()}function ce(){t.searchOpen=!1,t.searchQuery="",t.searchResults=[],t.searchLoading=!1,t.searchError=null,$&&clearTimeout($),p()}async function it(a){const s=a.trim();if(!s){t.searchResults=[],t.searchLoading=!1,t.searchError=null,c||p();return}const i=++M;t.searchLoading=!0,t.searchError=null,c||p();try{const d=await n.service.searchMessages(s);if(c||i!==M)return;t.searchResults=d,t.searchLoading=!1,p()}catch(d){if(c||i!==M)return;t.searchError=d instanceof Error?d.message:String(d),t.searchLoading=!1,p()}}function ot(a){t.searchQuery=a,$&&clearTimeout($),$=setTimeout(()=>it(a),300)}async function ct(a,s){if(ce(),await x(a),c)return;const i=Array.from(e.querySelectorAll("[data-chat-message-id]")).find(d=>d.dataset.chatMessageId===s);i&&(i.scrollIntoView({block:"center"}),i.classList.add("chat-message-jumped"),setTimeout(()=>i.classList.remove("chat-message-jumped"),1600))}function lt(a,s){const i=new Set(t.composeSelectedMemberIds);s?i.add(a):i.delete(a),t.composeSelectedMemberIds=i,p()}function Ce(a){return a.members.find(i=>i.user_id===n.currentUser.id&&!i.left_at)?.membership_role==="owner"||["admin","manager"].includes(n.currentUser.role)}function Ee(a){return!a||!["group","channel"].includes(a.kind)?!1:Ce(a)}function dt(a){return a?Ce(a):!1}function ut(){t.membersOpen=!0,p()}function J({reset:a=!1}={}){t.membersOpen=!1,t.memberAddOpen=!1,a&&(t.memberSearch="",t.memberSelectedIds=new Set),p()}function mt(){t.memberAddOpen=!t.memberAddOpen,p(),t.memberAddOpen&&e.querySelector("[data-chat-member-search]")?.focus()}function ht(a,s){const i=new Set(t.memberSelectedIds);s?i.add(a):i.delete(a),t.memberSelectedIds=i,p()}async function ft(a){const s=[...t.memberSelectedIds];if(!(!a||!s.length)){for(const i of s)await n.service.addMember(a,i);t.memberSearch="",t.memberSelectedIds=new Set,t.memberAddOpen=!1,c||p(),await N()}}async function pt(a,s){!a||!s||(await n.service.removeMember(a,s),t.conversations=t.conversations.map(i=>i.id!==a?i:{...i,members:i.members.map(d=>d.user_id===s?{...d,left_at:d.left_at||new Date().toISOString()}:d)}),s===n.currentUser.id&&(t.membersOpen=!1,t.memberAddOpen=!1),c||p(),await N())}function gt(a){const s=t.messages.find(d=>d.id===a);if(!s)return;t.editingMessageId=a,t.editDraft=s.body||"",p();const i=e.querySelector(`[data-chat-edit-input="${CSS.escape(a)}"]`);i?.focus(),i?.select?.()}function vt(){t.editingMessageId=null,t.editDraft="",p()}async function _t(a){const s=a.dataset.chatEditForm,d=a.querySelector("[data-chat-edit-input]").value.trim();if(!s||!d)return;const g=t.conversations.find(k=>k.id===t.selectedConversationId)||null,S=await n.service.updateMessage(s,d,te(d,y(g)));t.messages=t.messages.map(k=>k.id===S.id?S:k),t.editingMessageId=null,t.editDraft="",c||p(),await N()}async function bt(a){if(!a)return;const s=await n.service.deleteMessage(a);t.messages=t.messages.map(i=>i.id===a?{...i,...s,body:"Message deleted",deleted_at:s.deleted_at||new Date().toISOString()}:i),t.replyToMessageId===a&&(t.replyToMessageId=null),t.confirmingDeleteMessageId=null,t.openMessageMenuId=null,c||p(),await N()}async function yt(a){const i=a.members.find(d=>d.user_id===n.currentUser.id)?.notification_level==="muted"?"all":"muted";await n.service.setNotificationLevel(a.id,i),t.conversations=t.conversations.map(d=>d.id!==a.id?d:{...d,members:d.members.map(g=>g.user_id===n.currentUser.id?{...g,notification_level:i}:g)}),c||p(),await N()}function wt(a){t.renameOpen=!0,t.renameDraft=a.title||"",p(),e.querySelector("[data-chat-rename-input]")?.focus()}function $t(){t.renameOpen=!1,t.renameDraft="",p()}async function St(a,s){const i=(s||"").trim();i&&(await n.service.renameConversation(a.id,i),t.conversations=t.conversations.map(d=>d.id===a.id?{...d,title:i}:d),t.renameOpen=!1,t.renameDraft="",c||p(),await N())}function kt(){t.archiveConfirmOpen=!0,p()}function Ct(){t.archiveConfirmOpen=!1,p()}async function Et(a,s){await n.service.setConversationArchived(a.id,s),t.archiveConfirmOpen=!1,t.selectedConversationId===a.id&&(t.selectedConversationId=null,ke()),t.conversations=t.conversations.map(i=>i.id===a.id?{...i,archived_at:new Date().toISOString()}:i),c||p(),await N()}async function Mt(a,s,i){!a||!s||(await n.service.setMembershipRole(a,s,i),t.conversations=t.conversations.map(d=>d.id!==a?d:{...d,members:d.members.map(g=>g.user_id===s?{...g,membership_role:i}:g)}),c||p(),await N())}async function It(a){if(!a)return;const s=await n.service.getOrCreateDm(a);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await x(s)}async function Tt(a,s){if(a=a.trim(),!a)return;const i=await n.service.createGroup(a,s);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await x(i)}async function Lt(a){if(a=a.trim(),!a)return;const s=await n.service.createChannel(a);t.composeOpen=!1,t.composeChannelTitle="",await x(s)}async function qt(){t.browseChannelsOpen=!0,t.composeOpen=!1,t.searchOpen=!1,t.browseChannelsError=null,t.browseChannelsLoading=!0,p();try{const a=await n.service.listChannels(),s=new Set(t.conversations.map(i=>i.id));t.browseChannelsList=a.filter(i=>!s.has(i.id)),t.browseChannelsLoading=!1,c||p()}catch(a){t.browseChannelsError=a instanceof Error?a.message:String(a),t.browseChannelsLoading=!1,c||p()}}function le(){t.browseChannelsOpen=!1,t.browseChannelsList=[],t.browseChannelsError=null,p()}async function At(a){await n.service.joinChannel(a),le(),await x(a)}function Dt(){c||N()}function Ot(a){const s=a.id===t.selectedConversationId?" selected":"",i=a.unread_count?`<span class="chat-count">${a.unread_count}</span>`:"",d=ue(a,n.currentUser.id),g=a.kind==="channel"?'<span class="chat-conversation-hash" aria-hidden="true">#</span>':a.kind==="group"?'<span class="chat-conversation-hash" aria-hidden="true"><i class="ti ti-lock"></i></span>':`<span class="chat-conversation-avatar" aria-hidden="true">${u((d||"?").slice(0,1).toUpperCase())}</span>`;return`
          <button type="button" class="chat-conversation${s}" data-chat-select="${u(a.id)}">
            ${g}
            <span class="chat-conversation-title">${u(d)}</span>
            ${i}
          </button>
        `}function Rt(a){const s=t.conversations.find(S=>S.id===a.conversation_id),i=s?ue(s,n.currentUser.id):"Archived conversation",d=Tn(a.created_at),g=a.sender?.full_name||"Unknown";return`
          <button type="button" class="chat-search-result" data-chat-search-result="${u(a.conversation_id)}" data-chat-search-message="${u(a.id)}">
            <span class="chat-search-result-row">
              <span class="chat-search-result-title">${u(i)}</span>
              ${d?`<span class="chat-search-result-time">${u(d)}</span>`:""}
            </span>
            <span class="chat-search-result-snippet"><strong>${u(g)}:</strong> ${u(gn(a))}</span>
          </button>
        `}function Nt(){const a=t.searchQuery.trim();return`
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
              ${t.searchLoading?"":t.searchResults.map(Rt).join("")}
            </div>
          </div>
        `}function Me(){return["admin","manager"].includes(n.currentUser.role)}function Pt(a){if(!t.composeOpen)return"";const s=t.composeSearch.trim().toLowerCase(),i=a.filter(S=>!s||(S.full_name||"").toLowerCase().includes(s)),d=t.composeSelectedMemberIds.size,g=d===1?[...t.composeSelectedMemberIds][0]:"";return`
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
                      <span>${u(G(S.role))}</span>
                    </span>
                  </label>
                `}).join("")}
              ${i.length?"":'<div class="chat-muted">No matching people.</div>'}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${u(g)}"${d===1&&!O(t.actionState,`start-dm:${g}`)?"":" disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              ${T(t.actionState,`start-dm:${g}`)?`<span class="chat-action-error">${u(T(t.actionState,`start-dm:${g}`))}</span>`:""}
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${u(t.composeGroupTitle)}">
                <button type="button" data-chat-create-group${t.composeGroupTitle.trim()&&!O(t.actionState,"create-group")?"":" disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
                ${T(t.actionState,"create-group")?`<span class="chat-action-error">${u(T(t.actionState,"create-group"))}</span>`:""}
              </div>
              ${Me()?`
                <div class="chat-compose-group">
                  <input data-chat-channel-title type="text" placeholder="Channel name" value="${u(t.composeChannelTitle)}">
                  <button type="button" data-chat-create-channel${t.composeChannelTitle.trim()&&!O(t.actionState,"create-channel")?"":" disabled"}><i class="ti ti-hash"></i><span>Create channel</span></button>
                  ${T(t.actionState,"create-channel")?`<span class="chat-action-error">${u(T(t.actionState,"create-channel"))}</span>`:""}
                </div>
              `:""}
            </div>
          </div>
        `}function Ut(){return`
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
                    <button type="button" class="chat-member-add-toggle" data-chat-join-channel="${u(a.id)}"${O(t.actionState,`join-channel:${a.id}`)?" disabled":""}><i class="ti ti-plus"></i><span>Join</span></button>
                  </span>
                  ${T(t.actionState,`join-channel:${a.id}`)?`<span class="chat-action-error">${u(T(t.actionState,`join-channel:${a.id}`))}</span>`:""}
                </div>
              `).join("")}
            </div>
          </div>
        `}function jt(a){if(t.mentionQuery===null||!a)return"";const s=F(a);if(!s.length)return"";const i=Math.min(t.mentionIndex,s.length-1);return`
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
                  <span>${u(G(d.role))}</span>
                </span>
              </button>
            `).join("")}
          </div>
        `}function Ft(a){if(!t.membersOpen||!a||!["group","channel"].includes(a.kind))return"";const s=a.members.filter(_=>!_.left_at),i=Ee(a),d=new Set(s.map(_=>_.user_id)),g=t.memberSearch.trim().toLowerCase(),S=t.profiles.filter(_=>_.id!==n.currentUser.id&&!d.has(_.id)&&(!g||(_.full_name||"").toLowerCase().includes(g))),k=t.memberSelectedIds.size;return`
          <div class="chat-compose-popover chat-members-panel" data-chat-members-panel role="dialog" aria-label="Manage members">
            <div class="chat-compose-popover-head">
              <strong>Manage members</strong>
              <button type="button" class="chat-icon-btn" data-chat-members-close aria-label="Close member management"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-member-panel-list">
              ${s.map(_=>{const q=_.profile||{},C=_.user_id===n.currentUser.id,X=i||C;return`
                  <div class="chat-member-row" data-chat-member-row="${u(_.user_id)}">
                    <span class="chat-compose-avatar">${u((q.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${u(q.full_name||_.user_id)}</strong>
                      <span>${u(q.role?G(q.role):"Member")}</span>
                    </span>
                    ${_.membership_role==="owner"?'<span class="chat-owner-badge">Owner</span>':""}
                    ${i?`
                      <button type="button" class="chat-member-promote" data-chat-promote-member="${u(_.user_id)}" data-chat-role="${_.membership_role==="owner"?"member":"owner"}"${O(t.actionState,`set-role:${a.id}:${_.user_id}`)?" disabled":""}>
                        <i class="ti ${_.membership_role==="owner"?"ti-user-minus":"ti-shield-plus"}"></i><span>${_.membership_role==="owner"?"Remove owner":"Make owner"}</span>
                      </button>
                    `:""}
                    ${X?`
                      <button type="button" class="chat-member-remove" data-chat-remove-member="${u(_.user_id)}"${O(t.actionState,`remove-member:${a.id}:${_.user_id}`)?" disabled":""}>
                        <i class="ti ${C?"ti-logout":"ti-user-minus"}"></i><span>${C?"Leave":"Remove"}</span>
                      </button>
                    `:""}
                    ${T(t.actionState,`set-role:${a.id}:${_.user_id}`)||T(t.actionState,`remove-member:${a.id}:${_.user_id}`)?`
                      <span class="chat-action-error">${u(T(t.actionState,`set-role:${a.id}:${_.user_id}`)||T(t.actionState,`remove-member:${a.id}:${_.user_id}`))}</span>
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
                            <span>${u(G(_.role))}</span>
                          </span>
                        </label>
                      `}).join("")}
                    ${S.length?"":'<div class="chat-muted">No matching people.</div>'}
                  </div>
                  <div class="chat-compose-actions">
                    <button type="button" data-chat-add-members="${u(a.id)}"${k&&!O(t.actionState,`add-members:${a.id}`)?"":" disabled"}><i class="ti ti-users-plus"></i><span>Add selected</span></button>
                    ${T(t.actionState,`add-members:${a.id}`)?`<span class="chat-action-error">${u(T(t.actionState,`add-members:${a.id}`))}</span>`:""}
                  </div>
                `:""}
              </div>
            `:""}
          </div>
        `}function Ie(a){const s=a.deleted_at?"Message deleted":a.body||"";return s.length>90?`${s.slice(0,87)}...`:s}function Bt(a){if(!a?.reply_to_id)return"";const s=t.messages.find(i=>i.id===a.reply_to_id);return s?`
          <div class="chat-quote">
            <strong>${u(s.sender?.full_name||"Unknown")}</strong>
            <span>${u(Ie(s))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function xt(){const a=t.messages.find(s=>s.id===t.replyToMessageId);return a?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${u(a.sender?.full_name||"Unknown")}</strong>
              <span>${u(Ie(a))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function Ht(){return t.pendingAttachments.length?`
          <div class="chat-pending-attachments">
            ${t.pendingAttachments.map(a=>`
              <div class="chat-pending-attachment${a.status==="error"?" error":""}" data-chat-pending-attachment="${u(a.id)}">
                <i class="ti ${a.status==="error"?"ti-alert-triangle":Le(a.mime)?"ti-photo":qe(a.mime)}"></i>
                <span class="chat-pending-attachment-name">${u(a.name)}</span>
                ${a.status==="uploading"?'<span class="chat-pending-attachment-status">Uploading…</span>':""}
                ${a.status==="error"?`<span class="chat-pending-attachment-status">${u(a.error||"Failed")}</span>`:""}
                <button type="button" data-chat-remove-pending="${u(a.id)}" aria-label="Remove attachment"><i class="ti ti-x"></i></button>
              </div>
            `).join("")}
          </div>
        `:""}function Wt(a){const s=r.get(a.path),i=s&&s.expiresAt>Date.now()?s.url:null;return Le(a.mime)?i?`<a class="chat-attachment-image-link" href="${u(i)}" target="_blank" rel="noopener">
                 <img class="chat-attachment-image" src="${u(i)}" alt="${u(a.name)}">
               </a>`:'<div class="chat-attachment-image chat-attachment-image-loading"><i class="ti ti-photo"></i></div>':`
          <a class="chat-attachment-file" href="${i?u(i):"#"}" target="_blank" rel="noopener" data-chat-attachment-path="${u(a.path)}">
            <i class="ti ${qe(a.mime)}"></i>
            <span class="chat-attachment-file-copy">
              <strong>${u(a.name)}</strong>
              <span>${u(In(a.size))}</span>
            </span>
            <i class="ti ti-download"></i>
          </a>
        `}function zt(a){return a.attachments?.length?`<div class="chat-message-attachments">${a.attachments.map(Wt).join("")}</div>`:""}async function Gt(){const a=new Set;for(const i of t.messages)for(const d of i.attachments||[])a.add(d.path);let s=!1;for(const i of a){const d=r.get(i);if(!(d&&d.expiresAt>Date.now()||l.has(i))){l.add(i);try{const g=await n.service.getSignedAttachmentUrl(i);r.set(i,{url:g,expiresAt:Date.now()+3300*1e3}),s=!0}catch(g){console.error("Failed to sign chat attachment URL",g)}finally{l.delete(i)}}}s&&!c&&p()}function Vt(a){const s=O(t.actionState,`edit-message:${a.id}`),i=T(t.actionState,`edit-message:${a.id}`);return`
          <form class="chat-edit-form" data-chat-edit-form="${u(a.id)}">
            <input data-chat-edit-input="${u(a.id)}" type="text" value="${u(t.editDraft)}"${s?" disabled":""}>
            <button type="submit" aria-label="Save edit"${s?" disabled":""}><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
            ${i?`<span class="chat-action-error">${u(i)}</span>`:""}
          </form>
        `}function Qt(a){const s=u(a.body),i=t.conversations.find(_=>_.id===a.conversation_id)||t.conversations.find(_=>_.id===t.selectedConversationId)||null,d=y(i),g=Cn(a.body,d);if(!g.length)return s;const S=new Set(d.filter(_=>_.id===n.currentUser.id).map(_=>String(_.full_name)));let k=s;for(const _ of g){const q=`@${u(_)}`,C=S.has(_)?"chat-mention chat-mention-self":"chat-mention";k=k.split(q).join(`<span class="${C}">${q}</span>`)}return k}function Yt(a,s=!0){const i=a.sender_id===n.currentUser.id?" mine":"",d=!!a.deleted_at,g=i&&!d,S=!d&&(i||Me()),k=a.edited_at&&!d?'<span class="chat-edited">(edited)</span>':"",_=d?"":`
            <button type="button" data-chat-reply="${u(a.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${g?`<button type="button" data-chat-edit="${u(a.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
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
              <button type="button" data-chat-confirm-delete="${u(a.id)}"${O(t.actionState,`delete-message:${a.id}`)?" disabled":""}>Confirm</button>
              <button type="button" data-chat-cancel-delete="${u(a.id)}">Cancel</button>
              ${T(t.actionState,`delete-message:${a.id}`)?`<span class="chat-action-error">${u(T(t.actionState,`delete-message:${a.id}`))}</span>`:""}
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
            ${Bt(a)}
            ${t.editingMessageId===a.id?Vt(a):`
              ${a.body.trim()?`<div class="chat-message-body">${d?u("Message deleted"):Qt(a)}</div>`:""}
              ${d?"":zt(a)}
            `}
            ${q}
          </div>
        `}function p(){const a=v||A();v=!1;const s=t.conversations.find(o=>o.id===t.selectedConversationId)||null,i=t.profiles.filter(o=>o.id!==n.currentUser.id),g=s?.members.find(o=>o.user_id===n.currentUser.id)?.notification_level==="muted",S=s?.members.filter(o=>!o.left_at)||[],k=s?Ee(s):!1,_=s?dt(s):!1;e.innerHTML=`
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <div class="chat-sidebar-tools">
                  <span class="chat-user-pill">${u(G(n.currentUser.role))}</span>
                  <button type="button" class="chat-icon-btn${t.browseChannelsOpen?" active":""}" data-chat-browse-channels-toggle aria-label="Browse channels" title="Browse channels"><i class="ti ti-hash"></i></button>
                  <button type="button" class="chat-icon-btn" data-chat-compose-toggle aria-label="New conversation" title="New conversation"><i class="ti ti-pencil-plus"></i></button>
                </div>
              </div>
              ${t.searchOpen?Nt():t.browseChannelsOpen?Ut():`
                ${Pt(i)}
                <div class="chat-conversation-list">
                  ${t.loading?'<div class="chat-muted">Loading...</div>':""}
                  ${t.conversations.map(Ot).join("")}
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
                        <input data-chat-rename-input type="text" value="${u(t.renameDraft)}" placeholder="${s.kind==="channel"?"Channel name":"Group name"}"${O(t.actionState,`rename:${s.id}`)?" disabled":""}>
                        <button type="submit" aria-label="Save name"${O(t.actionState,`rename:${s.id}`)?" disabled":""}><i class="ti ti-check"></i></button>
                        <button type="button" data-chat-rename-cancel aria-label="Cancel rename"><i class="ti ti-x"></i></button>
                        ${T(t.actionState,`rename:${s.id}`)?`<span class="chat-action-error">${u(T(t.actionState,`rename:${s.id}`))}</span>`:""}
                      </form>
                    `:`<h2>${u(ue(s,n.currentUser.id))}</h2>`}
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
                    <button type="button" class="chat-icon-btn${g?" active":""}" data-chat-toggle-mute aria-label="${g?"Unmute conversation":"Mute conversation"}" title="${g?"Unmute conversation":"Mute conversation"}"${O(t.actionState,`toggle-mute:${s.id}`)?" disabled":""}>
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
                  ${Ft(s)}
                  ${t.archiveConfirmOpen?`
                    <div class="chat-delete-confirm chat-archive-confirm">
                      <span>Archive this ${s.kind==="channel"?"channel":s.kind==="group"?"group":"conversation"}?</span>
                      <button type="button" data-chat-confirm-archive${O(t.actionState,`archive:${s.id}`)?" disabled":""}>Confirm</button>
                      <button type="button" data-chat-cancel-archive>Cancel</button>
                      ${T(t.actionState,`archive:${s.id}`)?`<span class="chat-action-error">${u(T(t.actionState,`archive:${s.id}`))}</span>`:""}
                    </div>
                  `:""}
                </header>
                <div class="chat-message-list">
                  ${t.messages.map((o,f)=>Yt(o,qn(o,t.messages[f-1]))).join("")}
                  ${t.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                ${T(t.actionState,`send-message:${s.id}`)?`<div class="chat-action-error chat-send-error"><i class="ti ti-alert-triangle"></i><span>${u(T(t.actionState,`send-message:${s.id}`))}</span></div>`:""}
                <form class="chat-composer" data-chat-send-form>
                  ${xt()}
                  ${Ht()}
                  ${jt(s)}
                  <input type="file" data-chat-file-input multiple accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" hidden>
                  <button type="button" class="chat-attach-btn" data-chat-attach-toggle aria-label="Attach a file" title="Attach a file">
                    <i class="ti ti-paperclip"></i>
                  </button>
                  <textarea data-chat-composer rows="1" placeholder="Write a message..."></textarea>
                  <button type="submit"${O(t.actionState,`send-message:${s.id}`)?" disabled":""}><i class="ti ti-send"></i><span>Send</span></button>
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
        `,e.querySelectorAll("[data-chat-select]").forEach(o=>{o.addEventListener("click",()=>x(o.dataset.chatSelect))}),e.querySelector("[data-chat-back]")?.addEventListener("click",()=>ke()),e.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{s&&h(`toggle-mute:${s.id}`,()=>yt(s))}),e.querySelector("[data-chat-members-toggle]")?.addEventListener("click",()=>{s&&(t.membersOpen?J():ut())}),e.querySelector("[data-chat-members-close]")?.addEventListener("click",()=>J({reset:!0})),e.querySelector("[data-chat-rename-toggle]")?.addEventListener("click",()=>{s&&wt(s)}),e.querySelector("[data-chat-rename-cancel]")?.addEventListener("click",()=>$t()),e.querySelector("[data-chat-rename-form]")?.addEventListener("submit",o=>{o.preventDefault(),s&&h(`rename:${s.id}`,()=>St(s,t.renameDraft))}),e.querySelector("[data-chat-rename-input]")?.addEventListener("input",o=>{t.renameDraft=o.currentTarget.value}),e.querySelector("[data-chat-archive-toggle]")?.addEventListener("click",()=>kt()),e.querySelector("[data-chat-confirm-archive]")?.addEventListener("click",()=>{s&&h(`archive:${s.id}`,()=>Et(s,!0))}),e.querySelector("[data-chat-cancel-archive]")?.addEventListener("click",()=>Ct()),e.querySelector("[data-chat-member-add-toggle]")?.addEventListener("click",()=>mt()),e.querySelector("[data-chat-member-search]")?.addEventListener("input",o=>{t.memberSearch=o.currentTarget.value,p();const f=e.querySelector("[data-chat-member-search]");f?.focus(),f?.setSelectionRange?.(f.value.length,f.value.length)}),e.querySelectorAll("[data-chat-member-pick]").forEach(o=>{o.addEventListener("change",()=>ht(o.dataset.chatMemberPick,o.checked))}),e.querySelector("[data-chat-add-members]")?.addEventListener("click",o=>{const f=o.currentTarget.dataset.chatAddMembers;h(`add-members:${f}`,()=>ft(f))}),e.querySelectorAll("[data-chat-remove-member]").forEach(o=>{o.addEventListener("click",()=>{if(!s)return;const f=o.dataset.chatRemoveMember;h(`remove-member:${s.id}:${f}`,()=>pt(s.id,f))})}),e.querySelectorAll("[data-chat-promote-member]").forEach(o=>{o.addEventListener("click",()=>{if(!s)return;const f=o.dataset.chatPromoteMember,D=o.dataset.chatRole;h(`set-role:${s.id}:${f}`,()=>Mt(s.id,f,D))})}),e.querySelector("[data-chat-search-toggle]")?.addEventListener("click",()=>{t.searchOpen?ce():rt()}),e.querySelector("[data-chat-search-close]")?.addEventListener("click",()=>ce()),e.querySelector("[data-chat-search-input]")?.addEventListener("input",o=>{ot(o.currentTarget.value),p();const f=e.querySelector("[data-chat-search-input]");f?.focus(),f?.setSelectionRange?.(f.value.length,f.value.length)}),e.querySelectorAll("[data-chat-search-result]").forEach(o=>{o.addEventListener("click",()=>{ct(o.dataset.chatSearchResult,o.dataset.chatSearchMessage)})}),e.querySelector("[data-chat-browse-channels-toggle]")?.addEventListener("click",()=>{t.browseChannelsOpen?le():qt()}),e.querySelector("[data-chat-browse-channels-close]")?.addEventListener("click",()=>le()),e.querySelectorAll("[data-chat-join-channel]").forEach(o=>{o.addEventListener("click",()=>{const f=o.dataset.chatJoinChannel;h(`join-channel:${f}`,()=>At(f))})}),e.querySelector("[data-chat-channel-title]")?.addEventListener("input",o=>{t.composeChannelTitle=o.currentTarget.value,p();const f=e.querySelector("[data-chat-channel-title]");f?.focus(),f?.setSelectionRange?.(f.value.length,f.value.length)}),e.querySelector("[data-chat-create-channel]")?.addEventListener("click",()=>{h("create-channel",()=>Lt(t.composeChannelTitle))}),e.querySelector("[data-chat-compose-toggle]")?.addEventListener("click",()=>{t.composeOpen?K():st()}),e.querySelector("[data-chat-compose-close]")?.addEventListener("click",()=>K()),e.querySelector("[data-chat-compose-search]")?.addEventListener("input",o=>{t.composeSearch=o.currentTarget.value,p();const f=e.querySelector("[data-chat-compose-search]");f?.focus(),f?.setSelectionRange?.(f.value.length,f.value.length)}),e.querySelectorAll("[data-chat-compose-member]").forEach(o=>{o.addEventListener("change",()=>lt(o.dataset.chatComposeMember,o.checked))}),e.querySelector("[data-chat-group-title]")?.addEventListener("input",o=>{t.composeGroupTitle=o.currentTarget.value,p();const f=e.querySelector("[data-chat-group-title]");f?.focus(),f?.setSelectionRange?.(f.value.length,f.value.length)}),e.querySelector("[data-chat-start-dm]")?.addEventListener("click",o=>{const f=o.currentTarget.dataset.chatStartDm;h(`start-dm:${f}`,()=>It(f))}),e.querySelector("[data-chat-create-group]")?.addEventListener("click",()=>{h("create-group",()=>Tt(t.composeGroupTitle,[...t.composeSelectedMemberIds]))});const q=e.querySelector("[data-chat-send-form]");q?.addEventListener("submit",o=>{o.preventDefault();const f=t.selectedConversationId,D=o.currentTarget;h(`send-message:${f}`,()=>tt(D))});const C=e.querySelector("[data-chat-composer]");C?.addEventListener("input",()=>{if(I(C),!ie(C))return;const{value:o,selectionStart:f}=C;p();const D=e.querySelector("[data-chat-composer]");D&&(D.value=o,I(D),D.focus(),D.setSelectionRange?.(f,f))}),C?.addEventListener("keydown",o=>{if(t.mentionQuery!==null&&s){const f=F(s);if(f.length){if(o.key==="ArrowDown"){o.preventDefault(),we(s,1);return}if(o.key==="ArrowUp"){o.preventDefault(),we(s,-1);return}if(o.key==="Enter"||o.key==="Tab"){o.preventDefault(),ye(s,f[Math.min(t.mentionIndex,f.length-1)]);return}}if(o.key==="Escape"){o.preventDefault(),z();return}}o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),q?.requestSubmit())}),e.querySelectorAll("[data-chat-mention-pick]").forEach(o=>{o.addEventListener("mousedown",f=>{f.preventDefault();const D=y(s).find(de=>de.id===o.dataset.chatMentionPick);D&&ye(s,D)})}),e.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>at()),e.querySelectorAll("[data-chat-reply]").forEach(o=>{o.addEventListener("click",()=>nt(o.dataset.chatReply))}),e.querySelectorAll("[data-chat-edit]").forEach(o=>{o.addEventListener("click",()=>gt(o.dataset.chatEdit))}),e.querySelectorAll("[data-chat-delete]").forEach(o=>{o.addEventListener("click",()=>{t.confirmingDeleteMessageId=o.dataset.chatDelete,t.openMessageMenuId=null,p()})}),e.querySelectorAll("[data-chat-message-menu]").forEach(o=>{o.addEventListener("click",()=>{t.openMessageMenuId=t.openMessageMenuId===o.dataset.chatMessageMenu?null:o.dataset.chatMessageMenu,t.confirmingDeleteMessageId=null,p()})}),e.querySelectorAll("[data-chat-confirm-delete]").forEach(o=>{o.addEventListener("click",()=>{const f=o.dataset.chatConfirmDelete;h(`delete-message:${f}`,()=>bt(f))})}),e.querySelectorAll("[data-chat-cancel-delete]").forEach(o=>{o.addEventListener("click",()=>{t.confirmingDeleteMessageId===o.dataset.chatCancelDelete&&(t.confirmingDeleteMessageId=null),p()})}),e.querySelectorAll("[data-chat-edit-form]").forEach(o=>{o.addEventListener("submit",f=>{f.preventDefault();const D=f.currentTarget,de=D.dataset.chatEditForm;h(`edit-message:${de}`,()=>_t(D))})}),e.querySelectorAll("[data-chat-cancel-edit]").forEach(o=>{o.addEventListener("click",()=>vt())});const X=e.querySelector("[data-chat-file-input]");e.querySelector("[data-chat-attach-toggle]")?.addEventListener("click",()=>X?.click()),X?.addEventListener("change",o=>{oe(o.currentTarget.files),o.currentTarget.value=""}),e.querySelectorAll("[data-chat-remove-pending]").forEach(o=>{o.addEventListener("click",()=>et(o.dataset.chatRemovePending))});const Te=e.querySelector("[data-chat-send-form]");Te?.addEventListener("dragover",o=>o.preventDefault()),Te?.addEventListener("drop",o=>{o.preventDefault(),o.dataTransfer?.files?.length&&oe(o.dataTransfer.files)}),C?.addEventListener("paste",o=>{const f=[...o.clipboardData?.files||[]];f.length&&oe(f)}),a&&b(),Gt()}return N(),E=setInterval(()=>N(),3e4),typeof n.service.subscribeToConversationEvents=="function"&&(w=n.service.subscribeToConversationEvents(()=>Dt())),()=>{c=!0,E&&clearInterval(E),$&&clearTimeout($),w&&w(),e.removeEventListener?.("click",$e),typeof document<"u"&&(document.removeEventListener("keydown",Se),document.body?.classList.remove("wein-chat-root")),e.classList.remove("wein-chat-root"),e.classList.remove("chat-has-selection"),e.innerHTML=""}}}}const Ae="chat-attachments",De=5;function Qe(e){return String(e||"file").replace(/[^a-zA-Z0-9._-]+/g,"_")}function Dn(e,n){const t=`${Date.now().toString(36)}-${Math.random().toString(16).slice(2,8)}`;return`${e}/${t}-${Qe(n)}`}function On(e){return String(e).replace(/[\\%_]/g,n=>`\\${n}`)}function j(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data||[]}function B(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data}function ve(e){return e?{id:e.id,full_name:e.full_name,role:e.role,email:e.email??null}:null}function Rn(e){return{conversation_id:e.conversation_id,user_id:e.user_id,membership_role:e.membership_role,joined_at:e.joined_at,left_at:e.left_at,last_read_seq:Number(e.last_read_seq||0),notification_level:e.notification_level,profile:ve(e.profile||e.profiles)}}function W(e){return{id:e.id,conversation_id:e.conversation_id,message_seq:Number(e.message_seq||0),sender_id:e.sender_id,body:e.body,reply_to_id:e.reply_to_id,client_nonce:e.client_nonce,created_at:e.created_at,edited_at:e.edited_at,deleted_at:e.deleted_at,mentioned_user_ids:e.mentioned_user_ids||[],attachments:e.attachments||[],sender:ve(e.sender||e.profiles)}}function Oe(e,n){const t=(e.members||e.wein_chat_members||[]).map(Rn),r=e.last_message||e.wein_chat_messages||[],l=Array.isArray(r)?r.find(h=>h.deleted_at==null):null,c=l?W(l):null,m={id:e.id,kind:e.kind,title:e.title,created_by:e.created_by,created_at:e.created_at,archived_at:e.archived_at,members:t,last_message:c,unread_count:0};return m.unread_count=pn(m,n),m}function Ye({supabase:e,currentUserId:n}){if(!e)throw new Error("supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(r){const l=await e.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",r).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(De,{referencedTable:"wein_chat_messages"}).single();if(l.error)throw new Error(`fetch conversation: ${l.error.message||l.error}`);return Oe(l.data,n)}return{async listProfiles(){const r=await e.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return j(r,"list profiles").map(ve)},async listConversations(){const r=await e.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(De,{referencedTable:"wein_chat_messages"});return j(r,"list conversations").map(l=>Oe(l,n))},async listMessages(r){const l=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",r).is("deleted_at",null).order("message_seq",{ascending:!0});return j(l,"list messages").map(W)},async searchMessages(r){const l=(r||"").trim();if(!l)return[];const c=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).is("deleted_at",null).ilike("body",`%${On(l)}%`).order("created_at",{ascending:!1}).limit(50);return j(c,"search messages").map(W)},async createGroup(r,l=[]){const c=B(await e.rpc("wein_chat_create_group",{p_title:r}),"create group");for(const m of l)await this.addMember(c,m);return c},async createChannel(r){return B(await e.rpc("wein_chat_create_channel",{p_title:r}),"create channel")},async joinChannel(r){B(await e.rpc("wein_chat_join_channel",{p_conversation_id:r}),"join channel")},async listChannels(){const r=await e.from("wein_chat_conversations").select("id, kind, title, created_by, created_at, archived_at").eq("kind","channel").is("archived_at",null).order("title",{ascending:!0});return j(r,"list channels")},async getOrCreateDm(r){return B(await e.rpc("wein_chat_get_or_create_dm",{p_other_user_id:r}),"get or create DM")},async addMember(r,l){B(await e.rpc("wein_chat_add_member",{p_conversation_id:r,p_user_id:l}),"add member")},async removeMember(r,l){B(await e.rpc("wein_chat_remove_member",{p_conversation_id:r,p_user_id:l}),"remove member")},async renameConversation(r,l){const c=(l||"").trim();if(!c)throw new Error("Group title is required");const m=await e.from("wein_chat_conversations").update({title:c}).eq("id",r).select("id, title");if(!j(m,"rename conversation").length)throw new Error("rename conversation affected zero rows")},async setConversationArchived(r,l){const c=await e.from("wein_chat_conversations").update({archived_at:l?new Date().toISOString():null}).eq("id",r).select("id, archived_at");if(!j(c,"set conversation archived").length)throw new Error("set conversation archived affected zero rows")},async setMembershipRole(r,l,c){B(await e.rpc("wein_chat_set_membership_role",{p_conversation_id:r,p_user_id:l,p_role:c}),"set membership role")},async uploadAttachment(r,l){const c=Dn(r,l.name),m=await e.storage.from(Ae).upload(c,l,{contentType:l.type||"application/octet-stream",upsert:!1});if(m.error)throw new Error(`upload attachment: ${m.error.message||m.error}`);return{path:c,name:l.name||Qe(l.name),mime:l.type||"application/octet-stream",size:l.size||0}},async getSignedAttachmentUrl(r,l=3600){const c=await e.storage.from(Ae).createSignedUrl(r,l);if(c.error)throw new Error(`sign attachment url: ${c.error.message||c.error}`);const m=c.data?.signedUrl;if(!m)throw new Error("sign attachment url: no signed URL returned");return m},async sendMessage({conversationId:r,body:l,clientNonce:c,replyToId:m=null,mentionedUserIds:h=[],attachments:E=[]}){const w=await e.from("wein_chat_messages").insert({conversation_id:r,sender_id:n,body:l,client_nonce:c,reply_to_id:m,mentioned_user_ids:h.length?h:null,attachments:E}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(w.error)throw new Error(`send message: ${w.error.message||w.error}`);return W(w.data)},async updateMessage(r,l,c=[]){const m=await e.from("wein_chat_messages").update({body:l,edited_at:new Date().toISOString(),mentioned_user_ids:c.length?c:null}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(m.error)throw new Error(`update message: ${m.error.message||m.error}`);return W(m.data)},async deleteMessage(r){const l=await e.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(l.error)throw new Error(`delete message: ${l.error.message||l.error}`);return W(l.data)},async markRead(r,l){const c=await e.from("wein_chat_members").update({last_read_seq:l}).eq("conversation_id",r).eq("user_id",n).select("conversation_id, user_id, last_read_seq");if(!j(c,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(r,l){const c=await e.from("wein_chat_members").update({notification_level:l}).eq("conversation_id",r).eq("user_id",n).select("conversation_id, user_id, notification_level");if(!j(c,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(r){if(typeof e.channel!="function")return()=>{};const l=e.channel(`wein-chat:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},r).subscribe();return()=>{typeof e.removeChannel=="function"?e.removeChannel(l):typeof l.unsubscribe=="function"&&l.unsubscribe()}},fetchConversation:t}}function Nn(e){return typeof e.session.user=="object"&&e.session.user!==null?e.session.user:{}}function Pn(e){const n=Nn(e),t=n.id;if(!t)throw new Error("Team chat requires an authenticated user id.");return{id:t,full_name:e.session.fullName||n.email||"Portal user",role:e.session.role||"team",email:n.email||null}}let me=null;function Un(e){me=e||null}function jn(){const e=An();re({id:"team-chat",mount(n,t){const r=me;me=null;const l=Pn(t),c=Ye({supabase:t.session.client,currentUserId:l.id});return e.mount(n,{currentUser:l,service:c,initialConversationId:r})}})}function Fn(e=[]){return e.reduce((n,t)=>{const r=Number(t?.unread_count);return n+(Number.isFinite(r)&&r>0?r:0)},0)}function Bn(e,n){const t=String(e??"");return n>0?`(${n}) ${t}`:t}function xn(e,n={}){return e?e.author_id&&n[e.author_id]?.full_name?n[e.author_id].full_name:e.author_name||"Unknown":"Unknown"}function Ke(e){return!!e?.resolved_at}function Hn(e=[]){const n=new Map,t=[];e.forEach(c=>{n.set(c.id,{...c,replies:[]})}),n.forEach(c=>{c.reply_to_id&&n.has(c.reply_to_id)?n.get(c.reply_to_id).replies.push(c):t.push(c)});const r=(c,m)=>String(c.created_at||"").localeCompare(String(m.created_at||"")),l=c=>{c.replies.sort(r),c.replies.forEach(l)};return t.sort(r),t.forEach(l),t}function Wn(e=[]){return e.filter(n=>!Ke(n)).length}function Re(e,n=90){const t=String(e?.body||"").replace(/\s+/g," ").trim();return t.length<=n?t:`${t.slice(0,Math.max(0,n-1)).trimEnd()}…`}function R(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function Ne(e={}){return e.taskId?"Task discussion":e.providerId?"Provider discussion":e.offerId?"Offer discussion":"Record discussion"}function zn(e={}){return e.taskId?`Task ${e.taskId}`:e.providerId?`Provider ${e.providerId}`:e.offerId?`Offer ${e.offerId}`:"No record scope"}function Gn(){return{id:"record-discussion",mount(e,n){const t={comments:[],peopleById:Object.fromEntries((n.people||[]).map(b=>[b.id,b])),loading:!0,error:null,replyToId:null,taskSourceCommentId:null};let r=!1,l=null,c=null;e.classList.add("wein-discussion-root");async function m(){try{t.error=null,t.comments=await n.service.listComments(n.scope||{})}catch(b){t.error=b.message||String(b)}finally{t.loading=!1,r||A()}}async function h(b){const I=b.querySelector("[data-discussion-body]"),y=I.value.trim();y&&(I.value="",await n.service.postComment({...n.scope||{},body:y,replyToId:t.replyToId,people:n.people||[]}),t.replyToId=null,await m())}async function E(b){const I=e.querySelector(`[data-resolve-note="${CSS.escape(b)}"]`)?.value||"";await n.service.resolveComment(b,I),await m()}async function w(b){await n.service.reopenComment(b),await m()}async function v(b){const I=b.querySelector("[data-task-title]"),y=I.value.trim();!y||!t.taskSourceCommentId||(await n.service.createTaskFromComment(t.taskSourceCommentId,y,n.currentUser?.id||null),I.value="",t.taskSourceCommentId=null,await m())}function $(b,I=0){const y=Ke(b),F=xn(b,t.peopleById);return`
          <article class="discussion-comment${y?" resolved":""}" style="--depth:${Math.min(I,4)}">
            <div class="discussion-comment-meta">
              <span>${R(F)}</span>
              <span>${R(b.created_at||"")}</span>
              ${y?'<span class="discussion-resolved-pill">Resolved</span>':""}
            </div>
            <div class="discussion-comment-body">${R(b.body)}</div>
            ${b.resolved_note?`<div class="discussion-resolved-note">${R(b.resolved_note)}</div>`:""}
            <div class="discussion-actions">
              <button type="button" data-discussion-reply="${R(b.id)}">Reply</button>
              ${y?`<button type="button" data-discussion-reopen="${R(b.id)}">Reopen</button>`:`<button type="button" data-discussion-resolve="${R(b.id)}">Resolve</button>`}
              <button type="button" data-discussion-task="${R(b.id)}">Create task</button>
            </div>
            ${y?"":`<input class="discussion-resolve-note" data-resolve-note="${R(b.id)}" placeholder="Optional resolve note">`}
            ${b.replies?.length?`<div class="discussion-replies">${b.replies.map(z=>$(z,I+1)).join("")}</div>`:""}
          </article>
        `}function M(){if(!t.taskSourceCommentId)return"";const b=t.comments.find(I=>I.id===t.taskSourceCommentId);return`
          <form class="discussion-task-box" data-discussion-task-form>
            <div>
              <div class="discussion-eyebrow">Create task from comment</div>
              <p>${R(Re(b))}</p>
            </div>
            <input data-task-title type="text" placeholder="Task title">
            <div class="discussion-task-actions">
              <button type="submit">Create task</button>
              <button type="button" data-discussion-task-cancel>Cancel</button>
            </div>
          </form>
        `}function A(){const b=Hn(t.comments),I=t.replyToId?t.comments.find(y=>y.id===t.replyToId):null;e.innerHTML=`
          <section class="discussion-shell" aria-label="${R(Ne(n.scope))}">
            <header class="discussion-header">
              <div>
                <div class="discussion-eyebrow">${R(Ne(n.scope))}</div>
                <h2>Discussion</h2>
                <p>${R(zn(n.scope))}</p>
              </div>
              <span class="discussion-count">${Wn(t.comments)} unresolved</span>
            </header>
            ${t.error?`<div class="discussion-error">${R(t.error)}</div>`:""}
            ${M()}
            <div class="discussion-list">
              ${t.loading?'<div class="discussion-muted">Loading discussion...</div>':""}
              ${b.map(y=>$(y)).join("")}
              ${!t.loading&&!b.length?'<div class="discussion-muted">No comments yet.</div>':""}
            </div>
            <form class="discussion-composer" data-discussion-form>
              ${I?`
                <div class="discussion-replying">
                  Replying to: ${R(Re(I,70))}
                  <button type="button" data-discussion-cancel-reply>Cancel</button>
                </div>
              `:""}
              <textarea data-discussion-body rows="3" placeholder="Write a record-attached note..."></textarea>
              <button type="submit">${I?"Reply":"Post comment"}</button>
            </form>
          </section>
        `,e.querySelector("[data-discussion-form]")?.addEventListener("submit",y=>{y.preventDefault(),h(y.currentTarget)}),e.querySelector("[data-discussion-cancel-reply]")?.addEventListener("click",()=>{t.replyToId=null,A()}),e.querySelector("[data-discussion-task-cancel]")?.addEventListener("click",()=>{t.taskSourceCommentId=null,A()}),e.querySelector("[data-discussion-task-form]")?.addEventListener("submit",y=>{y.preventDefault(),v(y.currentTarget)}),e.querySelectorAll("[data-discussion-reply]").forEach(y=>{y.addEventListener("click",()=>{t.replyToId=y.dataset.discussionReply,A()})}),e.querySelectorAll("[data-discussion-resolve]").forEach(y=>{y.addEventListener("click",()=>E(y.dataset.discussionResolve))}),e.querySelectorAll("[data-discussion-reopen]").forEach(y=>{y.addEventListener("click",()=>w(y.dataset.discussionReopen))}),e.querySelectorAll("[data-discussion-task]").forEach(y=>{y.addEventListener("click",()=>{t.taskSourceCommentId=y.dataset.discussionTask,A()})})}return m(),l=setInterval(()=>m(),3e4),typeof n.service.subscribeToDiscussionEvents=="function"&&(c=n.service.subscribeToDiscussionEvents(()=>m())),()=>{r=!0,l&&clearInterval(l),c&&c(),e.classList.remove("wein-discussion-root"),e.innerHTML=""}}}}function H(e){if(e)throw e}function Vn({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t({taskId:w,providerId:v,offerId:$}={}){let M=e.from("wein_comments").select("*").order("created_at",{ascending:!0});w&&(M=M.eq("task_id",w)),v&&(M=M.eq("provider_id",v)),$&&(M=M.eq("offer_id",$));const{data:A,error:b}=await M;return H(b),A||[]}async function r({body:w,taskId:v=null,providerId:$=null,offerId:M=null,replyToId:A=null,people:b=[]}){const I=v?{task_id:v}:$?{provider_id:$}:M?{offer_id:M}:null;if(!I)throw new Error("postComment requires taskId, providerId, or offerId");const{data:y,error:F}=await e.from("wein_comments").insert({...I,reply_to_id:A,body:w,author_role:"team"}).select("*").single();H(F);for(const z of te(w,b))try{await m(y.id,z)}catch(ie){console.error("Failed to record comment mention",ie)}return y}async function l(w,v=""){const{data:$,error:M}=await e.from("wein_comments").update({resolved_at:new Date().toISOString(),resolved_note:v}).eq("id",w).select("*");if(H(M),!$?.length)throw new Error("Resolve affected zero comments");return $[0]}async function c(w){const{data:v,error:$}=await e.from("wein_comments").update({resolved_at:null,resolved_note:null}).eq("id",w).select("*");if(H($),!v?.length)throw new Error("Reopen affected zero comments");return v[0]}async function m(w,v){const{data:$,error:M}=await e.from("wein_comment_mentions").insert({comment_id:w,mentioned_user_id:v}).select("*");return H(M),$?.[0]||null}async function h(w,v,$=null,M=null){const{data:A,error:b}=await e.rpc("wein_create_task_from_comment",{p_comment_id:w,p_title:v,p_assigned_to_user_id:$,p_due_date:M});return H(b),A}function E(w){if(!e.channel)return()=>{};const v=e.channel(`record-discussion:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},w).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},w).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_task_links"},w).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(v);if(v?.unsubscribe)return v.unsubscribe()}}return{listComments:t,postComment:r,resolveComment:l,reopenComment:c,addMention:m,createTaskFromComment:h,subscribeToDiscussionEvents:E}}function P(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}const Qn={critical:"Critical",high:"High",medium:"Medium",low:"Low"},Yn={task:"Task",mention:"Mention",discussion:"Discussion",review:"Review"};function Kn(e){if(!e)return"No due date";const n=new Date(e);return Number.isNaN(n.getTime())?String(e):n.toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function Jn(e=[]){return["critical","high","medium","low"].map(n=>({severity:n,items:e.filter(t=>t.severity===n)})).filter(n=>n.items.length)}function Xn(){return{id:"work-inbox",mount(e,n){const t={items:[],loading:!0,error:null};let r=!1,l=null,c=null;e.classList.add("wein-work-inbox-root");async function m(){try{t.error=null,t.items=await n.service.loadInbox()}catch(v){t.error=v.message||String(v)}finally{t.loading=!1,r||w()}}function h(v){if(typeof n.onSelectItem=="function"){n.onSelectItem(v);return}v.href&&(window.location.hash=v.href)}function E(v){return`
          <button type="button" class="work-inbox-item severity-${P(v.severity)}" data-inbox-item="${P(v.kind)}:${P(v.entity_id)}:${P(v.reason_code)}">
            <span class="work-inbox-kind">${P(Yn[v.kind]||v.kind)}</span>
            <span class="work-inbox-title">${P(v.title)}</span>
            <span class="work-inbox-reason">${P(v.reason_code.replaceAll("_"," "))}</span>
            <span class="work-inbox-due">${P(Kn(v.due_at))}</span>
            <span class="work-inbox-action">${P(v.next_action)}</span>
          </button>
        `}function w(){const v=Jn(t.items);e.innerHTML=`
          <section class="work-inbox-shell" aria-label="Work inbox">
            <header class="work-inbox-header">
              <div>
                <div class="work-inbox-eyebrow">Today extension</div>
                <h2>Work inbox</h2>
                <p>Normalized tasks, mentions, discussion replies, and review signals.</p>
              </div>
              <div class="work-inbox-total">${t.items.length} item${t.items.length===1?"":"s"}</div>
            </header>
            ${t.error?`<div class="work-inbox-error">${P(t.error)}</div>`:""}
            <div class="work-inbox-toolbar">
              <button type="button" data-inbox-refresh>Refresh</button>
            </div>
            <div class="work-inbox-list">
              ${t.loading?'<div class="work-inbox-muted">Loading inbox...</div>':""}
              ${v.map($=>`
                <section class="work-inbox-group">
                  <h3>${P(Qn[$.severity])}</h3>
                  ${$.items.map(E).join("")}
                </section>
              `).join("")}
              ${!t.loading&&!t.items.length?'<div class="work-inbox-muted">No attention items right now.</div>':""}
            </div>
          </section>
        `,e.querySelector("[data-inbox-refresh]")?.addEventListener("click",()=>m()),e.querySelectorAll("[data-inbox-item]").forEach($=>{$.addEventListener("click",()=>{const M=$.dataset.inboxItem,A=t.items.find(b=>`${b.kind}:${b.entity_id}:${b.reason_code}`===M);A&&h(A)})})}return m(),l=setInterval(()=>m(),6e4),typeof n.service.subscribeToInboxEvents=="function"&&(c=n.service.subscribeToInboxEvents(()=>m())),()=>{r=!0,l&&clearInterval(l),c&&c(),e.classList.remove("wein-work-inbox-root"),e.innerHTML=""}}}}const Pe={critical:0,high:1,medium:2,low:3};function _e(e,n=new Date){if(!e)return"low";const t=new Date(e);if(Number.isNaN(t.getTime()))return"low";const r=t.getTime()-n.getTime();return r<0?"critical":r<=1440*60*1e3?"high":r<=4320*60*1e3?"medium":"low"}function Zn(e,{now:n=new Date}={}){return{kind:"task",entity_id:e.id,title:e.title||"Untitled task",reason_code:e.due_date?"task_due":"task_open",severity:_e(e.due_date,n),owner_id:e.assigned_to_user_id||e.owner_id||null,due_at:e.due_date||null,next_action:"Open task",href:`#tasks/${e.id}`,source:e}}function ea(e,{comment:n,currentUserId:t}={}){return{kind:"mention",entity_id:e.comment_id,title:n?.body?`Mention: ${n.body}`:"Mention in discussion",reason_code:"unresolved_mention",severity:n?.resolved_at?"low":"high",owner_id:t||e.mentioned_user_id,due_at:n?.created_at||e.created_at||null,next_action:"Reply or resolve",href:`#comments/${e.comment_id}`,source:{mention:e,comment:n}}}function ta(e,{currentUserId:n,now:t=new Date}={}){return{kind:"discussion",entity_id:e.id,title:e.body||"Discussion awaiting reply",reason_code:"thread_awaiting_reply",severity:_e(e.next_reply_due_at||e.created_at,t),owner_id:n||null,due_at:e.next_reply_due_at||null,next_action:"Reply in thread",href:`#comments/${e.id}`,source:e}}function na(e,{now:n=new Date}={}){return{kind:e.kind||"review",entity_id:e.id,title:e.title||e.offer_title||"Founder review needed",reason_code:e.reason_code||"founder_review",severity:_e(e.due_at||e.created_at,n),owner_id:e.owner_id||null,due_at:e.due_at||e.created_at||null,next_action:"Review",href:e.href||`#review/${e.id}`,source:e}}function aa(e=[]){return[...e].sort((n,t)=>{const r=(Pe[n.severity]??9)-(Pe[t.severity]??9);return r||String(n.due_at||"").localeCompare(String(t.due_at||""))})}function sa(e=[]){const n=new Set;return e.filter(t=>{const r=`${t.kind}:${t.entity_id}:${t.reason_code}`;return n.has(r)?!1:(n.add(r),!0)})}function ra({tasks:e=[],mentions:n=[],commentsById:t={},awaitingReplies:r=[],founderReviews:l=[]},c={}){const m=[...e.map(h=>Zn(h,c)),...n.map(h=>ea(h,{...c,comment:t[h.comment_id]})),...r.map(h=>ta(h,c)),...l.map(h=>na(h,c))];return aa(sa(m))}function Ue(e){if(e)throw e}function ia({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(){let m=e.from("wein_tasks").select("*").neq("status","done").order("due_date",{ascending:!0,nullsFirst:!1});n&&(m=m.eq("assigned_to_user_id",n));const{data:h,error:E}=await m;return Ue(E),h||[]}async function r(){const{data:m,error:h}=await e.from("wein_comment_mentions").select("comment_id,mentioned_user_id,created_at,wein_comments(*)").eq("mentioned_user_id",n).is("wein_comments.resolved_at",null).order("created_at",{ascending:!0});return Ue(h),m||[]}async function l(){const[m,h]=await Promise.all([t(),r()]),E={},w=h.map(v=>{const $=v.wein_comments||v.comment||null;return $?.id&&(E[$.id]=$),{comment_id:v.comment_id,mentioned_user_id:v.mentioned_user_id,created_at:v.created_at}});return ra({tasks:m,mentions:w,commentsById:E},{currentUserId:n})}function c(m){if(!e.channel)return()=>{};const h=e.channel(`work-inbox:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_tasks"},m).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},m).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},m).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(h);if(h?.unsubscribe)return h.unsubscribe()}}return{fetchOpenTasks:t,fetchUnresolvedMentions:r,loadInbox:l,subscribeToInboxEvents:c}}const Je=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function oa(e){for(const n of Je)re({id:n,mount:()=>{e[n]()}})}function be(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const ca=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function la(e,n){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${ca.map(t=>`<button class="chip ${e===t?"active":""}" type="button" onclick="${n}('${t.replace(/'/g,"\\'")}')">${t==="all"?"All":be(t)}</button>`).join("")}</div>`}function da(e,n){return n==="all"||String(e||"")===n}function ua(e){return String(e?.category||e?.vertical||"-")}function ma(e){const n=String(e||"").toLowerCase();return n.includes("dining")?"dining":n.includes("health")?"health":n.includes("fun")?"fun":n.includes("hotel")?"hotels":""}function ha(e,n=Date.now()){return e?Math.floor((n-new Date(e).getTime())/864e5):0}function he(e=new Date){const n=new Date(e);return n.setHours(0,0,0,0),n}function fa(e,n=new Date){return e?Math.round((he(n).getTime()-he(e).getTime())/864e5):null}function Xe(e,n){let t=String(e||"").replace(/\D/g,"");if(!t)return null;t.startsWith("0")&&(t=`20${t.slice(1)}`);const r=`Hi! Following up on the WeIN offer sheet for ${n} - do you have 5 minutes today?`;return`https://wa.me/${t}?text=${encodeURIComponent(r)}`}function pa(e,n){const t=Xe(e,n);return t?`<a class="mini-btn" href="${be(t)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function Y(e){return e.id}function ga(e){return L("profiles").find(n=>Y(n)===e)??null}function va(e){return L("providers").find(n=>Y(n)===e)??null}function _a(e){return L("leads").find(n=>Y(n)===e)??null}function ba(e){return L("tasks").find(n=>Y(n)===e)??null}function ya(e){return L("offers").find(n=>Y(n)===e)??null}function wa(e){return L("offers").filter(n=>n.provider_id===e)}function $a(e){return L("tasks").filter(n=>n.provider_id===e)}function Sa(e){return L("tasks").filter(n=>n.lead_id===e)}const ka=Object.freeze(Object.defineProperty({__proto__:null,leadById:_a,offerById:ya,offersForProvider:wa,profileById:ga,providerById:va,taskById:ba,tasksForLead:Sa,tasksForProvider:$a},Symbol.toStringTag,{value:"Module"}));function Ca(){const e=document.title;let n=!1;async function t(){const l=window.WEIN?.user?.id;if(l)try{const m=await Ye({supabase:ne(),currentUserId:l}).listConversations(),h=Fn(m),E=document.querySelector("[data-chat-unread-badge]");E&&(E.textContent=String(h),E.style.display=h>0?"inline-flex":"none"),document.title=Bn(e,h)}catch{}}const r=setInterval(()=>{window.WEIN?.user?.id&&!n&&(n=!0,clearInterval(r),setInterval(t,3e4)),t()},2e3)}mn();jn();Ca();const Ze={api:He,auth:{canDelete:fe,canManageDeals:Fe,canEditProviderProfile:Be,navHiddenForRole:pe,defaultViewForRole:xe},platform:{getSupabaseClient:ne,getAccessToken:se,getSessionContext:Xt},shared:{escapeHtml:be,daysSince:ha,startOfLocalDay:he,dayDiffFromToday:fa,whatsappLink:Xe,whatsappButtonHtml:pa,categoryChipsHtml:la,matchesCategoryFilter:da,categoryLabel:ua,catBadgeClass:ma},core:{createPortalContext:cn,getView:Ge,mountView:un,registeredViewIds:ln,registerView:re},legacy:{LEGACY_VIEW_IDS:Je,registerLegacyViews:oa},features:{requestOpenChatConversation:Un,createDiscussionViewModule:Gn,createSupabaseDiscussionService:Vn,createWorkInboxViewModule:Xn,createSupabaseWorkInboxService:ia},store:ze,selectors:ka};window.WEIN_PORTAL_MODULES=Ze;for(const e of window.WEIN_PORTAL_MODULES_READY??[])e(Ze);window.WEIN_PORTAL_MODULES_READY=[];
