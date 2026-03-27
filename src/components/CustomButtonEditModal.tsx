import { useEffect, useState } from "react";
import type { UiCustomButton } from "../lib/types";

type Props = {
  button: UiCustomButton;
  onClose: () => void;
  onSave: (button: UiCustomButton) => void;
  onDelete: () => void;
};

type FormState = {
  name: string;
  isFavorite: boolean;
  sortIndex: string;
  content: string;
  longPressContent: string;
  onStartup: string;
};

function toForm(button: UiCustomButton): FormState {
  return {
    name: button.name,
    isFavorite: button.isFavorite,
    sortIndex: String(button.sortIndex),
    content: button.content,
    longPressContent: button.longPressContent,
    onStartup: button.onStartup,
  };
}

export default function CustomButtonEditModal({
  button,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(() => toForm(button));

  useEffect(() => {
    setForm(toForm(button));
  }, [button]);

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
          <button
            type="button"
            className="modal-close"
            style={{ marginRight: 'auto', borderColor: '#f87171', color: '#f87171' }}
            onClick={() => {
                if (confirm("Are you sure you want to delete this button?")) {
                    onDelete();
                }
            }}
          >
            Delete
          </button>
          <button type="button" className="modal-close" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="modal-save"
            onClick={() =>
              onSave({
                ...button,
                name: form.name.trim(),
                isFavorite: form.isFavorite,
                sortIndex: Number.parseInt(form.sortIndex, 10) || 0,
                content: form.content,
                longPressContent: form.longPressContent,
                onStartup: form.onStartup,
              })
            }
          >
            Save
          </button>
        </div>

        <h3>Edit custom button</h3>
        <p className="muted">Edit the button metadata and actions.</p>

        <div className="edit-grid">
          <label>
            Name
            <input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </label>
          <label>
            Sort index
            <input
              type="number"
              value={form.sortIndex}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  sortIndex: event.target.value,
                }))
              }
            />
          </label>
          <label className="edit-check">
            <input
              type="checkbox"
              checked={form.isFavorite}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  isFavorite: event.target.checked,
                }))
              }
            />
            Favorite
          </label>
        </div>

        <label className="edit-block">
          Content
          <textarea
            rows={4}
            value={form.content}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, content: event.target.value }))
            }
          />
        </label>

        <label className="edit-block">
          Long press content
          <textarea
            rows={4}
            value={form.longPressContent}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                longPressContent: event.target.value,
              }))
            }
          />
        </label>

        <label className="edit-block">
          On startup
          <textarea
            rows={4}
            value={form.onStartup}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, onStartup: event.target.value }))
            }
          />
        </label>
      </div>
    </div>
  );
}
