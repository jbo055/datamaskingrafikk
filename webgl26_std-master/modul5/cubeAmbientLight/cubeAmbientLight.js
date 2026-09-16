import {WebGLCanvas} from '../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../base/helpers/WebGLShader.js';
import {Camera} from '../../base/helpers/Camera.js';
import {vectorToString} from '../../base/lib/utility-functions.js';

export function main() {
	// Oppretter et webGLCanvas for WebGL-tegning:
	const webGLCanvas = new WebGLCanvas('myCanvas', document.body, 960, 640);
	// Hjelpeobjekt som holder på objekter som trengs for rendring:
	const renderInfo = {
		gl: webGLCanvas.gl,
		baseShader: initBaseShaders(webGLCanvas.gl),
		ambientLightShader: initAmbientLightShader(webGLCanvas.gl),

		coordBuffers: initCoordBuffers(webGLCanvas.gl),
		cubeBuffers: initCubeBuffers(webGLCanvas.gl),

        modelMatrix: new Matrix4(),
        modelviewMatrix: new Matrix4(),

		currentlyPressedKeys: [],
		lastTime: 0,
		fpsInfo: {  // Brukes til å beregne og vise FPS (Frames Per Seconds):
            frameCount: 0,      // Antall frames siden forrige visning.
            elapsedTotal: 0     // Sum forløpt tid (sek.) siden forrige visning.
		},
		light: {
			ambientLightColor: {r: 0.2, g: 0.2, b:0.2, a:1},
		},
	};

	initKeyPress(renderInfo);
	const camera = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys);
	camera.camPosX = 2.5;
	camera.camPosY = 6;
	camera.camPosZ = 10;

	document.getElementById('ambient-light').innerHTML = vectorToString(renderInfo.light.ambientLightColor);
	document.getElementById('camera').innerHTML = camera.toString();

	animate( 0, renderInfo, camera);
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

function initAmbientLightShader(gl) {
	// Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
	let vertexShaderSource = document.getElementById('ambient-vertex-shader').innerHTML;
	let fragmentShaderSource = document.getElementById('ambient-fragment-shader').innerHTML;

	// Initialiserer  & kompilerer shader-programmene;
	const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

	// Samler all shader-info i ET JS-objekt, som returneres.
	return  {
		program: glslShader.shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
			ambientLightColor: gl.getUniformLocation(glslShader.shaderProgram, 'uAmbientLightColor'),
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

function initCubeBuffers(gl) {
	let positions = [
		//Forsiden (pos):
		-1, 1, 1,
		-1, -1, 1,
		1, -1, 1,

		-1, 1, 1,
		1, -1, 1,
		1, 1, 1,

		//H�yre side:
		1, 1, 1,
		1, -1, 1,
		1, -1, -1,

		1, 1, 1,
		1, -1, -1,
		1, 1, -1,

		//Baksiden:
		1, -1, -1,
		-1, -1, -1,
		1, 1, -1,

		-1, -1, -1,
		-1, 1, -1,
		1, 1, -1,

		//Venstre side:
		-1, -1, -1,
		-1, 1, 1,
		-1, 1, -1,

		-1, -1, 1,
		-1, 1, 1,
		-1, -1, -1,

		//Topp:
		-1, 1, 1,
		1, 1, 1,
		-1, 1, -1,

		-1, 1, -1,
		1, 1, 1,
		1, 1, -1,

		//Bunn:
		-1, -1, -1,
		1, -1, 1,
		-1, -1, 1,

		-1, -1, -1,
		1, -1, -1,
		1, -1, 1
	];

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return  {
		position: positionBuffer,
		vertexCount: positions.length/3,
	};
}

function connectPositionAttribute(gl, baseShader, positionBuffer) {
	const numComponents = 3;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.vertexAttribPointer(
		baseShader.attribLocations.vertexPosition,
		numComponents,
		type,
		normalize,
		stride,
		offset);
	gl.enableVertexAttribArray(baseShader.attribLocations.vertexPosition);
}

function connectColorAttribute(gl, baseShader, colorBuffer) {
	const numComponents = 4;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.vertexAttribPointer(
		baseShader.attribLocations.vertexColor,
		numComponents,
		type,
		normalize,
		stride,
		offset);
	gl.enableVertexAttribArray(baseShader.attribLocations.vertexColor);
}

function connectAmbientUniform(gl, ambientLightShader, color) {
	gl.uniform4f(ambientLightShader.uniformLocations.ambientLightColor, color.r, color.g, color.b, color.a);
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
	drawCube(renderInfo, camera);
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

function drawCube(renderInfo, camera) {
    const gl = renderInfo.gl;
	// Aktiver shader:
	gl.useProgram(renderInfo.ambientLightShader.program);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(gl, renderInfo.ambientLightShader, renderInfo.cubeBuffers.position);
	connectAmbientUniform(gl, renderInfo.ambientLightShader, renderInfo.light.ambientLightColor);

    // MODEL: M=I*T*O*R*S, der O=R*T
    renderInfo.modelMatrix.setIdentity();
    renderInfo.modelMatrix.translate(0,0,0);
    renderInfo.modelMatrix.scale(0.5,0.5, 0.5);
    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);
	// Send kameramatrisene til shaderen:
	gl.uniformMatrix4fv(renderInfo.ambientLightShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
	gl.uniformMatrix4fv(renderInfo.ambientLightShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);

	gl.drawArrays(gl.TRIANGLES, 0, renderInfo.cubeBuffers.vertexCount);
}
