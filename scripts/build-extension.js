import fs from 'fs';
import path from 'path';
import JavaScriptObfuscator from 'javascript-obfuscator';
import archiver from 'archiver';

const ROOT_DIR = path.resolve();
const EXT_DIR = path.join(ROOT_DIR, 'extension');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DIST_EXT_DIR = path.join(DIST_DIR, 'extension');
const ZIP_OUTPUT = path.join(DIST_DIR, 'yt-accelerator-extension-v1.0.0.zip');

console.log('🚀 Starting Extension Build & Obfuscation Pipeline...');

// Ensure clean dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_EXT_DIR, { recursive: true });

// Helper to recursively copy directories
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Copy raw extension files
copyRecursive(EXT_DIR, DIST_EXT_DIR);
console.log('📁 Copied raw extension files to dist/extension');

// 2. Obfuscate Core Scripts
const filesToObfuscate = ['interceptor.js', 'content.js'];

filesToObfuscate.forEach(file => {
  const filePath = path.join(DIST_EXT_DIR, file);
  if (fs.existsSync(filePath)) {
    const code = fs.readFileSync(filePath, 'utf-8');
    console.log(`🔒 Obfuscating ${file}...`);

    const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      numbersToExpressions: true,
      simplify: true,
      stringArray: true,
      stringArrayThreshold: 0.75,
      stringArrayEncoding: ['base64'],
      splitStrings: true,
      splitStringsChunkLength: 10,
      transformObjectKeys: false, // Keep property names compatible with YouTube DOM
      selfDefending: true,
      deadCodeInjection: false
    });

    fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode(), 'utf-8');
    console.log(`✅ Obfuscated ${file} successfully.`);
  }
});

// 3. Create ZIP package for Chrome Web Store / Distribution
const output = fs.createWriteStream(ZIP_OUTPUT);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`====================================================`);
  console.log(`🎉 Build complete! Package created:`);
  console.log(`📦 ${ZIP_OUTPUT} (${(archive.pointer() / 1024).toFixed(2)} KB)`);
  console.log(`📂 Unpacked extension folder: ${DIST_EXT_DIR}`);
  console.log(`====================================================`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(DIST_EXT_DIR, false);
archive.finalize();
