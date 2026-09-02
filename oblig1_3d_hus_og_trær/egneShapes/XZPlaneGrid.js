'use strict';

import { BaseShape } from '../shapes/BaseShape.js';

/**
 * Bakkeplanet: et rutenett i XZ-planet (y = 0), tegnet med gl.LINES.
 *
 * Oppgavekrav: 20x20 ruter, hver rute 1x1 enheter, morkeblae linjer.
 */
export class XZPlaneGrid extends BaseShape {

    /**
     * @param app        Appen (gir tilgang til gl og kamera).
     * @param cells      Antall ruter i hver retning.
     * @param cellSize   Storrelsen paa en rute, i enheter.
     */
    constructor(app, cells = 20, cellSize = 1) {
        super(app);
        this.cells = cells;
        this.cellSize = cellSize;
    }

    /**
     * Fyller this.positions og this.colors.
     * Kalles av BaseShape.initBuffers() - du kaller den aldri selv.
     */
    createVertices() {
        super.createVertices();

        this.positions = [];
        this.colors = [];

        // Morkeblaa: r, g, b, alpha
        const color = [0.0, 0.0, 0.5, 1.0];

        // Rutenettet sentreres om origo, saa det gaar fra -half til +half.
        // Med cells=20 og cellSize=1 blir det fra -10 til +10.
        const half = (this.cells * this.cellSize) / 2;

        // gl.LINES leser TO og TO vertekser og trekker en strek mellom dem.
        // Seks tall = to punkter = en linje. Linjene henger ikke sammen.
        //
        // Med cells = 20 trengs 21 linjer i hver retning: en paa hver side
        // av hver rute. Derfor i <= this.cells, ikke i < this.cells.
        for (let i = 0; i <= this.cells; i++) {

            // i = 0  gir  -half   (foerste linje)
            // i = 20 gir  +half   (siste linje)
            const offset = -half + i * this.cellSize;

            // Linje langs X-aksen: x varierer, z er fast.
            this.positions.push(
                -half, 0, offset,
                 half, 0, offset,
            );
            this.colors.push(...color, ...color);

            // Linje langs Z-aksen: z varierer, x er fast.
            this.positions.push(
                offset, 0, -half,
                offset, 0,  half,
            );
            this.colors.push(...color, ...color);
        }

    }

    /**
     * Bakken staar stille i origo, saa modellmatrisa nullstilles.
     */
    draw(shaderInfo, elapsed, modelMatrix = new Matrix4()) {
        modelMatrix.setIdentity();
        super.draw(shaderInfo, elapsed, modelMatrix);
        this.gl.drawArrays(this.gl.LINES, 0, this.vertexCount);
    }
}
