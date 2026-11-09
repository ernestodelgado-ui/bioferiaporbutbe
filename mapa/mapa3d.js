/* =========================================================
   MAPA 3D · el Hipódromo de Palermo para recorrer
   El terreno se genera con código a partir del mapa (los lagos se hunden, los pastos se elevan) y se dibuja con líneas de nivel que brillan.
   Sobre él, las estructuras del festival (ingreso, escenario, espacio instagram, baños, informes, descanso, charlas, gastronomía, stands)
   armadas con código en el mismo estilo de línea luminosa. Se gira con el mouse o el dedo, se acerca con la rueda o pellizcando
   y cada punto se puede tocar para volar hasta ahí y ver qué se vive en ese lugar.
   Capa final: para quitarla, borrar este archivo, mapa3d.css y sus líneas en index.html.
   ========================================================= */
(function () {
  const C = window.BIOFERIA;
  const foot = document.querySelector(".areas__mapfoot");
  if (!C || !foot) return;
  const root = document.documentElement;
  const calm = () => root.classList.contains("menos-movimiento");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const COLOR = { rojo: 0xFA3710, turquesa: 0x01DAC7, azul: 0x4C8BFF, amarillo: 0xFED108, rosa: 0xFF00B2 };
  const CSS = { rojo: "#FA3710", turquesa: "#01DAC7", azul: "#4C8BFF", amarillo: "#FED108", rosa: "#FF00B2" };
  const W_MAP = 1920, H_MAP = 1080, UW = 192, UH = 108;                    // el mapa mide 192 × 108 unidades
  const wx = (px) => (px / W_MAP - 0.5) * UW, wz = (py) => (py / H_MAP - 0.5) * UH;

  /* ---------- los lugares (posición en el mapa de 1920 × 1080) ---------- */
  const VERBO = { rojo: "Hacer · Fuego", turquesa: "Conectar · Aire", azul: "Transformar · Agua", amarillo: "Cuidar · Tierra", rosa: "Celebrar · Corazón" };
  const PINS = [
    { id: "ingreso", n: "Ingreso", c: "turquesa", p: [1700, 862], lugar: "Ingreso", big: 1 },
    { id: "escenario", n: "Escenario", c: "rosa", p: [815, 440], lugar: "Escenario y charlas", big: 1 },
    { id: "charlas", n: "Charlas", c: "amarillo", p: [800, 228], lugar: "Escenario y charlas" },
    { id: "desc1", n: "Descanso", c: "amarillo", p: [1040, 240], lugar: "Descanso" },
    { id: "desc2", n: "Descanso", c: "amarillo", p: [1420, 722], lugar: "Descanso" },
    { id: "desc3", n: "Descanso", c: "amarillo", p: [1020, 985], lugar: "Descanso" },
    { id: "ig1", n: "Espacio instagram", c: "turquesa", p: [1792, 525], lugar: "Espacio instagram" },
    { id: "ig2", n: "Espacio instagram", c: "turquesa", p: [740, 935], lugar: "Espacio instagram" },
    { id: "ig3", n: "Espacio instagram", c: "turquesa", p: [1530, 985], lugar: "Espacio instagram" },
    { id: "banos1", n: "Baños", c: "amarillo", p: [215, 205], lugar: null, nota: "Sanitarios del predio." },
    { id: "banos2", n: "Baños", c: "amarillo", p: [1322, 972], lugar: null, nota: "Sanitarios del predio." },
    { id: "gastro", n: "Gastronomía", c: "rojo", p: [352, 132], lugar: null, cat: "Gastronomía" },
    { id: "informes", n: "Informes", c: "azul", p: [1568, 800], lugar: "Informes" },
    { id: "stands1", n: "Stands", c: "rojo", p: [1440, 515], lugar: "Stands", big: 1 },
    { id: "stands2", n: "Stands", c: "rojo", p: [1150, 540], lugar: "Stands" },
    { id: "stands3", n: "Stands", c: "rojo", p: [880, 795], lugar: "Stands" },
    { id: "stands4", n: "Stands", c: "rojo", p: [300, 860], lugar: "Stands" },
    { id: "jardin", n: "Jardinería", c: "amarillo", p: [1665, 450], lugar: "Jardinería" },
    { id: "agua", n: "Recarga de agua", c: "azul", p: [380, 600], lugar: null, nota: "Puesto para recargar tu botella." },
    { id: "repara", n: "Reparación", c: "amarillo", p: [152, 345], lugar: null, nota: "Espacio de reparación." },
  ];
  const FOTO = { ingreso: "ingreso", escenario: "escenario", charlas: "charlas", desc1: "descanso", desc2: "descanso", desc3: "descanso", ig1: "instagram", ig2: "instagram", ig3: "instagram", banos1: "banos", banos2: "banos", informes: "informes",
    stands1: "stand-fuego", stands2: "stand-fuego", stands3: "stand-corazon", stands4: "stand-aire", jardin: "stand-tierra", agua: "stand-agua" };
  const cats = (C.areas && C.areas.categorias) || [];
  const catsDe = (p) => cats.map((c, i) => ({ n: c.n, i: i + 1, l: c.lugar })).filter((c) => (p.lugar && c.l === p.lugar) || (p.cat && c.n === p.cat));

  /* ---------- botón de entrada ---------- */
  const open = document.createElement("button");
  open.type = "button"; open.className = "m3-open";
  open.innerHTML = '<span>Entrar al mapa 3D</span><i aria-hidden="true">→</i>';
  foot.insertBefore(open, foot.firstChild);

  let built = false, ov, canvas, ui = {};
  let renderer, scene, camera, rafId = 0, running = false;
  const cam = { th: 0.5, ph: 0.95, r: 128, tx: 0, tz: 0, tth: 0.5, tph: 0.95, tr: 128, ttx: 0, ttz: 0, auto: true, fly: null };
  let T0 = 0, pinEls = [], pinsData = [], animObjs = [], terrainMat, sel = null;

  /* ---------- ruido y terreno ---------- */
  function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
  function vnoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return hash(xi, yi) * (1 - u) * (1 - v) + hash(xi + 1, yi) * u * (1 - v) + hash(xi, yi + 1) * (1 - u) * v + hash(xi + 1, yi + 1) * u * v; }
  function fbm(x, y) { let a = .5, s = 0, f = 1; for (let k = 0; k < 4; k++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= .5; } return s; }

  function terrenoDesdeMapa(img) {
    const NX = 256, NZ = 144, cv = document.createElement("canvas"); cv.width = NX + 1; cv.height = NZ + 1;
    const g = cv.getContext("2d", { willReadFrequently: true }); g.drawImage(img, 0, 0, NX + 1, NZ + 1);
    const px = g.getImageData(0, 0, NX + 1, NZ + 1).data, N = (NX + 1) * (NZ + 1);
    const H = new Float32Array(N), Wt = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const r = px[i * 4], gg = px[i * 4 + 1], b = px[i * 4 + 2], mn = Math.min(r, gg, b);
      if (gg - r > 30 && b > 130 && b > gg - 40) { H[i] = -3.2; Wt[i] = 1; }                         // agua
      else if (mn > 222) { H[i] = 0; }                                                              // caminos y plazas
      else { const lum = (r * .3 + gg * .59 + b * .11) / 255; H[i] = 1.0 + (1 - lum) * 3.2; }       // pastos: más oscuros = más altos
    }
    const blur = (A, k) => { const B = new Float32Array(N); for (let z = 0; z <= NZ; z++) for (let x = 0; x <= NX; x++) { let s = 0, c = 0;
      for (let dz = -k; dz <= k; dz++) for (let dx = -k; dx <= k; dx++) { const xx = x + dx, zz = z + dz; if (xx < 0 || zz < 0 || xx > NX || zz > NZ) continue; s += A[zz * (NX + 1) + xx]; c++; } B[z * (NX + 1) + x] = s / c; } return B; };
    let Hb = blur(blur(H, 2), 1), Wb = blur(blur(Wt, 2), 2);
    for (let z = 0; z <= NZ; z++) for (let x = 0; x <= NX; x++) { const i = z * (NX + 1) + x; Hb[i] += (fbm(x * .045, z * .045) - .5) * 1.1 + (fbm(x * .16 + 9, z * .16) - .5) * .22; }
    return { NX, NZ, H: Hb, Wt: Wb };
  }

  /* ---------- armado de la escena ---------- */
  function build(img) {
    const THREE = window.THREE;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); renderer.setClearColor(0x03060f, 1);
    scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x03060f, 0.0042);
    const LG = new THREE.Group(); scene.add(LG);                      // todo lo del modo "Líneas" vive acá
    camera = new THREE.PerspectiveCamera(48, 1, 0.5, 600);

    const t = terrenoDesdeMapa(img), { NX, NZ } = t;
    const geo = new THREE.PlaneGeometry(UW, UH, NX, NZ); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, aW = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) { pos.setY(i, t.H[i]); aW[i] = t.Wt[i]; }
    geo.setAttribute("aW", new THREE.BufferAttribute(aW, 1)); geo.computeBoundingSphere();
    terrainMat = new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 } }, extensions: { derivatives: true },
      vertexShader: `uniform float uT; attribute float aW; varying float vH; varying float vW; varying vec2 vXZ; varying float vD;
        void main(){ vec3 p = position; p.y += aW * (sin(p.x*.55 + uT*1.1) + sin(p.z*.7 - uT*.8)) * .09; vH = p.y; vW = aW; vXZ = p.xz;
          vec4 mv = modelViewMatrix * vec4(p, 1.); vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `varying float vH; varying float vW; varying vec2 vXZ; varying float vD;
        void main(){ float sp = .5; float f = vH / sp; float d = abs(fract(f - .5) - .5) / max(fwidth(f), 1e-4);
          float line = 1. - clamp(d - .15, 0., 1.); float glow = exp(-d * .5) * .32;
          float fM = vH / (sp * 5.); float dM = abs(fract(fM - .5) - .5) / max(fwidth(fM), 1e-4); float major = 1. - clamp(dM - .3, 0., 1.);
          vec3 deep = vec3(.012,.025,.07); vec3 cA = vec3(.16,.52,1.); vec3 cW = vec3(.16,.88,.95); vec3 cH = vec3(.78,.93,1.);
          float hn = clamp((vH + 2.) / 6., 0., 1.); vec3 lc = mix(mix(cA, cH, hn*hn), cW, vW * .85);
          vec3 col = deep + lc * (line * (.5 + major * 1.1) + glow);
          float edge = 1. - max(abs(vXZ.x) / 96., abs(vXZ.y) / 54.); col *= smoothstep(0., .1, edge);
          col *= exp(-vD * .0028); gl_FragColor = vec4(col, 1.); }`,
    });
    const terrain = new THREE.Mesh(geo, terrainMat); LG.add(terrain);

    // altura del terreno en cualquier punto (para apoyar las estructuras)
    const hAt = (x, z) => { const u = (x / UW + .5) * NX, v = (z / UH + .5) * NZ, x0 = Math.max(0, Math.min(NX - 1, Math.floor(u))), z0 = Math.max(0, Math.min(NZ - 1, Math.floor(v))), fx = u - x0, fz = v - z0, I = (a, b) => t.H[b * (NX + 1) + a];
      return I(x0, z0) * (1 - fx) * (1 - fz) + I(x0 + 1, z0) * fx * (1 - fz) + I(x0, z0 + 1) * (1 - fx) * fz + I(x0 + 1, z0 + 1) * fx * fz; };

    // polvo de luz flotando
    const N = 420, pp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pp[i * 3] = (Math.random() - .5) * UW * 1.1; pp[i * 3 + 1] = 2 + Math.random() * 38; pp[i * 3 + 2] = (Math.random() - .5) * UH * 1.1; }
    const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    const dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x9fd2ff, size: .45, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending })); LG.add(dust); animObjs.push((tm) => { dust.rotation.y = tm * .008; });

    /* ----- estilo de línea luminosa ----- */
    const fillMat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, side: THREE.DoubleSide, depthWrite: true });
    const lineMat = (c, o) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
    function solid(geometry, c, th = 28, fill = .62) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(geometry, fillMat(0x050d1f, fill)));
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, th), lineMat(c, .95)));
      return g;
    }
    function lines(points, c, o = .95, loop = false) { const geometry = new THREE.BufferGeometry().setFromPoints(points); return new (loop ? THREE.LineLoop : THREE.Line)(geometry, lineMat(c, o)); }
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const tube = (pts, r, c, seg = 28, closed = false) => solid(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), seg, r, 5, closed), c, 40, .7);
    const box = (w, h, d, c, x, y, z, fill) => { const m = solid(new THREE.BoxGeometry(w, h, d), c, 30, fill); m.position.set(x, y + h / 2, z); return m; };
    const arcPts = (R, a0, a1, n, sx = 1, sy = 1) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push(V(Math.cos(a) * R * sx, Math.sin(a) * R * sy, 0)); } return o; };
    const place = (grp, px, py, rot = 0, s = 1) => { const x = wx(px), z = wz(py); grp.position.set(x, hAt(x, z) + .05, z); grp.rotation.y = rot; grp.scale.setScalar(s); LG.add(grp); return grp; };

    /* ----- INGRESO: túnel de arcos con molinetes ----- */
    function pinwheel(c, s) {
      const g = new THREE.Group(), sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(.55, .05, .95, .85); sh.quadraticCurveTo(.35, .5, 0, 0);
      for (let k = 0; k < 6; k++) { const b = solid(new THREE.ShapeGeometry(sh), c, 20, .25); b.rotation.z = k * Math.PI / 3; g.add(b); }
      g.scale.setScalar(s); return g;
    }
    function ingreso() {
      const g = new THREE.Group(), n = 11, wheels = [];
      for (let i = 0; i < n; i++) {
        const s = 1 - i * .062, a = new THREE.Group(); const pts = [V(-6.4 * s, 0, 0), ...arcPts(6.4 * s, Math.PI, 0, 16, 1, 1.15).map((p) => p.clone()), V(6.4 * s, 0, 0)];
        const arco = tube([V(-6.4 * s, 0, 0), V(-6.4 * s, 3 * s, 0), ...arcPts(6.4 * s, Math.PI - .35, .35, 16, 1, 1.05).slice(0, 17).map((p) => V(p.x, p.y + 3 * s, 0)), V(6.4 * s, 3 * s, 0), V(6.4 * s, 0, 0)], .36 * s, i % 2 ? 0x5fb0ff : 0x01DAC7, 40); a.add(arco);
        a.position.z = -i * 3.1; g.add(a);
        if (i < 5) for (let k = 0; k < 6; k++) { const an = Math.PI - .5 - k * (Math.PI - 1) / 5, w = pinwheel(k % 2 ? 0xFF00B2 : 0xFED108, (1.1 - i * .12) * s); w.position.set(Math.cos(an) * 6.8 * s, 3 * s + Math.sin(an) * 6.9 * s, -i * 3.1 + .5); g.add(w); wheels.push(w); }
      }
      animObjs.push((tm) => wheels.forEach((w, i) => { w.rotation.z = tm * (.9 + (i % 3) * .3) * (i % 2 ? 1 : -1); }));
      return g;
    }

    /* ----- ESCENARIO: arco solar ----- */
    function escenario() {
      const g = new THREE.Group();
      g.add(tube([...arcPts(8, Math.PI, 0, 24, 1, 1)].map((p) => V(p.x, p.y + .6, 0)), .5, 0xFF00B2, 40));
      const disc = new THREE.Mesh(new THREE.CircleGeometry(7.4, 40, 0, Math.PI), fillMat(0x1a0820, .45)); disc.position.set(0, .6, -.2); g.add(disc);
      for (let k = 0; k < 11; k++) { const a = Math.PI * (.06 + k * .088), sp = solid(new THREE.ConeGeometry(.55, 6.2, 6), 0xFFB0E8, 30, .5); sp.position.set(Math.cos(a) * 9.4, .6 + Math.sin(a) * 9.2, 0); sp.rotation.z = a - Math.PI / 2 + .12; g.add(sp); }
      const sun = new THREE.Group(); sun.position.set(0, 8.1, 0.3);
      sun.add(lines(arcPts(1.8, 0, Math.PI * 2, 40), 0xFFD0F0, 1, true)); sun.add(lines(arcPts(1.1, 0, Math.PI * 2, 32), 0xFF00B2, 1, true));
      for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12; sun.add(lines([V(Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0), V(Math.cos(a) * 1.8, Math.sin(a) * 1.8, 0)], 0xFFD0F0)); } g.add(sun);
      animObjs.push((tm) => { sun.rotation.z = tm * .25; });
      g.add(box(15, .5, 4, 0xFF00B2, 0, 0, 2.2, .5)); g.add(box(8, .5, 1.6, 0xFF00B2, 0, .5, 4.6, .5)); g.add(box(5, .5, 1.2, 0xFF00B2, 0, 1, 5.8, .5));
      return g;
    }

    /* ----- ESPACIO INSTAGRAM: libélula con columpio ----- */
    function instagram() {
      const g = new THREE.Group(), alas = [];
      [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sy]) => {
        const w = new THREE.Group(), rx = sy > 0 ? 6 : 5, ry = sy > 0 ? 2.1 : 1.7, pts = []; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; pts.push(V(Math.cos(a) * rx + rx, Math.sin(a) * ry, 0)); }
        w.add(lines(pts, 0x01DAC7, 1, true)); for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + .3; w.add(lines([V(0, 0, 0), V(Math.cos(a) * rx + rx, Math.sin(a) * ry, 0)], 0x7fe9df, .55)); }
        w.scale.x = sx; w.position.set(0, 5.8 + (sy > 0 ? .5 : -.4), sy > 0 ? 0 : .5); w.rotation.z = sy * .08 * sx; g.add(w); alas.push([w, sx, sy]);
      });
      g.add(tube([V(-3.6, 0, 0), V(-3.4, 3.4, 0), V(-1.6, 5.6, 0)], .32, 0xdff9f6, 16)); g.add(tube([V(3.6, 0, 0), V(3.4, 3.4, 0), V(1.6, 5.6, 0)], .32, 0xdff9f6, 16));
      g.add(tube([V(-4, 0, .5), V(-3.6, 3, .5), V(-1.4, 5.7, .3)], .25, 0xdff9f6, 16)); g.add(tube([V(4, 0, .5), V(3.6, 3, .5), V(1.4, 5.7, .3)], .25, 0xdff9f6, 16));
      const hub = box(1.6, 1.3, 1.2, 0xffffff, 0, 5.2, 0, .6); g.add(hub);
      const sw = new THREE.Group(); sw.position.set(0, 5.4, 0); sw.add(lines([V(-.9, 0, 0), V(-.9, -4, 0)], 0xffffff)); sw.add(lines([V(.9, 0, 0), V(.9, -4, 0)], 0xffffff)); const seat = box(2.1, .22, .8, 0xffffff, 0, -4.2, 0, .8); sw.add(seat); g.add(sw);
      animObjs.push((tm) => { sw.rotation.x = Math.sin(tm * 1.1) * .22; alas.forEach(([w, sx, sy], i) => { w.rotation.y = Math.sin(tm * 1.4 + i) * .1; }); });
      g.add(box(2.5, .6, 1.4, 0xdff9f6, -4.2, 0, 0, .5)); g.add(box(2.5, .6, 1.4, 0xdff9f6, 4.2, 0, 0, .5));
      return g;
    }

    /* ----- BAÑOS: cabinas con pantalla ondulada ----- */
    function banos() {
      const g = new THREE.Group();
      for (let k = 0; k < 6; k++) g.add(box(1.5, 3.1, 1.5, 0xFED108, (k - 2.5) * 1.8, 0, -.6, .6));
      const pg = new THREE.PlaneGeometry(11, 2.6, 30, 1); const pp = pg.attributes.position; for (let i = 0; i < pp.count; i++) pp.setZ(i, Math.sin(pp.getX(i) * .9) * .5);
      const sc = solid(pg, 0xffe27a, 12, .35); sc.position.set(0, 1.5, 1.2); g.add(sc);
      g.add(box(10.6, .6, .8, 0xFED108, 0, 0, 1.6, .5));
      for (let k = 0; k < 7; k++) { const r = solid(new THREE.IcosahedronGeometry(.34 + (k % 3) * .06, 0), 0xffe27a, 10, .5); r.position.set((k - 3) * 1.45, .9, 1.6); g.add(r); }
      return g;
    }

    /* ----- INFORMES: costillas en espiral, mostrador y red ----- */
    function informes() {
      const g = new THREE.Group();
      for (let k = 0; k < 10; k++) { const a = k * .34, s = 1 - k * .045, pts = arcPts(5.4 * s, 0, Math.PI, 18, 1, .95 + k * .03).map((p) => V(p.x, p.y, 0)); const rib = tube(pts, .22, k % 2 ? 0x4C8BFF : 0x9cc4ff, 22); rib.rotation.y = a; rib.position.set(Math.sin(a) * 1.2, 0, Math.cos(a) * 1.2); g.add(rib); }
      const ct = solid(new THREE.CylinderGeometry(2.4, 2.4, 1.2, 24, 1, true), 0x4C8BFF, 20, .55); ct.position.y = .6; g.add(ct);
      const ng = new THREE.PlaneGeometry(9, 7, 16, 12); const q = ng.attributes.position; for (let i = 0; i < q.count; i++) { const x = q.getX(i), y = q.getY(i); q.setZ(i, 4.6 - (x * x) * .04 - y * y * .05 + Math.sin(x * .8) * .45); }
      ng.rotateX(-Math.PI / 2); const net = new THREE.LineSegments(new THREE.WireframeGeometry(ng), lineMat(0x9cc4ff, .5)); g.add(net);
      return g;
    }

    /* ----- DESCANSO: bancos curvos en capas con maceteros ----- */
    function descanso(seed) {
      const g = new THREE.Group(), loop = [], n = 9; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = 4.2 + Math.sin(a * 2 + seed) * 1.1 + Math.cos(a * 3) * .5; loop.push(V(Math.cos(a) * r * 1.25, 0, Math.sin(a) * r * .8)); }
      for (let k = 0; k < 5; k++) { const p = loop.map((v) => V(v.x, k * .32 + .2, v.z)); g.add(tube(p, .46, 0xFED108, 40, true)); }
      [[-4.6, 0], [3.8, -1.6], [1.2, 2.8]].forEach(([x, z]) => { const m = solid(new THREE.CylinderGeometry(1.4, 1.4, 1.5, 22, 1, true), 0xffe27a, 20, .55); m.position.set(x, .75, z); g.add(m);
        const pl = solid(new THREE.ConeGeometry(.55, 1.6, 6), 0x8dff9a, 20, .3); pl.position.set(x, 1.9, z); g.add(pl); });
      return g;
    }

    /* ----- CHARLAS: pérgola con bancos ----- */
    function charlas() {
      const g = new THREE.Group();
      [[-5, -3.4], [5, -3.4], [-5, 3.4], [5, 3.4]].forEach(([x, z]) => g.add(box(.5, 5.4, .5, 0xFED108, x, 0, z, .6)));
      g.add(box(10.8, .45, .45, 0xFED108, 0, 5.2, -3.4, .6)); g.add(box(10.8, .45, .45, 0xFED108, 0, 5.2, 3.4, .6)); g.add(box(.45, .45, 7.2, 0xFED108, -5, 5.2, 0, .6)); g.add(box(.45, .45, 7.2, 0xFED108, 5, 5.2, 0, .6));
      for (let k = -2; k <= 2; k++) g.add(tube([V(-5, 5.4, k * 1.5), V(0, 6.8, k * 1.5), V(5, 5.4, k * 1.5)], .13, 0xffe27a, 14));
      for (let r = 0; r < 4; r++) { g.add(box(3.2, .7, .6, 0xffe27a, -2, 0, 1 - r * 1.1 + .6, .5)); g.add(box(3.2, .7, .6, 0xffe27a, 2, 0, 1 - r * 1.1 + .6, .5)); }
      g.add(box(6, .55, 1.4, 0xFED108, 0, 0, -2.6, .5));
      return g;
    }

    /* ----- GASTRONOMÍA: velas y barra ----- */
    function gastro() {
      const g = new THREE.Group();
      g.add(box(5.2, 1.3, 1.4, 0xFA3710, 0, 0, 0, .6)); g.add(box(2.6, 2.4, .5, 0xFA3710, -3.4, 0, -1, .5));
      for (let k = 0; k < 2; k++) { const sg = new THREE.PlaneGeometry(6, 4, 14, 8), q = sg.attributes.position; for (let i = 0; i < q.count; i++) q.setZ(i, Math.sin(q.getX(i) * .55 + k) * .7 + q.getY(i) * .15); sg.rotateX(-1.25); const s = solid(sg, 0xff8a6a, 12, .3); s.position.set(k * 2.4 - 1.2, 4.2 + k * .6, -.8 + k * .9); s.rotation.y = k ? -.3 : .25; g.add(s); }
      [[-2.8, -.7], [2.8, -.7], [-2.8, 1.4], [2.8, 1.4]].forEach(([x, z]) => g.add(box(.18, 4.4, .18, 0xFA3710, x, 0, z, .6)));
      for (let k = 0; k < 6; k++) { const pl = solid(new THREE.ConeGeometry(.45, 1.5, 5), 0x8dff9a, 20, .3); pl.position.set(-4.4 + k * 1.7, .8, 2.4); g.add(pl); }
      return g;
    }

    /* ----- STANDS: carpas ----- */
    function carpas(lista, c) {
      const g = new THREE.Group(); lista.forEach(([px, py, rot, col]) => { const x = wx(px), z = wz(py), t2 = solid(new THREE.ConeGeometry(2.1, 2.5, 4), col || c, 20, .55); t2.position.set(x, hAt(x, z) + 1.25, z); t2.rotation.y = Math.PI / 4 + (rot || 0); g.add(t2); }); LG.add(g); return g;
    }

    place(ingreso(), 1700, 862, -0.12, 1);
    place(escenario(), 815, 438, 0, 1.05);
    place(charlas(), 800, 228, 0, .9);
    place(descanso(0), 1040, 240, .2, .8); place(descanso(2), 1420, 722, -.3, .85); place(descanso(4), 1020, 985, .1, .8);
    place(instagram(), 1792, 525, 1.1, .9); place(instagram(), 740, 935, 0, .9); place(instagram(), 1530, 985, 0, .9);
    place(banos(), 215, 205, -0.95, .9); place(banos(), 1322, 972, 0, .9);
    place(gastro(), 352, 132, -.3, .9);
    place(informes(), 1568, 800, 0, .85);
    carpas([[1370, 520], [1415, 512], [1460, 520], [1500, 508], [1345, 525]], 0xFA3710);
    carpas([[1120, 440], [1170, 470], [1120, 505], [1140, 560], [1130, 650], [1180, 600]], 0xFA3710);
    carpas([[830, 765], [880, 760], [975, 770], [790, 815], [850, 840], [1060, 700], [1060, 770]], 0xFF4DC4);
    carpas([[300, 775], [350, 770], [275, 850], [260, 910], [290, 975]], 0xFF8A3A);
    // jardinería: canteros
    { const g = new THREE.Group(); [[-2, -1], [0, 1.2], [2, -1], [-2, 2], [2, 2.4]].forEach(([x, z]) => g.add(box(1.8, .9, 1.4, 0xFED108, x, 0, z, .5))); place(g, 1665, 450, 0, .9); }
    { const g = new THREE.Group(); g.add(box(3.2, 1.4, 2, 0x4C8BFF, 0, 0, 0, .55)); const a = solid(new THREE.CylinderGeometry(.6, .6, 2.2, 12, 1, true), 0x9cc4ff, 20, .4); a.position.set(1.6, 2, 0); g.add(a); place(g, 380, 592, 0, .9); }
    { const g = new THREE.Group(); g.add(box(3.4, 1.5, 2.2, 0xFED108, 0, 0, 0, .55)); place(g, 152, 345, .6, .8); }

    // anillos de color en el suelo bajo cada lugar (el color del elemento)
    PINS.forEach((p) => { const x = wx(p.p[0]), z = wz(p.p[1]), y = hAt(x, z) + .08, a = []; for (let i = 0; i < 48; i++) { const th = i / 48 * Math.PI * 2; a.push(V(x + Math.cos(th) * 9, y, z + Math.sin(th) * 9)); } LG.add(lines(a, COLOR[p.c], .5, true)); });

    // puntos tocables
    pinsData = PINS.map((p) => { const x = wx(p.p[0]), z = wz(p.p[1]); return { p, v: new THREE.Vector3(x, hAt(x, z) + 4.2, z), g: new THREE.Vector3(x, hAt(x, z), z) }; });
    const pinBox = ov.querySelector(".m3__pins");
    pinEls = pinsData.map((d) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "m3__pin" + (d.p.big ? " is-big" : ""); b.style.setProperty("--c", CSS[d.p.c]);
      b.innerHTML = `<i></i><span>${esc(d.p.n)}</span>`; b.setAttribute("aria-label", d.p.n); b.addEventListener("click", () => select(d)); pinBox.appendChild(b); return b;
    });
    window.M3 = { cam, THREE, scene, camera, renderer, LG, hAt, wx, wz, UW, UH, PINS, pinsData, animObjs, img, t, CSS, COLOR, ov, coarse: matchMedia("(pointer: coarse)").matches || innerWidth < 720 };
    document.dispatchEvent(new CustomEvent("m3-built"));
    onResize();
  }

  /* ---------- cámara y entrada ---------- */
  function onResize() { if (!renderer) return; const w = ov.clientWidth, h = ov.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function select(d) {
    sel = d; cam.auto = false; cam.fly = { t: 0, from: { tx: cam.ttx, tz: cam.ttz, tr: cam.tr, tph: cam.tph }, to: { tx: d.g.x, tz: d.g.z, tr: 30, tph: .95 } };
    const p = d.p, cs = catsDe(p);
    ui.info.hidden = false; ui.info.style.setProperty("--c", CSS[p.c]);
    ui.info.innerHTML = `<button type="button" class="m3__x2" aria-label="Cerrar información">×</button>${FOTO[p.id] ? `<img class="m3__foto" src="assets/mapa3d/${FOTO[p.id]}.jpg" alt="Render de ${esc(p.n)}" draggable="false">` : ""}<p class="m3__tag">${esc(VERBO[p.c])}</p><h3>${esc(p.n)}</h3>` +
      (cs.length ? `<p class="m3__lbl">Categorías que viven acá</p><ul>${cs.map((c) => `<li><b>${String(c.i).padStart(2, "0")}</b>${esc(c.n)}</li>`).join("")}</ul>` : `<p class="m3__nota">${esc(p.nota || "")}</p>`) +
      `<button type="button" class="m3__vuelta">Volver a la vista general</button>`;
    ui.info.querySelector(".m3__x2").onclick = ui.info.querySelector(".m3__vuelta").onclick = () => { ui.info.hidden = true; sel = null; cam.fly = { t: 0, from: { tx: cam.ttx, tz: cam.ttz, tr: cam.tr, tph: cam.tph }, to: { tx: 0, tz: 0, tr: 150, tph: .9 } }; };
  }

  function frame(now) {
    if (!running) return; rafId = requestAnimationFrame(frame);
    const tm = (now - T0) / 1000, dt = Math.min(.05, (now - (frame.last || now)) / 1000); frame.last = now;
    if (cam.fly) { cam.fly.t = Math.min(1, cam.fly.t + dt / 1.3); const k = cam.fly.t * cam.fly.t * (3 - 2 * cam.fly.t), f = cam.fly.from, o = cam.fly.to;
      cam.ttx = f.tx + (o.tx - f.tx) * k; cam.ttz = f.tz + (o.tz - f.tz) * k; cam.tr = f.tr + (o.tr - f.tr) * k; cam.tph = f.tph + (o.tph - f.tph) * k; if (cam.fly.t >= 1) cam.fly = null; }
    if (cam.auto && !calm()) cam.tth += dt * .035;
    const e = 1 - Math.pow(.0009, dt);
    cam.th += (cam.tth - cam.th) * e; cam.ph += (cam.tph - cam.ph) * e; cam.r += (cam.tr - cam.r) * e; cam.tx += (cam.ttx - cam.tx) * e; cam.tz += (cam.ttz - cam.tz) * e;
    const sp = Math.sin(cam.ph), cx = cam.tx + Math.sin(cam.th) * sp * cam.r, cz = cam.tz + Math.cos(cam.th) * sp * cam.r, cy = Math.cos(cam.ph) * cam.r + 2;
    camera.position.set(cx, Math.max(cy, 4), cz); camera.lookAt(cam.tx, 1, cam.tz);
    terrainMat.uniforms.uT.value = tm; if (!calm()) animObjs.forEach((f) => f(tm));
    renderer.render(scene, camera);
    // puntos sobre la pantalla
    const w = ov.clientWidth, h = ov.clientHeight;
    pinsData.forEach((d, i) => { const v = d.v.clone().project(camera), el = pinEls[i], dist = camera.position.distanceTo(d.v);
      if (v.z > 1 || v.z < -1 || Math.abs(v.x) > 1.1 || Math.abs(v.y) > 1.1) { el.style.display = "none"; return; }
      el.style.display = ""; el.style.transform = `translate(${((v.x * .5 + .5) * w).toFixed(1)}px, ${((-v.y * .5 + .5) * h).toFixed(1)}px) translate(-50%, -100%)`;
      el.classList.toggle("is-far", dist > 105 && !d.p.big); el.classList.toggle("is-on", sel === d); el.style.zIndex = String(1000 - Math.round(dist)); });
  }

  /* ---------- controles ---------- */
  function controles() {
    const ptrs = new Map(); let lastD = 0, drag = false, pan = false;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    canvas.addEventListener("pointerdown", (e) => { canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); cam.auto = false; cam.fly = null; drag = true; pan = e.button === 2 || e.shiftKey; lastD = 0; });
    canvas.addEventListener("pointermove", (e) => {
      const p = ptrs.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (lastD) cam.tr = clamp(cam.tr * lastD / d, 10, 190); lastD = d; return; }
      if (pan) { const k = cam.r * .0016; cam.ttx -= (Math.cos(cam.th) * dx + Math.sin(cam.th) * dy) * k; cam.ttz -= (-Math.sin(cam.th) * dx + Math.cos(cam.th) * dy) * k; }
      else { cam.tth -= dx * .0052; cam.tph = clamp(cam.tph - dy * .0046, .18, 1.5); }
    });
    const up = (e) => { ptrs.delete(e.pointerId); lastD = 0; if (!ptrs.size) drag = false; };
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("wheel", (e) => { e.preventDefault(); cam.auto = false; cam.fly = null; cam.tr = clamp(cam.tr * (1 + e.deltaY * .0012), 10, 190); }, { passive: false });
    window.addEventListener("keydown", (e) => {
      if (!ov || ov.hidden) return;
      if (e.key === "Escape") { cerrar(); return; }
      const k = e.key.toLowerCase(), st = cam.r * .05; cam.fly = null;
      if (k === "arrowleft" || k === "a") { cam.ttx -= Math.cos(cam.th) * st; cam.ttz += Math.sin(cam.th) * st; } else if (k === "arrowright" || k === "d") { cam.ttx += Math.cos(cam.th) * st; cam.ttz -= Math.sin(cam.th) * st; }
      else if (k === "arrowup" || k === "w") { cam.ttx -= Math.sin(cam.th) * st; cam.ttz -= Math.cos(cam.th) * st; } else if (k === "arrowdown" || k === "s") { cam.ttx += Math.sin(cam.th) * st; cam.ttz += Math.cos(cam.th) * st; }
      else if (k === "+" || k === "=") cam.tr = clamp(cam.tr * .88, 10, 190); else if (k === "-") cam.tr = clamp(cam.tr * 1.14, 10, 190);
    });
  }

  /* ---------- abrir y cerrar ---------- */
  let opener = null;
  function crearOverlay() {
    ov = document.createElement("div"); ov.className = "m3"; ov.hidden = true; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Mapa 3D del Hipódromo de Palermo");
    ov.innerHTML = `<canvas class="m3__cv"></canvas><div class="m3__pins"></div>
      <div class="m3__top"><p class="m3__ttl"><b>Hipódromo</b> de Palermo</p><button type="button" class="m3__close">Cerrar <span aria-hidden="true">×</span></button></div>
      <p class="m3__hint">Arrastrá para girar · rueda o pellizco para acercar · tocá un punto para ir hasta ahí</p>
      <div class="m3__info" hidden></div><div class="m3__load">Armando el predio…</div>`;
    document.body.appendChild(ov); canvas = ov.querySelector(".m3__cv"); ui.info = ov.querySelector(".m3__info");
    ov.querySelector(".m3__close").addEventListener("click", cerrar); window.addEventListener("resize", onResize);
  }
  function cargarThree() { return new Promise((res, rej) => { if (window.THREE) return res(); const s = document.createElement("script"); s.src = "assets/vendor/three.min.js"; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function cargarMapa() { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = C.areas.mapa.src; }); }
  function webgl() { try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; } }

  async function abrir() {
    if (!webgl()) { const m = document.querySelector("[data-open-map]"); if (m) m.click(); return; }
    opener = document.activeElement;
    if (!ov) crearOverlay();
    ov.hidden = false; root.classList.add("m3-lock"); ov.querySelector(".m3__close").focus();
    if (!built) {
      try { const [, img] = await Promise.all([cargarThree(), cargarMapa()]); ov.querySelector(".m3__pins").innerHTML = ""; build(img); controles(); built = true; ov.querySelector(".m3__load").hidden = true; }
      catch (e) { ov.hidden = true; root.classList.remove("m3-lock"); const m = document.querySelector("[data-open-map]"); if (m) m.click(); return; }
    }
    cam.th = cam.tth = .5; cam.ph = cam.tph = .9; cam.r = 175; cam.tr = 150; cam.tx = cam.ttx = cam.tz = cam.ttz = 0; cam.auto = true; cam.fly = null; sel = null; ui.info.hidden = true;
    onResize(); running = true; T0 = performance.now(); frame.last = 0; rafId = requestAnimationFrame(frame);
  }
  function cerrar() { running = false; cancelAnimationFrame(rafId); ov.hidden = true; root.classList.remove("m3-lock"); if (opener && opener.focus) opener.focus(); }
  open.addEventListener("click", abrir);
  // la tarjeta del mapa muestra el 3D (el mapa 2D ya no se usa)
  document.querySelectorAll(".areas__img").forEach((im) => { im.removeAttribute("srcset"); im.src = "assets/mapa/mapa3d-poster.jpg"; im.alt = "Mapa 3D del Hipódromo de Palermo: tocá para recorrerlo"; });
  // el mapa 3D reemplaza al mapa 2D: todo botón que abría el mapa abre ahora el 3D
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-open-map]"); if (b) { e.preventDefault(); e.stopPropagation(); abrir(); } }, true);
})();
