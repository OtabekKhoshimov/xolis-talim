/* Xolis ta'lim — Telegram Mini App bilan umumiy bog'lanish.
   Telegram ichida: mavzu ranglari, Orqaga tugmasi, tebranish, bulutda saqlash.
   Oddiy brauzerda ham ishlaydi (localStorage bilan). */
(function () {
  var tg = window.Telegram && window.Telegram.WebApp;
  var inTg = !!(tg && tg.initData !== undefined && tg.platform && tg.platform !== "unknown");
  var root = document.documentElement;

  function applyTheme() {
    if (inTg && tg.colorScheme) root.setAttribute("data-theme", tg.colorScheme);
    try {
      var bg = getComputedStyle(document.body).backgroundColor;
      if (inTg && bg) { tg.setHeaderColor(bg); tg.setBackgroundColor(bg); }
    } catch (e) {}
  }

  var KEY = "xt_progress";
  function readLocal() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function writeLocal(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  var XT = {
    inTelegram: inTg,
    getProgress: function (cb) {
      var local = readLocal();
      if (inTg && tg.CloudStorage && tg.isVersionAtLeast && tg.isVersionAtLeast("6.9")) {
        tg.CloudStorage.getItem(KEY, function (err, val) {
          var cloud = {};
          try { cloud = val ? JSON.parse(val) : {}; } catch (e) {}
          var merged = Object.assign({}, local, cloud);
          writeLocal(merged);
          cb(merged);
        });
      } else cb(local);
    },
    setLesson: function (id, data) {
      XT.getProgress(function (p) {
        p[id] = Object.assign({}, p[id] || {}, data);
        writeLocal(p);
        if (inTg && tg.CloudStorage && tg.isVersionAtLeast && tg.isVersionAtLeast("6.9")) {
          try { tg.CloudStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
        }
      });
    },
    haptic: function (kind) {
      if (!inTg || !tg.HapticFeedback) return;
      try {
        if (kind === "ok") tg.HapticFeedback.notificationOccurred("success");
        else if (kind === "bad") tg.HapticFeedback.notificationOccurred("error");
        else tg.HapticFeedback.selectionChanged();
      } catch (e) {}
    },
    backTo: function (url) {
      if (!inTg || !tg.BackButton) return;
      tg.BackButton.show();
      tg.BackButton.onClick(function () { location.href = url; });
    }
  };
  window.XT = XT;

  if (inTg) {
    tg.ready();
    tg.expand();
    if (tg.onEvent) tg.onEvent("themeChanged", applyTheme);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyTheme);
  else applyTheme();
})();
