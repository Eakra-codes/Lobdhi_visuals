/* =========================================================
   VECTOR SIMULATION: riverboat
   ========================================================= */
(() => {
  "use strict";
  const L = window.Lobdhi;
  const {
    toRad, toDeg, norm360, fmt,
    worldToCanvas, drawArrow, drawLabel, drawAngleArc, drawAngleArcAt,
    COL
  } = L;

  const topic =
{
      id: "riverboat",
      hideGrid: true,
      label: "নদী ও নৌকা — আপেক্ষিক বেগ",
      maxExtent: 14,
      riverWidthMeters: 100,
      controls: [
        { key: "currentSpeed", label: "River relative to Earth vᵣ→ₑ", min: 0, max: 100, step: 0.1, value: 3.0, unit: " m/s" },
        { key: "boatSpeed", label: "Boat relative to River vᵦ→ᵣ", min: 0, max: 100, step: 0.1, value: 3.9, unit: " m/s" },
        { key: "aimAngle", label: "Aim Direction θ", min: -90, max: 90, step: 1, value: 0, unit: "°" },
      ],
      _state: {
        running: false,
        finished: false,
        elapsed: 0,
        x: 0,
        y: 0,
        animationSpeed: 1,
        showVectors: false,
        showResultant: true,
        trajectory: [{ x: 0, y: 0 }],
        lastFrame: null,
        message: "",
      },
      legend: [],
      note:
        "নৌকার Earth-এর সাপেক্ষে প্রকৃত বেগ হলো vᵦ→ₑ = vᵦ→ᵣ + vᵣ→ₑ। 0° মানে সোজা North, ঋণাত্মক কোণ West of North এবং ধনাত্মক কোণ East of North। Animation Speed শুধু playback দ্রুত/ধীর করে; velocity-এর হিসাব বদলায় না।",
      compute(v) {
        const theta = toRad(v.aimAngle);
        const vxBoat = v.boatSpeed * Math.sin(theta);
        const vyBoat = v.boatSpeed * Math.cos(theta);
        const vxRiver = v.currentSpeed;
        const vyRiver = 0;
        const wx = vxRiver + vxBoat;
        const wy = vyBoat;
        const w = Math.hypot(wx, wy);
        const directionFromNorth = toDeg(Math.atan2(wx, wy));
        const crossingTime = wy > 1e-8 ? this.riverWidthMeters / wy : Infinity;
        const drift = Number.isFinite(crossingTime) ? wx * crossingTime : Infinity;
        return {
          vxBoat, vyBoat, vxRiver, vyRiver, wx, wy, w,
          directionFromNorth, crossingTime, drift,
          boatX: this._state.x,
          boatY: this._state.y,
        };
      },
      draw(ctx, origin, scale, v, c) {
        const W = origin.x * 2;
        const H = origin.y * 2;
        const s = this._state;
        const riverTop = 88;
        const riverBottom = H - 72;
        const riverHeight = Math.max(120, riverBottom - riverTop);
        const meterScale = riverHeight / this.riverWidthMeters;
        const startX = W / 2;

        const boatPX = startX + c.boatX * meterScale;
        const boatPY = riverBottom - c.boatY * meterScale;

        // full scene background
        ctx.save();
        ctx.fillStyle = "#0b0b0d";
        ctx.fillRect(0, 0, W, H);

        // top information band and banks
        ctx.fillStyle = "rgba(255,212,0,0.09)";
        ctx.fillRect(0, 0, W, riverTop);
        ctx.fillRect(0, riverBottom, W, H - riverBottom);

        // river
        const grad = ctx.createLinearGradient(0, riverTop, 0, riverBottom);
        grad.addColorStop(0, "#3146d8");
        grad.addColorStop(1, "#2638bf");
        ctx.fillStyle = grad;
        ctx.fillRect(0, riverTop, W, riverHeight);

        // bank lines
        ctx.strokeStyle = "rgba(255,212,0,0.85)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, riverTop);
        ctx.lineTo(W, riverTop);
        ctx.moveTo(0, riverBottom);
        ctx.lineTo(W, riverBottom);
        ctx.stroke();

        // water marks drifting visually toward East
        const phase = (s.elapsed * Math.max(v.currentSpeed, 0.35) * 18) % 84;
        ctx.strokeStyle = "rgba(8,12,40,0.62)";
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        for (let row = 0, y = riverTop + 30; y < riverBottom - 18; row++, y += 48) {
          for (let x = -70 + phase + (row % 2) * 37; x < W + 70; x += 92) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + 7, y - 7, x + 14, y);
            ctx.quadraticCurveTo(x + 21, y + 7, x + 28, y);
            ctx.quadraticCurveTo(x + 35, y - 7, x + 42, y);
            ctx.stroke();
          }
        }

        // header labels
        ctx.fillStyle = "rgba(255,255,255,0.94)";
        ctx.font = "700 15px 'Rajdhani', 'Hind Siliguri', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`Time = ${fmt(s.elapsed, 2)} s`, W / 2, 28);
        ctx.font = "600 13px 'JetBrains Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillStyle = COL.B;
        ctx.fillText(`vᵣ→ₑ = ${fmt(v.currentSpeed, 1)} m/s East`, 18, 56);
        ctx.textAlign = "right";
        ctx.fillStyle = COL.unit;
        ctx.fillText(`vᵦ→ᵣ = ${fmt(v.boatSpeed, 1)} m/s`, W - 18, 56);

        // North indicator
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(255,255,255,0.88)";
        ctx.font = "600 12px 'JetBrains Mono', monospace";
        ctx.fillText("N", 21, riverTop + 24);
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(26, riverTop + 58);
        ctx.lineTo(26, riverTop + 31);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(26, riverTop + 27);
        ctx.lineTo(21, riverTop + 36);
        ctx.lineTo(31, riverTop + 36);
        ctx.closePath();
        ctx.fill();

        // trajectory — supports direction changes while running
        if (s.trajectory.length > 1) {
          ctx.strokeStyle = "rgba(255,255,255,0.55)";
          ctx.lineWidth = 2;
          ctx.setLineDash([7, 6]);
          ctx.beginPath();
          s.trajectory.forEach((p, i) => {
            const px = startX + p.x * meterScale;
            const py = riverBottom - p.y * meterScale;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // destination marker once the boat reaches the opposite bank
        if (s.finished) {
          ctx.fillStyle = COL.A;
          ctx.beginPath();
          ctx.arc(boatPX, riverTop, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // pixel-space arrow helper
        const arrowPx = (x0, y0, x1, y1, color, label, width = 3) => {
          const dx = x1 - x0, dy = y1 - y0;
          const len = Math.hypot(dx, dy);
          if (len < 1) return;
          const a = Math.atan2(dy, dx);
          ctx.save();
          ctx.strokeStyle = color;
          ctx.fillStyle = color;
          ctx.lineWidth = width;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
          const hl = 10 + width;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x1 - hl * Math.cos(a - Math.PI / 7), y1 - hl * Math.sin(a - Math.PI / 7));
          ctx.lineTo(x1 - hl * Math.cos(a + Math.PI / 7), y1 - hl * Math.sin(a + Math.PI / 7));
          ctx.closePath();
          ctx.fill();
          if (label) {
            ctx.font = "700 12px 'JetBrains Mono', monospace";
            ctx.fillText(label, x1 + 8, y1 - 7);
          }
          ctx.restore();
        };

        // velocity triangle near the moving boat
        if (s.showVectors) {
          const vectorScale = 20;
          const p0 = { x: boatPX, y: boatPY };
          const p1 = {
            x: p0.x + c.vxBoat * vectorScale,
            y: p0.y - c.vyBoat * vectorScale,
          };
          const p2 = {
            x: p1.x + c.vxRiver * vectorScale,
            y: p1.y,
          };
          arrowPx(p0.x, p0.y, p1.x, p1.y, COL.unit, "vᵦ→ᵣ", 3);
          arrowPx(p1.x, p1.y, p2.x, p2.y, COL.B, "vᵣ→ₑ", 3);
          if (s.showResultant) arrowPx(p0.x, p0.y, p2.x, p2.y, COL.R, "vᵦ→ₑ", 4);
        }

        // boat: its nose follows AIM direction, not the resultant path
        ctx.save();
        ctx.translate(boatPX, boatPY);
        ctx.rotate(toRad(v.aimAngle));
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.quadraticCurveTo(11, -8, 10, 15);
        ctx.quadraticCurveTo(0, 21, -10, 15);
        ctx.quadraticCurveTo(-11, -8, 0, -18);
        ctx.closePath();
        ctx.fillStyle = "#f4f3ee";
        ctx.strokeStyle = "rgba(10,10,10,0.8)";
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#16171b";
        ctx.fillRect(-5, -4, 10, 11);
        ctx.fillStyle = COL.A;
        ctx.fillRect(-3, -12, 6, 5);
        ctx.restore();

        // aim direction label
        const absAim = Math.abs(v.aimAngle);
        let aimText = "0° (North)";
        if (v.aimAngle < 0) aimText = `${fmt(absAim, 0)}° West of North`;
        if (v.aimAngle > 0) aimText = `${fmt(absAim, 0)}° East of North`;
        ctx.textAlign = "left";
        ctx.font = "600 12.5px 'Inter', 'Hind Siliguri', sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.86)";
        ctx.fillText(`Aim: ${aimText}`, 18, H - 28);

        // live resultant summary
        if (s.showResultant) {
          const d = c.directionFromNorth;
          let dirText = "0° N";
          if (Math.abs(d) >= 0.005) dirText = `${fmt(Math.abs(d), 2)}° ${d > 0 ? "E of N" : "W of N"}`;
          ctx.textAlign = "right";
          ctx.fillStyle = COL.R;
          ctx.font = "700 13px 'JetBrains Mono', monospace";
          ctx.fillText(`vᵦ→ₑ = ${fmt(c.w, 2)} m/s @ ${dirText}`, W - 18, H - 28);
        }

        // status / edge-case message
        if (s.message) {
          ctx.textAlign = "center";
          ctx.font = "600 13px 'Inter', sans-serif";
          ctx.fillStyle = s.finished ? COL.unit : COL.A;
          ctx.fillText(s.message, W / 2, 76);
        }
        ctx.restore();
      },
      formula() {
        return `
          <div class="f-main">vᵦ→ₑ = vᵦ→ᵣ + vᵣ→ₑ</div>
          <div class="f-sub">vₓ = vᵣ→ₑ + vᵦ→ᵣ sinθ</div>
          <div class="f-sub">vᵧ = vᵦ→ᵣ cosθ &nbsp;·&nbsp; |v| = √(vₓ² + vᵧ²)</div>
          <div class="f-sub">direction = atan2(vₓ, vᵧ), measured from North</div>`;
      },
      readout(v, c) {
        const s = this._state;
        const out = [
          { label: "Time", value: fmt(s.elapsed, 2) + " s" },
          { label: "River vᵣ→ₑ", value: fmt(v.currentSpeed, 1) + " m/s" },
          { label: "Boat vᵦ→ᵣ", value: fmt(v.boatSpeed, 1) + " m/s" },
          { label: "Aim θ", value: fmt(v.aimAngle, 0) + "°" },
        ];
        if (s.showResultant) {
          const d = c.directionFromNorth;
          let dir = "0° N";
          if (Math.abs(d) >= 0.005) dir = `${fmt(Math.abs(d), 2)}° ${d > 0 ? "E of N" : "W of N"}`;
          out.push({ label: "Resultant |vᵦ→ₑ|", value: fmt(c.w, 2) + " m/s", hl: true });
          out.push({ label: "Direction", value: dir, hl: true });
        }
        out.push({
          label: "Crossing time",
          value: Number.isFinite(c.crossingTime) ? fmt(c.crossingTime, 2) + " s" : "∞",
        });
        return out;
      },
    };

  /* =========================================================
     RIVER BOAT — UI + ANIMATION RUNTIME
     This stays inside the Vector chapter section.
     ========================================================= */
  let riverboatRAF = null;
  let runtimeApi = null;

  function startRiverboat() {
    const s = topic._state;
    if (s.finished) resetRiverboat(false);

    const values = {};
    topic.controls.forEach((c) => (values[c.key] = c.value));
    const computed = topic.compute(values);

    if (computed.wy <= 1e-8) {
      s.running = false;
      s.message = "The boat has no northward velocity and cannot reach the opposite bank.";
      if (runtimeApi) runtimeApi.runSim(topic);
      return;
    }

    s.message = "";
    s.running = true;
    s.lastFrame = performance.now();
    if (riverboatRAF === null) riverboatRAF = requestAnimationFrame(riverboatLoop);
    if (runtimeApi) runtimeApi.runSim(topic);
  }

  function pauseRiverboat(redraw = true) {
    const s = topic._state;
    s.running = false;
    s.lastFrame = null;
    if (redraw && runtimeApi) runtimeApi.runSim(topic);
  }

  function resetRiverboat(redraw = true) {
    const s = topic._state;
    s.running = false;
    s.finished = false;
    s.elapsed = 0;
    s.x = 0;
    s.y = 0;
    s.lastFrame = null;
    s.message = "";
    s.trajectory = [{ x: 0, y: 0 }];
    if (redraw && runtimeApi) runtimeApi.runSim(topic);
  }

  function riverboatLoop(timestamp) {
    const s = topic._state;

    if (!s.running) {
      riverboatRAF = null;
      return;
    }

    const realDt = Math.min(0.05, Math.max(0, (timestamp - (s.lastFrame ?? timestamp)) / 1000));
    s.lastFrame = timestamp;

    const values = {};
    topic.controls.forEach((c) => (values[c.key] = c.value));
    const c = topic.compute(values);

    if (c.wy <= 1e-8) {
      s.running = false;
      s.message = "The boat has no northward velocity and cannot reach the opposite bank.";
    } else {
      const requestedDt = realDt * s.animationSpeed;
      const remainingNorth = Math.max(0, topic.riverWidthMeters - s.y);
      const maxDtToBank = remainingNorth / c.wy;
      const dt = Math.min(requestedDt, maxDtToBank);

      s.x += c.wx * dt;
      s.y += c.wy * dt;
      s.elapsed += dt;

      const last = s.trajectory[s.trajectory.length - 1];
      if (!last || Math.hypot(s.x - last.x, s.y - last.y) >= 0.35 || dt === maxDtToBank) {
        s.trajectory.push({ x: s.x, y: s.y });
        if (s.trajectory.length > 1200) s.trajectory.shift();
      }

      if (remainingNorth <= 1e-8 || requestedDt >= maxDtToBank - 1e-10) {
        s.y = topic.riverWidthMeters;
        const finalPoint = s.trajectory[s.trajectory.length - 1];
        if (!finalPoint || finalPoint.x !== s.x || finalPoint.y !== s.y) {
          s.trajectory.push({ x: s.x, y: s.y });
        }
        s.running = false;
        s.finished = true;
        s.message = `Opposite bank reached in ${fmt(s.elapsed, 2)} s`;
      }
    }

    if (runtimeApi) runtimeApi.runSim(topic);

    if (s.running) riverboatRAF = requestAnimationFrame(riverboatLoop);
    else riverboatRAF = null;
  }

  topic.buildControls = function buildRiverboatControls(api) {
    runtimeApi = api;
    const { controlsHost, setControl, runSim } = api;
    const s = topic._state;

    const speedBlock = document.createElement("div");
    speedBlock.className = "riverboat-special-controls";
    speedBlock.innerHTML = `
      <div class="riverboat-control-section">
        <div class="riverboat-control-title">Animation Speed</div>
        <div class="animation-speed-row">
          <span>slow</span>
          <input id="riverAnimSpeed" type="range" min="0.25" max="3" step="0.25" value="${s.animationSpeed}">
          <span>fast</span>
        </div>
        <div class="animation-speed-value" id="riverAnimSpeedValue">${fmt(s.animationSpeed, 2)}× playback</div>
      </div>
    `;
    controlsHost.appendChild(speedBlock);

    const animInput = speedBlock.querySelector("#riverAnimSpeed");
    const animValue = speedBlock.querySelector("#riverAnimSpeedValue");
    animInput.addEventListener("input", () => {
      s.animationSpeed = parseFloat(animInput.value);
      animValue.textContent = `${fmt(s.animationSpeed, 2)}× playback`;
    });

    topic.controls.forEach((cfg) => {
      const row = document.createElement("div");
      row.className = "control-row riverboat-control-row";
      row.innerHTML = `
        <label>${cfg.label}</label>
        <div class="range-number-row">
          <input class="river-range" type="range" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${cfg.value}">
          <input class="river-number" type="number" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${cfg.value}" aria-label="${cfg.label}">
          <span class="river-unit">${cfg.unit}</span>
        </div>
        ${cfg.key === "aimAngle" ? '<div class="aim-scale"><span>−90° West</span><span>0° North</span><span>+90° East</span></div>' : ''}
      `;

      const range = row.querySelector(".river-range");
      const number = row.querySelector(".river-number");
      cfg._input = range;
      cfg._numberInput = number;
      cfg._valSpan = null;

      const updateFrom = (raw) => {
        const n = parseFloat(raw);
        if (!Number.isFinite(n)) return;
        setControl(topic, cfg.key, n);
        runSim(topic);
      };

      range.addEventListener("input", () => updateFrom(range.value));
      number.addEventListener("input", () => updateFrom(number.value));
      controlsHost.appendChild(row);
    });

    const actions = document.createElement("div");
    actions.className = "riverboat-actions";
    actions.innerHTML = `
      <button type="button" class="river-action river-run">Run</button>
      <button type="button" class="river-action">Pause</button>
      <button type="button" class="river-action">Reset</button>
    `;
    const [runBtn, pauseBtn, resetBtn] = actions.querySelectorAll("button");
    runBtn.addEventListener("click", startRiverboat);
    pauseBtn.addEventListener("click", () => pauseRiverboat(true));
    resetBtn.addEventListener("click", () => resetRiverboat(true));
    controlsHost.appendChild(actions);

    const toggles = document.createElement("div");
    toggles.className = "riverboat-toggles";
    toggles.innerHTML = `
      <label class="control-toggle">
        <input id="showVelocityVectors" type="checkbox" ${s.showVectors ? "checked" : ""}>
        <span>Show Velocity Vectors</span>
      </label>
      <label class="control-toggle">
        <input id="showResultantVelocity" type="checkbox" ${s.showResultant ? "checked" : ""}>
        <span>Show vᵦ→ₑ</span>
      </label>
    `;

    toggles.querySelector("#showVelocityVectors").addEventListener("change", (e) => {
      s.showVectors = e.target.checked;
      runSim(topic);
    });

    toggles.querySelector("#showResultantVelocity").addEventListener("change", (e) => {
      s.showResultant = e.target.checked;
      runSim(topic);
    });

    controlsHost.appendChild(toggles);
  };

  topic.onLeave = function onLeaveRiverboat() {
    pauseRiverboat(false);
  };

  L.chapters.vector.push(topic);

})();
