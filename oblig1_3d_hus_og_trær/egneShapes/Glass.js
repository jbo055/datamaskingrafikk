'use strict';

import { BaseShape } from '../shapes/BaseShape.js';

export class Glass extends BaseShape {
    setPositions() {
        // En 2D-flate i XY-planet, laget av to trekanter.
        this.positions = [
            -1, -1, 0,
             1, -1, 0,
             1,  1, 0,

            -1, -1, 0,
             1,  1, 0,
            -1,  1, 0,
        ];
    }

    draw(shaderInfo, elapsed, modelMatrix = new Matrix4()) {
        super.draw(shaderInfo, elapsed, modelMatrix);

        // Blått glass med 35 % opasitet.
        this.gl.uniform4f(
            shaderInfo.uniformLocations.color,
            0.0, 0.4, 0.8, 0.35
        );

        this.gl.drawArrays(
            this.gl.TRIANGLES, 0, this.vertexCount
        );
    }
}