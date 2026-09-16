import {WebGLCanvas} from '../../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../../base/helpers/WebGLShader.js';
import {Camera} from '../../../base/helpers/Camera.js';
/**
 * Et WebGL-program som tegner en enkel torus.
 */

export function main() {
	// Oppretter et canvas for WebGL-tegning:
	const canvas = new WebGLCanvas('myCanvas', document.body, 960, 640);

	// Starter med å laste teksturer:

	// Hjelpeobjekt som holder på objekter som trengs for rendring:
	const renderInfo = {
		gl: canvas.gl,
		baseShader: initBaseShaders(canvas.gl),
		cubeShader: initCubeShaders(canvas.gl),
		coordBuffers: initCoordBuffers(canvas.gl),
		cubeBuffers: initCubeBuffers(canvas.gl),
        modelMatrix: new Matrix4(),
        modelviewMatrix: new Matrix4(),
		currentlyPressedKeys: [],
	};

	initKeyPress(renderInfo);
	const camera = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys);
	camera.camPosX = 5;
	camera.camPosY = 5;
	camera.camPosZ = 6.5;
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

function initCubeShaders(gl) {
	// Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
	let vertexShaderSource = document.getElementById('texture-vertex-shader').innerHTML;
	let fragmentShaderSource = document.getElementById('texture-fragment-shader').innerHTML;

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
 * Oppretter verteksbuffer for koordinatsystemet.
 * 6 vertekser, 2 for hver akse.
 * Tegnes vha. gl.LINES
 * Et posisjonsbuffer og et fargebuffer.
 * MERK: Må være likt antall posisjoner og farger.
 */
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
		-1,-1, 1,
		1,-1, 1,

		-1,1,1,
		1, -1, 1,
		1,1,1,

		//H�yre side:

		1,1,1,
		1,-1,1,
		1,-1,-1,

		1,1,1,
		1,-1,-1,
		1,1,-1,

		//Baksiden (pos):
		1,-1,-1,
		-1,-1,-1,
		1, 1,-1,

		-1,-1,-1,
		-1,1,-1,
		1,1,-1,

		//Venstre side:
		-1,-1,-1,
		-1,1,1,
		-1,1,-1,

		-1,-1,1,
		-1,1,1,
		-1,-1,-1,

		//Topp:
		-1,1,1,
		1,1,1,
		-1,1,-1,

		-1,1,-1,
		1,1,1,
		1,1,-1,

		//Bunn:
		-1,-1,-1,
		1,-1,1,
		-1,-1,1,

		-1,-1,-1,
		1,-1,-1,
		1,-1,1,
	];

	//Bruker ulike farger på hver side:
	let colors = [];
	//Forsiden (RØD)
	let color1 = {red: 1.0, green: 0.0, blue: 0.0, alpha: 0.7}
	for (let i = 0; i < 6; i++) {
		colors.push(color1.red, color1.green, color1.blue, color1.alpha);
	}
	//Høyre side ()GRØNN)
	let color2 = {red: 0.0, green: 1.0, blue: 0.0, alpha: 0.7}
	for (let i = 0; i < 6; i++) {
		colors.push(color2.red, color2.green, color2.blue, color2.alpha);
	}
	//Baksiden (BLÅ)
	let color3 = {red: 0.0, green: 0.0, blue: 1.0, alpha: 0.7}
	for (let i = 0; i < 6; i++) {
		colors.push(color3.red, color3.green, color3.blue, color3.alpha);
	}
	//Venstre side (CYAN/LYS BLÅ
	let color4 = {red: 0.0, green: 1.0, blue: 1.0, alpha: 0.7}
	for (let i = 0; i < 6; i++) {
		colors.push(color4.red, color4.green, color4.blue, color4.alpha);
	}
	//Topp (GUL)
	let color5 = {red: 1.0, green: 1.0, blue: 0.0, alpha: 0.7}
	for (let i = 0; i < 6; i++) {
		colors.push(color5.red, color5.green, color5.blue, color5.alpha);
	}
	//Bunn (MAGENTA/LILLA)
	let color6 = {red: 1.0, green: 0.0, blue: 1.0, alpha: 0.7}
	for (let i = 0; i < 6; i++) {
		colors.push(color6.red, color6.green, color6.blue, color6.alpha);
	}

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return  {
		position: positionBuffer,
		color: colorBuffer,
		vertexCount: positions.length/3,
	};
}

/**
 * Aktiverer position-bufferet.
 * Kalles fra draw()
 */
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

/**
 * Aktiverer color-bufferet.
 * Kalles fra draw()
 */
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

/**
 * Klargjør canvaset.
 * Kalles fra draw()
 */
function clearCanvas(gl) {
	gl.clearColor(0.9, 0.9, 0.9, 1);  // Clear screen farge.
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);           // Enable "depth testing".
	gl.depthFunc(gl.LEQUAL);            // Nære objekter dekker fjerne objekter.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function animate(currentTime, renderInfo, camera) {
	window.requestAnimationFrame((currentTime) => {
		animate(currentTime, renderInfo, camera);
	});

	// Finner tid siden siste kall på draw().
	let elapsed = getElapsed(currentTime, renderInfo);
	camera.handleKeys(elapsed);
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
 * Tegner!
 */
function draw(currentTime, renderInfo, camera) {
    const gl = renderInfo.gl;

	clearCanvas(gl);

	// Tegner koordinatsystemet:
	drawCoord(renderInfo, camera);

	//STEG 1: Tegner alle UGJENNOMSIKTIGE (OPAQUE) objekter først:
	//* ... ingenting å tegne her.

	//STEG 2: Tegner alle GJENNOMSIKTIGE objekter, i rekkefølgen innerst til ytterst:
	//* Enabler blending:
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	//* Slår AV depthMask (endrer dermed ikke DEPTH-BUFFER):
	gl.depthMask(false);
	//* Tegner:
	drawTransparentObjects(renderInfo, camera);
	//* Slår PÅ depthMask (dybdebufferet oppdateres):
	gl.depthMask(true);
}

function drawTransparentObjects(renderInfo, camera) {
	drawCube(renderInfo, camera);
}

function drawCube(renderInfo, camera) {
    const gl = renderInfo.gl;

	// Aktiver shader:
	gl.useProgram(renderInfo.cubeShader.program);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(gl, renderInfo.cubeShader, renderInfo.cubeBuffers.position);
	connectColorAttribute(gl, renderInfo.cubeShader, renderInfo.cubeBuffers.color);

    // MODEL:
    renderInfo.modelMatrix.setIdentity();
    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);

	gl.uniformMatrix4fv(renderInfo.cubeShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
	gl.uniformMatrix4fv(renderInfo.cubeShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);

	// Bruker culling for korrekt blending:
	gl.frontFace(gl.CCW);     // Angir vertekser CCW.
	gl.enable(gl.CULL_FACE);  // Aktiverer culling.

	//Tegner baksidene først:
	gl.cullFace(gl.FRONT);    // Skjuler forsider.
	gl.drawArrays(gl.TRIANGLES, 0, renderInfo.cubeBuffers.vertexCount);

	//Tegner deretter forsidene:
	gl.cullFace(gl.BACK);     // Skjuler baksider.
	gl.drawArrays(gl.TRIANGLES, 0, renderInfo.cubeBuffers.vertexCount);
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
