function Qe(t){return typeof t=="object"&&t!==null?t.role:t}function ye(t){const a=Qe(t);return a==="admin"||a==="manager"}const Ye=ye;function Ke(t){const a=Qe(t);return a==="admin"||a==="manager"||a==="deal_breaker"}const Tn={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function we(t){return t?Tn[t]??[]:[]}function Je(t){return we(t).includes("pipeline")?"tasks":"pipeline"}function j(){return window.WEIN_PORTAL_LEGACY??{}}function ce(){const t=j().supabaseClient;if(!t)throw new Error("Portal Supabase client is not available yet.");return t}function oe(){const t=j().getSupabaseUrl?.();if(!t)throw new Error("Portal Supabase URL is not available yet.");return t}function In(){const t=j().getSupabaseAnonKey?.();if(!t)throw new Error("Portal Supabase anon key is not available yet.");return t}function le(){return j().getAccessToken?.()??null}function Ln(){return{client:ce(),accessToken:le()}}class Dn extends Error{constructor(a,e,c){super(a),this.status=e,this.body=c,this.name="PortalApiError"}status;body}function K(){const t=j().headers?.();if(t)return t;const a=In();return{apikey:a,Authorization:`Bearer ${le()||a}`,"Content-Type":"application/json"}}async function $e(t,a){if(t.ok)return;const e=await t.text();throw new Dn(`Supabase ${a} failed: ${t.status}${e?` ${e}`:""}`,t.status,e)}async function qn(t){const a=j().get;if(a)return a(t);const e=await fetch(`${oe()}/rest/v1/${t}`,{headers:K()});return await $e(e,"GET"),e.json()}async function An(t,a){const e=j().post;if(e)return e(t,a);const c=await fetch(`${oe()}/rest/v1/${t}`,{method:"POST",headers:{...K(),Prefer:"return=representation"},body:JSON.stringify(a)});return await $e(c,"POST"),c.json()}async function On(t,a){const e=j().patch;return e?e(t,a):(await fetch(`${oe()}/rest/v1/${t}`,{method:"PATCH",headers:K(),body:JSON.stringify(a)})).ok}async function Rn(t){const a=j().delete;if(a)return a(t);const e=await fetch(`${oe()}/rest/v1/${t}`,{method:"DELETE",headers:K()});return await $e(e,"DELETE"),!0}const Xe={headers:K,get:qn,post:An,patch:On,delete:Rn},Pn={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function Nn(){const t=j().getCaches?.();return t?{providers:t.providers??[],offers:t.offers??[],negotiations:t.negotiations??[],files:t.files??[],leads:t.leads??[],outcomes:t.outcomes??[],tasks:t.tasks??[],profiles:t.profiles??[],redemptions:t.redemptions??[],campaigns:t.campaigns??[],calendarNotes:t.calendarNotes??[]}:Pn}function q(t){return Nn()[t]}function Ze(t,a){const e=j().setCache;if(!e)throw new Error("Portal cache bridge is not available yet.");e(t,[...a])}function Un(t,a){Ze(t,a(q(t)))}const et={get providers(){return q("providers")},get offers(){return q("offers")},get negotiations(){return q("negotiations")},get files(){return q("files")},get leads(){return q("leads")},get outcomes(){return q("outcomes")},get tasks(){return q("tasks")},get profiles(){return q("profiles")},get redemptions(){return q("redemptions")},get campaigns(){return q("campaigns")},get calendarNotes(){return q("calendarNotes")},getCache:q,replaceCache:Ze,updateCache:Un};function ae(){const t=window.WEIN??{};return{user:t.user,role:t.role??sessionStorage.getItem("weinRole"),fullName:t.fullName??null,accessToken:le(),client:ce()}}function jn(){const t=ae();return{api:Xe,store:et,session:t,permissions:{canDelete:()=>ye(ae()),canManageDeals:()=>Ye(ae()),canEditProviderProfile:()=>Ke(ae()),navHiddenForRole:we,defaultViewForRole:Je},navigate(a,e){window.showView?.(a,e)}}}const Y=new Map;let re=null;function de(t){if(!t.id)throw new Error("View id is required.");if(Y.has(t.id))throw new Error(`View already registered: ${t.id}`);Y.set(t.id,t)}function tt(t){return Y.get(t)}function Fn(){return[...Y.keys()]}function Bn(){if(!re)return;const t=re;re=null,t()}function xn(t,a,e){const c=tt(t);if(!c)throw new Error(`Unknown portal view: ${t}`);Bn();const d=c.mount(a,e);re=typeof d=="function"?d:null}function Hn(){Y.has("__dummy_cleanup_probe")||de({id:"__dummy_cleanup_probe",mount(t){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,t.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function Wn(t="chat"){const a=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${t}-${a}`}function ve(t,a){return t.kind==="group"?t.title||"Untitled group":t.kind==="channel"?t.title||"Untitled channel":(t.members||[]).map(c=>c.profile).find(c=>c&&c.id!==a)?.full_name||"Direct message"}function zn(t){return[...t].sort((a,e)=>{const c=a.last_message?.created_at||a.created_at,d=e.last_message?.created_at||e.created_at;return new Date(d).getTime()-new Date(c).getTime()})}function Gn(t,a){const e=(t.members||[]).find(d=>d.user_id===a),c=t.last_message?.message_seq||0;return Math.max(0,c-(e?.last_read_seq||0))}function Vn(t){return[...t].sort((a,e)=>{const c=(a.unread_count||0)>0,d=(e.unread_count||0)>0;if(c!==d)return c?-1:1;const o=a.last_message?.created_at||a.created_at,h=e.last_message?.created_at||e.created_at;return new Date(h).getTime()-new Date(o).getTime()})}const Qn=["channel","group","dm"];function Yn(t){const a={channel:[],group:[],dm:[]};for(const e of t)(a[e.kind]||a.dm).push(e);return Qn.map(e=>({kind:e,conversations:Vn(a[e])}))}function Kn(t){return{id:t.id,kind:"channel",title:t.title??null,topic:t.topic??null,description:t.description??null,created_by:t.created_by,creator_name:t.creator_name??null,created_at:t.created_at,archived_at:t.archived_at??null,member_count:Number(t.member_count)||0,joined_by_current_user:!!t.joined_by_current_user}}function Jn(t){if(!t)return"No messages yet";const a=(t.deleted_at?"Message deleted":t.body||"").trim();return a.length>82?`${a.slice(0,79)}...`:a}function Xn(t,a){return{...t,[a]:{pending:!0,error:null}}}function Zn(t,a){return{...t,[a]:{pending:!1,error:null}}}function ea(t,a,e){return{...t,[a]:{pending:!1,error:e}}}function A(t,a){return!!t?.[a]?.pending}function M(t,a){return t?.[a]?.error??null}const ta=[["only an admin or manager may create a channel","Only an admin or manager can create a channel."],["channel name is required","Enter a channel name."],["only channels can be joined this way","That conversation can't be joined this way."],["this channel has been archived","This channel has been archived and can no longer be joined."],["conversation not found","This conversation no longer exists."],["chat conversation immutable columns cannot be updated","That change isn't allowed."],["only group or channel conversations can be renamed","Direct messages can't be renamed."],["only channel details can be edited this way","That change isn't allowed here."],["only the channel owner, an admin, or a manager may edit channel details","Only the channel owner, an admin, or a manager can edit channel details."],["channel topic must be 160 characters or fewer","Topic must be 160 characters or fewer."],["channel description must be 1000 characters or fewer","Description must be 1000 characters or fewer."],["active membership required to pin a message","You need to be a member of this conversation to pin a message."],["active membership required to unpin a message","You need to be a member of this conversation to unpin a message."],["this message is already pinned","That message is already pinned."],["message does not belong to this conversation","That message can't be pinned here."],["message not found","This message no longer exists."]];function se(t){const a=(t instanceof Error?t.message:String(t??"")).toLowerCase(),e=ta.find(([c])=>a.includes(c));return e?e[1]:"Something went wrong. Please try again."}function nt(t=[]){return t.reduce((a,e)=>{const c=Number(e?.unread_count);return a+(Number.isFinite(c)&&c>0?c:0)},0)}function na(t,a){const e=String(t??"");return a>0?`(${a}) ${e}`:e}const aa=/[\s\p{P}]/u,sa=/[\s\p{P}]/u;function at(t,a){return a===0?!0:aa.test(t[a-1])}function ra(t,a){return a>=t.length?!0:sa.test(t[a])}function ie(t="",a=[]){const e=String(t??"");if(!e.includes("@"))return[];const c=a.filter(f=>f&&f.id&&f.full_name).map(f=>({id:f.id,name:String(f.full_name)})).sort((f,E)=>E.name.length-f.name.length);if(!c.length)return[];const d=e.toLowerCase(),o=[],h=new Set;for(let f=0;f<e.length;f+=1){if(e[f]!=="@"||!at(e,f))continue;const E=f+1;for(const y of c){const v=E+y.name.length;if(d.startsWith(y.name.toLowerCase(),E)&&ra(e,v)){h.has(y.id)||(h.add(y.id),o.push(y.id)),f=v-1;break}}}return o}function ia(t="",a=[]){const e=new Set(ie(t,a));return a.filter(c=>c&&e.has(c.id)&&c.full_name).map(c=>String(c.full_name)).sort((c,d)=>d.length-c.length)}function ca(t="",a=0){const e=String(t??""),c=Math.max(0,Math.min(Number(a)||0,e.length)),d=40;for(let o=c-1;o>=0&&c-o<=d;o-=1){const h=e[o];if(h==="@")return at(e,o)?{query:e.slice(o+1,c),start:o}:null;if(h===`
`)return null}return null}const oa={channel:"Channels",group:"Private groups",dm:"Direct messages"};function l(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function Q(t){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[t]||t}function la(t){return`${t}-${Math.random().toString(16).slice(2)}-${Date.now().toString(36)}`}function Ue(t){return typeof t=="string"&&t.startsWith("image/")}function da(t){const a=Number(t)||0;return a<1024?`${a} B`:a<1024*1024?`${(a/1024).toFixed(1)} KB`:`${(a/(1024*1024)).toFixed(1)} MB`}function je(t){return t==="application/pdf"?"ti-file-type-pdf":t?.includes("word")?"ti-file-type-doc":t?.includes("sheet")||t?.includes("excel")?"ti-file-type-xls":"ti-file"}function Fe(t,a=new Date){if(!t)return"";const e=new Date(t);if(Number.isNaN(e.getTime()))return"";const c=a.getTime()-e.getTime(),d=Math.floor(c/6e4);if(d<1)return"now";if(d<60)return`${d}m`;const o=Math.floor(d/60);return o<24?`${o}h`:c<6*864e5?e.toLocaleDateString(void 0,{weekday:"short"}):e.toLocaleDateString(void 0,{month:"short",day:"numeric"})}const ua=300*1e3;function ha(t,a){if(!a||t.sender_id!==a.sender_id)return!0;const e=new Date(t.created_at).getTime()-new Date(a.created_at).getTime();return!(e>=0&&e<ua)}function ma(){return{id:"team-chat",mount(t,a){const e={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,composeOpen:!1,composeSearch:"",composeGroupTitle:"",composeChannelTitle:"",composeSelectedMemberIds:new Set,sidebarSectionsCollapsed:{},browseChannelsOpen:!1,browseChannelsList:[],browseChannelsLoading:!1,browseChannelsError:null,browseChannelsSearch:"",membersOpen:!1,memberAddOpen:!1,memberSearch:"",memberSelectedIds:new Set,renameOpen:!1,renameDraft:"",archiveConfirmOpen:!1,channelDetailsOpen:!1,channelDetailsTitleDraft:"",channelDetailsTopicDraft:"",channelDetailsDescriptionDraft:"",leaveChannelConfirmOpen:!1,pinnedMessages:[],pinnedMessagesLoading:!1,pinnedMessagesError:null,pinnedMessagesPanelOpen:!1,unpinConfirmMessageId:null,mentionQuery:null,mentionIndex:0,mentionStart:0,mentionDraft:"",pendingAttachments:[],openMessageMenuId:null,confirmingDeleteMessageId:null,searchOpen:!1,searchQuery:"",searchResults:[],searchLoading:!1,searchError:null,searchScope:"all",searchSenderId:"",searchFrom:"",searchTo:"",searchAttachmentsOnly:!1,loading:!0,error:null,actionState:{}},c=new Map,d=new Set;let o=!1,h=a.initialConversationId||null;async function f(n,s){if(!A(e.actionState,n)){e.actionState=Xn(e.actionState,n),m();try{if(await s(),o)return;e.actionState=Zn(e.actionState,n)}catch(r){if(o)return;e.actionState=ea(e.actionState,n,se(r))}m()}}let E=null,y=null,v=!1,$=null,T=0;function O(){const n=t.querySelector(".chat-message-list");return n?n.scrollHeight-n.scrollTop-n.clientHeight<80:!0}function b(){const n=t.querySelector(".chat-message-list");n&&(n.scrollTop=n.scrollHeight)}function I(n){n.style.height="auto",n.style.height=`${Math.min(n.scrollHeight,120)}px`}function w(n){return n?n.members.filter(s=>!s.left_at&&s.profile).map(s=>s.profile):[]}function B(n){const s=String(e.mentionQuery||"").trim().toLowerCase(),r=w(n).filter(u=>u.id!==a.currentUser.id);return s?r.filter(u=>(u.full_name||"").toLowerCase().includes(s)):r}function G({rerender:n=!0}={}){e.mentionQuery!==null&&(e.mentionQuery=null,e.mentionIndex=0,n&&m())}function he(n){e.mentionDraft=n.value;const s=ca(n.value,n.selectionStart??n.value.length),r=s?s.query:null;return r===e.mentionQuery?!1:(e.mentionQuery=r,e.mentionStart=s?s.start:0,e.mentionIndex=0,!0)}function ke(n,s){const r=t.querySelector("[data-chat-composer]");if(!r||!s)return;const u=r.selectionStart??r.value.length,g=r.value.slice(0,e.mentionStart),S=r.value.slice(u),C=`@${s.full_name} `,_=`${g}${C}${S}`,D=g.length+C.length;e.mentionQuery=null,e.mentionIndex=0,e.mentionDraft=_,m();const k=t.querySelector("[data-chat-composer]");k&&(k.value=_,I(k),k.focus(),k.setSelectionRange?.(D,D))}function Ee(n,s){const r=B(n);if(!r.length)return;const u=(e.mentionIndex+s+r.length)%r.length;e.mentionIndex=u;const g=t.querySelector("[data-chat-composer]")?.value??e.mentionDraft,S=t.querySelector("[data-chat-composer]")?.selectionStart??g.length;e.mentionDraft=g,m();const C=t.querySelector("[data-chat-composer]");C&&(C.value=g,I(C),C.focus(),C.setSelectionRange?.(S,S))}t.classList.add("wein-chat-root"),typeof document<"u"&&document.body?.classList.add("wein-chat-root");function Me(n){const s=n.target;if(s instanceof Element){if(e.composeOpen&&!s.closest("[data-chat-compose-popover]")&&!s.closest("[data-chat-compose-toggle]")){X();return}if(e.membersOpen&&!s.closest("[data-chat-members-panel]")&&!s.closest("[data-chat-members-toggle]")){Z();return}e.openMessageMenuId&&!s.closest("[data-chat-message-menu-panel]")&&!s.closest("[data-chat-message-menu]")&&(e.openMessageMenuId=null,m())}}function Te(n){if(n.key==="Escape"){if(e.composeOpen){X();return}if(e.membersOpen){Z();return}(e.openMessageMenuId||e.confirmingDeleteMessageId)&&(e.openMessageMenuId=null,e.confirmingDeleteMessageId=null,m())}}t.addEventListener?.("click",Me),typeof document<"u"&&document.addEventListener("keydown",Te);async function R({keepMessages:n=!0}={}){try{e.error=null;const[s,r]=await Promise.all([a.service.listProfiles(),a.service.listConversations()]);if(e.profiles=s,e.conversations=zn(r),h&&(e.conversations.some(u=>u.id===h)&&(e.selectedConversationId=h),h=null),!e.selectedConversationId&&e.conversations.length&&(e.selectedConversationId=e.conversations[0].id),e.selectedConversationId&&n){e.messages=await a.service.listMessages(e.selectedConversationId);const u=e.messages.at(-1)?.message_seq||0;if(u)try{await a.service.markRead(e.selectedConversationId,u)}catch(g){console.error("Failed to mark chat messages as read",g)}}}catch(s){e.error=s.message||String(s)}finally{e.loading=!1,o||m()}}async function x(n){e.selectedConversationId=n,e.membersOpen=!1,e.memberAddOpen=!1,e.memberSearch="",e.memberSelectedIds=new Set,e.renameOpen=!1,e.renameDraft="",e.archiveConfirmOpen=!1,e.pendingAttachments=[],e.pinnedMessages=[],e.pinnedMessagesPanelOpen=!1,e.unpinConfirmMessageId=null,t.classList.add("chat-has-selection"),e.messages=await a.service.listMessages(n),v=!0,o||m();const s=e.messages.at(-1)?.message_seq||0;if(s)try{await a.service.markRead(n,s)}catch(r){console.error("Failed to mark chat messages as read",r)}dt(n),await R()}function me(){t.classList.remove("chat-has-selection")}async function dt(n){e.pinnedMessagesError=null,e.pinnedMessagesLoading=!0,m();try{const s=await a.service.listPinnedMessages(n);if(o||e.selectedConversationId!==n)return;e.pinnedMessages=s,e.pinnedMessagesLoading=!1,m()}catch(s){if(o||e.selectedConversationId!==n)return;e.pinnedMessagesError=se(s),e.pinnedMessagesLoading=!1,m()}}function Ie(n){return e.pinnedMessages.some(s=>s.message_id===n)}function Le(n){return e.pinnedMessages.find(s=>s.message_id===n)||null}async function ut(n,s){const r=await a.service.pinMessage(n,s);e.pinnedMessages=[{id:r,conversation_id:n,message_id:s,pinned_by:a.currentUser.id,pinned_at:new Date().toISOString(),pinner:a.currentUser,message:e.messages.find(u=>u.id===s)||null},...e.pinnedMessages],e.openMessageMenuId=null,o||m()}async function De(n,s){await a.service.unpinMessage(n,s),e.pinnedMessages=e.pinnedMessages.filter(r=>r.message_id!==s),e.unpinConfirmMessageId=null,e.openMessageMenuId=null,o||m()}function ht(n,s){const r=Le(s);if(r&&r.pinned_by!==a.currentUser.id){e.unpinConfirmMessageId=s,m();return}f(`unpin-message:${s}`,()=>De(n,s))}function mt(){e.unpinConfirmMessageId=null,m()}function qe(){e.pinnedMessagesPanelOpen=!e.pinnedMessagesPanelOpen,m()}function pt(n){e.pinnedMessagesPanelOpen=!1,m();const s=Array.from(t.querySelectorAll("[data-chat-message-id]")).find(r=>r.dataset.chatMessageId===n);s&&(s.scrollIntoView({block:"center"}),s.classList.add("chat-message-jumped"),setTimeout(()=>s.classList.remove("chat-message-jumped"),1600))}function pe(n){const s=e.selectedConversationId;if(!s)return;const r=[...n||[]];for(const u of r){const g={id:la("pending"),name:u.name,mime:u.type||"application/octet-stream",size:u.size,status:"uploading",error:null,uploaded:null};e.pendingAttachments=[...e.pendingAttachments,g],a.service.uploadAttachment(s,u).then(S=>{g.status="done",g.uploaded=S,o||m()}).catch(S=>{g.status="error",g.error=S?.message||"Upload failed",o||m()})}m()}function ft(n){e.pendingAttachments=e.pendingAttachments.filter(s=>s.id!==n),m()}async function gt(n){const s=n.querySelector("[data-chat-composer]"),r=s.value.trim(),u=e.pendingAttachments.some(k=>k.status==="uploading"),g=e.pendingAttachments.filter(k=>k.status==="done").map(k=>k.uploaded);if(u||!r&&!g.length||!e.selectedConversationId)return;const S=e.replyToMessageId,C=e.conversations.find(k=>k.id===e.selectedConversationId)||null,_=ie(r,w(C));s.value="",e.replyToMessageId=null,e.mentionQuery=null,e.mentionDraft="",e.pendingAttachments=[];const D=await a.service.sendMessage({conversationId:e.selectedConversationId,body:r,clientNonce:Wn("portal-chat"),replyToId:S,mentionedUserIds:_,attachments:g});e.messages=[...e.messages,D],v=!0,o||m();try{await a.service.markRead(e.selectedConversationId,D.message_seq)}catch(k){console.error("Failed to mark chat message as read",k)}await R()}function vt(n){n&&(e.replyToMessageId=n,m(),t.querySelector("[data-chat-composer]")?.focus())}function _t(){e.replyToMessageId=null,m()}function bt(){e.composeOpen=!0,e.searchOpen=!1,e.browseChannelsOpen=!1,m(),t.querySelector("[data-chat-compose-search]")?.focus()}function X({reset:n=!1}={}){e.composeOpen=!1,n&&(e.composeSearch="",e.composeGroupTitle="",e.composeChannelTitle="",e.composeSelectedMemberIds=new Set),m()}function yt(){e.searchOpen=!0,e.composeOpen=!1,e.browseChannelsOpen=!1,m(),t.querySelector("[data-chat-search-input]")?.focus()}function fe(){e.searchOpen=!1,e.searchQuery="",e.searchResults=[],e.searchLoading=!1,e.searchError=null,e.searchScope="all",e.searchSenderId="",e.searchFrom="",e.searchTo="",e.searchAttachmentsOnly=!1,$&&clearTimeout($),m()}function wt(n){return{query:n,conversationId:e.searchScope==="current"?e.selectedConversationId:null,senderId:e.searchSenderId||null,from:e.searchFrom?new Date(e.searchFrom).toISOString():null,to:e.searchTo?new Date(`${e.searchTo}T23:59:59.999`).toISOString():null,hasAttachments:e.searchAttachmentsOnly?!0:null}}async function Ae(n){const s=wt(n),r=(n||"").trim(),u=!!(s.conversationId||s.senderId||s.from||s.to||s.hasAttachments);if(!r&&!u){e.searchResults=[],e.searchLoading=!1,e.searchError=null,o||m();return}const g=++T;e.searchLoading=!0,e.searchError=null,o||m();try{const S=await a.service.searchMessages(s);if(o||g!==T)return;e.searchResults=S,e.searchLoading=!1,m()}catch(S){if(o||g!==T)return;e.searchError=se(S),e.searchLoading=!1,m()}}function $t(n){e.searchQuery=n,$&&clearTimeout($),$=setTimeout(()=>Ae(n),300)}function V(){$&&clearTimeout($),Ae(e.searchQuery)}async function St(n,s){if(fe(),await x(n),o)return;const r=Array.from(t.querySelectorAll("[data-chat-message-id]")).find(u=>u.dataset.chatMessageId===s);r&&(r.scrollIntoView({block:"center"}),r.classList.add("chat-message-jumped"),setTimeout(()=>r.classList.remove("chat-message-jumped"),1600))}function Ct(n,s){const r=new Set(e.composeSelectedMemberIds);s?r.add(n):r.delete(n),e.composeSelectedMemberIds=r,m()}function Oe(n){return n.members.find(r=>r.user_id===a.currentUser.id&&!r.left_at)?.membership_role==="owner"||["admin","manager"].includes(a.currentUser.role)}function Re(n){return!n||!["group","channel"].includes(n.kind)?!1:Oe(n)}function kt(n){return n?Oe(n):!1}function Et(){e.membersOpen=!0,m()}function Z({reset:n=!1}={}){e.membersOpen=!1,e.memberAddOpen=!1,n&&(e.memberSearch="",e.memberSelectedIds=new Set),m()}function Mt(){e.memberAddOpen=!e.memberAddOpen,m(),e.memberAddOpen&&t.querySelector("[data-chat-member-search]")?.focus()}function Tt(n,s){const r=new Set(e.memberSelectedIds);s?r.add(n):r.delete(n),e.memberSelectedIds=r,m()}async function It(n){const s=[...e.memberSelectedIds];if(!(!n||!s.length)){for(const r of s)await a.service.addMember(n,r);e.memberSearch="",e.memberSelectedIds=new Set,e.memberAddOpen=!1,o||m(),await R()}}async function Lt(n,s){!n||!s||(await a.service.removeMember(n,s),e.conversations=e.conversations.map(r=>r.id!==n?r:{...r,members:r.members.map(u=>u.user_id===s?{...u,left_at:u.left_at||new Date().toISOString()}:u)}),s===a.currentUser.id&&(e.membersOpen=!1,e.memberAddOpen=!1),o||m(),await R())}function Dt(n){const s=e.messages.find(u=>u.id===n);if(!s)return;e.editingMessageId=n,e.editDraft=s.body||"",m();const r=t.querySelector(`[data-chat-edit-input="${CSS.escape(n)}"]`);r?.focus(),r?.select?.()}function qt(){e.editingMessageId=null,e.editDraft="",m()}async function At(n){const s=n.dataset.chatEditForm,u=n.querySelector("[data-chat-edit-input]").value.trim();if(!s||!u)return;const g=e.conversations.find(C=>C.id===e.selectedConversationId)||null,S=await a.service.updateMessage(s,u,ie(u,w(g)));e.messages=e.messages.map(C=>C.id===S.id?S:C),e.editingMessageId=null,e.editDraft="",o||m(),await R()}async function Ot(n){if(!n)return;const s=await a.service.deleteMessage(n);e.messages=e.messages.map(r=>r.id===n?{...r,...s,body:"Message deleted",deleted_at:s.deleted_at||new Date().toISOString()}:r),e.replyToMessageId===n&&(e.replyToMessageId=null),e.confirmingDeleteMessageId=null,e.openMessageMenuId=null,o||m(),await R()}async function Rt(n){const r=n.members.find(u=>u.user_id===a.currentUser.id)?.notification_level==="muted"?"all":"muted";await a.service.setNotificationLevel(n.id,r),e.conversations=e.conversations.map(u=>u.id!==n.id?u:{...u,members:u.members.map(g=>g.user_id===a.currentUser.id?{...g,notification_level:r}:g)}),o||m(),await R()}function Pt(n){e.renameOpen=!0,e.renameDraft=n.title||"",m(),t.querySelector("[data-chat-rename-input]")?.focus()}function Nt(){e.renameOpen=!1,e.renameDraft="",m()}async function Ut(n,s){const r=(s||"").trim();r&&(await a.service.renameConversation(n.id,r),e.conversations=e.conversations.map(u=>u.id===n.id?{...u,title:r}:u),e.renameOpen=!1,e.renameDraft="",o||m(),await R())}function jt(){e.archiveConfirmOpen=!0,m()}function Ft(){e.archiveConfirmOpen=!1,m()}async function Bt(n,s){await a.service.setConversationArchived(n.id,s),e.archiveConfirmOpen=!1,e.selectedConversationId===n.id&&(e.selectedConversationId=null,me()),e.conversations=e.conversations.map(r=>r.id===n.id?{...r,archived_at:new Date().toISOString()}:r),o||m(),await R()}function xt(n){e.channelDetailsOpen=!0,e.channelDetailsTitleDraft=n.title||"",e.channelDetailsTopicDraft=n.topic||"",e.channelDetailsDescriptionDraft=n.description||"",e.membersOpen=!1,m(),t.querySelector("[data-chat-channel-details-title]")?.focus()}function Ht(){e.channelDetailsOpen=!1,m()}async function Wt(n){const s=e.channelDetailsTitleDraft,r=e.channelDetailsTopicDraft,u=e.channelDetailsDescriptionDraft;await a.service.updateChannelDetails(n.id,{title:s,topic:r,description:u}),e.conversations=e.conversations.map(g=>g.id===n.id?{...g,title:s.trim(),topic:r.trim()||null,description:u.trim()||null}:g),e.channelDetailsOpen=!1,o||m(),await R()}function zt(){e.leaveChannelConfirmOpen=!0,m()}function Gt(){e.leaveChannelConfirmOpen=!1,m()}async function Vt(n){await a.service.leaveChannel(n.id),e.leaveChannelConfirmOpen=!1,e.conversations=e.conversations.filter(s=>s.id!==n.id),e.selectedConversationId===n.id&&(e.selectedConversationId=e.conversations[0]?.id||null,me()),o||m(),await R()}async function Qt(n,s,r){!n||!s||(await a.service.setMembershipRole(n,s,r),e.conversations=e.conversations.map(u=>u.id!==n?u:{...u,members:u.members.map(g=>g.user_id===s?{...g,membership_role:r}:g)}),o||m(),await R())}async function Yt(n){if(!n)return;const s=await a.service.getOrCreateDm(n);e.composeOpen=!1,e.composeSearch="",e.composeGroupTitle="",e.composeSelectedMemberIds=new Set,await x(s)}async function Kt(n,s){if(n=n.trim(),!n)return;const r=await a.service.createGroup(n,s);e.composeOpen=!1,e.composeSearch="",e.composeGroupTitle="",e.composeSelectedMemberIds=new Set,await x(r)}async function Jt(n){if(n=n.trim(),!n)return;const s=await a.service.createChannel(n);e.composeOpen=!1,e.composeChannelTitle="",await x(s)}async function Xt(){e.browseChannelsError=null,e.browseChannelsLoading=!0,m();try{const n=await a.service.listChannels();e.browseChannelsList=[...n].sort((s,r)=>s.joined_by_current_user!==r.joined_by_current_user?s.joined_by_current_user?-1:1:(s.title||"").localeCompare(r.title||"")),e.browseChannelsLoading=!1,o||m()}catch(n){e.browseChannelsError=se(n),e.browseChannelsLoading=!1,o||m()}}async function Zt(){e.browseChannelsOpen=!0,e.composeOpen=!1,e.searchOpen=!1,e.browseChannelsSearch="",await Xt()}function ee(){e.browseChannelsOpen=!1,e.browseChannelsList=[],e.browseChannelsError=null,e.browseChannelsSearch="",m()}function en(){const n=e.browseChannelsSearch.trim().toLowerCase();return n?e.browseChannelsList.filter(s=>(s.title||"").toLowerCase().includes(n)||(s.topic||"").toLowerCase().includes(n)):e.browseChannelsList}async function tn(n){await a.service.joinChannel(n),ee(),await x(n)}function nn(n){ee(),x(n)}function an(){o||R()}function sn(n){return n.members?.find(r=>r.user_id===a.currentUser.id)?.notification_level==="muted"}function rn(n){const s=n.id===e.selectedConversationId?" selected":"",r=sn(n)?" muted":"",u=n.unread_count?`<span class="chat-count${r?" muted":""}">${n.unread_count}</span>`:"",g=ve(n,a.currentUser.id),S=n.kind==="channel"?'<span class="chat-conversation-hash" aria-hidden="true">#</span>':n.kind==="group"?'<span class="chat-conversation-hash" aria-hidden="true"><i class="ti ti-lock"></i></span>':`<span class="chat-conversation-avatar" aria-hidden="true">${l((g||"?").slice(0,1).toUpperCase())}</span>`;return`
          <button type="button" class="chat-conversation${s}${r}" data-chat-select="${l(n.id)}">
            ${S}
            <span class="chat-conversation-title">${l(g)}</span>
            ${u}
          </button>
        `}function cn(n){e.sidebarSectionsCollapsed={...e.sidebarSectionsCollapsed,[n]:!e.sidebarSectionsCollapsed[n]},m()}function on(n){if(!n.conversations.length)return"";const s=!!e.sidebarSectionsCollapsed[n.kind],r=nt(n.conversations);return`
          <div class="chat-sidebar-section">
            <button type="button" class="chat-sidebar-section-head" data-chat-sidebar-section-toggle="${n.kind}" aria-expanded="${!s}">
              <i class="ti ${s?"ti-chevron-right":"ti-chevron-down"}"></i>
              <span class="chat-sidebar-section-label">${l(oa[n.kind])}</span>
              ${r?`<span class="chat-count">${r}</span>`:""}
            </button>
            ${s?"":n.conversations.map(rn).join("")}
          </div>
        `}function Pe(n,s){const r=l(n),u=(s||"").trim();if(!u)return r;const g=l(u).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return g?r.replace(new RegExp(`(${g})`,"gi"),"<mark>$1</mark>"):r}function ln(n){const s=e.conversations.find(C=>C.id===n.conversation_id),r=s?ve(s,a.currentUser.id):"Archived conversation",u=Fe(n.created_at),g=n.sender?.full_name||"Unknown",S=n.attachments||[];return`
          <button type="button" class="chat-search-result" data-chat-search-result="${l(n.conversation_id)}" data-chat-search-message="${l(n.id)}">
            <span class="chat-search-result-row">
              <span class="chat-search-result-title">${l(r)}</span>
              ${u?`<span class="chat-search-result-time">${l(u)}</span>`:""}
            </span>
            <span class="chat-search-result-snippet"><strong>${l(g)}:</strong> ${Pe(Jn(n),e.searchQuery)}</span>
            ${S.length?`
              <span class="chat-channel-directory-meta"><i class="ti ti-paperclip"></i> ${S.map(C=>Pe(C.name,e.searchQuery)).join(", ")}</span>
            `:""}
          </button>
        `}function dn(){const n=e.searchQuery.trim(),s=!!(e.searchScope==="current"&&e.selectedConversationId||e.searchSenderId||e.searchFrom||e.searchTo||e.searchAttachmentsOnly),r=e.profiles;return`
          <div class="chat-search-panel">
            <div class="chat-search-input-row">
              <i class="ti ti-search"></i>
              <input data-chat-search-input type="search" placeholder="Search messages..." value="${l(e.searchQuery)}" autocomplete="off">
              <button type="button" data-chat-search-close aria-label="Close search"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-search-filters">
              <select data-chat-search-scope${e.selectedConversationId?"":" disabled"} aria-label="Search scope">
                <option value="all"${e.searchScope==="all"?" selected":""}>All conversations</option>
                <option value="current"${e.searchScope==="current"?" selected":""}>This conversation</option>
              </select>
              <select data-chat-search-sender aria-label="Filter by sender">
                <option value="">Anyone</option>
                ${r.map(u=>`
                  <option value="${l(u.id)}"${e.searchSenderId===u.id?" selected":""}>${l(u.id===a.currentUser.id?"You":u.full_name||"Unknown")}</option>
                `).join("")}
              </select>
              <input data-chat-search-from type="date" aria-label="From date" value="${l(e.searchFrom)}">
              <input data-chat-search-to type="date" aria-label="To date" value="${l(e.searchTo)}">
              <label class="chat-search-attachments-only">
                <input type="checkbox" data-chat-search-attachments-only${e.searchAttachmentsOnly?" checked":""}>
                <span>Has attachments</span>
              </label>
            </div>
            <div class="chat-search-results">
              ${e.searchLoading?'<div class="chat-muted">Searching...</div>':""}
              ${e.searchError?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${l(e.searchError)}</span></div>`:""}
              ${!e.searchLoading&&!e.searchError&&(n||s)&&!e.searchResults.length?'<div class="chat-muted">No messages found.</div>':""}
              ${!e.searchLoading&&!n&&!s?`<div class="chat-muted">Type or choose a filter to search across every conversation you're in.</div>`:""}
              ${e.searchLoading?"":e.searchResults.map(ln).join("")}
            </div>
          </div>
        `}function Ne(){return["admin","manager"].includes(a.currentUser.role)}function un(n){if(!e.composeOpen)return"";const s=e.composeSearch.trim().toLowerCase(),r=n.filter(S=>!s||(S.full_name||"").toLowerCase().includes(s)),u=e.composeSelectedMemberIds.size,g=u===1?[...e.composeSelectedMemberIds][0]:"";return`
          <div class="chat-compose-popover" data-chat-compose-popover role="dialog" aria-label="New conversation">
            <div class="chat-compose-popover-head">
              <strong>New conversation</strong>
              <button type="button" class="chat-icon-btn" data-chat-compose-close aria-label="Close new conversation"><i class="ti ti-x"></i></button>
            </div>
            <input data-chat-compose-search type="search" placeholder="Search people..." value="${l(e.composeSearch)}" autocomplete="off">
            <div class="chat-compose-summary">${u} selected</div>
            <div class="chat-compose-list">
              ${r.map(S=>{const C=e.composeSelectedMemberIds.has(S.id)?" checked":"";return`
                  <label class="chat-compose-person">
                    <input type="checkbox" data-chat-compose-member="${l(S.id)}"${C}>
                    <span class="chat-compose-avatar">${l((S.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${l(S.full_name||"Unknown")}</strong>
                      <span>${l(Q(S.role))}</span>
                    </span>
                  </label>
                `}).join("")}
              ${r.length?"":'<div class="chat-muted">No matching people.</div>'}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${l(g)}"${u===1&&!A(e.actionState,`start-dm:${g}`)?"":" disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              ${M(e.actionState,`start-dm:${g}`)?`<span class="chat-action-error">${l(M(e.actionState,`start-dm:${g}`))}</span>`:""}
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${l(e.composeGroupTitle)}">
                <button type="button" data-chat-create-group${e.composeGroupTitle.trim()&&!A(e.actionState,"create-group")?"":" disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
                ${M(e.actionState,"create-group")?`<span class="chat-action-error">${l(M(e.actionState,"create-group"))}</span>`:""}
              </div>
              ${Ne()?`
                <div class="chat-compose-group">
                  <input data-chat-channel-title type="text" placeholder="Channel name" value="${l(e.composeChannelTitle)}">
                  <button type="button" data-chat-create-channel${e.composeChannelTitle.trim()&&!A(e.actionState,"create-channel")?"":" disabled"}><i class="ti ti-hash"></i><span>Create channel</span></button>
                  ${M(e.actionState,"create-channel")?`<span class="chat-action-error">${l(M(e.actionState,"create-channel"))}</span>`:""}
                </div>
              `:""}
            </div>
          </div>
        `}function hn(){const n=en();return`
          <div class="chat-search-panel chat-channel-directory">
            <div class="chat-compose-popover-head">
              <strong>Browse channels</strong>
              <button type="button" class="chat-icon-btn" data-chat-browse-channels-close aria-label="Close browse channels"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-search-input-row">
              <i class="ti ti-search"></i>
              <input data-chat-browse-channels-search type="search" placeholder="Search channels..." value="${l(e.browseChannelsSearch)}" autocomplete="off">
            </div>
            <div class="chat-search-results">
              ${e.browseChannelsLoading?'<div class="chat-muted">Loading...</div>':""}
              ${e.browseChannelsError?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${l(e.browseChannelsError)}</span></div>`:""}
              ${!e.browseChannelsLoading&&!e.browseChannelsError&&!n.length?`<div class="chat-muted">${e.browseChannelsSearch.trim()?"No channels match your search.":"No channels exist yet."}</div>`:""}
              ${n.map(s=>{const r=s.id===e.selectedConversationId,u=A(e.actionState,`join-channel:${s.id}`),g=M(e.actionState,`join-channel:${s.id}`);return`
                  <div class="chat-channel-directory-row">
                    <div class="chat-channel-directory-info">
                      <span class="chat-search-result-title">#${l(s.title||"Untitled channel")}</span>
                      ${s.topic?`<span class="chat-channel-directory-topic">${l(s.topic)}</span>`:""}
                      <span class="chat-channel-directory-meta">
                        <i class="ti ti-users"></i> ${s.member_count}
                        ${s.creator_name?` &middot; created by ${l(s.creator_name)}`:""}
                      </span>
                    </div>
                    ${r?'<span class="chat-channel-directory-current">Current</span>':s.joined_by_current_user?`<button type="button" class="chat-member-add-toggle" data-chat-open-channel="${l(s.id)}">Open</button>`:`<button type="button" class="chat-member-add-toggle" data-chat-join-channel="${l(s.id)}"${u?" disabled":""}><i class="ti ti-plus"></i><span>Join</span></button>`}
                    ${g?`<span class="chat-action-error">${l(g)}</span>`:""}
                  </div>
                `}).join("")}
            </div>
          </div>
        `}function mn(n){if(e.mentionQuery===null||!n)return"";const s=B(n);if(!s.length)return"";const r=Math.min(e.mentionIndex,s.length-1);return`
          <div class="chat-compose-popover chat-mention-picker" data-chat-mention-picker role="listbox" aria-label="Mention someone">
            ${s.map((u,g)=>`
              <button
                type="button"
                class="chat-compose-person chat-mention-option${g===r?" active":""}"
                data-chat-mention-pick="${l(u.id)}"
                role="option"
                aria-selected="${g===r}"
              >
                <span class="chat-compose-avatar">${l((u.full_name||"?").slice(0,1))}</span>
                <span class="chat-compose-person-copy">
                  <strong>${l(u.full_name||"Unknown")}</strong>
                  <span>${l(Q(u.role))}</span>
                </span>
              </button>
            `).join("")}
          </div>
        `}function pn(n){const s=n.message?.attachments?.length||0;return`
          <button type="button" class="chat-search-result" data-chat-pinned-jump="${l(n.message_id)}">
            <span class="chat-search-result-row">
              <span class="chat-search-result-title">${l(n.message?.sender?.full_name||"Unknown")}</span>
              <span class="chat-search-result-time">${l(Fe(n.pinned_at))}</span>
            </span>
            <span class="chat-search-result-snippet">${l(te(n.message||{}))}</span>
            <span class="chat-channel-directory-meta">
              ${s?`<i class="ti ti-paperclip"></i> ${s} &middot; `:""}pinned by ${l(n.pinner?.full_name||"Unknown")}
            </span>
          </button>
        `}function fn(){return e.pinnedMessagesPanelOpen?`
          <div class="chat-search-panel">
            <div class="chat-compose-popover-head">
              <strong>Pinned messages</strong>
              <button type="button" class="chat-icon-btn" data-chat-pinned-close aria-label="Close pinned messages"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-search-results">
              ${e.pinnedMessagesLoading?'<div class="chat-muted">Loading...</div>':""}
              ${e.pinnedMessagesError?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${l(e.pinnedMessagesError)}</span></div>`:""}
              ${!e.pinnedMessagesLoading&&!e.pinnedMessagesError&&!e.pinnedMessages.length?'<div class="chat-muted">No pinned messages yet.</div>':""}
              ${e.pinnedMessages.map(pn).join("")}
            </div>
          </div>
        `:""}function gn(){if(e.pinnedMessagesPanelOpen||!e.pinnedMessages.length)return"";const n=e.pinnedMessages[0];return`
          <button type="button" class="chat-pinned-strip" data-chat-pinned-jump="${l(n.message_id)}">
            <i class="ti ti-pin"></i>
            <span class="chat-pinned-strip-count">${e.pinnedMessages.length} pinned</span>
            <span class="chat-pinned-strip-snippet">${l(te(n.message||{}))}</span>
          </button>
        `}function vn(n){if(!e.membersOpen||!n||!["group","channel"].includes(n.kind))return"";const s=n.members.filter(_=>!_.left_at),r=Re(n),u=new Set(s.map(_=>_.user_id)),g=e.memberSearch.trim().toLowerCase(),S=e.profiles.filter(_=>_.id!==a.currentUser.id&&!u.has(_.id)&&(!g||(_.full_name||"").toLowerCase().includes(g))),C=e.memberSelectedIds.size;return`
          <div class="chat-compose-popover chat-members-panel" data-chat-members-panel role="dialog" aria-label="Manage members">
            <div class="chat-compose-popover-head">
              <strong>Manage members</strong>
              <button type="button" class="chat-icon-btn" data-chat-members-close aria-label="Close member management"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-member-panel-list">
              ${s.map(_=>{const D=_.profile||{},k=_.user_id===a.currentUser.id,H=r||k;return`
                  <div class="chat-member-row" data-chat-member-row="${l(_.user_id)}">
                    <span class="chat-compose-avatar">${l((D.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${l(D.full_name||_.user_id)}</strong>
                      <span>${l(D.role?Q(D.role):"Member")}</span>
                    </span>
                    ${_.membership_role==="owner"?'<span class="chat-owner-badge">Owner</span>':""}
                    ${r?`
                      <button type="button" class="chat-member-promote" data-chat-promote-member="${l(_.user_id)}" data-chat-role="${_.membership_role==="owner"?"member":"owner"}"${A(e.actionState,`set-role:${n.id}:${_.user_id}`)?" disabled":""}>
                        <i class="ti ${_.membership_role==="owner"?"ti-user-minus":"ti-shield-plus"}"></i><span>${_.membership_role==="owner"?"Remove owner":"Make owner"}</span>
                      </button>
                    `:""}
                    ${H?`
                      <button type="button" class="chat-member-remove" data-chat-remove-member="${l(_.user_id)}"${A(e.actionState,`remove-member:${n.id}:${_.user_id}`)?" disabled":""}>
                        <i class="ti ${k?"ti-logout":"ti-user-minus"}"></i><span>${k?"Leave":"Remove"}</span>
                      </button>
                    `:""}
                    ${M(e.actionState,`set-role:${n.id}:${_.user_id}`)||M(e.actionState,`remove-member:${n.id}:${_.user_id}`)?`
                      <span class="chat-action-error">${l(M(e.actionState,`set-role:${n.id}:${_.user_id}`)||M(e.actionState,`remove-member:${n.id}:${_.user_id}`))}</span>
                    `:""}
                  </div>
                `}).join("")}
            </div>
            ${r?`
              <div class="chat-member-add">
                <button type="button" class="chat-member-add-toggle" data-chat-member-add-toggle>
                  <i class="ti ti-user-plus"></i><span>Add member</span>
                </button>
                ${e.memberAddOpen?`
                  <input data-chat-member-search type="search" placeholder="Search people..." value="${l(e.memberSearch)}" autocomplete="off">
                  <div class="chat-compose-summary">${C} selected</div>
                  <div class="chat-compose-list">
                    ${S.map(_=>{const D=e.memberSelectedIds.has(_.id)?" checked":"";return`
                        <label class="chat-compose-person">
                          <input type="checkbox" data-chat-member-pick="${l(_.id)}"${D}>
                          <span class="chat-compose-avatar">${l((_.full_name||"?").slice(0,1))}</span>
                          <span class="chat-compose-person-copy">
                            <strong>${l(_.full_name||"Unknown")}</strong>
                            <span>${l(Q(_.role))}</span>
                          </span>
                        </label>
                      `}).join("")}
                    ${S.length?"":'<div class="chat-muted">No matching people.</div>'}
                  </div>
                  <div class="chat-compose-actions">
                    <button type="button" data-chat-add-members="${l(n.id)}"${C&&!A(e.actionState,`add-members:${n.id}`)?"":" disabled"}><i class="ti ti-users-plus"></i><span>Add selected</span></button>
                    ${M(e.actionState,`add-members:${n.id}`)?`<span class="chat-action-error">${l(M(e.actionState,`add-members:${n.id}`))}</span>`:""}
                  </div>
                `:""}
              </div>
            `:""}
          </div>
        `}function te(n){const s=n.deleted_at?"Message deleted":n.body||"";return s.length>90?`${s.slice(0,87)}...`:s}function _n(n){if(!n?.reply_to_id)return"";const s=e.messages.find(r=>r.id===n.reply_to_id);return s?`
          <div class="chat-quote">
            <strong>${l(s.sender?.full_name||"Unknown")}</strong>
            <span>${l(te(s))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function bn(){const n=e.messages.find(s=>s.id===e.replyToMessageId);return n?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${l(n.sender?.full_name||"Unknown")}</strong>
              <span>${l(te(n))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function yn(){return e.pendingAttachments.length?`
          <div class="chat-pending-attachments">
            ${e.pendingAttachments.map(n=>`
              <div class="chat-pending-attachment${n.status==="error"?" error":""}" data-chat-pending-attachment="${l(n.id)}">
                <i class="ti ${n.status==="error"?"ti-alert-triangle":Ue(n.mime)?"ti-photo":je(n.mime)}"></i>
                <span class="chat-pending-attachment-name">${l(n.name)}</span>
                ${n.status==="uploading"?'<span class="chat-pending-attachment-status">Uploading…</span>':""}
                ${n.status==="error"?`<span class="chat-pending-attachment-status">${l(n.error||"Failed")}</span>`:""}
                <button type="button" data-chat-remove-pending="${l(n.id)}" aria-label="Remove attachment"><i class="ti ti-x"></i></button>
              </div>
            `).join("")}
          </div>
        `:""}function wn(n){const s=c.get(n.path),r=s&&s.expiresAt>Date.now()?s.url:null;return Ue(n.mime)?r?`<a class="chat-attachment-image-link" href="${l(r)}" target="_blank" rel="noopener">
                 <img class="chat-attachment-image" src="${l(r)}" alt="${l(n.name)}">
               </a>`:'<div class="chat-attachment-image chat-attachment-image-loading"><i class="ti ti-photo"></i></div>':`
          <a class="chat-attachment-file" href="${r?l(r):"#"}" target="_blank" rel="noopener" data-chat-attachment-path="${l(n.path)}">
            <i class="ti ${je(n.mime)}"></i>
            <span class="chat-attachment-file-copy">
              <strong>${l(n.name)}</strong>
              <span>${l(da(n.size))}</span>
            </span>
            <i class="ti ti-download"></i>
          </a>
        `}function $n(n){return n.attachments?.length?`<div class="chat-message-attachments">${n.attachments.map(wn).join("")}</div>`:""}async function Sn(){const n=new Set;for(const r of e.messages)for(const u of r.attachments||[])n.add(u.path);let s=!1;for(const r of n){const u=c.get(r);if(!(u&&u.expiresAt>Date.now()||d.has(r))){d.add(r);try{const g=await a.service.getSignedAttachmentUrl(r);c.set(r,{url:g,expiresAt:Date.now()+3300*1e3}),s=!0}catch(g){console.error("Failed to sign chat attachment URL",g)}finally{d.delete(r)}}}s&&!o&&m()}function Cn(n){const s=`edit-channel-details:${n.id}`,r=A(e.actionState,s),u=M(e.actionState,s);return`
          <form class="chat-channel-details-form" data-chat-channel-details-form>
            <input data-chat-channel-details-title type="text" value="${l(e.channelDetailsTitleDraft)}" placeholder="Channel name" maxlength="160"${r?" disabled":""}>
            <input data-chat-channel-details-topic type="text" value="${l(e.channelDetailsTopicDraft)}" placeholder="Topic (optional, shown under the name)" maxlength="160"${r?" disabled":""}>
            <textarea data-chat-channel-details-description placeholder="Description (optional)" maxlength="1000" rows="2"${r?" disabled":""}>${l(e.channelDetailsDescriptionDraft)}</textarea>
            <div class="chat-channel-details-actions">
              <button type="submit" aria-label="Save channel details"${r?" disabled":""}><i class="ti ti-check"></i><span>Save</span></button>
              <button type="button" data-chat-channel-details-cancel aria-label="Cancel"><i class="ti ti-x"></i></button>
            </div>
            ${u?`<span class="chat-action-error">${l(u)}</span>`:""}
          </form>
        `}function kn(n){const s=A(e.actionState,`edit-message:${n.id}`),r=M(e.actionState,`edit-message:${n.id}`);return`
          <form class="chat-edit-form" data-chat-edit-form="${l(n.id)}">
            <input data-chat-edit-input="${l(n.id)}" type="text" value="${l(e.editDraft)}"${s?" disabled":""}>
            <button type="submit" aria-label="Save edit"${s?" disabled":""}><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
            ${r?`<span class="chat-action-error">${l(r)}</span>`:""}
          </form>
        `}function En(n){const s=l(n.body),r=e.conversations.find(_=>_.id===n.conversation_id)||e.conversations.find(_=>_.id===e.selectedConversationId)||null,u=w(r),g=ia(n.body,u);if(!g.length)return s;const S=new Set(u.filter(_=>_.id===a.currentUser.id).map(_=>String(_.full_name)));let C=s;for(const _ of g){const D=`@${l(_)}`,k=S.has(_)?"chat-mention chat-mention-self":"chat-mention";C=C.split(D).join(`<span class="${k}">${D}</span>`)}return C}function Mn(n,s=!0){const r=n.sender_id===a.currentUser.id?" mine":"",u=!!n.deleted_at,g=r&&!u,S=!u&&(r||Ne()),C=Ie(n.id),_=A(e.actionState,`pin-message:${n.id}`)||A(e.actionState,`unpin-message:${n.id}`),D=M(e.actionState,`pin-message:${n.id}`)||M(e.actionState,`unpin-message:${n.id}`),k=n.edited_at&&!u?'<span class="chat-edited">(edited)</span>':"",H=u?"":`
            <button type="button" data-chat-reply="${l(n.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            <button type="button" class="chat-message-pin-btn${C?" pinned":""}" data-chat-toggle-pin="${l(n.id)}" aria-label="${C?"Unpin message":"Pin message"}" title="${C?"Unpin message":"Pin message"}"${_?" disabled":""}><i class="ti ${C?"ti-pinned":"ti-pin"}"></i></button>
            ${g?`<button type="button" data-chat-edit="${l(n.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
            ${S?`<button type="button" data-chat-delete="${l(n.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>`:""}
        `,ne=u?"":`
          <div class="chat-message-actions" aria-label="Message actions">
            ${H}
          </div>
          <button type="button" class="chat-message-menu-btn" data-chat-message-menu="${l(n.id)}" aria-label="Message actions"><i class="ti ti-dots"></i></button>
          ${e.openMessageMenuId===n.id?`
            <div class="chat-message-menu" data-chat-message-menu-panel="${l(n.id)}">
              ${H}
            </div>
          `:""}
          ${e.confirmingDeleteMessageId===n.id?`
            <div class="chat-delete-confirm">
              <span>Delete message?</span>
              <button type="button" data-chat-confirm-delete="${l(n.id)}"${A(e.actionState,`delete-message:${n.id}`)?" disabled":""}>Confirm</button>
              <button type="button" data-chat-cancel-delete="${l(n.id)}">Cancel</button>
              ${M(e.actionState,`delete-message:${n.id}`)?`<span class="chat-action-error">${l(M(e.actionState,`delete-message:${n.id}`))}</span>`:""}
            </div>
          `:""}
          ${e.unpinConfirmMessageId===n.id?`
            <div class="chat-delete-confirm">
              <span>Unpin this message? ${l(Le(n.id)?.pinner?.full_name||"Someone else")} pinned it.</span>
              <button type="button" data-chat-confirm-unpin="${l(n.id)}"${_?" disabled":""}>Confirm</button>
              <button type="button" data-chat-cancel-unpin="${l(n.id)}">Cancel</button>
            </div>
          `:""}
          ${D?`<span class="chat-action-error">${l(D)}</span>`:""}
        `;return`
          <div class="chat-message${r}${u?" deleted":""}${s?"":" chat-message-grouped"}" tabindex="0" data-chat-message-id="${l(n.id)}">
            ${s?`
              <div class="chat-message-meta">
                <span>${l(n.sender?.full_name||"Unknown")}</span>
                <span>#${n.message_seq} ${k}</span>
              </div>
            `:""}
            ${_n(n)}
            ${e.editingMessageId===n.id?kn(n):`
              ${n.body.trim()?`<div class="chat-message-body">${u?l("Message deleted"):En(n)}</div>`:""}
              ${u?"":$n(n)}
            `}
            ${ne}
          </div>
        `}function m(){const n=v||O();v=!1;const s=e.conversations.find(i=>i.id===e.selectedConversationId)||null,r=e.profiles.filter(i=>i.id!==a.currentUser.id),g=s?.members.find(i=>i.user_id===a.currentUser.id)?.notification_level==="muted",S=s?.members.filter(i=>!i.left_at)||[],C=s?Re(s):!1,_=s?kt(s):!1;t.innerHTML=`
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <div class="chat-sidebar-tools">
                  <span class="chat-user-pill">${l(Q(a.currentUser.role))}</span>
                  <button type="button" class="chat-icon-btn${e.browseChannelsOpen?" active":""}" data-chat-browse-channels-toggle aria-label="Browse channels" title="Browse channels"><i class="ti ti-hash"></i></button>
                  <button type="button" class="chat-icon-btn" data-chat-compose-toggle aria-label="New conversation" title="New conversation"><i class="ti ti-pencil-plus"></i></button>
                </div>
              </div>
              ${e.searchOpen?dn():e.browseChannelsOpen?hn():`
                ${un(r)}
                <div class="chat-conversation-list">
                  ${e.loading?'<div class="chat-muted">Loading...</div>':""}
                  ${Yn(e.conversations).map(on).join("")}
                  ${!e.loading&&!e.conversations.length?'<div class="chat-muted">No conversations yet.</div>':""}
                </div>
              `}
            </aside>
            <main class="chat-thread">
              ${e.error?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${l(e.error)}</span></div>`:""}
              ${s?`
                <header class="chat-thread-head">
                  <button type="button" class="chat-back-btn" data-chat-back aria-label="Back to conversations"><i class="ti ti-arrow-left"></i></button>
                  <div>
                    <div class="chat-eyebrow">${s.kind==="dm"?"Direct message":s.kind==="channel"?"Channel":"Group"}</div>
                    ${s.kind==="channel"&&e.channelDetailsOpen?Cn(s):s.kind!=="channel"&&e.renameOpen?`
                      <form class="chat-rename-form" data-chat-rename-form>
                        <input data-chat-rename-input type="text" value="${l(e.renameDraft)}" placeholder="Group name"${A(e.actionState,`rename:${s.id}`)?" disabled":""}>
                        <button type="submit" aria-label="Save name"${A(e.actionState,`rename:${s.id}`)?" disabled":""}><i class="ti ti-check"></i></button>
                        <button type="button" data-chat-rename-cancel aria-label="Cancel rename"><i class="ti ti-x"></i></button>
                        ${M(e.actionState,`rename:${s.id}`)?`<span class="chat-action-error">${l(M(e.actionState,`rename:${s.id}`))}</span>`:""}
                      </form>
                    `:`
                      <h2>${l(ve(s,a.currentUser.id))}</h2>
                      ${s.kind==="channel"&&s.topic?`<p class="chat-channel-topic">${l(s.topic)}</p>`:""}
                    `}
                  </div>
                  <div class="chat-thread-tools">
                    ${["group","channel"].includes(s.kind)?`
                      <button type="button" class="chat-icon-btn chat-member-count${e.membersOpen?" active":""}" data-chat-members-toggle aria-label="Manage members" title="Manage members">
                        <i class="ti ti-users"></i><span>${S.length}</span>
                      </button>
                    `:""}
                    <button type="button" class="chat-icon-btn${e.pinnedMessagesPanelOpen?" active":""}${e.pinnedMessages.length?" chat-member-count":""}" data-chat-pinned-toggle aria-label="Pinned messages" title="Pinned messages">
                      <i class="ti ti-pin"></i>${e.pinnedMessages.length?`<span>${e.pinnedMessages.length}</span>`:""}
                    </button>
                    <button type="button" class="chat-icon-btn${e.searchOpen?" active":""}" data-chat-search-toggle aria-label="Search messages" title="Search messages">
                      <i class="ti ti-search"></i>
                    </button>
                    <button type="button" class="chat-icon-btn${g?" active":""}" data-chat-toggle-mute aria-label="${g?"Unmute conversation":"Mute conversation"}" title="${g?"Unmute conversation":"Mute conversation"}"${A(e.actionState,`toggle-mute:${s.id}`)?" disabled":""}>
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
                  ${vn(s)}
                  ${fn()}
                  ${e.archiveConfirmOpen?`
                    <div class="chat-delete-confirm chat-archive-confirm">
                      <span>Archive this ${s.kind==="channel"?"channel":s.kind==="group"?"group":"conversation"}?</span>
                      <button type="button" data-chat-confirm-archive${A(e.actionState,`archive:${s.id}`)?" disabled":""}>Confirm</button>
                      <button type="button" data-chat-cancel-archive>Cancel</button>
                      ${M(e.actionState,`archive:${s.id}`)?`<span class="chat-action-error">${l(M(e.actionState,`archive:${s.id}`))}</span>`:""}
                    </div>
                  `:""}
                  ${e.leaveChannelConfirmOpen?`
                    <div class="chat-delete-confirm chat-archive-confirm">
                      <span>Leave #${l(s.title||"this channel")}? You can rejoin any time from Browse Channels.</span>
                      <button type="button" data-chat-confirm-leave-channel${A(e.actionState,`leave-channel:${s.id}`)?" disabled":""}>Confirm</button>
                      <button type="button" data-chat-cancel-leave-channel>Cancel</button>
                      ${M(e.actionState,`leave-channel:${s.id}`)?`<span class="chat-action-error">${l(M(e.actionState,`leave-channel:${s.id}`))}</span>`:""}
                    </div>
                  `:""}
                </header>
                ${gn()}
                <div class="chat-message-list">
                  ${e.messages.map((i,p)=>Mn(i,ha(i,e.messages[p-1]))).join("")}
                  ${e.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                ${M(e.actionState,`send-message:${s.id}`)?`<div class="chat-action-error chat-send-error"><i class="ti ti-alert-triangle"></i><span>${l(M(e.actionState,`send-message:${s.id}`))}</span></div>`:""}
                <form class="chat-composer" data-chat-send-form>
                  ${bn()}
                  ${yn()}
                  ${mn(s)}
                  <input type="file" data-chat-file-input multiple accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" hidden>
                  <button type="button" class="chat-attach-btn" data-chat-attach-toggle aria-label="Attach a file" title="Attach a file">
                    <i class="ti ti-paperclip"></i>
                  </button>
                  <textarea data-chat-composer rows="1" placeholder="Write a message..."></textarea>
                  <button type="submit"${A(e.actionState,`send-message:${s.id}`)?" disabled":""}><i class="ti ti-send"></i><span>Send</span></button>
                </form>
              `:`
                <header class="chat-thread-head chat-thread-head-empty">
                  <div></div>
                  <div class="chat-thread-tools">
                    <button type="button" class="chat-icon-btn${e.searchOpen?" active":""}" data-chat-search-toggle aria-label="Search messages" title="Search messages">
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
        `,t.querySelectorAll("[data-chat-select]").forEach(i=>{i.addEventListener("click",()=>x(i.dataset.chatSelect))}),t.querySelectorAll("[data-chat-sidebar-section-toggle]").forEach(i=>{i.addEventListener("click",()=>cn(i.dataset.chatSidebarSectionToggle))}),t.querySelector("[data-chat-back]")?.addEventListener("click",()=>me()),t.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{s&&f(`toggle-mute:${s.id}`,()=>Rt(s))}),t.querySelector("[data-chat-members-toggle]")?.addEventListener("click",()=>{s&&(e.membersOpen?Z():Et())}),t.querySelector("[data-chat-members-close]")?.addEventListener("click",()=>Z({reset:!0})),t.querySelector("[data-chat-rename-toggle]")?.addEventListener("click",()=>{s&&(s.kind==="channel"?xt(s):Pt(s))}),t.querySelector("[data-chat-rename-cancel]")?.addEventListener("click",()=>Nt()),t.querySelector("[data-chat-rename-form]")?.addEventListener("submit",i=>{i.preventDefault(),s&&f(`rename:${s.id}`,()=>Ut(s,e.renameDraft))}),t.querySelector("[data-chat-channel-details-title]")?.addEventListener("input",i=>{e.channelDetailsTitleDraft=i.currentTarget.value}),t.querySelector("[data-chat-channel-details-topic]")?.addEventListener("input",i=>{e.channelDetailsTopicDraft=i.currentTarget.value}),t.querySelector("[data-chat-channel-details-description]")?.addEventListener("input",i=>{e.channelDetailsDescriptionDraft=i.currentTarget.value}),t.querySelector("[data-chat-channel-details-cancel]")?.addEventListener("click",()=>Ht()),t.querySelector("[data-chat-channel-details-form]")?.addEventListener("submit",i=>{i.preventDefault(),s&&f(`edit-channel-details:${s.id}`,()=>Wt(s))}),t.querySelector("[data-chat-leave-channel-toggle]")?.addEventListener("click",()=>zt()),t.querySelector("[data-chat-confirm-leave-channel]")?.addEventListener("click",()=>{s&&f(`leave-channel:${s.id}`,()=>Vt(s))}),t.querySelector("[data-chat-cancel-leave-channel]")?.addEventListener("click",()=>Gt()),t.querySelector("[data-chat-rename-input]")?.addEventListener("input",i=>{e.renameDraft=i.currentTarget.value}),t.querySelector("[data-chat-archive-toggle]")?.addEventListener("click",()=>jt()),t.querySelector("[data-chat-confirm-archive]")?.addEventListener("click",()=>{s&&f(`archive:${s.id}`,()=>Bt(s,!0))}),t.querySelector("[data-chat-cancel-archive]")?.addEventListener("click",()=>Ft()),t.querySelector("[data-chat-member-add-toggle]")?.addEventListener("click",()=>Mt()),t.querySelector("[data-chat-member-search]")?.addEventListener("input",i=>{e.memberSearch=i.currentTarget.value,m();const p=t.querySelector("[data-chat-member-search]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),t.querySelectorAll("[data-chat-member-pick]").forEach(i=>{i.addEventListener("change",()=>Tt(i.dataset.chatMemberPick,i.checked))}),t.querySelector("[data-chat-add-members]")?.addEventListener("click",i=>{const p=i.currentTarget.dataset.chatAddMembers;f(`add-members:${p}`,()=>It(p))}),t.querySelectorAll("[data-chat-remove-member]").forEach(i=>{i.addEventListener("click",()=>{if(!s)return;const p=i.dataset.chatRemoveMember;f(`remove-member:${s.id}:${p}`,()=>Lt(s.id,p))})}),t.querySelectorAll("[data-chat-promote-member]").forEach(i=>{i.addEventListener("click",()=>{if(!s)return;const p=i.dataset.chatPromoteMember,L=i.dataset.chatRole;f(`set-role:${s.id}:${p}`,()=>Qt(s.id,p,L))})}),t.querySelector("[data-chat-pinned-toggle]")?.addEventListener("click",()=>qe()),t.querySelector("[data-chat-pinned-close]")?.addEventListener("click",()=>qe()),t.querySelectorAll("[data-chat-pinned-jump]").forEach(i=>{i.addEventListener("click",()=>pt(i.dataset.chatPinnedJump))}),t.querySelector("[data-chat-search-toggle]")?.addEventListener("click",()=>{e.searchOpen?fe():yt()}),t.querySelector("[data-chat-search-close]")?.addEventListener("click",()=>fe()),t.querySelector("[data-chat-search-input]")?.addEventListener("input",i=>{$t(i.currentTarget.value),m();const p=t.querySelector("[data-chat-search-input]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),t.querySelectorAll("[data-chat-search-result]").forEach(i=>{i.addEventListener("click",()=>{St(i.dataset.chatSearchResult,i.dataset.chatSearchMessage)})}),t.querySelector("[data-chat-search-scope]")?.addEventListener("change",i=>{e.searchScope=i.currentTarget.value,V()}),t.querySelector("[data-chat-search-sender]")?.addEventListener("change",i=>{e.searchSenderId=i.currentTarget.value,V()}),t.querySelector("[data-chat-search-from]")?.addEventListener("change",i=>{e.searchFrom=i.currentTarget.value,V()}),t.querySelector("[data-chat-search-to]")?.addEventListener("change",i=>{e.searchTo=i.currentTarget.value,V()}),t.querySelector("[data-chat-search-attachments-only]")?.addEventListener("change",i=>{e.searchAttachmentsOnly=i.currentTarget.checked,V()}),t.querySelector("[data-chat-browse-channels-toggle]")?.addEventListener("click",()=>{e.browseChannelsOpen?ee():Zt()}),t.querySelector("[data-chat-browse-channels-close]")?.addEventListener("click",()=>ee()),t.querySelector("[data-chat-browse-channels-search]")?.addEventListener("input",i=>{e.browseChannelsSearch=i.currentTarget.value,m();const p=t.querySelector("[data-chat-browse-channels-search]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),t.querySelectorAll("[data-chat-join-channel]").forEach(i=>{i.addEventListener("click",()=>{const p=i.dataset.chatJoinChannel;f(`join-channel:${p}`,()=>tn(p))})}),t.querySelectorAll("[data-chat-open-channel]").forEach(i=>{i.addEventListener("click",()=>nn(i.dataset.chatOpenChannel))}),t.querySelector("[data-chat-channel-title]")?.addEventListener("input",i=>{e.composeChannelTitle=i.currentTarget.value,m();const p=t.querySelector("[data-chat-channel-title]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),t.querySelector("[data-chat-create-channel]")?.addEventListener("click",()=>{f("create-channel",()=>Jt(e.composeChannelTitle))}),t.querySelector("[data-chat-compose-toggle]")?.addEventListener("click",()=>{e.composeOpen?X():bt()}),t.querySelector("[data-chat-compose-close]")?.addEventListener("click",()=>X()),t.querySelector("[data-chat-compose-search]")?.addEventListener("input",i=>{e.composeSearch=i.currentTarget.value,m();const p=t.querySelector("[data-chat-compose-search]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),t.querySelectorAll("[data-chat-compose-member]").forEach(i=>{i.addEventListener("change",()=>Ct(i.dataset.chatComposeMember,i.checked))}),t.querySelector("[data-chat-group-title]")?.addEventListener("input",i=>{e.composeGroupTitle=i.currentTarget.value,m();const p=t.querySelector("[data-chat-group-title]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),t.querySelector("[data-chat-start-dm]")?.addEventListener("click",i=>{const p=i.currentTarget.dataset.chatStartDm;f(`start-dm:${p}`,()=>Yt(p))}),t.querySelector("[data-chat-create-group]")?.addEventListener("click",()=>{f("create-group",()=>Kt(e.composeGroupTitle,[...e.composeSelectedMemberIds]))});const D=t.querySelector("[data-chat-send-form]");D?.addEventListener("submit",i=>{i.preventDefault();const p=e.selectedConversationId,L=i.currentTarget;f(`send-message:${p}`,()=>gt(L))});const k=t.querySelector("[data-chat-composer]");k?.addEventListener("input",()=>{if(I(k),!he(k))return;const{value:i,selectionStart:p}=k;m();const L=t.querySelector("[data-chat-composer]");L&&(L.value=i,I(L),L.focus(),L.setSelectionRange?.(p,p))}),k?.addEventListener("keydown",i=>{if(e.mentionQuery!==null&&s){const p=B(s);if(p.length){if(i.key==="ArrowDown"){i.preventDefault(),Ee(s,1);return}if(i.key==="ArrowUp"){i.preventDefault(),Ee(s,-1);return}if(i.key==="Enter"||i.key==="Tab"){i.preventDefault(),ke(s,p[Math.min(e.mentionIndex,p.length-1)]);return}}if(i.key==="Escape"){i.preventDefault(),G();return}}i.key==="Enter"&&!i.shiftKey&&(i.preventDefault(),D?.requestSubmit())}),t.querySelectorAll("[data-chat-mention-pick]").forEach(i=>{i.addEventListener("mousedown",p=>{p.preventDefault();const L=w(s).find(ge=>ge.id===i.dataset.chatMentionPick);L&&ke(s,L)})}),t.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>_t()),t.querySelectorAll("[data-chat-reply]").forEach(i=>{i.addEventListener("click",()=>vt(i.dataset.chatReply))}),t.querySelectorAll("[data-chat-toggle-pin]").forEach(i=>{i.addEventListener("click",()=>{const p=i.dataset.chatTogglePin,L=e.selectedConversationId;L&&(Ie(p)?ht(L,p):f(`pin-message:${p}`,()=>ut(L,p)))})}),t.querySelectorAll("[data-chat-confirm-unpin]").forEach(i=>{i.addEventListener("click",()=>{const p=i.dataset.chatConfirmUnpin,L=e.selectedConversationId;L&&f(`unpin-message:${p}`,()=>De(L,p))})}),t.querySelectorAll("[data-chat-cancel-unpin]").forEach(i=>{i.addEventListener("click",()=>mt())}),t.querySelectorAll("[data-chat-edit]").forEach(i=>{i.addEventListener("click",()=>Dt(i.dataset.chatEdit))}),t.querySelectorAll("[data-chat-delete]").forEach(i=>{i.addEventListener("click",()=>{e.confirmingDeleteMessageId=i.dataset.chatDelete,e.openMessageMenuId=null,m()})}),t.querySelectorAll("[data-chat-message-menu]").forEach(i=>{i.addEventListener("click",()=>{e.openMessageMenuId=e.openMessageMenuId===i.dataset.chatMessageMenu?null:i.dataset.chatMessageMenu,e.confirmingDeleteMessageId=null,m()})}),t.querySelectorAll("[data-chat-confirm-delete]").forEach(i=>{i.addEventListener("click",()=>{const p=i.dataset.chatConfirmDelete;f(`delete-message:${p}`,()=>Ot(p))})}),t.querySelectorAll("[data-chat-cancel-delete]").forEach(i=>{i.addEventListener("click",()=>{e.confirmingDeleteMessageId===i.dataset.chatCancelDelete&&(e.confirmingDeleteMessageId=null),m()})}),t.querySelectorAll("[data-chat-edit-form]").forEach(i=>{i.addEventListener("submit",p=>{p.preventDefault();const L=p.currentTarget,ge=L.dataset.chatEditForm;f(`edit-message:${ge}`,()=>At(L))})}),t.querySelectorAll("[data-chat-cancel-edit]").forEach(i=>{i.addEventListener("click",()=>qt())});const H=t.querySelector("[data-chat-file-input]");t.querySelector("[data-chat-attach-toggle]")?.addEventListener("click",()=>H?.click()),H?.addEventListener("change",i=>{pe(i.currentTarget.files),i.currentTarget.value=""}),t.querySelectorAll("[data-chat-remove-pending]").forEach(i=>{i.addEventListener("click",()=>ft(i.dataset.chatRemovePending))});const ne=t.querySelector("[data-chat-send-form]");ne?.addEventListener("dragover",i=>i.preventDefault()),ne?.addEventListener("drop",i=>{i.preventDefault(),i.dataTransfer?.files?.length&&pe(i.dataTransfer.files)}),k?.addEventListener("paste",i=>{const p=[...i.clipboardData?.files||[]];p.length&&pe(p)}),n&&b(),Sn()}return R(),E=setInterval(()=>R(),3e4),typeof a.service.subscribeToConversationEvents=="function"&&(y=a.service.subscribeToConversationEvents(()=>an())),()=>{o=!0,E&&clearInterval(E),$&&clearTimeout($),y&&y(),t.removeEventListener?.("click",Me),typeof document<"u"&&(document.removeEventListener("keydown",Te),document.body?.classList.remove("wein-chat-root")),t.classList.remove("wein-chat-root"),t.classList.remove("chat-has-selection"),t.innerHTML=""}}}}const Be="chat-attachments",xe=5;function st(t){return String(t||"file").replace(/[^a-zA-Z0-9._-]+/g,"_")}function pa(t,a){const e=`${Date.now().toString(36)}-${Math.random().toString(16).slice(2,8)}`;return`${t}/${e}-${st(a)}`}function fa(t){return String(t).replace(/[\\%_]/g,a=>`\\${a}`)}function F(t,a){if(t.error)throw new Error(`${a}: ${t.error.message||t.error}`);return t.data||[]}function N(t,a){if(t.error)throw new Error(`${a}: ${t.error.message||t.error}`);return t.data}function ue(t){return t?{id:t.id,full_name:t.full_name,role:t.role,email:t.email??null}:null}function ga(t){return{conversation_id:t.conversation_id,user_id:t.user_id,membership_role:t.membership_role,joined_at:t.joined_at,left_at:t.left_at,last_read_seq:Number(t.last_read_seq||0),notification_level:t.notification_level,profile:ue(t.profile||t.profiles)}}function W(t){return{id:t.id,conversation_id:t.conversation_id,message_seq:Number(t.message_seq||0),sender_id:t.sender_id,body:t.body,reply_to_id:t.reply_to_id,client_nonce:t.client_nonce,created_at:t.created_at,edited_at:t.edited_at,deleted_at:t.deleted_at,mentioned_user_ids:t.mentioned_user_ids||[],attachments:t.attachments||[],sender:ue(t.sender||t.profiles)}}function va(t){return{id:t.id,conversation_id:t.conversation_id,message_id:t.message_id,pinned_by:t.pinned_by,pinned_at:t.pinned_at,pinner:ue(t.pinner),message:W(t.message)}}function He(t,a){const e=(t.members||t.wein_chat_members||[]).map(ga),c=t.last_message||t.wein_chat_messages||[],d=Array.isArray(c)?c.find(f=>f.deleted_at==null):null,o=d?W(d):null,h={id:t.id,kind:t.kind,title:t.title,created_by:t.created_by,created_at:t.created_at,archived_at:t.archived_at,members:e,last_message:o,unread_count:0};return h.unread_count=Gn(h,a),h}function rt({supabase:t,currentUserId:a}){if(!t)throw new Error("supabase client is required");if(!a)throw new Error("currentUserId is required");async function e(c){const d=await t.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",c).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(xe,{referencedTable:"wein_chat_messages"}).single();if(d.error)throw new Error(`fetch conversation: ${d.error.message||d.error}`);return He(d.data,a)}return{async listProfiles(){const c=await t.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return F(c,"list profiles").map(ue)},async listConversations(){const c=await t.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(xe,{referencedTable:"wein_chat_messages"});return F(c,"list conversations").map(d=>He(d,a))},async listMessages(c){const d=await t.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",c).is("deleted_at",null).order("message_seq",{ascending:!0});return F(d,"list messages").map(W)},async searchMessages(c={}){const{query:d="",conversationId:o=null,senderId:h=null,from:f=null,to:E=null,hasAttachments:y=null}=typeof c=="string"?{query:c}:c,v=(d||"").trim();if(!v&&!o&&!h&&!f&&!E&&y==null)return[];const $=await t.rpc("wein_chat_search_messages",{p_query:v?fa(v):null,p_conversation_id:o,p_sender_id:h,p_from:f,p_to:E,p_has_attachments:y}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `);return F($,"search messages").map(W)},async createGroup(c,d=[]){const o=N(await t.rpc("wein_chat_create_group",{p_title:c}),"create group");for(const h of d)await this.addMember(o,h);return o},async createChannel(c){return N(await t.rpc("wein_chat_create_channel",{p_title:c}),"create channel")},async joinChannel(c){N(await t.rpc("wein_chat_join_channel",{p_conversation_id:c}),"join channel")},async listChannels(){const c=await t.from("wein_chat_conversations").select("id, kind, title, topic, description, created_by, creator_name, created_at, archived_at, member_count, joined_by_current_user").eq("kind","channel").is("archived_at",null).order("title",{ascending:!0});return F(c,"list channels").map(Kn)},async updateChannelDetails(c,{title:d,topic:o,description:h}){N(await t.rpc("wein_chat_update_channel_details",{p_conversation_id:c,p_title:d,p_topic:o??null,p_description:h??null}),"update channel details")},async leaveChannel(c){N(await t.rpc("wein_chat_remove_member",{p_conversation_id:c,p_user_id:a}),"leave channel")},async getOrCreateDm(c){return N(await t.rpc("wein_chat_get_or_create_dm",{p_other_user_id:c}),"get or create DM")},async addMember(c,d){N(await t.rpc("wein_chat_add_member",{p_conversation_id:c,p_user_id:d}),"add member")},async removeMember(c,d){N(await t.rpc("wein_chat_remove_member",{p_conversation_id:c,p_user_id:d}),"remove member")},async renameConversation(c,d){const o=(d||"").trim();if(!o)throw new Error("Group title is required");const h=await t.from("wein_chat_conversations").update({title:o}).eq("id",c).select("id, title");if(!F(h,"rename conversation").length)throw new Error("rename conversation affected zero rows")},async setConversationArchived(c,d){const o=await t.from("wein_chat_conversations").update({archived_at:d?new Date().toISOString():null}).eq("id",c).select("id, archived_at");if(!F(o,"set conversation archived").length)throw new Error("set conversation archived affected zero rows")},async setMembershipRole(c,d,o){N(await t.rpc("wein_chat_set_membership_role",{p_conversation_id:c,p_user_id:d,p_role:o}),"set membership role")},async uploadAttachment(c,d){const o=pa(c,d.name),h=await t.storage.from(Be).upload(o,d,{contentType:d.type||"application/octet-stream",upsert:!1});if(h.error)throw new Error(`upload attachment: ${h.error.message||h.error}`);return{path:o,name:d.name||st(d.name),mime:d.type||"application/octet-stream",size:d.size||0}},async getSignedAttachmentUrl(c,d=3600){const o=await t.storage.from(Be).createSignedUrl(c,d);if(o.error)throw new Error(`sign attachment url: ${o.error.message||o.error}`);const h=o.data?.signedUrl;if(!h)throw new Error("sign attachment url: no signed URL returned");return h},async sendMessage({conversationId:c,body:d,clientNonce:o,replyToId:h=null,mentionedUserIds:f=[],attachments:E=[]}){const y=await t.from("wein_chat_messages").insert({conversation_id:c,sender_id:a,body:d,client_nonce:o,reply_to_id:h,mentioned_user_ids:f.length?f:null,attachments:E}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(y.error)throw new Error(`send message: ${y.error.message||y.error}`);return W(y.data)},async updateMessage(c,d,o=[]){const h=await t.from("wein_chat_messages").update({body:d,edited_at:new Date().toISOString(),mentioned_user_ids:o.length?o:null}).eq("id",c).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(h.error)throw new Error(`update message: ${h.error.message||h.error}`);return W(h.data)},async deleteMessage(c){const d=await t.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",c).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(d.error)throw new Error(`delete message: ${d.error.message||d.error}`);return W(d.data)},async listPinnedMessages(c){const d=await t.from("wein_chat_pinned_messages").select(`
          id, conversation_id, message_id, pinned_by, pinned_at,
          pinner:profiles!pinned_by(id, full_name, role, email),
          message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
            sender:profiles(id, full_name, role, email)
          )
        `).eq("conversation_id",c).order("pinned_at",{ascending:!1});return F(d,"list pinned messages").filter(o=>o.message?.deleted_at==null).map(va)},async pinMessage(c,d){return N(await t.rpc("wein_chat_pin_message",{p_conversation_id:c,p_message_id:d}),"pin message")},async unpinMessage(c,d){N(await t.rpc("wein_chat_unpin_message",{p_conversation_id:c,p_message_id:d}),"unpin message")},async markRead(c,d){const o=await t.from("wein_chat_members").update({last_read_seq:d}).eq("conversation_id",c).eq("user_id",a).select("conversation_id, user_id, last_read_seq");if(!F(o,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(c,d){const o=await t.from("wein_chat_members").update({notification_level:d}).eq("conversation_id",c).eq("user_id",a).select("conversation_id, user_id, notification_level");if(!F(o,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(c){if(typeof t.channel!="function")return()=>{};const d=t.channel(`wein-chat:${a}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},c).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},c).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},c).subscribe();return()=>{typeof t.removeChannel=="function"?t.removeChannel(d):typeof d.unsubscribe=="function"&&d.unsubscribe()}},fetchConversation:e}}function _a(t){return typeof t.session.user=="object"&&t.session.user!==null?t.session.user:{}}function ba(t){const a=_a(t),e=a.id;if(!e)throw new Error("Team chat requires an authenticated user id.");return{id:e,full_name:t.session.fullName||a.email||"Portal user",role:t.session.role||"team",email:a.email||null}}let _e=null;function ya(t){_e=t||null}function wa(){const t=ma();de({id:"team-chat",mount(a,e){const c=_e;_e=null;const d=ba(e),o=rt({supabase:e.session.client,currentUserId:d.id});return t.mount(a,{currentUser:d,service:o,initialConversationId:c})}})}function $a(t,a={}){return t?t.author_id&&a[t.author_id]?.full_name?a[t.author_id].full_name:t.author_name||"Unknown":"Unknown"}function it(t){return!!t?.resolved_at}function Sa(t=[]){const a=new Map,e=[];t.forEach(o=>{a.set(o.id,{...o,replies:[]})}),a.forEach(o=>{o.reply_to_id&&a.has(o.reply_to_id)?a.get(o.reply_to_id).replies.push(o):e.push(o)});const c=(o,h)=>String(o.created_at||"").localeCompare(String(h.created_at||"")),d=o=>{o.replies.sort(c),o.replies.forEach(d)};return e.sort(c),e.forEach(d),e}function Ca(t=[]){return t.filter(a=>!it(a)).length}function We(t,a=90){const e=String(t?.body||"").replace(/\s+/g," ").trim();return e.length<=a?e:`${e.slice(0,Math.max(0,a-1)).trimEnd()}…`}function P(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function ze(t={}){return t.taskId?"Task discussion":t.providerId?"Provider discussion":t.offerId?"Offer discussion":"Record discussion"}function ka(t={}){return t.taskId?`Task ${t.taskId}`:t.providerId?`Provider ${t.providerId}`:t.offerId?`Offer ${t.offerId}`:"No record scope"}function Ea(){return{id:"record-discussion",mount(t,a){const e={comments:[],peopleById:Object.fromEntries((a.people||[]).map(b=>[b.id,b])),loading:!0,error:null,replyToId:null,taskSourceCommentId:null};let c=!1,d=null,o=null;t.classList.add("wein-discussion-root");async function h(){try{e.error=null,e.comments=await a.service.listComments(a.scope||{})}catch(b){e.error=b.message||String(b)}finally{e.loading=!1,c||O()}}async function f(b){const I=b.querySelector("[data-discussion-body]"),w=I.value.trim();w&&(I.value="",await a.service.postComment({...a.scope||{},body:w,replyToId:e.replyToId,people:a.people||[]}),e.replyToId=null,await h())}async function E(b){const I=t.querySelector(`[data-resolve-note="${CSS.escape(b)}"]`)?.value||"";await a.service.resolveComment(b,I),await h()}async function y(b){await a.service.reopenComment(b),await h()}async function v(b){const I=b.querySelector("[data-task-title]"),w=I.value.trim();!w||!e.taskSourceCommentId||(await a.service.createTaskFromComment(e.taskSourceCommentId,w,a.currentUser?.id||null),I.value="",e.taskSourceCommentId=null,await h())}function $(b,I=0){const w=it(b),B=$a(b,e.peopleById);return`
          <article class="discussion-comment${w?" resolved":""}" style="--depth:${Math.min(I,4)}">
            <div class="discussion-comment-meta">
              <span>${P(B)}</span>
              <span>${P(b.created_at||"")}</span>
              ${w?'<span class="discussion-resolved-pill">Resolved</span>':""}
            </div>
            <div class="discussion-comment-body">${P(b.body)}</div>
            ${b.resolved_note?`<div class="discussion-resolved-note">${P(b.resolved_note)}</div>`:""}
            <div class="discussion-actions">
              <button type="button" data-discussion-reply="${P(b.id)}">Reply</button>
              ${w?`<button type="button" data-discussion-reopen="${P(b.id)}">Reopen</button>`:`<button type="button" data-discussion-resolve="${P(b.id)}">Resolve</button>`}
              <button type="button" data-discussion-task="${P(b.id)}">Create task</button>
            </div>
            ${w?"":`<input class="discussion-resolve-note" data-resolve-note="${P(b.id)}" placeholder="Optional resolve note">`}
            ${b.replies?.length?`<div class="discussion-replies">${b.replies.map(G=>$(G,I+1)).join("")}</div>`:""}
          </article>
        `}function T(){if(!e.taskSourceCommentId)return"";const b=e.comments.find(I=>I.id===e.taskSourceCommentId);return`
          <form class="discussion-task-box" data-discussion-task-form>
            <div>
              <div class="discussion-eyebrow">Create task from comment</div>
              <p>${P(We(b))}</p>
            </div>
            <input data-task-title type="text" placeholder="Task title">
            <div class="discussion-task-actions">
              <button type="submit">Create task</button>
              <button type="button" data-discussion-task-cancel>Cancel</button>
            </div>
          </form>
        `}function O(){const b=Sa(e.comments),I=e.replyToId?e.comments.find(w=>w.id===e.replyToId):null;t.innerHTML=`
          <section class="discussion-shell" aria-label="${P(ze(a.scope))}">
            <header class="discussion-header">
              <div>
                <div class="discussion-eyebrow">${P(ze(a.scope))}</div>
                <h2>Discussion</h2>
                <p>${P(ka(a.scope))}</p>
              </div>
              <span class="discussion-count">${Ca(e.comments)} unresolved</span>
            </header>
            ${e.error?`<div class="discussion-error">${P(e.error)}</div>`:""}
            ${T()}
            <div class="discussion-list">
              ${e.loading?'<div class="discussion-muted">Loading discussion...</div>':""}
              ${b.map(w=>$(w)).join("")}
              ${!e.loading&&!b.length?'<div class="discussion-muted">No comments yet.</div>':""}
            </div>
            <form class="discussion-composer" data-discussion-form>
              ${I?`
                <div class="discussion-replying">
                  Replying to: ${P(We(I,70))}
                  <button type="button" data-discussion-cancel-reply>Cancel</button>
                </div>
              `:""}
              <textarea data-discussion-body rows="3" placeholder="Write a record-attached note..."></textarea>
              <button type="submit">${I?"Reply":"Post comment"}</button>
            </form>
          </section>
        `,t.querySelector("[data-discussion-form]")?.addEventListener("submit",w=>{w.preventDefault(),f(w.currentTarget)}),t.querySelector("[data-discussion-cancel-reply]")?.addEventListener("click",()=>{e.replyToId=null,O()}),t.querySelector("[data-discussion-task-cancel]")?.addEventListener("click",()=>{e.taskSourceCommentId=null,O()}),t.querySelector("[data-discussion-task-form]")?.addEventListener("submit",w=>{w.preventDefault(),v(w.currentTarget)}),t.querySelectorAll("[data-discussion-reply]").forEach(w=>{w.addEventListener("click",()=>{e.replyToId=w.dataset.discussionReply,O()})}),t.querySelectorAll("[data-discussion-resolve]").forEach(w=>{w.addEventListener("click",()=>E(w.dataset.discussionResolve))}),t.querySelectorAll("[data-discussion-reopen]").forEach(w=>{w.addEventListener("click",()=>y(w.dataset.discussionReopen))}),t.querySelectorAll("[data-discussion-task]").forEach(w=>{w.addEventListener("click",()=>{e.taskSourceCommentId=w.dataset.discussionTask,O()})})}return h(),d=setInterval(()=>h(),3e4),typeof a.service.subscribeToDiscussionEvents=="function"&&(o=a.service.subscribeToDiscussionEvents(()=>h())),()=>{c=!0,d&&clearInterval(d),o&&o(),t.classList.remove("wein-discussion-root"),t.innerHTML=""}}}}function z(t){if(t)throw t}function Ma({supabase:t,currentUserId:a}){if(!t)throw new Error("Supabase client is required");if(!a)throw new Error("currentUserId is required");async function e({taskId:y,providerId:v,offerId:$}={}){let T=t.from("wein_comments").select("*").order("created_at",{ascending:!0});y&&(T=T.eq("task_id",y)),v&&(T=T.eq("provider_id",v)),$&&(T=T.eq("offer_id",$));const{data:O,error:b}=await T;return z(b),O||[]}async function c({body:y,taskId:v=null,providerId:$=null,offerId:T=null,replyToId:O=null,people:b=[]}){const I=v?{task_id:v}:$?{provider_id:$}:T?{offer_id:T}:null;if(!I)throw new Error("postComment requires taskId, providerId, or offerId");const{data:w,error:B}=await t.from("wein_comments").insert({...I,reply_to_id:O,body:y,author_role:"team"}).select("*").single();z(B);for(const G of ie(y,b))try{await h(w.id,G)}catch(he){console.error("Failed to record comment mention",he)}return w}async function d(y,v=""){const{data:$,error:T}=await t.from("wein_comments").update({resolved_at:new Date().toISOString(),resolved_note:v}).eq("id",y).select("*");if(z(T),!$?.length)throw new Error("Resolve affected zero comments");return $[0]}async function o(y){const{data:v,error:$}=await t.from("wein_comments").update({resolved_at:null,resolved_note:null}).eq("id",y).select("*");if(z($),!v?.length)throw new Error("Reopen affected zero comments");return v[0]}async function h(y,v){const{data:$,error:T}=await t.from("wein_comment_mentions").insert({comment_id:y,mentioned_user_id:v}).select("*");return z(T),$?.[0]||null}async function f(y,v,$=null,T=null){const{data:O,error:b}=await t.rpc("wein_create_task_from_comment",{p_comment_id:y,p_title:v,p_assigned_to_user_id:$,p_due_date:T});return z(b),O}function E(y){if(!t.channel)return()=>{};const v=t.channel(`record-discussion:${a}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},y).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},y).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_task_links"},y).subscribe();return()=>{if(t.removeChannel)return t.removeChannel(v);if(v?.unsubscribe)return v.unsubscribe()}}return{listComments:e,postComment:c,resolveComment:d,reopenComment:o,addMention:h,createTaskFromComment:f,subscribeToDiscussionEvents:E}}function U(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}const Ta={critical:"Critical",high:"High",medium:"Medium",low:"Low"},Ia={task:"Task",mention:"Mention",discussion:"Discussion",review:"Review"};function La(t){if(!t)return"No due date";const a=new Date(t);return Number.isNaN(a.getTime())?String(t):a.toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function Da(t=[]){return["critical","high","medium","low"].map(a=>({severity:a,items:t.filter(e=>e.severity===a)})).filter(a=>a.items.length)}function qa(){return{id:"work-inbox",mount(t,a){const e={items:[],loading:!0,error:null};let c=!1,d=null,o=null;t.classList.add("wein-work-inbox-root");async function h(){try{e.error=null,e.items=await a.service.loadInbox()}catch(v){e.error=v.message||String(v)}finally{e.loading=!1,c||y()}}function f(v){if(typeof a.onSelectItem=="function"){a.onSelectItem(v);return}v.href&&(window.location.hash=v.href)}function E(v){return`
          <button type="button" class="work-inbox-item severity-${U(v.severity)}" data-inbox-item="${U(v.kind)}:${U(v.entity_id)}:${U(v.reason_code)}">
            <span class="work-inbox-kind">${U(Ia[v.kind]||v.kind)}</span>
            <span class="work-inbox-title">${U(v.title)}</span>
            <span class="work-inbox-reason">${U(v.reason_code.replaceAll("_"," "))}</span>
            <span class="work-inbox-due">${U(La(v.due_at))}</span>
            <span class="work-inbox-action">${U(v.next_action)}</span>
          </button>
        `}function y(){const v=Da(e.items);t.innerHTML=`
          <section class="work-inbox-shell" aria-label="Work inbox">
            <header class="work-inbox-header">
              <div>
                <div class="work-inbox-eyebrow">Today extension</div>
                <h2>Work inbox</h2>
                <p>Normalized tasks, mentions, discussion replies, and review signals.</p>
              </div>
              <div class="work-inbox-total">${e.items.length} item${e.items.length===1?"":"s"}</div>
            </header>
            ${e.error?`<div class="work-inbox-error">${U(e.error)}</div>`:""}
            <div class="work-inbox-toolbar">
              <button type="button" data-inbox-refresh>Refresh</button>
            </div>
            <div class="work-inbox-list">
              ${e.loading?'<div class="work-inbox-muted">Loading inbox...</div>':""}
              ${v.map($=>`
                <section class="work-inbox-group">
                  <h3>${U(Ta[$.severity])}</h3>
                  ${$.items.map(E).join("")}
                </section>
              `).join("")}
              ${!e.loading&&!e.items.length?'<div class="work-inbox-muted">No attention items right now.</div>':""}
            </div>
          </section>
        `,t.querySelector("[data-inbox-refresh]")?.addEventListener("click",()=>h()),t.querySelectorAll("[data-inbox-item]").forEach($=>{$.addEventListener("click",()=>{const T=$.dataset.inboxItem,O=e.items.find(b=>`${b.kind}:${b.entity_id}:${b.reason_code}`===T);O&&f(O)})})}return h(),d=setInterval(()=>h(),6e4),typeof a.service.subscribeToInboxEvents=="function"&&(o=a.service.subscribeToInboxEvents(()=>h())),()=>{c=!0,d&&clearInterval(d),o&&o(),t.classList.remove("wein-work-inbox-root"),t.innerHTML=""}}}}const Ge={critical:0,high:1,medium:2,low:3};function Se(t,a=new Date){if(!t)return"low";const e=new Date(t);if(Number.isNaN(e.getTime()))return"low";const c=e.getTime()-a.getTime();return c<0?"critical":c<=1440*60*1e3?"high":c<=4320*60*1e3?"medium":"low"}function Aa(t,{now:a=new Date}={}){return{kind:"task",entity_id:t.id,title:t.title||"Untitled task",reason_code:t.due_date?"task_due":"task_open",severity:Se(t.due_date,a),owner_id:t.assigned_to_user_id||t.owner_id||null,due_at:t.due_date||null,next_action:"Open task",href:`#tasks/${t.id}`,source:t}}function Oa(t,{comment:a,currentUserId:e}={}){return{kind:"mention",entity_id:t.comment_id,title:a?.body?`Mention: ${a.body}`:"Mention in discussion",reason_code:"unresolved_mention",severity:a?.resolved_at?"low":"high",owner_id:e||t.mentioned_user_id,due_at:a?.created_at||t.created_at||null,next_action:"Reply or resolve",href:`#comments/${t.comment_id}`,source:{mention:t,comment:a}}}function Ra(t,{currentUserId:a,now:e=new Date}={}){return{kind:"discussion",entity_id:t.id,title:t.body||"Discussion awaiting reply",reason_code:"thread_awaiting_reply",severity:Se(t.next_reply_due_at||t.created_at,e),owner_id:a||null,due_at:t.next_reply_due_at||null,next_action:"Reply in thread",href:`#comments/${t.id}`,source:t}}function Pa(t,{now:a=new Date}={}){return{kind:t.kind||"review",entity_id:t.id,title:t.title||t.offer_title||"Founder review needed",reason_code:t.reason_code||"founder_review",severity:Se(t.due_at||t.created_at,a),owner_id:t.owner_id||null,due_at:t.due_at||t.created_at||null,next_action:"Review",href:t.href||`#review/${t.id}`,source:t}}function Na(t=[]){return[...t].sort((a,e)=>{const c=(Ge[a.severity]??9)-(Ge[e.severity]??9);return c||String(a.due_at||"").localeCompare(String(e.due_at||""))})}function Ua(t=[]){const a=new Set;return t.filter(e=>{const c=`${e.kind}:${e.entity_id}:${e.reason_code}`;return a.has(c)?!1:(a.add(c),!0)})}function ja({tasks:t=[],mentions:a=[],commentsById:e={},awaitingReplies:c=[],founderReviews:d=[]},o={}){const h=[...t.map(f=>Aa(f,o)),...a.map(f=>Oa(f,{...o,comment:e[f.comment_id]})),...c.map(f=>Ra(f,o)),...d.map(f=>Pa(f,o))];return Na(Ua(h))}function Ve(t){if(t)throw t}function Fa({supabase:t,currentUserId:a}){if(!t)throw new Error("Supabase client is required");if(!a)throw new Error("currentUserId is required");async function e(){let h=t.from("wein_tasks").select("*").neq("status","done").order("due_date",{ascending:!0,nullsFirst:!1});a&&(h=h.eq("assigned_to_user_id",a));const{data:f,error:E}=await h;return Ve(E),f||[]}async function c(){const{data:h,error:f}=await t.from("wein_comment_mentions").select("comment_id,mentioned_user_id,created_at,wein_comments(*)").eq("mentioned_user_id",a).is("wein_comments.resolved_at",null).order("created_at",{ascending:!0});return Ve(f),h||[]}async function d(){const[h,f]=await Promise.all([e(),c()]),E={},y=f.map(v=>{const $=v.wein_comments||v.comment||null;return $?.id&&(E[$.id]=$),{comment_id:v.comment_id,mentioned_user_id:v.mentioned_user_id,created_at:v.created_at}});return ja({tasks:h,mentions:y,commentsById:E},{currentUserId:a})}function o(h){if(!t.channel)return()=>{};const f=t.channel(`work-inbox:${a}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_tasks"},h).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},h).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},h).subscribe();return()=>{if(t.removeChannel)return t.removeChannel(f);if(f?.unsubscribe)return f.unsubscribe()}}return{fetchOpenTasks:e,fetchUnresolvedMentions:c,loadInbox:d,subscribeToInboxEvents:o}}const ct=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function Ba(t){for(const a of ct)de({id:a,mount:()=>{t[a]()}})}function Ce(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const xa=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function Ha(t,a){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${xa.map(e=>`<button class="chip ${t===e?"active":""}" type="button" onclick="${a}('${e.replace(/'/g,"\\'")}')">${e==="all"?"All":Ce(e)}</button>`).join("")}</div>`}function Wa(t,a){return a==="all"||String(t||"")===a}function za(t){return String(t?.category||t?.vertical||"-")}function Ga(t){const a=String(t||"").toLowerCase();return a.includes("dining")?"dining":a.includes("health")?"health":a.includes("fun")?"fun":a.includes("hotel")?"hotels":""}function Va(t,a=Date.now()){return t?Math.floor((a-new Date(t).getTime())/864e5):0}function be(t=new Date){const a=new Date(t);return a.setHours(0,0,0,0),a}function Qa(t,a=new Date){return t?Math.round((be(a).getTime()-be(t).getTime())/864e5):null}function ot(t,a){let e=String(t||"").replace(/\D/g,"");if(!e)return null;e.startsWith("0")&&(e=`20${e.slice(1)}`);const c=`Hi! Following up on the WeIN offer sheet for ${a} - do you have 5 minutes today?`;return`https://wa.me/${e}?text=${encodeURIComponent(c)}`}function Ya(t,a){const e=ot(t,a);return e?`<a class="mini-btn" href="${Ce(e)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function J(t){return t.id}function Ka(t){return q("profiles").find(a=>J(a)===t)??null}function Ja(t){return q("providers").find(a=>J(a)===t)??null}function Xa(t){return q("leads").find(a=>J(a)===t)??null}function Za(t){return q("tasks").find(a=>J(a)===t)??null}function es(t){return q("offers").find(a=>J(a)===t)??null}function ts(t){return q("offers").filter(a=>a.provider_id===t)}function ns(t){return q("tasks").filter(a=>a.provider_id===t)}function as(t){return q("tasks").filter(a=>a.lead_id===t)}const ss=Object.freeze(Object.defineProperty({__proto__:null,leadById:Xa,offerById:es,offersForProvider:ts,profileById:Ka,providerById:Ja,taskById:Za,tasksForLead:as,tasksForProvider:ns},Symbol.toStringTag,{value:"Module"}));function rs(){const t=document.title;let a=!1;async function e(){const d=window.WEIN?.user?.id;if(d)try{const h=await rt({supabase:ce(),currentUserId:d}).listConversations(),f=nt(h),E=document.querySelector("[data-chat-unread-badge]");E&&(E.textContent=String(f),E.style.display=f>0?"inline-flex":"none"),document.title=na(t,f)}catch{}}const c=setInterval(()=>{window.WEIN?.user?.id&&!a&&(a=!0,clearInterval(c),setInterval(e,3e4)),e()},2e3)}Hn();wa();rs();const lt={api:Xe,auth:{canDelete:ye,canManageDeals:Ye,canEditProviderProfile:Ke,navHiddenForRole:we,defaultViewForRole:Je},platform:{getSupabaseClient:ce,getAccessToken:le,getSessionContext:Ln},shared:{escapeHtml:Ce,daysSince:Va,startOfLocalDay:be,dayDiffFromToday:Qa,whatsappLink:ot,whatsappButtonHtml:Ya,categoryChipsHtml:Ha,matchesCategoryFilter:Wa,categoryLabel:za,catBadgeClass:Ga},core:{createPortalContext:jn,getView:tt,mountView:xn,registeredViewIds:Fn,registerView:de},legacy:{LEGACY_VIEW_IDS:ct,registerLegacyViews:Ba},features:{requestOpenChatConversation:ya,createDiscussionViewModule:Ea,createSupabaseDiscussionService:Ma,createWorkInboxViewModule:qa,createSupabaseWorkInboxService:Fa},store:et,selectors:ss};window.WEIN_PORTAL_MODULES=lt;for(const t of window.WEIN_PORTAL_MODULES_READY??[])t(lt);window.WEIN_PORTAL_MODULES_READY=[];
