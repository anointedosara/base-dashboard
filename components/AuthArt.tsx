/* Stylised "person working at a desk" illustration, pure SVG. */
export function AuthArt({ clock = false }: { clock?: boolean }) {
  return (
    <svg viewBox="0 0 480 360" className="h-auto w-full max-w-lg" role="img" aria-label="Illustration">
      {/* blob backdrop */}
      <path
        d="M120 60c70-40 180-30 230 30s30 150-40 180-180 20-230-50S50 100 120 60Z"
        fill="#e9e9fb"
      />

      {clock && (
        <g>
          <circle cx="360" cy="70" r="26" fill="#fff" stroke="#ff7a59" strokeWidth="4" />
          <path d="M360 70V54M360 70l12 8" stroke="#3b3b4f" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {/* plant */}
      <g>
        <path d="M408 300c0-26 8-46 18-58M408 300c0-30-10-50-22-60" stroke="#34c759" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M420 250c12-2 22-12 24-26-14 0-22 8-24 26ZM398 252c-12-4-20-16-20-30 14 2 20 12 20 30Z" fill="#34c759" />
        <path d="M396 300h28l-4 30h-20Z" fill="#f5a623" />
      </g>

      {/* desk */}
      <rect x="70" y="296" width="320" height="10" rx="5" fill="#5d5fef" />
      <rect x="96" y="306" width="8" height="40" rx="4" fill="#5d5fef" />
      <rect x="356" y="306" width="8" height="40" rx="4" fill="#5d5fef" />

      {/* chair + person */}
      <rect x="150" y="250" width="120" height="50" rx="14" fill="#f5a623" />
      <circle cx="212" cy="150" r="30" fill="#3b3b4f" />
      <circle cx="212" cy="158" r="22" fill="#ffb6a3" />
      <path d="M186 150a26 26 0 0 1 52 0Z" fill="#3b3b4f" />
      <path d="M172 250c0-34 18-62 40-62s40 28 40 62Z" fill="#6c5ce7" />
      <path d="M214 200c18 6 36 18 44 34l-14 10c-12-14-26-22-40-26Z" fill="#ffb6a3" />

      {/* laptop */}
      <rect x="244" y="240" width="70" height="44" rx="4" fill="#2d2d44" />
      <rect x="250" y="246" width="58" height="32" rx="2" fill="#a66bff" />
      <rect x="238" y="284" width="82" height="6" rx="3" fill="#1f1f33" />

      {/* lamp/books */}
      <rect x="92" y="270" width="44" height="10" rx="2" fill="#ff7a59" />
      <rect x="96" y="258" width="36" height="12" rx="2" fill="#4d8dff" />
      <rect x="100" y="246" width="28" height="12" rx="2" fill="#ffc542" />
    </svg>
  );
}
