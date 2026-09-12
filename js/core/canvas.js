/* =========================================================
   LOBDHI VISUALS — CANVAS ENGINE
   Shared canvas drawing helpers used by all chapters.
   ========================================================= */
(() => {
  "use strict";

  const L = window.Lobdhi;
  const { toRad } = L;

  L.fitCanvas = function fitCanvas(canvas) {
    const ratio = window.devicePixelRatio || 1;
    const cssWidth = canvas.parentElement.clientWidth - 28;
    const cssHeight = cssWidth * (520 / 640);
    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";
    canvas.width = Math.round(cssWidth * ratio);
    canvas.height = Math.round(cssHeight * ratio);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx, W: cssWidth, H: cssHeight };
  };

  L.worldToCanvas = function worldToCanvas(x, y, origin, scale) {
    return { x: origin.x + x * scale, y: origin.y - y * scale };
  };

  L.drawGrid = function drawGrid(ctx, W, H, origin, scale) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.055)";
    ctx.lineWidth = 1;
    let unitStep = 1;
    const steps = [1, 2, 5, 10, 20, 50, 100];
    for (const st of steps) {
      if (st * scale >= 26) {
        unitStep = st;
        break;
      }
      unitStep = st;
    }
    const grid = unitStep * scale;
    const startX = origin.x % grid;
    for (let x = startX; x < W; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    const startY = origin.y % grid;
    for (let y = startY; y < H; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.26)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(W, origin.y);
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, H);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText("x", W - 16, origin.y - 8);
    ctx.fillText("y", origin.x + 8, 14);
    ctx.restore();
  };

  L.drawArrow = function drawArrow(ctx, origin, scale, x0, y0, x1, y1, color, lw = 3, dashed = false) {
    const p0 = L.worldToCanvas(x0, y0, origin, scale);
    const p1 = L.worldToCanvas(x1, y1, origin, scale);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    if (dashed) ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const headLen = 8 + lw * 1.6;
    if (Math.hypot(p1.x - p0.x, p1.y - p0.y) > 2) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(
        p1.x - headLen * Math.cos(angle - Math.PI / 7),
        p1.y - headLen * Math.sin(angle - Math.PI / 7)
      );
      ctx.lineTo(
        p1.x - headLen * Math.cos(angle + Math.PI / 7),
        p1.y - headLen * Math.sin(angle + Math.PI / 7)
      );
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  L.drawLabel = function drawLabel(ctx, origin, scale, x, y, text, color, dx = 8, dy = -8) {
    const p = L.worldToCanvas(x, y, origin, scale);
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = "600 13px 'JetBrains Mono', monospace";
    ctx.fillText(text, p.x + dx, p.y + dy);
    ctx.restore();
  };

  L.drawAngleArc = function drawAngleArc(ctx, origin, scale, a1Deg, a2Deg, radiusUnits, color, label) {
    let diff = a2Deg - a1Deg;
    diff = ((diff + 180) % 360 + 360) % 360 - 180;
    const steps = 40;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const a = toRad(a1Deg + (diff * i) / steps);
      const x = origin.x + Math.cos(a) * radiusUnits * scale;
      const y = origin.y - Math.sin(a) * radiusUnits * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    if (label) {
      const mid = toRad(a1Deg + diff / 2);
      const lx = origin.x + Math.cos(mid) * (radiusUnits + 0.55) * scale;
      const ly = origin.y - Math.sin(mid) * (radiusUnits + 0.55) * scale;
      ctx.fillStyle = color;
      ctx.font = "600 12.5px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(label, lx, ly);
    }
    ctx.restore();
  };

  L.drawAngleArcAt = function drawAngleArcAt(ctx, anchor, a1Deg, a2Deg, radiusUnitsPx, color, label) {
    const scale = window.__lobdhiScale || 28;
    let diff = a2Deg - a1Deg;
    diff = ((diff + 180) % 360 + 360) % 360 - 180;
    const steps = 30;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const a = toRad(a1Deg + (diff * i) / steps);
      const x = anchor.x + Math.cos(a) * radiusUnitsPx * scale;
      const y = anchor.y - Math.sin(a) * radiusUnitsPx * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    if (label) {
      const mid = toRad(a1Deg + diff / 2);
      ctx.fillStyle = color;
      ctx.font = "600 12.5px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        label,
        anchor.x + Math.cos(mid) * (radiusUnitsPx + 0.5) * scale,
        anchor.y - Math.sin(mid) * (radiusUnitsPx + 0.5) * scale
      );
    }
    ctx.restore();
  };
})();
