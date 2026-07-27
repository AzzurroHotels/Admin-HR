const qs=(s,p=document)=>p.querySelector(s),qsa=(s,p=document)=>[...p.querySelectorAll(s)];
function toast(msg){const e=document.createElement('div');e.className='toast';e.textContent=msg;document.body.appendChild(e);setTimeout(()=>e.remove(),3200)}
function openModal(id){qs('#'+id)?.classList.remove('hidden')}
function closeModal(id){qs('#'+id)?.classList.add('hidden')}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function fmtDate(v){if(!v)return'-';return new Date(v+'T00:00:00').toLocaleDateString('en-AU')}
function shell(active,title,description){
  const adminNav=[
    ['dashboard','Task Dashboard'],
    ['staff','Staff Management'],
    ['rostering','Rostering'],
    ['published-roster','Published Roster'],
    ['user-management','User Management']
  ];
  const managerNav=[['staff','Staff Management']];
  const nav=Auth.user?.role==='Manager'?managerNav:adminNav;
  document.body.innerHTML=`<div class="app"><header class="topbar"><div class="brand"><div class="logo"><img src="cbit-logo.png" alt="CBIT logo"></div><div><strong>CBIT</strong><span data-user-email></span></div></div><div class="top-actions"><button class="btn" data-logout>Log Out</button></div></header><nav class="nav top-nav two-row-nav" id="mainNav" aria-label="CBIT sections"><div class="nav-row">${nav.map(([p,l])=>`<a class="${active===p?'active':''}" href="${p}.html">${l}</a>`).join('')}</div></nav><main id="page"><section class="panel"><div class="panel-head"><div><h1>${title}</h1><p class="muted">${description}</p></div></div><div class="panel-body" id="content"></div></section></main></div>`;
  qs('[data-logout]').onclick=()=>Auth.logout();
  document.querySelectorAll('[data-user-email]').forEach(element=>{element.textContent=`${Auth.user?.full_name||Auth.user?.email||''} · ${Auth.user?.role||''}`});
}
window.Shared={toast,openModal,closeModal,esc,fmtDate,shell};
