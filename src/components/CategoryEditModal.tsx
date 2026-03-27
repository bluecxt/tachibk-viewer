import { useEffect, useState } from "react";
import type { UiCategory } from "../lib/types";

type Props = {
  category: UiCategory;
  onClose: () => void;
  onSave: (category: UiCategory) => void;
  onDelete: () => void;
};

type FormState = {
  name: string;
  flags: string;
  hidden: boolean;
};

function toForm(category: UiCategory): FormState {
  return {
    name: category.name,
    flags: String(category.flags),
    hidden: category.hidden,
  };
}

export default function CategoryEditModal({
  category,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(() => toForm(category));

  useEffect(() => {
    setForm(toForm(category));
  }, [category]);

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
                if (confirm("Are you sure you want to delete this category?")) {
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
                ...category,
                name: form.name.trim(),
                flags: Number.parseInt(form.flags, 10) || 0,
                hidden: form.hidden,
              })
            }
          >
            Save
          </button>
        </div>

        <h3>Edit category</h3>
        <p className="muted">
          Category order is kept as the link key for anime entries.
        </p>

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
            Order
            <input value={category.order} disabled />
          </label>
          <label>
            Flags
            <input
              type="number"
              value={form.flags}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, flags: event.target.value }))
              }
            />
          </label>
          <label className="edit-check">
            <input
              type="checkbox"
              checked={form.hidden}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, hidden: event.target.checked }))
              }
            />
            Hidden
          </label>
        </div>
      </div>
    </div>
  );
}
