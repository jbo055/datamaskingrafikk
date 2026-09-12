'use strict';

export function drawEntrancePlatform(app, elapsed) {
    // Plattform: 2.4 bred, 0.2 høy og 1.6 dyp.
    // Like høy som gulvet inne (y = 0 til 0.2), så døren som slår
    // utover (underkant y = 0.25) går klar av plattformen.
    //
    // Starter ved z = 2.8, altså inne i frontveggen, så den også fyller
    // hullet under døråpningen. Går ut til z = 4.4.
    const platformMatrix = new Matrix4();
    platformMatrix.translate(0, 0.1, 3.6);
    platformMatrix.scale(1.2, 0.1, 0.8);

    app.floorCube.draw(
        app.uniformShaderInfo, elapsed, platformMatrix
    );
}
