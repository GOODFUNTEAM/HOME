(function () {
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }
})();

/* ---------- 小彩蛋：抽一張孤芳身份卡 ---------- */
(function () {
  var DATA = {
    'zh-Hant': {
      btn: '抽一張身份卡', title: '你的孤芳身份卡', again: '再抽一次', close: '關閉',
      classes: ['磚縫觀察員','貼紙獵人','訊號收音員','拓印旅人','空罐拆封師','手心速記員','願望蠟燭師','城市拾荒者','折頁觀測員','稻田巡遊者','微光收藏家','街角測量員'],
      titles: ['第 523 號迷途訪客','暫停鍵持有者','城市邊角料收藏家','微小連線捕手','慢半拍的觀察者','深夜貼紙獵人','磚牆間的漫遊者','空罐裡的旅人','願望候補生','訊號守夜人','折頁裡的偵探','沒有終點的散步者']
    },
    'en': {
      btn: 'Draw an identity card', title: 'Your GOODFUN identity card', again: 'Draw again', close: 'Close',
      classes: ['Brick-Seam Observer','Sticker Hunter','Signal Listener','Rubbing-Print Wanderer','Can-Opener Scholar','Palm Notetaker','Wishing-Candle Keeper','Urban Scavenger','Fold-Page Watcher','Rice-Field Wanderer','Faint-Light Collector','Corner Surveyor'],
      titles: ['Visitor No. 523 (Lost)','Keeper of the Pause Button','Collector of Urban Scraps','Catcher of Small Connections','The Slightly-Behind Observer','Midnight Sticker Hunter','Wanderer Between Brick Walls','Traveler Inside an Empty Can','Wish List Candidate','Night Watcher of Signals','Detective in the Fold-Out Pages','Walker With No Destination']
    },
    'ja': {
      btn: 'アイデンティティカードを引く', title: 'あなたの孤芳アイデンティティカード', again: 'もう一度引く', close: '閉じる',
      classes: ['煉瓦の隙間観察員','ステッカーハンター','信号受信員','拓本の旅人','空き缶開封師','手のひら速記員','願いのろうそく係','都市の拾い物師','折り丁観測員','田んぼの回遊者','微光コレクター','街角測量員'],
      titles: ['第523号・迷い込んだ訪問者','ポーズボタンの保持者','都市の端材コレクター','小さなつながりの捕獲者','少し遅れた観察者','深夜のステッカーハンター','煉瓦壁の間の彷徨者','空き缶の中の旅人','願い事候補生','信号の夜警','折り丁の中の探偵','終わりのない散歩者']
    }
  };
  var ICONS = [
    { bg: '#F0997B', fg: '#4A1B0C', path: '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>' },
    { bg: '#9FE1CB', fg: '#04342C', path: '<path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"/>' },
    { bg: '#ED93B1', fg: '#4B1528', path: '<path d="M20 4v8"/><path d="M16 4.5v7"/><path d="M12 5v16"/><path d="M8 5.5v5"/><path d="M4 6v4"/><path d="M20 8h-16"/>' },
    { bg: '#AFA9EC', fg: '#26215C', path: '<path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0"/>' },
    { bg: '#FAC775', fg: '#412402', path: '<path d="M12 10.941c2.333 -3.308 .167 -7.823 -1 -8.941c0 3.395 -2.235 5.299 -3.667 6.706c-1.43 1.408 -2.333 3.294 -2.333 5.588c0 3.704 3.134 6.706 7 6.706c3.866 0 7 -3.002 7 -6.706c0 -1.712 -1.232 -4.403 -2.333 -5.588c-2.084 3.353 -3.257 3.353 -4.667 2.235"/>' },
    { bg: '#85B7EB', fg: '#042C53', path: '<path d="M8 16l2 -6l6 -2l-2 6l-6 2"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 3l0 2"/><path d="M12 19l0 2"/><path d="M3 12l2 0"/><path d="M19 12l2 0"/>' }
  ];
  var X_PATH = '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>';
  var ID_ICON = '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M6 15.5c0-1.5 1-2.5 2-2.5s2 1 2 2.5"/><path d="M13 9h5"/><path d="M13 13h5"/>';

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  document.addEventListener('DOMContentLoaded', function () {
    var lang = document.documentElement.lang;
    var t = DATA[lang] || DATA['zh-Hant'];

    var btn = document.createElement('button');
    btn.className = 'identity-fab';
    btn.type = 'button';
    btn.setAttribute('aria-label', t.btn);
    btn.innerHTML = '<svg class="ti" viewBox="0 0 24 24" aria-hidden="true">' + ID_ICON + '</svg>';
    document.body.appendChild(btn);

    var overlay = null;

    function render() {
      var style = pick(ICONS);
      var lv = Math.floor(Math.random() * 99) + 1;
      var cls = pick(t.classes);
      var title = pick(t.titles);
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'identity-overlay';
        overlay.className = 'identity-overlay';
        overlay.innerHTML =
          '<div class="modal-box identity-card">' +
            '<button class="modal-close" type="button" aria-label="' + t.close + '"><svg class="ti" viewBox="0 0 24 24" aria-hidden="true">' + X_PATH + '</svg></button>' +
            '<div class="modal-body-inner">' +
              '<div class="identity-avatar"></div>' +
              '<h2 class="identity-title">' + t.title + '</h2>' +
              '<p class="identity-level"></p>' +
              '<p class="identity-class"></p>' +
              '<p class="identity-role"></p>' +
              '<button class="btn btn-secondary identity-again" type="button">' + t.again + '</button>' +
            '</div>' +
          '</div>';
        document.body.appendChild(overlay);
        overlay.querySelector('.modal-close').addEventListener('click', close);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
        overlay.querySelector('.identity-again').addEventListener('click', render);
      }
      var avatar = overlay.querySelector('.identity-avatar');
      avatar.style.background = style.bg;
      avatar.innerHTML = '<svg class="ti" viewBox="0 0 24 24" style="color:' + style.fg + '" aria-hidden="true">' + style.path + '</svg>';
      overlay.querySelector('.identity-level').textContent = 'Lv. ' + lv;
      overlay.querySelector('.identity-class').textContent = cls;
      overlay.querySelector('.identity-role').textContent = title;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', render);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) close();
    });
  });
})();
