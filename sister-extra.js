// Sister extra animation pack: typed titles, petals, hearts, sparkle bursts.
(() => {
  'use strict';

  // Falling petals
  const layer = document.getElementById('sisterPetals');
  if (layer) {
    for (let i = 0; i < 16; i++) {
      const fall = document.createElement('span');
      fall.className = 'petal-fall';
      const size = 9 + Math.random() * 11;
      fall.style.left = (Math.random() * 100).toFixed(2) + 'vw';
      fall.style.animationDuration = (7 + Math.random() * 8).toFixed(2) + 's';
      fall.style.animationDelay = (-Math.random() * 14).toFixed(2) + 's';
      fall.style.opacity = (0.5 + Math.random() * 0.5).toFixed(2);
      const sway = document.createElement('span');
      sway.className = 'petal-sway';
      sway.style.animationDuration = (1.6 + Math.random() * 1.8).toFixed(2) + 's';
      const shape = document.createElement('span');
      shape.className = 'petal-shape';
      shape.style.width = size.toFixed(1) + 'px';
      shape.style.height = (size * 0.86).toFixed(1) + 'px';
      shape.style.animationDuration = (1.4 + Math.random() * 1.6).toFixed(2) + 's';
      sway.appendChild(shape);
      fall.appendChild(sway);
      layer.appendChild(fall);
    }
  }

  const fx = document.getElementById('sisterFx');

  // Floating hearts
  function spawnHeart() {
    if (!fx || document.hidden) return;
    if (fx.querySelectorAll('.fx-heart').length > 9) return;
    const h = document.createElement('span');
    h.className = 'fx-heart';
    h.textContent = '♥';
    h.style.left = (4 + Math.random() * 92).toFixed(2) + 'vw';
    h.style.fontSize = (13 + Math.random() * 15).toFixed(0) + 'px';
    h.style.animationDuration = (6 + Math.random() * 4).toFixed(2) + 's';
    h.addEventListener('animationend', () => h.remove());
    fx.appendChild(h);
  }
  setInterval(spawnHeart, 2600);

  // Sparkle burst at a viewport position (percent)
  function burst(xPct, yPct) {
    if (!fx) return;
    for (let i = 0; i < 10; i++) {
      const sp = document.createElement('span');
      sp.className = 'fx-spark';
      sp.textContent = '✦';
      sp.style.left = xPct + 'vw';
      sp.style.top = yPct + 'vh';
      sp.style.fontSize = (11 + Math.random() * 13).toFixed(0) + 'px';
      const ang = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
      const dist = 40 + Math.random() * 70;
      sp.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      sp.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      sp.style.animationDuration = (0.9 + Math.random() * 0.7).toFixed(2) + 's';
      sp.addEventListener('animationend', () => sp.remove());
      fx.appendChild(sp);
    }
  }

  // Typed titles, started by the bloom tap
  const line1 = document.getElementById('stLine1');
  const line2 = document.getElementById('stLine2');
  const TEXT1 = 'Hello bạn';
  const TEXT2 = 'Gửi lời chúc tặng bạn 20/10';
  let started = false;

  function typeInto(el, text, speed, done) {
    if (!el) { if (done) done(); return; }
    el.parentElement.classList.add('st-caret');
    let i = 0;
    const t = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearInterval(t);
        el.parentElement.classList.remove('st-caret');
        if (done) done();
      }
    }, speed);
  }

  function startTitles() {
    if (started) return;
    started = true;
    burst(50, 38);
    typeInto(line1, TEXT1, 85, () => {
      typeInto(line2, TEXT2, 50, () => {
        burst(50, 30);
        // gentle random sparkles while the garden is in bloom
        setInterval(() => { if (!document.hidden) burst(8 + Math.random() * 84, 14 + Math.random() * 60); }, 5200);
      });
    });
  }

  const bloomBtn = document.getElementById('bloom');
  if (bloomBtn) bloomBtn.addEventListener('click', startTitles);
  const replayBtn = document.getElementById('replay');
  if (replayBtn) replayBtn.addEventListener('click', () => {
    started = false;
    if (line1) line1.textContent = '';
    if (line2) line2.textContent = '';
    setTimeout(startTitles, 1400);
  });
})();
