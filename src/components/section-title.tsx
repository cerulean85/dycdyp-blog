type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionTitle({
  eyebrow,
  title,
  description,
}: SectionTitleProps) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500 md:text-xs md:tracking-[0.3em]">
        {eyebrow}
      </p>
      <h2 className="mt-2.5 font-serif text-[2.25rem] leading-tight text-stone-950 md:mt-3 md:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-[15px] leading-7 text-stone-600 md:mt-4 md:text-base md:leading-8">
        {description}
      </p>
    </div>
  );
}
