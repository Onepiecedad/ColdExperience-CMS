/**
 * Add Missing Sections Script
 * 
 * Adds the missing 'instagram' and 'corner' sections to Supabase
 */

const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Content for instagram section (from i18n files)
const instagramContent = [
    { key: 'title', en: 'Follow Our Adventures', sv: 'Följ våra äventyr', de: 'Folgen Sie unseren Abenteuern', pl: 'Śledź nasze przygody' },
    { key: 'titleHighlight', en: 'on Instagram', sv: 'på Instagram', de: 'auf Instagram', pl: 'na Instagramie' },
    { key: 'subtitle', en: 'See the magic of Lapland through our lens', sv: 'Se Lapplands magi genom vår lins', de: 'Erleben Sie den Zauber Lapplands durch unsere Linse', pl: 'Zobacz magię Laponii przez nasz obiektyw' },
    { key: 'followButton', en: 'Follow Us', sv: 'Följ oss', de: 'Folgen', pl: 'Obserwuj nas' },
    { key: 'viewMore', en: 'View More', sv: 'Se mer', de: 'Mehr anzeigen', pl: 'Zobacz więcej' },
];

// Content for corner section (HomeCorner - from homeCorner namespace)
const cornerContent = [
    { key: 'whoTitle', en: 'Who We Are', sv: 'Vilka vi är', de: 'Wer wir sind', pl: 'Kim jesteśmy' },
    { key: 'whoBody', en: 'Cold Experience is a family-run company in the heart of Swedish Lapland. We offer authentic winter adventures with personal service and local knowledge.', sv: 'Cold Experience är ett familjeföretag i hjärtat av svenska Lappland. Vi erbjuder äkta vinteräventyr med personlig service och lokal kännedom.', de: 'Cold Experience ist ein familiengeführtes Unternehmen im Herzen Schwedisch-Lapplands. Wir bieten authentische Winterabenteuer mit persönlichem Service und lokaler Expertise.', pl: 'Cold Experience to rodzinna firma w sercu szwedzkiej Laponii. Oferujemy autentyczne zimowe przygody z osobistą obsługą i lokalną wiedzą.' },
    { key: 'adventuresTitle', en: 'Our Adventures', sv: 'Våra äventyr', de: 'Unsere Abenteuer', pl: 'Nasze przygody' },
    { key: 'huskyTitle', en: 'Husky Sledding', sv: 'Hundspann', de: 'Husky-Schlittenfahrt', pl: 'Przejażdżka psim zaprzęgiem' },
    { key: 'huskyBody', en: 'Experience the thrill of driving your own dog sled through pristine wilderness.', sv: 'Upplev spänningen att köra egen hundspann genom orörd vildmark.', de: 'Erleben Sie den Nervenkitzel, Ihren eigenen Hundeschlitten durch unberührte Wildnis zu fahren.', pl: 'Przeżyj dreszczyk emocji prowadząc własne psie zaprzęgi przez dziewiczą dziką przyrodę.' },
    { key: 'snowmobileTitle', en: 'Snowmobile Safari', sv: 'Snöskotursafari', de: 'Schneemobil-Safari', pl: 'Safari na skuterze śnieżnym' },
    { key: 'snowmobileBody', en: 'Explore vast frozen landscapes on an exhilarating snowmobile adventure.', sv: 'Utforska vidsträckta frusna landskap på ett spännande snöskotersäventyr.', de: 'Erkunden Sie weite gefrorene Landschaften bei einem aufregenden Schneemobil-Abenteuer.', pl: 'Odkrywaj rozległe zamarznięte krajobrazy podczas ekscytującej przygody na skuterze śnieżnym.' },
    { key: 'nlightsTitle', en: 'Northern Lights', sv: 'Norrsken', de: 'Nordlichter', pl: 'Zorza polarna' },
    { key: 'nlightsBody', en: 'Witness the magical aurora borealis dancing across the Arctic sky.', sv: 'Bevittna det magiska norrskenet som dansar över den arktiska himlen.', de: 'Erleben Sie die magischen Nordlichter, die über den arktischen Himmel tanzen.', pl: 'Obserwuj magiczną zorzę polarną tańczącą na arktycznym niebie.' },
    { key: 'learnMore', en: 'Learn More', sv: 'Läs mer', de: 'Mehr erfahren', pl: 'Dowiedz się więcej' },
    { key: 'whyTitle', en: 'Why Choose Us', sv: 'Varför välja oss', de: 'Warum wir', pl: 'Dlaczego my' },
    { key: 'whyLocal', en: 'Local family with deep roots in Lapland', sv: 'Lokal familj med djupa rötter i Lappland', de: 'Einheimische Familie mit tiefen Wurzeln in Lappland', pl: 'Lokalna rodzina z głębokimi korzeniami w Laponii' },
    { key: 'whyHosp', en: 'Genuine hospitality and personal attention', sv: 'Äkta gästfrihet och personlig uppmärksamhet', de: 'Echte Gastfreundschaft und persönliche Aufmerksamkeit', pl: 'Prawdziwa gościnność i osobista uwaga' },
    { key: 'whySmall', en: 'Small groups for an intimate experience', sv: 'Små grupper för en intim upplevelse', de: 'Kleine Gruppen für ein intimes Erlebnis', pl: 'Małe grupy dla intymnego doświadczenia' },
    { key: 'planTitle', en: 'Plan Your Adventure', sv: 'Planera ditt äventyr', de: 'Planen Sie Ihr Abenteuer', pl: 'Zaplanuj swoją przygodę' },
    { key: 'planBody', en: 'Ready to experience the magic of Lapland? Browse our packages or get in touch to start planning your unforgettable winter adventure.', sv: 'Redo att uppleva Lapplands magi? Bläddra i våra paket eller hör av dig för att börja planera ditt oförglömliga vinteräventyr.', de: 'Bereit, die Magie Lapplands zu erleben? Durchstöbern Sie unsere Pakete oder kontaktieren Sie uns, um Ihr unvergessliches Winterabenteuer zu planen.', pl: 'Gotowy na doświadczenie magii Laponii? Przejrzyj nasze pakiety lub skontaktuj się z nami, aby zaplanować niezapomnianą zimową przygodę.' },
    { key: 'viewPackages', en: 'View Packages', sv: 'Se paket', de: 'Pakete anzeigen', pl: 'Zobacz pakiety' },
    { key: 'bookNow', en: 'Book Now', sv: 'Boka nu', de: 'Jetzt buchen', pl: 'Zarezerwuj teraz' },
    { key: 'contactUs', en: 'Contact Us', sv: 'Kontakta oss', de: 'Kontaktieren Sie uns', pl: 'Skontaktuj się z nami' },
];

async function addMissingSections() {
    console.log('🔧 Adding Missing Sections to Supabase...\n');

    const allRecords = [];

    // Prepare instagram records
    instagramContent.forEach((item, index) => {
        allRecords.push({
            section: 'instagram',
            content_key: `instagram.${item.key}`,
            content_en: item.en,
            content_sv: item.sv,
            content_de: item.de,
            content_pl: item.pl,
            content_type: 'text',
            display_order: index + 1,
        });
    });

    // Prepare corner records
    cornerContent.forEach((item, index) => {
        allRecords.push({
            section: 'corner',
            content_key: `corner.${item.key}`,
            content_en: item.en,
            content_sv: item.sv,
            content_de: item.de,
            content_pl: item.pl,
            content_type: 'text',
            display_order: index + 1,
        });
    });

    console.log(`📝 Adding ${allRecords.length} records...`);

    // Insert records
    const { data, error } = await supabase
        .from('cms_content')
        .insert(allRecords);

    if (error) {
        console.error('❌ Error:', error.message);
        return;
    }

    console.log('✅ Successfully added missing sections!');

    // Verify
    const { data: verify } = await supabase
        .from('cms_content')
        .select('section, content_key')
        .in('section', ['instagram', 'corner']);

    console.log(`\n📊 Verification: ${verify?.length || 0} records in instagram/corner sections`);
}

addMissingSections().catch(console.error);
