/**
 * Builds a hard-protector GLB at a given size from the style 1 model.
 *
 *   node build-case.js <out.glb> <lengthMM> <widthMM> <bodyHeightMM> [magnetsPerSide]
 *
 * The source model is in metres and already true to scale, so a case of
 * another size is the same shell moved outward - not scaled. That matters:
 * scaling would thicken the acrylic along with the case, when in reality a
 * bigger protector still uses the same 6mm sheet. Moving each surface by a
 * fixed delta keeps the thickness, the corner bevels and the lid seat exactly
 * as they are, which is also why the normals stay valid.
 *
 * Body height excludes the lid, matching how the cases are measured; the lid
 * adds 6mm on top.
 */
const fs = require("fs");

const SRC = __dirname + "/acrylic-case-style-1.glb";
const T = 0.006; // acrylic thickness, metres
const BASE = { L: 0.13, W: 0.103, H: 0.172 }; // style 1, outer body
const BODY_Y = -0.03886354714632034; // body node offset, for placing magnets
const MAG_INSET = 0.0137; // outermost magnet, in from the corner

const [out, LMM, WMM, HMM, PER_SIDE, DIV_MM, DIV_H_MM, LID_MM] =
  process.argv.slice(2);
if (!out || !LMM || !WMM || !HMM) {
  console.error(
    "usage: node build-case.js <out.glb> <lengthMM> <widthMM> <bodyHeightMM> " +
      "[magnetsPerSide] [dividerMM] [dividerHeightMM] [lidMM]",
  );
  process.exit(1);
}
const perSide = Number(PER_SIDE || 2);
const divT = Number(DIV_MM || 0) / 1000; // 0 = no divider
const lidT = Number(LID_MM || 6) / 1000;
const L = LMM / 1000,
  W = WMM / 1000,
  H = HMM / 1000;
const dx = L / 2 - BASE.L / 2,
  dz = W / 2 - BASE.W / 2,
  dy = H - BASE.H;

const src = fs.readFileSync(SRC);
const jlen = src.readUInt32LE(12);
const j = JSON.parse(src.slice(20, 20 + jlen).toString("utf8"));
const bin = Buffer.from(src.slice(20 + jlen + 8));

const edit = (meshIndex, fn) => {
  const p = j.meshes[meshIndex].primitives[0];
  const a = j.accessors[p.attributes.POSITION];
  const bv = j.bufferViews[a.bufferView];
  const base = (bv.byteOffset || 0) + (a.byteOffset || 0);
  const lo = [1e9, 1e9, 1e9],
    hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < a.count; i++) {
    const o = base + i * 12;
    const v = fn([
      bin.readFloatLE(o),
      bin.readFloatLE(o + 4),
      bin.readFloatLE(o + 8),
    ]);
    for (let k = 0; k < 3; k++) {
      bin.writeFloatLE(v[k], o + k * 4);
      lo[k] = Math.min(lo[k], v[k]);
      hi[k] = Math.max(hi[k], v[k]);
    }
  }
  a.min = lo;
  a.max = hi;
};

// Body: every wall surface - outer and inner alike - slides out by the same
// delta, so the gap between them stays at T. The base is left alone.
edit(2, ([x, y, z]) => [
  x + Math.sign(x) * dx,
  y > 0.1 ? y + dy : y,
  z + Math.sign(z) * dz,
]);
// Lid: same outward slide, lifted to sit on the taller walls. The top face
// also moves to whatever lid thickness was asked for, keeping its bevel.
edit(1, ([x, y, z]) => [
  x + Math.sign(x) * dx,
  y > 0.175 ? H + lidT - (0.178 - y) : H,
  z + Math.sign(z) * dz,
]);

// Magnets sit centred in the two long walls, along the top rim. They keep
// their real size at every case size - a bigger case takes more of them, not
// bigger ones - and the outermost pair stays a fixed distance in from the
// corner, with any others spread evenly between.
const magIdx = j.nodes
  .map((n, i) => (n.mesh === 0 ? i : -1))
  .filter((i) => i >= 0);
const template = j.nodes[magIdx[0]];
const span = W / 2 - MAG_INSET;
const zs =
  perSide === 1
    ? [0]
    : Array.from(
        { length: perSide },
        (_, i) => -span + (2 * span * i) / (perSide - 1),
      );
const spots = [];
for (const sx of [-1, 1])
  for (const z of zs) spots.push([sx * (L / 2 - T / 2), H + BODY_Y, z]);

const scene = j.scenes[j.scene || 0];
spots.forEach((t, i) => {
  if (i < magIdx.length) {
    j.nodes[magIdx[i]].translation = t;
  } else {
    j.nodes.push({ ...template, name: `Magnet ${i + 1}`, translation: t });
    scene.nodes.push(j.nodes.length - 1);
  }
});
// Any surplus is dropped from the scene; the node itself is left orphaned,
// which glTF simply ignores.
for (const i of magIdx.slice(spots.length)) {
  const at = scene.nodes.indexOf(i);
  if (at >= 0) scene.nodes.splice(at, 1);
}

// Optional centre divider: a plain acrylic panel standing on the cavity floor,
// spanning front to back, stopping short of the lid. It needs its own geometry
// and its own material - the shell's glass material samples textures on
// TEXCOORD_1, which a bare box has no reason to carry.
let bin2 = bin;
if (divT > 0) {
  const hx = divT / 2;
  const y0 = T;
  const y1 = T + Number(DIV_H_MM || (H - T) * 1000 - 1) / 1000;
  const hz = W / 2 - T;
  const face = (pts, n) => ({ pts, n });
  const faces = [
    face(
      [
        [hx, y0, -hz],
        [hx, y0, hz],
        [hx, y1, hz],
        [hx, y1, -hz],
      ],
      [1, 0, 0],
    ),
    face(
      [
        [-hx, y0, hz],
        [-hx, y0, -hz],
        [-hx, y1, -hz],
        [-hx, y1, hz],
      ],
      [-1, 0, 0],
    ),
    face(
      [
        [-hx, y1, -hz],
        [hx, y1, -hz],
        [hx, y1, hz],
        [-hx, y1, hz],
      ],
      [0, 1, 0],
    ),
    face(
      [
        [-hx, y0, hz],
        [hx, y0, hz],
        [hx, y0, -hz],
        [-hx, y0, -hz],
      ],
      [0, -1, 0],
    ),
    face(
      [
        [-hx, y0, hz],
        [-hx, y1, hz],
        [hx, y1, hz],
        [hx, y0, hz],
      ],
      [0, 0, 1],
    ),
    face(
      [
        [hx, y0, -hz],
        [hx, y1, -hz],
        [-hx, y1, -hz],
        [-hx, y0, -hz],
      ],
      [0, 0, -1],
    ),
  ];
  const pos = [],
    nrm = [],
    idx = [];
  faces.forEach((f, fi) => {
    f.pts.forEach((p) => {
      pos.push(...p);
      nrm.push(...f.n);
    });
    const b = fi * 4;
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  });

  const pad = (b) =>
    b.length % 4 ? Buffer.concat([b, Buffer.alloc(4 - (b.length % 4))]) : b;
  const f32 = (arr) => {
    const b = Buffer.alloc(arr.length * 4);
    arr.forEach((v, i) => b.writeFloatLE(v, i * 4));
    return b;
  };
  const u16 = (arr) => {
    const b = Buffer.alloc(arr.length * 2);
    arr.forEach((v, i) => b.writeUInt16LE(v, i * 2));
    return b;
  };
  const posB = f32(pos),
    nrmB = f32(nrm),
    idxB = pad(u16(idx));
  const start = bin.length;
  bin2 = Buffer.concat([bin, posB, nrmB, idxB]);

  const bvPos =
    j.bufferViews.push({
      buffer: 0,
      byteOffset: start,
      byteLength: posB.length,
      target: 34962,
    }) - 1;
  const bvNrm =
    j.bufferViews.push({
      buffer: 0,
      byteOffset: start + posB.length,
      byteLength: nrmB.length,
      target: 34962,
    }) - 1;
  const bvIdx =
    j.bufferViews.push({
      buffer: 0,
      byteOffset: start + posB.length + nrmB.length,
      byteLength: idxB.length,
      target: 34963,
    }) - 1;

  const aPos =
    j.accessors.push({
      bufferView: bvPos,
      componentType: 5126,
      count: pos.length / 3,
      type: "VEC3",
      min: [-hx, y0, -hz],
      max: [hx, y1, hz],
    }) - 1;
  const aNrm =
    j.accessors.push({
      bufferView: bvNrm,
      componentType: 5126,
      count: nrm.length / 3,
      type: "VEC3",
    }) - 1;
  const aIdx =
    j.accessors.push({
      bufferView: bvIdx,
      componentType: 5123,
      count: idx.length,
      type: "SCALAR",
    }) - 1;

  const glass = j.materials.find((m) => m.name && m.name.includes("Glass"));
  const mat =
    j.materials.push({
      name: "PBR_Glass Divider",
      alphaMode: "BLEND",
      doubleSided: true,
      pbrMetallicRoughness: {
        baseColorFactor: [...glass.pbrMetallicRoughness.baseColorFactor],
        metallicFactor: 0,
        roughnessFactor: glass.pbrMetallicRoughness.roughnessFactor,
      },
      extensions: { KHR_materials_ior: { ior: 1.49 } },
    }) - 1;

  const mesh =
    j.meshes.push({
      name: "Divider",
      primitives: [
        {
          attributes: { POSITION: aPos, NORMAL: aNrm },
          indices: aIdx,
          material: mat,
        },
      ],
    }) - 1;
  const bodyNode = j.nodes.find((n) => n.mesh === 2);
  j.nodes.push({
    name: "Divider",
    mesh,
    translation: [...bodyNode.translation],
  });
  j.scenes[j.scene || 0].nodes.push(j.nodes.length - 1);
  j.buffers[0].byteLength = bin2.length;
}

// Etched base logo scales with the footprint, limited by the shorter axis so
// it can never overhang the cavity. It stays centred on divided cases too -
// the divider crosses it, which is what the real case does.
for (const n of j.nodes.filter((n) => n.mesh === 3 && n.scale)) {
  const k = Math.min(L / BASE.L, W / BASE.W);
  n.scale = n.scale.map((s) => s * k);
}

let njson = Buffer.from(JSON.stringify(j), "utf8");
while (njson.length % 4) njson = Buffer.concat([njson, Buffer.from(" ")]);
const hdr = Buffer.alloc(12);
hdr.write("glTF", 0);
hdr.writeUInt32LE(2, 4);
const jh = Buffer.alloc(8);
jh.writeUInt32LE(njson.length, 0);
jh.write("JSON", 4);
const bh = Buffer.alloc(8);
bh.writeUInt32LE(bin2.length, 0);
bh.write("BIN\0", 4);
const glb = Buffer.concat([hdr, jh, njson, bh, bin2]);
glb.writeUInt32LE(glb.length, 8);
fs.writeFileSync(out, glb);

const b = j.accessors[j.meshes[2].primitives[0].attributes.POSITION];
const l = j.accessors[j.meshes[1].primitives[0].attributes.POSITION];
console.log(
  `${out}  outer ${((b.max[0] - b.min[0]) * 1000).toFixed(0)} x ` +
    `${((b.max[2] - b.min[2]) * 1000).toFixed(0)} x ` +
    `${((l.max[1] - b.min[1]) * 1000).toFixed(0)}mm (body ${(b.max[1] * 1000).toFixed(0)} + lid 6)  ` +
    `${glb.length} bytes`,
);
