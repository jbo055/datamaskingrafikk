'use strict';

import { BaseShape } from '../shapes/BaseShape.js';

export class TriangleBlock extends BaseShape {
    constructor(
        app,
        color = { red: 0.8, green: 0.3, blue: 0.1, alpha: 1 }
    ) {
        super(app);
        this.color = color;
    }

    setPositions() {
        // Trekant på venstre side.
        const a = [-1, -1, -1];
        const b = [-1, -1,  1];
        const c = [-1,  1,  0];

        // Trekant på høyre side.
        const d = [1, -1, -1];
        const e = [1, -1,  1];
        const f = [1,  1,  0];

        this.positions = [
            // Venstre side.
            ...a, ...b, ...c,

            // Høyre side.
            ...d, ...f, ...e,

            // Bunn.
            ...a, ...d, ...e,
            ...a, ...e, ...b,

            // Skråflate mot positiv Z.
            ...b, ...e, ...f,
            ...b, ...f, ...c,

            // Skråflate mot negativ Z.
            ...a, ...c, ...f,
            ...a, ...f, ...d,
        ];
    }

    setColors() {
        this.colors = [];

        const vertexCount = this.positions.length / 3;

        for (let i = 0; i < vertexCount; i++) {
            this.colors.push(
                this.color.red,
                this.color.green,
                this.color.blue,
                this.color.alpha
            );
        }
    }

    draw(shaderInfo, elapsed, modelMatrix = new Matrix4()) {
        super.draw(shaderInfo, elapsed, modelMatrix);

        // Brukes hvis shaderprogrammet har uniform-farge.
        if (shaderInfo.uniformLocations.color != null) {
            this.gl.uniform4f(
                shaderInfo.uniformLocations.color,
                this.color.red,
                this.color.green,
                this.color.blue,
                this.color.alpha
            );
        }

        this.gl.drawArrays(
            this.gl.TRIANGLES,
            0,
            this.vertexCount
        );
    }
}