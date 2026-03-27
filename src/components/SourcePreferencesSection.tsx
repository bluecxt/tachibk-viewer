import type { UiSourcePreference } from "../lib/types";

type Props = {
  sourcePreferences: UiSourcePreference[];
};

export default function SourcePreferencesSection({ sourcePreferences }: Props) {
  return (
    <section className="panel" id="source-prefs">
      <div className="panel-head">
        <h2>Source preferences</h2>
        <p>{sourcePreferences.length} configured sources</p>
      </div>
      <div className="kv-list">
        {sourcePreferences.map((item) => (
          <article key={item.sourceKey} className="kv-item">
            <h3>{item.sourceKey || "(no key)"}</h3>
            <p>Preferences count: {item.prefs.length}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
