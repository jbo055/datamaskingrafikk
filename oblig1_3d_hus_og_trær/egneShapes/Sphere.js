'use strict';

import { BaseShape } from '../shapes/BaseShape.js';

/**
 * Kule med radius 1 i origo. Brukes til trekroner, og tegnes med
 * verteksfarge-shaderen.
 *
 * Kula bygges som en globus: "stacks" breddegrader fra nordpolen til
 * sørpolen, og "sectors" lengdegrader rundt. Hver rute mellom to bredde-
 * og to lengdegrader blir to trekanter (gl.TRIANGLES).
 */
export class Sphere extends BaseShape {

    constructor(
        app,
        color = { red: 0.1, green: 0.5, blue: 0.1, alpha: 1 },
        stacks = 16,
        sectors = 24
    ) {
        super(app);
        this.color = color;
        this.stacks = stacks;
        this.sectors = sectors;
    }

    /**
     * Punkt på kula. theta går fra 0 (toppen) til PI (bunnen),
     * phi går fra 0 til 2 PI rundt y-aksen.
     */
    pointOnSphere(theta, phi) {
        const ringRadius = Math.sin(theta);

        return [
            ringRadius * Math.cos(phi),
            Math.cos(theta),
            ringRadius * Math.sin(phi),
        ];
    }

    setPositions() {
        this.positions = [];

        for (let i = 0; i < this.stacks; i++) {
            const theta0 = i / this.stacks * Math.PI;
            const theta1 = (i + 1) / this.stacks * Math.PI;

            for (let j = 0; j < this.sectors; j++) {
                const phi0 = j / this.sectors * 2 * Math.PI;
                const phi1 = (j + 1) / this.sectors * 2 * Math.PI;

                // De fire hjørnene i én rute.
                const a = this.pointOnSphere(theta0, phi0);
                const b = this.pointOnSphere(theta1, phi0);
                const c = this.pointOnSphere(theta1, phi1);
                const d = this.pointOnSphere(theta0, phi1);

                this.positions.push(
                    ...a, ...b, ...c,
                    ...a, ...c, ...d,
                );
            }
        }
    }

    setColors() {
        this.colors = [];

        // Lysere på toppen (y = 1) og mørkere i bunnen (y = -1),
        // slik at kula ikke ser ut som en flat grønn skive.
        for (let i = 0; i < this.positions.length; i += 3) {
            const y = this.positions[i + 1];
            const brightness = 0.45 + 0.55 * (y + 1) / 2;

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
