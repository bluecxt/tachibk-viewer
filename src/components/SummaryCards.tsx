import type { UiBackup } from "../lib/types";

type Props = {
  backup: UiBackup;
};

export default function SummaryCards({ backup }: Props) {
  const cards = [
    { label: "Anime", value: backup.animeCount },
    { label: "Catégories", value: backup.categoryCount },
    { label: "Sources", value: backup.sourceCount },
    { label: "Préférences", value: backup.preferenceCount },
    { label: "Prefs sources", value: backup.sourcePreferenceCount },
    { label: "Extensions", value: backup.extensionCount },
    { label: "Repos", value: backup.extensionRepoCount },
    { label: "Boutons", value: backup.customButtonCount },
  ];

  return (
    <section className="cards-grid">
      {cards.map((card) => (
        <article key={card.label} className="stat-card">
          <p>{card.label}</p>
          <strong>{card.value.toLocaleString("fr-FR")}</strong>
        </article>
      ))}
    </section>
  );
}
