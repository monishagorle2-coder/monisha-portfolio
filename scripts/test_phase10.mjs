import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ARTIFACTS_DIR = path.resolve('qa_artifacts');
const FRAMES_DIR = path.resolve('qa_artifacts/phase10_frames');
if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runPhase10Tests() {
  console.log('================================================================');
  console.log('PHASE 10 — REAL CURSOR-TRACKING INTERACTION QA (CHROME ENGINE)');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1440,900'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('1. Loading portfolio at http://localhost:4173/ ...');
  await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
  
  // Skip intro immediately to access hero
  const skipBtn = await page.$('.intro-skip-btn');
  if (skipBtn) {
    await skipBtn.click();
    await sleep(300);
  } else {
    await page.evaluate(() => sessionStorage.setItem('monisha_intro_viewed', 'true'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(200);
  }

  // Get canvas element and calculate eye anchor
  const canvasEl = await page.$('.anime-canvas');
  if (!canvasEl) {
    throw new Error('Could not find .anime-canvas element!');
  }
  const canvasBox = await canvasEl.boundingBox();
  console.log(`  Character canvas box: x=${canvasBox.x.toFixed(1)}, y=${canvasBox.y.toFixed(1)}, w=${canvasBox.width.toFixed(1)}, h=${canvasBox.height.toFixed(1)}`);

  // Eye anchor in screen coordinates (58.5% width, 35.9% height)
  const eyeX = canvasBox.x + canvasBox.width * 0.585;
  const eyeY = canvasBox.y + canvasBox.height * 0.359;
  console.log(`  Character eye screen anchor: (${eyeX.toFixed(1)}, ${eyeY.toFixed(1)})\n`);

  // Eye crop bounding box for zoomed visual inspection
  const eyeClipBox = {
    x: Math.round(canvasBox.x + canvasBox.width * 0.48),
    y: Math.round(canvasBox.y + canvasBox.height * 0.30),
    width: Math.round(canvasBox.width * 0.24),
    height: Math.round(canvasBox.height * 0.16)
  };

  let frameIdx = 0;
  const captureDemoFrame = async () => {
    const filename = path.join(FRAMES_DIR, `frame_${String(frameIdx).padStart(3, '0')}.png`);
    await page.screenshot({ path: filename });
    frameIdx++;
  };

  const testSteps = [
    {
      name: 'Step 1: Move cursor to the LEFT of the character',
      targetX: Math.max(80, eyeX - 350),
      targetY: eyeY,
      expectedGaze: 'left',
      fullScreenshot: 'phase10_01_gaze_left_full.png',
      eyeScreenshot: 'phase10_01_gaze_left_eye.png'
    },
    {
      name: 'Step 2: Move cursor to the RIGHT of the character',
      targetX: Math.min(1350, eyeX + 180),
      targetY: eyeY,
      expectedGaze: 'right',
      fullScreenshot: 'phase10_02_gaze_right_full.png',
      eyeScreenshot: 'phase10_02_gaze_right_eye.png'
    },
    {
      name: 'Step 3: Move cursor ABOVE the character',
      targetX: eyeX,
      targetY: Math.max(60, eyeY - 220),
      expectedGaze: 'above',
      fullScreenshot: 'phase10_03_gaze_above_full.png',
      eyeScreenshot: 'phase10_03_gaze_above_eye.png'
    },
    {
      name: 'Step 4: Move cursor BELOW the character',
      targetX: eyeX,
      targetY: Math.min(850, eyeY + 220),
      expectedGaze: 'below',
      fullScreenshot: 'phase10_04_gaze_below_full.png',
      eyeScreenshot: 'phase10_04_gaze_below_eye.png'
    },
    {
      name: 'Step 5: Move cursor AWAY from character (Leave hero / Resting position)',
      targetX: 720,
      targetY: 1300, // moves outside hero into about section
      expectedGaze: 'resting',
      fullScreenshot: 'phase10_05_gaze_away_resting_full.png',
      eyeScreenshot: 'phase10_05_gaze_away_resting_eye.png'
    }
  ];

  const verificationResults = [];

  for (const step of testSteps) {
    console.log(`--- ${step.name} ---`);
    if (step.expectedGaze === 'resting') {
      // Move mouse down out of hero into subsequent section
      await page.mouse.move(step.targetX, step.targetY, { steps: 10 });
      // Simulate mouse leaving hero and document
      await page.evaluate(() => {
        const hero = document.getElementById('hero');
        if (hero) hero.dispatchEvent(new MouseEvent('mouseleave'));
        document.dispatchEvent(new MouseEvent('mouseleave'));
      });
      // Allow lerp loop to smoothly settle to zero
      await sleep(700);
    } else {
      await page.mouse.move(step.targetX, step.targetY, { steps: 10 });
      // Allow lerp loop to interpolate smoothly
      await sleep(550);
    }

    // Read DOM measurements
    const measurements = await page.evaluate(() => {
      const canvas = document.querySelector('.anime-canvas');
      const rightPupil = document.getElementById('rightPupilGroup');
      const leftPupil = document.getElementById('leftPupilGroup');

      return {
        canvasTransform: canvas ? canvas.style.transform : 'none',
        rightPupilTransform: rightPupil ? rightPupil.style.transform : 'none',
        leftPupilTransform: leftPupil ? leftPupil.style.transform : 'none'
      };
    });

    console.log(`  Pointer: (${step.targetX}, ${step.targetY})`);
    console.log(`  Canvas Transform (Must be 'none'): "${measurements.canvasTransform}"`);
    console.log(`  Right Pupil Transform: "${measurements.rightPupilTransform}"`);
    console.log(`  Left Pupil Transform:  "${measurements.leftPupilTransform}"`);

    // Verify canvas is strictly stationary
    const isCanvasStationary = measurements.canvasTransform === 'none' || measurements.canvasTransform === '';
    console.log(`  Canvas is stationary: ${isCanvasStationary ? 'PASS' : 'FAIL (TILT DETECTED)'}`);

    // Verify pupil offset direction matches pointer direction
    let isDirectionCorrect = false;
    const match = measurements.rightPupilTransform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    if (match) {
      const px = parseFloat(match[1]);
      const py = parseFloat(match[2]);
      if (step.expectedGaze === 'left') isDirectionCorrect = px < -2.0;
      else if (step.expectedGaze === 'right') isDirectionCorrect = px > 2.0;
      else if (step.expectedGaze === 'above') isDirectionCorrect = py < -1.5;
      else if (step.expectedGaze === 'below') isDirectionCorrect = py > 1.5;
      else if (step.expectedGaze === 'resting') isDirectionCorrect = Math.abs(px) < 0.15 && Math.abs(py) < 0.15;
    }
    console.log(`  Pupil gaze direction is correct: ${isDirectionCorrect ? 'PASS' : 'FAIL'}\n`);

    verificationResults.push({
      step: step.name,
      pointer: { x: step.targetX, y: step.targetY },
      expectedGaze: step.expectedGaze,
      measurements,
      isCanvasStationary,
      isDirectionCorrect
    });

    // Capture full page screenshot
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, step.fullScreenshot) });
    // Capture zoomed eye crop screenshot
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, step.eyeScreenshot),
      clip: eyeClipBox
    });

    // Record demo frames
    await captureDemoFrame();
    await captureDemoFrame();
  }

  // Save machine-readable test results
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'phase10_verification_results.json'),
    JSON.stringify(verificationResults, null, 2)
  );

  await browser.close();

  // Compile frames into animated GIF
  console.log('Compiling Phase 10 demo GIF...');
  const pythonScript = `
import glob
from PIL import Image

frame_files = sorted(glob.glob('qa_artifacts/phase10_frames/frame_*.png'))
if frame_files:
    images = []
    for f in frame_files:
        im = Image.open(f).convert('RGB').resize((960, 540), Image.Resampling.LANCZOS)
        images.append(im)
    images[0].save(
        'qa_artifacts/phase10_gaze_tracking_demo.gif',
        save_all=True,
        append_images=images[1:],
        duration=350,
        loop=0
    )
    print('Saved qa_artifacts/phase10_gaze_tracking_demo.gif')
`;
  fs.writeFileSync('scripts/compile_phase10_gif.py', pythonScript);
  execSync('python scripts/compile_phase10_gif.py');

  console.log('================================================================');
  console.log('PHASE 10 AUTOMATION COMPLETE');
  console.log('================================================================');
}

runPhase10Tests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
