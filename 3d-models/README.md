# 3D models

Saved versions of the 4 inch stackable hard protector model, so a look can be
restored without rebuilding it. The live model is attached to the Shopify
product as `MODEL_3D` media; the viewer settings live in
`components/product/model-viewer-360.tsx`.

To restore one: upload the `.glb` via `stagedUploadsCreate` (resource
`MODEL_3D`), attach it with `productCreateMedia`, delete the previous
`Model3d`, then set the viewer settings listed below.

## Style 1 - clear studio (approved 27 Jul 2026)

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
