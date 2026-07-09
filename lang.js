(function () {
  function getLang() {
    return localStorage.getItem('gf_lang') || 'zh';
  }
  function setLang(l) {
    localStorage.setItem('gf_lang', l);
    location.reload();
  }
  window.GFLang = { get: getLang, set: setLang };

  document.addEventListener('DOMContentLoaded', function () {
    var lang = getLang();
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.textContent = lang === 'zh' ? 'EN' : '中文';
      btn.onclick = function () { setLang(lang === 'zh' ? 'en' : 'zh'); };
    }
    var navZh = { works: '作品', events: '活動', shop: '商店', about: '關於' };
    var navEn = { works: 'Works', events: 'Events', shop: 'Shop', about: 'About' };
    var nav = lang === 'zh' ? navZh : navEn;
    ['nav-works', 'nav-events', 'nav-shop', 'nav-about'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = nav[id.replace('nav-', '')];
    });
  });
})();
