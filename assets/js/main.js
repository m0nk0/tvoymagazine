// Вселенная онлайн: прелоадер v2 (warp + портал), hero-видео со стартом после
// прелоадера и рождением кнопок из портала, звёзды, искры, reveal, автоплей окон
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== ФЛАГ ГОТОВНОСТИ: прелоадер растворился =====
let universeReady = false;
const readyFns = [];
const onUniverseReady = (fn) => { if (universeReady) fn(); else readyFns.push(fn); };
const signalUniverseReady = () => {
  if (universeReady) return;
  universeReady = true;
  readyFns.forEach((f) => f());
};

// ===== PRELOADER v2: WARP-ПОЛЁТ + КОЛЬЦО-ПОРТАЛ =====
const pre = document.getElementById('preloader');
if (pre) {
  if (sessionStorage.getItem('universeSeen')) {
    pre.remove();
    signalUniverseReady();
  } else {
    pre.classList.add('is-warp');

    const cv = document.getElementById('warp');
    if (cv && !reduced) {
      const ctx = cv.getContext('2d');
      let W, H;
      const resize = () => { W = cv.width = pre.offsetWidth; H = cv.height = pre.offsetHeight; };
      resize();
      addEventListener('resize', resize);
      const stars = Array.from({ length: 220 }, () => ({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random() * 0.9 + 0.1,
      }));
      const t0 = performance.now();
      const draw = (now) => {
        if (!pre.isConnected) return;
        const t = (now - t0) / 1000;
        const speed = t < 1.4 ? 0.35 + t * 1.6
                              : Math.max(0.1, 2.6 - (t - 1.4) * 2.2);
        ctx.fillStyle = 'rgba(5,11,20,.35)';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#9FE8FF';
        for (const s of stars) {
          s.z -= speed * 0.02;
          if (s.z <= 0.05) { s.z = 1; s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; }
          const k  = 1 / s.z;
          const k2 = 1 / (s.z + speed * 0.02);
          ctx.globalAlpha = Math.min(1, (1 - s.z) * 1.2);
          ctx.lineWidth = Math.max(0.4, (1 - s.z) * 2);
          ctx.beginPath();
          ctx.moveTo(W / 2 + s.x * k2 * W * 0.25, H / 2 + s.y * k2 * H * 0.25);
          ctx.lineTo(W / 2 + s.x * k  * W * 0.25, H / 2 + s.y * k  * H * 0.25);
          ctx.stroke();
        }
        requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);
    }

    const hide = () => {
      pre.classList.add('is-hidden');
      sessionStorage.setItem('universeSeen', '1');
      signalUniverseReady();
    };
    window.addEventListener('load', () => setTimeout(hide, 3200));
    setTimeout(hide, 6500);
  }
}

// ===== HERO-ВИДЕО: буфер греется под прелоадером, старт строго после него =====
const HERO_FREEZE_AT = 10; // заморозка навсегда; null = доиграть до конца
const video = document.getElementById('heroVideo');
if (video && !reduced) {
  video.loop = false;
  if (matchMedia('(pointer: fine)').matches) {
    video.preload = 'auto';
    video.load();
  }

  const heroEl = document.querySelector('.hero');
  const revealActions = () => { if (heroEl) heroEl.classList.add('is-ready'); };

  let frozen = false, started = false, heroVisible = true;
  const play = () => { if (started && !frozen && heroVisible && !document.hidden) video.play().catch(() => {}); };
  const freeze = () => { frozen = true; video.pause(); revealActions(); };
  const start = () => {
    if (started) return;
    started = true;
    video.currentTime = 0; // старт строго с первой секунды
    if (heroEl) heroEl.classList.add('is-playing'); // запуск таймлайна проявления текста
    play();
  };

  onUniverseReady(() => {
    if (matchMedia('(pointer: fine)').matches) start();
    else addEventListener('touchstart', start, { once: true });
  });

  video.addEventListener('timeupdate', () => {
    if (!frozen && HERO_FREEZE_AT !== null && video.currentTime >= HERO_FREEZE_AT) freeze();
  });
  video.addEventListener('ended', freeze);

  new IntersectionObserver((es) => {
    heroVisible = es[0].isIntersecting;
    if (!started) return;
    heroVisible ? play() : video.pause();
  }, { threshold: 0.25 }).observe(video);
  document.addEventListener('visibilitychange', () => {
    if (!started) return;
    document.hidden ? video.pause() : play();
  });

  setTimeout(revealActions, 12000); // страховка: кнопки появятся, даже если видео не смогло играть
}

// вестибулярный режим: кнопки видны сразу, без портала
if (reduced) {
  const h = document.querySelector('.hero');
  if (h) h.classList.add('is-ready');
}

// ===== HUD: ЖИВАЯ ТЕЛЕМЕТРИЯ + РЕДКИЕ ПОРТАЛЫ НАД БАШНЯМИ =====
const hud = document.querySelector('.hud');
if (hud && !reduced) {
  const scanTag = document.getElementById('hudScanTag');
  const bars = [...hud.querySelectorAll('.hud__bar')];
  const fills = [...hud.querySelectorAll('.hud__bar-track i')];
  const vals = [...hud.querySelectorAll('.hud__bar-head b')];
  const gates = [...hud.querySelectorAll('.hud__gate')];
  const base = [64, 31];
  const cur = [...base];
  let scan = 0, hudTimer = null, gateTimer = null, gateIdx = 0, hudVisible = false;

  const tick = () => {
    scan = (scan + 0.7 + Math.random() * 1.6) % 100;
    if (scanTag) scanTag.textContent = 'SCAN ' + scan.toFixed(1).padStart(4, '0') + '%';
    fills.forEach((f, i) => {
      let p = cur[i] + (Math.random() - 0.42) * 1.6;
      if (Math.random() < 0.07) {
        p += 3.5;
        bars[i].classList.add('is-surge');
        setTimeout(() => bars[i].classList.remove('is-surge'), 600);
      }
      p = Math.max(base[i] - 5, Math.min(base[i] + 8, p));
      cur[i] = p;
      f.style.width = p.toFixed(1) + '%';
      if (vals[i]) vals[i].textContent = Math.round(p) + '%';
    });
  };

  // то один, то другой портал: вспышка раз в 6 секунд, приглушённо
  const gateTick = () => {
    const g = gates[gateIdx % gates.length];
    gateIdx++;
    if (!g) return;
    g.classList.remove('is-open');
    void g.offsetWidth; // перезапуск анимации
    g.classList.add('is-open');
    setTimeout(() => g.classList.remove('is-open'), 2500);
  };

  const sync = () => {
    const run = hudVisible && !document.hidden;
    if (run && !hudTimer) { tick(); hudTimer = setInterval(tick, 450); }
    if (!run && hudTimer) { clearInterval(hudTimer); hudTimer = null; }
    if (run && !gateTimer) gateTimer = setInterval(gateTick, 6000);
    if (!run && gateTimer) { clearInterval(gateTimer); gateTimer = null; }
  };
  new IntersectionObserver((es) => {
    hudVisible = es[0].isIntersecting;
    hud.classList.toggle('is-paused', !hudVisible);
    sync();
  }, { threshold: 0.2 }).observe(hud);
  document.addEventListener('visibilitychange', sync);
}
// ===== ЗВЁЗДЫ С ПАРАЛЛАКСОМ =====
const canvas = document.getElementById('stars');
if (canvas && !reduced) {
  const ctx = canvas.getContext('2d');
  let stars = [];
  const make = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const n = Math.round(innerWidth * innerHeight / 9000);
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random() * 0.5 + 0.15,
      p: Math.random() * 0.35 + 0.05,
    }));
  };
  make();
  addEventListener('resize', make);
  let sy = scrollY;
  addEventListener('scroll', () => { sy = scrollY; }, { passive: true });
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#BFE9FF';
    for (const s of stars) {
      let y = (s.y - sy * s.p) % canvas.height;
      if (y < 0) y += canvas.height;
      ctx.globalAlpha = s.a;
      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  };
  draw();
}

// ===== ИСКРЫ МАНИФЕСТА: ореол вокруг планеты, широкий и тихий =====
const spark = document.getElementById('spark');
if (spark && !reduced) {
  const sctx = spark.getContext('2d');
  let parts = [];
  // колокол вокруг центра: широко, но без углов
  const randX = () => {
    const cx = spark.width / 2;
    const spread = spark.width * 0.8;
    return cx + (Math.random() + Math.random() - 1) * (spread / 2);
  };
  const smake = () => {
    spark.width = spark.offsetWidth;
    spark.height = spark.offsetHeight;
    parts = Array.from({ length: 42 }, () => ({
      x: randX(),
      y: spark.height * 0.35 + Math.random() * spark.height * 0.65,
      v: 0.3 + Math.random() * 0.9,
      r: 0.6 + Math.random() * 1.6,
      a: 0.12 + Math.random() * 0.38,
      f: Math.random() * Math.PI * 2,
    }));
  };
  smake();
  addEventListener('resize', smake);
  const sdraw = () => {
    sctx.clearRect(0, 0, spark.width, spark.height);
    for (const p of parts) {
      p.y -= p.v;
      p.f += 0.05;
      if (p.y < -10) { p.y = spark.height + 10; p.x = randX(); }
      sctx.globalAlpha = p.a * (0.8 + 0.2 * Math.sin(p.f));
      sctx.fillStyle = '#9FE8FF';
      sctx.beginPath();
      sctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      sctx.fill();
    }
    requestAnimationFrame(sdraw);
  };
  sdraw();
}

// ===== ПОЯВЛЕНИЕ БЛОКОВ ПРИ СКРОЛЛЕ =====
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.18 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// ===== ВИДЕО В ОКНАХ: старт при попадании в кадр, пауза вне =====
document.querySelectorAll('video[data-autoplay]').forEach((v) => {
  if (reduced) return;
  const vio = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
  }, { threshold: 0.35 });
  vio.observe(v);
});

console.log('%c UNIVERSE ONLINE ', 'background:#050B14;color:#6FE3FF;font-weight:bold');