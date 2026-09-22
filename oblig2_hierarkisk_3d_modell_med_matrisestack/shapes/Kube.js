/**
 * Oppretter verteksbuffer for kuben.
 * ÉN kube gjenbrukes til alle gravemaskinens kantete deler.
 */
export function initKubeBuffers(gl) {
    const positions = new Float32Array([
        // Forside
        -1, -1,  1,
         1, -1,  1,
         1,  1,  1,
        -1, -1,  1,
         1,  1,  1,
        -1,  1,  1,

        // Bakside
         1, -1, -1,
        -1, -1, -1,
        -1,  1, -1,
         1, -1, -1,
        -1,  1, -1,
         1,  1, -1,

        // Venstre side
        -1, -1, -1,
        -1, -1,  1,
        -1,  1,  1,
        -1, -1, -1,
        -1,  1,  1,
        -1,  1, -1,

        // Høyre side
         1, -1,  1,
         1, -1, -1,
         1,  1, -1,
         1, -1,  1,
         1,  1, -1,
         1,  1,  1,

        // Topp
        -1,  1,  1,
         1,  1,  1,
         1,  1, -1,
        -1,  1,  1,
         1,  1, -1,
        -1,  1, -1,

        // Bunn
        -1, -1, -1,
         1, -1, -1,
         1, -1,  1,
        -1, -1, -1,
         1, -1,  1,
        -1, -1,  1
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // UV-koordinater for de seks vertexene på én kubeside.
    const sideUV = [
        0, 0,
        1, 0,
        1, 1,

        0, 0,
        1, 1,
        0, 1
    ];

    // Samme bilde gjentas på alle seks sidene.
    const textureCoordinates = [];

    for (let side = 0; side < 6; side++) {
        textureCoordinates.push(...sideUV);
    }

    const textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(textureCoordinates),
        gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return {
        position: positionBuffer,
        texture: textureBuffer,
        vertexCount: positions.length / 3
    };
}
