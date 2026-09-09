import { TriangleBlock } from '../egneShapes/TriangleBlock.js';

let innerTriangle;

'use strict';

export function drawUpperInterior(app, elapsed) {
    // Opprett klossen og bufferet bare første gang.
    if (!innerTriangle) {
        innerTriangle = new TriangleBlock(app, app.innerWallCube.color);
        innerTriangle.initBuffers();
    }

    // Venstre veggdel.
    const leftMatrix = new Matrix4();
    leftMatrix.translate(-3.15, 4.8, 0);
    leftMatrix.scale(0.65, 1.4, 0.1);

    app.innerWallCube.draw(
        app.uniformShaderInfo, elapsed, leftMatrix
    );

    // Midtdel mellom døråpningene.
    const middleMatrix = new Matrix4();
    middleMatrix.translate(0, 4.8, 0);
    middleMatrix.scale(1.3, 1.4, 0.1);

    app.innerWallCube.draw(
        app.uniformShaderInfo, elapsed, middleMatrix
    );

    // Høyre veggdel.
    const rightMatrix = new Matrix4();
    rightMatrix.translate(3.15, 4.8, 0);
    rightMatrix.scale(0.65, 1.4, 0.1);

    app.innerWallCube.draw(
        app.uniformShaderInfo, elapsed, rightMatrix
    );

    // Over venstre døråpning.
    const leftTopMatrix = new Matrix4();
    leftTopMatrix.translate(-1.9, 5.9, 0);
    leftTopMatrix.scale(0.6, 0.3, 0.1);

    app.innerWallCube.draw(
        app.uniformShaderInfo, elapsed, leftTopMatrix
    );

    // Over høyre døråpning.
    const rightTopMatrix = new Matrix4();
    rightTopMatrix.translate(1.9, 5.9, 0);
    rightTopMatrix.scale(0.6, 0.3, 0.1);

    app.innerWallCube.draw(
        app.uniformShaderInfo, elapsed, rightTopMatrix
    );

    // Skråskåret skillevegg mellom de to rommene.
    const dividerSlopeMatrix = new Matrix4();

    dividerSlopeMatrix.translate(0, 4.85, 0.775);

    dividerSlopeMatrix.scale(
        0.1,
        1.8 / Math.SQRT2,
        2.7 / Math.SQRT2
    );

    dividerSlopeMatrix.rotate(-135, 1, 0, 0);
    dividerSlopeMatrix.scale(1, 0.5, 1);

    innerTriangle.draw(
        app.uniformShaderInfo, elapsed, dividerSlopeMatrix
    );

    // Veggen under den skrå trekantklossen.
    const dividerBaseMatrix = new Matrix4();
    dividerBaseMatrix.translate(0, 3.9, 1.45);
    dividerBaseMatrix.scale(0.1, 0.5, 1.35);

    app.innerWallCube.draw(
        app.uniformShaderInfo, elapsed, dividerBaseMatrix
    );
}