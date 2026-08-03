(async () => {
  const DEPARTMENTS = [
    {key:'Reception', label:'Reception Roster'},
    {key:'Cleaners', label:'Cleaner & Housekeeping Roster'},
    {key:'CleanerTasks', label:'Cleaning Task List'},
    {key:'Accounting', label:'Accounting Roster'},
    {key:'Developers', label:'Developers Roster'},
    {key:'Sales', label:'Sales Roster'},
    {key:'Admin', label:'Admin Roster'}
  ];

  const CLEANER_TASK_LISTS = [
    {property:'Olympic', shifts:[{name:'9:00 AM–1:00 PM', sections:[
      ['9:00 AM–9:10 AM',['Log in for the shift.','Send a photo of the cleaning basket to the Housekeeping group chat.','Confirm that the vacuum is complete and working properly.']],
      ['9:10 AM–10:30 AM',['Vacuum and clean the first-floor corridors.','Vacuum and clean the second-floor corridors.','Clean the reception area.','Clean the staircase near reception.','Properly clean shared bathrooms A1, E1, A2, B2, and C2.','Refill toilet paper, soap, and other bathroom supplies.','Report any maintenance or cleaning issues immediately.']],
      ['10:30 AM–11:30 AM',['Properly clean the ensuite bathrooms in Rooms 1, 10, 11, and 29.','Check for mould, leaks, blockages, or damaged bathroom items.','Refill bathroom supplies where required.']],
      ['11:30 AM–12:30 PM',['Contact Alvin or Sobit for the assigned check-out rooms.','Make beds in the assigned check-out rooms.','Clean and prepare the assigned rooms for incoming guests.']],
      ['12:30 PM–1:00 PM',['Complete any unfinished room-cleaning tasks.','Complete additional tasks assigned by Alvin or Sobit, such as deep-cleaning bathrooms, cleaning the kitchen or laundry room, and counting stocks.','Conduct a final inspection before finishing the shift.']]
    ]}]},
    {property:'Allen / Darling Harbour', shifts:[
      {name:'Morning Shift · 8:00 AM–3:00 PM', sections:[
        ['8:00 AM–8:15 AM',['Pick up rubbish from the side entrance, corridors, and dining area.','Empty the vacuum.','Prepare the cleaning basket.','Confirm with reception that cleaning equipment is ready.','Check stickers, markers, containers, and guest supplies.','Report low-stock items immediately.']],
        ['8:15 AM–8:45 AM',['Touch up the kitchen.','Clean the kitchen bench.','Clean the kitchen sink.','Clean the kitchen floor.']],
        ['8:45 AM–9:30 AM',['Check all rooms and identify messy guest belongings or areas requiring attention.','Tidy personal items carefully without throwing anything away.','Vacuum and mop the kitchen and dining area.','Clean first-floor shared bathrooms: Toilet 3, Shower 4, Bathrooms 5 and 6, Toilet 7, Bathroom 8, and Toilet 9.','Refill toilet paper and soap.','Remove bathroom rubbish.','Report mould, leaks, blockages, or damage immediately.']],
        ['9:30 AM–10:00 AM',['Vacuum the ground floor.','Inspect the entrance, corridors, dining area, and common spaces.']],
        ['10:00 AM–11:00 AM',['Clean second-floor shared bathrooms: Toilet 11, Shower 12, Bathrooms 13 and 14, Toilet 15, Bathroom 16, and Toilet 17.','Vacuum the second floor.','Refill bathroom supplies and remove rubbish.']],
        ['11:00 AM–12:30 PM',['Properly clean the ensuite bathrooms in Rooms 1, 2, 3, 6, 15, 19, and 28.','Check for mould, damage, leaks, and missing supplies.']],
        ['12:30 PM–2:00 PM',['Make beds in assigned rooms.','Clean assigned check-out rooms.','Complete any additional room preparation tasks.']],
        ['2:00 PM–3:00 PM',['Vacuum all guest rooms.','Complete any unfinished bathroom cleaning.','Endorse unfinished tasks to reception for the afternoon cleaner.','Conduct a final inspection.']]
      ]},
      {name:'Afternoon Shift · 2:30 PM–5:30 PM', sections:[
        ['2:30 PM–3:00 PM',['Touch up the kitchen.','Clean the kitchen bench, sink, and floor.','Load linens and sheets into the washing machines.','Wash a minimum of 30 sheets.','Check the laundry every 45 minutes.']],
        ['3:00 PM–3:30 PM',['Clean the courtyard.','Clean the first-floor laundry.','Clean the second-floor laundry.','Update the laundry stock list immediately.','Check the guest laundry area.','Remove rubbish from the laundry area.','Report any machine problems immediately.']],
        ['3:30 PM–4:45 PM',['Touch up the first-floor shared bathrooms.','Vacuum the first floor.','Refill bathroom supplies and remove rubbish.']],
        ['4:45 PM–5:00 PM',['Touch up the second-floor shared bathrooms.','Vacuum the second floor.']],
        ['5:00 PM–5:30 PM',['Touch up ensuite bathrooms in Rooms 1, 2, 3, 13, 15, 19, and 28.','Check stickers, markers, containers, and guest supplies.','Report low-stock items immediately.','Assist with guest or reception requests.','Endorse unfinished tasks to reception for the night cleaner.']]
      ]}
    ]},
    {property:'Potts Point', shifts:[
      {name:'Morning Shift · 8:00 AM–1:00 PM', sections:[
        ['8:00 AM–8:20 AM',['Pick up rubbish from the entrances of 141 and 143.','Empty the vacuum.','Prepare the cleaning basket.','Confirm with reception that cleaning equipment is ready.','Check stickers, markers, containers, and guest supplies.','Report low-stock items immediately.']],
        ['8:20 AM–9:00 AM',['Clean the kitchen, dining area, reception area, courtyard, and outside refrigerator doors.','Clean benches, sinks, and floors.','Check all rooms and carefully tidy messy guest belongings.','Vacuum the entrance.']],
        ['9:00 AM–10:00 AM',['Properly clean all shared bathrooms and showers.','Refill toilet paper and soap.','Remove rubbish.','Report mould, leaks, blockages, or damage immediately.']],
        ['10:00 AM–11:00 AM',['Make beds in all assigned rooms.','Prepare check-out rooms for incoming guests.']],
        ['11:00 AM–1:00 PM',['Vacuum the entire property, including guest rooms, corridors, and common areas.','Assist with guest or reception requests.','Endorse unfinished bathroom cleaning to reception.','Conduct a final inspection.']]
      ]},
      {name:'Night Shift · 6:30 PM–9:30 PM', sections:[
        ['6:30 PM–7:00 PM',['Touch up the kitchens at 141 and 143.','Touch up the dining areas.','Clean the entrances.']],
        ['7:00 PM–7:30 PM',['Touch up all shared bathrooms.','Refill bathroom supplies.','Remove bathroom rubbish.']],
        ['7:30 PM–8:00 PM',['Prepare and serve dinner.','Keep the dining area clean while dinner is being served.']],
        ['8:00 PM–9:00 PM',['Vacuum all corridors.','Vacuum the reception area.','Clean the courtyard and backyard.','Assist with guest or reception requests.']],
        ['9:00 PM–9:30 PM',['Clean the kitchen and dining area after dinner.','Put the rubbish bins outside.','Check stickers, markers, containers, and guest supplies.','Report low-stock items immediately.','Conduct a final inspection.']]
      ]}
    ]},
    {property:'Central', shifts:[
      {name:'Morning Shift · 8:00 AM–1:00 PM', sections:[
        ['8:00 AM–8:20 AM',['Pick up rubbish from the entrance.','Empty the vacuum.','Prepare the cleaning basket.','Confirm with reception that cleaning equipment is ready.','Check stickers, markers, containers, and guest supplies.','Report low-stock items immediately.']],
        ['8:20 AM–9:00 AM',['Clean the kitchen, dining area, reception area, and outside refrigerator doors.','Clean kitchen benches, sinks, and floors.','Check all rooms and carefully tidy messy guest belongings.','Vacuum the corridors.']],
        ['9:00 AM–9:30 AM',['Properly clean shared Bathrooms 1, 2, and 3.','Refill toilet paper and soap.','Remove bathroom rubbish.','Report mould, leaks, blockages, or damage immediately.']],
        ['9:30 AM–11:00 AM',['Make beds in assigned rooms.','Prepare check-out rooms for incoming guests.']],
        ['11:00 AM–11:30 AM',['Properly clean ensuite bathrooms in Rooms 101, 206, and 207.','Check for mould, damage, leaks, and missing supplies.']],
        ['11:30 AM–1:00 PM',['Vacuum the entire property, including guest rooms, corridors, and common areas.','Assist with guest or reception requests.','Endorse unfinished bathroom cleaning to reception.','Conduct a final inspection.']]
      ]},
      {name:'Night Shift · 6:30 PM–9:30 PM', sections:[
        ['6:30 PM–7:00 PM',['Touch up the kitchen.','Touch up the dining area.','Touch up all shared bathrooms.']],
        ['7:00 PM–7:45 PM',['Prepare and serve dinner.','Keep the dining area clean while dinner is being served.']],
        ['7:45 PM–9:00 PM',['Vacuum all corridors.','Vacuum the reception area.','Assist with guest or reception requests.']],
        ['9:00 PM–9:30 PM',['Clean the kitchen and dining area after dinner.','Put the rubbish bins outside.','Check stickers, markers, containers, and guest supplies.','Report low-stock items immediately.','Conduct a final inspection.']]
      ]}
    ]},
    {property:'Pyrmont', shifts:[{name:'10:00 AM–2:00 PM', sections:[
      ['10:00 AM–10:45 AM',['Clean and vacuum the kitchen.','Clean and vacuum the dining area.','Clean and vacuum the hallways.','Clean all other shared and common areas.']],
      ['10:45 AM–11:15 AM',['Properly clean all shared bathrooms.','Refill toilet paper and soap.','Remove bathroom rubbish.','Report mould, leaks, blockages, or damage immediately.']],
      ['11:15 AM–12:45 PM',['Make beds in assigned rooms.','Clean all assigned guest rooms.','Prepare check-out rooms for incoming guests.']],
      ['12:45 PM–1:05 PM',['Empty all rubbish bins.','Replace all bin liners.','Move rubbish to the designated collection area.']],
      ['1:05 PM–1:25 PM',['Clean refrigerator shelves, doors, and handles.','Remove expired or unlabelled items according to property procedures.','Clean the area surrounding the refrigerator.']],
      ['1:25 PM–1:40 PM',['Check cleaning supplies.','Check guest supplies.','Report low-stock or missing items immediately.']],
      ['1:40 PM–2:00 PM',['Complete unfinished tasks.','Assist with urgent guest or reception requests.','Conduct a final inspection of the property.']]
    ]}]}
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
  let activeCleanerProperty = 0;
  let publishedRosters = [];

  document.body.innerHTML = `<div class="app public-app">
    <header class="topbar"><div class="brand"><div class="logo"><img src="cbit-logo.png" alt="CBIT logo"></div><div><strong>CBIT</strong><span>Published roster access</span></div></div><div class="top-actions"><a class="btn" href="index.html">Staff Sign In</a></div></header>
    <nav class="nav top-nav public-nav" aria-label="Public navigation"><a class="active" href="published-roster.html">Published Roster</a><a href="index.html">Staff Sign In</a></nav>
    <main id="page"><section class="panel"><div class="panel-head"><div><h1>Published Department Rosters</h1><p class="muted">View the latest published roster for any department.</p></div></div><div class="panel-body">
      <div class="published-controls"><div class="roster-subtabs department-roster-tabs">${DEPARTMENTS.map((item,index)=>`<button class="btn ${index===0?'btn-primary':''}" data-type="${item.key}">${item.label}</button>`).join('')}</div><div id="publishedWeekField" class="field published-week-field"><label for="weekSelect">Published Week</label><select id="weekSelect"></select></div></div>
      <div id="rosterView">
        <div id="publicationMeta" class="publication-meta"></div><div class="table-wrap published-table-wrap"><table class="roster-table public-roster-table"><thead id="publicHead"></thead><tbody id="publicBody"></tbody></table></div><div id="publicEmpty" class="public-empty hidden"></div>
      </div>
      <div id="cleanerTasksView" class="public-cleaner-tasks-view hidden">
        <div class="public-cleaner-task-intro"><div><h2>Cleaner Task Lists</h2><p class="muted">Select a property, then copy its daily cleaning schedule.</p></div></div>
        <div id="cleanerPropertyTabs" class="roster-subtabs public-cleaner-property-tabs"></div>
        <div id="publicCleanerTaskLists" class="public-cleaner-task-lists"></div>
      </div>
    </div></section>
    </main></div>`;

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


  function propertyCopyText(property){
    const lines=[property.property.toUpperCase()];
    property.shifts.forEach(shift=>{
      lines.push('', shift.name);
      shift.sections.forEach(([time,tasks])=>{
        lines.push('', time);
        tasks.forEach(task=>lines.push(`☐ ${task}`));
      });
    });
    return lines.join('\n').trim();
  }

  function renderCleanerPropertyTabs(){
    const host=$('cleanerPropertyTabs');
    host.innerHTML=CLEANER_TASK_LISTS.map((property,index)=>`<button type="button" class="btn ${index===activeCleanerProperty?'btn-primary':''}" data-cleaner-property="${index}">${esc(property.property)}</button>`).join('');
    host.querySelectorAll('[data-cleaner-property]').forEach(button=>button.addEventListener('click',()=>{
      activeCleanerProperty=Number(button.dataset.cleanerProperty);
      renderCleanerPropertyTabs();
      renderCleanerTaskLists();
    }));
  }

  function renderCleanerTaskLists(){
    const host=$('publicCleanerTaskLists');
    const property=CLEANER_TASK_LISTS[activeCleanerProperty] || CLEANER_TASK_LISTS[0];
    const index=CLEANER_TASK_LISTS.indexOf(property);
    host.innerHTML=`<section class="public-cleaner-property">
      <div class="public-cleaner-property-head"><div><h3>${esc(property.property)}</h3><span>${property.shifts.length} ${property.shifts.length===1?'shift':'shifts'}</span></div><button class="btn public-copy-tasks" type="button" data-copy-property="${index}">Copy list</button></div>
      ${property.shifts.map(shift=>`<div class="public-cleaner-shift"><h4>${esc(shift.name)}</h4>${shift.sections.map(([time,tasks])=>`<div class="public-cleaner-time"><strong>${esc(time)}</strong><ul>${tasks.map(task=>`<li>${esc(task)}</li>`).join('')}</ul></div>`).join('')}</div>`).join('')}
    </section>`;
    const button=host.querySelector('[data-copy-property]');
    button?.addEventListener('click',async()=>{
      try{
        await navigator.clipboard.writeText(propertyCopyText(property));
        const original=button.textContent;button.textContent='Copied';button.classList.add('btn-primary');
        setTimeout(()=>{button.textContent=original;button.classList.remove('btn-primary')},1400);
      }catch(error){
        const area=document.createElement('textarea');area.value=propertyCopyText(property);area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();
        button.textContent='Copied';setTimeout(()=>button.textContent='Copy list',1400);
      }
    });
  }

  function populateWeeks(){
    const weeks=availableWeeks();
    if(!selectedWeek||!weeks.includes(selectedWeek))selectedWeek=weeks[0]||'';
    $('weekSelect').innerHTML=weeks.length?weeks.map(week=>{const end=new Date(`${week}T00:00:00`);end.setDate(end.getDate()+6);return `<option value="${week}" ${week===selectedWeek?'selected':''}>${formatDate(week)} – ${formatDate(iso(end))}</option>`}).join(''):'<option value="">No published weeks</option>';
    $('weekSelect').disabled=!weeks.length;
  }

  function render(){
    const tasksMode=activeType==='CleanerTasks';
    $('rosterView').classList.toggle('hidden',tasksMode);
    $('cleanerTasksView').classList.toggle('hidden',!tasksMode);
    $('publishedWeekField').classList.toggle('hidden',tasksMode);
    if(tasksMode){renderCleanerPropertyTabs();renderCleanerTaskLists();return;}
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
