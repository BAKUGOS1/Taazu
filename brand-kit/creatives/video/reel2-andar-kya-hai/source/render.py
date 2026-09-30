import sys, subprocess, asyncio, io
from playwright.sync_api import sync_playwright
import imageio_ffmpeg
from PIL import Image
W=__import__("os").path.dirname(__import__("os").path.abspath(__file__))+"/"
mode=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome' ,args=['--allow-file-access-from-files'])
    pg=b.new_page(viewport={'width':1080,'height':1920})
    pg.goto('file://'+W+'reel2.html?capture=1'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(800)
    if mode=='sheet':
        times=[float(x) for x in sys.argv[2].split(',')]
        ims=[]
        for t in times:
            pg.evaluate(f'render({t})'); pg.wait_for_timeout(60)
            ims.append(Image.open(io.BytesIO(pg.screenshot(type='jpeg',quality=80))).resize((270,480)))
        cols=min(6,len(ims)); rows=(len(ims)+cols-1)//cols
        sh=Image.new('RGB',(cols*270,rows*480),'white')
        for i,im in enumerate(ims): sh.paste(im,((i%cols)*270,(i//cols)*480))
        sh.save(W+sys.argv[3])
    else:
        out=sys.argv[2]; fps=30
        ff=subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-f','image2pipe','-framerate',str(fps),'-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','slow','-movflags','+faststart',out],stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
        N=int(pg.evaluate('DUR')*fps)
        for i in range(N):
            pg.evaluate(f'render({i/fps})')
            ff.stdin.write(pg.screenshot(type='jpeg',quality=95))
        ff.stdin.close(); ff.wait(); print('done',out)
    b.close()
