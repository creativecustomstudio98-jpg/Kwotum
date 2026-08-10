import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const outputDirectory = join(process.cwd(), "artifacts", "redesign", "after");
const stylePaths = [
  join(process.cwd(), "packages", "ui", "src", "styles.css"),
  join(process.cwd(), "apps", "web", "app", "panel", "styles.css"),
];
const viewports = [
  { height: 1000, label: "1440", width: 1440 },
  { height: 844, label: "390", width: 390 },
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch();

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    for (const [name, content] of [
      ["panel-leads", leadsFixture()],
      ["panel-lead-detail", leadDetailFixture()],
      ["panel-dashboard", dashboardFixture()],
      ["panel-states", statesFixture()],
    ]) {
      await page.setContent(
        documentShell(content, name === "panel-dashboard" ? "Analityka" : "Leady"),
        {
          waitUntil: "load",
        },
      );
      for (const path of stylePaths) {
        await page.addStyleTag({ path });
      }
      await page.screenshot({
        animations: "disabled",
        fullPage: true,
        path: join(outputDirectory, `${name}-${viewport.label}.png`),
      });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      console.log(`${name} ${viewport.label}: overflow=${String(overflow)}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}

function documentShell(content, activeItem) {
  return `<!doctype html>
    <html lang="pl">
      <head><meta charset="utf-8"><title>Lorum — demo wizualne panelu</title></head>
      <body>
        <div class="panel-app-shell">
          <aside class="panel-rail" aria-label="Nawigacja organizacji: Studio Mebli">
            <a class="panel-rail__brand" href="#">Lorum</a>
            <nav aria-label="Narzędzia organizacji">
              ${railLink("▤", "Leady", activeItem === "Leady")}
              ${railLink("▥", "Analityka", activeItem === "Analityka")}
              ${railLink("⌁", "WordPress", activeItem === "WordPress")}
              ${railLink("◇", "Prywatność", activeItem === "Prywatność")}
            </nav>
            <a class="panel-rail__organization" href="#">
              <span>SM</span><span class="panel-rail__label">Zmień organizację</span>
            </a>
          </aside>
          <div class="panel-app-content">${content}</div>
        </div>
      </body>
    </html>`;
}

function railLink(icon, label, active = false) {
  return `<a ${active ? 'aria-current="page" class="is-active"' : ""} href="#">
    <span aria-hidden="true">${icon}</span><span class="panel-rail__label">${label}</span>
  </a>`;
}

function leadsFixture() {
  const rows = [
    [
      "Anna Kowalska",
      "anna@example.test",
      "Kuchnia na wymiar",
      "30 000–45 000 zł",
      "85",
      "Wysokie dopasowanie",
      "Gotowy do kontaktu",
      "dzisiaj, 11:37",
    ],
    [
      "Tomasz Nowak",
      "tomasz@example.test",
      "Meble do salonu",
      "18 000–26 000 zł",
      "72",
      "Dobre dopasowanie",
      "Nowy",
      "dzisiaj, 09:12",
    ],
    [
      "Maria Wiśniewska",
      "maria@example.test",
      "Szafa wnękowa",
      "Nie obliczono",
      "—",
      "",
      "W toku",
      "wczoraj, 16:48",
    ],
  ];
  return `
    <main class="panel-shell lead-panel">
      <header class="panel-header lead-page-header">
        <div><p class="panel-eyebrow">Obsługa zapytań</p><h1>Leady</h1></div>
        <a class="wy-button wy-button--secondary wy-button--small" href="#">Organizacje</a>
      </header>
      <nav aria-label="Filtr statusu" class="lead-filters">
        <a aria-current="page" href="#">Wszystkie</a><a href="#">Nowe</a>
        <a href="#">W toku</a><a href="#">Zakwalifikowane</a><a href="#">Wygrane</a>
      </nav>
      <div class="lead-table-wrap">
        <table class="lead-table">
          <thead><tr><th>Kontakt</th><th>Zakres</th><th>Wynik orientacyjny</th><th>Score</th><th>Status</th><th>Aktualizacja</th><th><span class="wy-sr-only">Akcja</span></th></tr></thead>
          <tbody>
            ${rows
              .map(
                (row) => `<tr>
                  <th data-label="Kontakt" scope="row"><a href="#">${row[0]}</a><small>${row[1]}</small></th>
                  <td data-label="Zakres">${row[2]}</td>
                  <td data-label="Wynik orientacyjny">${row[3]}</td>
                  <td data-label="Score"><strong class="lead-score">${row[4]}</strong>${row[5] ? `<small>${row[5]}</small>` : ""}</td>
                  <td data-label="Status"><span class="lead-status lead-status--${row[6] === "Gotowy do kontaktu" ? "qualified" : "new"}">${row[6]}</span></td>
                  <td data-label="Aktualizacja">${row[7]}</td>
                  <td class="lead-table__action"><a href="#"><span>→</span></a></td>
                </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </main>`;
}

function leadDetailFixture() {
  return `
    <main class="panel-shell lead-panel">
      <header class="panel-header lead-page-header lead-detail-header">
        <div><p class="panel-eyebrow">Lead 2026-0152 · Kuchnie na wymiar</p><h1>Anna Kowalska</h1></div>
        <div class="lead-detail-header__actions">
          <span class="lead-status lead-status--qualified">Gotowy do kontaktu</span>
          <a class="wy-button wy-button--secondary wy-button--small" href="#">Wróć do leadów</a>
        </div>
      </header>
      <div class="lead-detail-grid lead-document">
        <div class="lead-detail-column">
          <section class="lead-document__section">
            <h2>Kontakt i wynik</h2>
            <dl class="lead-definition-list">
              <dt>E-mail</dt><dd><a href="#">anna@example.test</a></dd>
              <dt>Telefon</dt><dd>+48 500 000 000</dd>
              <dt>Proces</dt><dd>Kuchnia na wymiar</dd>
              <dt>Wynik</dt><dd>30 000–45 000 zł</dd>
              <dt>Score</dt><dd>85/100 · Wysokie dopasowanie</dd>
              <dt>Wysłano</dt><dd>25 lip 2026, 10:24</dd>
            </dl>
          </section>
          <section class="lead-document__section">
            <h2>Odpowiedzi</h2>
            <ul class="lead-answer-list">
              <li><strong>Zakres projektu</strong><span>Zabudowa, blat, AGD i montaż</span></li>
              <li><strong>Budżet</strong><span>30–45 tys. zł</span></li>
              <li><strong>Termin</strong><span>Do 3 miesięcy</span></li>
              <li><strong>Lokalizacja</strong><span>Warszawa</span></li>
            </ul>
          </section>
          <section class="lead-document__section">
            <h2>Powody dopasowania</h2>
            <ul class="lead-rule-list"><li>Budżet zgodny z ofertą: +25 pkt</li><li>Termin realny: +20 pkt</li><li>Zakres w ofercie: +15 pkt</li></ul>
          </section>
          <section class="lead-document__section"><h2>Pliki</h2><ul class="lead-file-list"><li>Rzut pomieszczenia.pdf <small>application/pdf, 412 000 B</small></li><li>Inspiracje-kuchni.jpg <small>image/jpeg, 1 200 000 B</small></li></ul></section>
        </div>
        <aside class="lead-detail-column" aria-label="Działania i historia">
          <section class="lead-document__section"><h2>Następny krok</h2><p>Umów rozmowę i potwierdź termin pomiaru.</p><button class="wy-button wy-button--primary">Umów rozmowę</button></section>
          <section class="lead-document__section"><h2>Zmień status</h2><div class="lead-action-form"><select class="wy-input"><option>Gotowy do kontaktu</option></select><button class="wy-button wy-button--secondary">Zapisz status</button></div></section>
          <section class="lead-document__section"><h2>Notatki</h2><p>Brak notatek.</p></section>
          <section class="lead-document__section"><h2>Historia statusu</h2><ul class="lead-history-list"><li>Nowy → Gotowy do kontaktu<br><small>dzisiaj, 11:37</small></li><li>Nowy<br><small>dzisiaj, 10:24</small></li></ul></section>
        </aside>
      </div>
    </main>`;
}

function dashboardFixture() {
  const sources = [
    ["Wejścia bezpośrednie", "32 · 50%", 50],
    ["Wyszukiwarki", "21 · 32,8%", 32.8],
    ["Odesłania", "11 · 17,2%", 17.2],
  ];
  const devices = [
    ["Telefon", "37 · 57,8%", 57.8],
    ["Komputer", "24 · 37,5%", 37.5],
    ["Tablet", "3 · 4,7%", 4.7],
  ];
  const breakdown = (items) =>
    items
      .map(
        ([label, value, share]) => `<li>
          <div><span>${label}</span><strong>${value}</strong></div>
          <progress aria-label="${label}: ${share}%" max="100" value="${share}"></progress>
        </li>`,
      )
      .join("");

  return `
    <main class="panel-shell analytics-panel">
      <header class="panel-header analytics-header">
        <div>
          <p class="panel-eyebrow">Studio Mebli</p>
          <h1>Analityka procesu</h1>
          <p>Dane obejmują wyłącznie sesje z aktywną zgodą na analitykę.</p>
        </div>
        <a class="wy-button wy-button--secondary wy-button--small" href="#">Przejdź do leadów</a>
      </header>
      <nav aria-label="Zakres analityki" class="analytics-periods">
        <a href="#">7 dni</a><a aria-current="page" href="#">30 dni</a><a href="#">90 dni</a>
      </nav>
      <section aria-labelledby="analytics-summary-fixture">
        <h2 id="analytics-summary-fixture">Podsumowanie</h2>
        <dl class="analytics-stats">
          <div><dt>Sesje ze zgodą</dt><dd>64</dd></div>
          <div><dt>Rozpoczęcie</dt><dd>82,8%</dd></div>
          <div><dt>Wyświetlenie wyniku</dt><dd>59,4%</dd></div>
          <div><dt>Wysłanie leada</dt><dd>31,3%</dd></div>
          <div><dt>Mediana do wyniku</dt><dd>2 min 18 s</dd></div>
        </dl>
      </section>
      <div class="analytics-grid">
        <section class="analytics-card"><h2>Źródła</h2><ul class="analytics-breakdown">${breakdown(sources)}</ul></section>
        <section class="analytics-card"><h2>Urządzenia</h2><ul class="analytics-breakdown">${breakdown(devices)}</ul></section>
      </div>
      <section class="analytics-card" aria-labelledby="drop-off-fixture">
        <h2 id="drop-off-fixture">Drop-off kroków</h2>
        <div class="analytics-table-wrap">
          <table>
            <thead><tr><th>Krok</th><th>Wyświetlenia</th><th>Odpowiedzi</th><th>Odejścia</th></tr></thead>
            <tbody>
              <tr><th scope="row">Zakres</th><td>53</td><td>49</td><td>4 (7,5%)</td></tr>
              <tr><th scope="row">Budżet</th><td>49</td><td>43</td><td>6 (12,2%)</td></tr>
              <tr><th scope="row">Termin</th><td>43</td><td>38</td><td>5 (11,6%)</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>`;
}

function statesFixture() {
  return `
    <main class="panel-shell">
      <header class="panel-header"><div><p class="panel-eyebrow">Stany systemowe</p><h1>Jasna przyczyna i następny krok</h1></div></header>
      <div style="display:grid;gap:24px">
        <section class="wy-state"><span class="wy-state__mark">Brak danych</span><h3>Nie ma jeszcze leadów</h3><p>Udostępnij opublikowany proces i wyślij testowy lead.</p><button class="wy-button wy-button--primary">Wyślij testowy lead</button></section>
        <section class="wy-state wy-state--error"><span class="wy-state__mark">Błąd</span><h3>Panel jest chwilowo niedostępny</h3><p>Nie udało się bezpiecznie pobrać danych. Spróbuj ponownie.</p><button class="wy-button wy-button--secondary">Spróbuj ponownie</button></section>
        <section class="wy-state"><span class="wy-state__mark" aria-hidden="true">Brak dostępu</span><h3>Nie masz uprawnień do tej sekcji</h3><p>Ustawienia prywatności może otworzyć wyłącznie właściciel organizacji.</p><a class="wy-button wy-button--secondary" href="#">Wróć do leadów</a></section>
        <section class="wy-alert wy-alert--success"><strong>Zapisano status</strong><div>Lead jest gotowy do kontaktu. Następny krok: umów rozmowę.</div></section>
        <section aria-label="Ładowanie leadów" class="wy-skeleton" role="status"><span class="wy-skeleton__line"></span><span class="wy-skeleton__line"></span><span class="wy-skeleton__line"></span></section>
      </div>
    </main>`;
}
