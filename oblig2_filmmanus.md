# Filmmanus: Hierarkisk gravemaskin

*DTE-2800 Datamaskingrafikk · Oblig 2 · mål 11:20, maks 12 min*

**Snakk, ikke les.** Replikkene under er skrevet sånn du kan si dem høyt, men du trenger ikke treffe ordene. Er du nervøs, les dem et par ganger før opptak, legg manuset bort og si det med egne ord. Læreren vil høre at du skjønner koden, ikke at du er nyhetsoppleser.

Oppgaven sier at du må vise at du har forstått temaene. Det viktigste er scene 7 og 8 — matrisestacken og hierarkiet. Går du tom for tid, kutt heller scene 6 eller 11 enn å haste gjennom de to.

## Tidsplan

11:20 planlagt · 0:40 slingringsmonn

| # | Start | Lengde | Scene |
|---|------:|-------:|-------|
| 1 | 0:00 | 20 s | Intro |
| 2 | 0:20 | 75 s | Demo |
| 3 | 1:35 | 45 s | Hvordan prosjektet er delt opp |
| 4 | 2:20 | 75 s | Shaderne i HTML-fila |
| 5 | 3:35 | 50 s | renderInfo og tegneløkka |
| 6 | 4:25 | 55 s | De fire primitivene |
| 7 | 5:20 | 100 s | **Matrisestacken** |
| 8 | 7:00 | 75 s | **Hierarkiet i praksis** |
| 9 | 8:15 | 60 s | Teksturer |
| 10 | 9:15 | 80 s | Gjennomsiktig glass |
| 11 | 10:35 | 35 s | Kontinuerlig animasjon |
| 12 | 11:10 | 10 s | Avslutning |

## Før du trykker opptak

- [ ] Studentbeviset ligger klart ved siden av tastaturet.
- [ ] Ansiktskamera er på og vises i et hjørne av opptaket.
- [ ] Nettsida er åpen og lastet med Ctrl+F5.
- [ ] VS Code: skriftstørrelsen er skrudd opp med Ctrl +, sidepanelet er lukket.
- [ ] Fanene er åpne i denne rekkefølgen: `index.html`, `main.js`, `Gravemaskin.js`, `gravemaskin/Understell.js`, `gravemaskin/Hus.js`, `gravemaskin/Arm.js`, `gravemaskin/Skuff.js`, `gravemaskin/Forerhus.js`, `gravemaskin/Vinduer.js`, `gravemaskin/Styring.js`, `helpers/Stack.js`, `helpers/Glass.js`, `helpers/Texture.js`, `Tegnehjelp.js`, `shapes/Kube.js`, `shapes/Kjegle.js`.
- [ ] Konsollen i nettleseren er åpen og tom — den skal ikke vise noen advarsel om ubalansert stack.
- [ ] Stoppeklokke på mobilen. **Er du over 6:00 når du starter scene 8, kutt scene 9 til én setning om at beltene og huset er teksturert, og gå rett til glasset.**

---

## 1 · Intro — 0:00 (20 s)

**Vis:** ansiktet ditt, med studentbeviset holdt opp mot kamera.

> Hei! Jeg heter Julie Borli, brukernavn jbo055. Dette er oblig 2 i Datamaskingrafikk, der jeg har laget en gravemaskin i WebGL 2. Den er bygd hierarkisk med matrisestack, så når jeg svinger huset, følger hele armen med. Først viser jeg den, og så går jeg gjennom koden.

---

## 2 · Demo — 0:20 (75 s)

**Vis**
- FPS-telleren og koordinataksene.
- J og L: sving huset — pek på at bom, arm og skuff følger med.
- I og K: hev og senk bommen.
- U og O: bøy armen. N og M: vipp skuffen.
- Radaren som snurrer av seg selv hele tiden.
- W A S D og V B: kamera rundt, og zoom inn på førerhuset så glasset sees.

> Oppe til venstre er FPS-telleren, og i midten ser dere koordinatsystemet — rød er x, grønn er y og blå er z.
>
> Gravemaskinen står på to belter. Med J og L svinger jeg huset rundt. Og legg merke til at bommen, armen og skuffen følger med, helt uten at jeg gjør noe ekstra for det — det er hele poenget med hierarkiet, og jeg kommer tilbake til hvorfor.
>
> Med I og K hever og senker jeg bommen. U og O bøyer armen. N og M vipper skuffen, som er en kjegle.
>
> Og oppe på taket snurrer radaren av seg selv. Den er ikke koblet til noen tast — den går på tid.
>
> Kameraet styrer jeg med W, A, S og D, og zoomer med V og B. Zoomer jeg inn på førerhuset, ser dere at det har fire vinduer i blått glass som man kan se gjennom, med et sete inni.

---

## 3 · Hvordan prosjektet er delt opp — 1:35 (45 s)

**Vis**
- `index.html:93`: modulen som importerer og kaller `main()`.
- Filutforskeren: mappene `gravemaskin/`, `shapes/`, `helpers/`.

> Alt starter nederst i `index.html`, der jeg importerer `main` som en modul og kaller den. All JavaScript er moduler, og hver fil har én jobb.
>
> `gravemaskin`-mappa er egentlig et bilde av modellen: understell, hus, førerhus, arm, skuff og vinduer har hver sin fil. `shapes` har de fire figurene — kube, flate, sylinder og kjegle — og `helpers` har hjelpeklassene.
>
> Basefilene vi fikk utdelt inneholdt også et klassehierarki for figurer. Jeg valgte det bort, og lager i stedet figurene som funksjoner som returnerer buffere. Det passer sammen med `renderInfo` og matrisestacken, sånn vindtre-eksempelet er bygd opp — og da er det ingen vits i å levere to arkitekturer som gjør det samme. Alle filene i prosjektet er i bruk.

---

## 4 · Shaderne i HTML-fila — 2:20 (75 s)

**Vis**
- `index.html:29`: base-vertex-shaderen.
- `index.html:40–46`: `gl_Position` og `vTextureCoordinate`.
- `index.html:49`: base-fragment-shaderen, særlig `if (uUseTexture)` på linje 61.
- `index.html:72` og `84`: koordinat-paret.

> Shaderkoden ligger i script-tagger i HTML-fila, sånn oppgaven krever, og jeg har to par.
>
> Vertex-shaderen kjører én gang per vertex. Her ganger jeg projeksjon, view og modell hver for seg: projeksjonsmatrisa ganger view-matrisa ganger modellmatrisa ganger posisjonen. Legg merke til at jeg sender inn tre separate matriser og lar skjermkortet gange dem sammen, i stedet for å regne ut modelview på CPU-en. Teksturkoordinaten sendes bare videre til fragment-shaderen.
>
> Fragment-shaderen kjører per piksel. Den har en bool-uniform `uUseTexture`. Er den sann, henter jeg fargen fra teksturen og ganger med `uFragmentColor`. Er den usann, bruker jeg bare `uFragmentColor` direkte. Det er sånn jeg kan tegne både teksturerte og ensfargede deler med det samme shaderparet.
>
> Det andre paret er bare til koordinataksene. Det har farge per vertex og tar imot en ferdig sammenganget modelview-matrise — altså motsatt av det første. Jeg lot det stå som det var i eksempelet.

---

## 5 · renderInfo og tegneløkka — 3:35 (50 s)

**Vis**
- `main.js:28`: `renderInfo`-objektet.
- `main.js:78`: `animate()`.
- `main.js:112`: `draw()`.

> `main.js` er nå på 135 linjer og gjør bare to ting: starter opp og driver løkka.
>
> `renderInfo` er objektet oppgaven ber om. Det samler alt tegningen trenger: gl-konteksten, de to shaderne, ett buffer per figur, teksturene, matrisestacken og `animation`-objektet med de fire leddvinklene.
>
> `animate` kaller `requestAnimationFrame` på seg selv, regner ut `elapsed` — altså tid siden forrige bilde — oppdaterer FPS, leser tastaturet, roterer radaren og kaller `draw`.
>
> Og `draw` er seks linjer: tøm skjermen, tegn aksene, nullstill glassamlingen, tegn gravemaskinen, tegn glasset, og sjekk at stacken er tom. Alle detaljene ligger i moduler med navn som sier hva de gjør.

---

## 6 · De fire primitivene — 4:25 (55 s)

**Vis**
- `shapes/Kube.js:5`: posisjonene.
- `shapes/Kjegle.js:16–24`: sideflaten.
- `Tegnehjelp.js:29`, `92`, `116`, `145`: de fire tegnefunksjonene.

> Oppgaven krever minst tre primitivtyper. Jeg har fire: kube, flate, sylinder og kjegle.
>
> Kuben er tolv trekanter, definert fra minus én til én i alle retninger. Den brukes til nesten alt — understell, belter, hus, bom, arm og hele førerhuset.
>
> Kjegla er verdt å se på. Den er egentlig sylinderen med toppsirkelen krympet til ett eneste punkt. Sylinderen trenger to trekanter per sektor på siden, pluss lokk i begge ender. Kjegla klarer seg med én trekant per sektor og bare bunnlokk — altså halvparten så mange trekanter.
>
> Alle fire returnerer det samme: et objekt med `position` og `vertexCount`. Derfor ser de fire tegnefunksjonene i `Tegnehjelp` nesten helt like ut.

---

## 7 · Matrisestacken — 5:20 (100 s)

Dette er kjernen. Ta deg god tid her.

**Vis**
- `helpers/Stack.js:7` og `20`: at både `pushMatrix` og `peekMatrix` lager en **kopi**.
- `Gravemaskin.js:21–29`: roten pushes og poppes.
- `gravemaskin/Hus.js:7–10`: peek, endre, push.

> Nå til det oppgaven egentlig handler om. En hierarkisk modell betyr at hver del arver plasseringen til den over seg.
>
> Se på `Stack`-klassen. Det viktigste her er ordet **kopi**. `peekMatrix` leser toppen av stacken, men returnerer en kopi — ikke matrisa selv. Det er helt avgjørende. Når en del henter forelderens matrise og flytter og roterer på den, jobber den på sin egen kopi. Forelderens matrise ligger urørt igjen på stacken, klar til neste barn.
>
> Mønsteret går igjen overalt i koden, og er tre steg: **peek, endre, push.**
>
> I `Gravemaskin` starter jeg med en identitetsmatrise og pusher den. Det er roten, altså gravemaskinens plass i verden. Så tegnes understellet og huset.
>
> I `Hus` gjør jeg peek for å få roten, flytter opp 1,85 og roterer om y-aksen med `husVinkel` — den J og L styrer. Så pusher jeg. Nå ligger husets matrise på toppen, og alt som tegnes etterpå arver den.
>
> Og til slutt må jeg poppe like mange ganger som jeg har pushet. Er stacken ikke tom når bildet er ferdig, skriver `draw` en advarsel i konsollen. Der er den — og den er tom, så push og pop går opp.

---

## 8 · Hierarkiet i praksis — 7:00 (75 s)

**Vis**
- `gravemaskin/Hus.js:64`: at `drawArm` kalles mens husets matrise ligger øverst.
- `gravemaskin/Arm.js:11` og `33`: bom og arm pushes hver for seg.
- `gravemaskin/Skuff.js:13`: skuffen pushes.
- Tilbake til nettsida: trykk J og L igjen.

> La oss følge kjeden helt ned. Husets matrise ligger på stacken. Så kalles `drawArm`, som gjør peek, flytter ut til der bommen er festet, roterer om z med `bomVinkel`, og pusher. Nå har vi to matriser: hus og bom.
>
> Armen gjør nøyaktig det samme fra bommens matrise, og skuffen fra armens. Til slutt er stacken fem nivåer dyp: rot, hus, bom, arm, skuff.
>
> Og dette er grunnen til at det ser riktig ut når jeg svinger huset. Husets rotasjon ligger allerede inne i matrisa som bommen bygger videre på — så bommen, armen og skuffen arver den gratis. Jeg gjør ingenting ekstra.
>
> Forgreiningen finner dere to steder: understellet har to belter som søsken, og huset har førerhus, radar og bom som tre søsken. De henter alle samme forelder med peek, og fordi peek gir kopier, tråkker de ikke i hverandres matriser.

---

## 9 · Teksturer — 8:15 (60 s)

**Vis**
- `helpers/Texture.js:31–32`: `REPEAT`, og `:47`: mipmaps.
- `gravemaskin/Understell.js:5`: `BELTE`-målene.
- `gravemaskin/Understell.js:17`: teksturkoordinatene for beltet.

> Teksturene lastes i `Texture.js`. Mens bildet laster, bruker jeg en hvit pikselen som midlertidig tekstur, så det ikke blir svart. Når bildet er ferdig, setter jeg `REPEAT` på begge akser og genererer mipmaps, som gir penere resultat når teksturen vises i liten størrelse.
>
> Huset, bommen, armen og førerhusets tak bruker et metallbilde, med teksturkoordinater fra null til én per side.
>
> Beltene er litt mer interessante. Hadde jeg brukt null til én der, ville mønsteret blitt strukket over hele beltelengden på nesten sju enheter. I stedet regner jeg ut hvor mange fliser hver side skal ha: sidelengden delt på flisstørrelsen. Siden teksturen er satt til `REPEAT`, gjentas mønsteret i stedet for å strekkes.
>
> Og målene står ett sted — i `BELTE` øverst i fila. Både skaleringen og teksturkoordinatene leser derfra, så de kan ikke komme ut av sync.

---

## 10 · Gjennomsiktig glass — 9:15 (80 s)

**Vis**
- `gravemaskin/Vinduer.js:26`: at vinduene bare **meldes inn**, ikke tegnes.
- `helpers/Glass.js:37`: `tegnGlass`.
- `helpers/Glass.js:42`: `blendFunc`. `:46`: `depthMask(false)`.
- `helpers/Glass.js:50`: sorteringen.

> Oppgaven krever minst én delvis gjennomsiktig del. Det er vinduene i førerhuset, med alfa 0,3.
>
> Det er ikke nok å sette en alfaverdi, for gjennomsiktige flater kan ikke tegnes i hvilken som helst rekkefølge. Derfor tegner ikke `Vinduer.js` noe i det hele tatt — den regner ut matrisene og **melder dem inn** med `samleGlass`. Selve tegningen skjer helt til slutt.
>
> I `tegnGlass` skjer tre ting. Først slår jeg på blending med `SRC_ALPHA` og `ONE_MINUS_SRC_ALPHA` — det betyr 30 prosent glassfarge og 70 prosent det som ligger bak.
>
> Så slår jeg av `depthMask`. Glasset testes fortsatt mot dybdebufferet, men skriver ikke til det. Uten dette ville det fremste vinduet skjult vinduene bak seg.
>
> Og til slutt sorterer jeg vinduene på dybde sett fra kameraet, og tegner det bakerste først. Med fire like blå vinduer ser man ikke forskjell, men hadde de hatt ulike farger, ville rekkefølgen vært synlig. Etterpå slår jeg `depthMask` på igjen og skrur av blending, sånn at neste bilde starter likt.

---

## 11 · Kontinuerlig animasjon — 10:35 (35 s)

**Vis**
- `main.js:90`: radarens rotasjon.
- `gravemaskin/Styring.js:11`: `ledd`-tabellen.

> Oppgaven krever én bevegelse som går uten brukerinput. Det er radaren. Den øker med 90 grader ganger `elapsed` hvert bilde, og `elapsed` er sekunder siden forrige bilde. Da går den 90 grader i sekundet uansett om maskinen klarer 30 eller 144 FPS. Modulo 360 hindrer at tallet vokser i det uendelige.
>
> De tastaturstyrte leddene bruker samme prinsipp, og ligger i denne tabellen: hvert ledd har en tast opp, en tast ned og grenser for hvor langt det kan bevege seg. Huset har ingen grenser, for det skal kunne svinge hele veien rundt.

---

## 12 · Avslutning — 11:10 (10 s)

**Vis:** nettsida med gravemaskinen, eller ansiktet ditt.

> Det var oblig 2. Takk for at dere så på!

---

## Test deg selv kvelden før

Klarer du å svare med egne ord uten å åpne svaret, er du klar.

<details>
<summary><b>Hvorfor returnerer <code>peekMatrix</code> en kopi og ikke matrisa selv?</b></summary>

Fordi hvert barn flytter og roterer på matrisa det får. Uten kopi ville det første barnet ødelagt forelderens matrise for alle søsknene sine. Beltene ville havnet oppå hverandre.
</details>

<details>
<summary><b>Hvor mange nivåer er hierarkiet, og hva er forgreiningene?</b></summary>

Fem: rot, hus, bom, arm, skuff. Forgreining to steder — understellet har to belter som søsken, og huset har førerhus, radar og bom som søsken.
</details>

<details>
<summary><b>Hvorfor følger armen med når huset svinger?</b></summary>

Fordi bommen bygger videre på husets matrise, som allerede inneholder rotasjonen. Arven skjer i matrisa, ikke i koden.
</details>

<details>
<summary><b>Hva skjer hvis du glemmer én <code>popMatrix</code>?</b></summary>

Stacken vokser for hvert bilde, og neste bilde starter fra feil matrise. Derfor sjekker `draw` at stacken er tom og advarer i konsollen.
</details>

<details>
<summary><b>Hvorfor ganges rotasjonen med <code>elapsed</code>?</b></summary>

Så farten blir grader per sekund, ikke grader per bilde. Uten det går radaren dobbelt så fort på en maskin med dobbelt så høy FPS.
</details>

<details>
<summary><b>Hva gjør <code>uUseTexture</code> i fragment-shaderen?</b></summary>

Velger mellom tekstur og ren farge, så samme shaderpar kan tegne både teksturerte og ensfargede deler. Er den sann, ganges teksturfargen med `uFragmentColor`.
</details>

<details>
<summary><b>Hvorfor må glasset tegnes sist?</b></summary>

Det som er bak må allerede være tegnet for å kunne blandes inn. Tegnes glasset først, er det ingenting å blande med.
</details>

<details>
<summary><b>Hva gjør <code>depthMask(false)</code>, og hvorfor holder det ikke å sortere?</b></summary>

Den hindrer at glasset skriver til dybdebufferet, så glass bak annet glass fortsatt vises. Sortering alene hjelper ikke, for et vindu som allerede har skrevet dybde vil forkaste det som ligger bak.
</details>

<details>
<summary><b>Hvorfor har beltene egne teksturkoordinater i stedet for 0 til 1?</b></summary>

Fordi beltet er nesten sju enheter langt. Med 0 til 1 ville mønsteret blitt strukket over hele lengden. I stedet regnes antall fliser ut fra sidelengden, og `REPEAT` gjentar mønsteret.
</details>

<details>
<summary><b>Hvordan er kjegla forskjellig fra sylinderen?</b></summary>

Toppsirkelen er krympet til ett punkt. Da blir hver sektor på siden én trekant i stedet for to, og topplokket forsvinner — halvparten så mange trekanter.
</details>

<details>
<summary><b>Hvorfor tar <code>scale()</code> halve målene?</b></summary>

Kuben går fra −1 til 1, altså 2 enheter bred. Skal beltet bli 6,8 langt, skalerer vi med 3,4.
</details>

<details>
<summary><b>Hva er forskjellen på de to shaderparene dine?</b></summary>

Base-paret tar modell-, view- og projeksjonsmatrisa hver for seg og ganger på GPU-en, og har farge som uniform pluss valgfri tekstur. Koordinat-paret tar en ferdig sammenganget modelview-matrise og har farge per vertex.
</details>
