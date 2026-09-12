/* =========================================================
   VECTOR SIMULATION: basics
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
      id: "basics",
      label: "ভেক্টর পরিচিতি",
      maxExtent: 8,
      extent: (v, c) => v.r * 1.15,
      controls: [
        { key: "r", label: "Magnitude (r)", min: 1, max: 100, step: 0.5, value: 5, unit: " units" },
        { key: "theta", label: "Direction (θ)", min: 0, max: 360, step: 1, value: 40, unit: "°" },
      ],
      legend: [{ label: "Vector V", color: COL.A }],
      note:
        "ভেক্টরের মান মানে তার দৈর্ঘ্য (কত বড়), আর দিক হলো ধনাত্মক x-অক্ষ (পূর্ব) থেকে ঘড়ির কাঁটার বিপরীতে মাপা কোণ θ। দুটো slider-ই টেনে দেখো — ভেক্টরের মাথা r ব্যাসার্ধের একটা বৃত্ত ধরে ঘোরে।",
      compute(v) {
        const x = v.r * Math.cos(toRad(v.theta));
        const y = v.r * Math.sin(toRad(v.theta));
        return { x, y };
      },
      draw(ctx, origin, scale, v, c) {
        drawAngleArc(ctx, origin, scale, 0, v.theta, 1.2, COL.ghost, "θ");
        drawArrow(ctx, origin, scale, 0, 0, c.x, c.y, COL.A, 3.5);
        drawLabel(ctx, origin, scale, c.x, c.y, "V", COL.A, 10, -10);
      },
      formula() {
        return `
          <div class="f-main">V = (r cosθ, r sinθ)</div>
          <div class="f-sub">|V| = r &nbsp;·&nbsp; direction = θ from +x axis</div>`;
      },
      readout(v, c) {
        return [
          { label: "r (magnitude)", value: fmt(v.r) },
          { label: "θ (angle)", value: fmt(v.theta, 1) + "°" },
          { label: "Vx", value: fmt(c.x), hl: true },
          { label: "Vy", value: fmt(c.y), hl: true },
        ];
      },
    }
  );
})();
