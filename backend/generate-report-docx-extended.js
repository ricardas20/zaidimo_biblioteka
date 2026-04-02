const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  AlignmentType,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} = require("docx");

const p = (text) => new Paragraph({ children: [new TextRun(text)] });
const h1 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_1 });
const h2 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_2 });
const h3 = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_3 });
const center = (text, bold = true) =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, bold })],
  });

const imgPlaceholder = (title, whatToCapture) => [
  p(`[PAVEIKSLAS: ${title}]`),
  p(`ĮKELTI: ${whatToCapture}`),
  p("Pastaba: įterpk ekrano kopiją ir po ja parašyk paveikslo pavadinimą pagal KVK formatą."),
];

const tablePlaceholder = (title, whatToFill) => [
  p(`[LENTELĖ: ${title}]`),
  p(`UŽPILDYTI: ${whatToFill}`),
  p("Pastaba: jei lentelė didelė, leidžiama kelti į priedus."),
];

const longIntro = [
  "Šiame kursiniame darbe pateikiamas pilnas taikomosios programų sistemos kūrimo ciklas – nuo problemos formulavimo ir duomenų modelio projektavimo iki realizacijos, testavimo ir rezultatų įvertinimo. Kurta sistema „GameVault“ skirta kompiuterinių žaidimų katalogavimui, paieškai, filtravimui ir naudotojų atsiliepimų valdymui.",
  "Darbo tema pasirinkta atsižvelgiant į praktinį poreikį valdyti didesnį žaidimų informacijos kiekį vieningoje struktūroje. Daugelis naudotojų informaciją apie žaidimus renka iš skirtingų šaltinių, todėl tampa sudėtinga lyginti kainą, vertinimus, žanrus ir kitus parametrus vienoje vietoje.",
  "Sukurta sistema leidžia centralizuoti duomenis, užtikrinti patogią paiešką bei suteikia galimybę atlikti bazinę analitiką per rūšiavimo ir filtravimo funkcijas. Sprendime integruota reliacinė duomenų bazė, REST API ir žiniatinklio naudotojo sąsaja.",
  "Darbe taikomi programų sistemų inžinerijos metodai: duomenų bazės modeliavimas, kliento-serverio architektūra, algoritmų kūrimas, programinio kodo moduliavimas, automatizuotas testavimas ir versijų kontrolė.",
  "Tikslas – sukurti vientisą informacinę sistemą, kuri tenkintų kursinio darbo reikalavimus ir parodytų praktinį gebėjimą projektuoti, realizuoti bei dokumentuoti programinį sprendimą.",
  "Uždaviniai: (1) suprojektuoti duomenų bazę ir jos ryšius; (2) aprašyti ir pagrįsti duomenų objektus bei struktūras; (3) įgyvendinti backend API ir frontend sąsają; (4) realizuoti paieškos, filtravimo ir rūšiavimo algoritmus; (5) parengti automatinius testus ir atlikti kokybės užtikrinimą.",
];

function paraBlock(arr) {
  return arr.map((x) => p(x));
}

const children = [
  center("TECHNOLOGIJŲ FAKULTETAS"),
  center("INŽINERIJOS IR INFORMATIKOS KATEDRA"),
  p(""),
  center("ŽAIDIMŲ BIBLIOTEKOS INFORMACINĖ SISTEMA"),
  p(""),
  center("Kursinis darbas", false),
  p(""),
  p("Informatikos studijų programos"),
  p("valstybinis kodas 6531BX004"),
  p("Informatikos studijų krypties"),
  p(""),
  p("Autorius: ______________________________"),
  p("Grupė: _________________________________"),
  p("Vadovas doc. dr. Aleksas Narščius: ______________________________"),
  p(""),
  center("Klaipėda, 2023", false),
  new Paragraph({ text: "", pageBreakBefore: true }),

  h1("TURINYS"),
  p("LENTELIŲ SĄRAŠAS"),
  p("PAVEIKSLŲ SĄRAŠAS"),
  p("ĮVADAS"),
  p("1. PROGRAMŲ SISTEMOS PROJEKTAVIMAS"),
  p("2. PROGRAMŲ SISTEMOS REALIZACIJA"),
  p("3. PROGRAMŲ SISTEMOS KOKYBĖS UŽTIKRINIMAS"),
  p("IŠVADOS"),
  p("LITERATŪRA"),
  p("PRIEDAI"),

  h1("LENTELIŲ SĄRAŠAS"),
  ...tablePlaceholder("1 lentelė. Duomenų bazės lentelių aprašas", "Pateik laukus, tipus, raktus ir ryšius."),
  ...tablePlaceholder("2 lentelė. API endpointų suvestinė", "Pateik metodą, kelią, paskirtį, atsako kodus."),
  ...tablePlaceholder("3 lentelė. Testų scenarijų suvestinė", "Pateik testą, tipą, tikėtiną rezultatą."),

  h1("PAVEIKSLŲ SĄRAŠAS"),
  ...imgPlaceholder("1 pav. Sistemos architektūra", "Docker konteinerių schema arba ranka braižytas architektūros paveikslas."),
  ...imgPlaceholder("2 pav. Pagrindinis katalogo langas", "Frontend pagrindinis puslapis su filtrais."),
  ...imgPlaceholder("3 pav. Žaidimo detalės langas", "Detalės puslapis su atsiliepimais ir nuotraukomis."),
  ...imgPlaceholder("4 pav. Duomenų bazės lentelės phpMyAdmin", "games, genres, game_genres, screenshots, reviews lentelių vaizdas."),

  h1("ĮVADAS"),
  ...paraBlock(longIntro),
  p("Darbo struktūra sudaryta iš trijų pagrindinių dalių: projektavimo, realizacijos ir kokybės užtikrinimo. Kiekviename skyriuje pateikiamas ne tik teorinis paaiškinimas, bet ir tiesioginė nuoroda į realizuotą projekto dalį."),
  p("Šioje ataskaitoje pateikiami papildomi įterpimo laukai nuotraukoms ir lentelėms, kad galutinis dokumentas atitiktų kolegijos pateikimo standartus ir būtų pilnai užbaigtas iki gynimo."),

  h1("1. PROGRAMŲ SISTEMOS PROJEKTAVIMAS"),
  h2("1.1. Duomenų bazės projektavimas"),
  p("Projektuojant duomenų bazę buvo pasirinkta reliacinė schema, leidžianti užtikrinti duomenų vientisumą ir aiškų ryšių modelį tarp esybių. Pagrindinė lentelė games saugo bazinę informaciją apie žaidimą, o papildomos lentelės detalizuoja žanrus, nuotraukas ir naudotojų įvertinimus."),
  p("Ryšių modelis: games-screenshots (1:N), games-reviews (1:N), games-genres (N:M per game_genres). Toks modelis parinktas todėl, kad vienas žaidimas gali turėti kelis žanrus ir kelias nuotraukas, o atsiliepimų skaičius nėra ribojamas."),
  p("Projektuojant įtraukti duomenų integralumo mechanizmai: FOREIGN KEY apribojimai, ON DELETE CASCADE politika, UNIQUE ribojimas žanrų pavadinimui, CHECK sąlyga rating laukui."),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [new TableCell({ children: [p("Lentelė")] }), new TableCell({ children: [p("Laukai")] }), new TableCell({ children: [p("Raktažodžiai")] })] }),
      new TableRow({ children: [new TableCell({ children: [p("games")] }), new TableCell({ children: [p("id, slug, title, genre, price, metacritic_score, ...")] }), new TableCell({ children: [p("PK: id, UQ: slug")] })] }),
      new TableRow({ children: [new TableCell({ children: [p("screenshots")] }), new TableCell({ children: [p("id, game_id, image_url, alt_text")] }), new TableCell({ children: [p("PK: id, FK: game_id")] })] }),
      new TableRow({ children: [new TableCell({ children: [p("genres")] }), new TableCell({ children: [p("id, name")] }), new TableCell({ children: [p("PK: id, UQ: name")] })] }),
      new TableRow({ children: [new TableCell({ children: [p("game_genres")] }), new TableCell({ children: [p("game_id, genre_id")] }), new TableCell({ children: [p("PK: game_id+genre_id, FK")] })] }),
      new TableRow({ children: [new TableCell({ children: [p("reviews")] }), new TableCell({ children: [p("id, game_id, author, rating, comment, created_at")] }), new TableCell({ children: [p("PK: id, FK: game_id, CHECK rating")] })] }),
    ],
  }),
  ...imgPlaceholder("DB schema", "Įkelk EER diagramą arba aiškią lentelių ryšių schemą."),

  h2("1.2. Naudojami duomenys"),
  p("Pradiniai duomenys saugomi JSON masyve, kuriame kiekvienam žaidimui apibrėžiami metaduomenys, prekybos nuorodos, nuotraukų masyvas ir pagalbiniai atributai. Seed scenarijus šiuos duomenis normalizuoja ir paskirsto į atitinkamas lenteles."),
  p("Duomenų šaltiniai: viešai prieinami žaidimų puslapių metaduomenys, API žinynai ir ranka suformuota informacija apie žanrus bei aprašymus."),
  ...tablePlaceholder("Naudojamų duomenų šaltinių lentelė", "Pateik konkrečias nuorodas, datą kada rinkta informacija ir kokie laukai paimti."),

  h3("1.2.1. Duomenų objektai"),
  p("Game objektas apima identifikatorių, tekstinius laukus, kainą, įvertinimus, nuorodas ir susietų objektų kolekcijas. Screenshot objektas reprezentuoja medijos elementą. Genre objektas nusako klasifikaciją, o Review – naudotojo vertinimą."),
  p("Sudėtinis objektas formuojamas backend sluoksnyje ir grąžinamas frontend vienu atsaku, taip mažinant tinklo užklausų kiekį."),

  h3("1.2.2. Duomenų struktūros"),
  p("Parinktos struktūros: Array (sąrašų apdorojimui), Map (seed kešavimui), plain object DTO formatams, SQL result-set (agregavimui)."),
  p("Toks pasirinkimas leidžia efektyviai realizuoti algoritmus ir užtikrina aiškų duomenų srautą tarp backend ir frontend."),

  h2("1.3. Programinis projektas"),
  p("Projektas įgyvendintas naudojant kliento-serverio architektūrą. Frontend sluoksnis atsakingas už atvaizdavimą ir naudotojo įvestis. Backend sluoksnis atsakingas už verslo logiką ir duomenų prieigą. Duomenų bazė saugo ilgalaikius sistemos duomenis."),
  p("Paleidimas realizuotas per Docker Compose, kas leidžia greitai paruošti vienodą aplinką tiek kūrimui, tiek demonstracijai."),
  ...imgPlaceholder("Programinio projekto architektūra", "Įkelk schemą: Frontend -> Backend API -> MySQL."),

  h2("1.4. Projektavimo šablonai"),
  p("Sistema remiasi keliomis projektavimo praktikomis: Repository-like duomenų prieigai, Strategy-like rūšiavimui ir Factory-like atsako objektų formavimui."),
  p("Šablonų taikymas padeda atskirti atsakomybes, mažina priklausomybes tarp modulių ir palengvina testavimą."),

  h1("2. PROGRAMŲ SISTEMOS REALIZACIJA"),
  h2("2.1. JPA realizavimas"),
  p("Kadangi sistema realizuojama Node.js aplinkoje, JPA atitikmuo įgyvendintas per mysql2 biblioteką ir parametrizuotas SQL užklausas. Toks sprendimas leidžia užtikrinti saugesnį užklausų vykdymą, valdyti ryšius ir realizuoti CRUD operacijas."),
  p("Sukurti endpointai apima žaidimų ir atsiliepimų kūrimą, skaitymą, atnaujinimą ir trynimą."),

  h2("2.2. DB užklausos"),
  p("Realizuotos paprastos ir sudėtinės užklausos. Sudėtinėse užklausose naudojami JOIN ir agregavimo operatoriai, leidžiantys vienu kreipiniu grąžinti daugiasluoksnį rezultatą (pvz., žaidimo vidutinį vertinimą ir žanrų sąrašą)."),
  p("Endpoint /api/games/search įgyvendina kelių parametrų filtravimo scenarijų: pavadinimas, žanras, minimalus įvertinimas, maksimali kaina ir rūšiavimo tipas."),
  ...tablePlaceholder("DB užklausų pavyzdžių lentelė", "Įklijuok 3-5 svarbiausias SQL užklausas ir jų paskirtį."),

  h2("2.3. Algoritmai"),
  p("Algoritmų dalyje realizuotos trys operacijos: paieška kolekcijoje pagal pavadinimą, filtravimas pagal žanrą ir rūšiavimas pagal metacritic balą. Šios operacijos realizuotos atskiroje util funkcijų bibliotekoje."),
  p("Algoritmai naudojami tiek backend testuose, tiek frontend veikime, todėl užtikrinamas jų praktinis pritaikomumas."),
  ...imgPlaceholder("Algoritmų veikimo rezultatai", "Įkelk ekrano kopiją su skirtingais filtravimo/rūšiavimo rezultatais."),

  h2("2.4. Grafinė naudotojo sąsaja"),
  p("Grafinė sąsaja realizuota kaip vieno puslapio tipo web aplikacija su keliomis sudėtinėmis dalimis: paieškos įvestis, filtrų blokas, rūšiavimo pasirinkimas, kortelių tinklelis, detalus puslapis ir atsiliepimų forma."),
  p("Sąsajoje naudotojas gali atlikti pagrindines manipuliacijas su duomenimis: peržiūrėti žaidimus, atidaryti detales, pateikti atsiliepimą."),
  ...imgPlaceholder("Pagrindinis GUI langas", "Įkelk pilną pagrindinio puslapio screenshot."),
  ...imgPlaceholder("Detalaus lango GUI", "Įkelk detalaus puslapio screenshot su atsiliepimų forma."),

  h1("3. PROGRAMŲ SISTEMOS KOKYBĖS UŽTIKRINIMAS"),
  h2("3.1. Testavimas"),
  p("Automatiniai testai realizuoti naudojant Jest ir Supertest. Testai skirstomi į integracinius API testus ir vienetinius algoritmų testus."),
  p("Panaudoti assert tipai: toBe, toEqual, toHaveLength, toThrow, toMatch, toBeGreaterThanOrEqual. Panaudotos anotacijų kategorijos: describe, test, test.each, afterAll. Realizuoti parametrizuoti testai, išimčių testavimas bei performance testavimo scenarijus."),
  p("Testavimo aprėpties didinimui rekomenduojama papildomai sukurti neigiamų scenarijų rinkinius kiekvienam CRUD endpointui."),
  ...tablePlaceholder("Testų vykdymo rezultatų lentelė", "Įklijuok npm test rezultatų santrauką: total, passed, failed."),
  ...imgPlaceholder("Testų vykdymo įrodymas", "Įkelk terminalo screenshot su npm test rezultatais."),

  h2("3.2. Kodo versijų kontrolė"),
  p("Projektas valdomas su Git. Darbo eigoje rekomenduojama daryti reguliarius tarpinius commit pagal funkcinius etapus: duomenų bazė, API, frontend, testai, dokumentacija."),
  p("Kiekvienas commit turi turėti aiškią semantinę žinutę (pvz. feat:, fix:, test:, docs:). Tai leidžia lengvai atsekti progreso eigą ir argumentuoti sprendimus gynimo metu."),
  ...imgPlaceholder("Git commit istorija", "Įkelk `git log --oneline` arba GitLab commit istorijos screenshot."),

  h1("IŠVADOS"),
  p("1. Suprojektuota ir realizuota pilnavertė žaidimų bibliotekos informacinė sistema su 5 lentelių duomenų baze ir kelių tipų ryšiais."),
  p("2. Įgyvendintos CRUD operacijos, sudėtinės SQL užklausos, paieškos/filtravimo/rūšiavimo algoritmai ir sudėtinė grafinė sąsaja."),
  p("3. Parengtas automatizuoto testavimo pagrindas, apimantis skirtingus testų tipus ir kokybės užtikrinimo praktikas."),
  p("4. Sukurta ataskaitos struktūra su aiškiomis vietomis įrodymams (nuotraukoms, lentelėms), tinkama pateikimui kolegijai."),

  h1("LITERATŪROS IR KITŲ INFORMACIJOS ŠALTINIŲ SĄRAŠAS"),
  p("1. Node.js Documentation. https://nodejs.org/docs/latest/api/"),
  p("2. Express.js Documentation. https://expressjs.com/"),
  p("3. MySQL 8.0 Reference Manual. https://dev.mysql.com/doc/refman/8.0/en/"),
  p("4. mysql2 package documentation. https://www.npmjs.com/package/mysql2"),
  p("5. Docker Compose Documentation. https://docs.docker.com/compose/"),
  p("6. Jest Documentation. https://jestjs.io/docs/getting-started"),
  p("7. Supertest Documentation. https://www.npmjs.com/package/supertest"),
  p("8. MDN Web Docs (Fetch API). https://developer.mozilla.org/docs/Web/API/Fetch_API"),
  p("9. REST API Tutorial. https://restfulapi.net/"),
  p("10. Refactoring Guru – Design Patterns. https://refactoring.guru/design-patterns"),
  p("11. Fowler, M. Patterns of Enterprise Application Architecture. Addison-Wesley."),
  p("12. Date, C. J. An Introduction to Database Systems. Addison-Wesley."),

  h1("PRIEDAI"),
  p("Priedas A. Duomenų bazės eksportas (SQL dump)."),
  p("Priedas B. Testų vykdymo žurnalai."),
  p("Priedas C. Naudotojo sąsajos ekrano kopijos."),
];

const doc = new Document({
  sections: [{ properties: {}, children }],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = path.join(__dirname, "..", "Kursinis_darbas_ataskaita_issamiai.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`Created: ${outPath}`);
});
