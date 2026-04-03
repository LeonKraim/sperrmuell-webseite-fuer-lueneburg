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
          <address className="not-italic">
            <p className="font-semibold text-gray-900">Leon Jamie Kraim</p>
            <p>Ringstraße 25, 21339 Lüneburg</p>
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
          </address>
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
            Sie können sich jederzeit mit einer Beschwerde an eine Aufsichtsbehörde wenden. Die
            für uns zuständige Aufsichtsbehörde ist:
          </p>
          <address className="not-italic rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
            <p className="font-semibold text-gray-900">Die Landesbeauftragte für den Datenschutz Niedersachsen (LfD Niedersachsen)</p>
            <p>Prinzenstraße 5, 30159 Hannover</p>
            <p><a href="tel:+495111204500" className="hover:text-blue-600 hover:underline">0511 120-4500</a></p>
            <p><a href="https://www.lfd.niedersachsen.de" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.lfd.niedersachsen.de</a></p>
          </address>
          <p>
            Eine Liste aller Aufsichtsbehörden (für den nichtöffentlichen Bereich) finden Sie
            unter:{" "}
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

          <Sub title="SSL/TLS-Verschlüsselung">
            <p>
              Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher
              Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen
              Sie daran, dass die Adresszeile des Browsers von {'"'}http://{'"'} auf {'"'}https://{'"'} wechselt und
              an dem Schloss-Symbol in Ihrer Browserzeile. Wenn die SSL- bzw. TLS-Verschlüsselung
              aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten
              mitgelesen werden.
            </p>
          </Sub>

          {/* Server-Logfiles */}
          <Sub title="Erfassung allgemeiner Informationen beim Besuch unserer Website">
            <SubSub title="Art und Zweck der Verarbeitung">
              <p>
                Wenn Sie auf unsere Website zugreifen, werden automatisch Informationen allgemeiner
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
                Wartung unserer Webseite als Auftragsverarbeiter tätig werden, insbesondere
                Vercel Inc. (siehe Abschnitt {'"'}Hosting durch Vercel{'"'}).
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
              <p>
                Die Datenübertragung in die USA (Vercel Inc.) erfolgt auf Grundlage des
                EU-U.S. Data Privacy Frameworks (DPF), da Vercel Inc. im DPF-Register der
                U.S. Handelsministeriums eingetragen ist.
              </p>
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

          {/* Hosting */}
          <Sub title="Hosting durch Vercel">
            <p>
              Wir hosten unsere Website bei Vercel. Anbieter ist die Vercel Inc., 440 N Barranca
              Ave #4133, Covina, CA 91723, USA. Vercel erfasst Server-Logfiles (IP-Adresse,
              Browser-Typ etc.), um die Auslieferung der Seite technisch zu ermöglichen. Wir haben
              mit Vercel einen Vertrag über Auftragsverarbeitung (Data Processing Addendum)
              abgeschlossen.
            </p>
            <p>
              Die Datenübertragung in die USA erfolgt auf Grundlage des EU-U.S. Data Privacy
              Frameworks (DPF), da Vercel Inc. im DPF-Register eingetragen ist. Weitere
              Informationen finden Sie in der Datenschutzerklärung von Vercel:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://vercel.com/legal/privacy-policy
              </a>
              .
            </p>
          </Sub>

          {/* Kontaktaufnahme */}
          <Sub title="Kontaktaufnahme">
            <p className="font-semibold text-gray-700">Art und Zweck der Verarbeitung</p>
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
              <p>Daten werden spätestens 10 Jahre nach Bearbeitung der Kontaktaufnahme gelöscht.</p>
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
                Wir betreiben einen E-Mail-Benachrichtigungsdienst, der Sie informiert, sobald neue
                Sperrmülltermine im Landkreis Lüneburg veröffentlicht werden. Für die Zustellung
                erheben wir Ihre E-Mail-Adresse über ein Anmeldeformular.
              </p>
              <p>
                Für eine wirksame Registrierung benötigen wir eine valide E-Mail-Adresse. Um zu
                überprüfen, dass eine Anmeldung tatsächlich durch den Inhaber einer E-Mail-Adresse
                erfolgt, setzen wir das Double-Opt-in-Verfahren ein. Hierzu protokollieren wir die
                Anmeldung zum Newsletter, den Versand einer Bestätigungsmail und den Eingang der
                hiermit angeforderten Antwort.
              </p>
              <p>
                Zum Nachweis der Einwilligung speichern wir zusätzlich: IP-Adresse zum Zeitpunkt
                der Anmeldung, Datum und Uhrzeit der Anmeldung sowie Datum und Uhrzeit der
                Bestätigung.
              </p>
            </SubSub>
            <SubSub title="Rechtsgrundlage">
              <p>
                Auf Grundlage Ihrer ausdrücklich erteilten Einwilligung (Art. 6 Abs. 1 lit. a
                DSGVO) übersenden wir Ihnen Benachrichtigungen per E-Mail an Ihre angegebene
                E-Mail-Adresse.
              </p>
            </SubSub>
            <SubSub title="Empfänger">
              <p>
                Für den technischen Versand der E-Mails nutzen wir den SMTP-Dienst von Google (Gmail).
                Anbieter ist die Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland
                bzw. für den Datentransfer in die USA die Google LLC, 1600 Amphitheatre Parkway,
                Mountain View, CA 94043, USA. Google verarbeitet dabei die E-Mail-Adressen der Empfänger
                sowie den Inhalt der versandten E-Mails.
              </p>
            </SubSub>
            <SubSub title="Drittlandtransfer">
              <p>
                Die Datenübertragung an Google LLC in die USA erfolgt auf Grundlage des EU-U.S. Data
                Privacy Frameworks (DPF), da Google LLC im DPF-Register der U.S. Handelsministeriums
                eingetragen ist. Weitere Informationen finden Sie in der Datenschutzerklärung von
                Google:{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  https://policies.google.com/privacy
                </a>.
              </p>
            </SubSub>
            <SubSub title="Speicherdauer">
              <p>
                Ihre E-Mail-Adresse und die zugehörigen Anmeldedaten werden gespeichert, solange
                Ihre Einwilligung vorliegt. Nach einem Widerruf bzw. einer Abmeldung werden Ihre
                Daten innerhalb von 30 Tagen gelöscht, sofern keine gesetzlichen
                Aufbewahrungspflichten entgegenstehen. Die zum Nachweis der Einwilligung
                protokollierten Daten (IP-Adresse, Zeitstempel) können für einen darüber
                hinausgehenden Zeitraum von bis zu 3 Jahren aufbewahrt werden, um die
                Rechtmäßigkeit des Versands nachweisen zu können.
              </p>
            </SubSub>
            <SubSub title="Bereitstellung vorgeschrieben oder erforderlich">
              <p>
                Die Bereitstellung Ihrer personenbezogenen Daten erfolgt freiwillig, allein auf
                Basis Ihrer Einwilligung. Ohne bestehende Einwilligung können wir Ihnen keine
                Benachrichtigungen zusenden.
              </p>
            </SubSub>
            <SubSub title="Widerruf der Einwilligung">
              <p>
                Die Einwilligung zur Speicherung Ihrer persönlichen Daten und ihrer Nutzung für den
                Versand von Benachrichtigungen können Sie jederzeit mit Wirkung für die Zukunft
                widerrufen. Die Abmeldung kann über den in jeder E-Mail enthaltenen
                Abmeldelink oder über die oben aufgeführten Kontaktinformationen beantragt werden.
              </p>
            </SubSub>
          </Sub>

          {/* Reichweitenmessung */}
          <Sub title="Reichweitenmessung">
            <SubSub title="Art und Zweck der Verarbeitung">
              <p>
                Wir setzen Vercel Analytics ein, um die Nutzung unseres Webangebotes auszuwerten.
                Dabei werden folgende Daten erhoben: aufgerufene Seiten (URL), Referrer-URL,
                Gerätetyp (Desktop/Mobil), Betriebssystem, Browser-Typ sowie das Herkunftsland des
                Besuchs (aus der IP-Adresse abgeleitet; die IP-Adresse selbst wird nicht
                gespeichert). Es werden keine Cookies gesetzt. Die Daten werden pseudonymisiert
                verarbeitet.
              </p>
              <p>
                Vercel Analytics ruft dazu beim Seitenaufruf ein clientseitiges JavaScript ab, das
                Informationen aus Ihrem Browser ausliest (z.B. Bildschirmauflösung, User-Agent,
                Referrer). Dieser Zugriff auf Ihr Endgerät erfordert nach § 25 Abs. 1 TDDDG Ihre
                Einwilligung, da er nicht für den technischen Betrieb der Website unbedingt
                erforderlich ist.
              </p>
            </SubSub>
            <SubSub title="Rechtsgrundlage">
              <p>
                Der Zugriff auf Informationen in Ihrem Endgerät erfolgt gemäß § 25 Abs. 1 TDDDG
                ausschließlich auf Grundlage Ihrer Einwilligung. Die anschließende Verarbeitung
                der erhobenen Daten erfolgt gemäß Art. 6 Abs. 1 lit. a DSGVO auf Grundlage
                derselben Einwilligung. Ihre Einwilligung können Sie jederzeit mit Wirkung für die
                Zukunft widerrufen.
              </p>
            </SubSub>
            <SubSub title="Empfänger">
              <p>
                Empfänger der Daten ist Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
                USA, die als Auftragsverarbeiter für uns tätig wird.
              </p>
            </SubSub>
            <SubSub title="Speicherdauer">
              <p>
                Die durch Vercel Analytics erhobenen Daten werden für maximal 30 Tage gespeichert.
              </p>
            </SubSub>
            <SubSub title="Drittlandtransfer">
              <p>
                Die Daten werden an Vercel Inc. in die USA übertragen. Die Übertragung erfolgt auf
                Grundlage des EU-U.S. Data Privacy Frameworks (DPF), da Vercel Inc. im
                DPF-Register eingetragen ist.
              </p>
            </SubSub>
            <SubSub title="Bereitstellung vorgeschrieben oder erforderlich">
              <p>
                Die Bereitstellung der Daten ist weder gesetzlich noch vertraglich vorgeschrieben.
                Vercel Analytics wird nur nach Ihrer Einwilligung aktiviert.
              </p>
            </SubSub>
          </Sub>

          {/* Geolocation */}
          <Sub title="Standortbestimmung">
            <SubSub title="Art und Zweck">
              <p>
                Auf Ihren ausdrücklichen Wunsch hin ermitteln wir Ihren aktuellen Standort, um
                Ihnen Ihre Position auf der Sperrmüll-Karte anzuzeigen. Die Standortdaten werden
                ausschließlich lokal in Ihrem Browser verarbeitet und nicht an unsere Server
                übertragen oder gespeichert.
              </p>
            </SubSub>
            <SubSub title="Rechtsgrundlage">
              <p>
                Art. 6 Abs. 1 lit. a DSGVO (Einwilligung). Die Einwilligung erfolgt durch Ihre
                aktive Bestätigung der Standortfreigabe im Browser.
              </p>
            </SubSub>
            <SubSub title="Speicherdauer">
              <p>
                Die Standortdaten werden nicht gespeichert. Die Verarbeitung findet ausschließlich
                für die Dauer der Sitzung im Browser statt.
              </p>
            </SubSub>
            <SubSub title="Empfänger">
              <p>Keine. Die Daten verlassen Ihren Browser nicht.</p>
            </SubSub>
          </Sub>

          {/* OpenStreetMap */}
          <Sub title="Einsatz von OpenStreetMap">
            <SubSub title="Art und Zweck der Verarbeitung">
              <p>
                Wir binden die Landkarten des Dienstes &bdquo;OpenStreetMap&rdquo; ein, die auf
                Grundlage der Open Data Commons Open Database License (ODbL) durch die
                OpenStreetMap Foundation (OSMF) angeboten werden.
              </p>
              <p>
                Damit Ihnen die Karte angezeigt werden kann, wird technisch bedingt Ihre
                IP-Adresse an die Server der OpenStreetMap Foundation weitergeleitet.
                Nach unserer Kenntnis werden die Daten der Nutzer durch OpenStreetMap
                ausschließlich zu Zwecken der Darstellung der Kartenfunktionen und zur
                Zwischenspeicherung der gewählten Einstellungen verwendet.
              </p>
            </SubSub>
            <SubSub title="Rechtsgrundlage">
              <p>
                Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
                Unser berechtigtes Interesse liegt in einer nutzerfreundlichen
                Gestaltung unserer Website sowie der visuellen Darstellung der
                Sperrmüll-Standorte im Landkreis Lüneburg.
              </p>
              <p>
                Der Zugriff auf die Endeinrichtung des Nutzers, der beim Laden der Kartenkacheln
                technisch stattfindet (Netzwerkanfrage mit IP-Übermittlung), ist gemäß § 25 Abs. 2
                Nr. 2 TDDDG einwilligungsfrei, da er unbedingt erforderlich ist, um den vom Nutzer
                ausdrücklich gewünschten Dienst – die Darstellung der interaktiven
                Sperrmüll-Karte – zu erbringen.
              </p>
            </SubSub>
            <SubSub title="Empfänger">
              <p>
                Empfänger der Daten ist die OpenStreetMap Foundation (OSMF),
                St John&apos;s Innovation Centre, Cowley Road, Cambridge, CB4 0WS,
                United Kingdom.
              </p>
            </SubSub>
            <SubSub title="Drittlandtransfer">
              <p>
                Das Vereinigte Königreich gilt aufgrund eines Angemessenheitsbeschlusses
                der EU-Kommission als sicheres Drittland mit einem angemessenen
                Datenschutzniveau.
              </p>
            </SubSub>
          </Sub>
        </Section>

        {/* Widerspruchsrecht */}
        <section className="mb-6 rounded-xl border-2 border-gray-800 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Information über Ihr Widerspruchsrecht nach Art. 21 DSGVO
          </h2>
          <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
              <p className="font-semibold text-gray-900 mb-2">
                ⚠ Wichtiger Hinweis – Bitte gesondert beachten
              </p>
              <p>
                Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben,
                jederzeit gegen die Verarbeitung Sie betreffender personenbezogener Daten, die
                aufgrund Art. 6 Abs. 1 lit. f DSGVO (Datenverarbeitung auf der Grundlage einer
                Interessenabwägung) erfolgt, Widerspruch einzulegen; dies gilt auch für ein auf
                diese Bestimmung gestütztes Profiling im Sinne von Art. 4 Nr. 4 DSGVO.
              </p>
              <p className="mt-2">
                Legen Sie Widerspruch ein, werden wir Ihre personenbezogenen Daten nicht mehr
                verarbeiten, es sei denn, wir können zwingende schutzwürdige Gründe für die
                Verarbeitung nachweisen, die Ihre Interessen, Rechte und Freiheiten überwiegen,
                oder die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von
                Rechtsansprüchen.
              </p>
            </div>
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
          </div>
        </section>

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
