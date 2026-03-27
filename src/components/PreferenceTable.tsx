import type { UiPreference } from "../lib/types";

type Props = {
  preferences: UiPreference[];
};

export default function PreferenceTable({ preferences }: Props) {
  if (preferences.length === 0) {
    return null;
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Préférences (aperçu)</h2>
        <p>Valeurs décodées de façon heuristique</p>
      </div>
      <div className="kv-list">
        {preferences.map((pref) => (
          <article key={pref.key} className="kv-item">
            <h3>{pref.key}</h3>
            <p>{pref.valuePreview}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
