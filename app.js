const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');

// Fetch wrapper that redirects to login on 401
async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    showLogin();
    throw new Error('Not authenticated');
  }
  return res;
}

function showLogin() {
  loginView.hidden = false;
  appView.hidden = true;
}

function showApp(user) {
  loginView.hidden = true;
  appView.hidden = false;
  userName.textContent = user.name || user.email;
  if (user.picture) {
    userAvatar.src = user.picture;
    userAvatar.hidden = false;
  } else {
    userAvatar.hidden = true;
  }
}

// Check auth on load — uses raw fetch (not apiFetch) because
// a 401 here is the expected unauthenticated state, not an error.
async function init() {
  try {
    const res = await fetch('/api/me');
    if (res.ok) {
      const user = await res.json();
      showApp(user);
    } else {
      showLogin();
    }
  } catch {
    showLogin();
  }
}

// Event listeners
loginBtn.addEventListener('click', () => {
  window.location.href = '/auth/login';
});

logoutBtn.addEventListener('click', () => {
  window.location.href = '/auth/logout';
});

init();
