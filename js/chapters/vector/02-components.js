/* =========================================================
   VECTOR SIMULATION: components
   ========================================================= */
(() => {
  "use strict";
  const L = window.Lobdhi;
  const {
    toRad, toDeg, norm360, fmt,
    worldToCanvas, drawArrow, drawLabel, drawAngleArc, drawAngleArcAt,
    COL
  } = L;

  L.chapters.vector.push(
{
      id: "components",
      label: "ভেক্টরের উপাংশ",
      maxExtent: 8,
      extent: (v, c) => v.V * 1.15,
      controls: [
        { key: "V", label: "Magnitude (V)", min: 1, max: 100, step: 0.5, value: 6, unit: " units" },
        { key: "theta", label: "Direction (θ)", min: 0, max: 360, step: 1, value: 55, unit: "°" },
      ],
      legend: [
        { label: "Vector V", color: COL.A },
        { label: "Vx component", color: COL.B },
        { label: "Vy component", color: COL.R },
      ],
      note:
        "যেকোনো ভেক্টরকে একটা অনুভূমিক অংশ (Vx) আর একটা উল্লম্ব অংশে (Vy) ভাঙা যায়। এই দুটোকে মাথায়-লেজ মিলিয়ে যোগ করলে আবার V-ই পাওয়া যায় — তাই ড্যাশ করা অভিক্ষেপ রেখা দুটো একটা সমকোণী ত্রিভুজ তৈরি করে।",
      compute(v) {
        const x = v.V * Math.cos(toRad(v.theta));
        const y = v.V * Math.sin(toRad(v.theta));
        return { x, y, mag: Math.hypot(x, y) };
      },
      draw(ctx, origin, scale, v, c) {
        drawArrow(ctx, origin, scale, c.x, 0, c.x, c.y, "rgba(255,255,255,0.25)", 1.2, true);
        drawArrow(ctx, origin, scale, 0, c.y, c.x, c.y, "rgba(255,255,255,0.25)", 1.2, true);
        drawArrow(ctx, origin, scale, 0, 0, c.x, 0, COL.B, 3);
        drawArrow(ctx, origin, scale, 0, 0, 0, c.y, COL.R, 3);
        drawArrow(ctx, origin, scale, 0, 0, c.x, c.y, COL.A, 3.5);
        drawLabel(ctx, origin, scale, c.x, c.y, "V", COL.A, 10, -10);
        drawLabel(ctx, origin, scale, c.x, 0, "Vx", COL.B, 6, c.y >= 0 ? 18 : -8);
        drawLabel(ctx, origin, scale, 0, c.y, "Vy", COL.R, -26, c.y >= 0 ? -8 : 18);
      },
      formula() {
        return `
          <div class="f-main">Vx = V cosθ &nbsp; Vy = V sinθ</div>
          <div class="f-sub">Check: V = √(Vx² + Vy²)</div>`;
      },
      readout(v, c) {
        return [
          { label: "V", value: fmt(v.V), key: "V" },
          { label: "θ", value: fmt(v.theta, 1) + "°", key: "theta" },
          { label: "Vx", value: fmt(c.x), hl: true },
          { label: "Vy", value: fmt(c.y), hl: true },
        ];
      },
    }
  );
})();