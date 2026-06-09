import Link from "next/link";

export default function AccountCreatedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-card px-8 py-16 text-center shadow-[0_8px_40px_rgba(20,20,43,0.06)]">
        <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-violet-100">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 11.5 4 14a2 2 0 0 0 0 3l1 1a2 2 0 0 0 3 0l1-1m1-7 4-1.5a2 2 0 0 1 2.5 1.2l.3.8a2 2 0 0 1-1.2 2.5L13 12"
              stroke="#5d5fef"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path d="M9.5 9.5A4 4 0 0 1 14 6c2 0 4 2 4 4a4 4 0 0 1-3.5 4l-2 5-3-3 1-3-3-1 4-2.5Z" fill="#5d5fef" />
            <path d="M18 4l1 1M20 8h1M17 8l.5.5" stroke="#a66bff" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="6" cy="6" r="1" fill="#ff7a59" />
            <circle cx="20" cy="14" r="1" fill="#ffc542" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-ink">Your account successfully created.</h1>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-xl bg-primary px-7 py-3 text-sm font-medium text-white transition hover:bg-primary-dark"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
