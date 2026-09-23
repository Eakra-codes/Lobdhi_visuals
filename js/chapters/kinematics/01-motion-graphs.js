/* =========================================================
   KINEMATICS SIMULATION: motion graphs (s–t, v–t, a–t)
   ========================================================= */
(() => {
  "use strict";
  const L = window.Lobdhi;
  const { fmt, drawPlot, COL } = L;

  const T_MAX = 10;        // every graph spans 0 → 10 s
  const SAMPLES = 160;

  L.chapters.kinematics.push(
    {
      id: "motion-graphs",
      label: "গতির লেখচিত্র (s–t, v–t, a–t)",
      hideGrid: true,
      maxExtent: 10,
      controls: [
        { key: "u", label: "আদিবেগ u", min: -20, max: 20, step: 0.5, value: 4, unit: " m/s" },
        { key: "a", label: "ত্বরণ a", min: -6, max: 6, step: 0.1, value: 1.5, unit: " m/s²" },
        { key: "t", label: "সময় t (চিহ্নিত মুহূর্ত)", min: 0, max: T_MAX, step: 0.1, value: 5, unit: " s" },
      ],
      legend: [
        { label: "সরণ s", color: COL.A },
        { label: "বেগ v", color: COL.B },
        { label: "ত্বরণ a", color: COL.R },
        { label: "v–t লেখের ছায়া অংশ = সরণ", color: "rgba(255,212,0,0.35)" },
      ],
      note:
        "তিনটে লেখচিত্র একসাথে দেখো। v–t লেখের ঢাল = ত্বরণ a, আর v–t লেখের নিচের ক্ষেত্রফল = সরণ s — ছায়া করা অংশটা ঠিক উপরের s–t লেখের চিহ্নিত মানের সমান। a ঋণাত্মক করলে v কমতে কমতে শূন্য পেরিয়ে ঋণাত্মক হয়, তখন বস্তু ফিরে আসতে শুরু করে আর s–t লেখ নামতে থাকে। a = 0 করলে v সমান্তরাল রেখা, s সরলরেখা — সমবেগ।",
      compute(v) {
        const vt = v.u + v.a * v.t;
        const st = v.u * v.t + 0.5 * v.a * v.t * v.t;

        const sPts = [];
        const vPts = [];
        const aPts = [];
        for (let i = 0; i <= SAMPLES; i++) {
          const tt = (T_MAX * i) / SAMPLES;
          sPts.push({ x: tt, y: v.u * tt + 0.5 * v.a * tt * tt });
          vPts.push({ x: tt, y: v.u + v.a * tt });
          aPts.push({ x: tt, y: v.a });
        }

        // v² = u² + 2as — shown as a cross-check
        const vSquared = v.u * v.u + 2 * v.a * st;

        return { vt, st, sPts, vPts, aPts, vSquared };
      },
      draw(ctx, origin, scale, v, c) {
        const W = origin.x * 2;
        const H = origin.y * 2;

        const mL = 58, mR = 16, mT = 26, mB = 30, gap = 36;
        const plotH = (H - mT - mB - gap * 2) / 3;
        const plotW = W - mL - mR;

        const boxAt = (i) => ({
          x: mL,
          y: mT + i * (plotH + gap),
          w: plotW,
          h: plotH,
        });

        // ---- s–t ----
        drawPlot(ctx, boxAt(0), {
          title: "সরণ–সময় (s–t)",
          yLabel: "s (m)",
          xMin: 0, xMax: T_MAX,
          series: [{ pts: c.sPts, color: COL.A, lw: 2.6 }],
          markers: [{ x: v.t, y: c.st, color: COL.A, label: fmt(c.st, 1) + " m" }],
        });

        // ---- v–t (with the area under the curve shaded up to t) ----
        drawPlot(ctx, boxAt(1), {
          title: "বেগ–সময় (v–t)  ·  ছায়া অংশের ক্ষেত্রফল = সরণ",
          yLabel: "v (m/s)",
          xMin: 0, xMax: T_MAX,
          series: [
            {
              pts: c.vPts,
              color: COL.B,
              lw: 2.6,
              fillTo: 0,
              fillColor: "rgba(255,212,0,0.22)",
              clipXMax: v.t,
            },
          ],
          markers: [{ x: v.t, y: c.vt, color: COL.B, label: fmt(c.vt, 1) + " m/s" }],
        });

        // ---- a–t ----
        drawPlot(ctx, boxAt(2), {
          title: "ত্বরণ–সময় (a–t)",
          yLabel: "a (m/s²)",
          xLabel: "t (s)",
          xMin: 0, xMax: T_MAX,
          yMin: Math.min(-1, v.a - 1.5),
          yMax: Math.max(1, v.a + 1.5),
          series: [{ pts: c.aPts, color: COL.R, lw: 2.6 }],
          markers: [{ x: v.t, y: v.a, color: COL.R }],
        });

        // vertical "current time" line across all three plots
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 1.3;
        ctx.setLineDash([5, 5]);
        const cx = mL + (v.t / T_MAX) * plotW;
        for (let i = 0; i < 3; i++) {
          const b = boxAt(i);
          ctx.beginPath();
          ctx.moveTo(cx, b.y);
          ctx.lineTo(cx, b.y + b.h);
          ctx.stroke();
        }
        ctx.restore();
      },
      formula() {
        return `
          <div class="f-main">v = u + at &nbsp;·&nbsp; s = ut + ½at²</div>
          <div class="f-sub">v–t লেখের ঢাল = a &nbsp;·&nbsp; v–t লেখের নিচের ক্ষেত্রফল = s</div>
          <div class="f-sub">সময় ছাড়া: v² = u² + 2as</div>`;
      },
      readout(v, c) {
        return [
          { label: "u (আদিবেগ)", value: fmt(v.u, 1), key: "u" },
          { label: "a (ত্বরণ)", value: fmt(v.a, 1), key: "a" },
          { label: "t (সময়)", value: fmt(v.t, 1), key: "t" },
          { label: "v = u + at", value: fmt(c.vt, 2) + " m/s", hl: true },
          { label: "s = ut + ½at²", value: fmt(c.st, 2) + " m", hl: true },
          { label: "√(u² + 2as)", value: fmt(Math.sqrt(Math.abs(c.vSquared)), 2) + " m/s" },
        ];
      },
    }
  );
})();