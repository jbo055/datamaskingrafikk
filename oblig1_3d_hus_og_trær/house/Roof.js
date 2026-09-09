'use strict';

export function drawRoof(app, elapsed) {
    const halfDepth = 3;
    const roofRise = 2;
    const overhang = 0.3;

    // Vinkelen beregnes fra takets stigning og halve husdybden.
    const angleRadians = Math.atan2(roofRise, halfDepth);
    const angleDegrees = angleRadians * 180 / Math.PI;

    // Avstand fra mønet til veggen, langs takflaten.
    const slopeLength = Math.sqrt(
        halfDepth * halfDepth + roofRise * roofRise
    );

    // Forleng takflaten utenfor veggen.
    const roofLength = slopeLength + overhang;

    // Midtpunktet til hver takflate.
    const centerZ = Math.cos(angleRadians) * roofLength / 2;
    const centerY = 6.4 - Math.sin(angleRadians) * roofLength / 2;

    // Takflaten mot forsiden.
    const frontRoofMatrix = new Matrix4();
    frontRoofMatrix.translate(0, centerY, centerZ);
    frontRoofMatrix.rotate(angleDegrees, 1, 0, 0);
    frontRoofMatrix.scale(4.3, 0.1, roofLength / 2);

    app.roofCube.draw(
        app.uniformShaderInfo, elapsed, frontRoofMatrix
    );

    // Takflaten mot baksiden.
    const backRoofMatrix = new Matrix4();
    backRoofMatrix.translate(0, centerY, -centerZ);
    backRoofMatrix.rotate(-angleDegrees, 1, 0, 0);
    backRoofMatrix.scale(4.3, 0.1, roofLength / 2);

    app.roofCube.draw(
        app.uniformShaderInfo, elapsed, backRoofMatrix
    );
}