'use strict';

import { BaseApp } from './BaseApp.js';
import { XZPlaneGrid } from './egneShapes/XZPlaneGrid.js';
import { ColoredCube } from './egneShapes/ColoredCube.js';
import { TriangleBlock } from './egneShapes/TriangleBlock.js';
import { Cylinder } from './egneShapes/Cylinder.js';
import { Sphere } from './egneShapes/Sphere.js';
import { Circle } from './egneShapes/Circle.js';
import { Rectangle } from './egneShapes/Rectangle.js';

import { drawGroundFloor } from './house/GroundFloor.js';
import { drawDoor, updateDoor } from './house/Door.js';
import { drawUpperFloor } from './house/UpperFloor.js';
import { drawInterior } from './house/LowerInterior.js';
import { drawStairs } from './house/Stairs.js';
import { drawRoof } from './house/Roof.js';
import { drawUpperInterior } from './house/UpperInterior.js';
import { drawWindowGlass } from './house/Windows.js';
import { drawChimney } from './house/Chimney.js';
import { drawDormer } from './house/Dormer.js';
import { drawEntrancePlatform } from './house/EntrancePlatform.js';
import { drawClock } from './house/Clock.js';
import { drawTrees } from './garden/Trees.js';

/**
 * Oblig 1 - 3D hus og trær.
 *
 * Arver hele rammeverket fra BaseApp:
 *   - canvas og WebGL-kontekst
 *   - shaderpar med posisjon + farge
 *   - kamera med W A S D og V B
 *   - animate() -> calculateFps() -> clearCanvas() -> handleKeys() -> draw()
 *
 * Vi overstyrer bare draw(), altså "hva som skal tegnes".
 */
export class Oblig1App extends BaseApp {

    constructor() {
        super(true);   // true = BaseApp oppretter og tegner koordinatsystemet.

        // Egne figurer opprettes her, ETTER super().
        // Grunnen: BaseShape leser app.gl og app.camera i constructoren sin,
        // og de finnes ikke før BaseApp er ferdig med sin egen constructor.

        // Bakkeplanet: 20x20 ruter, hver 1x1 enhet.
        this.grid = new XZPlaneGrid(this, 20, 1);
        this.grid.initBuffers();   // NB! Må kalles, ellers finnes ingen buffer.
        
        this.cube = new ColoredCube(this, {
            red: 0.6,
            green: 0.2,
            blue: 0.3,
            alpha: 1.0
        });

        this.cube.initBuffers();

        // Egen kube til døren, med brun farge.
        this.door = new ColoredCube(this, {
            red: 0.35,
            green: 0.18,
            blue: 0.08,
            alpha: 1.0
        });

        this.door.initBuffers();

        this.doorAngle = 0;

        // Gjenbrukes til hvite dør- og vinduskarmer.
        this.frameCube = new ColoredCube(this, {
            red: 1.0,
            green: 1.0,
            blue: 1.0,
            alpha: 1.0
        });

        this.frameCube.initBuffers();

        this.floorCube = new ColoredCube(this, {
            red: 0.65,
            green: 0.45,
            blue: 0.25,
            alpha: 1.0
        });

        this.floorCube.initBuffers();

        // Lys grå farge til innerveggene.
        this.innerWallCube = new ColoredCube(this, {
            red: 0.8,
            green: 0.8,
            blue: 0.8,
            alpha: 1.0
        });

        this.innerWallCube.initBuffers();

        // Brun farge til trappen.
        this.stairCube = new ColoredCube(this, {
            red: 0.45,
            green: 0.28,
            blue: 0.14,
            alpha: 1.0
        });

        this.stairCube.initBuffers();

        // Mørk grå farge til taket.
        this.roofCube = new ColoredCube(this, {
            red: 0.2,
            green: 0.2,
            blue: 0.2,
            alpha: 1.0
        });

        this.roofCube.initBuffers();

        this.triangleBlock = new TriangleBlock(this, this.cube.color);
        this.triangleBlock.initBuffers();

        // Trær: tegnes med verteksfarge-shaderen (baseShaderInfo).
        this.trunk = new Cylinder(this, {
            red: 0.45,
            green: 0.28,
            blue: 0.12,
            alpha: 1.0
        });

        this.trunk.initBuffers();

        this.crown = new Sphere(this, {
            red: 0.15,
            green: 0.6,
            blue: 0.15,
            alpha: 1.0
        });

        this.crown.initBuffers();

        // Klokke: hvit skive, svart kant og svarte visere.
        this.clockFace = new Circle(this, {
            red: 1.0,
            green: 1.0,
            blue: 1.0,
            alpha: 1.0
        });

        this.clockFace.initBuffers();

        this.clockRim = new Circle(this, {
            red: 0.0,
            green: 0.0,
            blue: 0.0,
            alpha: 1.0
        });

        this.clockRim.initBuffers();

        this.clockHand = new Rectangle(this, {
            red: 0.0,
            green: 0.0,
            blue: 0.0,
            alpha: 1.0
        });

        this.clockHand.initBuffers();
    }

    /**
     * Kalles fra BaseApp.animate() før draw().
     * All brukerinput håndteres her, så draw()-funksjonene bare tegner.
     */
    handleKeys(elapsed) {
        super.handleKeys(elapsed);   // Kameraet: W A S D og V B.

        updateDoor(this, elapsed);   // Ytterdøren: F og G.
    }

    /**
     * Kalles ca. 60 ganger i sekundet fra BaseApp.animate().
     * Canvaset er allerede tømt når vi kommer hit.
     *
     * @param elapsed Sekunder siden forrige kall. Bruk denne til animasjon,
     *                aldri et fast tall - da går animasjonen ulikt fort på
     *                ulike maskiner.
     */
    draw(elapsed) {
        super.draw(elapsed);   // Tegner koordinatsystemet.

        this.grid.draw(this.baseShaderInfo, elapsed);

        drawGroundFloor(this, elapsed);
        drawDoor(this, elapsed);
        drawUpperFloor(this, elapsed);
        drawInterior(this, elapsed);
        drawStairs(this, elapsed);
        drawRoof(this, elapsed);
        drawUpperInterior(this, elapsed);
        drawChimney(this, elapsed);
        drawDormer(this, elapsed);
        drawEntrancePlatform(this, elapsed);
        drawClock(this, elapsed);
        drawTrees(this, elapsed);

        // Gjennomsiktig glass tegnes ALLTID sist.
        drawWindowGlass(this, elapsed);
    }
}
