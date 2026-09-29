import numpy as np, math
from PIL import Image
BK='/home/claude/Taazu/brand-kit/'
W='/tmp/claude-0/-home-claude-Taazu/2b3e42bc-73bd-52c0-9df7-90a585bbdd79/scratchpad/reel/assets/'
def c2a(im, bg=(255,255,255)):
    a=np.asarray(im.convert('RGB')).astype(float); bg=np.array(bg,float)
    d=np.where(a>bg[None,None,:], (a-bg)/np.maximum(255-bg,1), (bg-a)/np.maximum(bg,1))
    al=d.max(axis=2); al=np.clip(al*1.15,0,1)  # slight boost
    al2=np.maximum(al,1e-4)[...,None]
    col=(a-(1-al2)*bg)/al2
    out=np.dstack([np.clip(col,0,255),al*255]).astype(np.uint8)
    return Image.fromarray(out,'RGBA')
logo=Image.open(BK+'logos/taazu-logo-white-c4.png')
c2a(logo.crop((360,180,670,610))).save(W+'drop.png')
full=c2a(logo.crop((210,180,850,850))); full.save(W+'logo.png')
# wordmark only
c2a(logo.crop((210,620,850,850))).save(W+'wordmark.png')
# cylindrical wraps
for fl in ['classic','jeera']:
    L=np.asarray(Image.open(BK+f'labels/taazu-label-{fl}-trim.png').convert('RGB')).astype(np.float32)
    H,Wd=L.shape[:2]
    ow=700; oh=int(ow*95/60)
    ys=(np.arange(oh)/(oh-1)*(H-1)).astype(int)
    u0=0.6
    for deg in range(-40,41,2):
        x=np.linspace(-0.999,0.999,ow)
        th=np.arcsin(x)+math.radians(deg)
        u=(u0+th*(188/181)/(2*math.pi))%1.0
        xs=(u*(Wd-1)).astype(int)
        img=L[ys][:,xs]
        Image.fromarray(img.astype(np.uint8)).save(W+f'wrap/{fl}_{deg}.jpg',quality=90)
print('ok')
