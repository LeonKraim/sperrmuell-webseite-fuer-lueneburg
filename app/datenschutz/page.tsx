import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – Sperrmüll Karte Landkreis Lüneburg",
  description: "Datenschutzhinweise gemäß DSGVO für die Sperrmüll-Karte Landkreis Lüneburg.",
  robots: { index: false, follow: false },
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </h2>
      <div className="space-y-3 text-gray-700 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="mb-2 font-semibold text-gray-800">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SubSub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export default function DatenschutzPage() {
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
          Datenschutzhinweise
        </h1>

        {/* Verantwortlicher */}
        <Section title="Verantwortlicher">
          <p>
            Verantwortlicher im Sinne der Datenschutzgesetze, insbesondere der
            EU-Datenschutz-Grundverordnung (DSGVO), ist:
          </p>
          <p className="font-semibold text-gray-900">Leon Jamie Kraim</p>
        </Section>

        {/* Betroffenenrechte */}
        <Section title="Ihre Betroffenenrechte">
          <p>
            Unter den angegebenen Kontaktdaten können Sie gemäß EU-Datenschutz-Grundverordnung
            (DSGVO) jederzeit folgende Rechte ausüben:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Auskunft über Ihre bei uns gespeicherten Daten und deren Verarbeitung (Art. 15 DSGVO),</li>
            <li>Berichtigung unrichtiger personenbezogener Daten (Art. 16 DSGVO),</li>
            <li>Löschung Ihrer bei uns gespeicherten Daten (Art. 17 DSGVO),</li>
            <li>
              Einschränkung der Datenverarbeitung, sofern wir Ihre Daten aufgrund gesetzlicher
              Pflichten noch nicht löschen dürfen (Art. 18 DSGVO),
            </li>
            <li>Widerspruch gegen die Verarbeitung Ihrer Daten bei uns (Art. 21 DSGVO) und</li>
            <li>
              Datenübertragbarkeit, sofern Sie in die Datenverarbeitung eingewilligt haben oder
              einen Vertrag mit uns abgeschlossen haben (Art. 20 DSGVO).
            </li>
          </ul>
          <p>
            Sofern Sie uns eine Einwilligung erteilt haben, können Sie diese jederzeit mit Wirkung
            für die Zukunft widerrufen.
          </p>
          <p>
            Sie können sich jederzeit mit einer Beschwerde an eine Aufsichtsbehörde wenden, z. B.
            an die zuständige Aufsichtsbehörde des Bundeslands Ihres Wohnsitzes oder an die für
            uns als verantwortliche Stelle zuständige Behörde.
          </p>
          <p>
            Eine Liste der Aufsichtsbehörden (für den nichtöffentlichen Bereich) mit Anschrift
            finden Sie unter:{" "}
            <a
              href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html"
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-blue-600 hover:underline"
            >
              https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html
            </a>
            .
          </p>
        </Section>

        {/* Verarbeitungstätigkeiten */}
        <Section title="Verarbeitungstätigkeiten">
          {/* Server-Logfiles */}
          <Sub title="Erfassung allgemeiner Informationen beim Besuch unserer Website">
            <SubSub title="Art und Zweck der Verarbeitung">
              <p>
                Wenn Sie auf unsere Website zugreifen, d.h., wenn Sie sich nicht registrieren oder
                anderweitig Informationen übermitteln, werden automatisch Informationen allgemeiner
                Natur erfasst. Diese Informationen (Server-Logfiles) beinhalten etwa die Art des
                Webbrowsers, das verwendete Betriebssystem, den Domainnamen Ihres
                Internet-Service-Providers, Ihre IP-Adresse und ähnliches.
              </p>
              <p>Sie werden insbesondere zu folgenden Zwecken verarbeitet:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Sicherstellung eines problemlosen Verbindungsaufbaus der Website</li>
                <li>Sicherstellung einer reibungslosen Nutzung der Website</li>
                <li>
                  Sicherstellung und Auswertung der Systemsicherheit und -stabilität, insbesondere
                  zur Missbrauchserkennung
                </li>
                <li>zur technisch fehlerfreien Darstellung und Optimierung der Website</li>
              </ul>
              <p>
                Wir verwenden Ihre Daten nicht, um Rückschlüsse auf Ihre Person zu ziehen.
                Allerdings behalten wir uns vor, die Server-Logfiles nachträglich zu überprüfen,
                sollten konkrete Anhaltspunkte auf eine rechtswidrige Nutzung hinweisen.
              </p>
            </SubSub>
            <SubSub title="Rechtsgrundlage und berechtigtes Interesse">
              <p>
                Die Verarbeitung erfolgt gemäß Art. 6 Abs. 1 lit. f DSGVO auf Basis unseres
                berechtigten Interesses an der Verbesserung der Stabilität und Funktionalität
                unserer Website sowie der Sicherstellung der Systemsicherheit und
                Missbrauchserkennung.
              </p>
            </SubSub>
            <SubSub title="Empfänger">
              <p>
                Empfänger der Daten sind ggf. technische Dienstleister, die für den Betrieb und die
                Wartung unserer Webseite als Auftragsverarbeiter tätig werden.
              </p>
            </SubSub>
            <SubSub title="Speicherdauer">
              <p>
                Daten werden in Server-Log-Dateien in einer Form, die die Identifizierung der
                betroffenen Personen ermöglicht, maximal für 1 Tag gespeichert; es sei denn, dass
                ein sicherheitsrelevantes Ereignis auftritt (z.B. ein DDoS-Angriff).
              </p>
              <p>
                Im Falle eines solchen Ereignisses werden Server-Log-Dateien bis zur Beseitigung
                und vollständigen Aufklärung des sicherheitsrelevanten Ereignisses gespeichert.
              </p>
            </SubSub>
            <SubSub title="Drittlandtransfer">
              <p>Die erhobenen Daten werden ggfs. in folgende Drittländer übertragen:</p>
              <p className="font-medium text-gray-800">USA</p>
              <p>Folgende Datenschutzgarantien liegen vor:</p>
              <p>Angemessenheitsbeschluss der EU-Kommission</p>
            </SubSub>
            <SubSub title="Bereitstellung vorgeschrieben oder erforderlich">
              <p>
                Die Bereitstellung der vorgenannten personenbezogenen Daten ist weder gesetzlich
                noch vertraglich vorgeschrieben. Ohne die IP-Adresse ist jedoch der Dienst und die
                Funktionsfähigkeit unserer Website nicht gewährleistet. Zudem können einzelne
                Dienste und Services nicht verfügbar oder eingeschränkt sein.
              </p>
            </SubSub>
            <SubSub title="Widerspruch">
              <p>
                Lesen Sie dazu die Informationen über Ihr Widerspruchsrecht nach Art. 21 DSGVO
                weiter unten.
              </p>
            </SubSub>
          </Sub>

          {/* Kontaktaufnahme */}
          <Sub title="Kontaktaufnahme">
            <p>
              Unabhängig von der gewählten Kommunikationsart erheben wir den Inhalt Ihrer Anfrage.
              Ihre Daten werden zum Zweck der individuellen Kommunikation mit Ihnen gespeichert.
            </p>
            <SubSub title="Rechtsgrundlage">
              <p>
                Die Verarbeitung der Daten erfolgt auf der Grundlage eines berechtigten Interesses
                (Art. 6 Abs. 1 lit. f DSGVO).
              </p>
              <p>
                Unser berechtigtes Interesse an der Verarbeitung Ihrer Daten ist die Ermöglichung
                einer unkomplizierten Kontaktaufnahme.
              </p>
              <p>
                Sofern Sie mit uns Kontakt aufnehmen, um ein Angebot zu erfragen, erfolgt die
                Verarbeitung der Daten zur Durchführung vorvertraglicher Maßnahmen (Art. 6 Abs. 1
                lit. b DSGVO).
              </p>
            </SubSub>
            <SubSub title="Empfänger">
              <p>
                Empfänger der Daten sind ggf. technische Dienstleister, die für den Betrieb und die
                Wartung unserer Webseite als Auftragsverarbeiter tätig werden.
              </p>
            </SubSub>
            <SubSub title="Speicherdauer">
              <p>Daten werden spätestens 1 Jahr nach Bearbeitung der Kontaktaufnahme gelöscht.</p>
              <p>
                Sofern es zu einem Vertragsverhältnis kommt, unterliegen wir den gesetzlichen
                Aufbewahrungsfristen. Diese betragen grundsätzlich 6 oder 10 Jahre aus Gründen der
                ordnungsmäßigen Buchführung und steuerrechtlichen Anforderungen.
              </p>
            </SubSub>
            <SubSub title="Bereitstellung vorgeschrieben oder erforderlich">
              <p>
                Die Bereitstellung Ihrer personenbezogenen Daten erfolgt freiwillig. Wir können
                Ihre Anfrage jedoch nur bearbeiten, sofern Sie uns die erforderlichen Daten und den
                Grund der Anfrage mitteilen.
              </p>
            </SubSub>
            <SubSub title="Widerspruch">
              <p>
                Lesen Sie dazu die Informationen über Ihr Widerspruchsrecht nach Art. 21 DSGVO
                weiter unten.
              </p>
            </SubSub>
          </Sub>

          {/* Newsletter */}
          <Sub title="Newsletter">
            <SubSub title="Art und Zweck der Verarbeitung">
              <p>
                Für die Zustellung unseres Newsletters bzw. vergleichbarer Informationen erheben
                wir personenbezogene Daten, die über eine Eingabemaske an uns übermittelt werden.
              </p>
              <p>
                Für eine wirksame Registrierung benötigen wir eine valide E-Mail-Adresse. Um zu
                überprüfen, dass eine Anmeldung tatsächlich durch den Inhaber einer E-Mail-Adresse
                erfolgt, setzen wir das Double-Opt-in-Verfahren ein. Hierzu protokollieren wir die
                Anmeldung zum Newsletter, den Versand einer Bestätigungsmail und den Eingang der
                hiermit angeforderten Antwort. Weitere Daten werden nicht erhoben.
              </p>
            </SubSub>
            <SubSub title="Rechtsgrundlage">
              <p>
                Auf Grundlage Ihrer ausdrücklich erteilten Einwilligung (Art. 6 Abs. 1 lit. a
                DSGVO), übersenden wir Ihnen regelmäßig unseren Newsletter bzw. vergleichbare
                Informationen per E-Mail an Ihre angegebene E-Mail-Adresse.
              </p>
            </SubSub>
            <SubSub title="Empfänger">
              <p>
                Wir setzen für den Versand einen Dienstleister ein, der als unser Auftragsverarbeiter
                tätig wird.
              </p>
            </SubSub>
            <SubSub title="Speicherdauer">
              <p>
                Die Daten werden in diesem Zusammenhang nur verarbeitet, solange die entsprechende
                Einwilligung vorliegt.
              </p>
            </SubSub>
            <SubSub title="Bereitstellung vorgeschrieben oder erforderlich">
              <p>
                Die Bereitstellung Ihrer personenbezogenen Daten erfolgt freiwillig, allein auf
                Basis Ihrer Einwilligung. Ohne bestehende Einwilligung können wir Ihnen unseren
                Newsletter nicht zusenden.
              </p>
            </SubSub>
            <SubSub title="Widerruf der Einwilligung">
              <p>
                Die Einwilligung zur Speicherung Ihrer persönlichen Daten und ihrer Nutzung für den
                Newsletterversand können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Die
                Abmeldung kann über den in jeder E-Mail enthaltenen Link oder in dieser
                Datenschutzerklärung aufgeführten Kontaktinformationen beantragt werden.
              </p>
            </SubSub>
          </Sub>

          {/* Reichweitenmessung */}
          <Sub title="Reichweitenmessung">
            <SubSub title="Art und Zweck der Verarbeitung">
              <p>
                Die Reichweitenmessung dient der Auswertung der Besucherströme unseres
                Onlineangebotes und kann Verhalten, Interessen oder demographische Informationen zu
                den Besuchern, wie z.B. das Alter oder das Geschlecht, als pseudonyme Werte
                umfassen. Mit Hilfe der Reichweitenanalyse können wir z.B. erkennen, zu welcher
                Zeit unser Onlineangebot oder dessen Funktionen oder Inhalte am häufigsten genutzt
                werden oder zur Wiederverwendung einladen. Ebenso können wir nachvollziehen, welche
                Bereiche der Anpassung bedürfen.
              </p>
            </SubSub>
            <SubSub title="Rechtsgrundlage">
              <p>
                Die Verarbeitung erfolgt gemäß Art. 6 Abs. 1 lit. f DSGVO auf Basis unseres
                berechtigten Interesses. Die Messung der Reichweite und die sich daraus ergebenden
                Informationen sind geeignet, um das Webangebot anzupassen.
              </p>
            </SubSub>
            <SubSub title="Empfänger">
              <p>
                Wir setzen für Betrieb und Wartung unserer Webseite technische Dienstleister ein,
                die als unsere Auftragsverarbeiter tätig werden.
              </p>
            </SubSub>
            <SubSub title="Drittlandtransfer">
              <p>Die erhobenen Daten werden ggfs. in folgende Drittländer übertragen:</p>
              <p className="font-medium text-gray-800">USA</p>
              <p>Folgende Datenschutzgarantien liegen vor: Angemessenheitsbeschluss der EU-Kommission</p>
            </SubSub>
            <SubSub title="Bereitstellung vorgeschrieben oder erforderlich">
              <p>
                Die Bereitstellung der Daten ist weder gesetzlich noch vertraglich vorgeschrieben.
              </p>
            </SubSub>
            <SubSub title="Widerspruch">
              <p>
                Lesen Sie dazu die Informationen über Ihr Widerspruchsrecht nach Art. 21 DSGVO
                weiter unten.
              </p>
            </SubSub>
          </Sub>
        </Section>

        {/* Widerspruchsrecht */}
        <Section title="Information über Ihr Widerspruchsrecht nach Art. 21 DSGVO">
          <Sub title="Einzelfallbezogenes Widerspruchsrecht">
            <p>
              Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben,
              jederzeit gegen die Verarbeitung Sie betreffender personenbezogener Daten, die
              aufgrund Art. 6 Abs. 1 lit. f DSGVO (Datenverarbeitung auf der Grundlage einer
              Interessenabwägung) erfolgt, Widerspruch einzulegen; dies gilt auch für ein auf diese
              Bestimmung gestütztes Profiling im Sinne von Art. 4 Nr. 4 DSGVO.
            </p>
            <p>
              Legen Sie Widerspruch ein, werden wir Ihre personenbezogenen Daten nicht mehr
              verarbeiten, es sei denn, wir können zwingende schutzwürdige Gründe für die
              Verarbeitung nachweisen, die Ihre Interessen, Rechte und Freiheiten überwiegen, oder
              die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von
              Rechtsansprüchen.
            </p>
          </Sub>
          <Sub title="Empfänger eines Widerspruchs">
            <address className="not-italic">
              <p className="font-semibold text-gray-900">Leon Jamie Kraim</p>
              <p>
                <a href="tel:+4915906117790" className="hover:text-blue-600 hover:underline">
                  015906117790
                </a>
              </p>
              <p>
                <a
                  href="mailto:offleon.kraim.bus+contact@gmail.com"
                  className="break-all hover:text-blue-600 hover:underline"
                >
                  offleon.kraim.bus+contact@gmail.com
                </a>
              </p>
              <p>Ringstraße 25, 21339 Lüneburg</p>
            </address>
          </Sub>
        </Section>

        {/* Änderungen */}
        <Section title="Änderung unserer Datenschutzerklärung">
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den
            aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in
            der Datenschutzerklärung umzusetzen, z.B. bei der Einführung neuer Services. Für Ihren
            erneuten Besuch gilt dann die neue Datenschutzerklärung.
          </p>
        </Section>

        {/* Fragen */}
        <Section title="Fragen zum Datenschutz">
          <p>
            Wenn Sie Fragen zum Datenschutz haben, schreiben Sie uns bitte eine E-Mail an den oben
            genannten Verantwortlichen.
          </p>
        </Section>

        {/* Urheberrecht */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs italic text-gray-400">
            Diese Datenschutzerklärung wurde mit Hilfe der activeMind AG erstellt – den Experten
            für{" "}
            <a
              href="https://www.activemind.de/datenschutz/datenschutzbeauftragter/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              externe Datenschutzbeauftragte
            </a>{" "}
            (Version #2024-10-25).
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-3xl px-4 text-center text-sm text-gray-400 sm:px-6">
          © {new Date().getFullYear()} Leon Jamie Kraim &mdash;{" "}
          <Link href="/impressum" className="transition hover:text-gray-700 hover:underline">
            Impressum
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
