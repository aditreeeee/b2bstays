/* Interactive SVG capability map + mobile accordion. Data: window.B2B_MODULES */
(function () {
  "use strict";
  var mods = window.B2B_MODULES;
  var svgHost = document.getElementById("mapSvgHost");
  var panel = document.getElementById("mapDetail");
  var acc = document.getElementById("mapAccordion");
  if (!mods || !svgHost) return;

  var NS = "http://www.w3.org/2000/svg";
  var CX = 500, CY = 350, RX = 365, RY = 255, W = 214, H = 62;

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- SVG ---------- */
  var svg = el("svg", { viewBox: "0 0 1000 700", class: "map-svg", role: "group", "aria-labelledby": "mapTitle mapDesc" }, svgHost);
  var t = el("title", { id: "mapTitle" }, svg); t.textContent = "B2BStays Business Platform capability map";
  var d = el("desc", { id: "mapDesc" }, svg);
  d.textContent = "Central node B2BStays Business Platform connected to eight modules. Select a module to read what it manages, the problem it addresses, KPIs and the data needed to verify impact.";
  var defs = el("defs", {}, svg);
  var g = el("linearGradient", { id: "coreGrad", x1: "0", y1: "0", x2: "1", y2: "1" }, defs);
  el("stop", { offset: "0", "stop-color": "#2563eb" }, g);
  el("stop", { offset: "1", "stop-color": "#0d9488" }, g);

  var linkLayer = el("g", {}, svg);
  var nodeLayer = el("g", {}, svg);
  var nodes = [];

  mods.forEach(function (m, i) {
    var a = (-90 + i * 45) * Math.PI / 180;
    var x = CX + RX * Math.cos(a), y = CY + RY * Math.sin(a);
    el("line", { x1: CX, y1: CY, x2: x, y2: y, class: "map-link" }, linkLayer);
    var ng = el("g", { class: "map-node", tabindex: "0", role: "button", "aria-pressed": "false", "data-id": m.id, "aria-label": m.title + ". Show details." }, nodeLayer);
    el("rect", { x: x - W / 2, y: y - H / 2, width: W, height: H, rx: 14 }, ng);
    var num = el("text", { x: x - W / 2 + 14, y: y - 12, class: "num" }, ng); num.textContent = String(i + 1).padStart(2, "0");
    var l1 = el("text", { x: x, y: y + 2, "text-anchor": "middle" }, ng); l1.textContent = m.lines[0];
    var l2 = el("text", { x: x, y: y + 20, "text-anchor": "middle" }, ng); l2.textContent = m.lines[1];
    ng.addEventListener("click", function () { select(m.id); });
    ng.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(m.id); }
    });
    nodes.push(ng);
  });

  var center = el("g", { class: "map-center" }, svg);
  el("circle", { cx: CX, cy: CY, r: 84, class: "halo" }, center);
  el("circle", { cx: CX, cy: CY, r: 84, class: "core" }, center);
  var c1 = el("text", { x: CX, y: CY - 6, "text-anchor": "middle" }, center); c1.textContent = "B2BStays";
  var c2 = el("text", { x: CX, y: CY + 16, "text-anchor": "middle" }, center); c2.textContent = "Business Platform";

  /* ---------- Detail panel ---------- */
  function block(label, content) {
    var wrap = h("div", "mb-3");
    wrap.appendChild(h("div", "detail-label", label));
    if (Array.isArray(content)) {
      var box = h("div");
      content.forEach(function (k) { box.appendChild(h("span", "kpi-pill", k)); });
      wrap.appendChild(box);
    } else {
      wrap.appendChild(h("p", "mb-0", content));
    }
    return wrap;
  }
  function dataList(items) {
    var ul = h("ul", "mb-0 ps-3");
    items.forEach(function (i) { ul.appendChild(h("li", null, i)); });
    return ul;
  }

  function fill(container, m, includeTitle) {
    container.textContent = "";
    if (includeTitle) {
      var head = h("div", "d-flex align-items-center gap-3 mb-3");
      var chip = h("div", "icon-chip"); var ic = h("i", "bi " + m.icon); ic.setAttribute("aria-hidden", "true"); chip.appendChild(ic);
      head.appendChild(chip); head.appendChild(h("h3", "h4 mb-0", m.title));
      container.appendChild(head);
    }
    var row = h("div", "row g-4");
    var c1 = h("div", "col-lg-6"), c2 = h("div", "col-lg-6");
    c1.appendChild(block("What it manages", m.manages));
    c1.appendChild(block("Business problem it addresses", m.problem));
    c1.appendChild(block("Revenue or cost opportunity it may influence", m.opportunity));
    c2.appendChild(block("Relevant KPIs", m.kpis));
    var dw = h("div", "mb-3"); dw.appendChild(h("div", "detail-label", "Data required to verify the impact")); dw.appendChild(dataList(m.data)); c2.appendChild(dw);
    var pw = h("div", "mb-0"); pw.appendChild(h("div", "detail-label", "Named in the portal module list"));
    var pd = h("div"); m.inPortal.forEach(function (f) { var b = h("span", "badge badge-live me-1 mb-1", f); pd.appendChild(b); }); pw.appendChild(pd); c2.appendChild(pw);
    row.appendChild(c1); row.appendChild(c2); container.appendChild(row);
    container.appendChild(h("p", "small text-muted-2 mt-3 mb-0", "Opportunities are possibilities, not guarantees. Results depend on your processes and how consistently the module is used."));
  }

  function select(id) {
    var m = mods.filter(function (x) { return x.id === id; })[0];
    nodes.forEach(function (n) {
      var on = n.getAttribute("data-id") === id;
      n.classList.toggle("active", on);
      n.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (panel) { fill(panel, m, true); panel.setAttribute("tabindex", "-1"); }
  }
  select(mods[0].id);

  /* ---------- Mobile accordion ---------- */
  if (acc) {
    mods.forEach(function (m, i) {
      var item = h("div", "accordion-item");
      var hid = "mh-" + m.id, cid = "mc-" + m.id;
      var hd = h("h3", "accordion-header"); hd.id = hid;
      var btn = h("button", "accordion-button collapsed"); btn.type = "button";
      btn.setAttribute("data-bs-toggle", "collapse"); btn.setAttribute("data-bs-target", "#" + cid);
      btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", cid);
      btn.textContent = (i + 1) + ". " + m.title;
      hd.appendChild(btn);
      var col = h("div", "accordion-collapse collapse"); col.id = cid; col.setAttribute("aria-labelledby", hid); col.setAttribute("data-bs-parent", "#mapAccordion");
      var body = h("div", "accordion-body");
      var inner = h("div"); fill(inner, m, false);
      // single-column on phones
      Array.prototype.forEach.call(inner.querySelectorAll(".row > div"), function (c) { c.className = "col-12"; });
      body.appendChild(inner); col.appendChild(body);
      item.appendChild(hd); item.appendChild(col); acc.appendChild(item);
    });
  }
})();
