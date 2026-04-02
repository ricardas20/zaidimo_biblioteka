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
const h = (text, level = HeadingLevel.HEADING_1) =>
  new Paragraph({ text, heading: level });
const center = (text, bold = true) =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, bold })],
  });

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        center("TECHNOLOGIJŲ FAKULTETAS"),
        center("INŽINERIJOS IR INFORMATIKOS KATEDRA"),
        new Paragraph(""),
        center("ŽAIDIMŲ BIBLIOTEKOS INFORMACINĖ SISTEMA"),
        new Paragraph(""),
        center("Kursinis darbas", false),
        new Paragraph(""),
        p("Informatikos studijų programos"),
        p("valstybinis kodas 6531BX004"),
        p("Informatikos studijų krypties"),
        new Paragraph(""),
        p("Autorius: Vardas Pavardė ____________________"),
        p("Vadovas: doc. dr. Aleksas Narščius ____________________"),
        new Paragraph(""),
        center("Klaipėda, 2023", false),
        new Paragraph({ text: "", pageBreakBefore: true }),

        h("TURINYS"),
        p("LENTELIŲ SĄRAŠAS"),
        p("PAVEIKSLŲ SĄRAŠAS"),
        p("ĮVADAS"),
        p("1. PROGRAMŲ SISTEMOS PROJEKTAVIMAS"),
        p("1.1. Duomenų bazės projektavimas"),
        p("1.2. Naudojami duomenys"),
        p("1.2.1. Duomenų objektai"),
        p("1.2.2. Duomenų struktūros"),
        p("1.3. Programinis projektas"),
        p("1.4. Projektavimo šablonai"),
        p("2. PROGRAMŲ SISTEMOS REALIZACIJA"),
        p("2.1. JPA realizavimas"),
        p("2.2. DB užklausos"),
        p("2.3. Algoritmai"),
        p("2.4. Grafinė naudotojo sąsaja"),
        p("3. PROGRAMŲ SISTEMOS KOKYBĖS UŽTIKRINIMAS"),
        p("3.1. Testavimas"),
        p("3.2. Kodo versijų kontrolė"),
        p("IŠVADOS"),
        p("LITERATŪROS IR KITŲ INFORMACIJOS ŠALTINIŲ SĄRAŠAS"),
        new Paragraph({ text: "", pageBreakBefore: true }),

        h("LENTELIŲ SĄRAŠAS"),
        p("1 lentelė. Minimalių reikalavimų lentelė."),
        p("2 lentelė. Vertinimo kriterijų lentelė."),
        p("3 lentelė. Duomenų bazės lentelių schema."),
        h("PAVEIKSLŲ SĄRAŠAS"),
        p("1 pav. Sistemos architektūros schema."),
        p("2 pav. Pagrindinis žaidimų sąrašo langas."),
        p("3 pav. Žaidimo detalės ir atsiliepimų forma."),

        h("ĮVADAS"),
        p("Šiame kursiniame darbe nagrinėjamas žaidimų bibliotekos informacinės sistemos „GameVault“ projektavimas ir realizavimas. Sistema skirta centralizuotai žaidimų metaduomenų, žanrų, ekrano nuotraukų ir naudotojų atsiliepimų apskaitai bei analizei. Darbe taikomi programų sistemų inžinerijos principai: duomenų bazės modeliavimas, kliento-serverio architektūra, duomenų apdorojimo algoritmai, grafinės naudotojo sąsajos realizacija ir kokybės užtikrinimo praktikos."),
        p("Darbo aktualumas grindžiamas tuo, kad skaitmeninio turinio platformose nuolat auga turinio kiekis, todėl tampa svarbus struktūruotas duomenų valdymas, greita paieška ir filtravimas bei aiškus informacijos pateikimas naudotojui. Sprendimas orientuotas į praktinį pritaikymą: duomenys saugomi reliacinėje duomenų bazėje, API palaiko CRUD operacijas, o naudotojo sąsaja leidžia ne tik peržiūrėti informaciją, bet ir su ja sąveikauti."),
        p("Tikslas – suprojektuoti ir įgyvendinti vientisą taikomąją programą, kuri tenkintų kursinio darbo reikalavimus duomenų modelio, algoritmų, vartotojo sąsajos ir testavimo srityse."),
        p("Darbo uždaviniai: (1) suprojektuoti duomenų bazę ir pagrįsti pasirinktus ryšius; (2) apibrėžti naudojamus duomenų objektus ir struktūras; (3) realizuoti backend API ir frontend sąsają; (4) įgyvendinti paieškos, filtravimo ir rūšiavimo algoritmus; (5) atlikti automatizuotą testavimą ir pateikti sprendimų pagrindimą informacijos šaltiniais."),
        p("Darbo metodai: literatūros analizė, sistemų projektavimas, praktinė programų sistemos realizacija, eksperimentinis funkcionalumo patikrinimas per testų scenarijus."),

        h("1. PROGRAMŲ SISTEMOS PROJEKTAVIMAS"),
        h("1.1. Duomenų bazės projektavimas", HeadingLevel.HEADING_2),
        p("Sistemai suprojektuota reliacinė MySQL duomenų bazė, atitinkanti normalizacijos principus ir orientuota į duomenų integralumą. Naudojamos penkios lentelės: games, screenshots, genres, game_genres ir reviews."),
        p("Projektuojant modelį pasirinkti keli ryšių tipai: 1:N ryšiai tarp games ir screenshots bei tarp games ir reviews; N:M ryšys tarp games ir genres realizuotas per tarpinę lentelę game_genres. Tokia struktūra leidžia išvengti duomenų dubliavimo ir užtikrina lankstų žanrų priskyrimą."),
        p("Duomenų integralumui užtikrinti taikomi pirminiai ir išoriniai raktai, unikalumo ribojimai bei CHECK sąlyga įvertinimui (1–10 intervalas)."),
        p("Realizacijos vieta: backend/seed.js"),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [p("Lentelė")] }),
                new TableCell({ children: [p("Pagrindiniai laukai")] }),
                new TableCell({ children: [p("Ryšys")] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [p("games")] }),
                new TableCell({ children: [p("id, slug, title, genre, price, metacritic_score, ...")] }),
                new TableCell({ children: [p("1:N su screenshots, 1:N su reviews, N:M su genres")] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [p("screenshots")] }),
                new TableCell({ children: [p("id, game_id, image_url, alt_text")] }),
                new TableCell({ children: [p("N:1 su games")] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [p("genres")] }),
                new TableCell({ children: [p("id, name")] }),
                new TableCell({ children: [p("N:M su games per game_genres")] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [p("game_genres")] }),
                new TableCell({ children: [p("game_id, genre_id")] }),
                new TableCell({ children: [p("Tarpinė N:M lentelė")] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [p("reviews")] }),
                new TableCell({ children: [p("id, game_id, author, rating, comment, created_at")] }),
                new TableCell({ children: [p("N:1 su games")] }),
              ],
            }),
          ],
        }),
        h("1.2. Naudojami duomenys", HeadingLevel.HEADING_2),
        p("Pradiniai duomenys saugomi JSON struktūroje backend/games-data.js. Duomenų rinkinyje pateikta 20 žaidimų, kiekvienam priskiriant kainą arba nemokamą statusą, metacritic įvertinimą, platformas, parduotuvės nuorodą ir ekrano nuotraukas."),
        p("Seed scenarijus sukuria lenteles nuo nulio, įkelia žaidimus, automatiškai išskaido žanrus, suformuoja N:M ryšius ir sukuria pradinius atsiliepimų įrašus."),
        h("1.2.1. Duomenų objektai", HeadingLevel.HEADING_3),
        p("Sistemoje naudojami keli tarpusavyje susiję duomenų objektai: Game, Screenshot, Genre ir Review. Kiekvienas objektas turi aiškiai apibrėžtą atsakomybę ir laukus."),
        p("Sudėtinis objektas Game API atsakyme pateikiamas kartu su priklausomais objektais: žanrų sąrašu, nuotraukų kolekcija ir atsiliepimais. Tai leidžia front-end sluoksniui vienu užklausos kvietimu gauti visą reikalingą informaciją."),
        p("Realizacijos vieta: backend/app.js, backend/seed.js"),
        h("1.2.2. Duomenų struktūros", HeadingLevel.HEADING_3),
        p("Naudojamos duomenų struktūros: masyvai (sąrašams ir API rezultatams), Map (žanrų identifikatorių kešavimui seed procese), objektai (DTO formatai), SQL rezultatų rinkiniai. Struktūrų parinkimas pagrįstas tuo, kad jos leidžia efektyviai atlikti tiek eilutinius veiksmus (atvaizdavimą), tiek transformacijas (filtravimą, agregavimą)."),
        p("Papildomai realizuotos pagalbinės kolekcijų funkcijos, kurios suteikia aiškų algoritmo sluoksnį nepriklausomą nuo API maršrutų."),
        p("Realizacijos vieta: backend/utils/collectionUtils.js, frontend/app.js"),
        h("1.3. Programinis projektas", HeadingLevel.HEADING_2),
        p("Programinis projektas realizuotas trijų sluoksnių principu: pateikimo sluoksnis (frontend), verslo logikos ir duomenų prieigos sluoksnis (backend API), bei duomenų saugojimo sluoksnis (MySQL)."),
        p("Naudotos technologijos: Node.js, Express, mysql2, HTML5, CSS3, JavaScript, Docker Compose, Jest, Supertest."),
        p("Architektūrinis modelis: klientas siunčia HTTP užklausas į REST API; API vykdo validaciją, SQL užklausas ir grąžina JSON atsakus; frontend atvaizduoja duomenis ir pateikia interaktyvų valdymą."),
        p("Realizacijos vieta: frontend/*, backend/app.js, backend/server.js, docker-compose.yml"),
        h("1.4. Projektavimo šablonai", HeadingLevel.HEADING_2),
        p("Projektuojant sistemą taikyti keli projektavimo šablonų principai. Repository-like požiūris naudojamas duomenų prieigos operacijoms centralizuoti API sluoksnyje. Strategy-like principas taikomas dinamiškai rūšiavimo logikai (sortClause), kai pasirenkamas vykdymo variantas pagal parametrą. Factory-like požiūris naudojamas sudėtinių atsako objektų formavimui iš kelių duomenų šaltinių."),
        p("Šie sprendimai didina kodo skaitomumą, sumažina dubliavimą ir palengvina plėtrą ateityje."),

        h("2. PROGRAMŲ SISTEMOS REALIZACIJA"),
        h("2.1. JPA realizavimas", HeadingLevel.HEADING_2),
        p("Darbo šablone numatytas JPA realizavimas Java technologijoje. Kadangi šis projektas vykdomas Node.js aplinkoje, panaudotas lygiavertis duomenų prieigos sprendimas su mysql2 biblioteka ir parametrizuotomis SQL užklausomis."),
        p("Įgyvendintos pilnos CRUD operacijos žaidimams ir atsiliepimams: kūrimas, skaitymas, atnaujinimas ir trynimas. Užklausos vykdomos naudojant connection pool, kas užtikrina efektyvų DB prisijungimų valdymą."),
        p("Realizacijos vieta: backend/app.js"),
        h("2.2. DB užklausos", HeadingLevel.HEADING_2),
        p("Realizuotos tiek bazinės, tiek sudėtinės SQL užklausos. Sudėtinėse užklausose naudojami JOIN ryšiai tarp kelių lentelių, agregavimo funkcijos (AVG), tekstinis grupavimas (GROUP_CONCAT), bei filtravimo sąlygos su keliais parametrais."),
        p("Svarbiausi scenarijai: /api/games (agreguotas sąrašas su žanrais ir vidutiniu vertinimu), /api/games/search (dinaminė paieška ir filtravimas), /api/games/:slug (detalus sudėtinis objektas)."),
        p("Realizacijos vieta: backend/app.js"),
        h("2.3. Algoritmai", HeadingLevel.HEADING_2),
        p("Algoritmų posistemyje realizuotos trys operacijos: paieška kolekcijoje pagal pavadinimą, filtravimas pagal žanrą ir rūšiavimas pagal metacritic įvertinimą. Algoritmai realizuoti kaip atskiros funkcijos, todėl yra lengvai testuojami ir panaudojami keliose sistemos vietose."),
        p("Papildomai algoritmai naudojami ir naudotojo sąsajoje, kur vykdomas dinaminis rezultatų atnaujinimas pagal įvestus kriterijus."),
        p("Realizacijos vieta: backend/utils/collectionUtils.js"),
        h("2.4. Grafinė naudotojo sąsaja", HeadingLevel.HEADING_2),
        p("Sukurta sudėtinė web grafinė naudotojo sąsaja, kurią sudaro pagrindinis žaidimų katalogo puslapis ir detalus žaidimo puslapis. Pagrindiniame lange naudotojas gali atlikti paiešką, filtravimą pagal žanrą, rūšiavimą pagal kriterijus ir peržiūrėti pagrindinius žaidimo rodiklius."),
        p("Detaliame lange pateikiama pilna žaidimo informacija, nuotraukų galerija ir atsiliepimų forma, leidžianti manipuliuoti duomenimis (kurti naują atsiliepimą). Tai atitinka GUI reikalavimą ne tik atvaizduoti, bet ir valdyti informaciją."),
        p("Realizacijos vieta: frontend/index.html, frontend/app.js, frontend/games/game.html, frontend/style.css"),

        h("3. PROGRAMŲ SISTEMOS KOKYBĖS UŽTIKRINIMAS"),
        h("3.1. Testavimas", HeadingLevel.HEADING_2),
        p("Sistemos kokybei užtikrinti parengti automatiniai testai su Jest ir Supertest. Testuojami du lygiai: API (integraciniai testai) ir algoritmų funkcijos (unit testai)."),
        p("Testavimo rinkinyje naudojami keli assert metodai: toBe, toEqual, toHaveLength, toThrow, toMatch, toBeGreaterThanOrEqual. Taip pat taikomi skirtingi testavimo scenarijai: parametrizuoti testai (test.each), išimčių testavimas (invalid input), ir našumo patikra (performance sanity)."),
        p("Testų anotacijų/kategorijų analogai: describe, test, test.each, afterAll."),
        p("Realizacijos vieta: backend/tests/api.test.js, backend/tests/collectionUtils.test.js"),
        h("3.2. Kodo versijų kontrolė", HeadingLevel.HEADING_2),
        p("Projektas valdomas naudojant Git versijų kontrolės sistemą. Rekomenduojama laikytis kassavaitinių tarpinių pateikimų praktikos, commit žinutėse nurodant aiškų pakeitimų tikslą (pvz., DB schema, API funkcionalumas, testai)."),
        p("Versijų kontrolės taikymas leidžia atsekti pakeitimų istoriją, valdyti riziką ir užtikrinti tvarkingą projekto evoliuciją."),

        h("IŠVADOS"),
        p("1. Suprojektuota ir realizuota vientisa taikomoji sistema su aiškia kliento-serverio architektūra, reliacine duomenų baze ir REST API sluoksniu."),
        p("2. Įgyvendinta išplėstinė duomenų bazės schema (5 lentelės) su kelių tipų ryšiais, pilnomis CRUD operacijomis ir sudėtinėmis SQL užklausomis."),
        p("3. Realizuoti paieškos, filtravimo ir rūšiavimo algoritmai, kurie praktiškai pritaikyti sistemos funkcionalume."),
        p("4. Sukurta sudėtinė web naudotojo sąsaja, leidžianti ne tik peržiūrėti, bet ir valdyti duomenis."),
        p("5. Parengtas automatinio testavimo rinkinys bei metodinis pagrindas, atitinkantis kursinio darbo kokybės užtikrinimo kryptį."),

        h("LITERATŪROS IR KITŲ INFORMACIJOS ŠALTINIŲ SĄRAŠAS"),
        p("1. Node.js Documentation. https://nodejs.org/docs/latest/api/"),
        p("2. Express.js Documentation. https://expressjs.com/"),
        p("3. MySQL 8.0 Reference Manual. https://dev.mysql.com/doc/refman/8.0/en/"),
        p("4. mysql2 NPM package documentation. https://www.npmjs.com/package/mysql2"),
        p("5. Docker Compose Documentation. https://docs.docker.com/compose/"),
        p("6. Jest Documentation. https://jestjs.io/docs/getting-started"),
        p("7. Supertest Documentation. https://www.npmjs.com/package/supertest"),
        p("8. MDN Web Docs (Fetch API). https://developer.mozilla.org/docs/Web/API/Fetch_API"),
        p("9. REST API Design Best Practices. https://restfulapi.net/"),
        p("10. Refactoring Guru – Design Patterns. https://refactoring.guru/design-patterns"),
        p("11. Date, C. J. An Introduction to Database Systems. Addison-Wesley."),
        p("12. Fowler, M. Patterns of Enterprise Application Architecture. Addison-Wesley."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = path.join(__dirname, "..", "Kursinis_darbas_ataskaita_pilna.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`Created: ${outPath}`);
});
