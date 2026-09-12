/* =========================================================
   LOBDHI VISUALS — SITE UI
   Navbar, year and ambient background.
   ========================================================= */
(() => {
  "use strict";

  const L = window.Lobdhi;
  const { $, $$, toRad } = L;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* =========================================================
     NAVBAR
     ========================================================= */
  const navbar = $("#navbar");
  const navLinks = $("#navLinks");
  const navToggle = $("#navToggle");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 8);
  });

  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    navToggle.classList.toggle("open");
  });

  $$(".nav-link").forEach((l) =>
    l.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.classList.remove("open");
    })
  );

  /* =========================================================
     AMBIENT BACKGROUND VECTOR FIELD
     ========================================================= */
  (function ambientField() {
    const canvas = $("#bg-field");
    const ctx = canvas.getContext("2d");
    let W, H, particles;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      const count = Math.round((W * H) / 32000);
      particles = Array.from({ length: Math.min(count, 60) }, () => spawn());
    }

    function spawn() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        angle: Math.random() * Math.PI * 2,
        len: 14 + Math.random() * 22,
        speed: 0.15 + Math.random() * 0.35,
        drift: (Math.random() - 0.5) * 0.004,
        alpha: 0.05 + Math.random() * 0.12,
      };
    }

    function step() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.angle += p.drift;
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        if (p.x < -40) p.x = W + 40;
        if (p.x > W + 40) p.x = -40;
        if (p.y < -40) p.y = H + 40;
        if (p.y > H + 40) p.y = -40;

        const x1 = p.x + Math.cos(p.angle) * p.len;
        const y1 = p.y + Math.sin(p.angle) * p.len;

        ctx.strokeStyle = `rgba(255,212,0,${p.alpha})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(x1, y1);
        ctx.stroke();

        const ah = toRad(150);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - 6 * Math.cos(p.angle - ah), y1 - 6 * Math.sin(p.angle - ah));
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - 6 * Math.cos(p.angle + ah), y1 - 6 * Math.sin(p.angle + ah));
        ctx.stroke();
      });
      requestAnimationFrame(step);
    }

    window.addEventListener("resize", resize);
    resize();
    step();
  })();
})();
