Hierarkisk 3D-modell med matrisestack
Inntil to studenter kan samarbeide og levere felles besvarelse. Bruk gruppesettet "Oblig 2 2026". MERK: Alle må melde seg inn i grupper, selv om du skulle velge å jobbe alene.

Oppgaven
Lag et WebGL-program som tegner én sammensatt 3D-modell bygd opp av grunnleggende primitive figurer (kube, sylinder, kule, kjegle, sirkel, flate). Modellen skal ha minst fire nivåer i hierarkiet, minst én forgreining (to eller flere søsken som deler samme forelder). Det skal brukes minst tre ulike primitivtyper. Deler av modellen skal animeres: minst to ledd styrt fra tastaturet, og minst én bevegelse som går kontinuerlig uten brukerinput, slik vinden gjør i vindtre-eksemplet. Minimum to av modellens deler skal også tekstureres. Velg selv teksturfiler (png). Minimum en av modellens deler skal være delvis gjennomsiktig.

Modellen skal bygges med bruk av matrisestacken etter modell fra vindtre-eksemplet.

Forslag til modell: gravemaskin, dette er en relativt kompleks modell og besvarelsen trenger ikke nødvendigvis være så omfattende som dette - se alternativer lenger ned.

rot (plassering i verden)
└── understell  (kube)  ── belter: 2 × kube (søsken, forgreining)
    └── svingkrans (sylinder)         ← ROTERER om y   [A / D]
        └── hus (kube)  ── førerhus (kube), eksosrør (sylinder), radar (sylinder + flate)  ← radaren roterer kontinuerlig
            └── bom (kube)            ← ROTERER om z   [W / S]
                └── arm (kube)        ← ROTERER om z   [R / F]
                    └── skuffe (kjegle/kube)  ← ROTERER om z   [T / G]

Poenget med denne figuren er at svingkransen er høyt oppe i hierarkiet: roterer du den, følger bom, arm og skuffe med.

Alternative modeller (velg fritt, samme krav gjelder):
- Vindmølle — nav som roterer kontinuerlig, tre blader som søsken, tårn som kan svinge mot vinden med tastatur.
- Skrivebordslampe — fot, to armledd, lampehode; alle ledd tastaturstyrt, pluss en pulserende lyskjegle.
- Karusell — roterende tak (kontinuerlig), hester som søsken i sirkel, hver hest med egen opp/ned-bevegelse i ulik fase.
- Robotarm — sokkel, tre ledd, gripeklo med to fingre som søsken.
- Helikopter — kropp, hovedrotor og halerotor (kontinuerlig, ulik hastighet), landingsmeier.

Læringsmål
Læringsmålene for denne oppgaven omfatter også læringsmålene for oblig1, pluss følgende:  

lære prinsippene for hierarkisk modellering og scenegraf.
bruk av teksturer på modellens ulike deler.
slå på og bruke enkel fargeblanding (alpfa blending) for gjennomsiktighet.
Krav
Løsninga skal være basert på Javascript og WebGL (v2) og GLSL ES 3, og skal bruke samme kodestruktur som kodeeksemplene gitt på Canvas og i forelesningene. Det betyr bl.a.
Shaderkoden legges i html-fila i script-tagger.
Javascriptkoden skal ligge i separate .js filer. 
Det skal brukes Javascript-moduler.
Løsninga kan ha en eller flere .js filer. Fila som inneholder main() funksjonen skal imidlertid følge mønstret til eksemplene med bruk av WebGLCanvas, renderInfo-objektet, kall på animate() og draw() m.m. Om ønskelig kan andre funksjoner plasseres i egne filer. Disse må i så fall eksporteres og importeres.    
Innlevering
Komplett prosjekt med all kode som skal til for at koden skal fungere.
Det betyr at du/dere lager en zip-fil med nødvendige html og javascript-filer, inkludert hjelpefiler og klasser (fra /base-mappa) i korrekt mappestruktur. Dette for at det skal være enkelt å åpne prosjektet i mitt utviklingsmiljø og at det fungerer umiddelbart (jeg kan ikke bruke tid på å plassere filer og mapper i korrekt for at deres løsning skal fungere).
En film med opptak av skjermen der:
Hver enkelt gruppemedlem filmer seg selv (ansiktet) samtidig som du holder frem en ID (studentbevis eller annet) og presenterer deg.
Kjører en kort demo av løsninga, dvs. vis at den er kjørbar/fungerer ev. så langt dere har kommet. 
Viktig: Gjennomgå og forklar (html,) javascript og shader-koden. Her må hver enkelt vise at han/hun har forstått temaene vi så langt har vært gjennom i faget. 
Filmen skal være på maks 12 minutter, totalt. Begge i gruppe skal bidra like mye.
NB: PLANLEGG og FORBERED videogjennomgangen ved f.eks. på forhånd skrive ned det du skal si. Dette gjør det enklere å holde tiden. IKKE ta videopptaket på sparket - det blir sjelden bra.