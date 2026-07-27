# 3D models

Saved versions of the 4 inch stackable hard protector model, so a look can be
restored without rebuilding it. The live model is attached to the Shopify
product as `MODEL_3D` media; the viewer settings live in
`components/product/model-viewer-360.tsx`.

To restore one: upload the `.glb` via `stagedUploadsCreate` (resource
`MODEL_3D`), attach it with `productCreateMedia`, delete the previous
`Model3d`, then set the viewer settings listed below.

## Style 1 - clear studio (LIVE, approved 27 Jul 2026)

`acrylic-case-style-1.glb` - preview in `acrylic-case-style-1-preview.png`
(the right-hand panel of the three).

Geometry is the original export, untouched. Only the materials differ from the
file supplied:

| Material         | Setting                                                |
| ---------------- | ------------------------------------------------------ |
| PBR_Glass (x2)   | baseColor `[0.95, 0.965, 0.98, 0.96]`, metallic 0, roughness 0.04, ior 1.49, doubleSided, no metallicRoughnessTexture |
| Neodymium magnet | metallic 1.0, roughness 0.35                           |
| 6-Photoroom      | untouched - this is the etched CASE CLOSED base decal  |

Viewer settings:

```
camera-orbit      35deg 58deg auto
min-camera-orbit  -Infinity 45deg auto
max-camera-orbit  Infinity 100deg auto
environment-image legacy
tone-mapping      commerce
shadow-intensity  0
exposure          1
background        radial-gradient(ellipse at 50% 78%, #6c6e73 0%, #525459 55%, #43454a 100%)
```

Notes on why, so these don't get re-litigated:

- **Shadow stays at 0.** model-viewer's ground shadow renders as a hard dark
  square directly under the etched base logo and ruins it.
- **Opacity tops out at 0.96.** At 1.0 the front wall goes solid and the logo,
  the magnets and the interior all disappear.
- **doubleSided stays on.** Culling back faces makes the panels look thinner,
  not cleaner - the layered inner surfaces are what give the walls body.
- **The backdrop has to stay dark.** Clear acrylic reads through its edge
  highlights, and those only carry against a darker background.

## Style 2 - thick panels (tried, not chosen)

`acrylic-case-style-2.glb` - preview in `acrylic-case-style-2-preview.png`
(left to right: style 1, 1.5x, 2x; this is the 2x on the right).

Style 1 with the panel geometry doubled in thickness, 0.006 -> 0.012 units.
Materials and viewer settings are identical to style 1. Compared side by side
against style 1 and rejected - the thicker rim and base read heavier than the
reference photo. Kept here in case it is wanted later.

How the geometry was changed, in case it needs redoing at another thickness:

- **Walls** move inward only - inner faces `|x| 0.0590 -> 0.0530` and
  `|z| 0.0455 -> 0.0395`. Outer faces stay put, so the case keeps its
  footprint and the four magnets stay embedded in the side walls.
- **Base** grows downward, outer face `y 0 -> -0.006`. It cannot grow upward:
  the etched logo decal sits just above the cavity floor at world y -0.0327,
  so raising the floor would bury it inside the base.
- **Lid** grows upward, top face `y 0.178 -> 0.184`, bottom stays seated on
  the walls. The bevel band moves as a unit so its profile is preserved.

Faces stay axis-aligned throughout, so the existing normals remain correct and
nothing needs recomputing.
