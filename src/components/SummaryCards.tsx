import type { UiBackup } from "../lib/types";

export type SummaryTarget =
  | "library"
  | "categories"
  | "sources"
  | "preferences"
  | "sourcePrefs"
  | "extensions"
  | "repos"
  | "customButtons";

type Props = {
  backup: UiBackup;
  onOpen: (target: SummaryTarget) => void;
};

export default function SummaryCards({ backup, onOpen }: Props) {
  const cards = [
    { label: "Anime", value: backup.animeCount, target: "library" as const },
    {
      label: "Categories",
      value: backup.categoryCount,
      target: "categories" as const,
    },
    { label: "Sources", value: backup.sourceCount, target: "sources" as const },
    {
      label: "Preferences",
      value: backup.preferenceCount,
      target: "preferences" as const,
    },
    {
      label: "Source preferences",
      value: backup.sourcePreferenceCount,
      target: "sourcePrefs" as const,
    },
    {
      label: "Extensions",
      value: backup.extensionCount,
      target: "extensions" as const,
    },
    {
      label: "Repos",
      value: backup.extensionRepoCount,
      target: "repos" as const,
    },
    {
      label: "Buttons",
      value: backup.customButtonCount,
      target: "customButtons" as const,
    },
  ];

  return (
    <section className="cards-grid">
      {cards.map((card) => (
        <article
          key={card.label}
          className="stat-card stat-card-clickable"
          onClick={() => onOpen(card.target)}
        >
          <p>{card.label}</p>
          <strong>{card.value.toLocaleString("en-US")}</strong>
        </article>
      ))}
    </section>
  );
}
