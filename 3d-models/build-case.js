/**
 * Builds a hard-protector GLB at a given size from the style 1 model.
 *
 *   node build-case.js <out.glb> <lengthMM> <widthMM> <bodyHeightMM>
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
const MAG = { x: 0.062, z: 0.03779, y: 0.13314 }; // magnet node translations

const [out, LMM, WMM, HMM] = process.argv.slice(2);
if (!out || !LMM || !WMM || !HMM) {
  console.error("usage: node build-case.js <out.glb> <lengthMM> <widthMM> <bodyHeightMM>");
  process.exit(1);
}
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
    const v = fn([bin.readFloatLE(o), bin.readFloatLE(o + 4), bin.readFloatLE(o + 8)]);
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

// Magnets keep their real size and their distance in from each corner.
for (const n of j.nodes) {
  if (n.mesh === 0 && n.translation) {
    n.translation[0] += Math.sign(n.translation[0]) * dx;
    n.translation[2] += Math.sign(n.translation[2]) * dz;
    n.translation[1] += dy;
  }
  // Etched base logo scales with the footprint, limited by the shorter axis
  // so it can never overhang the cavity.
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
