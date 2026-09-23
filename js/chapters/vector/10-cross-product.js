/* =========================================================
   VECTOR SIMULATION: cross
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
      id: "cross",
      label: "ক্রস গুণ (ভেক্টর গুণফল)",
      maxExtent: 8,
      extent: (v, c) => Math.max(v.A, v.B, Math.hypot(v.A + c.bx, c.by)) * 1.2,
      controls: [
        { key: "A", label: "মান A", min: 1, max: 100, step: 0.5, value: 5, unit: " units" },
        { key: "B", label: "মান B", min: 1, max: 100, step: 0.5, value: 4, unit: " units" },
        { key: "theta", label: "মাঝের কোণ θ", min: 0, max: 180, step: 1, value: 60, unit: "°" },
      ],
      legend: [
        { label: "ভেক্টর A", color: COL.A },
        { label: "ভেক্টর B", color: COL.B },
        { label: "সামান্তরিকের ক্ষেত্রফল = |A×B|", color: COL.R },
      ],
      note:
        "ক্রস গুণের ফল একটা ভেক্টর: |A×B| = ABsinθ — এটা ঠিক A ও B দিয়ে গড়া সামান্তরিকের ক্ষেত্রফলের সমান! দিক ঠিক হয় ডান-হাতি নিয়মে: A থেকে B-এর দিকে আঙুল গোটালে বুড়ো আঙুল যেদিকে দেখায় (এখানে পর্দার বাইরের দিকে, ⊙)। θ = 0° বা 180° হলে ফল শূন্য — সমান্তরাল ভেক্টরের ক্রস গুণ হয় না।",
      compute(v) {
        const th = toRad(v.theta);
        const bx = v.B * Math.cos(th);
        const by = v.B * Math.sin(th);
        return { bx, by, cross: v.A * v.B * Math.sin(th) };
      },
      draw(ctx, origin, scale, v, c) {
        // shaded parallelogram
        const O = worldToCanvas(0, 0, origin, scale);
        const pA = worldToCanvas(v.A, 0, origin, scale);
        const pAB = worldToCanvas(v.A + c.bx, c.by, origin, scale);
        const pB = worldToCanvas(c.bx, c.by, origin, scale);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(O.x, O.y);
        ctx.lineTo(pA.x, pA.y);
        ctx.lineTo(pAB.x, pAB.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.closePath();
        ctx.fillStyle = "rgba(255,138,61,0.16)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,138,61,0.5)";
        ctx.lineWidth = 1.4;
        ctx.setLineDash([6, 5]);
        ctx.stroke();
        ctx.restore();
        // vectors
        drawArrow(ctx, origin, scale, 0, 0, v.A, 0, COL.A, 3.6);
        drawLabel(ctx, origin, scale, v.A, 0, "A", COL.A, 10, 18);
        drawArrow(ctx, origin, scale, 0, 0, c.bx, c.by, COL.B, 3.6);
        drawLabel(ctx, origin, scale, c.bx, c.by, "B", COL.B, 10, -10);
        drawAngleArc(ctx, origin, scale, 0, v.theta, Math.min(v.A, v.B) * 0.3, "rgba(255,255,255,0.55)", "θ");
        // area label at parallelogram centre
        const cx = (O.x + pAB.x) / 2, cy = (O.y + pAB.y) / 2;
        ctx.save();
        ctx.font = "600 13px 'Hind Siliguri', sans-serif";
        ctx.fillStyle = COL.R;
        ctx.textAlign = "center";
        ctx.fillText(`ক্ষেত্রফল = ${fmt(c.cross)}`, cx, cy);
        // direction symbol (out of the page)
        ctx.textAlign = "left";
        ctx.beginPath();
        ctx.arc(34, 34, 11, 0, Math.PI * 2);
        ctx.strokeStyle = COL.R;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(34, 34, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = COL.R;
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = "600 12.5px 'Hind Siliguri', sans-serif";
        ctx.fillText("A×B — পর্দার বাইরের দিকে", 52, 38);
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
          <div class="f-main">|A × B| = |A||B| sinθ</div>
          <div class="f-sub">= A ও B দিয়ে গড়া সামান্তরিকের ক্ষেত্রফল</div>
          <div class="f-sub">দিক: ডান-হাতি নিয়ম (A থেকে B-এর দিকে)</div>`;
      },
      readout(v, c) {
        return [
          { label: "A", value: fmt(v.A), key: "A" },
          { label: "B", value: fmt(v.B), key: "B" },
          { label: "θ", value: fmt(v.theta, 1) + "°", key: "theta" },
          { label: "|A×B|", value: fmt(c.cross), hl: true },
          { label: "দিক", value: v.theta % 180 === 0 ? "—" : "⊙ বাইরে" },
        ];
      },
    }
  );
})();