const appView = document.getElementById('app-view');
const userName = document.getElementById('user-name');

async function init() {
  try {
    const res = await fetch('/api/me');
    if (res.ok) {
      const user = await res.json();
      appView.hidden = false;
      userName.textContent = user.name || user.email;
    }
  } catch {
    // Browser will show basic auth prompt automatically on 401
  }
}

init();
