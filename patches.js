/* ═══════════════════════════════════════════════════════════════
   SAMARTHA VASTU v34 — patches.js
   Include AFTER app.js in index.html.

   Handles:
   1. Devata Zone Lines drawing (3×3 proportional grid on built area)
      - True N–S and E–W axes, rotated with compass (same as marmastana)
      - Pivot: house center (Brahmasthana)
      - Equal thirds (proportional area split — no angular/radial slicing)
      - Only 8 directional labels: N, NE, E, SE, S, SW, W, NW
      - No center label (Brahmasthana = silent center)
      - No Devata names inside grid
   2. toggleDevataZoneLines function
   3. State initialization: showDevataZoneLines = false (OFF by default)
   4. State initialization: showPlotDeities = false (OFF by default)
   5. Sync of devataZoneLinesToggle checkbox

   REMOVED: Patch E (Devata name label repainter) — not required.
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    function applyPatches() {

        // ══════════════════════════════════════════════════════
        // PATCH A: Ensure state defaults are correct
        //   showDevataZoneLines → OFF by default
        //   showPlotDeities     → OFF by default (safety net)
        // ══════════════════════════════════════════════════════
        if (typeof state !== 'undefined') {
            if (state.showDevataZoneLines === undefined) {
                state.showDevataZoneLines = false;
            }
            // Perimeter Devata system: default OFF for clean UI
            if (state.showPlotDeities === undefined) {
                state.showPlotDeities = false;
            }
        }

        // ══════════════════════════════════════════════════════
        // PATCH B: toggleDevataZoneLines function
        // ══════════════════════════════════════════════════════
        if (!window.toggleDevataZoneLines) {
            window.toggleDevataZoneLines = function (val) {
                state.showDevataZoneLines = (typeof val === 'boolean') ? val : !state.showDevataZoneLines;
                document.querySelectorAll('#devataZoneLinesToggle').forEach(function (el) {
                    el.checked = state.showDevataZoneLines;
                });
                window.draw();
                window.saveLocal();
                showToast('Devata Zone Grid: ' + (state.showDevataZoneLines ? 'ON' : 'OFF'));
            };
        }

        // ══════════════════════════════════════════════════════
        // PATCH C: Wrap draw() to add Devata 3×3 Zone Grid
        //
        // Design:
        //   • Pivot   = house center (Brahmasthana) in site coords
        //   • Rotation = state.rotation (compass degrees, same as marmastana)
        //   • Grid    = equal thirds of houseEw (EW axis) and houseNs (NS axis)
        //   • Lines   = 2 vertical (EW thirds) + 2 horizontal (NS thirds)
        //   • Labels  = 8 direction labels in 8 outer cells (upright after rotation)
        //   • Center  = no label (Brahmasthana — silent center)
        //   • No fills, no Devata names
        //
        // Coordinate System (matches app.js draw()):
        //   ctx origin → canvas center + pan offset
        //   ctx is Y-flipped (scale 1, -1) so North = +Y (up on screen)
        //   rotation applied at house center so grid follows compass bearing
        // ══════════════════════════════════════════════════════
        if (typeof window.draw === 'function' && !window._devataZoneLinesPatchApplied) {
            window._devataZoneLinesPatchApplied = true;
            var _origDraw = window.draw;

            window.draw = function () {
                // Run original draw first
                _origDraw.apply(this, arguments);

                // Only draw zone grid if toggle is ON
                if (!state || !state.showDevataZoneLines) return;

                var canvas = window.canvas || document.getElementById('vastuCanvas');
                var ctx    = window.ctx    || (canvas && canvas.getContext('2d'));
                if (!canvas || !ctx) return;

                var dpr  = window.devicePixelRatio || 2;
                var rect = canvas.parentElement
                    ? canvas.parentElement.getBoundingClientRect()
                    : null;
                if (!rect || rect.width === 0) return;

                // ── Scale: pixels per foot (same formula as app.js) ──
                var px = 300 / Math.max(state.siteW || 1, state.siteS || 1);

                // ── Site canvas center (matches app.js translate origin) ──
                var siteCanvasCX = (state.siteS * px) / 2;   // EW half
                var siteCanvasCY = (state.siteW * px) / 2;   // NS half

                // ── House dimensions in canvas units ──
                var hEW = (state.houseEw || 0) * px;  // EW span
                var hNS = (state.houseNs || 0) * px;  // NS span

                // ── House SW corner in site coordinates ──
                var hSwX = (state.setW || 0) * px;
                var hSwY = (state.setS || 0) * px;

                // ── House center in site coordinates ──
                var hCX = hSwX + hEW / 2;
                var hCY = hSwY + hNS / 2;

                // ── Compass rotation (degrees → radians, same sign as marmastana) ──
                var angleDeg = state.rotation || 0;
                var angleRad = angleDeg * Math.PI / 180;

                // ── Grid third dimensions ──
                var cw = hEW / 3;   // cell width  (EW direction)
                var ch = hNS / 3;   // cell height (NS direction)

                // ── Half spans for drawing relative to house center ──
                var halfEW = hEW / 2;
                var halfNS = hNS / 2;

                // ══ Begin drawing ══
                ctx.save();

                // 1. Reset transform and apply the same base transform as draw()
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.translate(
                    rect.width  / 2 * dpr + (state.offsetX || 0) * dpr,
                    rect.height / 2 * dpr + (state.offsetY || 0) * dpr
                );
                ctx.scale(state.scale * dpr, state.scale * dpr);
                ctx.scale(1, -1);                        // Y-flip: North = up
                ctx.translate(-siteCanvasCX, -siteCanvasCY);

                // 2. Translate to house center, then rotate (compass-aligned)
                ctx.translate(hCX, hCY);
                ctx.rotate(angleRad);
                // Now: (0,0) = Brahmasthana, axes aligned to N-S and E-W

                // ── Draw 2 vertical lines (EW thirds) ──
                ctx.strokeStyle = 'rgba(20,83,45,0.65)';
                ctx.lineWidth   = 1.4 / (state.scale || 1);
                ctx.setLineDash([5 / (state.scale || 1), 3 / (state.scale || 1)]);

                // Vertical line 1: at -cw/2 from center (= 1/3 from West)  → but draw from -halfEW to +halfNS
                // Lines run full NS span
                ctx.beginPath();
                ctx.moveTo(-halfEW + cw,  -halfNS);
                ctx.lineTo(-halfEW + cw,   halfNS);
                ctx.moveTo(-halfEW + cw * 2, -halfNS);
                ctx.lineTo(-halfEW + cw * 2,  halfNS);
                ctx.stroke();

                // ── Draw 2 horizontal lines (NS thirds) ──
                ctx.beginPath();
                ctx.moveTo(-halfEW, -halfNS + ch);
                ctx.lineTo( halfEW, -halfNS + ch);
                ctx.moveTo(-halfEW, -halfNS + ch * 2);
                ctx.lineTo( halfEW, -halfNS + ch * 2);
                ctx.stroke();

                ctx.setLineDash([]);

                // ── Direction labels at center of each outer cell ──
                // Grid layout (after rotation, grid col=0 is West, row=0 is South):
                //   col 0 = West third, col 1 = Center EW, col 2 = East third
                //   row 0 = South third, row 1 = Center NS, row 2 = North third
                //
                // Label map (col, row) → direction:
                //   (0,2)=NW  (1,2)=N   (2,2)=NE
                //   (0,1)=W   (1,1)=—   (2,1)=E   ← center: no label
                //   (0,0)=SW  (1,0)=S   (2,0)=SE

                var ZONE_LABELS = [
                    { col: 0, row: 2, label: 'NW' },
                    { col: 1, row: 2, label: 'N'  },
                    { col: 2, row: 2, label: 'NE' },
                    { col: 0, row: 1, label: 'W'  },
                    // col:1, row:1 → Brahmasthana — no label
                    { col: 2, row: 1, label: 'E'  },
                    { col: 0, row: 0, label: 'SW' },
                    { col: 1, row: 0, label: 'S'  },
                    { col: 2, row: 0, label: 'SE' }
                ];

                ctx.textAlign    = 'center';
                ctx.textBaseline = 'middle';

                ZONE_LABELS.forEach(function (z) {
                    // Cell center in house-center-relative coords
                    var lx = -halfEW + (z.col + 0.5) * cw;
                    var ly = -halfNS + (z.row + 0.5) * ch;

                    ctx.save();
                    ctx.translate(lx, ly);
                    ctx.rotate(-angleRad);   // counter-rotate so text stays upright on screen
                    ctx.scale(1, -1);        // un-flip text (canvas Y is flipped)
                    ctx.font      = 'bold ' + Math.max(7, 9 / (state.scale || 1)) + 'px Inter, sans-serif';
                    ctx.fillStyle = 'rgba(20,83,45,0.75)';
                    ctx.fillText(z.label, 0, 0);
                    ctx.restore();
                });

                ctx.restore();
            };

            console.log('[Samartha Vastu] Devata Zone Grid patch applied (v2 — rotated, house-center pivot).');
        }

        // ══════════════════════════════════════════════════════
        // PATCH D: Sync devataZoneLinesToggle checkbox UI
        // ══════════════════════════════════════════════════════
        if (typeof window._syncDevataZoneToggleUI === 'function' && !window._dzl_syncPatched) {
            window._dzl_syncPatched = true;
            var _origSyncUI = window._syncDevataZoneToggleUI;
            window._syncDevataZoneToggleUI = function () {
                _origSyncUI.call(this);
                document.querySelectorAll('#devataZoneLinesToggle').forEach(function (el) {
                    el.checked = !!state.showDevataZoneLines;
                });
            };
        }

        console.log('[Samartha Vastu] patches.js v2: All patches applied.');
    }

    // Apply after app.js is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(applyPatches, 300); });
    } else {
        setTimeout(applyPatches, 300);
    }

    // Re-apply on full load to catch draw() defined inside window.onload
    window.addEventListener('load', function () { setTimeout(applyPatches, 600); });

})();