
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
