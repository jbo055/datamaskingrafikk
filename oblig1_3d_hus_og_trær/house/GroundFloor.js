'use strict';

export function drawGroundFloor(app, elapsed) {
    // Gulv: 8 enheter bredt, 0.2 høyt og 6 dypt.
    const floorMatrix = new Matrix4();
    floorMatrix.translate(0, 0.1, 0);
    floorMatrix.scale(3.8, 0.1, 2.8);

    app.floorCube.draw(app.uniformShaderInfo, elapsed, floorMatrix);

    // Bakvegg: 8 enheter bred, 3 høy og 0.2 tykk.
    const backWallMatrix = new Matrix4();
    backWallMatrix.translate(0, 1.7, -2.9);
    backWallMatrix.scale(4, 1.7, 0.1);

    app.cube.draw(app.uniformShaderInfo, elapsed, backWallMatrix);

    // Venstre vegg: 0.2 tykk, 3 høy og 5.8 dyp.
    const leftWallMatrix = new Matrix4();
    leftWallMatrix.translate(-3.9, 1.7, 0.1);
    leftWallMatrix.scale(0.1, 1.7, 2.9);

    app.cube.draw(app.uniformShaderInfo, elapsed, leftWallMatrix);

    // Høyre vegg: samme størrelse, på motsatt side.
    const rightWallMatrix = new Matrix4();
    rightWallMatrix.translate(3.9, 1.7, 0.1);
    rightWallMatrix.scale(0.1, 1.7, 2.9);

    app.cube.draw(app.uniformShaderInfo, elapsed, rightWallMatrix);

    // Frontvegg til venstre for døråpningen.
    const frontLeftMatrix = new Matrix4();
    frontLeftMatrix.translate(-2.2, 1.7, 2.9);
    frontLeftMatrix.scale(1.6, 1.7, 0.1);

    app.cube.draw(app.uniformShaderInfo, elapsed, frontLeftMatrix);

    // Frontvegg til høyre for døråpningen.
    const frontRightMatrix = new Matrix4();
    frontRightMatrix.translate(2.2, 1.7, 2.9);
    frontRightMatrix.scale(1.6, 1.7, 0.1);

    app.cube.draw(app.uniformShaderInfo, elapsed, frontRightMatrix);

    // Vegg over døråpningen.
    const aboveDoorMatrix = new Matrix4();
    aboveDoorMatrix.translate(0, 2.9, 2.9);
    aboveDoorMatrix.scale(0.6, 0.5, 0.1);

    app.cube.draw(app.uniformShaderInfo, elapsed, aboveDoorMatrix);
}
