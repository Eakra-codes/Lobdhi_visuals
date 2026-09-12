/* =========================================================
   VECTOR SIMULATION: dot
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
      id: "dot",
      label: "ডট গুণ (স্কেলার গুণফল)",
      maxExtent: 8,
      extent: (v, c) => Math.max(v.A, v.B) * 1.25,
      controls: [
        { key: "A", label: "মান A", min: 1, max: 100, step: 0.5, value: 5, unit: " units" },
        { key: "B", label: "মান B", min: 1, max: 100, step: 0.5, value: 4, unit: " units" },
        { key: "theta", label: "মাঝের কোণ θ", min: 0, max: 180, step: 1, value: 50, unit: "°" },
      ],
      legend: [
        { label: "ভেক্টর A", color: COL.A },
        { label: "ভেক্টর B", color: COL.B },
        { label: "B-এর অভিক্ষেপ = B cosθ", color: COL.R },
      ],
      note:
        "ডট গুণের ফল একটা স্কেলার (শুধু সংখ্যা): A·B = ABcosθ। θ < 90° হলে ফল ধনাত্মক, θ = 90° হলে শূন্য (লম্ব ভেক্টর!), আর θ > 90° হলে ঋণাত্মক। আসল রহস্য হলো অভিক্ষেপ — A-এর দিকে B-এর 'ছায়া' Bcosθ, সেটাকেই A দিয়ে গুণ করা হয়। হাতল টেনে θ = 90° বানিয়ে দেখো!",
      compute(v) {
        const th = toRad(v.theta);
        const bx = v.B * Math.cos(th);
        const by = v.B * Math.sin(th);
        return { bx, by, proj: bx, dot: v.A * v.B * Math.cos(th) };
      },
      draw(ctx, origin, scale, v, c) {
        // projection segment on A's line
        const pr0 = worldToCanvas(0, 0, origin, scale);
        const pr1 = worldToCanvas(c.proj, 0, origin, scale);
        ctx.save();
        ctx.strokeStyle = COL.R;
        ctx.lineWidth = 7;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(pr0.x, pr0.y);
        ctx.lineTo(pr1.x, pr1.y);
        ctx.stroke();
        ctx.restore();
        // dashed drop from B tip to the projection foot
        drawArrow(ctx, origin, scale, c.bx, c.by, c.proj, 0, "rgba(255,255,255,0.3)", 1.5, true);
        // vectors
        drawArrow(ctx, origin, scale, 0, 0, v.A, 0, COL.A, 3.6);
        drawLabel(ctx, origin, scale, v.A, 0, "A", COL.A, 10, -10);
        drawArrow(ctx, origin, scale, 0, 0, c.bx, c.by, COL.B, 3.6);
        drawLabel(ctx, origin, scale, c.bx, c.by, "B", COL.B, 10, -10);
        drawAngleArc(ctx, origin, scale, 0, v.theta, Math.min(v.A, v.B) * 0.3, "rgba(255,255,255,0.55)", "θ");
        ctx.save();
        ctx.font = "600 13px 'Hind Siliguri', 'JetBrains Mono', sans-serif";
        ctx.fillStyle = COL.R;
        ctx.fillText("B cosθ (অভিক্ষেপ)", pr1.x - 60, pr1.y + 26);
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "600 15px 'JetBrains Mono', monospace";
        ctx.fillText(`A·B = ${fmt(c.dot)}`, 20, 30);
        ctx.restore();
      },
      handles(v, c) {
        return [
          { x: v.A, y: 0, apply(wx, wy, set) { set("A", wx); } },
          {
            x: c.bx, y: c.by,
            apply(wx, wy, set) {
              set("B", Math.hypot(wx, wy));
              set("theta", toDeg(Math.atan2(wy, wx)));
            },
          },
        ];
      },
      formula() {
        return `
          <div class="f-main">A · B = |A||B| cosθ</div>
          <div class="f-sub">= A × (B cosθ) — মান দুটির গুণফল × cosθ</div>
          <div class="f-sub">ফলটি স্কেলার; θ = 90° হলে A·B = 0</div>`;
      },
      readout(v, c) {
        return [
          { label: "A", value: fmt(v.A) },
          { label: "B", value: fmt(v.B) },
          { label: "θ", value: fmt(v.theta, 1) + "°" },
          { label: "B cosθ", value: fmt(c.proj), hl: true },
          { label: "A·B", value: fmt(c.dot), hl: true },
        ];
      },
    }
  );
})();
