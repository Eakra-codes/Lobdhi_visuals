/* =========================================================
   VECTOR SIMULATION: triangle
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
      id: "triangle",
      label: "ভেক্টর যোগের ত্রিভুজ সূত্র",
      maxExtent: 12,
      extent: (v, c) => Math.max(v.A, v.B, c.R) * 1.18,
      controls: [
        { key: "A", label: "Magnitude A", min: 1, max: 100, step: 0.5, value: 4, unit: " units" },
        { key: "thetaA", label: "Direction of A", min: 0, max: 360, step: 1, value: 20, unit: "°" },
        { key: "B", label: "Magnitude B", min: 1, max: 100, step: 0.5, value: 3.5, unit: " units" },
        { key: "thetaB", label: "Direction of B", min: 0, max: 360, step: 1, value: 100, unit: "°" },
      ],
      legend: [
        { label: "Vector A", color: COL.A },
        { label: "Vector B (tail at tip of A)", color: COL.B },
        { label: "Resultant R (closes triangle)", color: COL.R },
      ],
      note:
        "প্রথমে A আঁকো। তারপর A-এর মাথা (শীর্ষ) থেকেই B আঁকো — B-এর নিজের দৈর্ঘ্য ও দিক ঠিক রেখে। A-এর শুরু থেকে B-এর মাথা পর্যন্ত টানা ভেক্টরটাই লব্ধি R — সেটাই ত্রিভুজটা পূর্ণ করে।",
      compute(v) {
        const ax = v.A * Math.cos(toRad(v.thetaA));
        const ay = v.A * Math.sin(toRad(v.thetaA));
        const bx = v.B * Math.cos(toRad(v.thetaB));
        const by = v.B * Math.sin(toRad(v.thetaB));
        const Rx = ax + bx;
        const Ry = ay + by;
        return { ax, ay, bx, by, Rx, Ry, R: Math.hypot(Rx, Ry), thetaR: toDeg(Math.atan2(Ry, Rx)) };
      },
      draw(ctx, origin, scale, v, c) {
        drawArrow(ctx, origin, scale, 0, 0, c.ax, c.ay, COL.A, 3.5);
        drawLabel(ctx, origin, scale, c.ax, c.ay, "A", COL.A, 8, -10);
        drawArrow(ctx, origin, scale, c.ax, c.ay, c.ax + c.bx, c.ay + c.by, COL.B, 3.5);
        drawLabel(ctx, origin, scale, c.ax + c.bx, c.ay + c.by, "B", COL.B, 8, -10);
        drawArrow(ctx, origin, scale, 0, 0, c.Rx, c.Ry, COL.R, 3.8);
        drawLabel(ctx, origin, scale, c.Rx, c.Ry, "R", COL.R, -22, 16);
      },
      formula() {
        return `
          <div class="f-main">R = A + B</div>
          <div class="f-sub">Rx = Ax + Bx &nbsp; Ry = Ay + By &nbsp;·&nbsp; |R| = √(Rx² + Ry²)</div>`;
      },
      readout(v, c) {
        return [
          { label: "A, θA", value: `${fmt(v.A)}, ${fmt(v.thetaA, 1)}°` },
          { label: "B, θB", value: `${fmt(v.B)}, ${fmt(v.thetaB, 1)}°` },
          { label: "R (resultant)", value: fmt(c.R), hl: true },
          { label: "θR (direction)", value: fmt(norm360(c.thetaR), 1) + "°", hl: true },
        ];
      },
    }
  );
})();
