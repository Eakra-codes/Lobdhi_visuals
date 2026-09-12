/* =========================================================
   VECTOR SIMULATION: rain
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
      id: "rain",
      label: "ছাতা ও বৃষ্টি — আপেক্ষিক বেগ",
      maxExtent: 9,
      extent: (v, c) => Math.max(c.rel * 1.2, v.manSpeed * 2.4),
      controls: [
        { key: "rainSpeed", label: "বৃষ্টির বেগ vᵣ (খাড়া নিচে)", min: 1, max: 100, step: 0.5, value: 6, unit: " units/s" },
        { key: "manSpeed", label: "মানুষের বেগ vₘ (সামনে)", min: 0, max: 100, step: 0.5, value: 3, unit: " units/s" },
      ],
      legend: [
        { label: "vᵣ = বৃষ্টির বেগ", color: COL.B },
        { label: "vₘ = মানুষের বেগ", color: COL.unit },
        { label: "v_আপেক্ষিক = মানুষের সাপেক্ষে বৃষ্টি", color: COL.R },
      ],
      note:
        "মানুষ সামনে হাঁটলে বৃষ্টিকে মনে হয় সামনে-উপর থেকে তেড়ে আসছে — কারণ মানুষের সাপেক্ষে বৃষ্টির বেগ v_আপেক্ষিক = vᵣ − vₘ। তাই ছাতা হেলাতে হয় সামনের দিকে, খাড়া (উল্লম্ব) থেকে θ কোণে, যেখানে tanθ = vₘ/vᵣ। জোরে হাঁটলে ছাতা বেশি হেলাতে হয় — হাতল টেনে নিজেই পরখ করো!",
      compute(v) {
        const theta = toDeg(Math.atan2(v.manSpeed, v.rainSpeed));
        const rel = Math.hypot(v.manSpeed, v.rainSpeed);
        return { theta, rel };
      },
      draw(ctx, origin, scale, v, c) {
        const W = origin.x * 2;
        const H = origin.y * 2;
        const Ex = origin.x / scale;
        const Ey = origin.y / scale;
        const tilt = toRad(c.theta);

        // ground
        const gY = worldToCanvas(0, -Ey * 0.55, origin, scale).y;
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, gY);
        ctx.lineTo(W, gY);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "600 12px 'Hind Siliguri', sans-serif";
        ctx.fillText("মাটি", W - 46, gY + 18);
        ctx.restore();

        // apparent rain streaks (slanted at θ toward the man)
        ctx.save();
        ctx.strokeStyle = "rgba(107,208,255,0.4)";
        ctx.lineWidth = 1.5;
        const L = 26;
        const dx = -Math.sin(tilt) * L;
        const dy = Math.cos(tilt) * L;
        for (let sx = 20; sx < W; sx += 46) {
          for (let sy = 16; sy < gY - 40; sy += 60) {
            const jx = ((sx * 13 + sy * 7) % 17) - 8;
            ctx.beginPath();
            ctx.moveTo(sx + jx, sy);
            ctx.lineTo(sx + jx + dx, sy + dy);
            ctx.stroke();
          }
        }
        ctx.restore();

        // man with umbrella
        const manW = { x: -Ex * 0.42, y: -Ey * 0.55 };
        const mp = worldToCanvas(manW.x, manW.y, origin, scale);
        ctx.save();
        ctx.translate(mp.x, mp.y);
        // body
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(0, -52);          // torso
        ctx.moveTo(0, -22);
        ctx.lineTo(-9, 0);           // legs
        ctx.moveTo(0, -22);
        ctx.lineTo(9, 0);
        ctx.moveTo(0, -46);
        ctx.lineTo(14, -58);         // arm holding umbrella
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -60, 7, 0, Math.PI * 2);   // head
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fill();
        // umbrella (tilted θ forward)
        ctx.translate(14, -58);
        ctx.rotate(tilt);
        ctx.strokeStyle = "#c9a86a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 6);
        ctx.lineTo(0, -26);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -26, 30, Math.PI, 0);
        // scalloped edge
        ctx.arc(20, -26, 10, 0, Math.PI, true);
        ctx.arc(0, -26, 10, 0, Math.PI, true);
        ctx.arc(-20, -26, 10, 0, Math.PI, true);
        ctx.closePath();
        ctx.fillStyle = COL.A;
        ctx.strokeStyle = "rgba(0,0,0,0.45)";
        ctx.lineWidth = 1.4;
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // vₘ vector at the man (draggable)
        // vₘ vector at the man (small gap from body)
const vmGap = 22 / scale;

const vmStartX = manW.x + vmGap;
const vmY = manW.y + 30 / scale;

const vmEndX = vmStartX + v.manSpeed;

drawArrow(
  ctx,
  origin,
  scale,
  vmStartX,
  vmY,
  vmEndX,
  vmY,
  COL.unit,
  3.4
);

drawLabel(
  ctx,
  origin,
  scale,
  vmEndX,
  vmY,
  "vₘ",
  COL.unit,
  10,
  -8
);

        // velocity diagram on the right: v_r down, then −vₘ, resultant = v_rel
        const P = { x: Ex * 0.4, y: Ey * 0.55 };
        drawArrow(ctx, origin, scale, P.x, P.y, P.x, P.y - v.rainSpeed, COL.B, 3.4);
        drawLabel(ctx, origin, scale, P.x, P.y - v.rainSpeed / 2, "vᵣ", COL.B, 10, 4);
        drawArrow(ctx, origin, scale, P.x, P.y - v.rainSpeed, P.x - v.manSpeed, P.y - v.rainSpeed, "#ff6b6b", 2.6, true);
        drawLabel(ctx, origin, scale, P.x - v.manSpeed, P.y - v.rainSpeed, "−vₘ", "#ff6b6b", -34, -8);
        drawArrow(ctx, origin, scale, P.x, P.y, P.x - v.manSpeed, P.y - v.rainSpeed, COL.R, 4);
        drawLabel(ctx, origin, scale, P.x - v.manSpeed / 2, P.y - v.rainSpeed / 2, "v_আপেক্ষিক", COL.R, -84, -6);
        drawAngleArc(ctx, worldToCanvas(P.x, P.y, origin, scale), scale, 270, 270 - c.theta, Math.min(v.rainSpeed, c.rel) * 0.32, "rgba(255,255,255,0.55)", "θ");
      },
      handles(v, c) {
        const scale = window.__lobdhiScale || 28;
        const origin = window.__lobdhiOrigin || { x: 320, y: 260 };
        const Ex = origin.x / scale;
        const Ey = origin.y / scale;
        const P = { x: Ex * 0.4, y: Ey * 0.55 };
        const manW = {
  x: -Ex * 0.42,
  y: -Ey * 0.55 + 30 / scale
};

const vmGap = 22 / scale;
const vmStartX = manW.x + vmGap;

return [
  {
    x: P.x,
    y: P.y - v.rainSpeed,
    apply(wx, wy, set) {
      set("rainSpeed", P.y - wy);
    }
  },

  {
    x: vmStartX + v.manSpeed,
    y: manW.y,
    apply(wx, wy, set) {
      set("manSpeed", wx - vmStartX);
    }
  },
];
      },
      formula() {
        return `
          <div class="f-main">v_আপেক্ষিক = vᵣ − vₘ</div>
          <div class="f-sub">tanθ = vₘ / vᵣ &nbsp;(খাড়া থেকে ছাতার হেলানো কোণ)</div>
          <div class="f-sub">|v_আপেক্ষিক| = √(vᵣ² + vₘ²)</div>`;
      },
      readout(v, c) {
        return [
          { label: "vᵣ (বৃষ্টি)", value: fmt(v.rainSpeed) },
          { label: "vₘ (মানুষ)", value: fmt(v.manSpeed) },
          { label: "θ (ছাতার হেলা)", value: fmt(c.theta, 1) + "°", hl: true },
          { label: "|v_আপেক্ষিক|", value: fmt(c.rel), hl: true },
        ];
      },
    }
  );
})();
