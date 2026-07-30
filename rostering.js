(async()=>{
  const DEPARTMENTS = [
    {key:'Reception', label:'Reception Roster', staffLabel:'Receptionists', summaryLabel:'Receptionist Weekly Summary'},
    {key:'Cleaners', label:'Cleaner & Housekeeping Roster', staffLabel:'Cleaners', summaryLabel:'Cleaner Weekly Summary'},
    {key:'Accounting', label:'Accounting Roster', staffLabel:'Accounting Staff', summaryLabel:'Accounting Weekly Summary'},
    {key:'Developers', label:'Developers Roster', staffLabel:'Developers', summaryLabel:'Developers Weekly Summary'},
    {key:'Sales', label:'Sales Roster', staffLabel:'Sales Staff', summaryLabel:'Sales Weekly Summary'},
    {key:'Admin', label:'Admin Roster', staffLabel:'Admin Staff', summaryLabel:'Admin Weekly Summary'}
  ];

  await Auth.init();
  const isCleanerRosterManager = Auth.user?.role === 'Cleaner Roster Manager';
  const availableDepartments = isCleanerRosterManager ? DEPARTMENTS.filter(item => item.key === 'Cleaners') : DEPARTMENTS;
  Shared.shell('rostering', isCleanerRosterManager ? 'Cleaner Rostering' : 'Department Rostering', isCleanerRosterManager ? 'Create and manage the weekly Cleaners roster.' : 'Create and manage weekly rosters for every department using drag-and-drop assignments.');
  const $=id=>document.getElementById(id);
  const content=$('content');
  const iso=d=>{const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,10)};
  const monday=d=>{const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x};
  const normalizeDepartment=value=>String(value||'').trim().toLowerCase();
  const isActiveStaff=person=>String(person.status||'Active').trim().toLowerCase()==='active'&&String(person.account_status||'Active').trim().toLowerCase()==='active';
  const cfg=()=>availableDepartments.find(item=>item.key===activeDepartment)||availableDepartments[0];
  let week=iso(monday(new Date())), activeDepartment=isCleanerRosterManager?'Cleaners':'Reception', staff=[], rows=[], allRows=[], assignments=[], allAssignments=[], editingRowId='', selectedStaffId='';

  content.innerHTML=`
    <div class="roster-subtabs department-roster-tabs">${availableDepartments.map((item,index)=>`<button class="btn ${index===0?'btn-primary':''}" data-roster-tab="${item.key}">${item.label}</button>`).join('')}</div>
    <div class="panel-head roster-actions" style="padding:0 0 14px;border:0">
      <div><button class="btn" id="prev">← Previous</button> <button class="btn" id="today">Current Week</button> <button class="btn" id="next">Next →</button></div>
      <div><button class="btn" id="importExcel">Import Excel</button> <button class="btn" id="manageRows">Manage Roles & Shifts</button> <button class="btn" id="copy">${isCleanerRosterManager?'Copy Cleaner Roster to Next Week':'Copy All to Next Week'}</button> <button class="btn btn-primary" id="publish">${isCleanerRosterManager?'Publish Cleaner Roster':'Publish All Rosters'}</button></div>
    </div>
    <h2 id="rosterTitle" style="margin:0 0 12px"></h2>
    <div class="mobile-roster-hint">On phone: tap an employee, then tap a roster cell to assign them. Swipe the roster left or right to see all days.</div>
    <div class="roster-wrap"><aside class="panel staff-panel"><h3 id="staffHeading"></h3><div id="staffList"></div></aside><div class="table-wrap roster-scroll"><table class="roster-table"><thead id="rh"></thead><tbody id="rb"></tbody></table></div></div>
    <h3 id="summaryHeading"></h3><div class="table-wrap"><table><thead><tr><th>Name</th><th>Total Shifts</th><th>Total Hours</th></tr></thead><tbody id="summary"></tbody></table></div>
    <div id="rowModal" class="modal hidden"><div class="modal-card wide"><div class="modal-head"><h3>Manage Roles & Shifts</h3><button class="btn" id="closeRows">×</button></div><div class="modal-body">
      <div class="row-manager-grid"><form id="rowForm" class="panel row-editor"><div class="panel-body"><input type="hidden" id="rowId"><div class="field"><label>Property / Location / Role</label><input id="propertyName" required placeholder="e.g. Olympic Hotel, Head Office, Developer Team"></div><div class="field"><label>Shift Label</label><input id="shiftLabel" required placeholder="e.g. AM, PM, Office, Remote, On Call"></div><div class="grid2"><div class="field"><label>Start Time</label><input id="startTime" type="time" required></div><div class="field"><label>End Time</label><input id="endTime" type="time" required></div></div><div class="field"><label>Break (minutes)</label><input id="breakMinutes" type="number" min="0" step="5" value="0"></div><div class="field"><label>Days Active</label><div id="dayChecks" class="day-checks"></div></div><div class="field"><label><input id="rowActive" type="checkbox" checked style="width:auto"> Active</label></div><div class="row-actions"><button class="btn btn-primary" type="submit">Save Shift</button><button class="btn" id="clearRow" type="button">Clear</button></div></div></form>
      <div><div class="section-head"><h3 id="manageHeading"></h3><button class="btn btn-primary" id="addProperty" type="button">+ Add Role / Shift</button></div><div class="table-wrap"><table><thead><tr><th>Property / Role</th><th>Shift</th><th>Time</th><th>Days</th><th>Status</th><th>Actions</th></tr></thead><tbody id="rowList"></tbody></table></div></div></div>
    </div></div>
    <div id="excelImportModal" class="modal hidden"><div class="modal-card"><div class="modal-head"><h3>Import Roster from Excel</h3><button class="btn" id="closeExcelImport">×</button></div><div class="modal-body">
      <div class="grid2"><div class="field"><label>Target Department</label><select id="excelDepartment">${availableDepartments.map(item=>`<option value="${item.key}">${item.label}</option>`).join('')}</select></div><div class="field"><label>Target Week</label><input id="excelWeek" type="date"></div></div>
      <div class="field"><label>Excel File</label><input id="excelFile" type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"></div>
      <div class="field"><label>Worksheet</label><select id="excelSheet"><option value="">Choose an Excel file first</option></select></div>
      <div class="field"><label>Import Mode</label><select id="excelMode"><option value="merge">Merge with existing roster</option><option value="replace">Replace assignments for this department and week</option></select></div>
      <label class="excel-check"><input id="excelCreateStaff" type="checkbox" checked> Create missing employees in the target department</label>
      <div class="excel-help"><strong>Supported formats:</strong> the CBIT template or an existing weekly roster where Column A is Property / Role, Column B is Shift, and the next seven columns are Monday to Sunday.<br>Start and end times may be separate columns or written inside the Shift cell, such as <em>AM | 7 AM - 3 PM</em>. Multiple employees may be entered using new lines, commas, or semicolons. Files supported: .xlsx and .csv.</div>
      <div class="row-actions"><a class="btn" href="CBIT_Roster_Import_Template.xlsx" download>Download Excel Template</a><button class="btn btn-primary" id="runExcelImport" type="button">Import Roster</button></div>
      <div id="excelImportResult" class="excel-import-result hidden"></div>
    </div></div>`;

  if (isCleanerRosterManager) {
    $('importExcel').classList.add('hidden');
    $('manageRows').classList.add('hidden');
  }

  const dayNames=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  $('dayChecks').innerHTML=dayNames.map((d,i)=>`<label><input type="checkbox" value="${i}" checked> ${d}</label>`).join('');
  function dates(){return Array.from({length:7},(_,i)=>{const d=new Date(week+'T00:00:00');d.setDate(d.getDate()+i);return d})}
  function calcHours(start,end,breakMin=0){if(!start||!end)return 0;const [sh,sm]=start.split(':').map(Number),[eh,em]=end.split(':').map(Number);let mins=(eh*60+em)-(sh*60+sm);if(mins<=0)mins+=1440;return Math.max(0,(mins-Number(breakMin||0))/60)}
  async function load(){const loaded=await Promise.all([DB.list('staff_members'),DB.list('roster_rows'),DB.list('roster_assignments',`week_start_date=${week}`),DB.list('roster_assignments')]);staff=loaded[0].filter(person=>isActiveStaff(person)&&(!isCleanerRosterManager||normalizeDepartment(person.primary_department||person.department)==='cleaners'));allRows=loaded[1].filter(row=>!isCleanerRosterManager||(row.department||row.staff_type)==='Cleaners');assignments=loaded[2].filter(item=>(item.staff_status||'Active')==='Active'&&(!item.staff_department||(item.department||item.staff_type)===item.staff_department));allAssignments=loaded[3].filter(item=>!isCleanerRosterManager||(item.department||item.staff_type)==='Cleaners');rows=allRows.filter(row=>row.is_active!==false);render()}
  function activeRows(){return rows.filter(r=>(r.department||r.staff_type)===activeDepartment).sort((a,b)=>(a.display_order||0)-(b.display_order||0))}
  function assignmentInterval(assignment){
    const row=allRows.find(item=>String(item.id)===String(assignment.roster_row_id));
    const start=assignment.start_time||row?.start_time;
    const end=assignment.end_time||row?.end_time;
    if(!assignment.assignment_date||!start||!end)return null;
    const startAt=new Date(`${assignment.assignment_date}T${start}:00`);
    const endAt=new Date(`${assignment.assignment_date}T${end}:00`);
    if(Number.isNaN(startAt.getTime())||Number.isNaN(endAt.getTime()))return null;
    if(endAt<=startAt)endAt.setDate(endAt.getDate()+1);
    return {start:startAt.getTime(),end:endAt.getTime()};
  }
  function overlappingAssignmentIds(){
    const conflicts=new Set();
    const byStaff=new Map();
    assignments.forEach(assignment=>{
      const interval=assignmentInterval(assignment);
      if(!interval||!assignment.staff_member_id)return;
      const key=String(assignment.staff_member_id);
      if(!byStaff.has(key))byStaff.set(key,[]);
      byStaff.get(key).push({assignment,interval});
    });
    byStaff.forEach(items=>{
      items.sort((a,b)=>a.interval.start-b.interval.start);
      for(let i=0;i<items.length;i++){
        for(let j=i+1;j<items.length&&items[j].interval.start<items[i].interval.end;j++){
          if(items[i].interval.start<items[j].interval.end&&items[j].interval.start<items[i].interval.end){
            conflicts.add(String(items[i].assignment.id));
            conflicts.add(String(items[j].assignment.id));
          }
        }
      }
    });
    return conflicts;
  }

  function render(){
    const current=cfg(),ds=dates(),visibleRows=activeRows();
    $('rosterTitle').textContent=current.label;
    $('staffHeading').textContent=current.staffLabel;
    $('summaryHeading').textContent=current.summaryLabel;
    $('rh').innerHTML=`<tr><th>Property / Role</th><th>Shift</th>${ds.map(d=>`<th>${d.toLocaleDateString('en-AU',{weekday:'short'})}<br>${d.toLocaleDateString('en-AU',{day:'2-digit',month:'short'})}</th>`).join('')}</tr>`;
    const conflictIds=overlappingAssignmentIds();
    $('rb').innerHTML=visibleRows.map(r=>`<tr><td><strong>${Shared.esc(r.property_name||r.row_name)}</strong></td><td>${Shared.esc(r.shift_label||'')}<div class="muted">${Shared.esc(r.start_time||'')}–${Shared.esc(r.end_time||'')}</div></td>${ds.map((d,dayIndex)=>{const date=iso(d),days=Array.isArray(r.active_days)?r.active_days:[0,1,2,3,4,5,6];if(!days.includes(dayIndex))return '<td class="roster-cell inactive-cell">—</td>';const a=assignments.filter(x=>String(x.roster_row_id)===String(r.id)&&x.assignment_date===date);return `<td class="roster-cell" data-row="${r.id}" data-date="${date}" data-department="${activeDepartment}">${a.map(x=>{const conflict=conflictIds.has(String(x.id));return `<span class="assignment draggable-assignment${conflict?' assignment-conflict':''}" draggable="true" data-assignment="${x.id}" title="${conflict?'Schedule conflict: this employee has another overlapping shift':'Drag to move this employee to another shift'}">${Shared.esc(x.staff_name)} <button data-remove="${x.id}" aria-label="Remove">×</button></span>`}).join('')}</td>`}).join('')}</tr>`).join('')||'<tr><td colspan="9">No active shifts. Use Manage Roles & Shifts to add one.</td></tr>';

    const people=staff
      .filter(s=>isActiveStaff(s) && normalizeDepartment(s.primary_department||s.department)===normalizeDepartment(activeDepartment))
      .sort((a,b)=>String(a.full_name||'').localeCompare(String(b.full_name||'')));
    $('staffHeading').textContent=`${current.staffLabel} (${people.length})`;
    const counts={};assignments.filter(a=>normalizeDepartment(a.department||a.staff_type)===normalizeDepartment(activeDepartment)).forEach(a=>{const k=String(a.staff_member_id);counts[k]=(counts[k]||0)+1});
    $('staffList').innerHTML=people.map(s=>`<div class="staff-chip" draggable="true" data-id="${s.id}" data-department="${activeDepartment}"><span>${Shared.esc(s.full_name)}</span><span class="shift-count">${counts[String(s.id)]||0}</span></div>`).join('')||'<p class="muted">No active staff in this department.</p>';

    const assignStaff=async(cell,id,department)=>{if(!id)return;if(department!==cell.dataset.department)return alert('This staff member belongs to a different department.');const duplicate=assignments.some(a=>String(a.roster_row_id)===String(cell.dataset.row)&&a.assignment_date===cell.dataset.date&&String(a.staff_member_id)===String(id));if(duplicate)return alert('This employee is already assigned to this shift.');await DB.create('roster_assignments',{week_start_date:week,roster_row_id:cell.dataset.row,assignment_date:cell.dataset.date,staff_member_id:id});selectedStaffId='';await load()};
    const moveAssignment=async(cell,assignmentId)=>{const assignment=assignments.find(a=>String(a.id)===String(assignmentId));if(!assignment)return;if((assignment.department||assignment.staff_type)!==cell.dataset.department)return alert('This assignment belongs to a different department.');if(String(assignment.roster_row_id)===String(cell.dataset.row)&&assignment.assignment_date===cell.dataset.date)return;const duplicate=assignments.some(a=>String(a.id)!==String(assignment.id)&&String(a.roster_row_id)===String(cell.dataset.row)&&a.assignment_date===cell.dataset.date&&String(a.staff_member_id)===String(assignment.staff_member_id));if(duplicate)return alert('This employee is already assigned to the destination shift.');await DB.update('roster_assignments',assignment.id,{roster_row_id:cell.dataset.row,assignment_date:cell.dataset.date,week_start_date:week});Shared.toast(`${assignment.staff_name||'Employee'} moved to the new shift.`);await load()};
    qsa('.staff-chip').forEach(x=>{x.classList.toggle('selected',String(x.dataset.id)===String(selectedStaffId));x.addEventListener('dragstart',e=>{e.dataTransfer.setData('drag-kind','staff');e.dataTransfer.setData('staff',x.dataset.id);e.dataTransfer.setData('department',x.dataset.department)});x.addEventListener('click',()=>{selectedStaffId=String(selectedStaffId)===String(x.dataset.id)?'':x.dataset.id;qsa('.staff-chip').forEach(y=>y.classList.toggle('selected',String(y.dataset.id)===String(selectedStaffId)));if(selectedStaffId)Shared.toast('Employee selected. Tap a roster cell to assign.')})});
    qsa('[data-assignment]').forEach(item=>item.addEventListener('dragstart',e=>{e.stopPropagation();e.dataTransfer.setData('drag-kind','assignment');e.dataTransfer.setData('assignment',item.dataset.assignment);e.dataTransfer.effectAllowed='move';item.classList.add('is-dragging')}));
    qsa('[data-assignment]').forEach(item=>item.addEventListener('dragend',()=>item.classList.remove('is-dragging')));
    qsa('.roster-cell[data-row]').forEach(cell=>{cell.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';cell.classList.add('drag-over')});cell.addEventListener('dragleave',()=>cell.classList.remove('drag-over'));cell.addEventListener('drop',async e=>{e.preventDefault();cell.classList.remove('drag-over');const kind=e.dataTransfer.getData('drag-kind');if(kind==='assignment'||e.dataTransfer.getData('assignment'))await moveAssignment(cell,e.dataTransfer.getData('assignment'));else await assignStaff(cell,e.dataTransfer.getData('staff'),e.dataTransfer.getData('department'))});cell.addEventListener('click',async e=>{if(e.target.closest('[data-remove]')||e.target.closest('[data-assignment]')||!selectedStaffId)return;await assignStaff(cell,selectedStaffId,activeDepartment)})});
    qsa('[data-remove]').forEach(b=>b.addEventListener('click',async e=>{e.stopPropagation();await DB.remove('roster_assignments',b.dataset.remove);await load()}));

    const sums={};assignments.filter(a=>(a.department||a.staff_type)===activeDepartment).forEach(a=>{const k=a.staff_name;sums[k]??={count:0,hours:0};sums[k].count++;sums[k].hours+=Number(a.paid_hours||a.shift_hours||0)});$('summary').innerHTML=Object.entries(sums).map(([n,v])=>`<tr><td>${Shared.esc(n)}</td><td>${v.count}</td><td>${v.hours.toFixed(1)}</td></tr>`).join('')||'<tr><td colspan="3">No assignments this week.</td></tr>';
  }

  async function renderManager(){
    $('manageHeading').textContent=`${cfg().label.replace(' Roster','')} Roles & Shifts`;
    const all=allRows.filter(r=>(r.department||r.staff_type)===activeDepartment).sort((a,b)=>(a.display_order||0)-(b.display_order||0));
    $('rowList').innerHTML=all.map(r=>`<tr><td>${Shared.esc(r.property_name||r.row_name||'')}</td><td>${Shared.esc(r.shift_label||'')}</td><td>${Shared.esc(r.start_time)}–${Shared.esc(r.end_time)}</td><td>${(r.active_days||[0,1,2,3,4,5,6]).map(i=>dayNames[i]).join(', ')}</td><td>${r.is_active?'Active':'Inactive'}</td><td class="row-actions"><button class="btn" data-edit-row="${r.id}">Edit</button><button class="btn btn-danger" data-delete-row="${r.id}">Delete</button></td></tr>`).join('')||'<tr><td colspan="6">No roles or shifts configured for this department.</td></tr>';
    qsa('[data-edit-row]').forEach(b=>b.onclick=()=>editRow(b.dataset.editRow));
    qsa('[data-delete-row]').forEach(b=>b.onclick=()=>deleteRow(b.dataset.deleteRow));
  }
  function clearRow(){editingRowId='';$('rowForm').reset();$('rowActive').checked=true;qsa('#dayChecks input').forEach(x=>x.checked=true);$('breakMinutes').value='0'}
  function editRow(id){const r=allRows.find(x=>String(x.id)===String(id));if(!r)return;editingRowId=id;$('propertyName').value=r.property_name||r.row_name||'';$('shiftLabel').value=r.shift_label||'';$('startTime').value=r.start_time||'';$('endTime').value=r.end_time||'';$('breakMinutes').value=r.break_minutes||0;$('rowActive').checked=r.is_active!==false;const days=Array.isArray(r.active_days)?r.active_days:[0,1,2,3,4,5,6];qsa('#dayChecks input').forEach(x=>x.checked=days.includes(Number(x.value)))}
  async function deleteRow(id){const linked=allAssignments.some(a=>String(a.roster_row_id)===String(id));if(linked){if(confirm('This shift has roster history. Deactivate it instead?'))await DB.update('roster_rows',id,{is_active:false});else return}else if(confirm('Permanently delete this role/shift?'))await DB.remove('roster_rows',id);else return;await load();await renderManager()}
  $('rowForm').onsubmit=async e=>{e.preventDefault();const days=qsa('#dayChecks input:checked').map(x=>Number(x.value));if(!days.length)return alert('Select at least one active day.');const breakMinutes=Number($('breakMinutes').value||0),start=$('startTime').value,end=$('endTime').value;const payload={department:activeDepartment,row_name:$('propertyName').value.trim(),property_name:$('propertyName').value.trim(),shift_label:$('shiftLabel').value.trim(),start_time:start,end_time:end,break_minutes:breakMinutes,staff_type:activeDepartment,is_active:$('rowActive').checked,active_days:days,shift_hours:calcHours(start,end,0),paid_hours:calcHours(start,end,breakMinutes)};if(editingRowId)await DB.update('roster_rows',editingRowId,payload);else{const existing=allRows.filter(r=>(r.department||r.staff_type)===activeDepartment);payload.display_order=existing.reduce((m,r)=>Math.max(m,Number(r.display_order)||0),0)+1;await DB.create('roster_rows',payload)}clearRow();await load();await renderManager();Shared.toast('Roster shift saved')};


  const normalizeHeader=value=>String(value??'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const headerAliases={
    property:['property role','property','role','location','property location role','property location','site','department role'],
    shift:['shift','shift label','schedule','hours','time','shift time'],
    start:['start time','start','time in'],end:['end time','end','time out'],breakMinutes:['break minutes','break','break mins','break min'],
    mon:['mon','monday'],tue:['tue','tuesday'],wed:['wed','wednesday'],thu:['thu','thursday'],fri:['fri','friday'],sat:['sat','saturday'],sun:['sun','sunday']
  };
  const dayKeys=['mon','tue','wed','thu','fri','sat','sun'];
  let excelWorkbook=null;
  function findHeaderIndex(headers,aliases){return headers.findIndex(header=>aliases.includes(normalizeHeader(header)))}
  function excelTime(value,fallback){
    if(value===null||value===undefined||value==='')return fallback;
    if(typeof value==='number'){
      const fraction=((value%1)+1)%1,total=Math.round(fraction*1440)%1440;
      return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
    }
    const text=String(value).trim().replace(/\./g,':');
    const match=text.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)?$/i);
    if(!match)return fallback;
    let h=Number(match[1]),m=Number(match[2]||0);const ap=(match[3]||'').toUpperCase();
    if(ap==='PM'&&h<12)h+=12;if(ap==='AM'&&h===12)h=0;
    if(h>23||m>59)return fallback;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }
  function parseShiftTimes(shiftValue,startValue,endValue){
    let start=excelTime(startValue,''),end=excelTime(endValue,'');
    const shift=String(shiftValue??'').trim();
    if(!start||!end){
      const matches=[...shift.matchAll(/(\d{1,2}(?::\d{1,2})?\s*(?:AM|PM)?)/gi)].map(m=>m[1].trim());
      if(matches.length>=2){start=start||excelTime(matches[matches.length-2],'');end=end||excelTime(matches[matches.length-1],'');}
    }
    return {start:start||'09:00',end:end||'17:00'};
  }
  function splitNames(value){return [...new Set(String(value??'').split(/[\n,;]+/).map(x=>x.trim()).filter(x=>x&&!/^(-|closed|off|day off|n\/a)$/i.test(x)))]}
  function rowSignature(row,department){return [department,String(row.property_name||row.row_name||'').trim().toLowerCase(),String(row.shift_label||'').trim().toLowerCase(),String(row.start_time||''),String(row.end_time||'')].join('|')}
  function dayIndexFromHeader(value){
    const text=normalizeHeader(value);
    const direct=dayKeys.findIndex(key=>headerAliases[key].some(alias=>text===alias||text.startsWith(alias+' ')));
    if(direct>=0)return direct;
    const raw=String(value??'').trim();
    const parsed=new Date(raw);
    if(!Number.isNaN(parsed.getTime()))return (parsed.getDay()+6)%7;
    return -1;
  }
  function detectLayout(rawRows){
    const scan=rawRows.slice(0,12);
    let best=null;
    scan.forEach((row,rowIndex)=>{
      const dayColumns={};row.forEach((value,col)=>{const day=dayIndexFromHeader(value);if(day>=0&&dayColumns[day]===undefined)dayColumns[day]=col});
      const property=findHeaderIndex(row,headerAliases.property),shift=findHeaderIndex(row,headerAliases.shift);
      const score=Object.keys(dayColumns).length+(property>=0?2:0)+(shift>=0?2:0);
      if(!best||score>best.score)best={rowIndex,property,shift,dayColumns,score,row};
    });
    if(best&&Object.keys(best.dayColumns).length>=3){
      return {headerRowIndex:best.rowIndex,property:best.property>=0?best.property:0,shift:best.shift>=0?best.shift:1,start:findHeaderIndex(best.row,headerAliases.start),end:findHeaderIndex(best.row,headerAliases.end),breakMinutes:findHeaderIndex(best.row,headerAliases.breakMinutes),dayColumns:best.dayColumns};
    }
    const firstLikelyData=rawRows.findIndex(row=>String(row[0]??'').trim()&&String(row[1]??'').trim()&&row.slice(2,9).some(v=>String(v??'').trim()));
    if(firstLikelyData<0)throw new Error('Could not recognise the roster layout. Use the included CBIT template, or keep Property / Role in Column A, Shift in Column B, and Monday to Sunday in the next seven columns.');
    return {headerRowIndex:firstLikelyData-1,property:0,shift:1,start:-1,end:-1,breakMinutes:-1,dayColumns:{0:2,1:3,2:4,3:5,4:6,5:7,6:8}};
  }
  async function prepareExcelFile(file){
    if(!file)throw new Error('Choose an Excel or CSV file first.');
    excelWorkbook=await CBITXLSX.readWorkbook(file);
    $('excelSheet').innerHTML=excelWorkbook.sheets.map((sheet,index)=>`<option value="${index}">${Shared.esc(sheet.name)} (${sheet.rows.length} rows)</option>`).join('');
    $('excelImportResult').classList.remove('hidden');
    $('excelImportResult').innerHTML=`<strong>File ready.</strong> ${excelWorkbook.sheets.length} worksheet${excelWorkbook.sheets.length===1?'':'s'} detected. Select the correct worksheet, department, and week, then click Import Roster.`;
  }
  async function importExcelRoster(){
    if(!excelWorkbook)throw new Error('Choose an Excel or CSV file first.');
    const department=$('excelDepartment').value;
    const weekValue=$('excelWeek').value||week;
    const targetDate=new Date(`${weekValue}T00:00:00`);
    if(Number.isNaN(targetDate.getTime()))throw new Error('Choose a valid target week.');
    const targetWeek=iso(monday(targetDate));
    const sheet=excelWorkbook.sheets[Number($('excelSheet').value||0)];
    const rawRows=(sheet?.rows||[]).map(row=>Array.isArray(row)?row:[]).filter(row=>row.some(value=>String(value??'').trim()!==''));
    if(rawRows.length<1)throw new Error('The selected worksheet is empty.');
    const layout=detectLayout(rawRows);
    const firstData=Math.max(0,layout.headerRowIndex+1);
    let lastProperty='';
    const dataRows=[];
    for(let i=firstData;i<rawRows.length;i++){
      const source=rawRows[i];
      let property=String(source[layout.property]??'').trim();
      const shift=String(source[layout.shift]??'').trim();
      if(property)lastProperty=property;else property=lastProperty;
      if(!property||!shift)continue;
      if(headerAliases.property.includes(normalizeHeader(property))||headerAliases.shift.includes(normalizeHeader(shift)))continue;
      dataRows.push({source,property,shift,rowNumber:i+1});
    }
    if(!dataRows.length)throw new Error('No roster shifts were found. Check that Property / Role and Shift are in the first two columns, or use the included template.');

    let currentStaff=await DB.list('staff_members','status=Active');
    let currentRows=await DB.list('roster_rows');
    let currentAssignments=await DB.list('roster_assignments',`week_start_date=${targetWeek}`);
    if($('excelMode').value==='replace'){
      const deptRowIds=new Set(currentRows.filter(row=>(row.department||row.staff_type)===department).map(row=>String(row.id)));
      const remove=currentAssignments.filter(item=>deptRowIds.has(String(item.roster_row_id)));
      for(const item of remove)await DB.remove('roster_assignments',item.id);
      currentAssignments=currentAssignments.filter(item=>!deptRowIds.has(String(item.roster_row_id)));
    }

    const staffMap=new Map(currentStaff.filter(item=>normalizeDepartment(item.primary_department||item.department)===normalizeDepartment(department)).map(item=>[String(item.full_name||'').trim().toLowerCase(),item]));
    const rowMap=new Map(currentRows.filter(item=>(item.department||item.staff_type)===department).map(item=>[rowSignature(item,department),item]));
    let staffCreated=0,shiftsCreated=0,shiftsUpdated=0,assignmentsCreated=0,duplicatesSkipped=0,unknownSkipped=[];
    let displayOrder=currentRows.filter(item=>(item.department||item.staff_type)===department).reduce((m,item)=>Math.max(m,Number(item.display_order)||0),0);

    for(const item of dataRows){
      const source=item.source,property=item.property,shift=item.shift;
      const times=parseShiftTimes(shift,layout.start>=0?source[layout.start]:'',layout.end>=0?source[layout.end]:'');
      const breakMinutes=Math.max(0,Number(layout.breakMinutes>=0?source[layout.breakMinutes]:0)||0);
      const activeDays=Object.entries(layout.dayColumns).filter(([,column])=>column>=0&&String(source[column]??'').trim()!=='').map(([day])=>Number(day));
      const payload={department,row_name:property,property_name:property,shift_label:shift,start_time:times.start,end_time:times.end,break_minutes:breakMinutes,staff_type:department,is_active:true,active_days:activeDays.length?activeDays:[0,1,2,3,4,5,6],shift_hours:calcHours(times.start,times.end,0),paid_hours:calcHours(times.start,times.end,breakMinutes)};
      const signature=rowSignature(payload,department);let rosterRow=rowMap.get(signature);
      if(!rosterRow){payload.display_order=++displayOrder;rosterRow=await DB.create('roster_rows',payload);rowMap.set(signature,rosterRow);currentRows.push(rosterRow);shiftsCreated++;}
      else{await DB.update('roster_rows',rosterRow.id,{...payload,display_order:rosterRow.display_order||++displayOrder});shiftsUpdated++;}

      for(let dayIndex=0;dayIndex<7;dayIndex++){
        const column=layout.dayColumns[dayIndex];if(column===undefined||column<0)continue;
        const names=splitNames(source[column]);if(!names.length)continue;
        const date=new Date(`${targetWeek}T00:00:00`);date.setDate(date.getDate()+dayIndex);const assignmentDate=iso(date);
        for(const name of names){
          const key=name.toLowerCase();let person=staffMap.get(key);
          if(!person&&$('excelCreateStaff').checked){person=await DB.create('staff_members',{full_name:name,primary_department:department,department,account_status:'Active',status:'Active',employment_type:'Other'});staffMap.set(key,person);currentStaff.push(person);staffCreated++;}
          if(!person){unknownSkipped.push(name);continue;}
          const duplicate=currentAssignments.some(existing=>String(existing.roster_row_id)===String(rosterRow.id)&&existing.assignment_date===assignmentDate&&String(existing.staff_member_id)===String(person.id));
          if(duplicate){duplicatesSkipped++;continue;}
          const created=await DB.create('roster_assignments',{week_start_date:targetWeek,roster_row_id:rosterRow.id,assignment_date:assignmentDate,staff_member_id:person.id});currentAssignments.push(created);assignmentsCreated++;
        }
      }
    }
    week=targetWeek;activeDepartment=department;
    qsa('[data-roster-tab]').forEach(button=>button.classList.toggle('btn-primary',button.dataset.rosterTab===department));
    await load();
    return {staffCreated,shiftsCreated,shiftsUpdated,assignmentsCreated,duplicatesSkipped,unknown:[...new Set(unknownSkipped)],rowsRead:dataRows.length,sheetName:sheet?.name||'Worksheet'};
  }
  $('importExcel').onclick=()=>{if(isCleanerRosterManager)return; $('excelDepartment').value=activeDepartment;$('excelWeek').value=week;$('excelFile').value='';$('excelSheet').innerHTML='<option value="">Choose an Excel file first</option>';excelWorkbook=null;$('excelImportResult').classList.add('hidden');Shared.openModal('excelImportModal')};
  $('closeExcelImport').onclick=()=>Shared.closeModal('excelImportModal');
  $('excelFile').onchange=async event=>{try{if(event.target.files[0])await prepareExcelFile(event.target.files[0]);}catch(error){console.error(error);$('excelImportResult').classList.remove('hidden');$('excelImportResult').innerHTML=`<strong>Could not read this file.</strong><br>${Shared.esc(error.message||String(error))}`;}};
  $('runExcelImport').onclick=async()=>{const button=$('runExcelImport');const original=button.textContent;button.disabled=true;button.textContent='Importing…';try{const result=await importExcelRoster();$('excelImportResult').classList.remove('hidden');$('excelImportResult').innerHTML=`<strong>Import complete.</strong><br>Worksheet: ${Shared.esc(result.sheetName)} · ${result.rowsRead} roster rows read.<br>${result.assignmentsCreated} assignments added, ${result.shiftsCreated} shifts created, ${result.shiftsUpdated} shifts matched/updated, ${result.staffCreated} employees created, ${result.duplicatesSkipped} duplicates skipped.${result.unknown.length?`<br><strong>Unmatched names:</strong> ${Shared.esc(result.unknown.join(', '))}`:''}`;Shared.toast('Excel roster imported successfully.');}catch(error){console.error(error);$('excelImportResult').classList.remove('hidden');$('excelImportResult').innerHTML=`<strong>Import failed.</strong><br>${Shared.esc(error.message||String(error))}`;}finally{button.disabled=false;button.textContent=original;}};

  qsa('[data-roster-tab]').forEach(b=>b.onclick=()=>{activeDepartment=b.dataset.rosterTab;selectedStaffId='';qsa('[data-roster-tab]').forEach(x=>x.classList.toggle('btn-primary',x===b));render()});
  $('manageRows').onclick=async()=>{if(isCleanerRosterManager)return; clearRow();await renderManager();$('rowModal').classList.remove('hidden')};$('closeRows').onclick=()=>$('rowModal').classList.add('hidden');$('clearRow').onclick=clearRow;$('addProperty').onclick=clearRow;
  function shiftWeek(n){const d=new Date(week+'T00:00:00');d.setDate(d.getDate()+n*7);week=iso(d);load()}
  $('prev').onclick=()=>shiftWeek(-1);$('next').onclick=()=>shiftWeek(1);$('today').onclick=()=>{week=iso(monday(new Date()));load()};
  $('publish').onclick=async()=>{
    const publishedAt=new Date().toISOString();
    const currentAssignments=await DB.list('roster_assignments',`week_start_date=${week}`);
    const snapshots=availableDepartments.map(dept=>{
      const typeRows=allRows.filter(row=>(row.department||row.staff_type)===dept.key&&row.is_active!==false).sort((a,b)=>(a.display_order||0)-(b.display_order||0));
      const rowIds=new Set(typeRows.map(row=>String(row.id)));
      return {week_start_date:week,roster_type:dept.key,status:'Published',published_at:publishedAt,published_by:Auth.user?.email||Auth.user?.full_name||null,rows:typeRows,assignments:currentAssignments.filter(item=>(item.department||item.staff_type)===dept.key&&rowIds.has(String(item.roster_row_id)))};
    });
    await DB.create('published_rosters',{week_start_date:week,published_at:publishedAt,rosters:snapshots});
    Shared.toast(isCleanerRosterManager?'Cleaner roster published':'All department rosters published');
  };
  $('copy').onclick=async()=>{const d=new Date(week+'T00:00:00');d.setDate(d.getDate()+7);const result=await DB.create('roster_copy',{source_week_start_date:week,destination_week_start_date:iso(d)});Shared.toast(`${result?.copied||0} assignment${result?.copied===1?'':'s'} copied to next week`)};

  let lastStaffRevision=localStorage.getItem('cbit_staff_revision')||'';
  async function refreshForStaffChanges(){
    const revision=localStorage.getItem('cbit_staff_revision')||'';
    if(revision!==lastStaffRevision){lastStaffRevision=revision;await load();}
  }
  window.addEventListener('storage',event=>{if(event.key==='cbit_staff_revision')refreshForStaffChanges()});
  window.addEventListener('focus',refreshForStaffChanges);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshForStaffChanges()});

  await load();
})();
