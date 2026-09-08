'use strict';

export function drawUpperFloor(app, elapsed) {
    // Gulvet foran trappeåpningen.
    const upperFloorFrontMatrix = new Matrix4();
    upperFloorFrontMatrix.translate(0, 3.3, 0.6);
    upperFloorFrontMatrix.scale(3.8, 0.1, 2.2);

    app.floorCube.draw(
        app.uniformShaderInfo, elapsed, upperFloorFrontMatrix
    );

    // Gulvet til venstre for trappen.
    const upperFloorLeftMatrix = new Matrix4();
    upperFloorLeftMatrix.translate(-3.35, 3.3, -2.2);
    upperFloorLeftMatrix.scale(0.45, 0.1, 0.6);

    app.floorCube.draw(
        app.uniformShaderInfo, elapsed, upperFloorLeftMatrix
    );

    // Gulvet til høyre for trappen, der øverste trinn ender.
    const upperFloorRightMatrix = new Matrix4();
    upperFloorRightMatrix.translate(2.25, 3.3, -2.2);
    upperFloorRightMatrix.scale(1.55, 0.1, 0.6);

    app.floorCube.draw(
        app.uniformShaderInfo, elapsed, upperFloorRightMatrix
    );
}
