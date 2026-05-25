import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";

type Props = {
  videoSrc: string;
  poster?: string;
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
};

export function VideoHero({ videoSrc, poster, eyebrow, title, subtitle }: Props) {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={videoSrc}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
      <div className="absolute inset-0 grain" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-6 pb-20 lg:px-10 lg:pb-28">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
          className="max-w-5xl font-display text-[12vw] leading-[0.95] tracking-tight text-balance md:text-[7.5vw] lg:text-[6vw]"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-8 max-w-xl text-base text-white/80 md:text-lg"
          >
            {subtitle}
          </motion.p>
        )}

        <div className="mt-12 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/60">
          <ArrowDown className="h-4 w-4 animate-bounce" /> Scroll
        </div>
      </div>
    </section>
  );
}
