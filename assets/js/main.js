// Вселенная онлайн: прелоадер v2 (warp + портал), hero-видео, звёзды,
// искры манифеста, reveal, автоплей видео в окнах по видимости
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== PRELOADER v2: WARP-ПОЛЁТ + КОЛЬЦО-ПОРТАЛ =====
const pre = document.getElementById('preloader');
if (pre) {
  if (sessionStorage.getItem('universeSeen')) {
    pre.remove();
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
    };
    window.addEventListener('load', () => setTimeout(hide, 3200));
    setTimeout(hide, 6500);
  }
}

// ===== HERO-ВИДЕО: desktop сам, mobile — по первому касанию =====
const video = document.getElementById('heroVideo');
if (video && !reduced) {
  if (matchMedia('(pointer: fine)').matches) {
    video.play().catch(() => {});
  } else {
    const start = () => video.play().catch(() => {});
    addEventListener('touchstart', start, { once: true });
    addEventListener('scroll', start, { once: true });
  }
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