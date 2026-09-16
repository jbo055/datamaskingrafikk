# Filmmanus: 3D-hus og trær

*DTE-2800 Datamaskingrafikk · Oblig 1 · mål 7 min, maks 8*

**Snakk, ikke les.** Replikkene under er skrevet sånn du kan si dem høyt, men du trenger ikke treffe ordene. Er du nervøs, les dem et par ganger før opptak, legg manuset bort og si det med egne ord. Det er helt greit å si "eh" og "da ser vi at …". Læreren vil høre at du skjønner koden, ikke at du er nyhetsoppleser.

## Tidsplan

7:15 planlagt · 0:45 slingringsmonn

| # | Start | Lengde | Scene |
|---|------:|-------:|-------|
| 1 | 0:00 | 20 s | Intro |
| 2 | 0:20 | 60 s | Demo |
| 3 | 1:20 | 40 s | Hvordan prosjektet henger sammen |
| 4 | 2:00 | 60 s | De to shaderparene |
| 5 | 3:00 | 60 s | Buffere og primitiver |
| 6 | 4:00 | 75 s | Matrisene, med døra som eksempel |
| 7 | 5:15 | 30 s | Én kube, hele huset |
| 8 | 5:45 | 50 s | Gjennomsiktig glass |
| 9 | 6:35 | 30 s | Trær og klokke |
| 10 | 7:05 | 10 s | Avslutning |

## Før du trykker opptak

- [ ] Studentbeviset ligger klart ved siden av tastaturet.
- [ ] Ansiktskamera er på og vises i et hjørne av opptaket.
- [ ] Nettsida er åpen og lastet med Ctrl+F5.
- [ ] VS Code: skriftstørrelsen er skrudd opp med Ctrl + og sidepanelet er lukket.
- [ ] Fanene er åpne i denne rekkefølgen: `index.html`, `BaseApp.js`, `BaseShape.js`, `XZPlaneGrid.js`, `Circle.js`, `Rectangle.js`, `Camera.js`, `Door.js`, `ColoredCube.js`, `Windows.js`, `Trees.js`, `Sphere.js`, `Clock.js` (den i `house/`).
- [ ] Klokka på PC-en er synlig, så du kan vise at klokka på huset stemmer.
- [ ] Stoppeklokke på mobilen. Er du over 4:30 når du begynner på scene 7, hopper du over den og går rett til glasset.

---

## 1 · Intro — 0:00 (20 s)

**Vis:** ansiktet ditt, med studentbeviset holdt opp mot kamera.

> Hei! Jeg heter Julie Borli, brukernavn jbo055. Dette er oblig 1 i Datamaskingrafikk, der jeg har laget et 3D-hus med trær i WebGL 2. Først viser jeg hvordan det ser ut, og så går jeg gjennom koden.

---

## 2 · Demo — 0:20 (60 s)

**Vis**
- W A S D: roter rundt huset. V B: zoom inn gjennom veggen.
- F G: åpne og lukke døra.
- Klokka ved døra, ved siden av klokka på PC-en.

> Oppe til venstre har vi FPS-telleren, og i midten ser dere koordinatsystemet og det mørkeblå rutenettet på 20 ganger 20.
>
> Med W, A, S og D kan jeg flytte kameraet rundt huset. Huset har to etasjer, skråtak med ark og en pipe som går helt ned til bakken. Vinduene har hvite karmer og blått glass som man kan se litt gjennom.
>
> Med V og B zoomer jeg inn … og da ser vi at det er tre rom i hver etasje, og en trapp opp.
>
> Døra åpner jeg med F og lukker med G. Og klokka ved siden av døra viser faktisk riktig tid, se, den stemmer med klokka på PC-en. Ute i hagen står det fem trær i forskjellige størrelser.

---

## 3 · Hvordan prosjektet henger sammen — 1:20 (40 s)

**Vis**
- `index.html:88–94`: modulen som lager appen og kaller `animate()`.
- `BaseApp.js`: konstruktøren.
- Mappene i filutforskeren.

> Da hopper vi over til koden. Alt starter i `index.html`, der jeg lager appen og kaller `animate`. Selve oppsettet ligger i `BaseApp`, som vi fikk i kodeeksemplene. Den lager canvaset, shaderne, kameraet og lytter på tastaturet. Oppgaven snakker om et `renderInfo`-objekt, og her er det `this` i `BaseApp` som har den jobben.
>
> All JavaScript er moduler. `egneShapes` er figurene jeg har laget selv, og i `house` har hver del av huset sin egen fil, så det er lett å finne fram.

---

## 4 · De to shaderparene — 2:00 (60 s)

**Vis**
- `index.html:35–60`: base-paret, med posisjon og farge.
- `index.html:44`: linja med `gl_Position`.
- `index.html:63–85`: uniform-paret, med `uniform vec4 uColor` på linje 78.

> Shaderne ligger i script-tagger i HTML-fila, og jeg har to par.
>
> Vertex-shaderen kjører én gang for hver vertex, og regner ut hvor den havner på skjermen: projeksjonsmatrisa ganger modelview-matrisa ganger posisjonen. Fragment-shaderen kjører for hver piksel og bestemmer fargen.
>
> Det første paret tar inn både posisjon og farge som attributter, altså en egen verdi per vertex. Fargen sendes videre og blir blandet jevnt mellom verteksene. Det bruker jeg på koordinatsystemet, rutenettet og trærne.
>
> Det andre paret tar bare posisjon, og fargen kommer som en uniform, som er lik for hele tegnekallet. Det er det huset bruker, for da kan jeg tegne den samme kuben i mange farger uten å lage et nytt fargebuffer hver gang.

---

## 5 · Buffere og primitiver — 3:00 (60 s)

**Vis**
- `BaseShape.js:38–53`: `initBuffers()`.
- `BaseShape.js:104`: `vertexAttribPointer`.
- `XZPlaneGrid.js:74`, `Circle.js:48`, `Rectangle.js:39`: de ulike `drawArrays`-kallene.

> Men hvordan kommer tallene fram til shaderen? Hver figur fyller en liste med posisjoner, og kanskje farger. I `initBuffers` kopieres de over til skjermkortet med `bufferData`, én gang når programmet starter.
>
> `vertexAttribPointer` forteller hvordan bufferet skal leses: tre tall per posisjon og fire per farge. Og det må være like mange farger som posisjoner.
>
> Når figuren tegnes, velger jeg primitiv i `drawArrays`. Rutenettet bruker `LINES`, der to og to punkter blir en strek. Sirkelen på klokka bruker `TRIANGLE_FAN`, der det første punktet er midten og resten går rundt kanten. Og glassrektangelet bruker `TRIANGLE_STRIP`, så fire punkter blir to trekanter. Kuben, kula og sylinderen bruker vanlige `TRIANGLES`.

---

## 6 · Matrisene, med døra som eksempel — 4:00 (75 s)

**Vis**
- `Camera.js:52`: `setLookAt`.
- `Camera.js:57`: `setPerspective`.
- `Door.js:8–19`: `updateDoor()`.
- `Door.js:21–35`: dørens modellmatrise.

> Så til matrisene. View-matrisa sier hvor kameraet står og hva det ser på, og projeksjonsmatrisa gir perspektiv, så ting langt unna blir mindre. De to er de samme for hele scenen. Modellmatrisa er det hvert objekt har for seg selv: hvor det står, hvordan det er rotert og hvor stort det er.
>
> Døra er et fint eksempel. I `updateDoor` endrer jeg vinkelen med 90 ganger `elapsed`, som er tiden siden forrige frame. Da går døra like fort uansett hvor mange FPS maskinen har. Vinkelen holdes mellom 0 og 90.
>
> I `drawDoor` flytter jeg først til hengslet, roterer, flytter en halv dørbredde ut og skalerer. Det som er litt lurt her, er at på selve vertexen virker dette baklengs: først skaleres den, så flyttes den ut fra hengslet, så roteres den. Det er derfor døra svinger rundt kanten og ikke rundt midten. Og kuben går fra minus én til én, så `scale` tar halve målene.

---

## 7 · Én kube, hele huset — 5:15 (30 s)

**Vis:** `ColoredCube.js:22–35`.

> Hele huset er egentlig den samme kuben tegnet mange ganger med ulike modellmatriser: vegger, gulv, tak, karmer og trappetrinn. `ColoredCube` arver kuben, men setter fargen som uniform før den tegner. `useProgram` må komme først, fordi en uniform hører til det programmet som er aktivt.

---

## 8 · Gjennomsiktig glass — 5:45 (50 s)

**Vis**
- `Windows.js:99`: sorteringen.
- `Windows.js:105–120`: `BLEND`, `blendFunc` og `depthMask`.

> Glasset er 2D-flater med alfa på 0.35. Med denne `blendFunc` blir fargen 35 prosent glass og 65 prosent det som ligger bak.
>
> Glasset tegnes helt til slutt. Tegner man det først, havner det i dybdebufferet, og alt bak blir fjernet før det rekker å blandes inn.
>
> Jeg slår også av `depthMask` mens glasset tegnes, sånn at glass bak annet glass fortsatt vises, og så sorterer jeg vinduene fra lengst unna til nærmest kameraet. Etterpå slår jeg på `depthMask` igjen og skrur av blending.

---

## 9 · Trær og klokke — 6:35 (30 s)

**Vis**
- `Sphere.js:73`: lysstyrken.
- `Clock.js:69–76`: `new Date()` og vinklene.

> Et tre er bare en sylinder og en kule. Siden vi ikke har lys ennå, ville kula sett flat ut, så jeg gjør den lysere på toppen og mørkere nederst med verteksfarger.
>
> Klokka leser tiden hver frame. Minuttviseren går 6 grader per minutt og timeviseren 30 grader per time. Lagene på klokka ligger litt foran hverandre, så de ikke flimrer.

---

## 10 · Avslutning — 7:05 (10 s)

**Vis:** nettsida med huset, eller ansiktet ditt.

> Det var oblig 1. Takk for at dere så på!

---

## Test deg selv kvelden før

Klarer du å svare med egne ord uten å åpne svaret, er du klar. Svarene er korte med vilje.

<details>
<summary><b>Hva er forskjellen på et attributt og en uniform?</b></summary>

Et attributt (`in`) har en egen verdi for hver vertex og kommer fra et buffer. En uniform er lik for hele tegnekallet og settes fra JavaScript med for eksempel `uniform4f`.
</details>

<details>
<summary><b>Hvorfor ganges rotasjonen med <code>elapsed</code>?</b></summary>

Så farten blir grader per sekund og ikke grader per frame. Ellers går døra dobbelt så fort på en maskin med 120 FPS.
</details>

<details>
<summary><b>Hvorfor tar <code>scale()</code> halve målene?</b></summary>

Kuben er definert fra −1 til 1, altså 2 enheter bred. Skal den bli 1.1 bred, skalerer vi med 0.55.
</details>

<details>
<summary><b>I hvilken rekkefølge virker translate, rotate og scale på en vertex?</b></summary>

Motsatt av rekkefølgen i koden: den siste operasjonen (ofte `scale`) virker først. Modellmatrisa blir T × R × S, og vertexen ganges inn fra høyre.
</details>

<details>
<summary><b>Hva skjer med <code>vColor</code> mellom vertex- og fragment-shaderen?</b></summary>

Den interpoleres. En piksel midt mellom en lys og en mørk vertex får en farge midt imellom.
</details>

<details>
<summary><b>Hvorfor må <code>useProgram</code> komme før <code>uniform4f</code>?</b></summary>

En uniform hører til ett bestemt shaderprogram. WebGL setter den på programmet som er aktivt akkurat da.
</details>

<details>
<summary><b>Hvorfor tegnes glasset sist, og hva gjør <code>depthMask(false)</code>?</b></summary>

Det som er bak glasset må allerede være tegnet for å kunne blandes inn. `depthMask(false)` hindrer at glasset skriver til dybdebufferet og skjuler annet glass bak seg.
</details>

<details>
<summary><b>Hva er z-fighting?</b></summary>

To flater på nøyaktig samme dybde: dybdetesten klarer ikke å avgjøre hvilken som er foran, og de flimrer om hverandre. Løsningen er å flytte den ene litt, slik klokka gjør.
</details>

<details>
<summary><b>Hvorfor to shaderpar i stedet for ett?</b></summary>

Uniform-paret gjør det billig å gjenbruke samme geometri i mange farger. Base-paret trengs når fargen skal variere over figuren, som på trærne og koordinataksene.
</details>

<details>
<summary><b>Hva skjer i <code>animate()</code> hver frame?</b></summary>

`requestAnimationFrame` → `calculateFps` → `clearCanvas` → `handleKeys` → `draw`. Tastaturet leses i `handleKeys` og ikke i `draw`, så tegnefunksjonene bare tegner.
</details>
