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

const [out, LMM, WMM, HMM, PER_SIDE] = process.argv.slice(2);
if (!out || !LMM || !WMM || !HMM) {
  console.error(
    "usage: node build-case.js <out.glb> <lengthMM> <widthMM> <bodyHeightMM> [magnetsPerSide]",
  );
  process.exit(1);
}
const perSide = Number(PER_SIDE || 2);
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
// Lid: same outward slide, lifted to sit on the taller walls.
edit(1, ([x, y, z]) => [x + Math.sign(x) * dx, y + dy, z + Math.sign(z) * dz]);

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

// Etched base logo scales with the footprint, limited by the shorter axis so
// it can never overhang the cavity.
for (const n of j.nodes) {
  if (n.mesh === 3 && n.scale) {
    const k = Math.min(L / BASE.L, W / BASE.W);
    n.scale = n.scale.map((s) => s * k);
  }
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
bh.writeUInt32LE(bin.length, 0);
bh.write("BIN\0", 4);
const glb = Buffer.concat([hdr, jh, njson, bh, bin]);
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
