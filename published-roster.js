(async () => {
  const DEPARTMENTS = [
    {key:'Reception', label:'Reception Roster'},
    {key:'Cleaners', label:'Cleaner & Housekeeping Roster'},
    {key:'Accounting', label:'Accounting Roster'},
    {key:'Developers', label:'Developers Roster'},
    {key:'Sales', label:'Sales Roster'},
    {key:'Admin', label:'Admin Roster'}
  ];
  const esc = Shared.esc;
  const iso = date => { const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 10); };
  const formatDate = value => new Date(`${value}T00:00:00`).toLocaleDateString('en-AU', {day:'numeric',month:'long',year:'numeric'});
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const rowSearchText = row => `${row?.property_name||row?.row_name||''} ${row?.shift_label||''}`.trim().toLowerCase();
  const isDayOffRow = row => /(?:day(?:s)?\s*off)/.test(rowSearchText(row));
  const isLeaveRow = row => /(?:on[\s-]*leave|requested\s*leave|annual\s*leave|sick\s*leave)/.test(rowSearchText(row));
  const isDayOnlyRow = row => isDayOffRow(row) || isLeaveRow(row);
  let activeType = 'Reception';
  let selectedWeek = '';
  let publishedRosters = [];

  document.body.innerHTML = `<div class="app public-app">
    <header class="topbar"><div class="brand"><div class="logo"><img src="cbit-logo.png" alt="CBIT logo"></div><div><strong>CBIT</strong><span>Published roster access</span></div></div><div class="top-actions"><a class="btn" href="index.html">Staff Sign In</a></div></header>
    <nav class="nav top-nav public-nav" aria-label="Public navigation"><a class="active" href="published-roster.html">Published Roster</a><a href="index.html">Staff Sign In</a></nav>
    <main id="page"><section class="panel"><div class="panel-head"><div><h1>Published Department Rosters</h1><p class="muted">View the latest published roster for any department.</p></div></div><div class="panel-body">
      <div class="published-controls"><div class="roster-subtabs department-roster-tabs">${DEPARTMENTS.map((item,index)=>`<button class="btn ${index===0?'btn-primary':''}" data-type="${item.key}">${item.label}</button>`).join('')}</div><div class="field published-week-field"><label for="weekSelect">Published Week</label><select id="weekSelect"></select></div></div>
      <div id="publicationMeta" class="publication-meta"></div><div class="table-wrap published-table-wrap"><table class="roster-table public-roster-table"><thead id="publicHead"></thead><tbody id="publicBody"></tbody></table></div><div id="publicEmpty" class="public-empty hidden"></div>
    </div></section></main></div>`;

  const $ = id => document.getElementById(id);
  const labelFor = key => DEPARTMENTS.find(item=>item.key===key)?.label || `${key} Roster`;
  const availableWeeks = () => [...new Set(publishedRosters.map(item => item.week_start_date))].sort().reverse();
  const datesForWeek = week => Array.from({length:7},(_,index)=>{const date=new Date(`${week}T00:00:00`);date.setDate(date.getDate()+index);return date;});
  const staffSnapshot = (publication, rows) => {
    const raw = Array.isArray(publication?.staff_snapshot) ? publication.staff_snapshot : (rows.find(row=>Array.isArray(row.staff_snapshot))?.staff_snapshot || []);
    const seen = new Set();
    return raw.filter(person=>{const id=String(person?.id||'');if(!id||seen.has(id))return false;seen.add(id);return true;});
  };
  const assignmentName = item => item.staff_name || '';
  const staffId = item => String(item.staff_member_id || item.id || '');

  function populateWeeks(){
    const weeks=availableWeeks();
    if(!selectedWeek||!weeks.includes(selectedWeek))selectedWeek=weeks[0]||'';
    $('weekSelect').innerHTML=weeks.length?weeks.map(week=>{const end=new Date(`${week}T00:00:00`);end.setDate(end.getDate()+6);return `<option value="${week}" ${week===selectedWeek?'selected':''}>${formatDate(week)} – ${formatDate(iso(end))}</option>`}).join(''):'<option value="">No published weeks</option>';
    $('weekSelect').disabled=!weeks.length;
  }

  function render(){
    populateWeeks();
    const publication=publishedRosters.find(item=>item.week_start_date===selectedWeek&&item.roster_type===activeType);
    if(!publication){
      $('publicationMeta').innerHTML='';$('publicHead').innerHTML='';$('publicBody').innerHTML='';$('publicEmpty').classList.remove('hidden');
      $('publicEmpty').innerHTML=`<h3>No ${esc(labelFor(activeType).toLowerCase())} has been published for this week.</h3>`;
      return;
    }
    $('publicEmpty').classList.add('hidden');
    const dates=datesForWeek(selectedWeek),rows=publication.rows||[],assignments=publication.assignments||[],people=staffSnapshot(publication,rows);
    $('publicationMeta').innerHTML=`<strong>${esc(labelFor(activeType))}</strong><span>${formatDate(selectedWeek)} – ${formatDate(iso(dates[6]))}</span><span>Published ${new Date(publication.published_at).toLocaleString('en-AU')}</span>`;
    $('publicHead').innerHTML=`<tr><th>Property / Role</th><th>Shift</th>${dates.map((date,index)=>`<th>${dayNames[index]}<br>${date.toLocaleDateString('en-AU',{day:'2-digit',month:'short'})}</th>`).join('')}</tr>`;
    $('publicBody').innerHTML=rows.map(row=>{
      const dayOnly=isDayOnlyRow(row);
      return `<tr class="${dayOnly?'day-only-row':''}"><td><strong>${esc(row.property_name||row.row_name||'')}</strong></td><td>${esc(row.shift_label||'')}${dayOnly?'':`<div class="muted">${esc(row.start_time||'')}–${esc(row.end_time||'')}</div>`}</td>${dates.map((date,dayIndex)=>{
        const dateValue=iso(date),activeDays=Array.isArray(row.active_days)?row.active_days:[0,1,2,3,4,5,6];
        if(!activeDays.includes(dayIndex))return '<td class="roster-cell inactive-cell">—</td>';
        let dayAssignments=assignments.filter(item=>String(item.roster_row_id)===String(row.id)&&item.assignment_date===dateValue);
        if(isDayOffRow(row)&&people.length){
          const unavailableIds=new Set(assignments.filter(item=>item.assignment_date===dateValue&&String(item.roster_row_id)!==String(row.id)).map(staffId));
          const explicitIds=new Set(dayAssignments.map(staffId));
          const automatic=people.filter(person=>!unavailableIds.has(String(person.id))&&!explicitIds.has(String(person.id))).map(person=>({staff_member_id:person.id,staff_name:person.full_name}));
          dayAssignments=[...dayAssignments,...automatic];
        }
        const pills=dayAssignments.map(item=>`<span class="assignment public-assignment">${esc(assignmentName(item))}</span>`).join('');
        return `<td class="roster-cell${dayOnly?' day-only-cell':''}"><div class="${dayOnly?'assignment-stack':''}">${pills}</div></td>`;
      }).join('')}</tr>`;
    }).join('')||'<tr><td colspan="9">No published roster rows.</td></tr>';
  }

  async function load(){
    try{publishedRosters=await DB.list('public/published-rosters');render()}
    catch(error){$('publicEmpty').classList.remove('hidden');$('publicEmpty').innerHTML=`<h3>Published roster is currently unavailable.</h3><p>${esc(error.message||'')}</p>`}
  }
  document.querySelectorAll('[data-type]').forEach(button=>button.addEventListener('click',()=>{activeType=button.dataset.type;document.querySelectorAll('[data-type]').forEach(item=>item.classList.toggle('btn-primary',item===button));render()}));
  $('weekSelect').addEventListener('change',event=>{selectedWeek=event.target.value;render()});
  await load();
})();
