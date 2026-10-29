/* Enquiry form: client-side validation + POST to api/enquiry.php (core PHP + MySQL). */
(function () {
  "use strict";
  var form = document.getElementById("enquiryForm");
  if (!form) return;
  var status = document.getElementById("formStatus");
  var btn = form.querySelector("button[type=submit]");

  var rules = {
    name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your name."; },
    company: function (v) { return v.trim().length >= 2 ? "" : "Please enter your company name."; },
    business_type: function (v) { return v ? "" : "Please choose a business type."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email address."; },
    phone: function (v) {
      var digits = v.replace(/[^\d]/g, "");
      return /^[+\d][\d\s\-().]*$/.test(v.trim()) && digits.length >= 7 && digits.length <= 15 ? "" : "Enter a valid phone number (7–15 digits).";
    },
    message: function (v) { return v.trim().length >= 10 ? (v.length <= 2000 ? "" : "Please keep the message under 2000 characters.") : "Tell us a little more (at least 10 characters)."; }
  };

  function check(name) {
    var f = form.elements[name], msg = rules[name](f.value);
    f.classList.toggle("is-invalid", !!msg);
    f.classList.toggle("is-valid", !msg);
    var fb = document.getElementById("err-" + name);
    if (fb) fb.textContent = msg;
    return !msg;
  }

  Object.keys(rules).forEach(function (n) {
    var f = form.elements[n];
    f.addEventListener("blur", function () { check(n); });
    f.addEventListener("input", function () { if (f.classList.contains("is-invalid")) check(n); });
  });

  // Pre-select the enquiry purpose from ?topic=
  var topic = new URLSearchParams(location.search).get("topic");
  var topicSel = form.elements.topic;
  if (topic && topicSel) { Array.prototype.forEach.call(topicSel.options, function (o) { if (o.value === topic) topicSel.value = topic; }); }

  function show(kind, text) {
    status.className = "alert alert-" + kind + " mt-3";
    status.textContent = text;
    status.classList.remove("d-none");
    status.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.classList.add("d-none");
    var ok = true, first = null;
    Object.keys(rules).forEach(function (n) { if (!check(n)) { ok = false; if (!first) first = form.elements[n]; } });
    if (!ok) { first.focus(); return; }

    var payload = new FormData(form);
    btn.disabled = true; var label = btn.textContent; btn.textContent = "Sending…";
    fetch(form.getAttribute("action"), { method: "POST", body: payload, headers: { "Accept": "application/json" } })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (res.ok && res.body.ok) {
          form.reset();
          Array.prototype.forEach.call(form.elements, function (x) { x.classList && x.classList.remove("is-valid", "is-invalid"); });
          show("success", "Thank you. Your enquiry has been received and we will be in touch.");
        } else {
          var errs = res.body && res.body.errors;
          if (errs) Object.keys(errs).forEach(function (k) {
            var f = form.elements[k], fb = document.getElementById("err-" + k);
            if (f) f.classList.add("is-invalid"); if (fb) fb.textContent = errs[k];
          });
          show("danger", (res.body && res.body.message) || "We could not send your enquiry. Please check the form and try again.");
        }
      })
      .catch(function () {
        show("warning", "The enquiry service is not reachable. If you are viewing this site without PHP/MySQL connected, the form cannot submit yet (see README → Integrations).");
      })
      .then(function () { btn.disabled = false; btn.textContent = label; });
  });
})();
