// Preguntas frecuentes con <details>: se abren y cierran sin JavaScript
// y son accesibles con teclado de fábrica.
export default function PreguntasFrecuentes({ preguntas }) {
  return (
    <section aria-labelledby="titulo-faq" className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
      <h2 id="titulo-faq" className="font-display text-4xl leading-none sm:text-5xl">
        Preguntas frecuentes
      </h2>
      <div className="divide-y divide-marron/20 border-y border-marron/20">
        {preguntas.map(({ pregunta, respuesta }) => (
          <details key={pregunta} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {pregunta}
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 shrink-0 transition-transform group-open:rotate-45"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </summary>
            <p className="max-w-prose pb-6 text-marron">{respuesta}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
