import { useState, useRef } from "react";
import { Music, VolumeX } from "lucide-react";

// Calm lo-fi ambient background music (royalty-free)
const MUSIC_URL = "https://cdn.pixabay.com/audio/2022/10/16/audio_12a6d9a175.mp3";

export default function WaitingRoomMusic() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.volume = 0.25;
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <div>
      <audio ref={audioRef} src={MUSIC_URL} loop preload="none" />
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        title={playing ? "Pause music" : "Play ambient music"}
      >
        {playing ? <Music className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
        <span>{playing ? "Playing ambient music" : "Play music while you wait"}</span>
      </button>
    </div>
  );
}