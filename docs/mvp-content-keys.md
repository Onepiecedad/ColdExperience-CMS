# Content Keys Report

> **Generated:** 2026-02-02  
> **Source:** `cms_content` table  
> **Total unique keys:** 755

## MVP Priority Keys (~75 keys)

Based on priority: Header → Hero → Packages → Footer → Featured Video

### 1. Header (Navigation & UI Page)

**Section:** `header` | **Page ID:** `12c0db3f-27d9-4bc8-be6d-1e7ee5301960`

| Key | Type | Translatable |
|-----|------|-------------|
| `header.bookAdventure` | text | ✓ |
| `header.chooseLanguage` | text | ✓ |
| `header.languageNames.de` | text | ✗ |
| `header.languageNames.en` | text | ✗ |
| `header.languageNames.pl` | text | ✗ |
| `header.languageNames.sv` | text | ✗ |
| `header.nav.about` | text | ✓ |
| `header.nav.adventures` | text | ✓ |
| `header.nav.contact` | text | ✓ |
| `header.nav.faq` | text | ✓ |
| `header.nav.gallery` | text | ✓ |
| `header.nav.home` | text | ✓ |
| `header.nav.packages` | text | ✓ |

### 2. Hero (Home Page)

**Section:** `hero` | **Page ID:** `859f1b94-1601-4a55-920b-92a19610834c`

| Key | Type | Translatable |
|-----|------|-------------|
| `hero.title` | text | ✓ |
| `hero.subtitle` | textarea | ✓ |
| `hero.cta` | text | ✓ |
| `hero.book` | text | ✓ |
| `hero.explore` | text | ✓ |
| `hero.packages` | text | ✓ |
| `hero.premium` | text | ✓ |
| `hero.magic` | text | ✓ |
| `hero.chooseLanguage` | text | ✓ |
| `hero.feature1Title` | text | ✓ |
| `hero.feature1Desc` | textarea | ✓ |
| `hero.feature2Title` | text | ✓ |
| `hero.feature2Desc` | textarea | ✓ |
| `hero.feature3Title` | text | ✓ |
| `hero.feature3Desc` | textarea | ✓ |
| `hero.feature4Title` | text | ✓ |
| `hero.feature4Desc` | textarea | ✓ |
| `hero.videoFallbackAlt` | text | ✓ |

### 3. Featured Video (Home Page)

**Section:** `featuredVideo` | **Page ID:** `859f1b94-1601-4a55-920b-92a19610834c`

| Key | Type | Translatable |
|-----|------|-------------|
| `featuredVideo.title` | text | ✓ |
| `featuredVideo.description` | textarea | ✓ |
| `featuredVideo.youtubeUrl` | url | ✗ |

### 4. Footer (Navigation & UI Page)

**Section:** `footer` | **Page ID:** `12c0db3f-27d9-4bc8-be6d-1e7ee5301960`

| Key | Type | Translatable |
|-----|------|-------------|
| `footer.companyName` | text | ✗ |
| `footer.companyDescription` | textarea | ✓ |
| `footer.quote` | textarea | ✓ |
| `footer.rights` | text | ✓ |
| `footer.contact.title` | text | ✓ |
| `footer.contact.email` | text | ✗ |
| `footer.contact.phone` | text | ✗ |
| `footer.contact.addressLine1` | text | ✗ |
| `footer.contact.addressLine2` | text | ✗ |
| `footer.quickLinks.title` | text | ✓ |
| `footer.quickLinks.home` | text | ✓ |
| `footer.quickLinks.about` | text | ✓ |
| `footer.quickLinks.packages` | text | ✓ |
| `footer.quickLinks.gallery` | text | ✓ |
| `footer.quickLinks.contact` | text | ✓ |
| `footer.experiences.title` | text | ✓ |
| `footer.experiences.dogSledding` | text | ✓ |
| `footer.experiences.snowmobile` | text | ✓ |
| `footer.experiences.northernLights` | text | ✓ |
| `footer.experiences.iceFishing` | text | ✓ |
| `footer.experiences.saunaHotTub` | text | ✓ |
| `footer.experiences.localCuisine` | text | ✓ |
| `footer.season.title` | text | ✓ |
| `footer.season.dates` | text | ✓ |
| `footer.season.cta` | text | ✓ |
| `footer.cookiePolicy` | text | ✓ |
| `footer.cookieSettings` | text | ✓ |
| `footer.privacyPolicy` | text | ✓ |
| `footer.termsOfService` | text | ✓ |

### 5. Packages (Packages Page)

**Section:** `packages` | **Page ID:** `6a5942c7-5aa0-45c0-bdc0-65a39eef7d1c`

| Key | Type | Translatable |
|-----|------|-------------|
| `packages.title` | text | ✓ |
| `packages.subtitle` | textarea | ✓ |
| `packages.pageTitle` | text | ✓ |
| `packages.pageDescription` | textarea | ✓ |
| `packages.bookButton` | text | ✓ |
| `packages.mostPopular` | text | ✓ |
| `packages.perPerson` | text | ✓ |
| `packages.taster.name` | text | ✓ |
| `packages.taster.description` | textarea | ✓ |
| `packages.taster.duration` | text | ✓ |
| `packages.adventure.name` | text | ✓ |
| `packages.adventure.description` | textarea | ✓ |
| `packages.adventure.duration` | text | ✓ |
| `packages.complete.name` | text | ✓ |
| `packages.complete.description` | textarea | ✓ |
| `packages.complete.duration` | text | ✓ |
| `packages.threeDay.name` | text | ✓ |
| `packages.threeDay.description` | textarea | ✓ |
| `packages.threeDay.duration` | text | ✓ |

---

## Type-Mappning Heuristik

| Källa | Typ |
|-------|-----|
| `content_type: 'array'` | `array` |
| Key contains `url`, `youtube`, `video`, `link` | `url` |
| Key contains `description`, `paragraph`, `body` | `textarea` |
| Default | `text` |

## Translatable Heuristik

| Mönster | Translatable |
|---------|-------------|
| Language names (`languageNames.*`) | `false` |
| Contact info (email, phone, address) | `false` |
| URLs | `false` |
| Company name | `false` |
| All other user-facing text | `true` |
