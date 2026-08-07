export function ReflectionSection({
  headline,
  body,
}: {
  headline: string;
  body?: string;
}) {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 text-center">
      <h3 className="display text-3xl text-ink md:text-5xl">{headline}</h3>
      {body ? <p className="mt-6 max-w-2xl text-muted">{body}</p> : null}
    </section>
  );
}
