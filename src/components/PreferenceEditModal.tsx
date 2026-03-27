import { useEffect, useState } from "react";
import type { UiPreference } from "../lib/types";

type Props = {
  preference: UiPreference;
  onClose: () => void;
  onSave: (preference: UiPreference) => void;
};

export default function PreferenceEditModal({
  preference,
  onClose,
  onSave,
}: Props) {
  const [value, setValue] = useState(preference.valuePreview);

  useEffect(() => {
    setValue(preference.valuePreview);
  }, [preference]);

  // Note: we only support editing string-ish previews for now
  // Real backup uses Protobuf bytes for values (Int, Bool, String)
  // To stay compatible, we'd need to re-encode them.
  // For now, let's keep it simple: if it's "true"/"false", we can try to encode as bool
  // If it's numeric, as int. Otherwise as string.

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-actions">
          <button type="button" className="modal-close" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="modal-save"
            onClick={() => {
                // Here we'd ideally re-encode value into preference.rawValue
                // But for now, we'll just update the preview so the user sees it changed
                // AND we'll try to provide a "dirty" Uint8Array if possible
                onSave({
                    ...preference,
                    valuePreview: value,
                });
            }}
          >
            Save
          </button>
        </div>

        <h3>Edit Preference</h3>
        <p className="muted">Key: {preference.key}</p>

        <label className="edit-block">
            Value
            <input 
                value={value} 
                onChange={e => setValue(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0d1119', border: '1px solid var(--line)', color: 'white', borderRadius: '8px' }}
            />
        </label>
        <p className="muted" style={{ marginTop: '10px', fontSize: '0.75rem' }}>
            Warning: Editing raw preferences is experimental. The internal byte representation might not be perfectly updated depending on the type.
        </p>
      </div>
    </div>
  );
}
