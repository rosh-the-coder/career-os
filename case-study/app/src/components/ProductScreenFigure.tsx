import { type ReactNode } from "react";

export function ProductScreenFigure({
  title,
  purpose,
  takeaway,
  children,
}: {
  title: string;
  purpose: string;
  takeaway: string;
  children: ReactNode;
}) {
  return (
    <figure className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      <figcaption className="mb-6">
        <h3 className="display text-2xl text-ink md:text-3xl">{title}</h3>
        <p className="mt-2 text-sm text-muted">{purpose}</p>
      </figcaption>
      {children}
      <p className="mt-6 text-sm text-signal">{takeaway}</p>
    </figure>
  );
}
