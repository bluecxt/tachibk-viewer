import { useEffect, useState } from "react";
import type { UiAnime, UiCategory } from "../lib/types";

type Props = {
  anime: UiAnime;
  categories: UiCategory[];
  onClose: () => void;
  onSave: (anime: UiAnime) => void;
};

type FormState = {
  title: string;
  customTitle: string;
  url: string;
  sourceName: string;
  status: string;
  favorite: boolean;
  description: string;
  notes: string;
  categoriesCsv: string;
};

function toForm(anime: UiAnime): FormState {
  return {
    title: anime.title,
    customTitle: anime.customTitle ?? "",
    url: anime.url,
    sourceName: anime.sourceName,
    status: String(anime.status),
    favorite: anime.favorite,
    description: anime.description ?? "",
    notes: anime.notes,
    categoriesCsv: anime.categories.join(","),
  };
}

function parseCategories(csv: string): number[] {
  const parsed = csv
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isFinite(value));
  return [...new Set(parsed)];
}

export default function AnimeEditModal({ anime, categories, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(() => toForm(anime));

  useEffect(() => {
    setForm(toForm(anime));
  }, [anime]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-actions">
          <button type="button" className="modal-close" onClick={onClose}>
            Fermer
          </button>
          <button
            type="button"
            className="modal-save"
            onClick={() =>
              onSave({
                ...anime,
                title: form.title.trim(),
                customTitle: form.customTitle.trim() || null,
                url: form.url.trim(),
                sourceName: form.sourceName.trim(),
                status: Number.parseInt(form.status, 10) || 0,
                favorite: form.favorite,
                description: form.description.trim() || null,
                notes: form.notes,
                categories: parseCategories(form.categoriesCsv),
              })
            }
          >
            Sauvegarder
          </button>
        </div>

        <h3>Éditer anime</h3>
        <p className="muted">Modifie les données locales affichées dans l’application.</p>

        <div className="edit-grid">
          <label>
            Titre
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
          </label>
          <label>
            Titre custom
            <input
              value={form.customTitle}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, customTitle: event.target.value }))
              }
            />
          </label>
          <label>
            URL
            <input
              value={form.url}
              onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
            />
          </label>
          <label>
            Source (nom)
            <input
              value={form.sourceName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, sourceName: event.target.value }))
              }
            />
          </label>
          <label>
            Status
            <input
              type="number"
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            />
          </label>
          <label>
            Catégories (orders CSV)
            <input
              value={form.categoriesCsv}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, categoriesCsv: event.target.value }))
              }
              placeholder="0,1,2"
            />
          </label>
          <label className="edit-check">
            <input
              type="checkbox"
              checked={form.favorite}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, favorite: event.target.checked }))
              }
            />
            Favori
          </label>
        </div>

        <label className="edit-block">
          Description
          <textarea
            rows={4}
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
        </label>

        <label className="edit-block">
          Notes
          <textarea
            rows={4}
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </label>

        <p className="meta-line">
          Catégories disponibles:{" "}
          {categories
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((cat) => `${cat.order}:${cat.name || "sans nom"}`)
            .join(" • ")}
        </p>
      </div>
    </div>
  );
}
