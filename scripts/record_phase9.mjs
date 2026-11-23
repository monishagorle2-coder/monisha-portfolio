import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const FRAMES_DIR = path.resolve('qa_artifacts/frames');
if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function recordCinematicAndTracking() {
  console.log('Recording cinematic intro and cursor tracking demonstration frames...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1280,720'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });

  let frameIdx = 0;
  const captureFrame = async () => {
    const filename = path.join(FRAMES_DIR, `frame_${String(frameIdx).padStart(3, '0')}.png`);
    await page.screenshot({ path: filename });
    frameIdx++;
  };

  // 1. Capture intro progression (every 220ms for ~4 seconds)
  for (let i = 0; i < 18; i++) {
    await captureFrame();
    await sleep(220);
  }

  // Ensure intro has completed and dissolved into hero
  await sleep(400);

  // 2. Capture mouse tracking across the hero
  const mousePath = [
    { x: 640, y: 360, wait: 200 }, // Center neutral
    { x: 200, y: 150, wait: 250 }, // Top-left (eyebrow)
    { x: 1050, y: 120, wait: 250 }, // Top-right (above character)
    { x: 1120, y: 550, wait: 250 }, // Bottom-right (desk workstation)
    { x: 220, y: 600, wait: 250 }, // Bottom-left (CTA buttons)
    { x: 640, y: 360, wait: 250 }  // Return to center
  ];

  for (const pt of mousePath) {
    await page.mouse.move(pt.x, pt.y, { steps: 12 });
    await sleep(pt.wait);
    await captureFrame();
  }

  await browser.close();
  console.log(`Successfully recorded ${frameIdx} frames in ${FRAMES_DIR}`);

  // Run python script to compile into GIF
  console.log('Compiling frames into animated GIF using Python PIL...');
  const pythonScript = `
import glob, os
from PIL import Image

frame_files = sorted(glob.glob('qa_artifacts/frames/frame_*.png'))
if frame_files:
    # Resize frames to 960x540 for fast loading and crisp resolution
    images = []
    for f in frame_files:
        im = Image.open(f).convert('RGB').resize((960, 540), Image.Resampling.LANCZOS)
        images.append(im)
    
    # Save as animated GIF with 220ms per frame
    images[0].save(
        'qa_artifacts/phase9_cinematic_and_tracking_demo.gif',
        save_all=True,
        append_images=images[1:],
        duration=220,
        loop=0
    )
    print('Animated demonstration GIF saved: qa_artifacts/phase9_cinematic_and_tracking_demo.gif')
`;
  fs.writeFileSync('scripts/compile_gif.py', pythonScript);
  execSync('python scripts/compile_gif.py');
  console.log('Done!');
}

recordCinematicAndTracking().catch(err => {
  console.error('Error recording demo:', err);
  process.exit(1);
});
