/* Module explorer tabs. Without JS every panel is shown stacked. Deep links like modules.html#finance select the tab. */
(function () {
  "use strict";
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".module-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".module-panel"));
  if (!tabs.length || !panels.length) return;
  document.documentElement.classList.add("js-tabs");

  function activate(id, focus, updateHash) {
    var found = false;
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-module") === id;
      if (on) found = true;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    if (!found) return false;
    panels.forEach(function (p) { p.hidden = p.id !== id; });
    if (updateHash && window.history && history.replaceState) history.replaceState(null, "", "#" + id);
    return true;
  }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { activate(t.getAttribute("data-module"), false, true); });
    t.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); activate(tabs[n].getAttribute("data-module"), true, true); }
    });
  });

  function fromHash() {
    var id = location.hash.replace("#", "");
    if (!activate(id, false, false)) activate(tabs[0].getAttribute("data-module"), false, false);
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();
})();
