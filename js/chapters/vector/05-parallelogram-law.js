/* =========================================================
   VECTOR SIMULATION: parallelogram
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
      id: "parallelogram",
      label: "ভেক্টর যোগের সামান্তরিক সূত্র",
      maxExtent: 12,
      extent: (v, c) => Math.max(v.A, v.B, c.R) * 1.18,
      controls: [
        { key: "A", label: "Magnitude A", min: 1, max: 100, step: 0.5, value: 4, unit: " units" },
        { key: "thetaA", label: "Direction of A", min: 0, max: 360, step: 1, value: 15, unit: "°" },
        { key: "B", label: "Magnitude B", min: 1, max: 100, step: 0.5, value: 3.5, unit: " units" },
        { key: "thetaB", label: "Direction of B", min: 0, max: 360, step: 1, value: 90, unit: "°" },
      ],
      legend: [
        { label: "Vector A & B (from origin)", color: COL.A },
        { label: "Parallelogram sides", color: COL.ghost },
        { label: "Diagonal = Resultant R", color: COL.R },
      ],
      note:
        "একই বিন্দু থেকে A ও B আঁকো, তারপর সামান্তরিকটা পূর্ণ করো। ওই একই বিন্দু থেকে টানা কর্ণটাই লব্ধি R — জ্যামিতিকভাবে ত্রিভুজ সূত্রের উত্তরের সাথে হুবহু এক।",
      compute(v) {
        const ax = v.A * Math.cos(toRad(v.thetaA));
        const ay = v.A * Math.sin(toRad(v.thetaA));
        const bx = v.B * Math.cos(toRad(v.thetaB));
        const by = v.B * Math.sin(toRad(v.thetaB));
        const Rx = ax + bx;
        const Ry = ay + by;
        let theta = v.thetaB - v.thetaA;
        theta = Math.abs(((theta + 180) % 360 + 360) % 360 - 180);
        return { ax, ay, bx, by, Rx, Ry, R: Math.hypot(Rx, Ry), thetaR: toDeg(Math.atan2(Ry, Rx)), theta };
      },
      draw(ctx, origin, scale, v, c) {
        drawArrow(ctx, origin, scale, 0, 0, c.ax, c.ay, COL.A, 3.5);
        drawLabel(ctx, origin, scale, c.ax, c.ay, "A", COL.A, 8, -10);
        drawArrow(ctx, origin, scale, 0, 0, c.bx, c.by, COL.B, 3.5);
        drawLabel(ctx, origin, scale, c.bx, c.by, "B", COL.B, 8, -10);
        // completing sides (ghost)
        drawArrow(ctx, origin, scale, c.ax, c.ay, c.Rx, c.Ry, COL.ghost, 1.4, true);
        drawArrow(ctx, origin, scale, c.bx, c.by, c.Rx, c.Ry, COL.ghost, 1.4, true);
        // diagonal / resultant
        drawArrow(ctx, origin, scale, 0, 0, c.Rx, c.Ry, COL.R, 3.8);
        drawLabel(ctx, origin, scale, c.Rx, c.Ry, "R", COL.R, 10, -12);
      },
      formula() {
        return `
          <div class="f-main">R = √(A² + B² + 2AB cosθ)</div>
          <div class="f-sub">θ = angle between A and B &nbsp;·&nbsp; tanα = (B sinθ)/(A + B cosθ)</div>`;
      },
      readout(v, c) {
        return [
          { label: "A", value: fmt(v.A), key: "A" },
          { label: "θA", value: fmt(v.thetaA, 1) + "°", key: "thetaA" },
          { label: "B", value: fmt(v.B), key: "B" },
          { label: "θB", value: fmt(v.thetaB, 1) + "°", key: "thetaB" },
          { label: "θ (between)", value: fmt(c.theta, 1) + "°" },
          { label: "R (diagonal)", value: fmt(c.R), hl: true },
        ];
      },
    }
  );
})();