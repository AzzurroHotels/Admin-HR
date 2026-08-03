const CLEANER_SCHEDULES = [
  {
    property: 'Olympic', shift: '9:00 AM–1:00 PM', sections: [
      ['9:00 AM–9:10 AM', ['Log in for the shift.', 'Send a photo of the cleaning basket to the Housekeeping group chat.', 'Confirm that the vacuum is complete and working properly.']],
      ['9:10 AM–10:30 AM', ['Vacuum and clean the first-floor corridors.', 'Vacuum and clean the second-floor corridors.', 'Clean the reception area.', 'Clean the staircase near reception.', 'Properly clean shared bathrooms A1, E1, A2, B2, and C2.', 'Refill toilet paper, soap, and other bathroom supplies.', 'Report any maintenance or cleaning issues immediately.']],
      ['10:30 AM–11:30 AM', ['Properly clean the ensuite bathrooms in Rooms 1, 10, 11, and 29.', 'Check for mould, leaks, blockages, or damaged bathroom items.', 'Refill bathroom supplies where required.']],
      ['11:30 AM–12:30 PM', ['Contact Alvin or Sobit for the assigned check-out rooms.', 'Make beds in the assigned check-out rooms.', 'Clean and prepare the assigned rooms for incoming guests.']],
      ['12:30 PM–1:00 PM', ['Complete any unfinished room-cleaning tasks.', 'Complete additional tasks assigned by Alvin or Sobit, such as deep-cleaning bathrooms, cleaning the kitchen or laundry room, and counting stocks.', 'Conduct a final inspection before finishing the shift.']]
    ]
  },
  {
    property: 'Allen / Darling Harbour', shift: 'Morning Shift · 8:00 AM–3:00 PM', sections: [
      ['8:00 AM–8:15 AM', ['Pick up rubbish from the side entrance, corridors, and dining area.', 'Empty the vacuum.', 'Prepare the cleaning basket.', 'Confirm with reception that cleaning equipment is ready.', 'Check stickers, markers, containers, and guest supplies.', 'Report low-stock items immediately.']],
      ['8:15 AM–8:45 AM', ['Touch up the kitchen.', 'Clean the kitchen bench.', 'Clean the kitchen sink.', 'Clean the kitchen floor.']],
      ['8:45 AM–9:30 AM', ['Check all rooms and identify messy guest belongings or areas requiring attention.', 'Tidy personal items carefully without throwing anything away.', 'Vacuum and mop the kitchen and dining area.', 'Clean first-floor shared bathrooms: Toilet 3, Shower 4, Bathrooms 5 and 6, Toilet 7, Bathroom 8, and Toilet 9.', 'Refill toilet paper and soap.', 'Remove bathroom rubbish.', 'Report mould, leaks, blockages, or damage immediately.']],
      ['9:30 AM–10:00 AM', ['Vacuum the ground floor.', 'Inspect the entrance, corridors, dining area, and common spaces.']],
      ['10:00 AM–11:00 AM', ['Clean second-floor shared bathrooms: Toilet 11, Shower 12, Bathrooms 13 and 14, Toilet 15, Bathroom 16, and Toilet 17.', 'Vacuum the second floor.', 'Refill bathroom supplies and remove rubbish.']],
      ['11:00 AM–12:30 PM', ['Properly clean the ensuite bathrooms in Rooms 1, 2, 3, 6, 15, 19, and 28.', 'Check for mould, damage, leaks, and missing supplies.']],
      ['12:30 PM–2:00 PM', ['Make beds in assigned rooms.', 'Clean assigned check-out rooms.', 'Complete any additional room preparation tasks.']],
      ['2:00 PM–3:00 PM', ['Vacuum all guest rooms.', 'Complete any unfinished bathroom cleaning.', 'Endorse unfinished tasks to reception for the afternoon cleaner.', 'Conduct a final inspection.']]
    ]
  },
  {
    property: 'Allen / Darling Harbour', shift: 'Afternoon Shift · 2:30 PM–5:30 PM', sections: [
      ['2:30 PM–3:00 PM', ['Touch up the kitchen.', 'Clean the kitchen bench, sink, and floor.', 'Load linens and sheets into the washing machines.', 'Wash a minimum of 30 sheets.', 'Check the laundry every 45 minutes.']],
      ['3:00 PM–3:30 PM', ['Clean the courtyard.', 'Clean the first-floor laundry.', 'Clean the second-floor laundry.', 'Update the laundry stock list immediately.', 'Check the guest laundry area.', 'Remove rubbish from the laundry area.', 'Report any machine problems immediately.']],
      ['3:30 PM–4:45 PM', ['Touch up the first-floor shared bathrooms.', 'Vacuum the first floor.', 'Refill bathroom supplies and remove rubbish.']],
      ['4:45 PM–5:00 PM', ['Touch up the second-floor shared bathrooms.', 'Vacuum the second floor.']],
      ['5:00 PM–5:30 PM', ['Touch up ensuite bathrooms in Rooms 1, 2, 3, 13, 15, 19, and 28.', 'Check stickers, markers, containers, and guest supplies.', 'Report low-stock items immediately.', 'Assist with guest or reception requests.', 'Endorse unfinished tasks to reception for the night cleaner.']]
    ]
  },
  {
    property: 'Potts Point', shift: 'Morning Shift · 8:00 AM–1:00 PM', sections: [
      ['8:00 AM–8:20 AM', ['Pick up rubbish from the entrances of 141 and 143.', 'Empty the vacuum.', 'Prepare the cleaning basket.', 'Confirm with reception that cleaning equipment is ready.', 'Check stickers, markers, containers, and guest supplies.', 'Report low-stock items immediately.']],
      ['8:20 AM–9:00 AM', ['Clean the kitchen, dining area, reception area, courtyard, and outside refrigerator doors.', 'Clean benches, sinks, and floors.', 'Check all rooms and carefully tidy messy guest belongings.', 'Vacuum the entrance.']],
      ['9:00 AM–10:00 AM', ['Properly clean all shared bathrooms and showers.', 'Refill toilet paper and soap.', 'Remove rubbish.', 'Report mould, leaks, blockages, or damage immediately.']],
      ['10:00 AM–11:00 AM', ['Make beds in all assigned rooms.', 'Prepare check-out rooms for incoming guests.']],
      ['11:00 AM–1:00 PM', ['Vacuum the entire property, including guest rooms, corridors, and common areas.', 'Assist with guest or reception requests.', 'Endorse unfinished bathroom cleaning to reception.', 'Conduct a final inspection.']]
    ]
  },
  {
    property: 'Potts Point', shift: 'Night Shift · 6:30 PM–9:30 PM', sections: [
      ['6:30 PM–7:00 PM', ['Touch up the kitchens at 141 and 143.', 'Touch up the dining areas.', 'Clean the entrances.']],
      ['7:00 PM–7:30 PM', ['Touch up all shared bathrooms.', 'Refill bathroom supplies.', 'Remove bathroom rubbish.']],
      ['7:30 PM–8:00 PM', ['Prepare and serve dinner.', 'Keep the dining area clean while dinner is being served.']],
      ['8:00 PM–9:00 PM', ['Vacuum all corridors.', 'Vacuum the reception area.', 'Clean the courtyard and backyard.', 'Assist with guest or reception requests.']],
      ['9:00 PM–9:30 PM', ['Clean the kitchen and dining area after dinner.', 'Put the rubbish bins outside.', 'Check stickers, markers, containers, and guest supplies.', 'Report low-stock items immediately.', 'Conduct a final inspection.']]
    ]
  },
  {
    property: 'Central', shift: 'Morning Shift · 8:00 AM–1:00 PM', sections: [
      ['8:00 AM–8:20 AM', ['Pick up rubbish from the entrance.', 'Empty the vacuum.', 'Prepare the cleaning basket.', 'Confirm with reception that cleaning equipment is ready.', 'Check stickers, markers, containers, and guest supplies.', 'Report low-stock items immediately.']],
      ['8:20 AM–9:00 AM', ['Clean the kitchen, dining area, reception area, and outside refrigerator doors.', 'Clean kitchen benches, sinks, and floors.', 'Check all rooms and carefully tidy messy guest belongings.', 'Vacuum the corridors.']],
      ['9:00 AM–9:30 AM', ['Properly clean shared Bathrooms 1, 2, and 3.', 'Refill toilet paper and soap.', 'Remove bathroom rubbish.', 'Report mould, leaks, blockages, or damage immediately.']],
      ['9:30 AM–11:00 AM', ['Make beds in assigned rooms.', 'Prepare check-out rooms for incoming guests.']],
      ['11:00 AM–11:30 AM', ['Properly clean ensuite bathrooms in Rooms 101, 206, and 207.', 'Check for mould, damage, leaks, and missing supplies.']],
      ['11:30 AM–1:00 PM', ['Vacuum the entire property, including guest rooms, corridors, and common areas.', 'Assist with guest or reception requests.', 'Endorse unfinished bathroom cleaning to reception.', 'Conduct a final inspection.']]
    ]
  },
  {
    property: 'Central', shift: 'Night Shift · 6:30 PM–9:30 PM', sections: [
      ['6:30 PM–7:00 PM', ['Touch up the kitchen.', 'Touch up the dining area.', 'Touch up all shared bathrooms.']],
      ['7:00 PM–7:45 PM', ['Prepare and serve dinner.', 'Keep the dining area clean while dinner is being served.']],
      ['7:45 PM–9:00 PM', ['Vacuum all corridors.', 'Vacuum the reception area.', 'Assist with guest or reception requests.']],
      ['9:00 PM–9:30 PM', ['Clean the kitchen and dining area after dinner.', 'Put the rubbish bins outside.', 'Check stickers, markers, containers, and guest supplies.', 'Report low-stock items immediately.', 'Conduct a final inspection.']]
    ]
  },
  {
    property: 'Pyrmont', shift: '10:00 AM–2:00 PM', sections: [
      ['10:00 AM–10:45 AM', ['Clean and vacuum the kitchen.', 'Clean and vacuum the dining area.', 'Clean and vacuum the hallways.', 'Clean all other shared and common areas.']],
      ['10:45 AM–11:15 AM', ['Properly clean all shared bathrooms.', 'Refill toilet paper and soap.', 'Remove bathroom rubbish.', 'Report mould, leaks, blockages, or damage immediately.']],
      ['11:15 AM–12:45 PM', ['Make beds in assigned rooms.', 'Clean all assigned guest rooms.', 'Prepare check-out rooms for incoming guests.']],
      ['12:45 PM–1:05 PM', ['Empty all rubbish bins.', 'Replace all bin liners.', 'Move rubbish to the designated collection area.']],
      ['1:05 PM–1:25 PM', ['Clean refrigerator shelves, doors, and handles.', 'Remove expired or unlabelled items according to property procedures.', 'Clean the area surrounding the refrigerator.']],
      ['1:25 PM–1:40 PM', ['Check cleaning supplies.', 'Check guest supplies.', 'Report low-stock or missing items immediately.']],
      ['1:40 PM–2:00 PM', ['Complete unfinished tasks.', 'Assist with urgent guest or reception requests.', 'Conduct a final inspection of the property.']]
    ]
  }
];

(async function initCleanerMonitoring(){
  await Auth.init();
  Shared.shell('cleaners-task-monitoring', "Cleaner's Task Monitoring", 'Daily property checklists with Supabase progress tracking and Word export.');
  const content = document.getElementById('content');
  const today = new Date().toISOString().slice(0,10);
  const properties = [...new Set(CLEANER_SCHEDULES.map(item => item.property))];
  content.innerHTML = `
    <div class="cleaner-toolbar">
      <div class="field compact-field"><label for="monitorDate">Checklist Date</label><input id="monitorDate" type="date" value="${today}"></div>
      <div class="field compact-field"><label for="propertyFilter">Property</label><select id="propertyFilter"><option value="all">All Properties</option>${properties.map(p=>`<option value="${Shared.esc(p)}">${Shared.esc(p)}</option>`).join('')}</select></div>
      <div class="cleaner-toolbar-actions"><button class="btn" id="resetChecklist">Reset Visible</button><button class="btn btn-primary" id="exportWord">Export to Word</button></div>
    </div>
    <div id="cleanerSyncStatus" class="cleaner-sync-status" aria-live="polite"></div>
    <div id="cleanerSummary" class="cleaner-summary"></div>
    <div id="cleanerChecklist" class="cleaner-checklist"></div>`;

  const dateEl=document.getElementById('monitorDate');
  const filterEl=document.getElementById('propertyFilter');
  const listEl=document.getElementById('cleanerChecklist');
  const summaryEl=document.getElementById('cleanerSummary');
  const syncEl=document.getElementById('cleanerSyncStatus');
  const resetBtn=document.getElementById('resetChecklist');
  const exportBtn=document.getElementById('exportWord');
  const table='cleaner_task_completions';
  const state={};
  let recordsByKey=new Map();
  let loadToken=0;

  const taskId=(scheduleIndex,sectionIndex,taskIndex)=>`${scheduleIndex}-${sectionIndex}-${taskIndex}`;
  const visibleSchedules=()=>CLEANER_SCHEDULES.map((s,i)=>({...s,index:i})).filter(s=>filterEl.value==='all'||s.property===filterEl.value);
  const setSync=(message,type='')=>{syncEl.textContent=message;syncEl.className=`cleaner-sync-status ${type}`.trim();};
  const setBusy=busy=>{dateEl.disabled=busy;filterEl.disabled=busy;resetBtn.disabled=busy;exportBtn.disabled=busy;};

  function taskMetadata(id){
    const [scheduleIndex,sectionIndex,taskIndex]=id.split('-').map(Number);
    const schedule=CLEANER_SCHEDULES[scheduleIndex];
    const section=schedule?.sections?.[sectionIndex];
    const description=section?.[1]?.[taskIndex];
    if(!schedule||!section||!description) throw new Error('The selected checklist task could not be found.');
    return {scheduleIndex,sectionIndex,taskIndex,schedule,timeRange:section[0],description};
  }

  async function loadState(){
    const token=++loadToken;
    setBusy(true);
    setSync('Loading checklist progress from Supabase…','loading');
    try{
      const {data,error}=await DB.client.from(table).select('id,task_key,is_completed,completed_by_name,completed_at').eq('task_date',dateEl.value);
      if(error) throw error;
      if(token!==loadToken) return;
      recordsByKey=new Map((data||[]).map(row=>[row.task_key,row]));
      Object.keys(state).forEach(key=>delete state[key]);
      for(const row of data||[]) state[row.task_key]=row.is_completed===true;
      render();
      setSync('Saved in Supabase. Changes are shared across authorised devices.','success');
    }catch(error){
      console.error(error);
      recordsByKey=new Map();
      Object.keys(state).forEach(key=>delete state[key]);
      render();
      setSync(`Could not load Supabase checklist: ${error.message}`,'error');
      Shared.toast(`Could not load checklist: ${error.message}`);
    }finally{
      if(token===loadToken) setBusy(false);
    }
  }

  function render(){
    const visible=visibleSchedules();
    let total=0,done=0;
    listEl.innerHTML=visible.map(schedule=>{
      const shiftTasks=schedule.sections.flatMap(x=>x[1]);
      const shiftDone=schedule.sections.reduce((n,section,si)=>n+section[1].filter((_,ti)=>state[taskId(schedule.index,si,ti)]).length,0);
      total+=shiftTasks.length; done+=shiftDone;
      const percent=shiftTasks.length?Math.round(shiftDone/shiftTasks.length*100):0;
      return `<section class="cleaner-property-card">
        <div class="cleaner-property-head"><div><h2>${Shared.esc(schedule.property)}</h2><p>${Shared.esc(schedule.shift)}</p></div><div class="cleaner-progress"><strong>${percent}%</strong><span>${shiftDone}/${shiftTasks.length} completed</span></div></div>
        <div class="progress-track"><span style="width:${percent}%"></span></div>
        ${schedule.sections.map((section,si)=>`<div class="cleaner-time-block"><h3>${Shared.esc(section[0])}</h3><div class="cleaner-task-list">${section[1].map((task,ti)=>{const id=taskId(schedule.index,si,ti);const record=recordsByKey.get(id);const audit=state[id]&&record?.completed_by_name?`<small>Completed by ${Shared.esc(record.completed_by_name)}${record.completed_at?` · ${new Date(record.completed_at).toLocaleString('en-AU')}`:''}</small>`:'';return `<label class="cleaner-task ${state[id]?'completed':''}"><input type="checkbox" data-task-id="${id}" ${state[id]?'checked':''}><span>${Shared.esc(task)}${audit}</span></label>`}).join('')}</div></div>`).join('')}
      </section>`;
    }).join('');
    const percent=total?Math.round(done/total*100):0;
    summaryEl.innerHTML=`<div><strong>${percent}%</strong><span>Overall completion</span></div><div><strong>${done}</strong><span>Completed tasks</span></div><div><strong>${total-done}</strong><span>Remaining tasks</span></div>`;
    listEl.querySelectorAll('input[type="checkbox"]').forEach(box=>box.onchange=()=>saveTask(box));
  }

  async function saveTask(box){
    const id=box.dataset.taskId;
    const checked=box.checked;
    const previous=state[id]===true;
    const metadata=taskMetadata(id);
    state[id]=checked;
    box.disabled=true;
    render();
    setSync('Saving change to Supabase…','loading');
    try{
      const now=new Date().toISOString();
      const userName=Auth.user?.full_name||Auth.user?.email||'CBIT user';
      const payload={
        task_date:dateEl.value,
        property_name:metadata.schedule.property,
        shift_name:metadata.schedule.shift,
        task_key:id,
        task_description:metadata.description,
        is_completed:checked,
        completed_by:checked?(Auth.user?.auth_user_id||null):null,
        completed_by_name:checked?userName:null,
        completed_at:checked?now:null,
        updated_at:now
      };
      const {data,error}=await DB.client.from(table).upsert(payload,{onConflict:'task_date,property_name,shift_name,task_key'}).select('id,task_key,is_completed,completed_by_name,completed_at').single();
      if(error) throw error;
      recordsByKey.set(id,data);
      state[id]=data.is_completed===true;
      render();
      setSync('Saved in Supabase.','success');
    }catch(error){
      console.error(error);
      state[id]=previous;
      render();
      setSync(`Save failed: ${error.message}`,'error');
      Shared.toast(`Could not save task: ${error.message}`);
    }
  }

  function exportWord(){
    const visible=visibleSchedules();
    const dateLabel=new Date(dateEl.value+'T00:00:00').toLocaleDateString('en-AU',{day:'2-digit',month:'long',year:'numeric'});
    const body=visible.map(schedule=>`<h1>${Shared.esc(schedule.property)}</h1><p><b>${Shared.esc(schedule.shift)}</b></p>${schedule.sections.map((section,si)=>`<h2>${Shared.esc(section[0])}</h2>${section[1].map((task,ti)=>`<p>${state[taskId(schedule.index,si,ti)]?'☒':'☐'} ${Shared.esc(task)}</p>`).join('')}`).join('')}`).join('<hr>');
    const html=`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;font-size:11pt;color:#1f2933}h1{font-size:18pt;margin:20px 0 4px}h2{font-size:12pt;margin:14px 0 6px;color:#2e5f72}p{margin:4px 0;line-height:1.35}hr{margin:24px 0;border:0;border-top:1px solid #bbb}</style></head><body><h1>Cleaner's Task Monitoring</h1><p><b>Date:</b> ${dateLabel}</p>${body}</body></html>`;
    const blob=new Blob(['\ufeff',html],{type:'application/msword'});
    const link=document.createElement('a');
    link.href=URL.createObjectURL(blob);
    link.download=`Cleaner_Task_Monitoring_${dateEl.value}_${filterEl.value==='all'?'All_Properties':filterEl.value.replace(/[^a-z0-9]+/gi,'_')}.doc`;
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(link.href),1000);
    Shared.toast('Word file exported.');
  }

  async function resetVisible(){
    if(!confirm('Reset all visible checklist items for this date?')) return;
    const keys=[];
    visibleSchedules().forEach(schedule=>schedule.sections.forEach((section,si)=>section[1].forEach((_,ti)=>keys.push(taskId(schedule.index,si,ti)))));
    if(!keys.length) return;
    setBusy(true);
    setSync('Resetting visible tasks in Supabase…','loading');
    try{
      const {error}=await DB.client.from(table).update({is_completed:false,completed_by_name:null,completed_at:null,updated_at:new Date().toISOString()}).eq('task_date',dateEl.value).in('task_key',keys);
      if(error) throw error;
      keys.forEach(key=>{state[key]=false;const record=recordsByKey.get(key);if(record)recordsByKey.set(key,{...record,is_completed:false,completed_by_name:null,completed_at:null});});
      render();
      setSync('Visible checklist items reset in Supabase.','success');
      Shared.toast('Visible checklist items reset.');
    }catch(error){
      console.error(error);
      setSync(`Reset failed: ${error.message}`,'error');
      Shared.toast(`Could not reset checklist: ${error.message}`);
    }finally{setBusy(false);}
  }

  exportBtn.onclick=exportWord;
  resetBtn.onclick=resetVisible;
  dateEl.onchange=loadState;
  filterEl.onchange=render;
  await loadState();
})();
