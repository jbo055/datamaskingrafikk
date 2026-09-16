import {WebGLCanvas} from '../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../base/helpers/WebGLShader.js';
import {Camera} from '../../base/helpers/Camera.js';
import {vectorToString} from "../../base/lib/utility-functions.js";
import {ImageLoader} from "../../base/helpers/ImageLoader.js";

/**
 * MERK: Hvilket shaderpar som brukes bestemmes av check-boksen..
 */
export function main() {
	// Oppretter et webGLCanvas for WebGL-tegning:
	const webGLCanvas = new WebGLCanvas('myCanvas', document.body, 960, 640);

	const checkBox = document.getElementById("phongCheckBox");
	checkBox.addEventListener("click", (event) => {
		startProgram(webGLCanvas, checkBox.checked);
	});
	startProgram(webGLCanvas, false);
}

function startProgram(webGLCanvas, usePhong) {

	// Starter med å laste teksturer:
	let imageLoader = new ImageLoader();
	let textureUrls = ['../../base/textures/bricksLarge.png'];
	imageLoader.load((textureImages) => {
		const textureImage = textureImages[0];
        // Fortsetter:
        const renderInfo = {
            gl: webGLCanvas.gl,
            baseShader: initBaseShaders(webGLCanvas.gl),
            diffuseLightTextureShader: initDiffuseLightTextureShader(webGLCanvas.gl, usePhong),

            coordBuffers: initCoordBuffers(webGLCanvas.gl),
            xzplaneBuffers: initXZPlaneBuffers(webGLCanvas.gl, textureImage),

            modelMatrix: new Matrix4(),
            modelviewMatrix: new Matrix4(),

            currentlyPressedKeys: [],
            lastTime: 0,
            fpsInfo: {  // Brukes til å beregne og vise FPS (Frames Per Seconds):
                frameCount: 0,      // Antall frames siden forrige visning.
                elapsedTotal: 0     // Sum forløpt tid (sek.) siden forrige visning.
            },
            light: {
                lightPosition: {x: 0, y:6, z:0},
                diffuseLightColor: {r: 0.5, g: 0.5, b:0.5},
                ambientLightColor: {r: 0.2, g: 0.2, b:0.2},
            },
        };

        initKeyPress(renderInfo);
        const camera = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys);
        camera.camPosX = 15;
        camera.camPosY = 40;
        camera.camPosZ = 60;

        document.getElementById('light-position').innerHTML = vectorToString(renderInfo.light.lightPosition);
        document.getElementById('diffuse-light-color').innerHTML = vectorToString(renderInfo.light.diffuseLightColor);
        document.getElementById('ambient-light').innerHTML = vectorToString(renderInfo.light.ambientLightColor);
        document.getElementById('camera').innerHTML = camera.toString();

        animate( 0, renderInfo, camera);

	}, textureUrls);
}

/**
 * Knytter tastatur-evnents til eventfunksjoner.
 */
function initKeyPress(renderInfo) {
	document.addEventListener('keyup', (event) => {
		renderInfo.currentlyPressedKeys[event.code] = false;
	}, false);
	document.addEventListener('keydown', (event) => {
		renderInfo.currentlyPressedKeys[event.code] = true;
	}, false);
}

function initBaseShaders(gl) {
	// Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
	let vertexShaderSource = document.getElementById('base-vertex-shader').innerHTML;
	let fragmentShaderSource = document.getElementById('base-fragment-shader').innerHTML;

	// Initialiserer  & kompilerer shader-programmene;
	const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

	// Samler all shader-info i ET JS-objekt, som returneres.
	return  {
		program: glslShader.shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
			vertexColor: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexColor'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
		},
	};
}

/**
 * Lysberegning  gjøres i fragmenshaderen.
 * @param gl
 * @returns {{uniformLocations: {normalMatrix: WebGLUniformLocation, lightPosition: WebGLUniformLocation, projectionMatrix: WebGLUniformLocation, diffuseLightColor: WebGLUniformLocation, modelMatrix: WebGLUniformLocation, ambientLightColor: WebGLUniformLocation, modelViewMatrix: WebGLUniformLocation}, attribLocations: {vertexNormal: GLint, vertexPosition: GLint}, program: (null|*)}}
 */
function initDiffuseLightTextureShader(gl, usePhongShading=false) {

	if (usePhongShading)
		document.getElementById('gourad-phong').innerHTML = 'PHONG';
	else
		document.getElementById('gourad-phong').innerHTML = 'GOURAD';

	// Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
	let vertexShaderSource = undefined;
	let fragmentShaderSource = undefined;
	if (usePhongShading) {
		vertexShaderSource = document.getElementById('diffuse-pointlight-phong-vertex-shader').innerHTML;
		fragmentShaderSource = document.getElementById('diffuse-pointlight-phong-fragment-shader').innerHTML;
	} else {
		vertexShaderSource = document.getElementById('diffuse-pointlight-gourad-vertex-shader').innerHTML;
		fragmentShaderSource = document.getElementById('diffuse-pointlight-gourad-fragment-shader').innerHTML;
	}
	// Initialiserer  & kompilerer shader-programmene;
	const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

	// Samler all shader-info i ET JS-objekt, som returneres.
	return  {
		program: glslShader.shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
			vertexNormal: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexNormal'),
			vertexTextureCoordinate: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexTextureCoordinate'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
			modelMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelMatrix'),
			normalMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uNormalMatrix'),

			lightPosition: gl.getUniformLocation(glslShader.shaderProgram, 'uLightPosition'),
			ambientLightColor: gl.getUniformLocation(glslShader.shaderProgram, 'uAmbientLightColor'),
			diffuseLightColor: gl.getUniformLocation(glslShader.shaderProgram, 'uDiffuseLightColor'),

			sampler: gl.getUniformLocation(glslShader.shaderProgram, 'uSampler'),
		},
	};
}

function initCoordBuffers(gl) {
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
		1,0,0,1,   //R G B A
		1,0,0,1,   //R G B A
		0,1,0,1,   //R G B A
		0,1,0,1,   //R G B A
		0,0,1,1,   //R G B A
		0,0,1,1,   //R G B A
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

function initXZPlaneBuffers(gl, textureImage) {
	const XZPLANE_SIZE=100;
	let positions = [
		-XZPLANE_SIZE/2, 0, XZPLANE_SIZE/2,
		XZPLANE_SIZE/2, 0, XZPLANE_SIZE/2,
		-XZPLANE_SIZE/2, 0, -XZPLANE_SIZE/2,
		-XZPLANE_SIZE/2, 0, -XZPLANE_SIZE/2,
		XZPLANE_SIZE/2, 0, XZPLANE_SIZE/2,
		XZPLANE_SIZE/2, 0, -XZPLANE_SIZE/2,
	];
	let normals = [
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,

		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
	];
	let textureCoordinates = [
		0, 0,
		1, 0,
		0, 1,
		0, 1,
		1, 0,
		1, 1
	];

	//Texture:
	const rectangleTexture = gl.createTexture();
	//Teksturbildet er nå lastet fra server, send til GPU:
	gl.bindTexture(gl.TEXTURE_2D, rectangleTexture);
	//Unngaa at bildet kommer opp-ned:
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    //Merk: Bruker her premultiplied alpha, som gjør at hver texel multipliseres med sin egen alpha-verdi.
    //Betyr: Sett gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); ved tegning av objektet, for å få riktig blending med bakgrunn.
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	//Laster teksturbildet til GPU/shader:
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);

    //Teksturparametre:
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);

	const textureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	const normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return  {
		position: positionBuffer,
		normal: normalBuffer,
		texture: textureBuffer,
		textureObject: rectangleTexture,
		vertexCount: positions.length/3,
	};
}

function connectPositionAttribute(gl, shader, positionBuffer) {
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

function connectNormalAttribute(gl, shader, normalBuffer) {
	const numComponents = 3;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.vertexAttribPointer(
		shader.attribLocations.vertexNormal,
		numComponents,
		type,
		normalize,
		stride,
		offset);
	gl.enableVertexAttribArray(shader.attribLocations.vertexNormal);
}

function connectAmbientUniform(gl, shader, color) {
	gl.uniform3f(shader.uniformLocations.ambientLightColor, color.r,color.g,color.b);
}

function connectDiffuseUniform(gl, shader,color) {
	gl.uniform3f(shader.uniformLocations.diffuseLightColor, color.r,color.g,color.b);
}

function connectLightPositionUniform(gl, shader, position) {
	gl.uniform3f(shader.uniformLocations.lightPosition, position.x,position.y,position.z);
}

/**
 * Kopler til og aktiverer teksturkoordinat-bufferet.
 */
function connectTextureAttribute(gl, textureShader, textureBuffer, textureObject) {
	const numComponents = 2;    //NB!
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	//Bind til teksturkoordinatparameter i shader:
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	gl.vertexAttribPointer(
		textureShader.attribLocations.vertexTextureCoordinate,
		numComponents,
		type,
		normalize,
		stride,
		offset);
	gl.enableVertexAttribArray(textureShader.attribLocations.vertexTextureCoordinate);

	//Aktiver teksturenhet (0):
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textureObject);
	//Send inn verdi som indikerer hvilken teksturenhet som skal brukes (her 0):
	gl.uniform1i(textureShader.uniformLocations.sampler, 0);
}

function animate(currentTime, renderInfo, camera) {
	window.requestAnimationFrame((currentTime) => {
		animate(currentTime, renderInfo, camera);
	});

    // Finner tid siden siste kall på draw().
    let elapsed = getElapsed(currentTime, renderInfo);
    // Beregner og viser fps:
    calculateFps(elapsed, renderInfo.fpsInfo);

	camera.handleKeys(elapsed);

	document.getElementById('camera').innerHTML = camera.toString();

	draw(currentTime, renderInfo, camera);
}

/**
 * Beregner forløpt tid siden siste kall.
 * @param currentTime
 * @param renderInfo
 */
function getElapsed(currentTime, renderInfo) {
	let elapsed = 0.0;
	if (renderInfo.lastTime !== 0.0)	// Først gang er lastTime = 0.0.
		elapsed = (currentTime - renderInfo.lastTime)/1000; // Deler på 1000 for å operere med sekunder.
	renderInfo.lastTime = currentTime;						// Setter lastTime til currentTime.
	return elapsed;
}

/**
 * Beregner og viser FPS.
 * @param elapsed Forløpt tid (i sekunder) siden forrige frame.
 * @param fpsInfo
 */
function calculateFps(elapsed, fpsInfo) {
    fpsInfo.frameCount++;
    fpsInfo.elapsedTotal += elapsed;
    // Viser oppdatert FPS én gang i sekundet:
    if (fpsInfo.elapsedTotal >= 1.0) {
        // Viser FPS i .html ("fps" er definert i .html fila):
        document.getElementById('fps').innerHTML = Math.round(fpsInfo.frameCount / fpsInfo.elapsedTotal);
        // Nullstiller tellere:
        fpsInfo.frameCount = 0;
        fpsInfo.elapsedTotal = 0;
    }
}

function clearCanvas(gl) {
	gl.clearColor(0.9, 0.9, 0.9, 1);  // Clear screen farge.
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);           // Enable "depth testing".
	gl.depthFunc(gl.LEQUAL);            // Nære objekter dekker fjerne objekter.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

/**
 * Tegner!
 */
function draw(currentTime, renderInfo, camera) {
	clearCanvas(renderInfo.gl);
	drawCoord(renderInfo, camera);
	drawXZPlane(renderInfo, camera);
}

function drawCoord(renderInfo, camera) {
    const gl = renderInfo.gl;
    // Aktiver shader:
    gl.useProgram(renderInfo.baseShader.program);

    // Kople posisjon og farge-attributtene til tilhørende buffer:
    connectPositionAttribute(gl, renderInfo.baseShader, renderInfo.coordBuffers.position);
    connectColorAttribute(gl, renderInfo.baseShader, renderInfo.coordBuffers.color);
    // MODEL:
    renderInfo.modelMatrix.setIdentity();
    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);

    // Send kameramatrisene til shaderen:
    gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
    gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
    // Tegn coord:
    gl.drawArrays(gl.LINES, 0, renderInfo.coordBuffers.vertexCount);
}

function drawXZPlane(renderInfo, camera) {
    const gl = renderInfo.gl;
	// Aktiver shader:
	gl.useProgram(renderInfo.diffuseLightTextureShader.program);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(gl, renderInfo.diffuseLightTextureShader, renderInfo.xzplaneBuffers.position);
	connectNormalAttribute(gl, renderInfo.diffuseLightTextureShader, renderInfo.xzplaneBuffers.normal);

	connectAmbientUniform(gl, renderInfo.diffuseLightTextureShader, renderInfo.light.ambientLightColor);
	connectDiffuseUniform(gl, renderInfo.diffuseLightTextureShader, renderInfo.light.diffuseLightColor);
	connectLightPositionUniform(gl, renderInfo.diffuseLightTextureShader, renderInfo.light.lightPosition);

	connectTextureAttribute(gl, renderInfo.diffuseLightTextureShader, renderInfo.xzplaneBuffers.texture, renderInfo.xzplaneBuffers.textureObject);

    // MODEL:
    renderInfo.modelMatrix.setIdentity();
    renderInfo.modelMatrix.translate(0,0,0);
    renderInfo.modelMatrix.scale(0.5,0.5, 0.5);
    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);

	// Send MODELLmatrisa til shaderen:
	gl.uniformMatrix4fv(renderInfo.diffuseLightTextureShader.uniformLocations.modelMatrix, false, renderInfo.modelMatrix.elements);

	gl.uniformMatrix4fv(renderInfo.diffuseLightTextureShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
	gl.uniformMatrix4fv(renderInfo.diffuseLightTextureShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);

	// Beregner og sender inn matrisa som brukes til å transformere normalvektorene:
	let normalMatrix = mat3.create();
	mat3.normalFromMat4(normalMatrix, renderInfo.modelMatrix.elements);  //NB!!! mat3.normalFromMat4! SE: gl-matrix.js
	// Send normalmatrisa til shaderen (merk: 3x3):
	gl.uniformMatrix3fv(renderInfo.diffuseLightTextureShader.uniformLocations.normalMatrix, false, normalMatrix);

	gl.drawArrays(gl.TRIANGLES, 0, renderInfo.xzplaneBuffers.vertexCount);
}
