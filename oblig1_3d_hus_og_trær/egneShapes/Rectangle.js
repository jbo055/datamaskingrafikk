'use strict';

import { BaseShape } from '../shapes/BaseShape.js';

/**
 * 2D-rektangel fra -1 til 1 i XY-planet. Brukes til klokkeviserne og
 * timemerkene. Tegnes med uniform-shaderen.
 *
 * gl.TRIANGLE_STRIP: fire vertekser gir to trekanter (0-1-2 og 1-2-3),
 * mot seks vertekser med gl.TRIANGLES.
 */
export class Rectangle extends BaseShape {

    constructor(app, color = { red: 0, green: 0, blue: 0, alpha: 1 }) {
        super(app);
        this.color = color;
    }

    setPositions() {
        this.positions = [
            -1, -1, 0,
             1, -1, 0,
            -1,  1, 0,
             1,  1, 0,
        ];
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

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexCount);
    }
}
