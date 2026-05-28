import { VIDEO_REFERENCES } from '../data/videoReferences';
import { PlaySquare, ExternalLink } from 'lucide-react';

export const VideoReferenceLibrary = () => {
  return (
    <section className="bg-stone-900/70 border border-stone-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 border-b border-stone-800 pb-4 mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500">Reference Library</p>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white mt-1">Touchtight-style video references</h3>
        </div>
        <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest max-w-xl">
          Indexed examples for movement timing, session-plan animation, set pieces, and coaching-board style.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {VIDEO_REFERENCES.map((video) => (
          <article key={video.id} className="bg-stone-950/80 border border-stone-800 rounded-xl overflow-hidden">
            <div className="aspect-video bg-stone-900 border-b border-stone-800">
              <iframe
                src={video.embedUrl}
                title={video.title}
                className="w-full h-full"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] text-stone-500 font-mono uppercase tracking-widest">{video.type}</p>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight leading-tight mt-1">{video.title}</h4>
                </div>
                <PlaySquare size={18} className="text-amber-500 shrink-0" />
              </div>

              <p className="text-xs text-stone-400 leading-relaxed">{video.focus}</p>
              <p className="text-[10px] text-stone-500 leading-relaxed">{video.notes}</p>

              <div className="flex flex-wrap gap-1">
                {video.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-amber-500 transition-colors"
              >
                Open on YouTube <ExternalLink size={12} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
