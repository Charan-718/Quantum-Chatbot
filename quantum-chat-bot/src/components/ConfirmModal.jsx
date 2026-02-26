import './ConfirmModal.css'

function ConfirmModal({ onSave, onDiscard }) {
  return (
    <div className="modal-overlay">

      <div className="modal-content">

        <h3>
          Save current chat before switching mode?
        </h3>

        <div className="modal-buttons">

          <button onClick={onSave}>
            Save & Switch
          </button>

          <button onClick={onDiscard}>
            Discard
          </button>

        </div>

      </div>

    </div>
  );
}

export default ConfirmModal;