import {connectPositionAttribute} from '../Tegnehjelp.js';

/**
 * Tegner x-, y- og z-aksen som farget kors gjennom origo.
 * Dette er et hjelpemiddel under utvikling, ikke en del av gravemaskinen.
 * Skal aksene bort, holder det å fjerne kallet på drawCoord() i draw().
 */

// Gjenbrukes mellom bildene, så vi slipper å lage nye matriser 60 ganger i sekundet.
const modelMatrix = new Matrix4();
const modelviewMatrix = new Matrix4();

export function initCoordBuffers(gl) {
    const extent =  100;

    const positions = new Float32Array([
        -extent, 0, 0,
        extent, 0, 0,
        0, -extent, 0,
        0, extent, 0,
        0, 0, -extent,
        0, 0, extent
    ]);

    const colors = new Float32Array([
        1, 0, 0, 1,   //R G B A
        1, 0, 0, 1,   //R G B A
        0, 1, 0, 1,   //R G B A
        0, 1, 0, 1,   //R G B A
        0, 0, 1, 1,   //R G B A
        0, 0, 1, 1,   //R G B A
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return  {
        position: positionBuffer,
        color: colorBuffer,
        vertexCount: positions.length/3
    };
}

/**
 * Aktiverer color-bufferet.
 * Bare koordinatshaderen har farge per vertex.
 */
function connectColorAttribute(gl, shader, colorBuffer) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(
        shader.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(shader.attribLocations.vertexColor);
}

export function drawCoord(renderInfo, camera) {
    const gl = renderInfo.gl;
    // Aktiver shader:
    gl.useProgram(renderInfo.coordShader.program);

    // Kople posisjon og farge-attributtene til tilhørende buffer:
    connectPositionAttribute(gl, renderInfo.coordShader, renderInfo.coordBuffers.position);
    connectColorAttribute(gl, renderInfo.coordShader, renderInfo.coordBuffers.color);
    // MODEL:
    modelMatrix.setIdentity();
    // MODELVIEW:
    modelviewMatrix.set(camera.viewMatrix);
    modelviewMatrix.multiply(modelMatrix);

    // Send kameramatrisene til shaderen:
    gl.uniformMatrix4fv(renderInfo.coordShader.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(renderInfo.coordShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
    // Tegn coord:
    gl.drawArrays(gl.LINES, 0, renderInfo.coordBuffers.vertexCount);
}
