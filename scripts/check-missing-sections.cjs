/**
 * check-missing-sections.cjs
 * Jämför webbplatsens innehåll med CMS-datan för att hitta saknade sektioner
 */

const fs = require('fs');
const path = require('path');

// Ladda CMS-data
const cmsDataPath = path.join(__dirname, '..', 'cms-content-data.json');
const cmsData = require(cmsDataPath);

// Sökvägar till i18n-filer
const localesPath = path.join(__dirname, '..', '..', 'ColdExperience', 'frontend', 'public', 'locales', 'en');

console.log('🔍 Analyserar saknade sektioner...\n');

// Hämta alla JSON-filer från locales
const localeFiles = fs.readdirSync(localesPath).filter(f => f.endsWith('.json'));

console.log('📁 Hittade i18n-filer på webbplatsen:');
localeFiles.forEach(f => console.log(`   - ${f}`));
console.log('');

// Jämför med CMS-strukturen
const cmsPages = Object.keys(cmsData.content);
console.log('📊 CMS-sidor i databasen:');
cmsPages.forEach(page => {
    const sections = Object.keys(cmsData.content[page]);
    const fieldCount = sections.reduce((sum, section) => {
        return sum + Object.keys(cmsData.content[page][section]).length;
    }, 0);
    console.log(`   - ${page}: ${sections.length} sektioner, ${fieldCount} fält`);
});
console.log('');

// Kolla vad som saknas
console.log('🔎 Letar efter saknade data...\n');

const missing = [];

// Kolla varje locale-fil
for (const file of localeFiles) {
    const filePath = path.join(localesPath, file);
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const pageName = file.replace('.json', '');

    // Räkna fält i JSON-filen
    const countFields = (obj, prefix = '') => {
        let count = 0;
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                count += countFields(value, prefix + key + '.');
            } else {
                count++;
            }
        }
        return count;
    };

    const websiteFieldCount = countFields(fileData);

    // Hitta motsvarande CMS-sida
    let cmsFieldCount = 0;
    let cmsPageName = pageName;

    // Mappningar
    const pageMapping = {
        'translation': ['home', 'contact', 'about', 'packages', 'gallery', 'faq', 'booking', 'navigation', 'legal'],
        'home': ['home'],
        'about': ['about'],
        'contact': ['contact'],
        'packages': ['packages'],
        'gallery': ['gallery'],
        'header': ['navigation'],
        'footer': ['navigation'],
        'hero': ['home'],
        'features': ['home'],
        'experiences': ['home'],
        'testimonials': ['home'],
        'homeCorner': ['home'],
        'ownerSection': ['about'],
        'why': ['about'],
        'pages': ['detailPages'],
        'common': ['navigation']
    };

    const mappedPages = pageMapping[pageName] || [pageName];

    for (const mp of mappedPages) {
        if (cmsData.content[mp]) {
            for (const section of Object.keys(cmsData.content[mp])) {
                cmsFieldCount += Object.keys(cmsData.content[mp][section]).length;
            }
        }
    }

    const coverage = cmsFieldCount > 0 ? Math.min(100, Math.round((cmsFieldCount / websiteFieldCount) * 100)) : 0;

    if (coverage < 80) {
        missing.push({
            file: pageName,
            websiteFields: websiteFieldCount,
            cmsFields: cmsFieldCount,
            coverage: coverage
        });
    }

    const status = coverage >= 80 ? '✅' : coverage >= 50 ? '⚠️' : '❌';
    console.log(`${status} ${pageName}: ${cmsFieldCount}/${websiteFieldCount} fält (${coverage}%)`);
}

console.log('\n');

if (missing.length > 0) {
    console.log('⚠️ Sektioner med låg täckning (<80%):');
    missing.forEach(m => {
        console.log(`   - ${m.file}: ${m.cmsFields}/${m.websiteFields} (${m.coverage}%)`);
    });
} else {
    console.log('✅ Alla sektioner har god täckning!');
}

// Specifika kontroller
console.log('\n📋 Specifika kontroller:\n');

// Kolla FAQ items
const faqItems = Object.keys(cmsData.content?.contact?.faq || {}).filter(k => k.startsWith('faq.item'));
console.log(`FAQ-frågor: ${faqItems.length / 2} st (${faqItems.length} fält)`);

// Kolla packages
const packageFields = Object.keys(cmsData.content?.packages?.packages || {});
console.log(`Package-fält: ${packageFields.length} st`);

// Kolla adventures
const adventures = cmsData.content?.detailPages?.pages;
if (adventures) {
    const adventurePages = Object.keys(adventures);
    console.log(`Adventure-sidor: ${adventurePages.length} st (${adventurePages.join(', ')})`);
}

// Kolla om det finns data som inte synkats
console.log('\n');
