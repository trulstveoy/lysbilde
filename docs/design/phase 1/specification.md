Da ville jeg justert beskrivelsen slik at produktnavnet kommer tydelig frem:

# Lysbilde

**Lysbilde** er en lettvekts desktop-applikasjon for å vise presentasjoner bygget av ferdig genererte HTML-filer. I stedet for å lage slides manuelt i PowerPoint, lar Lysbilde brukeren sette sammen eksisterende HTML-sider til en presentasjon som kan vises i fullskjerm eller inne i applikasjonen.

Applikasjonen er utviklet med **Tauri** og er laget for brukere som arbeider med AI-genererte presentasjoner, dokumentasjon eller visuelle fortellinger der innholdet allerede finnes som HTML.

## Visjon

Lysbilde skal være den enkleste måten å presentere HTML-baserte slides på. Fokus er ikke på redigering av innholdet, men på organisering, visning og presentasjon.

## Hovedfunksjoner

### Opprette presentasjoner

Brukeren kan opprette et nytt prosjekt og velge hvilke HTML-filer som skal inngå i presentasjonen.

Et prosjekt består av:

* en samling HTML-filer
* rekkefølgen de skal vises i
* prosjektmetadata
* eventuelle annotasjoner

### Import av HTML-slides

Brukeren velger én eller flere HTML-filer fra lokal disk.

Applikasjonen:

* importerer filreferansene
* genererer thumbnails
* viser en oversikt over alle slides
* lagrer presentasjonen som et prosjekt

### Organisering av slides

I prosjektvisningen kan brukeren:

* se thumbnails av alle slides
* dra og slippe for å endre rekkefølge
* fjerne slides
* legge til nye slides
* forhåndsvise enkelt-slides

### Presentasjonsmodus

Lysbilde støtter to visningsmoduser:

#### Fullskjerm

Presentasjonen dekker hele skjermen og fungerer på samme måte som en tradisjonell presentasjon.

#### Innebygd visning

Presentasjonen vises inne i applikasjonsvinduet for gjennomgang og testing.

### Navigasjon

Under presentasjon kan brukeren navigere med:

* høyre og venstre piltast
* mellomrom
* Page Up og Page Down
* museklikk
* navigasjonsknapper

## Fremtidige funksjoner

### Annotasjoner

Lysbilde skal støtte annotasjoner som legges oppå eksisterende slides uten å endre HTML-filene.

Eksempler:

* gule lapper
* tekstkommentarer
* piler
* rektangler
* markeringer

Annotasjonene lagres som et eget lag knyttet til presentasjonen.

Typiske bruksområder:

* møtenotater
* tilbakemeldinger
* gjennomgang av forslag
* markering av feil eller forbedringspunkter

## Teknisk arkitektur

### Plattform

* Tauri
* TypeScript
* Moderne webfrontend
* Lokal lagring av prosjekter

### Presentasjonsmotor

Hver slide lastes direkte fra en lokal HTML-fil og vises i en isolert visningsflate.

Prosjektet lagrer:

* filreferanser
* rekkefølge
* visningsinnstillinger
* annotasjoner

Originalfilene endres aldri.

## Produktbeskrivelse

**Lysbilde er en lettvekts presentasjonsapplikasjon for HTML-baserte slides. Brukeren velger eksisterende HTML-filer, organiserer dem i ønsket rekkefølge og presenterer dem i fullskjerm eller inne i applikasjonen. Målet er å tilby en enkel og effektiv presentasjonsopplevelse uten kompleksiteten til tradisjonelle presentasjonsverktøy.**
