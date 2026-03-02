import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Header,
  Footer,
  AlignmentType,
  BorderStyle,
} from "docx";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename2 = fileURLToPath(import.meta.url);
const __dirname2 = path.dirname(__filename2);

const logoPath = path.join(__dirname2, "..", "attached_assets", "logo_citanje_tr_1771366023473.png");
const logoBuffer = fs.readFileSync(logoPath);
const outputDir = path.join(__dirname2, "..", "public", "documents");
fs.mkdirSync(outputDir, { recursive: true });

const primaryColor = "FF861C";
const darkColor = "333333";
const grayColor = "666666";
const lightGray = "AAAAAA";

function createHeader(): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: { width: 60, height: 60 },
            type: "png",
          }),
          new TextRun({ text: "  ", size: 28 }),
          new TextRun({
            text: "\u010Citanje.ba",
            bold: true,
            size: 32,
            color: primaryColor,
            font: "Calibri",
          }),
          new TextRun({
            text: "  |  Platforma za unaprje\u0111enje \u010Ditanja",
            size: 22,
            color: grayColor,
            font: "Calibri",
          }),
        ],
        alignment: AlignmentType.LEFT,
        spacing: { after: 100 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 2, color: primaryColor },
        },
      }),
    ],
  });
}

function createFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        border: {
          top: { style: BorderStyle.SINGLE, size: 1, color: lightGray },
        },
        spacing: { before: 100 },
        children: [
          new TextRun({
            text: "\u010Citanje.ba  |  info@citanje.ba  |  www.citanje.ba",
            size: 16,
            color: grayColor,
            font: "Calibri",
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
  });
}

function p(
  text: string,
  opts: {
    bold?: boolean;
    size?: number;
    color?: string;
    spacing?: number;
    italic?: boolean;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
  } = {}
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: opts.bold ?? false,
        italic: opts.italic ?? false,
        size: opts.size ?? 22,
        color: opts.color ?? darkColor,
        font: "Calibri",
      }),
    ],
    alignment: opts.alignment ?? AlignmentType.JUSTIFIED,
    spacing: { after: opts.spacing ?? 150 },
  });
}

function heading(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        color: primaryColor,
        font: "Calibri",
      }),
    ],
    spacing: { before: 300, after: 150 },
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: "\u2022  " + text,
        size: 22,
        color: darkColor,
        font: "Calibri",
      }),
    ],
    spacing: { after: 80 },
    indent: { left: 400 },
  });
}

function emptyLine(): Paragraph {
  return new Paragraph({ children: [], spacing: { after: 100 } });
}

function signatureBlock(): Paragraph[] {
  return [
    emptyLine(),
    p("S po\u0161tovanjem,", { spacing: 50 }),
    emptyLine(),
    p("Tim \u010Citanje.ba", { bold: true }),
    p("info@citanje.ba  |  www.citanje.ba", { color: grayColor, size: 20 }),
  ];
}

function dateBlock(): Paragraph {
  const months = [
    "januar", "februar", "mart", "april", "maj", "juni",
    "juli", "august", "septembar", "oktobar", "novembar", "decembar",
  ];
  const d = new Date();
  return p("Datum: " + d.getDate() + ". " + months[d.getMonth()] + " " + d.getFullYear() + ".", {
    color: grayColor,
    size: 20,
    spacing: 200,
  });
}

function createDocument(sections: Paragraph[]): Document {
  return new Document({
    sections: [
      {
        headers: { default: createHeader() },
        footers: { default: createFooter() },
        properties: {
          page: {
            margin: { top: 1800, bottom: 1200, left: 1200, right: 1200 },
          },
        },
        children: sections,
      },
    ],
  });
}

function letterPojedinci(): Document {
  return createDocument([
    dateBlock(),
    p("Po\u0161tovani,", { bold: true, size: 24, spacing: 200 }),
    p("Obra\u0107amo Vam se s pozivom da postanete dio projekta \u010Citanje.ba \u2014 digitalne platforme koja poma\u017Ee djeci, mladima i odraslima da zavole \u010Ditanje, unaprijede pismenost i razviju naviku koja mijenja \u017Eivote."),
    heading("\u0160ta je \u010Citanje.ba?"),
    p("\u010Citanje.ba je besplatna edukativna platforma koja povezuje u\u010Denike, \u0161kole, roditelje i biblioteke u jedinstven sistem za pra\u0107enje i poticanje \u010Ditanja. Platforma nudi:"),
    bullet("Biblioteku sa vi\u0161e od 600 knjiga prilago\u0111enih svim uzrastima"),
    bullet("Interaktivne kvizove koji testiraju razumijevanje pro\u010Ditanog"),
    bullet("Sistem bodovanja i zna\u010Dki koji motivi\u0161e \u010Ditaoce"),
    bullet("Tabele rang-liste koje podsti\u010Du zdravo takmi\u010Denje"),
    bullet("U\u010Diteljske alate za pra\u0107enje napretka u\u010Denika"),
    heading("Za\u0161to je Va\u0161a podr\u0161ka va\u017Ena?"),
    p("Pismenost je temelj svakog uspjeha. Podr\u0161kom ovom projektu direktno poma\u017Eete promociju \u010Ditanja i pismenosti u na\u0161oj zajednici. Va\u0161 doprinos, bez obzira na veli\u010Dinu, \u010Dini dobro djelo hvale vrijedno \u2014 poma\u017Eete djeci da otkriju \u010Daroliju knjige."),
    heading("\u0160ta nudimo zauzvrat?"),
    bullet("Isticanje Va\u0161eg imena/logotipa na platformi kao partnera i podr\u017Eavaoca"),
    bullet("Javno priznanje u svim promotivnim materijalima i takmi\u010Denjima"),
    bullet("Certifikat podr\u0161ke projektu promocije pismenosti"),
    p("Pozivamo Vas da svojom podr\u0161kom budete dio pri\u010De koja mijenja budu\u0107nost na\u0161e djece. Za sve detalje, slobodno nas kontaktirajte."),
    ...signatureBlock(),
  ]);
}

function letterSkole(): Document {
  return createDocument([
    dateBlock(),
    p("Po\u0161tovani direktore / direktorice,", { bold: true, size: 24, spacing: 200 }),
    p("Obra\u0107amo Vam se s prijedlogom za saradnju koja \u0107e direktno unaprijediti \u010Ditala\u010Dke navike Va\u0161ih u\u010Denika i podr\u017Eati nastavni proces u Va\u0161oj \u0161koli."),
    heading("\u0160ta je \u010Citanje.ba?"),
    p("\u010Citanje.ba je digitalna edukativna platforma za unaprje\u0111enje \u010Ditanja, namijenjena \u0161kolama, u\u010Diteljima, u\u010Denicima i roditeljima. Platforma omogu\u0107ava:"),
    bullet("Pristup biblioteci sa preko 600 knjiga za sve uzraste (od 1. razreda do srednje \u0161kole)"),
    bullet("Interaktivne kvizove vezane za lektiru i vannastavno \u0161tivo"),
    bullet("U\u010Diteljski dashboard za pra\u0107enje napretka u\u010Denika u realnom vremenu"),
    bullet("Kreiranje u\u010Deni\u010Dkih ra\u010Duna od strane u\u010Ditelja"),
    bullet("Tabele rang-liste po razredu, \u0161koli i globalno"),
    bullet("Grafi\u010Dke prikaze aktivnosti i uspjeha u\u010Denika"),
    heading("Kako Va\u0161a \u0161kola mo\u017Ee podr\u017Eati projekat?"),
    bullet("Promocijom platforme me\u0111u u\u010Denicima i roditeljima"),
    bullet("Uklju\u010Divanjem platforme u nastavni plan kao dopunski alat"),
    bullet("Finansijskom ili materijalnom podr\u0161kom za odr\u017Eavanje platforme"),
    bullet("Organizacijom \u010Ditala\u010Dkih takmi\u010Denja putem platforme"),
    heading("\u0160ta Va\u0161a \u0161kola dobija?"),
    bullet("Besplatan pristup za sve u\u010Denike i u\u010Ditelje"),
    bullet("Isticanje \u0161kole kao partnera na platformi"),
    bullet("Javno priznanje u svim takmi\u010Denjima i promotivnim aktivnostima"),
    bullet("Alate za unaprje\u0111enje pismenosti i podr\u0161ka obrazovnom procesu"),
    p("Zajedni\u010Dki mo\u017Eemo u\u010Diniti da \u010Ditanje ponovo postane omiljena aktivnost na\u0161ih u\u010Denika. Radujemo se Va\u0161em odgovoru."),
    ...signatureBlock(),
  ]);
}

function letterFirme(): Document {
  return createDocument([
    dateBlock(),
    p("Po\u0161tovani,", { bold: true, size: 24, spacing: 200 }),
    p("Obra\u0107amo Vam se s prijedlogom za partnerstvo koje spaja dru\u0161tvenu odgovornost Va\u0161e kompanije s konkretnim doprinosom obrazovanju i pismenosti u Bosni i Hercegovini."),
    heading("O projektu \u010Citanje.ba"),
    p("\u010Citanje.ba je edukativna digitalna platforma koja motivi\u0161e djecu, mlade i odrasle da \u010Ditaju vi\u0161e i bolje. Sa preko 600 knjiga, interaktivnim kvizovima i sistemom za pra\u0107enje napretka, platforma ve\u0107 okuplja u\u010Denike, \u0161kole i porodice \u0161irom regije."),
    heading("Za\u0161to podr\u017Eati \u010Citanje.ba?"),
    bullet("Direktno poma\u017Eete promociju pismenosti kod djece i mladih"),
    bullet("Podr\u017Eavate u\u010Denike u \u0161kolama \u2014 svaki kviz, svaki bod, svaka pro\u010Ditana knjiga je Va\u0161 doprinos"),
    bullet("\u010Cinite dobro djelo hvale vrijedno koje ima mjerljiv uticaj na zajednicu"),
    bullet("Va\u0161a kompanija se pozicionira kao socijalno odgovoran partner u obrazovanju"),
    heading("Beneficije za Va\u0161u kompaniju"),
    bullet("Logo i naziv Va\u0161e kompanije istaknut na platformi u sekciji \"Na\u0161i partneri\""),
    bullet("Isticanje Va\u0161e podr\u0161ke na svim javnim takmi\u010Denjima u \u010Ditanju"),
    bullet("Spominjanje u svim promotivnim materijalima projekta"),
    bullet("Mogu\u0107nost brendiranja \u010Ditala\u010Dkih izazova (npr. \"\u010Citala\u010Dki izazov uz [Va\u0161a kompanija]\")"),
    bullet("Certifikat o podr\u0161ci projektu promocije pismenosti"),
    heading("Oblici podr\u0161ke"),
    bullet("Finansijska podr\u0161ka za odr\u017Eavanje i razvoj platforme"),
    bullet("Sponzorstvo nagrada u \u010Ditala\u010Dkim takmi\u010Denjima"),
    bullet("Materijalna podr\u0161ka (knjige, oprema, promotivni materijali)"),
    p("Vjerujemo da je ulaganje u pismenost jedno od najvrijednijih ulaganja u budu\u0107nost. Radujemo se prilici da razgovaramo o mogu\u0107nostima saradnje."),
    ...signatureBlock(),
  ]);
}

function letterOpcine(): Document {
  return createDocument([
    dateBlock(),
    p("Po\u0161tovani na\u010Delni\u010De / na\u010Delnice,", { bold: true, size: 24, spacing: 200 }),
    p("Obra\u0107amo Vam se s prijedlogom za podr\u0161ku projektu \u010Citanje.ba \u2014 digitalnoj platformi za unaprje\u0111enje \u010Ditanja i pismenosti kod djece, mladih i odraslih na podru\u010Dju Va\u0161e op\u0107ine."),
    heading("O projektu"),
    p("\u010Citanje.ba je besplatna edukativna platforma koja okuplja \u0161kole, u\u010Denike, roditelje i biblioteke u zajedni\u010Dkoj misiji \u2014 da \u010Ditanje ponovo postane omiljena aktivnost. Platforma nudi:"),
    bullet("Biblioteku sa preko 600 knjiga za sve uzraste"),
    bullet("Interaktivne kvizove koji poti\u010Du razumijevanje pro\u010Ditanog"),
    bullet("Alate za u\u010Ditelje za pra\u0107enje napretka u\u010Denika"),
    bullet("Rang-liste i takmi\u010Denja koja motivi\u0161u \u010Ditaoce"),
    bullet("Porodi\u010Dno uklju\u010Divanje roditelja u \u010Ditala\u010Dki proces"),
    heading("Zna\u010Daj za Va\u0161u op\u0107inu"),
    bullet("Direktna podr\u0161ka \u0161kolama i u\u010Denicima na Va\u0161em podru\u010Dju"),
    bullet("Promocija pismenosti kao klju\u010Dne kompetencije za budu\u0107nost"),
    bullet("Mogu\u0107nost organizacije op\u0107inskih \u010Ditala\u010Dkih takmi\u010Denja"),
    bullet("Unaprje\u0111enje obrazovne infrastrukture bez velikih ulaganja"),
    heading("Kako op\u0107ina mo\u017Ee pomo\u0107i?"),
    bullet("Finansijskom podr\u0161kom za razvoj i odr\u017Eavanje platforme"),
    bullet("Promocijom platforme u \u0161kolama na podru\u010Dju op\u0107ine"),
    bullet("Organizacijom \u010Ditala\u010Dkih takmi\u010Denja na nivou op\u0107ine"),
    bullet("Podr\u0161kom za nabavku knjiga i nagrada za takmi\u010Denja"),
    heading("\u0160ta op\u0107ina dobija?"),
    bullet("Besplatan pristup platformi za sve \u0161kole na podru\u010Dju op\u0107ine"),
    bullet("Isticanje op\u0107ine kao partnera na platformi i u promotivnim materijalima"),
    bullet("Javno priznanje u svim takmi\u010Denjima i promocijama"),
    bullet("Statistike o \u010Ditala\u010Dkim aktivnostima u\u010Denika na podru\u010Dju op\u0107ine"),
    p("Ulaganje u pismenost je ulaganje u budu\u0107nost zajednice. Radujemo se mogu\u0107nosti saradnje."),
    ...signatureBlock(),
  ]);
}

function letterIzdavaci(): Document {
  return createDocument([
    dateBlock(),
    p("Po\u0161tovani,", { bold: true, size: 24, spacing: 200 }),
    p("Obra\u0107amo Vam se s prijedlogom za saradnju koja \u0107e Va\u0161e knjige dovesti do novih \u010Ditalaca i podstaknuti kulturu \u010Ditanja u regiji."),
    heading("O platformi \u010Citanje.ba"),
    p("\u010Citanje.ba je edukativna platforma sa preko 600 knjiga i rastu\u0107om bazom korisnika \u2014 u\u010Denika, u\u010Ditelja, roditelja i samostalnih \u010Ditalaca. Platforma motivi\u0161e korisnike da \u010Ditaju knjige i rje\u0161avaju interaktivne kvizove, \u010Dime se direktno podsti\u010De prodaja i \u010Ditanost knjiga."),
    heading("Prijedlog saradnje"),
    bullet("Uvr\u0161tavanje Va\u0161ih naslova u biblioteku platforme sa kvizovima"),
    bullet("Va\u0161 logo i link na Va\u0161u web stranicu istaknut na platformi"),
    bullet("Promocija Va\u0161ih naslova kroz preporuke, prijedloge sedmice i \u010Ditala\u010Dke izazove"),
    heading("Podr\u0161ka u literaturi"),
    p("Posebno cijenimo podr\u0161ku u obliku literature koja je aktuelna i tra\u017Eena. Knjige koje donirate ili ustupite koristit \u0107e se kao nagrade u \u010Ditala\u010Dkim takmi\u010Denjima \u2014 \u010Dime se dodatno promovi\u0161u Va\u0161i naslovi i direktno sti\u017Eu u ruke \u010Ditalaca."),
    heading("Beneficije za Va\u0161u izdava\u010Dku ku\u0107u"),
    bullet("Direktna promocija Va\u0161ih knjiga pred ciljnom publikom (u\u010Denici, \u0161kole, roditelji)"),
    bullet("Logo i naziv u sekciji \"Na\u0161i partneri\" na platformi"),
    bullet("Isticanje podr\u0161ke u svim javnim takmi\u010Denjima i promocijama"),
    bullet("Statistike o \u010Ditanosti i popularnosti Va\u0161ih naslova"),
    bullet("Povezivanje kvizova sa Va\u0161im knjigama \u2014 svaka knjiga koju u\u010Denik pro\u010Dita i polo\u017Ei kviz za nju je potencijalna nova prodaja"),
    p("Zajedno mo\u017Eemo u\u010Diniti da knjige do\u0111u do onih kojima su najpotrebnije \u2014 do djece i mladih. Radujemo se Va\u0161em odgovoru."),
    ...signatureBlock(),
  ]);
}

function letterKnjizare(): Document {
  return createDocument([
    dateBlock(),
    p("Po\u0161tovani,", { bold: true, size: 24, spacing: 200 }),
    p("Obra\u0107amo Vam se s prijedlogom za partnerstvo koje \u0107e Va\u0161u knji\u017Earu direktno povezati s tisu\u0107ama \u010Ditalaca koji aktivno tra\u017Ee knjige."),
    heading("O platformi \u010Citanje.ba"),
    p("\u010Citanje.ba je edukativna platforma za unaprje\u0111enje \u010Ditanja sa preko 600 knjiga i rastu\u0107om bazom korisnika. U\u010Denici, roditelji i \u010Ditaoci koriste platformu da otkriju nove knjige, rje\u0161avaju kvizove i prate svoj napredak. Svaka knjiga na platformi ima stranicu s detaljima \u2014 a tu je i mjesto za Va\u0161u knji\u017Earu."),
    heading("\u0160ta nudimo Va\u0161oj knji\u017Eari?"),
    p("Knji\u017Eare i online shopovi dobijaju posebno istaknuto mjesto na platformi:"),
    bullet("Va\u0161 logo s linkom na Va\u0161 shop/knji\u017Earu na svakoj stranici knjige"),
    bullet("Sekcija \"Gdje kupiti ovu knjigu?\" \u2014 direktan link za kupovinu"),
    bullet("Isticanje u sekciji \"Na\u0161i partneri\" na naslovnoj stranici"),
    bullet("Promocija u svim javnim takmi\u010Denjima i \u010Ditala\u010Dkim izazovima"),
    heading("Podr\u0161ka u literaturi"),
    p("Posebno cijenimo podr\u0161ku u obliku knjiga koje su aktuelne i tra\u017Eene. Knjige koje donirate ili ustupite po povoljnim cijenama koristit \u0107e se kao nagrade u \u010Ditala\u010Dkim takmi\u010Denjima \u2014 uz isticanje Va\u0161e knji\u017Eare kao donatora."),
    heading("Za\u0161to \u010Citanje.ba?"),
    bullet("Direktan pristup \u010Ditaocima koji aktivno tra\u017Ee i kupuju knjige"),
    bullet("Svaki u\u010Denik koji pro\u010Dita i polo\u017Ei kviz za knjigu je potencijalni kupac"),
    bullet("Promocija pismenosti je dobro djelo koje Va\u0161u knji\u017Earu pozicionira kao partnera u obrazovanju"),
    bullet("Va\u0161a podr\u0161ka poma\u017Ee djeci da otkriju \u010Daroliju knjige"),
    p("Vjerujemo da zajedno mo\u017Eemo u\u010Diniti \u010Ditanje pristupa\u010Dnijim i popularnijim. Radujemo se saradnji."),
    ...signatureBlock(),
  ]);
}

function letterOnlineShopovi(): Document {
  return createDocument([
    dateBlock(),
    p("Po\u0161tovani,", { bold: true, size: 24, spacing: 200 }),
    p("Obra\u0107amo Vam se s prijedlogom za partnerstvo koje \u0107e Va\u0161 online shop povezati s aktivnom zajednicom \u010Ditalaca i kupaca knjiga."),
    heading("O platformi \u010Citanje.ba"),
    p("\u010Citanje.ba je digitalna edukativna platforma sa preko 600 knjiga i bazom korisnika koja svakodnevno raste. U\u010Denici, roditelji, u\u010Ditelji i samostalni \u010Ditaoci koriste platformu za otkrivanje knjiga, rje\u0161avanje kvizova i pra\u0107enje \u010Ditala\u010Dkog napretka. Platforma je idealno mjesto za promociju online prodaje knjiga."),
    heading("Posebno mjesto za Va\u0161 online shop"),
    p("Online shopovi na \u010Citanje.ba dobijaju premium poziciju:"),
    bullet("Va\u0161 logo s direktnim linkom na Va\u0161 shop \u2014 na stranici svake knjige"),
    bullet("Sekcija \"Kupi online\" sa istaknutim linkom na Va\u0161 shop"),
    bullet("Pozicija u sekciji \"Na\u0161i partneri\" na naslovnoj stranici platforme"),
    bullet("Isticanje u svim promotivnim materijalima i javnim takmi\u010Denjima"),
    bullet("Mogu\u0107nost posebnih promotivnih kodova za korisnike platforme"),
    heading("Podr\u0161ka u literaturi kao nagradni fond"),
    p("Posebno cijenimo podr\u0161ku u obliku literature \u2014 knjige koje su aktuelne i tra\u017Eene me\u0111u u\u010Denicima i \u010Ditaocima. Donirane ili ustupljene knjige koriste se kao nagrade u \u010Ditala\u010Dkim takmi\u010Denjima, uz jasno isticanje Va\u0161eg online shopa kao donatora i partnera."),
    heading("Za\u0161to je ovo vrijedna investicija?"),
    bullet("Direktan pristup ciljnoj publici \u2014 \u010Ditaocima koji aktivno tra\u017Ee i kupuju knjige"),
    bullet("Svaka knjiga na platformi = potencijalna narud\u017Eba u Va\u0161em shopu"),
    bullet("Pozicioniranje Va\u0161eg brenda uz promociju pismenosti i obrazovanja"),
    bullet("\u010Cinite dobro djelo hvale vrijedno \u2014 poma\u017Eete djeci i mladima da zavole \u010Ditanje"),
    bullet("Mjerljiv ROI \u2014 pratimo koliko korisnika klikne na link ka Va\u0161em shopu"),
    p("Zajedno mo\u017Eemo spojiti ljubav prema knjigama s pristupa\u010Dnom online kupovinom. Radujemo se prilici za razgovor o detaljima saradnje."),
    ...signatureBlock(),
  ]);
}

async function generateAll() {
  const letters: [string, () => Document][] = [
    ["a_dopis_pojedinci.docx", letterPojedinci],
    ["b_dopis_skole.docx", letterSkole],
    ["c_dopis_firme.docx", letterFirme],
    ["d_dopis_opcine.docx", letterOpcine],
    ["e_dopis_izdavacke_kuce.docx", letterIzdavaci],
    ["f_dopis_knjizare.docx", letterKnjizare],
    ["g_dopis_online_shopovi.docx", letterOnlineShopovi],
  ];

  for (const [filename, fn] of letters) {
    const doc = fn();
    const buffer = await Packer.toBuffer(doc);
    const outPath = path.join(outputDir, filename);
    fs.writeFileSync(outPath, buffer);
    console.log("Generisan: " + outPath);
  }
  console.log("\nSvi dopisi su uspjesno generirani!");
}

generateAll().catch(console.error);
