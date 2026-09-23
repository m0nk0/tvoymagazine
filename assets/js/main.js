// Вселенная онлайн: прелоадер v2 (warp + портал), hero-видео с акцент-паузой,
// звёзды, искры манифеста, reveal, автоплей видео в окнах по видимости
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

// ===== HERO-ВИДЕО: старт после прелоадера + акцент-пауза на фигуре + заморозка =====
const HERO_HOLD_AT   = 3;    // секунда видео с фигурой создателя
const HERO_HOLD_MS   = 3000; // длительность акцент-паузы
const HERO_FREEZE_AT = 10;   // финальная заморозка навсегда
const video = document.getElementById('heroVideo');
if (video && !reduced) {
  video.loop = false;
  let frozen = false, holding = false, holdDone = false, started = false, heroVisible = true;
  const play = () => { if (!frozen && !holding && heroVisible && !document.hidden) video.play().catch(() => {}); };
  const freeze = () => { frozen = true; video.pause(); };

  const start = () => { if (started) return; started = true; play(); };
  onUniverseReady(() => {
    if (matchMedia('(pointer: fine)').matches) start();
    else addEventListener('touchstart', start, { once: true });
  });

  video.addEventListener('timeupdate', () => {
    // акцент-пауза — ровно ОДИН раз, иначе момент проскакивает рывками
    if (!holdDone && video.currentTime >= HERO_HOLD_AT) {
      holdDone = true;
      holding = true;
      video.pause();
      setTimeout(() => { holding = false; play(); }, HERO_HOLD_MS);
      return;
    }
    if (!frozen && video.currentTime >= HERO_FREEZE_AT) freeze();
  });
  video.addEventListener('ended', freeze);

  new IntersectionObserver((es) => {
    heroVisible = es[0].isIntersecting;
    heroVisible ? play() : video.pause();
  }, { threshold: 0.25 }).observe(video);
  document.addEventListener('visibilitychange', () => {
    document.hidden ? video.pause() : play();
  });
}

// ===== ИСКРЫ МАНИФЕСТА =====
const spark = document.getElementById('spark');
if (spark && !reduced) {
  const sctx = spark.getContext('2d');
  let parts = [];
  const smake = () => {
    spark.width = spark.offsetWidth;
    spark.height = spark.offsetHeight;
    parts = Array.from({ length: 42 }, () => ({
      x: Math.random() * spark.width,
      y: spark.height + Math.random() * spark.height,
      v: 0.3 + Math.random() * 0.9,
      r: 0.6 + Math.random() * 1.6,
      a: 0.2 + Math.random() * 0.6,
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
      if (p.y < -10) { p.y = spark.height + 10; p.x = Math.random() * spark.width; }
      sctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(p.f));
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