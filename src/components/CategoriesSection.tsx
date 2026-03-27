import { useMemo } from "react";
import type { UiAnime, UiCategory } from "../lib/types";
import { formatDuration } from "../lib/utils";

type Props = {
  anime: UiAnime[];
  categories: UiCategory[];
  onEditCategory: (order: number) => void;
  onAddCategory: () => void;
};

export default function CategoriesSection({
  anime,
  categories,
  onEditCategory,
  onAddCategory,
}: Props) {
  const rows = useMemo(() => {
    const counts = new Map<number, number>();
    const minutes = new Map<number, number>();
    
    anime.forEach((entry) => {
      entry.categories.forEach((order) => {
        counts.set(order, (counts.get(order) ?? 0) + 1);
        minutes.set(order, (minutes.get(order) ?? 0) + (entry.episodes.length * 20));
      });
    });
    
    return [...categories]
      .sort((a, b) => a.order - b.order)
      .map((category) => ({
        ...category,
        entryCount: counts.get(category.order) ?? 0,
        totalMinutes: minutes.get(category.order) ?? 0,
      }));
  }, [anime, categories]);

  return (
    <section className="panel" id="categories">
      <div className="panel-head">
        <div>
            <h2>Categories</h2>
            <p>{rows.length} categories</p>
        </div>
        <button type="button" className="modal-save" onClick={onAddCategory}>
            + Add Category
        </button>
      </div>
      <div className="kv-list">
        {rows.map((category) => (
          <article
            key={`${category.order}-${category.name}`}
            className="kv-item"
          >
            <div className="kv-card-head">
              <h3>{category.name || "(unnamed)"}</h3>
              <button
                type="button"
                className="entry-edit-btn"
                onClick={() => onEditCategory(category.order)}
              >
                Edit
              </button>
            </div>
            <p>Order: {category.order}</p>
            <p>Linked entries: {category.entryCount}</p>
            <p>Watch time: {formatDuration(category.totalMinutes)}</p>
            <p>Hidden: {category.hidden ? "Yes" : "No"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
