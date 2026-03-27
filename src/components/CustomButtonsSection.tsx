import type { UiCustomButton } from "../lib/types";

type Props = {
  customButtons: UiCustomButton[];
  onEditButton: (index: number) => void;
  onAddButton: () => void;
};

export default function CustomButtonsSection({
  customButtons,
  onEditButton,
  onAddButton,
}: Props) {
  return (
    <section className="panel" id="customButtons">
      <div className="panel-head">
        <div>
            <h2>Custom buttons</h2>
            <p>{customButtons.length} buttons</p>
        </div>
        <button type="button" className="modal-save" onClick={onAddButton}>
            + Add Button
        </button>
      </div>

      <div className="kv-list">
        {customButtons.map((item, index) => (
          <article key={`${item.name}-${index}`} className="kv-item">
            <div className="kv-card-head">
              <h3>{item.name || "(unnamed)"}</h3>
              <button
                type="button"
                className="entry-edit-btn"
                onClick={() => onEditButton(index)}
              >
                Edit
              </button>
            </div>
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
