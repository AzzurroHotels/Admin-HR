(async()=>{
  await Auth.init();
  if (!Auth.user || !['Admin','Manager'].includes(Auth.user.role)) return;
  Shared.shell('user-management','User Management','Create and manage user accounts. Admin and Manager accounts have all features except that Managers cannot access the Task Dashboard.');
  const $=id=>document.getElementById(id);
  const content=$('content');
  content.innerHTML=`
    <div class="user-management-grid">
      <form id="userForm" class="panel user-form-card">
        <div class="panel-body">
          <input id="userId" type="hidden">
          <h3 id="userFormTitle">Add User Account</h3>
          <div class="field"><label>Full Name</label><input id="userName" required maxlength="160"></div>
          <div class="field"><label>Email Address</label><input id="userEmail" type="email" required maxlength="200"></div>
          <div class="field"><label>Password</label><input id="userPassword" type="password" minlength="8" placeholder="Minimum 8 characters"></div>
          <div class="field"><label>Role</label><select id="userRole"><option value="Manager">Manager</option><option value="Cleaner Roster Manager">Cleaner Roster Manager</option><option value="Admin">Admin</option></select></div>
          <div class="field"><label>Account Status</label><select id="userStatus"><option>Active</option><option>Inactive</option></select></div>
          <div class="row-actions"><button id="saveUser" class="btn btn-primary" type="submit">Create User</button><button id="clearUser" class="btn" type="button">Clear</button></div>
          <div class="role-help">
            <p><strong>Admin:</strong> full access to Tasks, Staff Management, Rostering, Published Roster, and User Management.</p>
            <p><strong>Manager:</strong> access to Staff Management, evaluations, evidence, Rostering, Published Roster, and User Management. The Task Dashboard remains unavailable.</p>
            <p><strong>Cleaner Roster Manager:</strong> can open and update only the Cleaners roster, copy it to the next week, and publish only the Cleaners roster.</p>
          </div>
        </div>
      </form>
      <div>
        <div class="section-head"><h3>User Accounts</h3><span class="muted">The Alvin Rustia admin account is protected.</span></div>
        <div class="table-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead><tbody id="userBody"></tbody></table></div>
      </div>
    </div>`;

  const protectedEmail='alvinrustia@azzurrohotels.com';
  let users=[];
  function isProtected(user){return String(user?.email||'').toLowerCase()===protectedEmail;}
  function reset(){
    $('userForm').reset();
    $('userId').value='';
    $('userRole').value='Manager';
    $('userStatus').value='Active';
    $('userFormTitle').textContent='Add User Account';
    $('userPassword').required=true;
    $('userPassword').placeholder='Minimum 8 characters';
    $('userRole').disabled=false;
    $('userStatus').disabled=false;
    $('saveUser').textContent='Create User';
  }
  function render(){
    $('userBody').innerHTML=users.map(user=>{
      const protectedAdmin=isProtected(user);
      return `<tr><td><strong>${Shared.esc(user.full_name||'-')}</strong><div class="muted">${Shared.esc(user.email||'')}</div></td><td><span class="pill">${Shared.esc(user.role||'Manager')}</span></td><td>${Shared.esc(user.account_status||'Active')}</td><td>${user.last_login_at?new Date(user.last_login_at).toLocaleString('en-AU'):'Never'}</td><td><div class="row-actions">${protectedAdmin?'<span class="muted">Protected admin</span>':`<button class="btn" data-edit-user="${user.id}">Edit</button><button class="btn btn-danger" data-delete-user="${user.id}">Delete</button>`}</div></td></tr>`;
    }).join('');
    qsa('[data-edit-user]').forEach(button=>button.onclick=()=>edit(button.dataset.editUser));
    qsa('[data-delete-user]').forEach(button=>button.onclick=()=>remove(button.dataset.deleteUser));
  }
  async function load(){
    users=(await DB.list('user_profiles')).sort((a,b)=>{
      if(isProtected(a))return -1;
      if(isProtected(b))return 1;
      return String(a.role).localeCompare(String(b.role))||String(a.full_name).localeCompare(String(b.full_name));
    });
    render();
  }
  function edit(id){
    const user=users.find(item=>String(item.id)===String(id));
    if(!user||isProtected(user))return;
    $('userId').value=user.id;
    $('userName').value=user.full_name||'';
    $('userEmail').value=user.email||'';
    $('userPassword').value='';
    $('userPassword').required=false;
    $('userPassword').placeholder='Leave blank to keep current password';
    $('userRole').value=user.role||'Manager';
    $('userStatus').value=user.account_status||'Active';
    $('userFormTitle').textContent='Edit User Account';
    $('saveUser').textContent='Save Changes';
    window.scrollTo({top:0,behavior:'smooth'});
  }
  async function remove(id){
    const user=users.find(item=>String(item.id)===String(id));
    if(!user||isProtected(user))return;
    if(user.role==='Admin'&&users.filter(item=>item.role==='Admin'&&item.account_status==='Active').length<=1){Shared.toast('At least one active admin account must remain.');return;}
    if(!confirm(`Delete ${user.role||'user'} account ${user.email}?`))return;
    await DB.deleteUserAccount(id);
    Shared.toast('User account deleted.');
    reset();
    await load();
  }
  $('userForm').onsubmit=async event=>{
    event.preventDefault();
    const recordId=$('userId').value;
    const email=$('userEmail').value.trim().toLowerCase();
    const duplicate=users.some(user=>String(user.id)!==String(recordId)&&String(user.email||'').toLowerCase()===email);
    if(duplicate){Shared.toast('An account with this email already exists.');return;}
    const payload={
      full_name:$('userName').value.trim(),
      email,
      role:$('userRole').value,
      account_status:$('userStatus').value
    };
    if($('userPassword').value)payload.password=$('userPassword').value;
    try{
      if(recordId) await DB.updateUserAccount(recordId,payload);
      else await DB.createUserAccount({...payload,password:$('userPassword').value});
      Shared.toast(recordId?'User account updated.':'User account created.');
      reset();
      await load();
    }catch(error){Shared.toast(error.message||'The user account could not be saved.');}
  };
  $('clearUser').onclick=reset;
  reset();
  await load();
})();
