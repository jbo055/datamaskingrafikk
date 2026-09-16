import {WebGLCanvas} from '../../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../../base/helpers/WebGLShader.js';
import {Camera} from '../../../base/helpers/Camera.js';
import {ImageLoader} from '../../../base/helpers/ImageLoader.js';
/**
 * Et WebGL-program som tegner en teksturert kube.
 */
export function main() {
	// Oppretter et canvas for WebGL-tegning:
	const canvas = new WebGLCanvas('myCanvas', document.body, 960, 640);

	// Starter med å laste teksturer:
	let imageLoader = new ImageLoader();
	let textureUrls = [
        '../../../base/textures/bricksLarge.png',
        '../../../base/textures/metal1.png'
    ];
	imageLoader.load((textureImages) => {
		const textureImage0 = textureImages[0];
        const textureImage1 = textureImages[1];
        // Fortsetter:
        // Hjelpeobjekt som holder på objekter som trengs for rendring:
        const renderInfo = {
            gl: canvas.gl,
            baseShader: initBaseShaders(canvas.gl),
            textureShader: initTextureShaders(canvas.gl),
            coordBuffers: initCoordBuffers(canvas.gl),
            cubeBuffers: initCubeTextureAndBuffers(canvas.gl, textureImage0, textureImage1),
            modelMatrix: new Matrix4(),
            modelviewMatrix: new Matrix4(),
            currentlyPressedKeys: [],
            lastTime: 0,
            fpsInfo: {  // Brukes til å beregne og vise FPS (Frames Per Seconds):
                frameCount: 0,      // Antall frames siden forrige visning.
                elapsedTotal: 0     // Sum forløpt tid (sek.) siden forrige visning.
            }
        };

        initKeyPress(renderInfo);
        const camera = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys);
        camera.camPosX = 4;
        camera.camPosY = 5;
        camera.camPosZ = 5;
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

function initTextureShaders(gl) {
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
			vertexTextureCoordinate: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexTextureCoordinate'),
		},
		uniformLocations: {
			sampler0: gl.getUniformLocation(glslShader.shaderProgram, 'uSampler0'),
            sampler1: gl.getUniformLocation(glslShader.shaderProgram, 'uSampler1'),
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

function initCubeTextureAndBuffers(gl, textureImage0, textureImage1) {
	let positions = [
		//Forsiden (pos):
		-1, 1, 1,
		-1,-1, 1,
		1,-1, 1,

		-1,1,1,
		1, -1, 1,
		1,1,1,

		//Høyre side:
		1,1,1,
		1,-1,1,
		1,-1,-1,

		1,1,1,
		1,-1,-1,
		1,1,-1,

        //Topp:
        -1,1,-1,
        -1,1,1,
        1,1,1,

        -1,1,-1,
        1,1,1,
        1,1,-1,

        //Venstre side:
        -1,1,-1,
        -1,-1,-1,
        -1,-1,1,

        -1,1,-1,
        -1,-1,1,
        -1,1,1,

		//Baksiden (pos):
        1, 1,-1, //OK
        1,-1,-1,
        -1,-1,-1,

        1,1,-1,
        -1,-1,-1,
        -1,1,-1,

		//Bunn:
        -1,-1,1,
        -1,-1,-1,
        1,-1,-1,

        -1,-1,1,
        1,-1,-1,
        1,-1,1,
	];

	let color = {red: 1.0, green: 0.45, blue: 0.9, alpha: 1.0}
	let colors = [];
	//Samme farge på alle sider:
	for (let i = 0; i < 36; i++) {
		colors.push(color.red, color.green, color.blue, color.alpha);
	}

	// Teksturkoordinater / UV-koordinater:
	//Setter uv-koordinater for hver enkelt side av terningen vha. en enkel tekstur.
	//Hver side er organisert slik (trekantene er angitt CCW):
    //tl: (u=0,v=1)
	// ------------- tr: (u=1,v=1)
	// | \         |
	// |   \       |
	// |     \     |
    // |       \   |
    // |         \ |
	// ------------- br: (u=0,v=1)
    //bl: (u=0,v=0)
	//Holder etter hvert p� alle uv-koordinater for terningen.
	let textureCoordinates = [];
	//Front:
    let bl=[0,0];
    let br=[1,0];
    let tr=[1,1];
    let tl=[0,1];

	textureCoordinates = textureCoordinates.concat(tl, bl, br, tl, br, tr);
    textureCoordinates = textureCoordinates.concat(tl, bl, br, tl, br, tr);
    textureCoordinates = textureCoordinates.concat(tl, bl, br, tl, br, tr);
    textureCoordinates = textureCoordinates.concat(tl, bl, br, tl, br, tr);
    textureCoordinates = textureCoordinates.concat(tl, bl, br, tl, br, tr);
    textureCoordinates = textureCoordinates.concat(tl, bl, br, tl, br, tr);

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//Texture0:
	const bricksTexture = gl.createTexture();

    //Teksturbildet er nå lastet fra server, send til GPU:
	gl.bindTexture(gl.TEXTURE_2D, bricksTexture);

    //Unngaa at bildet kommer opp-ned:
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    //Merk: Bruker her premultiplied alpha, som gjør at hver texel multipliseres med sin egen alpha-verdi.
    //Betyr: Sett gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); ved tegning av objektet, for å få riktig blending med bakgrunn.
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    //Laster teksturbildet til GPU/shader:
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage0);

    //Teksturparametre:
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);

    //Texture1:
    const treeTexture = gl.createTexture();
    //Teksturbildet er nå lastet fra server, send til GPU:
    gl.bindTexture(gl.TEXTURE_2D, treeTexture);

    //Unngaa at bildet kommer opp-ned:
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    //Merk: Bruker her premultiplied alpha, som gjør at hver texel multipliseres med sin egen alpha-verdi.
    //Betyr: Sett gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); ved tegning av objektet, for å få riktig blending med bakgrunn.
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    //Laster teksturbildet til GPU/shader:
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage1);

    //Teksturparametre:
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);

	const textureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return  {
		position: positionBuffer,
		color: colorBuffer,
		textureBuffer: textureBuffer,
		textureObject0: bricksTexture,
        textureObject1: treeTexture,
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
 * Kopler til og aktiverer teksturkoordinat-bufferet.
 */
function connectTextureAttribute(gl, textureShader, textureBuffer, textureObject0, textureObject1) {
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
	gl.bindTexture(gl.TEXTURE_2D, textureObject0);
	//Send inn verdi som indikerer hvilken teksturenhet som skal brukes (her 0):
	gl.uniform1i(textureShader.uniformLocations.sampler0, 0);

    //Aktiver teksturenhet (1):
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureObject1);
    //Send inn verdi som indikerer hvilken teksturenhet som skal brukes (her 0):
    gl.uniform1i(textureShader.uniformLocations.sampler1, 1);
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
    // Beregner og viser fps:
    calculateFps(elapsed, renderInfo.fpsInfo);

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

/**
 * Tegner!
 */
function draw(currentTime, renderInfo, camera) {
	clearCanvas(renderInfo.gl);

    // Setter verdier for culling:
    // EKsperiementer med verdiene, test f.eks. med renderInfo.gl.FRONT
    renderInfo.gl.frontFace(renderInfo.gl.CCW);	    // Angir vertekser CCW.
    renderInfo.gl.enable(renderInfo.gl.CULL_FACE);	// Aktiverer culling.
    renderInfo.gl.cullFace(renderInfo.gl.BACK);	    // Skjuler baksider.

    // Tegn koordinatsystemet:
	drawCoord(renderInfo, camera);
	// Tegner kuben:
	drawCube(renderInfo, camera);
}

function drawCoord(renderInfo, camera) {
    const gl = renderInfo.gl;
    // Aktiver shader:
    renderInfo.gl.useProgram(renderInfo.baseShader.program);

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
	gl.useProgram(renderInfo.textureShader.program);

	// Kople posisjon og farge-attributtene til tilhørende buffer:
	connectPositionAttribute(gl, renderInfo.textureShader, renderInfo.cubeBuffers.position);
	connectColorAttribute(gl, renderInfo.textureShader, renderInfo.cubeBuffers.color);
	connectTextureAttribute(gl, renderInfo.textureShader, renderInfo.cubeBuffers.textureBuffer, renderInfo.cubeBuffers.textureObject0, renderInfo.cubeBuffers.textureObject1);

    // MODEL:
    renderInfo.modelMatrix.setIdentity();
    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);

	gl.uniformMatrix4fv(renderInfo.textureShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
	gl.uniformMatrix4fv(renderInfo.textureShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);

	gl.drawArrays(gl.TRIANGLES, 0, renderInfo.cubeBuffers.vertexCount);
}
