export function NextProjectFooter({
  explore,
  credit,
  scope,
}: {
  explore: string;
  credit: string;
  scope: string;
}) {
  return (
    <footer className="border-t border-line px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="display text-3xl text-ink">{explore}</p>
        <p className="mt-6 text-sm text-muted">{scope}</p>
        <p className="mono mt-16 text-xs tracking-wide text-faint">{credit}</p>
      </div>
    </footer>
  );
}
