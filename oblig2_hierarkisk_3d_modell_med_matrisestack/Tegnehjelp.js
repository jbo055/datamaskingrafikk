/**
 * Aktiverer position-bufferet.
 * Kalles fra draw()
 */
export function connectPositionAttribute(gl, shader, positionBuffer) {
	const numComponents = 3;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.vertexAttribPointer(
		shader.attribLocations.vertexPosition,
		numComponents,
		type,
		normalize,
		stride,
		offset);
	gl.enableVertexAttribArray(shader.attribLocations.vertexPosition);
}

function connectColorUniform(gl, shader, colorRGBA) {
	gl.uniform4f(shader.uniformLocations.fragmentColor, colorRGBA[0],colorRGBA[1],colorRGBA[2],colorRGBA[3]);
}

/**
 * Tegner rektanglet med gitt transformasjon, kamera og farge.
 */
export function drawKube(
    renderInfo,
    modelMatrix,
    camera,
    colorRGBA,
    useTexture = false,
    textureBuffer = renderInfo.kubeBuffer.texture,
    texture = renderInfo.belteTexture
) {
    const gl = renderInfo.gl;
    const shader = renderInfo.baseShader;
    const uvLocation = shader.attribLocations.vertexTextureCoordinate;

    connectPositionAttribute(
        gl,
        shader,
        renderInfo.kubeBuffer.position
    );

    connectColorUniform(gl, shader, colorRGBA);

    // Velg om denne kuben skal bruke tekstur.
    gl.uniform1i(shader.uniformLocations.useTexture, useTexture);

    // Koble teksturen til teksturenhet 0.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(shader.uniformLocations.sampler, 0);

    // UV-bufferet brukes bare når kuben har tekstur.
    gl.disableVertexAttribArray(uvLocation);

    if (useTexture) {
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            textureBuffer
        );

        gl.vertexAttribPointer(
            uvLocation,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.enableVertexAttribArray(uvLocation);
    }

    connectMatrices(gl, shader, modelMatrix, camera);

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        renderInfo.kubeBuffer.vertexCount
    );

    // De neste delene skal ikke automatisk arve teksturbruken.
    gl.uniform1i(shader.uniformLocations.useTexture, false);
    gl.disableVertexAttribArray(uvLocation);
}

export function drawFlate(renderInfo, modelMatrix, camera, colorRGBA) {
    const gl = renderInfo.gl;
    const shader = renderInfo.baseShader;

    connectPositionAttribute(
        gl,
        shader,
        renderInfo.flateBuffer.position
    );

    connectColorUniform(gl, shader, colorRGBA);

    connectMatrices(gl, shader, modelMatrix, camera);

    gl.drawArrays(gl.TRIANGLES, 0, renderInfo.flateBuffer.vertexCount);

    // Koble tilbake kubebufferet for delene som tegnes etterpå.
    connectPositionAttribute(
        gl,
        shader,
        renderInfo.kubeBuffer.position
    );
}

export function drawSylinder(renderInfo, modelMatrix, camera, colorRGBA) {
    const gl = renderInfo.gl;
    const shader = renderInfo.baseShader;

    // Bruk sylinderens vertexposisjoner.
    connectPositionAttribute(
        gl,
        shader,
        renderInfo.sylinderBuffer.position
    );

    connectColorUniform(gl, shader, colorRGBA);

    connectMatrices(gl, shader, modelMatrix, camera);

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        renderInfo.sylinderBuffer.vertexCount
    );

    // Delene som tegnes etterpå bruker kuber igjen.
    connectPositionAttribute(
        gl,
        shader,
        renderInfo.kubeBuffer.position
    );
}

export function drawKjegle(renderInfo, modelMatrix, camera, colorRGBA) {
    const gl = renderInfo.gl;
    const shader = renderInfo.baseShader;

    // Bruk kjeglens vertexposisjoner.
    connectPositionAttribute(
        gl,
        shader,
        renderInfo.kjegleBuffer.position
    );

    connectColorUniform(gl, shader, colorRGBA);

    connectMatrices(gl, shader, modelMatrix, camera);

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        renderInfo.kjegleBuffer.vertexCount
    );

    // Delene som tegnes etterpå bruker kuber igjen.
    connectPositionAttribute(
        gl,
        shader,
        renderInfo.kubeBuffer.position
    );
}

function connectMatrices(gl, shader, modelMatrix, camera) {
    gl.uniformMatrix4fv(
        shader.uniformLocations.modelMatrix,
        false,
        modelMatrix.elements
    );

    gl.uniformMatrix4fv(
        shader.uniformLocations.viewMatrix,
        false,
        camera.viewMatrix.elements
    );

    gl.uniformMatrix4fv(
        shader.uniformLocations.projectionMatrix,
        false,
        camera.projectionMatrix.elements
    );
}