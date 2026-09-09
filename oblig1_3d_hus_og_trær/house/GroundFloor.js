import { drawWindowFrame } from './Windows.js';

'use strict';

export function drawGroundFloor(app, elapsed) {
    // Gulv: 8 enheter bredt, 0.2 høyt og 6 dypt.
    const floorMatrix = new Matrix4();
    floorMatrix.translate(0, 0.1, 0);
    floorMatrix.scale(3.8, 0.1, 2.8);

    app.floorCube.draw(app.uniformShaderInfo, elapsed, floorMatrix);

    // Bakvegg under vinduet.
    const belowBackWindowMatrix = new Matrix4();
    belowBackWindowMatrix.translate(0, 0.5, -2.9);
    belowBackWindowMatrix.scale(4, 0.5, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, belowBackWindowMatrix
    );

    // Bakvegg fra venstre huskant til vinduet.
    const backWindowLeftMatrix = new Matrix4();
    backWindowLeftMatrix.translate(-1.3, 1.7, -2.9);
    backWindowLeftMatrix.scale(2.7, 0.7, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, backWindowLeftMatrix
    );

    // Bakvegg over vinduet.
    const aboveBackWindowMatrix = new Matrix4();
    aboveBackWindowMatrix.translate(0, 2.9, -2.9);
    aboveBackWindowMatrix.scale(4, 0.5, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, aboveBackWindowMatrix
    );

    // Venstre sidevegg under vinduet.
    const belowSideWindowMatrix = new Matrix4();
    belowSideWindowMatrix.translate(-3.9, 0.5, 0.1);
    belowSideWindowMatrix.scale(0.1, 0.5, 2.9);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, belowSideWindowMatrix
    );

    // Vegg over vinduet.
    const aboveSideWindowMatrix = new Matrix4();
    aboveSideWindowMatrix.translate(-3.9, 2.9, 0.1);
    aboveSideWindowMatrix.scale(0.1, 0.5, 2.9);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, aboveSideWindowMatrix
    );

    // Vegg mellom bakveggen og det bakre vinduet.
    const sideBackMatrix = new Matrix4();
    sideBackMatrix.translate(-3.9, 1.7, -2.4);
    sideBackMatrix.scale(0.1, 0.7, 0.4);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, sideBackMatrix
    );

    // Vegg mellom de to vinduene.
    const sideMiddleMatrix = new Matrix4();
    sideMiddleMatrix.translate(-3.9, 1.7, 0);
    sideMiddleMatrix.scale(0.1, 0.7, 0.8);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, sideMiddleMatrix
    );

    // Vegg mellom det fremre vinduet og frontveggen.
    const sideFrontMatrix = new Matrix4();
    sideFrontMatrix.translate(-3.9, 1.7, 2.5);
    sideFrontMatrix.scale(0.1, 0.7, 0.5);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, sideFrontMatrix
    );

    // Vegg fra vinduet til høyre huskant.
    const backWindowRightMatrix = new Matrix4();
    backWindowRightMatrix.translate(3.5, 1.7, -2.9);
    backWindowRightMatrix.scale(0.5, 0.7, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, backWindowRightMatrix
    );

    // Høyre vegg: samme størrelse, på motsatt side.
    const rightWallMatrix = new Matrix4();
    rightWallMatrix.translate(3.9, 1.7, 0.1);
    rightWallMatrix.scale(0.1, 1.7, 2.9);

    app.cube.draw(app.uniformShaderInfo, elapsed, rightWallMatrix);

    // Frontvegg til venstre for døråpningen.
    // Frontvegg til venstre for ytterdøren.
    // Vinduet går fra x = -3 til -1.4 og y = 1 til 2.4.

    // Vegg under vinduet.
    const belowWindowMatrix = new Matrix4();
    belowWindowMatrix.translate(-2.2, 0.5, 2.9);
    belowWindowMatrix.scale(1.6, 0.5, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, belowWindowMatrix
    );

    // Vegg over vinduet.
    const aboveWindowMatrix = new Matrix4();
    aboveWindowMatrix.translate(-2.2, 2.9, 2.9);
    aboveWindowMatrix.scale(1.6, 0.5, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, aboveWindowMatrix
    );

    // Vegg til venstre for vinduet.
    const leftOfWindowMatrix = new Matrix4();
    leftOfWindowMatrix.translate(-3.4, 1.7, 2.9);
    leftOfWindowMatrix.scale(0.4, 0.7, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, leftOfWindowMatrix
    );

    // Vegg til høyre for vinduet.
    const rightOfWindowMatrix = new Matrix4();
    rightOfWindowMatrix.translate(-1, 1.7, 2.9);
    rightOfWindowMatrix.scale(0.4, 0.7, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, rightOfWindowMatrix
    );

    // Frontvegg til høyre for døråpningen.
    // Vegg under høyre vindu.
    const belowRightWindowMatrix = new Matrix4();
    belowRightWindowMatrix.translate(2.2, 0.5, 2.9);
    belowRightWindowMatrix.scale(1.6, 0.5, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, belowRightWindowMatrix
    );

    // Vegg over høyre vindu.
    const aboveRightWindowMatrix = new Matrix4();
    aboveRightWindowMatrix.translate(2.2, 2.9, 2.9);
    aboveRightWindowMatrix.scale(1.6, 0.5, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, aboveRightWindowMatrix
    );

    // Vegg på vinduets venstre side.
    const leftOfRightWindowMatrix = new Matrix4();
    leftOfRightWindowMatrix.translate(1, 1.7, 2.9);
    leftOfRightWindowMatrix.scale(0.4, 0.7, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, leftOfRightWindowMatrix
    );

    // Vegg på vinduets høyre side.
    const rightOfRightWindowMatrix = new Matrix4();
    rightOfRightWindowMatrix.translate(3.4, 1.7, 2.9);
    rightOfRightWindowMatrix.scale(0.4, 0.7, 0.1);

    app.cube.draw(
        app.uniformShaderInfo, elapsed, rightOfRightWindowMatrix
    );

    // Vegg over døråpningen.
    const aboveDoorMatrix = new Matrix4();
    aboveDoorMatrix.translate(0, 2.9, 2.9);
    aboveDoorMatrix.scale(0.6, 0.5, 0.1);

    app.cube.draw(app.uniformShaderInfo, elapsed, aboveDoorMatrix);

    drawWindowFrame(app, elapsed, -2.2, 1.7, 2.9, 1.6, 1.4);
    drawWindowFrame(app, elapsed, 2.2, 1.7, 2.9, 1.6, 1.4);
    drawWindowFrame(app, elapsed, 2.2, 1.7, -2.9, 1.6, 1.4);

    // Bakre vindu på venstre sidevegg.
    drawWindowFrame(app, elapsed, -3.9, 1.7, -1.4, 1.2, 1.4, 90);

    // Fremre vindu på venstre sidevegg.
    drawWindowFrame(app, elapsed, -3.9, 1.7, 1.4, 1.2, 1.4, 90);
}
