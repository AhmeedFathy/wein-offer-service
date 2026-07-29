function qe(e){return typeof e=="object"&&e!==null?e.role:e}function ce(e){const n=qe(e);return n==="admin"||n==="manager"}const De=ce;function Ae(e){const n=qe(e);return n==="admin"||n==="manager"||n==="deal_breaker"}const Lt={deal_breaker:["analytics","settings"],team:["analytics","settings","leads","pipeline","deals","launch","providers","offers","map","marketing"]};function le(e){return e?Lt[e]??[]:[]}function Le(e){return le(e).includes("pipeline")?"tasks":"pipeline"}function R(){return window.WEIN_PORTAL_LEGACY??{}}function ee(){const e=R().supabaseClient;if(!e)throw new Error("Portal Supabase client is not available yet.");return e}function te(){const e=R().getSupabaseUrl?.();if(!e)throw new Error("Portal Supabase URL is not available yet.");return e}function Ot(){const e=R().getSupabaseAnonKey?.();if(!e)throw new Error("Portal Supabase anon key is not available yet.");return e}function ne(){return R().getAccessToken?.()??null}function Rt(){return{client:ee(),accessToken:ne()}}class Nt extends Error{constructor(n,t,r){super(n),this.status=t,this.body=r,this.name="PortalApiError"}status;body}function z(){const e=R().headers?.();if(e)return e;const n=Ot();return{apikey:n,Authorization:`Bearer ${ne()||n}`,"Content-Type":"application/json"}}async function de(e,n){if(e.ok)return;const t=await e.text();throw new Nt(`Supabase ${n} failed: ${e.status}${t?` ${t}`:""}`,e.status,t)}async function Pt(e){const n=R().get;if(n)return n(e);const t=await fetch(`${te()}/rest/v1/${e}`,{headers:z()});return await de(t,"GET"),t.json()}async function Ut(e,n){const t=R().post;if(t)return t(e,n);const r=await fetch(`${te()}/rest/v1/${e}`,{method:"POST",headers:{...z(),Prefer:"return=representation"},body:JSON.stringify(n)});return await de(r,"POST"),r.json()}async function Ft(e,n){const t=R().patch;return t?t(e,n):(await fetch(`${te()}/rest/v1/${e}`,{method:"PATCH",headers:z(),body:JSON.stringify(n)})).ok}async function xt(e){const n=R().delete;if(n)return n(e);const t=await fetch(`${te()}/rest/v1/${e}`,{method:"DELETE",headers:z()});return await de(t,"DELETE"),!0}const Oe={headers:z,get:Pt,post:Ut,patch:Ft,delete:xt},Bt={providers:[],offers:[],negotiations:[],files:[],leads:[],outcomes:[],tasks:[],profiles:[],redemptions:[],campaigns:[],calendarNotes:[]};function Ht(){const e=R().getCaches?.();return e?{providers:e.providers??[],offers:e.offers??[],negotiations:e.negotiations??[],files:e.files??[],leads:e.leads??[],outcomes:e.outcomes??[],tasks:e.tasks??[],profiles:e.profiles??[],redemptions:e.redemptions??[],campaigns:e.campaigns??[],calendarNotes:e.calendarNotes??[]}:Bt}function T(e){return Ht()[e]}function Re(e,n){const t=R().setCache;if(!t)throw new Error("Portal cache bridge is not available yet.");t(e,[...n])}function Wt(e,n){Re(e,n(T(e)))}const Ne={get providers(){return T("providers")},get offers(){return T("offers")},get negotiations(){return T("negotiations")},get files(){return T("files")},get leads(){return T("leads")},get outcomes(){return T("outcomes")},get tasks(){return T("tasks")},get profiles(){return T("profiles")},get redemptions(){return T("redemptions")},get campaigns(){return T("campaigns")},get calendarNotes(){return T("calendarNotes")},getCache:T,replaceCache:Re,updateCache:Wt};function J(){const e=window.WEIN??{};return{user:e.user,role:e.role??sessionStorage.getItem("weinRole"),fullName:e.fullName??null,accessToken:ne(),client:ee()}}function jt(){const e=J();return{api:Oe,store:Ne,session:e,permissions:{canDelete:()=>ce(J()),canManageDeals:()=>De(J()),canEditProviderProfile:()=>Ae(J()),navHiddenForRole:le,defaultViewForRole:Le},navigate(n,t){window.showView?.(n,t)}}}const j=new Map;let X=null;function ae(e){if(!e.id)throw new Error("View id is required.");if(j.has(e.id))throw new Error(`View already registered: ${e.id}`);j.set(e.id,e)}function Pe(e){return j.get(e)}function zt(){return[...j.keys()]}function Gt(){if(!X)return;const e=X;X=null,e()}function Vt(e,n,t){const r=Pe(e);if(!r)throw new Error(`Unknown portal view: ${e}`);Gt();const c=r.mount(n,t);X=typeof c=="function"?c:null}function Yt(){j.has("__dummy_cleanup_probe")||ae({id:"__dummy_cleanup_probe",mount(e){return window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0,e.innerHTML='<div class="view-header"><div><div class="view-title">Dummy Cleanup Probe</div><div class="view-count">Registry test view</div></div></div>',()=>{window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT=(window.WEIN_PORTAL_DUMMY_CLEANUP_COUNT??0)+1}}})}function Qt(e="chat"){const n=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;return`${e}-${n}`}function ye(e,n){return e.kind==="group"?e.title||"Untitled group":(e.members||[]).map(r=>r.profile).find(r=>r&&r.id!==n)?.full_name||"Direct message"}function Kt(e){return[...e].sort((n,t)=>{const r=n.last_message?.created_at||n.created_at,c=t.last_message?.created_at||t.created_at;return new Date(c).getTime()-new Date(r).getTime()})}function Jt(e,n){const t=(e.members||[]).find(c=>c.user_id===n),r=e.last_message?.message_seq||0;return Math.max(0,r-(t?.last_read_seq||0))}function Xt(e){if(!e)return"No messages yet";const n=(e.deleted_at?"Message deleted":e.body||"").trim();return n.length>82?`${n.slice(0,79)}...`:n}const Zt=/[\s\p{P}]/u,en=/[\s\p{P}]/u;function Ue(e,n){return n===0?!0:Zt.test(e[n-1])}function tn(e,n){return n>=e.length?!0:en.test(e[n])}function Z(e="",n=[]){const t=String(e??"");if(!t.includes("@"))return[];const r=n.filter(f=>f&&f.id&&f.full_name).map(f=>({id:f.id,name:String(f.full_name)})).sort((f,M)=>M.name.length-f.name.length);if(!r.length)return[];const c=t.toLowerCase(),l=[],u=new Set;for(let f=0;f<t.length;f+=1){if(t[f]!=="@"||!Ue(t,f))continue;const M=f+1;for(const b of r){const h=M+b.name.length;if(c.startsWith(b.name.toLowerCase(),M)&&tn(t,h)){u.has(b.id)||(u.add(b.id),l.push(b.id)),f=h-1;break}}}return l}function nn(e="",n=[]){const t=new Set(Z(e,n));return n.filter(r=>r&&t.has(r.id)&&r.full_name).map(r=>String(r.full_name)).sort((r,c)=>c.length-r.length)}function an(e="",n=0){const t=String(e??""),r=Math.max(0,Math.min(Number(n)||0,t.length)),c=40;for(let l=r-1;l>=0&&r-l<=c;l-=1){const u=t[l];if(u==="@")return Ue(t,l)?{query:t.slice(l+1,r),start:l}:null;if(u===`
`)return null}return null}function m(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function B(e){return{admin:"Admin",manager:"Manager",deal_breaker:"Deal breaker",team:"Team"}[e]||e}function sn(e){return`${e}-${Math.random().toString(16).slice(2)}-${Date.now().toString(36)}`}function we(e){return typeof e=="string"&&e.startsWith("image/")}function rn(e){const n=Number(e)||0;return n<1024?`${n} B`:n<1024*1024?`${(n/1024).toFixed(1)} KB`:`${(n/(1024*1024)).toFixed(1)} MB`}function Se(e){return e==="application/pdf"?"ti-file-type-pdf":e?.includes("word")?"ti-file-type-doc":e?.includes("sheet")||e?.includes("excel")?"ti-file-type-xls":"ti-file"}function on(e,n=new Date){if(!e)return"";const t=new Date(e);if(Number.isNaN(t.getTime()))return"";const r=n.getTime()-t.getTime(),c=Math.floor(r/6e4);if(c<1)return"now";if(c<60)return`${c}m`;const l=Math.floor(c/60);return l<24?`${l}h`:r<6*864e5?t.toLocaleDateString(void 0,{weekday:"short"}):t.toLocaleDateString(void 0,{month:"short",day:"numeric"})}const cn=300*1e3;function ln(e,n){if(!n||e.sender_id!==n.sender_id)return!0;const t=new Date(e.created_at).getTime()-new Date(n.created_at).getTime();return!(t>=0&&t<cn)}function dn(){return{id:"team-chat",mount(e,n){const t={profiles:[],conversations:[],messages:[],selectedConversationId:null,editingMessageId:null,editDraft:"",replyToMessageId:null,composeOpen:!1,composeSearch:"",composeGroupTitle:"",composeSelectedMemberIds:new Set,membersOpen:!1,memberAddOpen:!1,memberSearch:"",memberSelectedIds:new Set,renameOpen:!1,renameDraft:"",archiveConfirmOpen:!1,mentionQuery:null,mentionIndex:0,mentionStart:0,mentionDraft:"",pendingAttachments:[],openMessageMenuId:null,confirmingDeleteMessageId:null,loading:!0,error:null},r=new Map,c=new Set;let l=!1,u=n.initialConversationId||null,f=null,M=null,b=!1;function h(){const a=e.querySelector(".chat-message-list");return a?a.scrollHeight-a.scrollTop-a.clientHeight<80:!0}function $(){const a=e.querySelector(".chat-message-list");a&&(a.scrollTop=a.scrollHeight)}function C(a){a.style.height="auto",a.style.height=`${Math.min(a.scrollHeight,120)}px`}function q(a){return a?a.members.filter(s=>!s.left_at&&s.profile).map(s=>s.profile):[]}function g(a){const s=String(t.mentionQuery||"").trim().toLowerCase(),i=q(a).filter(d=>d.id!==n.currentUser.id);return s?i.filter(d=>(d.full_name||"").toLowerCase().includes(s)):i}function I({rerender:a=!0}={}){t.mentionQuery!==null&&(t.mentionQuery=null,t.mentionIndex=0,a&&_())}function y(a){t.mentionDraft=a.value;const s=an(a.value,a.selectionStart??a.value.length),i=s?s.query:null;return i===t.mentionQuery?!1:(t.mentionQuery=i,t.mentionStart=s?s.start:0,t.mentionIndex=0,!0)}function U(a,s){const i=e.querySelector("[data-chat-composer]");if(!i||!s)return;const d=i.selectionStart??i.value.length,p=i.value.slice(0,t.mentionStart),S=i.value.slice(d),k=`@${s.full_name} `,v=`${p}${k}${S}`,D=p.length+k.length;t.mentionQuery=null,t.mentionIndex=0,t.mentionDraft=v,_();const E=e.querySelector("[data-chat-composer]");E&&(E.value=v,C(E),E.focus(),E.setSelectionRange?.(D,D))}function F(a,s){const i=g(a);if(!i.length)return;const d=(t.mentionIndex+s+i.length)%i.length;t.mentionIndex=d;const p=e.querySelector("[data-chat-composer]")?.value??t.mentionDraft,S=e.querySelector("[data-chat-composer]")?.selectionStart??p.length;t.mentionDraft=p,_();const k=e.querySelector("[data-chat-composer]");k&&(k.value=p,C(k),k.focus(),k.setSelectionRange?.(S,S))}e.classList.add("wein-chat-root");function V(a){const s=a.target;if(s instanceof Element){if(t.composeOpen&&!s.closest("[data-chat-compose-popover]")&&!s.closest("[data-chat-compose-toggle]")){Y();return}if(t.membersOpen&&!s.closest("[data-chat-members-panel]")&&!s.closest("[data-chat-members-toggle]")){Q();return}t.openMessageMenuId&&!s.closest("[data-chat-message-menu-panel]")&&!s.closest("[data-chat-message-menu]")&&(t.openMessageMenuId=null,_())}}function pe(a){if(a.key==="Escape"){if(t.composeOpen){Y();return}if(t.membersOpen){Q();return}(t.openMessageMenuId||t.confirmingDeleteMessageId)&&(t.openMessageMenuId=null,t.confirmingDeleteMessageId=null,_())}}e.addEventListener?.("click",V),typeof document<"u"&&document.addEventListener("keydown",pe);async function L({keepMessages:a=!0}={}){try{t.error=null;const[s,i]=await Promise.all([n.service.listProfiles(),n.service.listConversations()]);if(t.profiles=s,t.conversations=Kt(i),u&&(t.conversations.some(d=>d.id===u)&&(t.selectedConversationId=u),u=null),!t.selectedConversationId&&t.conversations.length&&(t.selectedConversationId=t.conversations[0].id),t.selectedConversationId&&a){t.messages=await n.service.listMessages(t.selectedConversationId);const d=t.messages.at(-1)?.message_seq||0;if(d)try{await n.service.markRead(t.selectedConversationId,d)}catch(p){console.error("Failed to mark chat messages as read",p)}}}catch(s){t.error=s.message||String(s)}finally{t.loading=!1,l||_()}}async function se(a){t.selectedConversationId=a,t.membersOpen=!1,t.memberAddOpen=!1,t.memberSearch="",t.memberSelectedIds=new Set,t.renameOpen=!1,t.renameDraft="",t.archiveConfirmOpen=!1,t.pendingAttachments=[],e.classList.add("chat-has-selection"),t.messages=await n.service.listMessages(a),b=!0,l||_();const s=t.messages.at(-1)?.message_seq||0;if(s)try{await n.service.markRead(a,s)}catch(i){console.error("Failed to mark chat messages as read",i)}await L()}function he(){e.classList.remove("chat-has-selection")}function re(a){const s=t.selectedConversationId;if(!s)return;const i=[...a||[]];for(const d of i){const p={id:sn("pending"),name:d.name,mime:d.type||"application/octet-stream",size:d.size,status:"uploading",error:null,uploaded:null};t.pendingAttachments=[...t.pendingAttachments,p],n.service.uploadAttachment(s,d).then(S=>{p.status="done",p.uploaded=S,l||_()}).catch(S=>{p.status="error",p.error=S?.message||"Upload failed",l||_()})}_()}function ze(a){t.pendingAttachments=t.pendingAttachments.filter(s=>s.id!==a),_()}async function Ge(a){const s=a.querySelector("[data-chat-composer]"),i=s.value.trim(),d=t.pendingAttachments.some(E=>E.status==="uploading"),p=t.pendingAttachments.filter(E=>E.status==="done").map(E=>E.uploaded);if(d||!i&&!p.length||!t.selectedConversationId)return;const S=t.replyToMessageId,k=t.conversations.find(E=>E.id===t.selectedConversationId)||null,v=Z(i,q(k));s.value="",t.replyToMessageId=null,t.mentionQuery=null,t.mentionDraft="",t.pendingAttachments=[];const D=await n.service.sendMessage({conversationId:t.selectedConversationId,body:i,clientNonce:Qt("portal-chat"),replyToId:S,mentionedUserIds:v,attachments:p});t.messages=[...t.messages,D],b=!0,l||_();try{await n.service.markRead(t.selectedConversationId,D.message_seq)}catch(E){console.error("Failed to mark chat message as read",E)}await L()}function Ve(a){a&&(t.replyToMessageId=a,_(),e.querySelector("[data-chat-composer]")?.focus())}function Ye(){t.replyToMessageId=null,_()}function Qe(){t.composeOpen=!0,_(),e.querySelector("[data-chat-compose-search]")?.focus()}function Y({reset:a=!1}={}){t.composeOpen=!1,a&&(t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set),_()}function Ke(a,s){const i=new Set(t.composeSelectedMemberIds);s?i.add(a):i.delete(a),t.composeSelectedMemberIds=i,_()}function ge(a){return a.members.find(i=>i.user_id===n.currentUser.id&&!i.left_at)?.membership_role==="owner"||["admin","manager"].includes(n.currentUser.role)}function ve(a){return!a||a.kind!=="group"?!1:ge(a)}function Je(a){return a?ge(a):!1}function Xe(){t.membersOpen=!0,_()}function Q({reset:a=!1}={}){t.membersOpen=!1,t.memberAddOpen=!1,a&&(t.memberSearch="",t.memberSelectedIds=new Set),_()}function Ze(){t.memberAddOpen=!t.memberAddOpen,_(),t.memberAddOpen&&e.querySelector("[data-chat-member-search]")?.focus()}function et(a,s){const i=new Set(t.memberSelectedIds);s?i.add(a):i.delete(a),t.memberSelectedIds=i,_()}async function tt(a){const s=[...t.memberSelectedIds];if(!(!a||!s.length)){for(const i of s)await n.service.addMember(a,i);t.memberSearch="",t.memberSelectedIds=new Set,t.memberAddOpen=!1,l||_(),await L()}}async function nt(a,s){!a||!s||(await n.service.removeMember(a,s),t.conversations=t.conversations.map(i=>i.id!==a?i:{...i,members:i.members.map(d=>d.user_id===s?{...d,left_at:d.left_at||new Date().toISOString()}:d)}),s===n.currentUser.id&&(t.membersOpen=!1,t.memberAddOpen=!1),l||_(),await L())}function at(a){const s=t.messages.find(d=>d.id===a);if(!s)return;t.editingMessageId=a,t.editDraft=s.body||"",_();const i=e.querySelector(`[data-chat-edit-input="${CSS.escape(a)}"]`);i?.focus(),i?.select?.()}function st(){t.editingMessageId=null,t.editDraft="",_()}async function rt(a){const s=a.dataset.chatEditForm,d=a.querySelector("[data-chat-edit-input]").value.trim();if(!s||!d)return;const p=t.conversations.find(k=>k.id===t.selectedConversationId)||null,S=await n.service.updateMessage(s,d,Z(d,q(p)));t.messages=t.messages.map(k=>k.id===S.id?S:k),t.editingMessageId=null,t.editDraft="",l||_(),await L()}async function it(a){if(!a)return;const s=await n.service.deleteMessage(a);t.messages=t.messages.map(i=>i.id===a?{...i,...s,body:"Message deleted",deleted_at:s.deleted_at||new Date().toISOString()}:i),t.replyToMessageId===a&&(t.replyToMessageId=null),t.confirmingDeleteMessageId=null,t.openMessageMenuId=null,l||_(),await L()}async function ot(a){const i=a.members.find(d=>d.user_id===n.currentUser.id)?.notification_level==="muted"?"all":"muted";await n.service.setNotificationLevel(a.id,i),t.conversations=t.conversations.map(d=>d.id!==a.id?d:{...d,members:d.members.map(p=>p.user_id===n.currentUser.id?{...p,notification_level:i}:p)}),l||_(),await L()}function ct(a){t.renameOpen=!0,t.renameDraft=a.title||"",_(),e.querySelector("[data-chat-rename-input]")?.focus()}function lt(){t.renameOpen=!1,t.renameDraft="",_()}async function dt(a,s){const i=(s||"").trim();i&&(await n.service.renameConversation(a.id,i),t.conversations=t.conversations.map(d=>d.id===a.id?{...d,title:i}:d),t.renameOpen=!1,t.renameDraft="",l||_(),await L())}function ut(){t.archiveConfirmOpen=!0,_()}function mt(){t.archiveConfirmOpen=!1,_()}async function ft(a,s){await n.service.setConversationArchived(a.id,s),t.archiveConfirmOpen=!1,t.selectedConversationId===a.id&&(t.selectedConversationId=null,he()),t.conversations=t.conversations.map(i=>i.id===a.id?{...i,archived_at:new Date().toISOString()}:i),l||_(),await L()}async function pt(a,s,i){!a||!s||(await n.service.setMembershipRole(a,s,i),t.conversations=t.conversations.map(d=>d.id!==a?d:{...d,members:d.members.map(p=>p.user_id===s?{...p,membership_role:i}:p)}),l||_(),await L())}async function ht(a){if(!a)return;const s=await n.service.getOrCreateDm(a);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await se(s)}async function gt(a,s){if(a=a.trim(),!a)return;const i=await n.service.createGroup(a,s);t.composeOpen=!1,t.composeSearch="",t.composeGroupTitle="",t.composeSelectedMemberIds=new Set,await se(i)}function vt(){l||L()}function _t(a){const s=a.id===t.selectedConversationId?" selected":"",i=a.unread_count?`<span class="chat-count">${a.unread_count}</span>`:"",d=ye(a,n.currentUser.id),p=on(a.last_message?.created_at);return`
          <button type="button" class="chat-conversation${s}" data-chat-select="${m(a.id)}">
            <span class="chat-conversation-avatar" aria-hidden="true">${m((d||"?").slice(0,1).toUpperCase())}</span>
            <span class="chat-conversation-body">
              <span class="chat-conversation-row">
                <span class="chat-conversation-title">${m(d)}</span>
                ${p?`<span class="chat-conversation-timestamp">${m(p)}</span>`:""}
                ${i}
              </span>
              <span class="chat-conversation-preview">${m(Xt(a.last_message))}</span>
            </span>
          </button>
        `}function bt(){return["admin","manager"].includes(n.currentUser.role)}function yt(a){if(!t.composeOpen)return"";const s=t.composeSearch.trim().toLowerCase(),i=a.filter(S=>!s||(S.full_name||"").toLowerCase().includes(s)),d=t.composeSelectedMemberIds.size,p=d===1?[...t.composeSelectedMemberIds][0]:"";return`
          <div class="chat-compose-popover" data-chat-compose-popover role="dialog" aria-label="New conversation">
            <div class="chat-compose-popover-head">
              <strong>New conversation</strong>
              <button type="button" class="chat-icon-btn" data-chat-compose-close aria-label="Close new conversation"><i class="ti ti-x"></i></button>
            </div>
            <input data-chat-compose-search type="search" placeholder="Search people..." value="${m(t.composeSearch)}" autocomplete="off">
            <div class="chat-compose-summary">${d} selected</div>
            <div class="chat-compose-list">
              ${i.map(S=>{const k=t.composeSelectedMemberIds.has(S.id)?" checked":"";return`
                  <label class="chat-compose-person">
                    <input type="checkbox" data-chat-compose-member="${m(S.id)}"${k}>
                    <span class="chat-compose-avatar">${m((S.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${m(S.full_name||"Unknown")}</strong>
                      <span>${m(B(S.role))}</span>
                    </span>
                  </label>
                `}).join("")}
              ${i.length?"":'<div class="chat-muted">No matching people.</div>'}
            </div>
            <div class="chat-compose-actions">
              <button type="button" data-chat-start-dm="${m(p)}"${d===1?"":" disabled"}><i class="ti ti-message"></i><span>Start DM</span></button>
              <div class="chat-compose-group">
                <input data-chat-group-title type="text" placeholder="Group name" value="${m(t.composeGroupTitle)}">
                <button type="button" data-chat-create-group${t.composeGroupTitle.trim()?"":" disabled"}><i class="ti ti-users-plus"></i><span>Create group</span></button>
              </div>
            </div>
          </div>
        `}function wt(a){if(t.mentionQuery===null||!a)return"";const s=g(a);if(!s.length)return"";const i=Math.min(t.mentionIndex,s.length-1);return`
          <div class="chat-compose-popover chat-mention-picker" data-chat-mention-picker role="listbox" aria-label="Mention someone">
            ${s.map((d,p)=>`
              <button
                type="button"
                class="chat-compose-person chat-mention-option${p===i?" active":""}"
                data-chat-mention-pick="${m(d.id)}"
                role="option"
                aria-selected="${p===i}"
              >
                <span class="chat-compose-avatar">${m((d.full_name||"?").slice(0,1))}</span>
                <span class="chat-compose-person-copy">
                  <strong>${m(d.full_name||"Unknown")}</strong>
                  <span>${m(B(d.role))}</span>
                </span>
              </button>
            `).join("")}
          </div>
        `}function St(a){if(!t.membersOpen||!a||a.kind!=="group")return"";const s=a.members.filter(v=>!v.left_at),i=ve(a),d=new Set(s.map(v=>v.user_id)),p=t.memberSearch.trim().toLowerCase(),S=t.profiles.filter(v=>v.id!==n.currentUser.id&&!d.has(v.id)&&(!p||(v.full_name||"").toLowerCase().includes(p))),k=t.memberSelectedIds.size;return`
          <div class="chat-compose-popover chat-members-panel" data-chat-members-panel role="dialog" aria-label="Manage members">
            <div class="chat-compose-popover-head">
              <strong>Manage members</strong>
              <button type="button" class="chat-icon-btn" data-chat-members-close aria-label="Close member management"><i class="ti ti-x"></i></button>
            </div>
            <div class="chat-member-panel-list">
              ${s.map(v=>{const D=v.profile||{},E=v.user_id===n.currentUser.id,K=i||E;return`
                  <div class="chat-member-row" data-chat-member-row="${m(v.user_id)}">
                    <span class="chat-compose-avatar">${m((D.full_name||"?").slice(0,1))}</span>
                    <span class="chat-compose-person-copy">
                      <strong>${m(D.full_name||v.user_id)}</strong>
                      <span>${m(D.role?B(D.role):"Member")}</span>
                    </span>
                    ${v.membership_role==="owner"?'<span class="chat-owner-badge">Owner</span>':""}
                    ${i?`
                      <button type="button" class="chat-member-promote" data-chat-promote-member="${m(v.user_id)}" data-chat-role="${v.membership_role==="owner"?"member":"owner"}">
                        <i class="ti ${v.membership_role==="owner"?"ti-user-minus":"ti-shield-plus"}"></i><span>${v.membership_role==="owner"?"Remove owner":"Make owner"}</span>
                      </button>
                    `:""}
                    ${K?`
                      <button type="button" class="chat-member-remove" data-chat-remove-member="${m(v.user_id)}">
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
                  <input data-chat-member-search type="search" placeholder="Search people..." value="${m(t.memberSearch)}" autocomplete="off">
                  <div class="chat-compose-summary">${k} selected</div>
                  <div class="chat-compose-list">
                    ${S.map(v=>{const D=t.memberSelectedIds.has(v.id)?" checked":"";return`
                        <label class="chat-compose-person">
                          <input type="checkbox" data-chat-member-pick="${m(v.id)}"${D}>
                          <span class="chat-compose-avatar">${m((v.full_name||"?").slice(0,1))}</span>
                          <span class="chat-compose-person-copy">
                            <strong>${m(v.full_name||"Unknown")}</strong>
                            <span>${m(B(v.role))}</span>
                          </span>
                        </label>
                      `}).join("")}
                    ${S.length?"":'<div class="chat-muted">No matching people.</div>'}
                  </div>
                  <div class="chat-compose-actions">
                    <button type="button" data-chat-add-members="${m(a.id)}"${k?"":" disabled"}><i class="ti ti-users-plus"></i><span>Add selected</span></button>
                  </div>
                `:""}
              </div>
            `:""}
          </div>
        `}function _e(a){const s=a.deleted_at?"Message deleted":a.body||"";return s.length>90?`${s.slice(0,87)}...`:s}function $t(a){if(!a?.reply_to_id)return"";const s=t.messages.find(i=>i.id===a.reply_to_id);return s?`
          <div class="chat-quote">
            <strong>${m(s.sender?.full_name||"Unknown")}</strong>
            <span>${m(_e(s))}</span>
          </div>
        `:'<div class="chat-quote"><span>Replying to a message</span></div>'}function kt(){const a=t.messages.find(s=>s.id===t.replyToMessageId);return a?`
          <div class="chat-reply-strip">
            <div>
              <strong>Replying to ${m(a.sender?.full_name||"Unknown")}</strong>
              <span>${m(_e(a))}</span>
            </div>
            <button type="button" data-chat-clear-reply aria-label="Cancel reply"><i class="ti ti-x"></i></button>
          </div>
        `:""}function Et(){return t.pendingAttachments.length?`
          <div class="chat-pending-attachments">
            ${t.pendingAttachments.map(a=>`
              <div class="chat-pending-attachment${a.status==="error"?" error":""}" data-chat-pending-attachment="${m(a.id)}">
                <i class="ti ${a.status==="error"?"ti-alert-triangle":we(a.mime)?"ti-photo":Se(a.mime)}"></i>
                <span class="chat-pending-attachment-name">${m(a.name)}</span>
                ${a.status==="uploading"?'<span class="chat-pending-attachment-status">Uploading…</span>':""}
                ${a.status==="error"?`<span class="chat-pending-attachment-status">${m(a.error||"Failed")}</span>`:""}
                <button type="button" data-chat-remove-pending="${m(a.id)}" aria-label="Remove attachment"><i class="ti ti-x"></i></button>
              </div>
            `).join("")}
          </div>
        `:""}function Mt(a){const s=r.get(a.path),i=s&&s.expiresAt>Date.now()?s.url:null;return we(a.mime)?i?`<a class="chat-attachment-image-link" href="${m(i)}" target="_blank" rel="noopener">
                 <img class="chat-attachment-image" src="${m(i)}" alt="${m(a.name)}">
               </a>`:'<div class="chat-attachment-image chat-attachment-image-loading"><i class="ti ti-photo"></i></div>':`
          <a class="chat-attachment-file" href="${i?m(i):"#"}" target="_blank" rel="noopener" data-chat-attachment-path="${m(a.path)}">
            <i class="ti ${Se(a.mime)}"></i>
            <span class="chat-attachment-file-copy">
              <strong>${m(a.name)}</strong>
              <span>${m(rn(a.size))}</span>
            </span>
            <i class="ti ti-download"></i>
          </a>
        `}function Ct(a){return a.attachments?.length?`<div class="chat-message-attachments">${a.attachments.map(Mt).join("")}</div>`:""}async function It(){const a=new Set;for(const i of t.messages)for(const d of i.attachments||[])a.add(d.path);let s=!1;for(const i of a){const d=r.get(i);if(!(d&&d.expiresAt>Date.now()||c.has(i))){c.add(i);try{const p=await n.service.getSignedAttachmentUrl(i);r.set(i,{url:p,expiresAt:Date.now()+3300*1e3}),s=!0}catch(p){console.error("Failed to sign chat attachment URL",p)}finally{c.delete(i)}}}s&&!l&&_()}function Tt(a){return`
          <form class="chat-edit-form" data-chat-edit-form="${m(a.id)}">
            <input data-chat-edit-input="${m(a.id)}" type="text" value="${m(t.editDraft)}">
            <button type="submit" aria-label="Save edit"><i class="ti ti-check"></i></button>
            <button type="button" data-chat-cancel-edit aria-label="Cancel edit"><i class="ti ti-x"></i></button>
          </form>
        `}function qt(a){const s=m(a.body),i=t.conversations.find(v=>v.id===a.conversation_id)||t.conversations.find(v=>v.id===t.selectedConversationId)||null,d=q(i),p=nn(a.body,d);if(!p.length)return s;const S=new Set(d.filter(v=>v.id===n.currentUser.id).map(v=>String(v.full_name)));let k=s;for(const v of p){const D=`@${m(v)}`,E=S.has(v)?"chat-mention chat-mention-self":"chat-mention";k=k.split(D).join(`<span class="${E}">${D}</span>`)}return k}function Dt(a,s=!0){const i=a.sender_id===n.currentUser.id?" mine":"",d=!!a.deleted_at,p=i&&!d,S=!d&&(i||bt()),k=a.edited_at&&!d?'<span class="chat-edited">(edited)</span>':"",v=d?"":`
            <button type="button" data-chat-reply="${m(a.id)}" aria-label="Reply"><i class="ti ti-corner-up-left"></i></button>
            ${p?`<button type="button" data-chat-edit="${m(a.id)}" aria-label="Edit message"><i class="ti ti-pencil"></i></button>`:""}
            ${S?`<button type="button" data-chat-delete="${m(a.id)}" aria-label="Delete message"><i class="ti ti-trash"></i></button>`:""}
        `,D=d?"":`
          <div class="chat-message-actions" aria-label="Message actions">
            ${v}
          </div>
          <button type="button" class="chat-message-menu-btn" data-chat-message-menu="${m(a.id)}" aria-label="Message actions"><i class="ti ti-dots"></i></button>
          ${t.openMessageMenuId===a.id?`
            <div class="chat-message-menu" data-chat-message-menu-panel="${m(a.id)}">
              ${v}
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
            ${$t(a)}
            ${t.editingMessageId===a.id?Tt(a):`
              ${a.body.trim()?`<div class="chat-message-body">${d?m("Message deleted"):qt(a)}</div>`:""}
              ${d?"":Ct(a)}
            `}
            ${D}
          </div>
        `}function _(){const a=b||h();b=!1;const s=t.conversations.find(o=>o.id===t.selectedConversationId)||null,i=t.profiles.filter(o=>o.id!==n.currentUser.id),p=s?.members.find(o=>o.user_id===n.currentUser.id)?.notification_level==="muted",S=s?.members.filter(o=>!o.left_at)||[],k=s?ve(s):!1,v=s?Je(s):!1;e.innerHTML=`
          <section class="chat-shell" aria-label="Team chat">
            <aside class="chat-sidebar">
              <div class="chat-sidebar-head">
                <div>
                  <div class="chat-eyebrow">Portal chat</div>
                  <h2>Team</h2>
                </div>
                <div class="chat-sidebar-tools">
                  <span class="chat-user-pill">${m(B(n.currentUser.role))}</span>
                  <button type="button" class="chat-icon-btn" data-chat-compose-toggle aria-label="New conversation" title="New conversation"><i class="ti ti-pencil-plus"></i></button>
                </div>
              </div>
              ${yt(i)}
              <div class="chat-conversation-list">
                ${t.loading?'<div class="chat-muted">Loading...</div>':""}
                ${t.conversations.map(_t).join("")}
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
                    `:`<h2>${m(ye(s,n.currentUser.id))}</h2>`}
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
                    ${v?`
                      <button type="button" class="chat-icon-btn" data-chat-archive-toggle aria-label="Archive conversation" title="Archive conversation">
                        <i class="ti ti-archive"></i>
                      </button>
                    `:""}
                    <button type="button" class="chat-icon-btn${p?" active":""}" data-chat-toggle-mute aria-label="${p?"Unmute conversation":"Mute conversation"}" title="${p?"Unmute conversation":"Mute conversation"}">
                      <i class="ti ${p?"ti-bell-off":"ti-bell"}"></i>
                    </button>
                    <div class="chat-member-stack">
                      ${S.map(o=>`<span title="${m(o.profile?.full_name||o.user_id)}">${m((o.profile?.full_name||"?").slice(0,1))}</span>`).join("")}
                    </div>
                  </div>
                  ${St(s)}
                  ${t.archiveConfirmOpen?`
                    <div class="chat-delete-confirm chat-archive-confirm">
                      <span>Archive this ${s.kind==="group"?"group":"conversation"}?</span>
                      <button type="button" data-chat-confirm-archive>Confirm</button>
                      <button type="button" data-chat-cancel-archive>Cancel</button>
                    </div>
                  `:""}
                </header>
                <div class="chat-message-list">
                  ${t.messages.map((o,w)=>Dt(o,ln(o,t.messages[w-1]))).join("")}
                  ${t.messages.length?"":'<div class="chat-muted">No messages yet.</div>'}
                </div>
                <form class="chat-composer" data-chat-send-form>
                  ${kt()}
                  ${Et()}
                  ${wt(s)}
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
        `,e.querySelectorAll("[data-chat-select]").forEach(o=>{o.addEventListener("click",()=>se(o.dataset.chatSelect))}),e.querySelector("[data-chat-back]")?.addEventListener("click",()=>he()),e.querySelector("[data-chat-toggle-mute]")?.addEventListener("click",()=>{s&&ot(s)}),e.querySelector("[data-chat-members-toggle]")?.addEventListener("click",()=>{s&&(t.membersOpen?Q():Xe())}),e.querySelector("[data-chat-members-close]")?.addEventListener("click",()=>Q({reset:!0})),e.querySelector("[data-chat-rename-toggle]")?.addEventListener("click",()=>{s&&ct(s)}),e.querySelector("[data-chat-rename-cancel]")?.addEventListener("click",()=>lt()),e.querySelector("[data-chat-rename-form]")?.addEventListener("submit",o=>{o.preventDefault(),s&&dt(s,t.renameDraft)}),e.querySelector("[data-chat-rename-input]")?.addEventListener("input",o=>{t.renameDraft=o.currentTarget.value}),e.querySelector("[data-chat-archive-toggle]")?.addEventListener("click",()=>ut()),e.querySelector("[data-chat-confirm-archive]")?.addEventListener("click",()=>{s&&ft(s,!0)}),e.querySelector("[data-chat-cancel-archive]")?.addEventListener("click",()=>mt()),e.querySelector("[data-chat-member-add-toggle]")?.addEventListener("click",()=>Ze()),e.querySelector("[data-chat-member-search]")?.addEventListener("input",o=>{t.memberSearch=o.currentTarget.value,_();const w=e.querySelector("[data-chat-member-search]");w?.focus(),w?.setSelectionRange?.(w.value.length,w.value.length)}),e.querySelectorAll("[data-chat-member-pick]").forEach(o=>{o.addEventListener("change",()=>et(o.dataset.chatMemberPick,o.checked))}),e.querySelector("[data-chat-add-members]")?.addEventListener("click",o=>{tt(o.currentTarget.dataset.chatAddMembers)}),e.querySelectorAll("[data-chat-remove-member]").forEach(o=>{o.addEventListener("click",()=>{s&&nt(s.id,o.dataset.chatRemoveMember)})}),e.querySelectorAll("[data-chat-promote-member]").forEach(o=>{o.addEventListener("click",()=>{s&&pt(s.id,o.dataset.chatPromoteMember,o.dataset.chatRole)})}),e.querySelector("[data-chat-compose-toggle]")?.addEventListener("click",()=>{t.composeOpen?Y():Qe()}),e.querySelector("[data-chat-compose-close]")?.addEventListener("click",()=>Y()),e.querySelector("[data-chat-compose-search]")?.addEventListener("input",o=>{t.composeSearch=o.currentTarget.value,_();const w=e.querySelector("[data-chat-compose-search]");w?.focus(),w?.setSelectionRange?.(w.value.length,w.value.length)}),e.querySelectorAll("[data-chat-compose-member]").forEach(o=>{o.addEventListener("change",()=>Ke(o.dataset.chatComposeMember,o.checked))}),e.querySelector("[data-chat-group-title]")?.addEventListener("input",o=>{t.composeGroupTitle=o.currentTarget.value,_();const w=e.querySelector("[data-chat-group-title]");w?.focus(),w?.setSelectionRange?.(w.value.length,w.value.length)}),e.querySelector("[data-chat-start-dm]")?.addEventListener("click",o=>{ht(o.currentTarget.dataset.chatStartDm)}),e.querySelector("[data-chat-create-group]")?.addEventListener("click",()=>{gt(t.composeGroupTitle,[...t.composeSelectedMemberIds])});const D=e.querySelector("[data-chat-send-form]");D?.addEventListener("submit",o=>{o.preventDefault(),Ge(o.currentTarget)});const E=e.querySelector("[data-chat-composer]");E?.addEventListener("input",()=>{if(C(E),!y(E))return;const{value:o,selectionStart:w}=E;_();const N=e.querySelector("[data-chat-composer]");N&&(N.value=o,C(N),N.focus(),N.setSelectionRange?.(w,w))}),E?.addEventListener("keydown",o=>{if(t.mentionQuery!==null&&s){const w=g(s);if(w.length){if(o.key==="ArrowDown"){o.preventDefault(),F(s,1);return}if(o.key==="ArrowUp"){o.preventDefault(),F(s,-1);return}if(o.key==="Enter"||o.key==="Tab"){o.preventDefault(),U(s,w[Math.min(t.mentionIndex,w.length-1)]);return}}if(o.key==="Escape"){o.preventDefault(),I();return}}o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),D?.requestSubmit())}),e.querySelectorAll("[data-chat-mention-pick]").forEach(o=>{o.addEventListener("mousedown",w=>{w.preventDefault();const N=q(s).find(At=>At.id===o.dataset.chatMentionPick);N&&U(s,N)})}),e.querySelector("[data-chat-clear-reply]")?.addEventListener("click",()=>Ye()),e.querySelectorAll("[data-chat-reply]").forEach(o=>{o.addEventListener("click",()=>Ve(o.dataset.chatReply))}),e.querySelectorAll("[data-chat-edit]").forEach(o=>{o.addEventListener("click",()=>at(o.dataset.chatEdit))}),e.querySelectorAll("[data-chat-delete]").forEach(o=>{o.addEventListener("click",()=>{t.confirmingDeleteMessageId=o.dataset.chatDelete,t.openMessageMenuId=null,_()})}),e.querySelectorAll("[data-chat-message-menu]").forEach(o=>{o.addEventListener("click",()=>{t.openMessageMenuId=t.openMessageMenuId===o.dataset.chatMessageMenu?null:o.dataset.chatMessageMenu,t.confirmingDeleteMessageId=null,_()})}),e.querySelectorAll("[data-chat-confirm-delete]").forEach(o=>{o.addEventListener("click",()=>it(o.dataset.chatConfirmDelete))}),e.querySelectorAll("[data-chat-cancel-delete]").forEach(o=>{o.addEventListener("click",()=>{t.confirmingDeleteMessageId===o.dataset.chatCancelDelete&&(t.confirmingDeleteMessageId=null),_()})}),e.querySelectorAll("[data-chat-edit-form]").forEach(o=>{o.addEventListener("submit",w=>{w.preventDefault(),rt(w.currentTarget)})}),e.querySelectorAll("[data-chat-cancel-edit]").forEach(o=>{o.addEventListener("click",()=>st())});const K=e.querySelector("[data-chat-file-input]");e.querySelector("[data-chat-attach-toggle]")?.addEventListener("click",()=>K?.click()),K?.addEventListener("change",o=>{re(o.currentTarget.files),o.currentTarget.value=""}),e.querySelectorAll("[data-chat-remove-pending]").forEach(o=>{o.addEventListener("click",()=>ze(o.dataset.chatRemovePending))});const be=e.querySelector("[data-chat-send-form]");be?.addEventListener("dragover",o=>o.preventDefault()),be?.addEventListener("drop",o=>{o.preventDefault(),o.dataTransfer?.files?.length&&re(o.dataTransfer.files)}),E?.addEventListener("paste",o=>{const w=[...o.clipboardData?.files||[]];w.length&&re(w)}),a&&$(),It()}return L(),f=setInterval(()=>L(),3e4),typeof n.service.subscribeToConversationEvents=="function"&&(M=n.service.subscribeToConversationEvents(()=>vt())),()=>{l=!0,f&&clearInterval(f),M&&M(),e.removeEventListener?.("click",V),typeof document<"u"&&document.removeEventListener("keydown",pe),e.classList.remove("wein-chat-root"),e.classList.remove("chat-has-selection"),e.innerHTML=""}}}}const $e="chat-attachments",ke=5;function Fe(e){return String(e||"file").replace(/[^a-zA-Z0-9._-]+/g,"_")}function un(e,n){const t=`${Date.now().toString(36)}-${Math.random().toString(16).slice(2,8)}`;return`${e}/${t}-${Fe(n)}`}function P(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data||[]}function H(e,n){if(e.error)throw new Error(`${n}: ${e.error.message||e.error}`);return e.data}function ue(e){return e?{id:e.id,full_name:e.full_name,role:e.role,email:e.email??null}:null}function mn(e){return{conversation_id:e.conversation_id,user_id:e.user_id,membership_role:e.membership_role,joined_at:e.joined_at,left_at:e.left_at,last_read_seq:Number(e.last_read_seq||0),notification_level:e.notification_level,profile:ue(e.profile||e.profiles)}}function W(e){return{id:e.id,conversation_id:e.conversation_id,message_seq:Number(e.message_seq||0),sender_id:e.sender_id,body:e.body,reply_to_id:e.reply_to_id,client_nonce:e.client_nonce,created_at:e.created_at,edited_at:e.edited_at,deleted_at:e.deleted_at,mentioned_user_ids:e.mentioned_user_ids||[],attachments:e.attachments||[],sender:ue(e.sender||e.profiles)}}function Ee(e,n){const t=(e.members||e.wein_chat_members||[]).map(mn),r=e.last_message||e.wein_chat_messages||[],c=Array.isArray(r)?r.find(f=>f.deleted_at==null):null,l=c?W(c):null,u={id:e.id,kind:e.kind,title:e.title,created_by:e.created_by,created_at:e.created_at,archived_at:e.archived_at,members:t,last_message:l,unread_count:0};return u.unread_count=Jt(u,n),u}function xe({supabase:e,currentUserId:n}){if(!e)throw new Error("supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(r){const c=await e.from("wein_chat_conversations").select(`
        id, kind, title, created_by, created_at, archived_at,
        members:wein_chat_members(
          conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
          profile:profiles(id, full_name, role, email)
        ),
        last_message:wein_chat_messages(
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        )
      `).eq("id",r).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(ke,{referencedTable:"wein_chat_messages"}).single();if(c.error)throw new Error(`fetch conversation: ${c.error.message||c.error}`);return Ee(c.data,n)}return{async listProfiles(){const r=await e.from("profiles").select("id, full_name, role, email").order("full_name",{ascending:!0});return P(r,"list profiles").map(ue)},async listConversations(){const r=await e.from("wein_chat_conversations").select(`
          id, kind, title, created_by, created_at, archived_at,
          members:wein_chat_members(
            conversation_id, user_id, membership_role, joined_at, left_at, last_read_seq, notification_level,
            profile:profiles(id, full_name, role, email)
          ),
          last_message:wein_chat_messages(
            id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
            sender:profiles(id, full_name, role, email)
          )
        `).is("archived_at",null).order("created_at",{ascending:!1}).order("message_seq",{referencedTable:"wein_chat_messages",ascending:!1}).limit(ke,{referencedTable:"wein_chat_messages"});return P(r,"list conversations").map(c=>Ee(c,n))},async listMessages(r){const c=await e.from("wein_chat_messages").select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).eq("conversation_id",r).is("deleted_at",null).order("message_seq",{ascending:!0});return P(c,"list messages").map(W)},async createGroup(r,c=[]){const l=H(await e.rpc("wein_chat_create_group",{p_title:r}),"create group");for(const u of c)await this.addMember(l,u);return l},async getOrCreateDm(r){return H(await e.rpc("wein_chat_get_or_create_dm",{p_other_user_id:r}),"get or create DM")},async addMember(r,c){H(await e.rpc("wein_chat_add_member",{p_conversation_id:r,p_user_id:c}),"add member")},async removeMember(r,c){H(await e.rpc("wein_chat_remove_member",{p_conversation_id:r,p_user_id:c}),"remove member")},async renameConversation(r,c){const l=(c||"").trim();if(!l)throw new Error("Group title is required");const u=await e.from("wein_chat_conversations").update({title:l}).eq("id",r).select("id, title");if(!P(u,"rename conversation").length)throw new Error("rename conversation affected zero rows")},async setConversationArchived(r,c){const l=await e.from("wein_chat_conversations").update({archived_at:c?new Date().toISOString():null}).eq("id",r).select("id, archived_at");if(!P(l,"set conversation archived").length)throw new Error("set conversation archived affected zero rows")},async setMembershipRole(r,c,l){H(await e.rpc("wein_chat_set_membership_role",{p_conversation_id:r,p_user_id:c,p_role:l}),"set membership role")},async uploadAttachment(r,c){const l=un(r,c.name),u=await e.storage.from($e).upload(l,c,{contentType:c.type||"application/octet-stream",upsert:!1});if(u.error)throw new Error(`upload attachment: ${u.error.message||u.error}`);return{path:l,name:c.name||Fe(c.name),mime:c.type||"application/octet-stream",size:c.size||0}},async getSignedAttachmentUrl(r,c=3600){const l=await e.storage.from($e).createSignedUrl(r,c);if(l.error)throw new Error(`sign attachment url: ${l.error.message||l.error}`);const u=l.data?.signedUrl;if(!u)throw new Error("sign attachment url: no signed URL returned");return u},async sendMessage({conversationId:r,body:c,clientNonce:l,replyToId:u=null,mentionedUserIds:f=[],attachments:M=[]}){const b=await e.from("wein_chat_messages").insert({conversation_id:r,sender_id:n,body:c,client_nonce:l,reply_to_id:u,mentioned_user_ids:f.length?f:null,attachments:M}).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(b.error)throw new Error(`send message: ${b.error.message||b.error}`);return W(b.data)},async updateMessage(r,c,l=[]){const u=await e.from("wein_chat_messages").update({body:c,edited_at:new Date().toISOString(),mentioned_user_ids:l.length?l:null}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(u.error)throw new Error(`update message: ${u.error.message||u.error}`);return W(u.data)},async deleteMessage(r){const c=await e.from("wein_chat_messages").update({deleted_at:new Date().toISOString()}).eq("id",r).select(`
          id, conversation_id, message_seq, sender_id, body, reply_to_id, client_nonce, created_at, edited_at, deleted_at, mentioned_user_ids, attachments,
          sender:profiles(id, full_name, role, email)
        `).single();if(c.error)throw new Error(`delete message: ${c.error.message||c.error}`);return W(c.data)},async markRead(r,c){const l=await e.from("wein_chat_members").update({last_read_seq:c}).eq("conversation_id",r).eq("user_id",n).select("conversation_id, user_id, last_read_seq");if(!P(l,"mark read").length)throw new Error("mark read affected zero rows")},async setNotificationLevel(r,c){const l=await e.from("wein_chat_members").update({notification_level:c}).eq("conversation_id",r).eq("user_id",n).select("conversation_id, user_id, notification_level");if(!P(l,"set notification level").length)throw new Error("set notification level affected zero rows")},subscribeToConversationEvents(r){if(typeof e.channel!="function")return()=>{};const c=e.channel(`wein-chat:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_conversations"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_members"},r).on("postgres_changes",{event:"*",schema:"public",table:"wein_chat_messages"},r).subscribe();return()=>{typeof e.removeChannel=="function"?e.removeChannel(c):typeof c.unsubscribe=="function"&&c.unsubscribe()}},fetchConversation:t}}function fn(e){return typeof e.session.user=="object"&&e.session.user!==null?e.session.user:{}}function pn(e){const n=fn(e),t=n.id;if(!t)throw new Error("Team chat requires an authenticated user id.");return{id:t,full_name:e.session.fullName||n.email||"Portal user",role:e.session.role||"team",email:n.email||null}}let ie=null;function hn(e){ie=e||null}function gn(){const e=dn();ae({id:"team-chat",mount(n,t){const r=ie;ie=null;const c=pn(t),l=xe({supabase:t.session.client,currentUserId:c.id});return e.mount(n,{currentUser:c,service:l,initialConversationId:r})}})}function vn(e=[]){return e.reduce((n,t)=>{const r=Number(t?.unread_count);return n+(Number.isFinite(r)&&r>0?r:0)},0)}function _n(e,n){const t=String(e??"");return n>0?`(${n}) ${t}`:t}function bn(e,n={}){return e?e.author_id&&n[e.author_id]?.full_name?n[e.author_id].full_name:e.author_name||"Unknown":"Unknown"}function Be(e){return!!e?.resolved_at}function yn(e=[]){const n=new Map,t=[];e.forEach(l=>{n.set(l.id,{...l,replies:[]})}),n.forEach(l=>{l.reply_to_id&&n.has(l.reply_to_id)?n.get(l.reply_to_id).replies.push(l):t.push(l)});const r=(l,u)=>String(l.created_at||"").localeCompare(String(u.created_at||"")),c=l=>{l.replies.sort(r),l.replies.forEach(c)};return t.sort(r),t.forEach(c),t}function wn(e=[]){return e.filter(n=>!Be(n)).length}function Me(e,n=90){const t=String(e?.body||"").replace(/\s+/g," ").trim();return t.length<=n?t:`${t.slice(0,Math.max(0,n-1)).trimEnd()}…`}function A(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function Ce(e={}){return e.taskId?"Task discussion":e.providerId?"Provider discussion":e.offerId?"Offer discussion":"Record discussion"}function Sn(e={}){return e.taskId?`Task ${e.taskId}`:e.providerId?`Provider ${e.providerId}`:e.offerId?`Offer ${e.offerId}`:"No record scope"}function $n(){return{id:"record-discussion",mount(e,n){const t={comments:[],peopleById:Object.fromEntries((n.people||[]).map(g=>[g.id,g])),loading:!0,error:null,replyToId:null,taskSourceCommentId:null};let r=!1,c=null,l=null;e.classList.add("wein-discussion-root");async function u(){try{t.error=null,t.comments=await n.service.listComments(n.scope||{})}catch(g){t.error=g.message||String(g)}finally{t.loading=!1,r||q()}}async function f(g){const I=g.querySelector("[data-discussion-body]"),y=I.value.trim();y&&(I.value="",await n.service.postComment({...n.scope||{},body:y,replyToId:t.replyToId,people:n.people||[]}),t.replyToId=null,await u())}async function M(g){const I=e.querySelector(`[data-resolve-note="${CSS.escape(g)}"]`)?.value||"";await n.service.resolveComment(g,I),await u()}async function b(g){await n.service.reopenComment(g),await u()}async function h(g){const I=g.querySelector("[data-task-title]"),y=I.value.trim();!y||!t.taskSourceCommentId||(await n.service.createTaskFromComment(t.taskSourceCommentId,y,n.currentUser?.id||null),I.value="",t.taskSourceCommentId=null,await u())}function $(g,I=0){const y=Be(g),U=bn(g,t.peopleById);return`
          <article class="discussion-comment${y?" resolved":""}" style="--depth:${Math.min(I,4)}">
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
            ${g.replies?.length?`<div class="discussion-replies">${g.replies.map(F=>$(F,I+1)).join("")}</div>`:""}
          </article>
        `}function C(){if(!t.taskSourceCommentId)return"";const g=t.comments.find(I=>I.id===t.taskSourceCommentId);return`
          <form class="discussion-task-box" data-discussion-task-form>
            <div>
              <div class="discussion-eyebrow">Create task from comment</div>
              <p>${A(Me(g))}</p>
            </div>
            <input data-task-title type="text" placeholder="Task title">
            <div class="discussion-task-actions">
              <button type="submit">Create task</button>
              <button type="button" data-discussion-task-cancel>Cancel</button>
            </div>
          </form>
        `}function q(){const g=yn(t.comments),I=t.replyToId?t.comments.find(y=>y.id===t.replyToId):null;e.innerHTML=`
          <section class="discussion-shell" aria-label="${A(Ce(n.scope))}">
            <header class="discussion-header">
              <div>
                <div class="discussion-eyebrow">${A(Ce(n.scope))}</div>
                <h2>Discussion</h2>
                <p>${A(Sn(n.scope))}</p>
              </div>
              <span class="discussion-count">${wn(t.comments)} unresolved</span>
            </header>
            ${t.error?`<div class="discussion-error">${A(t.error)}</div>`:""}
            ${C()}
            <div class="discussion-list">
              ${t.loading?'<div class="discussion-muted">Loading discussion...</div>':""}
              ${g.map(y=>$(y)).join("")}
              ${!t.loading&&!g.length?'<div class="discussion-muted">No comments yet.</div>':""}
            </div>
            <form class="discussion-composer" data-discussion-form>
              ${I?`
                <div class="discussion-replying">
                  Replying to: ${A(Me(I,70))}
                  <button type="button" data-discussion-cancel-reply>Cancel</button>
                </div>
              `:""}
              <textarea data-discussion-body rows="3" placeholder="Write a record-attached note..."></textarea>
              <button type="submit">${I?"Reply":"Post comment"}</button>
            </form>
          </section>
        `,e.querySelector("[data-discussion-form]")?.addEventListener("submit",y=>{y.preventDefault(),f(y.currentTarget)}),e.querySelector("[data-discussion-cancel-reply]")?.addEventListener("click",()=>{t.replyToId=null,q()}),e.querySelector("[data-discussion-task-cancel]")?.addEventListener("click",()=>{t.taskSourceCommentId=null,q()}),e.querySelector("[data-discussion-task-form]")?.addEventListener("submit",y=>{y.preventDefault(),h(y.currentTarget)}),e.querySelectorAll("[data-discussion-reply]").forEach(y=>{y.addEventListener("click",()=>{t.replyToId=y.dataset.discussionReply,q()})}),e.querySelectorAll("[data-discussion-resolve]").forEach(y=>{y.addEventListener("click",()=>M(y.dataset.discussionResolve))}),e.querySelectorAll("[data-discussion-reopen]").forEach(y=>{y.addEventListener("click",()=>b(y.dataset.discussionReopen))}),e.querySelectorAll("[data-discussion-task]").forEach(y=>{y.addEventListener("click",()=>{t.taskSourceCommentId=y.dataset.discussionTask,q()})})}return u(),c=setInterval(()=>u(),3e4),typeof n.service.subscribeToDiscussionEvents=="function"&&(l=n.service.subscribeToDiscussionEvents(()=>u())),()=>{r=!0,c&&clearInterval(c),l&&l(),e.classList.remove("wein-discussion-root"),e.innerHTML=""}}}}function x(e){if(e)throw e}function kn({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t({taskId:b,providerId:h,offerId:$}={}){let C=e.from("wein_comments").select("*").order("created_at",{ascending:!0});b&&(C=C.eq("task_id",b)),h&&(C=C.eq("provider_id",h)),$&&(C=C.eq("offer_id",$));const{data:q,error:g}=await C;return x(g),q||[]}async function r({body:b,taskId:h=null,providerId:$=null,offerId:C=null,replyToId:q=null,people:g=[]}){const I=h?{task_id:h}:$?{provider_id:$}:C?{offer_id:C}:null;if(!I)throw new Error("postComment requires taskId, providerId, or offerId");const{data:y,error:U}=await e.from("wein_comments").insert({...I,reply_to_id:q,body:b,author_role:"team"}).select("*").single();x(U);for(const F of Z(b,g))try{await u(y.id,F)}catch(V){console.error("Failed to record comment mention",V)}return y}async function c(b,h=""){const{data:$,error:C}=await e.from("wein_comments").update({resolved_at:new Date().toISOString(),resolved_note:h}).eq("id",b).select("*");if(x(C),!$?.length)throw new Error("Resolve affected zero comments");return $[0]}async function l(b){const{data:h,error:$}=await e.from("wein_comments").update({resolved_at:null,resolved_note:null}).eq("id",b).select("*");if(x($),!h?.length)throw new Error("Reopen affected zero comments");return h[0]}async function u(b,h){const{data:$,error:C}=await e.from("wein_comment_mentions").insert({comment_id:b,mentioned_user_id:h}).select("*");return x(C),$?.[0]||null}async function f(b,h,$=null,C=null){const{data:q,error:g}=await e.rpc("wein_create_task_from_comment",{p_comment_id:b,p_title:h,p_assigned_to_user_id:$,p_due_date:C});return x(g),q}function M(b){if(!e.channel)return()=>{};const h=e.channel(`record-discussion:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},b).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},b).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_task_links"},b).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(h);if(h?.unsubscribe)return h.unsubscribe()}}return{listComments:t,postComment:r,resolveComment:c,reopenComment:l,addMention:u,createTaskFromComment:f,subscribeToDiscussionEvents:M}}function O(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}const En={critical:"Critical",high:"High",medium:"Medium",low:"Low"},Mn={task:"Task",mention:"Mention",discussion:"Discussion",review:"Review"};function Cn(e){if(!e)return"No due date";const n=new Date(e);return Number.isNaN(n.getTime())?String(e):n.toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function In(e=[]){return["critical","high","medium","low"].map(n=>({severity:n,items:e.filter(t=>t.severity===n)})).filter(n=>n.items.length)}function Tn(){return{id:"work-inbox",mount(e,n){const t={items:[],loading:!0,error:null};let r=!1,c=null,l=null;e.classList.add("wein-work-inbox-root");async function u(){try{t.error=null,t.items=await n.service.loadInbox()}catch(h){t.error=h.message||String(h)}finally{t.loading=!1,r||b()}}function f(h){if(typeof n.onSelectItem=="function"){n.onSelectItem(h);return}h.href&&(window.location.hash=h.href)}function M(h){return`
          <button type="button" class="work-inbox-item severity-${O(h.severity)}" data-inbox-item="${O(h.kind)}:${O(h.entity_id)}:${O(h.reason_code)}">
            <span class="work-inbox-kind">${O(Mn[h.kind]||h.kind)}</span>
            <span class="work-inbox-title">${O(h.title)}</span>
            <span class="work-inbox-reason">${O(h.reason_code.replaceAll("_"," "))}</span>
            <span class="work-inbox-due">${O(Cn(h.due_at))}</span>
            <span class="work-inbox-action">${O(h.next_action)}</span>
          </button>
        `}function b(){const h=In(t.items);e.innerHTML=`
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
                  <h3>${O(En[$.severity])}</h3>
                  ${$.items.map(M).join("")}
                </section>
              `).join("")}
              ${!t.loading&&!t.items.length?'<div class="work-inbox-muted">No attention items right now.</div>':""}
            </div>
          </section>
        `,e.querySelector("[data-inbox-refresh]")?.addEventListener("click",()=>u()),e.querySelectorAll("[data-inbox-item]").forEach($=>{$.addEventListener("click",()=>{const C=$.dataset.inboxItem,q=t.items.find(g=>`${g.kind}:${g.entity_id}:${g.reason_code}`===C);q&&f(q)})})}return u(),c=setInterval(()=>u(),6e4),typeof n.service.subscribeToInboxEvents=="function"&&(l=n.service.subscribeToInboxEvents(()=>u())),()=>{r=!0,c&&clearInterval(c),l&&l(),e.classList.remove("wein-work-inbox-root"),e.innerHTML=""}}}}const Ie={critical:0,high:1,medium:2,low:3};function me(e,n=new Date){if(!e)return"low";const t=new Date(e);if(Number.isNaN(t.getTime()))return"low";const r=t.getTime()-n.getTime();return r<0?"critical":r<=1440*60*1e3?"high":r<=4320*60*1e3?"medium":"low"}function qn(e,{now:n=new Date}={}){return{kind:"task",entity_id:e.id,title:e.title||"Untitled task",reason_code:e.due_date?"task_due":"task_open",severity:me(e.due_date,n),owner_id:e.assigned_to_user_id||e.owner_id||null,due_at:e.due_date||null,next_action:"Open task",href:`#tasks/${e.id}`,source:e}}function Dn(e,{comment:n,currentUserId:t}={}){return{kind:"mention",entity_id:e.comment_id,title:n?.body?`Mention: ${n.body}`:"Mention in discussion",reason_code:"unresolved_mention",severity:n?.resolved_at?"low":"high",owner_id:t||e.mentioned_user_id,due_at:n?.created_at||e.created_at||null,next_action:"Reply or resolve",href:`#comments/${e.comment_id}`,source:{mention:e,comment:n}}}function An(e,{currentUserId:n,now:t=new Date}={}){return{kind:"discussion",entity_id:e.id,title:e.body||"Discussion awaiting reply",reason_code:"thread_awaiting_reply",severity:me(e.next_reply_due_at||e.created_at,t),owner_id:n||null,due_at:e.next_reply_due_at||null,next_action:"Reply in thread",href:`#comments/${e.id}`,source:e}}function Ln(e,{now:n=new Date}={}){return{kind:e.kind||"review",entity_id:e.id,title:e.title||e.offer_title||"Founder review needed",reason_code:e.reason_code||"founder_review",severity:me(e.due_at||e.created_at,n),owner_id:e.owner_id||null,due_at:e.due_at||e.created_at||null,next_action:"Review",href:e.href||`#review/${e.id}`,source:e}}function On(e=[]){return[...e].sort((n,t)=>{const r=(Ie[n.severity]??9)-(Ie[t.severity]??9);return r||String(n.due_at||"").localeCompare(String(t.due_at||""))})}function Rn(e=[]){const n=new Set;return e.filter(t=>{const r=`${t.kind}:${t.entity_id}:${t.reason_code}`;return n.has(r)?!1:(n.add(r),!0)})}function Nn({tasks:e=[],mentions:n=[],commentsById:t={},awaitingReplies:r=[],founderReviews:c=[]},l={}){const u=[...e.map(f=>qn(f,l)),...n.map(f=>Dn(f,{...l,comment:t[f.comment_id]})),...r.map(f=>An(f,l)),...c.map(f=>Ln(f,l))];return On(Rn(u))}function Te(e){if(e)throw e}function Pn({supabase:e,currentUserId:n}){if(!e)throw new Error("Supabase client is required");if(!n)throw new Error("currentUserId is required");async function t(){let u=e.from("wein_tasks").select("*").neq("status","done").order("due_date",{ascending:!0,nullsFirst:!1});n&&(u=u.eq("assigned_to_user_id",n));const{data:f,error:M}=await u;return Te(M),f||[]}async function r(){const{data:u,error:f}=await e.from("wein_comment_mentions").select("comment_id,mentioned_user_id,created_at,wein_comments(*)").eq("mentioned_user_id",n).is("wein_comments.resolved_at",null).order("created_at",{ascending:!0});return Te(f),u||[]}async function c(){const[u,f]=await Promise.all([t(),r()]),M={},b=f.map(h=>{const $=h.wein_comments||h.comment||null;return $?.id&&(M[$.id]=$),{comment_id:h.comment_id,mentioned_user_id:h.mentioned_user_id,created_at:h.created_at}});return Nn({tasks:u,mentions:b,commentsById:M},{currentUserId:n})}function l(u){if(!e.channel)return()=>{};const f=e.channel(`work-inbox:${n}`).on("postgres_changes",{event:"*",schema:"public",table:"wein_tasks"},u).on("postgres_changes",{event:"*",schema:"public",table:"wein_comments"},u).on("postgres_changes",{event:"*",schema:"public",table:"wein_comment_mentions"},u).subscribe();return()=>{if(e.removeChannel)return e.removeChannel(f);if(f?.unsubscribe)return f.unsubscribe()}}return{fetchOpenTasks:t,fetchUnresolvedMentions:r,loadInbox:c,subscribeToInboxEvents:l}}const He=["today","tasks","team","map","providers","files","leads","offers","marketing","deals","launch","analytics","settings","pipeline"];function Un(e){for(const n of He)ae({id:n,mount:()=>{e[n]()}})}function fe(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}const Fn=["all","Dining","Health & Beauty","Fun & Activities","Hotels & Aqua Park"];function xn(e,n){return`<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap;">${Fn.map(t=>`<button class="chip ${e===t?"active":""}" type="button" onclick="${n}('${t.replace(/'/g,"\\'")}')">${t==="all"?"All":fe(t)}</button>`).join("")}</div>`}function Bn(e,n){return n==="all"||String(e||"")===n}function Hn(e){return String(e?.category||e?.vertical||"-")}function Wn(e){const n=String(e||"").toLowerCase();return n.includes("dining")?"dining":n.includes("health")?"health":n.includes("fun")?"fun":n.includes("hotel")?"hotels":""}function jn(e,n=Date.now()){return e?Math.floor((n-new Date(e).getTime())/864e5):0}function oe(e=new Date){const n=new Date(e);return n.setHours(0,0,0,0),n}function zn(e,n=new Date){return e?Math.round((oe(n).getTime()-oe(e).getTime())/864e5):null}function We(e,n){let t=String(e||"").replace(/\D/g,"");if(!t)return null;t.startsWith("0")&&(t=`20${t.slice(1)}`);const r=`Hi! Following up on the WeIN offer sheet for ${n} - do you have 5 minutes today?`;return`https://wa.me/${t}?text=${encodeURIComponent(r)}`}function Gn(e,n){const t=We(e,n);return t?`<a class="mini-btn" href="${fe(t)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#25D366;border-color:#25D366;text-decoration:none;"><i class="ti ti-brand-whatsapp"></i><span>WhatsApp</span></a>`:""}function G(e){return e.id}function Vn(e){return T("profiles").find(n=>G(n)===e)??null}function Yn(e){return T("providers").find(n=>G(n)===e)??null}function Qn(e){return T("leads").find(n=>G(n)===e)??null}function Kn(e){return T("tasks").find(n=>G(n)===e)??null}function Jn(e){return T("offers").find(n=>G(n)===e)??null}function Xn(e){return T("offers").filter(n=>n.provider_id===e)}function Zn(e){return T("tasks").filter(n=>n.provider_id===e)}function ea(e){return T("tasks").filter(n=>n.lead_id===e)}const ta=Object.freeze(Object.defineProperty({__proto__:null,leadById:Qn,offerById:Jn,offersForProvider:Xn,profileById:Vn,providerById:Yn,taskById:Kn,tasksForLead:ea,tasksForProvider:Zn},Symbol.toStringTag,{value:"Module"}));function na(){const e=document.title;let n=!1;async function t(){const c=window.WEIN?.user?.id;if(c)try{const u=await xe({supabase:ee(),currentUserId:c}).listConversations(),f=vn(u),M=document.querySelector("[data-chat-unread-badge]");M&&(M.textContent=String(f),M.style.display=f>0?"inline-flex":"none"),document.title=_n(e,f)}catch{}}const r=setInterval(()=>{window.WEIN?.user?.id&&!n&&(n=!0,clearInterval(r),setInterval(t,3e4)),t()},2e3)}Yt();gn();na();const je={api:Oe,auth:{canDelete:ce,canManageDeals:De,canEditProviderProfile:Ae,navHiddenForRole:le,defaultViewForRole:Le},platform:{getSupabaseClient:ee,getAccessToken:ne,getSessionContext:Rt},shared:{escapeHtml:fe,daysSince:jn,startOfLocalDay:oe,dayDiffFromToday:zn,whatsappLink:We,whatsappButtonHtml:Gn,categoryChipsHtml:xn,matchesCategoryFilter:Bn,categoryLabel:Hn,catBadgeClass:Wn},core:{createPortalContext:jt,getView:Pe,mountView:Vt,registeredViewIds:zt,registerView:ae},legacy:{LEGACY_VIEW_IDS:He,registerLegacyViews:Un},features:{requestOpenChatConversation:hn,createDiscussionViewModule:$n,createSupabaseDiscussionService:kn,createWorkInboxViewModule:Tn,createSupabaseWorkInboxService:Pn},store:Ne,selectors:ta};window.WEIN_PORTAL_MODULES=je;for(const e of window.WEIN_PORTAL_MODULES_READY??[])e(je);window.WEIN_PORTAL_MODULES_READY=[];
