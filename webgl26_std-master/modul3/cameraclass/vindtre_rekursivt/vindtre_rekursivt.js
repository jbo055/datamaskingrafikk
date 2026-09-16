import {WebGLCanvas} from '../../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../../base/helpers/WebGLShader.js';
import {Camera} from "../../../base/helpers/Camera.js";
import {Stack} from "../../../base/helpers/Stack.js";

/**
 * Et WebGL-program som tegner et 2D-tre som svaier i vinden.
 * Demonstrerer hierarkisk modellering og bruk av matrisestack.
 *
 * Treet har sju deler: en stamme, to grener og fire kvister. Hver del tegnes
 * med det SAMME rektanglet, men med sin egen akkumulerte modellmatrise.
 *
 * Alle deler vokser langs sin lokale +y. Festepunktet (leddet mot forelderen)
 * ligger i lokal (0, -halvLengde), og forelderes endepunkt (toppen) i lokal (0, +halvLengde).
 * Oppskriften for hvert ledd blir derfor slik:
 *
 *     T(0, forelderens halvLengde)  - Flytt delen opp tilsvarende halvparten av høyden til forelderen.
 *                                      Dette tilsvarer punktet der delen skal koples til forelderen, altså leddet
 *                                      som kopler delen til forelderen.
 *      R(leddvinkel)                 - Roter delen om z-aksen.
 *      T(0, egen halvLengde)         - Flytt delen opp slik at bunnen av delen ligger i y=0 (dvs. halvparten av delens høyde).
 *
 * Skaleringa kommer først ETTER dette, og legges på en KOPI i drawPart(), slik
 * at den ikke arves av barna.
 */

// Delene i treet. halvLengde/halvBredde er "halve" fordi enhetsrektanglet går fra -1 til 1.
const KVIST  = {halvLengde: 1.5, halvBredde: 0.20, farge: [0.20, 0.60, 0.25, 1.0], barn: null,  spriker: 0};
const GREN   = {halvLengde: 2.5, halvBredde: 0.35, farge: [0.50, 0.35, 0.18, 1.0], barn: KVIST, spriker: 30};
const STAMME = {halvLengde: 4.0, halvBredde: 0.50, farge: [0.45, 0.30, 0.15, 1.0], barn: GREN,  spriker: 35};

export function main() {
	// Oppretter et webGLCanvas for WebGL-tegning:
	const webGLCanvas = new WebGLCanvas('myCanvas', document.body, 960, 640);
	// Hjelpeobjekt som holder på objekter som trengs for rendring:
	const renderInfo = {
		gl: webGLCanvas.gl,
        coordShader: initCoordShaders(webGLCanvas.gl),
		baseShader: initBaseShaders(webGLCanvas.gl),

        coordBuffers: initCoordBuffers(webGLCanvas.gl),
		rectangleBuffer: initRectangleBuffers(webGLCanvas.gl),

        modelMatrix: new Matrix4(),
        modelviewMatrix: new Matrix4(),

		currentlyPressedKeys: [],
		forrigeTastetrykk: [],      // Brukes for å skille tastetrykk fra "tast holdes nede".
		stack: new Stack(),
		lastTime: 0,
		stackVarUbalansert: false,  // Hindrer at konsollen fylles opp med samme advarsel.
		fpsInfo: {  // Brukes til å beregne og vise FPS (Frames Per Seconds):
			frameCount: 0,
			elapsedTotal: 0
		},
		animation: {
			tid: 0,             // Akkumulert tid i sekunder, driver vinden.
			vindstyrke: 1.0,    // Skalerer alle utslagene, styres med Q og E.
			vindVinkel: [0,0,0],    // Svinger  +/-  2 grader.
		}
	};

	initKeyPress(renderInfo.currentlyPressedKeys);
	// Kamera:
	const camera = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys, 15, 10, 28);
	oppdaterStatus(renderInfo);
	animate( 0, renderInfo, camera);
}

/**
 * Knytter tastatur-evnents til eventfunksjoner.
 */
function initKeyPress(currentlyPressedKeys) {
	document.addEventListener('keyup', (event) => {
		currentlyPressedKeys[event.code] = false;
	}, false);
	document.addEventListener('keydown', (event) => {
		currentlyPressedKeys[event.code] = true;
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
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
			modelMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelMatrix'),
			viewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uViewMatrix'),
			fragmentColor: gl.getUniformLocation(glslShader.shaderProgram, 'uFragmentColor'),
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
        1, 0, 0, 1,   //R G B A
        1, 0, 0, 1,   //R G B A
        0, 1, 0, 1,   //R G B A
        0, 1, 0, 1,   //R G B A
        0, 0, 1, 1,   //R G B A
        0, 0, 1, 1,   //R G B A
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
 * Oppretter verteksbuffer for rektanglet.
 * ETT rektangel gjenbrukes til alle sju delene av treet.
 */
function initRectangleBuffers(gl) {
	const positions = new Float32Array([
		-1,1,0,
		-1,-1,0,
		1,-1,0,
		1,-1,0,
		1,1,0,
		-1,1,0
	]);

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return  {
		position: positionBuffer,
		vertexCount: positions.length/3
	};
}

/**
 * Aktiverer position-bufferet.
 * Kalles fra draw()
 */
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

/**
 * Aktiverer color-bufferet.
 * Kalles fra draw()
 */
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

function connectColorUniform(gl, shader, colorRGBA) {
	gl.uniform4f(shader.uniformLocations.fragmentColor, colorRGBA[0],colorRGBA[1],colorRGBA[2],colorRGBA[3]);
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
	calculateFps(elapsed, renderInfo.fpsInfo);

	camera.handleKeys(elapsed);
	handleKeys(renderInfo);
	animerVind(elapsed, renderInfo);

	draw(currentTime, renderInfo, camera);
}

/**
 * Tegner!
 */
function draw(currentTime, renderInfo, camera) {
	clearCanvas(renderInfo.gl);
    drawCoord(renderInfo, camera);
	drawTree(renderInfo, camera);

	// Med balansert push/pop skal stacken alltid være tom her, men for sikkerhets skyld:
	if (renderInfo.stack.size() !== 0) {
		if (!renderInfo.stackVarUbalansert) {   // Advarer bare én gang, ikke 60 ganger i sekundet.
			console.warn('Ubalansert matrisestack (tømmer). Matriser igjen:', renderInfo.stack.size());
			renderInfo.stackVarUbalansert = true;
		}
		renderInfo.stack.empty();
	} else {
		renderInfo.stackVarUbalansert = false;
	}
}

/**
 * Tegner hele treet: en stamme, n grener og n*n kvister.
 * Stacken blir maksimalt fire nivåer dyp: rot, stamme, gren, kvist.
 */
function drawTree(renderInfo, camera) {
	const gl = renderInfo.gl;
	gl.useProgram(renderInfo.baseShader.program);
	connectPositionAttribute(gl, renderInfo.baseShader, renderInfo.rectangleBuffer.position);

	// ROTA: hele treets plassering i verden.
	// Flytt/roter/skaler HER, så følger alle delene med.
	let modelMatrix = new Matrix4();
	modelMatrix.setIdentity();
	modelMatrix.translate(0, -7, 0);       // Setter rota (bakken) nederst i bildet.
	renderInfo.stack.pushMatrix(modelMatrix);       // PUSH rot

    // STAMMEN: barn av rota. Leddet ligger i rotas origo, så første T er null.
    drawTreePartRecursive(renderInfo, camera, 0, renderInfo.animation.vindVinkel[0], STAMME, 0);
	renderInfo.stack.popMatrix();                          // POP rot -> stacken er tom igjen
}

/**
 * Tegner én del og, rekursivt, alle deler under den.
 * Hvert kall pusher én matrise og popper den igjen før det returnerer.
 */
function drawTreePartRecursive(renderInfo, camera, forelderHalvLengde, vinkel, del, nivaa) {
    createAndPushPartMatrix(renderInfo, forelderHalvLengde, vinkel, del);
    drawPart(renderInfo, camera, del.halvBredde, del.halvLengde, del.farge);

    if (del.barn !== null) {
        for (const side of [2.0, 1.0, 0, -1.0, -2]) {
            const barneVinkel = side * del.spriker + renderInfo.animation.vindVinkel[nivaa + 1];
            drawTreePartRecursive(renderInfo, camera, del.halvLengde, barneVinkel, del.barn, nivaa + 1);
        }
    }
    renderInfo.stack.popMatrix();
}

/**
 * Oppretter matrisen for gitt del. Matrisen baseres på forelderens matrise multiplisert med T*R*T.
 * Den nye matrisen legges på matrisestacken.
 * Kommentarene er nummerert 3, 2, 1: leser du dem nedenfra og opp, får du rekkefølgen verteksene faktisk transformeres i.
 * MERK at skaleringa IKKE er med her.
 */
function createAndPushPartMatrix(renderInfo, forelderHalvLengde, vinkel, del) {
    let modelMatrixCopy = renderInfo.stack.peekMatrix();   // Kopi av forelderens matrise.
    //TORS: Her brukes T og O, der O=R*T
    //3. Flytt delen opp tilsvarende halvparten av høyden til forelderen.
    modelMatrixCopy.translate(0, forelderHalvLengde, 0);
    //2. Roter delen om z-aksen.
    modelMatrixCopy.rotate(vinkel, 0, 0, 1);
    //1. Flytt delen opp slik at bunnen av delen ligger i y=0 (dvs. halvparten av delens høyde).
    modelMatrixCopy.translate(0, del.halvLengde, 0);
    renderInfo.stack.pushMatrix(modelMatrixCopy);
}

/**
 * Skalerer rektanglet til ønsket størrelse basert på scaleX og scaleY.
 * Merk at vi bruker en KOPI av matrisen som ligger øverst på stacken slik at
 * skaleringa kun påvirker dette rektanglet. Sikrer at skaleringa
 * ikke påvirker matrisa som ligger på toppen av stacken, og som ev.
 * brukes videre av andre "barn" av aktuell del.
 */
function drawPart(renderInfo, camera, scaleX, scaleY, colorRGBA) {
	let modelMatrixCopy = renderInfo.stack.peekMatrix();
	modelMatrixCopy.scale(scaleX, scaleY, 1);
	drawRectangle(renderInfo, modelMatrixCopy, camera, colorRGBA);
}

/**
 * Tegner rektanglet med gitt transformasjon, kamera og farge.
 */
function drawRectangle(renderInfo, modelMatrix, camera, colorRGBA) {
	const gl = renderInfo.gl;

	// Setter farge (ved å endre verdien på en uniform-variabel):
	connectColorUniform(gl, renderInfo.baseShader, colorRGBA);

	// MODEL:
	renderInfo.modelMatrix.set(modelMatrix);

	// MERK: Sender model- OG view-matrisene, i tillegg til projeksjonsmatrisen, til shaderen:
	gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.modelMatrix, false, renderInfo.modelMatrix.elements);
	gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.viewMatrix, false, camera.viewMatrix.elements);
	gl.uniformMatrix4fv(renderInfo.baseShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
	// Tegn:
	gl.drawArrays(gl.TRIANGLES, 0, renderInfo.rectangleBuffer.vertexCount);
}

function drawCoord(renderInfo, camera) {
    const gl = renderInfo.gl;
    // Aktiver shader:
    gl.useProgram(renderInfo.coordShader.program);

    // Kople posisjon og farge-attributtene til tilhørende buffer:
    connectPositionAttribute(gl, renderInfo.coordShader, renderInfo.coordBuffers.position);
    connectColorAttribute(gl, renderInfo.coordShader, renderInfo.coordBuffers.color);
    // MODEL:
    renderInfo.modelMatrix.setIdentity();
    // MODELVIEW:
    renderInfo.modelviewMatrix.set(camera.viewMatrix);
    renderInfo.modelviewMatrix.multiply(renderInfo.modelMatrix);

    // Send kameramatrisene til shaderen:
    gl.uniformMatrix4fv(renderInfo.coordShader.uniformLocations.modelViewMatrix, false, renderInfo.modelviewMatrix.elements);
    gl.uniformMatrix4fv(renderInfo.coordShader.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
    // Tegn coord:
    gl.drawArrays(gl.LINES, 0, renderInfo.coordBuffers.vertexCount);
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
 * Summerer forløpt tid fra getElapsed() istedenfor å holde på et eget tidsstempel.
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
        // Nullstiller telleren:
        fpsInfo.frameCount = 0;
        fpsInfo.elapsedTotal = 0;
    }
}

/**
 * Vinden: tre sinuskurver med ulik frekvens og fase.
 * MERK at amplituden ØKER nedover i treet - tynne kvister flagrer mer enn en tjukk stamme.
 * Legg likevel merke til at stammens knapt synlige utslag på 2 grader flytter kvist-tippene
 * MER enn kvistenes egne 12 grader, nettopp fordi stammens rotasjon arves av hele treet.
 * Prøv tast 3 (frys stammen) og se hvor mye av bevegelsen som forsvinner.
 */
function animerVind(elapsed, renderInfo) {
    const anim = renderInfo.animation;
    anim.tid += elapsed;
    const t = anim.tid;
    const v = anim.vindstyrke;
    anim.vindVinkel[0] = v *  2 * Math.sin(t * 1.1);
    anim.vindVinkel[1] = v *  6 * Math.sin(t * 1.7 + 0.6);
    anim.vindVinkel[2]  = v * 12 * Math.sin(t * 2.6 + 1.2);
}

function handleKeys(renderInfo) {
	// Vindstyrke (Q og E kan holdes nede):
	if (renderInfo.currentlyPressedKeys['KeyQ']) {
		renderInfo.animation.vindstyrke = Math.min(renderInfo.animation.vindstyrke + 0.02, 4.0);
		oppdaterStatus(renderInfo);
	}
	if (renderInfo.currentlyPressedKeys['KeyE']) {
		renderInfo.animation.vindstyrke = Math.max(renderInfo.animation.vindstyrke - 0.02, 0.0);
		oppdaterStatus(renderInfo);
	}
}

/**
 * Viser vindstyrke.
 */
function oppdaterStatus(renderInfo) {
    let tekst = 'Vindstyrke: ' + renderInfo.animation.vindstyrke.toFixed(2);
    const element = document.getElementById('status');
    if (element.innerHTML !== tekst)    // Skriver bare til DOM-en når teksten faktisk endres.
        element.innerHTML = tekst;
}
