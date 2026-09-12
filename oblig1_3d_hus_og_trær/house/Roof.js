'use strict';

export function drawRoof(app, elapsed) {
    const angle = Math.atan2(2, 3);
    const angleDegrees = angle * 180 / Math.PI;

    // Samme takutstikk som tidligere.
    const roofLength = Math.sqrt(3 * 3 + 2 * 2) + 0.3;
    const endZ = Math.cos(angle) * roofLength;

    // Tegner én rektangulær del av hovedtaket.
    function drawRoofPart(x, width, startZ, stopZ, side) {
        const centerZ = (startZ + stopZ) / 2;

        const modelMatrix = new Matrix4();
        modelMatrix.translate(
            x,
            6.4 - centerZ * 2 / 3,
            side * centerZ
        );

        modelMatrix.rotate(side * angleDegrees, 1, 0, 0);

        modelMatrix.scale(
            width / 2,
            0.1,
            (stopZ - startZ) / (2 * Math.cos(angle))
        );

        app.roofCube.draw(
            app.uniformShaderInfo, elapsed, modelMatrix
        );
    }

    // Hele takflaten mot baksiden.
    drawRoofPart(0, 8.6, 0, endZ, -1);

    // Forsiden, til venstre og høyre for arken.
    drawRoofPart(-2.55, 3.5, 0, endZ, 1);
    drawRoofPart(2.55, 3.5, 0, endZ, 1);

    // Takstripen nedenfor arkens front.
    drawRoofPart(0, 1.6, 2.6, endZ, 1);
}