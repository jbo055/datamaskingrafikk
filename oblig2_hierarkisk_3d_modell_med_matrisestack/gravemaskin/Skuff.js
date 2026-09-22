import {drawKjegle} from '../Tegnehjelp.js';

export function drawSkuff(renderInfo, camera) {
    // Arver armens matrise, som ligger øverst på stacken.
    const skuffeMatrix = renderInfo.stack.peekMatrix();

    skuffeMatrix.translate(0, 3, 0);
    skuffeMatrix.rotate(
        renderInfo.animation.skuffeVinkel,
        0, 0, 1
    );

    renderInfo.stack.pushMatrix(skuffeMatrix);

    // Tegn selve skuffen.
    // Kjeglen har bunnflaten mot leddet og spissen utover, som en skuffetann.
    const skuffeTegneMatrix = renderInfo.stack.peekMatrix();
    skuffeTegneMatrix.translate(0, 0.5, 0);
    skuffeTegneMatrix.scale(0.6, 0.5, 0.7);

    drawKjegle(
        renderInfo,
        skuffeTegneMatrix,
        camera,
        [0.2, 0.2, 0.2, 1.0]
    );

    renderInfo.stack.popMatrix(); // Skuffen.
}