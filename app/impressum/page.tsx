import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum – Sperrmüll Karte Landkreis Lüneburg",
  description: "Impressum und Anbieterkennzeichnung gemäß § 5 TMG für die Sperrmüll-Karte Landkreis Lüneburg.",
  robots: { index: false, follow: false },
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zur Karte
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Impressum
        </h1>

        {/* Angaben gemäß § 5 TMG */}
        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Angaben gemäß § 5 TMG
          </h2>
          <address className="not-italic">
            <p className="text-lg font-semibold text-gray-900">Leon Jamie Kraim</p>
            <p className="mt-1 text-gray-600">Ringstraße 25</p>
            <p className="text-gray-600">21339 Lüneburg</p>
            <p className="text-gray-600">Deutschland</p>
          </address>
        </section>

        {/* Kontakt */}
        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Kontakt
          </h2>
          <dl className="space-y-3">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
              <dt className="w-24 flex-shrink-0 text-sm font-medium text-gray-500">Telefon</dt>
              <dd className="text-gray-900">
                <a
                  href="tel:+4915906117790"
                  className="transition hover:text-blue-600 hover:underline"
                >
                  015906117790
                </a>
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
              <dt className="w-24 flex-shrink-0 text-sm font-medium text-gray-500">E-Mail</dt>
              <dd className="text-gray-900">
                <a
                  href="mailto:offleon.kraim.bus+contact@gmail.com"
                  className="break-all transition hover:text-blue-600 hover:underline"
                >
                  offleon.kraim.bus+contact@gmail.com
                </a>
              </dd>
            </div>
          </dl>
        </section>

        {/* Umsatzsteuer */}
        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Umsatzsteuer
          </h2>
          <p className="text-gray-700">
            Kleinunternehmer gemäß § 19 UStG
          </p>
        </section>

        {/* Streitschlichtung */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Streitschlichtung
          </h2>
          <p className="text-gray-700">
            Zur Teilnahme an einem Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle sind wir nicht verpflichtet und nicht bereit.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-3xl px-4 text-center text-sm text-gray-400 sm:px-6">
          © {new Date().getFullYear()} Leon Jamie Kraim &mdash;{" "}
          <Link href="/datenschutz" className="transition hover:text-gray-700 hover:underline">
            Datenschutz
          </Link>
          {" · "}
          <Link href="/" className="transition hover:text-gray-700 hover:underline">
            Zurück zur Karte
          </Link>
        </div>
      </footer>
    </div>
  );
}
