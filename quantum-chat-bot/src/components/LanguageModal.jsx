import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect } from "react";
import "./LanguageModal.css";

function LanguageModal({ translatedText, audioData, loading, onClose }) {
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (audioData && audioRef.current) {
      const audio = audioRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioData]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * duration;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  return (
    <div className="lm-overlay">
      <div className="lm-content">

        <button className="lm-close" onClick={onClose}>✖</button>

        {loading ? (
          <div className="lm-loading">
            <div className="lm-spinner"></div>
            <p className="lm-loading-text">
              The text is being translated. Please wait a moment...
            </p>
          </div>
        ) : (
          <>
            <h3 className="lm-title">🌐 Translated Text</h3>
            <div className="lm-text">
              <ReactMarkdown>
                {translatedText}
              </ReactMarkdown>
            </div>

            {audioData && (
              <div className="lm-audio-container">
                {/* Hidden native audio element */}
                <audio
                  ref={audioRef}
                  src={`data:audio/mp3;base64,${audioData}`}
                  preload="metadata"
                />
                
                {/* Custom Audio Player */}
                <div className="custom-audio-player">
                  
                  {/* Play/Pause Button */}
                  <button 
                    className={`audio-control play-pause ${isPlaying ? 'playing' : ''}`}
                    onClick={togglePlay}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  
                  {/* Progress Bar */}
                  <div className="audio-progress-container">
                    <span className="audio-time current">{formatTime(currentTime)}</span>
                    <div 
                      className="audio-progress-bar"
                      ref={progressRef}
                      onClick={handleProgressClick}
                    >
                      <div 
                        className="audio-progress-fill"
                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                      >
                        <div className="progress-handle"></div>
                      </div>
                    </div>
                    <span className="audio-time total">{formatTime(duration)}</span>
                  </div>
                  
                  {/* Volume Control */}
                  <div className="audio-volume-container">
                    <button 
                      className={`audio-control volume ${isMuted ? 'muted' : ''}`}
                      onClick={toggleMute}
                    >
                      {isMuted ? '🔇' : volume > 0.5 ? '🔊' : volume > 0 ? '🔉' : '🔈'}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="volume-slider"
                    />
                  </div>
                  
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default LanguageModal;