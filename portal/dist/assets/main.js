function ze(t){return typeof t=="object"&&t!==null?t.role:t}function be(t){const a=ze(t);return a==="admin"||a==="manager"}const Ge=be;function Ve(t){const a=ze(t);return a==="admin"||a==="manager"||a==="deal_breaker"}const kn={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function ye(t){return t?kn[t]??[]:[]}function Ye(t){return ye(t).includes("pipeline")?"tasks":"pipeline"}function j(){return window.WEIN_PORTAL_LEGACY??{}}function ie(){const t=j().supabaseClient;if(!t)throw new Error("Portal Supabase client is not available yet.");return t}function re(){const t=j().getSupabaseUrl?.();if(!t)throw new Error("Portal Supabase URL is not available yet.");return t}function En(){const t=j().getSupabaseAnonKey?.();if(!t)throw new Error("Portal Supabase anon key is not available yet.");return t}function ce(){return j().getAccessToken?.()??null}function Mn(){return{client:ie(),accessToken:ce()}}class Dn extends Error{constructor(a,e,r){super(a),this.status=e,this.body=r,this.name="PortalApiError"}status;body}function Q(){const t=j().headers?.();if(t)return t;const a=En();return{apikey:a,Authorization:`Bearer ${ce()||a}`,"Content-Type":"application/json"}}async function we(t,a){if(t.ok)return;const e=await t.text();throw new Dn(`Supabase ${a} failed: ${t.status}${e?` ${e}`:""}`,t.status,e)}async function Ln(t){const a=j().get;if(a)return a(t);const e=await fetch(`${re()}/rest/v1/${t}`,{headers:Q()});return await we(e,"GET"),e.json()}async function Tn(t,a){const e=j().post;if(e)return e(t,a);const r=await fetch(`${re()}/rest/v1/${t}`,{method:"POST",headers:{...Q(),Prefer:"return=representation"},body:JSON.stringify(a)});return await we(r,"POST"),r.json()}async function In(t,a){const e=j().patch;return e?e(t,a):(await fetch(`${re()}/rest/v1/${t}`,{method:"PATCH",headers:Q(),body:JSON.stringify(a)})).ok}async function qn(t){const a=j().delete;if(a)return a(t);const e=await fetch(`${re()}/rest/v1/${t}`,{method:"DELETE",headers:Q()});return await we(e,"DELETE"),!0}const Qe={headers:Q,get:Ln,post:Tn,patch:In,delete:qn},An={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function On(){const t=j().getCaches?.();return t?{providers:t.providers??[],offers:t.offers??[],negotiations:t.negotiations??[],files:t.files??[],leads:t.leads??[],outcomes:t.outcomes??[],tasks:t.tasks??[],profiles:t.profiles??[],redemptions:t.redemptions??[],campaigns:t.campaigns??[],calendarNotes:t.calendarNotes??[]}:An}function q(t){return On()[t]}function Ke(t,a){const e=j().setCache;if(!e)throw new Error("Portal cache bridge is not available yet.");e(t,[...a])}function Rn(t,a){Ke(t,a(q(t)))}const Je={get providers(){return q("providers")},get offers(){return q("offers")},get negotiations(){return q("negotiations")},get files(){return q("files")},get leads(){return q("leads")},get outcomes(){return q("outcomes")},get tasks(){return q("tasks")},get profiles(){return q("profiles")},get redemptions(){return q("redemptions")},get campaigns(){return q("campaigns")},get calendarNotes(){return q("calendarNotes")},getCache:q,replaceCache:Ke,updateCache:Rn};function ne(){const t=window.WEIN??{};return{user:t.user,role:t.role??sessionStorage.getItem("weinRole"),fullName:t.fullName??null,accessToken:ce(),client:ie()}}function Pn(){const t=ne();return{api:Qe,store:Je,session:t,permissions:{canDelete:()=>be(ne()),canManageDeals:()=>Ge(ne()),canEditProviderProfile:()=>Ve(ne()),navHiddenForRole:ye,defaultViewForRole:Ye},navigate(a,e){window.showView?.(a,e)}}}const Y=new Map;let ae=null;function oe(t){if(!t.id)throw new Error("View id is required.");if(Y.has(t.id))throw new Error(`View already registered: ${t.id}`);Y.set(t.id,t)}function Xe(t){return Y.get(t)}function Nn(){return[...Y.keys()]}function Un(){if(!ae)return;const t=ae;ae=null,t()}function jn(t,a,e){const r=Xe(t);if(!r)throw new Error(`Unknown portal view: ${t}`);Un();const l=r.mount(a,e);ae=typeof l=="function"?l:null}function Bn(){Y.has("__dummy_cleanup_probe")||oe({id:"__dummy_cleanup_probe",mount(t){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,t.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function Fn(t="chat"){const a=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${t}-${a}`}function fe(t,a){return t.kind==="group"?t.title||"Untitled group":t.kind==="channel"?t.title||"Untitled channel":(t.members||[]).map(r=>r.profile).find(r=>r&&r.id!==a)?.full_name||"Direct message"}function xn(t){return[...t].sort((a,e)=>{const r=a.last_message?.created_at||a.created_at,l=e.last_message?.created_at||e.created_at;return new Date(l).getTime()-new Date(r).getTime()})}function Hn(t,a){const e=(t.members||[]).find(l=>l.user_id===a),r=t.last_message?.message_seq||0;return Math.max(0,r-(e?.last_read_seq||0))}function Wn(t){return[...t].sort((a,e)=>{const r=(a.unread_count||0)>0,l=(e.unread_count||0)>0;if(r!==l)return r?-1:1;const o=a.last_message?.created_at||a.created_at,m=e.last_message?.created_at||e.created_at;return new Date(m).getTime()-new Date(o).getTime()})}const zn=["channel","group","dm"];function Gn(t){const a={channel:[],group:[],dm:[]};for(const e of t)(a[e.kind]||a.dm).push(e);return zn.map(e=>({kind:e,conversations:Wn(a[e])}))}function Vn(t){return{id:t.id,kind:"channel",title:t.title??null,topic:t.topic??null,description:t.description??null,created_by:t.created_by,creator_name:t.creator_name??null,created_at:t.created_at,archived_at:t.archived_at??null,member_count:Number(t.member_count)||0,joined_by_current_user:!!t.joined_by_current_user}}function Yn(t){if(!t)return"No messages yet";const a=(t.deleted_at?"Message deleted":t.body||"").trim();return a.length>82?`${a.slice(0,79)}...`:a}function Qn(t,a){return{...t,[a]:{pending:!0,error:null}}}function Kn(t,a){return{...t,[a]:{pending:!1,error:null}}}function Jn(t,a,e){return{...t,[a]:{pending:!1,error:e}}}function A(t,a){return!!t?.[a]?.pending}function E(t,a){return t?.[a]?.error??null}const Xn=[["only an admin or manager may create a channel","Only an admin or manager can create a channel."],["channel name is required","Enter a channel name."],["only channels can be joined this way","That conversation can't be joined this way."],["this channel has been archived","This channel has been archived and can no longer be joined."],["conversation not found","This conversation no longer exists."],["chat conversation immutable columns cannot be updated","That change isn't allowed."],["only group or channel conversations can be renamed","Direct messages can't be renamed."],["only channel details can be edited this way","That change isn't allowed here."],["only the channel owner, an admin, or a manager may edit channel details","Only the channel owner, an admin, or a manager can edit channel details."],["channel topic must be 160 characters or fewer","Topic must be 160 characters or fewer."],["channel description must be 1000 characters or fewer","Description must be 1000 characters or fewer."],["active membership required to pin a message","You need to be a member of this conversation to pin a message."],["active membership required to unpin a message","You need to be a member of this conversation to unpin a message."],["this message is already pinned","That message is already pinned."],["message does not belong to this conversation","That message can't be pinned here."],["message not found","This message no longer exists."]];function ge(t){const a=(t instanceof Error?t.message:String(t??"")).toLowerCase(),e=Xn.find(([r])=>a.includes(r));return e?e[1]:"Something went wrong. Please try again."}function Ze(t=[]){return t.reduce((a,e)=>{const r=Number(e?.unread_count);return a+(Number.isFinite(r)&&r>0?r:0)},0)}function Zn(t,a){const e=String(t??"");return a>0?`(${a}) ${e}`:e}const ea=/[\s\p{P}]/u,ta=/[\s\p{P}]/u;function et(t,a){return a===0?!0:ea.test(t[a-1])}function na(t,a){return a>=t.length?!0:ta.test(t[a])}function se(t="",a=[]){const e=String(t??"");if(!e.includes("@"))return[];const r=a.filter(f=>f&&f.id&&f.full_name).map(f=>({id:f.id,name:String(f.full_name)})).sort((f,M)=>M.name.length-f.name.length);if(!r.length)return[];const l=e.toLowerCase(),o=[],m=new Set;for(let f=0;f<e.length;f+=1){if(e[f]!=="@"||!et(e,f))continue;const M=f+1;for(const w of r){const v=M+w.name.length;if(l.startsWith(w.name.toLowerCase(),M)&&na(e,v)){m.has(w.id)||(m.add(w.id),o.push(w.id)),f=v-1;break}}}return o}function aa(t="",a=[]){const e=new Set(se(t,a));return a.filter(r=>r&&e.has(r.id)&&r.full_name).map(r=>String(r.full_name)).sort((r,l)=>l.length-r.length)}function sa(t="",a=0){const e=String(t??""),r=Math.max(0,Math.min(Number(a)||0,e.length)),l=40;for(let o=r-1;o>=0&&r-o<=l;o-=1){const m=e[o];if(m==="@")return et(e,o)?{query:e.slice(o+1,r),start:o}:null;if(m===`
`)return null}return null}const ia={channel:"Channels",group:"Private groups",dm:"Direct messages"};function d(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function V(t){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[t]||t}function ra(t){return`${t}-${Math.random().toString(16).slice(2)}-${Date.now().toString(36)}`}function Re(t){return typeof t=="string"&&t.startsWith("image/")}function ca(t){const a=Number(t)||0;return a<1024?`${a} B`:a<1024*1024?`${(a/1024).toFixed(1)} KB`:`${(a/(1024*1024)).toFixed(1)} MB`}function Pe(t){return t==="application/pdf"?"ti-file-type-pdf":t?.includes("word")?"ti-file-type-doc":t?.includes("sheet")||t?.includes("excel")?"ti-file-type-xls":"ti-file"}function Ne(t,a=new Date){if(!t)return"";const e=new Date(t);if(Number.isNaN(e.getTime()))return"";const r=a.getTime()-e.getTime(),l=Math.floor(r/6e4);if(l<1)return"now";if(l<60)return`${l}m`;const o=Math.floor(l/60);return o<24?`${o}h`:r<6*864e5?e.toLocaleDateString(void 0,{weekday:"short"}):e.toLocaleDateString(void 0,{month:"short",day:"numeric"})}const oa=300*1e3;function la(t,a){if(!a||t.sender_id!==a.sender_id)return!0;const e=new Date(t.created_at).getTime()-new Date(a.created_at).getTime();return!(e>=0&&e<oa)}function da(){return{id:"team-chat",mount(t,a){const e={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,composeOpen:!1,composeSearch:"",composeGroupTitle:"",composeChannelTitle:"",composeSelectedMemberIds:new Set,sidebarSectionsCollapsed:{},browseChannelsOpen:!1,browseChannelsList:[],browseChannelsLoading:!1,browseChannelsError:null,browseChannelsSearch:"",membersOpen:!1,memberAddOpen:!1,memberSearch:"",memberSelectedIds:new Set,renameOpen:!1,renameDraft:"",archiveConfirmOpen:!1,channelDetailsOpen:!1,channelDetailsTitleDraft:"",channelDetailsTopicDraft:"",channelDetailsDescriptionDraft:"",leaveChannelConfirmOpen:!1,pinnedMessages:[],pinnedMessagesLoading:!1,pinnedMessagesError:null,pinnedMessagesPanelOpen:!1,unpinConfirmMessageId:null,mentionQuery:null,mentionIndex:0,mentionStart:0,mentionDraft:"",pendingAttachments:[],openMessageMenuId:null,confirmingDeleteMessageId:null,searchOpen:!1,searchQuery:"",searchResults:[],searchLoading:!1,searchError:null,loading:!0,error:null,actionState:{}},r=new Map,l=new Set;let o=!1,m=a.initialConversationId||null;async function f(n,s){if(!A(e.actionState,n)){e.actionState=Qn(e.actionState,n),h();try{if(await s(),o)return;e.actionState=Kn(e.actionState,n)}catch(i){if(o)return;e.actionState=Jn(e.actionState,n,ge(i))}h()}}let M=null,w=null,v=!1,$=null,D=0;function O(){const n=t.querySelector(".chat-message-list");return n?n.scrollHeight-n.scrollTop-n.clientHeight<80:!0}function b(){const n=t.querySelector(".chat-message-list");n&&(n.scrollTop=n.scrollHeight)}function L(n){n.style.height="auto",n.style.height=`${Math.min(n.scrollHeight,120)}px`}function y(n){return n?n.members.filter(s=>!s.left_at&&s.profile).map(s=>s.profile):[]}function F(n){const s=String(e.mentionQuery||"").trim().toLowerCase(),i=y(n).filter(u=>u.id!==a.currentUser.id);return s?i.filter(u=>(u.full_name||"").toLowerCase().includes(s)):i}function G({rerender:n=!0}={}){e.mentionQuery!==null&&(e.mentionQuery=null,e.mentionIndex=0,n&&h())}function de(n){e.mentionDraft=n.value;const s=sa(n.value,n.selectionStart??n.value.length),i=s?s.query:null;return i===e.mentionQuery?!1:(e.mentionQuery=i,e.mentionStart=s?s.start:0,e.mentionIndex=0,!0)}function Ce(n,s){const i=t.querySelector("[data-chat-composer]");if(!i||!s)return;const u=i.selectionStart??i.value.length,g=i.value.slice(0,e.mentionStart),S=i.value.slice(u),C=`@${s.full_name} `,_=`${g}${C}${S}`,I=g.length+C.length;e.mentionQuery=null,e.mentionIndex=0,e.mentionDraft=_,h();const k=t.querySelector("[data-chat-composer]");k&&(k.value=_,L(k),k.focus(),k.setSelectionRange?.(I,I))}function ke(n,s){const i=F(n);if(!i.length)return;const u=(e.mentionIndex+s+i.length)%i.length;e.mentionIndex=u;const g=t.querySelector("[data-chat-composer]")?.value??e.mentionDraft,S=t.querySelector("[data-chat-composer]")?.selectionStart??g.length;e.mentionDraft=g,h();const C=t.querySelector("[data-chat-composer]");C&&(C.value=g,L(C),C.focus(),C.setSelectionRange?.(S,S))}t.classList.add("wein-chat-root"),typeof document<"u"&&document.body?.classList.add("wein-chat-root");function Ee(n){const s=n.target;if(s instanceof Element){if(e.composeOpen&&!s.closest("[data-chat-compose-popover]")&&!s.closest("[data-chat-compose-toggle]")){J();return}if(e.membersOpen&&!s.closest("[data-chat-members-panel]")&&!s.closest("[data-chat-members-toggle]")){X();return}e.openMessageMenuId&&!s.closest("[data-chat-message-menu-panel]")&&!s.closest("[data-chat-message-menu]")&&(e.openMessageMenuId=null,h())}}function Me(n){if(n.key==="Escape"){if(e.composeOpen){J();return}if(e.membersOpen){X();return}(e.openMessageMenuId||e.confirmingDeleteMessageId)&&(e.openMessageMenuId=null,e.confirmingDeleteMessageId=null,h())}}t.addEventListener?.("click",Ee),typeof document<"u"&&document.addEventListener("keydown",Me);async function R({keepMessages:n=!0}={}){try{e.error=null;const[s,i]=await Promise.all([a.service.listProfiles(),a.service.listConversations()]);if(e.profiles=s,e.conversations=xn(i),m&&(e.conversations.some(u=>u.id===m)&&(e.selectedConversationId=m),m=null),!e.selectedConversationId&&e.conversations.length&&(e.selectedConversationId=e.conversations[0].id),e.selectedConversationId&&n){e.messages=await a.service.listMessages(e.selectedConversationId);const u=e.messages.at(-1)?.message_seq||0;if(u)try{await a.service.markRead(e.selectedConversationId,u)}catch(g){console.error("Failed to mark chat messages as read",g)}}}catch(s){e.error=s.message||String(s)}finally{e.loading=!1,o||h()}}async function x(n){e.selectedConversationId=n,e.membersOpen=!1,e.memberAddOpen=!1,e.memberSearch="",e.memberSelectedIds=new Set,e.renameOpen=!1,e.renameDraft="",e.archiveConfirmOpen=!1,e.pendingAttachments=[],e.pinnedMessages=[],e.pinnedMessagesPanelOpen=!1,e.unpinConfirmMessageId=null,t.classList.add("chat-has-selection"),e.messages=await a.service.listMessages(n),v=!0,o||h();const s=e.messages.at(-1)?.message_seq||0;if(s)try{await a.service.markRead(n,s)}catch(i){console.error("Failed to mark chat messages as read",i)}ct(n),await R()}function ue(){t.classList.remove("chat-has-selection")}async function ct(n){e.pinnedMessagesError=null,e.pinnedMessagesLoading=!0,h();try{const s=await a.service.listPinnedMessages(n);if(o||e.selectedConversationId!==n)return;e.pinnedMessages=s,e.pinnedMessagesLoading=!1,h()}catch(s){if(o||e.selectedConversationId!==n)return;e.pinnedMessagesError=ge(s),e.pinnedMessagesLoading=!1,h()}}function De(n){return e.pinnedMessages.some(s=>s.message_id===n)}function Le(n){return e.pinnedMessages.find(s=>s.message_id===n)||null}async function ot(n,s){const i=await a.service.pinMessage(n,s);e.pinnedMessages=[{id:i,conversation_id:n,message_id:s,pinned_by:a.currentUser.id,pinned_at:new Date().toISOString(),pinner:a.currentUser,message:e.messages.find(u=>u.id===s)||null},...e.pinnedMessages],e.openMessageMenuId=null,o||h()}async function Te(n,s){await a.service.unpinMessage(n,s),e.pinnedMessages=e.pinnedMessages.filter(i=>i.message_id!==s),e.unpinConfirmMessageId=null,e.openMessageMenuId=null,o||h()}function lt(n,s){const i=Le(s);if(i&&i.pinned_by!==a.currentUser.id){e.unpinConfirmMessageId=s,h();return}f(`unpin-message:${s}`,()=>Te(n,s))}function dt(){e.unpinConfirmMessageId=null,h()}function Ie(){e.pinnedMessagesPanelOpen=!e.pinnedMessagesPanelOpen,h()}function ut(n){e.pinnedMessagesPanelOpen=!1,h();const s=Array.from(t.querySelectorAll("[data-chat-message-id]")).find(i=>i.dataset.chatMessageId===n);s&&(s.scrollIntoView({block:"center"}),s.classList.add("chat-message-jumped"),setTimeout(()=>s.classList.remove("chat-message-jumped"),1600))}function me(n){const s=e.selectedConversationId;if(!s)return;const i=[...n||[]];for(const u of i){const g={id:ra("pending"),name:u.name,mime:u.type||"application/octet-stream",size:u.size,status:"uploading",error:null,uploaded:null};e.pendingAttachments=[...e.pendingAttachments,g],a.service.uploadAttachment(s,u).then(S=>{g.status="done",g.uploaded=S,o||h()}).catch(S=>{g.status="error",g.error=S?.message||"Upload failed",o||h()})}h()}function mt(n){e.pendingAttachments=e.pendingAttachments.filter(s=>s.id!==n),h()}async function ht(n){const s=n.querySelector("[data-chat-composer]"),i=s.value.trim(),u=e.pendingAttachments.some(k=>k.status==="uploading"),g=e.pendingAttachments.filter(k=>k.status==="done").map(k=>k.uploaded);if(u||!i&&!g.length||!e.selectedConversationId)return;const S=e.replyToMessageId,C=e.conversations.find(k=>k.id===e.selectedConversationId)||null,_=se(i,y(C));s.value="",e.replyToMessageId=null,e.mentionQuery=null,e.mentionDraft="",e.pendingAttachments=[];const I=await a.service.sendMessage({conversationId:e.selectedConversationId,body:i,clientNonce:Fn("portal-chat"),replyToId:S,mentionedUserIds:_,attachments:g});e.messages=[...e.messages,I],v=!0,o||h();try{await a.service.markRead(e.selectedConversationId,I.message_seq)}catch(k){console.error("Failed to mark chat message as read",k)}await R()}function pt(n){n&&(e.replyToMessageId=n,h(),t.querySelector("[data-chat-composer]")?.focus())}function ft(){e.replyToMessageId=null,h()}function gt(){e.composeOpen=!0,e.searchOpen=!1,e.browseChannelsOpen=!1,h(),t.querySelector("[data-chat-compose-search]")?.focus()}function J({reset:n=!1}={}){e.composeOpen=!1,n&&(e.composeSearch="",e.composeGroupTitle="",e.composeChannelTitle="",e.composeSelectedMemberIds=new Set),h()}function vt(){e.searchOpen=!0,e.composeOpen=!1,e.browseChannelsOpen=!1,h(),t.querySelector("[data-chat-search-input]")?.focus()}function he(){e.searchOpen=!1,e.searchQuery="",e.searchResults=[],e.searchLoading=!1,e.searchError=null,$&&clearTimeout($),h()}async function _t(n){const s=n.trim();if(!s){e.searchResults=[],e.searchLoading=!1,e.searchError=null,o||h();return}const i=++D;e.searchLoading=!0,e.searchError=null,o||h();try{const u=await a.service.searchMessages(s);if(o||i!==D)return;e.searchResults=u,e.searchLoading=!1,h()}catch(u){if(o||i!==D)return;e.searchError=u instanceof Error?u.message:String(u),e.searchLoading=!1,h()}}function bt(n){e.searchQuery=n,$&&clearTimeout($),$=setTimeout(()=>_t(n),300)}async function yt(n,s){if(he(),await x(n),o)return;const i=Array.from(t.querySelectorAll("[data-chat-message-id]")).find(u=>u.dataset.chatMessageId===s);i&&(i.scrollIntoView({block:"center"}),i.classList.add("chat-message-jumped"),setTimeout(()=>i.classList.remove("chat-message-jumped"),1600))}function wt(n,s){const i=new Set(e.composeSelectedMemberIds);s?i.add(n):i.delete(n),e.composeSelectedMemberIds=i,h()}function qe(n){return n.members.find(i=>i.user_id===a.currentUser.id&&!i.left_at)?.membership_role==="owner"||["admin","manager"].includes(a.currentUser.role)}function Ae(n){return!n||!["group","channel"].includes(n.kind)?!1:qe(n)}function $t(n){return n?qe(n):!1}function St(){e.membersOpen=!0,h()}function X({reset:n=!1}={}){e.membersOpen=!1,e.memberAddOpen=!1,n&&(e.memberSearch="",e.memberSelectedIds=new Set),h()}function Ct(){e.memberAddOpen=!e.memberAddOpen,h(),e.memberAddOpen&&t.querySelector("[data-chat-member-search]")?.focus()}function kt(n,s){const i=new Set(e.memberSelectedIds);s?i.add(n):i.delete(n),e.memberSelectedIds=i,h()}async function Et(n){const s=[...e.memberSelectedIds];if(!(!n||!s.length)){for(const i of s)await a.service.addMember(n,i);e.memberSearch="",e.memberSelectedIds=new Set,e.memberAddOpen=!1,o||h(),await R()}}async function Mt(n,s){!n||!s||(await a.service.removeMember(n,s),e.conversations=e.conversations.map(i=>i.id!==n?i:{...i,members:i.members.map(u=>u.user_id===s?{...u,left_at:u.left_at||new Date().toISOString()}:u)}),s===a.currentUser.id&&(e.membersOpen=!1,e.memberAddOpen=!1),o||h(),await R())}function Dt(n){const s=e.messages.find(u=>u.id===n);if(!s)return;e.editingMessageId=n,e.editDraft=s.body||"",h();const i=t.querySelector(`[data-chat-edit-input="${CSS.escape(n)}"]`);i?.focus(),i?.select?.()}function Lt(){e.editingMessageId=null,e.editDraft="",h()}async function Tt(n){const s=n.dataset.chatEditForm,u=n.querySelector("[data-chat-edit-input]").value.trim();if(!s||!u)return;const g=e.conversations.find(C=>C.id===e.selectedConversationId)||null,S=await a.service.updateMessage(s,u,se(u,y(g)));e.messages=e.messages.map(C=>C.id===S.id?S:C),e.editingMessageId=null,e.editDraft="",o||h(),await R()}async function It(n){if(!n)return;const s=await a.service.deleteMessage(n);e.messages=e.messages.map(i=>i.id===n?{...i,...s,body:"Message deleted",deleted_at:s.deleted_at||new Date().toISOString()}:i),e.replyToMessageId===n&&(e.replyToMessageId=null),e.confirmingDeleteMessageId=null,e.openMessageMenuId=null,o||h(),await R()}async function qt(n){const i=n.members.find(u=>u.user_id===a.currentUser.id)?.notification_level==="muted"?"all":"muted";await a.service.setNotificationLevel(n.id,i),e.conversations=e.conversations.map(u=>u.id!==n.id?u:{...u,members:u.members.map(g=>g.user_id===a.currentUser.id?{...g,notification_level:i}:g)}),o||h(),await R()}function At(n){e.renameOpen=!0,e.renameDraft=n.title||"",h(),t.querySelector("[data-chat-rename-input]")?.focus()}function Ot(){e.renameOpen=!1,e.renameDraft="",h()}async function Rt(n,s){const i=(s||"").trim();i&&(await a.service.renameConversation(n.id,i),e.conversations=e.conversations.map(u=>u.id===n.id?{...u,title:i}:u),e.renameOpen=!1,e.renameDraft="",o||h(),await R())}function Pt(){e.archiveConfirmOpen=!0,h()}function Nt(){e.archiveConfirmOpen=!1,h()}async function Ut(n,s){await a.service.setConversationArchived(n.id,s),e.archiveConfirmOpen=!1,e.selectedConversationId===n.id&&(e.selectedConversationId=null,ue()),e.conversations=e.conversations.map(i=>i.id===n.id?{...i,archived_at:new Date().toISOString()}:i),o||h(),await R()}function jt(n){e.channelDetailsOpen=!0,e.channelDetailsTitleDraft=n.title||"",e.channelDetailsTopicDraft=n.topic||"",e.channelDetailsDescriptionDraft=n.description||"",e.membersOpen=!1,h(),t.querySelector("[data-chat-channel-details-title]")?.focus()}function Bt(){e.channelDetailsOpen=!1,h()}async function Ft(n){const s=e.channelDetailsTitleDraft,i=e.channelDetailsTopicDraft,u=e.channelDetailsDescriptionDraft;await a.service.updateChannelDetails(n.id,{title:s,topic:i,description:u}),e.conversations=e.conversations.map(g=>g.id===n.id?{...g,title:s.trim(),topic:i.trim()||null,description:u.trim()||null}:g),e.channelDetailsOpen=!1,o||h(),await R()}function xt(){e.leaveChannelConfirmOpen=!0,h()}function Ht(){e.leaveChannelConfirmOpen=!1,h()}async function Wt(n){await a.service.leaveChannel(n.id),e.leaveChannelConfirmOpen=!1,e.conversations=e.conversations.filter(s=>s.id!==n.id),e.selectedConversationId===n.id&&(e.selectedConversationId=e.conversations[0]?.id||null,ue()),o||h(),await R()}async function zt(n,s,i){!n||!s||(await a.service.setMembershipRole(n,s,i),e.conversations=e.conversations.map(u=>u.id!==n?u:{...u,members:u.members.map(g=>g.user_id===s?{...g,membership_role:i}:g)}),o||h(),await R())}async function Gt(n){if(!n)return;const s=await a.service.getOrCreateDm(n);e.composeOpen=!1,e.composeSearch="",e.composeGroupTitle="",e.composeSelectedMemberIds=new Set,await x(s)}async function Vt(n,s){if(n=n.trim(),!n)return;const i=await a.service.createGroup(n,s);e.composeOpen=!1,e.composeSearch="",e.composeGroupTitle="",e.composeSelectedMemberIds=new Set,await x(i)}async function Yt(n){if(n=n.trim(),!n)return;const s=await a.service.createChannel(n);e.composeOpen=!1,e.composeChannelTitle="",await x(s)}async function Qt(){e.browseChannelsError=null,e.browseChannelsLoading=!0,h();try{const n=await a.service.listChannels();e.browseChannelsList=[...n].sort((s,i)=>s.joined_by_current_user!==i.joined_by_current_user?s.joined_by_current_user?-1:1:(s.title||"").localeCompare(i.title||"")),e.browseChannelsLoading=!1,o||h()}catch(n){e.browseChannelsError=ge(n),e.browseChannelsLoading=!1,o||h()}}async function Kt(){e.browseChannelsOpen=!0,e.composeOpen=!1,e.searchOpen=!1,e.browseChannelsSearch="",await Qt()}function Z(){e.browseChannelsOpen=!1,e.browseChannelsList=[],e.browseChannelsError=null,e.browseChannelsSearch="",h()}function Jt(){const n=e.browseChannelsSearch.trim().toLowerCase();return n?e.browseChannelsList.filter(s=>(s.title||"").toLowerCase().includes(n)||(s.topic||"").toLowerCase().includes(n)):e.browseChannelsList}async function Xt(n){await a.service.joinChannel(n),Z(),await x(n)}function Zt(n){Z(),x(n)}function en(){o||R()}function tn(n){return n.members?.find(i=>i.user_id===a.currentUser.id)?.notification_level==="muted"}function nn(n){const s=n.id===e.selectedConversationId?" selected":"",i=tn(n)?" muted":"",u=n.unread_count?`<span class="chat-count${i?" muted":""}">${n.unread_count}</span>`:"",g=fe(n,a.currentUser.id),S=n.kind==="channel"?'<span class="chat-conversation-hash" aria-hidden="true">#</span>':n.kind==="group"?'<span class="chat-conversation-hash" aria-hidden="true"><i class="ti ti-lock"></i></span>':`<span class="chat-conversation-avatar" aria-hidden="true">${d((g||"?").slice(0,1).toUpperCase())}</span>`;return`
          <button type="button" class="chat-conversation${s}${i}" data-chat-select="${d(n.id)}">
            ${S}
            <span class="chat-conversation-title">${d(g)}</span>
            ${u}
          </button>
        `}function an(n){e.sidebarSectionsCollapsed={...e.sidebarSectionsCollapsed,[n]:!e.sidebarSectionsCollapsed[n]},h()}function sn(n){if(!n.conversations.length)return"";const s=!!e.sidebarSectionsCollapsed[n.kind],i=Ze(n.conversations);return`
          <div class="chat-sidebar-section">
            <button type="button" class="chat-sidebar-section-head" data-chat-sidebar-section-toggle="${n.kind}" aria-expanded="${!s}">
              <i class="ti ${s?"ti-chevron-right":"ti-chevron-down"}"></i>
              <span class="chat-sidebar-section-label">${d(ia[n.kind])}</span>
              ${i?`<span class="chat-count">${i}</span>`:""}
            </button>
            ${s?"":n.conversations.map(nn).join("")}
          </div>
        `}function rn(n){const s=e.conversations.find(S=>S.id===n.conversation_id),i=s?fe(s,a.currentUser.id):"Archived conversation",u=Ne(n.created_at),g=n.sender?.full_name||"Unknown";return`
          <button type="button" class="chat-search-result" data-chat-search-result="${d(n.conversation_id)}" data-chat-search-message="${d(n.id)}">
            <span class="chat-search-result-row">
              <span class="chat-search-result-title">${d(i)}</span>
              ${u?`<span class="chat-search-result-time">${d(u)}</span>`:""}
            </span>
            <span class="chat-search-result-snippet"><strong>${d(g)}:</strong> ${d(Yn(n))}</span>
          </button>
        `}function cn(){const n=e.searchQuery.trim();return`
          <div class="chat-search-panel">
            <div class="chat-search-input-row">
              <i class="ti ti-search"></i>
              <input data-chat-search-input type="search" placeholder="Search messages..." value="${d(e.searchQuery)}" autocomplete="off">
              <button type="button" data-chat-search-close aria-label="Close search"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-search-results">
              ${e.searchLoading?'<div class="chat-muted">Searching...</div>':""}
              ${e.searchError?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${d(e.searchError)}</span></div>`:""}
              ${!e.searchLoading&&!e.searchError&&n&&!e.searchResults.length?'<div class="chat-muted">No messages found.</div>':""}
              ${!e.searchLoading&&!n?`<div class="chat-muted">Type to search across every conversation you're in.</div>`:""}
              ${e.searchLoading?"":e.searchResults.map(rn).join("")}
            </div>
          </div>
        `}function Oe(){return["admin","manager"].includes(a.currentUser.role)}function on(n){if(!e.composeOpen)return"";const s=e.composeSearch.trim().toLowerCase(),i=n.filter(S=>!s||(S.full_name||"").toLowerCase().includes(s)),u=e.composeSelectedMemberIds.size,g=u===1?[...e.composeSelectedMemberIds][0]:"";return`
          <div class="chat-compose-popover" data-chat-compose-popover role="dialog" aria-label="New conversation">
            <div class="chat-compose-popover-head">
              <strong>New conversation</strong>
              <button type="button" class="chat-icon-btn" data-chat-compose-close aria-label="Close new conversation"><i class="ti ti-x"></i></button>
            </div>
            <input data-chat-compose-search type="search" placeholder="Search people..." value="${d(e.composeSearch)}" autocomplete="off">
            <div class="chat-compose-summary">${u} selected</div>
            <div class="chat-compose-list">
              ${i.map(S=>{const C=e.composeSelectedMemberIds.has(S.id)?" checked":"";return`
                  <label class="chat-compose-person">
                    <input type="checkbox" data-chat-compose-member="${d(S.id)}"${C}>
                    <span class="chat-compose-avatar">${d((S.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${d(S.full_name||"Unknown")}</strong>
                      <span>${d(V(S.role))}</span>
                    </span>
                  </label>
                `}).join("")}
              ${i.length?"":'<div class="chat-muted">No matching people.</div>'}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${d(g)}"${u===1&&!A(e.actionState,`start-dm:${g}`)?"":" disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              ${E(e.actionState,`start-dm:${g}`)?`<span class="chat-action-error">${d(E(e.actionState,`start-dm:${g}`))}</span>`:""}
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${d(e.composeGroupTitle)}">
                <button type="button" data-chat-create-group${e.composeGroupTitle.trim()&&!A(e.actionState,"create-group")?"":" disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
                ${E(e.actionState,"create-group")?`<span class="chat-action-error">${d(E(e.actionState,"create-group"))}</span>`:""}
              </div>
              ${Oe()?`
                <div class="chat-compose-group">
                  <input data-chat-channel-title type="text" placeholder="Channel name" value="${d(e.composeChannelTitle)}">
                  <button type="button" data-chat-create-channel${e.composeChannelTitle.trim()&&!A(e.actionState,"create-channel")?"":" disabled"}><i class="ti ti-hash"></i><span>Create channel</span></button>
                  ${E(e.actionState,"create-channel")?`<span class="chat-action-error">${d(E(e.actionState,"create-channel"))}</span>`:""}
                </div>
              `:""}
            </div>
          </div>
        `}function ln(){const n=Jt();return`
          <div class="chat-search-panel chat-channel-directory">
            <div class="chat-compose-popover-head">
              <strong>Browse channels</strong>
              <button type="button" class="chat-icon-btn" data-chat-browse-channels-close aria-label="Close browse channels"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-search-input-row">
              <i class="ti ti-search"></i>
              <input data-chat-browse-channels-search type="search" placeholder="Search channels..." value="${d(e.browseChannelsSearch)}" autocomplete="off">
            </div>
            <div class="chat-search-results">
              ${e.browseChannelsLoading?'<div class="chat-muted">Loading...</div>':""}
              ${e.browseChannelsError?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${d(e.browseChannelsError)}</span></div>`:""}
              ${!e.browseChannelsLoading&&!e.browseChannelsError&&!n.length?`<div class="chat-muted">${e.browseChannelsSearch.trim()?"No channels match your search.":"No channels exist yet."}</div>`:""}
              ${n.map(s=>{const i=s.id===e.selectedConversationId,u=A(e.actionState,`join-channel:${s.id}`),g=E(e.actionState,`join-channel:${s.id}`);return`
                  <div class="chat-channel-directory-row">
                    <div class="chat-channel-directory-info">
                      <span class="chat-search-result-title">#${d(s.title||"Untitled channel")}</span>
                      ${s.topic?`<span class="chat-channel-directory-topic">${d(s.topic)}</span>`:""}
                      <span class="chat-channel-directory-meta">
                        <i class="ti ti-users"></i> ${s.member_count}
                        ${s.creator_name?` &middot; created by ${d(s.creator_name)}`:""}
                      </span>
                    </div>
                    ${i?'<span class="chat-channel-directory-current">Current</span>':s.joined_by_current_user?`<button type="button" class="chat-member-add-toggle" data-chat-open-channel="${d(s.id)}">Open</button>`:`<button type="button" class="chat-member-add-toggle" data-chat-join-channel="${d(s.id)}"${u?" disabled":""}><i class="ti ti-plus"></i><span>Join</span></button>`}
                    ${g?`<span class="chat-action-error">${d(g)}</span>`:""}
                  </div>
                `}).join("")}
            </div>
          </div>
        `}function dn(n){if(e.mentionQuery===null||!n)return"";const s=F(n);if(!s.length)return"";const i=Math.min(e.mentionIndex,s.length-1);return`
          <div class="chat-compose-popover chat-mention-picker" data-chat-mention-picker role="listbox" aria-label="Mention someone">
            ${s.map((u,g)=>`
              <button
                type="button"
                class="chat-compose-person chat-mention-option${g===i?" active":""}"
                data-chat-mention-pick="${d(u.id)}"
                role="option"
                aria-selected="${g===i}"
              >
                <span class="chat-compose-avatar">${d((u.full_name||"?").slice(0,1))}</span>
                <span class="chat-compose-person-copy">
                  <strong>${d(u.full_name||"Unknown")}</strong>
                  <span>${d(V(u.role))}</span>
                </span>
              </button>
            `).join("")}
          </div>
        `}function un(n){const s=n.message?.attachments?.length||0;return`
          <button type="button" class="chat-search-result" data-chat-pinned-jump="${d(n.message_id)}">
            <span class="chat-search-result-row">
              <span class="chat-search-result-title">${d(n.message?.sender?.full_name||"Unknown")}</span>
              <span class="chat-search-result-time">${d(Ne(n.pinned_at))}</span>
            </span>
            <span class="chat-search-result-snippet">${d(ee(n.message||{}))}</span>
            <span class="chat-channel-directory-meta">
              ${s?`<i class="ti ti-paperclip"></i> ${s} &middot; `:""}pinned by ${d(n.pinner?.full_name||"Unknown")}
            </span>
          </button>
        `}function mn(){return e.pinnedMessagesPanelOpen?`
          <div class="chat-search-panel">
            <div class="chat-compose-popover-head">
              <strong>Pinned messages</strong>
              <button type="button" class="chat-icon-btn" data-chat-pinned-close aria-label="Close pinned messages"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-search-results">
              ${e.pinnedMessagesLoading?'<div class="chat-muted">Loading...</div>':""}
              ${e.pinnedMessagesError?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${d(e.pinnedMessagesError)}</span></div>`:""}
              ${!e.pinnedMessagesLoading&&!e.pinnedMessagesError&&!e.pinnedMessages.length?'<div class="chat-muted">No pinned messages yet.</div>':""}
              ${e.pinnedMessages.map(un).join("")}
            </div>
          </div>
        `:""}function hn(){if(e.pinnedMessagesPanelOpen||!e.pinnedMessages.length)return"";const n=e.pinnedMessages[0];return`
          <button type="button" class="chat-pinned-strip" data-chat-pinned-jump="${d(n.message_id)}">
            <i class="ti ti-pin"></i>
            <span class="chat-pinned-strip-count">${e.pinnedMessages.length} pinned</span>
            <span class="chat-pinned-strip-snippet">${d(ee(n.message||{}))}</span>
          </button>
        `}function pn(n){if(!e.membersOpen||!n||!["group","channel"].includes(n.kind))return"";const s=n.members.filter(_=>!_.left_at),i=Ae(n),u=new Set(s.map(_=>_.user_id)),g=e.memberSearch.trim().toLowerCase(),S=e.profiles.filter(_=>_.id!==a.currentUser.id&&!u.has(_.id)&&(!g||(_.full_name||"").toLowerCase().includes(g))),C=e.memberSelectedIds.size;return`
          <div class="chat-compose-popover chat-members-panel" data-chat-members-panel role="dialog" aria-label="Manage members">
            <div class="chat-compose-popover-head">
              <strong>Manage members</strong>
              <button type="button" class="chat-icon-btn" data-chat-members-close aria-label="Close member management"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-member-panel-list">
              ${s.map(_=>{const I=_.profile||{},k=_.user_id===a.currentUser.id,H=i||k;return`
                  <div class="chat-member-row" data-chat-member-row="${d(_.user_id)}">
                    <span class="chat-compose-avatar">${d((I.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${d(I.full_name||_.user_id)}</strong>
                      <span>${d(I.role?V(I.role):"Member")}</span>
                    </span>
                    ${_.membership_role==="owner"?'<span class="chat-owner-badge">Owner</span>':""}
                    ${i?`
                      <button type="button" class="chat-member-promote" data-chat-promote-member="${d(_.user_id)}" data-chat-role="${_.membership_role==="owner"?"member":"owner"}"${A(e.actionState,`set-role:${n.id}:${_.user_id}`)?" disabled":""}>
                        <i class="ti ${_.membership_role==="owner"?"ti-user-minus":"ti-shield-plus"}"></i><span>${_.membership_role==="owner"?"Remove owner":"Make owner"}</span>
                      </button>
                    `:""}
                    ${H?`
                      <button type="button" class="chat-member-remove" data-chat-remove-member="${d(_.user_id)}"${A(e.actionState,`remove-member:${n.id}:${_.user_id}`)?" disabled":""}>
                        <i class="ti ${k?"ti-logout":"ti-user-minus"}"></i><span>${k?"Leave":"Remove"}</span>
                      </button>
                    `:""}
                    ${E(e.actionState,`set-role:${n.id}:${_.user_id}`)||E(e.actionState,`remove-member:${n.id}:${_.user_id}`)?`
                      <span class="chat-action-error">${d(E(e.actionState,`set-role:${n.id}:${_.user_id}`)||E(e.actionState,`remove-member:${n.id}:${_.user_id}`))}</span>
                    `:""}
                  </div>
                `}).join("")}
            </div>
            ${i?`
              <div class="chat-member-add">
                <button type="button" class="chat-member-add-toggle" data-chat-member-add-toggle>
                  <i class="ti ti-user-plus"></i><span>Add member</span>
                </button>
                ${e.memberAddOpen?`
                  <input data-chat-member-search type="search" placeholder="Search people..." value="${d(e.memberSearch)}" autocomplete="off">
                  <div class="chat-compose-summary">${C} selected</div>
                  <div class="chat-compose-list">
                    ${S.map(_=>{const I=e.memberSelectedIds.has(_.id)?" checked":"";return`
                        <label class="chat-compose-person">
                          <input type="checkbox" data-chat-member-pick="${d(_.id)}"${I}>
                          <span class="chat-compose-avatar">${d((_.full_name||"?").slice(0,1))}</span>
                          <span class="chat-compose-person-copy">
                            <strong>${d(_.full_name||"Unknown")}</strong>
                            <span>${d(V(_.role))}</span>
                          </span>
                        </label>
                      `}).join("")}
                    ${S.length?"":'<div class="chat-muted">No matching people.</div>'}
                  </div>
                  <div class="chat-compose-actions">
                    <button type="button" data-chat-add-members="${d(n.id)}"${C&&!A(e.actionState,`add-members:${n.id}`)?"":" disabled"}><i class="ti ti-users-plus"></i><span>Add selected</span></button>
                    ${E(e.actionState,`add-members:${n.id}`)?`<span class="chat-action-error">${d(E(e.actionState,`add-members:${n.id}`))}</span>`:""}
                  </div>
                `:""}
              </div>
            `:""}
          </div>
        `}function ee(n){const s=n.deleted_at?"Message deleted":n.body||"";return s.length>90?`${s.slice(0,87)}...`:s}function fn(n){if(!n?.reply_to_id)return"";const s=e.messages.find(i=>i.id===n.reply_to_id);return s?`
          <div class="chat-quote">
            <strong>${d(s.sender?.full_name||"Unknown")}</strong>
            <span>${d(ee(s))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function gn(){const n=e.messages.find(s=>s.id===e.replyToMessageId);return n?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${d(n.sender?.full_name||"Unknown")}</strong>
              <span>${d(ee(n))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function vn(){return e.pendingAttachments.length?`
          <div class="chat-pending-attachments">
            ${e.pendingAttachments.map(n=>`
              <div class="chat-pending-attachment${n.status==="error"?" error":""}" data-chat-pending-attachment="${d(n.id)}">
                <i class="ti ${n.status==="error"?"ti-alert-triangle":Re(n.mime)?"ti-photo":Pe(n.mime)}"></i>
                <span class="chat-pending-attachment-name">${d(n.name)}</span>
                ${n.status==="uploading"?'<span class="chat-pending-attachment-status">Uploading…</span>':""}
                ${n.status==="error"?`<span class="chat-pending-attachment-status">${d(n.error||"Failed")}</span>`:""}
                <button type="button" data-chat-remove-pending="${d(n.id)}" aria-label="Remove attachment"><i class="ti ti-x"></i></button>
              </div>
            `).join("")}
          </div>
        `:""}function _n(n){const s=r.get(n.path),i=s&&s.expiresAt>Date.now()?s.url:null;return Re(n.mime)?i?`<a class="chat-attachment-image-link" href="${d(i)}" target="_blank" rel="noopener">
                 <img class="chat-attachment-image" src="${d(i)}" alt="${d(n.name)}">
               </a>`:'<div class="chat-attachment-image chat-attachment-image-loading"><i class="ti ti-photo"></i></div>':`
          <a class="chat-attachment-file" href="${i?d(i):"#"}" target="_blank" rel="noopener" data-chat-attachment-path="${d(n.path)}">
            <i class="ti ${Pe(n.mime)}"></i>
            <span class="chat-attachment-file-copy">
              <strong>${d(n.name)}</strong>
              <span>${d(ca(n.size))}</span>
            </span>
            <i class="ti ti-download"></i>
          </a>
        `}function bn(n){return n.attachments?.length?`<div class="chat-message-attachments">${n.attachments.map(_n).join("")}</div>`:""}async function yn(){const n=new Set;for(const i of e.messages)for(const u of i.attachments||[])n.add(u.path);let s=!1;for(const i of n){const u=r.get(i);if(!(u&&u.expiresAt>Date.now()||l.has(i))){l.add(i);try{const g=await a.service.getSignedAttachmentUrl(i);r.set(i,{url:g,expiresAt:Date.now()+3300*1e3}),s=!0}catch(g){console.error("Failed to sign chat attachment URL",g)}finally{l.delete(i)}}}s&&!o&&h()}function wn(n){const s=`edit-channel-details:${n.id}`,i=A(e.actionState,s),u=E(e.actionState,s);return`
          <form class="chat-channel-details-form" data-chat-channel-details-form>
            <input data-chat-channel-details-title type="text" value="${d(e.channelDetailsTitleDraft)}" placeholder="Channel name" maxlength="160"${i?" disabled":""}>
            <input data-chat-channel-details-topic type="text" value="${d(e.channelDetailsTopicDraft)}" placeholder="Topic (optional, shown under the name)" maxlength="160"${i?" disabled":""}>
            <textarea data-chat-channel-details-description placeholder="Description (optional)" maxlength="1000" rows="2"${i?" disabled":""}>${d(e.channelDetailsDescriptionDraft)}</textarea>
            <div class="chat-channel-details-actions">
              <button type="submit" aria-label="Save channel details"${i?" disabled":""}><i class="ti ti-check"></i><span>Save</span></button>
              <button type="button" data-chat-channel-details-cancel aria-label="Cancel"><i class="ti ti-x"></i></button>
            </div>
            ${u?`<span class="chat-action-error">${d(u)}</span>`:""}
          </form>
        `}function $n(n){const s=A(e.actionState,`edit-message:${n.id}`),i=E(e.actionState,`edit-message:${n.id}`);return`
          <form class="chat-edit-form" data-chat-edit-form="${d(n.id)}">
            <input data-chat-edit-input="${d(n.id)}" type="text" value="${d(e.editDraft)}"${s?" disabled":""}>
            <button type="submit" aria-label="Save edit"${s?" disabled":""}><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
            ${i?`<span class="chat-action-error">${d(i)}</span>`:""}
          </form>
        `}function Sn(n){const s=d(n.body),i=e.conversations.find(_=>_.id===n.conversation_id)||e.conversations.find(_=>_.id===e.selectedConversationId)||null,u=y(i),g=aa(n.body,u);if(!g.length)return s;const S=new Set(u.filter(_=>_.id===a.currentUser.id).map(_=>String(_.full_name)));let C=s;for(const _ of g){const I=`@${d(_)}`,k=S.has(_)?"chat-mention chat-mention-self":"chat-mention";C=C.split(I).join(`<span class="${k}">${I}</span>`)}return C}function Cn(n,s=!0){const i=n.sender_id===a.currentUser.id?" mine":"",u=!!n.deleted_at,g=i&&!u,S=!u&&(i||Oe()),C=De(n.id),_=A(e.actionState,`pin-message:${n.id}`)||A(e.actionState,`unpin-message:${n.id}`),I=E(e.actionState,`pin-message:${n.id}`)||E(e.actionState,`unpin-message:${n.id}`),k=n.edited_at&&!u?'<span class="chat-edited">(edited)</span>':"",H=u?"":`
            <button type="button" data-chat-reply="${d(n.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            <button type="button" class="chat-message-pin-btn${C?" pinned":""}" data-chat-toggle-pin="${d(n.id)}" aria-label="${C?"Unpin message":"Pin message"}" title="${C?"Unpin message":"Pin message"}"${_?" disabled":""}><i class="ti ${C?"ti-pinned":"ti-pin"}"></i></button>
            ${g?`<button type="button" data-chat-edit="${d(n.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
            ${S?`<button type="button" data-chat-delete="${d(n.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>`:""}
        `,te=u?"":`
          <div class="chat-message-actions" aria-label="Message actions">
            ${H}
          </div>
          <button type="button" class="chat-message-menu-btn" data-chat-message-menu="${d(n.id)}" aria-label="Message actions"><i class="ti ti-dots"></i></button>
          ${e.openMessageMenuId===n.id?`
            <div class="chat-message-menu" data-chat-message-menu-panel="${d(n.id)}">
              ${H}
            </div>
          `:""}
          ${e.confirmingDeleteMessageId===n.id?`
            <div class="chat-delete-confirm">
              <span>Delete message?</span>
              <button type="button" data-chat-confirm-delete="${d(n.id)}"${A(e.actionState,`delete-message:${n.id}`)?" disabled":""}>Confirm</button>
              <button type="button" data-chat-cancel-delete="${d(n.id)}">Cancel</button>
              ${E(e.actionState,`delete-message:${n.id}`)?`<span class="chat-action-error">${d(E(e.actionState,`delete-message:${n.id}`))}</span>`:""}
            </div>
          `:""}
          ${e.unpinConfirmMessageId===n.id?`
            <div class="chat-delete-confirm">
              <span>Unpin this message? ${d(Le(n.id)?.pinner?.full_name||"Someone else")} pinned it.</span>
              <button type="button" data-chat-confirm-unpin="${d(n.id)}"${_?" disabled":""}>Confirm</button>
              <button type="button" data-chat-cancel-unpin="${d(n.id)}">Cancel</button>
            </div>
          `:""}
          ${I?`<span class="chat-action-error">${d(I)}</span>`:""}
        `;return`
          <div class="chat-message${i}${u?" deleted":""}${s?"":" chat-message-grouped"}" tabindex="0" data-chat-message-id="${d(n.id)}">
            ${s?`
              <div class="chat-message-meta">
                <span>${d(n.sender?.full_name||"Unknown")}</span>
                <span>#${n.message_seq} ${k}</span>
              </div>
            `:""}
            ${fn(n)}
            ${e.editingMessageId===n.id?$n(n):`
              ${n.body.trim()?`<div class="chat-message-body">${u?d("Message deleted"):Sn(n)}</div>`:""}
              ${u?"":bn(n)}
            `}
            ${te}
          </div>
        `}function h(){const n=v||O();v=!1;const s=e.conversations.find(c=>c.id===e.selectedConversationId)||null,i=e.profiles.filter(c=>c.id!==a.currentUser.id),g=s?.members.find(c=>c.user_id===a.currentUser.id)?.notification_level==="muted",S=s?.members.filter(c=>!c.left_at)||[],C=s?Ae(s):!1,_=s?$t(s):!1;t.innerHTML=`
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <div class="chat-sidebar-tools">
                  <span class="chat-user-pill">${d(V(a.currentUser.role))}</span>
                  <button type="button" class="chat-icon-btn${e.browseChannelsOpen?" active":""}" data-chat-browse-channels-toggle aria-label="Browse channels" title="Browse channels"><i class="ti ti-hash"></i></button>
                  <button type="button" class="chat-icon-btn" data-chat-compose-toggle aria-label="New conversation" title="New conversation"><i class="ti ti-pencil-plus"></i></button>
                </div>
              </div>
              ${e.searchOpen?cn():e.browseChannelsOpen?ln():`
                ${on(i)}
                <div class="chat-conversation-list">
                  ${e.loading?'<div class="chat-muted">Loading...</div>':""}
                  ${Gn(e.conversations).map(sn).join("")}
                  ${!e.loading&&!e.conversations.length?'<div class="chat-muted">No conversations yet.</div>':""}
                </div>
              `}
            </aside>
            <main class="chat-thread">
              ${e.error?`<div class="chat-error"><i class="ti ti-alert-triangle"></i><span>${d(e.error)}</span></div>`:""}
              ${s?`
                <header class="chat-thread-head">
                  <button type="button" class="chat-back-btn" data-chat-back aria-label="Back to conversations"><i class="ti ti-arrow-left"></i></button>
                  <div>
                    <div class="chat-eyebrow">${s.kind==="dm"?"Direct message":s.kind==="channel"?"Channel":"Group"}</div>
                    ${s.kind==="channel"&&e.channelDetailsOpen?wn(s):s.kind!=="channel"&&e.renameOpen?`
                      <form class="chat-rename-form" data-chat-rename-form>
                        <input data-chat-rename-input type="text" value="${d(e.renameDraft)}" placeholder="Group name"${A(e.actionState,`rename:${s.id}`)?" disabled":""}>
                        <button type="submit" aria-label="Save name"${A(e.actionState,`rename:${s.id}`)?" disabled":""}><i class="ti ti-check"></i></button>
                        <button type="button" data-chat-rename-cancel aria-label="Cancel rename"><i class="ti ti-x"></i></button>
                        ${E(e.actionState,`rename:${s.id}`)?`<span class="chat-action-error">${d(E(e.actionState,`rename:${s.id}`))}</span>`:""}
                      </form>
                    `:`
                      <h2>${d(fe(s,a.currentUser.id))}</h2>
                      ${s.kind==="channel"&&s.topic?`<p class="chat-channel-topic">${d(s.topic)}</p>`:""}
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
                  ${pn(s)}
                  ${mn()}
                  ${e.archiveConfirmOpen?`
                    <div class="chat-delete-confirm chat-archive-confirm">
                      <span>Archive this ${s.kind==="channel"?"channel":s.kind==="group"?"group":"conversation"}?</span>
                      <button type="button" data-chat-confirm-archive${A(e.actionState,`archive:${s.id}`)?" disabled":""}>Confirm</button>
                      <button type="button" data-chat-cancel-archive>Cancel</button>
                      ${E(e.actionState,`archive:${s.id}`)?`<span class="chat-action-error">${d(E(e.actionState,`archive:${s.id}`))}</span>`:""}
                    </div>
                  `:""}
                  ${e.leaveChannelConfirmOpen?`
                    <div class="chat-delete-confirm chat-archive-confirm">
                      <span>Leave #${d(s.title||"this channel")}? You can rejoin any time from Browse Channels.</span>
                      <button type="button" data-chat-confirm-leave-channel${A(e.actionState,`leave-channel:${s.id}`)?" disabled":""}>Confirm</button>
                      <button type="button" data-chat-cancel-leave-channel>Cancel</button>
                      ${E(e.actionState,`leave-channel:${s.id}`)?`<span class="chat-action-error">${d(E(e.actionState,`leave-channel:${s.id}`))}</span>`:""}
                    </div>
                  `:""}
                </header>
                ${hn()}
                <div class="chat-message-list">
                  ${e.messages.map((c,p)=>Cn(c,la(c,e.messages[p-1]))).join("")}
                  ${e.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                ${E(e.actionState,`send-message:${s.id}`)?`<div class="chat-action-error chat-send-error"><i class="ti ti-alert-triangle"></i><span>${d(E(e.actionState,`send-message:${s.id}`))}</span></div>`:""}
                <form class="chat-composer" data-chat-send-form>
                  ${gn()}
                  ${vn()}
                  ${dn(s)}
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
        `,t.querySelectorAll("[data-chat-select]").forEach(c=>{c.addEventListener("click",()=>x(c.dataset.chatSelect))}),t.querySelectorAll("[data-chat-sidebar-section-toggle]").forEach(c=>{c.addEventListener("click",()=>an(c.dataset.chatSidebarSectionToggle))}),t.querySelector("[data-chat-back]")?.addEventListener("click",()=>ue()),t.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{s&&f(`toggle-mute:${s.id}`,()=>qt(s))}),t.querySelector("[data-chat-members-toggle]")?.addEventListener("click",()=>{s&&(e.membersOpen?X():St())}),t.querySelector("[data-chat-members-close]")?.addEventListener("click",()=>X({reset:!0})),t.querySelector("[data-chat-rename-toggle]")?.addEventListener("click",()=>{s&&(s.kind==="channel"?jt(s):At(s))}),t.querySelector("[data-chat-rename-cancel]")?.addEventListener("click",()=>Ot()),t.querySelector("[data-chat-rename-form]")?.addEventListener("submit",c=>{c.preventDefault(),s&&f(`rename:${s.id}`,()=>Rt(s,e.renameDraft))}),t.querySelector("[data-chat-channel-details-title]")?.addEventListener("input",c=>{e.channelDetailsTitleDraft=c.currentTarget.value}),t.querySelector("[data-chat-channel-details-topic]")?.addEventListener("input",c=>{e.channelDetailsTopicDraft=c.currentTarget.value}),t.querySelector("[data-chat-channel-details-description]")?.addEventListener("input",c=>{e.channelDetailsDescriptionDraft=c.currentTarget.value}),t.querySelector("[data-chat-channel-details-cancel]")?.addEventListener("click",()=>Bt()),t.querySelector("[data-chat-channel-details-form]")?.addEventListener("submit",c=>{c.preventDefault(),s&&f(`edit-channel-details:${s.id}`,()=>Ft(s))}),t.querySelector("[data-chat-leave-channel-toggle]")?.addEventListener("click",()=>xt()),t.querySelector("[data-chat-confirm-leave-channel]")?.addEventListener("click",()=>{s&&f(`leave-channel:${s.id}`,()=>Wt(s))}),t.querySelector("[data-chat-cancel-leave-channel]")?.addEventListener("click",()=>Ht()),t.querySelector("[data-chat-rename-input]")?.addEventListener("input",c=>{e.renameDraft=c.currentTarget.value}),t.querySelector("[data-chat-archive-toggle]")?.addEventListener("click",()=>Pt()),t.querySelector("[data-chat-confirm-archive]")?.addEventListener("click",()=>{s&&f(`archive:${s.id}`,()=>Ut(s,!0))}),t.querySelector("[data-chat-cancel-archive]")?.addEventListener("click",()=>Nt()),t.querySelector("[data-chat-member-add-toggle]")?.addEventListener("click",()=>Ct()),t.querySelector("[data-chat-member-search]")?.addEventListener("input",c=>{e.memberSearch=c.currentTarget.value,h();const p=t.querySelector("[data-chat-member-search]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),t.querySelectorAll("[data-chat-member-pick]").forEach(c=>{c.addEventListener("change",()=>kt(c.dataset.chatMemberPick,c.checked))}),t.querySelector("[data-chat-add-members]")?.addEventListener("click",c=>{const p=c.currentTarget.dataset.chatAddMembers;f(`add-members:${p}`,()=>Et(p))}),t.querySelectorAll("[data-chat-remove-member]").forEach(c=>{c.addEventListener("click",()=>{if(!s)return;const p=c.dataset.chatRemoveMember;f(`remove-member:${s.id}:${p}`,()=>Mt(s.id,p))})}),t.querySelectorAll("[data-chat-promote-member]").forEach(c=>{c.addEventListener("click",()=>{if(!s)return;const p=c.dataset.chatPromoteMember,T=c.dataset.chatRole;f(`set-role:${s.id}:${p}`,()=>zt(s.id,p,T))})}),t.querySelector("[data-chat-pinned-toggle]")?.addEventListener("click",()=>Ie()),t.querySelector("[data-chat-pinned-close]")?.addEventListener("click",()=>Ie()),t.querySelectorAll("[data-chat-pinned-jump]").forEach(c=>{c.addEventListener("click",()=>ut(c.dataset.chatPinnedJump))}),t.querySelector("[data-chat-search-toggle]")?.addEventListener("click",()=>{e.searchOpen?he():vt()}),t.querySelector("[data-chat-search-close]")?.addEventListener("click",()=>he()),t.querySelector("[data-chat-search-input]")?.addEventListener("input",c=>{bt(c.currentTarget.value),h();const p=t.querySelector("[data-chat-search-input]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),t.querySelectorAll("[data-chat-search-result]").forEach(c=>{c.addEventListener("click",()=>{yt(c.dataset.chatSearchResult,c.dataset.chatSearchMessage)})}),t.querySelector("[data-chat-browse-channels-toggle]")?.addEventListener("click",()=>{e.browseChannelsOpen?Z():Kt()}),t.querySelector("[data-chat-browse-channels-close]")?.addEventListener("click",()=>Z()),t.querySelector("[data-chat-browse-channels-search]")?.addEventListener("input",c=>{e.browseChannelsSearch=c.currentTarget.value,h();const p=t.querySelector("[data-chat-browse-channels-search]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),t.querySelectorAll("[data-chat-join-channel]").forEach(c=>{c.addEventListener("click",()=>{const p=c.dataset.chatJoinChannel;f(`join-channel:${p}`,()=>Xt(p))})}),t.querySelectorAll("[data-chat-open-channel]").forEach(c=>{c.addEventListener("click",()=>Zt(c.dataset.chatOpenChannel))}),t.querySelector("[data-chat-channel-title]")?.addEventListener("input",c=>{e.composeChannelTitle=c.currentTarget.value,h();const p=t.querySelector("[data-chat-channel-title]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),t.querySelector("[data-chat-create-channel]")?.addEventListener("click",()=>{f("create-channel",()=>Yt(e.composeChannelTitle))}),t.querySelector("[data-chat-compose-toggle]")?.addEventListener("click",()=>{e.composeOpen?J():gt()}),t.querySelector("[data-chat-compose-close]")?.addEventListener("click",()=>J()),t.querySelector("[data-chat-compose-search]")?.addEventListener("input",c=>{e.composeSearch=c.currentTarget.value,h();const p=t.querySelector("[data-chat-compose-search]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),t.querySelectorAll("[data-chat-compose-member]").forEach(c=>{c.addEventListener("change",()=>wt(c.dataset.chatComposeMember,c.checked))}),t.querySelector("[data-chat-group-title]")?.addEventListener("input",c=>{e.composeGroupTitle=c.currentTarget.value,h();const p=t.querySelector("[data-chat-group-title]");p?.focus(),p?.setSelectionRange?.(p.value.length,p.value.length)}),t.querySelector("[data-chat-start-dm]")?.addEventListener("click",c=>{const p=c.currentTarget.dataset.chatStartDm;f(`start-dm:${p}`,()=>Gt(p))}),t.querySelector("[data-chat-create-group]")?.addEventListener("click",()=>{f("create-group",()=>Vt(e.composeGroupTitle,[...e.composeSelectedMemberIds]))});const I=t.querySelector("[data-chat-send-form]");I?.addEventListener("submit",c=>{c.preventDefault();const p=e.selectedConversationId,T=c.currentTarget;f(`send-message:${p}`,()=>ht(T))});const k=t.querySelector("[data-chat-composer]");k?.addEventListener("input",()=>{if(L(k),!de(k))return;const{value:c,selectionStart:p}=k;h();const T=t.querySelector("[data-chat-composer]");T&&(T.value=c,L(T),T.focus(),T.setSelectionRange?.(p,p))}),k?.addEventListener("keydown",c=>{if(e.mentionQuery!==null&&s){const p=F(s);if(p.length){if(c.key==="ArrowDown"){c.preventDefault(),ke(s,1);return}if(c.key==="ArrowUp"){c.preventDefault(),ke(s,-1);return}if(c.key==="Enter"||c.key==="Tab"){c.preventDefault(),Ce(s,p[Math.min(e.mentionIndex,p.length-1)]);return}}if(c.key==="Escape"){c.preventDefault(),G();return}}c.key==="Enter"&&!c.shiftKey&&(c.preventDefault(),I?.requestSubmit())}),t.querySelectorAll("[data-chat-mention-pick]").forEach(c=>{c.addEventListener("mousedown",p=>{p.preventDefault();const T=y(s).find(pe=>pe.id===c.dataset.chatMentionPick);T&&Ce(s,T)})}),t.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>ft()),t.querySelectorAll("[data-chat-reply]").forEach(c=>{c.addEventListener("click",()=>pt(c.dataset.chatReply))}),t.querySelectorAll("[data-chat-toggle-pin]").forEach(c=>{c.addEventListener("click",()=>{const p=c.dataset.chatTogglePin,T=e.selectedConversationId;T&&(De(p)?lt(T,p):f(`pin-message:${p}`,()=>ot(T,p)))})}),t.querySelectorAll("[data-chat-confirm-unpin]").forEach(c=>{c.addEventListener("click",()=>{const p=c.dataset.chatConfirmUnpin,T=e.selectedConversationId;T&&f(`unpin-message:${p}`,()=>Te(T,p))})}),t.querySelectorAll("[data-chat-cancel-unpin]").forEach(c=>{c.addEventListener("click",()=>dt())}),t.querySelectorAll("[data-chat-edit]").forEach(c=>{c.addEventListener("click",()=>Dt(c.dataset.chatEdit))}),t.querySelectorAll("[data-chat-delete]").forEach(c=>{c.addEventListener("click",()=>{e.confirmingDeleteMessageId=c.dataset.chatDelete,e.openMessageMenuId=null,h()})}),t.querySelectorAll("[data-chat-message-menu]").forEach(c=>{c.addEventListener("click",()=>{e.openMessageMenuId=e.openMessageMenuId===c.dataset.chatMessageMenu?null:c.dataset.chatMessageMenu,e.confirmingDeleteMessageId=null,h()})}),t.querySelectorAll("[data-chat-confirm-delete]").forEach(c=>{c.addEventListener("click",()=>{const p=c.dataset.chatConfirmDelete;f(`delete-message:${p}`,()=>It(p))})}),t.querySelectorAll("[data-chat-cancel-delete]").forEach(c=>{c.addEventListener("click",()=>{e.confirmingDeleteMessageId===c.dataset.chatCancelDelete&&(e.confirmingDeleteMessageId=null),h()})}),t.querySelectorAll("[data-chat-edit-form]").forEach(c=>{c.addEventListener("submit",p=>{p.preventDefault();const T=p.currentTarget,pe=T.dataset.chatEditForm;f(`edit-message:${pe}`,()=>Tt(T))})}),t.querySelectorAll("[data-chat-cancel-edit]").forEach(c=>{c.addEventListener("click",()=>Lt())});const H=t.querySelector("[data-chat-file-input]");t.querySelector("[data-chat-attach-toggle]")?.addEventListener("click",()=>H?.click()),H?.addEventListener("change",c=>{me(c.currentTarget.files),c.currentTarget.value=""}),t.querySelectorAll("[data-chat-remove-pending]").forEach(c=>{c.addEventListener("click",()=>mt(c.dataset.chatRemovePending))});const te=t.querySelector("[data-chat-send-form]");te?.addEventListener("dragover",c=>c.preventDefault()),te?.addEventListener("drop",c=>{c.preventDefault(),c.dataTransfer?.files?.length&&me(c.dataTransfer.files)}),k?.addEventListener("paste",c=>{const p=[...c.clipboardData?.files||[]];p.length&&me(p)}),n&&b(),yn()}return R(),M=setInterval(()=>R(),3e4),typeof a.service.subscribeToConversationEvents=="function"&&(w=a.service.subscribeToConversationEvents(()=>en())),()=>{o=!0,M&&clearInterval(M),$&&clearTimeout($),w&&w(),t.removeEventListener?.("click",Ee),typeof document<"u"&&(document.removeEventListener("keydown",Me),document.body?.classList.remove("wein-chat-root")),t.classList.remove("wein-chat-root"),t.classList.remove("chat-has-selection"),t.innerHTML=""}}}}const Ue="chat-attachments",je=5;function tt(t){return String(t||"file").replace(/[^a-zA-Z0-9._-]+/g,"_")}function ua(t,a){const e=`${Date.now().toString(36)}-${Math.random().toString(16).slice(2,8)}`;return`${t}/${e}-${tt(a)}`}function ma(t){return String(t).replace(/[\\%_]/g,a=>`\\${a}`)}function B(t,a){if(t.error)throw new Error(`${a}: ${t.error.message||t.error}`);return t.data||[]}function N(t,a){if(t.error)throw new Error(`${a}: ${t.error.message||t.error}`);return t.data}function le(t){return t?{id:t.id,full_name:t.full_name,role:t.role,email:t.email??null}:null}function ha(t){return{conversation_id:t.conversation_id,user_id:t.user_id,membership_role:t.membership_role,joined_at:t.joined_at,left_at:t.left_at,last_read_seq:Number(t.last_read_seq||0),notification_level:t.notification_level,profile:le(t.profile||t.profiles)}}function W(t){return{id:t.id,conversation_id:t.conversation_id,message_seq:Number(t.message_seq||0),sender_id:t.sender_id,body:t.body,reply_to_id:t.reply_to_id,client_nonce:t.client_nonce,created_at:t.created_at,edited_at:t.edited_at,deleted_at:t.deleted_at,mentioned_user_ids:t.mentioned_user_ids||[],attachments:t.attachments||[],sender:le(t.sender||t.profiles)}}function pa(t){return{id:t.id,conversation_id:t.conversation_id,message_id:t.message_id,pinned_by:t.pinned_by,pinned_at:t.pinned_at,pinner:le(t.pinner),message:W(t.message)}}function Be(t,a){const e=(t.members||t.wein_chat_members||[]).map(ha),r=t.last_message||t.wein_chat_messages||[],l=Array.isArray(r)?r.find(f=>f.deleted_at==null):null,o=l?W(l):null,m={id:t.id,kind:t.kind,title:t.title,created_by:t.created_by,created_at:t.created_at,archived_at:t.archived_at,members:e,last_message:o,unread_count:0};return m.unread_count=Hn(m,a),m}function nt({supabase:t,currentUserId:a}){if(!t)throw new Error("supabase client is required");if(!a)throw new Error("currentUserId is required");async function e(r){const l=await t.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",r).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(je,{referencedTable:"wein_chat_messages"}).single();if(l.error)throw new Error(`fetch conversation: ${l.error.message||l.error}`);return Be(l.data,a)}return{async listProfiles(){const r=await t.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return B(r,"list profiles").map(le)},async listConversations(){const r=await t.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(je,{referencedTable:"wein_chat_messages"});return B(r,"list conversations").map(l=>Be(l,a))},async listMessages(r){const l=await t.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",r).is("deleted_at",null).order("message_seq",{ascending:!0});return B(l,"list messages").map(W)},async searchMessages(r){const l=(r||"").trim();if(!l)return[];const o=await t.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).is("deleted_at",null).ilike("body",`%${ma(l)}%`).order("created_at",{ascending:!1}).limit(50);return B(o,"search messages").map(W)},async createGroup(r,l=[]){const o=N(await t.rpc("wein_chat_create_group",{p_title:r}),"create group");for(const m of l)await this.addMember(o,m);return o},async createChannel(r){return N(await t.rpc("wein_chat_create_channel",{p_title:r}),"create channel")},async joinChannel(r){N(await t.rpc("wein_chat_join_channel",{p_conversation_id:r}),"join channel")},async listChannels(){const r=await t.from("wein_chat_conversations").select("id, kind, title, topic, description, created_by, creator_name, created_at, archived_at, member_count, joined_by_current_user").eq("kind","channel").is("archived_at",null).order("title",{ascending:!0});return B(r,"list channels").map(Vn)},async updateChannelDetails(r,{title:l,topic:o,description:m}){N(await t.rpc("wein_chat_update_channel_details",{p_conversation_id:r,p_title:l,p_topic:o??null,p_description:m??null}),"update channel details")},async leaveChannel(r){N(await t.rpc("wein_chat_remove_member",{p_conversation_id:r,p_user_id:a}),"leave channel")},async getOrCreateDm(r){return N(await t.rpc("wein_chat_get_or_create_dm",{p_other_user_id:r}),"get or create DM")},async addMember(r,l){N(await t.rpc("wein_chat_add_member",{p_conversation_id:r,p_user_id:l}),"add member")},async removeMember(r,l){N(await t.rpc("wein_chat_remove_member",{p_conversation_id:r,p_user_id:l}),"remove member")},async renameConversation(r,l){const o=(l||"").trim();if(!o)throw new Error("Group title is required");const m=await t.from("wein_chat_conversations").update({title:o}).eq("id",r).select("id, title");if(!B(m,"rename conversation").length)throw new Error("rename conversation affected zero rows")},async setConversationArchived(r,l){const o=await t.from("wein_chat_conversations").update({archived_at:l?new Date().toISOString():null}).eq("id",r).select("id, archived_at");if(!B(o,"set conversation archived").length)throw new Error("set conversation archived affected zero rows")},async setMembershipRole(r,l,o){N(await t.rpc("wein_chat_set_membership_role",{p_conversation_id:r,p_user_id:l,p_role:o}),"set membership role")},async uploadAttachment(r,l){const o=ua(r,l.name),m=await t.storage.from(Ue).upload(o,l,{contentType:l.type||"application/octet-stream",upsert:!1});if(m.error)throw new Error(`upload attachment: ${m.error.message||m.error}`);return{path:o,name:l.name||tt(l.name),mime:l.type||"application/octet-stream",size:l.size||0}},async getSignedAttachmentUrl(r,l=3600){const o=await t.storage.from(Ue).createSignedUrl(r,l);if(o.error)throw new Error(`sign attachment url: ${o.error.message||o.error}`);const m=o.data?.signedUrl;if(!m)throw new Error("sign attachment url: no signed URL returned");return m},async sendMessage({conversationId:r,body:l,clientNonce:o,replyToId:m=null,mentionedUserIds:f=[],attachments:M=[]}){const w=await t.from("wein_chat_messages").insert({conversation_id:r,sender_id:a,body:l,client_nonce:o,reply_to_id:m,mentioned_user_ids:f.length?f:null,attachments:M}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(w.error)throw new Error(`send message: ${w.error.message||w.error}`);return W(w.data)},async updateMessage(r,l,o=[]){const m=await t.from("wein_chat_messages").update({body:l,edited_at:new Date().toISOString(),mentioned_user_ids:o.length?o:null}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(m.error)throw new Error(`update message: ${m.error.message||m.error}`);return W(m.data)},async deleteMessage(r){const l=await t.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(l.error)throw new Error(`delete message: ${l.error.message||l.error}`);return W(l.data)},async listPinnedMessages(r){const l=await t.from("wein_chat_pinned_messages").select(`
          id, conversation_id, message_id, pinned_by, pinned_at,
          pinner:profiles!pinned_by(id, full_name, role, email),
          message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
            sender:profiles(id, full_name, role, email)
          )
        `).eq("conversation_id",r).order("pinned_at",{ascending:!1});return B(l,"list pinned messages").filter(o=>o.message?.deleted_at==null).map(pa)},async pinMessage(r,l){return N(await t.rpc("wein_chat_pin_message",{p_conversation_id:r,p_message_id:l}),"pin message")},async unpinMessage(r,l){N(await t.rpc("wein_chat_unpin_message",{p_conversation_id:r,p_message_id:l}),"unpin message")},async markRead(r,l){const o=await t.from("wein_chat_members").update({last_read_seq:l}).eq("conversation_id",r).eq("user_id",a).select("conversation_id, user_id, last_read_seq");if(!B(o,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(r,l){const o=await t.from("wein_chat_members").update({notification_level:l}).eq("conversation_id",r).eq("user_id",a).select("conversation_id, user_id, notification_level");if(!B(o,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(r){if(typeof t.channel!="function")return()=>{};const l=t.channel(`wein-chat:${a}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},r).subscribe();return()=>{typeof t.removeChannel=="function"?t.removeChannel(l):typeof l.unsubscribe=="function"&&l.unsubscribe()}},fetchConversation:e}}function fa(t){return typeof t.session.user=="object"&&t.session.user!==null?t.session.user:{}}function ga(t){const a=fa(t),e=a.id;if(!e)throw new Error("Team chat requires an authenticated user id.");return{id:e,full_name:t.session.fullName||a.email||"Portal user",role:t.session.role||"team",email:a.email||null}}let ve=null;function va(t){ve=t||null}function _a(){const t=da();oe({id:"team-chat",mount(a,e){const r=ve;ve=null;const l=ga(e),o=nt({supabase:e.session.client,currentUserId:l.id});return t.mount(a,{currentUser:l,service:o,initialConversationId:r})}})}function ba(t,a={}){return t?t.author_id&&a[t.author_id]?.full_name?a[t.author_id].full_name:t.author_name||"Unknown":"Unknown"}function at(t){return!!t?.resolved_at}function ya(t=[]){const a=new Map,e=[];t.forEach(o=>{a.set(o.id,{...o,replies:[]})}),a.forEach(o=>{o.reply_to_id&&a.has(o.reply_to_id)?a.get(o.reply_to_id).replies.push(o):e.push(o)});const r=(o,m)=>String(o.created_at||"").localeCompare(String(m.created_at||"")),l=o=>{o.replies.sort(r),o.replies.forEach(l)};return e.sort(r),e.forEach(l),e}function wa(t=[]){return t.filter(a=>!at(a)).length}function Fe(t,a=90){const e=String(t?.body||"").replace(/\s+/g," ").trim();return e.length<=a?e:`${e.slice(0,Math.max(0,a-1)).trimEnd()}…`}function P(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function xe(t={}){return t.taskId?"Task discussion":t.providerId?"Provider discussion":t.offerId?"Offer discussion":"Record discussion"}function $a(t={}){return t.taskId?`Task ${t.taskId}`:t.providerId?`Provider ${t.providerId}`:t.offerId?`Offer ${t.offerId}`:"No record scope"}function Sa(){return{id:"record-discussion",mount(t,a){const e={comments:[],peopleById:Object.fromEntries((a.people||[]).map(b=>[b.id,b])),loading:!0,error:null,replyToId:null,taskSourceCommentId:null};let r=!1,l=null,o=null;t.classList.add("wein-discussion-root");async function m(){try{e.error=null,e.comments=await a.service.listComments(a.scope||{})}catch(b){e.error=b.message||String(b)}finally{e.loading=!1,r||O()}}async function f(b){const L=b.querySelector("[data-discussion-body]"),y=L.value.trim();y&&(L.value="",await a.service.postComment({...a.scope||{},body:y,replyToId:e.replyToId,people:a.people||[]}),e.replyToId=null,await m())}async function M(b){const L=t.querySelector(`[data-resolve-note="${CSS.escape(b)}"]`)?.value||"";await a.service.resolveComment(b,L),await m()}async function w(b){await a.service.reopenComment(b),await m()}async function v(b){const L=b.querySelector("[data-task-title]"),y=L.value.trim();!y||!e.taskSourceCommentId||(await a.service.createTaskFromComment(e.taskSourceCommentId,y,a.currentUser?.id||null),L.value="",e.taskSourceCommentId=null,await m())}function $(b,L=0){const y=at(b),F=ba(b,e.peopleById);return`
          <article class="discussion-comment${y?" resolved":""}" style="--depth:${Math.min(L,4)}">
            <div class="discussion-comment-meta">
              <span>${P(F)}</span>
              <span>${P(b.created_at||"")}</span>
              ${y?'<span class="discussion-resolved-pill">Resolved</span>':""}
            </div>
            <div class="discussion-comment-body">${P(b.body)}</div>
            ${b.resolved_note?`<div class="discussion-resolved-note">${P(b.resolved_note)}</div>`:""}
            <div class="discussion-actions">
              <button type="button" data-discussion-reply="${P(b.id)}">Reply</button>
              ${y?`<button type="button" data-discussion-reopen="${P(b.id)}">Reopen</button>`:`<button type="button" data-discussion-resolve="${P(b.id)}">Resolve</button>`}
              <button type="button" data-discussion-task="${P(b.id)}">Create task</button>
            </div>
            ${y?"":`<input class="discussion-resolve-note" data-resolve-note="${P(b.id)}" placeholder="Optional resolve note">`}
            ${b.replies?.length?`<div class="discussion-replies">${b.replies.map(G=>$(G,L+1)).join("")}</div>`:""}
          </article>
        `}function D(){if(!e.taskSourceCommentId)return"";const b=e.comments.find(L=>L.id===e.taskSourceCommentId);return`
          <form class="discussion-task-box" data-discussion-task-form>
            <div>
              <div class="discussion-eyebrow">Create task from comment</div>
              <p>${P(Fe(b))}</p>
            </div>
            <input data-task-title type="text" placeholder="Task title">
            <div class="discussion-task-actions">
              <button type="submit">Create task</button>
              <button type="button" data-discussion-task-cancel>Cancel</button>
            </div>
          </form>
        `}function O(){const b=ya(e.comments),L=e.replyToId?e.comments.find(y=>y.id===e.replyToId):null;t.innerHTML=`
          <section class="discussion-shell" aria-label="${P(xe(a.scope))}">
            <header class="discussion-header">
              <div>
                <div class="discussion-eyebrow">${P(xe(a.scope))}</div>
                <h2>Discussion</h2>
                <p>${P($a(a.scope))}</p>
              </div>
              <span class="discussion-count">${wa(e.comments)} unresolved</span>
            </header>
            ${e.error?`<div class="discussion-error">${P(e.error)}</div>`:""}
            ${D()}
            <div class="discussion-list">
              ${e.loading?'<div class="discussion-muted">Loading discussion...</div>':""}
              ${b.map(y=>$(y)).join("")}
              ${!e.loading&&!b.length?'<div class="discussion-muted">No comments yet.</div>':""}
            </div>
            <form class="discussion-composer" data-discussion-form>
              ${L?`
                <div class="discussion-replying">
                  Replying to: ${P(Fe(L,70))}
                  <button type="button" data-discussion-cancel-reply>Cancel</button>
                </div>
              `:""}
              <textarea data-discussion-body rows="3" placeholder="Write a record-attached note..."></textarea>
              <button type="submit">${L?"Reply":"Post comment"}</button>
            </form>
          </section>
        `,t.querySelector("[data-discussion-form]")?.addEventListener("submit",y=>{y.preventDefault(),f(y.currentTarget)}),t.querySelector("[data-discussion-cancel-reply]")?.addEventListener("click",()=>{e.replyToId=null,O()}),t.querySelector("[data-discussion-task-cancel]")?.addEventListener("click",()=>{e.taskSourceCommentId=null,O()}),t.querySelector("[data-discussion-task-form]")?.addEventListener("submit",y=>{y.preventDefault(),v(y.currentTarget)}),t.querySelectorAll("[data-discussion-reply]").forEach(y=>{y.addEventListener("click",()=>{e.replyToId=y.dataset.discussionReply,O()})}),t.querySelectorAll("[data-discussion-resolve]").forEach(y=>{y.addEventListener("click",()=>M(y.dataset.discussionResolve))}),t.querySelectorAll("[data-discussion-reopen]").forEach(y=>{y.addEventListener("click",()=>w(y.dataset.discussionReopen))}),t.querySelectorAll("[data-discussion-task]").forEach(y=>{y.addEventListener("click",()=>{e.taskSourceCommentId=y.dataset.discussionTask,O()})})}return m(),l=setInterval(()=>m(),3e4),typeof a.service.subscribeToDiscussionEvents=="function"&&(o=a.service.subscribeToDiscussionEvents(()=>m())),()=>{r=!0,l&&clearInterval(l),o&&o(),t.classList.remove("wein-discussion-root"),t.innerHTML=""}}}}function z(t){if(t)throw t}function Ca({supabase:t,currentUserId:a}){if(!t)throw new Error("Supabase client is required");if(!a)throw new Error("currentUserId is required");async function e({taskId:w,providerId:v,offerId:$}={}){let D=t.from("wein_comments").select("*").order("created_at",{ascending:!0});w&&(D=D.eq("task_id",w)),v&&(D=D.eq("provider_id",v)),$&&(D=D.eq("offer_id",$));const{data:O,error:b}=await D;return z(b),O||[]}async function r({body:w,taskId:v=null,providerId:$=null,offerId:D=null,replyToId:O=null,people:b=[]}){const L=v?{task_id:v}:$?{provider_id:$}:D?{offer_id:D}:null;if(!L)throw new Error("postComment requires taskId, providerId, or offerId");const{data:y,error:F}=await t.from("wein_comments").insert({...L,reply_to_id:O,body:w,author_role:"team"}).select("*").single();z(F);for(const G of se(w,b))try{await m(y.id,G)}catch(de){console.error("Failed to record comment mention",de)}return y}async function l(w,v=""){const{data:$,error:D}=await t.from("wein_comments").update({resolved_at:new Date().toISOString(),resolved_note:v}).eq("id",w).select("*");if(z(D),!$?.length)throw new Error("Resolve affected zero comments");return $[0]}async function o(w){const{data:v,error:$}=await t.from("wein_comments").update({resolved_at:null,resolved_note:null}).eq("id",w).select("*");if(z($),!v?.length)throw new Error("Reopen affected zero comments");return v[0]}async function m(w,v){const{data:$,error:D}=await t.from("wein_comment_mentions").insert({comment_id:w,mentioned_user_id:v}).select("*");return z(D),$?.[0]||null}async function f(w,v,$=null,D=null){const{data:O,error:b}=await t.rpc("wein_create_task_from_comment",{p_comment_id:w,p_title:v,p_assigned_to_user_id:$,p_due_date:D});return z(b),O}function M(w){if(!t.channel)return()=>{};const v=t.channel(`record-discussion:${a}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},w).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},w).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_task_links"},w).subscribe();return()=>{if(t.removeChannel)return t.removeChannel(v);if(v?.unsubscribe)return v.unsubscribe()}}return{listComments:e,postComment:r,resolveComment:l,reopenComment:o,addMention:m,createTaskFromComment:f,subscribeToDiscussionEvents:M}}function U(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}const ka={critical:"Critical",high:"High",medium:"Medium",low:"Low"},Ea={task:"Task",mention:"Mention",discussion:"Discussion",review:"Review"};function Ma(t){if(!t)return"No due date";const a=new Date(t);return Number.isNaN(a.getTime())?String(t):a.toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function Da(t=[]){return["critical","high","medium","low"].map(a=>({severity:a,items:t.filter(e=>e.severity===a)})).filter(a=>a.items.length)}function La(){return{id:"work-inbox",mount(t,a){const e={items:[],loading:!0,error:null};let r=!1,l=null,o=null;t.classList.add("wein-work-inbox-root");async function m(){try{e.error=null,e.items=await a.service.loadInbox()}catch(v){e.error=v.message||String(v)}finally{e.loading=!1,r||w()}}function f(v){if(typeof a.onSelectItem=="function"){a.onSelectItem(v);return}v.href&&(window.location.hash=v.href)}function M(v){return`
          <button type="button" class="work-inbox-item severity-${U(v.severity)}" data-inbox-item="${U(v.kind)}:${U(v.entity_id)}:${U(v.reason_code)}">
            <span class="work-inbox-kind">${U(Ea[v.kind]||v.kind)}</span>
            <span class="work-inbox-title">${U(v.title)}</span>
            <span class="work-inbox-reason">${U(v.reason_code.replaceAll("_"," "))}</span>
            <span class="work-inbox-due">${U(Ma(v.due_at))}</span>
            <span class="work-inbox-action">${U(v.next_action)}</span>
          </button>
        `}function w(){const v=Da(e.items);t.innerHTML=`
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
                  <h3>${U(ka[$.severity])}</h3>
                  ${$.items.map(M).join("")}
                </section>
              `).join("")}
              ${!e.loading&&!e.items.length?'<div class="work-inbox-muted">No attention items right now.</div>':""}
            </div>
          </section>
        `,t.querySelector("[data-inbox-refresh]")?.addEventListener("click",()=>m()),t.querySelectorAll("[data-inbox-item]").forEach($=>{$.addEventListener("click",()=>{const D=$.dataset.inboxItem,O=e.items.find(b=>`${b.kind}:${b.entity_id}:${b.reason_code}`===D);O&&f(O)})})}return m(),l=setInterval(()=>m(),6e4),typeof a.service.subscribeToInboxEvents=="function"&&(o=a.service.subscribeToInboxEvents(()=>m())),()=>{r=!0,l&&clearInterval(l),o&&o(),t.classList.remove("wein-work-inbox-root"),t.innerHTML=""}}}}const He={critical:0,high:1,medium:2,low:3};function $e(t,a=new Date){if(!t)return"low";const e=new Date(t);if(Number.isNaN(e.getTime()))return"low";const r=e.getTime()-a.getTime();return r<0?"critical":r<=1440*60*1e3?"high":r<=4320*60*1e3?"medium":"low"}function Ta(t,{now:a=new Date}={}){return{kind:"task",entity_id:t.id,title:t.title||"Untitled task",reason_code:t.due_date?"task_due":"task_open",severity:$e(t.due_date,a),owner_id:t.assigned_to_user_id||t.owner_id||null,due_at:t.due_date||null,next_action:"Open task",href:`#tasks/${t.id}`,source:t}}function Ia(t,{comment:a,currentUserId:e}={}){return{kind:"mention",entity_id:t.comment_id,title:a?.body?`Mention: ${a.body}`:"Mention in discussion",reason_code:"unresolved_mention",severity:a?.resolved_at?"low":"high",owner_id:e||t.mentioned_user_id,due_at:a?.created_at||t.created_at||null,next_action:"Reply or resolve",href:`#comments/${t.comment_id}`,source:{mention:t,comment:a}}}function qa(t,{currentUserId:a,now:e=new Date}={}){return{kind:"discussion",entity_id:t.id,title:t.body||"Discussion awaiting reply",reason_code:"thread_awaiting_reply",severity:$e(t.next_reply_due_at||t.created_at,e),owner_id:a||null,due_at:t.next_reply_due_at||null,next_action:"Reply in thread",href:`#comments/${t.id}`,source:t}}function Aa(t,{now:a=new Date}={}){return{kind:t.kind||"review",entity_id:t.id,title:t.title||t.offer_title||"Founder review needed",reason_code:t.reason_code||"founder_review",severity:$e(t.due_at||t.created_at,a),owner_id:t.owner_id||null,due_at:t.due_at||t.created_at||null,next_action:"Review",href:t.href||`#review/${t.id}`,source:t}}function Oa(t=[]){return[...t].sort((a,e)=>{const r=(He[a.severity]??9)-(He[e.severity]??9);return r||String(a.due_at||"").localeCompare(String(e.due_at||""))})}function Ra(t=[]){const a=new Set;return t.filter(e=>{const r=`${e.kind}:${e.entity_id}:${e.reason_code}`;return a.has(r)?!1:(a.add(r),!0)})}function Pa({tasks:t=[],mentions:a=[],commentsById:e={},awaitingReplies:r=[],founderReviews:l=[]},o={}){const m=[...t.map(f=>Ta(f,o)),...a.map(f=>Ia(f,{...o,comment:e[f.comment_id]})),...r.map(f=>qa(f,o)),...l.map(f=>Aa(f,o))];return Oa(Ra(m))}function We(t){if(t)throw t}function Na({supabase:t,currentUserId:a}){if(!t)throw new Error("Supabase client is required");if(!a)throw new Error("currentUserId is required");async function e(){let m=t.from("wein_tasks").select("*").neq("status","done").order("due_date",{ascending:!0,nullsFirst:!1});a&&(m=m.eq("assigned_to_user_id",a));const{data:f,error:M}=await m;return We(M),f||[]}async function r(){const{data:m,error:f}=await t.from("wein_comment_mentions").select("comment_id,mentioned_user_id,created_at,wein_comments(*)").eq("mentioned_user_id",a).is("wein_comments.resolved_at",null).order("created_at",{ascending:!0});return We(f),m||[]}async function l(){const[m,f]=await Promise.all([e(),r()]),M={},w=f.map(v=>{const $=v.wein_comments||v.comment||null;return $?.id&&(M[$.id]=$),{comment_id:v.comment_id,mentioned_user_id:v.mentioned_user_id,created_at:v.created_at}});return Pa({tasks:m,mentions:w,commentsById:M},{currentUserId:a})}function o(m){if(!t.channel)return()=>{};const f=t.channel(`work-inbox:${a}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_tasks"},m).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},m).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},m).subscribe();return()=>{if(t.removeChannel)return t.removeChannel(f);if(f?.unsubscribe)return f.unsubscribe()}}return{fetchOpenTasks:e,fetchUnresolvedMentions:r,loadInbox:l,subscribeToInboxEvents:o}}const st=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function Ua(t){for(const a of st)oe({id:a,mount:()=>{t[a]()}})}function Se(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const ja=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function Ba(t,a){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${ja.map(e=>`<button class="chip ${t===e?"active":""}" type="button" onclick="${a}('${e.replace(/'/g,"\\'")}')">${e==="all"?"All":Se(e)}</button>`).join("")}</div>`}function Fa(t,a){return a==="all"||String(t||"")===a}function xa(t){return String(t?.category||t?.vertical||"-")}function Ha(t){const a=String(t||"").toLowerCase();return a.includes("dining")?"dining":a.includes("health")?"health":a.includes("fun")?"fun":a.includes("hotel")?"hotels":""}function Wa(t,a=Date.now()){return t?Math.floor((a-new Date(t).getTime())/864e5):0}function _e(t=new Date){const a=new Date(t);return a.setHours(0,0,0,0),a}function za(t,a=new Date){return t?Math.round((_e(a).getTime()-_e(t).getTime())/864e5):null}function it(t,a){let e=String(t||"").replace(/\D/g,"");if(!e)return null;e.startsWith("0")&&(e=`20${e.slice(1)}`);const r=`Hi! Following up on the WeIN offer sheet for ${a} - do you have 5 minutes today?`;return`https://wa.me/${e}?text=${encodeURIComponent(r)}`}function Ga(t,a){const e=it(t,a);return e?`<a class="mini-btn" href="${Se(e)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function K(t){return t.id}function Va(t){return q("profiles").find(a=>K(a)===t)??null}function Ya(t){return q("providers").find(a=>K(a)===t)??null}function Qa(t){return q("leads").find(a=>K(a)===t)??null}function Ka(t){return q("tasks").find(a=>K(a)===t)??null}function Ja(t){return q("offers").find(a=>K(a)===t)??null}function Xa(t){return q("offers").filter(a=>a.provider_id===t)}function Za(t){return q("tasks").filter(a=>a.provider_id===t)}function es(t){return q("tasks").filter(a=>a.lead_id===t)}const ts=Object.freeze(Object.defineProperty({__proto__:null,leadById:Qa,offerById:Ja,offersForProvider:Xa,profileById:Va,providerById:Ya,taskById:Ka,tasksForLead:es,tasksForProvider:Za},Symbol.toStringTag,{value:"Module"}));function ns(){const t=document.title;let a=!1;async function e(){const l=window.WEIN?.user?.id;if(l)try{const m=await nt({supabase:ie(),currentUserId:l}).listConversations(),f=Ze(m),M=document.querySelector("[data-chat-unread-badge]");M&&(M.textContent=String(f),M.style.display=f>0?"inline-flex":"none"),document.title=Zn(t,f)}catch{}}const r=setInterval(()=>{window.WEIN?.user?.id&&!a&&(a=!0,clearInterval(r),setInterval(e,3e4)),e()},2e3)}Bn();_a();ns();const rt={api:Qe,auth:{canDelete:be,canManageDeals:Ge,canEditProviderProfile:Ve,navHiddenForRole:ye,defaultViewForRole:Ye},platform:{getSupabaseClient:ie,getAccessToken:ce,getSessionContext:Mn},shared:{escapeHtml:Se,daysSince:Wa,startOfLocalDay:_e,dayDiffFromToday:za,whatsappLink:it,whatsappButtonHtml:Ga,categoryChipsHtml:Ba,matchesCategoryFilter:Fa,categoryLabel:xa,catBadgeClass:Ha},core:{createPortalContext:Pn,getView:Xe,mountView:jn,registeredViewIds:Nn,registerView:oe},legacy:{LEGACY_VIEW_IDS:st,registerLegacyViews:Ua},features:{requestOpenChatConversation:va,createDiscussionViewModule:Sa,createSupabaseDiscussionService:Ca,createWorkInboxViewModule:La,createSupabaseWorkInboxService:Na},store:Je,selectors:ts};window.WEIN_PORTAL_MODULES=rt;for(const t of window.WEIN_PORTAL_MODULES_READY??[])t(rt);window.WEIN_PORTAL_MODULES_READY=[];
