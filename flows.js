/* Clickable SVG process flows. Data: window.B2B_FLOWS. Horizontal on desktop, vertical on phones. */
(function () {
  "use strict";
  var flows = window.B2B_FLOWS;
  var host = document.getElementById("flowSvgHost");
  var tabs = document.getElementById("flowTabs");
  var explain = document.getElementById("flowExplain");
  if (!flows || !host || !tabs || !explain) return;

  var NS = "http://www.w3.org/2000/svg";
  var mq = window.matchMedia("(max-width: 767.98px)");
  var current = 0, currentNode = 0;

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function wrap(text, max) {
    var words = text.split(" "), lines = [], line = "";
    words.forEach(function (w) {
      if ((line + " " + w).trim().length > max && line) { lines.push(line); line = w; }
      else line = (line + " " + w).trim();
    });
    if (line) lines.push(line);
    return lines;
  }

  function render() {
    var f = flows[current], n = f.nodes.length, vertical = mq.matches;
    host.textContent = "";
    var NW = vertical ? 300 : 150, NH = vertical ? 64 : 100, GAP = vertical ? 30 : 38;
    var vw = vertical ? 340 : n * NW + (n - 1) * GAP + 20;
    var vh = vertical ? n * NH + (n - 1) * GAP + 20 : NH + 20;
    var svg = el("svg", { viewBox: "0 0 " + vw + " " + vh, class: "flow-svg", role: "group", "aria-label": f.label + " flow with " + n + " steps. Select a step to read an explanation." }, host);
    var defs = el("defs", {}, svg);
    var mk = el("marker", { id: "arr", viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0 0 L10 5 L0 10 z", fill: "#14b8a6" }, mk);

    f.nodes.forEach(function (nd, i) {
      var x = vertical ? 20 : 10 + i * (NW + GAP);
      var y = vertical ? 10 + i * (NH + GAP) : 10;
      if (i < n - 1) {
        var x1 = vertical ? x + NW / 2 : x + NW, y1 = vertical ? y + NH : y + NH / 2;
        var x2 = vertical ? x1 : x1 + GAP - 2, y2 = vertical ? y1 + GAP - 2 : y1;
        el("line", { x1: x1, y1: y1, x2: x2, y2: y2, class: "flow-arrow", "marker-end": "url(#arr)" }, svg);
      }
      var g = el("g", { class: "flow-node" + (i === currentNode ? " active" : "") + (i === n - 1 ? " last" : ""), tabindex: "0", role: "button", "aria-pressed": i === currentNode ? "true" : "false", "aria-label": "Step " + (i + 1) + ": " + nd[0] }, svg);
      el("rect", { x: x, y: y, width: NW, height: NH, rx: 12 }, g);
      var lines = wrap(nd[0], vertical ? 38 : 17);
      var start = y + NH / 2 - (lines.length - 1) * 9 + 4;
      lines.forEach(function (ln, j) {
        var tx = el("text", { x: x + NW / 2, y: start + j * 18, "text-anchor": "middle" }, g);
        tx.textContent = ln;
      });
      g.addEventListener("click", function () { currentNode = i; render(); show(); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); currentNode = i; render(); show(); var again = host.querySelectorAll(".flow-node")[i]; if (again) again.focus(); }
      });
    });
  }

  function show() {
    var nd = flows[current].nodes[currentNode];
    explain.textContent = "";
    var s = document.createElement("strong"); s.textContent = "Step " + (currentNode + 1) + " of " + flows[current].nodes.length + ": " + nd[0];
    var p = document.createElement("p"); p.className = "mb-0 mt-1"; p.textContent = nd[1];
    explain.appendChild(s); explain.appendChild(p);
  }

  flows.forEach(function (f, i) {
    var li = document.createElement("li"); li.className = "nav-item"; li.setAttribute("role", "presentation");
    var b = document.createElement("button"); b.type = "button"; b.className = "nav-link" + (i === 0 ? " active" : "");
    b.setAttribute("role", "tab"); b.setAttribute("aria-selected", i === 0 ? "true" : "false"); b.textContent = (i + 1) + ". " + f.label;
    b.addEventListener("click", function () {
      current = i; currentNode = 0;
      Array.prototype.forEach.call(tabs.querySelectorAll(".nav-link"), function (x, k) {
        x.classList.toggle("active", k === i); x.setAttribute("aria-selected", k === i ? "true" : "false");
      });
      render(); show();
    });
    li.appendChild(b); tabs.appendChild(li);
  });

  if (mq.addEventListener) mq.addEventListener("change", render); else mq.addListener(render);
  render(); show();
})();
