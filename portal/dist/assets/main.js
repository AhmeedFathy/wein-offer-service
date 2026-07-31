function Be(e){return typeof e=="object"&&e!==null?e.role:e}function fe(e){const n=Be(e);return n==="admin"||n==="manager"}const Fe=fe;function xe(e){const n=Be(e);return n==="admin"||n==="manager"||n==="deal_breaker"}const mn={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function ge(e){return e?mn[e]??[]:[]}function He(e){return ge(e).includes("pipeline")?"tasks":"pipeline"}function U(){return window.WEIN_PORTAL_LEGACY??{}}function ae(){const e=U().supabaseClient;if(!e)throw new Error("Portal Supabase client is not available yet.");return e}function se(){const e=U().getSupabaseUrl?.();if(!e)throw new Error("Portal Supabase URL is not available yet.");return e}function hn(){const e=U().getSupabaseAnonKey?.();if(!e)throw new Error("Portal Supabase anon key is not available yet.");return e}function re(){return U().getAccessToken?.()??null}function pn(){return{client:ae(),accessToken:re()}}class fn extends Error{constructor(n,t,i){super(n),this.status=t,this.body=i,this.name="PortalApiError"}status;body}function Q(){const e=U().headers?.();if(e)return e;const n=hn();return{apikey:n,Authorization:`Bearer ${re()||n}`,"Content-Type":"application/json"}}async function ve(e,n){if(e.ok)return;const t=await e.text();throw new fn(`Supabase ${n} failed: ${e.status}${t?` ${t}`:""}`,e.status,t)}async function gn(e){const n=U().get;if(n)return n(e);const t=await fetch(`${se()}/rest/v1/${e}`,{headers:Q()});return await ve(t,"GET"),t.json()}async function vn(e,n){const t=U().post;if(t)return t(e,n);const i=await fetch(`${se()}/rest/v1/${e}`,{method:"POST",headers:{...Q(),Prefer:"return=representation"},body:JSON.stringify(n)});return await ve(i,"POST"),i.json()}async function _n(e,n){const t=U().patch;return t?t(e,n):(await fetch(`${se()}/rest/v1/${e}`,{method:"PATCH",headers:Q(),body:JSON.stringify(n)})).ok}async function bn(e){const n=U().delete;if(n)return n(e);const t=await fetch(`${se()}/rest/v1/${e}`,{method:"DELETE",headers:Q()});return await ve(t,"DELETE"),!0}const We={headers:Q,get:gn,post:vn,patch:_n,delete:bn},yn={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function wn(){const e=U().getCaches?.();return e?{providers:e.providers??[],offers:e.offers??[],negotiations:e.negotiations??[],files:e.files??[],leads:e.leads??[],outcomes:e.outcomes??[],tasks:e.tasks??[],profiles:e.profiles??[],redemptions:e.redemptions??[],campaigns:e.campaigns??[],calendarNotes:e.calendarNotes??[]}:yn}function L(e){return wn()[e]}function ze(e,n){const t=U().setCache;if(!t)throw new Error("Portal cache bridge is not available yet.");t(e,[...n])}function $n(e,n){ze(e,n(L(e)))}const Ge={get providers(){return L("providers")},get offers(){return L("offers")},get negotiations(){return L("negotiations")},get files(){return L("files")},get leads(){return L("leads")},get outcomes(){return L("outcomes")},get tasks(){return L("tasks")},get profiles(){return L("profiles")},get redemptions(){return L("redemptions")},get campaigns(){return L("campaigns")},get calendarNotes(){return L("calendarNotes")},getCache:L,replaceCache:ze,updateCache:$n};function ee(){const e=window.WEIN??{};return{user:e.user,role:e.role??sessionStorage.getItem("weinRole"),fullName:e.fullName??null,accessToken:re(),client:ae()}}function Sn(){const e=ee();return{api:We,store:Ge,session:e,permissions:{canDelete:()=>fe(ee()),canManageDeals:()=>Fe(ee()),canEditProviderProfile:()=>xe(ee()),navHiddenForRole:ge,defaultViewForRole:He},navigate(n,t){window.showView?.(n,t)}}}const V=new Map;let te=null;function ie(e){if(!e.id)throw new Error("View id is required.");if(V.has(e.id))throw new Error(`View already registered: ${e.id}`);V.set(e.id,e)}function Ve(e){return V.get(e)}function Cn(){return[...V.keys()]}function kn(){if(!te)return;const e=te;te=null,e()}function En(e,n,t){const i=Ve(e);if(!i)throw new Error(`Unknown portal view: ${e}`);kn();const l=i.mount(n,t);te=typeof l=="function"?l:null}function Dn(){V.has("__dummy_cleanup_probe")||ie({id:"__dummy_cleanup_probe",mount(e){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,e.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function Mn(e="chat"){const n=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${e}-${n}`}function me(e,n){return e.kind==="group"?e.title||"Untitled group":e.kind==="channel"?e.title||"Untitled channel":(e.members||[]).map(i=>i.profile).find(i=>i&&i.id!==n)?.full_name||"Direct message"}function Tn(e){return[...e].sort((n,t)=>{const i=n.last_message?.created_at||n.created_at,l=t.last_message?.created_at||t.created_at;return new Date(l).getTime()-new Date(i).getTime()})}function Ln(e,n){const t=(e.members||[]).find(l=>l.user_id===n),i=e.last_message?.message_seq||0;return Math.max(0,i-(t?.last_read_seq||0))}function In(e){return[...e].sort((n,t)=>{const i=(n.unread_count||0)>0,l=(t.unread_count||0)>0;if(i!==l)return i?-1:1;const o=n.last_message?.created_at||n.created_at,m=t.last_message?.created_at||t.created_at;return new Date(m).getTime()-new Date(o).getTime()})}const qn=["channel","group","dm"];function An(e){const n={channel:[],group:[],dm:[]};for(const t of e)(n[t.kind]||n.dm).push(t);return qn.map(t=>({kind:t,conversations:In(n[t])}))}function On(e){return{id:e.id,kind:"channel",title:e.title??null,topic:e.topic??null,description:e.description??null,created_by:e.created_by,creator_name:e.creator_name??null,created_at:e.created_at,archived_at:e.archived_at??null,member_count:Number(e.member_count)||0,joined_by_current_user:!!e.joined_by_current_user}}function Rn(e){if(!e)return"No messages yet";const n=(e.deleted_at?"Message deleted":e.body||"").trim();return n.length>82?`${n.slice(0,79)}...`:n}function Nn(e,n){return{...e,[n]:{pending:!0,error:null}}}function Pn(e,n){return{...e,[n]:{pending:!1,error:null}}}function Un(e,n,t){return{...e,[n]:{pending:!1,error:t}}}function q(e,n){return!!e?.[n]?.pending}function D(e,n){return e?.[n]?.error??null}const jn=[["only an admin or manager may create a channel","Only an admin or manager can create a channel."],["channel name is required","Enter a channel name."],["only channels can be joined this way","That conversation can't be joined this way."],["this channel has been archived","This channel has been archived and can no longer be joined."],["conversation not found","This conversation no longer exists."],["chat conversation immutable columns cannot be updated","That change isn't allowed."],["only group or channel conversations can be renamed","Direct messages can't be renamed."],["only channel details can be edited this way","That change isn't allowed here."],["only the channel owner, an admin, or a manager may edit channel details","Only the channel owner, an admin, or a manager can edit channel details."],["channel topic must be 160 characters or fewer","Topic must be 160 characters or fewer."],["channel description must be 1000 characters or fewer","Description must be 1000 characters or fewer."]];function Le(e){const n=(e instanceof Error?e.message:String(e??"")).toLowerCase(),t=jn.find(([i])=>n.includes(i));return t?t[1]:"Something went wrong. Please try again."}function Qe(e=[]){return e.reduce((n,t)=>{const i=Number(t?.unread_count);return n+(Number.isFinite(i)&&i>0?i:0)},0)}function Bn(e,n){const t=String(e??"");return n>0?`(${n}) ${t}`:t}const Fn=/[\s\p{P}]/u,xn=/[\s\p{P}]/u;function Ye(e,n){return n===0?!0:Fn.test(e[n-1])}function Hn(e,n){return n>=e.length?!0:xn.test(e[n])}function ne(e="",n=[]){const t=String(e??"");if(!t.includes("@"))return[];const i=n.filter(h=>h&&h.id&&h.full_name).map(h=>({id:h.id,name:String(h.full_name)})).sort((h,E)=>E.name.length-h.name.length);if(!i.length)return[];const l=t.toLowerCase(),o=[],m=new Set;for(let h=0;h<t.length;h+=1){if(t[h]!=="@"||!Ye(t,h))continue;const E=h+1;for(const w of i){const v=E+w.name.length;if(l.startsWith(w.name.toLowerCase(),E)&&Hn(t,v)){m.has(w.id)||(m.add(w.id),o.push(w.id)),h=v-1;break}}}return o}function Wn(e="",n=[]){const t=new Set(ne(e,n));return n.filter(i=>i&&t.has(i.id)&&i.full_name).map(i=>String(i.full_name)).sort((i,l)=>l.length-i.length)}function zn(e="",n=0){const t=String(e??""),i=Math.max(0,Math.min(Number(n)||0,t.length)),l=40;for(let o=i-1;o>=0&&i-o<=l;o-=1){const m=t[o];if(m==="@")return Ye(t,o)?{query:t.slice(o+1,i),start:o}:null;if(m===`
`)return null}return null}const Gn={channel:"Channels",group:"Private groups",dm:"Direct messages"};function u(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function G(e){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[e]||e}function Vn(e){return`${e}-${Math.random().toString(16).slice(2)}-${Date.now().toString(36)}`}function Ie(e){return typeof e=="string"&&e.startsWith("image/")}function Qn(e){const n=Number(e)||0;return n<1024?`${n} B`:n<1024*1024?`${(n/1024).toFixed(1)} KB`:`${(n/(1024*1024)).toFixed(1)} MB`}function qe(e){return e==="application/pdf"?"ti-file-type-pdf":e?.includes("word")?"ti-file-type-doc":e?.includes("sheet")||e?.includes("excel")?"ti-file-type-xls":"ti-file"}function Yn(e,n=new Date){if(!e)return"";const t=new Date(e);if(Number.isNaN(t.getTime()))return"";const i=n.getTime()-t.getTime(),l=Math.floor(i/6e4);if(l<1)return"now";if(l<60)return`${l}m`;const o=Math.floor(l/60);return o<24?`${o}h`:i<6*864e5?t.toLocaleDateString(void 0,{weekday:"short"}):t.toLocaleDateString(void 0,{month:"short",day:"numeric"})}const Kn=300*1e3;function Jn(e,n){if(!n||e.sender_id!==n.sender_id)return!0;const t=new Date(e.created_at).getTime()-new Date(n.created_at).getTime();return!(t>=0&&t<Kn)}function Xn(){return{id:"team-chat",mount(e,n){const t={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,composeOpen:!1,composeSearch:"",composeGroupTitle:"",composeChannelTitle:"",composeSelectedMemberIds:new Set,sidebarSectionsCollapsed:{},browseChannelsOpen:!1,browseChannelsList:[],browseChannelsLoading:!1,browseChannelsError:null,browseChannelsSearch:"",membersOpen:!1,memberAddOpen:!1,memberSearch:"",memberSelectedIds:new Set,renameOpen:!1,renameDraft:"",archiveConfirmOpen:!1,channelDetailsOpen:!1,channelDetailsTitleDraft:"",channelDetailsTopicDraft:"",channelDetailsDescriptionDraft:"",leaveChannelConfirmOpen:!1,mentionQuery:null,mentionIndex:0,mentionStart:0,mentionDraft:"",pendingAttachments:[],openMessageMenuId:null,confirmingDeleteMessageId:null,searchOpen:!1,searchQuery:"",searchResults:[],searchLoading:!1,searchError:null,loading:!0,error:null,actionState:{}},i=new Map,l=new Set;let o=!1,m=n.initialConversationId||null;async function h(a,s){if(!q(t.actionState,a)){t.actionState=Nn(t.actionState,a),f();try{if(await s(),o)return;t.actionState=Pn(t.actionState,a)}catch(r){if(o)return;t.actionState=Un(t.actionState,a,Le(r))}f()}}let E=null,w=null,v=!1,$=null,M=0;function A(){const a=e.querySelector(".chat-message-list");return a?a.scrollHeight-a.scrollTop-a.clientHeight<80:!0}function b(){const a=e.querySelector(".chat-message-list");a&&(a.scrollTop=a.scrollHeight)}function T(a){a.style.height="auto",a.style.height=`${Math.min(a.scrollHeight,120)}px`}function y(a){return a?a.members.filter(s=>!s.left_at&&s.profile).map(s=>s.profile):[]}function F(a){const s=String(t.mentionQuery||"").trim().toLowerCase(),r=y(a).filter(d=>d.id!==n.currentUser.id);return s?r.filter(d=>(d.full_name||"").toLowerCase().includes(s)):r}function z({rerender:a=!0}={}){t.mentionQuery!==null&&(t.mentionQuery=null,t.mentionIndex=0,a&&f())}function ce(a){t.mentionDraft=a.value;const s=zn(a.value,a.selectionStart??a.value.length),r=s?s.query:null;return r===t.mentionQuery?!1:(t.mentionQuery=r,t.mentionStart=s?s.start:0,t.mentionIndex=0,!0)}function we(a,s){const r=e.querySelector("[data-chat-composer]");if(!r||!s)return;const d=r.selectionStart??r.value.length,g=r.value.slice(0,t.mentionStart),S=r.value.slice(d),C=`@${s.full_name} `,_=`${g}${C}${S}`,I=g.length+C.length;t.mentionQuery=null,t.mentionIndex=0,t.mentionDraft=_,f();const k=e.querySelector("[data-chat-composer]");k&&(k.value=_,T(k),k.focus(),k.setSelectionRange?.(I,I))}function $e(a,s){const r=F(a);if(!r.length)return;const d=(t.mentionIndex+s+r.length)%r.length;t.mentionIndex=d;const g=e.querySelector("[data-chat-composer]")?.value??t.mentionDraft,S=e.querySelector("[data-chat-composer]")?.selectionStart??g.length;t.mentionDraft=g,f();const C=e.querySelector("[data-chat-composer]");C&&(C.value=g,T(C),C.focus(),C.setSelectionRange?.(S,S))}e.classList.add("wein-chat-root"),typeof document<"u"&&document.body?.classList.add("wein-chat-root");function Se(a){const s=a.target;if(s instanceof Element){if(t.composeOpen&&!s.closest("[data-chat-compose-popover]")&&!s.closest("[data-chat-compose-toggle]")){K();return}if(t.membersOpen&&!s.closest("[data-chat-members-panel]")&&!s.closest("[data-chat-members-toggle]")){J();return}t.openMessageMenuId&&!s.closest("[data-chat-message-menu-panel]")&&!s.closest("[data-chat-message-menu]")&&(t.openMessageMenuId=null,f())}}function Ce(a){if(a.key==="Escape"){if(t.composeOpen){K();return}if(t.membersOpen){J();return}(t.openMessageMenuId||t.confirmingDeleteMessageId)&&(t.openMessageMenuId=null,t.confirmingDeleteMessageId=null,f())}}e.addEventListener?.("click",Se),typeof document<"u"&&document.addEventListener("keydown",Ce);async function O({keepMessages:a=!0}={}){try{t.error=null;const[s,r]=await Promise.all([n.service.listProfiles(),n.service.listConversations()]);if(t.profiles=s,t.conversations=Tn(r),m&&(t.conversations.some(d=>d.id===m)&&(t.selectedConversationId=m),m=null),!t.selectedConversationId&&t.conversations.length&&(t.selectedConversationId=t.conversations[0].id),t.selectedConversationId&&a){t.messages=await n.service.listMessages(t.selectedConversationId);const d=t.messages.at(-1)?.message_seq||0;if(d)try{await n.service.markRead(t.selectedConversationId,d)}catch(g){console.error("Failed to mark chat messages as read",g)}}}catch(s){t.error=s.message||String(s)}finally{t.loading=!1,o||f()}}async function x(a){t.selectedConversationId=a,t.membersOpen=!1,t.memberAddOpen=!1,t.memberSearch="",t.memberSelectedIds=new Set,t.renameOpen=!1,t.renameDraft="",t.archiveConfirmOpen=!1,t.pendingAttachments=[],e.classList.add("chat-has-selection"),t.messages=await n.service.listMessages(a),v=!0,o||f();const s=t.messages.at(-1)?.message_seq||0;if(s)try{await n.service.markRead(a,s)}catch(r){console.error("Failed to mark chat messages as read",r)}await O()}function oe(){e.classList.remove("chat-has-selection")}function le(a){const s=t.selectedConversationId;if(!s)return;const r=[...a||[]];for(const d of r){const g={id:Vn("pending"),name:d.name,mime:d.type||"application/octet-stream",size:d.size,status:"uploading",error:null,uploaded:null};t.pendingAttachments=[...t.pendingAttachments,g],n.service.uploadAttachment(s,d).then(S=>{g.status="done",g.uploaded=S,o||f()}).catch(S=>{g.status="error",g.error=S?.message||"Upload failed",o||f()})}f()}function nt(a){t.pendingAttachments=t.pendingAttachments.filter(s=>s.id!==a),f()}async function at(a){const s=a.querySelector("[data-chat-composer]"),r=s.value.trim(),d=t.pendingAttachments.some(k=>k.status==="uploading"),g=t.pendingAttachments.filter(k=>k.status==="done").map(k=>k.uploaded);if(d||!r&&!g.length||!t.selectedConversationId)return;const S=t.replyToMessageId,C=t.conversations.find(k=>k.id===t.selectedConversationId)||null,_=ne(r,y(C));s.value="",t.replyToMessageId=null,t.mentionQuery=null,t.mentionDraft="",t.pendingAttachments=[];const I=await n.service.sendMessage({conversationId:t.selectedConversationId,body:r,clientNonce:Mn("portal-chat"),replyToId:S,mentionedUserIds:_,attachments:g});t.messages=[...t.messages,I],v=!0,o||f();try{await n.service.markRead(t.selectedConversationId,I.message_seq)}catch(k){console.error("Failed to mark chat message as read",k)}await O()}function st(a){a&&(t.replyToMessageId=a,f(),e.querySelector("[data-chat-composer]")?.focus())}function rt(){t.replyToMessageId=null,f()}function it(){t.composeOpen=!0,t.searchOpen=!1,t.browseChannelsOpen=!1,f(),e.querySelector("[data-chat-compose-search]")?.focus()}function K({reset:a=!1}={}){t.composeOpen=!1,a&&(t.composeSearch="",t.composeGroupTitle="",t.composeChannelTitle="",t.composeSelectedMemberIds=new Set),f()}function ct(){t.searchOpen=!0,t.composeOpen=!1,t.browseChannelsOpen=!1,f(),e.querySelector("[data-chat-search-input]")?.focus()}function de(){t.searchOpen=!1,t.searchQuery="",t.searchResults=[],t.searchLoading=!1,t.searchError=null,$&&clearTimeout($),f()}async function ot(a){const s=a.trim();if(!s){t.searchResults=[],t.searchLoading=!1,t.searchError=null,o||f();return}const r=++M;t.searchLoading=!0,t.searchError=null,o||f();try{const d=await n.service.searchMessages(s);if(o||r!==M)return;t.searchResults=d,t.searchLoading=!1,f()}catch(d){if(o||r!==M)return;t.searchError=d instanceof Error?d.message:String(d),t.searchLoading=!1,f()}}function lt(a){t.searchQuery=a,$&&clearTimeout($),$=setTimeout(()=>ot(a),300)}async function dt(a,s){if(de(),await x(a),o)return;const r=Array.from(e.querySelectorAll("[data-chat-message-id]")).find(d=>d.dataset.chatMessageId===s);r&&(r.scrollIntoView({block:"center"}),r.classList.add("chat-message-jumped"),setTimeout(()=>r.classList.remove("chat-message-jumped"),1600))}function ut(a,s){const r=new Set(t.composeSelectedMemberIds);s?r.add(a):r.delete(a),t.composeSelectedMemberIds=r,f()}function ke(a){return a.members.find(r=>r.user_id===n.currentUser.id&&!r.left_at)?.membership_role==="owner"||["admin","manager"].includes(n.currentUser.role)}function Ee(a){return!a||!["group","channel"].includes(a.kind)?!1:ke(a)}function mt(a){return a?ke(a):!1}function ht(){t.membersOpen=!0,f()}function J({reset:a=!1}={}){t.membersOpen=!1,t.memberAddOpen=!1,a&&(t.memberSearch="",t.memberSelectedIds=new Set),f()}function pt(){t.memberAddOpen=!t.memberAddOpen,f(),t.memberAddOpen&&e.querySelector("[data-chat-member-search]")?.focus()}function ft(a,s){const r=new Set(t.memberSelectedIds);s?r.add(a):r.delete(a),t.memberSelectedIds=r,f()}async function gt(a){const s=[...t.memberSelectedIds];if(!(!a||!s.length)){for(const r of s)await n.service.addMember(a,r);t.memberSearch="",t.memberSelectedIds=new Set,t.memberAddOpen=!1,o||f(),await O()}}async function vt(a,s){!a||!s||(await n.service.removeMember(a,s),t.conversations=t.conversations.map(r=>r.id!==a?r:{...r,members:r.members.map(d=>d.user_id===s?{...d,left_at:d.left_at||new Date().toISOString()}:d)}),s===n.currentUser.id&&(t.membersOpen=!1,t.memberAddOpen=!1),o||f(),await O())}function _t(a){const s=t.messages.find(d=>d.id===a);if(!s)return;t.editingMessageId=a,t.editDraft=s.body||"",f();const r=e.querySelector(`[data-chat-edit-input="${CSS.escape(a)}"]`);r?.focus(),r?.select?.()}function bt(){t.editingMessageId=null,t.editDraft="",f()}async function yt(a){const s=a.dataset.chatEditForm,d=a.querySelector("[data-chat-edit-input]").value.trim();if(!s||!d)return;const g=t.conversations.find(C=>C.id===t.selectedConversationId)||null,S=await n.service.updateMessage(s,d,ne(d,y(g)));t.messages=t.messages.map(C=>C.id===S.id?S:C),t.editingMessageId=null,t.editDraft="",o||f(),await O()}async function wt(a){if(!a)return;const s=await n.service.deleteMessage(a);t.messages=t.messages.map(r=>r.id===a?{...r,...s,body:"Message deleted",deleted_at:s.deleted_at||new Date().toISOString()}:r),t.replyToMessageId===a&&(t.replyToMessageId=null),t.confirmingDeleteMessageId=null,t.openMessageMenuId=null,o||f(),await O()}async function $t(a){const r=a.members.find(d=>d.user_id===n.currentUser.id)?.notification_level==="muted"?"all":"muted";await n.service.setNotificationLevel(a.id,r),t.conversations=t.conversations.map(d=>d.id!==a.id?d:{...d,members:d.members.map(g=>g.user_id===n.currentUser.id?{...g,notification_level:r}:g)}),o||f(),await O()}function St(a){t.renameOpen=!0,t.renameDraft=a.title||"",f(),e.querySelector("[data-chat-rename-input]")?.focus()}function Ct(){t.renameOpen=!1,t.renameDraft="",f()}async function kt(a,s){const r=(s||"").trim();r&&(await n.service.renameConversation(a.id,r),t.conversations=t.conversations.map(d=>d.id===a.id?{...d,title:r}:d),t.renameOpen=!1,t.renameDraft="",o||f(),await O())}function Et(){t.archiveConfirmOpen=!0,f()}function Dt(){t.archiveConfirmOpen=!1,f()}async function Mt(a,s){await n.service.setConversationArchived(a.id,s),t.archiveConfirmOpen=!1,t.selectedConversationId===a.id&&(t.selectedConversationId=null,oe()),t.conversations=t.conversations.map(r=>r.id===a.id?{...r,archived_at:new Date().toISOString()}:r),o||f(),await O()}function Tt(a){t.channelDetailsOpen=!0,t.channelDetailsTitleDraft=a.title||"",t.channelDetailsTopicDraft=a.topic||"",t.channelDetailsDescriptionDraft=a.description||"",t.membersOpen=!1,f(),e.querySelector("[data-chat-channel-details-title]")?.focus()}function Lt(){t.channelDetailsOpen=!1,f()}async function It(a){const s=t.channelDetailsTitleDraft,r=t.channelDetailsTopicDraft,d=t.channelDetailsDescriptionDraft;await n.service.updateChannelDetails(a.id,{title:s,topic:r,description:d}),t.conversations=t.conversations.map(g=>g.id===a.id?{...g,title:s.trim(),topic:r.trim()||null,description:d.trim()||null}:g),t.channelDetailsOpen=!1,o||f(),await O()}function qt(){t.leaveChannelConfirmOpen=!0,f()}function At(){t.leaveChannelConfirmOpen=!1,f()}async function Ot(a){await n.service.leaveChannel(a.id),t.leaveChannelConfirmOpen=!1,t.conversations=t.conversations.filter(s=>s.id!==a.id),t.selectedConversationId===a.id&&(t.selectedConversationId=t.conversations[0]?.id||null,oe()),o||f(),await O()}async function Rt(a,s,r){!a||!s||(await n.service.setMembershipRole(a,s,r),t.conversations=t.conversations.map(d=>d.id!==a?d:{...d,members:d.members.map(g=>g.user_id===s?{...g,membership_role:r}:g)}),o||f(),await O())}async function Nt(a){if(!a)return;const s=await n.service.getOrCreateDm(a);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await x(s)}async function Pt(a,s){if(a=a.trim(),!a)return;const r=await n.service.createGroup(a,s);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await x(r)}async function Ut(a){if(a=a.trim(),!a)return;const s=await n.service.createChannel(a);t.composeOpen=!1,t.composeChannelTitle="",await x(s)}async function jt(){t.browseChannelsError=null,t.browseChannelsLoading=!0,f();try{const a=await n.service.listChannels();t.browseChannelsList=[...a].sort((s,r)=>s.joined_by_current_user!==r.joined_by_current_user?s.joined_by_current_user?-1:1:(s.title||"").localeCompare(r.title||"")),t.browseChannelsLoading=!1,o||f()}catch(a){t.browseChannelsError=Le(a),t.browseChannelsLoading=!1,o||f()}}async function Bt(){t.browseChannelsOpen=!0,t.composeOpen=!1,t.searchOpen=!1,t.browseChannelsSearch="",await jt()}function X(){t.browseChannelsOpen=!1,t.browseChannelsList=[],t.browseChannelsError=null,t.browseChannelsSearch="",f()}function Ft(){const a=t.browseChannelsSearch.trim().toLowerCase();return a?t.browseChannelsList.filter(s=>(s.title||"").toLowerCase().includes(a)||(s.topic||"").toLowerCase().includes(a)):t.browseChannelsList}async function xt(a){await n.service.joinChannel(a),X(),await x(a)}function Ht(a){X(),x(a)}function Wt(){o||O()}function zt(a){return a.members?.find(r=>r.user_id===n.currentUser.id)?.notification_level==="muted"}function Gt(a){const s=a.id===t.selectedConversationId?" selected":"",r=zt(a)?" muted":"",d=a.unread_count?`<span class="chat-count${r?" muted":""}">${a.unread_count}</span>`:"",g=me(a,n.currentUser.id),S=a.kind==="channel"?'<span class="chat-conversation-hash" aria-hidden="true">#</span>':a.kind==="group"?'<span class="chat-conversation-hash" aria-hidden="true"><i class="ti ti-lock"></i></span>':`<span class="chat-conversation-avatar" aria-hidden="true">${u((g||"?").slice(0,1).toUpperCase())}</span>`;return`
          <button type="button" class="chat-conversation${s}${r}" data-chat-select="${u(a.id)}">
            ${S}
            <span class="chat-conversation-title">${u(g)}</span>
            ${d}
          </button>
        `}function Vt(a){t.sidebarSectionsCollapsed={...t.sidebarSectionsCollapsed,[a]:!t.sidebarSectionsCollapsed[a]},f()}function Qt(a){if(!a.conversations.length)return"";const s=!!t.sidebarSectionsCollapsed[a.kind],r=Qe(a.conversations);return`
          <div class="chat-sidebar-section">
            <button type="button" class="chat-sidebar-section-head" data-chat-sidebar-section-toggle="${a.kind}" aria-expanded="${!s}">
              <i class="ti ${s?"ti-chevron-right":"ti-chevron-down"}"></i>
              <span class="chat-sidebar-section-label">${u(Gn[a.kind])}</span>
              ${r?`<span class="chat-count">${r}</span>`:""}
            </button>
            ${s?"":a.conversations.map(Gt).join("")}
          </div>
        `}function Yt(a){const s=t.conversations.find(S=>S.id===a.conversation_id),r=s?me(s,n.currentUser.id):"Archived conversation",d=Yn(a.created_at),g=a.sender?.full_name||"Unknown";return`
          <button type="button" class="chat-search-result" data-chat-search-result="${u(a.conversation_id)}" data-chat-search-message="${u(a.id)}">
            <span class="chat-search-result-row">
              <span class="chat-search-result-title">${u(r)}</span>
              ${d?`<span class="chat-search-result-time">${u(d)}</span>`:""}
            </span>
            <span class="chat-search-result-snippet"><strong>${u(g)}:</strong> ${u(Rn(a))}</span>
          </button>
        `}function Kt(){const a=t.searchQuery.trim();return`
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
              ${t.searchLoading?"":t.searchResults.map(Yt).join("")}
            </div>
          </div>
        `}function De(){return["admin","manager"].includes(n.currentUser.role)}function Jt(a){if(!t.composeOpen)return"";const s=t.composeSearch.trim().toLowerCase(),r=a.filter(S=>!s||(S.full_name||"").toLowerCase().includes(s)),d=t.composeSelectedMemberIds.size,g=d===1?[...t.composeSelectedMemberIds][0]:"";return`
          <div class="chat-compose-popover" data-chat-compose-popover role="dialog" aria-label="New conversation">
            <div class="chat-compose-popover-head">
              <strong>New conversation</strong>
              <button type="button" class="chat-icon-btn" data-chat-compose-close aria-label="Close new conversation"><i class="ti ti-x"></i></button>
            </div>
            <input data-chat-compose-search type="search" placeholder="Search people..." value="${u(t.composeSearch)}" autocomplete="off">
            <div class="chat-compose-summary">${d} selected</div>
            <div class="chat-compose-list">
              ${r.map(S=>{const C=t.composeSelectedMemberIds.has(S.id)?" checked":"";return`
                  <label class="chat-compose-person">
                    <input type="checkbox" data-chat-compose-member="${u(S.id)}"${C}>
                    <span class="chat-compose-avatar">${u((S.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${u(S.full_name||"Unknown")}</strong>
                      <span>${u(G(S.role))}</span>
                    </span>
                  </label>
                `}).join("")}
              ${r.length?"":'<div class="chat-muted">No matching people.</div>'}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${u(g)}"${d===1&&!q(t.actionState,`start-dm:${g}`)?"":" disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              ${D(t.actionState,`start-dm:${g}`)?`<span class="chat-action-error">${u(D(t.actionState,`start-dm:${g}`))}</span>`:""}
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${u(t.composeGroupTitle)}">
                <button type="button" data-chat-create-group${t.composeGroupTitle.trim()&&!q(t.actionState,"create-group")?"":" disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
                ${D(t.actionState,"create-group")?`<span class="chat-action-error">${u(D(t.actionState,"create-group"))}</span>`:""}
              </div>
              ${De()?`
                <div class="chat-compose-group">
                  <input data-chat-channel-title type="text" placeholder="Channel name" value="${u(t.composeChannelTitle)}">
                  <button type="button" data-chat-create-channel${t.composeChannelTitle.trim()&&!q(t.actionState,"create-channel")?"":" disabled"}><i class="ti ti-hash"></i><span>Create channel</span></button>
                  ${D(t.actionState,"create-channel")?`<span class="chat-action-error">${u(D(t.actionState,"create-channel"))}</span>`:""}
                </div>
              `:""}
            </div>
          </div>
        `}function Xt(){const a=Ft();return`
          <div class="chat-search-panel chat-channel-directory">
            <div class="chat-compose-popover-head">
              <strong>Browse channels</strong>
              <button type="button" class="chat-icon-btn" data-chat-browse-channels-close aria-label="Close browse channels"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-search-input-row">
              <i class="ti ti-search"></i>
              <input data-chat-browse-channels-search type="search" placeholder="Search channels..." value="${u(t.browseChannelsSearch)}" autocomplete="off">
            </div>
            <div class="chat-search-results">
              ${t.browseChannelsLoading?'<div class="chat-muted">Loading...</div>':""}
              ${t.browseChannelsError?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${u(t.browseChannelsError)}</span></div>`:""}
              ${!t.browseChannelsLoading&&!t.browseChannelsError&&!a.length?`<div class="chat-muted">${t.browseChannelsSearch.trim()?"No channels match your search.":"No channels exist yet."}</div>`:""}
              ${a.map(s=>{const r=s.id===t.selectedConversationId,d=q(t.actionState,`join-channel:${s.id}`),g=D(t.actionState,`join-channel:${s.id}`);return`
                  <div class="chat-channel-directory-row">
                    <div class="chat-channel-directory-info">
                      <span class="chat-search-result-title">#${u(s.title||"Untitled channel")}</span>
                      ${s.topic?`<span class="chat-channel-directory-topic">${u(s.topic)}</span>`:""}
                      <span class="chat-channel-directory-meta">
                        <i class="ti ti-users"></i> ${s.member_count}
                        ${s.creator_name?` &middot; created by ${u(s.creator_name)}`:""}
                      </span>
                    </div>
                    ${r?'<span class="chat-channel-directory-current">Current</span>':s.joined_by_current_user?`<button type="button" class="chat-member-add-toggle" data-chat-open-channel="${u(s.id)}">Open</button>`:`<button type="button" class="chat-member-add-toggle" data-chat-join-channel="${u(s.id)}"${d?" disabled":""}><i class="ti ti-plus"></i><span>Join</span></button>`}
                    ${g?`<span class="chat-action-error">${u(g)}</span>`:""}
                  </div>
                `}).join("")}
            </div>
          </div>
        `}function Zt(a){if(t.mentionQuery===null||!a)return"";const s=F(a);if(!s.length)return"";const r=Math.min(t.mentionIndex,s.length-1);return`
          <div class="chat-compose-popover chat-mention-picker" data-chat-mention-picker role="listbox" aria-label="Mention someone">
            ${s.map((d,g)=>`
              <button
                type="button"
                class="chat-compose-person chat-mention-option${g===r?" active":""}"
                data-chat-mention-pick="${u(d.id)}"
                role="option"
                aria-selected="${g===r}"
              >
                <span class="chat-compose-avatar">${u((d.full_name||"?").slice(0,1))}</span>
                <span class="chat-compose-person-copy">
                  <strong>${u(d.full_name||"Unknown")}</strong>
                  <span>${u(G(d.role))}</span>
                </span>
              </button>
            `).join("")}
          </div>
        `}function en(a){if(!t.membersOpen||!a||!["group","channel"].includes(a.kind))return"";const s=a.members.filter(_=>!_.left_at),r=Ee(a),d=new Set(s.map(_=>_.user_id)),g=t.memberSearch.trim().toLowerCase(),S=t.profiles.filter(_=>_.id!==n.currentUser.id&&!d.has(_.id)&&(!g||(_.full_name||"").toLowerCase().includes(g))),C=t.memberSelectedIds.size;return`
          <div class="chat-compose-popover chat-members-panel" data-chat-members-panel role="dialog" aria-label="Manage members">
            <div class="chat-compose-popover-head">
              <strong>Manage members</strong>
              <button type="button" class="chat-icon-btn" data-chat-members-close aria-label="Close member management"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-member-panel-list">
              ${s.map(_=>{const I=_.profile||{},k=_.user_id===n.currentUser.id,Z=r||k;return`
                  <div class="chat-member-row" data-chat-member-row="${u(_.user_id)}">
                    <span class="chat-compose-avatar">${u((I.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${u(I.full_name||_.user_id)}</strong>
                      <span>${u(I.role?G(I.role):"Member")}</span>
                    </span>
                    ${_.membership_role==="owner"?'<span class="chat-owner-badge">Owner</span>':""}
                    ${r?`
                      <button type="button" class="chat-member-promote" data-chat-promote-member="${u(_.user_id)}" data-chat-role="${_.membership_role==="owner"?"member":"owner"}"${q(t.actionState,`set-role:${a.id}:${_.user_id}`)?" disabled":""}>
                        <i class="ti ${_.membership_role==="owner"?"ti-user-minus":"ti-shield-plus"}"></i><span>${_.membership_role==="owner"?"Remove owner":"Make owner"}</span>
                      </button>
                    `:""}
                    ${Z?`
                      <button type="button" class="chat-member-remove" data-chat-remove-member="${u(_.user_id)}"${q(t.actionState,`remove-member:${a.id}:${_.user_id}`)?" disabled":""}>
                        <i class="ti ${k?"ti-logout":"ti-user-minus"}"></i><span>${k?"Leave":"Remove"}</span>
                      </button>
                    `:""}
                    ${D(t.actionState,`set-role:${a.id}:${_.user_id}`)||D(t.actionState,`remove-member:${a.id}:${_.user_id}`)?`
                      <span class="chat-action-error">${u(D(t.actionState,`set-role:${a.id}:${_.user_id}`)||D(t.actionState,`remove-member:${a.id}:${_.user_id}`))}</span>
                    `:""}
                  </div>
                `}).join("")}
            </div>
            ${r?`
              <div class="chat-member-add">
                <button type="button" class="chat-member-add-toggle" data-chat-member-add-toggle>
                  <i class="ti ti-user-plus"></i><span>Add member</span>
                </button>
                ${t.memberAddOpen?`
                  <input data-chat-member-search type="search" placeholder="Search people..." value="${u(t.memberSearch)}" autocomplete="off">
                  <div class="chat-compose-summary">${C} selected</div>
                  <div class="chat-compose-list">
                    ${S.map(_=>{const I=t.memberSelectedIds.has(_.id)?" checked":"";return`
                        <label class="chat-compose-person">
                          <input type="checkbox" data-chat-member-pick="${u(_.id)}"${I}>
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
                    <button type="button" data-chat-add-members="${u(a.id)}"${C&&!q(t.actionState,`add-members:${a.id}`)?"":" disabled"}><i class="ti ti-users-plus"></i><span>Add selected</span></button>
                    ${D(t.actionState,`add-members:${a.id}`)?`<span class="chat-action-error">${u(D(t.actionState,`add-members:${a.id}`))}</span>`:""}
                  </div>
                `:""}
              </div>
            `:""}
          </div>
        `}function Me(a){const s=a.deleted_at?"Message deleted":a.body||"";return s.length>90?`${s.slice(0,87)}...`:s}function tn(a){if(!a?.reply_to_id)return"";const s=t.messages.find(r=>r.id===a.reply_to_id);return s?`
          <div class="chat-quote">
            <strong>${u(s.sender?.full_name||"Unknown")}</strong>
            <span>${u(Me(s))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function nn(){const a=t.messages.find(s=>s.id===t.replyToMessageId);return a?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${u(a.sender?.full_name||"Unknown")}</strong>
              <span>${u(Me(a))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function an(){return t.pendingAttachments.length?`
          <div class="chat-pending-attachments">
            ${t.pendingAttachments.map(a=>`
              <div class="chat-pending-attachment${a.status==="error"?" error":""}" data-chat-pending-attachment="${u(a.id)}">
                <i class="ti ${a.status==="error"?"ti-alert-triangle":Ie(a.mime)?"ti-photo":qe(a.mime)}"></i>
                <span class="chat-pending-attachment-name">${u(a.name)}</span>
                ${a.status==="uploading"?'<span class="chat-pending-attachment-status">Uploading…</span>':""}
                ${a.status==="error"?`<span class="chat-pending-attachment-status">${u(a.error||"Failed")}</span>`:""}
                <button type="button" data-chat-remove-pending="${u(a.id)}" aria-label="Remove attachment"><i class="ti ti-x"></i></button>
              </div>
            `).join("")}
          </div>
        `:""}function sn(a){const s=i.get(a.path),r=s&&s.expiresAt>Date.now()?s.url:null;return Ie(a.mime)?r?`<a class="chat-attachment-image-link" href="${u(r)}" target="_blank" rel="noopener">
                 <img class="chat-attachment-image" src="${u(r)}" alt="${u(a.name)}">
               </a>`:'<div class="chat-attachment-image chat-attachment-image-loading"><i class="ti ti-photo"></i></div>':`
          <a class="chat-attachment-file" href="${r?u(r):"#"}" target="_blank" rel="noopener" data-chat-attachment-path="${u(a.path)}">
            <i class="ti ${qe(a.mime)}"></i>
            <span class="chat-attachment-file-copy">
              <strong>${u(a.name)}</strong>
              <span>${u(Qn(a.size))}</span>
            </span>
            <i class="ti ti-download"></i>
          </a>
        `}function rn(a){return a.attachments?.length?`<div class="chat-message-attachments">${a.attachments.map(sn).join("")}</div>`:""}async function cn(){const a=new Set;for(const r of t.messages)for(const d of r.attachments||[])a.add(d.path);let s=!1;for(const r of a){const d=i.get(r);if(!(d&&d.expiresAt>Date.now()||l.has(r))){l.add(r);try{const g=await n.service.getSignedAttachmentUrl(r);i.set(r,{url:g,expiresAt:Date.now()+3300*1e3}),s=!0}catch(g){console.error("Failed to sign chat attachment URL",g)}finally{l.delete(r)}}}s&&!o&&f()}function on(a){const s=`edit-channel-details:${a.id}`,r=q(t.actionState,s),d=D(t.actionState,s);return`
          <form class="chat-channel-details-form" data-chat-channel-details-form>
            <input data-chat-channel-details-title type="text" value="${u(t.channelDetailsTitleDraft)}" placeholder="Channel name" maxlength="160"${r?" disabled":""}>
            <input data-chat-channel-details-topic type="text" value="${u(t.channelDetailsTopicDraft)}" placeholder="Topic (optional, shown under the name)" maxlength="160"${r?" disabled":""}>
            <textarea data-chat-channel-details-description placeholder="Description (optional)" maxlength="1000" rows="2"${r?" disabled":""}>${u(t.channelDetailsDescriptionDraft)}</textarea>
            <div class="chat-channel-details-actions">
              <button type="submit" aria-label="Save channel details"${r?" disabled":""}><i class="ti ti-check"></i><span>Save</span></button>
              <button type="button" data-chat-channel-details-cancel aria-label="Cancel"><i class="ti ti-x"></i></button>
            </div>
            ${d?`<span class="chat-action-error">${u(d)}</span>`:""}
          </form>
        `}function ln(a){const s=q(t.actionState,`edit-message:${a.id}`),r=D(t.actionState,`edit-message:${a.id}`);return`
          <form class="chat-edit-form" data-chat-edit-form="${u(a.id)}">
            <input data-chat-edit-input="${u(a.id)}" type="text" value="${u(t.editDraft)}"${s?" disabled":""}>
            <button type="submit" aria-label="Save edit"${s?" disabled":""}><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
            ${r?`<span class="chat-action-error">${u(r)}</span>`:""}
          </form>
        `}function dn(a){const s=u(a.body),r=t.conversations.find(_=>_.id===a.conversation_id)||t.conversations.find(_=>_.id===t.selectedConversationId)||null,d=y(r),g=Wn(a.body,d);if(!g.length)return s;const S=new Set(d.filter(_=>_.id===n.currentUser.id).map(_=>String(_.full_name)));let C=s;for(const _ of g){const I=`@${u(_)}`,k=S.has(_)?"chat-mention chat-mention-self":"chat-mention";C=C.split(I).join(`<span class="${k}">${I}</span>`)}return C}function un(a,s=!0){const r=a.sender_id===n.currentUser.id?" mine":"",d=!!a.deleted_at,g=r&&!d,S=!d&&(r||De()),C=a.edited_at&&!d?'<span class="chat-edited">(edited)</span>':"",_=d?"":`
            <button type="button" data-chat-reply="${u(a.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${g?`<button type="button" data-chat-edit="${u(a.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
            ${S?`<button type="button" data-chat-delete="${u(a.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>`:""}
        `,I=d?"":`
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
              <button type="button" data-chat-confirm-delete="${u(a.id)}"${q(t.actionState,`delete-message:${a.id}`)?" disabled":""}>Confirm</button>
              <button type="button" data-chat-cancel-delete="${u(a.id)}">Cancel</button>
              ${D(t.actionState,`delete-message:${a.id}`)?`<span class="chat-action-error">${u(D(t.actionState,`delete-message:${a.id}`))}</span>`:""}
            </div>
          `:""}
        `;return`
          <div class="chat-message${r}${d?" deleted":""}${s?"":" chat-message-grouped"}" tabindex="0" data-chat-message-id="${u(a.id)}">
            ${s?`
              <div class="chat-message-meta">
                <span>${u(a.sender?.full_name||"Unknown")}</span>
                <span>#${a.message_seq} ${C}</span>
              </div>
            `:""}
            ${tn(a)}
            ${t.editingMessageId===a.id?ln(a):`
              ${a.body.trim()?`<div class="chat-message-body">${d?u("Message deleted"):dn(a)}</div>`:""}
              ${d?"":rn(a)}
            `}
            ${I}
          </div>
        `}function f(){const a=v||A();v=!1;const s=t.conversations.find(c=>c.id===t.selectedConversationId)||null,r=t.profiles.filter(c=>c.id!==n.currentUser.id),g=s?.members.find(c=>c.user_id===n.currentUser.id)?.notification_level==="muted",S=s?.members.filter(c=>!c.left_at)||[],C=s?Ee(s):!1,_=s?mt(s):!1;e.innerHTML=`
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
              ${t.searchOpen?Kt():t.browseChannelsOpen?Xt():`
                ${Jt(r)}
                <div class="chat-conversation-list">
                  ${t.loading?'<div class="chat-muted">Loading...</div>':""}
                  ${An(t.conversations).map(Qt).join("")}
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
                    ${s.kind==="channel"&&t.channelDetailsOpen?on(s):s.kind!=="channel"&&t.renameOpen?`
                      <form class="chat-rename-form" data-chat-rename-form>
                        <input data-chat-rename-input type="text" value="${u(t.renameDraft)}" placeholder="Group name"${q(t.actionState,`rename:${s.id}`)?" disabled":""}>
                        <button type="submit" aria-label="Save name"${q(t.actionState,`rename:${s.id}`)?" disabled":""}><i class="ti ti-check"></i></button>
                        <button type="button" data-chat-rename-cancel aria-label="Cancel rename"><i class="ti ti-x"></i></button>
                        ${D(t.actionState,`rename:${s.id}`)?`<span class="chat-action-error">${u(D(t.actionState,`rename:${s.id}`))}</span>`:""}
                      </form>
                    `:`
                      <h2>${u(me(s,n.currentUser.id))}</h2>
                      ${s.kind==="channel"&&s.topic?`<p class="chat-channel-topic">${u(s.topic)}</p>`:""}
                    `}
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
                    <button type="button" class="chat-icon-btn${g?" active":""}" data-chat-toggle-mute aria-label="${g?"Unmute conversation":"Mute conversation"}" title="${g?"Unmute conversation":"Mute conversation"}"${q(t.actionState,`toggle-mute:${s.id}`)?" disabled":""}>
                      <i class="ti ${g?"ti-bell-off":"ti-bell"}"></i>
                    </button>
                    ${["group","channel"].includes(s.kind)&&C?`
                      <button type="button" class="chat-icon-btn" data-chat-rename-toggle aria-label="${s.kind==="channel"?"Edit channel details":"Rename group"}" title="${s.kind==="channel"?"Edit channel details":"Rename group"}">
                        <i class="ti ti-edit"></i>
                      </button>
                    `:""}
                    ${s.kind==="channel"?`
                      <button type="button" class="chat-icon-btn" data-chat-leave-channel-toggle aria-label="Leave channel" title="Leave channel">
                        <i class="ti ti-logout"></i>
                      </button>
                    `:""}
                    ${_?`
                      <button type="button" class="chat-icon-btn" data-chat-archive-toggle aria-label="Archive conversation" title="Archive conversation">
                        <i class="ti ti-archive"></i>
                      </button>
                    `:""}
                  </div>
                  ${en(s)}
                  ${t.archiveConfirmOpen?`
                    <div class="chat-delete-confirm chat-archive-confirm">
                      <span>Archive this ${s.kind==="channel"?"channel":s.kind==="group"?"group":"conversation"}?</span>
                      <button type="button" data-chat-confirm-archive${q(t.actionState,`archive:${s.id}`)?" disabled":""}>Confirm</button>
                      <button type="button" data-chat-cancel-archive>Cancel</button>
                      ${D(t.actionState,`archive:${s.id}`)?`<span class="chat-action-error">${u(D(t.actionState,`archive:${s.id}`))}</span>`:""}
                    </div>
                  `:""}
                  ${t.leaveChannelConfirmOpen?`
                    <div class="chat-delete-confirm chat-archive-confirm">
                      <span>Leave #${u(s.title||"this channel")}? You can rejoin any time from Browse Channels.</span>
                      <button type="button" data-chat-confirm-leave-channel${q(t.actionState,`leave-channel:${s.id}`)?" disabled":""}>Confirm</button>
                      <button type="button" data-chat-cancel-leave-channel>Cancel</button>
                      ${D(t.actionState,`leave-channel:${s.id}`)?`<span class="chat-action-error">${u(D(t.actionState,`leave-channel:${s.id}`))}</span>`:""}
                    </div>
                  `:""}
                </header>
                <div class="chat-message-list">
                  ${t.messages.map((c,p)=>un(c,Jn(c,t.messages[p-1]))).join("")}
                  ${t.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                ${D(t.actionState,`send-message:${s.id}`)?`<div class="chat-action-error chat-send-error"><i class="ti ti-alert-triangle"></i><span>${u(D(t.actionState,`send-message:${s.id}`))}</span></div>`:""}
                <form class="chat-composer" data-chat-send-form>
                  ${nn()}
                  ${an()}
                  ${Zt(s)}
                  <input type="file" data-chat-file-input multiple accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" hidden>
                  <button type="button" class="chat-attach-btn" data-chat-attach-toggle aria-label="Attach a file" title="Attach a file">
                    <i class="ti ti-paperclip"></i>
                  </button>
                  <textarea data-chat-composer rows="1" placeholder="Write a message..."></textarea>
                  <button type="submit"${q(t.actionState,`send-message:${s.id}`)?" disabled":""}><i class="ti ti-send"></i><span>Send</span></button>
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
        `,e.querySelectorAll("[data-chat-select]").forEach(c=>{c.addEventListener("click",()=>x(c.dataset.chatSelect))}),e.querySelectorAll("[data-chat-sidebar-section-toggle]").forEach(c=>{c.addEventListener("click",()=>Vt(c.dataset.chatSidebarSectionToggle))}),e.querySelector("[data-chat-back]")?.addEventListener("click",()=>oe()),e.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{s&&h(`toggle-mute:${s.id}`,()=>$t(s))}),e.querySelector("[data-chat-members-toggle]")?.addEventListener("click",()=>{s&&(t.membersOpen?J():ht())}),e.querySelector("[data-chat-members-close]")?.addEventListener("click",()=>J({reset:!0})),e.querySelector("[data-chat-rename-toggle]")?.addEventListener("click",()=>{s&&(s.kind==="channel"?Tt(s):St(s))}),e.querySelector("[data-chat-rename-cancel]")?.addEventListener("click",()=>Ct()),e.querySelector("[data-chat-rename-form]")?.addEventListener("submit",c=>{c.preventDefault(),s&&h(`rename:${s.id}`,()=>kt(s,t.renameDraft))}),e.querySelector("[data-chat-channel-details-title]")?.addEventListener("input",c=>{t.channelDetailsTitleDraft=c.currentTarget.value}),e.querySelector("[data-chat-channel-details-topic]")?.addEventListener("input",c=>{t.channelDetailsTopicDraft=c.currentTarget.value}),e.querySelector("[data-chat-channel-details-description]")?.addEventListener("input",c=>{t.channelDetailsDescriptionDraft=c.currentTarget.value}),e.querySelector("[data-chat-channel-details-cancel]")?.addEventListener("click",()=>Lt()),e.querySelector("[data-chat-channel-details-form]")?.addEventListener("submit",c=>{c.preventDefault(),s&&h(`edit-channel-details:${s.id}`,()=>It(s))}),e.querySelector("[data-chat-leave-channel-toggle]")?.addEventListener("click",()=>qt()),e.querySelector("[data-chat-confirm-leave-channel]")?.addEventListener("click",()=>{s&&h(`leave-channel:${s.id}`,()=>Ot(s))}),e.querySelector("[data-chat-cancel-leave-channel]")?.addEventListener("click",()=>At()),e.querySelector("[data-chat-rename-input]")?.addEventListener("input",c=>{t.renameDraft=c.currentTarget.value}),e.querySelector("[data-chat-archive-toggle]")?.addEventListener("click",()=>Et()),e.querySelector("[data-chat-confirm-archive]")?.addEventListener("click",()=>{s&&h(`archive:${s.id}`,()=>Mt(s,!0))}),e.querySelector("[data-chat-cancel-archive]")?.addEventListener("click",()=>Dt()),e.querySelector("[data-chat-member-add-toggle]")?.addEventListener("click",()=>pt()),e.querySelector("[data-chat-member-search]")?.addEventListener("input",c=>{t.memberSearch=c.currentTarget.value,f();const p=e.querySelector("[data-chat-member-search]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),e.querySelectorAll("[data-chat-member-pick]").forEach(c=>{c.addEventListener("change",()=>ft(c.dataset.chatMemberPick,c.checked))}),e.querySelector("[data-chat-add-members]")?.addEventListener("click",c=>{const p=c.currentTarget.dataset.chatAddMembers;h(`add-members:${p}`,()=>gt(p))}),e.querySelectorAll("[data-chat-remove-member]").forEach(c=>{c.addEventListener("click",()=>{if(!s)return;const p=c.dataset.chatRemoveMember;h(`remove-member:${s.id}:${p}`,()=>vt(s.id,p))})}),e.querySelectorAll("[data-chat-promote-member]").forEach(c=>{c.addEventListener("click",()=>{if(!s)return;const p=c.dataset.chatPromoteMember,R=c.dataset.chatRole;h(`set-role:${s.id}:${p}`,()=>Rt(s.id,p,R))})}),e.querySelector("[data-chat-search-toggle]")?.addEventListener("click",()=>{t.searchOpen?de():ct()}),e.querySelector("[data-chat-search-close]")?.addEventListener("click",()=>de()),e.querySelector("[data-chat-search-input]")?.addEventListener("input",c=>{lt(c.currentTarget.value),f();const p=e.querySelector("[data-chat-search-input]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),e.querySelectorAll("[data-chat-search-result]").forEach(c=>{c.addEventListener("click",()=>{dt(c.dataset.chatSearchResult,c.dataset.chatSearchMessage)})}),e.querySelector("[data-chat-browse-channels-toggle]")?.addEventListener("click",()=>{t.browseChannelsOpen?X():Bt()}),e.querySelector("[data-chat-browse-channels-close]")?.addEventListener("click",()=>X()),e.querySelector("[data-chat-browse-channels-search]")?.addEventListener("input",c=>{t.browseChannelsSearch=c.currentTarget.value,f();const p=e.querySelector("[data-chat-browse-channels-search]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),e.querySelectorAll("[data-chat-join-channel]").forEach(c=>{c.addEventListener("click",()=>{const p=c.dataset.chatJoinChannel;h(`join-channel:${p}`,()=>xt(p))})}),e.querySelectorAll("[data-chat-open-channel]").forEach(c=>{c.addEventListener("click",()=>Ht(c.dataset.chatOpenChannel))}),e.querySelector("[data-chat-channel-title]")?.addEventListener("input",c=>{t.composeChannelTitle=c.currentTarget.value,f();const p=e.querySelector("[data-chat-channel-title]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),e.querySelector("[data-chat-create-channel]")?.addEventListener("click",()=>{h("create-channel",()=>Ut(t.composeChannelTitle))}),e.querySelector("[data-chat-compose-toggle]")?.addEventListener("click",()=>{t.composeOpen?K():it()}),e.querySelector("[data-chat-compose-close]")?.addEventListener("click",()=>K()),e.querySelector("[data-chat-compose-search]")?.addEventListener("input",c=>{t.composeSearch=c.currentTarget.value,f();const p=e.querySelector("[data-chat-compose-search]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),e.querySelectorAll("[data-chat-compose-member]").forEach(c=>{c.addEventListener("change",()=>ut(c.dataset.chatComposeMember,c.checked))}),e.querySelector("[data-chat-group-title]")?.addEventListener("input",c=>{t.composeGroupTitle=c.currentTarget.value,f();const p=e.querySelector("[data-chat-group-title]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),e.querySelector("[data-chat-start-dm]")?.addEventListener("click",c=>{const p=c.currentTarget.dataset.chatStartDm;h(`start-dm:${p}`,()=>Nt(p))}),e.querySelector("[data-chat-create-group]")?.addEventListener("click",()=>{h("create-group",()=>Pt(t.composeGroupTitle,[...t.composeSelectedMemberIds]))});const I=e.querySelector("[data-chat-send-form]");I?.addEventListener("submit",c=>{c.preventDefault();const p=t.selectedConversationId,R=c.currentTarget;h(`send-message:${p}`,()=>at(R))});const k=e.querySelector("[data-chat-composer]");k?.addEventListener("input",()=>{if(T(k),!ce(k))return;const{value:c,selectionStart:p}=k;f();const R=e.querySelector("[data-chat-composer]");R&&(R.value=c,T(R),R.focus(),R.setSelectionRange?.(p,p))}),k?.addEventListener("keydown",c=>{if(t.mentionQuery!==null&&s){const p=F(s);if(p.length){if(c.key==="ArrowDown"){c.preventDefault(),$e(s,1);return}if(c.key==="ArrowUp"){c.preventDefault(),$e(s,-1);return}if(c.key==="Enter"||c.key==="Tab"){c.preventDefault(),we(s,p[Math.min(t.mentionIndex,p.length-1)]);return}}if(c.key==="Escape"){c.preventDefault(),z();return}}c.key==="Enter"&&!c.shiftKey&&(c.preventDefault(),I?.requestSubmit())}),e.querySelectorAll("[data-chat-mention-pick]").forEach(c=>{c.addEventListener("mousedown",p=>{p.preventDefault();const R=y(s).find(ue=>ue.id===c.dataset.chatMentionPick);R&&we(s,R)})}),e.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>rt()),e.querySelectorAll("[data-chat-reply]").forEach(c=>{c.addEventListener("click",()=>st(c.dataset.chatReply))}),e.querySelectorAll("[data-chat-edit]").forEach(c=>{c.addEventListener("click",()=>_t(c.dataset.chatEdit))}),e.querySelectorAll("[data-chat-delete]").forEach(c=>{c.addEventListener("click",()=>{t.confirmingDeleteMessageId=c.dataset.chatDelete,t.openMessageMenuId=null,f()})}),e.querySelectorAll("[data-chat-message-menu]").forEach(c=>{c.addEventListener("click",()=>{t.openMessageMenuId=t.openMessageMenuId===c.dataset.chatMessageMenu?null:c.dataset.chatMessageMenu,t.confirmingDeleteMessageId=null,f()})}),e.querySelectorAll("[data-chat-confirm-delete]").forEach(c=>{c.addEventListener("click",()=>{const p=c.dataset.chatConfirmDelete;h(`delete-message:${p}`,()=>wt(p))})}),e.querySelectorAll("[data-chat-cancel-delete]").forEach(c=>{c.addEventListener("click",()=>{t.confirmingDeleteMessageId===c.dataset.chatCancelDelete&&(t.confirmingDeleteMessageId=null),f()})}),e.querySelectorAll("[data-chat-edit-form]").forEach(c=>{c.addEventListener("submit",p=>{p.preventDefault();const R=p.currentTarget,ue=R.dataset.chatEditForm;h(`edit-message:${ue}`,()=>yt(R))})}),e.querySelectorAll("[data-chat-cancel-edit]").forEach(c=>{c.addEventListener("click",()=>bt())});const Z=e.querySelector("[data-chat-file-input]");e.querySelector("[data-chat-attach-toggle]")?.addEventListener("click",()=>Z?.click()),Z?.addEventListener("change",c=>{le(c.currentTarget.files),c.currentTarget.value=""}),e.querySelectorAll("[data-chat-remove-pending]").forEach(c=>{c.addEventListener("click",()=>nt(c.dataset.chatRemovePending))});const Te=e.querySelector("[data-chat-send-form]");Te?.addEventListener("dragover",c=>c.preventDefault()),Te?.addEventListener("drop",c=>{c.preventDefault(),c.dataTransfer?.files?.length&&le(c.dataTransfer.files)}),k?.addEventListener("paste",c=>{const p=[...c.clipboardData?.files||[]];p.length&&le(p)}),a&&b(),cn()}return O(),E=setInterval(()=>O(),3e4),typeof n.service.subscribeToConversationEvents=="function"&&(w=n.service.subscribeToConversationEvents(()=>Wt())),()=>{o=!0,E&&clearInterval(E),$&&clearTimeout($),w&&w(),e.removeEventListener?.("click",Se),typeof document<"u"&&(document.removeEventListener("keydown",Ce),document.body?.classList.remove("wein-chat-root")),e.classList.remove("wein-chat-root"),e.classList.remove("chat-has-selection"),e.innerHTML=""}}}}const Ae="chat-attachments",Oe=5;function Ke(e){return String(e||"file").replace(/[^a-zA-Z0-9._-]+/g,"_")}function Zn(e,n){const t=`${Date.now().toString(36)}-${Math.random().toString(16).slice(2,8)}`;return`${e}/${t}-${Ke(n)}`}function ea(e){return String(e).replace(/[\\%_]/g,n=>`\\${n}`)}function j(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data||[]}function B(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data}function _e(e){return e?{id:e.id,full_name:e.full_name,role:e.role,email:e.email??null}:null}function ta(e){return{conversation_id:e.conversation_id,user_id:e.user_id,membership_role:e.membership_role,joined_at:e.joined_at,left_at:e.left_at,last_read_seq:Number(e.last_read_seq||0),notification_level:e.notification_level,profile:_e(e.profile||e.profiles)}}function W(e){return{id:e.id,conversation_id:e.conversation_id,message_seq:Number(e.message_seq||0),sender_id:e.sender_id,body:e.body,reply_to_id:e.reply_to_id,client_nonce:e.client_nonce,created_at:e.created_at,edited_at:e.edited_at,deleted_at:e.deleted_at,mentioned_user_ids:e.mentioned_user_ids||[],attachments:e.attachments||[],sender:_e(e.sender||e.profiles)}}function Re(e,n){const t=(e.members||e.wein_chat_members||[]).map(ta),i=e.last_message||e.wein_chat_messages||[],l=Array.isArray(i)?i.find(h=>h.deleted_at==null):null,o=l?W(l):null,m={id:e.id,kind:e.kind,title:e.title,created_by:e.created_by,created_at:e.created_at,archived_at:e.archived_at,members:t,last_message:o,unread_count:0};return m.unread_count=Ln(m,n),m}function Je({supabase:e,currentUserId:n}){if(!e)throw new Error("supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(i){const l=await e.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",i).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(Oe,{referencedTable:"wein_chat_messages"}).single();if(l.error)throw new Error(`fetch conversation: ${l.error.message||l.error}`);return Re(l.data,n)}return{async listProfiles(){const i=await e.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return j(i,"list profiles").map(_e)},async listConversations(){const i=await e.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(Oe,{referencedTable:"wein_chat_messages"});return j(i,"list conversations").map(l=>Re(l,n))},async listMessages(i){const l=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",i).is("deleted_at",null).order("message_seq",{ascending:!0});return j(l,"list messages").map(W)},async searchMessages(i){const l=(i||"").trim();if(!l)return[];const o=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).is("deleted_at",null).ilike("body",`%${ea(l)}%`).order("created_at",{ascending:!1}).limit(50);return j(o,"search messages").map(W)},async createGroup(i,l=[]){const o=B(await e.rpc("wein_chat_create_group",{p_title:i}),"create group");for(const m of l)await this.addMember(o,m);return o},async createChannel(i){return B(await e.rpc("wein_chat_create_channel",{p_title:i}),"create channel")},async joinChannel(i){B(await e.rpc("wein_chat_join_channel",{p_conversation_id:i}),"join channel")},async listChannels(){const i=await e.from("wein_chat_conversations").select("id, kind, title, topic, description, created_by, creator_name, created_at, archived_at, member_count, joined_by_current_user").eq("kind","channel").is("archived_at",null).order("title",{ascending:!0});return j(i,"list channels").map(On)},async updateChannelDetails(i,{title:l,topic:o,description:m}){B(await e.rpc("wein_chat_update_channel_details",{p_conversation_id:i,p_title:l,p_topic:o??null,p_description:m??null}),"update channel details")},async leaveChannel(i){B(await e.rpc("wein_chat_remove_member",{p_conversation_id:i,p_user_id:n}),"leave channel")},async getOrCreateDm(i){return B(await e.rpc("wein_chat_get_or_create_dm",{p_other_user_id:i}),"get or create DM")},async addMember(i,l){B(await e.rpc("wein_chat_add_member",{p_conversation_id:i,p_user_id:l}),"add member")},async removeMember(i,l){B(await e.rpc("wein_chat_remove_member",{p_conversation_id:i,p_user_id:l}),"remove member")},async renameConversation(i,l){const o=(l||"").trim();if(!o)throw new Error("Group title is required");const m=await e.from("wein_chat_conversations").update({title:o}).eq("id",i).select("id, title");if(!j(m,"rename conversation").length)throw new Error("rename conversation affected zero rows")},async setConversationArchived(i,l){const o=await e.from("wein_chat_conversations").update({archived_at:l?new Date().toISOString():null}).eq("id",i).select("id, archived_at");if(!j(o,"set conversation archived").length)throw new Error("set conversation archived affected zero rows")},async setMembershipRole(i,l,o){B(await e.rpc("wein_chat_set_membership_role",{p_conversation_id:i,p_user_id:l,p_role:o}),"set membership role")},async uploadAttachment(i,l){const o=Zn(i,l.name),m=await e.storage.from(Ae).upload(o,l,{contentType:l.type||"application/octet-stream",upsert:!1});if(m.error)throw new Error(`upload attachment: ${m.error.message||m.error}`);return{path:o,name:l.name||Ke(l.name),mime:l.type||"application/octet-stream",size:l.size||0}},async getSignedAttachmentUrl(i,l=3600){const o=await e.storage.from(Ae).createSignedUrl(i,l);if(o.error)throw new Error(`sign attachment url: ${o.error.message||o.error}`);const m=o.data?.signedUrl;if(!m)throw new Error("sign attachment url: no signed URL returned");return m},async sendMessage({conversationId:i,body:l,clientNonce:o,replyToId:m=null,mentionedUserIds:h=[],attachments:E=[]}){const w=await e.from("wein_chat_messages").insert({conversation_id:i,sender_id:n,body:l,client_nonce:o,reply_to_id:m,mentioned_user_ids:h.length?h:null,attachments:E}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(w.error)throw new Error(`send message: ${w.error.message||w.error}`);return W(w.data)},async updateMessage(i,l,o=[]){const m=await e.from("wein_chat_messages").update({body:l,edited_at:new Date().toISOString(),mentioned_user_ids:o.length?o:null}).eq("id",i).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(m.error)throw new Error(`update message: ${m.error.message||m.error}`);return W(m.data)},async deleteMessage(i){const l=await e.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",i).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(l.error)throw new Error(`delete message: ${l.error.message||l.error}`);return W(l.data)},async markRead(i,l){const o=await e.from("wein_chat_members").update({last_read_seq:l}).eq("conversation_id",i).eq("user_id",n).select("conversation_id, user_id, last_read_seq");if(!j(o,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(i,l){const o=await e.from("wein_chat_members").update({notification_level:l}).eq("conversation_id",i).eq("user_id",n).select("conversation_id, user_id, notification_level");if(!j(o,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(i){if(typeof e.channel!="function")return()=>{};const l=e.channel(`wein-chat:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},i).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},i).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},i).subscribe();return()=>{typeof e.removeChannel=="function"?e.removeChannel(l):typeof l.unsubscribe=="function"&&l.unsubscribe()}},fetchConversation:t}}function na(e){return typeof e.session.user=="object"&&e.session.user!==null?e.session.user:{}}function aa(e){const n=na(e),t=n.id;if(!t)throw new Error("Team chat requires an authenticated user id.");return{id:t,full_name:e.session.fullName||n.email||"Portal user",role:e.session.role||"team",email:n.email||null}}let he=null;function sa(e){he=e||null}function ra(){const e=Xn();ie({id:"team-chat",mount(n,t){const i=he;he=null;const l=aa(t),o=Je({supabase:t.session.client,currentUserId:l.id});return e.mount(n,{currentUser:l,service:o,initialConversationId:i})}})}function ia(e,n={}){return e?e.author_id&&n[e.author_id]?.full_name?n[e.author_id].full_name:e.author_name||"Unknown":"Unknown"}function Xe(e){return!!e?.resolved_at}function ca(e=[]){const n=new Map,t=[];e.forEach(o=>{n.set(o.id,{...o,replies:[]})}),n.forEach(o=>{o.reply_to_id&&n.has(o.reply_to_id)?n.get(o.reply_to_id).replies.push(o):t.push(o)});const i=(o,m)=>String(o.created_at||"").localeCompare(String(m.created_at||"")),l=o=>{o.replies.sort(i),o.replies.forEach(l)};return t.sort(i),t.forEach(l),t}function oa(e=[]){return e.filter(n=>!Xe(n)).length}function Ne(e,n=90){const t=String(e?.body||"").replace(/\s+/g," ").trim();return t.length<=n?t:`${t.slice(0,Math.max(0,n-1)).trimEnd()}…`}function N(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function Pe(e={}){return e.taskId?"Task discussion":e.providerId?"Provider discussion":e.offerId?"Offer discussion":"Record discussion"}function la(e={}){return e.taskId?`Task ${e.taskId}`:e.providerId?`Provider ${e.providerId}`:e.offerId?`Offer ${e.offerId}`:"No record scope"}function da(){return{id:"record-discussion",mount(e,n){const t={comments:[],peopleById:Object.fromEntries((n.people||[]).map(b=>[b.id,b])),loading:!0,error:null,replyToId:null,taskSourceCommentId:null};let i=!1,l=null,o=null;e.classList.add("wein-discussion-root");async function m(){try{t.error=null,t.comments=await n.service.listComments(n.scope||{})}catch(b){t.error=b.message||String(b)}finally{t.loading=!1,i||A()}}async function h(b){const T=b.querySelector("[data-discussion-body]"),y=T.value.trim();y&&(T.value="",await n.service.postComment({...n.scope||{},body:y,replyToId:t.replyToId,people:n.people||[]}),t.replyToId=null,await m())}async function E(b){const T=e.querySelector(`[data-resolve-note="${CSS.escape(b)}"]`)?.value||"";await n.service.resolveComment(b,T),await m()}async function w(b){await n.service.reopenComment(b),await m()}async function v(b){const T=b.querySelector("[data-task-title]"),y=T.value.trim();!y||!t.taskSourceCommentId||(await n.service.createTaskFromComment(t.taskSourceCommentId,y,n.currentUser?.id||null),T.value="",t.taskSourceCommentId=null,await m())}function $(b,T=0){const y=Xe(b),F=ia(b,t.peopleById);return`
          <article class="discussion-comment${y?" resolved":""}" style="--depth:${Math.min(T,4)}">
            <div class="discussion-comment-meta">
              <span>${N(F)}</span>
              <span>${N(b.created_at||"")}</span>
              ${y?'<span class="discussion-resolved-pill">Resolved</span>':""}
            </div>
            <div class="discussion-comment-body">${N(b.body)}</div>
            ${b.resolved_note?`<div class="discussion-resolved-note">${N(b.resolved_note)}</div>`:""}
            <div class="discussion-actions">
              <button type="button" data-discussion-reply="${N(b.id)}">Reply</button>
              ${y?`<button type="button" data-discussion-reopen="${N(b.id)}">Reopen</button>`:`<button type="button" data-discussion-resolve="${N(b.id)}">Resolve</button>`}
              <button type="button" data-discussion-task="${N(b.id)}">Create task</button>
            </div>
            ${y?"":`<input class="discussion-resolve-note" data-resolve-note="${N(b.id)}" placeholder="Optional resolve note">`}
            ${b.replies?.length?`<div class="discussion-replies">${b.replies.map(z=>$(z,T+1)).join("")}</div>`:""}
          </article>
        `}function M(){if(!t.taskSourceCommentId)return"";const b=t.comments.find(T=>T.id===t.taskSourceCommentId);return`
          <form class="discussion-task-box" data-discussion-task-form>
            <div>
              <div class="discussion-eyebrow">Create task from comment</div>
              <p>${N(Ne(b))}</p>
            </div>
            <input data-task-title type="text" placeholder="Task title">
            <div class="discussion-task-actions">
              <button type="submit">Create task</button>
              <button type="button" data-discussion-task-cancel>Cancel</button>
            </div>
          </form>
        `}function A(){const b=ca(t.comments),T=t.replyToId?t.comments.find(y=>y.id===t.replyToId):null;e.innerHTML=`
          <section class="discussion-shell" aria-label="${N(Pe(n.scope))}">
            <header class="discussion-header">
              <div>
                <div class="discussion-eyebrow">${N(Pe(n.scope))}</div>
                <h2>Discussion</h2>
                <p>${N(la(n.scope))}</p>
              </div>
              <span class="discussion-count">${oa(t.comments)} unresolved</span>
            </header>
            ${t.error?`<div class="discussion-error">${N(t.error)}</div>`:""}
            ${M()}
            <div class="discussion-list">
              ${t.loading?'<div class="discussion-muted">Loading discussion...</div>':""}
              ${b.map(y=>$(y)).join("")}
              ${!t.loading&&!b.length?'<div class="discussion-muted">No comments yet.</div>':""}
            </div>
            <form class="discussion-composer" data-discussion-form>
              ${T?`
                <div class="discussion-replying">
                  Replying to: ${N(Ne(T,70))}
                  <button type="button" data-discussion-cancel-reply>Cancel</button>
                </div>
              `:""}
              <textarea data-discussion-body rows="3" placeholder="Write a record-attached note..."></textarea>
              <button type="submit">${T?"Reply":"Post comment"}</button>
            </form>
          </section>
        `,e.querySelector("[data-discussion-form]")?.addEventListener("submit",y=>{y.preventDefault(),h(y.currentTarget)}),e.querySelector("[data-discussion-cancel-reply]")?.addEventListener("click",()=>{t.replyToId=null,A()}),e.querySelector("[data-discussion-task-cancel]")?.addEventListener("click",()=>{t.taskSourceCommentId=null,A()}),e.querySelector("[data-discussion-task-form]")?.addEventListener("submit",y=>{y.preventDefault(),v(y.currentTarget)}),e.querySelectorAll("[data-discussion-reply]").forEach(y=>{y.addEventListener("click",()=>{t.replyToId=y.dataset.discussionReply,A()})}),e.querySelectorAll("[data-discussion-resolve]").forEach(y=>{y.addEventListener("click",()=>E(y.dataset.discussionResolve))}),e.querySelectorAll("[data-discussion-reopen]").forEach(y=>{y.addEventListener("click",()=>w(y.dataset.discussionReopen))}),e.querySelectorAll("[data-discussion-task]").forEach(y=>{y.addEventListener("click",()=>{t.taskSourceCommentId=y.dataset.discussionTask,A()})})}return m(),l=setInterval(()=>m(),3e4),typeof n.service.subscribeToDiscussionEvents=="function"&&(o=n.service.subscribeToDiscussionEvents(()=>m())),()=>{i=!0,l&&clearInterval(l),o&&o(),e.classList.remove("wein-discussion-root"),e.innerHTML=""}}}}function H(e){if(e)throw e}function ua({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t({taskId:w,providerId:v,offerId:$}={}){let M=e.from("wein_comments").select("*").order("created_at",{ascending:!0});w&&(M=M.eq("task_id",w)),v&&(M=M.eq("provider_id",v)),$&&(M=M.eq("offer_id",$));const{data:A,error:b}=await M;return H(b),A||[]}async function i({body:w,taskId:v=null,providerId:$=null,offerId:M=null,replyToId:A=null,people:b=[]}){const T=v?{task_id:v}:$?{provider_id:$}:M?{offer_id:M}:null;if(!T)throw new Error("postComment requires taskId, providerId, or offerId");const{data:y,error:F}=await e.from("wein_comments").insert({...T,reply_to_id:A,body:w,author_role:"team"}).select("*").single();H(F);for(const z of ne(w,b))try{await m(y.id,z)}catch(ce){console.error("Failed to record comment mention",ce)}return y}async function l(w,v=""){const{data:$,error:M}=await e.from("wein_comments").update({resolved_at:new Date().toISOString(),resolved_note:v}).eq("id",w).select("*");if(H(M),!$?.length)throw new Error("Resolve affected zero comments");return $[0]}async function o(w){const{data:v,error:$}=await e.from("wein_comments").update({resolved_at:null,resolved_note:null}).eq("id",w).select("*");if(H($),!v?.length)throw new Error("Reopen affected zero comments");return v[0]}async function m(w,v){const{data:$,error:M}=await e.from("wein_comment_mentions").insert({comment_id:w,mentioned_user_id:v}).select("*");return H(M),$?.[0]||null}async function h(w,v,$=null,M=null){const{data:A,error:b}=await e.rpc("wein_create_task_from_comment",{p_comment_id:w,p_title:v,p_assigned_to_user_id:$,p_due_date:M});return H(b),A}function E(w){if(!e.channel)return()=>{};const v=e.channel(`record-discussion:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},w).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},w).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_task_links"},w).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(v);if(v?.unsubscribe)return v.unsubscribe()}}return{listComments:t,postComment:i,resolveComment:l,reopenComment:o,addMention:m,createTaskFromComment:h,subscribeToDiscussionEvents:E}}function P(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}const ma={critical:"Critical",high:"High",medium:"Medium",low:"Low"},ha={task:"Task",mention:"Mention",discussion:"Discussion",review:"Review"};function pa(e){if(!e)return"No due date";const n=new Date(e);return Number.isNaN(n.getTime())?String(e):n.toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function fa(e=[]){return["critical","high","medium","low"].map(n=>({severity:n,items:e.filter(t=>t.severity===n)})).filter(n=>n.items.length)}function ga(){return{id:"work-inbox",mount(e,n){const t={items:[],loading:!0,error:null};let i=!1,l=null,o=null;e.classList.add("wein-work-inbox-root");async function m(){try{t.error=null,t.items=await n.service.loadInbox()}catch(v){t.error=v.message||String(v)}finally{t.loading=!1,i||w()}}function h(v){if(typeof n.onSelectItem=="function"){n.onSelectItem(v);return}v.href&&(window.location.hash=v.href)}function E(v){return`
          <button type="button" class="work-inbox-item severity-${P(v.severity)}" data-inbox-item="${P(v.kind)}:${P(v.entity_id)}:${P(v.reason_code)}">
            <span class="work-inbox-kind">${P(ha[v.kind]||v.kind)}</span>
            <span class="work-inbox-title">${P(v.title)}</span>
            <span class="work-inbox-reason">${P(v.reason_code.replaceAll("_"," "))}</span>
            <span class="work-inbox-due">${P(pa(v.due_at))}</span>
            <span class="work-inbox-action">${P(v.next_action)}</span>
          </button>
        `}function w(){const v=fa(t.items);e.innerHTML=`
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
                  <h3>${P(ma[$.severity])}</h3>
                  ${$.items.map(E).join("")}
                </section>
              `).join("")}
              ${!t.loading&&!t.items.length?'<div class="work-inbox-muted">No attention items right now.</div>':""}
            </div>
          </section>
        `,e.querySelector("[data-inbox-refresh]")?.addEventListener("click",()=>m()),e.querySelectorAll("[data-inbox-item]").forEach($=>{$.addEventListener("click",()=>{const M=$.dataset.inboxItem,A=t.items.find(b=>`${b.kind}:${b.entity_id}:${b.reason_code}`===M);A&&h(A)})})}return m(),l=setInterval(()=>m(),6e4),typeof n.service.subscribeToInboxEvents=="function"&&(o=n.service.subscribeToInboxEvents(()=>m())),()=>{i=!0,l&&clearInterval(l),o&&o(),e.classList.remove("wein-work-inbox-root"),e.innerHTML=""}}}}const Ue={critical:0,high:1,medium:2,low:3};function be(e,n=new Date){if(!e)return"low";const t=new Date(e);if(Number.isNaN(t.getTime()))return"low";const i=t.getTime()-n.getTime();return i<0?"critical":i<=1440*60*1e3?"high":i<=4320*60*1e3?"medium":"low"}function va(e,{now:n=new Date}={}){return{kind:"task",entity_id:e.id,title:e.title||"Untitled task",reason_code:e.due_date?"task_due":"task_open",severity:be(e.due_date,n),owner_id:e.assigned_to_user_id||e.owner_id||null,due_at:e.due_date||null,next_action:"Open task",href:`#tasks/${e.id}`,source:e}}function _a(e,{comment:n,currentUserId:t}={}){return{kind:"mention",entity_id:e.comment_id,title:n?.body?`Mention: ${n.body}`:"Mention in discussion",reason_code:"unresolved_mention",severity:n?.resolved_at?"low":"high",owner_id:t||e.mentioned_user_id,due_at:n?.created_at||e.created_at||null,next_action:"Reply or resolve",href:`#comments/${e.comment_id}`,source:{mention:e,comment:n}}}function ba(e,{currentUserId:n,now:t=new Date}={}){return{kind:"discussion",entity_id:e.id,title:e.body||"Discussion awaiting reply",reason_code:"thread_awaiting_reply",severity:be(e.next_reply_due_at||e.created_at,t),owner_id:n||null,due_at:e.next_reply_due_at||null,next_action:"Reply in thread",href:`#comments/${e.id}`,source:e}}function ya(e,{now:n=new Date}={}){return{kind:e.kind||"review",entity_id:e.id,title:e.title||e.offer_title||"Founder review needed",reason_code:e.reason_code||"founder_review",severity:be(e.due_at||e.created_at,n),owner_id:e.owner_id||null,due_at:e.due_at||e.created_at||null,next_action:"Review",href:e.href||`#review/${e.id}`,source:e}}function wa(e=[]){return[...e].sort((n,t)=>{const i=(Ue[n.severity]??9)-(Ue[t.severity]??9);return i||String(n.due_at||"").localeCompare(String(t.due_at||""))})}function $a(e=[]){const n=new Set;return e.filter(t=>{const i=`${t.kind}:${t.entity_id}:${t.reason_code}`;return n.has(i)?!1:(n.add(i),!0)})}function Sa({tasks:e=[],mentions:n=[],commentsById:t={},awaitingReplies:i=[],founderReviews:l=[]},o={}){const m=[...e.map(h=>va(h,o)),...n.map(h=>_a(h,{...o,comment:t[h.comment_id]})),...i.map(h=>ba(h,o)),...l.map(h=>ya(h,o))];return wa($a(m))}function je(e){if(e)throw e}function Ca({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(){let m=e.from("wein_tasks").select("*").neq("status","done").order("due_date",{ascending:!0,nullsFirst:!1});n&&(m=m.eq("assigned_to_user_id",n));const{data:h,error:E}=await m;return je(E),h||[]}async function i(){const{data:m,error:h}=await e.from("wein_comment_mentions").select("comment_id,mentioned_user_id,created_at,wein_comments(*)").eq("mentioned_user_id",n).is("wein_comments.resolved_at",null).order("created_at",{ascending:!0});return je(h),m||[]}async function l(){const[m,h]=await Promise.all([t(),i()]),E={},w=h.map(v=>{const $=v.wein_comments||v.comment||null;return $?.id&&(E[$.id]=$),{comment_id:v.comment_id,mentioned_user_id:v.mentioned_user_id,created_at:v.created_at}});return Sa({tasks:m,mentions:w,commentsById:E},{currentUserId:n})}function o(m){if(!e.channel)return()=>{};const h=e.channel(`work-inbox:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_tasks"},m).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},m).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},m).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(h);if(h?.unsubscribe)return h.unsubscribe()}}return{fetchOpenTasks:t,fetchUnresolvedMentions:i,loadInbox:l,subscribeToInboxEvents:o}}const Ze=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function ka(e){for(const n of Ze)ie({id:n,mount:()=>{e[n]()}})}function ye(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const Ea=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function Da(e,n){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${Ea.map(t=>`<button class="chip ${e===t?"active":""}" type="button" onclick="${n}('${t.replace(/'/g,"\\'")}')">${t==="all"?"All":ye(t)}</button>`).join("")}</div>`}function Ma(e,n){return n==="all"||String(e||"")===n}function Ta(e){return String(e?.category||e?.vertical||"-")}function La(e){const n=String(e||"").toLowerCase();return n.includes("dining")?"dining":n.includes("health")?"health":n.includes("fun")?"fun":n.includes("hotel")?"hotels":""}function Ia(e,n=Date.now()){return e?Math.floor((n-new Date(e).getTime())/864e5):0}function pe(e=new Date){const n=new Date(e);return n.setHours(0,0,0,0),n}function qa(e,n=new Date){return e?Math.round((pe(n).getTime()-pe(e).getTime())/864e5):null}function et(e,n){let t=String(e||"").replace(/\D/g,"");if(!t)return null;t.startsWith("0")&&(t=`20${t.slice(1)}`);const i=`Hi! Following up on the WeIN offer sheet for ${n} - do you have 5 minutes today?`;return`https://wa.me/${t}?text=${encodeURIComponent(i)}`}function Aa(e,n){const t=et(e,n);return t?`<a class="mini-btn" href="${ye(t)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function Y(e){return e.id}function Oa(e){return L("profiles").find(n=>Y(n)===e)??null}function Ra(e){return L("providers").find(n=>Y(n)===e)??null}function Na(e){return L("leads").find(n=>Y(n)===e)??null}function Pa(e){return L("tasks").find(n=>Y(n)===e)??null}function Ua(e){return L("offers").find(n=>Y(n)===e)??null}function ja(e){return L("offers").filter(n=>n.provider_id===e)}function Ba(e){return L("tasks").filter(n=>n.provider_id===e)}function Fa(e){return L("tasks").filter(n=>n.lead_id===e)}const xa=Object.freeze(Object.defineProperty({__proto__:null,leadById:Na,offerById:Ua,offersForProvider:ja,profileById:Oa,providerById:Ra,taskById:Pa,tasksForLead:Fa,tasksForProvider:Ba},Symbol.toStringTag,{value:"Module"}));function Ha(){const e=document.title;let n=!1;async function t(){const l=window.WEIN?.user?.id;if(l)try{const m=await Je({supabase:ae(),currentUserId:l}).listConversations(),h=Qe(m),E=document.querySelector("[data-chat-unread-badge]");E&&(E.textContent=String(h),E.style.display=h>0?"inline-flex":"none"),document.title=Bn(e,h)}catch{}}const i=setInterval(()=>{window.WEIN?.user?.id&&!n&&(n=!0,clearInterval(i),setInterval(t,3e4)),t()},2e3)}Dn();ra();Ha();const tt={api:We,auth:{canDelete:fe,canManageDeals:Fe,canEditProviderProfile:xe,navHiddenForRole:ge,defaultViewForRole:He},platform:{getSupabaseClient:ae,getAccessToken:re,getSessionContext:pn},shared:{escapeHtml:ye,daysSince:Ia,startOfLocalDay:pe,dayDiffFromToday:qa,whatsappLink:et,whatsappButtonHtml:Aa,categoryChipsHtml:Da,matchesCategoryFilter:Ma,categoryLabel:Ta,catBadgeClass:La},core:{createPortalContext:Sn,getView:Ve,mountView:En,registeredViewIds:Cn,registerView:ie},legacy:{LEGACY_VIEW_IDS:Ze,registerLegacyViews:ka},features:{requestOpenChatConversation:sa,createDiscussionViewModule:da,createSupabaseDiscussionService:ua,createWorkInboxViewModule:ga,createSupabaseWorkInboxService:Ca},store:Ge,selectors:xa};window.WEIN_PORTAL_MODULES=tt;for(const e of window.WEIN_PORTAL_MODULES_READY??[])e(tt);window.WEIN_PORTAL_MODULES_READY=[];
