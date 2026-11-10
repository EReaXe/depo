const welcomeKey = 'depo-welcome-v1';

export function initWelcome({hasVehicles, goHome}) {
  const screen = document.getElementById('welcome');
  const background = [...document.querySelectorAll('body > header, body > main, body > nav')];
  let previousFocus;
  function show() {
    previousFocus = document.activeElement;
    screen.hidden = false;
    background.forEach(element => element.inert = true);
    document.body.classList.add('welcoming');
    screen.scrollTop = 0;
    document.getElementById('welcomeTitle').focus({preventScroll:true});
  }
  function finish(start) {
    try { localStorage.setItem(welcomeKey, 'done'); } catch { /* Accessible even without storage permission. */ }
    screen.hidden = true;
    background.forEach(element => element.inert = false);
    document.body.classList.remove('welcoming');
    goHome();
  }
  document.getElementById('welcomeStart').onclick = () => finish(true);
  document.getElementById('welcomeSkip').onclick = () => finish(false);
  document.getElementById('showWelcome').onclick = show;
  let completed = false;
  try { completed = localStorage.getItem(welcomeKey) === 'done'; } catch { /* First visit fallback. */ }
  if(!completed && !hasVehicles()) show();
}
