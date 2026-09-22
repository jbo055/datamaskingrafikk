import {drawKube} from '../Tegnehjelp.js';
import {drawSkuff} from './Skuff.js';

export function drawArm(renderInfo, camera) {
    // Bommen arver husets matrise.
    const bomMatrix = renderInfo.stack.peekMatrix();

    bomMatrix.translate(1.8, 0.3, 0);
    bomMatrix.rotate(renderInfo.animation.bomVinkel, 0, 0, 1);

    renderInfo.stack.pushMatrix(bomMatrix);

    const bomTegneMatrix = renderInfo.stack.peekMatrix();
    bomTegneMatrix.translate(0, 2, 0);
    bomTegneMatrix.scale(0.3, 2, 0.4);

    drawKube(
        renderInfo,
        bomTegneMatrix,
        camera,
        [1.0, 1.0, 1.0, 1.0],
        true,
        renderInfo.kubeBuffer.texture,
        renderInfo.metalTexture
    );

    // Armen arver bommens matrise.
    const armMatrix = renderInfo.stack.peekMatrix();

    armMatrix.translate(0, 4, 0);
    armMatrix.rotate(renderInfo.animation.armVinkel, 0, 0, 1);

    renderInfo.stack.pushMatrix(armMatrix);

    const armTegneMatrix = renderInfo.stack.peekMatrix();
    armTegneMatrix.translate(0, 1.5, 0);
    armTegneMatrix.scale(0.25, 1.5, 0.3);

    drawKube(
        renderInfo,
        armTegneMatrix,
        camera,
        [1.0, 1.0, 1.0, 1.0],
        true,
        renderInfo.kubeBuffer.texture,
        renderInfo.metalTexture
    );

    // Skuffen tegnes mens armens matrise ligger øverst.
    drawSkuff(renderInfo, camera);

    renderInfo.stack.popMatrix(); // Armen.
    renderInfo.stack.popMatrix(); // Bommen.
}