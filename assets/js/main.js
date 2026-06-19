/* Sahb Salon & Spa — interactions (vanilla, guarded) */
(function () {
  "use strict";

  /* ---- Mobile menu (full-screen overlay) ---- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobile-menu");
  var menuClose = document.getElementById("menu-close");

  function openMenu() {
    if (!menu) return;
    menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    if (burger) burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    if (burger) burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (burger) burger.addEventListener("click", openMenu);
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  if (menu) {
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenu(); closeLightbox(); }
  });

  /* ---- Scroll reveal (with fallback) ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
    // Safety: ensure everything shows after 2s no matter what
    setTimeout(function () {
      reveals.forEach(function (el) { el.classList.add("in"); });
    }, 2000);
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Lightbox ---- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  var lbClose = document.getElementById("lb-close");

  function openLightbox(src, alt) {
    if (!lightbox || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    if (!menu || !menu.classList.contains("open")) document.body.style.overflow = "";
  }
  document.querySelectorAll(".gal-item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var img = btn.querySelector("img");
      openLightbox(btn.getAttribute("data-full"), img ? img.alt : "");
    });
  });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  /* ---- Toast ---- */
  var toast = document.getElementById("toast");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 4000);
  }

  /* ---- Booking form -> WhatsApp + localStorage ---- */
  var form = document.getElementById("book-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var service = form.service.value;
      var date = form.date.value;
      var notes = form.notes.value.trim();
      var ok = true;

      function setErr(field, msg) {
        var el = form.querySelector('.err[data-for="' + field + '"]');
        if (el) el.textContent = msg || "";
        var input = form.querySelector('[name="' + field + '"]');
        if (input) input.classList.toggle("invalid", !!msg);
        if (msg) ok = false;
      }

      setErr("name", name ? "" : "فضلاً اكتب الاسم");
      setErr("phone", /^05\d{8}$/.test(phone) ? "" : "أدخل رقم جوال صحيح يبدأ بـ 05");
      setErr("service", service ? "" : "اختر الخدمة");

      if (!ok) {
        var firstInvalid = form.querySelector(".invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var record = { name: name, phone: phone, service: service, date: date, notes: notes, at: new Date().toISOString() };
      try {
        var saved = JSON.parse(localStorage.getItem("sahb_bookings") || "[]");
        saved.push(record);
        localStorage.setItem("sahb_bookings", JSON.stringify(saved));
      } catch (err) { /* storage may be unavailable */ }

      var lines = [
        "مرحبًا صالون سحب، أرغب بحجز موعد:",
        "الاسم: " + name,
        "الجوال: " + phone,
        "الخدمة: " + service
      ];
      if (date) lines.push("التاريخ المفضّل: " + date);
      if (notes) lines.push("ملاحظات: " + notes);

      var url = "https://wa.me/966502255848?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
      showToast("تم تجهيز طلبكم وفتح واتساب");
      form.reset();
    });
  }
})();
