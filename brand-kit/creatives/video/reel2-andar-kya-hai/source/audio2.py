import numpy as np, wave
exec(open('/tmp/claude-0/-home-claude-Taazu/2b3e42bc-73bd-52c0-9df7-90a585bbdd79/scratchpad/reel/audio.py').read().split('BPM=125')[0].replace('DUR=30.0','DUR=20.0'))
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
# timeline
add(whoosh(.5),0.0,.4); add(splash(),0.6,.8); add(impact()[:int(.5*SR)],0.6,.5)
pop(0.6,17.2)
add(whoosh(.35),1.95,.35); rain(2.05,.9); add(impact()[:int(.4*SR)],2.35,.4)
add(whoosh(.35),3.95,.35)
for k in range(12): add(clack(),4.15+rng.uniform(0,.35),.35,rng.uniform(-.6,.6))
add(impact()[:int(.4*SR)],4.2,.4)
add(whoosh(.6),5.95,.3); add(impact()[:int(.4*SR)],6.2,.35)
clink(7.1); clink(7.35,2300); clink(7.55,2900)
add(noise_sweep(1.35,300,8000),8.0,.3); add(sweep_tone(200,1400,1.35)*.08,8.0,1)
add(impact(),9.7,.7); add(splash(),9.7,.8)
add(whoosh(.5),12.8,.45)
for o in [15.5,16.05,16.6]: add(impact()[:int(.6*SR)],o,.5); add(clack(),o,.7)
add(impact(),17.2,.55); add(pad([293.66,369.99,440.0,587.33],2.8),17.2,.4)
ir=rng.standard_normal(int(1.1*SR))*np.exp(-np.arange(int(1.1*SR))/SR/.35); ir=lp(ir,5000)/np.sqrt((ir**2).sum())
for c in range(2): mix[:,c]+=.18*fftconvolve(mix[:,c],ir)[:N]
mix=np.tanh(mix/np.abs(mix).max()*1.6); fo=int(1.2*SR); mix[-fo:]*=np.linspace(1,0,fo)[:,None]; mix=mix/np.abs(mix).max()*.89
w=wave.open('audio2.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype('<i2').tobytes()); w.close(); print('ok')
