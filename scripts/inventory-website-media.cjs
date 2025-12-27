/**
 * Inventory Website Media
 * 
 * Scans the ColdExperience website for all media files (images & videos)
 * and creates a comprehensive inventory with usage information.
 * 
 * Run: node scripts/inventory-website-media.cjs
 */

const fs = require('fs');
const path = require('path');

// Paths
const WEBSITE_PATH = path.join(__dirname, '../../ColdExperience/frontend');
const PUBLIC_PATH = path.join(WEBSITE_PATH, 'public');
const SRC_PATH = path.join(WEBSITE_PATH, 'src');
const OUTPUT_FILE = path.join(__dirname, '../website-media-inventory.json');

// Media extensions
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
const ALL_EXTENSIONS = [...VIDEO_EXTENSIONS, ...IMAGE_EXTENSIONS];

// Section mapping suggestions based on file names and paths
const SECTION_SUGGESTIONS = {
    'coldexperience-top': { pageId: 'hero', sectionId: 'hero', description: 'Hero background video' },
    'hero': { pageId: 'hero', sectionId: 'hero', description: 'Hero section' },
    'galleri': { pageId: 'gallery', sectionId: 'grid', description: 'Gallery section' },
    'gallery': { pageId: 'gallery', sectionId: 'grid', description: 'Gallery section' },
    'om_oss': { pageId: 'about', sectionId: 'story', description: 'About/Story section' },
    'owners': { pageId: 'about', sectionId: 'ownerSection', description: 'Owners/Hosts section' },
    'hundspann': { pageId: 'experiences', sectionId: 'experiences', description: 'Dog sledding experience' },
    'snoskoter': { pageId: 'experiences', sectionId: 'experiences', description: 'Snowmobile experience' },
    'norrsken': { pageId: 'experiences', sectionId: 'experiences', description: 'Northern lights experience' },
    'coldexperience1': { pageId: 'packages', sectionId: 'packages', description: 'Package video' },
    'coldexperience2': { pageId: 'packages', sectionId: 'packages', description: 'Package video' },
    'coldexperience3': { pageId: 'packages', sectionId: 'packages', description: 'Package video' },
    'clothes': { pageId: 'faq', sectionId: 'questions', description: 'FAQ clothing info' },
    'logo': { pageId: 'navigation', sectionId: 'header', description: 'Header logo' },
    'matlagning': { pageId: 'experiences', sectionId: 'experiences', description: 'Cooking experience' },
};

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;

    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

/**
 * Check if file is a media file
 */
function isMediaFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return ALL_EXTENSIONS.includes(ext);
}

/**
 * Get media type
 */
function getMediaType(filename) {
    const ext = path.extname(filename).toLowerCase();
    return VIDEO_EXTENSIONS.includes(ext) ? 'video' : 'image';
}

/**
 * Search for file usage in source code
 */
function findFileUsage(filename, srcPath) {
    const usages = [];
    const files = getAllFiles(srcPath).filter(f =>
        f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.tsx')
    );

    // Search patterns
    const searchPatterns = [
        filename,
        path.basename(filename),
        filename.replace(/\\/g, '/'),
    ];

    files.forEach(file => {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const relativePath = path.relative(SRC_PATH, file);

            searchPatterns.forEach(pattern => {
                if (content.includes(pattern)) {
                    // Find line number
                    const lines = content.split('\n');
                    lines.forEach((line, index) => {
                        if (line.includes(pattern)) {
                            usages.push({
                                file: relativePath,
                                line: index + 1,
                                snippet: line.trim().substring(0, 100)
                            });
                        }
                    });
                }
            });
        } catch (err) {
            // Skip files that can't be read
        }
    });

    return usages;
}

/**
 * Suggest section based on filename
 */
function suggestSection(filename) {
    const lowerName = filename.toLowerCase();

    for (const [pattern, suggestion] of Object.entries(SECTION_SUGGESTIONS)) {
        if (lowerName.includes(pattern.toLowerCase())) {
            return suggestion;
        }
    }

    return { pageId: null, sectionId: null, description: 'Unassigned - needs manual review' };
}

/**
 * Main inventory function
 */
async function inventoryMedia() {
    console.log('🔍 Inventorying website media files...\n');

    const inventory = {
        timestamp: new Date().toISOString(),
        summary: {
            totalFiles: 0,
            videos: 0,
            images: 0,
            directories: {}
        },
        files: []
    };

    // Directories to scan
    const directories = [
        { path: path.join(PUBLIC_PATH, 'nya_filmer'), name: 'nya_filmer' },
        { path: path.join(PUBLIC_PATH, 'optimized_videos'), name: 'optimized_videos' },
        { path: path.join(PUBLIC_PATH, 'images'), name: 'images' },
        { path: path.join(PUBLIC_PATH, 'broschyr'), name: 'broschyr' },
        { path: path.join(PUBLIC_PATH, 'skolan-bilder'), name: 'skolan-bilder' },
        { path: PUBLIC_PATH, name: 'public_root' }
    ];

    for (const dir of directories) {
        console.log(`📁 Scanning: ${dir.name}`);

        if (!fs.existsSync(dir.path)) {
            console.log(`   ⚠️ Directory not found: ${dir.path}`);
            continue;
        }

        const files = dir.name === 'public_root'
            ? fs.readdirSync(dir.path)
                .filter(f => {
                    const fullPath = path.join(dir.path, f);
                    return !fs.statSync(fullPath).isDirectory() && isMediaFile(f);
                })
                .map(f => path.join(dir.path, f))
            : getAllFiles(dir.path).filter(f => isMediaFile(f));

        inventory.summary.directories[dir.name] = files.length;

        for (const filePath of files) {
            const filename = path.basename(filePath);
            const relativePath = path.relative(PUBLIC_PATH, filePath);
            const stats = fs.statSync(filePath);
            const type = getMediaType(filename);
            const suggestion = suggestSection(filename);

            // Find usage in source code
            const usages = findFileUsage(relativePath, SRC_PATH);

            const fileInfo = {
                filename,
                relativePath: '/' + relativePath.replace(/\\/g, '/'),
                fullPath: filePath,
                type,
                sizeBytes: stats.size,
                sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
                extension: path.extname(filename).toLowerCase(),
                directory: dir.name,
                usedIn: usages,
                usageCount: usages.length,
                suggestedSection: suggestion
            };

            inventory.files.push(fileInfo);

            if (type === 'video') {
                inventory.summary.videos++;
            } else {
                inventory.summary.images++;
            }
            inventory.summary.totalFiles++;
        }
    }

    // Sort files by directory and name
    inventory.files.sort((a, b) => {
        if (a.directory !== b.directory) {
            return a.directory.localeCompare(b.directory);
        }
        return a.filename.localeCompare(b.filename);
    });

    // Write inventory to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(inventory, null, 2));

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 INVENTORY COMPLETE');
    console.log('='.repeat(60));
    console.log(`\n📁 Total files: ${inventory.summary.totalFiles}`);
    console.log(`   🎬 Videos: ${inventory.summary.videos}`);
    console.log(`   🖼️  Images: ${inventory.summary.images}`);
    console.log('\n📂 By directory:');
    for (const [dir, count] of Object.entries(inventory.summary.directories)) {
        if (count > 0) {
            console.log(`   ${dir}: ${count} files`);
        }
    }

    // Show files with usage
    const filesWithUsage = inventory.files.filter(f => f.usageCount > 0);
    const filesWithoutUsage = inventory.files.filter(f => f.usageCount === 0);

    console.log(`\n✅ Files with code references: ${filesWithUsage.length}`);
    console.log(`⚠️  Files without code references: ${filesWithoutUsage.length}`);

    // Show top files by size
    console.log('\n📦 Top 10 largest files:');
    const sortedBySize = [...inventory.files].sort((a, b) => b.sizeBytes - a.sizeBytes);
    sortedBySize.slice(0, 10).forEach((f, i) => {
        console.log(`   ${i + 1}. ${f.filename} (${f.sizeMB} MB)`);
    });

    console.log(`\n💾 Inventory saved to: ${OUTPUT_FILE}`);

    return inventory;
}

// Run
inventoryMedia().catch(console.error);
