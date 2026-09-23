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
  /* =========================================================
     drawPlot — 2D graph helper (axes, grid, curves, shading)

     box : { x, y, w, h }   plotting rectangle in canvas pixels
     cfg : {
       title, xLabel, yLabel,
       xMin, xMax, yMin, yMax,        // yMin/yMax auto from series if omitted
       xTicks = 5, yTicks = 4,
       series: [ { pts: [{x,y}...], color, lw, dashed,
                   fillTo: <number|null>, fillColor,
                   clipXMax: <number|null> } ],
       markers: [ { x, y, color, label } ]
     }

     Returns { px, py } so callers can place extra things on the plot.
     ========================================================= */
  L.drawPlot = function drawPlot(ctx, box, cfg) {
    const { x, y, w, h } = box;
    const fmt = L.fmt;
    const series = cfg.series || [];

    const xMin = cfg.xMin ?? 0;
    const xMax = cfg.xMax ?? 1;

    let yMin = cfg.yMin;
    let yMax = cfg.yMax;
    if (yMin === undefined || yMax === undefined) {
      let lo = 0;
      let hi = 0;
      series.forEach((s) =>
        (s.pts || []).forEach((p) => {
          if (p.y < lo) lo = p.y;
          if (p.y > hi) hi = p.y;
        })
      );
      if (hi - lo < 1e-9) { hi = lo + 1; }
      const pad = (hi - lo) * 0.12;
      if (yMin === undefined) yMin = lo - pad;
      if (yMax === undefined) yMax = hi + pad;
    }

    const spanX = xMax - xMin || 1;
    const spanY = yMax - yMin || 1;
    const px = (vx) => x + ((vx - xMin) / spanX) * w;
    const py = (vy) => y + h - ((vy - yMin) / spanY) * h;

    ctx.save();

    // panel background
    ctx.fillStyle = "rgba(255,255,255,0.025)";
    ctx.fillRect(x, y, w, h);

    // grid
    const xTicks = cfg.xTicks ?? 5;
    const yTicks = cfg.yTicks ?? 4;
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.font = "10.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(255,255,255,0.4)";

    for (let i = 0; i <= xTicks; i++) {
      const vx = xMin + (spanX * i) / xTicks;
      const cx = px(vx);
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(cx, y + h);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillText(fmt(vx, spanX >= 5 ? 0 : 1), cx, y + h + 13);
    }
    for (let i = 0; i <= yTicks; i++) {
      const vy = yMin + (spanY * i) / yTicks;
      const cy = py(vy);
      ctx.beginPath();
      ctx.moveTo(x, cy);
      ctx.lineTo(x + w, cy);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(fmt(vy, spanY >= 20 ? 0 : 1), x - 7, cy + 3.5);
    }

    // zero line
    if (yMin < 0 && yMax > 0) {
      ctx.strokeStyle = "rgba(255,255,255,0.32)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x, py(0));
      ctx.lineTo(x + w, py(0));
      ctx.stroke();
    }

    // frame
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x, y, w, h);

    // shaded fills first, so curves stay on top
    series.forEach((s) => {
      if (s.fillTo === undefined || s.fillTo === null) return;
      const pts = (s.pts || []).filter(
        (p) => s.clipXMax === undefined || s.clipXMax === null || p.x <= s.clipXMax
      );
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(px(pts[0].x), py(s.fillTo));
      pts.forEach((p) => ctx.lineTo(px(p.x), py(p.y)));
      ctx.lineTo(px(pts[pts.length - 1].x), py(s.fillTo));
      ctx.closePath();
      ctx.fillStyle = s.fillColor || "rgba(255,212,0,0.18)";
      ctx.fill();
    });

    // curves
    series.forEach((s) => {
      const pts = s.pts || [];
      if (pts.length < 2) return;
      ctx.save();
      ctx.strokeStyle = s.color || "#ffd400";
      ctx.lineWidth = s.lw || 2.4;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      if (s.dashed) ctx.setLineDash([6, 5]);
      ctx.beginPath();
      pts.forEach((p, i) => {
        const cx = px(p.x);
        const cy = py(p.y);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();
      ctx.restore();
    });

    // markers
    (cfg.markers || []).forEach((m) => {
      const cx = px(m.x);
      const cy = py(m.y);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = m.color || "#ffffff";
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.stroke();
      if (m.label) {
        ctx.fillStyle = m.color || "#ffffff";
        ctx.font = "600 11.5px 'JetBrains Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText(m.label, cx + 9, cy - 7);
      }
    });

    // title and axis labels
    if (cfg.title) {
      ctx.fillStyle = "rgba(255,255,255,0.82)";
      ctx.font = "600 12.5px 'Hind Siliguri', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(cfg.title, x, y - 7);
    }
    if (cfg.xLabel) {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(cfg.xLabel, x + w, y + h + 25);
    }
    if (cfg.yLabel) {
      ctx.save();
      ctx.translate(x - 42, y + h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(cfg.yLabel, 0, 0);
      ctx.restore();
    }

    ctx.restore();
    return { px, py };
  };
})();