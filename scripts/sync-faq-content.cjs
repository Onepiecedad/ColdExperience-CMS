/**
 * sync-faq-content.cjs
 * Extraherar FAQ-data från JavaScript-filer och synkar till Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
    'https://hpbeqrwwcmetbjjqvzsv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA2NzMyMSwiZXhwIjoyMDgxNjQzMzIxfQ.ACnILOxFOhe2wq7P6_Bga9g-nCTK9xmEa0ZB0JNDvqM'
);

// FAQ Data - extraherat från FaqSection.js och Contact.*.js
const FAQ_DATA = {
    en: [
        {
            question: "What's the easiest way to get to you in Råstrand, Lapland?",
            answer: [
                "The distance from Malmö to our house is about 1500 km.",
                "The fastest and most convenient way is by plane. A ticket to Lapland costs barely more than two full tanks of petrol and is highly recommended.",
                "We always pick up and drop off our guests at Skellefteå, Luleå or Lycksele airport."
            ]
        },
        {
            question: "How do I fly to you?",
            answer: [
                "Depending on where you live, fly to Arlanda in Stockholm.",
                "From there, take a domestic flight with Amapola to Lycksele (100 km from us). Transfer is included in the winter package and tickets are booked at amapola.nu.",
                "You can also fly to Skellefteå or Luleå and continue by rental car. These airports are further away but tickets can sometimes be very cheap. We are happy to help you find the best options."
            ]
        },
        {
            question: "Can I drive my own car to you?",
            answer: [
                "Yes, but make sure you have good winter tires. Be careful, as there are many wild animals on the roads.",
                "From Stockholm to Råstrand, it takes about 9–10 hours by car.",
                "You can easily find Råstrand by searching for 'Cold Experience Lapland' on Google Maps."
            ]
        },
        {
            question: "Are snowmobile clothes, boots, and helmets included?",
            answer: [
                "Yes, we provide outerwear. The snowmobile clothes are warm – you wear thermal underwear and soft clothes underneath."
            ]
        },
        {
            question: "What clothes should I bring?",
            answer: [
                "We recommend you pack:",
                "1. High-quality thermal underwear",
                "2. Regular socks",
                "3. Sweater or fleece jacket",
                "4. Warm fleece pants / soft trousers",
                "5. Warm wool socks",
                "6. Winter jacket or ski suit",
                "7. Winter boots / sturdy shoes",
                "8. Hat and balaclava to wear under the helmet",
                "9. Scarf",
                "10. Good gloves",
                "11. Sunglasses or ski goggles",
                "12. Swimwear",
                "Items 6 and 7 are used outdoors when not riding a snowmobile. On snowmobile tours, you get an overall, boots, and helmet.",
                "In Sweden, people take off their shoes indoors, so feel free to bring warm slippers or thick socks for indoor use."
            ]
        },
        {
            question: "Is there anything I don't need to bring?",
            answer: [
                "We provide bed linen, towels, bathrobes, and slippers.",
                "A hairdryer is available in the bathroom.",
                "Coffee, tea, water, and juice are included in the full board."
            ]
        },
        {
            question: "What is not included in the full board?",
            answer: [
                "Alcoholic beverages are not included. Bring cash if you want to buy any."
            ]
        },
        {
            question: "Do I need extra insurance?",
            answer: [
                "Yes, buy travel insurance that covers adventure activities.",
                "Also check that your health insurance is valid abroad and bring proof of insurance."
            ]
        },
        {
            question: "Do I need a special license for snowmobiles?",
            answer: [
                "No, a regular driver's license is enough.",
                "All drivers must have their license with them. Since you always drive together with our guide, it is sufficient that the guide has all necessary permits.",
                "Also check that your passport or ID is valid."
            ]
        },
        {
            question: "Can I use foreign currency in Sweden?",
            answer: [
                "No, you need to exchange to Swedish kronor (SEK) to shop with us or in the village store.",
                "Most other stores accept VISA and Mastercard."
            ]
        }
    ],
    sv: [
        {
            question: "Hur tar jag mig enklast till er i Råstrand, Lappland?",
            answer: [
                "Avståndet från Malmö till vårt hus är cirka 1500 km.",
                "Det snabbaste och smidigaste sättet är flyg. En biljett till Lappland kostar knappt mer än två fulla tankar bensin och rekommenderas starkt.",
                "Vi hämtar och lämnar alltid våra gäster på Skellefteå, Luleå eller Lycksele flygplats."
            ]
        },
        {
            question: "Hur flyger jag enklast till er?",
            answer: [
                "Beroende på var du bor flyger du till Arlanda i Stockholm.",
                "Därifrån tar du inrikesflyg med Amapola till Lycksele (100 km från oss). Transfer ingår i vinterpaketet och biljetter bokas på amapola.nu.",
                "Du kan även flyga till Skellefteå eller Luleå och fortsätta med hyrbil. Dessa flygplatser ligger längre bort men biljetterna kan ibland vara mycket billiga. Vi hjälper dig gärna att hitta de bästa alternativen."
            ]
        },
        {
            question: "Kan jag köra egen bil till er?",
            answer: [
                "Ja, men se till att ha bra vinterdäck. Kör försiktigt då det finns många vilda djur på vägarna.",
                "Från Stockholm till Råstrand tar det 9–10 timmar med bil.",
                "Du hittar Råstrand lättast genom att söka efter 'Cold Experience Lapland' på Google Maps."
            ]
        },
        {
            question: "Ingår snöskoterkläder, kängor och hjälmar?",
            answer: [
                "Ja, vi tillhandahåller ytterkläderna. Snöskoterkläderna är varma – du bär termounderkläder och mjuka kläder under."
            ]
        },
        {
            question: "Vilka kläder ska jag ta med mig?",
            answer: [
                "Det här rekommenderar vi att du packar:",
                "1. Termounderkläder av hög kvalitet",
                "2. Vanliga strumpor",
                "3. Tröja eller fleecejacka",
                "4. Varma fleecebyxor / mjuka byxor",
                "5. Varma ullstrumpor",
                "6. Vinterjacka eller skidställ",
                "7. Vinterskor / kängor",
                "8. Mössa och balaklava att bära under hjälmen",
                "9. Halsduk",
                "10. Bra handskar",
                "11. Solglasögon eller skidglasögon",
                "12. Badkläder",
                "Punkt 6 och 7 används utomhus när du inte kör snöskoter. På snöskoterturer får du overall, skor och hjälm.",
                "I Sverige tar man av sig skorna inomhus, så ta gärna med varma tofflor eller tjocka strumpor för inomhusbruk."
            ]
        },
        {
            question: "Är det något jag inte behöver ta med?",
            answer: [
                "Vi står för sängkläder, handdukar, badrockar och tofflor.",
                "Hårtork finns i badrummet.",
                "Kaffe, te, vatten och juice ingår i helpensionen."
            ]
        },
        {
            question: "Vad ingår inte i helpensionen?",
            answer: [
                "Alkoholdrycker ingår inte. Ta med kontanter om du vill ha det."
            ]
        },
        {
            question: "Behöver jag extra försäkring?",
            answer: [
                "Ja, köp reseförsäkring som täcker äventyrsaktiviteter.",
                "Kontrollera även att din sjukförsäkring gäller utomlands och ta med bevis på försäkringen."
            ]
        },
        {
            question: "Måste jag ha särskilt körkort för snöskoter?",
            answer: [
                "Nej, vanligt körkort räcker.",
                "Alla förare måste ha körkort med sig. Eftersom du alltid kör tillsammans med vår guide är det tillräckligt att guiden har alla nödvändiga tillstånd.",
                "Kontrollera också att ditt pass eller ID är giltigt."
            ]
        },
        {
            question: "Kan jag använda utländsk valuta i Sverige?",
            answer: [
                "Nej, du behöver växla till svenska kronor (SEK) för att handla hos oss eller i byns butik.",
                "De flesta andra butiker tar VISA och Mastercard."
            ]
        }
    ],
    de: [
        {
            question: "Wie komme ich am einfachsten zu euch nach Råstrand, Lappland?",
            answer: [
                "Die Entfernung von Malmö zu unserem Haus beträgt etwa 1500 km.",
                "Der schnellste und bequemste Weg ist mit dem Flugzeug. Ein Flugticket nach Lappland kostet kaum mehr als zwei volle Tankfüllungen Benzin und wird dringend empfohlen.",
                "Wir holen unsere Gäste immer am Flughafen Skellefteå, Luleå oder Lycksele ab und bringen sie auch wieder hin."
            ]
        },
        {
            question: "Wie fliege ich am einfachsten zu euch?",
            answer: [
                "Je nachdem, wo du wohnst, fliegst du nach Arlanda in Stockholm.",
                "Von dort nimmst du einen Inlandsflug mit Amapola nach Lycksele (100 km von uns). Der Transfer ist im Winterpaket enthalten und Tickets werden auf amapola.nu gebucht.",
                "Du kannst auch nach Skellefteå oder Luleå fliegen und mit einem Mietwagen weiterfahren. Diese Flughäfen sind weiter entfernt, aber die Tickets können manchmal sehr günstig sein. Wir helfen dir gerne, die besten Optionen zu finden."
            ]
        },
        {
            question: "Kann ich mit dem eigenen Auto zu euch fahren?",
            answer: [
                "Ja, aber achte darauf, gute Winterreifen zu haben. Fahre vorsichtig, da es viele Wildtiere auf den Straßen gibt.",
                "Von Stockholm nach Råstrand dauert es etwa 9–10 Stunden mit dem Auto.",
                "Du findest Råstrand am einfachsten, indem du auf Google Maps nach 'Cold Experience Lapland' suchst."
            ]
        },
        {
            question: "Sind Schneemobilkleidung, Stiefel und Helme inklusive?",
            answer: [
                "Ja, wir stellen die Oberbekleidung zur Verfügung. Die Schneemobilkleidung ist warm – du trägst Thermounterwäsche und weiche Kleidung darunter."
            ]
        },
        {
            question: "Welche Kleidung sollte ich mitbringen?",
            answer: [
                "Wir empfehlen dir, folgendes einzupacken:",
                "1. Hochwertige Thermounterwäsche",
                "2. Normale Socken",
                "3. Pullover oder Fleecejacke",
                "4. Warme Fleecehosen / weiche Hosen",
                "5. Warme Wollsocken",
                "6. Winterjacke oder Skianzug",
                "7. Winterstiefel / robuste Schuhe",
                "8. Mütze und Sturmhaube zum Tragen unter dem Helm",
                "9. Schal",
                "10. Gute Handschuhe",
                "11. Sonnenbrille oder Skibrille",
                "12. Badekleidung",
                "Punkt 6 und 7 werden draußen verwendet, wenn du nicht Schneemobil fährst. Bei Schneemobiltouren bekommst du Overall, Schuhe und Helm.",
                "In Schweden zieht man drinnen die Schuhe aus, also nimm gerne warme Hausschuhe oder dicke Socken für drinnen mit."
            ]
        },
        {
            question: "Gibt es etwas, das ich nicht mitbringen muss?",
            answer: [
                "Wir stellen Bettwäsche, Handtücher, Bademäntel und Hausschuhe zur Verfügung.",
                "Ein Föhn ist im Badezimmer vorhanden.",
                "Kaffee, Tee, Wasser und Saft sind in der Vollpension enthalten."
            ]
        },
        {
            question: "Was ist nicht in der Vollpension enthalten?",
            answer: [
                "Alkoholische Getränke sind nicht enthalten. Bringe Bargeld mit, wenn du welche kaufen möchtest."
            ]
        },
        {
            question: "Brauche ich eine zusätzliche Versicherung?",
            answer: [
                "Ja, kaufe eine Reiseversicherung, die Abenteueraktivitäten abdeckt.",
                "Überprüfe auch, ob deine Krankenversicherung im Ausland gilt, und bringe einen Versicherungsnachweis mit."
            ]
        },
        {
            question: "Brauche ich einen speziellen Führerschein für Schneemobile?",
            answer: [
                "Nein, ein normaler Führerschein reicht aus.",
                "Alle Fahrer müssen ihren Führerschein dabei haben. Da du immer zusammen mit unserem Guide fährst, reicht es aus, dass der Guide alle notwendigen Genehmigungen hat.",
                "Überprüfe auch, ob dein Reisepass oder Ausweis gültig ist."
            ]
        },
        {
            question: "Kann ich ausländische Währung in Schweden verwenden?",
            answer: [
                "Nein, du musst in Schwedische Kronen (SEK) wechseln, um bei uns oder im Dorfladen einzukaufen.",
                "Die meisten anderen Geschäfte akzeptieren VISA und Mastercard."
            ]
        }
    ],
    pl: [
        {
            question: "Jak najłatwiej dostać się do Was w Råstrand, Laponia?",
            answer: [
                "Odległość z Malmö do naszego domu wynosi około 1500 km.",
                "Najszybciej i najwygodniej jest samolotem. Bilet do Laponii kosztuje niewiele więcej niż dwa pełne baki paliwa i jest wysoce zalecany.",
                "Zawsze odbieramy i odwozimy naszych gości na lotnisko w Skellefteå, Luleå lub Lycksele."
            ]
        },
        {
            question: "Jak najłatwiej do Was dolecieć?",
            answer: [
                "W zależności od tego, gdzie mieszkasz, lecisz do Arlanda w Sztokholmie.",
                "Stamtąd weź lot krajowy z Amapola do Lycksele (100 km od nas). Transfer jest wliczony w pakiet zimowy, a bilety rezerwujesz na amapola.nu.",
                "Możesz też polecieć do Skellefteå lub Luleå i kontynuować wynajętym samochodem. Te lotniska są dalej, ale bilety czasem bywają bardzo tanie. Chętnie pomożemy Ci znaleźć najlepsze opcje."
            ]
        },
        {
            question: "Czy mogę przyjechać własnym samochodem?",
            answer: [
                "Tak, ale upewnij się, że masz dobre opony zimowe. Jedź ostrożnie, ponieważ na drogach jest wiele dzikich zwierząt.",
                "Ze Sztokholmu do Råstrand podróż zajmuje około 9–10 godzin samochodem.",
                "Råstrand łatwo znajdziesz, wyszukując 'Cold Experience Lapland' w Google Maps."
            ]
        },
        {
            question: "Czy ubrania na skuter śnieżny, buty i kaski są wliczone?",
            answer: [
                "Tak, zapewniamy odzież wierzchnią. Ubrania na skuter śnieżny są ciepłe – nosisz pod nimi bieliznę termiczną i miękkie ubrania."
            ]
        },
        {
            question: "Jakie ubrania powinienem zabrać?",
            answer: [
                "Zalecamy spakować:",
                "1. Wysokiej jakości bieliznę termiczną",
                "2. Zwykłe skarpetki",
                "3. Sweter lub polar",
                "4. Ciepłe spodnie polarowe / miękkie spodnie",
                "5. Ciepłe skarpetki wełniane",
                "6. Kurtkę zimową lub kombinezon narciarski",
                "7. Buty zimowe / solidne obuwie",
                "8. Czapkę i kominiarkę do noszenia pod kaskiem",
                "9. Szalik",
                "10. Dobre rękawiczki",
                "11. Okulary przeciwsłoneczne lub gogle narciarskie",
                "12. Strój kąpielowy",
                "Punkty 6 i 7 są używane na zewnątrz, gdy nie jeździsz skuterem śnieżnym. Na wycieczkach skuterem śnieżnym dostajesz kombinezon, buty i kask.",
                "W Szwecji ludzie zdejmują buty w pomieszczeniach, więc weź ciepłe kapcie lub grube skarpetki do użytku wewnętrznego."
            ]
        },
        {
            question: "Czy jest coś, czego nie muszę zabierać?",
            answer: [
                "Zapewniamy pościel, ręczniki, szlafroki i kapcie.",
                "W łazience jest suszarka do włosów.",
                "Kawa, herbata, woda i sok są wliczone w pełne wyżywienie."
            ]
        },
        {
            question: "Co nie jest wliczone w pełne wyżywienie?",
            answer: [
                "Napoje alkoholowe nie są wliczone. Weź gotówkę, jeśli chcesz je kupić."
            ]
        },
        {
            question: "Czy potrzebuję dodatkowego ubezpieczenia?",
            answer: [
                "Tak, kup ubezpieczenie podróżne obejmujące sporty przygodowe.",
                "Sprawdź również, czy Twoje ubezpieczenie zdrowotne jest ważne za granicą i weź ze sobą dowód ubezpieczenia."
            ]
        },
        {
            question: "Czy potrzebuję specjalnego prawa jazdy na skutery śnieżne?",
            answer: [
                "Nie, zwykłe prawo jazdy wystarczy.",
                "Wszyscy kierowcy muszą mieć przy sobie prawo jazdy. Ponieważ zawsze jeździsz razem z naszym przewodnikiem, wystarczy, że przewodnik ma wszystkie niezbędne pozwolenia.",
                "Sprawdź również, czy Twój paszport lub dowód osobisty jest ważny."
            ]
        },
        {
            question: "Czy mogę używać obcej waluty w Szwecji?",
            answer: [
                "Nie, musisz wymienić na korony szwedzkie (SEK), aby robić zakupy u nas lub w sklepie w wiosce.",
                "Większość innych sklepów akceptuje VISA i Mastercard."
            ]
        }
    ]
};

async function syncFaqToSupabase() {
    console.log('🔄 Synkar FAQ-data till Supabase...\n');

    const languages = ['en', 'sv', 'de', 'pl'];
    let totalSynced = 0;

    // Synka varje FAQ som separata fält
    for (let i = 0; i < 10; i++) {
        const faqNum = i + 1;
        const fieldKeyQuestion = `faq.item${faqNum}.question`;
        const fieldKeyAnswer = `faq.item${faqNum}.answer`;

        for (const lang of languages) {
            const faqItem = FAQ_DATA[lang][i];
            if (!faqItem) continue;

            // Synka frågan
            const { error: qError } = await supabase
                .from('cms_content')
                .upsert({
                    page_id: 'contact',
                    section_id: 'faq',
                    field_key: fieldKeyQuestion,
                    language: lang,
                    content: faqItem.question
                }, { onConflict: 'page_id,section_id,field_key,language' });

            if (qError) {
                console.error(`❌ Fel vid synk av ${fieldKeyQuestion} (${lang}):`, qError.message);
            } else {
                totalSynced++;
            }

            // Synka svaret (join med newlines)
            const answerText = faqItem.answer.join('\n');
            const { error: aError } = await supabase
                .from('cms_content')
                .upsert({
                    page_id: 'contact',
                    section_id: 'faq',
                    field_key: fieldKeyAnswer,
                    language: lang,
                    content: answerText
                }, { onConflict: 'page_id,section_id,field_key,language' });

            if (aError) {
                console.error(`❌ Fel vid synk av ${fieldKeyAnswer} (${lang}):`, aError.message);
            } else {
                totalSynced++;
            }
        }

        console.log(`✅ FAQ ${faqNum} synkad (alla språk)`);
    }

    console.log(`\n🎉 Klar! ${totalSynced} fält synkade totalt.`);
}

// Kör
syncFaqToSupabase().catch(console.error);
