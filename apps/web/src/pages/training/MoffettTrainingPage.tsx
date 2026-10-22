import { Link } from 'react-router';
import { ArrowRight, Phone } from 'lucide-react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { BrandIcon } from '../../components/brand/BrandIcon';

export default function MoffettTrainingPage() {
  return (
    <div className="min-h-dvh bg-white text-brand-obsidian">
      <>
        <title>Moffett Training | CatchingJobs</title>
        <meta
          name="description"
          content="Enquire about practical Moffett training and poultry module handling with CatchingJobs. Speak to our team on 01205 330 190."
        />
        <link rel="canonical" href="https://www.catchingjobs.co.uk/training/moffett" />
      </>
      <PublicHeader />
      <main>
        <section className="relative isolate overflow-hidden bg-brand-ivory">
          <div className="mx-auto max-w-[1312px] px-6 py-8 lg:px-0 lg:py-10">
            <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
              <Link to="/" className="underline-offset-4 hover:underline">
                Home
              </Link>
              <span aria-hidden="true"> / </span>
              <span>Training / Moffett</span>
            </nav>
            <div className="grid items-center gap-8 py-8 lg:min-h-[490px] lg:grid-cols-[560px_1fr] lg:gap-12">
              <div className="space-y-6">
                <p className="font-mono text-xs font-medium tracking-wide">
                  BUILD YOUR SKILLS · MOFFETT TRAINING
                </p>
                <h1 className="font-display text-[clamp(30px,10vw,43px)] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-[clamp(46px,4.6vw,66px)]">
                  Big kit.
                  <br />
                  <span className="whitespace-nowrap">Real confidence.</span>
                </h1>
                <p className="max-w-xl text-lg leading-[1.55]">
                  Get to grips with Moffett operation and poultry module handling. Take the next
                  step with practical training built around the work our crews do.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <a
                    href="tel:01205330190"
                    className="inline-flex min-h-12 items-center justify-center gap-3 rounded bg-brand-orange px-6 py-3 font-semibold transition-colors hover:bg-brand-obsidian hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-obsidian"
                  >
                    Enquire about training <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                  <a
                    href="tel:01205330190"
                    className="inline-flex min-h-11 items-center justify-center gap-2 font-semibold underline-offset-4 hover:underline"
                  >
                    <Phone className="size-4" aria-hidden="true" />
                    01205 330 190
                  </a>
                </div>
              </div>
              <img
                src="/assets/brand/illustrations/iFAVQ.png"
                alt="Moffett training yard with instructor, forklift, poultry modules and lorry"
                width="280"
                height="240"
                fetchPriority="high"
                className="mx-auto h-auto w-full max-w-[660px] object-contain motion-safe:animate-[scene-reveal_650ms_ease-out_both]"
              />
            </div>
            <ul className="grid gap-5 border-t border-brand-obsidian/20 py-6 sm:grid-cols-3">
              {(
                [
                  ['moffett', 'Know your machine'],
                  ['mods', 'Handle poultry modules'],
                  ['training', 'Build safe working habits'],
                ] as const
              ).map(([icon, text]) => (
                <li key={icon} className="flex items-center gap-3 text-sm font-medium">
                  <BrandIcon name={icon} size={32} />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
