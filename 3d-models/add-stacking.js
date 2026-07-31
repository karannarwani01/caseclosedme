/**
 * Adds the stackable case's locking features to a protector GLB:
 *
 *   node add-stacking.js <in.glb> <out.glb>
 *
 * A raised plate on top of the lid, and a matching rim around the underside of
 * the base. The rim is the recess: the perimeter stands proud, so the middle it
 * encloses is where the lip of the case below sits. Modelling it as a rim keeps
 * this to added boxes - carving a pocket out of the base would mean a boolean.
 *
 * Both are inset 13% of the footprint and 3mm deep, matching the spec drawing.
 */
const fs = require("fs");

const [inPath, outPath] = process.argv.slice(2);
if (!inPath || !outPath) {
  console.error("usage: node add-stacking.js <in.glb> <out.glb>");
  process.exit(1);
}

const INSET = 0.13;
const STEP = 0.003; // 3mm

const src = fs.readFileSync(inPath);
const jlen = src.readUInt32LE(12);
const j = JSON.parse(src.slice(20, 20 + jlen).toString("utf8"));
let bin = Buffer.from(src.slice(20 + jlen + 8));

const acc = (i) => j.accessors[i];
const meshBox = (mi) => {
  const a = acc(j.meshes[mi].primitives[0].attributes.POSITION);
  return { min: a.min, max: a.max };
};
const lid = meshBox(1);
const body = meshBox(2);

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
const pad = (b) =>
  b.length % 4 ? Buffer.concat([b, Buffer.alloc(4 - (b.length % 4))]) : b;

/** Axis-aligned box as flat-shaded geometry. */
function boxGeom(x0, y0, z0, x1, y1, z1) {
  const faces = [
    [
      [x1, y0, z0],
      [x1, y0, z1],
      [x1, y1, z1],
      [x1, y1, z0],
      [1, 0, 0],
    ],
    [
      [x0, y0, z1],
      [x0, y0, z0],
      [x0, y1, z0],
      [x0, y1, z1],
      [-1, 0, 0],
    ],
    [
      [x0, y1, z0],
      [x1, y1, z0],
      [x1, y1, z1],
      [x0, y1, z1],
      [0, 1, 0],
    ],
    [
      [x0, y0, z1],
      [x1, y0, z1],
      [x1, y0, z0],
      [x0, y0, z0],
      [0, -1, 0],
    ],
    [
      [x0, y0, z1],
      [x0, y1, z1],
      [x1, y1, z1],
      [x1, y0, z1],
      [0, 0, 1],
    ],
    [
      [x1, y0, z0],
      [x1, y1, z0],
      [x0, y1, z0],
      [x0, y0, z0],
      [0, 0, -1],
    ],
  ];
  const pos = [],
    nrm = [],
    idx = [];
  faces.forEach((f, fi) => {
    const n = f[4];
    for (let k = 0; k < 4; k++) {
      pos.push(...f[k]);
      nrm.push(...n);
    }
    const b = fi * 4;
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  });
  return { pos, nrm, idx };
}

/** Append geometry to the buffer and register mesh + node. */
function addMesh(name, g, material, translation) {
  const posB = f32(g.pos),
    nrmB = f32(g.nrm),
    idxB = pad(u16(g.idx));
  const start = bin.length;
  bin = Buffer.concat([bin, posB, nrmB, idxB]);

  const bv = (off, len, target) =>
    j.bufferViews.push({
      buffer: 0,
      byteOffset: off,
      byteLength: len,
      target,
    }) - 1;
  const bvP = bv(start, posB.length, 34962);
  const bvN = bv(start + posB.length, nrmB.length, 34962);
  const bvI = bv(start + posB.length + nrmB.length, idxB.length, 34963);

  const lo = [0, 1, 2].map((k) =>
    Math.min(...g.pos.filter((_, i) => i % 3 === k)),
  );
  const hi = [0, 1, 2].map((k) =>
    Math.max(...g.pos.filter((_, i) => i % 3 === k)),
  );
  const aP =
    j.accessors.push({
      bufferView: bvP,
      componentType: 5126,
      count: g.pos.length / 3,
      type: "VEC3",
      min: lo,
      max: hi,
    }) - 1;
  const aN =
    j.accessors.push({
      bufferView: bvN,
      componentType: 5126,
      count: g.nrm.length / 3,
      type: "VEC3",
    }) - 1;
  const aI =
    j.accessors.push({
      bufferView: bvI,
      componentType: 5123,
      count: g.idx.length,
      type: "SCALAR",
    }) - 1;

  const mesh =
    j.meshes.push({
      name,
      primitives: [
        { attributes: { POSITION: aP, NORMAL: aN }, indices: aI, material },
      ],
    }) - 1;
  j.nodes.push({ name, mesh, translation: [...translation] });
  j.scenes[j.scene || 0].nodes.push(j.nodes.length - 1);
}

// Reuse the acrylic look, minus the textures a plain box has no UVs for.
const glass = j.materials.find((m) => m.name && m.name.includes("Glass"));
const mat =
  j.materials.push({
    name: "PBR_Glass Stacking",
    alphaMode: "BLEND",
    doubleSided: true,
    pbrMetallicRoughness: {
      baseColorFactor: [...glass.pbrMetallicRoughness.baseColorFactor],
      metallicFactor: 0,
      roughnessFactor: glass.pbrMetallicRoughness.roughnessFactor,
    },
    extensions: { KHR_materials_ior: { ior: 1.49 } },
  }) - 1;

const lidNode = j.nodes.find((n) => n.mesh === 1);
const bodyNode = j.nodes.find((n) => n.mesh === 2);
const ix = ((lid.max[0] - lid.min[0]) * INSET) / 2;
const iz = ((lid.max[2] - lid.min[2]) * INSET) / 2;

// Lid: a plate standing proud of the top face.
addMesh(
  "Stacking lip",
  boxGeom(
    lid.min[0] + ix,
    lid.max[1],
    lid.min[2] + iz,
    lid.max[0] - ix,
    lid.max[1] + STEP,
    lid.max[2] - iz,
  ),
  mat,
  lidNode.translation || [0, 0, 0],
);

// Base: four bars forming a rim around the underside, leaving the middle recessed.
const [bx0, , bz0] = body.min,
  [bx1, , bz1] = body.max;
const y0 = body.min[1] - STEP,
  y1 = body.min[1];
const rim = [
  [bx0, y0, bz0, bx1, y1, bz0 + iz],
  [bx0, y0, bz1 - iz, bx1, y1, bz1],
  [bx0, y0, bz0 + iz, bx0 + ix, y1, bz1 - iz],
  [bx1 - ix, y0, bz0 + iz, bx1, y1, bz1 - iz],
];
rim.forEach((r, i) =>
  addMesh(
    `Stacking rim ${i + 1}`,
    boxGeom(...r),
    mat,
    bodyNode.translation || [0, 0, 0],
  ),
);

j.buffers[0].byteLength = bin.length;
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
fs.writeFileSync(outPath, glb);

const c0 = glb.readUInt32LE(12),
  c1 = glb.readUInt32LE(20 + c0);
console.log(
  `${outPath}  lip ${((lid.max[0] - lid.min[0] - 2 * ix) * 1000).toFixed(0)}x` +
    `${((lid.max[2] - lid.min[2] - 2 * iz) * 1000).toFixed(0)}mm, ${STEP * 1000}mm proud  |  ` +
    `rim ${(ix * 1000).toFixed(0)}mm wide under the base  |  ` +
    `${glb.length} bytes, chunks valid: ${28 + c0 + c1 === glb.length}`,
);
