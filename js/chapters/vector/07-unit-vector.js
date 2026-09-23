/* =========================================================
   VECTOR SIMULATION: unit
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
      id: "unit",
      label: "একক ভেক্টর",
      maxExtent: 8,
      extent: (v, c) => v.V * 1.15,
      controls: [
        { key: "V", label: "Magnitude (V)", min: 1, max: 100, step: 0.5, value: 5, unit: " units" },
        { key: "theta", label: "Direction (θ)", min: 0, max: 360, step: 1, value: 35, unit: "°" },
      ],
      legend: [
        { label: "Vector V", color: COL.A },
        { label: "Unit vector V̂ (length 1)", color: COL.unit },
      ],
      note:
        "একক ভেক্টরের দিক V-এর মতোই, কিন্তু মান সবসময় ১ — এটা যেন খাঁটি 'দিক'। যেকোনো ভেক্টর = তার মান × তার একক ভেক্টর: V = |V| · V̂। মান যত-ই বাড়াও, V̂ বদলায় না!",
      compute(v) {
        const x = v.V * Math.cos(toRad(v.theta));
        const y = v.V * Math.sin(toRad(v.theta));
        const ux = Math.cos(toRad(v.theta));
        const uy = Math.sin(toRad(v.theta));
        return { x, y, ux, uy };
      },
      draw(ctx, origin, scale, v, c) {
        drawArrow(ctx, origin, scale, 0, 0, c.x, c.y, COL.A, 3.5);
        drawLabel(ctx, origin, scale, c.x, c.y, "V", COL.A, 10, -10);
        drawArrow(ctx, origin, scale, 0, 0, c.ux, c.uy, COL.unit, 3.2);
        drawLabel(ctx, origin, scale, c.ux, c.uy, "V̂", COL.unit, 10, 14);
      },
      formula() {
        return `
          <div class="f-main">V̂ = V / |V| = (cosθ, sinθ)</div>
          <div class="f-sub">|V̂| = 1 always, regardless of |V|</div>`;
      },
      readout(v, c) {
        return [
          { label: "V", value: fmt(v.V), key: "V" },
          { label: "θ", value: fmt(v.theta, 1) + "°", key: "theta" },
          { label: "V̂x", value: fmt(c.ux), hl: true },
          { label: "V̂y", value: fmt(c.uy), hl: true },
          { label: "|V̂|", value: "1.00" },
        ];
      },
    }
  );
})();