import type { UiSource } from "../lib/types";

type Props = {
  sources: UiSource[];
};

export default function SourcesSection({ sources }: Props) {
  return (
    <section className="panel" id="sources">
      <div className="panel-head">
        <h2>Sources</h2>
        <p>{sources.length} sources</p>
      </div>
      <div className="kv-list">
        {sources
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name, "fr"))
          .map((source) => (
            <article key={`${source.sourceId}-${source.name}`} className="kv-item">
              <h3>{source.name || "(sans nom)"}</h3>
              <p>Source ID: {source.sourceId}</p>
            </article>
          ))}
      </div>
    </section>
  );
}
