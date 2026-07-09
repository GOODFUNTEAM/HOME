(function () {
  var CLASSES = [
    '磚縫觀察員', '貼紙獵人', '訊號收音員', '拓印旅人', '空罐拆封師',
    '手心速記員', '願望蠟燭師', '城市拾荒者', '折頁觀測員', '稻田巡遊者',
    '微光收藏家', '街角測量員'
  ];
  var TITLES = [
    '第 523 號迷途訪客', '暫停鍵持有者', '城市邊角料收藏家', '微小連線捕手',
    '慢半拍的觀察者', '深夜貼紙獵人', '磚牆間的漫遊者', '空罐裡的旅人',
    '願望候補生', '訊號守夜人', '折頁裡的偵探', '沒有終點的散步者'
  ];
  var ICON_COLORS = [
    { bg: '#F0997B', fg: '#4A1B0C', icon: 'ti-user' },
    { bg: '#9FE1CB', fg: '#04342C', icon: 'ti-eye' },
    { bg: '#ED93B1', fg: '#4B1528', icon: 'ti-antenna' },
    { bg: '#AFA9EC', fg: '#26215C', icon: 'ti-map-pin' },
    { bg: '#FAC775', fg: '#412402', icon: 'ti-flame' },
    { bg: '#85B7EB', fg: '#042C53', icon: 'ti-compass' }
  ];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function roll() {
    var level = Math.floor(Math.random() * 99) + 1;
    var cls = pick(CLASSES);
    var title = pick(TITLES);
    var style = pick(ICON_COLORS);

    var lv = document.getElementById('roll-level');
    var cl = document.getElementById('roll-class');
    var ti = document.getElementById('roll-title');
    var avatar = document.getElementById('roll-avatar');
    if (lv) lv.textContent = 'Lv. ' + level;
    if (cl) cl.textContent = cls;
    if (ti) ti.textContent = title;
    if (avatar) {
      avatar.style.background = style.bg;
      avatar.innerHTML = '<i class="ti ' + style.icon + '" style="color:' + style.fg + '" aria-hidden="true"></i>';
    }
  }

  function enter() {
    var overlay = document.getElementById('login-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  window.goodfunLogin = { roll: roll, enter: enter };

  document.addEventListener('DOMContentLoaded', roll);
})();
