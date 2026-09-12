'use strict';

import { BaseShape } from '../shapes/BaseShape.js';

/**
 * 2D-sirkel med radius 1 i XY-planet, med forsiden mot positiv Z.
 * Tegnes med uniform-shaderen, så fargen sendes inn som uColor.
 *
 * gl.TRIANGLE_FAN: første vertex er sentrum, og hver ny vertex langs kanten
 * lager en ny trekant sammen med sentrum og forrige vertex - som en vifte.
 */
export class Circle extends BaseShape {

    constructor(
        app,
        color = { red: 1, green: 1, blue: 1, alpha: 1 },
        sectors = 48
    ) {
        super(app);
        this.color = color;
        this.sectors = sectors;
    }

    setPositions() {
        // Sentrum.
        this.positions = [0, 0, 0];

        // Punktene langs kanten. i <= sectors, så siste punkt havner
        // oppå det første og sirkelen lukkes.
        for (let i = 0; i <= this.sectors; i++) {
            const angle = i / this.sectors * 2 * Math.PI;

            this.positions.push(Math.cos(angle), Math.sin(angle), 0);
        }
    }

    draw(shaderInfo, elapsed, modelMatrix = new Matrix4()) {
        super.draw(shaderInfo, elapsed, modelMatrix);

        this.gl.uniform4f(
            shaderInfo.uniformLocations.color,
            this.color.red,
            this.color.green,
            this.color.blue,
            this.color.alpha
        );

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.vertexCount);
    }
}
