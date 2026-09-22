/**
 * All tastaturstyring av gravemaskinens ledd.
 * Kameraets taster (WASD, V, B) håndteres av Camera-klassen.
 */

// Hvor fort leddene beveger seg, i grader per sekund.
const hastighet = 45;

// Hvert ledd: tasten som øker vinkelen, tasten som minker den,
// og hvor langt leddet får lov til å bevege seg.
const ledd = [
    {navn: 'husVinkel',    opp: 'KeyJ', ned: 'KeyL'},
    {navn: 'bomVinkel',    opp: 'KeyI', ned: 'KeyK', maks:  -10, min:  -80},
    {navn: 'armVinkel',    opp: 'KeyU', ned: 'KeyO', maks:  -20, min: -150},
    {navn: 'skuffeVinkel', opp: 'KeyN', ned: 'KeyM', maks:   60, min: -120}
];

/**
 * Knytter tastatur-events til eventfunksjoner.
 */
export function initTastatur(currentlyPressedKeys) {
	document.addEventListener('keyup', (event) => {
		currentlyPressedKeys[event.code] = false;
	}, false);
	document.addEventListener('keydown', (event) => {
		currentlyPressedKeys[event.code] = true;
	}, false);
}

/**
 * Oppdaterer leddvinklene ut fra hvilke taster som holdes nede.
 * Kalles fra animate() med forløpt tid, slik at farten blir den samme
 * uansett hvor mange bilder i sekundet maskinen klarer.
 */
export function oppdaterLedd(renderInfo, elapsed) {
    const taster = renderInfo.currentlyPressedKeys;
    const animation = renderInfo.animation;

    for (const {navn, opp, ned, maks, min} of ledd) {
        let vinkel = animation[navn];

        if (taster[opp]) {
            vinkel += hastighet * elapsed;
        }

        if (taster[ned]) {
            vinkel -= hastighet * elapsed;
        }

        // Huset kan svinge hele veien rundt og har derfor ingen grenser.
        if (maks !== undefined) {
            vinkel = Math.min(vinkel, maks);
        }

        if (min !== undefined) {
            vinkel = Math.max(vinkel, min);
        }

        animation[navn] = vinkel;
    }
}
