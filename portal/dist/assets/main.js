function Ce(e){return typeof e=="object"&&e!==null?e.role:e}function oe(e){const n=Ce(e);return n==="admin"||n==="manager"}const Ie=oe;function qe(e){const n=Ce(e);return n==="admin"||n==="manager"||n==="deal_breaker"}const It={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function ce(e){return e?It[e]??[]:[]}function Te(e){return ce(e).includes("pipeline")?"tasks":"pipeline"}function O(){return window.WEIN_PORTAL_LEGACY??{}}function le(){const e=O().supabaseClient;if(!e)throw new Error("Portal Supabase client is not available yet.");return e}function ee(){const e=O().getSupabaseUrl?.();if(!e)throw new Error("Portal Supabase URL is not available yet.");return e}function qt(){const e=O().getSupabaseAnonKey?.();if(!e)throw new Error("Portal Supabase anon key is not available yet.");return e}function te(){return O().getAccessToken?.()??null}function Tt(){return{client:le(),accessToken:te()}}class Dt extends Error{constructor(n,t,r){super(n),this.status=t,this.body=r,this.name="PortalApiError"}status;body}function z(){const e=O().headers?.();if(e)return e;const n=qt();return{apikey:n,Authorization:`Bearer ${te()||n}`,"Content-Type":"application/json"}}async function de(e,n){if(e.ok)return;const t=await e.text();throw new Dt(`Supabase ${n} failed: ${e.status}${t?` ${t}`:""}`,e.status,t)}async function At(e){const n=O().get;if(n)return n(e);const t=await fetch(`${ee()}/rest/v1/${e}`,{headers:z()});return await de(t,"GET"),t.json()}async function Lt(e,n){const t=O().post;if(t)return t(e,n);const r=await fetch(`${ee()}/rest/v1/${e}`,{method:"POST",headers:{...z(),Prefer:"return=representation"},body:JSON.stringify(n)});return await de(r,"POST"),r.json()}async function Rt(e,n){const t=O().patch;return t?t(e,n):(await fetch(`${ee()}/rest/v1/${e}`,{method:"PATCH",headers:z(),body:JSON.stringify(n)})).ok}async function Ot(e){const n=O().delete;if(n)return n(e);const t=await fetch(`${ee()}/rest/v1/${e}`,{method:"DELETE",headers:z()});return await de(t,"DELETE"),!0}const De={headers:z,get:At,post:Lt,patch:Rt,delete:Ot},Nt={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function Pt(){const e=O().getCaches?.();return e?{providers:e.providers??[],offers:e.offers??[],negotiations:e.negotiations??[],files:e.files??[],leads:e.leads??[],outcomes:e.outcomes??[],tasks:e.tasks??[],profiles:e.profiles??[],redemptions:e.redemptions??[],campaigns:e.campaigns??[],calendarNotes:e.calendarNotes??[]}:Nt}function T(e){return Pt()[e]}function Ae(e,n){const t=O().setCache;if(!t)throw new Error("Portal cache bridge is not available yet.");t(e,[...n])}function Ut(e,n){Ae(e,n(T(e)))}const Le={get providers(){return T("providers")},get offers(){return T("offers")},get negotiations(){return T("negotiations")},get files(){return T("files")},get leads(){return T("leads")},get outcomes(){return T("outcomes")},get tasks(){return T("tasks")},get profiles(){return T("profiles")},get redemptions(){return T("redemptions")},get campaigns(){return T("campaigns")},get calendarNotes(){return T("calendarNotes")},getCache:T,replaceCache:Ae,updateCache:Ut};function J(){const e=window.WEIN??{};return{user:e.user,role:e.role??sessionStorage.getItem("weinRole"),fullName:e.fullName??null,accessToken:te(),client:le()}}function Ft(){const e=J();return{api:De,store:Le,session:e,permissions:{canDelete:()=>oe(J()),canManageDeals:()=>Ie(J()),canEditProviderProfile:()=>qe(J()),navHiddenForRole:ce,defaultViewForRole:Te},navigate(n,t){window.showView?.(n,t)}}}const W=new Map;let X=null;function ne(e){if(!e.id)throw new Error("View id is required.");if(W.has(e.id))throw new Error(`View already registered: ${e.id}`);W.set(e.id,e)}function Re(e){return W.get(e)}function xt(){return[...W.keys()]}function Ht(){if(!X)return;const e=X;X=null,e()}function Bt(e,n,t){const r=Re(e);if(!r)throw new Error(`Unknown portal view: ${e}`);Ht();const l=r.mount(n,t);X=typeof l=="function"?l:null}function jt(){W.has("__dummy_cleanup_probe")||ne({id:"__dummy_cleanup_probe",mount(e){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,e.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function Wt(e="chat"){const n=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${e}-${n}`}function ve(e,n){return e.kind==="group"?e.title||"Untitled group":(e.members||[]).map(r=>r.profile).find(r=>r&&r.id!==n)?.full_name||"Direct message"}function zt(e){return[...e].sort((n,t)=>{const r=n.last_message?.created_at||n.created_at,l=t.last_message?.created_at||t.created_at;return new Date(l).getTime()-new Date(r).getTime()})}function Gt(e,n){const t=(e.members||[]).find(l=>l.user_id===n),r=e.last_message?.message_seq||0;return Math.max(0,r-(t?.last_read_seq||0))}function Vt(e){if(!e)return"No messages yet";const n=(e.deleted_at?"Message deleted":e.body||"").trim();return n.length>82?`${n.slice(0,79)}...`:n}const Yt=/[\s\p{P}]/u,Qt=/[\s\p{P}]/u;function Oe(e,n){return n===0?!0:Yt.test(e[n-1])}function Kt(e,n){return n>=e.length?!0:Qt.test(e[n])}function Z(e="",n=[]){const t=String(e??"");if(!t.includes("@"))return[];const r=n.filter(h=>h&&h.id&&h.full_name).map(h=>({id:h.id,name:String(h.full_name)})).sort((h,I)=>I.name.length-h.name.length);if(!r.length)return[];const l=t.toLowerCase(),c=[],u=new Set;for(let h=0;h<t.length;h+=1){if(t[h]!=="@"||!Oe(t,h))continue;const I=h+1;for(const b of r){const p=I+b.name.length;if(l.startsWith(b.name.toLowerCase(),I)&&Kt(t,p)){u.has(b.id)||(u.add(b.id),c.push(b.id)),h=p-1;break}}}return c}function Jt(e="",n=[]){const t=new Set(Z(e,n));return n.filter(r=>r&&t.has(r.id)&&r.full_name).map(r=>String(r.full_name)).sort((r,l)=>l.length-r.length)}function Xt(e="",n=0){const t=String(e??""),r=Math.max(0,Math.min(Number(n)||0,t.length)),l=40;for(let c=r-1;c>=0&&r-c<=l;c-=1){const u=t[c];if(u==="@")return Oe(t,c)?{query:t.slice(c+1,r),start:c}:null;if(u===`
`)return null}return null}function m(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function H(e){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[e]||e}function Zt(e){return`${e}-${Math.random().toString(16).slice(2)}-${Date.now().toString(36)}`}function be(e){return typeof e=="string"&&e.startsWith("image/")}function en(e){const n=Number(e)||0;return n<1024?`${n} B`:n<1024*1024?`${(n/1024).toFixed(1)} KB`:`${(n/(1024*1024)).toFixed(1)} MB`}function ye(e){return e==="application/pdf"?"ti-file-type-pdf":e?.includes("word")?"ti-file-type-doc":e?.includes("sheet")||e?.includes("excel")?"ti-file-type-xls":"ti-file"}function tn(e,n=new Date){if(!e)return"";const t=new Date(e);if(Number.isNaN(t.getTime()))return"";const r=n.getTime()-t.getTime(),l=Math.floor(r/6e4);if(l<1)return"now";if(l<60)return`${l}m`;const c=Math.floor(l/60);return c<24?`${c}h`:r<6*864e5?t.toLocaleDateString(void 0,{weekday:"short"}):t.toLocaleDateString(void 0,{month:"short",day:"numeric"})}const nn=300*1e3;function an(e,n){if(!n||e.sender_id!==n.sender_id)return!0;const t=new Date(e.created_at).getTime()-new Date(n.created_at).getTime();return!(t>=0&&t<nn)}function sn(){return{id:"team-chat",mount(e,n){const t={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,composeOpen:!1,composeSearch:"",composeGroupTitle:"",composeSelectedMemberIds:new Set,membersOpen:!1,memberAddOpen:!1,memberSearch:"",memberSelectedIds:new Set,renameOpen:!1,renameDraft:"",archiveConfirmOpen:!1,mentionQuery:null,mentionIndex:0,mentionStart:0,mentionDraft:"",pendingAttachments:[],openMessageMenuId:null,confirmingDeleteMessageId:null,loading:!0,error:null},r=new Map,l=new Set;let c=!1,u=n.initialConversationId||null,h=null,I=null,b=!1;function p(){const a=e.querySelector(".chat-message-list");return a?a.scrollHeight-a.scrollTop-a.clientHeight<80:!0}function S(){const a=e.querySelector(".chat-message-list");a&&(a.scrollTop=a.scrollHeight)}function M(a){a.style.height="auto",a.style.height=`${Math.min(a.scrollHeight,120)}px`}function D(a){return a?a.members.filter(s=>!s.left_at&&s.profile).map(s=>s.profile):[]}function g(a){const s=String(t.mentionQuery||"").trim().toLowerCase(),i=D(a).filter(d=>d.id!==n.currentUser.id);return s?i.filter(d=>(d.full_name||"").toLowerCase().includes(s)):i}function q({rerender:a=!0}={}){t.mentionQuery!==null&&(t.mentionQuery=null,t.mentionIndex=0,a&&v())}function y(a){t.mentionDraft=a.value;const s=Xt(a.value,a.selectionStart??a.value.length),i=s?s.query:null;return i===t.mentionQuery?!1:(t.mentionQuery=i,t.mentionStart=s?s.start:0,t.mentionIndex=0,!0)}function U(a,s){const i=e.querySelector("[data-chat-composer]");if(!i||!s)return;const d=i.selectionStart??i.value.length,f=i.value.slice(0,t.mentionStart),$=i.value.slice(d),k=`@${s.full_name} `,_=`${f}${k}${$}`,E=f.length+k.length;t.mentionQuery=null,t.mentionIndex=0,t.mentionDraft=_,v();const C=e.querySelector("[data-chat-composer]");C&&(C.value=_,M(C),C.focus(),C.setSelectionRange?.(E,E))}function F(a,s){const i=g(a);if(!i.length)return;const d=(t.mentionIndex+s+i.length)%i.length;t.mentionIndex=d;const f=e.querySelector("[data-chat-composer]")?.value??t.mentionDraft,$=e.querySelector("[data-chat-composer]")?.selectionStart??f.length;t.mentionDraft=f,v();const k=e.querySelector("[data-chat-composer]");k&&(k.value=f,M(k),k.focus(),k.setSelectionRange?.($,$))}e.classList.add("wein-chat-root");function V(a){const s=a.target;if(s instanceof Element){if(t.composeOpen&&!s.closest("[data-chat-compose-popover]")&&!s.closest("[data-chat-compose-toggle]")){Y();return}if(t.membersOpen&&!s.closest("[data-chat-members-panel]")&&!s.closest("[data-chat-members-toggle]")){Q();return}t.openMessageMenuId&&!s.closest("[data-chat-message-menu-panel]")&&!s.closest("[data-chat-message-menu]")&&(t.openMessageMenuId=null,v())}}function pe(a){if(a.key==="Escape"){if(t.composeOpen){Y();return}if(t.membersOpen){Q();return}(t.openMessageMenuId||t.confirmingDeleteMessageId)&&(t.openMessageMenuId=null,t.confirmingDeleteMessageId=null,v())}}e.addEventListener?.("click",V),typeof document<"u"&&document.addEventListener("keydown",pe);async function L({keepMessages:a=!0}={}){try{t.error=null;const[s,i]=await Promise.all([n.service.listProfiles(),n.service.listConversations()]);if(t.profiles=s,t.conversations=zt(i),u&&(t.conversations.some(d=>d.id===u)&&(t.selectedConversationId=u),u=null),!t.selectedConversationId&&t.conversations.length&&(t.selectedConversationId=t.conversations[0].id),t.selectedConversationId&&a){t.messages=await n.service.listMessages(t.selectedConversationId);const d=t.messages.at(-1)?.message_seq||0;if(d)try{await n.service.markRead(t.selectedConversationId,d)}catch(f){console.error("Failed to mark chat messages as read",f)}}}catch(s){t.error=s.message||String(s)}finally{t.loading=!1,c||v()}}async function ae(a){t.selectedConversationId=a,t.membersOpen=!1,t.memberAddOpen=!1,t.memberSearch="",t.memberSelectedIds=new Set,t.renameOpen=!1,t.renameDraft="",t.archiveConfirmOpen=!1,t.pendingAttachments=[],e.classList.add("chat-has-selection"),t.messages=await n.service.listMessages(a),b=!0,c||v();const s=t.messages.at(-1)?.message_seq||0;if(s)try{await n.service.markRead(a,s)}catch(i){console.error("Failed to mark chat messages as read",i)}await L()}function he(){e.classList.remove("chat-has-selection")}function se(a){const s=t.selectedConversationId;if(!s)return;const i=[...a||[]];for(const d of i){const f={id:Zt("pending"),name:d.name,mime:d.type||"application/octet-stream",size:d.size,status:"uploading",error:null,uploaded:null};t.pendingAttachments=[...t.pendingAttachments,f],n.service.uploadAttachment(s,d).then($=>{f.status="done",f.uploaded=$,c||v()}).catch($=>{f.status="error",f.error=$?.message||"Upload failed",c||v()})}v()}function He(a){t.pendingAttachments=t.pendingAttachments.filter(s=>s.id!==a),v()}async function Be(a){const s=a.querySelector("[data-chat-composer]"),i=s.value.trim(),d=t.pendingAttachments.some(C=>C.status==="uploading"),f=t.pendingAttachments.filter(C=>C.status==="done").map(C=>C.uploaded);if(d||!i&&!f.length||!t.selectedConversationId)return;const $=t.replyToMessageId,k=t.conversations.find(C=>C.id===t.selectedConversationId)||null,_=Z(i,D(k));s.value="",t.replyToMessageId=null,t.mentionQuery=null,t.mentionDraft="",t.pendingAttachments=[];const E=await n.service.sendMessage({conversationId:t.selectedConversationId,body:i,clientNonce:Wt("portal-chat"),replyToId:$,mentionedUserIds:_,attachments:f});t.messages=[...t.messages,E],b=!0,c||v();try{await n.service.markRead(t.selectedConversationId,E.message_seq)}catch(C){console.error("Failed to mark chat message as read",C)}await L()}function je(a){a&&(t.replyToMessageId=a,v(),e.querySelector("[data-chat-composer]")?.focus())}function We(){t.replyToMessageId=null,v()}function ze(){t.composeOpen=!0,v(),e.querySelector("[data-chat-compose-search]")?.focus()}function Y({reset:a=!1}={}){t.composeOpen=!1,a&&(t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set),v()}function Ge(a,s){const i=new Set(t.composeSelectedMemberIds);s?i.add(a):i.delete(a),t.composeSelectedMemberIds=i,v()}function ge(a){return!a||a.kind!=="group"?!1:a.members.find(i=>i.user_id===n.currentUser.id&&!i.left_at)?.membership_role==="owner"||["admin","manager"].includes(n.currentUser.role)}function Ve(){t.membersOpen=!0,v()}function Q({reset:a=!1}={}){t.membersOpen=!1,t.memberAddOpen=!1,a&&(t.memberSearch="",t.memberSelectedIds=new Set),v()}function Ye(){t.memberAddOpen=!t.memberAddOpen,v(),t.memberAddOpen&&e.querySelector("[data-chat-member-search]")?.focus()}function Qe(a,s){const i=new Set(t.memberSelectedIds);s?i.add(a):i.delete(a),t.memberSelectedIds=i,v()}async function Ke(a){const s=[...t.memberSelectedIds];if(!(!a||!s.length)){for(const i of s)await n.service.addMember(a,i);t.memberSearch="",t.memberSelectedIds=new Set,t.memberAddOpen=!1,c||v(),await L()}}async function Je(a,s){!a||!s||(await n.service.removeMember(a,s),t.conversations=t.conversations.map(i=>i.id!==a?i:{...i,members:i.members.map(d=>d.user_id===s?{...d,left_at:d.left_at||new Date().toISOString()}:d)}),s===n.currentUser.id&&(t.membersOpen=!1,t.memberAddOpen=!1),c||v(),await L())}function Xe(a){const s=t.messages.find(d=>d.id===a);if(!s)return;t.editingMessageId=a,t.editDraft=s.body||"",v();const i=e.querySelector(`[data-chat-edit-input="${CSS.escape(a)}"]`);i?.focus(),i?.select?.()}function Ze(){t.editingMessageId=null,t.editDraft="",v()}async function et(a){const s=a.dataset.chatEditForm,d=a.querySelector("[data-chat-edit-input]").value.trim();if(!s||!d)return;const f=t.conversations.find(k=>k.id===t.selectedConversationId)||null,$=await n.service.updateMessage(s,d,Z(d,D(f)));t.messages=t.messages.map(k=>k.id===$.id?$:k),t.editingMessageId=null,t.editDraft="",c||v(),await L()}async function tt(a){if(!a)return;const s=await n.service.deleteMessage(a);t.messages=t.messages.map(i=>i.id===a?{...i,...s,body:"Message deleted",deleted_at:s.deleted_at||new Date().toISOString()}:i),t.replyToMessageId===a&&(t.replyToMessageId=null),t.confirmingDeleteMessageId=null,t.openMessageMenuId=null,c||v(),await L()}async function nt(a){const i=a.members.find(d=>d.user_id===n.currentUser.id)?.notification_level==="muted"?"all":"muted";await n.service.setNotificationLevel(a.id,i),t.conversations=t.conversations.map(d=>d.id!==a.id?d:{...d,members:d.members.map(f=>f.user_id===n.currentUser.id?{...f,notification_level:i}:f)}),c||v(),await L()}function at(a){t.renameOpen=!0,t.renameDraft=a.title||"",v(),e.querySelector("[data-chat-rename-input]")?.focus()}function st(){t.renameOpen=!1,t.renameDraft="",v()}async function rt(a,s){const i=(s||"").trim();i&&(await n.service.renameConversation(a.id,i),t.conversations=t.conversations.map(d=>d.id===a.id?{...d,title:i}:d),t.renameOpen=!1,t.renameDraft="",c||v(),await L())}function it(){t.archiveConfirmOpen=!0,v()}function ot(){t.archiveConfirmOpen=!1,v()}async function ct(a,s){await n.service.setConversationArchived(a.id,s),t.archiveConfirmOpen=!1,t.selectedConversationId===a.id&&(t.selectedConversationId=null,he()),t.conversations=t.conversations.map(i=>i.id===a.id?{...i,archived_at:new Date().toISOString()}:i),c||v(),await L()}async function lt(a,s,i){!a||!s||(await n.service.setMembershipRole(a,s,i),t.conversations=t.conversations.map(d=>d.id!==a?d:{...d,members:d.members.map(f=>f.user_id===s?{...f,membership_role:i}:f)}),c||v(),await L())}async function dt(a){if(!a)return;const s=await n.service.getOrCreateDm(a);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await ae(s)}async function ut(a,s){if(a=a.trim(),!a)return;const i=await n.service.createGroup(a,s);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await ae(i)}function mt(){c||L()}function ft(a){const s=a.id===t.selectedConversationId?" selected":"",i=a.unread_count?`<span class="chat-count">${a.unread_count}</span>`:"",d=ve(a,n.currentUser.id),f=tn(a.last_message?.created_at);return`
          <button type="button" class="chat-conversation${s}" data-chat-select="${m(a.id)}">
            <span class="chat-conversation-avatar" aria-hidden="true">${m((d||"?").slice(0,1).toUpperCase())}</span>
            <span class="chat-conversation-body">
              <span class="chat-conversation-row">
                <span class="chat-conversation-title">${m(d)}</span>
                ${f?`<span class="chat-conversation-timestamp">${m(f)}</span>`:""}
                ${i}
              </span>
              <span class="chat-conversation-preview">${m(Vt(a.last_message))}</span>
            </span>
          </button>
        `}function pt(){return["admin","manager"].includes(n.currentUser.role)}function ht(a){if(!t.composeOpen)return"";const s=t.composeSearch.trim().toLowerCase(),i=a.filter($=>!s||($.full_name||"").toLowerCase().includes(s)),d=t.composeSelectedMemberIds.size,f=d===1?[...t.composeSelectedMemberIds][0]:"";return`
          <div class="chat-compose-popover" data-chat-compose-popover role="dialog" aria-label="New conversation">
            <div class="chat-compose-popover-head">
              <strong>New conversation</strong>
              <button type="button" class="chat-icon-btn" data-chat-compose-close aria-label="Close new conversation"><i class="ti ti-x"></i></button>
            </div>
            <input data-chat-compose-search type="search" placeholder="Search people..." value="${m(t.composeSearch)}" autocomplete="off">
            <div class="chat-compose-summary">${d} selected</div>
            <div class="chat-compose-list">
              ${i.map($=>{const k=t.composeSelectedMemberIds.has($.id)?" checked":"";return`
                  <label class="chat-compose-person">
                    <input type="checkbox" data-chat-compose-member="${m($.id)}"${k}>
                    <span class="chat-compose-avatar">${m(($.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${m($.full_name||"Unknown")}</strong>
                      <span>${m(H($.role))}</span>
                    </span>
                  </label>
                `}).join("")}
              ${i.length?"":'<div class="chat-muted">No matching people.</div>'}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${m(f)}"${d===1?"":" disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${m(t.composeGroupTitle)}">
                <button type="button" data-chat-create-group${t.composeGroupTitle.trim()?"":" disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
              </div>
            </div>
          </div>
        `}function gt(a){if(t.mentionQuery===null||!a)return"";const s=g(a);if(!s.length)return"";const i=Math.min(t.mentionIndex,s.length-1);return`
          <div class="chat-compose-popover chat-mention-picker" data-chat-mention-picker role="listbox" aria-label="Mention someone">
            ${s.map((d,f)=>`
              <button
                type="button"
                class="chat-compose-person chat-mention-option${f===i?" active":""}"
                data-chat-mention-pick="${m(d.id)}"
                role="option"
                aria-selected="${f===i}"
              >
                <span class="chat-compose-avatar">${m((d.full_name||"?").slice(0,1))}</span>
                <span class="chat-compose-person-copy">
                  <strong>${m(d.full_name||"Unknown")}</strong>
                  <span>${m(H(d.role))}</span>
                </span>
              </button>
            `).join("")}
          </div>
        `}function _t(a){if(!t.membersOpen||!a||a.kind!=="group")return"";const s=a.members.filter(_=>!_.left_at),i=ge(a),d=new Set(s.map(_=>_.user_id)),f=t.memberSearch.trim().toLowerCase(),$=t.profiles.filter(_=>_.id!==n.currentUser.id&&!d.has(_.id)&&(!f||(_.full_name||"").toLowerCase().includes(f))),k=t.memberSelectedIds.size;return`
          <div class="chat-compose-popover chat-members-panel" data-chat-members-panel role="dialog" aria-label="Manage members">
            <div class="chat-compose-popover-head">
              <strong>Manage members</strong>
              <button type="button" class="chat-icon-btn" data-chat-members-close aria-label="Close member management"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-member-panel-list">
              ${s.map(_=>{const E=_.profile||{},C=_.user_id===n.currentUser.id,K=i||C;return`
                  <div class="chat-member-row" data-chat-member-row="${m(_.user_id)}">
                    <span class="chat-compose-avatar">${m((E.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${m(E.full_name||_.user_id)}</strong>
                      <span>${m(E.role?H(E.role):"Member")}</span>
                    </span>
                    ${_.membership_role==="owner"?'<span class="chat-owner-badge">Owner</span>':""}
                    ${i?`
                      <button type="button" class="chat-member-promote" data-chat-promote-member="${m(_.user_id)}" data-chat-role="${_.membership_role==="owner"?"member":"owner"}">
                        <i class="ti ${_.membership_role==="owner"?"ti-user-minus":"ti-shield-plus"}"></i><span>${_.membership_role==="owner"?"Remove owner":"Make owner"}</span>
                      </button>
                    `:""}
                    ${K?`
                      <button type="button" class="chat-member-remove" data-chat-remove-member="${m(_.user_id)}">
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
                  <input data-chat-member-search type="search" placeholder="Search people..." value="${m(t.memberSearch)}" autocomplete="off">
                  <div class="chat-compose-summary">${k} selected</div>
                  <div class="chat-compose-list">
                    ${$.map(_=>{const E=t.memberSelectedIds.has(_.id)?" checked":"";return`
                        <label class="chat-compose-person">
                          <input type="checkbox" data-chat-member-pick="${m(_.id)}"${E}>
                          <span class="chat-compose-avatar">${m((_.full_name||"?").slice(0,1))}</span>
                          <span class="chat-compose-person-copy">
                            <strong>${m(_.full_name||"Unknown")}</strong>
                            <span>${m(H(_.role))}</span>
                          </span>
                        </label>
                      `}).join("")}
                    ${$.length?"":'<div class="chat-muted">No matching people.</div>'}
                  </div>
                  <div class="chat-compose-actions">
                    <button type="button" data-chat-add-members="${m(a.id)}"${k?"":" disabled"}><i class="ti ti-users-plus"></i><span>Add selected</span></button>
                  </div>
                `:""}
              </div>
            `:""}
          </div>
        `}function _e(a){const s=a.deleted_at?"Message deleted":a.body||"";return s.length>90?`${s.slice(0,87)}...`:s}function vt(a){if(!a?.reply_to_id)return"";const s=t.messages.find(i=>i.id===a.reply_to_id);return s?`
          <div class="chat-quote">
            <strong>${m(s.sender?.full_name||"Unknown")}</strong>
            <span>${m(_e(s))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function bt(){const a=t.messages.find(s=>s.id===t.replyToMessageId);return a?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${m(a.sender?.full_name||"Unknown")}</strong>
              <span>${m(_e(a))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function yt(){return t.pendingAttachments.length?`
          <div class="chat-pending-attachments">
            ${t.pendingAttachments.map(a=>`
              <div class="chat-pending-attachment${a.status==="error"?" error":""}" data-chat-pending-attachment="${m(a.id)}">
                <i class="ti ${a.status==="error"?"ti-alert-triangle":be(a.mime)?"ti-photo":ye(a.mime)}"></i>
                <span class="chat-pending-attachment-name">${m(a.name)}</span>
                ${a.status==="uploading"?'<span class="chat-pending-attachment-status">Uploading…</span>':""}
                ${a.status==="error"?`<span class="chat-pending-attachment-status">${m(a.error||"Failed")}</span>`:""}
                <button type="button" data-chat-remove-pending="${m(a.id)}" aria-label="Remove attachment"><i class="ti ti-x"></i></button>
              </div>
            `).join("")}
          </div>
        `:""}function wt(a){const s=r.get(a.path),i=s&&s.expiresAt>Date.now()?s.url:null;return be(a.mime)?i?`<a class="chat-attachment-image-link" href="${m(i)}" target="_blank" rel="noopener">
                 <img class="chat-attachment-image" src="${m(i)}" alt="${m(a.name)}">
               </a>`:'<div class="chat-attachment-image chat-attachment-image-loading"><i class="ti ti-photo"></i></div>':`
          <a class="chat-attachment-file" href="${i?m(i):"#"}" target="_blank" rel="noopener" data-chat-attachment-path="${m(a.path)}">
            <i class="ti ${ye(a.mime)}"></i>
            <span class="chat-attachment-file-copy">
              <strong>${m(a.name)}</strong>
              <span>${m(en(a.size))}</span>
            </span>
            <i class="ti ti-download"></i>
          </a>
        `}function $t(a){return a.attachments?.length?`<div class="chat-message-attachments">${a.attachments.map(wt).join("")}</div>`:""}async function St(){const a=new Set;for(const i of t.messages)for(const d of i.attachments||[])a.add(d.path);let s=!1;for(const i of a){const d=r.get(i);if(!(d&&d.expiresAt>Date.now()||l.has(i))){l.add(i);try{const f=await n.service.getSignedAttachmentUrl(i);r.set(i,{url:f,expiresAt:Date.now()+3300*1e3}),s=!0}catch(f){console.error("Failed to sign chat attachment URL",f)}finally{l.delete(i)}}}s&&!c&&v()}function kt(a){return`
          <form class="chat-edit-form" data-chat-edit-form="${m(a.id)}">
            <input data-chat-edit-input="${m(a.id)}" type="text" value="${m(t.editDraft)}">
            <button type="submit" aria-label="Save edit"><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
          </form>
        `}function Mt(a){const s=m(a.body),i=t.conversations.find(_=>_.id===a.conversation_id)||t.conversations.find(_=>_.id===t.selectedConversationId)||null,d=D(i),f=Jt(a.body,d);if(!f.length)return s;const $=new Set(d.filter(_=>_.id===n.currentUser.id).map(_=>String(_.full_name)));let k=s;for(const _ of f){const E=`@${m(_)}`,C=$.has(_)?"chat-mention chat-mention-self":"chat-mention";k=k.split(E).join(`<span class="${C}">${E}</span>`)}return k}function Et(a,s=!0){const i=a.sender_id===n.currentUser.id?" mine":"",d=!!a.deleted_at,f=i&&!d,$=!d&&(i||pt()),k=a.edited_at&&!d?'<span class="chat-edited">(edited)</span>':"",_=d?"":`
            <button type="button" data-chat-reply="${m(a.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${f?`<button type="button" data-chat-edit="${m(a.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
            ${$?`<button type="button" data-chat-delete="${m(a.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>`:""}
        `,E=d?"":`
          <div class="chat-message-actions" aria-label="Message actions">
            ${_}
          </div>
          <button type="button" class="chat-message-menu-btn" data-chat-message-menu="${m(a.id)}" aria-label="Message actions"><i class="ti ti-dots"></i></button>
          ${t.openMessageMenuId===a.id?`
            <div class="chat-message-menu" data-chat-message-menu-panel="${m(a.id)}">
              ${_}
            </div>
          `:""}
          ${t.confirmingDeleteMessageId===a.id?`
            <div class="chat-delete-confirm">
              <span>Delete message?</span>
              <button type="button" data-chat-confirm-delete="${m(a.id)}">Confirm</button>
              <button type="button" data-chat-cancel-delete="${m(a.id)}">Cancel</button>
            </div>
          `:""}
        `;return`
          <div class="chat-message${i}${d?" deleted":""}${s?"":" chat-message-grouped"}" tabindex="0" data-chat-message-id="${m(a.id)}">
            ${s?`
              <div class="chat-message-meta">
                <span>${m(a.sender?.full_name||"Unknown")}</span>
                <span>#${a.message_seq} ${k}</span>
              </div>
            `:""}
            ${vt(a)}
            ${t.editingMessageId===a.id?kt(a):`
              ${a.body.trim()?`<div class="chat-message-body">${d?m("Message deleted"):Mt(a)}</div>`:""}
              ${d?"":$t(a)}
            `}
            ${E}
          </div>
        `}function v(){const a=b||p();b=!1;const s=t.conversations.find(o=>o.id===t.selectedConversationId)||null,i=t.profiles.filter(o=>o.id!==n.currentUser.id),f=s?.members.find(o=>o.user_id===n.currentUser.id)?.notification_level==="muted",$=s?.members.filter(o=>!o.left_at)||[],k=s?ge(s):!1;e.innerHTML=`
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
              ${ht(i)}
              <div class="chat-conversation-list">
                ${t.loading?'<div class="chat-muted">Loading...</div>':""}
                ${t.conversations.map(ft).join("")}
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
                    ${t.renameOpen?`
                      <form class="chat-rename-form" data-chat-rename-form>
                        <input data-chat-rename-input type="text" value="${m(t.renameDraft)}" placeholder="Group name">
                        <button type="submit" aria-label="Save name"><i class="ti ti-check"></i></button>
                        <button type="button" data-chat-rename-cancel aria-label="Cancel rename"><i class="ti ti-x"></i></button>
                      </form>
                    `:`<h2>${m(ve(s,n.currentUser.id))}</h2>`}
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
                      <button type="button" class="chat-icon-btn" data-chat-archive-toggle aria-label="Archive conversation" title="Archive conversation">
                        <i class="ti ti-archive"></i>
                      </button>
                    `:""}
                    <button type="button" class="chat-icon-btn${f?" active":""}" data-chat-toggle-mute aria-label="${f?"Unmute conversation":"Mute conversation"}" title="${f?"Unmute conversation":"Mute conversation"}">
                      <i class="ti ${f?"ti-bell-off":"ti-bell"}"></i>
                    </button>
                    <div class="chat-member-stack">
                      ${$.map(o=>`<span title="${m(o.profile?.full_name||o.user_id)}">${m((o.profile?.full_name||"?").slice(0,1))}</span>`).join("")}
                    </div>
                  </div>
                  ${_t(s)}
                  ${t.archiveConfirmOpen?`
                    <div class="chat-delete-confirm chat-archive-confirm">
                      <span>Archive this group?</span>
                      <button type="button" data-chat-confirm-archive>Confirm</button>
                      <button type="button" data-chat-cancel-archive>Cancel</button>
                    </div>
                  `:""}
                </header>
                <div class="chat-message-list">
                  ${t.messages.map((o,w)=>Et(o,an(o,t.messages[w-1]))).join("")}
                  ${t.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  ${bt()}
                  ${yt()}
                  ${gt(s)}
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
        `,e.querySelectorAll("[data-chat-select]").forEach(o=>{o.addEventListener("click",()=>ae(o.dataset.chatSelect))}),e.querySelector("[data-chat-back]")?.addEventListener("click",()=>he()),e.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{s&&nt(s)}),e.querySelector("[data-chat-members-toggle]")?.addEventListener("click",()=>{s&&(t.membersOpen?Q():Ve())}),e.querySelector("[data-chat-members-close]")?.addEventListener("click",()=>Q({reset:!0})),e.querySelector("[data-chat-rename-toggle]")?.addEventListener("click",()=>{s&&at(s)}),e.querySelector("[data-chat-rename-cancel]")?.addEventListener("click",()=>st()),e.querySelector("[data-chat-rename-form]")?.addEventListener("submit",o=>{o.preventDefault(),s&&rt(s,t.renameDraft)}),e.querySelector("[data-chat-rename-input]")?.addEventListener("input",o=>{t.renameDraft=o.currentTarget.value}),e.querySelector("[data-chat-archive-toggle]")?.addEventListener("click",()=>it()),e.querySelector("[data-chat-confirm-archive]")?.addEventListener("click",()=>{s&&ct(s,!0)}),e.querySelector("[data-chat-cancel-archive]")?.addEventListener("click",()=>ot()),e.querySelector("[data-chat-member-add-toggle]")?.addEventListener("click",()=>Ye()),e.querySelector("[data-chat-member-search]")?.addEventListener("input",o=>{t.memberSearch=o.currentTarget.value,v();const w=e.querySelector("[data-chat-member-search]");w?.focus(),w?.setSelectionRange?.(w.value.length,w.value.length)}),e.querySelectorAll("[data-chat-member-pick]").forEach(o=>{o.addEventListener("change",()=>Qe(o.dataset.chatMemberPick,o.checked))}),e.querySelector("[data-chat-add-members]")?.addEventListener("click",o=>{Ke(o.currentTarget.dataset.chatAddMembers)}),e.querySelectorAll("[data-chat-remove-member]").forEach(o=>{o.addEventListener("click",()=>{s&&Je(s.id,o.dataset.chatRemoveMember)})}),e.querySelectorAll("[data-chat-promote-member]").forEach(o=>{o.addEventListener("click",()=>{s&&lt(s.id,o.dataset.chatPromoteMember,o.dataset.chatRole)})}),e.querySelector("[data-chat-compose-toggle]")?.addEventListener("click",()=>{t.composeOpen?Y():ze()}),e.querySelector("[data-chat-compose-close]")?.addEventListener("click",()=>Y()),e.querySelector("[data-chat-compose-search]")?.addEventListener("input",o=>{t.composeSearch=o.currentTarget.value,v();const w=e.querySelector("[data-chat-compose-search]");w?.focus(),w?.setSelectionRange?.(w.value.length,w.value.length)}),e.querySelectorAll("[data-chat-compose-member]").forEach(o=>{o.addEventListener("change",()=>Ge(o.dataset.chatComposeMember,o.checked))}),e.querySelector("[data-chat-group-title]")?.addEventListener("input",o=>{t.composeGroupTitle=o.currentTarget.value,v();const w=e.querySelector("[data-chat-group-title]");w?.focus(),w?.setSelectionRange?.(w.value.length,w.value.length)}),e.querySelector("[data-chat-start-dm]")?.addEventListener("click",o=>{dt(o.currentTarget.dataset.chatStartDm)}),e.querySelector("[data-chat-create-group]")?.addEventListener("click",()=>{ut(t.composeGroupTitle,[...t.composeSelectedMemberIds])});const _=e.querySelector("[data-chat-send-form]");_?.addEventListener("submit",o=>{o.preventDefault(),Be(o.currentTarget)});const E=e.querySelector("[data-chat-composer]");E?.addEventListener("input",()=>{if(M(E),!y(E))return;const{value:o,selectionStart:w}=E;v();const N=e.querySelector("[data-chat-composer]");N&&(N.value=o,M(N),N.focus(),N.setSelectionRange?.(w,w))}),E?.addEventListener("keydown",o=>{if(t.mentionQuery!==null&&s){const w=g(s);if(w.length){if(o.key==="ArrowDown"){o.preventDefault(),F(s,1);return}if(o.key==="ArrowUp"){o.preventDefault(),F(s,-1);return}if(o.key==="Enter"||o.key==="Tab"){o.preventDefault(),U(s,w[Math.min(t.mentionIndex,w.length-1)]);return}}if(o.key==="Escape"){o.preventDefault(),q();return}}o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),_?.requestSubmit())}),e.querySelectorAll("[data-chat-mention-pick]").forEach(o=>{o.addEventListener("mousedown",w=>{w.preventDefault();const N=D(s).find(Ct=>Ct.id===o.dataset.chatMentionPick);N&&U(s,N)})}),e.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>We()),e.querySelectorAll("[data-chat-reply]").forEach(o=>{o.addEventListener("click",()=>je(o.dataset.chatReply))}),e.querySelectorAll("[data-chat-edit]").forEach(o=>{o.addEventListener("click",()=>Xe(o.dataset.chatEdit))}),e.querySelectorAll("[data-chat-delete]").forEach(o=>{o.addEventListener("click",()=>{t.confirmingDeleteMessageId=o.dataset.chatDelete,t.openMessageMenuId=null,v()})}),e.querySelectorAll("[data-chat-message-menu]").forEach(o=>{o.addEventListener("click",()=>{t.openMessageMenuId=t.openMessageMenuId===o.dataset.chatMessageMenu?null:o.dataset.chatMessageMenu,t.confirmingDeleteMessageId=null,v()})}),e.querySelectorAll("[data-chat-confirm-delete]").forEach(o=>{o.addEventListener("click",()=>tt(o.dataset.chatConfirmDelete))}),e.querySelectorAll("[data-chat-cancel-delete]").forEach(o=>{o.addEventListener("click",()=>{t.confirmingDeleteMessageId===o.dataset.chatCancelDelete&&(t.confirmingDeleteMessageId=null),v()})}),e.querySelectorAll("[data-chat-edit-form]").forEach(o=>{o.addEventListener("submit",w=>{w.preventDefault(),et(w.currentTarget)})}),e.querySelectorAll("[data-chat-cancel-edit]").forEach(o=>{o.addEventListener("click",()=>Ze())});const C=e.querySelector("[data-chat-file-input]");e.querySelector("[data-chat-attach-toggle]")?.addEventListener("click",()=>C?.click()),C?.addEventListener("change",o=>{se(o.currentTarget.files),o.currentTarget.value=""}),e.querySelectorAll("[data-chat-remove-pending]").forEach(o=>{o.addEventListener("click",()=>He(o.dataset.chatRemovePending))});const K=e.querySelector("[data-chat-send-form]");K?.addEventListener("dragover",o=>o.preventDefault()),K?.addEventListener("drop",o=>{o.preventDefault(),o.dataTransfer?.files?.length&&se(o.dataTransfer.files)}),E?.addEventListener("paste",o=>{const w=[...o.clipboardData?.files||[]];w.length&&se(w)}),a&&S(),St()}return L(),h=setInterval(()=>L(),3e4),typeof n.service.subscribeToConversationEvents=="function"&&(I=n.service.subscribeToConversationEvents(()=>mt())),()=>{c=!0,h&&clearInterval(h),I&&I(),e.removeEventListener?.("click",V),typeof document<"u"&&document.removeEventListener("keydown",pe),e.classList.remove("wein-chat-root"),e.classList.remove("chat-has-selection"),e.innerHTML=""}}}}const we="chat-attachments";function Ne(e){return String(e||"file").replace(/[^a-zA-Z0-9._-]+/g,"_")}function rn(e,n){const t=`${Date.now().toString(36)}-${Math.random().toString(16).slice(2,8)}`;return`${e}/${t}-${Ne(n)}`}function P(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data||[]}function B(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data}function ue(e){return e?{id:e.id,full_name:e.full_name,role:e.role,email:e.email??null}:null}function on(e){return{conversation_id:e.conversation_id,user_id:e.user_id,membership_role:e.membership_role,joined_at:e.joined_at,left_at:e.left_at,last_read_seq:Number(e.last_read_seq||0),notification_level:e.notification_level,profile:ue(e.profile||e.profiles)}}function j(e){return{id:e.id,conversation_id:e.conversation_id,message_seq:Number(e.message_seq||0),sender_id:e.sender_id,body:e.body,reply_to_id:e.reply_to_id,client_nonce:e.client_nonce,created_at:e.created_at,edited_at:e.edited_at,deleted_at:e.deleted_at,mentioned_user_ids:e.mentioned_user_ids||[],attachments:e.attachments||[],sender:ue(e.sender||e.profiles)}}function $e(e,n){const t=(e.members||e.wein_chat_members||[]).map(on),r=e.last_message||e.wein_chat_messages||[],l=Array.isArray(r)&&r.length?j(r[0]):null,c={id:e.id,kind:e.kind,title:e.title,created_by:e.created_by,created_at:e.created_at,archived_at:e.archived_at,members:t,last_message:l,unread_count:0};return c.unread_count=Gt(c,n),c}function cn({supabase:e,currentUserId:n}){if(!e)throw new Error("supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(r){const l=await e.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",r).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"}).single();if(l.error)throw new Error(`fetch conversation: ${l.error.message||l.error}`);return $e(l.data,n)}return{async listProfiles(){const r=await e.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return P(r,"list profiles").map(ue)},async listConversations(){const r=await e.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(1,{referencedTable:"wein_chat_messages"});return P(r,"list conversations").map(l=>$e(l,n))},async listMessages(r){const l=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",r).is("deleted_at",null).order("message_seq",{ascending:!0});return P(l,"list messages").map(j)},async createGroup(r,l=[]){const c=B(await e.rpc("wein_chat_create_group",{p_title:r}),"create group");for(const u of l)await this.addMember(c,u);return c},async getOrCreateDm(r){return B(await e.rpc("wein_chat_get_or_create_dm",{p_other_user_id:r}),"get or create DM")},async addMember(r,l){B(await e.rpc("wein_chat_add_member",{p_conversation_id:r,p_user_id:l}),"add member")},async removeMember(r,l){B(await e.rpc("wein_chat_remove_member",{p_conversation_id:r,p_user_id:l}),"remove member")},async renameConversation(r,l){const c=(l||"").trim();if(!c)throw new Error("Group title is required");const u=await e.from("wein_chat_conversations").update({title:c}).eq("id",r).select("id, title");if(!P(u,"rename conversation").length)throw new Error("rename conversation affected zero rows")},async setConversationArchived(r,l){const c=await e.from("wein_chat_conversations").update({archived_at:l?new Date().toISOString():null}).eq("id",r).select("id, archived_at");if(!P(c,"set conversation archived").length)throw new Error("set conversation archived affected zero rows")},async setMembershipRole(r,l,c){B(await e.rpc("wein_chat_set_membership_role",{p_conversation_id:r,p_user_id:l,p_role:c}),"set membership role")},async uploadAttachment(r,l){const c=rn(r,l.name),u=await e.storage.from(we).upload(c,l,{contentType:l.type||"application/octet-stream",upsert:!1});if(u.error)throw new Error(`upload attachment: ${u.error.message||u.error}`);return{path:c,name:l.name||Ne(l.name),mime:l.type||"application/octet-stream",size:l.size||0}},async getSignedAttachmentUrl(r,l=3600){const c=await e.storage.from(we).createSignedUrl(r,l);if(c.error)throw new Error(`sign attachment url: ${c.error.message||c.error}`);const u=c.data?.signedUrl;if(!u)throw new Error("sign attachment url: no signed URL returned");return u},async sendMessage({conversationId:r,body:l,clientNonce:c,replyToId:u=null,mentionedUserIds:h=[],attachments:I=[]}){const b=await e.from("wein_chat_messages").insert({conversation_id:r,sender_id:n,body:l,client_nonce:c,reply_to_id:u,mentioned_user_ids:h.length?h:null,attachments:I}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(b.error)throw new Error(`send message: ${b.error.message||b.error}`);return j(b.data)},async updateMessage(r,l,c=[]){const u=await e.from("wein_chat_messages").update({body:l,edited_at:new Date().toISOString(),mentioned_user_ids:c.length?c:null}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(u.error)throw new Error(`update message: ${u.error.message||u.error}`);return j(u.data)},async deleteMessage(r){const l=await e.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(l.error)throw new Error(`delete message: ${l.error.message||l.error}`);return j(l.data)},async markRead(r,l){const c=await e.from("wein_chat_members").update({last_read_seq:l}).eq("conversation_id",r).eq("user_id",n).select("conversation_id, user_id, last_read_seq");if(!P(c,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(r,l){const c=await e.from("wein_chat_members").update({notification_level:l}).eq("conversation_id",r).eq("user_id",n).select("conversation_id, user_id, notification_level");if(!P(c,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(r){if(typeof e.channel!="function")return()=>{};const l=e.channel(`wein-chat:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},r).subscribe();return()=>{typeof e.removeChannel=="function"?e.removeChannel(l):typeof l.unsubscribe=="function"&&l.unsubscribe()}},fetchConversation:t}}function ln(e){return typeof e.session.user=="object"&&e.session.user!==null?e.session.user:{}}function dn(e){const n=ln(e),t=n.id;if(!t)throw new Error("Team chat requires an authenticated user id.");return{id:t,full_name:e.session.fullName||n.email||"Portal user",role:e.session.role||"team",email:n.email||null}}let re=null;function un(e){re=e||null}function mn(){const e=sn();ne({id:"team-chat",mount(n,t){const r=re;re=null;const l=dn(t),c=cn({supabase:t.session.client,currentUserId:l.id});return e.mount(n,{currentUser:l,service:c,initialConversationId:r})}})}function fn(e,n={}){return e?e.author_id&&n[e.author_id]?.full_name?n[e.author_id].full_name:e.author_name||"Unknown":"Unknown"}function Pe(e){return!!e?.resolved_at}function pn(e=[]){const n=new Map,t=[];e.forEach(c=>{n.set(c.id,{...c,replies:[]})}),n.forEach(c=>{c.reply_to_id&&n.has(c.reply_to_id)?n.get(c.reply_to_id).replies.push(c):t.push(c)});const r=(c,u)=>String(c.created_at||"").localeCompare(String(u.created_at||"")),l=c=>{c.replies.sort(r),c.replies.forEach(l)};return t.sort(r),t.forEach(l),t}function hn(e=[]){return e.filter(n=>!Pe(n)).length}function Se(e,n=90){const t=String(e?.body||"").replace(/\s+/g," ").trim();return t.length<=n?t:`${t.slice(0,Math.max(0,n-1)).trimEnd()}…`}function A(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function ke(e={}){return e.taskId?"Task discussion":e.providerId?"Provider discussion":e.offerId?"Offer discussion":"Record discussion"}function gn(e={}){return e.taskId?`Task ${e.taskId}`:e.providerId?`Provider ${e.providerId}`:e.offerId?`Offer ${e.offerId}`:"No record scope"}function _n(){return{id:"record-discussion",mount(e,n){const t={comments:[],peopleById:Object.fromEntries((n.people||[]).map(g=>[g.id,g])),loading:!0,error:null,replyToId:null,taskSourceCommentId:null};let r=!1,l=null,c=null;e.classList.add("wein-discussion-root");async function u(){try{t.error=null,t.comments=await n.service.listComments(n.scope||{})}catch(g){t.error=g.message||String(g)}finally{t.loading=!1,r||D()}}async function h(g){const q=g.querySelector("[data-discussion-body]"),y=q.value.trim();y&&(q.value="",await n.service.postComment({...n.scope||{},body:y,replyToId:t.replyToId,people:n.people||[]}),t.replyToId=null,await u())}async function I(g){const q=e.querySelector(`[data-resolve-note="${CSS.escape(g)}"]`)?.value||"";await n.service.resolveComment(g,q),await u()}async function b(g){await n.service.reopenComment(g),await u()}async function p(g){const q=g.querySelector("[data-task-title]"),y=q.value.trim();!y||!t.taskSourceCommentId||(await n.service.createTaskFromComment(t.taskSourceCommentId,y,n.currentUser?.id||null),q.value="",t.taskSourceCommentId=null,await u())}function S(g,q=0){const y=Pe(g),U=fn(g,t.peopleById);return`
          <article class="discussion-comment${y?" resolved":""}" style="--depth:${Math.min(q,4)}">
            <div class="discussion-comment-meta">
              <span>${A(U)}</span>
              <span>${A(g.created_at||"")}</span>
              ${y?'<span class="discussion-resolved-pill">Resolved</span>':""}
            </div>
            <div class="discussion-comment-body">${A(g.body)}</div>
            ${g.resolved_note?`<div class="discussion-resolved-note">${A(g.resolved_note)}</div>`:""}
            <div class="discussion-actions">
              <button type="button" data-discussion-reply="${A(g.id)}">Reply</button>
              ${y?`<button type="button" data-discussion-reopen="${A(g.id)}">Reopen</button>`:`<button type="button" data-discussion-resolve="${A(g.id)}">Resolve</button>`}
              <button type="button" data-discussion-task="${A(g.id)}">Create task</button>
            </div>
            ${y?"":`<input class="discussion-resolve-note" data-resolve-note="${A(g.id)}" placeholder="Optional resolve note">`}
            ${g.replies?.length?`<div class="discussion-replies">${g.replies.map(F=>S(F,q+1)).join("")}</div>`:""}
          </article>
        `}function M(){if(!t.taskSourceCommentId)return"";const g=t.comments.find(q=>q.id===t.taskSourceCommentId);return`
          <form class="discussion-task-box" data-discussion-task-form>
            <div>
              <div class="discussion-eyebrow">Create task from comment</div>
              <p>${A(Se(g))}</p>
            </div>
            <input data-task-title type="text" placeholder="Task title">
            <div class="discussion-task-actions">
              <button type="submit">Create task</button>
              <button type="button" data-discussion-task-cancel>Cancel</button>
            </div>
          </form>
        `}function D(){const g=pn(t.comments),q=t.replyToId?t.comments.find(y=>y.id===t.replyToId):null;e.innerHTML=`
          <section class="discussion-shell" aria-label="${A(ke(n.scope))}">
            <header class="discussion-header">
              <div>
                <div class="discussion-eyebrow">${A(ke(n.scope))}</div>
                <h2>Discussion</h2>
                <p>${A(gn(n.scope))}</p>
              </div>
              <span class="discussion-count">${hn(t.comments)} unresolved</span>
            </header>
            ${t.error?`<div class="discussion-error">${A(t.error)}</div>`:""}
            ${M()}
            <div class="discussion-list">
              ${t.loading?'<div class="discussion-muted">Loading discussion...</div>':""}
              ${g.map(y=>S(y)).join("")}
              ${!t.loading&&!g.length?'<div class="discussion-muted">No comments yet.</div>':""}
            </div>
            <form class="discussion-composer" data-discussion-form>
              ${q?`
                <div class="discussion-replying">
                  Replying to: ${A(Se(q,70))}
                  <button type="button" data-discussion-cancel-reply>Cancel</button>
                </div>
              `:""}
              <textarea data-discussion-body rows="3" placeholder="Write a record-attached note..."></textarea>
              <button type="submit">${q?"Reply":"Post comment"}</button>
            </form>
          </section>
        `,e.querySelector("[data-discussion-form]")?.addEventListener("submit",y=>{y.preventDefault(),h(y.currentTarget)}),e.querySelector("[data-discussion-cancel-reply]")?.addEventListener("click",()=>{t.replyToId=null,D()}),e.querySelector("[data-discussion-task-cancel]")?.addEventListener("click",()=>{t.taskSourceCommentId=null,D()}),e.querySelector("[data-discussion-task-form]")?.addEventListener("submit",y=>{y.preventDefault(),p(y.currentTarget)}),e.querySelectorAll("[data-discussion-reply]").forEach(y=>{y.addEventListener("click",()=>{t.replyToId=y.dataset.discussionReply,D()})}),e.querySelectorAll("[data-discussion-resolve]").forEach(y=>{y.addEventListener("click",()=>I(y.dataset.discussionResolve))}),e.querySelectorAll("[data-discussion-reopen]").forEach(y=>{y.addEventListener("click",()=>b(y.dataset.discussionReopen))}),e.querySelectorAll("[data-discussion-task]").forEach(y=>{y.addEventListener("click",()=>{t.taskSourceCommentId=y.dataset.discussionTask,D()})})}return u(),l=setInterval(()=>u(),3e4),typeof n.service.subscribeToDiscussionEvents=="function"&&(c=n.service.subscribeToDiscussionEvents(()=>u())),()=>{r=!0,l&&clearInterval(l),c&&c(),e.classList.remove("wein-discussion-root"),e.innerHTML=""}}}}function x(e){if(e)throw e}function vn({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t({taskId:b,providerId:p,offerId:S}={}){let M=e.from("wein_comments").select("*").order("created_at",{ascending:!0});b&&(M=M.eq("task_id",b)),p&&(M=M.eq("provider_id",p)),S&&(M=M.eq("offer_id",S));const{data:D,error:g}=await M;return x(g),D||[]}async function r({body:b,taskId:p=null,providerId:S=null,offerId:M=null,replyToId:D=null,people:g=[]}){const q=p?{task_id:p}:S?{provider_id:S}:M?{offer_id:M}:null;if(!q)throw new Error("postComment requires taskId, providerId, or offerId");const{data:y,error:U}=await e.from("wein_comments").insert({...q,reply_to_id:D,body:b,author_role:"team"}).select("*").single();x(U);for(const F of Z(b,g))try{await u(y.id,F)}catch(V){console.error("Failed to record comment mention",V)}return y}async function l(b,p=""){const{data:S,error:M}=await e.from("wein_comments").update({resolved_at:new Date().toISOString(),resolved_note:p}).eq("id",b).select("*");if(x(M),!S?.length)throw new Error("Resolve affected zero comments");return S[0]}async function c(b){const{data:p,error:S}=await e.from("wein_comments").update({resolved_at:null,resolved_note:null}).eq("id",b).select("*");if(x(S),!p?.length)throw new Error("Reopen affected zero comments");return p[0]}async function u(b,p){const{data:S,error:M}=await e.from("wein_comment_mentions").insert({comment_id:b,mentioned_user_id:p}).select("*");return x(M),S?.[0]||null}async function h(b,p,S=null,M=null){const{data:D,error:g}=await e.rpc("wein_create_task_from_comment",{p_comment_id:b,p_title:p,p_assigned_to_user_id:S,p_due_date:M});return x(g),D}function I(b){if(!e.channel)return()=>{};const p=e.channel(`record-discussion:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},b).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},b).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_task_links"},b).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(p);if(p?.unsubscribe)return p.unsubscribe()}}return{listComments:t,postComment:r,resolveComment:l,reopenComment:c,addMention:u,createTaskFromComment:h,subscribeToDiscussionEvents:I}}function R(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}const bn={critical:"Critical",high:"High",medium:"Medium",low:"Low"},yn={task:"Task",mention:"Mention",discussion:"Discussion",review:"Review"};function wn(e){if(!e)return"No due date";const n=new Date(e);return Number.isNaN(n.getTime())?String(e):n.toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function $n(e=[]){return["critical","high","medium","low"].map(n=>({severity:n,items:e.filter(t=>t.severity===n)})).filter(n=>n.items.length)}function Sn(){return{id:"work-inbox",mount(e,n){const t={items:[],loading:!0,error:null};let r=!1,l=null,c=null;e.classList.add("wein-work-inbox-root");async function u(){try{t.error=null,t.items=await n.service.loadInbox()}catch(p){t.error=p.message||String(p)}finally{t.loading=!1,r||b()}}function h(p){if(typeof n.onSelectItem=="function"){n.onSelectItem(p);return}p.href&&(window.location.hash=p.href)}function I(p){return`
          <button type="button" class="work-inbox-item severity-${R(p.severity)}" data-inbox-item="${R(p.kind)}:${R(p.entity_id)}:${R(p.reason_code)}">
            <span class="work-inbox-kind">${R(yn[p.kind]||p.kind)}</span>
            <span class="work-inbox-title">${R(p.title)}</span>
            <span class="work-inbox-reason">${R(p.reason_code.replaceAll("_"," "))}</span>
            <span class="work-inbox-due">${R(wn(p.due_at))}</span>
            <span class="work-inbox-action">${R(p.next_action)}</span>
          </button>
        `}function b(){const p=$n(t.items);e.innerHTML=`
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
              ${p.map(S=>`
                <section class="work-inbox-group">
                  <h3>${R(bn[S.severity])}</h3>
                  ${S.items.map(I).join("")}
                </section>
              `).join("")}
              ${!t.loading&&!t.items.length?'<div class="work-inbox-muted">No attention items right now.</div>':""}
            </div>
          </section>
        `,e.querySelector("[data-inbox-refresh]")?.addEventListener("click",()=>u()),e.querySelectorAll("[data-inbox-item]").forEach(S=>{S.addEventListener("click",()=>{const M=S.dataset.inboxItem,D=t.items.find(g=>`${g.kind}:${g.entity_id}:${g.reason_code}`===M);D&&h(D)})})}return u(),l=setInterval(()=>u(),6e4),typeof n.service.subscribeToInboxEvents=="function"&&(c=n.service.subscribeToInboxEvents(()=>u())),()=>{r=!0,l&&clearInterval(l),c&&c(),e.classList.remove("wein-work-inbox-root"),e.innerHTML=""}}}}const Me={critical:0,high:1,medium:2,low:3};function me(e,n=new Date){if(!e)return"low";const t=new Date(e);if(Number.isNaN(t.getTime()))return"low";const r=t.getTime()-n.getTime();return r<0?"critical":r<=1440*60*1e3?"high":r<=4320*60*1e3?"medium":"low"}function kn(e,{now:n=new Date}={}){return{kind:"task",entity_id:e.id,title:e.title||"Untitled task",reason_code:e.due_date?"task_due":"task_open",severity:me(e.due_date,n),owner_id:e.assigned_to_user_id||e.owner_id||null,due_at:e.due_date||null,next_action:"Open task",href:`#tasks/${e.id}`,source:e}}function Mn(e,{comment:n,currentUserId:t}={}){return{kind:"mention",entity_id:e.comment_id,title:n?.body?`Mention: ${n.body}`:"Mention in discussion",reason_code:"unresolved_mention",severity:n?.resolved_at?"low":"high",owner_id:t||e.mentioned_user_id,due_at:n?.created_at||e.created_at||null,next_action:"Reply or resolve",href:`#comments/${e.comment_id}`,source:{mention:e,comment:n}}}function En(e,{currentUserId:n,now:t=new Date}={}){return{kind:"discussion",entity_id:e.id,title:e.body||"Discussion awaiting reply",reason_code:"thread_awaiting_reply",severity:me(e.next_reply_due_at||e.created_at,t),owner_id:n||null,due_at:e.next_reply_due_at||null,next_action:"Reply in thread",href:`#comments/${e.id}`,source:e}}function Cn(e,{now:n=new Date}={}){return{kind:e.kind||"review",entity_id:e.id,title:e.title||e.offer_title||"Founder review needed",reason_code:e.reason_code||"founder_review",severity:me(e.due_at||e.created_at,n),owner_id:e.owner_id||null,due_at:e.due_at||e.created_at||null,next_action:"Review",href:e.href||`#review/${e.id}`,source:e}}function In(e=[]){return[...e].sort((n,t)=>{const r=(Me[n.severity]??9)-(Me[t.severity]??9);return r||String(n.due_at||"").localeCompare(String(t.due_at||""))})}function qn(e=[]){const n=new Set;return e.filter(t=>{const r=`${t.kind}:${t.entity_id}:${t.reason_code}`;return n.has(r)?!1:(n.add(r),!0)})}function Tn({tasks:e=[],mentions:n=[],commentsById:t={},awaitingReplies:r=[],founderReviews:l=[]},c={}){const u=[...e.map(h=>kn(h,c)),...n.map(h=>Mn(h,{...c,comment:t[h.comment_id]})),...r.map(h=>En(h,c)),...l.map(h=>Cn(h,c))];return In(qn(u))}function Ee(e){if(e)throw e}function Dn({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(){let u=e.from("wein_tasks").select("*").neq("status","done").order("due_date",{ascending:!0,nullsFirst:!1});n&&(u=u.eq("assigned_to_user_id",n));const{data:h,error:I}=await u;return Ee(I),h||[]}async function r(){const{data:u,error:h}=await e.from("wein_comment_mentions").select("comment_id,mentioned_user_id,created_at,wein_comments(*)").eq("mentioned_user_id",n).is("wein_comments.resolved_at",null).order("created_at",{ascending:!0});return Ee(h),u||[]}async function l(){const[u,h]=await Promise.all([t(),r()]),I={},b=h.map(p=>{const S=p.wein_comments||p.comment||null;return S?.id&&(I[S.id]=S),{comment_id:p.comment_id,mentioned_user_id:p.mentioned_user_id,created_at:p.created_at}});return Tn({tasks:u,mentions:b,commentsById:I},{currentUserId:n})}function c(u){if(!e.channel)return()=>{};const h=e.channel(`work-inbox:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_tasks"},u).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},u).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},u).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(h);if(h?.unsubscribe)return h.unsubscribe()}}return{fetchOpenTasks:t,fetchUnresolvedMentions:r,loadInbox:l,subscribeToInboxEvents:c}}const Ue=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function An(e){for(const n of Ue)ne({id:n,mount:()=>{e[n]()}})}function fe(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const Ln=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function Rn(e,n){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${Ln.map(t=>`<button class="chip ${e===t?"active":""}" type="button" onclick="${n}('${t.replace(/'/g,"\\'")}')">${t==="all"?"All":fe(t)}</button>`).join("")}</div>`}function On(e,n){return n==="all"||String(e||"")===n}function Nn(e){return String(e?.category||e?.vertical||"-")}function Pn(e){const n=String(e||"").toLowerCase();return n.includes("dining")?"dining":n.includes("health")?"health":n.includes("fun")?"fun":n.includes("hotel")?"hotels":""}function Un(e,n=Date.now()){return e?Math.floor((n-new Date(e).getTime())/864e5):0}function ie(e=new Date){const n=new Date(e);return n.setHours(0,0,0,0),n}function Fn(e,n=new Date){return e?Math.round((ie(n).getTime()-ie(e).getTime())/864e5):null}function Fe(e,n){let t=String(e||"").replace(/\D/g,"");if(!t)return null;t.startsWith("0")&&(t=`20${t.slice(1)}`);const r=`Hi! Following up on the WeIN offer sheet for ${n} - do you have 5 minutes today?`;return`https://wa.me/${t}?text=${encodeURIComponent(r)}`}function xn(e,n){const t=Fe(e,n);return t?`<a class="mini-btn" href="${fe(t)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function G(e){return e.id}function Hn(e){return T("profiles").find(n=>G(n)===e)??null}function Bn(e){return T("providers").find(n=>G(n)===e)??null}function jn(e){return T("leads").find(n=>G(n)===e)??null}function Wn(e){return T("tasks").find(n=>G(n)===e)??null}function zn(e){return T("offers").find(n=>G(n)===e)??null}function Gn(e){return T("offers").filter(n=>n.provider_id===e)}function Vn(e){return T("tasks").filter(n=>n.provider_id===e)}function Yn(e){return T("tasks").filter(n=>n.lead_id===e)}const Qn=Object.freeze(Object.defineProperty({__proto__:null,leadById:jn,offerById:zn,offersForProvider:Gn,profileById:Hn,providerById:Bn,taskById:Wn,tasksForLead:Yn,tasksForProvider:Vn},Symbol.toStringTag,{value:"Module"}));jt();mn();const xe={api:De,auth:{canDelete:oe,canManageDeals:Ie,canEditProviderProfile:qe,navHiddenForRole:ce,defaultViewForRole:Te},platform:{getSupabaseClient:le,getAccessToken:te,getSessionContext:Tt},shared:{escapeHtml:fe,daysSince:Un,startOfLocalDay:ie,dayDiffFromToday:Fn,whatsappLink:Fe,whatsappButtonHtml:xn,categoryChipsHtml:Rn,matchesCategoryFilter:On,categoryLabel:Nn,catBadgeClass:Pn},core:{createPortalContext:Ft,getView:Re,mountView:Bt,registeredViewIds:xt,registerView:ne},legacy:{LEGACY_VIEW_IDS:Ue,registerLegacyViews:An},features:{requestOpenChatConversation:un,createDiscussionViewModule:_n,createSupabaseDiscussionService:vn,createWorkInboxViewModule:Sn,createSupabaseWorkInboxService:Dn},store:Le,selectors:Qn};window.WEIN_PORTAL_MODULES=xe;for(const e of window.WEIN_PORTAL_MODULES_READY??[])e(xe);window.WEIN_PORTAL_MODULES_READY=[];
