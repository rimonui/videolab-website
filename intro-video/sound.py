# Synthesizes the soundtrack (no samples / no licensed music). Output: out/sound.wav
import numpy as np, wave
SR=44100; T=23.6; N=int(SR*T); out=np.zeros(N)
rng=np.random.default_rng(7)
def add(sig,t,g=1.0):
    i=int(t*SR); j=min(N,i+len(sig)); out[i:j]+=sig[:j-i]*g
def env(n,a=0.002,d=0.1):
    t=np.arange(n)/SR; return np.minimum(1,t/a)*np.exp(-t/d)
def click(f=2500,d=0.03):
    n=int(SR*0.08); t=np.arange(n)/SR
    return (rng.standard_normal(n)*0.5+np.sin(2*np.pi*f*t))*env(n,0.0005,d)
def whoosh(dur=0.45,up=True):
    n=int(SR*dur); x=rng.standard_normal(n); t=np.linspace(0,1,n)
    # crude moving lowpass via cumulative smoothing with varying alpha
    a=(0.02+0.25*(t if up else 1-t)); y=np.zeros(n); acc=0
    for k in range(n): acc+=a[k]*(x[k]-acc); y[k]=acc
    return y*np.sin(np.pi*t)**2*3
def kick():
    n=int(SR*0.4); t=np.arange(n)/SR; f=50+90*np.exp(-t*30)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.001,0.15)
def hat():
    n=int(SR*0.06); x=rng.standard_normal(n); x=np.diff(x,prepend=0); return x*env(n,0.0005,0.012)
def pad(f,dur):
    n=int(SR*dur); t=np.arange(n)/SR
    s=sum(np.sin(2*np.pi*f*m*t+m)/m for m in (1,1.5,2,3))
    e=np.minimum(1,t/1.5)*np.minimum(1,(dur-t)/1.5); return s*e
def boom():
    n=int(SR*1.2); t=np.arange(n)/SR; return np.sin(2*np.pi*(40+40*np.exp(-t*6))*t)*env(n,0.002,0.4)
# beat from 1.2s at 120bpm, drop out during toggle moment
bt=0.5
t=1.2
while t<22.6:
    if not (10.6<t<11.8): add(kick(),t,0.55)
    if t>3.6 and not (10.6<t<11.8): add(hat(),t+bt/2,0.25)
    t+=bt
add(pad(55,22.5),0.6,0.06); add(pad(82.4,10),12.6,0.04)
# typing
add(click(3000),0.88,0.35)
for i in range(1,5): add(click(2600+i*150),1.2+i*0.18,0.35)
add(click(1800,0.05),2.1,0.4)   # dot pop
add(click(2200),2.55,0.3); add(click(2200),3.0,0.3)
# pen ticks
for k in np.arange(3.7,5.0,0.09): add(click(4000,0.01),k,0.08)
for k,up in [(3.4,False),(5.85,True),(7.1,False),(7.6,True),(9.2,True),(10.4,False),(12.35,True),(15.4,True),
             (15.5,True),(16.2,True),(16.9,True),(17.6,True),(18.15,False),(18.4,True),(19.75,False)]:
    add(whoosh(0.45,up),k-0.1,0.5)
add(boom(),5.95,0.6); add(boom(),9.25,0.5)
add(click(1500,0.06),11.5,0.7); add(click(900,0.08),11.55,0.5)   # toggle
n_items=5; seg=(15.4-12.75)/n_items
for i in range(n_items): add(click(1200,0.04),12.75+i*seg,0.35)
msg="Let's build something users love."
for i,ch in enumerate(msg):
    if ch!=' ': add(click(2400+rng.integers(0,800),0.02),20.7+i*0.045,0.18)
add(boom(),19.85,0.4)
# fade out
fo=int(SR*0.6); out[-fo:]*=np.linspace(1,0,fo)
out=out/np.max(np.abs(out))*0.85
st=np.stack([out,np.roll(out,40)],1)
w=wave.open('out/sound.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*32767).astype('<i2').tobytes()); w.close(); print('ok')
