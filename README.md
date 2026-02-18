# Matrix Cube

ØVEL inside the Jovian Matrix Cube (136-Cube): a three-dimensional resonance engine where every slice agrees with every other slice.

## Quickstart

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev`: serve the project locally on port `3000` using Python's HTTP server.
- `npm run check`: syntax-check `sketch.js` and `velas.js` with Node.

## Controls

- Drag or swipe to rotate the view.
- Press `G` to record and download an MP4 capture (`matrix-cube-capture.mp4`).

## Current Visual Defaults

- Background is fixed white (no day/night transition).
- Center logo is fixed to an `rgb(205,205,205)` treatment and rendered at half of the previous size.
- Grid scaffolding and lattice guide strokes use a shared `205` gray.
- Velas render with black fill and colored stroke.
- Relation arcs use the origin vela color, include a subtle fill matching the line color, and persist longer.
- Relation reach and neighbor linking are tuned to allow more simultaneous connections per vela.
