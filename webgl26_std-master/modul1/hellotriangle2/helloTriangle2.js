import {WebGLCanvas} from '../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../base/helpers/WebGLShader.js';

/**
 * Et WebGL-program som tegner en enkel trekant.
 * Bruker ikke klasser, kun funksjoner.
 */
export function main() {
	// Oppretter et webGLCanvas for WebGL-tegning:
	const webGLCanvas = new WebGLCanvas('myCanvas', document.body, 960, 640);
	const gl = webGLCanvas.gl;
	let baseShader = initBaseShaders(gl);
	let buffers = initBuffers(gl);
	draw(gl, baseShader, buffers);
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
 * Genererer view- og projeksjonsmatrisene.
 * Disse utgjør tilsanmmen det virtuelle kameraet.
 */
function initCamera(gl) {
	// Kameraposisjon:
	const camPosX = 0;
	const camPosY = 0;
	const camPosZ = 10;

	// Kamera ser mot ...
	const lookAtX = 0;
	const lookAtY = 0;
	const lookAtZ = 0;

	// Kameraorientering:
	const upX = 0;
	const upY = 1;
	const upZ = 0;

	let viewMatrix = new Matrix4();
	let projectionMatrix = new Matrix4();

	// VIEW-matrisa:
	viewMatrix.setLookAt(camPosX, camPosY, camPosZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ);
	// PROJECTION-matrisa (frustum): cuon-utils: Matrix4.prototype.setPerspective = function(fovy, aspect, near, far)
	const fieldOfView = 45; // I grader.
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const near = 0.1;
	const far = 1000.0;
	// PROJEKSJONS-matrisa; Bruker cuon-utils: Matrix4.prototype.setPerspective = function(fovy, aspect, near, far)
	projectionMatrix.setPerspective(fieldOfView, aspect, near, far);

	return {
		viewMatrix: viewMatrix,
		projectionMatrix: projectionMatrix
	};
}

/**
 * Oppretter verteksbuffer for trekanten.
 * Et buffer som inneholder både posisjoner og et farger.
 * MERK: Deler på 7 for å beregne antall vertekser.
 */
function initBuffers(gl) {
	const width =  5;
	const height =  5;

	const positionAndColors = new Float32Array([
		0.0,        height/2,  0.0,  0, 0.3, 0, 1,  // X Y Z  R G B A
		-width/2,   -height/2, 0.0,  1, 0.3, 0, 1,  // X Y Z  R G B A
		width/2,    -height/2, 0.0,  1, 0.3, 1, 1   // X Y Z  R G B A
	]);

	const positionAndColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionAndColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positionAndColors, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return  {
		positionAndColor: positionAndColorBuffer,
		vertexCount: positionAndColors.length/7  //<==MERK 7
	};
}

/**
 * Aktiverer position-bufferet.
 * Kalles fra draw()
 */
function connectPositionAttribute(gl, baseShader, positionAndColor) {
	const numComponents = 3;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 7*4;	//<== (se også under)
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, positionAndColor);
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
function connectColorAttribute(gl, baseShader, positionAndColor) {
	const numComponents = 4;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 7*4;	//<== Spesifiserer, i antall bytes, avstanden mellom verteksene.
	const offset = 3*4;	//<== Hvor starter fargen (bytenr) innafor verteksen.
	gl.bindBuffer(gl.ARRAY_BUFFER, positionAndColor);
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

/**
 * Tegner!
 */
function draw(gl, baseShader, buffers) {
	clearCanvas(gl);

	// Aktiver shader:
	gl.useProgram(baseShader.program);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(gl, baseShader, buffers.positionAndColor);
	connectColorAttribute(gl, baseShader, buffers.positionAndColor);

	// Lag viewmodel-matrisa:
	let modelMatrix = new Matrix4();
	modelMatrix.setIdentity();
	modelMatrix.translate(-3, 1,0);
	modelMatrix.rotate(30, 0,0,1);

	let cameraMatrixes = initCamera(gl);
	let modelviewMatrix = new Matrix4(cameraMatrixes.viewMatrix.multiply(modelMatrix)); // NB! rekkefølge!

	// Send matrisene til shaderen:
	gl.uniformMatrix4fv(baseShader.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
	gl.uniformMatrix4fv(baseShader.uniformLocations.projectionMatrix, false, cameraMatrixes.projectionMatrix.elements);

	// Tegn!
	gl.drawArrays(gl.TRIANGLES, 0, buffers.vertexCount);
}
