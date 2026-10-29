/* Hero portal preview — interactive sidebar nav + live data. All figures are illustrative sample data. */
(function () {
  "use strict";
  var root = document.getElementById("heroDash");
  if (!root) return;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function inr(n) { return "₹" + Math.round(n).toLocaleString("en-IN"); }

  function kpGrid(items) {
    var g = el("div", "kp-grid");
    items.forEach(function (it) {
      var kp = el("div", "kp");
      var ic = el("span", "ic" + (it.t ? " t" : ""));
      var i = el("i", "bi " + it.icon); i.setAttribute("aria-hidden", "true");
      ic.appendChild(i);
      var d = el("div");
      d.appendChild(el("b", null, it.val));
      d.appendChild(el("small", null, it.label));
      kp.appendChild(ic); kp.appendChild(d);
      g.appendChild(kp);
    });
    return g;
  }

  function table(cols, rows) {
    var t = el("table", "dt");
    var thead = el("thead"), tr = el("tr");
    cols.forEach(function (c) {
      var th = el("th", c.r ? "r" : null, c.label);
      tr.appendChild(th);
    });
    thead.appendChild(tr); t.appendChild(thead);
    var tbody = el("tbody");
    rows.forEach(function (row) {
      var r = el("tr");
      row.forEach(function (cell, ci) {
        var td = el("td", cols[ci] && cols[ci].r ? "r" : null);
        if (ci === 0) td.className = "ref";
        if (typeof cell === "object") {
          var span = el("span", cell.cls, cell.text);
          td.appendChild(span);
        } else {
          td.textContent = cell;
        }
        r.appendChild(td);
      });
      tbody.appendChild(r);
    });
    t.appendChild(tbody);
    return t;
  }

  function barChart(rows) {
    var wrap = el("div");
    var max = Math.max.apply(null, rows.map(function (r) { return r.val; }));
    rows.forEach(function (r) {
      var row = el("div", "rv-row");
      var line = el("div", "rv-line");
      line.appendChild(el("span", null, r.label + (r.count ? " (" + r.count + ")" : "")));
      line.appendChild(el("span", null, r.display || inr(r.val)));
      var bar = el("div", "rv-bar");
      var fill = el("i", r.teal ? "t" : "");
      fill.style.width = Math.round(r.val / max * 100) + "%";
      bar.appendChild(fill);
      row.appendChild(line); row.appendChild(bar);
      wrap.appendChild(row);
    });
    return wrap;
  }

  function dc(title, subtitle, content, rightEl) {
    var d = el("div", "dc");
    var h = el("div", "dc-h");
    var left = el("div");
    left.appendChild(el("h3", null, title));
    if (subtitle) left.appendChild(el("small", null, subtitle));
    h.appendChild(left);
    if (rightEl) h.appendChild(rightEl);
    d.appendChild(h);
    d.appendChild(content);
    return d;
  }

  function tri(items) {
    var t = el("div", "tri");
    items.forEach(function (it) {
      var d = el("div");
      d.appendChild(el("b", null, it.val));
      d.appendChild(el("small", null, it.label));
      t.appendChild(d);
    });
    return t;
  }

  /* ===== HOTEL PORTAL VIEWS ===== */
  var HOTEL = {
    Dashboard: function () {
      var frag = document.createDocumentFragment();
      frag.appendChild(el("div", "dm-head") && (function () {
        var d = el("div", "dm-head");
        d.appendChild(el("h2", null, "Dashboard"));
        d.appendChild(el("p", null, "Bookings, commissions and collections at a glance"));
        return d;
      })());
      frag.appendChild(kpGrid([
        { icon: "bi-people", val: "128", label: "Agent bookings on file" },
        { icon: "bi-percent", val: "₹86,400", label: "Commission payable", t: true },
        { icon: "bi-file-earmark-text", val: "17", label: "Quotations awaiting reply" },
        { icon: "bi-credit-card", val: "₹3,12,000", label: "Received via payment links", t: true }
      ]));
      var selWrap = el("div");
      var sel = document.createElement("select");
      sel.id = "dashPeriod"; sel.className = "form-select dash-select";
      [["30","Last 30 days"],["90","Last 90 days"]].forEach(function (o) {
        var opt = document.createElement("option"); opt.value = o[0]; opt.textContent = o[1]; sel.appendChild(opt);
      });
      selWrap.appendChild(sel);
      var subEl = el("small"); subEl.id = "dashSub"; subEl.textContent = "Illustrative, last 30 days";
      var revEl = el("div"); revEl.id = "dashRev";
      var rightSide = el("div"); rightSide.appendChild(sel);
      var chartCard = dc("Revenue by Channel", null, revEl, rightSide);
      chartCard.querySelector(".dc-h .dc-h > div, .dc-h div:first-child")
      chartCard.querySelector("h3").insertAdjacentElement("afterend", subEl);
      frag.appendChild(chartCard);
      frag.appendChild(dc("Recent Bookings from Agents", "Latest bookings across mapped channels",
        table(
          [{label:"Ref"},{label:"Agent"},{label:"Amount",r:true},{label:"Commission",r:true}],
          [
            ["PKG-1042", "Sample Travels", "₹45,000", "₹3,150"],
            ["PKG-1041", "Demo Holidays", "₹33,750", "₹2,360"],
            ["PKG-1040", "Sample Tours",  "₹62,400", "₹4,370"]
          ]
        )
      ));
      var linkChip = el("span", "chip-link");
      var li = el("i", "bi bi-link-45deg"); li.setAttribute("aria-hidden","true");
      linkChip.appendChild(li); linkChip.append(" Payment links");
      frag.appendChild(dc("Group Booking Revenue", "Money collected and still to collect",
        tri([{val:"3",label:"Confirmed group bookings"},{val:"₹1,20,000",label:"Revenue collected"},{val:"₹80,000",label:"Still to collect"}]),
        linkChip
      ));
      return frag;
    },
    "Hotel Bookings": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"Hotel Bookings")); h.appendChild(el("p",null,"All bookings made through mapped agent channels"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-calendar-check", val: "62", label: "Bookings this month" },
        { icon: "bi-buildings", val: "₹6,84,000", label: "Revenue this month", t: true },
        { icon: "bi-hourglass-split", val: "8", label: "Pending confirmation" },
        { icon: "bi-x-circle", val: "3", label: "Cancelled this month", t: false }
      ]));
      frag.appendChild(dc("Recent Hotel Bookings", "Sorted by booking date",
        table(
          [{label:"Ref"},{label:"Guest / Agent"},{label:"Check-in"},{label:"Amount",r:true},{label:"Status"}],
          [
            ["HB-3081","Sample Travels","12 Nov","₹22,400",{cls:"pill pill-info",text:"Confirmed"}],
            ["HB-3080","Demo Holidays","10 Nov","₹18,600",{cls:"pill pill-info",text:"Confirmed"}],
            ["HB-3079","Sample Tours","8 Nov","₹31,200",{cls:"pill pill-ok",text:"Checked In"}]
          ]
        )
      ));
      frag.appendChild(dc("Revenue by Channel", "This month",
        barChart([
          {label:"Master Channel", count:38, val:420000},
          {label:"Direct Agent",   count:18, val:198000, teal:true},
          {label:"Sub-agent",      count:6,  val:66000}
        ])
      ));
      return frag;
    },
    "Packages": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"Packages")); h.appendChild(el("p",null,"Manage packages, bookings and custom quotations"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-box-seam", val: "14", label: "Active packages" },
        { icon: "bi-file-earmark-text", val: "17", label: "Quotes awaiting reply", t: true },
        { icon: "bi-check2-circle", val: "11", label: "Package bookings (month)" },
        { icon: "bi-cash-stack", val: "₹4,95,500", label: "Package revenue (month)", t: true }
      ]));
      frag.appendChild(dc("Quotation Requests", "Awaiting your reply",
        table(
          [{label:"Ref"},{label:"Agent"},{label:"Pax"},{label:"Value",r:true},{label:"Status"}],
          [
            ["QT-0217","Sample Travels","12","₹1,44,000",{cls:"pill pill-wait",text:"Awaiting"}],
            ["QT-0216","Demo Holidays","8","₹96,000",{cls:"pill pill-wait",text:"Awaiting"}],
            ["QT-0215","Sample Tours","20","₹2,40,000",{cls:"pill pill-info",text:"Sent"}]
          ]
        )
      ));
      frag.appendChild(dc("Top Packages", "By booking count this month",
        barChart([
          {label:"Shimla 3N/4D",count:5,val:5},
          {label:"Manali 4N/5D",count:4,val:4,teal:true},
          {label:"Goa Budget",count:2,val:2}
        ])
      ));
      return frag;
    },
    "Transportation": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"Transportation")); h.appendChild(el("p",null,"Vehicles, drivers, availability and cab bookings"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-truck", val: "18", label: "Total vehicles" },
        { icon: "bi-calendar-check", val: "11", label: "Trips today", t: true },
        { icon: "bi-slash-circle", val: "3", label: "Manual blocks active" },
        { icon: "bi-graph-up", val: "72%", label: "Utilisation rate", t: true }
      ]));
      frag.appendChild(dc("Today's Trips", "Allocated vehicles and drivers",
        table(
          [{label:"Ref"},{label:"Vehicle"},{label:"Driver"},{label:"Route"},{label:"Status"}],
          [
            ["CB-441","MH-04 AB 1234","Ramesh K.","Airport → Hotel",{cls:"pill pill-ok",text:"En Route"}],
            ["CB-440","MH-04 CD 5678","Suresh M.","Hotel → Station",{cls:"pill pill-info",text:"Scheduled"}],
            ["CB-439","MH-04 EF 9012","Vijay P.","City Tour",{cls:"pill pill-ok",text:"Ongoing"}]
          ]
        )
      ));
      frag.appendChild(dc("Fleet Utilisation", "This month",
        barChart([
          {label:"Sedan",    count:8, val:8},
          {label:"SUV",      count:5, val:5, teal:true},
          {label:"Mini Bus", count:3, val:3}
        ])
      ));
      return frag;
    },
    "Agent Settings": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"Agent Settings")); h.appendChild(el("p",null,"Agent accounts, channel mapping and commission rates"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-people", val: "24", label: "Active agents" },
        { icon: "bi-diagram-3", val: "6", label: "Channel mappings", t: true },
        { icon: "bi-percent", val: "7.2%", label: "Avg. commission rate" },
        { icon: "bi-clock-history", val: "3", label: "Pending approvals", t: true }
      ]));
      frag.appendChild(dc("Agent List", "Active mapped channels",
        table(
          [{label:"Agent"},{label:"Channel"},{label:"Rate",r:true},{label:"Status"}],
          [
            ["Sample Travels","Master Channel","7%",{cls:"pill pill-ok",text:"Active"}],
            ["Demo Holidays","Master Channel","8%",{cls:"pill pill-ok",text:"Active"}],
            ["New Agency","Sub-agent","6%",{cls:"pill pill-wait",text:"Pending"}]
          ]
        )
      ));
      return frag;
    },
    "Vendor Management": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"Vendor Management")); h.appendChild(el("p",null,"Suppliers, drivers and vendor records"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-diagram-3", val: "31", label: "Total vendors" },
        { icon: "bi-check2-circle", val: "28", label: "Active vendors", t: true },
        { icon: "bi-clock-history", val: "4", label: "Pending assignments" },
        { icon: "bi-exclamation-circle", val: "1", label: "Issues flagged", t: true }
      ]));
      frag.appendChild(dc("Vendor Directory", "Suppliers and drivers",
        table(
          [{label:"Vendor"},{label:"Type"},{label:"Bookings"},{label:"Status"}],
          [
            ["ABC Transport","Cab Supplier","18",{cls:"pill pill-ok",text:"Active"}],
            ["XYZ Supplies","F&B Vendor","9",{cls:"pill pill-ok",text:"Active"}],
            ["Demo Driver Co.","Driver Pool","23",{cls:"pill pill-ok",text:"Active"}]
          ]
        )
      ));
      return frag;
    },
    "After Sales Service": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"After Sales Service")); h.appendChild(el("p",null,"Customer requests, follow-ups and notifications"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-headset", val: "6", label: "Open service requests" },
        { icon: "bi-check2-circle", val: "41", label: "Resolved this month", t: true },
        { icon: "bi-bell", val: "84", label: "Notifications sent (month)" },
        { icon: "bi-arrow-repeat", val: "22%", label: "Repeat booking rate", t: true }
      ]));
      frag.appendChild(dc("Open Requests", "Sorted by creation date",
        table(
          [{label:"Ref"},{label:"Customer"},{label:"Issue"},{label:"Status"}],
          [
            ["SR-088","Sample Guest","Invoice query",{cls:"pill pill-wait",text:"Open"}],
            ["SR-087","Demo Traveller","Cab delay",{cls:"pill pill-wait",text:"Open"}],
            ["SR-086","Sample Guest 2","Room change",{cls:"pill pill-ok",text:"Resolved"}]
          ]
        )
      ));
      return frag;
    },
    "City Ledger": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"City Ledger")); h.appendChild(el("p",null,"Accounts, outstanding balances and payment links"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-bank", val: "₹3,12,000", label: "Received via payment links" },
        { icon: "bi-hourglass-split", val: "₹80,000", label: "Still to collect", t: true },
        { icon: "bi-receipt", val: "₹2,41,000", label: "Commission payable" },
        { icon: "bi-calendar-check", val: "18 days", label: "Avg. days to collect", t: true }
      ]));
      frag.appendChild(dc("Account Balances", "City Ledger summary",
        table(
          [{label:"Account"},{label:"Type"},{label:"Due Date"},{label:"Balance",r:true},{label:"Status"}],
          [
            ["Sample Travels","Agent A/C","30 Nov","₹45,000",{cls:"pill pill-wait",text:"Overdue"}],
            ["Demo Holidays","Agent A/C","5 Dec","₹28,000",{cls:"pill pill-info",text:"Current"}],
            ["Group Booking #3","Group","15 Dec","₹80,000",{cls:"pill pill-info",text:"Current"}]
          ]
        )
      ));
      return frag;
    },
    "Property Management": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"Property Management")); h.appendChild(el("p",null,"Properties, rooms and inventory records"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-buildings", val: "4", label: "Properties on record" },
        { icon: "bi-door-open", val: "86", label: "Total rooms", t: true },
        { icon: "bi-check2-circle", val: "82", label: "Rooms with complete data" },
        { icon: "bi-arrow-up-right-circle", val: "2", label: "Pending imports", t: true }
      ]));
      frag.appendChild(dc("Property List","",
        table(
          [{label:"Property"},{label:"Rooms"},{label:"Location"},{label:"Status"}],
          [
            ["Sample Hotel","32","Mumbai",{cls:"pill pill-ok",text:"Active"}],
            ["Demo Resort","28","Goa",{cls:"pill pill-ok",text:"Active"}],
            ["Hill View Inn","14","Shimla",{cls:"pill pill-info",text:"Importing"}],
            ["Lakeside Stay","12","Udaipur",{cls:"pill pill-ok",text:"Active"}]
          ]
        )
      ));
      return frag;
    },
    "Notifications": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"Notifications")); h.appendChild(el("p",null,"Notification centre, templates and history"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-bell", val: "84", label: "Sent this month" },
        { icon: "bi-file-earmark-text", val: "12", label: "Active templates", t: true },
        { icon: "bi-envelope-check", val: "91%", label: "Coverage rate" },
        { icon: "bi-clock", val: "6", label: "Scheduled today", t: true }
      ]));
      frag.appendChild(dc("Recent Notifications", "Last 5 sent",
        table(
          [{label:"Type"},{label:"Recipient"},{label:"Sent"},{label:"Status"}],
          [
            ["Booking Confirmed","Sample Travels","Today 9:12am",{cls:"pill pill-ok",text:"Sent"}],
            ["Payment Reminder","Demo Holidays","Today 8:30am",{cls:"pill pill-ok",text:"Sent"}],
            ["Check-in Alert","Sample Guest","Yesterday",{cls:"pill pill-ok",text:"Sent"}]
          ]
        )
      ));
      return frag;
    }
  };

  /* ===== TRAVEL AGENT PORTAL VIEWS ===== */
  var AGENT = {
    Dashboard: function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"Dashboard")); h.appendChild(el("p",null,"Overview of your bookings, commissions and settlements"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-journal-text", val: "12", label: "Total bookings" },
        { icon: "bi-calendar-event", val: "3", label: "Upcoming stays", t: true },
        { icon: "bi-coin", val: "₹42,800", label: "Commission earned (YTD)" },
        { icon: "bi-hourglass-split", val: "₹9,600", label: "Pending settlement", t: true }
      ]));
      var banner = el("div","banner-q");
      var bd = el("div"); bd.appendChild(el("b",null,"Planning a group of 10+ rooms?")); bd.appendChild(el("small",null,"Request a custom group quotation, including transportation")); banner.appendChild(bd); banner.appendChild(el("span","btn-q","Request Group Quotation"));
      frag.appendChild(banner);
      frag.appendChild(dc("Recent Bookings","Your latest bookings across properties",
        table(
          [{label:"Ref"},{label:"Hotel"},{label:"Amount",r:true},{label:"Status"}],
          [
            ["AG-2031","Sample Hotel","₹11,200",{cls:"pill pill-ok",text:"Checked Out"}],
            ["AG-2030","Sample Hotel","₹17,700",{cls:"pill pill-info",text:"Confirmed"}],
            ["AG-2029","Demo Resort","₹10,600",{cls:"pill pill-ok",text:"Checked Out"}]
          ]
        )
      ));
      frag.appendChild(dc("Settlement Snapshot","Commission settled and pending",
        tri([{val:"12 Sep",label:"Last settlement"},{val:"₹32,200",label:"Amount settled"},{val:"₹9,600",label:"Pending now"}])
      ));
      return frag;
    },
    "Hotel Booking": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"Hotel Booking")); h.appendChild(el("p",null,"Browse and book hotels for your clients"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-building", val: "12", label: "My bookings" },
        { icon: "bi-calendar-event", val: "3", label: "Upcoming stays", t: true },
        { icon: "bi-x-circle", val: "1", label: "Cancellations (month)" },
        { icon: "bi-cash-stack", val: "₹39,500", label: "Total booking value", t: true }
      ]));
      frag.appendChild(dc("My Hotel Bookings","",
        table(
          [{label:"Ref"},{label:"Hotel"},{label:"Check-in"},{label:"Nights"},{label:"Status"}],
          [
            ["AG-2031","Sample Hotel","8 Nov","3",{cls:"pill pill-ok",text:"Checked Out"}],
            ["AG-2030","Sample Hotel","15 Nov","2",{cls:"pill pill-info",text:"Confirmed"}],
            ["AG-2029","Demo Resort","22 Nov","4",{cls:"pill pill-info",text:"Confirmed"}]
          ]
        )
      ));
      return frag;
    },
    "Packages": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"Packages")); h.appendChild(el("p",null,"Browse packages and request custom quotations"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-box-seam", val: "3", label: "Package bookings (month)" },
        { icon: "bi-file-earmark-text", val: "2", label: "Quotes requested", t: true },
        { icon: "bi-cash-stack", val: "₹2,88,000", label: "Package booking value" },
        { icon: "bi-percent", val: "₹14,400", label: "Commission on packages", t: true }
      ]));
      frag.appendChild(dc("My Package Bookings","",
        table(
          [{label:"Ref"},{label:"Package"},{label:"Travel Date"},{label:"Amount",r:true},{label:"Status"}],
          [
            ["PB-0112","Shimla 3N/4D","18 Nov","₹96,000",{cls:"pill pill-info",text:"Confirmed"}],
            ["PB-0111","Manali 4N/5D","2 Dec","₹1,20,000",{cls:"pill pill-wait",text:"Pending"}],
            ["PB-0110","Goa Budget","28 Oct","₹72,000",{cls:"pill pill-ok",text:"Completed"}]
          ]
        )
      ));
      return frag;
    },
    "Cab Booking": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"Cab Booking")); h.appendChild(el("p",null,"Book cabs and transfers for your clients"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-car-front", val: "7", label: "Cab bookings (month)" },
        { icon: "bi-calendar-check", val: "2", label: "Trips today", t: true },
        { icon: "bi-cash-stack", val: "₹28,400", label: "Total cab spend (month)" },
        { icon: "bi-check2-circle", val: "6", label: "Completed trips", t: true }
      ]));
      frag.appendChild(dc("My Cab Bookings","",
        table(
          [{label:"Ref"},{label:"Route"},{label:"Date"},{label:"Amount",r:true},{label:"Status"}],
          [
            ["CB-441","Airport → Sample Hotel","Today","₹2,800",{cls:"pill pill-ok",text:"En Route"}],
            ["CB-440","Sample Hotel → Station","Today","₹1,400",{cls:"pill pill-info",text:"Scheduled"}],
            ["CB-438","Manali City Tour","Yesterday","₹4,200",{cls:"pill pill-ok",text:"Completed"}]
          ]
        )
      ));
      return frag;
    },
    "Finance": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"Finance")); h.appendChild(el("p",null,"Commission ledger and settlement history"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-coin", val: "₹42,800", label: "Commission earned (YTD)" },
        { icon: "bi-hourglass-split", val: "₹9,600", label: "Pending settlement", t: true },
        { icon: "bi-check2-circle", val: "₹33,200", label: "Total settled" },
        { icon: "bi-calendar-check", val: "12 Sep", label: "Last settlement date", t: true }
      ]));
      frag.appendChild(dc("Settlement History","",
        table(
          [{label:"Period"},{label:"Bookings"},{label:"Commission",r:true},{label:"Status"}],
          [
            ["Oct 2026","5","₹18,200",{cls:"pill pill-wait",text:"Pending"}],
            ["Sep 2026","4","₹15,000",{cls:"pill pill-ok",text:"Settled"}],
            ["Aug 2026","3","₹10,000",{cls:"pill pill-ok",text:"Settled"}]
          ]
        )
      ));
      return frag;
    },
    "Notifications": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"Notifications")); h.appendChild(el("p",null,"Updates on your bookings and settlements"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-bell", val: "5", label: "Unread notifications" },
        { icon: "bi-envelope-check", val: "18", label: "Total this month", t: true },
        { icon: "bi-calendar-event", val: "2", label: "Check-in reminders" },
        { icon: "bi-cash-stack", val: "1", label: "Payment alerts", t: true }
      ]));
      frag.appendChild(dc("Recent Notifications","",
        table(
          [{label:"Type"},{label:"Message"},{label:"Time"}],
          [
            ["Booking","AG-2030 confirmed by Sample Hotel","Today 10:00am"],
            ["Settlement","₹15,000 settled for Sep 2026","Yesterday"],
            ["Reminder","Check-in tomorrow: Sample Hotel","Yesterday"]
          ]
        )
      ));
      return frag;
    },
    "My Profile": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"My Profile")); h.appendChild(el("p",null,"Your agency details and account information"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-person-badge", val: "Sample Travels", label: "Agency name" },
        { icon: "bi-diagram-3", val: "Master Channel", label: "Channel type", t: true },
        { icon: "bi-percent", val: "7%", label: "Commission rate" },
        { icon: "bi-calendar-check", val: "Jan 2024", label: "Member since", t: true }
      ]));
      frag.appendChild(dc("Agency Details","",
        table(
          [{label:"Field"},{label:"Value"}],
          [
            ["Agency","Sample Travels Pvt. Ltd."],
            ["Contact","contact@sampletravels.com"],
            ["Phone","+91 98765 43210"],
            ["GST No.","29AABCS1429B1ZB"]
          ]
        )
      ));
      return frag;
    },
    "Settings": function () {
      var frag = document.createDocumentFragment();
      var h = el("div","dm-head"); h.appendChild(el("h2",null,"Settings")); h.appendChild(el("p",null,"Account preferences and notification settings"));
      frag.appendChild(h);
      frag.appendChild(kpGrid([
        { icon: "bi-bell", val: "On", label: "Email notifications" },
        { icon: "bi-phone", val: "On", label: "SMS alerts", t: true },
        { icon: "bi-shield-check", val: "Active", label: "2-factor auth" },
        { icon: "bi-translate", val: "English", label: "Language", t: true }
      ]));
      frag.appendChild(dc("Preferences","",
        table(
          [{label:"Setting"},{label:"Value"},{label:"Status"}],
          [
            ["Email on booking","Enabled",{cls:"pill pill-ok",text:"On"}],
            ["SMS on settlement","Enabled",{cls:"pill pill-ok",text:"On"}],
            ["Daily digest","Disabled",{cls:"pill pill-wait",text:"Off"}]
          ]
        )
      ));
      return frag;
    }
  };

  /* ===== Period selector (wired to Hotel Dashboard only) ===== */
  var PERIOD_DATA = {
    "30": { sub: "Illustrative, last 30 days", kpi: { bookings:"128", commission:"₹86,400", quotes:"17", payments:"₹3,12,000", gcount:"3", gcollected:"₹1,20,000", gdue:"₹80,000" }, rows:[["Hotel Bookings",62,684000,"b"],["Package Bookings",11,495500,"t"],["Custom Packages",3,138000,"b"]] },
    "90": { sub: "Illustrative, last 90 days", kpi: { bookings:"356", commission:"₹2,41,000", quotes:"17", payments:"₹9,05,000", gcount:"8", gcollected:"₹3,45,000", gdue:"₹1,10,000" }, rows:[["Hotel Bookings",171,1912000,"b"],["Package Bookings",34,1468000,"t"],["Custom Packages",9,402000,"b"]] }
  };

  function applyPeriod(key) {
    var d = PERIOD_DATA[key];
    var sub = document.getElementById("dashSub"); if (sub) sub.textContent = d.sub;
    Object.keys(d.kpi).forEach(function (k) { var n = root.querySelector('[data-kpi="'+k+'"]'); if (n) n.textContent = d.kpi[k]; });
    var rev = document.getElementById("dashRev"); if (!rev) return;
    rev.textContent = "";
    var max = Math.max.apply(null, d.rows.map(function (r) { return r[2]; })), total = 0;
    d.rows.forEach(function (r) {
      total += r[2];
      var row = el("div","rv-row"), line = el("div","rv-line");
      line.appendChild(el("span",null,r[0]+" ("+r[1]+")")); line.appendChild(el("span",null,inr(r[2])));
      var bar = el("div","rv-bar"), fill = el("i",r[3]==="t"?"t":""); fill.style.width = Math.round(r[2]/max*100)+"%";
      bar.appendChild(fill); row.appendChild(line); row.appendChild(bar); rev.appendChild(row);
    });
    var t = el("div","rv-total"); t.appendChild(el("span",null,"Total revenue")); t.appendChild(el("span",null,inr(total))); rev.appendChild(t);
  }

  function wirePeriodSel() {
    var sel = document.getElementById("dashPeriod");
    if (sel) { sel.addEventListener("change", function () { applyPeriod(sel.value); }); applyPeriod(sel.value); }
  }

  /* ===== Render a view into a portal's dash-main ===== */
  function renderView(mainEl, views, key) {
    var fn = views[key] || views[Object.keys(views)[0]];
    mainEl.textContent = "";
    mainEl.appendChild(fn());
    if (key === "Dashboard" && mainEl.closest("#view-hotel")) wirePeriodSel();
  }

  /* ===== Wire each portal sidebar ===== */
  function wirePortal(viewId, views) {
    var view = document.getElementById(viewId);
    if (!view) return;
    var mainEl = view.querySelector(".dash-main");
    var nav = view.querySelector(".dash-side");
    if (!nav || !mainEl) return;

    nav.querySelectorAll("span").forEach(function (span) {
      span.style.cursor = "pointer";
      span.addEventListener("click", function () {
        nav.querySelectorAll("span").forEach(function (s) { s.classList.remove("on"); });
        span.classList.add("on");
        var label = span.textContent.trim();
        renderView(mainEl, views, label);
      });
    });
  }

  wirePortal("view-hotel", HOTEL);
  wirePortal("view-agent", AGENT);

})();
