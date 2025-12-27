/**
 * add-faq-to-local.cjs
 * Lägger till FAQ-data i den lokala cms-content-data.json
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'cms-content-data.json');
const data = require(dataPath);

// FAQ Data - komprimerade versioner
const FAQ_EN = [
    ["What's the easiest way to get to you in Råstrand, Lapland?", "The distance from Malmö is about 1500 km. The fastest way is by plane - we pick up guests at Skellefteå, Luleå or Lycksele airport."],
    ["How do I fly to you?", "Fly to Arlanda in Stockholm, then take domestic flight with Amapola to Lycksele. Transfer is included in winter package."],
    ["Can I drive my own car to you?", "Yes, but make sure you have good winter tires. From Stockholm to Råstrand takes about 9-10 hours."],
    ["Are snowmobile clothes, boots, and helmets included?", "Yes, we provide all outerwear. You wear thermal underwear underneath."],
    ["What clothes should I bring?", "Pack thermal underwear, sweater, warm socks, winter jacket, winter boots, hat, scarf, gloves, sunglasses and swimwear."],
    ["Is there anything I don't need to bring?", "We provide bed linen, towels, bathrobes and slippers. Coffee, tea, water and juice are included."],
    ["What is not included in the full board?", "Alcoholic beverages are not included. Bring cash if you want to buy any."],
    ["Do I need extra insurance?", "Yes, buy travel insurance that covers adventure activities and check that your health insurance is valid abroad."],
    ["Do I need a special license for snowmobiles?", "No, a regular driver's license is enough. You always drive with our guide."],
    ["Can I use foreign currency in Sweden?", "No, you need Swedish kronor (SEK). Most stores accept VISA and Mastercard."]
];

const FAQ_SV = [
    ["Hur tar jag mig enklast till er i Råstrand?", "Avståndet från Malmö är ca 1500 km. Snabbast är flyg - vi hämtar gäster på Skellefteå, Luleå eller Lycksele flygplats."],
    ["Hur flyger jag enklast till er?", "Flyg till Arlanda, ta sedan inrikesflyg med Amapola till Lycksele. Transfer ingår i vinterpaketet."],
    ["Kan jag köra egen bil?", "Ja, men ha bra vinterdäck. Från Stockholm tar det 9-10 timmar."],
    ["Ingår snöskoterkläder?", "Ja, vi tillhandahåller ytterkläderna. Du bär termounderkläder under."],
    ["Vilka kläder ska jag ta med?", "Packa termounderkläder, tröja, varma strumpor, vinterjacka, kängor, mössa, halsduk, handskar, solglasögon och badkläder."],
    ["Vad behöver jag inte ta med?", "Vi står för sängkläder, handdukar, badrockar och tofflor. Kaffe, te, vatten och juice ingår."],
    ["Vad ingår inte i helpensionen?", "Alkohol ingår inte. Ta med kontanter om du vill köpa."],
    ["Behöver jag extra försäkring?", "Ja, köp reseförsäkring som täcker äventyrsaktiviteter."],
    ["Behöver jag speciellt körkort för snöskoter?", "Nej, vanligt körkort räcker. Du kör alltid med vår guide."],
    ["Kan jag använda utländsk valuta?", "Nej, du behöver svenska kronor. De flesta butiker tar VISA och Mastercard."]
];

const FAQ_DE = [
    ["Wie komme ich am einfachsten zu euch nach Råstrand?", "Die Entfernung von Malmö beträgt etwa 1500 km. Am schnellsten geht es mit dem Flugzeug - wir holen Gäste an den Flughäfen Skellefteå, Luleå oder Lycksele ab."],
    ["Wie fliege ich am einfachsten zu euch?", "Fliegen Sie nach Arlanda in Stockholm, dann Inlandsflug mit Amapola nach Lycksele. Transfer ist im Winterpaket enthalten."],
    ["Kann ich mit dem eigenen Auto kommen?", "Ja, aber achten Sie auf gute Winterreifen. Von Stockholm nach Råstrand dauert es etwa 9-10 Stunden."],
    ["Sind Schneemobilkleidung, Stiefel und Helme inklusive?", "Ja, wir stellen alle Oberbekleidung zur Verfügung. Sie tragen Thermounterwäsche darunter."],
    ["Welche Kleidung sollte ich mitbringen?", "Packen Sie Thermounterwäsche, Pullover, warme Socken, Winterjacke, Winterstiefel, Mütze, Schal, Handschuhe, Sonnenbrille und Badekleidung ein."],
    ["Gibt es etwas, das ich nicht mitbringen muss?", "Wir stellen Bettwäsche, Handtücher, Bademäntel und Hausschuhe zur Verfügung. Kaffee, Tee, Wasser und Saft sind inklusive."],
    ["Was ist nicht in der Vollpension enthalten?", "Alkoholische Getränke sind nicht enthalten. Bringen Sie Bargeld mit, wenn Sie welche kaufen möchten."],
    ["Brauche ich eine zusätzliche Versicherung?", "Ja, kaufen Sie eine Reiseversicherung, die Abenteueraktivitäten abdeckt."],
    ["Brauche ich einen speziellen Führerschein für Schneemobile?", "Nein, ein normaler Führerschein reicht aus. Sie fahren immer mit unserem Guide."],
    ["Kann ich ausländische Währung in Schweden verwenden?", "Nein, Sie brauchen Schwedische Kronen (SEK). Die meisten Geschäfte akzeptieren VISA und Mastercard."]
];

const FAQ_PL = [
    ["Jak najłatwiej dostać się do Was w Råstrand?", "Odległość z Malmö wynosi około 1500 km. Najszybciej samolotem - odbieramy gości z lotnisk Skellefteå, Luleå lub Lycksele."],
    ["Jak najłatwiej do Was dolecieć?", "Lećcie do Arlanda w Sztokholmie, potem lot krajowy Amapola do Lycksele. Transfer jest wliczony w pakiet zimowy."],
    ["Czy mogę przyjechać własnym samochodem?", "Tak, ale upewnij się, że masz dobre opony zimowe. Ze Sztokholmu do Råstrand zajmuje około 9-10 godzin."],
    ["Czy ubrania na skuter śnieżny są wliczone?", "Tak, zapewniamy całą odzież wierzchnią. Nosisz pod spodem bieliznę termiczną."],
    ["Jakie ubrania powinienem zabrać?", "Spakuj bieliznę termiczną, sweter, ciepłe skarpetki, kurtkę zimową, buty zimowe, czapkę, szalik, rękawiczki, okulary przeciwsłoneczne i strój kąpielowy."],
    ["Czy jest coś, czego nie muszę zabierać?", "Zapewniamy pościel, ręczniki, szlafroki i kapcie. Kawa, herbata, woda i sok są wliczone."],
    ["Co nie jest wliczone w pełne wyżywienie?", "Napoje alkoholowe nie są wliczone. Zabierz gotówkę, jeśli chcesz je kupić."],
    ["Czy potrzebuję dodatkowego ubezpieczenia?", "Tak, kup ubezpieczenie podróżne obejmujące sporty przygodowe."],
    ["Czy potrzebuję specjalnego prawa jazdy na skutery śnieżne?", "Nie, zwykłe prawo jazdy wystarczy. Zawsze jeździsz z naszym przewodnikiem."],
    ["Czy mogę używać obcej waluty w Szwecji?", "Nie, potrzebujesz koron szwedzkich (SEK). Większość sklepów akceptuje VISA i Mastercard."]
];

// Säkerställ strukturen finns
if (!data.content.contact) data.content.contact = {};
if (!data.content.contact.faq) data.content.contact.faq = {};

// Lägg till FAQ-fält
for (let i = 0; i < 10; i++) {
    const num = i + 1;

    data.content.contact.faq[`faq.item${num}.question`] = {
        en: FAQ_EN[i][0],
        sv: FAQ_SV[i][0],
        de: FAQ_DE[i][0],
        pl: FAQ_PL[i][0]
    };

    data.content.contact.faq[`faq.item${num}.answer`] = {
        en: FAQ_EN[i][1],
        sv: FAQ_SV[i][1],
        de: FAQ_DE[i][1],
        pl: FAQ_PL[i][1]
    };
}

// Spara
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ FAQ-data tillagd i cms-content-data.json!');
console.log('   Lade till 20 nya fält (10 frågor + 10 svar)');
console.log('   Alla 4 språk: EN, SV, DE, PL');
