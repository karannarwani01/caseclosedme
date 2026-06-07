import Image from "next/image";

// The cube + "caseclosed" wordmark enclosed together in a single bordered box.
// On small screens the wordmark collapses so the box stays compact (cube only).
export default function LogoLockup() {
  return (
    <div
      className="flex flex-none items-center gap-2.5 rounded-2xl border-[2.5px] border-anime-ink bg-anime-ink px-2.5 py-2 shadow-[4px_4px_0_0_var(--color-anime-pink)] md:pr-3.5"
      aria-label="caseclosed logo"
    >
      <Image
        src="/logo-mark.png"
        alt=""
        width={36}
        height={36}
        quality={100}
        className="object-contain"
      />
      <span className="hidden font-display text-2xl font-extrabold leading-none tracking-[-0.02em] text-white md:inline 2xl:text-[30px]">
        Caseclosed
      </span>
    </div>
  );
}
