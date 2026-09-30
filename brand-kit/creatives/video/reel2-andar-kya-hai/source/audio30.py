import numpy as np, wave
exec(open('/tmp/claude-0/-home-claude-Taazu/2b3e42bc-73bd-52c0-9df7-90a585bbdd79/scratchpad/reel/audio.py').read().split('BPM=125')[0].replace('DUR=30.0','DUR=30.0'))
BPM=120; beat=60/BPM
notes=[440,493.88,587.33,659.25,587.33,493.88,440,369.99]
roots=[73.42,98.0,110.0,73.42]
def pop(t0,t1,gain=1.0,melody=True):
    b=0;t=t0
    while t<t1-1e-6:
        for s in range(8):
            ts=t+s*beat/2
            if ts>=t1: break
            if s in (0,4): add(kick(),ts,.7*gain)
            if s in (2,6): add(clack(),ts,.6*gain,-.3); add(clack(),ts+.01,.45*gain,.3)
            if s in (3,7): add(dha(),ts,.35*gain,-.1)
            add(shaker(),ts,.16*gain,.4 if s%2 else -.4); add(shaker(),ts+beat/4,.1*gain,.2)
        add(bass(roots[b%4],beat*4*.95),t,.45*gain)
        if melody:
            for k in range(4):
                f=notes[(b*4+k)%8]; add(reed(f,beat*.9),t+k*beat+(beat/2 if k%2 else 0),.16*gain,.1)
        t+=beat*4;b+=1
def clink(t,f=2600):
    for k,(dt,ff) in enumerate([(0,f),(.09,f*1.33),(.21,f*.9)]):
        n=int(.35*SR); x=np.sin(2*np.pi*ff*np.arange(n)/SR)*env(n,.0005,.08)+.5*np.sin(2*np.pi*ff*2.7*np.arange(n)/SR)*env(n,.0005,.04); add(x,t+dt,.25)
def rain(t,dur):
    for k in range(40): add(tick(),t+rng.uniform(0,dur),.35,rng.uniform(-.6,.6))
# timeline (30 s)
add(pad([146.83,220.0,293.66],3.2),0,.3); add(noise_sweep(2.8,200,4000),0.2,.2)
for k in range(6): add(clack(),0.2+k*.4,.25)
add(whoosh(.6),2.4,.45)
add(impact(),3.0,.6); add(splash(),3.6,.8); add(impact()[:int(.5*SR)],3.6,.5)
pop(3.0,25.0)
add(whoosh(.35),4.9,.35); rain(5.0,1.0); add(impact()[:int(.4*SR)],5.35,.4)
add(whoosh(.35),6.9,.35)
for k in range(14): add(clack(),7.15+rng.uniform(0,.45),.35,rng.uniform(-.6,.6))
add(impact()[:int(.4*SR)],7.2,.4)
add(whoosh(.8),8.9,.3); add(impact()[:int(.4*SR)],9.4,.35)
clink(11.2); clink(11.7,2300); clink(12.1,2900); add(impact()[:int(.4*SR)],11.5,.3)
add(noise_sweep(1.7,300,8000),13.0,.3); add(sweep_tone(200,1400,1.7)*.08,13.0,1)
add(impact(),15.1,.7); add(splash(),15.1,.8)
add(whoosh(.5),18.6,.45)
for o in [22.5,23.05,23.6]: add(impact()[:int(.6*SR)],o,.5); add(clack(),o,.7)
add(impact(),25.0,.55); add(pad([293.66,369.99,440.0,587.33],4.9),25.0,.4)
pop(25.2,28.8,gain=.45,melody=False)
ir=rng.standard_normal(int(1.1*SR))*np.exp(-np.arange(int(1.1*SR))/SR/.35); ir=lp(ir,5000)/np.sqrt((ir**2).sum())
for c in range(2): mix[:,c]+=.18*fftconvolve(mix[:,c],ir)[:N]
mix=np.tanh(mix/np.abs(mix).max()*1.6); fo=int(1.2*SR); mix[-fo:]*=np.linspace(1,0,fo)[:,None]; mix=mix/np.abs(mix).max()*.89
w=wave.open('audio30.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype('<i2').tobytes()); w.close(); print('ok')
