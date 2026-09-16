import {WebGLCanvas} from '../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../base/helpers/WebGLShader.js';
import {Camera} from '../../base/helpers/Camera.js';
import {niceColors, vectorToString} from "../../base/lib/utility-functions.js";

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

	let usePhongShading = true;
	checkBox.checked = usePhongShading;
	startProgram(webGLCanvas, usePhongShading);
}

function startProgram(webGLCanvas, usePhong) {

	const shininessSelector = document.getElementById("shininess");
	shininessSelector.addEventListener("click", (event) => {
		renderInfo.light.shininess = shininessSelector.value;
	})

	const intensitySelector = document.getElementById("intensity");
	intensitySelector.addEventListener("click", (event) => {
		renderInfo.light.intensity = intensitySelector.value;
	})

	const selectedNiceColor = niceColors.pewter;

	// Hjelpeobjekt som holder på objekter som trengs for rendring:
	const renderInfo = {
		gl: webGLCanvas.gl,
		baseShader: initBaseShaders(webGLCanvas.gl),
		specularLightShader: initSpecularLightShader(webGLCanvas.gl, usePhong),

		coordBuffers: initCoordBuffers(webGLCanvas.gl),
		sphereBuffers: initSphereBuffers(webGLCanvas.gl),

        modelMatrix: new Matrix4(),
        modelviewMatrix: new Matrix4(),

		currentlyPressedKeys: [],
		lastTime: 0,
		fpsInfo: {  // Brukes til å beregne og vise FPS (Frames Per Seconds):
            frameCount: 0,      // Antall frames siden forrige visning.
            elapsedTotal: 0     // Sum forløpt tid (sek.) siden forrige visning.
		},
		light: {
			lightPosition: {x: 10, y:10, z:10},

			ambientLightColor: selectedNiceColor.ambient,
			diffuseLightColor: selectedNiceColor.diffuse,
			specularLightColor: selectedNiceColor.specular,
			shininess: selectedNiceColor.shininess,
			intensity: selectedNiceColor.intensity
		},
	};

	shininessSelector.value = renderInfo.light.shininess;
	intensitySelector.value = renderInfo.light.intensity;

	initKeyPress(renderInfo);
	const camera = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys);
	camera.camPosX = -10;
	camera.camPosY = 6;
	camera.camPosZ = -3;

	document.getElementById('light-position').innerHTML = vectorToString(renderInfo.light.lightPosition);
	document.getElementById('ambient-light-color').innerHTML = vectorToString(renderInfo.light.ambientLightColor);
	document.getElementById('diffuse-light-color').innerHTML = vectorToString(renderInfo.light.diffuseLightColor);
	document.getElementById('specular-light-color').innerHTML = vectorToString(renderInfo.light.specularLightColor);
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

/**
 * Lysberegning  gjøres i fragmenshaderen.
 * @param gl
 * @returns {{uniformLocations: {normalMatrix: WebGLUniformLocation, lightPosition: WebGLUniformLocation, projectionMatrix: WebGLUniformLocation, specularLightColor: WebGLUniformLocation, modelMatrix: WebGLUniformLocation, ambientLightColor: WebGLUniformLocation, modelViewMatrix: WebGLUniformLocation}, attribLocations: {vertexNormal: GLint, vertexPosition: GLint}, program: (null|*)}}
 */
function initSpecularLightShader(gl, usePhongShading=false) {
	if (usePhongShading)
		document.getElementById('gourad-phong').innerHTML = 'PHONG';
	else
		document.getElementById('gourad-phong').innerHTML = 'GOURAD';

	// Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
	let vertexShaderSource = undefined;
	let fragmentShaderSource = undefined;
	if (usePhongShading) {
		vertexShaderSource = document.getElementById('specular-phong-vertex-shader').innerHTML;
		fragmentShaderSource = document.getElementById('specular-phong-fragment-shader').innerHTML;
	} else {
		vertexShaderSource = document.getElementById('specular-gourad-vertex-shader').innerHTML;
		fragmentShaderSource = document.getElementById('specular-gourad-fragment-shader').innerHTML;
	}
	// Initialiserer  & kompilerer shader-programmene;
	const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

	// Samler all shader-info i ET JS-objekt, som returneres.
	return  {
		program: glslShader.shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
			vertexNormal: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexNormal'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
			modelMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelMatrix'),
			normalMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uNormalMatrix'),

			lightPosition: gl.getUniformLocation(glslShader.shaderProgram, 'uLightPosition'),
			cameraPosition: gl.getUniformLocation(glslShader.shaderProgram, 'uCameraPosition'),
			ambientLightColor: gl.getUniformLocation(glslShader.shaderProgram, 'uAmbientLightColor'),
			diffuseLightColor: gl.getUniformLocation(glslShader.shaderProgram, 'uDiffuseLightColor'),
			specularLightColor: gl.getUniformLocation(glslShader.shaderProgram, 'uSpecularLightColor'),

			shininess: gl.getUniformLocation(glslShader.shaderProgram, 'uShininess'),
			intensity: gl.getUniformLocation(glslShader.shaderProgram, 'uIntensity'),
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

function initSphereBuffers(gl) {
	let positions = [];
	let normals = [];
	let indices = [];

	// Basert på kode fra: http://learningwebgl.com/blog/?p=1253
	let radius = 5;
	let latitudeBands = 30;     //latitude: parallellt med ekvator.
	let longitudeBands = 30;    //longitude: går fra nord- til sydpolen.

	//Genererer vertekser:
	for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
		let theta = latNumber * Math.PI / latitudeBands;
		let sinTheta = Math.sin(theta);
		let cosTheta = Math.cos(theta);

		for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
			let phi = longNumber * 2 * Math.PI / longitudeBands;
			let sinPhi = Math.sin(phi);
			let cosPhi = Math.cos(phi);

			let x = cosPhi * sinTheta;
			let y = cosTheta;
			let z = sinPhi * sinTheta;

			positions.push(radius * x);
			positions.push(radius * y);
			positions.push(radius * z);

			let normal = calculateSphereNormalForVertex(x, y, z);
			normals.push(normal[0]);
			normals.push(normal[1]);
			normals.push(normal[2]);
		}
	}

	//Genererer indeksdata for å knytte sammen verteksene:
	for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
		for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
			let first = (latNumber * (longitudeBands + 1)) + longNumber;
			let second = first + longitudeBands + 1;
			indices.push(first);
			indices.push(second);
			indices.push(first + 1);

			indices.push(second);
			indices.push(second + 1);
			indices.push(first + 1);
		}
	}

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	const normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//Indeksbuffer: oppretter, binder og skriver data til bufret:
	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	return  {
		position: positionBuffer,
		normal: normalBuffer,
		index: indexBuffer,
		vertexCount: positions.length/3,
		indexCount: indices.length
	};
}

// Returnerer normalisert normalvektor for kuleverteks:
function calculateSphereNormalForVertex(x, y, z) {
	let normal = vec3.fromValues(x,y,z);
	let normalisertNormal = vec3.create();
	vec3.normalize(normalisertNormal, normal);
	return normalisertNormal;
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
	gl.uniform4f(shader.uniformLocations.ambientLightColor, color.r, color.g, color.b, color.a);
}

function connectDiffuseUniform(gl, shader,color) {
	gl.uniform4f(shader.uniformLocations.diffuseLightColor, color.r, color.g, color.b, color.a);
}

function connectSpecularUniform(gl, shader,color) {
	gl.uniform4f(shader.uniformLocations.specularLightColor, color.r, color.g, color.b, color.a);
}

function connectLightPositionUniform(gl, shader, position) {
	gl.uniform3f(shader.uniformLocations.lightPosition, position.x,position.y,position.z);
}

function connectCameraPositionUniform(gl, shader, camera) {
	gl.uniform3f(shader.uniformLocations.cameraPosition, camera.camPosX, camera.camPosY, camera.camPosZ);
}

function connectShininessUniform(gl, shader, value) {
	gl.uniform1f(shader.uniformLocations.shininess, value);
}

function connectIntensityUniform(gl, shader, value) {
	gl.uniform1f(shader.uniformLocations.intensity, value);
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
    const gl = renderInfo.gl;
	clearCanvas(gl);

	//AKTIVERER MULIGHETEN FOR GJENNOMSIKTIGHET:
	gl.enable(gl.BLEND);
	gl.blendEquation(gl.FUNC_ADD);    //FUNC_ADD, FUNC_SUBTRACT,
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	//** TEGN ALLE UGJENNOMSIKTIGE OBJEKTER FØRST:
	//** Slår PÅ depthMask:
	gl.depthMask(true);
	drawCoord(renderInfo, camera);

	//** TEGN ALLE GJENNOMSIKTIGE OBJEKTER, I REKKEFØLGE:
	//** Slår PÅ depthMask (endrer dermed ikke DEPTH-BUFFER):
	gl.depthMask(false);
	drawSphere(renderInfo, camera);
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

function drawSphere(renderInfo, camera) {
    const gl = renderInfo.gl;
	// Aktiver shader:
	gl.useProgram(renderInfo.specularLightShader.program);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(gl, renderInfo.specularLightShader, renderInfo.sphereBuffers.position);
	connectNormalAttribute(gl, renderInfo.specularLightShader, renderInfo.sphereBuffers.normal);

	connectAmbientUniform(gl, renderInfo.specularLightShader, renderInfo.light.ambientLightColor);
	connectDiffuseUniform(gl, renderInfo.specularLightShader, renderInfo.light.diffuseLightColor);
	connectSpecularUniform(gl, renderInfo.specularLightShader, renderInfo.light.specularLightColor);
	connectLightPositionUniform(gl, renderInfo.specularLightShader, renderInfo.light.lightPosition);
	connectCameraPositionUniform(gl, renderInfo.specularLightShader, camera);

	connectShininessUniform(gl, renderInfo.specularLightShader, renderInfo.light.shininess);
	connectIntensityUniform(gl, renderInfo.specularLightShader, renderInfo.light.intensity);

    // MODEL:
    renderInfo.modelMatrix.setIdentity();
    renderInfo.modelMatrix.translate(0,0,0);
    renderInfo.modelMatrix.scale(0.5,0.5, 0.5);
	//Sender også inn modellmatrisa:
	gl.uniformMatrix4fv(renderInfo.specularLightShader.uniformLocations.modelMatrix, false, renderInfo.modelMatrix.elements);

    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);

	// Send kameramatrisene til shaderen:
	gl.uniformMatrix4fv(renderInfo.specularLightShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
	gl.uniformMatrix4fv(renderInfo.specularLightShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);

	//Beregner og sender inn matrisa som brukes til å transformere normalvektorene:
	let normalMatrix = mat3.create();
	mat3.normalFromMat4(normalMatrix, renderInfo.modelMatrix.elements);  //NB!!! mat3.normalFromMat4! SE: gl-matrix.js
	gl.uniformMatrix3fv(renderInfo.specularLightShader.uniformLocations.normalMatrix, false, normalMatrix);

	// Bruker culling for korrekt blending:
	gl.frontFace(gl.CW);	    	// Angir vertekser CW.
	gl.enable(gl.CULL_FACE);	    // Aktiverer culling.

	//Tegner baksidene først:
	gl.cullFace(gl.FRONT);	    	// Skjuler forsider.
	gl.drawElements(gl.TRIANGLES, renderInfo.sphereBuffers.indexCount, gl.UNSIGNED_SHORT, 0);
	//Tegner deretter forsidene:
	gl.cullFace(gl.BACK);	    	    // Skjuler baksider.
	gl.drawElements(gl.TRIANGLES, renderInfo.sphereBuffers.indexCount, gl.UNSIGNED_SHORT, 0);
}
