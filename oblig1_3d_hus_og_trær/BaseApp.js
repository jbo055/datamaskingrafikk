import {WebGLShader} from './helpers/WebGLShader.js';
import { WebGLCanvas } from './helpers/WebGLCanvas.js';
import {Camera} from './helpers/Camera.js';
import {Coord} from './shapes/Coord.js';

/**
 * Klassen representerer en enkel WebGL-app.
 */
export class BaseApp {
	constructor(drawCoord=true) {
		// Oppretter WebGL-kontekst for tegning:
		this.canvas = new WebGLCanvas('myCanvas', document.body, 960, 640);
		this.gl = this.canvas.gl;
		this.drawCoord = drawCoord;

		this.textureShaderInfo = undefined;

		this.initShaders();
		this.initKeyPress();

		// Brukes til å beregne og vise FPS (Frames Per Seconds):
		this.fpsData = {
			frameCount: 0,
			lastTimeStamp: 0
		};
		this.lastTime = 0;

		// For tastetrykk/brukerinput:
		this.currentlyPressedKeys = [];

		// Kamera:
		this.camera = new Camera(this.gl, this.currentlyPressedKeys);
		this.camera.set();

		// Koord:
		if (this.drawCoord) {
			this.coord = new Coord(this);
			this.coord.initBuffers();
		}
	}

	initShaders() {
		// Standard shaderpar: hver vertex har sin egen farge.
		this.baseShaderInfo = this.createShaderInfo(
			'base-vertex-shader',
			'base-fragment-shader',
			{
				vertexPosition: 'aVertexPosition',
				vertexColor: 'aVertexColor',
			},
			{
				projectionMatrix: 'uProjectionMatrix',
				modelViewMatrix: 'uModelViewMatrix',
			}
		);

		// Shaderpar der hele figuren får én felles farge fra JavaScript.
		this.uniformShaderInfo = this.createShaderInfo(
			'uniform-vertex-shader',
			'uniform-fragment-shader',
			{
				vertexPosition: 'aVertexPosition',
			},
			{
				projectionMatrix: 'uProjectionMatrix',
				modelViewMatrix: 'uModelViewMatrix',
				color: 'uColor',
			}
		);
	}

	/**
	 * Leser, kompilerer og kobler ETT shaderpar, og slår opp hvor
	 * shaderens variabler ligger. Returnerer et ferdig shaderInfo-objekt.
	 *
	 * attribs og uniforms skrives som { navnetJegBruker: 'navnetIGlsl' },
	 * f.eks. { vertexColor: 'aVertexColor' }.
	 */
	createShaderInfo(vertexElementId, fragmentElementId, attribs, uniforms) {
		// Leser shaderkoden fra index.html:
		const vertexShaderSource =
			document.getElementById(vertexElementId).textContent.trim();

		const fragmentShaderSource =
			document.getElementById(fragmentElementId).textContent.trim();

		// Initialiserer & kompilerer shader-programmet:
		const glslShader = new WebGLShader(
			this.gl,
			vertexShaderSource,
			fragmentShaderSource
		);
		const program = glslShader.shaderProgram;

		// Samler programmet og plasseringene til shaderens variabler:
		const shaderInfo = {
			program: program,
			attribLocations: {},
			uniformLocations: {},
		};

		for (const navn in attribs) {
			shaderInfo.attribLocations[navn] =
				this.gl.getAttribLocation(program, attribs[navn]);
		}

		for (const navn in uniforms) {
			shaderInfo.uniformLocations[navn] =
				this.gl.getUniformLocation(program, uniforms[navn]);
		}

		return shaderInfo;
	}

	/**
	 * Eventmetode.
	 */
	handleKeyUp(event) {
		this.currentlyPressedKeys[event.code] = false;
	}

	/**
	 * Eventmetode.
	 */
	handleKeyDown(event) {
		this.currentlyPressedKeys[event.code] = true;
	}

	/**
	 * Knytter tastatur-evnents til funksjoner (handleKeyUp() og handleKeyDown())
	 */
	initKeyPress() {
		//NB! Legg merke til .bind(this)
		document.addEventListener('keyup', this.handleKeyUp.bind(this), false);
		document.addEventListener('keydown', this.handleKeyDown.bind(this), false);
	}

	/**
	 * Klargjør canvaset.
	 */
	clearCanvas() {
		this.gl.clearColor(0.9, 0.9, 0.9, 1);  // Clear screen farge.
		this.gl.clearDepth(1.0);
		this.gl.enable(this.gl.DEPTH_TEST);           // Enable "depth testing".
		this.gl.depthFunc(this.gl.LEQUAL);            // Nære objekter dekker fjerne objekter.
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}

	/**
	 * Håndter brukerinput.
	 */
	handleKeys(elapsed) {
		// Kameraet kontrollerer seg selv.
		this.camera.handleKeys(elapsed);
	}

	//NB! Denne overstyres av subklasser.
	draw(elapsed) {
		// Tegner koordinatsystem:
		if (this.drawCoord)
			this.coord.draw(this.baseShaderInfo,  elapsed);
	}

	// Animation loop
	animate(currentTime) {
		// Sørger for at animate kalles på nytt, for animasjon (60fps):
		window.requestAnimationFrame(this.animate.bind(this)); //Merk bind()
		// Beregn og vis FPS:
		let elapsed = this.calculateFps(currentTime);
		// Klargjør canvaset:
		this.clearCanvas();
		// Brukerinput;
		this.handleKeys(elapsed);
		// Kaller subklassens draw()
		this.draw(elapsed);
		// Øk antall frames med en:
		this.fpsData.frameCount++;
	}

	calculateFps(currentTime) {
		// Beregner FPS:
		if (currentTime === undefined)
			currentTime = 0; 	//Udefinert første gang.

		// Beregner og viser FPS:
		if (currentTime - this.fpsData.lastTimeStamp >= 1000) { //dvs. et sekund har forløpt...
			//Viser FPS i .html ("fps" er definert i .html fila):
			document.getElementById('fps').innerHTML = this.fpsData.frameCount;
			this.fpsData.frameCount = 0;
			this.fpsData.lastTimeStamp = currentTime; //Brukes for å finne ut om det har gått 1 sekund - i så fall beregnes FPS på nytt.
		}
		// Tar høyde for varierende frame rate:
		let elapsed = 0.0;			// Forløpt tid siden siste kalle på draw().
		if (this.lastTime !== 0.0)		// Først gang er lastTime = 0.0.
			elapsed = (currentTime - this.lastTime)/1000; // Deler på 1000 for å operere med sekunder.
		this.lastTime = currentTime;						// Setter lastTime til currentTime.

		return elapsed;
	}
}
