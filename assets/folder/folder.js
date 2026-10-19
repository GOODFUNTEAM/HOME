// 孤芳里公布欄 — interactive transparent PP folder (WebGL) + photo stuffing + image / video export.
// Units in the 3D scene are millimetres. Panel = 220 x 310 mm. Spine at x = 0.
import * as THREE from './vendor/three.module.min.js';

const PW = 220, PH = 310, HW = 10;            // panel width/height, hinge strip width
const RIG = PW - HW;                           // rigid part of the left panel
const MAX_PHOTOS = 8;
const EXPORT_W = 1080, EXPORT_H = 1920, FPS = 30, DURATION = 6;
const Z = { sheet: 0.25, gloss: 0.45, print: 0, ink: -0.3, real: -1.0, photo0: -0.9, photoStep: -0.18, pocket: -2.7 };

const I18N = {
  zh: { real: '實拍內頁', mine: '我的照片', pick: '選照片', camera: '拍照', clear: '清空', fold: '合起來', unfold: '攤開',
    inside: '翻到內側', outside: '回到外側', saveImg: '存圖片', saveVid: '存影片', making: '產生中', share: '分享', download: '下載',
    close: '關閉', full: '最多放 8 張，先清空再放新的', heic: '這張照片的格式無法讀取（可能是 HEIC），請改選 JPG 或 PNG',
    novideo: '這個瀏覽器無法產生影片，請改用「存圖片」，或用新版 Chrome／Safari 開啟',
    privacy: '照片只在你的瀏覽器裡處理，不會上傳到任何地方。', hint: '拖曳看光澤，點資料夾開合',
    count: n => `${n} / ${MAX_PHOTOS}`, ready: '完成了', longpress: '手機可長按圖片儲存' },
  en: { real: 'Original inserts', mine: 'My photos', pick: 'Choose photos', camera: 'Take photo', clear: 'Clear', fold: 'Close', unfold: 'Open',
    inside: 'See inside', outside: 'See outside', saveImg: 'Save image', saveVid: 'Save video', making: 'Rendering', share: 'Share', download: 'Download',
    close: 'Close', full: 'Up to 8 photos. Clear the folder to add new ones.', heic: 'This photo format can’t be read (possibly HEIC). Please choose a JPG or PNG.',
    novideo: 'This browser can’t create video. Use “Save image”, or open the page in a recent Chrome or Safari.',
    privacy: 'Your photos stay in your browser and are never uploaded.', hint: 'Drag to see the gloss, tap the folder to open or close it',
    count: n => `${n} / ${MAX_PHOTOS}`, ready: 'Done', longpress: 'On a phone, press and hold the image to save it' },
  ja: { real: '実物の中身', mine: '自分の写真', pick: '写真を選ぶ', camera: '撮影する', clear: 'クリア', fold: '閉じる', unfold: '開く',
    inside: '内側を見る', outside: '外側を見る', saveImg: '画像を保存', saveVid: '動画を保存', making: '生成中', share: '共有', download: 'ダウンロード',
    close: '閉じる', full: '写真は 8 枚までです。クリアしてから追加してください。', heic: 'この写真の形式は読み込めません（HEIC の可能性）。JPG か PNG を選んでください。',
    novideo: 'このブラウザでは動画を作成できません。「画像を保存」を使うか、最新の Chrome／Safari で開いてください。',
    privacy: '写真はブラウザ内だけで処理され、どこにもアップロードされません。', hint: 'ドラッグで光沢を確認、タップで開閉',
    count: n => `${n} / ${MAX_PHOTOS}`, ready: '完成', longpress: 'スマホでは画像を長押しして保存できます' }
};

const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const clamp01 = t => Math.max(0, Math.min(1, t));
const lerp = (a, b, t) => a + (b - a) * t;

export function mountFolder(root, opts = {}) {
  const lang = (opts.lang || document.documentElement.lang || 'zh').slice(0, 2);
  const T = I18N[lang === 'ja' ? 'ja' : lang === 'en' ? 'en' : 'zh'];
  const asset = name => (opts.assets && opts.assets[name]) || (opts.base || '') + name;
  const brand = opts.brand || 'GOODFUN TEAM';

  // ---------- DOM ----------
  root.classList.add('bf');
  root.innerHTML = `
    <div class="bf-stage" tabindex="0" role="button" aria-label="${T.fold} / ${T.unfold}"></div>
    <p class="bf-hint">${T.hint}</p>
    <div class="bf-bar">
      <div class="bf-group" role="group">
        <button type="button" class="bf-btn" data-mode="real" aria-pressed="true">${T.real}</button>
        <button type="button" class="bf-btn" data-mode="mine" aria-pressed="false">${T.mine} <span class="bf-count">${T.count(0)}</span></button>
      </div>
      <div class="bf-group">
        <label class="bf-btn bf-file">${T.pick}<input type="file" accept="image/*" multiple class="bf-in-pick"></label>
        <label class="bf-btn bf-file bf-cam">${T.camera}<input type="file" accept="image/*" capture="environment" class="bf-in-cam"></label>
        <button type="button" class="bf-btn bf-clear">${T.clear}</button>
      </div>
      <div class="bf-group">
        <button type="button" class="bf-btn bf-fold">${T.fold}</button>
        <button type="button" class="bf-btn bf-flip">${T.inside}</button>
      </div>
      <div class="bf-group">
        <button type="button" class="bf-btn bf-primary bf-save-img">${T.saveImg}</button>
        <button type="button" class="bf-btn bf-primary bf-save-vid">${T.saveVid}</button>
      </div>
    </div>
    <p class="bf-privacy">${T.privacy}</p>
    <p class="bf-msg" role="status" aria-live="polite"></p>
    <div class="bf-modal" hidden>
      <div class="bf-sheet" role="dialog" aria-modal="true">
        <div class="bf-result"></div>
        <p class="bf-note"></p>
        <div class="bf-group">
          <button type="button" class="bf-btn bf-primary bf-share" hidden>${T.share}</button>
          <a class="bf-btn bf-download">${T.download}</a>
          <button type="button" class="bf-btn bf-close">${T.close}</button>
        </div>
      </div>
    </div>`;
  // the result sheet lives under <body> so transformed ancestors (page reveal animation) can't trap position:fixed
  const portal = document.createElement('div'); portal.className = 'bf bf-portal';
  portal.appendChild(root.querySelector('.bf-modal')); document.body.appendChild(portal);
  const $ = s => root.querySelector(s) || portal.querySelector(s);
  const stage = $('.bf-stage'), msg = $('.bf-msg');
  if (!matchMedia('(pointer: coarse)').matches) $('.bf-cam').hidden = true;
  const say = (t) => { msg.textContent = t || ''; };

  // ---------- renderer / scene ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 10, 5000);

  const loader = new THREE.TextureLoader();
  const tex = name => { const t = loader.load(asset(name)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const TX = {};
  for (const s of ['l', 'r']) for (const k of ['print', 'ink', 'sheet', 'pocket']) TX[`${k}_${s}`] = tex(`tex/${k}_${s}.png`);
  TX.real_l = tex('tex/real_l.jpg'); TX.real_r = tex('tex/real_r.jpg');

  const tilt = new THREE.Group(); scene.add(tilt);
  const flipG = new THREE.Group(); tilt.add(flipG);
  const inner = new THREE.Group(); flipG.add(inner);
  const right = new THREE.Group(); inner.add(right);
  const left = new THREE.Group(); inner.add(left);

  // wall shadow (2D blurred rectangle drawn on a canvas)
  const shCan = document.createElement('canvas'); shCan.width = 256; shCan.height = 256;
  // shadow trick: draw the rectangle off-canvas so only its blur lands inside
  { const c = shCan.getContext('2d'); c.clearRect(0, 0, 256, 256); c.shadowColor = 'rgba(20,24,32,0.5)'; c.shadowBlur = 30; c.shadowOffsetX = 1000;
    c.fillRect(-1000 + 44, 44, 168, 168); }
  const shadowTex = new THREE.CanvasTexture(shCan);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: .75 }));
  shadow.position.z = -40; shadow.renderOrder = -10; tilt.add(shadow);

  const basic = (map, extra = {}) => new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, side: THREE.DoubleSide, ...extra });

  // rigid plane: x range [x0,x1] in panel-local mm, y range [y0,y1] (y up), uv range
  function rigid(mat, x0, x1, y0, y1, u0, u1, v0, v1, z) {
    const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) { uv.setX(i, uv.getX(i) ? u1 : u0); uv.setY(i, uv.getY(i) ? v1 : v0); }
    const m = new THREE.Mesh(g, mat); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, z); return m;
  }

  // gloss: additive diagonal band, masked by the die-line alpha of the sheet texture
  const glossU = { uPos: { value: -300 } };
  function glossMat(maskTex, x0) {
    return new THREE.ShaderMaterial({
      uniforms: { uMask: { value: maskTex }, uX0: { value: x0 }, uPos: glossU.uPos },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform sampler2D uMask; uniform float uX0; uniform float uPos; varying vec2 vUv;
        void main(){ float m = step(0.02, texture2D(uMask, vUv).a);
          float x = uX0 + vUv.x * ${PW.toFixed(1)}; float y = (1.0 - vUv.y) * ${PH.toFixed(1)};
          float c = x + 0.55 * y; float band = exp(-pow((c - uPos) / 26.0, 2.0)) * 0.20 + exp(-pow((c - uPos + 60.0) / 9.0, 2.0)) * 0.10;
          float top = smoothstep(0.88, 1.0, vUv.y) * 0.03;
          gl_FragColor = vec4(vec3(1.0), (band + top) * m); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide
    });
  }

  // ---- right panel (spine at x=0 -> x=220) ----
  const yT = PH / 2, yB = -PH / 2;
  const layersR = [
    ['sheet_r', Z.sheet], ['print_r', Z.print], ['ink_r', Z.ink]
  ];
  for (const [k, z] of layersR) right.add(rigid(basic(TX[k]), 0, PW, yB, yT, 0, 1, 0, 1, z));
  right.add(rigid(glossMat(TX.sheet_r, 0), 0, PW, yB, yT, 0, 1, 0, 1, Z.gloss));
  right.add(rigid(basic(TX.pocket_r), 0, PW, yB, yB + 100, 0, 1, 0, 1, Z.pocket));
  // real insert photo: window area X 0..209, Y 72..288 (Y from top)
  const realR = rigid(new THREE.MeshBasicMaterial({ map: TX.real_r, side: THREE.DoubleSide }), 0, 209, yT - 288, yT - 72, 0, 1, 0, 1, Z.real);
  right.add(realR);

  // ---- left panel rigid part: local x in [-RIG, 0] (0 = hinge end), texture u in [0, RIG/PW] ----
  const uR = RIG / PW;
  for (const [k, z] of [['sheet_l', Z.sheet], ['print_l', Z.print], ['ink_l', Z.ink]]) left.add(rigid(basic(TX[k]), -RIG, 0, yB, yT, 0, uR, 0, 1, z));
  left.add(rigid(glossMat(TX.sheet_l, -PW), -RIG, 0, yB, yT, 0, uR, 0, 1, Z.gloss));
  left.add(rigid(basic(TX.pocket_l), -RIG, 0, yB, yB + 100, 0, uR, 0, 1, Z.pocket));
  // real insert left: window X 11..220 -> clipped to rigid part (X 11..210)
  const realL = rigid(new THREE.MeshBasicMaterial({ map: TX.real_l, side: THREE.DoubleSide }), 4 - RIG, 0, yT - 288, yT - 72, 0, 1, 0, 1, Z.real);
  left.add(realL);

  // ---- hinge strips (bend with the fold so the spine never splits) ----
  const N = 16, hinges = [];
  for (const [k, z] of [['sheet_l', Z.sheet], ['print_l', Z.print], ['ink_l', Z.ink]]) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array((N + 1) * 2 * 3), uv = new Float32Array((N + 1) * 2 * 2), idx = [];
    for (let i = 0; i <= N; i++) {
      const u = 1 - (HW * i / N) / PW;
      uv.set([u, 1, u, 0], i * 4);
      if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    const m = new THREE.Mesh(g, basic(TX[k])); m.frustumCulled = false; inner.add(m); hinges.push({ m, z });
  }

  function setFold(theta) {
    const r = theta > 1e-4 ? HW / theta : Infinity;
    for (const h of hinges) {
      const p = h.m.geometry.attributes.position.array;
      for (let i = 0; i <= N; i++) {
        const s = HW * i / N, ph = theta * s / HW;
        let x, z;
        if (r === Infinity) { x = -s; z = 0; } else { x = -r * Math.sin(ph); z = -r * (1 - Math.cos(ph)); }
        const nx = -Math.sin(ph), nz = Math.cos(ph);
        x += h.z * nx; z += h.z * nz;
        p.set([x, yT, z, x, yB, z], i * 6);
      }
      h.m.geometry.attributes.position.needsUpdate = true;
      h.m.geometry.computeBoundingSphere();
    }
    if (r === Infinity) left.position.set(-HW, 0, 0); else left.position.set(-r * Math.sin(theta), 0, -r * (1 - Math.cos(theta)));
    left.rotation.y = -theta;
    const k = theta / Math.PI;
    inner.position.x = -110 * k;
    shadow.scale.set(lerp(470, 250, k), 345, 1);
    shadow.position.set(lerp(6, 4, k), -8, -40);
  }

  // ---------- user photos ----------
  const photos = []; // {mesh, shadow, side, X, Y, rot, w, h, born, depth}
  const photoGroup = { l: new THREE.Group(), r: new THREE.Group() };
  left.add(photoGroup.l); right.add(photoGroup.r);
  let mode = 'real';
  const SLOTS = { l: [[110, 175], [80, 225], [150, 130], [120, 245]], r: [[105, 165], [140, 225], [80, 130], [110, 240]] };
  const paperShadowTex = shadowTex;

  // left rigid local x = X - RIG  (X measured from the outer edge; spine-side 10 mm belong to the hinge)
  function localX(side, X) { return side === 'l' ? X - RIG : X; }

  function placePhoto(img, w0, h0) {
    const n = photos.length, side = n % 2 ? 'r' : 'l';
    const slot = SLOTS[side][Math.floor(n / 2) % 4];
    const longSide = 115 + Math.random() * 40, asp = w0 / h0;
    let w = asp >= 1 ? longSide : longSide * asp, h = asp >= 1 ? longSide / asp : longSide;
    const rot = (Math.random() * 2 - 1) * (10 + Math.random() * 6) * Math.PI / 180;
    // keep the rotated photo inside the window (X 12..208, Y 76..286)
    const ex = () => (Math.abs(w * Math.cos(rot)) + Math.abs(h * Math.sin(rot))) / 2;
    const ey = () => (Math.abs(w * Math.sin(rot)) + Math.abs(h * Math.cos(rot))) / 2;
    const xMax = side === 'l' ? 205 : 208, xMin = side === 'l' ? 14 : 4;
    while ((ex() * 2 > xMax - xMin - 4 || ey() * 2 > 206) && w > 40) { w *= .92; h *= .92; }
    let X = slot[0] + (Math.random() * 2 - 1) * 14, Y = slot[1] + (Math.random() * 2 - 1) * 14;
    X = Math.min(xMax - ex(), Math.max(xMin + ex(), X)); Y = Math.min(286 - ey(), Math.max(76 + ey(), Y));
    const t = new THREE.CanvasTexture(img); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const depth = Z.photo0 + photos.length * Z.photoStep;
    const geo = new THREE.PlaneGeometry(w, h);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, side: THREE.FrontSide }));
    // back of the print is plain white paper
    const back = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xf7f6f2, side: THREE.FrontSide }));
    back.rotation.y = Math.PI; back.position.z = -0.03; mesh.add(back);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.12, h * 1.12), new THREE.MeshBasicMaterial({ map: paperShadowTex, transparent: true, depthWrite: false, opacity: .45, side: THREE.FrontSide }));
    mesh.rotation.z = rot; sh.rotation.z = rot;
    photoGroup[side].add(sh); photoGroup[side].add(mesh);
    const p = { mesh, sh, side, X, Y, depth, born: performance.now() / 1000, prog: 0, tex: t };
    photos.push(p); updatePhoto(p, 0); return p;
  }
  function updatePhoto(p, prog) {
    p.prog = prog;
    const e = easeOut(clamp01(prog));
    const lift = (1 - e) * 270;                 // slides down from above the folder
    const x = localX(p.side, p.X), y = yT - p.Y + lift;
    p.mesh.position.set(x, y, p.depth); p.sh.position.set(x + 1.5, y - 2.5, p.depth - 0.06);
    const vis = prog > 0 && mode === 'mine';
    p.mesh.visible = vis; p.sh.visible = vis;
  }
  function refreshMode() {
    realL.visible = realR.visible = mode === 'real';
    for (const p of photos) updatePhoto(p, p.prog);
    root.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    $('.bf-count').textContent = T.count(photos.length);
  }

  async function decode(file) {
    let bmp;
    try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch (e) {
      bmp = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(file); });
    }
    const w0 = bmp.width, h0 = bmp.height, k = Math.min(1, 1400 / Math.max(w0, h0));
    const c = document.createElement('canvas'); c.width = Math.round(w0 * k); c.height = Math.round(h0 * k);
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
    // thin paper edge
    g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = Math.max(4, c.width * 0.012); g.strokeRect(0, 0, c.width, c.height);
    return [c, w0, h0];
  }
  async function addFiles(files) {
    say('');
    for (const f of files) {
      if (photos.length >= MAX_PHOTOS) { say(T.full); break; }
      try { const [c, w, h] = await decode(f); mode = 'mine'; const p = placePhoto(c, w, h); p.born = performance.now() / 1000 + 0.05; }
      catch (e) { say(T.heic); }
    }
    if (photos.length) { mode = 'mine'; targetTheta = 0; }
    refreshMode();
  }
  function clearPhotos() {
    for (const p of photos) { photoGroup[p.side].remove(p.mesh, p.sh); p.mesh.geometry.dispose(); p.mesh.material.dispose(); p.mesh.children[0].material.dispose(); p.sh.geometry.dispose(); p.sh.material.dispose(); p.tex.dispose(); }
    photos.length = 0; mode = 'real'; refreshMode(); say('');
  }

  // ---------- live view state ----------
  let theta = 0, targetTheta = 0, flip = 0, targetFlip = 0;
  let rx = 0.12, ry = -0.16, trx = 0.12, try_ = -0.16;
  const REST = [0.12, -0.16];
  let busy = false;

  function fitCamera(cam, aspect, spanW, spanH, cy = 0) {
    cam.aspect = aspect; cam.updateProjectionMatrix();
    const vf = THREE.MathUtils.degToRad(cam.fov);
    const dH = (spanH / 2) / Math.tan(vf / 2), dW = (spanW / 2) / (Math.tan(vf / 2) * aspect);
    cam.position.set(0, cy, Math.max(dH, dW)); cam.lookAt(0, cy, 0);
  }
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false);
    fitCamera(camera, w / h, 468, 345);
  }
  new ResizeObserver(resize).observe(stage); resize();

  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    try_ = x * 0.55; trx = y * 0.36;
  });
  stage.addEventListener('pointerleave', () => { [trx, try_] = REST; });
  let down = null;
  stage.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  stage.addEventListener('pointerup', e => {
    if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 8) toggleFold();
    down = null; if (e.pointerType !== 'mouse') [trx, try_] = REST;
  });
  stage.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFold(); } });
  function toggleFold() { targetTheta = targetTheta > 1 ? 0 : Math.PI; syncButtons(); }
  function syncButtons() {
    $('.bf-fold').textContent = targetTheta > 1 ? T.unfold : T.fold;
    $('.bf-flip').textContent = targetFlip > 1 ? T.outside : T.inside;
  }
  $('.bf-fold').addEventListener('click', toggleFold);
  $('.bf-flip').addEventListener('click', () => { targetFlip = targetFlip > 1 ? 0 : Math.PI; syncButtons(); });
  root.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.mode; if (mode === 'mine') for (const p of photos) if (p.prog < 1) p.prog = 1; refreshMode();
  }));
  $('.bf-in-pick').addEventListener('change', e => { addFiles([...e.target.files]); e.target.value = ''; });
  $('.bf-in-cam').addEventListener('change', e => { addFiles([...e.target.files]); e.target.value = ''; });
  $('.bf-clear').addEventListener('click', clearPhotos);
  stage.addEventListener('dragover', e => { e.preventDefault(); });
  stage.addEventListener('drop', e => { e.preventDefault(); addFiles([...e.dataTransfer.files].filter(f => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name))); });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last = performance.now() / 1000;
  function frame() {
    requestAnimationFrame(frame);
    if (busy) return;
    const now = performance.now() / 1000, dt = Math.min(0.05, now - last); last = now;
    const k = reduce ? 1 : 1 - Math.pow(0.0015, dt);
    theta += (targetTheta - theta) * k; flip += (targetFlip - flip) * k;
    rx += (trx - rx) * (1 - Math.pow(0.02, dt)); ry += (try_ - ry) * (1 - Math.pow(0.02, dt));
    tilt.rotation.set(rx, ry, 0); flipG.rotation.y = flip; setFold(theta);
    glossU.uPos.value = 40 + ry * 520 + rx * 160;
    let i = 0;
    for (const p of photos) { if (p.prog < 1) updatePhoto(p, reduce ? 1 : (now - p.born - i * 0.12) / 0.6); i++; }
    renderer.render(scene, camera);
  }
  setFold(0); refreshMode(); syncButtons(); frame();

  // ---------- export (image + video share the same timeline) ----------
  let exp = null;
  function exporter() {
    if (exp) return exp;
    const can = document.createElement('canvas'); can.width = EXPORT_W; can.height = EXPORT_H;
    const r = new THREE.WebGLRenderer({ canvas: can, antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setPixelRatio(1); r.setSize(EXPORT_W, EXPORT_H, false); r.setClearColor(0x000000, 0);
    const cam = new THREE.PerspectiveCamera(26, EXPORT_W / EXPORT_H, 10, 5000);
    fitCamera(cam, EXPORT_W / EXPORT_H, 455, 600, -10);
    const comp = document.createElement('canvas'); comp.width = EXPORT_W; comp.height = EXPORT_H;
    exp = { r, cam, can, comp, g: comp.getContext('2d') }; return exp;
  }
  // Storyboard: 0–1 closed front · 1–2.5 opens with a slight 3D angle · 2.5–5 photos slide in, gloss sweeps · 5–6 hold + brand
  function pose(t) {
    const open = ease(clamp01((t - 1) / 1.5));
    setFold(Math.PI * (1 - open));
    flipG.rotation.y = 0;
    tilt.rotation.set(lerp(0.0, 0.13, open), lerp(0.0, -0.2, open), 0);
    const list = mode === 'mine' && photos.length ? photos : null;
    if (list) {
      const n = list.length, span = 2.1, step = n > 1 ? Math.min(0.45, (span - 0.55) / (n - 1)) : 0;
      list.forEach((p, i) => updatePhoto(p, (t - 2.5 - i * step) / 0.55));
    } else {
      realL.visible = realR.visible = true;
      realL.position.y = (yT - 180) + (1 - easeOut(clamp01((t - 2.5) / 0.7))) * 280;
      realR.position.y = (yT - 180) + (1 - easeOut(clamp01((t - 3.0) / 0.7))) * 280;
    }
    glossU.uPos.value = lerp(-420, 520, clamp01((t - 3.6) / 1.4));
  }
  function restoreLive() {
    realL.position.y = realR.position.y = yT - 180;
    for (const p of photos) updatePhoto(p, 1);
    refreshMode();
  }
  function drawFrame(t) {
    const E = exporter();
    pose(t);
    E.r.render(scene, E.cam);
    const g = E.g;
    const grd = g.createLinearGradient(0, 0, 0, EXPORT_H);
    grd.addColorStop(0, '#f1efea'); grd.addColorStop(1, '#e3e0d8');
    g.fillStyle = grd; g.fillRect(0, 0, EXPORT_W, EXPORT_H);
    const rg = g.createRadialGradient(EXPORT_W / 2, EXPORT_H * .42, 80, EXPORT_W / 2, EXPORT_H * .45, EXPORT_H * .75);
    rg.addColorStop(0, 'rgba(255,255,255,0.55)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.fillRect(0, 0, EXPORT_W, EXPORT_H);
    g.drawImage(E.can, 0, 0);
    const a = clamp01((t - 5) / 0.4);
    if (a > 0) {
      g.globalAlpha = a; g.fillStyle = '#1A1A18'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.font = '500 44px "Space Grotesk", "Helvetica Neue", Arial, sans-serif';
      if ('letterSpacing' in g) g.letterSpacing = '6px';
      g.fillText(brand, EXPORT_W / 2, EXPORT_H - 250);
      if ('letterSpacing' in g) g.letterSpacing = '0px';
      g.globalAlpha = 1;
    }
    return E.comp;
  }
  async function fontsReady() { try { await document.fonts.load('500 44px "Space Grotesk"'); } catch (e) {} }

  async function saveImage() {
    if (busy) return; busy = true;
    try { await fontsReady(); const c = drawFrame(DURATION);
      const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.92));
      showResult(blob, 'image', 'goodfun-bulletin-folder.jpg');
    } finally { restoreLive(); busy = false; }
  }

  async function pickCodec() {
    if (!('VideoEncoder' in window)) return null;
    for (const codec of opts.codecs || ['avc1.640028', 'avc1.4d0028', 'avc1.42e028', 'avc1.42001f']) {
      const cfg = { codec, width: EXPORT_W, height: EXPORT_H, bitrate: 8_000_000, framerate: FPS };
      if (codec.startsWith('avc')) cfg.avc = { format: 'avc' };
      try { const s = await VideoEncoder.isConfigSupported(cfg); if (s.supported) return cfg; } catch (e) {}
    }
    return null;
  }
  async function saveVideo() {
    if (busy) return;
    const cfg = await pickCodec();
    if (!cfg) { say(T.novideo); return; }
    busy = true; const btn = $('.bf-save-vid'); const label = btn.textContent;
    try {
      await fontsReady();
      const { Muxer, ArrayBufferTarget } = await import(opts.muxerUrl || './vendor/mp4-muxer.mjs');
      const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: cfg.codec.startsWith('vp09') ? 'vp9' : 'avc', width: EXPORT_W, height: EXPORT_H, frameRate: FPS }, fastStart: 'in-memory' });
      let err = null;
      const enc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: e => { err = e; } });
      enc.configure(cfg);
      const total = FPS * DURATION;
      for (let i = 0; i < total; i++) {
        if (err) throw err;
        const c = drawFrame(i / FPS);
        const vf = new VideoFrame(c, { timestamp: Math.round(i * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
        enc.encode(vf, { keyFrame: i % (FPS * 2) === 0 }); vf.close();
        if (enc.encodeQueueSize > 6) await new Promise(r => { const chk = () => enc.encodeQueueSize > 2 ? setTimeout(chk, 5) : r(); chk(); });
        if (i % 6 === 0) { btn.textContent = `${T.making} ${Math.round(i / total * 100)}%`; await new Promise(r => setTimeout(r, 0)); }
      }
      await enc.flush(); enc.close(); muxer.finalize();
      showResult(new Blob([muxer.target.buffer], { type: 'video/mp4' }), 'video', 'goodfun-bulletin-folder.mp4');
    } catch (e) { console.error(e); say(T.novideo); }
    finally { btn.textContent = label; restoreLive(); busy = false; }
  }
  $('.bf-save-img').addEventListener('click', saveImage);
  $('.bf-save-vid').addEventListener('click', saveVideo);

  // ---------- result sheet ----------
  const modal = $('.bf-modal');
  let lastUrl = null;
  function showResult(blob, kind, name) {
    if (lastUrl) URL.revokeObjectURL(lastUrl);
    const url = lastUrl = URL.createObjectURL(blob);
    const box = $('.bf-result'); box.innerHTML = '';
    const el = document.createElement(kind === 'video' ? 'video' : 'img');
    el.src = url; if (kind === 'video') { el.controls = true; el.loop = true; el.muted = true; el.playsInline = true; el.autoplay = true; } else el.alt = '';
    box.appendChild(el);
    const a = $('.bf-download'); a.href = url; a.download = name;
    const file = new File([blob], name, { type: blob.type });
    const sh = $('.bf-share');
    sh.hidden = !(navigator.canShare && navigator.canShare({ files: [file] }));
    sh.onclick = () => navigator.share({ files: [file] }).catch(() => {});
    $('.bf-note').textContent = kind === 'image' ? T.longpress : '';
    modal.hidden = false; $('.bf-close').focus();
  }
  $('.bf-close').addEventListener('click', () => { modal.hidden = true; });
  modal.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.hidden = true; });

  return { addFiles, clearPhotos, saveImage, saveVideo };
}
