// Videos de clientes preparando el café. Hasta tenerlos (ver Pendientes en CLAUDE.md)
// se muestran espacios reservados con el mismo formato vertical.
const VIDEOS = [
  { autor: "Lucía, en su V60", src: null },
  { autor: "Nicolás, en espresso", src: null },
  { autor: "Sofía, en moka", src: null },
];

export default function VideosClientes() {
  return (
    <section aria-labelledby="titulo-videos">
      <h2 id="titulo-videos" className="text-lg font-semibold">
        Así lo preparan nuestros clientes
      </h2>
      <ul className="mt-4 grid grid-cols-3 gap-3">
        {VIDEOS.map((video) =>
          video.src ? (
            <li key={video.autor}>
              <video src={video.src} controls muted playsInline className="aspect-[9/16] w-full rounded-2xl object-cover" />
              <p className="mt-2 text-sm text-marron">{video.autor}</p>
            </li>
          ) : (
            <li key={video.autor}>
              <div className="flex aspect-[9/16] flex-col items-center justify-center gap-2 rounded-2xl bg-tostado p-3 text-center text-kraft">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8" fill="currentColor">
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
                <span className="text-sm">Video próximamente</span>
              </div>
              <p className="mt-2 text-sm text-marron">{video.autor}</p>
            </li>
          )
        )}
      </ul>
    </section>
  );
}
