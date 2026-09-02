'use strict';

import { BaseApp } from './BaseApp.js';
import { XZPlaneGrid } from './egneShapes/XZPlaneGrid.js';

/**
 * Oblig 1 - 3D hus og trær.
 *
 * Arver hele rammeverket fra BaseApp:
 *   - canvas og WebGL-kontekst
 *   - shaderpar med posisjon + farge
 *   - kamera med W A S D og V B
 *   - animate() -> calculateFps() -> clearCanvas() -> handleKeys() -> draw()
 *
 * Vi overstyrer bare draw(), altså "hva som skal tegnes".
 */
export class Oblig1App extends BaseApp {

    constructor() {
        super(true);   // true = BaseApp oppretter og tegner koordinatsystemet.

        // Egne figurer opprettes her, ETTER super().
        // Grunnen: BaseShape leser app.gl og app.camera i constructoren sin,
        // og de finnes ikke før BaseApp er ferdig med sin egen constructor.

        // Bakkeplanet: 20x20 ruter, hver 1x1 enhet.
        this.grid = new XZPlaneGrid(this, 20, 1);
        this.grid.initBuffers();   // NB! Må kalles, ellers finnes ingen buffer.
    }

    /**
     * Kalles ca. 60 ganger i sekundet fra BaseApp.animate().
     * Canvaset er allerede tømt når vi kommer hit.
     *
     * @param elapsed Sekunder siden forrige kall. Bruk denne til animasjon,
     *                aldri et fast tall - da går animasjonen ulikt fort på
     *                ulike maskiner.
     */
    draw(elapsed) {
        super.draw(elapsed);   // Tegner koordinatsystemet.

        this.grid.draw(this.baseShaderInfo, elapsed);

        // Neste steg: hus og trær.
    }
}
