import { publicAsset } from '../utils/assets';

const currentAge = 21;
const maxAge = 80;
const progress = (currentAge / maxAge) * 100;

export default function AgeTimeline() {
  return (
    <section className="relative px-4 py-10 sm:py-14" aria-label="Yaş ilerleme çizgisi">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/12 bg-white/[0.06] p-5 shadow-glass backdrop-blur-xl sm:p-7">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-roseglow">
              Bugüne Kadar
            </p>
            <h2 className="mt-2 font-display text-2xl text-champagne sm:text-3xl">
              21. yaşına kadar kat ettiğin yol
            </h2>
          </div>
          <p className="rounded-full border border-roseglow/30 bg-roseglow/12 px-3 py-2 text-sm font-black text-champagne">
            Lvl 21 
          </p>
        </div>

        <div className="relative pb-12 pt-9">
          <div className="absolute left-0 right-0 top-12 h-2 rounded-full bg-white/12" />
          <div
            className="absolute left-0 top-12 h-2 rounded-full bg-gradient-to-r from-roseglow via-champagne to-roseglow shadow-[0_0_22px_rgba(255,143,184,0.45)]"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-0 -translate-x-1/2"
            style={{ left: `${progress}%` }}
          >
            <div className="grid place-items-center">
              <div className="rounded-full border border-champagne/50 bg-ink p-1.5 shadow-[0_0_30px_rgba(255,143,184,0.45)]">
                <img
                  src={publicAsset('avatar/girlfriend-pixel.jpg')}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14"
                />
              </div>
              <span className="mt-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                21
              </span>
            </div>
          </div>
          <div className="absolute left-0 top-20 text-sm font-bold text-white/70">0</div>
          <div className="absolute right-0 top-20 text-sm font-bold text-white/70">80</div>
        </div>
      </div>
    </section>
  );
}
