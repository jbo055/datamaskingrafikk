import {connectPositionAttribute} from './Tegnehjelp.js';
import {drawUnderstell} from './gravemaskin/Understell.js';
import {drawHus} from './gravemaskin/Hus.js';

/**
 * Setter sammen gravemaskinen.
 * Hver del tegnes med utgangspunkt i matrisestacken.
 */
export function drawGravemaskin(renderInfo, camera) {
    const gl = renderInfo.gl;

    gl.useProgram(renderInfo.baseShader.program);

    connectPositionAttribute(
        gl,
        renderInfo.baseShader,
        renderInfo.cubeBuffer.position
    );

    // Hele gravemaskinens plassering i verden.
    const modelMatrix = new Matrix4();
    modelMatrix.setIdentity();

    renderInfo.stack.pushMatrix(modelMatrix);

    drawUnderstell(renderInfo, camera);
    drawHus(renderInfo, camera);

    renderInfo.stack.popMatrix(); // Roten.
}