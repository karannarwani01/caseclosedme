"""Draw a protector as line art, straight from its GLB.

The spec sheets are transparent wireframes - every edge shows, near and far
alike - so there is no hidden-line pass here. What matters is picking the right
edges: a triangulated box is full of diagonals that were never meant to be seen,
so an edge is kept only where the two faces meeting along it actually turn a
corner. Boundary edges are always kept.

The lid is lifted clear of the body, the way every other sheet in the range
draws it.
"""

import json
import struct
import sys

import numpy as np
from PIL import Image, ImageDraw

MAGNET_MESH, LID_MESH, BODY_MESH, LOGO_MESH = 0, 1, 2, 3
CREASE_DEG = 12.0  # below this the two faces are effectively coplanar


# ----------------------------------------------------------------- glb reading
def load(path):
    b = open(path, "rb").read()
    jlen = struct.unpack_from("<I", b, 12)[0]
    j = json.loads(b[20 : 20 + jlen])
    bin_ = b[20 + jlen + 8 :]
    return j, bin_


def accessor(j, bin_, idx):
    a = j["accessors"][idx]
    bv = j["bufferViews"][a["bufferView"]]
    off = bv.get("byteOffset", 0) + a.get("byteOffset", 0)
    fmt = {5126: ("f4", 4), 5123: ("u2", 2), 5125: ("u4", 4), 5121: ("u1", 1)}[
        a["componentType"]
    ]
    n = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}[a["type"]]
    stride = bv.get("byteStride") or fmt[1] * n
    raw = np.frombuffer(bin_, dtype=np.dtype("<" + fmt[0]), count=a["count"] * n,
                        offset=off) if stride == fmt[1] * n else None
    if raw is None:  # interleaved
        out = np.empty((a["count"], n), np.float64)
        for i in range(a["count"]):
            out[i] = np.frombuffer(bin_, dtype=np.dtype("<" + fmt[0]), count=n,
                                   offset=off + i * stride)
        return out
    return raw.reshape(a["count"], n).astype(np.float64)


def trs(node):
    m = np.eye(4)
    if "matrix" in node:
        return np.array(node["matrix"]).reshape(4, 4).T
    if "scale" in node:
        m[:3, :3] = np.diag(node["scale"])
    if "rotation" in node:
        x, y, z, w = node["rotation"]
        r = np.array([
            [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
            [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
            [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
        ])
        m[:3, :3] = r @ m[:3, :3]
    if "translation" in node:
        m[:3, 3] = node["translation"]
    return m


def walk(j, keep):
    """Yield (mesh index, world matrix) for every drawn node in the scene."""
    out = []
    scene = j["scenes"][j.get("scene", 0)]

    def rec(i, parent):
        n = j["nodes"][i]
        m = parent @ trs(n)
        if n.get("mesh") in keep:
            out.append((n["mesh"], m))
        for c in n.get("children", []):
            rec(c, m)

    for i in scene["nodes"]:
        rec(i, np.eye(4))
    return out


# --------------------------------------------------------------- edge picking
def feature_edges(verts, tris):
    """Edges where the surface actually turns, plus open boundaries."""
    v = verts
    e0 = v[tris[:, 1]] - v[tris[:, 0]]
    e1 = v[tris[:, 2]] - v[tris[:, 0]]
    nrm = np.cross(e0, e1)
    ln = np.linalg.norm(nrm, axis=1, keepdims=True)
    nrm = np.divide(nrm, np.where(ln == 0, 1, ln))

    # Weld coincident vertices, otherwise an exported box has four copies of
    # every corner and no two faces ever share an edge.
    key = np.round(v, 6)
    _, inv = np.unique(key, axis=0, return_inverse=True)
    t = inv[tris]

    faces = {}
    for fi, (a, b, c) in enumerate(t):
        for p, q in ((a, b), (b, c), (c, a)):
            faces.setdefault((min(p, q), max(p, q)), []).append(fi)

    uniq = np.unique(key, axis=0)
    cos_lim = np.cos(np.radians(CREASE_DEG))
    segs = []
    for (p, q), fs in faces.items():
        if len(fs) == 1:
            segs.append((uniq[p], uniq[q]))
        elif abs(float(nrm[fs[0]] @ nrm[fs[1]])) < cos_lim:
            segs.append((uniq[p], uniq[q]))
    return segs


def mesh_segments(j, bin_, mi, mat):
    p = j["meshes"][mi]["primitives"][0]
    v = accessor(j, bin_, p["attributes"]["POSITION"])
    idx = accessor(j, bin_, p["indices"]).astype(int).ravel()
    tris = idx.reshape(-1, 3)
    segs = feature_edges(v, tris)
    out = []
    for a, b in segs:
        pa = mat @ np.array([*a, 1.0])
        pb = mat @ np.array([*b, 1.0])
        out.append((pa[:3], pb[:3]))
    return out


# ---------------------------------------------------------------- projection
def project(segs, yaw_deg, pitch_deg):
    yaw, pitch = np.radians(yaw_deg), np.radians(pitch_deg)
    ry = np.array([[np.cos(yaw), 0, np.sin(yaw)],
                   [0, 1, 0],
                   [-np.sin(yaw), 0, np.cos(yaw)]])
    rx = np.array([[1, 0, 0],
                   [0, np.cos(pitch), -np.sin(pitch)],
                   [0, np.sin(pitch), np.cos(pitch)]])
    m = rx @ ry
    out = []
    for a, b in segs:
        pa, pb = m @ a, m @ b
        out.append(((pa[0], -pa[1]), (pb[0], -pb[1])))
    return out


def render(path, out_png, yaw=32.0, pitch=26.0, lid_gap=0.34, px=3200,
           heavy=5.0, light=3.0):
    j, bin_ = load(path)
    nodes = walk(j, {MAGNET_MESH, LID_MESH, BODY_MESH})

    body_h = max(
        j["accessors"][j["meshes"][BODY_MESH]["primitives"][0]["attributes"]["POSITION"]]["max"][1],
        0.001,
    )
    gap = body_h * lid_gap

    heavy_segs, light_segs = [], []
    for mi, mat in nodes:
        m = mat.copy()
        if mi in (LID_MESH,):
            m = np.array([[1, 0, 0, 0], [0, 1, 0, gap], [0, 0, 1, 0], [0, 0, 0, 1]]) @ m
        segs = mesh_segments(j, bin_, mi, m)
        (light_segs if mi == MAGNET_MESH else heavy_segs).extend(segs)

    flat_h = project(heavy_segs, yaw, pitch)
    flat_l = project(light_segs, yaw, pitch)
    allpts = np.array([p for s in flat_h + flat_l for p in s])
    lo, hi = allpts.min(0), allpts.max(0)
    span = (hi - lo).max()
    pad = px * 0.02
    k = (px - 2 * pad) / span

    W = int((hi[0] - lo[0]) * k + 2 * pad)
    H = int((hi[1] - lo[1]) * k + 2 * pad)
    im = Image.new("L", (W, H), 255)
    d = ImageDraw.Draw(im)
    to = lambda p: ((p[0] - lo[0]) * k + pad, (p[1] - lo[1]) * k + pad)
    for segs, w in ((flat_l, light), (flat_h, heavy)):
        for a, b in segs:
            d.line([to(a), to(b)], fill=0, width=int(w))

    im = im.resize((W // 2, H // 2), Image.LANCZOS)
    im.convert("RGB").save(out_png)
    print(f"{out_png}  {im.size}  segments {len(flat_h)}+{len(flat_l)}")


if __name__ == "__main__":
    a = sys.argv[1:]
    render(a[0], a[1], **{k: float(v) for k, v in (x.split("=") for x in a[2:])})
