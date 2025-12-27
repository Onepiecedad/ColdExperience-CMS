/**
 * sync-faq-to-supabase.cjs
 * Synkar FAQ, Instagram och Corner-data till Supabase med korrekt tabellstruktur
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://hpbeqrwwcmetbjjqvzsv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwYmVxcnd3Y21ldGJqanF2enN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA2NzMyMSwiZXhwIjoyMDgxNjQzMzIxfQ.ACnILOxFOhe2wq7P6_Bga9g-nCTK9xmEa0ZB0JNDvqM'
);

// FAQ Data - komprimerade versioner
const FAQ_DATA = [
    {
        content_key: 'faq.item1.question',
        content_en: "What's the easiest way to get to you in Råstrand, Lapland?",
        content_sv: "Hur tar jag mig enklast till er i Råstrand?",
        content_de: "Wie komme ich am einfachsten zu euch nach Råstrand?",
        content_pl: "Jak najłatwiej dostać się do Was w Råstrand?"
    },
    {
        content_key: 'faq.item1.answer',
        content_en: "The distance from Malmö is about 1500 km. The fastest way is by plane - we pick up guests at Skellefteå, Luleå or Lycksele airport.",
        content_sv: "Avståndet från Malmö är ca 1500 km. Snabbast är flyg - vi hämtar gäster på Skellefteå, Luleå eller Lycksele flygplats.",
        content_de: "Die Entfernung von Malmö beträgt etwa 1500 km. Am schnellsten geht es mit dem Flugzeug - wir holen Gäste an den Flughäfen Skellefteå, Luleå oder Lycksele ab.",
        content_pl: "Odległość z Malmö wynosi około 1500 km. Najszybciej samolotem - odbieramy gości z lotnisk Skellefteå, Luleå lub Lycksele."
    },
    {
        content_key: 'faq.item2.question',
        content_en: "How do I fly to you?",
        content_sv: "Hur flyger jag enklast till er?",
        content_de: "Wie fliege ich am einfachsten zu euch?",
        content_pl: "Jak najłatwiej do Was dolecieć?"
    },
    {
        content_key: 'faq.item2.answer',
        content_en: "Fly to Arlanda in Stockholm, then take domestic flight with Amapola to Lycksele. Transfer is included in winter package.",
        content_sv: "Flyg till Arlanda, ta sedan inrikesflyg med Amapola till Lycksele. Transfer ingår i vinterpaketet.",
        content_de: "Fliegen Sie nach Arlanda in Stockholm, dann Inlandsflug mit Amapola nach Lycksele. Transfer ist im Winterpaket enthalten.",
        content_pl: "Lećcie do Arlanda w Sztokholmie, potem lot krajowy Amapola do Lycksele. Transfer jest wliczony w pakiet zimowy."
    },
    {
        content_key: 'faq.item3.question',
        content_en: "Can I drive my own car to you?",
        content_sv: "Kan jag köra egen bil?",
        content_de: "Kann ich mit dem eigenen Auto kommen?",
        content_pl: "Czy mogę przyjechać własnym samochodem?"
    },
    {
        content_key: 'faq.item3.answer',
        content_en: "Yes, but make sure you have good winter tires. From Stockholm to Råstrand takes about 9-10 hours.",
        content_sv: "Ja, men ha bra vinterdäck. Från Stockholm tar det 9-10 timmar.",
        content_de: "Ja, aber achten Sie auf gute Winterreifen. Von Stockholm nach Råstrand dauert es etwa 9-10 Stunden.",
        content_pl: "Tak, ale upewnij się, że masz dobre opony zimowe. Ze Sztokholmu do Råstrand zajmuje około 9-10 godzin."
    },
    {
        content_key: 'faq.item4.question',
        content_en: "Are snowmobile clothes, boots, and helmets included?",
        content_sv: "Ingår snöskoterkläder?",
        content_de: "Sind Schneemobilkleidung, Stiefel und Helme inklusive?",
        content_pl: "Czy ubrania na skuter śnieżny są wliczone?"
    },
    {
        content_key: 'faq.item4.answer',
        content_en: "Yes, we provide all outerwear. You wear thermal underwear underneath.",
        content_sv: "Ja, vi tillhandahåller ytterkläderna. Du bär termounderkläder under.",
        content_de: "Ja, wir stellen alle Oberbekleidung zur Verfügung. Sie tragen Thermounterwäsche darunter.",
        content_pl: "Tak, zapewniamy całą odzież wierzchnią. Nosisz pod spodem bieliznę termiczną."
    },
    {
        content_key: 'faq.item5.question',
        content_en: "What clothes should I bring?",
        content_sv: "Vilka kläder ska jag ta med?",
        content_de: "Welche Kleidung sollte ich mitbringen?",
        content_pl: "Jakie ubrania powinienem zabrać?"
    },
    {
        content_key: 'faq.item5.answer',
        content_en: "Pack thermal underwear, sweater, warm socks, winter jacket, winter boots, hat, scarf, gloves, sunglasses and swimwear.",
        content_sv: "Packa termounderkläder, tröja, varma strumpor, vinterjacka, kängor, mössa, halsduk, handskar, solglasögon och badkläder.",
        content_de: "Packen Sie Thermounterwäsche, Pullover, warme Socken, Winterjacke, Winterstiefel, Mütze, Schal, Handschuhe, Sonnenbrille und Badekleidung ein.",
        content_pl: "Spakuj bieliznę termiczną, sweter, ciepłe skarpetki, kurtkę zimową, buty zimowe, czapkę, szalik, rękawiczki, okulary przeciwsłoneczne i strój kąpielowy."
    },
    {
        content_key: 'faq.item6.question',
        content_en: "Is there anything I don't need to bring?",
        content_sv: "Vad behöver jag inte ta med?",
        content_de: "Gibt es etwas, das ich nicht mitbringen muss?",
        content_pl: "Czy jest coś, czego nie muszę zabierać?"
    },
    {
        content_key: 'faq.item6.answer',
        content_en: "We provide bed linen, towels, bathrobes and slippers. Coffee, tea, water and juice are included.",
        content_sv: "Vi står för sängkläder, handdukar, badrockar och tofflor. Kaffe, te, vatten och juice ingår.",
        content_de: "Wir stellen Bettwäsche, Handtücher, Bademäntel und Hausschuhe zur Verfügung. Kaffee, Tee, Wasser und Saft sind inklusive.",
        content_pl: "Zapewniamy pościel, ręczniki, szlafroki i kapcie. Kawa, herbata, woda i sok są wliczone."
    },
    {
        content_key: 'faq.item7.question',
        content_en: "What is not included in the full board?",
        content_sv: "Vad ingår inte i helpensionen?",
        content_de: "Was ist nicht in der Vollpension enthalten?",
        content_pl: "Co nie jest wliczone w pełne wyżywienie?"
    },
    {
        content_key: 'faq.item7.answer',
        content_en: "Alcoholic beverages are not included. Bring cash if you want to buy any.",
        content_sv: "Alkohol ingår inte. Ta med kontanter om du vill köpa.",
        content_de: "Alkoholische Getränke sind nicht enthalten. Bringen Sie Bargeld mit, wenn Sie welche kaufen möchten.",
        content_pl: "Napoje alkoholowe nie są wliczone. Zabierz gotówkę, jeśli chcesz je kupić."
    },
    {
        content_key: 'faq.item8.question',
        content_en: "Do I need extra insurance?",
        content_sv: "Behöver jag extra försäkring?",
        content_de: "Brauche ich eine zusätzliche Versicherung?",
        content_pl: "Czy potrzebuję dodatkowego ubezpieczenia?"
    },
    {
        content_key: 'faq.item8.answer',
        content_en: "Yes, buy travel insurance that covers adventure activities and check that your health insurance is valid abroad.",
        content_sv: "Ja, köp reseförsäkring som täcker äventyrsaktiviteter.",
        content_de: "Ja, kaufen Sie eine Reiseversicherung, die Abenteueraktivitäten abdeckt.",
        content_pl: "Tak, kup ubezpieczenie podróżne obejmujące sporty przygodowe."
    },
    {
        content_key: 'faq.item9.question',
        content_en: "Do I need a special license for snowmobiles?",
        content_sv: "Behöver jag speciellt körkort för snöskoter?",
        content_de: "Brauche ich einen speziellen Führerschein für Schneemobile?",
        content_pl: "Czy potrzebuję specjalnego prawa jazdy na skutery śnieżne?"
    },
    {
        content_key: 'faq.item9.answer',
        content_en: "No, a regular driver's license is enough. You always drive with our guide.",
        content_sv: "Nej, vanligt körkort räcker. Du kör alltid med vår guide.",
        content_de: "Nein, ein normaler Führerschein reicht aus. Sie fahren immer mit unserem Guide.",
        content_pl: "Nie, zwykłe prawo jazdy wystarczy. Zawsze jeździsz z naszym przewodnikiem."
    },
    {
        content_key: 'faq.item10.question',
        content_en: "Can I use foreign currency in Sweden?",
        content_sv: "Kan jag använda utländsk valuta?",
        content_de: "Kann ich ausländische Währung in Schweden verwenden?",
        content_pl: "Czy mogę używać obcej waluty w Szwecji?"
    },
    {
        content_key: 'faq.item10.answer',
        content_en: "No, you need Swedish kronor (SEK). Most stores accept VISA and Mastercard.",
        content_sv: "Nej, du behöver svenska kronor. De flesta butiker tar VISA och Mastercard.",
        content_de: "Nein, Sie brauchen Schwedische Kronen (SEK). Die meisten Geschäfte akzeptieren VISA und Mastercard.",
        content_pl: "Nie, potrzebujesz koron szwedzkich (SEK). Większość sklepów akceptuje VISA i Mastercard."
    }
];

// Instagram Data
const INSTAGRAM_DATA = [
    {
        content_key: 'instagram.title',
        content_en: 'Follow Our Adventures',
        content_sv: 'Följ våra äventyr',
        content_de: 'Folge unseren Abenteuern',
        content_pl: 'Śledź nasze przygody'
    },
    {
        content_key: 'instagram.subtitle',
        content_en: 'See our latest moments from Lapland',
        content_sv: 'Se våra senaste ögonblick från Lappland',
        content_de: 'Sehen Sie unsere neuesten Momente aus Lappland',
        content_pl: 'Zobacz nasze najnowsze chwile z Laponii'
    },
    {
        content_key: 'instagram.viewOnInstagram',
        content_en: 'View on Instagram',
        content_sv: 'Visa på Instagram',
        content_de: 'Auf Instagram ansehen',
        content_pl: 'Zobacz na Instagramie'
    },
    {
        content_key: 'instagram.follow',
        content_en: 'Follow us',
        content_sv: 'Följ oss',
        content_de: 'Folgen Sie uns',
        content_pl: 'Obserwuj nas'
    },
    {
        content_key: 'instagram.loading',
        content_en: 'Loading...',
        content_sv: 'Laddar...',
        content_de: 'Wird geladen...',
        content_pl: 'Ładowanie...'
    },
    {
        content_key: 'instagram.error',
        content_en: 'Could not load Instagram feed',
        content_sv: 'Kunde inte ladda Instagram-flödet',
        content_de: 'Instagram-Feed konnte nicht geladen werden',
        content_pl: 'Nie można załadować kanału Instagram'
    }
];

// Corner Data (Home)
const CORNER_DATA = [
    {
        content_key: 'corner.whoTitle',
        content_en: 'Who We Are',
        content_sv: 'Vilka vi är',
        content_de: 'Wer wir sind',
        content_pl: 'Kim jesteśmy'
    },
    {
        content_key: 'corner.whoBody',
        content_en: 'We are Gustav and Julia, a Swedish-Polish couple who left big city life for the magic of Swedish Lapland.',
        content_sv: 'Vi är Gustav och Julia, ett svenskt-polskt par som lämnade storstadens liv för magin i svenska Lappland.',
        content_de: 'Wir sind Gustav und Julia, ein schwedisch-polnisches Paar, das das Großstadtleben für die Magie Schwedisch-Lapplands verlassen hat.',
        content_pl: 'Jesteśmy Gustavem i Julią, szwedzko-polską parą, która porzuciła życie w wielkim mieście dla magii szwedzkiej Laponii.'
    },
    {
        content_key: 'corner.adventuresTitle',
        content_en: 'Our Adventures',
        content_sv: 'Våra äventyr',
        content_de: 'Unsere Abenteuer',
        content_pl: 'Nasze przygody'
    },
    {
        content_key: 'corner.huskyTitle',
        content_en: 'Husky Sled Rides',
        content_sv: 'Hundspannsäventyr',
        content_de: 'Husky-Schlittenfahrten',
        content_pl: 'Jazda psim zaprzęgiem'
    },
    {
        content_key: 'corner.huskyBody',
        content_en: 'Experience the thrill of gliding through pristine snow forests pulled by eager huskies.',
        content_sv: 'Upplev spänningen att glida genom orörda skogar dragna av ivriga hundar.',
        content_de: 'Erleben Sie den Nervenkitzel, durch unberührte Schneewälder von eifrigen Huskys gezogen zu werden.',
        content_pl: 'Poczuj dreszczyk emocji podczas jazdy przez dziewicze lasy ciągnięte przez chętne husky.'
    },
    {
        content_key: 'corner.snowmobileTitle',
        content_en: 'Snowmobile Safari',
        content_sv: 'Snöskoteräventyr',
        content_de: 'Schneemobil-Safari',
        content_pl: 'Safari na skuterach śnieżnych'
    },
    {
        content_key: 'corner.snowmobileBody',
        content_en: 'Explore vast frozen landscapes on powerful snowmobiles guided by our experts.',
        content_sv: 'Utforska vidsträckta frusna landskap på kraftfulla snöskotrar med våra guider.',
        content_de: 'Erkunden Sie weite gefrorene Landschaften auf leistungsstarken Schneemobilen mit unseren Experten.',
        content_pl: 'Odkrywaj rozległe zamarznięte krajobrazy na potężnych skuterach śnieżnych z naszymi przewodnikami.'
    },
    {
        content_key: 'corner.nlightsTitle',
        content_en: 'Northern Lights',
        content_sv: 'Norrsken',
        content_de: 'Nordlichter',
        content_pl: 'Zorza polarna'
    },
    {
        content_key: 'corner.nlightsBody',
        content_en: 'Witness the spectacular aurora borealis dancing across the Arctic sky.',
        content_sv: 'Bevittna det spektakulära norrskenet dansa över den arktiska himlen.',
        content_de: 'Beobachten Sie das spektakuläre Nordlicht, das über den arktischen Himmel tanzt.',
        content_pl: 'Podziwiaj spektakularną zorzę polarną tańczącą na arktycznym niebie.'
    },
    {
        content_key: 'corner.learnMore',
        content_en: 'Learn More',
        content_sv: 'Läs mer',
        content_de: 'Mehr erfahren',
        content_pl: 'Dowiedz się więcej'
    },
    {
        content_key: 'corner.whyTitle',
        content_en: 'Why Choose Us',
        content_sv: 'Varför välja oss',
        content_de: 'Warum uns wählen',
        content_pl: 'Dlaczego my'
    },
    {
        content_key: 'corner.whyLocal',
        content_en: 'Local Expertise',
        content_sv: 'Lokal expertis',
        content_de: 'Lokales Fachwissen',
        content_pl: 'Lokalna wiedza'
    },
    {
        content_key: 'corner.whyHosp',
        content_en: 'True Hospitality',
        content_sv: 'Äkta gästfrihet',
        content_de: 'Echte Gastfreundschaft',
        content_pl: 'Prawdziwa gościnność'
    },
    {
        content_key: 'corner.whySmall',
        content_en: 'Small Groups',
        content_sv: 'Små grupper',
        content_de: 'Kleine Gruppen',
        content_pl: 'Małe grupy'
    },
    {
        content_key: 'corner.planTitle',
        content_en: 'Plan Your Adventure',
        content_sv: 'Planera ditt äventyr',
        content_de: 'Planen Sie Ihr Abenteuer',
        content_pl: 'Zaplanuj swoją przygodę'
    },
    {
        content_key: 'corner.planBody',
        content_en: 'Ready to experience the magic of Swedish Lapland? Let us help you plan your perfect winter getaway.',
        content_sv: 'Redo att uppleva magin i svenska Lappland? Låt oss hjälpa dig planera din perfekta vinterresa.',
        content_de: 'Bereit, die Magie Schwedisch-Lapplands zu erleben? Lassen Sie uns Ihnen helfen, Ihren perfekten Winterurlaub zu planen.',
        content_pl: 'Gotowy doświadczyć magii szwedzkiej Laponii? Pozwól nam pomóc Ci zaplanować idealny zimowy wyjazd.'
    },
    {
        content_key: 'corner.viewPackages',
        content_en: 'View Packages',
        content_sv: 'Se paket',
        content_de: 'Pakete ansehen',
        content_pl: 'Zobacz pakiety'
    },
    {
        content_key: 'corner.bookNow',
        content_en: 'Book Now',
        content_sv: 'Boka nu',
        content_de: 'Jetzt buchen',
        content_pl: 'Zarezerwuj teraz'
    },
    {
        content_key: 'corner.contactUs',
        content_en: 'Contact Us',
        content_sv: 'Kontakta oss',
        content_de: 'Kontaktieren Sie uns',
        content_pl: 'Skontaktuj się z nami'
    }
];

async function getContactPageId() {
    const { data } = await supabase
        .from('cms_pages')
        .select('id')
        .eq('slug', 'contact')
        .single();
    return data?.id;
}

async function getHomePageId() {
    // Note: The 'hero' page is used as the main home page
    const { data } = await supabase
        .from('cms_pages')
        .select('id')
        .eq('slug', 'hero')
        .single();
    return data?.id;
}

async function syncContent() {
    console.log('🔄 Synkar FAQ, Instagram och Corner-data till Supabase...\n');

    // Hämta page IDs
    const contactPageId = await getContactPageId();
    const homePageId = await getHomePageId();

    if (!contactPageId) {
        console.error('❌ Kunde inte hitta contact-sida i cms_pages');
        return;
    }
    if (!homePageId) {
        console.error('❌ Kunde inte hitta home-sida i cms_pages');
        return;
    }

    console.log('📄 Contact page ID:', contactPageId);
    console.log('📄 Home page ID:', homePageId);
    console.log('');

    let totalSynced = 0;
    let skipped = 0;
    let errors = 0;

    // Helper function för att synka ett fält
    async function syncField(pageId, section, item) {
        // Kolla om fältet redan finns
        const { data: existing } = await supabase
            .from('cms_content')
            .select('id')
            .eq('content_key', item.content_key)
            .single();

        if (existing) {
            // Uppdatera befintligt
            const { error } = await supabase
                .from('cms_content')
                .update({
                    content_en: item.content_en,
                    content_sv: item.content_sv,
                    content_de: item.content_de,
                    content_pl: item.content_pl
                })
                .eq('id', existing.id);

            if (error) {
                console.error(`  ❌ ${item.content_key}: ${error.message}`);
                errors++;
                return false;
            }
            skipped++;
            return true;
        } else {
            // Skapa nytt
            const { error } = await supabase
                .from('cms_content')
                .insert({
                    page_id: pageId,
                    section: section,
                    content_key: item.content_key,
                    content_type: 'text',
                    content_en: item.content_en,
                    content_sv: item.content_sv,
                    content_de: item.content_de,
                    content_pl: item.content_pl,
                    field_label: item.content_key.split('.').pop(),
                    field_hint: ''
                });

            if (error) {
                console.error(`  ❌ ${item.content_key}: ${error.message}`);
                errors++;
                return false;
            }
            totalSynced++;
            return true;
        }
    }

    // Synka FAQ
    console.log('📋 Synkar FAQ...');
    for (const item of FAQ_DATA) {
        await syncField(contactPageId, 'faq', item);
    }
    console.log(`  ✅ ${FAQ_DATA.length} FAQ-fält processade\n`);

    // Synka Instagram
    console.log('📸 Synkar Instagram...');
    for (const item of INSTAGRAM_DATA) {
        await syncField(homePageId, 'instagram', item);
    }
    console.log(`  ✅ ${INSTAGRAM_DATA.length} Instagram-fält processade\n`);

    // Synka Corner
    console.log('🏔️ Synkar Home Corner...');
    for (const item of CORNER_DATA) {
        await syncField(homePageId, 'corner', item);
    }
    console.log(`  ✅ ${CORNER_DATA.length} Corner-fält processade\n`);

    // Sammanfattning
    const total = FAQ_DATA.length + INSTAGRAM_DATA.length + CORNER_DATA.length;
    console.log('='.repeat(50));
    console.log(`🎉 Klar!`);
    console.log(`   Nya fält: ${totalSynced}`);
    console.log(`   Uppdaterade: ${skipped}`);
    if (errors > 0) {
        console.log(`   Fel: ${errors}`);
    }
}

// Kör
syncContent().catch(console.error);

