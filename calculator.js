/* Illustrative revenue-scenario calculator.
   Everything is per month. Nothing is sent anywhere; all maths runs in the browser.

   Money model (kept consistent across business types so nothing is counted twice):
     GBV            = bookings x average booking value           (gross booking value; NOT revenue)
     Pass-through   = GBV x pass-through %                       (taxes etc. collected for others)
     Net sales      = GBV - pass-through
     Recognized revenue
        principal basis (hotel, package/transport, tour operator selling as principal) = Net sales
        agent basis (net)                                        = Gross margin amount only
     Collected on behalf of others = GBV - Recognized revenue    (excluded from revenue)
     Cost borne     = direct cost the business itself carries
     Gross margin   = Recognized revenue - Cost borne
     Commission / acquisition cost = GBV x commission %
     Contribution margin = Gross margin - Commission / acquisition cost
     Net profit     = Contribution margin - Fixed overhead
*/
(function (root) {
  "use strict";

  var MODES = {
    hotel: {
      label: "Hotel or accommodation business",
      blurb: "Bookings, conversion and acquisition cost.",
      fields: [
        { id: "bookings", label: "Monthly bookings", def: 300, min: 0, help: "Confirmed bookings per month." },
        { id: "abv", label: "Average booking value", def: 12000, min: 0, money: true, help: "Gross booking value per booking, including taxes." },
        { id: "conv", label: "Current conversion rate (%)", def: 30, min: 0.1, max: 100, help: "Enquiries that become bookings. Used to infer enquiry volume." },
        { id: "comm", label: "Average commission / acquisition cost (% of booking value)", def: 14, min: 0, max: 100 },
        { id: "pt", label: "Taxes and pass-through amounts (% of booking value)", def: 12, min: 0, max: 100, help: "Collected for others, so not your revenue." },
        { id: "svc", label: "Variable service cost per booking", def: 2500, min: 0, money: true, help: "Housekeeping, utilities, consumables etc." },
        { id: "fixed", label: "Fixed monthly overhead", def: 1200000, min: 0, money: true, help: "Used only for net profit." }
      ],
      levers: [
        { id: "l1", label: "Conversion rate uplift (relative %)", def: 5, min: 0, max: 50, step: 1, unit: "%" },
        { id: "l2", label: "Average booking value change (%)", def: 0, min: -20, max: 30, step: 1, unit: "%" },
        { id: "l3", label: "Commission / acquisition cost change (percentage points)", def: 0, min: -10, max: 10, step: 0.5, unit: " pp" }
      ],
      formulas: [
        "Enquiries = Bookings / Conversion rate",
        "Scenario bookings = Enquiries x min(100%, Conversion x (1 + uplift))",
        "Gross margin = (GBV - Pass-through) - Bookings x Service cost"
      ]
    },
    agent: {
      label: "Travel agent or tour operator",
      blurb: "Enquiries, quotation conversion and gross margin.",
      fields: [
        { id: "enq", label: "Monthly enquiries", def: 400, min: 0 },
        { id: "conv", label: "Quotation conversion rate (%)", def: 25, min: 0, max: 100 },
        { id: "abv", label: "Average booking value", def: 45000, min: 0, money: true, help: "Gross booking value per confirmed booking." },
        { id: "gm", label: "Gross margin (% of booking value after pass-through)", def: 18, min: 0, max: 100 },
        { id: "basis", label: "Revenue basis", def: "principal", type: "select", options: [["principal", "Principal (revenue = net sales)"], ["agent", "Agent / net (revenue = margin only)"]], help: "Money you collect only to pay suppliers is not revenue on an agent basis." },
        { id: "comm", label: "Selling cost / sub-agent commission (% of booking value)", def: 3, min: 0, max: 100 },
        { id: "pt", label: "Taxes and pass-through amounts (% of booking value)", def: 5, min: 0, max: 100 },
        { id: "fixed", label: "Fixed monthly overhead", def: 400000, min: 0, money: true }
      ],
      levers: [
        { id: "l1", label: "Quotation conversion uplift (relative %)", def: 5, min: 0, max: 50, step: 1, unit: "%" },
        { id: "l2", label: "Average booking value change (%)", def: 0, min: -20, max: 30, step: 1, unit: "%" },
        { id: "l3", label: "Gross margin change (percentage points)", def: 0, min: -10, max: 10, step: 0.5, unit: " pp" }
      ],
      formulas: [
        "Bookings = Enquiries x Conversion rate",
        "Gross margin = (GBV - Pass-through) x Margin %",
        "Agent basis: Revenue = Gross margin; supplier amounts are collected on behalf of others"
      ]
    },
    pkg: {
      label: "Package and transportation business",
      blurb: "Capacity, utilization, price and variable cost.",
      fields: [
        { id: "cap", label: "Available capacity per month (trips / package departures / seats)", def: 600, min: 0 },
        { id: "util", label: "Current utilization (%)", def: 55, min: 0, max: 100 },
        { id: "price", label: "Average selling price per booking", def: 6500, min: 0, money: true },
        { id: "vc", label: "Variable cost per booking", def: 4200, min: 0, money: true, help: "Driver, fuel, supplier and other direct costs." },
        { id: "comm", label: "Channel commission (% of booking value)", def: 5, min: 0, max: 100 },
        { id: "pt", label: "Taxes and pass-through amounts (% of booking value)", def: 5, min: 0, max: 100 },
        { id: "fixed", label: "Fixed monthly overhead", def: 400000, min: 0, money: true }
      ],
      levers: [
        { id: "l1", label: "Utilization change (percentage points)", def: 5, min: 0, max: 30, step: 1, unit: " pp" },
        { id: "l2", label: "Average selling price change (%)", def: 0, min: -20, max: 30, step: 1, unit: "%" },
        { id: "l3", label: "Variable cost per booking change (%)", def: 0, min: -20, max: 20, step: 1, unit: "%" }
      ],
      formulas: [
        "Bookings = Capacity x Utilization",
        "Gross margin = (GBV - Pass-through) - Bookings x Variable cost",
        "Utilization is capped at 100%"
      ]
    }
  };

  /* Core P&L for one set of drivers. p: {bookings, abv, pt, comm, fixed, costMode, ...} */
  function pnl(p) {
    var gbv = p.bookings * p.abv;
    var passThrough = gbv * p.pt / 100;
    var netSales = gbv - passThrough;
    var costBorne, revenue;
    if (p.kind === "agent") {
      var gmAmt = netSales * p.gm / 100;
      revenue = p.basis === "agent" ? gmAmt : netSales;
      costBorne = revenue - gmAmt;
    } else {
      revenue = netSales;
      costBorne = p.bookings * p.unitCost;
    }
    var gross = revenue - costBorne;
    var commission = gbv * p.comm / 100;
    var contribution = gross - commission;
    var net = contribution - p.fixed;
    return {
      bookings: p.bookings, gbv: gbv, passThrough: passThrough, revenue: revenue,
      onBehalf: gbv - revenue, costBorne: costBorne, gross: gross, commission: commission,
      contribution: contribution, net: net, fixed: p.fixed
    };
  }

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  /* mode: hotel|agent|pkg; v: field values; s: lever values {l1,l2,l3} */
  function calc(mode, v, s) {
    var base, scn, kpi = {};
    if (mode === "hotel") {
      var enquiries = v.bookings / (v.conv / 100);
      var c2 = clamp(v.conv * (1 + s.l1 / 100), 0, 100);
      var b2 = enquiries * c2 / 100;
      base = pnl({ kind: "hotel", bookings: v.bookings, abv: v.abv, pt: v.pt, comm: v.comm, fixed: v.fixed, unitCost: v.svc });
      scn = pnl({ kind: "hotel", bookings: b2, abv: v.abv * (1 + s.l2 / 100), pt: v.pt, comm: clamp(v.comm + s.l3, 0, 100), fixed: v.fixed, unitCost: v.svc });
      kpi.rate = [v.conv, c2, "Conversion rate", "%"];
      kpi.volume = [enquiries, enquiries, "Implied monthly enquiries", "n"];
    } else if (mode === "agent") {
      var b0 = v.enq * v.conv / 100;
      var c3 = clamp(v.conv * (1 + s.l1 / 100), 0, 100);
      var b1 = v.enq * c3 / 100;
      base = pnl({ kind: "agent", bookings: b0, abv: v.abv, pt: v.pt, comm: v.comm, fixed: v.fixed, gm: v.gm, basis: v.basis });
      scn = pnl({ kind: "agent", bookings: b1, abv: v.abv * (1 + s.l2 / 100), pt: v.pt, comm: v.comm, fixed: v.fixed, gm: clamp(v.gm + s.l3, 0, 100), basis: v.basis });
      kpi.rate = [v.conv, c3, "Quotation conversion rate", "%"];
      kpi.volume = [v.enq, v.enq, "Monthly enquiries", "n"];
    } else {
      var u2 = clamp(v.util + s.l1, 0, 100);
      base = pnl({ kind: "pkg", bookings: v.cap * v.util / 100, abv: v.price, pt: v.pt, comm: v.comm, fixed: v.fixed, unitCost: v.vc });
      scn = pnl({ kind: "pkg", bookings: v.cap * u2 / 100, abv: v.price * (1 + s.l2 / 100), pt: v.pt, comm: v.comm, fixed: v.fixed, unitCost: v.vc * (1 + s.l3 / 100) });
      kpi.rate = [v.util, u2, "Capacity utilization", "%"];
      kpi.volume = [v.cap, v.cap, "Available capacity", "n"];
    }
    return { base: base, scn: scn, kpi: kpi };
  }

  function ratio(a, b) { return b ? a / b * 100 : 0; }
  function kpiSet(r) {
    return {
      abv: r.bookings ? r.gbv / r.bookings : 0,
      gmPct: ratio(r.gross, r.revenue),
      gmGbvPct: ratio(r.gross, r.gbv),
      cmPct: ratio(r.contribution, r.revenue),
      cmPerBooking: r.bookings ? r.contribution / r.bookings : 0,
      costPerBooking: r.bookings ? (r.costBorne + r.commission) / r.bookings : 0,
      netPct: ratio(r.net, r.revenue)
    };
  }

  var api = { MODES: MODES, calc: calc, pnl: pnl, kpiSet: kpiSet };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.B2BCalc = api;

  /* ---------------- UI ---------------- */
  if (typeof document === "undefined") return;
  var form = document.getElementById("calcFields");
  if (!form) return;

  var modeHost = document.getElementById("calcModes");
  var leverHost = document.getElementById("calcLevers");
  var out = document.getElementById("calcResults");
  var errBox = document.getElementById("calcError");
  var formulaBox = document.getElementById("calcFormulas");
  var curSel = document.getElementById("calcCurrency");
  var mode = "hotel";

  function h(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function fmtMoney(x) {
    try { return new Intl.NumberFormat(undefined, { style: "currency", currency: curSel.value, maximumFractionDigits: 0 }).format(x); }
    catch (e) { return Math.round(x).toLocaleString(); }
  }
  function fmtNum(x) { return (Math.round(x * 10) / 10).toLocaleString(undefined, { maximumFractionDigits: 1 }); }
  function fmtPct(x) { return (Math.round(x * 10) / 10).toFixed(1) + "%"; }

  function buildModes() {
    modeHost.textContent = "";
    Object.keys(MODES).forEach(function (k) {
      var col = h("div", "col-12");
      var b = h("button", "mode-btn" + (k === mode ? " active" : "")); b.type = "button";
      b.setAttribute("aria-pressed", k === mode ? "true" : "false");
      b.appendChild(h("strong", null, MODES[k].label)); b.appendChild(h("span", "small text-muted-2", MODES[k].blurb));
      b.addEventListener("click", function () { mode = k; buildModes(); buildForm(); update(); });
      col.appendChild(b); modeHost.appendChild(col);
    });
  }

  function buildForm() {
    var m = MODES[mode];
    form.textContent = ""; leverHost.textContent = "";
    m.fields.forEach(function (f) {
      var col = h("div", "col-sm-6");
      var lab = h("label", "form-label", f.label); lab.setAttribute("for", "in-" + f.id);
      var inp;
      if (f.type === "select") {
        inp = h("select", "form-select");
        f.options.forEach(function (o) { var op = h("option", null, o[1]); op.value = o[0]; if (o[0] === f.def) op.selected = true; inp.appendChild(op); });
      } else {
        inp = h("input", "form-control"); inp.type = "number"; inp.inputMode = "decimal"; inp.value = f.def; inp.step = "any";
        if (f.min != null) inp.min = f.min; if (f.max != null) inp.max = f.max;
      }
      inp.id = "in-" + f.id; inp.setAttribute("data-field", f.id);
      inp.addEventListener("input", update); inp.addEventListener("change", update);
      var fb = h("div", "invalid-feedback"); fb.id = "fb-" + f.id;
      col.appendChild(lab); col.appendChild(inp); col.appendChild(fb);
      if (f.help) { var ht = h("div", "form-text", f.help); ht.id = "ht-" + f.id; inp.setAttribute("aria-describedby", ht.id + " " + fb.id); col.appendChild(ht); }
      form.appendChild(col);
    });
    m.levers.forEach(function (l) {
      var col = h("div", "col-12");
      var lab = h("label", "form-label d-flex justify-content-between"); lab.setAttribute("for", "lv-" + l.id);
      lab.appendChild(h("span", null, l.label));
      var val = h("span", "text-primary fw-bold"); val.id = "lvv-" + l.id; lab.appendChild(val);
      var r = h("input", "form-range"); r.type = "range"; r.min = l.min; r.max = l.max; r.step = l.step; r.value = l.def; r.id = "lv-" + l.id;
      r.addEventListener("input", update);
      col.appendChild(lab); col.appendChild(r); leverHost.appendChild(col);
    });
    formulaBox.textContent = "";
    m.formulas.forEach(function (t) { formulaBox.appendChild(h("code", "formula", t)); });
  }

  function readValues() {
    var m = MODES[mode], v = {}, ok = true;
    m.fields.forEach(function (f) {
      var inp = document.getElementById("in-" + f.id), fb = document.getElementById("fb-" + f.id);
      if (f.type === "select") { v[f.id] = inp.value; return; }
      var n = parseFloat(inp.value), msg = "";
      if (inp.value === "" || isNaN(n)) msg = "Enter a number.";
      else if (f.min != null && n < f.min) msg = "Must be at least " + f.min + ".";
      else if (f.max != null && n > f.max) msg = "Must be at most " + f.max + ".";
      inp.classList.toggle("is-invalid", !!msg); fb.textContent = msg;
      if (msg) ok = false; else v[f.id] = n;
    });
    return ok ? v : null;
  }
  function readLevers() {
    var s = {};
    MODES[mode].levers.forEach(function (l) {
      var r = document.getElementById("lv-" + l.id);
      s[l.id] = parseFloat(r.value);
      document.getElementById("lvv-" + l.id).textContent = (s[l.id] > 0 && l.min < 0 ? "+" : "") + s[l.id] + l.unit;
    });
    return s;
  }

  function delta(cur, scn, money) {
    var d = scn - cur, c = d > 0.0001 ? "delta-pos" : d < -0.0001 ? "delta-neg" : "text-muted-2";
    var txt = (d > 0 ? "+" : "") + (money ? fmtMoney(d) : fmtNum(d));
    var s = h("span", c, Math.abs(d) < 0.0001 ? "–" : txt);
    return s;
  }

  function row(label, a, b, money, note, strong) {
    var tr = h("tr");
    var th = h("th", strong ? "fw-bold" : "fw-normal"); th.scope = "row"; th.textContent = label;
    if (note) { var sm = h("div", "small text-muted-2", note); th.appendChild(sm); }
    tr.appendChild(th);
    var f = money ? fmtMoney : fmtNum;
    tr.appendChild(h("td", "text-end" + (strong ? " fw-bold" : ""), f(a)));
    tr.appendChild(h("td", "text-end" + (strong ? " fw-bold" : ""), f(b)));
    var td = h("td", "text-end"); td.appendChild(delta(a, b, money)); tr.appendChild(td);
    return tr;
  }
  function group(label) { var tr = h("tr", "group"); var td = h("td", null, label); td.colSpan = 4; tr.appendChild(td); return tr; }

  function chart(base, scn) {
    var NS = "http://www.w3.org/2000/svg";
    var items = [["Recognized revenue", base.revenue, scn.revenue], ["Gross margin", base.gross, scn.gross], ["Contribution", base.contribution, scn.contribution], ["Net profit", base.net, scn.net]];
    var W = 560, H = 230, pad = 28, bw = 34, gap = 20;
    var vals = []; items.forEach(function (i) { vals.push(i[1], i[2]); });
    var max = Math.max.apply(null, vals.concat([1])), min = Math.min.apply(null, vals.concat([0]));
    var span = max - min, plotTop = 20, plotH = H - 70;
    var zero = plotTop + (max / span) * plotH;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("class", "chart-svg w-100"); svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Bar chart comparing current and scenario recognized revenue, gross margin, contribution margin and net profit per month.");
    function add(n, a, t) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (t != null) e.textContent = t; svg.appendChild(e); return e; }
    add("line", { x1: pad, x2: W - pad, y1: zero, y2: zero, stroke: "#c9d6ee" });
    var groupW = (W - 2 * pad) / items.length;
    items.forEach(function (it, i) {
      var gx = pad + i * groupW + (groupW - (2 * bw + 6)) / 2;
      [[it[1], "bar-cur", "Current"], [it[2], "bar-scn", "Scenario"]].forEach(function (b, j) {
        var hgt = Math.abs(b[0]) / span * plotH, y = b[0] >= 0 ? zero - hgt : zero;
        var r = add("rect", { x: gx + j * (bw + 6), y: y, width: bw, height: Math.max(hgt, 1), rx: 4, class: b[1] + (b[0] < 0 ? " bar-neg" : "") });
        var tt = document.createElementNS(NS, "title"); tt.textContent = it[0] + " – " + b[2] + ": " + fmtMoney(b[0]); r.appendChild(tt);
      });
      add("text", { x: pad + i * groupW + groupW / 2, y: H - 30, "text-anchor": "middle" }, it[0]);
    });
    add("rect", { x: pad, y: H - 14, width: 10, height: 10, class: "bar-cur" }); add("text", { x: pad + 15, y: H - 5 }, "Current");
    add("rect", { x: pad + 80, y: H - 14, width: 10, height: 10, class: "bar-scn" }); add("text", { x: pad + 95, y: H - 5 }, "Illustrative scenario");
    return svg;
  }

  function update() {
    var v = readValues(), s = readLevers();
    out.textContent = "";
    if (!v) { errBox.classList.remove("d-none"); errBox.textContent = "Please correct the highlighted inputs to see results."; return; }
    errBox.classList.add("d-none");
    var r = calc(mode, v, s), b = r.base, c = r.scn, kb = kpiSet(b), kc = kpiSet(c);

    var wrap = h("div", "table-responsive");
    var t = h("table", "table result-table align-middle"); t.setAttribute("aria-label", "Current versus illustrative scenario, per month");
    var cap = h("caption", "visually-hidden", "Current versus illustrative scenario per month"); t.appendChild(cap);
    var th = h("thead"), trh = h("tr");
    ["Per month", "Current", "Scenario", "Change"].forEach(function (x, i) { var e = h("th", i ? "text-end" : null, x); e.scope = "col"; trh.appendChild(e); });
    th.appendChild(trh); t.appendChild(th);
    var tb = h("tbody");
    tb.appendChild(group("Volume"));
    tb.appendChild(row("Estimated booking volume", b.bookings, c.bookings, false));
    tb.appendChild(group("Money flow (not all of it is revenue)"));
    tb.appendChild(row("Gross booking value (GBV)", b.gbv, c.gbv, true, "Total billed to customers; includes money that is not yours."));
    tb.appendChild(row("Collected on behalf of others", b.onBehalf, c.onBehalf, true, "Taxes and, on an agent basis, supplier amounts. Excluded from revenue."));
    tb.appendChild(group("Business results"));
    tb.appendChild(row("Recognized revenue", b.revenue, c.revenue, true, null, true));
    tb.appendChild(row("Cost borne by the business", b.costBorne, c.costBorne, true));
    tb.appendChild(row("Gross margin", b.gross, c.gross, true, "Recognized revenue minus cost borne.", true));
    tb.appendChild(row("Commission / acquisition cost", b.commission, c.commission, true));
    tb.appendChild(row("Contribution margin", b.contribution, c.contribution, true, "Gross margin minus commission / acquisition cost.", true));
    tb.appendChild(row("Fixed overhead", b.fixed, c.fixed, true));
    tb.appendChild(row("Net profit (before tax)", b.net, c.net, true, "Contribution margin minus fixed overhead.", true));
    t.appendChild(tb); wrap.appendChild(t); out.appendChild(wrap);

    out.appendChild(h("h3", "h6 mt-4 mb-2", "Performance KPIs"));
    var grid = h("div", "row g-2");
    var tiles = [
      [r.kpi.rate[2], fmtPct(r.kpi.rate[0]), fmtPct(r.kpi.rate[1])],
      ["Average GBV per booking", fmtMoney(kb.abv), fmtMoney(kc.abv)],
      ["Gross margin % of revenue", fmtPct(kb.gmPct), fmtPct(kc.gmPct)],
      ["Gross margin % of GBV", fmtPct(kb.gmGbvPct), fmtPct(kc.gmGbvPct)],
      ["Contribution margin %", fmtPct(kb.cmPct), fmtPct(kc.cmPct)],
      ["Contribution per booking", fmtMoney(kb.cmPerBooking), fmtMoney(kc.cmPerBooking)],
      ["Cost per booking", fmtMoney(kb.costPerBooking), fmtMoney(kc.costPerBooking)],
      ["Net profit margin", fmtPct(kb.netPct), fmtPct(kc.netPct)]
    ];
    tiles.forEach(function (x) {
      var col = h("div", "col-6 col-lg-3"), k = h("div", "kpi-tile");
      k.appendChild(h("div", "k", x[0])); k.appendChild(h("div", "v", x[2]));
      k.appendChild(h("div", "d text-muted-2", "Current: " + x[1])); col.appendChild(k); grid.appendChild(col);
    });
    out.appendChild(grid);
    out.appendChild(h("h3", "h6 mt-4 mb-2", "Current vs scenario"));
    out.appendChild(chart(b, c));
  }

  curSel.addEventListener("change", update);
  buildModes(); buildForm(); update();
})(typeof window !== "undefined" ? window : this);
