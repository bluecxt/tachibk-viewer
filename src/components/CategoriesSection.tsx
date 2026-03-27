import { useMemo } from "react";
import type { UiAnime, UiCategory } from "../lib/types";

type Props = {
  anime: UiAnime[];
  categories: UiCategory[];
};

export default function CategoriesSection({ anime, categories }: Props) {
  const rows = useMemo(() => {
    const counts = new Map<number, number>();
    anime.forEach((entry) => {
      entry.categories.forEach((order) =>
        counts.set(order, (counts.get(order) ?? 0) + 1),
      );
    });
    return [...categories]
      .sort((a, b) => a.order - b.order)
      .map((category) => ({
        ...category,
        entryCount: counts.get(category.order) ?? 0,
      }));
  }, [anime, categories]);

  return (
    <section className="panel" id="categories">
      <div className="panel-head">
        <h2>Categories</h2>
        <p>{rows.length} categories</p>
      </div>
      <div className="kv-list">
        {rows.map((category) => (
          <article
            key={`${category.order}-${category.name}`}
            className="kv-item"
          >
            <h3>{category.name || "(unnamed)"}</h3>
            <p>Order: {category.order}</p>
            <p>Linked entries: {category.entryCount}</p>
            <p>Hidden: {category.hidden ? "Yes" : "No"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
