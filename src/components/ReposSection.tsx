import type { UiExtensionRepo } from "../lib/types";

type Props = {
  repos: UiExtensionRepo[];
};

export default function ReposSection({ repos }: Props) {
  return (
    <section className="panel" id="repos">
      <div className="panel-head">
        <h2>Repos extensions</h2>
        <p>{repos.length} repos</p>
      </div>
      <div className="kv-list">
        {repos.map((repo, index) => (
          <article key={`${repo.baseUrl}-${index}`} className="kv-item">
            <h3>{repo.name || repo.baseUrl}</h3>
            <p>Base URL: {repo.baseUrl || "-"}</p>
            <p>Short name: {repo.shortName || "-"}</p>
            <p>Website: {repo.website || "-"}</p>
            <p>Fingerprint: {repo.signingKeyFingerprint || "-"}</p>
            <p>Auteur: {repo.author || "-"}</p>
            <p>Visible: {repo.isVisible ? "Oui" : "Non"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
