/* =========================================================
   LOBDHI VISUALS — APP / LAB ENGINE
   Shared lab navigation, controls and simulation runner.

   Chapter-aware: any chapter registered in L.chapters and
   listed in CHAPTERS below gets its own card + topic list.
   ========================================================= */
(() => {
  "use strict";

  const L = window.Lobdhi;
  const {
    $, $$, fmt, fitCanvas, worldToCanvas, drawGrid
  } = L;

  /* =========================================================
     CHAPTER REGISTRY
     key     — the name used in L.chapters.<key>
     cardId  — the id of the chapter card in index.html
     eyebrow — small heading shown above the topic title
     ========================================================= */
  const CHAPTERS = [
    { key: "vector",     cardId: "chapterVector",     eyebrow: "অধ্যায় ০১ · ভেক্টর" },
    { key: "kinematics", cardId: "chapterKinematics", eyebrow: "অধ্যায় ০২ · গতিবিদ্যা" },
  ];

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
  const labChapterName = $("#labChapterName");
  const workspace = $(".workspace");

  let topics = [];
  let currentIndex = 0;

  /* number of decimals a control's value should be shown with */
  function decimalsFor(cfg) {
    return cfg.step < 1 ? 2 : (Number.isInteger(cfg.step) ? 0 : 1);
  }

  function currentTopic() {
    return topics[currentIndex] || null;
  }

  function leaveCurrentTopic() {
    const topic = currentTopic();
    if (topic && typeof topic.onLeave === "function") topic.onLeave();
  }

  function buildTopicNav() {
    topicListEl.innerHTML = "";
    topics.forEach((t, i) => {
      const btn = document.createElement("button");
      btn.className = "topic-btn";
      btn.innerHTML = `<span class="num">${String(i + 1).padStart(2, "0")}</span><span class="label">${t.label}</span>`;
      btn.addEventListener("click", () => switchTopic(i));
      topicListEl.appendChild(btn);
    });
  }

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
        <label>${cfg.label} <span class="val">${fmt(cfg.value, decimalsFor(cfg))}${cfg.unit}</span></label>
        <input type="range" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${cfg.value}">
      `;
      const input = row.querySelector("input");
      const valSpan = row.querySelector(".val");
      cfg._input = input;
      cfg._valSpan = valSpan;
      input.addEventListener("input", () => {
        cfg.value = parseFloat(input.value);
        valSpan.textContent = `${fmt(cfg.value, decimalsFor(cfg))}${cfg.unit}`;
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

    /* -------------------------------------------------------
       READOUT PANEL
       A readout item becomes an editable number box only when
       it carries a `key` that matches one of topic.controls.
       Derived values (R, θR, A·B …) stay read-only.
       ------------------------------------------------------- */
    readoutHost.innerHTML = topic
      .readout(values, computed)
      .map((r) => {
        const control = r.key ? topic.controls.find((c) => c.key === r.key) : null;

        if (control) {
          return `
            <div class="readout-item">
              <div class="r-label">${r.label}</div>
              <input
                class="value-input"
                type="number"
                value="${control.value}"
                min="${control.min}"
                max="${control.max}"
                step="${control.step}"
                data-key="${control.key}"
              >
            </div>`;
        }

        return `
          <div class="readout-item">
            <div class="r-label">${r.label}</div>
            <div class="r-value${r.hl ? " hl" : ""}">${r.value}</div>
          </div>`;
      })
      .join("");

    $$(".value-input", readoutHost).forEach((input) => {
      input.addEventListener("change", () => {
        const val = parseFloat(input.value);
        if (Number.isNaN(val)) {
          runSim(topic);   // blank / invalid entry: put the old value back
          return;
        }
        setControl(topic, input.dataset.key, val);
        runSim(topic);
      });
    });

    noteHost.textContent = topic.note;

    legendHost.innerHTML = topic.legend
      .map(
        (l) =>
          `<div class="legend-item"><span class="legend-swatch" style="background:${l.color}"></span>${l.label}</div>`
      )
      .join("");
  }

  function switchTopic(index) {
    const previousTopic = currentTopic();
    const topic = topics[index];
    if (!topic) return;
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

  /* =========================================================
     CHAPTER OPENING
     ========================================================= */
  function openChapter(chapter) {
    const list = L.chapters[chapter.key];
    if (!list || !list.length) return;

    leaveCurrentTopic();
    topics = list;
    currentIndex = 0;
    if (labChapterName) labChapterName.textContent = chapter.eyebrow;
    buildTopicNav();

    lab.hidden = false;
    switchTopic(0);
    requestAnimationFrame(() => {
      lab.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Wire up every chapter that actually has simulations loaded.
  CHAPTERS.forEach((chapter) => {
    const card = document.getElementById(chapter.cardId);
    if (!card) return;
    const list = L.chapters[chapter.key];
    if (!list || !list.length) return;   // still a placeholder chapter
    card.classList.remove("chapter-card--soon");
    card.removeAttribute("aria-disabled");
    card.addEventListener("click", () => openChapter(chapter));
  });

  $("#labBack").addEventListener("click", () => {
    leaveCurrentTopic();
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
      cfg._valSpan.textContent = `${fmt(x, decimalsFor(cfg))}${cfg.unit}`;
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
    const topic = currentTopic();
    if (lab.hidden || !topic || !topic.handles) return;
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
    const topic = currentTopic();
    if (!topic) return;
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
      const topic = currentTopic();
      canvas.style.cursor = topic && topic.handles ? "grab" : "default";
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
    const topic = currentTopic();
    if (!lab.hidden && topic) runSim(topic);
  });

})();