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
	const renderInfo = {
		gl: webGLCanvas.gl,
		baseShader: initBaseShaders(webGLCanvas.gl),
		coordShaderInfo: initCoordShaders(webGLCanvas.gl),
		triangleBuffers: initTriangleBuffer(webGLCanvas.gl),
		coordBuffers: initCoordBuffer(webGLCanvas.gl),
		cubeBuffers: initCubeBuffers(webGLCanvas.gl),
		rotAngleZ: 0,
		triangles: [],
		TRIANGLES_COUNT: 1000
	}

	// Sett tilfeldig posisjon på trekantene:
	/*
	for (let i=0; i < renderInfo.TRIANGLES_COUNT; i++) {
		let x = -10 + Math.random() * 10 * 2;
		let y = -10 + Math.random() * 10 * 2;
		let z = -10 + Math.random() * 10 * 2;
		let scale = Math.random();
		renderInfo.triangles[i] = {
			xpos: x,
			ypos: y,
			zpos: z,
			scale: scale,
			color: {
				r: Math.random(),
				g: Math.random(),
				b: Math.random(),
				a: Math.random()
			}
		};
	}
	 */
	// Sett ordnede posisjoner på trekantene:
    let z=0;
    let i=0;
    for (let x=-95; x < 100; x+=5) {
        for (let y=-95; y < 100; y+=5) {
            renderInfo.triangles[i] = {
                xpos: x,
                ypos: y,
                zpos: z,
                scale: 1.0,
                color: {
                    r: Math.random(),
                    g: Math.random(),
                    b: Math.random(),
                    a: 1.0
                }
            };
            i++;
        }
    }
console.log(i);

	const zRotInput = document.getElementById("zRot");
	const buttonRotate = document.getElementById("buttonRotate");
	buttonRotate.addEventListener("click", (event) => {
		renderInfo.rotAngleZ = Math.round(zRotInput.value);
	});

	animate(0, renderInfo);
	//draw(gl, renderInfo);
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
			fragmentColor: gl.getUniformLocation(glslShader.shaderProgram, 'uFragmentColor'),
			projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
		},
	};
}

function initCoordShaders(gl) {
	// Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
	let vertexShaderSource = document.getElementById('coord-vertex-shader').innerHTML;
	let fragmentShaderSource = document.getElementById('coord-fragment-shader').innerHTML;

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
	const camPosX = 200;
	const camPosY = 70;
	const camPosZ = 400;

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

function initCoordBuffer(gl) {
	const extent =  100;

	const positions = new Float32Array([
		-extent, 0, 0,
		extent, 0, 0,
		0, extent, 0,
		0, -extent, 0,
		0, 0, -extent,
		0, 0, extent
	]);
	const colors = new Float32Array([
		1, 0, 0, 1,
		1, 0, 0, 1,
		0, 1, 0, 1,
		0, 1, 0, 1,
		0, 0, 1, 1,
		0, 0, 1, 1
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
 * Oppretter verteksbuffer for trekanten.
 * Et posisjonsbuffer og et fargebuffer.
 * MERK: Må være likt antall posisjoner og farger.
 */
function initTriangleBuffer(gl) {
	const width =  5;
	const height =  5;

	const positions = new Float32Array([
		0.0,        height/2,   0.0,    // X Y Z
		-width/2,   -height/2,  0.0,    // X Y Z
		width/2,    -height/2,  0.0     // X Y Z
	]);
	/*
        const colors = new Float32Array([
            1, 0.3, 0, 1,   //R G B A
            1, 0.3, 0, 1,   //R G B A
            1, 0.3, 0, 1,   //R G B A
        ]);
    */
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	/*
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    */
	return  {
		position: positionBuffer,
		//color: colorBuffer,
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

	const color = {red: 1.0, green: 0.45, blue: 0.9, alpha: 1.0}
	let colors = [];
	//Samme farge på alle sider:
	for (let i = 0; i < 36; i++) {
		colors.push(color.red, color.green, color.blue, color.alpha);
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

function connectColorUniform(gl, baseShader, colorRGBA) {
	//let colorRGBA = [1.0, 0.0, 0.5, 1.0];
	gl.uniform4f(baseShader.uniformLocations.fragmentColor, colorRGBA[0],colorRGBA[1],colorRGBA[2],colorRGBA[3]);
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

function animate(currentTime, renderInfo) {
	window.requestAnimationFrame((currentTime) => {
		animate(currentTime, renderInfo);
	});
	//console.log(currentTime);
	draw(renderInfo);
}

/**
 * Tegner!
 */
function draw(renderInfo) {
	clearCanvas(renderInfo.gl);

	drawCoord(renderInfo);

	let modelMatrix = new Matrix4();

	for (let i=0; i < renderInfo.triangles.length; i++) {
		let triangle = renderInfo.triangles[i];
		modelMatrix.setIdentity();
		modelMatrix.translate(triangle.xpos, triangle.ypos, triangle.zpos);
		modelMatrix.scale(triangle.scale, triangle.scale, triangle.scale);
		drawTriangle(renderInfo, modelMatrix, triangle.color);
	}

	modelMatrix.setIdentity();
	modelMatrix.scale(10,10,10);
	drawCube(renderInfo, modelMatrix)
	/*
	let modelMatrix = new Matrix4();
	modelMatrix.setIdentity();
	drawTriangle(renderInfo, modelMatrix);

	modelMatrix.setIdentity();
	modelMatrix.translate(-5, 2,-1);
	drawTriangle(renderInfo, modelMatrix);

	modelMatrix.setIdentity();
	modelMatrix.translate(5, 2,3);
	modelMatrix.rotate(renderInfo.rotAngleZ, 0,0,1);
	modelMatrix.scale(2,2,2);
	drawTriangle(renderInfo, modelMatrix);
	 */

}

function drawCube(renderInfo, modelMatrix) {
	// Aktiver shader:
	renderInfo.gl.useProgram(renderInfo.coordShaderInfo.program);
	// Kople posisjon (og farge-) attributtene til tilhørende buffer:
	connectPositionAttribute(renderInfo.gl, renderInfo.coordShaderInfo, renderInfo.cubeBuffers.position);
	connectColorAttribute(renderInfo.gl, renderInfo.coordShaderInfo, renderInfo.cubeBuffers.color);

	let cameraMatrixes = initCamera(renderInfo.gl);
	let modelviewMatrix = new Matrix4(cameraMatrixes.viewMatrix.multiply(modelMatrix)); // NB! rekkefølge!

	// Send matrisene til shaderen:
	renderInfo.gl.uniformMatrix4fv(renderInfo.coordShaderInfo.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
	renderInfo.gl.uniformMatrix4fv(renderInfo.coordShaderInfo.uniformLocations.projectionMatrix, false, cameraMatrixes.projectionMatrix.elements);

	// Tegn!
	renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLES, 0, renderInfo.cubeBuffers.vertexCount);

}

function drawCoord(renderInfo) {
	// Aktiver shader:
	renderInfo.gl.useProgram(renderInfo.coordShaderInfo.program);

	// Kople posisjon (og farge-) attributtene til tilhørende buffer:
	connectPositionAttribute(renderInfo.gl, renderInfo.coordShaderInfo, renderInfo.coordBuffers.position);
	connectColorAttribute(renderInfo.gl, renderInfo.coordShaderInfo, renderInfo.coordBuffers.color);

	// Lag viewmodel-matrisa:
	let modelMatrix = new Matrix4();
	modelMatrix.setIdentity();

	let cameraMatrixes = initCamera(renderInfo.gl);
	let modelviewMatrix = new Matrix4(cameraMatrixes.viewMatrix.multiply(modelMatrix)); // NB! rekkefølge!

	// Send matrisene til shaderen:
	renderInfo.gl.uniformMatrix4fv(renderInfo.coordShaderInfo.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
	renderInfo.gl.uniformMatrix4fv(renderInfo.coordShaderInfo.uniformLocations.projectionMatrix, false, cameraMatrixes.projectionMatrix.elements);

	// Tegn!
	renderInfo.gl.drawArrays(renderInfo.gl.LINES, 0, renderInfo.coordBuffers.vertexCount);
}

function drawTriangle(renderInfo, modelMatrix, color) {
	// Aktiver shader:
	renderInfo.gl.useProgram(renderInfo.baseShader.program);

	//MERK: Aktiverer gjennomsiktighet, alpha-verdien på angitt farge fungerer nå:
	renderInfo.gl.enable(renderInfo.gl.BLEND);
	renderInfo.gl.blendFunc(renderInfo.gl.SRC_ALPHA, renderInfo.gl.ONE_MINUS_SRC_ALPHA);

	// Kople posisjon (og farge-) attributtene til tilhørende buffer:
	connectPositionAttribute(renderInfo.gl, renderInfo.baseShader, renderInfo.triangleBuffers.position);
	// Kople til farge uniform:
	//let color = [1,0,0,0.25];
	let color1 = [color.r, color.g, color.b, color.a];
	connectColorUniform(renderInfo.gl, renderInfo.baseShader, color1);

	let cameraMatrixes = initCamera(renderInfo.gl);
	let modelviewMatrix = new Matrix4(cameraMatrixes.viewMatrix.multiply(modelMatrix)); // NB! rekkefølge!

	// Send matrisene til shaderen:
	renderInfo.gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
	renderInfo.gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.projectionMatrix, false, cameraMatrixes.projectionMatrix.elements);

	// Tegn!
	//renderInfo.gl.drawArrays(renderInfo.gl.TRIANGLES, 0, renderInfo.triangleBuffers.vertexCount);
	// Tegner som wire frame:
	// Kople til farge uniform:
	color = [0,0,0,1];
	connectColorUniform(renderInfo.gl, renderInfo.baseShader, color);
	renderInfo.gl.drawArrays(renderInfo.gl.LINE_LOOP, 0, renderInfo.triangleBuffers.vertexCount);

}
