# Cut every pause in a voice take down to KEEP seconds (default 0.12).
# Pauses are found with silencedetect at -30 dB: Jan (eleven_v3) breathes
# ~0.5 s between phrases above the -35 dB floor silenceremove used to need.
# Each kept piece gets a 10 ms fade so the cuts don't click.
#   python3 -I scripts/tighten-pauses.py in.mp3 out.wav [KEEP]
import re, subprocess, sys
src, out = sys.argv[1], sys.argv[2]
keep = float(sys.argv[3]) if len(sys.argv) > 3 else 0.12
log = subprocess.run(["ffmpeg","-v","info","-i",src,"-af","silencedetect=n=-30dB:d=0.15","-f","null","-"],capture_output=True,text=True).stderr
st=[float(x) for x in re.findall(r"silence_start: ([0-9.]+)",log)]
en=[float(x) for x in re.findall(r"silence_end: ([0-9.]+)",log)]
dur=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",src],capture_output=True,text=True).stdout)
segs=[];cur=0.0
for s,e in zip(st,en):
    if s<0.05: cur=max(cur,e-0.03); continue
    h=keep/2
    segs.append((cur,s+h)); cur=e-h
segs.append((cur,min(dur,(st[-1]+0.1) if len(st)>len(en) else dur)))
f="".join(f"[0]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st={max(0,b-a-0.01):.3f}:d=0.01[s{i}];" for i,(a,b) in enumerate(segs))
f+="".join(f"[s{i}]" for i in range(len(segs)))+f"concat=n={len(segs)}:v=0:a=1[o]"
subprocess.run(["ffmpeg","-v","error","-y","-i",src,"-filter_complex",f,"-map","[o]","-ar","44100","-ac","1",out],check=True)
