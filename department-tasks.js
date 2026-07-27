async function renderDepartmentPage(cfg) {
  Shared.shell(cfg.slug, cfg.title, cfg.description);
  await Auth.init();
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="panel-head" style="padding:0 0 14px;border:0">
      <input id="taskSearch" placeholder="Search tasks" style="max-width:420px">
      <button class="btn btn-primary" id="addTask">+ Add Task</button>
    </div>
    <div class="kanban" id="kanban"></div>
  `;

  document.body.insertAdjacentHTML('beforeend', `
    <div id="taskModal" class="modal hidden">
      <div class="modal-card">
        <div class="modal-head"><h3>Task Details</h3><button class="btn" id="closeTask">×</button></div>
        <form id="taskForm">
          <div class="modal-body">
            <input id="taskId" type="hidden">
            <div class="field"><label>Task Title</label><input id="taskTitle" required></div>
            <div class="field"><label>Description</label><textarea id="taskDescription"></textarea></div>
            <div class="grid2">
              <div class="field"><label>Status</label><select id="taskStatus">${cfg.statuses.map(s=>`<option>${s}</option>`).join('')}</select></div>
              <div class="field"><label>Priority</label><select id="taskPriority"><option>Critical</option><option>High</option><option selected>Medium</option><option>Low</option></select></div>
            </div>
            <div class="grid2">
              <div class="field"><label>Assignee</label><input id="taskAssignee"></div>
              <div class="field"><label>Due Date</label><input id="taskDue" type="date"></div>
            </div>
            <section id="taskUpdatesSection" class="task-updates-section hidden">
              <div class="task-updates-head">
                <div><h4>Updates & Activity</h4><p>Each update records the author, date, and time automatically.</p></div>
                <span id="taskUpdateCount" class="update-count">0 updates</span>
              </div>
              <div class="update-composer">
                <div class="field"><label for="taskUpdateNote">Add Update</label><textarea id="taskUpdateNote" rows="3" maxlength="4000" placeholder="Add progress, decisions, issues, follow-up details, or completion notes..."></textarea></div>
                <button id="addTaskUpdate" type="button" class="btn btn-primary">Add Update</button>
              </div>
              <div id="taskUpdatesList" class="task-updates-list"></div>
            </section>
            <div id="saveFirstMessage" class="save-first-message">Save this task first to begin adding timestamped updates.</div>
          </div>
          <div class="modal-foot"><button type="button" class="btn btn-danger hidden" id="deleteTask">Delete</button><button class="btn btn-primary">Save</button></div>
        </form>
      </div>
    </div>`);

  const els = {
    search: document.getElementById('taskSearch'), add: document.getElementById('addTask'), board: document.getElementById('kanban'),
    modal: document.getElementById('taskModal'), form: document.getElementById('taskForm'), id: document.getElementById('taskId'),
    title: document.getElementById('taskTitle'), description: document.getElementById('taskDescription'), status: document.getElementById('taskStatus'),
    priority: document.getElementById('taskPriority'), assignee: document.getElementById('taskAssignee'), due: document.getElementById('taskDue'),
    del: document.getElementById('deleteTask'), close: document.getElementById('closeTask'), updatesSection: document.getElementById('taskUpdatesSection'),
    updateNote: document.getElementById('taskUpdateNote'), addUpdate: document.getElementById('addTaskUpdate'), updatesList: document.getElementById('taskUpdatesList'),
    updateCount: document.getElementById('taskUpdateCount'), saveFirst: document.getElementById('saveFirstMessage')
  };
  let tasks = [];
  let taskUpdates = [];
  let activeUpdates = [];
  async function load(){
    tasks = await DB.list('project_tasks');
    taskUpdates = await DB.list('project_task_updates');
    const legacyBacklog = tasks.filter(task => task.status === 'Backlog');
    if (legacyBacklog.length) {
      await Promise.all(legacyBacklog.map(task => DB.update('project_tasks', task.id, { status: 'To Do' })));
      tasks = await DB.list('project_tasks');
    }
    render();
  }
  function card(t){
    const priority = t.priority || 'Medium';
    const priorityClass = `priority-${priority.toLowerCase()}`;
    const updateTotal = taskUpdates.filter(update => String(update.task_id) === String(t.id)).length;
    return `<article class="task-card" draggable="true" data-id="${t.id}">
      <h4 class="task-card-title">${Shared.esc(t.title)}</h4>
      ${t.description ? `<p class="task-card-description">${Shared.esc(t.description)}</p>` : ''}
      <div class="task-card-meta">
        <div class="task-card-meta-row"><span class="task-card-meta-label">Assigned to</span><span>${Shared.esc(t.assignee || 'Unassigned')}</span></div>
        ${t.due_date ? `<div class="task-card-meta-row"><span class="task-card-meta-label">Due</span><span>${Shared.esc(t.due_date)}</span></div>` : ''}
        <div class="task-card-meta-row"><span class="task-card-meta-label">Priority</span><span class="pill ${priorityClass}">${Shared.esc(priority)}</span></div>
        <div class="task-card-meta-row"><span class="task-card-meta-label">Updates</span><span class="task-update-summary">${updateTotal}</span></div>
      </div>
    </article>`;
  }
  function render(){
    const q = els.search.value.toLowerCase();
    const filtered = tasks.filter(t => !q || JSON.stringify(t).toLowerCase().includes(q));
    els.board.innerHTML = cfg.statuses.map(status => `<section class="column"><div class="column-head">${Shared.esc(status)}</div><div class="dropzone" data-status="${Shared.esc(status)}">${filtered.filter(t=>t.status===status).map(card).join('') || '<div class="column-empty">No tasks</div>'}</div></section>`).join('');
    document.querySelectorAll('.task-card').forEach(c=>{
      c.onclick=()=>open(c.dataset.id);
      c.ondragstart=e=>e.dataTransfer.setData('text/plain',c.dataset.id);
    });
    document.querySelectorAll('.dropzone').forEach(z=>{
      z.ondragover=e=>e.preventDefault();
      z.ondrop=async e=>{e.preventDefault();const id=e.dataTransfer.getData('text/plain');if(id){await DB.update('project_tasks',id,{status:z.dataset.status});await load();}};
    });
  }
  function formatDateTime(value){
    if(!value) return '-';
    const date = new Date(value);
    if(Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-AU',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).format(date);
  }
  function renderUpdates(){
    els.updateCount.textContent = `${activeUpdates.length} update${activeUpdates.length===1?'':'s'}`;
    if(!activeUpdates.length){
      els.updatesList.innerHTML='<div class="task-updates-empty">No updates have been added yet.</div>';
      return;
    }
    els.updatesList.innerHTML=activeUpdates.map(update=>`<article class="task-update-item">
      <div class="task-update-meta"><strong>${Shared.esc(update.author_name || update.author_email || 'Signed-in user')}</strong><span>${Shared.esc(formatDateTime(update.created_at))}</span></div>
      <div class="task-update-note">${Shared.esc(update.note)}</div>
    </article>`).join('');
  }
  function loadUpdates(taskId){
    activeUpdates = taskUpdates.filter(update=>String(update.task_id)===String(taskId)).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
    renderUpdates();
  }
  function open(id=''){
    const t = tasks.find(x=>String(x.id)===String(id));
    els.form.reset(); els.id.value=t?.id||''; els.title.value=t?.title||''; els.description.value=t?.description||'';
    els.status.value=t?.status||cfg.statuses[0]; els.priority.value=t?.priority||'Medium'; els.assignee.value=t?.assignee||''; els.due.value=t?.due_date||'';
    els.del.classList.toggle('hidden',!t);
    els.updatesSection.classList.toggle('hidden',!t);
    els.saveFirst.classList.toggle('hidden',Boolean(t));
    els.updateNote.value=''; activeUpdates=[]; renderUpdates();
    if(t) loadUpdates(t.id);
    Shared.openModal('taskModal');
  }
  els.form.onsubmit=async e=>{e.preventDefault();const p={title:els.title.value.trim(),description:els.description.value,status:els.status.value,priority:els.priority.value,assignee:els.assignee.value,due_date:els.due.value||null,department:'Operations'};els.id.value?await DB.update('project_tasks',els.id.value,p):await DB.create('project_tasks',p);Shared.closeModal('taskModal');Shared.toast(els.id.value?'Task updated.':'Task created.');await load();};
  els.addUpdate.onclick=async()=>{
    const taskId=els.id.value; const note=els.updateNote.value.trim();
    if(!taskId){Shared.toast('Save the task before adding an update.');return;}
    if(!note){Shared.toast('Enter an update note.');return;}
    els.addUpdate.disabled=true; const original=els.addUpdate.textContent; els.addUpdate.textContent='Adding…';
    try{
      await DB.create('project_task_updates',{task_id:taskId,note,created_by:Auth.user?.auth_user_id||null,author_name:Auth.user?.full_name||Auth.user?.email||'User',author_email:Auth.user?.email||null});
      els.updateNote.value=''; taskUpdates=await DB.list('project_task_updates'); loadUpdates(taskId); render(); Shared.toast('Update added with date, time, and author.');
    }finally{els.addUpdate.disabled=false;els.addUpdate.textContent=original;}
  };
  els.del.onclick=async()=>{if(els.id.value&&confirm('Delete this task?')){await DB.remove('project_tasks',els.id.value);Shared.closeModal('taskModal');await load();}};
  els.close.onclick=()=>Shared.closeModal('taskModal'); els.add.onclick=()=>open(); els.search.oninput=render;
  await load();
}
window.renderDepartmentPage=renderDepartmentPage;
