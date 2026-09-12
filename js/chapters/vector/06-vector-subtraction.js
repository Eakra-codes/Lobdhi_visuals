/* =========================================================
   VECTOR SIMULATION: subtraction
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
      id: "subtraction",
      label: "ভেক্টর বিয়োগ",
      maxExtent: 12,
      extent: (v, c) => Math.max(v.A, v.B, c.D) * 1.18,
      controls: [
        { key: "A", label: "Magnitude A", min: 1, max: 100, step: 0.5, value: 5, unit: " units" },
        { key: "thetaA", label: "Direction of A", min: 0, max: 360, step: 1, value: 30, unit: "°" },
        { key: "B", label: "Magnitude B", min: 1, max: 100, step: 0.5, value: 4, unit: " units" },
        { key: "thetaB", label: "Direction of B", min: 0, max: 360, step: 1, value: 110, unit: "°" },
      ],
      legend: [
        { label: "Vector A", color: COL.A },
        { label: "Vector B", color: COL.B },
        { label: "−B (reversed)", color: COL.neg },
        { label: "D = A − B", color: COL.R },
      ],
      note:
        "B বিয়োগ করা মানে আসলে B-এর উল্টানো কপি (−B) যোগ করা — −B-এর দৈর্ঘ্য একই, শুধু দিক বিপরীত। A আঁকো, তারপর A-এর মাথা থেকে −B আঁকো — ত্রিভুজটা যে ভেক্টর পূর্ণ করে, সেটাই D = A − B।",
      compute(v) {
        const ax = v.A * Math.cos(toRad(v.thetaA));
        const ay = v.A * Math.sin(toRad(v.thetaA));
        const bx = v.B * Math.cos(toRad(v.thetaB));
        const by = v.B * Math.sin(toRad(v.thetaB));
        const Dx = ax - bx;
        const Dy = ay - by;
        return { ax, ay, bx, by, Dx, Dy, D: Math.hypot(Dx, Dy), thetaD: toDeg(Math.atan2(Dy, Dx)) };
      },
      draw(ctx, origin, scale, v, c) {
        drawArrow(ctx, origin, scale, 0, 0, c.ax, c.ay, COL.A, 3.5);
        drawLabel(ctx, origin, scale, c.ax, c.ay, "A", COL.A, 8, -10);
        drawArrow(ctx, origin, scale, 0, 0, c.bx, c.by, COL.B, 2.4, true);
        drawLabel(ctx, origin, scale, c.bx, c.by, "B", COL.B, 8, -10);
        // -B from tip of A
        drawArrow(ctx, origin, scale, c.ax, c.ay, c.ax - c.bx, c.ay - c.by, COL.neg, 3.2);
        drawLabel(ctx, origin, scale, c.ax - c.bx, c.ay - c.by, "−B", COL.neg, 8, -10);
        // D
        drawArrow(ctx, origin, scale, 0, 0, c.Dx, c.Dy, COL.R, 3.8);
        drawLabel(ctx, origin, scale, c.Dx, c.Dy, "D", COL.R, -20, 16);
      },
      formula() {
        return `
          <div class="f-main">D = A − B = A + (−B)</div>
          <div class="f-sub">Dx = Ax − Bx &nbsp; Dy = Ay − By &nbsp;·&nbsp; |D| = √(Dx² + Dy²)</div>`;
      },
      readout(v, c) {
        return [
          { label: "A, θA", value: `${fmt(v.A)}, ${fmt(v.thetaA, 1)}°` },
          { label: "B, θB", value: `${fmt(v.B)}, ${fmt(v.thetaB, 1)}°` },
          { label: "D (difference)", value: fmt(c.D), hl: true },
          { label: "θD (direction)", value: fmt(norm360(c.thetaD), 1) + "°", hl: true },
        ];
      },
    }
  );
})();
