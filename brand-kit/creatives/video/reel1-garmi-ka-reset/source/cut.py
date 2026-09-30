import numpy as np
from PIL import Image, ImageFilter
R='/mnt/project-files/website/assets/references/'
def cut(src,out,dbg):
    im=Image.open(R+src).convert('RGB'); a=np.asarray(im).astype(float); H,Wd=a.shape[:2]
    L=a[:,20:140].mean(1); Rr=a[:,-140:-20].mean(1)
    xs=np.linspace(0,1,Wd)[None,:,None]
    bg=L[:,None,:]*(1-xs)+Rr[:,None,:]*xs
    d=np.abs(a-bg).sum(2)
    d=np.asarray(Image.fromarray(np.clip(d*4,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))).astype(float)/4
    m=d>14
    cx=Wd//2
    hw=np.zeros(H); 
    for y in range(H):
        idx=np.where(m[y])[0]
        if len(idx)<6: continue
        l=idx.min(); r=idx.max()
        hw[y]=(r-l)/2; 
    print(src,H,Wd)
    return hw,a,m,d
for s in ['09-hero-bottle-a1.jpg','11-jeera-masala-a2.jpg']:
    hw,a,m,d=cut(s,None,None)
    ys=[i for i in range(0,len(hw),40)]
    print([ (y,int(hw[y])) for y in ys])
    Image.fromarray((m*255).astype(np.uint8)).save(s[:2]+'_mask.png')
