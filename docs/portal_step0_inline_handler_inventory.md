# Portal Step 0 Inline Handler and Window Global Inventory

Generated from `portal/portal_new.html` and `src/legacy/portal.js` after moving the 4,950-line legacy script out of the HTML.

## Step 0 Exposure Decision

The relocated legacy script is emitted by Vite as `portal/dist/assets/portal.js` and loaded by `portal/portal_new.html` as a classic script, not `type="module"`. This is intentional for Step 0: the old inline handlers continue to resolve the same top-level declarations through the browser global environment, so no behavior-changing bridge or event-delegation rewrite is required yet. When later steps convert specific code to ES modules, the identifiers below are the bridge/delegation checklist.

The small head inline script that applies the mobile viewport class before paint remains inline to avoid changing first-paint/mobile behavior.

## Summary

- Inline event handler attributes found: 201
- Event attribute types: onblur=10, onchange=6, onclick=173, oninput=6, onkeydown=6
- Unique handler call targets: 105
- Unique top-level names assigned directly by handlers: 10
- Unique `window.*` properties referenced: 10

## Handler Call Targets

- `addProviderGoStep`
- `advanceLaunch`
- `advanceLead`
- `advanceNegotiation`
- `archiveSelectedProviders`
- `attemptEmailLogin`
- `attemptForgotPassword`
- `attemptSetNewPassword`
- `clearDealSelection`
- `clearProviderSelection`
- `closeAddProviderWizard`
- `closeAvatarMenu`
- `closeCampaignModal`
- `closeContractEditor`
- `closeLeadDrawer`
- `closeOfferEdit`
- `closeProviderModal`
- `closeRecordSaleModal`
- `closeTaskModal`
- `deleteCalendarNote`
- `deleteCampaign`
- `deleteComment`
- `deleteFile`
- `deleteLead`
- `deleteProvider`
- `deleteTaskFromModal`
- `downloadCsvTemplate`
- `dropLead`
- `exportSelectedDealsCsv`
- `exportSelectedProvidersCsv`
- `featureProvider`
- `logout`
- `markAllRead`
- `negotiationFor`
- `oeAddItemRow`
- `oeApplyDiscount`
- `oeRecalcDiscount`
- `oeRemoveItemRow`
- `oeSumItemsIntoRegular`
- `offers`
- `openAddProviderWizard`
- `openCampaignModal`
- `openContractEditor`
- `openLeadDrawer`
- `openNotifTarget`
- `openOfferEdit`
- `openProviderModal`
- `openRecordSaleModal`
- `openTaskModal`
- `quickAddTask`
- `renderApMenuFilesList`
- `renderMarketingView`
- `renderProvidersTable`
- `renderTasksView`
- `retreatLead`
- `retreatNegotiation`
- `runPipelineFromCard`
- `saveCampaign`
- `saveContract`
- `saveContractEditor`
- `saveDealValue`
- `saveNegotiationStage`
- `saveOfferEdit`
- `saveProviderContact`
- `saveProviderProfile`
- `saveRedemption`
- `saveTask`
- `sendInvite`
- `sendRpChat`
- `setCampaignStatus`
- `setModalTab`
- `setOfferStatus`
- `setOfferStatusInModal`
- `setTaskStatus`
- `shiftMarketingMonth`
- `showView`
- `sortTasksBy`
- `startCalendarNote`
- `startCsvImport`
- `submitAddProvider`
- `submitComment`
- `submitLead`
- `submitThreadComment`
- `switchDealsSubView`
- `todayOpen`
- `todaySetDate`
- `todaySnooze`
- `toggleAddCampaignForm`
- `toggleAddLeadForm`
- `toggleAddTaskForm`
- `toggleAvatarMenu`
- `toggleChatDrawer`
- `toggleContractPanel`
- `toggleDealSelection`
- `toggleInviteForm`
- `toggleMobileSidebar`
- `toggleNotifPanel`
- `toggleOfferDetails`
- `toggleProviderSelection`
- `toggleSelectAllDeals`
- `toggleSelectAllProviders`
- `toggleShowDroppedLeads`
- `toggleTheme`
- `undoOfferAccept`
- `unfeatureProvider`

## Handler-Mutated Top-Level Names

- `marketingChannelFilter`
- `marketingViewMode`
- `n`
- `open`
- `providerStaleOnly`
- `showArchivedCampaigns`
- `showCancelledTasks`
- `tasksMineOnly`
- `tasksViewMode`
- `w`

## Window Properties Referenced

- `window.L`
- `window.WEIN`
- `window.contractEditorProviderId`
- `window.currentLeadId`
- `window.currentNegotiationId`
- `window.currentProviderId`
- `window.currentSaleProviderId`
- `window.currentTaskId`
- `window.location`
- `window.screen`

## Inline Event Handlers

| File | Line | Attribute | Expression |
| --- | ---: | --- | --- |
| `portal/portal_new.html` | 509 | `onkeydown` | `if(event.key==='Enter')attemptEmailLogin()` |
| `portal/portal_new.html` | 510 | `onclick` | `attemptEmailLogin()` |
| `portal/portal_new.html` | 513 | `onclick` | `attemptForgotPassword()` |
| `portal/portal_new.html` | 520 | `onkeydown` | `if(event.key==='Enter')attemptSetNewPassword()` |
| `portal/portal_new.html` | 521 | `onclick` | `attemptSetNewPassword()` |
| `portal/portal_new.html` | 528 | `onclick` | `toggleMobileSidebar()` |
| `portal/portal_new.html` | 529 | `onclick` | `showView('pipeline')` |
| `portal/portal_new.html` | 547 | `onclick` | `toggleNotifPanel()` |
| `portal/portal_new.html` | 554 | `onclick` | `markAllRead()` |
| `portal/portal_new.html` | 559 | `onclick` | `toggleTheme()` |
| `portal/portal_new.html` | 570 | `onclick` | `toggleAvatarMenu()` |
| `portal/portal_new.html` | 575 | `onclick` | `closeAvatarMenu();showView('settings')` |
| `portal/portal_new.html` | 576 | `onclick` | `closeAvatarMenu();logout()` |
| `portal/portal_new.html` | 637 | `onclick` | `toggleMobileSidebar(false)` |
| `portal/portal_new.html` | 657 | `onclick` | `toggleChatDrawer()` |
| `portal/portal_new.html` | 667 | `onclick` | `sendRpChat('What can you help with?')` |
| `portal/portal_new.html` | 668 | `onclick` | `sendRpChat('Draft a follow-up message for a provider')` |
| `portal/portal_new.html` | 671 | `onkeydown` | `if(event.key==='Enter')sendRpChat()` |
| `portal/portal_new.html` | 672 | `onclick` | `sendRpChat()` |
| `portal/portal_new.html` | 675 | `onclick` | `toggleChatDrawer()` |
| `portal/portal_new.html` | 689 | `onclick` | `closeContractEditor()` |
| `portal/portal_new.html` | 727 | `onclick` | `closeContractEditor()` |
| `portal/portal_new.html` | 728 | `onclick` | `saveContractEditor()` |
| `portal/portal_new.html` | 738 | `onclick` | `closeAddProviderWizard()` |
| `portal/portal_new.html` | 765 | `onclick` | `addProviderGoStep(2)` |
| `portal/portal_new.html` | 779 | `onclick` | `addProviderGoStep(1)` |
| `portal/portal_new.html` | 780 | `onclick` | `addProviderGoStep(3)` |
| `portal/portal_new.html` | 787 | `onchange` | `renderApMenuFilesList()` |
| `portal/portal_new.html` | 801 | `onclick` | `addProviderGoStep(2)` |
| `portal/portal_new.html` | 802 | `onclick` | `submitAddProvider()` |
| `portal/portal_new.html` | 813 | `onclick` | `closeTaskModal()` |
| `portal/portal_new.html` | 850 | `onclick` | `deleteTaskFromModal()` |
| `portal/portal_new.html` | 851 | `onclick` | `closeTaskModal()` |
| `portal/portal_new.html` | 852 | `onclick` | `saveTask()` |
| `portal/portal_new.html` | 859 | `onkeydown` | `if(event.key==='Enter')submitThreadComment('task_id', window.currentTaskId, 'tm-comment-input', 'tm-comments')` |
| `portal/portal_new.html` | 860 | `onclick` | `submitThreadComment('task_id', window.currentTaskId, 'tm-comment-input', 'tm-comments')` |
| `portal/portal_new.html` | 871 | `onclick` | `closeOfferEdit()` |
| `portal/portal_new.html` | 884 | `oninput` | `oeRecalcDiscount()` |
| `portal/portal_new.html` | 889 | `oninput` | `oeApplyDiscount()` |
| `portal/portal_new.html` | 894 | `oninput` | `oeRecalcDiscount()` |
| `portal/portal_new.html` | 906 | `onclick` | `oeSumItemsIntoRegular()` |
| `portal/portal_new.html` | 907 | `onclick` | `oeAddItemRow()` |
| `portal/portal_new.html` | 918 | `onclick` | `closeOfferEdit()` |
| `portal/portal_new.html` | 919 | `onclick` | `saveOfferEdit()` |
| `portal/portal_new.html` | 929 | `onclick` | `closeRecordSaleModal()` |
| `portal/portal_new.html` | 954 | `onclick` | `closeRecordSaleModal()` |
| `portal/portal_new.html` | 955 | `onclick` | `saveRedemption()` |
| `portal/portal_new.html` | 972 | `onclick` | `closeCampaignModal()` |
| `portal/portal_new.html` | 978 | `onkeydown` | `if(event.key==='Enter')document.getElementById('cm-send-btn').click()` |
| `portal/portal_new.html` | 995 | `onclick` | `closeLeadDrawer()` |
| `portal/portal_new.html` | 1033 | `onclick` | `openTaskModal(null, {lead_id: window.currentLeadId})` |
| `portal/portal_new.html` | 1041 | `onkeydown` | `if(event.key==='Enter')submitThreadComment('lead_id', window.currentLeadId, 'lead-drawer-comment-input', 'lead-drawer-comments')` |
| `portal/portal_new.html` | 1042 | `onclick` | `submitThreadComment('lead_id', window.currentLeadId, 'lead-drawer-comment-input', 'lead-drawer-comments')` |
| `portal/portal_new.html` | 1073 | `onclick` | `toggleContractPanel()` |
| `portal/portal_new.html` | 1077 | `onclick` | `closeProviderModal()` |
| `portal/portal_new.html` | 1106 | `onclick` | `toggleContractPanel()` |
| `portal/portal_new.html` | 1111 | `onchange` | `saveContract()` |
| `portal/portal_new.html` | 1123 | `onblur` | `saveContract()` |
| `portal/portal_new.html` | 1131 | `onblur` | `saveContract()` |
| `portal/portal_new.html` | 1133 | `onblur` | `saveContract()` |
| `portal/portal_new.html` | 1138 | `onchange` | `saveContract()` |
| `portal/portal_new.html` | 1149 | `onclick` | `setModalTab('profile')` |
| `portal/portal_new.html` | 1150 | `onclick` | `setModalTab('offers')` |
| `portal/portal_new.html` | 1151 | `onclick` | `setModalTab('files')` |
| `portal/portal_new.html` | 1152 | `onclick` | `setModalTab('notes')` |
| `portal/portal_new.html` | 1162 | `onblur` | `saveProviderProfile()` |
| `portal/portal_new.html` | 1166 | `onchange` | `saveProviderProfile()` |
| `portal/portal_new.html` | 1170 | `onblur` | `saveProviderProfile()` |
| `portal/portal_new.html` | 1176 | `onblur` | `saveProviderContact()` |
| `portal/portal_new.html` | 1180 | `onblur` | `saveProviderContact()` |
| `portal/portal_new.html` | 1184 | `onblur` | `saveProviderContact()` |
| `portal/portal_new.html` | 1200 | `onclick` | `openTaskModal(null, {provider_id: window.currentProviderId})` |
| `portal/portal_new.html` | 1217 | `onclick` | `submitComment()` |
| `src/legacy/portal.js` | 638 | `onclick` | `showView('team')` |
| `src/legacy/portal.js` | 661 | `onclick` | `logout()` |
| `src/legacy/portal.js` | 752 | `onclick` | `toggleInviteForm()` |
| `src/legacy/portal.js` | 766 | `onclick` | `sendInvite()` |
| `src/legacy/portal.js` | 796 | `onclick` | `${onClickFn}('${c.replace(/'/g, ` |
| `src/legacy/portal.js` | 838 | `onclick` | `providerStaleOnly=true;showView('providers');` |
| `src/legacy/portal.js` | 1180 | `onclick` | `openAddProviderWizard()` |
| `src/legacy/portal.js` | 1196 | `onclick` | `providerStaleOnly=false;renderProvidersTable();` |
| `src/legacy/portal.js` | 1203 | `onclick` | `toggleSelectAllProviders()` |
| `src/legacy/portal.js` | 1273 | `onclick` | `openProviderModal(this.dataset.providerId, this.dataset.negotiationId)` |
| `src/legacy/portal.js` | 1274 | `onclick` | `event.stopPropagation();toggleProviderSelection('${provider.id}')` |
| `src/legacy/portal.js` | 1283 | `onclick` | `event.stopPropagation();openProviderModal('${provider.id}', '${row.negotiationId}')` |
| `src/legacy/portal.js` | 1284 | `onclick` | `event.stopPropagation();runPipelineFromCard('${safeName}', '${safeVertical}')` |
| `src/legacy/portal.js` | 1285 | `onclick` | `event.stopPropagation();deleteProvider('${provider.id}', '${safeName}')` |
| `src/legacy/portal.js` | 1329 | `onclick` | `alert('Assign owner — coming soon')` |
| `src/legacy/portal.js` | 1330 | `onclick` | `exportSelectedProvidersCsv()` |
| `src/legacy/portal.js` | 1331 | `onclick` | `archiveSelectedProviders()` |
| `src/legacy/portal.js` | 1332 | `onclick` | `clearProviderSelection()` |
| `src/legacy/portal.js` | 1463 | `onclick` | `deleteFile('${file.id}')` |
| `src/legacy/portal.js` | 1627 | `onclick` | `undoOfferAccept('${offerId}','${prevStatus}')` |
| `src/legacy/portal.js` | 1699 | `oninput` | `oeItemsState[${i}].name=this.value` |
| `src/legacy/portal.js` | 1700 | `oninput` | `oeItemsState[${i}].qty=parseFloat(this.value)\|\|1` |
| `src/legacy/portal.js` | 1701 | `oninput` | `oeItemsState[${i}].unit_price_egp=parseFloat(this.value)\|\|0` |
| `src/legacy/portal.js` | 1702 | `onclick` | `oeRemoveItemRow(${i})` |
| `src/legacy/portal.js` | 1876 | `onclick` | `openProviderModal('${o.provider_id}', '${(cachedNegotiations.find(n => n.provider_id === o.provider_id) \|\| {}).id \|\| ''}')` |
| `src/legacy/portal.js` | 1877 | `onclick` | `toggleOfferDetails('${o.id}')` |
| `src/legacy/portal.js` | 1879 | `onclick` | `setOfferStatus('${o.id}','accepted')` |
| `src/legacy/portal.js` | 1880 | `onclick` | `openOfferEdit('${o.id}')` |
| `src/legacy/portal.js` | 1881 | `onclick` | `setOfferStatus('${o.id}','rejected')` |
| `src/legacy/portal.js` | 1883 | `onclick` | `setOfferStatus('${o.id}','pending')` |
| `src/legacy/portal.js` | 1884 | `onclick` | `setOfferStatus('${o.id}','pending')` |
| `src/legacy/portal.js` | 1886 | `onclick` | `setOfferStatus('${o.id}','accepted')` |
| `src/legacy/portal.js` | 1887 | `onclick` | `setOfferStatus('${o.id}','pending')` |
| `src/legacy/portal.js` | 2039 | `onclick` | `switchDealsSubView('contracts')` |
| `src/legacy/portal.js` | 2040 | `onclick` | `switchDealsSubView('hotdeals')` |
| `src/legacy/portal.js` | 2106 | `onclick` | `exportSelectedDealsCsv()` |
| `src/legacy/portal.js` | 2107 | `onclick` | `clearDealSelection()` |
| `src/legacy/portal.js` | 2226 | `onclick` | `toggleSelectAllDeals()` |
| `src/legacy/portal.js` | 2250 | `onclick` | `toggleDealSelection('${p.id}')` |
| `src/legacy/portal.js` | 2261 | `onblur` | `saveDealValue('${neg.id}', this.value)` |
| `src/legacy/portal.js` | 2277 | `onclick` | `openRecordSaleModal('${p.id}')` |
| `src/legacy/portal.js` | 2278 | `onclick` | `openContractEditor('${p.id}')` |
| `src/legacy/portal.js` | 2324 | `onclick` | `unfeatureProvider('${p.id}')` |
| `src/legacy/portal.js` | 2341 | `onclick` | `featureProvider('${p.id}')` |
| `src/legacy/portal.js` | 2645 | `onclick` | `openProviderModal('${p.id}', '${negotiationFor(p)?.id \|\| ''}');return false;` |
| `src/legacy/portal.js` | 2651 | `onclick` | `openProviderModal('${p.id}', '${negotiationFor(p)?.id \|\| ''}');return false;` |
| `src/legacy/portal.js` | 2657 | `onclick` | `showView('leads');openLeadDrawer('${l.id}');return false;` |
| `src/legacy/portal.js` | 2682 | `onclick` | `event.stopPropagation()` |
| `src/legacy/portal.js` | 2758 | `onclick` | `todayOpen('${encodeURIComponent(JSON.stringify({ kind: x.kind, id: x.id, providerId: x.providerId \|\| '' }))}')` |
| `src/legacy/portal.js` | 2766 | `onclick` | `event.stopPropagation()` |
| `src/legacy/portal.js` | 2768 | `onclick` | `todaySetDate('${x.kind}','${x.id}',null,true)` |
| `src/legacy/portal.js` | 2769 | `onclick` | `todaySnooze('${x.kind}','${x.id}',1)` |
| `src/legacy/portal.js` | 2770 | `onclick` | `todaySnooze('${x.kind}','${x.id}',3)` |
| `src/legacy/portal.js` | 2814 | `onclick` | `tasksViewMode='board';renderTasksView()` |
| `src/legacy/portal.js` | 2815 | `onclick` | `tasksViewMode='list';renderTasksView()` |
| `src/legacy/portal.js` | 2816 | `onclick` | `toggleAddTaskForm()` |
| `src/legacy/portal.js` | 2839 | `onclick` | `toggleAddTaskForm()` |
| `src/legacy/portal.js` | 2840 | `onclick` | `quickAddTask()` |
| `src/legacy/portal.js` | 2844 | `onclick` | `tasksMineOnly=!tasksMineOnly;renderTasksView()` |
| `src/legacy/portal.js` | 2845 | `onclick` | `showCancelledTasks=!showCancelledTasks;renderTasksView()` |
| `src/legacy/portal.js` | 2870 | `onclick` | `openTaskModal('${t.id}')` |
| `src/legacy/portal.js` | 2880 | `onclick` | `event.stopPropagation()` |
| `src/legacy/portal.js` | 2881 | `onclick` | `setTaskStatus('${t.id}','${TASK_COLUMNS[colIdx - 1].id}')` |
| `src/legacy/portal.js` | 2882 | `onclick` | `setTaskStatus('${t.id}','in_progress')` |
| `src/legacy/portal.js` | 2883 | `onclick` | `setTaskStatus('${t.id}','done')` |
| `src/legacy/portal.js` | 2884 | `onclick` | `setTaskStatus('${t.id}','pending')` |
| `src/legacy/portal.js` | 2925 | `onclick` | `sortTasksBy('${key}')` |
| `src/legacy/portal.js` | 2934 | `onclick` | `openTaskModal('${t.id}')` |
| `src/legacy/portal.js` | 3041 | `onclick` | `marketingViewMode='board';renderMarketingView()` |
| `src/legacy/portal.js` | 3042 | `onclick` | `marketingViewMode='calendar';renderMarketingView()` |
| `src/legacy/portal.js` | 3043 | `onclick` | `toggleAddCampaignForm()` |
| `src/legacy/portal.js` | 3065 | `onclick` | `toggleAddCampaignForm()` |
| `src/legacy/portal.js` | 3066 | `onclick` | `saveCampaign()` |
| `src/legacy/portal.js` | 3070 | `onclick` | `marketingChannelFilter='all';renderMarketingView()` |
| `src/legacy/portal.js` | 3072 | `onclick` | `marketingChannelFilter='${k}';renderMarketingView()` |
| `src/legacy/portal.js` | 3073 | `onclick` | `showArchivedCampaigns=!showArchivedCampaigns;renderMarketingView()` |
| `src/legacy/portal.js` | 3114 | `onclick` | `openCampaignModal('${c.id}')` |
| `src/legacy/portal.js` | 3115 | `onclick` | `deleteCalendarNote('${n.id}')` |
| `src/legacy/portal.js` | 3116 | `onclick` | `startCalendarNote(this, '${dateStr}')` |
| `src/legacy/portal.js` | 3121 | `onclick` | `shiftMarketingMonth(-1)` |
| `src/legacy/portal.js` | 3123 | `onclick` | `shiftMarketingMonth(1)` |
| `src/legacy/portal.js` | 3149 | `onclick` | `openCampaignModal('${c.id}')` |
| `src/legacy/portal.js` | 3160 | `onclick` | `event.stopPropagation()` |
| `src/legacy/portal.js` | 3161 | `onclick` | `setCampaignStatus('${c.id}','posted')` |
| `src/legacy/portal.js` | 3162 | `onclick` | `setCampaignStatus('${c.id}','live')` |
| `src/legacy/portal.js` | 3163 | `onclick` | `setCampaignStatus('${c.id}','archived')` |
| `src/legacy/portal.js` | 3164 | `onclick` | `setCampaignStatus('${c.id}','planned')` |
| `src/legacy/portal.js` | 3165 | `onclick` | `deleteCampaign('${c.id}')` |
| `src/legacy/portal.js` | 3519 | `onclick` | `downloadCsvTemplate()` |
| `src/legacy/portal.js` | 3519 | `onclick` | `document.getElementById('leadCsvInput').click()` |
| `src/legacy/portal.js` | 3519 | `onchange` | `startCsvImport(this.files[0]);this.value='';` |
| `src/legacy/portal.js` | 3520 | `onclick` | `toggleAddLeadForm()` |
| `src/legacy/portal.js` | 3538 | `onclick` | `toggleAddLeadForm()` |
| `src/legacy/portal.js` | 3539 | `onclick` | `submitLead()` |
| `src/legacy/portal.js` | 3544 | `onclick` | `toggleShowDroppedLeads()` |
| `src/legacy/portal.js` | 3576 | `onclick` | `deleteLead('${lead.id}')` |
| `src/legacy/portal.js` | 3590 | `onclick` | `openLeadDrawer('${lead.id}')` |
| `src/legacy/portal.js` | 3592 | `onclick` | `event.stopPropagation()` |
| `src/legacy/portal.js` | 3595 | `onclick` | `event.stopPropagation();retreatLead('${lead.id}')` |
| `src/legacy/portal.js` | 3596 | `onclick` | `event.stopPropagation();advanceLead('${lead.id}')` |
| `src/legacy/portal.js` | 3597 | `onclick` | `event.stopPropagation();deleteLead('${lead.id}')` |
| `src/legacy/portal.js` | 3679 | `onclick` | `retreatLead('${lead.id}');closeLeadDrawer();` |
| `src/legacy/portal.js` | 3680 | `onclick` | `advanceLead('${lead.id}');closeLeadDrawer();` |
| `src/legacy/portal.js` | 3682 | `onclick` | `closeLeadDrawer();dropLead('${lead.id}');` |
| `src/legacy/portal.js` | 3691 | `onclick` | `openTaskModal('${t.id}')` |
| `src/legacy/portal.js` | 3950 | `onclick` | `openProviderModal('${provider.id}', '')` |
| `src/legacy/portal.js` | 3956 | `onclick` | `event.stopPropagation();advanceLaunch('${provider.id}')` |
| `src/legacy/portal.js` | 4088 | `onclick` | `openProviderModal(this.dataset.providerId, this.dataset.negotiationId)` |
| `src/legacy/portal.js` | 4096 | `onclick` | `event.stopPropagation()` |
| `src/legacy/portal.js` | 4100 | `onclick` | `event.stopPropagation();runPipelineFromCard('${safeName}', '${(p.vertical \|\| '').replace(/'/g, ` |
| `src/legacy/portal.js` | 4109 | `onclick` | `event.stopPropagation();retreatNegotiation('${item.negotiationId}')` |
| `src/legacy/portal.js` | 4110 | `onclick` | `event.stopPropagation();advanceNegotiation('${item.negotiationId}')` |
| `src/legacy/portal.js` | 4174 | `onclick` | `const w=document.getElementById('modal-archived-offers');const open=w.style.display==='none';w.style.display=open?'flex':'none';this.querySelector('span').textContent=open?'Hide ${archived.length} archived offers':'Show ${archived.length} archived offers (old runs)';` |
| `src/legacy/portal.js` | 4193 | `onclick` | `setOfferStatusInModal('${o.id}','accepted','${providerId}')` |
| `src/legacy/portal.js` | 4194 | `onclick` | `setOfferStatusInModal('${o.id}','rejected','${providerId}')` |
| `src/legacy/portal.js` | 4195 | `onclick` | `setOfferStatusInModal('${o.id}','pending','${providerId}')` |
| `src/legacy/portal.js` | 4207 | `onclick` | `setOfferStatusInModal('${o.id}','accepted','${providerId}')` |
| `src/legacy/portal.js` | 4208 | `onclick` | `toggleOfferDetails('${o.id}')` |
| `src/legacy/portal.js` | 4209 | `onclick` | `openOfferEdit('${o.id}')` |
| `src/legacy/portal.js` | 4210 | `onclick` | `setOfferStatusInModal('${o.id}','rejected','${providerId}')` |
| `src/legacy/portal.js` | 4212 | `onclick` | `setOfferStatusInModal('${o.id}','pending','${providerId}')` |
| `src/legacy/portal.js` | 4214 | `onclick` | `setOfferStatusInModal('${o.id}','pending','${providerId}')` |
| `src/legacy/portal.js` | 4290 | `onchange` | `saveNegotiationStage('${activeNeg.id}', this.value)` |
| `src/legacy/portal.js` | 4342 | `onclick` | `openTaskModal('${t.id}')` |
| `src/legacy/portal.js` | 4356 | `onclick` | `deleteFile('${f.id}')` |
| `src/legacy/portal.js` | 4396 | `onclick` | `deleteComment('${c.id}','${targetCol}','${targetId}','${elId}')` |
| `src/legacy/portal.js` | 4549 | `onblur` | `${saveFn}` |
| `src/legacy/portal.js` | 4897 | `onclick` | `openNotifTarget(${i})` |

## Window Property Reference Sites

| File | Line | Property |
| --- | ---: | --- |
| `portal/portal_new.html` | 11 | `window.screen` |
| `portal/portal_new.html` | 11 | `window.screen` |
| `portal/portal_new.html` | 859 | `window.currentTaskId` |
| `portal/portal_new.html` | 860 | `window.currentTaskId` |
| `portal/portal_new.html` | 1033 | `window.currentLeadId` |
| `portal/portal_new.html` | 1041 | `window.currentLeadId` |
| `portal/portal_new.html` | 1042 | `window.currentLeadId` |
| `portal/portal_new.html` | 1200 | `window.currentProviderId` |
| `src/legacy/portal.js` | 10 | `window.WEIN` |
| `src/legacy/portal.js` | 10 | `window.WEIN` |
| `src/legacy/portal.js` | 87 | `window.location` |
| `src/legacy/portal.js` | 108 | `window.location` |
| `src/legacy/portal.js` | 114 | `window.WEIN` |
| `src/legacy/portal.js` | 121 | `window.WEIN` |
| `src/legacy/portal.js` | 122 | `window.WEIN` |
| `src/legacy/portal.js` | 141 | `window.WEIN` |
| `src/legacy/portal.js` | 207 | `window.WEIN` |
| `src/legacy/portal.js` | 582 | `window.WEIN` |
| `src/legacy/portal.js` | 613 | `window.WEIN` |
| `src/legacy/portal.js` | 745 | `window.WEIN` |
| `src/legacy/portal.js` | 1134 | `window.WEIN` |
| `src/legacy/portal.js` | 1582 | `window.WEIN` |
| `src/legacy/portal.js` | 1582 | `window.WEIN` |
| `src/legacy/portal.js` | 1597 | `window.currentProviderId` |
| `src/legacy/portal.js` | 1645 | `window.currentProviderId` |
| `src/legacy/portal.js` | 1816 | `window.currentProviderId` |
| `src/legacy/portal.js` | 2114 | `window.currentSaleProviderId` |
| `src/legacy/portal.js` | 2131 | `window.currentSaleProviderId` |
| `src/legacy/portal.js` | 2140 | `window.currentSaleProviderId` |
| `src/legacy/portal.js` | 2148 | `window.currentSaleProviderId` |
| `src/legacy/portal.js` | 2156 | `window.WEIN` |
| `src/legacy/portal.js` | 2574 | `window.L` |
| `src/legacy/portal.js` | 2574 | `window.L` |
| `src/legacy/portal.js` | 2800 | `window.WEIN` |
| `src/legacy/portal.js` | 2806 | `window.WEIN` |
| `src/legacy/portal.js` | 2825 | `window.WEIN` |
| `src/legacy/portal.js` | 3234 | `window.WEIN` |
| `src/legacy/portal.js` | 3289 | `window.WEIN` |
| `src/legacy/portal.js` | 3352 | `window.WEIN` |
| `src/legacy/portal.js` | 3377 | `window.WEIN` |
| `src/legacy/portal.js` | 3383 | `window.WEIN` |
| `src/legacy/portal.js` | 3416 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3441 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3465 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3465 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3470 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3470 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3471 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3472 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3473 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3475 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3476 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3480 | `window.WEIN` |
| `src/legacy/portal.js` | 3483 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3497 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3500 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3501 | `window.currentTaskId` |
| `src/legacy/portal.js` | 3612 | `window.currentLeadId` |
| `src/legacy/portal.js` | 3705 | `window.currentLeadId` |
| `src/legacy/portal.js` | 3907 | `window.WEIN` |
| `src/legacy/portal.js` | 4074 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4074 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4155 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4155 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4155 | `window.currentNegotiationId` |
| `src/legacy/portal.js` | 4255 | `window.currentNegotiationId` |
| `src/legacy/portal.js` | 4256 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4360 | `window.currentNegotiationId` |
| `src/legacy/portal.js` | 4362 | `window.currentNegotiationId` |
| `src/legacy/portal.js` | 4390 | `window.WEIN` |
| `src/legacy/portal.js` | 4419 | `window.WEIN` |
| `src/legacy/portal.js` | 4431 | `window.currentNegotiationId` |
| `src/legacy/portal.js` | 4432 | `window.currentNegotiationId` |
| `src/legacy/portal.js` | 4435 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4440 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4443 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4454 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4461 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4462 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4467 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4472 | `window.currentNegotiationId` |
| `src/legacy/portal.js` | 4560 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4561 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4578 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4579 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4592 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4593 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4637 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4645 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4646 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4682 | `window.contractEditorProviderId` |
| `src/legacy/portal.js` | 4694 | `window.contractEditorProviderId` |
| `src/legacy/portal.js` | 4698 | `window.contractEditorProviderId` |
| `src/legacy/portal.js` | 4734 | `window.currentNegotiationId` |
| `src/legacy/portal.js` | 4735 | `window.currentProviderId` |
| `src/legacy/portal.js` | 4791 | `window.WEIN` |
| `src/legacy/portal.js` | 4791 | `window.WEIN` |
| `src/legacy/portal.js` | 4928 | `window.location` |
| `src/legacy/portal.js` | 4928 | `window.location` |
| `src/legacy/portal.js` | 4930 | `window.location` |
