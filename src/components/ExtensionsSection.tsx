import type { UiExtension } from "../lib/types";

type Props = {
  extensions: UiExtension[];
};

export default function ExtensionsSection({ extensions }: Props) {
  return (
    <section className="panel" id="extensions">
      <div className="panel-head">
        <h2>Extensions</h2>
        <p>{extensions.length} entrées</p>
      </div>
      <div className="kv-list">
        {extensions.map((item) => (
          <article key={item.pkgName} className="kv-item">
            <h3>{item.pkgName || "(sans package)"}</h3>
            <p>APK size: {Math.round(item.apkSize / 1024)} Ko</p>
          </article>
        ))}
      </div>
    </section>
  );
}
