'use strict';

import { BaseShape } from '../shapes/BaseShape.js';

/**
 * Sylinder med radius 1, fra y = -1 til y = 1 (samme mål som Cube).
 * Brukes til trestammer, og tegnes med verteksfarge-shaderen.
 *
 * Tegnes med gl.TRIANGLES: mantelen og de to lokkene legges i samme buffer.
 */
export class Cylinder extends BaseShape {

    constructor(
        app,
        color = { red: 0.4, green: 0.25, blue: 0.1, alpha: 1 },
        sectors = 24
    ) {
        super(app);
        this.color = color;
        this.sectors = sectors;   // Antall "kakestykker" rundt sylinderen.
    }

    setPositions() {
        this.positions = [];

        const step = 2 * Math.PI / this.sectors;

        for (let i = 0; i < this.sectors; i++) {
            const angle0 = i * step;
            const angle1 = (i + 1) * step;

            const x0 = Math.cos(angle0), z0 = Math.sin(angle0);
            const x1 = Math.cos(angle1), z1 = Math.sin(angle1);

            // Mantelen: ett rektangel = to trekanter.
            this.positions.push(
                x0, -1, z0,   x0, 1, z0,   x1, 1, z1,
                x0, -1, z0,   x1, 1, z1,   x1, -1, z1,
            );

            // Topplokket: trekant fra sentrum ut til kanten.
            this.positions.push(
                0, 1, 0,   x0, 1, z0,   x1, 1, z1,
            );

            // Bunnlokket.
            this.positions.push(
                0, -1, 0,   x1, -1, z1,   x0, -1, z0,
            );
        }
    }

    setColors() {
        this.colors = [];

        // Uten lys ser en ensfarget sylinder helt flat ut. Derfor gjør vi
        // fargen litt lysere på den ene siden (x = 1) og mørkere på den andre
        // (x = -1). Da ser stammen rund ut. Dette er grunnen til at trærne
        // bruker verteksfarge-shaderen: hver vertex kan få sin egen farge.
        for (let i = 0; i < this.positions.length; i += 3) {
            const x = this.positions[i];
            const brightness = 0.7 + 0.3 * x;

            this.colors.push(
                this.color.red * brightness,
                this.color.green * brightness,
                this.color.blue * brightness,
                this.color.alpha
            );
        }
    }

    draw(shaderInfo, elapsed, modelMatrix = new Matrix4()) {
        super.draw(shaderInfo, elapsed, modelMatrix);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    }
}
