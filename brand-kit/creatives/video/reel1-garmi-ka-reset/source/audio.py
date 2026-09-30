import numpy as np, wave
from scipy.signal import butter, sosfilt, fftconvolve
SR=44100; DUR=30.0; N=int(SR*DUR)
rng=np.random.default_rng(5)
mix=np.zeros((N,2))
MAP=[[0,0],[2.8,2.25],[10.4,2.21],[14.4,5.4],[16.0,7.0],[17.7,7.6],[18.1,8.0],[19.5,9.4],[21.0,9.9],[21.4,10.3],[23.3,12.2],[24.7,12.4],[24.9,12.6],[27.1,14.8],[30,15]]
def newT(o,lo=10.4):
    for i in range(1,len(MAP)):
        a0,b0=MAP[i-1];a1,b1=MAP[i]
        if a0<lo: continue
        if b0<=o<=b1 and b1>b0: return a0+(a1-a0)*(o-b0)/(b1-b0)
def env(n,a=0.003,d=0.2):
    t=np.arange(n)/SR; e=np.exp(-t/d); ai=int(a*SR)
    if ai>0: e[:ai]*=np.linspace(0,1,ai)
    return e
def add(sig,t,g=1.0,pan=0.0):
    i=int(t*SR); 
    if i>=N: return
    sig=sig[:N-i]; l=np.cos((pan+1)*np.pi/4); r=np.sin((pan+1)*np.pi/4)
    mix[i:i+len(sig),0]+=sig*g*l*1.414; mix[i:i+len(sig),1]+=sig*g*r*1.414
def bp(x,lo,hi,o=2): return sosfilt(butter(o,[lo,hi],'band',fs=SR,output='sos'),x)
def lp(x,f,o=2): return sosfilt(butter(o,f,'low',fs=SR,output='sos'),x)
def hp(x,f,o=2): return sosfilt(butter(o,f,'high',fs=SR,output='sos'),x)
def sweep_tone(f0,f1,dur,shape='sin'):
    n=int(dur*SR); f=np.geomspace(f0,f1,n); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)
# instruments
def kick(dur=.35,f0=130,f1=45): return sweep_tone(f0,f1,dur)*env(int(dur*SR),.001,dur/3.5)
def dha(): n=int(.35*SR); return .9*sweep_tone(110,70,.35)*env(n,.002,.12)+.25*lp(rng.standard_normal(n),600)*env(n,.001,.03)
def ta(): n=int(.18*SR); return .45*sweep_tone(380,330,.18)*env(n,.001,.05)+.35*bp(rng.standard_normal(n),1500,4000)*env(n,.001,.02)
def clack(): n=int(.08*SR); return .6*bp(rng.standard_normal(n),1800,5000,4)*env(n,.0005,.012)+.4*np.sin(2*np.pi*2100*np.arange(n)/SR)*env(n,.0005,.015)
def shaker(): n=int(.06*SR); return hp(rng.standard_normal(n),6000)*env(n,.005,.015)
def reed(f,dur):
    n=int(dur*SR); t=np.arange(n)/SR; vib=1+.006*np.sin(2*np.pi*5.5*t)*np.clip(t/0.15,0,1)
    ph=2*np.pi*np.cumsum(f*vib)/SR; x=sum(np.sin(k*ph)/k for k in (1,2,3,4,5,6,7))*.6
    x=lp(x,2600); e=np.minimum(1,t/0.03)*np.exp(-np.maximum(0,t-dur*0.6)/0.08); return x*e
def bass(f,dur):
    n=int(dur*SR); t=np.arange(n)/SR; x=np.sin(2*np.pi*f*t)+.3*np.sin(4*np.pi*f*t); return lp(x,400)*env(n,.005,dur*.6)
def pad(fs,dur):
    n=int(dur*SR); t=np.arange(n)/SR; x=np.zeros(n)
    for f in fs:
        for dt in (-0.4,0,0.4): x+=2*((t*(f+dt))%1)-1
    x=lp(x/len(fs)/3,900); a=np.minimum(1,t/0.6)*np.minimum(1,(dur-t)/0.6); return x*a
def noise_sweep(dur,f0,f1,rise=True):
    n=int(dur*SR); x=rng.standard_normal(n); out=np.zeros(n); cs=1024
    fr=np.geomspace(f0,f1,n//cs+1)
    for k in range(0,n,cs):
        c=fr[k//cs]; out[k:k+cs]=bp(x[k:k+cs],max(40,c*.6),min(18000,c*1.6),2)
    t=np.arange(n)/n; e=(t**2 if rise else (1-t)**2)*.9+.1; return out*e
def whoosh(dur=.45): return noise_sweep(dur,300,6000)*np.sin(np.pi*np.arange(int(dur*SR))/int(dur*SR))
def impact():
    n=int(1.4*SR); b=kick(1.4,90,32)*1.2; nz=lp(rng.standard_normal(n),3000)*env(n,.001,.12)*.5; return b+nz
def splash():
    n=int(1.2*SR); nz=hp(rng.standard_normal(n),800)*env(n,.002,.18)*.7
    bl=sweep_tone(900,180,.25)*env(int(.25*SR),.001,.08)*.6; x=nz.copy(); x[:len(bl)]+=bl
    for k in range(10): 
        s=int(rng.uniform(.05,.6)*SR); m=int(.05*SR)
        if s+m<n: x[s:s+m]+=np.sin(2*np.pi*rng.uniform(1500,3500)*np.arange(m)/SR)*env(m,.001,.012)*.25
    return x
def tick(): n=int(.03*SR); return bp(rng.standard_normal(n),3000,8000)*env(n,.0005,.005)

BPM=125; beat=60/BPM; step=beat/3
mel1=[(0,440,2),(2,493.88,1),(3,440,2),(5,369.99,1),(6,329.63,3),(9,293.66,3)]
mel2=[(0,587.33,2),(2,493.88,1),(3,440,3),(6,493.88,2),(8,440,1),(9,369.99,3)]
roots=[73.42,73.42,98.0,110.0]
def groove(t0,t1,full=True,melody=True,gain=1.0,slowdown=None):
    bar=12*step; b=0; t=t0
    while t<t1-1e-6:
        for s in range(12):
            ts=t+s*step
            if ts>=t1: break
            g=gain
            if slowdown and ts>slowdown[0]: g*=max(0,1-(ts-slowdown[0])/(slowdown[1]-slowdown[0]))
            if g<=0: continue
            if s in (0,3,6,9): add(dha(),ts,.8*g,-.1)
            if s==8: add(dha(),ts,.5*g,-.1)
            if s in (2,5,10,11): add(ta(),ts,.55*g,.15)
            if s in (3,9): add(clack(),ts,.7*g,-.35); add(clack(),ts+.012,.5*g,.35)
            if full: add(shaker(),ts,.18*g,.4 if s%2 else -.4)
            if full and s in (0,6): add(kick(),ts,.55*g)
        if full: add(bass(roots[b%4],bar*.95),t,.45*gain)
        if melody:
            for (s,f,l) in (mel1 if b%2==0 else mel2):
                if t+s*step<t1: add(reed(f*(1 if b%4<2 else 1.0),l*step*.95),t+s*step,.22*gain,.1)
        t+=bar; b+=1
# ---- timeline ----
# heat: drone + ticks
add(pad([146.83,220.0],3.2),0,.35)
add(noise_sweep(2.8,200,1500),0,.12)
for k in range(12): add(tick(),0.35+k*(1.0/12),.4)
add(impact(),1.35,.35)
# garba 2.8-8.0 (slowdown/tired 6.9-8.0)
add(whoosh(.4),2.6,.35)
groove(2.8,8.0,full=True,melody=True,gain=.9,slowdown=(6.6,7.9))
add(sweep_tone(300,60,1.0)*env(int(1.0*SR),.01,.5),6.9,.25)  # power-down
# montage hits
for k in range(4): tk=8.0+k*.6; add(impact()[:int(.5*SR)],tk,.55); add(whoosh(.3),tk-.25,.3); add(clack(),tk,.6)
# drop: riser then splash
imp=newT(3.4); print('impact at',imp)
add(noise_sweep(imp-10.4,300,9000),10.4,.3); add(sweep_tone(200,1200,imp-10.4)*.08,10.4,1)
add(impact(),imp,.7); add(splash(),imp,.8)
# main groove from impact to end
g0=imp+0.05
groove(g0,29.2,full=True,melody=True,gain=1.0,slowdown=(28.0,29.2))
for tt in [14.4,18.1]: add(whoosh(.5),tt-.3,.45)
for o in [10.75,11.3,11.85]: add(impact()[:int(.6*SR)],newT(o),.5); add(clack(),newT(o),.7)
add(impact(),24.9,.55); add(whoosh(.5),24.6,.4)
add(pad([293.66,369.99,440.0,587.33],4.8),25.2,.35)
# master: reverb, soft clip, normalize, fade
ir=rng.standard_normal(int(1.1*SR))*np.exp(-np.arange(int(1.1*SR))/SR/.35); ir=lp(ir,5000)/np.sqrt((ir**2).sum())
for c in range(2): mix[:,c]+=.18*fftconvolve(mix[:,c],ir)[:N]
mix=np.tanh(mix/np.abs(mix).max()*1.6)
fo=int(1.2*SR); mix[-fo:]*=np.linspace(1,0,fo)[:,None]
mix=mix/np.abs(mix).max()*.89
w=wave.open('taazu_audio.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype('<i2').tobytes()); w.close(); print('wav ok')
