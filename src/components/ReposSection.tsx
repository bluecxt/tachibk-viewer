import type { UiExtensionRepo } from "../lib/types";

type Props = {
  repos: UiExtensionRepo[];
  onEditRepo: (index: number) => void;
  onAddRepo: () => void;
};

export default function ReposSection({ repos, onEditRepo, onAddRepo }: Props) {
  return (
    <section className="panel" id="repos">
      <div className="panel-head">
        <div>
            <h2>Extension repos</h2>
            <p>{repos.length} repositories</p>
        </div>
        <button type="button" className="modal-save" onClick={onAddRepo}>
            + Add Repo
        </button>
      </div>

      <div className="kv-list">
        {repos.map((repo, index) => (
          <article key={`${repo.baseUrl}-${index}`} className="kv-item">
            <div className="kv-card-head">
              <h3>{repo.name || repo.baseUrl}</h3>
              <button
                type="button"
                className="entry-edit-btn"
                onClick={() => onEditRepo(index)}
              >
                Edit
              </button>
            </div>
            <p>Base URL: {repo.baseUrl || "-"}</p>
            <p>Short name: {repo.shortName || "-"}</p>
            <p>Website: {repo.website || "-"}</p>
            <p>Fingerprint: {repo.signingKeyFingerprint || "-"}</p>
            <p>Author: {repo.author || "-"}</p>
            <p>Visible: {repo.isVisible ? "Yes" : "No"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
