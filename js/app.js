/* =========================================================
   LOBDHI VISUALS — APP / LAB ENGINE
   Shared lab navigation, controls and simulation runner.
   ========================================================= */
(() => {
  "use strict";

  const L = window.Lobdhi;
  const {
    $, $$, fmt, fitCanvas, worldToCanvas, drawGrid
  } = L;

  const topics = L.chapters.vector;

  /* =========================================================
     LAB WIRING
     ========================================================= */
  const lab = $("#lab");
  const topicListEl = $("#topicList");
  const canvas = $("#simCanvas");
  const controlsHost = $("#controlsHost");
  const formulaHost = $("#formulaHost");
  const readoutHost = $("#readoutHost");
  const noteHost = $("#noteHost");
  const legendHost = $("#canvasLegend");
  const labTopicTitle = $("#labTopicTitle");
  const workspace = $(".workspace");

  let currentIndex = 0;

  // build topic nav once
  topics.forEach((t, i) => {
    const btn = document.createElement("button");
    btn.className = "topic-btn";
    btn.innerHTML = `<span class="num">${String(i + 1).padStart(2, "0")}</span><span class="label">${t.label}</span>`;
    btn.addEventListener("click", () => switchTopic(i));
    topicListEl.appendChild(btn);
  });

  function buildControls(topic) {
    controlsHost.innerHTML = "";

    // Clear old DOM references before rebuilding the panel.
    topic.controls.forEach((cfg) => {
      cfg._input = null;
      cfg._numberInput = null;
      cfg._valSpan = null;
    });

    if (typeof topic.buildControls === "function") {
      topic.buildControls({ controlsHost, setControl, runSim, fmt });
      return;
    }

    topic.controls.forEach((cfg) => {
      const row = document.createElement("div");
      row.className = "control-row";
      row.innerHTML = `
        <label>${cfg.label} <span class="val">${fmt(cfg.value, cfg.step < 1 ? 2 : (Number.isInteger(cfg.step) ? 0 : 1))}${cfg.unit}</span></label>
        <input type="range" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${cfg.value}">
      `;
      const input = row.querySelector("input");
      const valSpan = row.querySelector(".val");
      cfg._input = input;
      cfg._valSpan = valSpan;
      input.addEventListener("input", () => {
        cfg.value = parseFloat(input.value);
        valSpan.textContent = `${fmt(cfg.value, cfg.step < 1 ? 2 : (Number.isInteger(cfg.step) ? 0 : 1))}${cfg.unit}`;
        runSim(topic);
      });
      controlsHost.appendChild(row);
    });
  }

  function runSim(topic) {
    const values = {};
    topic.controls.forEach((c) => (values[c.key] = c.value));

    const { ctx, W, H } = fitCanvas(canvas);
    const computed = topic.compute(values);
    const dynamicExtent = topic.extent ? topic.extent(values, computed) : 0;
    const extent = Math.max(topic.maxExtent, dynamicExtent);
    const scale = (Math.min(W, H) / 2 - 46) / extent;
    window.__lobdhiScale = scale;
    const origin = { x: W / 2, y: H / 2 };
    window.__lobdhiOrigin = origin;

    ctx.clearRect(0, 0, W, H);
    if (!topic.hideGrid) drawGrid(ctx, W, H, origin, scale);
    topic.draw(ctx, origin, scale, values, computed);

    // draggable handles
    if (topic.handles) {
      topic.handles(values, computed).forEach((h) => {
        const p = worldToCanvas(h.x, h.y, origin, scale);
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,212,0,0.28)";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.stroke();
        ctx.restore();
      });
      canvas.style.cursor = "grab";
    } else {
      canvas.style.cursor = "default";
    }

    formulaHost.innerHTML = topic.formula(values, computed);
    readoutHost.innerHTML = topic
      .readout(values, computed)
      .map(
        (r) =>
          `<div class="readout-item"><div class="r-label">${r.label}</div><div class="r-value${r.hl ? " hl" : ""}">${r.value}</div></div>`
      )
      .join("");
    noteHost.textContent = topic.note;
    legendHost.innerHTML = topic.legend
      .map((l) => `<div class="legend-item"><span class="legend-swatch" style="background:${l.color}"></span>${l.label}</div>`)
      .join("");
  }

  function switchTopic(index) {
    const previousTopic = topics[currentIndex];
    const topic = topics[index];
    if (previousTopic && previousTopic !== topic && typeof previousTopic.onLeave === "function") {
      previousTopic.onLeave();
    }
    currentIndex = index;

    $$(".topic-btn", topicListEl).forEach((b, i) => b.classList.toggle("active", i === index));

    workspace.classList.add("fading");
    labTopicTitle.style.opacity = 0;

    setTimeout(() => {
      labTopicTitle.textContent = topic.label;
      labTopicTitle.style.opacity = 1;
      buildControls(topic);
      runSim(topic);
      workspace.classList.remove("fading");
    }, 180);
  }

  function openLab() {
    lab.hidden = false;
    switchTopic(currentIndex);
    requestAnimationFrame(() => {
      lab.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  $("#chapterVector").addEventListener("click", openLab);
  $("#labBack").addEventListener("click", () => {
    const currentTopic = topics[currentIndex];
    if (currentTopic && typeof currentTopic.onLeave === "function") currentTopic.onLeave();
    lab.hidden = true;
    $("#chapters").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* =========================================================
     CANVAS DRAG (interactive handles)
     ========================================================= */
  function setControl(topic, key, val) {
    const cfg = topic.controls.find((c) => c.key === key);
    if (!cfg) return;
    let x = Math.min(cfg.max, Math.max(cfg.min, val));
    x = Math.round((x - cfg.min) / cfg.step) * cfg.step + cfg.min;
    x = parseFloat(x.toFixed(4));
    cfg.value = x;
    if (cfg._input) cfg._input.value = x;
    if (cfg._numberInput) cfg._numberInput.value = x;
    if (cfg._valSpan) {
      cfg._valSpan.textContent = `${fmt(x, cfg.step < 1 ? 2 : (Number.isInteger(cfg.step) ? 0 : 1))}${cfg.unit}`;
    }
  }

  function pointerWorld(e) {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const scale = window.__lobdhiScale || 28;
    const or = window.__lobdhiOrigin || { x: rect.width / 2, y: rect.height / 2 };
    return { wx: (px - or.x) / scale, wy: (or.y - py) / scale };
  }

  function currentHandles(topic) {
    const values = {};
    topic.controls.forEach((c) => (values[c.key] = c.value));
    const computed = topic.compute(values);
    return topic.handles(values, computed);
  }

  let activeHandleIndex = null;

  canvas.addEventListener("pointerdown", (e) => {
    const topic = topics[currentIndex];
    if (lab.hidden || !topic.handles) return;
    const { wx, wy } = pointerWorld(e);
    const scale = window.__lobdhiScale || 28;
    const pickR = 20 / scale;
    let best = null;
    let bestD = pickR;
    currentHandles(topic).forEach((h, i) => {
      const d = Math.hypot(h.x - wx, h.y - wy);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best !== null) {
      activeHandleIndex = best;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
      e.preventDefault();
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (activeHandleIndex === null) return;
    const topic = topics[currentIndex];
    const { wx, wy } = pointerWorld(e);
    const hs = currentHandles(topic);
    const h = hs[activeHandleIndex];
    if (!h) return;
    h.apply(wx, wy, (key, val) => setControl(topic, key, val));
    runSim(topic);
    e.preventDefault();
  });

  ["pointerup", "pointercancel"].forEach((ev) =>
    canvas.addEventListener(ev, () => {
      activeHandleIndex = null;
      const topic = topics[currentIndex];
      canvas.style.cursor = topic.handles ? "grab" : "default";
    })
  );
  canvas.style.touchAction = "none";

  /* =========================================================
     START BUTTON — reveal chapters on click
     ========================================================= */
  const chaptersSection = $("#chapters");
  function revealChapters() {
    chaptersSection.hidden = false;
    requestAnimationFrame(() => {
      chaptersSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  const startBtn = $("#startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      revealChapters();
    });
  }
  $$('a[href="#chapters"]').forEach((a) => {
    if (a === startBtn) return;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      revealChapters();
    });
  });

  window.addEventListener("resize", () => {
    if (!lab.hidden) runSim(topics[currentIndex]);
  });

})();
