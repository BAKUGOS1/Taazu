import numpy as np, colorsys
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from scipy.spatial import ConvexHull
exec(open('cutgem.py').read().split('# lemon')[0])
def hsv(a):
    mx=a.max(-1);mn=a.min(-1);s=(mx-mn)/np.maximum(mx,1);return s,mx
def largest(m):
    lab,n=nd.label(m);sz=nd.sum(m,lab,range(1,n+1));return lab==(np.argmax(sz)+1)
# lemon: saturated region
a=load('lemon');s,v=hsv(a)
m=largest(nd.binary_opening(s>0.13,iterations=2));m=nd.binary_fill_holes(nd.binary_closing(m,iterations=4));m=nd.binary_erosion(m,iterations=2)
save(a,m,'g_lemon',1.2)
# salt
a=load('salt');s,v=hsv(a);fg,d=bgmask(a,0)
m=(s>0.14)|(d>55)
m=largest(nd.binary_closing(nd.binary_opening(m,iterations=2),iterations=8));m=nd.binary_fill_holes(m);m=nd.binary_erosion(m,iterations=4)
save(a,m,'g_salt_heap',1.5)
# jeera
a=load('jeera');s,v=hsv(a)
fgm=nd.binary_opening((s>0.28)&(v<235)|(v<150),iterations=1)
lab,n=nd.label(fgm);sz=nd.sum(fgm,lab,range(1,n+1));big=np.argmax(sz)+1
heap=nd.binary_fill_holes(nd.binary_closing(lab==big,iterations=2))
save(a,heap,'g_jeera_heap',0.9)
k=0;info=[]
for i,sv in enumerate(sz):
    if i+1==big or sv<700: continue
    mm=nd.binary_fill_holes(nd.binary_closing(lab==i+1,iterations=2));ys,xs=np.where(mm)
    if max(np.ptp(ys),np.ptp(xs))<40: continue
    save(a,mm,f'g_seed{k}',0.8,4);k+=1
print('seeds',k)
# ice
a=load('mintice');fg,d=bgmask(a,20)
r,g,b=a[...,0],a[...,1],a[...,2]
X=np.arange(1024)[None,:].repeat(1024,0);Y=np.arange(1024)[:,None].repeat(1024,1)
green=(g>r+20)&(g>b+5)
mint=nd.binary_dilation(largest(green&(X>405)),iterations=4)
body=largest(nd.binary_opening(fg&(Y<735)&(X<520)&~mint,iterations=2))
pts=np.argwhere(body);hull=ConvexHull(pts[:,::-1])
poly=[tuple(pts[i,::-1]) for i in hull.vertices]
im=Image.new('L',(1024,1024),0);ImageDraw.Draw(im).polygon(poly,fill=255)
ice=(np.asarray(im)>0)&~mint&(Y<722)&(X<414);ice=nd.binary_erosion(ice,iterations=2)
save(a,ice,'g_ice',1.2)
