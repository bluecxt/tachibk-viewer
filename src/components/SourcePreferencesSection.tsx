import type { UiSourcePreference } from "../lib/types";

type Props = {
  sourcePreferences: UiSourcePreference[];
};

export default function SourcePreferencesSection({ sourcePreferences }: Props) {
  return (
    <section className="panel" id="source-prefs">
      <div className="panel-head">
        <h2>Préférences sources</h2>
        <p>{sourcePreferences.length} sources configurées</p>
      </div>
      <div className="kv-list">
        {sourcePreferences.map((item) => (
          <article key={item.sourceKey} className="kv-item">
            <h3>{item.sourceKey || "(sans clé)"}</h3>
            <p>Nombre de préférences: {item.prefs.length}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
