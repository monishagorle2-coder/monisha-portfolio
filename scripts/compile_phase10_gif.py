
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
