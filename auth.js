const Auth = {
  user: null,

  homePage(user = this.user) {
    if (user?.role === 'Manager') return 'staff.html';
    if (user?.role === 'Cleaner Roster Manager') return 'rostering.html';
    return 'dashboard.html';
  },

  allowedPages(user = this.user) {
    if (!user) return ['index.html', 'published-roster.html'];
    if (user.role === 'Admin') return ['dashboard.html', 'cleaners-task-monitoring.html', 'staff.html', 'rostering.html', 'published-roster.html', 'user-management.html'];
    if (user.role === 'Manager') return ['cleaners-task-monitoring.html', 'staff.html', 'rostering.html', 'published-roster.html', 'user-management.html'];
    if (user.role === 'Cleaner Roster Manager') return ['rostering.html', 'published-roster.html'];
    return ['published-roster.html'];
  },

  async init(requireAuth = true) {
    try {
      const session = await DB.request('/auth/session');
      this.user = session?.user || session || null;
    } catch (error) {
      this.user = null;
      console.error(error);
    }

    const path = location.pathname.split('/').pop() || 'index.html';
    const isLoginPage = path === 'index.html' || path === '';

    if (!this.user) {
      if (requireAuth && !isLoginPage) location.replace('index.html');
      return null;
    }

    if (isLoginPage) {
      location.replace(this.homePage());
      return null;
    }

    if (!this.allowedPages().includes(path)) {
      location.replace(this.homePage());
      return null;
    }

    document.querySelectorAll('[data-user-email]').forEach(element => {
      element.textContent = `${this.user.full_name || this.user.email || ''} · ${this.user.role || ''}`;
    });

    return this.user;
  },

  async login(email, password) {
    const result = await DB.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: String(email).trim(), password })
    });
    this.user = result?.user || result || null;
    location.replace(this.homePage());
  },

  async logout() {
    await DB.request('/auth/logout', { method: 'POST' });
    this.user = null;
    location.replace('index.html');
  },

  can(permission) {
    if (!this.user) return false;
    if (this.user.role === 'Admin') return true;
    const managerPermissions = ['staff.view', 'staff.edit', 'staff.notes', 'evaluation.create', 'evaluation.view', 'evaluation.edit', 'evaluation.delete', 'evaluation.export', 'roster.view', 'roster.edit', 'roster.publish', 'users.manage'];
    if (this.user.role === 'Manager') return managerPermissions.includes(permission);
    const cleanerRosterPermissions = ['roster.cleaners.view', 'roster.cleaners.edit', 'roster.cleaners.publish'];
    return this.user.role === 'Cleaner Roster Manager' && cleanerRosterPermissions.includes(permission);
  }
};

window.Auth = Auth;
