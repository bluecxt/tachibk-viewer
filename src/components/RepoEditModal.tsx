import { useEffect, useState } from "react";
import type { UiExtensionRepo } from "../lib/types";

type Props = {
  repo: UiExtensionRepo;
  onClose: () => void;
  onSave: (repo: UiExtensionRepo) => void;
  onDelete: () => void;
};

type FormState = {
  name: string;
  baseUrl: string;
  shortName: string;
  website: string;
  fingerprint: string;
  author: string;
  visible: boolean;
};

function toForm(repo: UiExtensionRepo): FormState {
  return {
    name: repo.name,
    baseUrl: repo.baseUrl,
    shortName: repo.shortName ?? "",
    website: repo.website,
    fingerprint: repo.signingKeyFingerprint,
    author: repo.author ?? "",
    visible: repo.isVisible,
  };
}

export default function RepoEditModal({
  repo,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = useState<FormState>(() => toForm(repo));

  useEffect(() => {
    setForm(toForm(repo));
  }, [repo]);

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
                if (confirm("Are you sure you want to delete this repository?")) {
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
                ...repo,
                name: form.name.trim(),
                baseUrl: form.baseUrl.trim(),
                shortName: form.shortName.trim() || null,
                website: form.website.trim(),
                signingKeyFingerprint: form.fingerprint.trim(),
                author: form.author.trim() || null,
                isVisible: form.visible,
              })
            }
          >
            Save
          </button>
        </div>

        <h3>Edit extension repo</h3>
        <p className="muted">Update the repository metadata and visibility.</p>

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
            Base URL
            <input
              value={form.baseUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, baseUrl: event.target.value }))
              }
            />
          </label>
          <label>
            Short name
            <input
              value={form.shortName}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  shortName: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Website
            <input
              value={form.website}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, website: event.target.value }))
              }
            />
          </label>
          <label>
            Fingerprint
            <input
              value={form.fingerprint}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  fingerprint: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Author
            <input
              value={form.author}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, author: event.target.value }))
              }
            />
          </label>
          <label className="edit-check">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, visible: event.target.checked }))
              }
            />
            Visible
          </label>
        </div>
      </div>
    </div>
  );
}
