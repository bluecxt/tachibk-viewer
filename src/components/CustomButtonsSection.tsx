import type { UiCustomButton } from "../lib/types";

type Props = {
  customButtons: UiCustomButton[];
};

export default function CustomButtonsSection({ customButtons }: Props) {
  return (
    <section className="panel" id="custom-buttons">
      <div className="panel-head">
        <h2>Boutons personnalisés</h2>
        <p>{customButtons.length} boutons</p>
      </div>
      <div className="kv-list">
        {customButtons.map((item, index) => (
          <article key={`${item.name}-${index}`} className="kv-item">
            <h3>{item.name || "(sans nom)"}</h3>
            <p>Favori: {item.isFavorite ? "Oui" : "Non"}</p>
            <p>Ordre: {item.sortIndex}</p>
            <p>Content: {item.content || "-"}</p>
            <p>Long press: {item.longPressContent || "-"}</p>
            <p>On startup: {item.onStartup || "-"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
