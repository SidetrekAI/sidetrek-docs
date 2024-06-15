# Sidetrek Docs Internal README

## Gotchas
- Astro
  - `sharp` lib required for svg to be used inside <Image /> components. Otherwise, the build will fail because it cannot process the svg properly.