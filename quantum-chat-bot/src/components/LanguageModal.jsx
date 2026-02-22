import "./LanguageModal.css";

function LanguageModal({ translatedText, audioData, loading, onClose }) {
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
            <p className="lm-text">{translatedText}</p>

            {audioData && (
              <audio controls autoPlay className="lm-audio">
                <source
                  src={`data:audio/mp3;base64,${audioData}`}
                  type="audio/mp3"
                />
              </audio>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default LanguageModal;