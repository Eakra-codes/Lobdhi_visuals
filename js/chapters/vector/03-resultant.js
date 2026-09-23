/* =========================================================
   VECTOR SIMULATION: resultant
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
      id: "resultant",
      label: "দুটি ভেক্টরের লব্ধি",
      maxExtent: 12,
      extent: (v, c) => Math.max(v.A, v.B, c.R) * 1.18,
      controls: [
        { key: "A", label: "Magnitude A", min: 1, max: 100, step: 0.5, value: 4, unit: " units" },
        { key: "B", label: "Magnitude B", min: 1, max: 100, step: 0.5, value: 3, unit: " units" },
        { key: "alpha", label: "Angle between A & B (α)", min: 0, max: 180, step: 1, value: 60, unit: "°" },
      ],
      legend: [
        { label: "Vector A", color: COL.A },
        { label: "Vector B", color: COL.B },
        { label: "Resultant R", color: COL.R },
      ],
      note:
        "এটা বিশ্লেষণী পদ্ধতি: স্কেল দিয়ে এঁকে মাপার দরকার নেই — A, B আর মাঝের কোণ α সরাসরি সূত্রে বসালেই লব্ধি R আর তার দিক β পাওয়া যায়। α = 0° হলে R সর্বোচ্চ (A+B), α = 180° হলে সর্বনিম্ন (A−B)।",
      compute(v) {
        const rad = toRad(v.alpha);
        const R = Math.sqrt(v.A * v.A + v.B * v.B + 2 * v.A * v.B * Math.cos(rad));
        const beta = toDeg(Math.atan2(v.B * Math.sin(rad), v.A + v.B * Math.cos(rad)));
        const bx = v.B * Math.cos(rad);
        const by = v.B * Math.sin(rad);
        return { R, beta, bx, by };
      },
      draw(ctx, origin, scale, v, c) {
        // A along +x from origin
        drawArrow(ctx, origin, scale, 0, 0, v.A, 0, COL.A, 3.5);
        drawLabel(ctx, origin, scale, v.A, 0, "A", COL.A, 6, -12);
        // B tip-to-tail from tip of A
        drawArrow(ctx, origin, scale, v.A, 0, v.A + c.bx, c.by, COL.B, 3.5);
        drawLabel(ctx, origin, scale, v.A + c.bx, c.by, "B", COL.B, 8, -8);
        // resultant
        drawArrow(ctx, origin, scale, 0, 0, v.A + c.bx, c.by, COL.R, 3.8);
        drawLabel(ctx, origin, scale, v.A + c.bx, c.by, "R", COL.R, -22, 18);
        // angles
     drawAngleArc(ctx, origin, scale, 0, c.beta, 1.0, COL.R, "β");
        
        // alpha arc drawn at the joint (tail of B) between direction of A and direction of B
        drawAngleArcAt(ctx, { x: origin.x + v.A * scale, y: origin.y }, 0, v.alpha, 0.9, COL.B, "α");
      },
      formula() {
        return `
          <div class="f-main">R = √(A² + B² + 2AB cosα)</div>
          <div class="f-sub">tanβ = (B sinα) / (A + B cosα)</div>`;
      },
      readout(v, c) {
        return [
          { label: "A", value: fmt(v.A), key: "A" },
          { label: "B", value: fmt(v.B), key: "B" },
          { label: "α (between)", value: fmt(v.alpha, 1) + "°", key: "alpha" },
          { label: "R (resultant)", value: fmt(c.R), hl: true },
          { label: "β (from A)", value: fmt(c.beta, 1) + "°", hl: true },
        ];
      },
    }
  );
})();