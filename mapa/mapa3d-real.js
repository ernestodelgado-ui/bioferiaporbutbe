/* =========================================================
   MAPA 3D · vista "Real"
   Luz de tarde con sombras, cielo, pasto, árboles, lagos con brillo y las estructuras sólidas, en madera y telas con los colores de cada elemento.
   Se arma encima del mapa 3D de líneas (mapa3d.js) y se elige con el botón "Líneas / Real" de arriba.
   Capa final: para quitarla, borrar este archivo y su línea en index.html.
   ========================================================= */
(function () {
  document.addEventListener("m3-built", () => {
    const M = window.M3, THREE = M.THREE, { scene, renderer, LG, animObjs, UW, UH, t, wx, wz, pinsData, ov } = M;
    const coarse = M.coarse, W_ = 1920, H_ = 1080;
    const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
    const RG = new THREE.Group(); scene.add(RG);
    renderer.outputEncoding = THREE.sRGBEncoding;

    /* ---------- alturas suaves para la vista real ---------- */
    const NX = t.NX, NZ = t.NZ, HR = new Float32Array(t.H.length);
    for (let i = 0; i < HR.length; i++) HR[i] = t.H[i] < 0 ? t.H[i] * 0.16 : t.H[i] * 0.28;
    // plaza de tierra frente al escenario (el escenario mira hacia el norte y ahí solo había agua)
    const PL = { x: wx(815), z: wz(438) - 15, rx: 19, rz: 12 };
    for (let zz = 0; zz <= NZ; zz++) for (let xx = 0; xx <= NX; xx++) { const q = ((((xx / NX - .5) * UW) - PL.x) / PL.rx) ** 2 + ((((zz / NZ - .5) * UH) - PL.z) / PL.rz) ** 2; if (q < 1.25) { const i = zz * (NX + 1) + xx, k = Math.max(0, Math.min(1, (1.25 - q) / .45)); HR[i] = HR[i] * (1 - k) + .06 * k; } }
    const hR = (x, z) => { const u = (x / UW + .5) * NX, v = (z / UH + .5) * NZ, x0 = Math.max(0, Math.min(NX - 1, Math.floor(u))), z0 = Math.max(0, Math.min(NZ - 1, Math.floor(v))), fx = u - x0, fz = v - z0, I = (a, b) => HR[b * (NX + 1) + a];
      return I(x0, z0) * (1 - fx) * (1 - fz) + I(x0 + 1, z0) * fx * (1 - fz) + I(x0, z0 + 1) * (1 - fx) * fz + I(x0 + 1, z0 + 1) * fx * fz; };

    /* ---------- colores del suelo, sacados del mapa (agua, pasto claro y oscuro, caminos) ---------- */
    const SW = 512, SH = 288, cv = document.createElement("canvas"); cv.width = SW; cv.height = SH;
    const sg = cv.getContext("2d", { willReadFrequently: true }); sg.drawImage(M.img, 0, 0, SW, SH);
    const src = sg.getImageData(0, 0, SW, SH).data, out = sg.createImageData(SW, SH), cls = new Uint8Array(SW * SH);   // 0 camino, 1 agua, 2 pasto, 3 arbusto oscuro
    const mix = (a, b, k) => a + (b - a) * k;
    for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
      const i = y * SW + x, r = src[i * 4], g = src[i * 4 + 1], b = src[i * 4 + 2], mn = Math.min(r, g, b), lum = (r * .3 + g * .59 + b * .11) / 255;
      let R, G, B, c = 0, n = (hash(x * .31, y * .31) - .5) * 14;
      if (g - r > 30 && b > 130 && b > g - 40) { c = 1; R = 143; G = 205; B = 213; }
      else if (mn > 222) { R = 238; G = 228; B = 205; }
      else if (g > r + 8 && g > b + 8) { const k = Math.max(0, Math.min(1, (lum - .28) / .35)); c = lum < .3 ? 3 : 2; R = mix(88, 192, k); G = mix(136, 212, k); B = mix(62, 104, k); }
      else { R = 236; G = 226; B = 200; }
      { const qx = ((x / SW - .5) * UW - PL.x) / PL.rx, qz = ((y / SH - .5) * UH - PL.z) / PL.rz; if (qx * qx + qz * qz < 1) { R = 238; G = 228; B = 205; c = 0; } }
      cls[i] = c; out.data[i * 4] = R + n; out.data[i * 4 + 1] = G + n; out.data[i * 4 + 2] = B + n * .6; out.data[i * 4 + 3] = 255;
    }
    sg.putImageData(out, 0, 0);
    const big = document.createElement("canvas"); big.width = 1024; big.height = 576; const bg = big.getContext("2d"); bg.imageSmoothingQuality = "high"; try { bg.filter = "blur(1.6px)"; } catch (e) { /* sin filtro */ } bg.drawImage(cv, 0, 0, 1024, 576);
    const groundTex = new THREE.CanvasTexture(big); groundTex.encoding = THREE.sRGBEncoding; groundTex.anisotropy = 4;

    /* ---------- terreno real ---------- */
    const geo = new THREE.PlaneGeometry(UW, UH, NX, NZ); geo.rotateX(-Math.PI / 2); const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) pos.setY(i, HR[i]); geo.computeVertexNormals();
    const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1, metalness: 0 })); ground.receiveShadow = true; RG.add(ground);
    // un borde de tierra para que parezca una maqueta
    const rim = new THREE.Mesh(new THREE.BoxGeometry(UW + 1.4, 3.4, UH + 1.4), new THREE.MeshStandardMaterial({ color: 0xd9c9a4, roughness: 1 })); rim.position.y = -1.9 - .8; RG.add(rim);
    // agua
    const water = new THREE.Mesh(new THREE.PlaneGeometry(UW, UH, 1, 1), new THREE.MeshStandardMaterial({ color: 0x8fd0d8, transparent: true, opacity: .62, roughness: .3, metalness: .05 })); water.rotation.x = -Math.PI / 2; water.position.y = -.13; RG.add(water);
    animObjs.push((tm) => { water.position.y = -.13 + Math.sin(tm * .8) * .03; });

    /* ---------- luz, cielo y neblina ---------- */
    const hemi = new THREE.HemisphereLight(0xe6f4f8, 0x7f9a58, .62), sun = new THREE.DirectionalLight(0xfff1d6, .62);
    sun.position.set(-70, 85, 50); sun.castShadow = !coarse; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -105; sc.right = 105; sc.top = 62; sc.bottom = -62; sc.near = 10; sc.far = 260; sun.shadow.bias = -.0006; sun.shadow.normalBias = .4;
    RG.add(hemi); RG.add(sun); renderer.shadowMap.enabled = !coarse; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const skyC = document.createElement("canvas"); skyC.width = 4; skyC.height = 256; const sk = skyC.getContext("2d"), gr = sk.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#a6d9e8"); gr.addColorStop(.55, "#d2edf0"); gr.addColorStop(.85, "#faf3e0"); gr.addColorStop(1, "#fbf4e2"); sk.fillStyle = gr; sk.fillRect(0, 0, 4, 256);
    const skyTex = new THREE.CanvasTexture(skyC); skyTex.encoding = THREE.sRGBEncoding;

    /* ---------- materiales y ayudas ---------- */
    const std = (c, r = .75, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: 0 }, o));
    const WOOD = 0xe0b574, WOODL = 0xf1d4a0, WOODD = 0xc48c4e;
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const TELA = [];
    const artTex = (file, bgc, crop) => { const c = document.createElement("canvas"); c.width = c.height = 512; const x = c.getContext("2d"); x.fillStyle = bgc; x.fillRect(0, 0, 512, 512); const tx = new THREE.CanvasTexture(c); tx.encoding = THREE.sRGBEncoding; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.anisotropy = 4; const im = new Image(); im.onload = () => { if (crop) { x.drawImage(im, crop[0] * im.width, crop[1] * im.height, crop[2] * im.width, crop[3] * im.height, 0, 0, 512, 512); } else { const k = Math.max(512 / im.width, 512 / im.height); x.drawImage(im, (512 - im.width * k) / 2, (512 - im.height * k) / 2, im.width * k, im.height * k); } tx.needsUpdate = true; }; im.src = (file.indexOf("/") > 0 ? "" : "assets/graficas/") + file; return tx; };
    const telaTunel = artTex("assets/telas/tela-tunel.jpg", "#dffcff"), artCol = artTex("bioferia-collage.webp", "#01DAC7"), artAma = artTex("patron-amarillo.webp", "#fed108");
    const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };
    const bx = (w, h, d, c, x, y, z, r = .8) => mesh(new THREE.BoxGeometry(w, h, d), std(c, r), x, y + h / 2, z);
    const tube = (pts, r, c, seg = 28, closed = false, map = null) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), seg, r, 7, closed), std(map ? 0xffffff : c, .65, map ? { map } : {}));
    const arc = (R, a0, a1, n, sx = 1, sy = 1) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push(V(Math.cos(a) * R * sx, Math.sin(a) * R * sy, 0)); } return o; };
    const ribbon = (pts, w, c, seg = 26, map = null) => { const P = new THREE.CatmullRomCurve3(pts).getPoints(seg), ps = [], ix = [], uvs = []; P.forEach((p, i) => { ps.push(p.x, p.y + w / 2, p.z, p.x, p.y - w / 2, p.z); uvs.push(i / (P.length - 1) * 1.4, 1, i / (P.length - 1) * 1.4, 0); if (i < P.length - 1) { const a = i * 2; ix.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(ps, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(ix); g.computeVertexNormals(); return mesh(g, std(map ? 0xffffff : c, .85, Object.assign({ side: THREE.DoubleSide }, map ? { map } : {}))); };
    const cloth = (w, h, c, bend, x, y, z, rx = 0, ry = 0, o = {}) => { const g = new THREE.PlaneGeometry(w, h, 14, 8), q = g.attributes.position; for (let i = 0; i < q.count; i++) q.setZ(i, Math.sin(q.getX(i) / w * Math.PI * 2) * bend + q.getY(i) * .1 * bend); g.computeVertexNormals(); const m = mesh(g, std(c, .9, Object.assign({ side: THREE.DoubleSide }, o)), x, y, z); m.rotation.set(rx, ry, 0); return m; };
    const plant = (x, y, z, s = 1, c = 0x3f9a3d) => { const g = new THREE.Group(); for (let k = 0; k < 5; k++) { const a = k * 1.26, l = mesh(new THREE.ConeGeometry(.2 * s, 1.3 * s, 4), std(k % 2 ? c : 0x56b84e, .9), Math.cos(a) * .32 * s, .6 * s, Math.sin(a) * .32 * s); l.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); g.add(l); } g.position.set(x, y, z); return g; };
    const shrubTree = (x, y, z, s = 1) => { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(.1 * s, .14 * s, 1.5 * s, 6), std(0x7a5232), 0, .75 * s, 0)); const c = mesh(new THREE.IcosahedronGeometry(.9 * s, 1), std(0x5eaa48, .9, { flatShading: true }), 0, 1.9 * s, 0); g.add(c); g.position.set(x, y, z); return g; };
    const textTex = (txt, w, h, bgc, fg, font) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); if (bgc) { x.fillStyle = bgc; x.fillRect(0, 0, w, h); } x.fillStyle = fg; x.font = font; x.textAlign = "center"; x.textBaseline = "middle"; const lines = txt.split("\n"); lines.forEach((l, i) => x.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * parseInt(font.match(/(\d+)px/)[1]) * 1.1)); const tx = new THREE.CanvasTexture(c); tx.encoding = THREE.sRGBEncoding; return tx; };
    const sign = (txt, w, h, bgc, fg, font, x, y, z) => mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: textTex(txt, 512, Math.round(512 * h / w), bgc, fg, font), roughness: .9 }), x, y, z);
    const finish = (g) => { g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; };
    const put = (g, px, py, rot = 0, s = 1) => { const x = wx(px), z = wz(py); g.position.set(x, hR(x, z), z); g.rotation.y = rot; g.scale.setScalar(s); RG.add(finish(g)); return g; };

    /* ---------- estructuras ---------- */
    function pinwheel(s) { const g = new THREE.Group(), sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(.6, .05, 1, .9); sh.quadraticCurveTo(.35, .5, 0, 0);
      for (let k = 0; k < 6; k++) { const b = mesh(new THREE.ShapeGeometry(sh), std(k % 2 ? 0xffffff : 0x1fc9bd, .6, { side: THREE.DoubleSide })); b.rotation.z = k * Math.PI / 3; g.add(b); } const hub = mesh(new THREE.CylinderGeometry(.16, .16, .12, 10), std(0x1fc9bd), 0, 0, 0.03); hub.rotation.x = Math.PI / 2; g.add(hub); g.scale.setScalar(s); return g; }
    function ingreso() {
      const g = new THREE.Group(), n = 14, wheels = [];
      for (let i = 0; i < n; i++) {
        const s = 1 - i * .05, z = -i * 2.7, a = new THREE.Group();
        const arch = tube([V(-6.4 * s, 0, 0), V(-6.4 * s, 3 * s, 0), ...arc(6.4 * s, Math.PI - .35, .35, 16, 1, 1.05).map((p) => V(p.x, p.y + 3 * s, 0)), V(6.4 * s, 3 * s, 0), V(6.4 * s, 0, 0)], .3 * s, i % 2 ? WOODL : WOOD, 48); arch.scale.z = 2.6; a.add(arch); a.position.z = z; g.add(a);
        if (i < n - 1) {
          const mat = std(0xffffff, .85, { side: THREE.DoubleSide, map: telaTunel });
          const geoT = new THREE.BufferGeometry(), pos = [], uv = [], ix = [], R = 6.2 * s, H = 3 * s, NW = 5, NA = 28, pts = [];
          for (let k = 0; k <= NW; k++) pts.push([-R, H * k / NW]);
          for (let k = 1; k < NA; k++) { const an = Math.PI - Math.PI * k / NA; pts.push([Math.cos(an) * R, H + Math.sin(an) * R]); }
          for (let k = NW; k >= 0; k--) pts.push([R, H * k / NW]);
          [0, 1].forEach((rowI) => pts.forEach((p, k) => { pos.push(p[0], p[1], z - rowI * 2.7); uv.push(k / (pts.length - 1), 1 - (i + rowI) / (n - 1)); }));
          for (let k = 0; k < pts.length - 1; k++) { const q = k, w2 = k + pts.length; ix.push(q, w2, q + 1, q + 1, w2, w2 + 1); }
          geoT.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geoT.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geoT.setIndex(ix); geoT.computeVertexNormals();
          g.add(mesh(geoT, mat));
        }
        if (i < 4) for (let k = 0; k < 7; k++) { const an = Math.PI - .42 - k * (Math.PI - .84) / 6, w = pinwheel((1.5 - i * .24) * s); w.position.set(Math.cos(an) * 6.9 * s, 3 * s + Math.sin(an) * 7.1 * s, z + .55); g.add(w); wheels.push(w); }
        if (i < 8) [-1, 1].forEach((q) => { g.add(bx(1.6 * s, .9, 2.5, WOODL, q * 8 * s, 0, z - 1.35)); g.add(plant(q * 8 * s, .9, z - .8, 1.4 * s)); g.add(plant(q * 8 * s + .3, .9, z - 1.9, 1.1 * s, 0x62b04c)); });
      }
      [-1, 1].forEach((q) => { g.add(bx(.1, 9, .1, 0xdddddd, q * 10, 0, 1.5, .5)); g.add(cloth(2, 6, 0xffffff, .3, q * 10 + 1.1, 5.4, 1.5, 0, 0, { get map() { return TELA[q > 0 ? 2 : 4]; } })); });
      animObjs.push((tm) => wheels.forEach((w, i) => { w.rotation.z = tm * (.9 + (i % 3) * .3) * (i % 2 ? 1 : -1); })); return g;
    }
    function escenario() {
      const g = new THREE.Group();
      g.add(tube(arc(8.2, Math.PI, 0, 26).map((p) => V(p.x, p.y + .8, 1.7)), .55, WOODL, 44));
      g.add(tube(arc(7, Math.PI, 0, 26).map((p) => V(p.x, p.y + .8, 1.2)), .38, WOOD, 40));
      const wall = sign("activemos\nel cambio", 13, 6.6, "#2f6f34", "#ffffff", "300 96px Inter, Arial, sans-serif", 0, 3.6, -1.2); g.add(wall);
      const cols = [0xFF00B2, 0x01DAC7, 0xFA3710, 0xffffff, 0x4C8BFF, 0xFED108];
      for (let k = 0; k < 11; k++) { const a = Math.PI * (.06 + k * .088), sp = mesh(new THREE.ConeGeometry(.7, 6.4, 5), std(WOODL, .7), Math.cos(a) * 9.4, .8 + Math.sin(a) * 9.2, 1.7); sp.rotation.z = a - Math.PI / 2 + .12; g.add(sp);
        g.add(cloth(1.8, 5.4, cols[k % 6], .5, Math.cos(a) * 8.1, 1 + Math.sin(a) * 7.9, -.3, -.1, 0, { opacity: .95, transparent: true, get map() { return TELA[k % 8]; } })); }
      for (let k = 0; k < 9; k++) g.add(cloth(.9, 5, cols[(k + 2) % 6], .4, -6 + k * 1.5, 5.4, -.1, 0, 0, { opacity: .95, transparent: true }));
      const sunD = new THREE.Group(); sunD.position.set(0, 9, 1.9); sunD.add(mesh(new THREE.CylinderGeometry(2, 2, .7, 28), std(WOODD, .6), 0, 0, 0).rotateX(Math.PI / 2));
      for (let k = 0; k < 22; k++) { const a = k * Math.PI / 11, p = mesh(new THREE.ConeGeometry(.28, 1.7, 4), std(WOODL), Math.cos(a) * 2.5, Math.sin(a) * 2.5, 0); p.rotation.z = a - Math.PI / 2; sunD.add(p); } g.add(sunD); animObjs.push((tm) => { sunD.rotation.z = tm * .18; });
      g.add(bx(15, .6, 4.4, WOOD, 0, 0, 2.2)); g.add(bx(9, .6, 1.8, WOODL, 0, .6, 4.9)); g.add(bx(5, .6, 1.4, WOODL, 0, 1.2, 6.2));
      [-7.6, 7.6].forEach((x) => { g.add(bx(.12, 8, .12, 0xdddddd, x * 1.55, 0, 7, .5)); g.add(cloth(2.6, 8.4, 0xffffff, .3, x * 1.55 + 1.2, 4.6, 7, 0, 0, { get map() { return TELA[x < 0 ? 1 : 3]; } })); });
      for (let k = -3; k <= 3; k++) g.add(plant(k * 2, 1.2, 4.2, .9));
      [-1, 1].forEach((q) => { for (let h = 0; h < 3; h++) g.add(bx(1.5, 1.4, 1.3, 0x1a1a1e, q * 6.6, .6 + h * 1.4, 1.2, .5)); });
      for (let k = 0; k < 7; k++) { const a = Math.PI * (.12 + k * .13); g.add(ribbon([V(Math.cos(a) * 7.4, .6 + Math.sin(a) * 7.4, -.2), V(Math.cos(a) * 6.2, -.6 + Math.sin(a) * 6.2, .2), V(Math.cos(a) * 5.6, -2.4 + Math.sin(a) * 5.6, -.1)], 1.2, 0xffffff, 12, artCol)); }
      for (let k = 0; k < 6; k++) g.add(mesh(new THREE.CylinderGeometry(.18, .18, .45, 8), std(0x222, .5), -5 + k * 2, 8.2 - Math.abs(k - 2.5) * .6, 1));
      return g;
    }
    function instagram() {
      const g = new THREE.Group(), alas = [];
      g.add(mesh(new THREE.CylinderGeometry(6.4, 6.4, .34, 40), std(WOODL, .6), 0, .17, 0));
      [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sy]) => {
        const w = new THREE.Group(), rx = sy > 0 ? 7.4 : 6.2, ry = sy > 0 ? 2.6 : 2.1, sh = new THREE.Shape(); sh.absellipse(rx, 0, rx, ry, 0, Math.PI * 2, false);
        const wg = new THREE.ShapeGeometry(sh, 36), wp = wg.attributes.position, wu = []; for (let q = 0; q < wp.count; q++) wu.push(wp.getY(q) / (2 * ry) + .5, wp.getX(q) / (2 * rx)); wg.setAttribute("uv", new THREE.Float32BufferAttribute(wu, 2));
        w.add(mesh(wg, std(0xffffff, .3, { transparent: true, opacity: .9, side: THREE.DoubleSide, map: telaTunel })));
        const pts = []; for (let i = 0; i < 44; i++) { const a = i / 44 * Math.PI * 2; pts.push(V(Math.cos(a) * rx + rx, Math.sin(a) * ry, 0)); } const rim = tube(pts, .17, WOODL, 48, true); rim.scale.z = 1.6; w.add(rim);
        for (let k = 0; k < 5; k++) { const v = mesh(new THREE.BoxGeometry(rx * 1.7, .05, .05), std(0xe9d4a8), rx, 0, 0); v.rotation.z = (k - 2) * .22; w.add(v); }
        w.scale.x = sx; w.position.set(0, 6.9 + (sy > 0 ? .5 : .15), sy > 0 ? -.9 : 1.1); w.rotation.set(sy > 0 ? -1.12 : -1.28, sx * (sy > 0 ? .1 : -.1), 0); g.add(w); alas.push(w);
      });
      [-1, 1].forEach((q) => { [0, .5].forEach((o) => { const t2 = tube([V(q * (4.4 + o), .3, o * .6), V(q * (4.1 + o), 3.6, o * .6), V(q * (1.7 + o * .3), 6.6, o * .3)], .34, o ? WOOD : WOODL, 22); t2.scale.z = 2.2; g.add(t2); }); });
      g.add(bx(1.9, 1.3, 1.3, 0xb8bcc2, 0, 6.2, 0)); const swg = new THREE.Group(); swg.position.set(0, 6.2, 0); [-1, 1].forEach((x) => swg.add(mesh(new THREE.CylinderGeometry(.03, .03, 4.8, 5), std(0xdddddd), x, -2.4, 0))); swg.add(bx(2.4, .2, .95, WOOD, 0, -5, 0)); g.add(swg);
      g.add(sign("activemos\nel cambio", 7.4, 4.6, "#2f6f34", "#ffffff", "300 96px Inter, Arial, sans-serif", 0, 3.4, -2.6));
      for (let k = 0; k < 9; k++) g.add(plant(-3.6 + k * .9, 0, -2.4, 1.3, k % 2 ? 0x3f9a3d : 0x56b84e));
      [-5.2, 5.2].forEach((x) => { g.add(bx(3, 1.2, 2.1, 0xd8d4cc, x, 0, 2.2)); g.add(bx(2.9, 1, .07, WOOD, x, .1, 3.3)); for (let k = 0; k < 5; k++) g.add(plant(x - 1.1 + k * .55, 1.2, 2.2, 1.5)); });
      animObjs.push((tm) => { swg.rotation.x = Math.sin(tm * 1.1) * .2; alas.forEach((w, i) => { w.rotation.z = Math.sin(tm * 1.4 + i) * .04; }); }); return g;
    }
    function fenceTex() {
      const c = document.createElement("canvas"); c.width = 1024; c.height = 300; const x = c.getContext("2d");
      x.fillStyle = "#e3ae62"; x.beginPath(); x.moveTo(0, 60); x.bezierCurveTo(250, 20, 380, 130, 560, 70); x.bezierCurveTo(740, 10, 860, 120, 1024, 40); x.lineTo(1024, 300); x.lineTo(0, 300); x.fill();
      x.fillStyle = "#f6d313"; for (let i = 0; i < 26; i++) { const px = (i * 97) % 1000, py = 80 + (i * 53) % 170; x.beginPath(); x.ellipse(px, py, 40 + (i % 5) * 16, 12 + (i % 3) * 8, (i % 7) * .5, 0, 7); x.fill(); }
      x.strokeStyle = "#1b1b1b"; x.lineWidth = 4; for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo((i * 140) % 1000, 90 + (i * 31) % 160); x.bezierCurveTo(((i * 140) % 1000) + 40, 120, ((i * 140) % 1000) + 90, 200, ((i * 140) % 1000) + 160, 150 + (i % 4) * 30); x.stroke(); }
      x.globalCompositeOperation = "destination-out"; x.lineCap = "round";
      for (let i = 0; i < 9; i++) { x.lineWidth = 16 + (i % 3) * 7; x.beginPath(); x.moveTo(40 + i * 110, 300); x.bezierCurveTo(70 + i * 110, 220, 10 + i * 120, 150, 120 + i * 105, 90); x.stroke(); }
      const t2 = new THREE.CanvasTexture(c); t2.encoding = THREE.sRGBEncoding; return t2;
    }
    function banos() {
      const g = new THREE.Group(), ft = fenceTex();
      for (let k = 0; k < 6; k++) { const x = (k - 2.5) * 1.8; g.add(bx(1.5, 3, 1.5, 0x6e747c, x, 0, -.7, .5)); g.add(mesh(new THREE.BoxGeometry(1.62, .22, 1.62), std(0xf1f3f5, .5), x, 3.1, -.7)); g.add(bx(1.0, 2.2, .06, 0x4f545b, x, .3, .09, .6)); g.add(bx(.12, .12, .08, 0x222, x + .35, 1.3, .13)); }
      [-5.4, -1.8, 1.8, 5.4].forEach((x) => g.add(bx(.3, 3.4, .3, WOODD, x, 0, 1.3)));
      [-3.6, 0, 3.6].forEach((x) => g.add(mesh(new THREE.PlaneGeometry(3.6, 3.2), new THREE.MeshStandardMaterial({ map: ft, alphaTest: .5, side: THREE.DoubleSide, roughness: .8 }), x, 1.9, 1.3)));
      g.add(bx(11.4, .9, 1.1, 0xffffff, 0, 0, 1.95, .8)).material = std(0xffffff, .8, { map: artAma });
      for (let q = 0; q < 12; q++) g.add(plant(-5 + q * .9, .9, 1.95, .8 + (q % 3) * .15, q % 2 ? 0x4b9440 : 0x6bb04a));
      for (let q = 0; q < 5; q++) g.add(mesh(new THREE.DodecahedronGeometry(.35 + (q % 2) * .15, 0), std(0xb9b5ad, .9), -4.6 + q * 2.3, 1.0, 2.2));
      return g;
    }
    function informes() {
      const g = new THREE.Group();
      for (let k = 0; k < 15; k++) { const a = k * .26, s = 1 - k * .028, rib = tube(arc(5.6 * s, 0, Math.PI, 20, 1, .95 + k * .025), .2, k % 3 ? WOODL : WOOD, 26); rib.scale.z = 2.6; rib.rotation.y = a; rib.position.set(Math.sin(a) * 1.4, 0, Math.cos(a) * 1.4); g.add(rib); }
      for (let k = 0; k < 9; k++) { const h = mesh(new THREE.CylinderGeometry(2.45, 2.45, .13, 30), std(k % 2 ? WOODL : WOOD, .7), 0, .07 + k * .13, 0); g.add(h); }
      g.add(mesh(new THREE.CylinderGeometry(2.47, 2.47, 1.05, 30, 1, true, -1.6, 3.2), std(0xffffff, .8, { side: THREE.DoubleSide, map: artTex("criatura-nautilo.webp", "#f3e3c0") }), 0, .6, 0));
      g.add(mesh(new THREE.CylinderGeometry(2.7, 2.7, .14, 30), std(WOODD, .7), 0, 1.3, 0));
      const ng = new THREE.PlaneGeometry(10, 8, 22, 18), q = ng.attributes.position; for (let i = 0; i < q.count; i++) { const x = q.getX(i), y = q.getY(i); q.setZ(i, 5 - x * x * .04 - y * y * .05 + Math.sin(x * .8) * .5 + Math.cos(y * .7) * .3); } ng.rotateX(-Math.PI / 2);
      g.add(new THREE.LineSegments(new THREE.WireframeGeometry(ng), new THREE.LineBasicMaterial({ color: 0xf8f0de })));
      const kn = new THREE.InstancedMesh(new THREE.SphereGeometry(.13, 6, 5), std(0xf8f0de, .9), 220), d2 = new THREE.Object3D(); const gp = ng.attributes.position;
      for (let i = 0; i < 220; i++) { const j = Math.floor(i / 220 * gp.count); d2.position.set(gp.getX(j), gp.getY(j), gp.getZ(j)); d2.updateMatrix(); kn.setMatrixAt(i, d2.matrix); } g.add(kn);
      [-3.4, 3.4].forEach((x) => { g.add(mesh(new THREE.CylinderGeometry(.55, .45, .5, 8), std(0xb98a52, .9), x, .25, 3.6)); g.add(plant(x, .5, 3.6, 1.3)); });
      return g;
    }
    function descanso(seed) {
      const g = new THREE.Group(), loop = [], n = 9; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = 4.2 + Math.sin(a * 2 + seed) * 1.1 + Math.cos(a * 3) * .5; loop.push(V(Math.cos(a) * r * 1.25, 0, Math.sin(a) * r * .8)); }
      for (let k = 0; k < 5; k++) g.add(tube(loop.map((v) => V(v.x, k * .34 + .25, v.z)), .5, k < 3 ? (k % 2 ? 0xfed108 : 0xfff0c2) : 0xa8703a, 44, true, k < 3 ? artAma : null));
      [[-4.6, 0], [3.8, -1.6], [1.2, 2.8]].forEach(([x, z]) => { g.add(mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.5, 24), std(0xa8703a, .7), x, .75, z)); g.add(shrubTree(x, 1.5, z, 2.3)); g.add(shrubTree(x + .6, 1.5, z + .3, 1.7)); g.add(plant(x + 1, 1.5, z, 1.1)); });
      return g;
    }
    function charlas() {
      const g = new THREE.Group();
      [[-5, -3.4], [5, -3.4], [-5, 3.4], [5, 3.4]].forEach(([x, z]) => g.add(bx(.7, 5.6, .7, WOODD, x, 0, z)));
      g.add(bx(10.9, .5, .5, WOOD, 0, 5.4, -3.4)); g.add(bx(10.9, .5, .5, WOOD, 0, 5.4, 3.4)); g.add(bx(.5, .5, 7.2, WOOD, -5, 5.4, 0)); g.add(bx(.5, .5, 7.2, WOOD, 5, 5.4, 0)); g.add(bx(.4, .4, 7.2, WOOD, 0, 5.6, 0)); g.add(bx(10.9, .4, .4, WOOD, 0, 5.6, 0));
      const roof = mesh(new THREE.PlaneGeometry(10.4, 7, 8, 6), std(0xffffff, .8, { side: THREE.DoubleSide, map: artTex("assets/telas/charlas-techo.jpg", "#efd44f", [0, .12, 1, .47]), emissive: 0x4a3f00 }), 0, 5.55, 0); roof.rotation.x = -Math.PI / 2; g.add(roof);
      [[-5, -3.4, 1, 1], [5, -3.4, -1, 1], [-5, 3.4, 1, -1], [5, 3.4, -1, -1]].forEach(([x, z, sx, sz]) => { g.add(tube([V(x, 2.6, z), V(x + sx * .9, 3.9, z + sz * .1), V(x + sx * 2.2, 5.2, z + sz * .1)], .18, WOOD, 16)); g.add(tube([V(x, 2.6, z), V(x + sx * .1, 3.9, z + sz * .9), V(x + sx * .1, 5.2, z + sz * 2.2)], .18, WOOD, 16)); });
      for (let r2 = 0; r2 < 5; r2++) { g.add(bx(3.4, .75, .7, WOOD, -2.2, 0, 1.4 - r2 * 1.1 + .6)); g.add(bx(3.4, .75, .7, WOOD, 2.2, 0, 1.4 - r2 * 1.1 + .6)); }
      g.add(bx(6.4, .35, 1.6, WOODL, 0, 0, -2.7)); g.add(bx(6.4, .35, 1.1, WOODL, 0, .35, -2.9)); g.add(mesh(new THREE.PlaneGeometry(6.6, 3.8), std(0xffffff, .9, { side: THREE.DoubleSide, map: artTex("assets/telas/charlas-fondo.jpg", "#f7f6f1", [0, .27, 1, .4]), emissive: 0x222018 }), 0, 3.0, -3.3));
      for (let i = 0; i < 16; i++) { const x = -4.8 + (i % 8) * 1.4 + (i < 8 ? 0 : .5), z = i < 8 ? -3.3 : 3.3; const vine = mesh(new THREE.ConeGeometry(.16, 1.5 + (i % 3) * .5, 5), std(0x4e9c40, .9), x, 4.6 - (i % 3) * .3, z + (i < 8 ? .2 : -.2)); vine.rotation.x = Math.PI; g.add(vine); }
      [[-5.4, 3.9], [5.4, 3.9], [-5.4, -3.9], [5.4, -3.9]].forEach(([x, z]) => { g.add(bx(1.5, 1, 1.2, WOODL, x, 0, z)); g.add(plant(x, 1, z, 1.3, 0x3f8e3a)); g.add(plant(x + .3, 1, z - .2, 1, 0x62b04c)); });
      return g;
    }
    function gastro() {
      const g = new THREE.Group(); g.add(bx(5.2, 1.3, 1.4, WOOD, 0, 0, 0)); g.add(bx(2.6, 2.6, .5, WOODL, -3.4, 0, -1));
      [[-2.8, -.7], [2.8, -.7], [-2.8, 1.4], [2.8, 1.4]].forEach(([x, z]) => g.add(bx(.2, 4.4, .2, WOODD, x, 0, z)));
      [0xFA3710, 0x01DAC7].forEach((c, k) => g.add(cloth(6, 4, c, .7, k * 2.4 - 1.2, 4.4 + k * .5, -.2 + k * .9, -1.25, k ? -.3 : .25)));
      for (let k = 0; k < 3; k++) { g.add(bx(2.2, .12, .8, WOODL, -3.6 + k * 3.5, .75, 3)); g.add(bx(.12, .75, .12, WOODD, -3.6 + k * 3.5, 0, 3)); }
      for (let k = 0; k < 5; k++) g.add(plant(-4.4 + k * 2.2, 0, 2.2, .9)); return g;
    }
    function kiosk(c1, c2, art) {
      const g = new THREE.Group();
      g.add(bx(5.2, .25, 5.2, WOODL, 0, 0, 0, .7));
      for (let i = 0; i < 9; i++) g.add(bx(.22, 3.6, .12, WOODL, -2.2 + i * .55, .25, -2.3));
      g.add(bx(2.8, 1.15, .9, WOOD, 1.2, .25, 1.4)); g.add(bx(2.7, .95, .06, c1, 1.2, .3, 1.88)); g.add(bx(1.4, 2.4, .6, WOOD, -2.2, .25, 1.6)); g.add(bx(1.3, 1.1, .08, c2, -2.2, .35, 1.92));
      g.add(ribbon([V(-2.4, 1.4, 2), V(-1.6, 3.4, .6), V(0, 4.6, -.6), V(2, 3.8, 0), V(2.6, 1.4, 1.6)], 1.7, c1, 26, art)); g.add(ribbon([V(-2.4, .8, -1.5), V(-1, 2.8, -1.7), V(1, 3.8, -1.2), V(2.4, 2.2, -2)], 1.25, c2)); g.add(ribbon([V(-2.2, 2, .3), V(-.6, 3.5, 1.5), V(1.4, 3.2, 1.9)], .95, c1, 22, art));
      g.add(tube([V(-2.3, .25, 0), V(-2, 2.6, .3), V(-1.7, 3.6, .5)], .13, WOOD, 12)); g.add(tube([V(2.3, .25, -.5), V(2.1, 2.4, -.8), V(1.9, 3.6, -1)], .13, WOOD, 12));
      for (let k = 0; k < 3; k++) g.add(mesh(new THREE.CylinderGeometry(.28, .25, .9, 10), std(WOOD, .7), -.6 + k * .9, .7, .2));
      for (let k = 0; k < 3; k++) { g.add(bx(1.3, .07, .5, WOODD, -2.2, .95 + k * .6, 1.55)); for (let b = 0; b < 4; b++) g.add(mesh(new THREE.CylinderGeometry(.07, .07, .3, 6), std(0xe9d3b0, .8), -2.7 + b * .3, 1.17 + k * .6, 1.55)); }
      for (let b = 0; b < 5; b++) g.add(mesh(new THREE.CylinderGeometry(.06, .06, .28, 6), std(0xe9d3b0, .8), .5 + b * .35, 1.54, 1.4));
      return g;
    }
    const TS = (n, c) => artTex("assets/telas/stand-" + n + ".jpg", "#222", c);
    const STAND0 = { rojo: [0x16110f, 0xFA3710, artTex("criatura-flores.webp", "#16110f")], rosa: [0xffffff, 0xFF00B2, artTex("organismo-rosa.png", "#ffffff")], azul: [0x1f4fe0, 0x7fb8ff, artTex("criatura-nautilo.webp", "#1f4fe0")], amarillo: [0xfff3a8, 0xFED108, artAma], turquesa: [0x01DAC7, 0xFA3710, artTex("criatura-libelula.png", "#01DAC7")] };
    const kioskSpots = []; STAND0.rojo[2] = TS("fuego"); STAND0.rosa[2] = TS("corazon"); STAND0.azul[2] = TS("agua"); STAND0.amarillo[2] = TS("tierra"); STAND0.turquesa[2] = TS("aire");
    const STAND = STAND0;
    TELA.push(TS("fuego", [0, 0, .7, .45]), TS("corazon", [.0, .1, .8, .6]), TS("agua", [.1, .05, .8, .6]), TS("tierra", [0, .45, .9, .55]), TS("aire", [.1, .55, .9, .45]), TS("fuego", [.3, .35, .7, .6]), TS("agua", [.2, .3, .75, .6]), TS("corazon", [0, .35, .8, .6]));
    const stands = (lista, k, s = .95) => lista.forEach(([px, py, rot]) => { kioskSpots.push([px, py, rot || 0, s]); put(kiosk(STAND[k][0], STAND[k][1], STAND[k][2]), px, py, rot || 0, s); });

    put(ingreso(), 1700, 862, -0.12, .62); put(escenario(), 815, 438, 0, 1.05); put(charlas(), 800, 228, 0, 1.4);
    put(descanso(0), 1040, 240, .2, .8); put(descanso(2), 1420, 722, -.3, .85); put(descanso(4), 1020, 985, .1, .8);
    put(instagram(), 1792, 525, 1.1, .9); put(instagram(), 740, 935, 0, .9); put(instagram(), 1530, 985, 0, .9);
    put(banos(), 215, 205, -0.95, .9); put(banos(), 1322, 972, 0, .9); put(gastro(), 352, 132, -.3, 1.25); put(informes(), 1568, 800, 0, .85);
    stands([[1370, 520, .3], [1425, 512, .2], [1480, 522, .4], [1340, 530, 0]], "rojo");
    stands([[1120, 440, 1.3], [1175, 480, 1.3], [1125, 520, 1.3]], "rojo"); stands([[1150, 600, 1.3], [1130, 650, 1.3]], "azul");
    stands([[830, 765, .2], [885, 760, .1], [975, 775, .1], [790, 815, .3], [850, 840, .1]], "rosa"); stands([[1060, 700, 1.3], [1060, 770, 1.3]], "azul");
    stands([[300, 775, 2.7], [350, 770, 2.7], [275, 850, 2.7], [260, 910, 2.7], [290, 975, 2.7]], "turquesa");
    { const g = new THREE.Group(); [[-2, -1], [0, 1.2], [2, -1], [-2, 2.4], [2, 2.4]].forEach(([x, z]) => { g.add(bx(1.9, .9, 1.5, WOOD, x, 0, z)); g.add(plant(x, .9, z, 1, 0x3f9a3d)); }); put(g, 1665, 450, 0, 1.25); }
    { const g = new THREE.Group(); g.add(bx(3.2, 1.6, 2, WOOD, 0, 0, 0)); g.add(mesh(new THREE.CylinderGeometry(.8, .8, 2.4, 14), std(0x4C8BFF, .35), 1.9, 1.2, 0)); g.add(cloth(3.6, 2, 0x4C8BFF, .3, 0, 2.8, 0, -1.2, 0)); put(g, 380, 592, 0, 1.3); }
    { const g = new THREE.Group(); g.add(bx(3.4, 1.8, 2.2, WOOD, 0, 0, 0)); g.add(cloth(4, 2.4, 0xFED108, .3, 0, 3.2, 0, -1.2, 0)); put(g, 152, 345, .6, 1.25); }

    /* ---------- árboles y pasto repartidos por el mapa ---------- */
    const trees = [], tufts = [];
    for (let y = 2; y < SH - 2; y += 3) for (let x = 2; x < SW - 2; x += 3) {
      const c = cls[y * SW + x], h = hash(x * 1.7, y * 2.3);
      if (c === 3 && h < .5) trees.push([x / SW, y / SH, .8 + hash(x, y) * .9]);
      else if (c === 2 && h < .05) trees.push([x / SW, y / SH, .6 + hash(y, x) * .6]);
    }
    for (let y = 1; y < SH - 1; y += 1) for (let x = 1; x < SW - 1; x += 1) { if (cls[y * SW + x] === 2 && hash(x * 3.1, y * 1.9) < (coarse ? .05 : .13)) tufts.push([x / SW, y / SH]); }
    const place3 = (u, v) => { const x = (u - .5) * UW, z = (v - .5) * UH; return [x, hR(x, z), z]; };
    const keep = (x, z) => { for (const p of M.pinsData) { if (p.p.big && Math.hypot(p.g.x - x, p.g.z - z) < 7) return false; } return true; };
    const T = trees.filter(([u, v]) => keep((u - .5) * UW, (v - .5) * UH)).slice(0, coarse ? 260 : 700);
    const dummy = new THREE.Object3D(), col = new THREE.Color();
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.14, .22, 1.8, 6), std(0x7a5232, 1), T.length), crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.25, 1), std(0xffffff, .95, { flatShading: true }), T.length * 2);
    T.forEach(([u, v, s], i) => { const [x, y, z] = place3(u, v); dummy.position.set(x, y + .9 * s, z); dummy.scale.set(s, s, s); dummy.rotation.set(0, i, 0); dummy.updateMatrix(); trunk.setMatrixAt(i, dummy.matrix);
      for (let k = 0; k < 2; k++) { dummy.position.set(x + (k ? .35 : 0) * s, y + (2.3 + k * .85) * s, z + (k ? -.25 : 0) * s); const q = s * (k ? .78 : 1.05); dummy.scale.set(q, q * .92, q); dummy.updateMatrix(); crown.setMatrixAt(i * 2 + k, dummy.matrix);
        col.setHSL(.25 + hash(i, k) * .08, .5 + hash(k, i) * .15, .27 + hash(i * 2, k) * .1); crown.setColorAt(i * 2 + k, col); } });
    trunk.castShadow = crown.castShadow = true; trunk.receiveShadow = crown.receiveShadow = true; RG.add(trunk); RG.add(crown);
    const blades = new THREE.InstancedMesh(new THREE.ConeGeometry(.11, .6, 3), std(0xffffff, 1), tufts.length);
    tufts.forEach(([u, v], i) => { const [x, y, z] = place3(u + (hash(i, 1) - .5) * .003, v + (hash(i, 2) - .5) * .004); dummy.position.set(x, y + .25, z); const s = .6 + hash(i, 3) * .9; dummy.scale.set(s, s * (.7 + hash(i, 4) * .8), s); dummy.rotation.set((hash(i, 5) - .5) * .4, hash(i, 6) * 6, (hash(i, 7) - .5) * .4); dummy.updateMatrix(); blades.setMatrixAt(i, dummy.matrix);
      col.setHSL(.22 + hash(i, 8) * .08, .55, .3 + hash(i, 9) * .14); blades.setColorAt(i, col); }); RG.add(blades);
    // flores sueltas
    const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(.14, 5, 4), std(0xffffff, .8), Math.min(220, tufts.length));
    for (let i = 0; i < fl.count; i++) { const [u, v] = tufts[Math.floor(hash(i, 11) * tufts.length)], [x, y, z] = place3(u, v); dummy.position.set(x, y + .6, z); dummy.scale.setScalar(.8 + hash(i, 12) * .7); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); fl.setMatrixAt(i, dummy.matrix); col.set([0xFF00B2, 0xFED108, 0xffffff, 0xb08cff][i % 4]); fl.setColorAt(i, col); } RG.add(fl);


    /* ---------- gente: camina, charla, se sienta y baila ---------- */
    const palT = [0xFA3710, 0x01DAC7, 0x4C8BFF, 0xFED108, 0xFF00B2, 0xf4f1ea, 0x25252b, 0x6bb04a, 0xe8a0b4, 0x1f3a8a, 0xff8a3a], palP = [0x2b3350, 0x3b3b3b, 0xb9a78a, 0x1f2a44, 0x55616f, 0x6b4f3a], palS = [0xf2c9a0, 0xdcaa82, 0xb77b55, 0x7a4a30, 0xe9b98f];
    const P = [];
    const addP = (o) => { if (o.x !== undefined && o.y === undefined && hR(o.x, o.z) < -.3) return; const i = P.length; P.push(Object.assign({ s: .95 + hash(i, 1) * .22, ph: hash(i, 2) * 6.28, kind: "stand", rot: hash(i, 3) * 6.28, lift: 0 }, o)); };
    const wl = (px, py, rot, s, lx, lz) => { const gx = wx(px), gz = wz(py); return [gx + (lx * Math.cos(rot) + lz * Math.sin(rot)) * s, gz + (-lx * Math.sin(rot) + lz * Math.cos(rot)) * s]; };
    const mkPath = (pts) => { const w = pts.map((p) => (p.length === 2 && Math.abs(p[0]) > 400 ? [wx(p[0]), wz(p[1])] : p)), L = [0]; for (let i = 1; i < w.length; i++) L.push(L[i - 1] + Math.hypot(w[i][0] - w[i - 1][0], w[i][1] - w[i - 1][1])); return { w, L, len: L[L.length - 1] }; };
    const along = (pa, d, loop) => { if (loop) d = ((d % pa.len) + pa.len) % pa.len; else { const c = ((d % (2 * pa.len)) + 2 * pa.len) % (2 * pa.len); d = c < pa.len ? c : 2 * pa.len - c; }
      let i = 1; while (i < pa.L.length - 1 && pa.L[i] < d) i++; const k = (d - pa.L[i - 1]) / Math.max(1e-6, pa.L[i] - pa.L[i - 1]), a = pa.w[i - 1], b = pa.w[i]; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, Math.atan2(b[0] - a[0], b[1] - a[1])]; };
    const walkers = (pa, n, v, loop) => { for (let k = 0; k < n; k++) addP({ kind: "walk", path: pa, loop, d0: pa.len * (k / n) + hash(k, 9) * 3, v: v * (.8 + hash(k, 7) * .5) }); };
    const chat = (cx, cz, n, rad) => { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + hash(cx, k); addP({ kind: "chat", x: cx + Math.cos(a) * rad, z: cz + Math.sin(a) * rad, rot: Math.atan2(-Math.cos(a), -Math.sin(a)) }); } };
    // recorridos por los caminos
    walkers(mkPath([[1640, 880], [1470, 830], [1320, 770], [1250, 700], [1390, 640], [1560, 700], [1660, 800]]), 14, 1.5, true);
    walkers(mkPath([[1340, 575], [1460, 570], [1560, 580], [1480, 610], [1380, 612]]), 8, 1.2, true);
    walkers(mkPath([[560, 905], [700, 880], [860, 885], [990, 900], [1060, 870], [900, 845]]), 7, 1.3, true);
    walkers(mkPath([[1070, 560], [1060, 640], [1110, 720], [1080, 800], [1050, 700]]), 6, 1.3, true);
    { const ip = (lx) => mkPath([wl(1700, 862, -.12, 1, lx, 3), wl(1700, 862, -.12, 1, lx, -34)]); walkers(ip(-1.7), 7, 1.6, false); walkers(ip(1.7), 7, 1.6, false); }
    // escenario: público
    for (let rw = 0; rw < 4; rw++) for (let c = -5; c <= 5; c++) { const [x, z] = wl(815, 438, 0, 1.05, c * 1.7 + (rw % 2) * .85 + (hash(rw, c) - .5) * .5, 9.5 + rw * 1.8); addP({ kind: hash(c, rw) < .7 ? "dance" : "stand", x, z, rot: Math.PI }); }
    { const [x, z] = wl(815, 438, 0, 1.05, 0, 3.2); addP({ x, z, rot: 0, y: hR(x, z) + .6 }); }
    // kioscos: vendedor y clientes
    kioskSpots.forEach(([px, py, rot, s], i) => { let [x, z] = wl(px, py, rot, s, 1.2, 0); addP({ x, z, rot: rot + Math.PI }); [[.6, 3.7], [1.9, 3.9]].slice(0, 1 + (i % 2)).forEach(([lx, lz]) => { [x, z] = wl(px, py, rot, s, lx, lz); addP({ kind: "chat", x, z, rot: rot + Math.PI }); }); });
    // charlas: público sentado y orador
    for (let rw = 0; rw < 5; rw++) [-2.2, 2.2].forEach((lx) => { const [x, z] = wl(800, 228, 0, 1.4, lx + (hash(rw, lx) - .5) * .8, 1.4 - rw * 1.1 + .6); addP({ kind: "sit", x, z, rot: Math.PI, lift: .5 }); });
    { const [x, z] = wl(800, 228, 0, 1.4, 0, -2.4); addP({ x, z, rot: 0, y: hR(x, z) + .45 }); }
    // descanso: sentados y charlando
    [[1040, 240, .2, .8], [1420, 722, -.3, .85], [1020, 985, .1, .8]].forEach(([px, py, rot, s]) => { [[-3.6, 2.4], [3.4, 2.6], [0, 4.2], [-5.4, -1.6]].forEach(([lx, lz]) => { const [x, z] = wl(px, py, rot, s, lx, lz); addP({ kind: "sit", x, z, lift: .4 }); }); const [x, z] = wl(px, py, rot, s, 0, 6.6); chat(x, z, 3, .8); });
    // espacio instagram: columpio y fotos
    [[1792, 525, 1.1, .9], [740, 935, 0, .9], [1530, 985, 0, .9]].forEach(([px, py, rot, s]) => { const [x, z] = wl(px, py, rot, s, 0, 0); addP({ kind: "swing", x, z, rot, gs: s, gr: rot }); [[-2.6, 4.2], [2.4, 4.5], [0, 6]].forEach(([lx, lz]) => { const [xx, zz] = wl(px, py, rot, s, lx, lz); addP({ kind: "chat", x: xx, z: zz, rot: rot + Math.PI }); }); });
    // informes, baños, gastronomía, jardinería, agua, reparación
    { const c = wl(1568, 800, 0, .85, 0, 0); chat(c[0], c[1], 5, 3.6); }
    [[215, 205, -.95, .9], [1322, 972, 0, .9]].forEach(([px, py, rot, s]) => { for (let k = 0; k < 4; k++) { const [x, z] = wl(px, py, rot, s, -4.5 + k * 1.1, 3.6); addP({ x, z, rot: rot + Math.PI }); } });
    { const [vx, vz] = wl(352, 132, -.3, 1.25, 0, -1); addP({ x: vx, z: vz, rot: 0 }); const c = wl(352, 132, -.3, 1.25, 0, 3.4); chat(c[0], c[1], 5, 1.6); }
    { const c = wl(1665, 450, 0, 1.25, 0, 4); chat(c[0], c[1], 3, .9); } { const c = wl(380, 592, 0, 1.3, 0, 3.4); chat(c[0], c[1], 3, .9); } { const c = wl(152, 345, .6, 1.25, 0, 4); chat(c[0], c[1], 2, .8); }
    P.length = 0; const nP = 0, partG = [new THREE.BoxGeometry(.34, .8, .22), new THREE.CylinderGeometry(.2, .25, .75, 8), new THREE.SphereGeometry(.19, 8, 6)];
    const parts = partG.map((geo) => { const m = new THREE.InstancedMesh(geo, std(0xffffff, .85), nP); m.castShadow = !coarse; m.frustumCulled = false; RG.add(m); return m; });
    const cc = new THREE.Color(); P.forEach((p, i) => { cc.set(palP[Math.floor(hash(i, 21) * palP.length)]); parts[0].setColorAt(i, cc); cc.set(palT[Math.floor(hash(i, 22) * palT.length)]); parts[1].setColorAt(i, cc); cc.set(palS[Math.floor(hash(i, 23) * palS.length)]); parts[2].setColorAt(i, cc);
      if (p.x !== undefined && p.y === undefined) p.y = hR(p.x, p.z); });
    const dum = new THREE.Object3D(); let lastT = 0;
    let gente = false; const poblar = (tm) => { if (!gente) return; lastT = tm;
      for (let i = 0; i < nP; i++) { const p = P[i], S = p.s; let x = p.x, z = p.z, y = p.y, rot = p.rot, bob = 0, sw = 0, legS = 1;
        if (p.kind === "walk") { const q = along(p.path, p.d0 + p.v * (tm + 1.8 * Math.sin(tm * .35 + p.ph)), p.loop); x = q[0]; z = q[1]; rot = q[2]; const ph = tm * p.v * 2.6 + p.ph; bob = Math.abs(Math.sin(ph)) * .08; sw = Math.sin(ph) * .06; y = hR(x, z); }
        else if (p.kind === "sit") { legS = .55; y += p.lift; sw = Math.sin(tm * .7 + p.ph) * .02; }
        else if (p.kind === "dance") { bob = Math.abs(Math.sin(tm * 4.2 + p.ph)) * .17; sw = Math.sin(tm * 2.1 + p.ph) * .13; }
        else if (p.kind === "chat") { bob = Math.max(0, Math.sin(tm * 2.2 + p.ph)) * .03; sw = Math.sin(tm * 1.3 + p.ph) * .05; }
        else if (p.kind === "swing") { const a = Math.sin(tm * 1.1) * .2; const [lx, lz] = [0, -5 * Math.sin(a) * p.gs]; x = p.x + (lx * Math.cos(p.gr) + lz * Math.sin(p.gr)); z = p.z + (-lx * Math.sin(p.gr) + lz * Math.cos(p.gr)); y = hR(p.x, p.z) + (6.2 - 5 * Math.cos(a) + .12) * p.gs; legS = .55; }
        if (p.y === undefined) { p.y = hR(x, z); y = p.y; }
        const lh = .8 * S * legS;
        dum.rotation.set(0, rot, sw); dum.position.set(x, y + bob + lh / 2, z); dum.scale.set(S, S * legS, S); dum.updateMatrix(); parts[0].setMatrixAt(i, dum.matrix);
        dum.position.set(x, y + bob + lh + .375 * S, z); dum.scale.set(S, S, S); dum.updateMatrix(); parts[1].setMatrixAt(i, dum.matrix);
        dum.position.set(x, y + bob + lh + .75 * S + .2 * S, z); dum.updateMatrix(); parts[2].setMatrixAt(i, dum.matrix); }
      parts.forEach((m) => { m.instanceMatrix.needsUpdate = true; }); };
    animObjs.push(poblar); parts.forEach((m) => { m.visible = false; });

    /* ---------- día y noche: sigue el botón sol/luna de la página ---------- */
    scene.remove(LG);
    const dayFog = new THREE.FogExp2(0xf5eedb, .0019), nightFog = new THREE.FogExp2(0x0f1a3c, .0024);
    const nc = document.createElement("canvas"); nc.width = 512; nc.height = 512; const nx = nc.getContext("2d"), ng2 = nx.createLinearGradient(0, 0, 0, 512);
    ng2.addColorStop(0, "#050a1c"); ng2.addColorStop(.6, "#16224f"); ng2.addColorStop(.9, "#3a2f66"); ng2.addColorStop(1, "#5a3f70"); nx.fillStyle = ng2; nx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 160; i++) { nx.fillStyle = "rgba(255,255,255," + (.3 + hash(i, 3) * .7) + ")"; const sz = hash(i, 5) < .1 ? 2.2 : 1.2; nx.fillRect(hash(i, 1) * 512, hash(i, 2) * 330, sz, sz); }
    const nightTex = new THREE.CanvasTexture(nc); nightTex.encoding = THREE.sRGBEncoding;
    // luces cálidas y guirnaldas
    const NG = new THREE.Group(); scene.add(NG);
    const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(.16, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffe2a8 }), pinsData.length * 12), dm = new THREE.Object3D(); let bi = 0;
    pinsData.forEach((d) => { const x0 = d.g.x, z0 = d.g.z, y0 = hR(x0, z0), rad = d.p.big ? 10 : 6.5; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; dm.position.set(x0 + Math.cos(a) * rad, y0 + 4.6 - Math.abs(Math.sin(a * 2)) * .7, z0 + Math.sin(a) * rad); dm.updateMatrix(); bulbs.setMatrixAt(bi++, dm.matrix); } });
    NG.add(bulbs);
    [[1700, 862], [815, 438], [1792, 525], [740, 935], [1530, 985], [1568, 800], [800, 228], [1420, 722], [1440, 515], [1150, 540], [880, 795], [300, 860]].slice(0, coarse ? 6 : 12).forEach(([px, py]) => { const x = wx(px), z = wz(py), l = new THREE.PointLight(0xffc98a, 1.15, 34, 1.5); l.position.set(x, hR(x, z) + 6, z); NG.add(l); });
    const waterMat = water.material, groundMat = ground.material;
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "m3__tema"; btn.setAttribute("aria-label", "Cambiar entre modo claro y oscuro");
    btn.innerHTML = '<svg class="sol" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7"/></g></svg><svg class="luna" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" fill="currentColor"/></svg>';
    ov.querySelector(".m3__top").insertBefore(btn, ov.querySelector(".m3__close"));
    btn.addEventListener("click", () => { const b = document.querySelector(".tema-btn"); if (b) b.click(); });

    function aplicar() {
      const noche = document.documentElement.dataset.tema === "oscuro";
      scene.background = noche ? nightTex : skyTex; scene.fog = noche ? nightFog : dayFog; renderer.setClearColor(noche ? 0x16224f : 0xf5eedb, 1);
      hemi.color.set(noche ? 0x6f86c9 : 0xe6f4f8); hemi.groundColor.set(noche ? 0x1a2540 : 0x7f9a58); hemi.intensity = noche ? .32 : .62; groundMat.color.set(noche ? 0x56628a : 0xffffff);
      sun.color.set(noche ? 0xaec3ff : 0xfff1d6); sun.intensity = noche ? .3 : .62; sun.position.set(noche ? 60 : -70, 85, noche ? -40 : 50);
      NG.visible = noche; waterMat.color.set(noche ? 0x2a6f8c : 0x8fd0d8); waterMat.opacity = noche ? .78 : .62; ov.classList.toggle("is-night", noche); btn.setAttribute("aria-pressed", String(noche));
    }
    new MutationObserver(aplicar).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });
    pinsData.forEach((d) => { d.v.y = hR(d.g.x, d.g.z) + 4.2; }); RG.visible = true; aplicar();
  });
})();
