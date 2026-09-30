W_='/tmp/claude-0/-home-claude-Taazu/2b3e42bc-73bd-52c0-9df7-90a585bbdd79/scratchpad/reel/assets/'
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
exec(open('cut.py').read().split('for s in')[0])
from scipy.ndimage import median_filter
for s,name in [('09-hero-bottle-a1.jpg','bottle_classic'),('11-jeera-masala-a2.jpg','bottle_jeera')]:
    hw,a,m,d=cut(s,0,0); H,Wd=m.shape; C=450
    w=np.zeros(H)
    for y in range(H):
        idx=np.where(m[y])[0]
        if len(idx)>=6: w[y]=max(idx.max()-C, C-idx.min())
    top=152; bot=1080
    w[:top]=0; w[bot:]=0
    w[top:bot]=median_filter(w[top:bot],size=9)
    ref=np.median(w[930:990]); w[990:bot]=ref+1; w=np.maximum(w-2.5,0)
    mask=Image.new('L',(Wd,H),0); dr=ImageDraw.Draw(mask)
    for y in range(top,bot):
        ww=w[y]
        # round the base
        k=bot-y
        if k<30: ww=ww-(30-np.sqrt(max(0,30**2-(30-k)**2)))
        if ww>0: dr.line([(C-ww+1.5,y),(C+ww-1.5,y)],fill=255)
    mask=mask.filter(ImageFilter.GaussianBlur(1.3))
    img=Image.open(R+s).convert('RGB'); img.putalpha(mask)
    bb=mask.getbbox(); img=img.crop(bb); img.save(W_+name+'.png'); print(name,img.size)
