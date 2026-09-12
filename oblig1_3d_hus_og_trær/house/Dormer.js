'use strict';

import { drawWindowFrame } from './Windows.js';

export function drawDormer(app, elapsed) {
    // Frontvegg under vinduet.
    const bottomMatrix = new Matrix4();
    bottomMatrix.translate(0, 4.65, 2.6);
    bottomMatrix.scale(0.9, 0.25, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, bottomMatrix
    );

    // Frontvegg over vinduet.
    const topMatrix = new Matrix4();
    topMatrix.translate(0, 5.7, 2.6);
    topMatrix.scale(0.9, 0.1, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, topMatrix
    );

    // Frontvegg på hver side av vinduet.
    for (const side of [-1, 1]) {
        const frontSideMatrix = new Matrix4();
        frontSideMatrix.translate(side * 0.7, 5.25, 2.6);
        frontSideMatrix.scale(0.2, 0.35, 0.1);

        app.cube.draw(
            app.uniformShaderInfo, elapsed, frontSideMatrix
        );

        // Rektangulær del av arkens sidevegg.
        const wallMatrix = new Matrix4();
        wallMatrix.translate(side * 0.8, 5.1, 1.3);
        wallMatrix.scale(0.1, 0.7, 1.3);

        app.cube.draw(
            app.uniformShaderInfo, elapsed, wallMatrix
        );

        // Skrå overdel: høyest bakerst ved hovedmønet.
        const slopeMatrix = new Matrix4();
        slopeMatrix.translate(side * 0.8, 5.95, 0.65);

        slopeMatrix.scale(
            0.1,
            0.6 / Math.SQRT2,
            2.6 / Math.SQRT2
        );

        slopeMatrix.rotate(-135, 1, 0, 0);
        slopeMatrix.scale(1, 0.5, 1);

        app.triangleBlock.draw(
            app.uniformShaderInfo, elapsed, slopeMatrix
        );
    }

    // Arkens tak faller fra y = 6.4 til 5.8.
    const angle = Math.atan2(0.6, 2.6);
    const startZ = -0.05;
    const endZ = 2.8;
    const centerZ = (startZ + endZ) / 2;

    const roofMatrix = new Matrix4();
    roofMatrix.translate(
        0,
        6.4 - centerZ * 0.6 / 2.6,
        centerZ
    );

    roofMatrix.rotate(angle * 180 / Math.PI, 1, 0, 0);

    roofMatrix.scale(
        1,
        0.08,
        (endZ - startZ) / (2 * Math.cos(angle))
    );

    app.roofCube.draw(
        app.uniformShaderInfo, elapsed, roofMatrix
    );

    // Vindusåpning: 1 bred og 0.7 høy.
    drawWindowFrame(app, elapsed, 0, 5.25, 2.6, 1, 0.7);
}