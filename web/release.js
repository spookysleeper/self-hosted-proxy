const fs = require('fs');
const path = require('path');

const version = '1.0.0';
const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, '../public/assets/js');

const libraries = [
  { name: 'runtime', file: 'runtime.min.js' },
  { name: 'admin', file: 'admin.min.js' }
];

console.log('📦 Releasing libraries to public/assets/js...\n');

libraries.forEach(lib => {
  const srcFile = path.join(distDir, lib.file);
  const destDir = path.join(publicDir, lib.name, version);
  const destFile = path.join(destDir, lib.file);
  const mapSrcFile = srcFile + '.map';
  const mapDestFile = destFile + '.map';

  // Create destination directory
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy JS file
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`✅ ${lib.name}: ${lib.file} → ${destFile}`);
  } else {
    console.error(`❌ ${lib.name}: ${srcFile} not found`);
  }

  // Copy source map if exists
  if (fs.existsSync(mapSrcFile)) {
    fs.copyFileSync(mapSrcFile, mapDestFile);
    console.log(`   Source map copied`);
  }
});

console.log('\n🎉 Release complete!');
