import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/favicon.svg');
const svgBuffer = fs.readFileSync(svgPath);

const densities = [
  { dir: 'mipmap-mdpi', iconSize: 48, fgSize: 108, innerLogo: 72 },
  { dir: 'mipmap-hdpi', iconSize: 72, fgSize: 162, innerLogo: 108 },
  { dir: 'mipmap-xhdpi', iconSize: 96, fgSize: 216, innerLogo: 144 },
  { dir: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324, innerLogo: 216 },
  { dir: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432, innerLogo: 288 }
];

const resDir = path.resolve('android/app/src/main/res');

async function run() {
  for (const d of densities) {
    const targetFolder = path.join(resDir, d.dir);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    // 1. ic_launcher.png
    await sharp(svgBuffer)
      .resize(d.iconSize, d.iconSize)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher.png'));

    // 2. ic_launcher_round.png
    // Circular mask
    const circleSvg = Buffer.from(
      `<svg width="${d.iconSize}" height="${d.iconSize}"><circle cx="${d.iconSize / 2}" cy="${d.iconSize / 2}" r="${d.iconSize / 2}" fill="#fff" /></svg>`
    );
    await sharp(svgBuffer)
      .resize(d.iconSize, d.iconSize)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_round.png'));

    // 3. ic_launcher_foreground.png
    // Centered innerLogo inside fgSize transparent canvas
    const innerBuffer = await sharp(svgBuffer)
      .resize(d.innerLogo, d.innerLogo)
      .png()
      .toBuffer();

    const topOffset = Math.round((d.fgSize - d.innerLogo) / 2);
    const leftOffset = Math.round((d.fgSize - d.innerLogo) / 2);

    await sharp({
      create: {
        width: d.fgSize,
        height: d.fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: innerBuffer, top: topOffset, left: leftOffset }])
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${d.dir}`);
  }

  // Also update drawable splash screen
  const splashPath = path.join(resDir, 'drawable/splash.png');
  if (fs.existsSync(path.dirname(splashPath))) {
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(splashPath);
    console.log('Updated drawable/splash.png');
  }

  console.log('All Android icons successfully generated from public/favicon.svg!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
