import numpy as np
from PIL import Image
from scipy import ndimage as nd
def load(n): return np.asarray(Image.open(f'gemini-photos/{n}.jpg').convert('RGB')).astype(float)
def bgmask(a,thr):
    bg=np.median(np.concatenate([a[:8].reshape(-1,3),a[-8:].reshape(-1,3),a[:,:8].reshape(-1,3),a[:,-8:].reshape(-1,3)]),0)
    d=np.sqrt(((a-bg)**2).sum(-1))
    # also treat near-white with low saturation as bg
    fg=d>thr
    return fg,d
def clean(fg,minsz=4000,keep_largest=False,erode=1):
    fg=nd.binary_opening(fg,iterations=1)
    lab,n=nd.label(fg);sz=nd.sum(fg,lab,range(1,n+1))
    if keep_largest: fg=lab==(np.argmax(sz)+1)
    else: fg=np.isin(lab,[i+1 for i,s in enumerate(sz) if s>=minsz])
    fg=nd.binary_fill_holes(fg)
    if erode: fg=nd.binary_erosion(fg,iterations=erode)
    return fg
def save(a,m,name,soft=1.2,pad=8):
    al=np.clip(nd.gaussian_filter(m.astype(float),soft),0,1)
    ys,xs=np.where(m);y0,y1,x0,x1=max(ys.min()-pad,0),ys.max()+pad,max(xs.min()-pad,0),xs.max()+pad
    rgba=np.dstack([a,al*255]).astype(np.uint8)[y0:y1,x0:x1]
    Image.fromarray(rgba).save(f'assets/{name}.png');print(name,rgba.shape)
# lemon
a=load('lemon');fg,_=bgmask(a,28);save(a,clean(fg,keep_largest=True),'g_lemon')
# salt heap
a=load('salt');fg,_=bgmask(a,22);m=clean(fg,keep_largest=True,erode=2);save(a,m,'g_salt_heap',1.5)
# jeera heap + seeds
a=load('jeera');fg,_=bgmask(a,40);fg=nd.binary_opening(fg,iterations=1)
lab,n=nd.label(fg);sz=nd.sum(fg,lab,range(1,n+1));big=np.argmax(sz)+1
save(a,nd.binary_fill_holes(lab==big),'g_jeera_heap',1.0)
k=0
for i,s in enumerate(sz):
    if i+1==big or s<900 or s>6000: continue
    m=nd.binary_fill_holes(lab==i+1);ys,xs=np.where(m)
    h,w=ys.ptp(),xs.ptp()
    if max(h,w)<45: continue
    save(a,m,f'g_seed{k}',0.8,4);k+=1
print('seeds',k)
# mint + ice
a=load('mintice');fg,_=bgmask(a,18)
r,g,b=a[...,0],a[...,1],a[...,2]
green=(g>r+20)&(g>b+5)
X=np.arange(a.shape[1])[None,:].repeat(a.shape[0],0)
mint=clean(green&(X>405),keep_largest=True,erode=1)
save(a,mint,'g_mint')
ice=fg&(X<470)&~nd.binary_dilation(mint,iterations=3)
Y=np.arange(a.shape[0])[:,None].repeat(a.shape[1],1)
ice=clean(ice&(Y<760),keep_largest=True,erode=1)
save(a,ice,'g_ice')
