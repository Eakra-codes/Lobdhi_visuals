/* =========================================================
   LOBDHI VISUALS — CORE FOUNDATION
   Shared utilities and design constants.
   ========================================================= */
(() => {
  "use strict";

  const L = (window.Lobdhi = window.Lobdhi || {});

  L.$ = (sel, ctx = document) => ctx.querySelector(sel);
  L.$$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  L.toRad = (deg) => (deg * Math.PI) / 180;
  L.toDeg = (rad) => (rad * 180) / Math.PI;
  L.norm360 = (deg) => ((deg % 360) + 360) % 360;
  L.fmt = (n, d = 2) => (Math.abs(n) < 1e-9 ? 0 : n).toFixed(d);

  L.COL = {
    A: "#ffd400",
    B: "#6bd0ff",
    R: "#ff8a3d",
    ghost: "rgba(255,255,255,0.35)",
    neg: "#ff6b6b",
    unit: "#8affc1",
  };

  L.chapters = L.chapters || {};
})();
