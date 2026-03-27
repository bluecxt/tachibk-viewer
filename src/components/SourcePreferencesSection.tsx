import type { UiSourcePreference } from "../lib/types";

type Props = {
  sourcePreferences: UiSourcePreference[];
  onEditSource: (index: number) => void;
};

export default function SourcePreferencesSection({ sourcePreferences, onEditSource }: Props) {
  return (
    <section className="panel" id="source-prefs">
      <div className="panel-head">
        <h2>Source preferences</h2>
        <p>{sourcePreferences.length} configured sources</p>
      </div>
      <div className="kv-list">
        {sourcePreferences.map((item, index) => (
          <article key={item.sourceKey} className="kv-item">
            <div className="kv-card-head">
                <h3>{item.sourceKey || "(no key)"}</h3>
                <button
                    type="button"
                    className="entry-edit-btn"
                    onClick={() => onEditSource(index)}
                >
                    Edit
                </button>
            </div>
            <p>Preferences count: {item.prefs.length}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
