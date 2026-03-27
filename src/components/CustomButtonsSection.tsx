import type { UiCustomButton } from "../lib/types";

type Props = {
  customButtons: UiCustomButton[];
};

export default function CustomButtonsSection({ customButtons }: Props) {
  return (
    <section className="panel" id="custom-buttons">
      <div className="panel-head">
        <h2>Custom buttons</h2>
        <p>{customButtons.length} buttons</p>
      </div>
      <div className="kv-list">
        {customButtons.map((item, index) => (
          <article key={`${item.name}-${index}`} className="kv-item">
            <h3>{item.name || "(unnamed)"}</h3>
            <p>Favorite: {item.isFavorite ? "Yes" : "No"}</p>
            <p>Order: {item.sortIndex}</p>
            <p>Content: {item.content || "-"}</p>
            <p>Long press: {item.longPressContent || "-"}</p>
            <p>On startup: {item.onStartup || "-"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
