const RECEPTION_KPI_CRITERIA = [
  ['Professional Presentation and Communication',10,'Proper attire and grooming','Minor',1],
  ['Professional Presentation and Communication',10,'Attentive to reception livestream','Standard',2],
  ['Professional Presentation and Communication',10,'Every guest greeted professionally','Standard',2],
  ['Professional Presentation and Communication',10,'Internal requests answered completely and on time','Minor',1],
  ['Professional Presentation and Communication',10,'Important communication documented','Standard',2],
  ['Check-in Speed and Accuracy',10,'Complete-document check-in within 5 minutes','Standard',2],
  ['Check-in Speed and Accuracy',10,'Incomplete-document check-in within 7 minutes','Standard',2],
  ['Check-in Speed and Accuracy',10,'Check-in information accurate and delays documented','Standard',2],
  ['Dashboard Management',10,'Dashboard updated during the shift','Standard',2],
  ['Dashboard Management',10,'No duplicate or missing critical records','Standard',2],
  ['Dashboard Management',10,'Announcements checked and followed','Minor',1],
  ['Complaint Handling and Ownership',15,'Complaint managed by one clearly identified owner','Major',5],
  ['Complaint Handling and Ownership',15,'Reasonable recovery options exhausted before escalation','Major',5],
  ['Complaint Handling and Ownership',15,'Previous guest incidents checked before escalation','Major',5],
  ['Complaint Handling and Ownership',15,'Decision-ready escalation report complete','Major',5],
  ['Complaint Handling and Ownership',15,'No unauthorised voucher, upgrade or refund promise','Critical',10],
  ['De-escalation and Problem-Solving',15,'Calm, respectful and non-confrontational communication','Major',5],
  ['De-escalation and Problem-Solving',15,'One complaint handled at a time with clear next steps','Standard',2],
  ['De-escalation and Problem-Solving',15,'Safety risks prioritised and escalated immediately','Critical',10],
  ['De-escalation and Problem-Solving',15,'Follow-up completed until resolution or acknowledged handover','Major',5],
  ['Guest Reviews and Satisfaction',15,'Guest satisfaction check completed','Minor',1],
  ['Guest Reviews and Satisfaction',15,'Satisfied guest invited to leave an honest review','Minor',1],
  ['Guest Reviews and Satisfaction',15,'Negative feedback documented and actioned','Standard',2],
  ['Cleaning Monitoring',15,'Cleaner arrival and supplies checked','Standard',2],
  ['Cleaning Monitoring',15,'Required room, bathroom and fridge evidence received','Major',5],
  ['Cleaning Monitoring',15,'Cleaning evidence scrutinised and corrections requested','Major',5],
  ['Cleaning Monitoring',15,'Cleaner called after 15 minutes without a response','Standard',2],
  ['Maintenance Management',10,'Maintenance issue logged completely and without duplication','Standard',2],
  ['Maintenance Management',10,'Issue followed up with responsible person and completion time','Major',5],
  ['Maintenance Management',10,'Completion verified before closure','Major',5],
  ['Maintenance Management',10,'Urgent maintenance reported immediately','Critical',10]
].map((r,i)=>({key:`criterion_${i+1}`,category:r[0],weight:r[1],label:r[2],severity:r[3],deduction:r[4]}));

function receptionRating(score){
  if(score>=95)return 'Excellent';
  if(score>=85)return 'Good';
  if(score>=75)return 'Needs Improvement';
  if(score>=65)return 'Unsatisfactory';
  return 'Critical';
}
function calculateReceptionEvaluation(faults){
  const weights={};RECEPTION_KPI_CRITERIA.forEach(c=>weights[c.category]=c.weight);
  const deductions={};faults.forEach(f=>deductions[f.category]=(deductions[f.category]||0)+Number(f.total_deduction||0));
  const categoryScores={};let score=0;
  Object.entries(weights).forEach(([category,weight])=>{categoryScores[category]=Math.max(0,weight-(deductions[category]||0));score+=categoryScores[category]});
  return {score:Math.max(0,score),totalDeduction:Math.max(0,100-score),categoryScores};
}
function localToday(){const d=new Date();return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function wordDownload(html,name){const blob=new Blob(['\ufeff',html],{type:'application/msword;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name+'.doc';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}

async function renderStaffPage(cfg){
  const departments = ['Reception','Cleaners','Accounting','Developers','Sales','Admin'];
  const isUnified = Boolean(cfg.unified);
  await Auth.init();
  if (!Auth.user) return;
  const isManager = Auth.user.role === 'Manager';
  Shared.shell(cfg.slug,cfg.title,cfg.description);
  const content=qs('#content');
  content.innerHTML=`<div class="staff-toolbar"><input id="staffSearch" placeholder="Search employees"><select id="departmentFilter"><option value="">All Departments</option>${departments.map(d=>`<option>${d}</option>`).join('')}</select><select id="statusFilter"><option value="">All Statuses</option><option>Active</option><option>Inactive</option><option>Archived</option></select><button class="btn btn-primary" id="addStaff">+ Add Employee</button></div><div id="staffSections" class="staff-department-sections"></div>`;
  document.body.insertAdjacentHTML('beforeend',`<div id="staffModal" class="modal hidden"><div class="modal-card wide"><div class="modal-head"><h3>${cfg.title} — Employee Profile</h3><button class="btn" data-close="staffModal">×</button></div><form id="staffForm"><div class="modal-body"><input id="staffId" type="hidden">
  <h3>Employee Details</h3>
  <div class="grid2"><div class="field"><label>Full Name</label><input id="fullName" required></div><div class="field"><label>Department</label><select id="staffDepartment" required>${departments.map(d=>`<option>${d}</option>`).join('')}</select></div></div>
  <div class="grid2"><div class="field"><label>Telegram / WhatsApp Account</label><input id="contactNumber"></div><div class="field"><label>Email Address</label><input id="emailAddress" type="email"></div></div>
  <div class="grid2"><div class="field"><label>Date Hired</label><input id="dateStarted" type="date"></div><div class="field"><label>Original Department / Role</label><input id="originalDepartment"></div></div>
  <div class="field"><label>Emergency Contact</label><textarea id="emergencyContact" rows="2"></textarea></div>
  <div class="grid2"><div class="field"><label>Position Title</label><input id="positionTitle"></div><div class="field"><label>Employment Type</label><select id="employmentType"><option>Full-time</option><option>Part-time</option><option>Casual</option><option>Contractor</option><option>Other</option></select></div></div>
  <div class="grid2"><div class="field"><label>Primary Property / Assignment</label><input id="primaryProperty"></div><div class="field"><label>Employment Status</label><select id="accountStatus"><option>Active</option><option>Inactive</option><option>Archived</option></select></div></div>
  <h3>Payment and Tax Details</h3>
  <div class="grid2"><div class="field"><label>Bank Account Name</label><input id="bankAccountName"></div><div class="field"><label>Bank Name</label><input id="bankName"></div></div>
  <div class="grid2"><div class="field"><label>BSB Number</label><input id="bsbNumber"></div><div class="field"><label>Bank Account Number</label><input id="bankAccount"></div></div>
  <div class="grid2"><div class="field"><label>ABN Number</label><input id="abn"></div><div class="field"><label>TFN Number</label><input id="tfn"></div></div>
  ${(cfg.enableEvaluations||isUnified)?`<hr><section id="evaluationSection"><div class="section-head"><div><h3>Reception Performance Evaluations</h3><p class="muted">Daily fault-point grading, coaching records, and period reports.</p></div><div class="row-actions"><button class="btn btn-primary" type="button" id="newEvaluation">+ New Daily Evaluation</button><label class="daily-export-control">Daily report date <input id="exportDailyDate" type="date"></label><button class="btn" type="button" id="exportDaily">Export Consolidated Daily</button><button class="btn" type="button" id="exportWeekly">Export Weekly</button><button class="btn" type="button" id="exportMonthly">Export Monthly</button></div></div><div id="evaluationHistory"></div></section>`:''}
  <hr><h3>Notes and Work History</h3>
  <div class="grid2"><div class="field"><label>Date of Occurrence</label><input id="occurrenceDate" type="date"></div><div class="field"><label>Record Type</label><select id="noteType"><option>General Note</option><option>Attendance</option><option>Performance Concern</option><option>Task Not Completed</option><option>Coaching Discussion</option><option>Warning</option><option>Positive Feedback</option><option>Training</option><option>Incident</option><option>Other</option></select></div></div>
  <div class="field"><label>Description</label><textarea id="noteText" placeholder="Record what happened on the specific date..."></textarea></div><button class="btn" type="button" id="addNote">Add Record</button><div id="notes" style="margin-top:14px"></div></div><div class="modal-foot"><button type="button" class="btn btn-danger" id="deleteStaff">Delete Employee</button><button class="btn btn-primary" type="submit">Save Details</button></div></form></div></div>`);

  if(cfg.enableEvaluations||isUnified){
    document.body.insertAdjacentHTML('beforeend',`<div id="evaluationModal" class="modal hidden"><div class="modal-card wide"><div class="modal-head"><h3 id="evaluationTitle">Daily Reception Evaluation</h3><button class="btn" data-close="evaluationModal">×</button></div><form id="evaluationForm"><div class="modal-body"><input id="evaluationId" type="hidden"><div class="grid2"><div class="field"><label>Evaluation Date</label><input id="evaluationDate" type="date" required></div><div class="field"><label>Evaluator Name</label><input id="evaluatorName" required></div></div><div class="score-summary"><div><strong>Fault-point grading</strong><p class="muted">Enter the number of faults observed. Minor −1, Standard −2, Major −5, Critical −10.</p></div><div class="score-circle" id="liveScore">100</div><div><strong id="liveRating">Excellent</strong><div class="muted" id="liveDeduction">0 points deducted</div></div></div><div class="table-wrap"><table class="eval-table"><thead><tr><th>KPI Category / Criterion</th><th>Severity</th><th>Deduction</th><th>Faults</th><th>Total</th><th>Observation / Evidence</th></tr></thead><tbody id="criteriaBody"></tbody></table></div><h3>Coaching Record</h3><div class="field"><label>Positive Observations</label><textarea id="evalPositive"></textarea></div><div class="field"><label>Coaching Discussion / Performance Concerns</label><textarea id="evalCoaching"></textarea></div><div class="field"><label>Agreed Actions</label><textarea id="evalActions"></textarea></div><div class="grid2"><div class="field"><label>Follow-up Date</label><input id="evalFollowup" type="date"></div><div class="field"><label>Acknowledgement Status</label><select id="evalAcknowledgement"><option>Pending</option><option>Acknowledged</option><option>Declined to acknowledge</option></select></div></div><div class="field"><label>Receptionist Comments</label><textarea id="evalComments"></textarea></div></div><div class="modal-foot"><button class="btn" type="button" data-close="evaluationModal">Cancel</button><button class="btn btn-primary">Save Evaluation</button></div></form></div></div>`);
  }

  // Use explicit element references instead of relying on browser-created globals for element IDs.
  // This keeps the page working consistently when opened directly as a static file.
  const staffSearch = qs('#staffSearch');
  const departmentFilter = qs('#departmentFilter');
  const statusFilter = qs('#statusFilter');
  const addStaff = qs('#addStaff');
  const staffSections = qs('#staffSections');
  const staffModal = qs('#staffModal');
  const staffForm = qs('#staffForm');
  const staffId = qs('#staffId');
  const fullName = qs('#fullName');
  const staffDepartment = qs('#staffDepartment');
  const contactNumber = qs('#contactNumber');
  const emailAddress = qs('#emailAddress');
  const dateStarted = qs('#dateStarted');
  const positionTitle = qs('#positionTitle');
  const originalDepartment = qs('#originalDepartment');
  const emergencyContact = qs('#emergencyContact');
  const employmentType = qs('#employmentType');
  const primaryProperty = qs('#primaryProperty');
  const accountStatus = qs('#accountStatus');
  const bankAccountName = qs('#bankAccountName');
  const bankName = qs('#bankName');
  const bsbNumber = qs('#bsbNumber');
  const bankAccount = qs('#bankAccount');
  const abn = qs('#abn');
  const tfn = qs('#tfn');
  const occurrenceDate = qs('#occurrenceDate');
  const noteType = qs('#noteType');
  const noteText = qs('#noteText');
  const addNote = qs('#addNote');
  const notes = qs('#notes');
  const deleteStaff = qs('#deleteStaff');
  const evaluationSection = qs('#evaluationSection');
  const newEvaluation = qs('#newEvaluation');
  const exportDailyDate = qs('#exportDailyDate');
  const exportDaily = qs('#exportDaily');
  const exportWeekly = qs('#exportWeekly');
  const exportMonthly = qs('#exportMonthly');
  const evaluationHistory = qs('#evaluationHistory');
  const evaluationModal = qs('#evaluationModal');
  const evaluationForm = qs('#evaluationForm');
  const evaluationId = qs('#evaluationId');
  const evaluationDate = qs('#evaluationDate');
  const evaluatorName = qs('#evaluatorName');
  const liveScore = qs('#liveScore');
  const liveRating = qs('#liveRating');
  const liveDeduction = qs('#liveDeduction');
  const criteriaBody = qs('#criteriaBody');
  const evalPositive = qs('#evalPositive');
  const evalCoaching = qs('#evalCoaching');
  const evalActions = qs('#evalActions');
  const evalFollowup = qs('#evalFollowup');
  const evalAcknowledgement = qs('#evalAcknowledgement');
  const evalComments = qs('#evalComments');
  const evaluationTitle = qs('#evaluationTitle');

  const saveStaffButton = staffForm.querySelector('.modal-foot .btn-primary');
  function applyManagerMode(){
    if(!isManager) return;
    addStaff?.classList.add('hidden');
    deleteStaff?.classList.add('hidden');
    saveStaffButton?.classList.add('hidden');
    addNote?.classList.add('hidden');
    staffForm.querySelectorAll('#fullName,#staffDepartment,#contactNumber,#emailAddress,#dateStarted,#positionTitle,#originalDepartment,#emergencyContact,#employmentType,#primaryProperty,#accountStatus,#bankAccountName,#bankName,#bsbNumber,#bankAccount,#abn,#tfn,#occurrenceDate,#noteType,#noteText').forEach(element=>element.disabled=true);
  }
  let rows=[],active=null,evaluations=[];
  async function load(){rows=await DB.list('staff_members',isUnified?'':`department=${encodeURIComponent(cfg.department)}`);if(cfg.enableEvaluations||isUnified)evaluations=await DB.list('receptionist_evaluations');render()}
  function latestEvaluation(id){return evaluations.filter(e=>String(e.staff_member_id)===String(id)).sort((a,b)=>String(b.evaluation_date).localeCompare(String(a.evaluation_date)))[0]}
  function render(){
    const q=staffSearch.value.toLowerCase();
    const dept=departmentFilter?.value||'';
    const status=statusFilter?.value||'';
    const filtered=rows.filter(x=>(!q||JSON.stringify(x).toLowerCase().includes(q))&&(!dept||x.primary_department===dept||x.department===dept)&&(!status||(x.account_status||'Active')===status));
    const visibleDepartments=dept?[dept]:departments;
    const statuses=status?[status]:['Active','Inactive','Archived'];
    const sections=visibleDepartments.map(department=>{
      const departmentPeople=filtered.filter(x=>(x.primary_department||x.department||'')===department);
      if(!departmentPeople.length && !dept) return '';
      const statusBlocks=statuses.map(statusName=>{
        const people=departmentPeople.filter(x=>(x.account_status||'Active')===statusName);
        if(!people.length && !status) return '';
        const rowsHtml=people.length?people.map(x=>{
          const isReception=department==='Reception';
          const ev=isReception?latestEvaluation(x.id):null;
          const currentStatus=x.account_status||'Active';
          const statusControl=isManager
            ? `<span class="staff-status-badge status-${currentStatus.toLowerCase()}">${Shared.esc(currentStatus)}</span>`
            : `<select class="staff-status-select" data-status-id="${x.id}" aria-label="Change status for ${Shared.esc(x.full_name)}"><option value="Active" ${currentStatus==='Active'?'selected':''}>Active</option><option value="Inactive" ${currentStatus==='Inactive'?'selected':''}>Inactive</option></select>`;
          return `<tr><td><button class="link-btn" data-open="${x.id}">${Shared.esc(x.full_name)}</button></td><td>${Shared.esc(x.position_title||'-')}</td><td>${Shared.esc(x.contact_number||'-')}</td><td>${Shared.esc(x.email_address||'-')}</td><td>${Shared.esc(x.employment_type||'-')}</td><td>${Shared.fmtDate(x.date_started)}</td><td>${isReception?(ev?`<strong>${Number(ev.total_score).toFixed(1)}%</strong><div class="muted">${Shared.esc(ev.rating)}</div>`:'No evaluations'):Shared.esc(x.latest_note||'-')}</td><td>${statusControl}</td><td><button class="btn" data-open="${x.id}">${isManager?'View Profile':'Open Profile'}</button></td></tr>`;
        }).join(''):'<tr><td colspan="9" class="table-empty">No employees in this section.</td></tr>';
        return `<div class="staff-status-section status-${statusName.toLowerCase()}"><div class="staff-status-head"><h3>${Shared.esc(statusName)} Employees</h3><span>${people.length}</span></div><div class="table-wrap"><table><thead><tr><th>Name</th><th>Position</th><th>Contact</th><th>Email</th><th>Employment</th><th>Date Started</th><th>Latest Record</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rowsHtml}</tbody></table></div></div>`;
      }).join('');
      return `<section class="staff-department-section"><div class="staff-department-head"><div><h2>${Shared.esc(department)}</h2><p>${departmentPeople.length} employee${departmentPeople.length===1?'':'s'}</p></div>${isManager?'':`<button type="button" class="btn department-add" data-add-department="${Shared.esc(department)}">+ Add to ${Shared.esc(department)}</button>`}</div>${statusBlocks||'<div class="staff-empty-state">No employee records match the selected filters in this department.</div>'}</section>`;
    }).join('');
    staffSections.innerHTML=sections||'<div class="staff-empty-state">No employee records match the selected filters.</div>';
    qsa('[data-open]').forEach(b=>b.onclick=()=>open(b.dataset.open));
    qsa('[data-add-department]').forEach(b=>b.onclick=()=>open('',b.dataset.addDepartment));
    qsa('[data-status-id]').forEach(select=>select.onchange=async()=>{
      const id=select.dataset.statusId;
      const previous=rows.find(item=>String(item.id)===String(id))?.account_status||'Active';
      const next=select.value;
      if(previous===next) return;
      select.disabled=true;
      try{
        await DB.update('staff_members',id,{account_status:next,status:next});
        Shared.toast(`Employee moved to ${next} Employees.`);
        await load();
      }catch(error){
        select.value=previous;
        select.disabled=false;
        Shared.toast(error?.message||'Employee status could not be updated.');
      }
    });
  }
  async function renderEvaluationHistory(){if(!(cfg.enableEvaluations||isUnified)||!active)return;const list=evaluations.filter(e=>String(e.staff_member_id)===String(active.id)).sort((a,b)=>String(b.evaluation_date).localeCompare(String(a.evaluation_date)));evaluationHistory.innerHTML=list.length?list.map(e=>`<div class="note-item eval-history-card"><div><strong>${Shared.fmtDate(e.evaluation_date)} — ${Shared.esc(e.rating)}</strong><p>Score: <b>${Number(e.total_score).toFixed(1)}%</b> · Evaluator: ${Shared.esc(e.evaluator_name||'-')}</p><span class="muted">${Shared.esc(e.coaching_notes||e.positive_observations||'No coaching notes recorded.')}</span></div><div class="row-actions">${isManager?'':`<button class="btn" type="button" data-edit-eval="${e.id}">View / Edit</button>`}<button class="btn" type="button" data-export-eval="${e.id}">Export Word</button>${isManager?'':`<button class="btn btn-danger" type="button" data-delete-eval="${e.id}">Delete</button>`}</div></div>`).join(''):'<p class="muted">No daily evaluations have been recorded.</p>';qsa('[data-edit-eval]').forEach(b=>b.onclick=()=>openEvaluation(b.dataset.editEval));qsa('[data-export-eval]').forEach(b=>b.onclick=()=>exportEvaluation(b.dataset.exportEval));qsa('[data-delete-eval]').forEach(b=>b.onclick=async()=>{if(confirm('Delete this evaluation?')){const evaluation=evaluations.find(item=>String(item.id)===String(b.dataset.deleteEval));await DB.remove('receptionist_evaluations',b.dataset.deleteEval);for(const path of evidencePathsForEvaluation(evaluation)){try{await EvidenceStore.remove(path)}catch(error){console.warn('Evidence cleanup failed',error)}}evaluations=await DB.list('receptionist_evaluations');await renderEvaluationHistory();render()}})}
  async function open(id='',presetDepartment=''){active=rows.find(x=>String(x.id)===String(id))||null;staffForm.reset();staffId.value=active?.id||'';fullName.value=active?.full_name||'';staffDepartment.value=active?.primary_department||active?.department||cfg.department||'Reception';contactNumber.value=active?.contact_number||'';emailAddress.value=active?.email_address||'';dateStarted.value=active?.date_started||'';positionTitle.value=active?.position_title||'';originalDepartment.value=active?.original_department||active?.position_title||'';emergencyContact.value=active?.emergency_contact||'';employmentType.value=active?.employment_type||'Full-time';primaryProperty.value=active?.primary_property||'';accountStatus.value=active?.account_status||'Active';bankAccountName.value=active?.bank_account_name||'';bankName.value=active?.bank_name||'';bsbNumber.value=active?.bsb_number||'';bankAccount.value=active?.bank_account_number||'';abn.value=active?.abn_number||'';tfn.value=active?.tfn_number||'';occurrenceDate.value=localToday();deleteStaff.classList.toggle('hidden',!active);if(cfg.enableEvaluations||isUnified){const receptionActive=Boolean(active&&(active.primary_department||active.department)==='Reception');evaluationSection.classList.toggle('hidden',!receptionActive);newEvaluation.disabled=!receptionActive;exportDaily.disabled=!receptionActive;exportDailyDate.disabled=!receptionActive;exportWeekly.disabled=!receptionActive;exportMonthly.disabled=!receptionActive;if(receptionActive){exportDailyDate.value=exportDailyDate.value||localToday();await renderEvaluationHistory()}}notes.innerHTML='';if(active){const ns=await DB.list('staff_notes',`staff_member_id=${active.id}`);notes.innerHTML=ns.length?ns.map(n=>`<div class="note-item"><strong>${Shared.fmtDate(n.occurrence_date)} · ${Shared.esc(n.note_type||'Record')}</strong><p>${Shared.esc(n.note)}</p><span class="muted">${Shared.esc(n.author_email||'')} · ${Shared.esc(n.created_at||'')}</span>${isManager?'':`<div style="margin-top:8px"><button class="btn btn-danger" type="button" data-delete-note="${n.id}">Delete Record</button></div>`}</div>`).join(''):'<p class="muted">No notes or work-history records.</p>';qsa('[data-delete-note]').forEach(b=>b.onclick=async()=>{if(confirm('Delete this record?')){await DB.remove('staff_notes',b.dataset.deleteNote);open(active.id)}})}applyManagerMode();Shared.openModal('staffModal')}

  let criterionAttachments = {};
  let newlyUploadedEvidence = new Set();
  let pendingEvidenceDeletes = new Set();
  function currentFaults(){return RECEPTION_KPI_CRITERIA.map(c=>{const count=Math.max(0,Number(qs(`[data-fault-count="${c.key}"]`)?.value||0));const note=qs(`[data-fault-note="${c.key}"]`)?.value.trim()||'';const attachments=criterionAttachments[c.key]||[];return {...c,fault_count:count,notes:note,attachments,total_deduction:count*c.deduction}}).filter(f=>f.fault_count||f.notes||(f.attachments&&f.attachments.length))}
  function updateScore(){const result=calculateReceptionEvaluation(currentFaults());liveScore.textContent=result.score.toFixed(result.score%1?1:0);liveRating.textContent=receptionRating(result.score);liveDeduction.textContent=`${result.totalDeduction} points deducted`;RECEPTION_KPI_CRITERIA.forEach(c=>{const el=qs(`[data-fault-total="${c.key}"]`);if(el){const count=Number(qs(`[data-fault-count="${c.key}"]`)?.value||0);el.textContent=count*c.deduction}})}
  function formatFileSize(bytes){const n=Number(bytes||0);if(n<1024)return `${n} B`;if(n<1048576)return `${(n/1024).toFixed(1)} KB`;return `${(n/1048576).toFixed(1)} MB`}
  function renderEvidenceList(key){const box=qs(`[data-evidence-list="${key}"]`);if(!box)return;const files=criterionAttachments[key]||[];box.innerHTML=files.length?files.map(file=>`<div class="evidence-chip"><span class="evidence-icon">${String(file.type||'').startsWith('video/')?'▶':'▧'}</span><button type="button" class="evidence-name" data-open-evidence="${file.id}" title="Open evidence">${Shared.esc(file.name)}</button><small>${formatFileSize(file.size)}</small><button type="button" class="evidence-remove" data-remove-evidence="${file.id}" data-key="${key}" aria-label="Remove evidence">×</button></div>`).join(''):'<div class="evidence-empty">No picture or video attached.</div>';
    qsa('[data-open-evidence]',box).forEach(btn=>btn.onclick=async()=>{try{await EvidenceStore.open(btn.dataset.openEvidence)}catch(error){Shared.toast(error.message)}});
    qsa('[data-remove-evidence]',box).forEach(btn=>btn.onclick=async()=>{
      const path=btn.dataset.removeEvidence;
      const list=criterionAttachments[btn.dataset.key]||[];
      criterionAttachments[btn.dataset.key]=list.filter(item=>item.id!==path);
      if(newlyUploadedEvidence.has(path)){
        try{await EvidenceStore.remove(path);newlyUploadedEvidence.delete(path)}catch(error){Shared.toast(error.message||'Evidence could not be removed.')}
      }else{
        pendingEvidenceDeletes.add(path);
      }
      renderEvidenceList(btn.dataset.key);updateScore();
    });
  }
  async function attachEvidenceFiles(key, incomingFiles){
    const files=[...incomingFiles].filter(file=>String(file.type||'').startsWith('image/')||String(file.type||'').startsWith('video/'));
    if(!files.length){Shared.toast('Only picture and video files can be attached.');return;}
    try{
      for(const original of files){
        let file=original;
        if(!file.name){
          const ext=String(file.type||'image/png').split('/')[1]?.split('+')[0]||'png';
          file=new File([file],`pasted-evidence-${Date.now()}.${ext}`,{type:file.type||'image/png'});
        }
        const meta=await EvidenceStore.save(file);
        criterionAttachments[key]=[...(criterionAttachments[key]||[]),meta];
        newlyUploadedEvidence.add(meta.id);
      }
      renderEvidenceList(key);updateScore();
      Shared.toast(`${files.length} evidence file${files.length===1?'':'s'} attached.`);
    }catch(error){Shared.toast(error.message||'Could not attach evidence.');}
  }
  function renderCriteria(existing=[]){criterionAttachments={};const map=Object.fromEntries((existing||[]).map(f=>[f.key,f]));let last='';criteriaBody.innerHTML=RECEPTION_KPI_CRITERIA.map(c=>{const f=map[c.key]||{};criterionAttachments[c.key]=Array.isArray(f.attachments)?[...f.attachments]:[];const header=c.category!==last?`<tr><td colspan="6" class="category-row">${Shared.esc(c.category)} <span class="muted">(${c.weight}% maximum)</span></td></tr>`:'';last=c.category;return `${header}<tr><td>${Shared.esc(c.label)}</td><td><span class="severity ${c.severity.toLowerCase()}">${c.severity}</span></td><td>${c.deduction}</td><td><input class="fault-input" type="number" min="0" step="1" value="${Number(f.fault_count||0)}" data-fault-count="${c.key}"></td><td><strong data-fault-total="${c.key}">${Number(f.total_deduction||0)}</strong></td><td><div class="evidence-editor" data-evidence-drop="${c.key}"><input value="${Shared.esc(f.notes||'')}" data-fault-note="${c.key}" placeholder="Write a note, or paste a picture here"><div class="evidence-dropzone" tabindex="0" data-evidence-zone="${c.key}"><strong>Paste, drag or upload evidence</strong><span>Ctrl+V / Cmd+V, drop pictures or videos here, or choose files</span><label class="btn evidence-upload">Choose Picture / Video<input type="file" accept="image/*,video/*" multiple data-evidence-input="${c.key}"></label></div><div class="evidence-list" data-evidence-list="${c.key}"></div></div></td></tr>`}).join('');
    qsa('[data-fault-count],[data-fault-note]').forEach(el=>el.oninput=updateScore);
    qsa('[data-evidence-input]').forEach(input=>input.onchange=async()=>{const files=[...input.files];input.disabled=true;await attachEvidenceFiles(input.dataset.evidenceInput,files);input.value='';input.disabled=false});
    qsa('[data-evidence-zone]').forEach(zone=>{
      const key=zone.dataset.evidenceZone;
      ['dragenter','dragover'].forEach(name=>zone.addEventListener(name,event=>{event.preventDefault();event.stopPropagation();zone.classList.add('drag-over')}));
      ['dragleave','drop'].forEach(name=>zone.addEventListener(name,event=>{event.preventDefault();event.stopPropagation();zone.classList.remove('drag-over')}));
      zone.addEventListener('drop',event=>attachEvidenceFiles(key,event.dataTransfer?.files||[]));
      zone.addEventListener('paste',event=>{const files=[...(event.clipboardData?.items||[])].filter(item=>item.kind==='file').map(item=>item.getAsFile()).filter(Boolean);if(files.length){event.preventDefault();attachEvidenceFiles(key,files)}});
    });
    qsa('[data-fault-note]').forEach(input=>input.addEventListener('paste',event=>{const files=[...(event.clipboardData?.items||[])].filter(item=>item.kind==='file').map(item=>item.getAsFile()).filter(Boolean);if(files.length){event.preventDefault();attachEvidenceFiles(input.dataset.faultNote,files)}}));
    RECEPTION_KPI_CRITERIA.forEach(c=>renderEvidenceList(c.key));updateScore()}
  function openEvaluation(id=''){if(!active)return;newlyUploadedEvidence=new Set();pendingEvidenceDeletes=new Set();const ev=evaluations.find(e=>String(e.id)===String(id));evaluationForm.reset();evaluationId.value=ev?.id||'';evaluationDate.value=ev?.evaluation_date||localToday();evaluatorName.value=ev?.evaluator_name||Auth.user?.full_name||Auth.user?.email||'';evalPositive.value=ev?.positive_observations||'';evalCoaching.value=ev?.coaching_notes||'';evalActions.value=ev?.agreed_actions||'';evalFollowup.value=ev?.follow_up_date||'';evalAcknowledgement.value=ev?.acknowledgement_status||'Pending';evalComments.value=ev?.employee_comments||'';evaluationTitle.textContent=`${active.full_name} — Daily Reception Evaluation`;renderCriteria(ev?.faults||[]);Shared.openModal('evaluationModal')}
  evaluationForm?.addEventListener('submit',async e=>{
    e.preventDefault();
    const saveButton=evaluationForm.querySelector('.modal-foot .btn-primary');
    const originalText=saveButton?.textContent;
    if(saveButton){saveButton.disabled=true;saveButton.textContent='Saving…';}
    try{
      const faults=currentFaults();
      const calc=calculateReceptionEvaluation(faults);
      const payload={staff_member_id:active.id,evaluation_date:evaluationDate.value,evaluator_name:evaluatorName.value.trim(),total_score:calc.score,total_deduction:calc.totalDeduction,rating:receptionRating(calc.score),faults,positive_observations:evalPositive.value.trim(),coaching_notes:evalCoaching.value.trim(),agreed_actions:evalActions.value.trim(),follow_up_date:evalFollowup.value||null,acknowledgement_status:evalAcknowledgement.value,employee_comments:evalComments.value.trim()};
      if(evaluationId.value){
        await DB.update('receptionist_evaluations',evaluationId.value,payload);
      }else{
        await DB.create('receptionist_evaluations',{...payload,evaluator_user_id:Auth.user?.auth_user_id||null,evaluator_email:Auth.user?.email||null});
      }
      for(const path of pendingEvidenceDeletes){
        try{await EvidenceStore.remove(path)}catch(error){console.warn('Evidence cleanup failed',error)}
      }
      newlyUploadedEvidence.clear();pendingEvidenceDeletes.clear();
      Shared.closeModal('evaluationModal');
      evaluations=await DB.list('receptionist_evaluations');
      exportDailyDate.value=evaluationDate.value;
      await renderEvaluationHistory();render();
      Shared.toast('Evaluation saved. Multiple evaluators may submit separate evaluations for the same date.');
    }catch(error){
      Shared.toast(error.message||'Evaluation could not be saved.');
    }finally{
      if(saveButton){saveButton.disabled=false;saveButton.textContent=originalText||'Save Evaluation';}
    }
  });
  async function discardUnsavedEvidence(){
    const paths=[...newlyUploadedEvidence];
    newlyUploadedEvidence.clear();pendingEvidenceDeletes.clear();
    for(const path of paths){try{await EvidenceStore.remove(path)}catch(error){console.warn('Evidence cleanup failed',error)}}
  }
  function evidencePathsForEvaluation(evaluation){
    return (evaluation?.faults||[]).flatMap(fault=>Array.isArray(fault.attachments)?fault.attachments.map(item=>item.id).filter(Boolean):[]);
  }
  function exportEvaluation(id){const e=evaluations.find(x=>String(x.id)===String(id));if(!e||!active)return;const rows=(e.faults||[]).length?(e.faults||[]).map(f=>`<tr><td>${Shared.esc(f.category)}</td><td>${Shared.esc(f.label)}</td><td>${Shared.esc(f.severity)}</td><td>${f.fault_count}</td><td>${f.total_deduction}</td><td>${Shared.esc(f.notes||'')}${(f.attachments||[]).length?`<br><small>Attachments: ${(f.attachments||[]).map(a=>Shared.esc(a.name)).join(', ')}</small>`:''}</td></tr>`).join(''):'<tr><td colspan="6">No faults recorded.</td></tr>';wordDownload(`<html><head><style>body{font-family:Arial;color:#17324d}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccd8e3;padding:6px}th{background:#eaf3f8}</style></head><body><h1>Daily Receptionist Evaluation</h1><p><b>Receptionist:</b> ${Shared.esc(active.full_name)}</p><p><b>Date:</b> ${Shared.fmtDate(e.evaluation_date)} &nbsp; <b>Evaluator:</b> ${Shared.esc(e.evaluator_name)}</p><h2>Final Score: ${Number(e.total_score).toFixed(1)}% — ${Shared.esc(e.rating)}</h2><table><tr><th>Category</th><th>Criterion</th><th>Severity</th><th>Faults</th><th>Deduction</th><th>Evidence</th></tr>${rows}</table><h2>Coaching Record</h2><p><b>Positive observations:</b><br>${Shared.esc(e.positive_observations||'-')}</p><p><b>Coaching discussion:</b><br>${Shared.esc(e.coaching_notes||'-')}</p><p><b>Agreed actions:</b><br>${Shared.esc(e.agreed_actions||'-')}</p><p><b>Receptionist comments:</b><br>${Shared.esc(e.employee_comments||'-')}</p></body></html>`,`${active.full_name.replace(/[^a-z0-9]+/gi,'_')}_${e.evaluation_date}_Reception_Evaluation`)}
  function uniqueText(values){return [...new Set(values.map(value=>String(value||'').trim()).filter(Boolean))]}
  function exportConsolidatedDaily(dateValue){
    if(!active)return;
    const date=dateValue||localToday();
    const list=evaluations.filter(e=>String(e.staff_member_id)===String(active.id)&&e.evaluation_date===date).sort((a,b)=>String(a.created_at||'').localeCompare(String(b.created_at||'')));
    if(!list.length)return alert('No evaluations found for the selected date.');
    const average=list.reduce((sum,item)=>sum+Number(item.total_score||0),0)/list.length;
    const grouped=new Map();
    list.forEach(item=>(item.faults||[]).forEach(fault=>{
      const key=fault.key||`${fault.category}|${fault.label}`;
      if(!grouped.has(key))grouped.set(key,{category:fault.category,label:fault.label,severity:fault.severity,fault_count:0,total_deduction:0,evidence:[]});
      const row=grouped.get(key);row.fault_count+=Number(fault.fault_count||0);row.total_deduction+=Number(fault.total_deduction||0);
      if(fault.notes)row.evidence.push(`${item.evaluator_name||item.evaluator_email||'Evaluator'}: ${fault.notes}`);
      (fault.attachments||[]).forEach(file=>row.evidence.push(`${item.evaluator_name||item.evaluator_email||'Evaluator'} attachment: ${file.name||'Evidence file'}`));
    }));
    const faultRows=grouped.size?[...grouped.values()].map(row=>`<tr><td>${Shared.esc(row.category||'')}</td><td>${Shared.esc(row.label||'')}</td><td>${Shared.esc(row.severity||'')}</td><td>${row.fault_count}</td><td>${row.total_deduction}</td><td>${uniqueText(row.evidence).map(Shared.esc).join('<br>')||'-'}</td></tr>`).join(''):'<tr><td colspan="6">No faults were recorded by any evaluator.</td></tr>';
    const evaluatorRows=list.map(item=>`<tr><td>${Shared.esc(item.evaluator_name||item.evaluator_email||'-')}</td><td>${Shared.esc(item.evaluator_email||'-')}</td><td>${Number(item.total_score||0).toFixed(1)}%</td><td>${Shared.esc(item.rating||receptionRating(Number(item.total_score||0)))}</td><td>${Number(item.total_deduction||0).toFixed(1)}</td><td>${Shared.esc(item.acknowledgement_status||'Pending')}</td></tr>`).join('');
    const makeList=values=>uniqueText(values).map(value=>`<li>${Shared.esc(value)}</li>`).join('')||'<li>None recorded.</li>';
    const html=`<html><head><style>body{font-family:Arial;color:#17324d;font-size:10.5pt}h1{color:#102d4f}table{width:100%;border-collapse:collapse;margin:8px 0 16px}th,td{border:1px solid #ccd8e3;padding:7px;vertical-align:top}th{background:#eaf3f8;text-align:left}.score{padding:12px;border:2px solid #4f7d91;background:#f4f8f9;font-size:16pt;font-weight:bold}</style></head><body><h1>Consolidated Daily Receptionist Evaluation</h1><p><b>Receptionist:</b> ${Shared.esc(active.full_name)}</p><p><b>Evaluation date:</b> ${Shared.fmtDate(date)}</p><p><b>Number of evaluator submissions:</b> ${list.length}</p><div class="score">Consolidated Score: ${average.toFixed(1)}% — ${Shared.esc(receptionRating(average))}</div><h2>Evaluator Results</h2><table><tr><th>Evaluator</th><th>Email</th><th>Score</th><th>Rating</th><th>Deduction</th><th>Acknowledgement</th></tr>${evaluatorRows}</table><h2>Consolidated Faults, Observations and Evidence</h2><table><tr><th>Category</th><th>Criterion</th><th>Severity</th><th>Total Faults</th><th>Total Deduction</th><th>Combined Evidence</th></tr>${faultRows}</table><h2>Consolidated Coaching Record</h2><p><b>Positive observations</b></p><ul>${makeList(list.map(item=>item.positive_observations))}</ul><p><b>Coaching discussions / concerns</b></p><ul>${makeList(list.map(item=>item.coaching_notes))}</ul><p><b>Agreed actions</b></p><ul>${makeList(list.map(item=>item.agreed_actions))}</ul><p><b>Receptionist comments</b></p><ul>${makeList(list.map(item=>item.employee_comments))}</ul></body></html>`;
    wordDownload(html,`${active.full_name.replace(/[^a-z0-9]+/gi,'_')}_${date}_Consolidated_Daily_Evaluation`)
  }
  function exportPeriod(type){if(!active)return;const ref=localToday();const d=new Date(ref+'T00:00:00');let start,end,label;if(type==='weekly'){const day=d.getDay()||7;d.setDate(d.getDate()-day+1);start=d.toISOString().slice(0,10);const x=new Date(d);x.setDate(x.getDate()+6);end=x.toISOString().slice(0,10);label=`${Shared.fmtDate(start)} - ${Shared.fmtDate(end)}`}else{start=`${ref.slice(0,7)}-01`;const x=new Date(d.getFullYear(),d.getMonth()+1,0);end=x.toISOString().slice(0,10);label=d.toLocaleDateString('en-AU',{month:'long',year:'numeric'})}const list=evaluations.filter(e=>String(e.staff_member_id)===String(active.id)&&e.evaluation_date>=start&&e.evaluation_date<=end);if(!list.length)return alert(`No evaluations found for this ${type==='weekly'?'week':'month'}.`);const byDate={};list.forEach(item=>(byDate[item.evaluation_date]??=[]).push(item));const daily=Object.entries(byDate).sort(([a],[b])=>a.localeCompare(b)).map(([date,items])=>({date,items,score:items.reduce((sum,item)=>sum+Number(item.total_score||0),0)/items.length}));const avg=daily.reduce((sum,item)=>sum+item.score,0)/daily.length;const rows=daily.map(day=>`<tr><td>${Shared.fmtDate(day.date)}</td><td>${day.items.length}</td><td>${day.score.toFixed(1)}%</td><td>${Shared.esc(receptionRating(day.score))}</td><td>${Shared.esc(uniqueText(day.items.map(item=>item.evaluator_name||item.evaluator_email)).join(', '))}</td></tr>`).join('');wordDownload(`<html><head><style>body{font-family:Arial;color:#17324d}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccd8e3;padding:7px}th{background:#eaf3f8}</style></head><body><h1>${type==='weekly'?'Weekly':'Monthly'} Receptionist Evaluation Summary</h1><p><b>Receptionist:</b> ${Shared.esc(active.full_name)}</p><p><b>Reporting Period:</b> ${label}</p><h2>Average Consolidated Daily Score: ${avg.toFixed(1)}% — ${receptionRating(avg)}</h2><p>Multiple evaluator submissions on the same date are averaged into one consolidated daily result before calculating this period average.</p><table><tr><th>Date</th><th>Evaluator Submissions</th><th>Consolidated Daily Score</th><th>Rating</th><th>Evaluators</th></tr>${rows}</table></body></html>`,`${active.full_name.replace(/[^a-z0-9]+/gi,'_')}_${start}_to_${end}_Reception_Summary`) }

  staffForm.addEventListener('submit', async event => {
    event.preventDefault();
    if(isManager){Shared.toast('Manager access is read-only for employee records.');return;}
    const saveButton = staffForm.querySelector('button[type="submit"], .modal-foot .btn-primary');
    const name = fullName.value.trim();
    if (!name) {
      fullName.focus();
      Shared.toast('Full Name is required.');
      return;
    }
    const payload = {
      full_name: name,
      contact_number: contactNumber.value.trim(),
      email_address: emailAddress.value.trim(),
      date_started: dateStarted.value || null,
      position_title: positionTitle.value.trim(),
      original_department: originalDepartment.value.trim(),
      emergency_contact: emergencyContact.value.trim(),
      telegram_whatsapp: contactNumber.value.trim(),
      employment_type: employmentType.value,
      primary_property: primaryProperty.value.trim(),
      account_status: accountStatus.value,
      status: accountStatus.value,
      bank_account_name: bankAccountName.value.trim(),
      bank_name: bankName.value.trim(),
      bsb_number: bsbNumber.value.trim(),
      bank_account_number: bankAccount.value.trim(),
      abn_number: abn.value.trim(),
      tfn_number: tfn.value.trim(),
      primary_department: staffDepartment.value,
      department: staffDepartment.value
    };
    const originalText = saveButton?.textContent;
    if (saveButton) { saveButton.disabled = true; saveButton.textContent = 'Saving...'; }
    try {
      if (staffId.value) await DB.update('staff_members', staffId.value, payload);
      else await DB.create('staff_members', payload);
      Shared.closeModal('staffModal');
      await load();
      Shared.toast(staffId.value ? 'Employee details updated.' : 'Employee added successfully.');
    } catch (error) {
      console.error(error);
      Shared.toast(error?.message || 'Employee could not be saved.');
    } finally {
      if (saveButton) { saveButton.disabled = false; saveButton.textContent = originalText || 'Save Details'; }
    }
  });
  addNote.onclick=async()=>{if(isManager)return Shared.toast('Manager access is read-only for employee records.');if(!staffId.value)return alert('Save the employee first.');if(!noteText.value.trim())return;await DB.create('staff_notes',{staff_member_id:staffId.value,occurrence_date:occurrenceDate.value,note_type:noteType.value,note:noteText.value,department:staffDepartment.value});noteText.value='';open(staffId.value)};
  deleteStaff.onclick=async()=>{if(isManager)return Shared.toast('Manager access is read-only for employee records.');if(active&&confirm('Delete this employee and all connected notes and evaluations?')){const related=evaluations.filter(item=>String(item.staff_member_id)===String(active.id));await DB.remove('staff_members',active.id);for(const evaluation of related){for(const path of evidencePathsForEvaluation(evaluation)){try{await EvidenceStore.remove(path)}catch(error){console.warn('Evidence cleanup failed',error)}}}Shared.closeModal('staffModal');await load()}};
  if(cfg.enableEvaluations||isUnified){exportDailyDate.value=localToday();newEvaluation.onclick=()=>openEvaluation();exportDaily.onclick=()=>exportConsolidatedDaily(exportDailyDate.value);exportWeekly.onclick=()=>exportPeriod('weekly');exportMonthly.onclick=()=>exportPeriod('monthly')}
  addStaff.onclick=()=>open();staffSearch.oninput=render;if(departmentFilter)departmentFilter.onchange=render;if(statusFilter)statusFilter.onchange=render;qsa('[data-close]').forEach(b=>b.onclick=async()=>{if(b.dataset.close==='evaluationModal')await discardUnsavedEvidence();Shared.closeModal(b.dataset.close)});applyManagerMode();await load();
}
window.renderStaffPage=renderStaffPage;
