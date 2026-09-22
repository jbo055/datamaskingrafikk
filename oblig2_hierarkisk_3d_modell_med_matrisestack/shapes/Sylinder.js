export function initSylinderBuffers(gl) {
    const positions = [];
    const antallSektorer = 32;

    // Radius 1. Bunnen ligger på y = -1 og toppen på y = 1.
    for (let i = 0; i < antallSektorer; i++) {
        const vinkel1 = i * 2 * Math.PI / antallSektorer;
        const vinkel2 = (i + 1) * 2 * Math.PI / antallSektorer;

        const x1 = Math.cos(vinkel1);
        const z1 = Math.sin(vinkel1);

        const x2 = Math.cos(vinkel2);
        const z2 = Math.sin(vinkel2);

        // Sideveggen: to trekanter.
        positions.push(
            x1, -1, z1,
            x1,  1, z1,
            x2,  1, z2,

            x1, -1, z1,
            x2,  1, z2,
            x2, -1, z2
        );

        // Toppen: én trekant fra sentrum til kanten.
        positions.push(
             0, 1,  0,
            x2, 1, z2,
            x1, 1, z1
        );

        // Bunnen: én trekant fra sentrum til kanten.
        positions.push(
             0, -1,  0,
            x1, -1, z1,
            x2, -1, z2
        );
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return {
        position: positionBuffer,
        vertexCount: positions.length / 3
    };
}