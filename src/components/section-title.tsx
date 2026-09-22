interface SectionTitleProps {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function SectionTitle({ id, eyebrow, title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-10" id={id}>
      {eyebrow && (
        <p className="mb-3 flex items-center gap-3 text-xs monofont uppercase tracking-[0.25em] text-primary/80">
          <span className="inline-block h-px w-8 bg-primary/60" />
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        <span className="text-primary/60">&gt;_</span> {title}
      </h2>
      {subtitle && (
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}
