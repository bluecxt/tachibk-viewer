import type { UiPreference } from "../lib/types";

type Props = {
  preferences: UiPreference[];
  onEditPreference: (index: number) => void;
};

export default function PreferenceTable({ preferences, onEditPreference }: Props) {
  if (preferences.length === 0) {
    return null;
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Preferences (preview)</h2>
        <p>Values decoded with heuristics</p>
      </div>
      <div className="kv-list">
        {preferences.map((pref, index) => (
          <article key={pref.key} className="kv-item">
            <div className="kv-card-head">
                <h3>{pref.key}</h3>
                <button
                    type="button"
                    className="entry-edit-btn"
                    onClick={() => onEditPreference(index)}
                >
                    Edit
                </button>
            </div>
            <p>{pref.valuePreview}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
