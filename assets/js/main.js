// Вселенная онлайн: preloader, видео-луп, звёзды, искры манифеста, reveal.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== PRELOADER =====
const pre = document.getElementById('preloader');
if (pre) {
  if (sessionStorage.getItem('universeSeen')) {
    pre.remove();
  } else {
    const hide = () => {
      pre.classList.add('is-hidden');
      sessionStorage.setItem('universeSeen', '1');
    };
    window.addEventListener('load', () => setTimeout(hide, 1400));
    setTimeout(hide, 4500);
  }
}

// ===== HERO-ВИДЕО =====
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

// ===== ИСКРЫ МАНИФЕСТА (всплывают над секцией) =====
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

console.log('%c UNIVERSE ONLINE ', 'background:#050B14;color:#6FE3FF;font-weight:bold');