export default function Loading() {
  return (
    <main className="ej-workspace ej-workspace-state" aria-busy="true">
      <div role="status">
        <p className="ej-eyebrow">Good food. Real life.</p>
        <h1>Getting your kitchen ready.</h1>
        <p>Your recipes will be right here.</p>
        <div className="ej-loading-bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </main>
  );
}
