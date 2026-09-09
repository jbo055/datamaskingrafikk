'use strict';

import { TriangleBlock } from '../egneShapes/TriangleBlock.js';

let innerTriangle;

export function drawUpperInterior(app, elapsed) {
    // Opprett trekantklossen og bufferet bare første gang.
    if (!innerTriangle) {
        innerTriangle = new TriangleBlock(
            app,
            app.innerWallCube.color
        );

        innerTriangle.initBuffers();
    }

    // To skillevegger gir et venstre, et midtre og et høyre rom.
    for (const x of [-1.3, 1.3]) {

        // Døråpning mellom z = -0.6 og z = 0.6.
        // Bakerst stopper veggene ved z = -1.6,
        // slik at passasjen over trappen holdes åpen.
        const sections = [
            // Venstre vegg stopper ved trappeåpningen.
            // Høyre vegg går helt til bakveggen.
            { side: -1, end: x < 0 ? 1.6 : 2.8 },
            { side: 1, end: 2.8 }
        ];

        for (const section of sections) {
            const length = section.end - 0.6;

            // Beregn høydene slik at veggen følger skråtaket.
            const farTop =
                6.2 - (section.end - 0.1) * 2 / 3;

            const baseHeight = farTop - 3.4;
            const slopeHeight = length * 2 / 3;

            // Rektangulær underdel.
            const baseMatrix = new Matrix4();

            baseMatrix.translate(
                x,
                3.4 + baseHeight / 2,
                section.side * (0.6 + length / 2)
            );

            baseMatrix.scale(
                0.1,
                baseHeight / 2,
                length / 2
            );

            app.innerWallCube.draw(
                app.uniformShaderInfo,
                elapsed,
                baseMatrix
            );

            // Skrå overdel.
            const slopeMatrix = new Matrix4();

            slopeMatrix.translate(
                x,
                farTop + slopeHeight / 4,
                section.side * (0.6 + length / 4)
            );

            slopeMatrix.scale(
                0.1,
                slopeHeight / Math.SQRT2,
                section.side * length / Math.SQRT2
            );

            slopeMatrix.rotate(-135, 1, 0, 0);
            slopeMatrix.scale(1, 0.5, 1);

            innerTriangle.draw(
                app.uniformShaderInfo,
                elapsed,
                slopeMatrix
            );

            // Lukker venstre rom langs kanten av trappeåpningen.
            // Går fra venstre yttervegg til venstre skillevegg.
            const stairSideWallMatrix = new Matrix4();

            stairSideWallMatrix.translate(-2.6, 4.3, -1.5);
            stairSideWallMatrix.scale(1.2, 0.9, 0.1);

            app.innerWallCube.draw(
                app.uniformShaderInfo,
                elapsed,
                stairSideWallMatrix
            );
        }

        // Rektangulær del over døråpningen.
        const shoulderY = 6.2 - (0.6 - 0.1) * 2 / 3;
        const openingTop = 5.6;

        const aboveDoorMatrix = new Matrix4();

        aboveDoorMatrix.translate(
            x,
            (openingTop + shoulderY) / 2,
            0
        );

        aboveDoorMatrix.scale(
            0.1,
            (shoulderY - openingTop) / 2,
            0.6
        );

        app.innerWallCube.draw(
            app.uniformShaderInfo,
            elapsed,
            aboveDoorMatrix
        );

        // Trekant over døråpningen, opp mot mønet.
        const topMatrix = new Matrix4();
        topMatrix.translate(x, shoulderY + 0.2, 0);
        topMatrix.scale(0.1, 0.2, 0.6);

        innerTriangle.draw(
            app.uniformShaderInfo,
            elapsed,
            topMatrix
        );
    }
}