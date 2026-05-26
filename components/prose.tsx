import clsx from "clsx";

const Prose = ({ html, className }: { html: string; className?: string }) => {
  return (
    <div
      className={clsx(
        "prose mx-auto max-w-6xl text-lg leading-relaxed text-anime-ink sm:text-xl prose-headings:mt-10 prose-headings:font-display prose-headings:font-extrabold prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-anime-ink prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg prose-a:text-anime-pink prose-a:font-semibold prose-a:underline prose-a:underline-offset-2 prose-a:hover:opacity-80 prose-strong:text-anime-ink prose-strong:font-bold prose-ol:mt-6 prose-ol:list-decimal prose-ol:pl-6 prose-ul:mt-6 prose-ul:list-disc prose-ul:pl-6 prose-li:my-1.5",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Prose;
