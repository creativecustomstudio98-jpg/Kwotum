from __future__ import annotations

from pathlib import Path
from html import escape
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "screenshots"
BOARDS = ROOT / "boards"
OUT.mkdir(parents=True, exist_ok=True)
BOARDS.mkdir(parents=True, exist_ok=True)

ICONS = {
    "home": '<path d="M3 10.8 12 3l9 7.8"/><path d="M5 9.8V21h14V9.8"/><path d="M9 21v-7h6v7"/>',
    "leads": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    "flow": '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M10 6.5h4a3 3 0 0 1 3 3V14"/><path d="m14 11 3 3 3-3"/>',
    "template": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 4v5"/><path d="M8 13h4"/><path d="M8 16h7"/>',
    "chart": '<path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19V3"/><path d="M2 21h22"/>',
    "plug": '<path d="m12 22 4-4"/><path d="M17 8 7 18"/><path d="m16 3 5 5"/><path d="M19 6 8.5 16.5a4.24 4.24 0 0 1-6-6L13 0"/>',
    "settings": '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-2.83 2.83-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21h-4v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06-2.83-2.83.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3v-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06 2.83-2.83.06.06A1.65 1.65 0 0 0 9 4.6h.01A1.65 1.65 0 0 0 10 3.09V3h4v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06 2.83 2.83-.06.06A1.65 1.65 0 0 0 19.4 9v.01A1.65 1.65 0 0 0 20.91 10H21v4h-.09A1.65 1.65 0 0 0 19.4 15Z"/>',
    "bell": '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    "search": '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    "filter": '<path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/>',
    "plus": '<path d="M12 5v14"/><path d="M5 12h14"/>',
    "chevron": '<path d="m9 18 6-6-6-6"/>',
    "back": '<path d="m15 18-6-6 6-6"/>',
    "dots": '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    "calendar": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M3 11h18"/>',
    "location": '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    "file": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    "phone": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.28-1.28a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92Z"/>',
    "check": '<path d="m5 12 4 4L19 6"/>',
    "alert": '<path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    "edit": '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    "copy": '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    "external": '<path d="M14 3h7v7"/><path d="m10 14 11-11"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
    "code": '<path d="m8 9-4 3 4 3"/><path d="m16 9 4 3-4 3"/><path d="m14 5-4 14"/>',
    "eye": '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    "save": '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
    "undo": '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v1"/>',
    "redo": '<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0-6 6v1"/>',
    "desktop": '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    "mobile": '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    "lock": '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/>',
    "card": '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    "key": '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m11.5 11.5 8-8"/><path d="m15 8 3 3"/><path d="m17 6 2 2"/>',
    "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    "upload": '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M20 16v4H4v-4"/>',
    "download": '<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M20 20H4"/>',
    "menu": '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    "close": '<path d="m6 6 12 12"/><path d="m18 6-12 12"/>',
    "help": '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4"/><path d="M12 18h.01"/>',
    "globe": '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',
    "link": '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    "database": '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v7c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12v7c0 1.7 4 3 9 3s9-1.3 9-3v-7"/>',
}


def icon(name: str, size: int = 18, cls: str = "") -> str:
    body = ICONS.get(name, ICONS["help"])
    return f'<svg class="icon {cls}" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{body}</svg>'


def badge(text: str, tone: str = "neutral") -> str:
    return f'<span class="badge badge-{tone}">{escape(text)}</span>'


def avatar(initials: str, tone: int = 0, size: str = "md") -> str:
    return f'<span class="avatar avatar-{tone % 5} avatar-{size}">{escape(initials)}</span>'


def button(label: str, kind: str = "primary", ico: str | None = None, small: bool = False) -> str:
    ic = icon(ico, 15) if ico else ""
    return f'<button class="btn btn-{kind}{" btn-sm" if small else ""}">{ic}<span>{escape(label)}</span></button>'


def sidebar(active: str = "dashboard", agency: bool = False) -> str:
    items = [
        ("dashboard", "home", "Dashboard"),
        ("leads", "leads", "Leady"),
        ("flows", "flow", "Procesy"),
        ("templates", "template", "Szablony"),
        ("analytics", "chart", "Analityka"),
        ("integrations", "plug", "Integracje"),
    ]
    if agency:
        items.insert(4, ("clients", "users", "Klienci"))
    rows = []
    for key, ico, label in items:
        rows.append(f'<div class="side-item {"active" if key == active else ""}">{icon(ico,18)}<span>{label}</span></div>')
    return f'''
    <aside class="app-sidebar">
      <div class="brand-lockup"><span class="brand-mark"><i></i><i></i><i></i></span><strong>Lorum</strong></div>
      <nav class="side-nav">{''.join(rows)}</nav>
      <div class="side-spacer"></div>
      <div class="side-nav side-bottom">
        <div class="side-item {"active" if active == "settings" else ""}">{icon('settings',18)}<span>Ustawienia</span></div>
        <div class="side-item">{icon('help',18)}<span>Pomoc</span></div>
      </div>
      <div class="side-profile">{avatar('KW',3,'sm')}<div><b>Karol</b><span>Owner</span></div>{icon('chevron',14)}</div>
    </aside>'''


def topbar(title: str, eyebrow: str = "Meble Nowak", actions: str = "", meta: str = "") -> str:
    return f'''
    <header class="app-topbar">
      <div class="topbar-title"><span class="eyebrow-ui">{escape(eyebrow)}</span><div class="title-row"><h1>{escape(title)}</h1>{meta}</div></div>
      <div class="topbar-actions">{actions}{button('', 'ghost-icon', 'bell', small=True)}{avatar('KW',3,'sm')}</div>
    </header>'''


def shell(content: str, active: str, title: str, eyebrow: str = "Meble Nowak", actions: str = "", meta: str = "", agency: bool = False, cls: str = "") -> str:
    return f'''
    <section class="shot desktop-shot {cls}" id="{active}-desktop">
      <div class="app-shell">
        {sidebar(active, agency)}
        <div class="app-stage">
          {topbar(title, eyebrow, actions, meta)}
          <main class="app-main">{content}</main>
        </div>
      </div>
    </section>'''


def mini_stat(label: str, value: str, delta: str, tone: str = "up", helper: str = "") -> str:
    return f'''
    <article class="metric-card">
      <div class="metric-label">{escape(label)}</div>
      <div class="metric-main"><strong>{escape(value)}</strong><span class="delta delta-{tone}">{escape(delta)}</span></div>
      <div class="metric-help">{escape(helper)}</div>
    </article>'''


def lead_row(initials: str, name: str, service: str, score: str, budget: str, deadline: str, status: str, tone: str, source: str, date: str, idx: int = 0) -> str:
    return f'''
      <tr>
        <td><div class="person-cell">{avatar(initials,idx,'sm')}<div><b>{escape(name)}</b><span>{escape(service)}</span></div></div></td>
        <td class="score-cell"><b>{escape(score)}</b><span>/100</span></td>
        <td>{escape(budget)}</td><td>{escape(deadline)}</td><td>{badge(status,tone)}</td><td>{escape(source)}</td><td class="muted">{escape(date)}</td><td>{button('', 'ghost-icon','dots',small=True)}</td>
      </tr>'''


def dashboard_screen() -> str:
    actions = f'<div class="select-compact">Ostatnie 30 dni {icon("chevron",13)}</div>{button("Podgląd procesu","secondary","eye",True)}{button("Nowy proces","primary","plus",True)}'
    attention = ''.join([
        '<div class="attention-item"><span class="attention-dot hot"></span><div><b>3 nowe leady wymagają reakcji</b><span>Najstarszy czeka 42 minuty</span></div><a>Otwórz leady →</a></div>',
        '<div class="attention-item"><span class="attention-dot warn"></span><div><b>Nieopublikowane zmiany</b><span>Proces „Kuchnie” ma nowszy draft</span></div><a>Sprawdź zmiany →</a></div>',
        '<div class="attention-item"><span class="attention-dot neutral"></span><div><b>Instalacja do dokończenia</b><span>Widget nie został jeszcze osadzony</span></div><a>Pokaż instrukcję →</a></div>',
    ])
    bars = ''.join(f'<i style="height:{h}%"></i>' for h in [33,43,37,55,62,47,68,73,54,79,84,67,75,91,81,96])
    rows = ''.join([
        lead_row('AK','Anna Kowalska','Kuchnia na wymiar','85','25 000–35 000 zł','do 3 mies.','Dobry','success','Google Ads','12 min temu',0),
        lead_row('PN','Piotr Nowak','Ogrodzenie panelowe','82','18 000–24 000 zł','do 2 mies.','Dobry','success','Organiczny','1 godz. temu',1),
        lead_row('KW','Katarzyna Wiśniewska','Strona internetowa','78','8 000–12 000 zł','do 1 mies.','Do weryfikacji','warning','Polecenie','3 godz. temu',2),
        lead_row('MZ','Michał Zieliński','Klimatyzacja','91','12 000–16 000 zł','do 1 mies.','Gorący','brand','Meta Ads','5 godz. temu',4),
    ])
    content = f'''
      <div class="demo-note">Dane demonstracyjne</div>
      <section class="attention-panel"><div class="section-caption">Wymaga uwagi</div><div class="attention-grid">{attention}</div></section>
      <section class="metric-grid five">
        {mini_stat('Rozpoczęcia','324','+18%','up','vs poprzedni okres')}
        {mini_stat('Ukończenia','127','+24%','up','39,2% rozpoczęć')}
        {mini_stat('Konwersja','12,4%','+2,6 pp','up','wizyty → lead')}
        {mini_stat('Śr. wartość wyceny','28 400 zł','+6,2%','up','wartość referencyjna')}
        {mini_stat('Czas do reakcji','32 min','−11%','up','mediana')}
      </section>
      <section class="dashboard-grid">
        <article class="panel chart-panel"><div class="panel-head"><div><h2>Leady w czasie</h2><p>Utworzone leady według dnia</p></div><div class="legend"><span class="dot brand"></span>Leady</div></div><div class="bar-chart">{bars}</div><div class="axis"><span>1 lip</span><span>8 lip</span><span>15 lip</span><span>22 lip</span><span>30 lip</span></div></article>
        <article class="panel quality-panel"><div class="panel-head"><div><h2>Jakość leadów</h2><p>Rozkład wyniku kwalifikacji</p></div></div><div class="donut-row"><div class="donut"><span><b>78%</b><small>dobre lub lepsze</small></span></div><div class="quality-list"><div><i class="q1"></i><span>Gorące</span><b>24</b></div><div><i class="q2"></i><span>Dobre</span><b>75</b></div><div><i class="q3"></i><span>Do weryfikacji</span><b>21</b></div><div><i class="q4"></i><span>Poza ofertą</span><b>7</b></div></div></div></article>
      </section>
      <section class="dashboard-bottom">
        <article class="panel leads-panel"><div class="panel-head"><div><h2>Najnowsze leady</h2><p>Ostatnie zgłoszenia ze wszystkich procesów</p></div><a>Zobacz wszystkie →</a></div><table class="data-table compact"><thead><tr><th>Klient</th><th>Wynik</th><th>Budżet</th><th>Termin</th><th>Status</th><th>Źródło</th><th>Data</th><th></th></tr></thead><tbody>{rows}</tbody></table></article>
        <article class="panel next-panel"><div class="panel-head"><div><h2>Następny krok</h2><p>Najważniejsze działania na dziś</p></div></div><div class="task-list"><div><span class="task-number">01</span><div><b>Oddzwoń do Anny Kowalskiej</b><span>Lead 85/100 · do 24 h</span></div>{icon('chevron',16)}</div><div><span class="task-number">02</span><div><b>Opublikuj zmiany w procesie</b><span>3 poprawki oczekują</span></div>{icon('chevron',16)}</div><div><span class="task-number">03</span><div><b>Dokończ instalację widgetu</b><span>meblenowak.pl</span></div>{icon('chevron',16)}</div></div></article>
      </section>'''
    return shell(content,'dashboard','Dashboard','Meble Nowak',actions)


def leads_screen() -> str:
    actions = f'{button("Eksport","secondary","download",True)}{button("Dodaj lead","primary","plus",True)}'
    rows = ''.join([
        lead_row('AK','Anna Kowalska','Kuchnia na wymiar','85','25 000–35 000 zł','do 3 mies.','Nowy','info','Google Ads','17.05, 09:41',0),
        lead_row('JN','Jan Nowak','Ogrodzenie panelowe','78','15 000–25 000 zł','do 2 mies.','W trakcie','warning','Organiczny','17.05, 09:21',1),
        lead_row('AB','Firma ABC Sp. z o.o.','Strona internetowa','92','8 000–12 000 zł','do 1 mies.','Zakwalifikowany','success','Polecenie','17.05, 08:55',2),
        lead_row('KW','Katarzyna Wiśniewska','Remont mieszkania','65','40 000–60 000 zł','do 4 mies.','W trakcie','warning','Meta Ads','17.05, 08:32',3),
        lead_row('PZ','Piotr Zieliński','Klimatyzacja','88','12 000–18 000 zł','do 2 mies.','Zakwalifikowany','success','Google Ads','17.05, 08:15',4),
        lead_row('MW','Michał Woźniak','Brama przesuwna','72','20 000–30 000 zł','do 3 mies.','Nowy','info','Bezpośredni','17.05, 07:45',0),
        lead_row('XYZ','Firma XYZ','Kuchnia na wymiar','90','30 000–40 000 zł','do 3 mies.','Zakwalifikowany','success','Google Ads','17.05, 07:21',1),
        lead_row('AK','Alicja Kaczmarek','Strona internetowa','60','5 000–8 000 zł','do 1 mies.','Nowy','info','Organiczny','17.05, 06:58',2),
    ])
    content = f'''
      <section class="leads-toolbar panel-flat">
        <div class="tab-row"><button class="tab active">Wszystkie <b>128</b></button><button class="tab">Nowe <b>24</b></button><button class="tab">W trakcie <b>38</b></button><button class="tab">Zakwalifikowane <b>42</b></button><button class="tab">Odrzucone <b>24</b></button></div>
        <div class="toolbar-right"><label class="search-box">{icon('search',16)}<input value="" placeholder="Szukaj po nazwie, e-mailu lub telefonie"/></label>{button('Filtry','secondary','filter',True)}</div>
      </section>
      <section class="active-filters"><span>Proces: Wszystkie {icon('close',12)}</span><span>Okres: 30 dni {icon('close',12)}</span><button>Wyczyść</button></section>
      <section class="panel table-shell">
        <div class="table-caption"><div><h2>Leady</h2><p>128 rekordów · posortowane od najnowszych</p></div><div class="view-controls">{button('Kolumny','ghost','settings',True)}<div class="select-compact">20 / stronę {icon('chevron',12)}</div></div></div>
        <table class="data-table leads-table"><thead><tr><th><input type="checkbox"/></th><th>Klient i usługa</th><th>Wynik</th><th>Budżet</th><th>Termin</th><th>Status</th><th>Źródło</th><th>Data</th><th></th></tr></thead><tbody>{rows.replace('<tr>','<tr><td><input type="checkbox"/></td>')}</tbody></table>
        <div class="pagination"><span>1–20 z 128</span><div>{button('', 'ghost-icon','back',True)}<button class="page active">1</button><button class="page">2</button><button class="page">3</button><span>…</span><button class="page">7</button>{button('', 'ghost-icon','chevron',True)}</div></div>
      </section>'''
    return shell(content,'leads','Leady','Meble Nowak',actions)


def detail_rows() -> str:
    rows = [
        ('Usługa','Kuchnia na wymiar','template'),
        ('Zakres','Kuchnia w kształcie L, około 8 mb zabudowy','flow'),
        ('Fronty','Lakierowane, matowe','template'),
        ('Budżet','25 000–35 000 zł','card'),
        ('Termin','Do 3 miesięcy','calendar'),
        ('Lokalizacja','Ciechanów','location'),
        ('Kontakt','Telefoniczny, najlepiej 9:00–12:00','phone'),
    ]
    return ''.join(f'<div class="summary-row">{icon(ico,16)}<span>{escape(label)}</span><b>{escape(value)}</b></div>' for label,value,ico in rows)


def lead_detail_screen() -> str:
    actions = f'{button("Wyślij e-mail","secondary","mail",True)}{button("Zadzwoń","secondary","phone",True)}{button("Rozpocznij obsługę","primary","check",True)}'
    meta = badge('Nowy','info')
    content = f'''
      <section class="lead-hero panel-flat">
        <div class="lead-identity">{avatar('AK',0,'lg')}<div><a class="back-link">{icon('back',14)} Powrót do leadów</a><h2>Anna Kowalska</h2><p>Kuchnia na wymiar · ID: L-2024-0517 · 17.05.2024, 09:41</p></div></div>
        <div class="lead-score"><strong>85<span>/100</span></strong><b>Dobre dopasowanie</b><small>Budżet, termin i lokalizacja zgodne z profilem</small></div>
      </section>
      <section class="lead-tabs"><button class="active">Podsumowanie</button><button>Odpowiedzi</button><button>Pliki <span>3</span></button><button>Historia</button><button>Zgody</button></section>
      <section class="lead-layout">
        <div class="lead-main-col">
          <article class="panel summary-panel"><div class="panel-head"><div><h2>Podsumowanie zapytania</h2><p>Dane źródłowe z procesu „Kuchnie na wymiar”</p></div>{badge('Wersja 4','neutral')}</div>{detail_rows()}</article>
          <article class="panel files-panel"><div class="panel-head"><div><h2>Materiały</h2><p>3 pliki dodane przez klienta</p></div><a>Pobierz wszystkie →</a></div><div class="file-thumbs"><div class="room-thumb room-a"><span>kuchnia_01.jpg</span></div><div class="room-thumb room-b"><span>kuchnia_02.jpg</span></div><div class="file-doc">{icon('file',24)}<b>rzut_pomieszczenia.pdf</b><span>1,8 MB</span></div></div></article>
          <article class="panel timeline-panel"><div class="panel-head"><div><h2>Historia</h2><p>Zmiany statusu i aktywność zespołu</p></div></div><div class="timeline"><div><i></i><b>Lead utworzony</b><span>17.05.2024, 09:41</span><p>Źródło: Google Ads · urządzenie: mobile</p></div><div><i></i><b>Powiadomienie wysłane</b><span>17.05.2024, 09:42</span><p>E-mail do biuro@meblenowak.pl</p></div></div></article>
        </div>
        <aside class="lead-side-col">
          <article class="panel contact-panel"><h3>Kontakt</h3><div class="contact-line">{icon('mail',16)}<div><span>E-mail</span><b>anna.kowalska@email.pl</b></div></div><div class="contact-line">{icon('phone',16)}<div><span>Telefon</span><b>+48 600 123 456</b></div></div><div class="contact-actions">{button('Napisz','secondary','mail',True)}{button('Zadzwoń','primary','phone',True)}</div></article>
          <article class="panel side-form"><h3>Obsługa leada</h3><label>Status<div class="select-input">Nowy {icon('chevron',14)}</div></label><label>Opiekun<div class="select-input"><span class="person-inline">{avatar('KW',3,'xs')} Karol Wyszczelski</span>{icon('chevron',14)}</div></label><label>Następny krok<div class="input-like">Kontakt telefoniczny do 24 h</div></label><label>Notatka<textarea placeholder="Dodaj krótką notatkę…"></textarea></label>{button('Zapisz zmiany','primary','save',False)}</article>
          <article class="panel technical-panel"><h3>Dane techniczne</h3><div><span>Źródło</span><b>Google Ads</b></div><div><span>Kampania</span><b>Kuchnie / Search</b></div><div><span>UTM</span><b>cpc · kitchen_quote</b></div><div><span>Zgoda kontaktowa</span><b>Tak · v2</b></div></article>
        </aside>
      </section>'''
    return shell(content,'lead-detail','Szczegóły leada','Leady',actions,meta)


def builder_screen() -> str:
    actions = f'<div class="save-state">{icon("check",14)} Zapisano 14:32</div>{button("","ghost-icon","undo",True)}{button("","ghost-icon","redo",True)}<div class="device-toggle"><button class="active">{icon("desktop",15)}</button><button>{icon("mobile",15)}</button></div>{button("Testuj","secondary","eye",True)}{button("Opublikuj","primary","external",True)}'
    step_items = [
        ('start','Ekran startowy','Gotowy'),('service','Rodzaj usługi','Gotowy'),('layout','Układ kuchni','Gotowy'),('measure','Wymiary','2 pola'),('budget','Budżet','3 odpowiedzi'),('deadline','Termin realizacji','4 odpowiedzi'),('location','Lokalizacja','Warunek'),('files','Zdjęcia i dokumenty','Opcjonalny'),('contact','Dane kontaktowe','Wymagany'),('result','Wynik','2 warianty')
    ]
    steps = ''
    for i,(key,label,meta) in enumerate(step_items,1):
        cls='active' if key=='budget' else ''
        warning='<span class="step-warning">!</span>' if key=='location' else ''
        steps += f'<div class="builder-step {cls}"><span class="drag">⋮⋮</span><span class="step-index">{i:02d}</span><div><b>{label}</b><small>{meta}</small></div>{warning}{icon("dots",14)}</div>'
    answers=''.join([f'<div class="preview-choice {"selected" if i==1 else ""}"><span>{text}</span>{icon("check",16) if i==1 else ""}</div>' for i,text in enumerate(['Do 20 000 zł','25 000–35 000 zł','35 000–50 000 zł','Powyżej 50 000 zł'])])
    content = f'''
      <section class="builder-layout">
        <aside class="builder-steps panel-flat"><div class="builder-side-head"><div><span class="eyebrow-ui">Proces</span><h2>Kuchnie na wymiar</h2></div>{button('','ghost-icon','dots',True)}</div><div class="builder-tabs"><button class="active">Kroki</button><button>Wyniki</button></div><div class="steps-list">{steps}</div><div class="step-add">{button('Dodaj krok','secondary','plus',True)}<button class="text-action">Dodaj grupę</button></div><div class="validation-note">{icon('alert',16)}<div><b>1 ostrzeżenie</b><span>Sprawdź ścieżkę lokalizacji</span></div></div></aside>
        <main class="builder-canvas">
          <div class="canvas-toolbar"><div class="breadcrumbs"><span>Proces</span>{icon('chevron',12)}<b>Budżet</b></div><div><button class="text-action">Poprzedni krok</button><button class="text-action">Następny krok</button></div></div>
          <div class="preview-frame">
            <div class="preview-brand"><span class="mini-logo"><i></i><i></i><i></i></span><b>Meble Nowak</b><span>5 z 9</span></div>
            <div class="preview-progress"><i style="width:55%"></i></div>
            <div class="preview-content"><span class="preview-kicker">Budżet</span><h3>Jaki budżet planujesz przeznaczyć na realizację?</h3><p>Wybierz orientacyjny przedział. Ostateczna wycena zależy od zakresu i materiałów.</p><div class="preview-choices">{answers}</div><div class="preview-footer"><button class="preview-back">Wstecz</button><button class="preview-next">Dalej {icon('chevron',15)}</button></div></div>
          </div>
          <div class="canvas-help"><span>{icon('eye',15)} Podgląd zachowania kroku</span><span>{icon('desktop',15)} 640 px</span><span>{icon('check',15)} Walidacja poprawna</span></div>
        </main>
        <aside class="builder-inspector panel-flat"><div class="inspector-tabs"><button class="active">Treść</button><button>Odpowiedzi</button><button>Logika</button><button>Wycena</button><button>Scoring</button></div><div class="inspector-body"><div class="inspector-section"><h3>Treść pytania</h3><label>Etykieta<textarea>Jaki budżet planujesz przeznaczyć na realizację?</textarea></label><label>Opis pomocniczy<textarea>Wybierz orientacyjny przedział. Ostateczna wycena zależy od zakresu i materiałów.</textarea></label></div><div class="inspector-section"><h3>Zachowanie</h3><label class="switch-row"><span><b>Wymagane</b><small>Użytkownik musi wybrać odpowiedź</small></span><i class="switch on"><em></em></i></label><label class="switch-row"><span><b>Losowa kolejność</b><small>Zmieniaj kolejność odpowiedzi</small></span><i class="switch"><em></em></i></label></div><div class="inspector-section"><h3>Widoczność</h3><div class="inline-alert success">{icon('check',15)} Krok jest dostępny w 2 ścieżkach.</div><button class="text-action green">Zobacz zależności →</button></div></div></aside>
      </section>'''
    return shell(content,'flows','Edytor procesu','Kuchnie na wymiar',actions,badge('Draft','warning'),cls='builder-shot')


def rules_screen() -> str:
    actions = f'{button("Testuj reguły","secondary","eye",True)}{button("Zapisz zmiany","primary","save",True)}'
    content = f'''
      <section class="rules-header panel-flat"><div><span class="eyebrow-ui">Proces: Kuchnie na wymiar</span><h2>Reguły i wynik</h2><p>Logika, wycena i scoring są obliczane po stronie serwera.</p></div><div class="rules-tabs"><button class="active">Logika</button><button>Wycena</button><button>Scoring</button><button>Warianty wyniku</button></div></section>
      <section class="rules-layout">
        <div class="rules-main">
          <article class="panel rule-card"><div class="rule-head"><div><span class="rule-index">01</span><div><h3>Klient spoza obszaru działania</h3><p>Wyklucza realizacje poza promieniem 100 km.</p></div></div>{badge('Aktywna','success')}</div><div class="rule-builder"><div class="rule-line"><span class="rule-keyword">IF</span><div class="select-input">Lokalizacja</div><div class="select-input">poza obszarem</div><div class="input-like">100 km od Ciechanowa</div></div><div class="rule-line"><span class="rule-keyword then">THEN</span><div class="select-input">Oznacz jako</div><div class="select-input wide">Poza ofertą</div><button class="icon-only">{icon('plus',15)}</button></div></div><div class="rule-foot"><span>{icon('check',14)} Brak pętli i martwych ścieżek</span><div><button class="text-action">Duplikuj</button><button class="text-action danger">Usuń</button></div></div></article>
          <article class="panel rule-card"><div class="rule-head"><div><span class="rule-index">02</span><div><h3>Budżet premium</h3><p>Dodaje tag i punkty przy budżecie powyżej 35 000 zł.</p></div></div>{badge('Aktywna','success')}</div><div class="rule-builder"><div class="rule-line"><span class="rule-keyword">IF</span><div class="select-input">Budżet</div><div class="select-input">większy niż</div><div class="input-like">35 000 zł</div></div><div class="rule-line"><span class="rule-keyword then">THEN</span><div class="select-input">Dodaj tag</div><div class="select-input wide">Budżet premium</div><button class="icon-only">{icon('plus',15)}</button></div><div class="rule-line sub"><span></span><div class="select-input">Dodaj punkty</div><div class="input-like wide">+15</div></div></div></article>
          <button class="add-rule">{icon('plus',17)} Dodaj regułę</button>
        </div>
        <aside class="rules-side">
          <article class="panel calculation-card"><div class="panel-head"><div><h3>Podgląd wyceny</h3><p>Dla aktualnego leada testowego</p></div>{badge('v4','neutral')}</div><div class="calc-total"><span>Orientacyjny przedział</span><strong>25 000–35 000 zł</strong><small>Wynik niewiążący · zaokrąglenie do 500 zł</small></div><div class="calc-breakdown"><div><span>Cena bazowa</span><b>18 000–22 000 zł</b></div><div><span>Układ L · 8 mb</span><b>+6 400–8 800 zł</b></div><div><span>Fronty lakierowane</span><b>+10%</b></div><div><span>Minimalna kwota</span><b>25 000 zł</b></div></div><button class="text-action green">Pokaż pełne wyjaśnienie →</button></article>
          <article class="panel score-card"><div class="panel-head"><div><h3>Scoring testowego leada</h3><p>Reguły deterministyczne</p></div></div><div class="score-big"><strong>85<span>/100</span></strong>{badge('Dobry','success')}</div><div class="score-reasons"><div>{icon('check',14)}<span>Budżet w oczekiwanym przedziale</span><b>+30</b></div><div>{icon('check',14)}<span>Termin do 3 miesięcy</span><b>+20</b></div><div>{icon('check',14)}<span>Lokalizacja w obszarze</span><b>+20</b></div><div>{icon('check',14)}<span>Dodane materiały</span><b>+15</b></div></div></article>
          <article class="panel result-card"><div class="panel-head"><div><h3>Wariant wyniku</h3><p>Pokazywany po wysłaniu danych</p></div>{badge('Dobry lead','success')}</div><div class="result-preview"><span>Orientacyjna wycena</span><b>25 000–35 000 zł</b><p>Skontaktujemy się w ciągu 24 godzin, aby potwierdzić zakres.</p>{button('Umów kontakt','primary',None,True)}</div></article>
        </aside>
      </section>'''
    return shell(content,'flows','Reguły procesu','Kuchnie na wymiar',actions,badge('Draft','warning'))


def analytics_screen() -> str:
    actions = f'<div class="select-compact">Kuchnie na wymiar {icon("chevron",13)}</div><div class="select-compact">Ostatnie 30 dni {icon("chevron",13)}</div>{button("Eksport raportu","secondary","download",True)}'
    funnel = [
        ('Wyświetlenie widgetu','1 846','100%',100),('Rozpoczęcie','1 124','60,9%',61),('Zakres','936','83,3%',51),('Budżet','802','85,7%',43),('Termin','721','89,9%',39),('Kontakt','312','43,3%',17),('Lead wysłany','229','73,4%',12)
    ]
    funnel_html=''.join(f'<div class="funnel-row"><div><b>{label}</b><span>{count}</span></div><div class="funnel-bar"><i style="width:{w}%"></i></div><strong>{rate}</strong></div>' for label,count,rate,w in funnel)
    sources=[('Google Ads','72','14,8%','34 800 zł'),('Organiczny','61','12,2%','29 400 zł'),('Meta Ads','43','9,6%','24 100 zł'),('Polecenie','31','18,4%','38 700 zł'),('Bezpośredni','22','11,1%','26 900 zł')]
    source_html=''.join(f'<tr><td><b>{s}</b></td><td>{l}</td><td>{c}</td><td>{v}</td></tr>' for s,l,c,v in sources)
    trend=''.join(f'<i style="height:{h}%"></i>' for h in [20,27,25,33,36,42,39,48,56,51,61,58,70,66,78,72,84,88,82,94])
    content=f'''
      <section class="metric-grid four">{mini_stat('Wyświetlenia widgetu','1 846','+14%','up','wszystkie urządzenia')}{mini_stat('Rozpoczęcia','1 124','+18%','up','60,9% wyświetleń')}{mini_stat('Leady','229','+24%','up','12,4% konwersji')}{mini_stat('Śr. czas ukończenia','3 min 12 s','−18 s','up','mediana')}</section>
      <section class="analytics-top">
        <article class="panel funnel-panel"><div class="panel-head"><div><h2>Lejek procesu</h2><p>Przejścia i rezygnacje pomiędzy krokami</p></div><div class="select-compact">Wersja 4 {icon('chevron',12)}</div></div><div class="funnel">{funnel_html}</div><div class="inline-alert warning">{icon('alert',15)} Największy spadek występuje przed danymi kontaktowymi: 56,7%.</div></article>
        <article class="panel trend-panel"><div class="panel-head"><div><h2>Trend leadów</h2><p>Dzienna liczba ukończeń</p></div><div class="legend"><span class="dot brand"></span>Leady</div></div><div class="trend-chart">{trend}</div><div class="axis"><span>1 lip</span><span>8 lip</span><span>15 lip</span><span>22 lip</span><span>30 lip</span></div></article>
      </section>
      <section class="analytics-bottom">
        <article class="panel source-panel"><div class="panel-head"><div><h2>Źródła i jakość</h2><p>Konwersja oraz średnia wartość według źródła</p></div><a>Zobacz kampanie →</a></div><table class="data-table"><thead><tr><th>Źródło</th><th>Leady</th><th>Konwersja</th><th>Śr. wycena</th></tr></thead><tbody>{source_html}</tbody></table></article>
        <article class="panel device-panel"><div class="panel-head"><div><h2>Urządzenia</h2><p>Ukończenia i konwersja</p></div></div><div class="device-list"><div>{icon('mobile',18)}<span><b>Mobile</b><small>69% ruchu</small></span><strong>11,8%</strong></div><div>{icon('desktop',18)}<span><b>Desktop</b><small>28% ruchu</small></span><strong>14,1%</strong></div><div>{icon('desktop',18)}<span><b>Tablet</b><small>3% ruchu</small></span><strong>9,4%</strong></div></div></article>
        <article class="panel no-data-panel"><div class="panel-head"><div><h2>Porównanie wersji</h2><p>Potrzebujesz minimum 100 sesji na wersję</p></div></div><div class="empty-compact">{icon('chart',26)}<b>Za mało danych</b><span>Wersja 5 ma obecnie 34 sesje. Zbieraj dane dalej.</span>{button('Sprawdź wersje','secondary',None,True)}</div></article>
      </section>'''
    return shell(content,'analytics','Analityka','Meble Nowak',actions)


def templates_screen() -> str:
    actions = f'{button("Importuj","secondary","upload",True)}{button("Nowy proces","primary","plus",True)}'
    cards=[]
    data=[
        ('Meble na wymiar','32 pytania · 11 reguł · scoring','Najpełniejszy szablon dla kuchni, szaf i garderób.','meble', 'Najczęściej wybierany'),
        ('Ogrodzenia i bramy','24 pytania · 8 reguł · wycena za mb','Panele, bramy przesuwne, furtki i automatyka.','ogrodzenia','Gotowy'),
        ('Strony internetowe','19 pytań · 9 reguł · 4 wyniki','Strony firmowe, sklepy i aplikacje webowe.','strony','Gotowy'),
        ('Klimatyzacja','17 pytań · 6 reguł · lokalizacja','Dobór liczby jednostek i wstępny zakres montażu.','klima','Gotowy'),
        ('Remonty i wykończenia','28 pytań · 10 reguł · pliki','Metraż, standard, zakres pomieszczeń i termin.','remont','Beta'),
    ]
    for i,(name,meta,desc,cls,state) in enumerate(data):
        cards.append(f'<article class="template-card"><div class="template-cover cover-{cls}"><span>{badge(state,"success" if state!="Beta" else "warning")}</span><b>{name}</b></div><div class="template-body"><p>{desc}</p><div class="template-meta"><span>{icon("flow",14)} {meta}</span><span>{icon("eye",14)} Demo</span></div><div class="template-actions">{button("Zobacz proces","secondary","eye",True)}{button("Użyj szablonu","primary","copy",True)}</div></div></article>')
    content=f'''
      <section class="template-intro panel-flat"><div><span class="eyebrow-ui">Biblioteka procesów</span><h2>Zacznij od sprawdzonej struktury, nie od pustego ekranu.</h2><p>Każdy szablon zawiera pytania, logikę, reguły wyceny, scoring, wynik i treści powiadomień. Po skopiowaniu staje się niezależnym draftem Twojej firmy.</p></div><div class="template-filter"><label class="search-box">{icon('search',16)}<input placeholder="Szukaj szablonu"/></label><div class="select-compact">Wszystkie branże {icon('chevron',13)}</div></div></section>
      <section class="template-grid">{''.join(cards)}</section>
      <section class="panel custom-template"><div><span class="eyebrow-ui">Konfiguracja done-for-you</span><h2>Potrzebujesz procesu dopasowanego do własnej sprzedaży?</h2><p>Przygotujemy strukturę pytań, logikę, orientacyjną wycenę i instalację na stronie.</p></div>{button('Zamów konfigurację','primary','external',False)}</section>'''
    return shell(content,'templates','Szablony branżowe','Meble Nowak',actions)


def installation_screen() -> str:
    actions = f'{button("Otwórz test","secondary","external",True)}{button("Opublikuj zmiany","primary","check",True)}'
    content=f'''
      <section class="install-status panel-flat"><div><span class="status-led online"></span><div><span class="eyebrow-ui">Proces opublikowany</span><h2>Kuchnie na wymiar</h2><p>Wersja 4 · aktualizacja 17.05.2024, 14:32</p></div></div><div class="domain-pill">{icon('globe',15)} wycena.meblenowak.pl/kuchnie</div></section>
      <section class="install-layout">
        <div class="install-main">
          <article class="panel embed-modes"><div class="panel-head"><div><h2>Sposób osadzenia</h2><p>Wybierz sposób uruchamiania procesu na stronie</p></div></div><div class="mode-grid"><button class="mode-card active">{icon('code',22)}<b>Inline</b><span>Proces w treści strony</span><i>{icon('check',14)}</i></button><button class="mode-card">{icon('external',22)}<b>Popup</b><span>Otwierany z przycisku</span></button><button class="mode-card">{icon('desktop',22)}<b>Fullscreen</b><span>Pełny ekran procesu</span></button><button class="mode-card">{icon('link',22)}<b>Hosted link</b><span>Publiczny adres</span></button></div></article>
          <article class="panel code-panel"><div class="panel-head"><div><h2>Kod instalacyjny</h2><p>Wklej przed zamknięciem znacznika &lt;/body&gt;</p></div>{button('Kopiuj','secondary','copy',True)}</div><pre><code>&lt;script src="https://cdn.lorum.pl/widget/v1.js" async&gt;&lt;/script&gt;
&lt;div data-lorum-flow="flw_kuchnie_8d2" data-mode="inline"&gt;&lt;/div&gt;</code></pre><div class="inline-alert success">{icon('shield',15)} Widget jest izolowany od CSS strony i ładowany dopiero w pobliżu viewportu.</div></article>
          <article class="panel trigger-panel"><div class="panel-head"><div><h2>Uruchamianie z przycisku</h2><p>Dla trybu popup lub fullscreen</p></div>{button('Kopiuj atrybut','secondary','copy',True)}</div><pre><code>&lt;button data-lorum-open="flw_kuchnie_8d2"&gt;Darmowa wycena&lt;/button&gt;</code></pre></article>
        </div>
        <aside class="install-side">
          <article class="panel wordpress-card"><div class="wordpress-head"><div class="wp-mark">W</div><div><h3>WordPress</h3><p>Wtyczka konektorowa</p></div>{badge('Połączono','success')}</div><div class="wp-status"><div><span>Witryna</span><b>meblenowak.pl</b></div><div><span>Wersja wtyczki</span><b>1.2.0</b></div><div><span>Ostatnia synchronizacja</span><b>2 min temu</b></div></div>{button('Otwórz instrukcję','secondary','external',False)}<button class="text-action danger">Odłącz witrynę</button></article>
          <article class="panel diagnostics-card"><div class="panel-head"><div><h3>Diagnostyka</h3><p>Stan instalacji</p></div></div><div class="diag-item ok">{icon('check',15)}<span>Skrypt załadowany</span><b>OK</b></div><div class="diag-item ok">{icon('check',15)}<span>Domena dozwolona</span><b>OK</b></div><div class="diag-item ok">{icon('check',15)}<span>Ostatni event</span><b>3 min</b></div><div class="diag-item warn">{icon('alert',15)}<span>Consent Mode</span><b>Sprawdź</b></div>{button('Uruchom test','secondary','eye',False)}</article>
          <article class="panel webhook-mini"><div class="panel-head"><div><h3>Hosted link</h3><p>Gotowy do udostępnienia</p></div></div><div class="copy-field"><span>lorum.link/meblenowak/kuchnie</span>{icon('copy',15)}</div></article>
        </aside>
      </section>'''
    return shell(content,'integrations','Instalacja procesu','Kuchnie na wymiar',actions,badge('Opublikowany','success'))


def integrations_screen() -> str:
    actions = f'{button("Dodaj webhook","secondary","plus",True)}{button("Połącz integrację","primary","plug",True)}'
    connections=[
        ('Pipedrive','CRM','Połączono','success','Leady i statusy synchronizowane'),
        ('Google Sheets','Arkusz','Połączono','success','Nowe leady dopisywane automatycznie'),
        ('Resend','E-mail','Aktywna','success','Powiadomienia transakcyjne'),
        ('Slack','Powiadomienia','Niepołączono','neutral','Alert o nowych gorących leadach'),
    ]
    conns=''.join(f'<div class="integration-row"><span class="integration-logo">{name[0]}</span><div><b>{name}</b><span>{category} · {desc}</span></div>{badge(status,tone)}{button("Ustawienia" if tone=="success" else "Połącz","secondary",None,True)}</div>' for name,category,status,tone,desc in connections)
    deliveries=''.join([
        '<tr><td><b>lead.created</b></td><td>Pipedrive</td><td>'+badge('Dostarczono','success')+'</td><td>17.05, 09:42</td><td>246 ms</td><td>'+button('','ghost-icon','dots',True)+'</td></tr>',
        '<tr><td><b>lead.updated</b></td><td>Google Sheets</td><td>'+badge('Dostarczono','success')+'</td><td>17.05, 09:51</td><td>384 ms</td><td>'+button('','ghost-icon','dots',True)+'</td></tr>',
        '<tr><td><b>lead.created</b></td><td>CRM webhook</td><td>'+badge('Błąd','error')+'</td><td>17.05, 10:14</td><td>5 prób</td><td>'+button('Ponów','secondary',None,True)+'</td></tr>',
    ])
    content=f'''
      <section class="integrations-layout">
        <article class="panel connections"><div class="panel-head"><div><h2>Połączenia</h2><p>Przekazuj leady i zdarzenia do używanych narzędzi</p></div></div>{conns}</article>
        <article class="panel webhook-settings"><div class="panel-head"><div><h2>Webhook produkcyjny</h2><p>Podpis HMAC i automatyczne ponawianie</p></div>{badge('Aktywny','success')}</div><label>Adres endpointu<div class="input-like">https://crm.meblenowak.pl/api/lorum</div></label><label>Zdarzenia<div class="chips"><span>lead.created</span><span>lead.updated</span><span>flow.completed</span></div></label><div class="secret-row"><div><span>Sekret podpisu</span><b>••••••••••••4H2K</b></div>{button('Rotuj sekret','secondary','key',True)}</div><div class="inline-alert neutral">{icon('shield',15)} Każde żądanie zawiera timestamp, identyfikator dostawy i podpis.</div></article>
      </section>
      <section class="panel deliveries"><div class="panel-head"><div><h2>Dostawy webhooków</h2><p>Ostatnie próby i możliwość ręcznego ponowienia</p></div><div class="select-compact">Wszystkie statusy {icon('chevron',12)}</div></div><table class="data-table"><thead><tr><th>Zdarzenie</th><th>Cel</th><th>Status</th><th>Data</th><th>Czas / próby</th><th></th></tr></thead><tbody>{deliveries}</tbody></table></section>'''
    return shell(content,'integrations','Integracje','Meble Nowak',actions)


def agency_screen() -> str:
    actions = f'{button("Importuj klienta","secondary","upload",True)}{button("Dodaj klienta","primary","plus",True)}'
    rows=''.join([
        '<tr><td><div class="person-cell"><span class="company-avatar">MN</span><div><b>Meble Nowak</b><span>meblenowak.pl</span></div></div></td><td>3</td><td>127 / 500</td><td>'+badge('Aktywny','success')+'</td><td>349 zł</td><td>17.05.2024</td><td>'+button('Otwórz','secondary','external',True)+'</td></tr>',
        '<tr><td><div class="person-cell"><span class="company-avatar">NG</span><div><b>NAGET</b><span>naget.pl</span></div></div></td><td>2</td><td>86 / 500</td><td>'+badge('Aktywny','success')+'</td><td>349 zł</td><td>16.05.2024</td><td>'+button('Otwórz','secondary','external',True)+'</td></tr>',
        '<tr><td><div class="person-cell"><span class="company-avatar">FT</span><div><b>Fortez</b><span>fortez-przyczepy.pl</span></div></div></td><td>1</td><td>28 / 200</td><td>'+badge('Wdrożenie','warning')+'</td><td>149 zł</td><td>14.05.2024</td><td>'+button('Otwórz','secondary','external',True)+'</td></tr>',
        '<tr><td><div class="person-cell"><span class="company-avatar">CS</span><div><b>Custom Studio</b><span>custostudio.pl</span></div></div></td><td>4</td><td>214 / 1000</td><td>'+badge('Aktywny','success')+'</td><td>749 zł</td><td>12.05.2024</td><td>'+button('Otwórz','secondary','external',True)+'</td></tr>',
    ])
    content=f'''
      <section class="metric-grid four">{mini_stat('Klienci','4','+1','up','aktywni w tym miesiącu')}{mini_stat('Procesy','10','+3','up','8 opublikowanych')}{mini_stat('Zużycie','455 / 2 200','20,7%','neutral','leadów w pakietach')}{mini_stat('Marża miesięczna','1 196 zł','+18%','up','wartość demonstracyjna')}</section>
      <section class="agency-layout">
        <article class="panel clients-panel"><div class="panel-head"><div><h2>Klienci agencji</h2><p>Kontroluj procesy, zużycie i stan wdrożenia</p></div><label class="search-box small">{icon('search',15)}<input placeholder="Szukaj klienta"/></label></div><table class="data-table"><thead><tr><th>Klient</th><th>Procesy</th><th>Leady / limit</th><th>Status</th><th>Plan</th><th>Aktywność</th><th></th></tr></thead><tbody>{rows}</tbody></table></article>
        <aside class="agency-side"><article class="panel clone-card"><div class="panel-head"><div><h3>Szybkie wdrożenie</h3><p>Sklonuj proces do nowego klienta</p></div></div><label>Proces źródłowy<div class="select-input">Kuchnie na wymiar {icon('chevron',13)}</div></label><label>Nowy klient<div class="select-input">Wybierz organizację {icon('chevron',13)}</div></label><label class="switch-row"><span><b>Kopiuj branding</b><small>Kolory, logo i treści e-mail</small></span><i class="switch"><em></em></i></label>{button('Utwórz draft','primary','copy',False)}</article><article class="panel white-label-card"><div class="panel-head"><div><h3>White-label</h3><p>Domena i identyfikacja agencji</p></div>{badge('Agency','brand')}</div><div class="domain-row">{icon('globe',15)}<span>formularze.customstudio.pl</span>{badge('Zweryfikowana','success')}</div><div class="domain-row">{icon('mail',15)}<span>powiadomienia@customstudio.pl</span>{badge('Aktywna','success')}</div>{button('Zarządzaj marką','secondary','edit',False)}</article></aside>
      </section>'''
    return shell(content,'clients','Klienci agencji','Custom Studio',actions,agency=True)


def settings_screen() -> str:
    actions = f'{button("Zapisz zmiany","primary","save",True)}'
    nav_items=[('organization','Organizacja','settings'),('branding','Branding widgetu','edit'),('domains','Domeny','globe'),('notifications','Powiadomienia','bell'),('team','Zespół i role','users'),('privacy','Dane i prywatność','shield'),('api','API i klucze','key'),('billing','Plan i rozliczenia','card')]
    nav=''.join(f'<button class="settings-nav-item {"active" if i==0 else ""}">{icon(ico,16)}<span>{label}</span></button>' for i,(key,label,ico) in enumerate(nav_items))
    content=f'''
      <section class="settings-layout">
        <aside class="settings-nav panel-flat"><div class="settings-nav-title">Ustawienia</div>{nav}</aside>
        <div class="settings-content">
          <article class="panel settings-section"><div class="settings-head"><div><h2>Dane organizacji</h2><p>Informacje widoczne w panelu, widgetach i wiadomościach transakcyjnych.</p></div>{badge('Owner','neutral')}</div><div class="form-grid two"><label>Nazwa firmy<input value="Meble Nowak"/></label><label>NIP<input value="566 123 45 67"/></label><label>Adres strony<input value="https://meblenowak.pl"/></label><label>Strefa czasowa<div class="select-input">Europe/Warsaw {icon('chevron',13)}</div></label></div><label>Adres firmy<input value="ul. Przykładowa 12, 06-400 Ciechanów"/></label></article>
          <article class="panel settings-section"><div class="settings-head"><div><h2>Obszar działania</h2><p>Wykorzystywany w regułach kwalifikacji lokalizacji.</p></div></div><div class="area-grid"><div class="map-placeholder"><span class="map-center">Ciechanów</span><i class="radius-ring"></i><small>Promień 100 km</small></div><div><label>Punkt bazowy<input value="Ciechanów"/></label><label>Domyślny promień<div class="number-input"><input value="100"/><span>km</span></div></label><label class="switch-row boxed"><span><b>Przyjmuj leady spoza obszaru</b><small>Oznacz je jako „do weryfikacji” zamiast odrzucać</small></span><i class="switch on"><em></em></i></label></div></div></article>
          <article class="panel settings-section danger-zone"><div><h2>Strefa krytyczna</h2><p>Eksport i usunięcie danych organizacji wymagają ponownego potwierdzenia.</p></div><div>{button('Eksport danych','secondary','download',True)}{button('Usuń organizację','danger',None,True)}</div></article>
        </div>
      </section>'''
    return shell(content,'settings','Ustawienia organizacji','Meble Nowak',actions)


def onboarding_screen() -> str:
    # standalone, no app shell
    checklist=''.join([
        '<div class="checklist-item done">'+icon('check',14)+'<span>Utworzono organizację</span></div>',
        '<div class="checklist-item done">'+icon('check',14)+'<span>Wybrano branżę</span></div>',
        '<div class="checklist-item current"><span>3</span><b>Wybierz pierwszy proces</b></div>',
        '<div class="checklist-item"><span>4</span><span>Dostosuj branding</span></div>',
        '<div class="checklist-item"><span>5</span><span>Przetestuj i opublikuj</span></div>',
        '<div class="checklist-item"><span>6</span><span>Zainstaluj widget</span></div>',
    ])
    cards=''.join([
        '<button class="onboard-template active"><span class="template-mini meble"></span><div><b>Meble na wymiar</b><small>32 pytania · wycena · scoring</small></div>'+icon('check',16)+'</button>',
        '<button class="onboard-template"><span class="template-mini ogrodzenia"></span><div><b>Ogrodzenia i bramy</b><small>24 pytania · cena za mb</small></div></button>',
        '<button class="onboard-template"><span class="template-mini strony"></span><div><b>Strony internetowe</b><small>19 pytań · 4 wyniki</small></div></button>',
    ])
    return f'''
    <section class="shot desktop-shot onboarding-shot" id="onboarding-desktop">
      <div class="onboarding-shell">
        <aside class="onboarding-side"><div class="brand-lockup light"><span class="brand-mark"><i></i><i></i><i></i></span><strong>Lorum</strong></div><div class="onboarding-copy"><span class="eyebrow-ui light-text">Konfiguracja konta</span><h1>Uruchom pierwszy proces bez budowania wszystkiego od zera.</h1><p>Postęp zapisujemy automatycznie. Każdy krok możesz później zmienić w panelu.</p></div><div class="onboarding-checklist">{checklist}</div><div class="onboarding-help">{icon('help',17)}<div><b>Potrzebujesz pomocy?</b><span>Zamów konfigurację procesu.</span></div></div></aside>
        <main class="onboarding-main"><div class="onboarding-top"><span>Krok 3 z 6</span><button>Pomiń na razie</button></div><div class="onboarding-form"><span class="eyebrow-ui">Pierwszy proces</span><h2>Wybierz punkt startowy</h2><p>Szablon skopiujemy jako niezależny draft. Pytania, reguły i treści możesz dowolnie edytować.</p><div class="onboard-options"><label class="radio-tile active"><input type="radio" checked/><div><b>Użyj szablonu branżowego</b><span>Najszybszy sposób na działający proces</span></div></label><label class="radio-tile"><input type="radio"/><div><b>Zacznij od pustego procesu</b><span>Dla niestandardowej konfiguracji</span></div></label><label class="radio-tile"><input type="radio"/><div><b>Zamów konfigurację</b><span>Przygotujemy proces za Ciebie</span></div></label></div><div class="onboard-templates">{cards}</div><div class="onboarding-actions">{button('Wstecz','secondary','back',False)}{button('Użyj szablonu','primary','chevron',False)}</div></div><div class="onboarding-security">{icon('shield',15)} Dane są zapisywane w organizacji „Meble Nowak”.</div></main>
      </div>
    </section>'''


def widget_screen() -> str:
    return f'''
    <section class="shot desktop-shot widget-shot" id="widget-desktop">
      <div class="widget-page">
        <header class="widget-header"><div class="client-brand"><span class="client-logo">MN</span><div><b>Meble Nowak</b><span>Kuchnie i zabudowy na wymiar</span></div></div><div class="widget-meta"><span>{icon('clock',14) if 'clock' in ICONS else icon('calendar',14)} Około 3 minuty</span><button>{icon('close',18)}</button></div></header>
        <main class="widget-stage"><div class="widget-progress-head"><span>Krok 4 z 9</span><b>44%</b></div><div class="widget-progress"><i style="width:44%"></i></div><div class="widget-question"><span class="preview-kicker">Budżet</span><h1>Jaki budżet planujesz przeznaczyć na realizację?</h1><p>Wybierz orientacyjny przedział. Nie musi to być ostateczna kwota.</p><div class="widget-options"><button>Do 20 000 zł</button><button class="selected">25 000–35 000 zł {icon('check',18)}</button><button>35 000–50 000 zł</button><button>Powyżej 50 000 zł</button><button>Jeszcze nie wiem</button></div><div class="widget-actions"><button class="widget-back">{icon('back',16)} Wstecz</button><button class="widget-next">Dalej {icon('chevron',16)}</button></div></div></main><footer class="widget-footer"><span>{icon('shield',14)} Twoje dane służą wyłącznie do przygotowania odpowiedzi.</span><a>Polityka prywatności</a></footer>
      </div>
    </section>
    <section class="shot desktop-shot widget-result-shot" id="widget-result-desktop"><div class="widget-page result-page"><header class="widget-header"><div class="client-brand"><span class="client-logo">MN</span><div><b>Meble Nowak</b><span>Kuchnie i zabudowy na wymiar</span></div></div><span>{badge('Zapytanie wysłane','success')}</span></header><main class="result-stage"><div class="result-check">{icon('check',28)}</div><span class="preview-kicker">Gotowy brief</span><h1>Dziękujemy. Mamy informacje potrzebne do pierwszej rozmowy.</h1><p>Orientacyjny wynik na podstawie podanych odpowiedzi:</p><div class="result-price"><span>Szacowany przedział</span><strong>25 000–35 000 zł</strong><small>To nie jest wiążąca oferta. Ostateczna cena zależy od pomiaru i wyboru materiałów.</small></div><div class="result-summary"><div>{icon('flow',16)}<span>Zakres</span><b>Kuchnia w układzie L · około 8 mb</b></div><div>{icon('calendar',16)}<span>Termin</span><b>Do 3 miesięcy</b></div><div>{icon('location',16)}<span>Lokalizacja</span><b>Ciechanów</b></div><div>{icon('file',16)}<span>Materiały</span><b>3 zdjęcia</b></div></div><div class="next-contact"><div>{icon('phone',20)}<span><b>Następny krok</b><small>Oddzwonimy w ciągu 24 godzin.</small></span></div>{button('Wybierz godzinę kontaktu','primary','calendar',False)}</div></main><footer class="widget-footer"><span>Numer zapytania: MN-0517-024</span><a>Pobierz podsumowanie PDF</a></footer></div></section>'''


def mobile_header(title: str, back: bool = False, actions: str = "") -> str:
    left = icon('back',18) if back else '<span class="mobile-mark"><i></i><i></i><i></i></span>'
    return f'<header class="mobile-app-header"><button>{left}</button><b>{escape(title)}</b><div>{actions or icon("menu",19)}</div></header>'


def mobile_bottom(active: str) -> str:
    items=[('dashboard','home','Start'),('leads','leads','Leady'),('flows','flow','Procesy'),('analytics','chart','Analityka'),('settings','settings','Więcej')]
    return '<nav class="mobile-bottom">'+''.join(f'<button class="{"active" if key==active else ""}">{icon(ico,18)}<span>{label}</span></button>' for key,ico,label in items)+'</nav>'


def mobile_dashboard() -> str:
    leads=''.join([
        '<div class="mobile-lead">'+avatar('AK',0,'sm')+'<div><b>Anna Kowalska</b><span>Kuchnia na wymiar · 12 min</span></div><strong>85<small>/100</small></strong></div>',
        '<div class="mobile-lead">'+avatar('PN',1,'sm')+'<div><b>Piotr Nowak</b><span>Ogrodzenie panelowe · 1 h</span></div><strong>82<small>/100</small></strong></div>',
        '<div class="mobile-lead">'+avatar('KW',2,'sm')+'<div><b>Katarzyna Wiśniewska</b><span>Strona internetowa · 3 h</span></div><strong>78<small>/100</small></strong></div>',
    ])
    return f'''
    <section class="shot mobile-shot" id="dashboard-mobile"><div class="mobile-shell">{mobile_header('Dashboard',False,icon('bell',18))}<main class="mobile-main"><div class="mobile-title"><span>Meble Nowak</span><h1>Dzień dobry, Karol</h1><p>3 elementy wymagają dziś Twojej uwagi.</p></div><div class="mobile-attention"><div><i class="hot"></i><span><b>3 nowe leady</b><small>Najstarszy czeka 42 min</small></span>{icon('chevron',16)}</div><div><i class="warn"></i><span><b>Nieopublikowane zmiany</b><small>Proces „Kuchnie”</small></span>{icon('chevron',16)}</div></div><div class="mobile-metrics"><article><span>Leady</span><strong>127</strong><small>+24%</small></article><article><span>Konwersja</span><strong>12,4%</strong><small>+2,6 pp</small></article><article><span>Śr. wycena</span><strong>28,4 tys.</strong><small>+6,2%</small></article><article><span>Reakcja</span><strong>32 min</strong><small>−11%</small></article></div><section class="mobile-section"><div class="mobile-section-head"><h2>Najnowsze leady</h2><a>Wszystkie</a></div><div class="mobile-leads-list">{leads}</div></section><section class="mobile-section"><div class="mobile-section-head"><h2>Następny krok</h2></div><button class="mobile-task"><span>01</span><div><b>Oddzwoń do Anny</b><small>Lead 85/100 · do 24 h</small></div>{icon('chevron',16)}</button></section></main>{mobile_bottom('dashboard')}</div></section>'''


def mobile_leads() -> str:
    cards=[]
    data=[('AK','Anna Kowalska','Kuchnia na wymiar','85','25–35 tys. zł','Nowy','info',0),('JN','Jan Nowak','Ogrodzenie panelowe','78','15–25 tys. zł','W trakcie','warning',1),('AB','Firma ABC','Strona internetowa','92','8–12 tys. zł','Zakwalifikowany','success',2),('KW','Katarzyna Wiśniewska','Remont mieszkania','65','40–60 tys. zł','W trakcie','warning',3),('PZ','Piotr Zieliński','Klimatyzacja','88','12–18 tys. zł','Zakwalifikowany','success',4)]
    for init,name,service,score,budget,status,tone,idx in data:
        cards.append(f'<article class="lead-mobile-card"><div class="lead-card-top">{avatar(init,idx,"sm")}<div><b>{name}</b><span>{service}</span></div><strong>{score}<small>/100</small></strong></div><div class="lead-card-meta"><span>{icon("card",14)} {budget}</span><span>{badge(status,tone)}</span></div><div class="lead-card-actions"><button>{icon("phone",16)} Zadzwoń</button><button>{icon("mail",16)} E-mail</button><button>{icon("chevron",16)}</button></div></article>')
    return f'''
    <section class="shot mobile-shot" id="leads-mobile"><div class="mobile-shell">{mobile_header('Leady',False,icon('plus',19))}<main class="mobile-main leads-mobile-main"><div class="mobile-search-row"><label class="search-box">{icon('search',16)}<input placeholder="Szukaj leada"/></label><button class="filter-square">{icon('filter',17)}</button></div><div class="mobile-tabs"><button class="active">Wszystkie <b>128</b></button><button>Nowe 24</button><button>W trakcie 38</button></div><div class="lead-mobile-list">{''.join(cards)}</div></main>{mobile_bottom('leads')}</div></section>'''


def mobile_detail() -> str:
    return f'''
    <section class="shot mobile-shot" id="lead-detail-mobile"><div class="mobile-shell">{mobile_header('Szczegóły leada',True,icon('dots',19))}<main class="mobile-main detail-mobile-main"><section class="mobile-lead-head">{avatar('AK',0,'lg')}<div><h1>Anna Kowalska</h1><p>Kuchnia na wymiar</p></div><div class="mobile-score"><strong>85<small>/100</small></strong><span>Dobre dopasowanie</span></div></section><div class="mobile-reasons"><div>{icon('check',14)} Budżet w oczekiwanym przedziale</div><div>{icon('check',14)} Realny termin realizacji</div><div>{icon('check',14)} Komplet kluczowych informacji</div></div><section class="mobile-summary">{detail_rows()}</section><section class="mobile-section"><div class="mobile-section-head"><h2>Materiały</h2><span>3 pliki</span></div><div class="mobile-files"><div class="room-thumb room-a"></div><div class="room-thumb room-b"></div><div class="file-count">+1</div></div></section><section class="mobile-section"><div class="mobile-section-head"><h2>Obsługa</h2></div><label>Status<div class="select-input">Nowy {icon('chevron',13)}</div></label><label>Następny krok<div class="input-like">Kontakt telefoniczny do 24 h</div></label><label>Notatka<textarea placeholder="Dodaj notatkę…"></textarea></label></section></main><div class="mobile-sticky-actions"><button>{icon('mail',17)}</button><button>{icon('phone',17)}</button><button class="primary">Rozpocznij obsługę</button></div></div></section>'''


def mobile_builder() -> str:
    steps=''.join([
        '<div class="mobile-step done"><span>01</span><div><b>Ekran startowy</b><small>Gotowy</small></div>'+icon('check',15)+'</div>',
        '<div class="mobile-step done"><span>02</span><div><b>Rodzaj usługi</b><small>Gotowy</small></div>'+icon('check',15)+'</div>',
        '<div class="mobile-step active"><span>05</span><div><b>Budżet</b><small>Edytujesz</small></div>'+icon('chevron',15)+'</div>',
        '<div class="mobile-step"><span>06</span><div><b>Termin realizacji</b><small>4 odpowiedzi</small></div>'+icon('chevron',15)+'</div>',
        '<div class="mobile-step warning"><span>07</span><div><b>Lokalizacja</b><small>Sprawdź warunek</small></div>'+icon('alert',15)+'</div>',
    ])
    return f'''
    <section class="shot mobile-shot" id="builder-mobile"><div class="mobile-shell builder-mobile-shell">{mobile_header('Kuchnie na wymiar',True,button('Publikuj','primary',None,True))}<main class="mobile-main builder-mobile-main"><div class="mobile-builder-status"><span>{badge('Draft','warning')}</span><span>{icon('check',14)} Zapisano</span><button>{icon('eye',16)} Testuj</button></div><div class="mobile-builder-tabs"><button class="active">Kroki</button><button>Podgląd</button><button>Ustawienia</button></div><section class="mobile-steps">{steps}<button class="add-mobile-step">{icon('plus',16)} Dodaj krok</button></section><section class="mobile-step-editor"><span class="eyebrow-ui">Wybrany krok</span><h2>Budżet</h2><label>Treść pytania<textarea>Jaki budżet planujesz przeznaczyć na realizację?</textarea></label><label>Opis pomocniczy<textarea>Wybierz orientacyjny przedział.</textarea></label><div class="mobile-editor-links"><button>Odpowiedzi <b>4</b>{icon('chevron',15)}</button><button>Logika <b>2 reguły</b>{icon('chevron',15)}</button><button>Wycena <b>Aktywna</b>{icon('chevron',15)}</button><button>Scoring <b>+30 pkt</b>{icon('chevron',15)}</button></div></section></main><div class="mobile-sticky-actions"><button class="primary full">Zapisz krok</button></div></div></section>'''


def mobile_onboarding() -> str:
    cards=''.join([
        '<button class="mobile-onboard-card active"><span class="template-mini meble"></span><div><b>Meble na wymiar</b><small>32 pytania · 11 reguł</small></div>'+icon('check',16)+'</button>',
        '<button class="mobile-onboard-card"><span class="template-mini ogrodzenia"></span><div><b>Ogrodzenia i bramy</b><small>24 pytania · wycena za mb</small></div></button>',
        '<button class="mobile-onboard-card"><span class="template-mini strony"></span><div><b>Strony internetowe</b><small>19 pytań · 4 wyniki</small></div></button>',
    ])
    return f'''
    <section class="shot mobile-shot" id="onboarding-mobile"><div class="mobile-shell onboarding-mobile"><header class="onboard-mobile-head"><div class="brand-lockup"><span class="brand-mark"><i></i><i></i><i></i></span><strong>Lorum</strong></div><button>Pomiń</button></header><main><div class="onboard-progress"><span>Krok 3 z 6</span><div><i style="width:50%"></i></div></div><span class="eyebrow-ui">Pierwszy proces</span><h1>Wybierz punkt startowy</h1><p>Szablon skopiujemy jako niezależny draft. Wszystko później zmienisz.</p><div class="mobile-onboard-list">{cards}</div><div class="onboard-callout">{icon('shield',16)}<div><b>Bez ryzyka</b><span>Nie publikujemy procesu bez Twojej decyzji.</span></div></div></main><div class="onboard-mobile-actions">{button('Wstecz','secondary','back',False)}{button('Użyj szablonu','primary','chevron',False)}</div></div></section>'''


def mobile_widget() -> str:
    return f'''
    <section class="shot mobile-shot" id="widget-mobile"><div class="mobile-widget"><header><div class="client-brand"><span class="client-logo">MN</span><div><b>Meble Nowak</b><span>Kuchnie na wymiar</span></div></div><button>{icon('close',18)}</button></header><div class="mobile-widget-progress"><span>Krok 4 z 9</span><b>44%</b><i><em style="width:44%"></em></i></div><main><span class="preview-kicker">Budżet</span><h1>Jaki budżet planujesz przeznaczyć na realizację?</h1><p>Wybierz orientacyjny przedział.</p><div class="mobile-widget-options"><button>Do 20 000 zł</button><button class="selected">25 000–35 000 zł {icon('check',17)}</button><button>35 000–50 000 zł</button><button>Powyżej 50 000 zł</button><button>Jeszcze nie wiem</button></div></main><footer><button class="back">{icon('back',16)} Wstecz</button><button class="next">Dalej {icon('chevron',16)}</button></footer><div class="privacy-line">{icon('shield',13)} Dane służą wyłącznie do przygotowania odpowiedzi.</div></div></section>'''


CSS = r'''
@font-face{font-family:Inter;src:local("Inter");font-weight:100 900}*{box-sizing:border-box}html,body{margin:0;background:#eeece7;color:#17201d;font-family:Inter,Arial,sans-serif}.shot{overflow:hidden;background:#faf9f6}.desktop-shot{width:1440px;height:900px}.mobile-shot{width:390px;height:844px}.icon{display:block;flex:0 0 auto}.app-shell{display:grid;grid-template-columns:208px 1fr;width:100%;height:100%;background:#f6f5f1}.app-sidebar{background:#074c35;color:#fff;padding:22px 14px 16px;display:flex;flex-direction:column;min-width:0}.brand-lockup{display:flex;align-items:center;gap:10px;height:38px;padding:0 10px;font-size:18px;letter-spacing:-.02em}.brand-lockup strong{font-weight:750}.brand-lockup.light{color:#fff;padding:0}.brand-mark,.mobile-mark,.mini-logo{position:relative;width:21px;height:24px;display:inline-block;flex:0 0 auto}.brand-mark i,.mobile-mark i,.mini-logo i{position:absolute;width:5px;height:12px;background:#52d88c;border-radius:5px 5px 2px 2px;transform-origin:bottom}.brand-mark i:nth-child(1),.mobile-mark i:nth-child(1),.mini-logo i:nth-child(1){left:8px;bottom:1px;height:15px}.brand-mark i:nth-child(2),.mobile-mark i:nth-child(2),.mini-logo i:nth-child(2){left:3px;top:1px;transform:rotate(-42deg)}.brand-mark i:nth-child(3),.mobile-mark i:nth-child(3),.mini-logo i:nth-child(3){right:1px;top:1px;transform:rotate(42deg)}.side-nav{display:flex;flex-direction:column;gap:4px;margin-top:30px}.side-item{height:41px;display:flex;align-items:center;gap:12px;padding:0 12px;border-radius:7px;color:#d4e5de;font-size:13px;font-weight:560}.side-item.active{background:#0e6848;color:#fff}.side-item .icon{opacity:.92}.side-spacer{flex:1}.side-bottom{margin-top:0;margin-bottom:14px}.side-profile{display:grid;grid-template-columns:34px 1fr 14px;align-items:center;gap:8px;padding:12px 10px 2px;border-top:1px solid rgba(255,255,255,.12)}.side-profile div{display:flex;flex-direction:column}.side-profile b{font-size:12px}.side-profile span{font-size:10px;color:#b5d3c7;margin-top:2px}.app-stage{min-width:0;display:flex;flex-direction:column;height:100%}.app-topbar{height:78px;background:#fff;border-bottom:1px solid #e3e1da;display:flex;align-items:center;justify-content:space-between;padding:0 26px 0 28px;flex:0 0 auto}.topbar-title{display:flex;flex-direction:column;gap:3px}.eyebrow-ui{font-size:10px;line-height:1;text-transform:uppercase;letter-spacing:.08em;font-weight:760;color:#0a6a46}.title-row{display:flex;align-items:center;gap:12px}.title-row h1{margin:0;font-size:25px;line-height:1.15;letter-spacing:-.035em}.topbar-actions{display:flex;align-items:center;gap:8px}.app-main{position:relative;flex:1;padding:20px 24px 24px;overflow:hidden}.demo-note{position:absolute;top:4px;right:24px;font-size:9px;color:#8a938f}.btn{border:0;display:inline-flex;align-items:center;justify-content:center;gap:7px;height:38px;padding:0 14px;border-radius:6px;font:600 12px/1 Inter;cursor:default;white-space:nowrap}.btn-sm{height:32px;padding:0 10px;font-size:11px}.btn-primary{background:#07553b;color:#fff;border:1px solid #07553b}.btn-secondary{background:#fff;color:#164a38;border:1px solid #9eb7ad}.btn-ghost{background:transparent;color:#53625d}.btn-ghost-icon{width:34px;padding:0;background:#fff;color:#47544f;border:1px solid #e3e1da}.btn-danger{background:#fff;color:#b63d3c;border:1px solid #e4a5a4}.btn span:empty{display:none}.select-compact{height:32px;border:1px solid #e3e1da;background:#fff;border-radius:6px;padding:0 10px;display:inline-flex;align-items:center;gap:8px;font-size:11px;color:#36433f}.badge{display:inline-flex;align-items:center;height:21px;padding:0 8px;border-radius:999px;font-size:9px;font-weight:680;white-space:nowrap}.badge-success{background:#e3f3e8;color:#157343}.badge-warning{background:#fbf0db;color:#96611d}.badge-error{background:#fbe7e6;color:#b43d3b}.badge-info{background:#e7f0f8;color:#366b9b}.badge-neutral{background:#f0f1ef;color:#59645f}.badge-brand{background:#dcece5;color:#07583b}.avatar{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;font-weight:700;color:#27362f;flex:0 0 auto}.avatar-md{width:38px;height:38px;font-size:12px}.avatar-sm{width:30px;height:30px;font-size:10px}.avatar-xs{width:22px;height:22px;font-size:8px}.avatar-lg{width:52px;height:52px;font-size:15px}.avatar-0{background:#eaded2}.avatar-1{background:#d9e5ea}.avatar-2{background:#e4e1ef}.avatar-3{background:#d8eadf}.avatar-4{background:#eee1d5}.panel{background:#fff;border:1px solid #e3e1da;border-radius:10px;box-shadow:0 1px 2px rgba(18,43,31,.035)}.panel-flat{background:#fff;border:1px solid #e3e1da;border-radius:8px}.panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.panel-head h2,.panel-head h3{margin:0;font-size:14px;letter-spacing:-.02em}.panel-head h3{font-size:13px}.panel-head p{margin:4px 0 0;font-size:10px;color:#7a8580}.panel-head a{font-size:10px;color:#0a6a46;font-weight:650}.section-caption{font-size:11px;font-weight:720;margin-bottom:10px}.attention-panel{margin-bottom:14px}.attention-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.attention-item{height:62px;border:1px solid #e3e1da;background:#fff;border-radius:8px;display:grid;grid-template-columns:8px 1fr auto;align-items:center;gap:11px;padding:0 13px}.attention-dot{width:7px;height:7px;border-radius:50%}.attention-dot.hot{background:#d65752}.attention-dot.warn{background:#d89c42}.attention-dot.neutral{background:#7b8c84}.attention-item div{display:flex;flex-direction:column;gap:3px}.attention-item b{font-size:11px}.attention-item span{font-size:9px;color:#7a8580}.attention-item a{font-size:9px;color:#0a6a46;font-weight:650}.metric-grid{display:grid;gap:10px;margin-bottom:14px}.metric-grid.five{grid-template-columns:repeat(5,1fr)}.metric-grid.four{grid-template-columns:repeat(4,1fr)}.metric-card{background:#fff;border:1px solid #e3e1da;border-radius:8px;padding:13px 14px;min-height:78px}.metric-label{font-size:9px;color:#68736e}.metric-main{display:flex;align-items:flex-end;justify-content:space-between;margin-top:7px}.metric-main strong{font-size:20px;letter-spacing:-.04em}.delta{font-size:9px;font-weight:700}.delta-up{color:#14814a}.delta-down{color:#c74e4e}.delta-neutral{color:#65706b}.metric-help{font-size:8px;color:#9aa19e;margin-top:5px}.dashboard-grid{display:grid;grid-template-columns:1.65fr .8fr;gap:12px;margin-bottom:12px}.chart-panel,.quality-panel{height:208px;padding:15px 16px}.legend{display:flex;align-items:center;gap:6px;font-size:9px;color:#69746f}.dot{width:7px;height:7px;border-radius:50%;display:inline-block}.dot.brand{background:#1c9a61}.bar-chart,.trend-chart{height:118px;display:flex;align-items:flex-end;gap:8px;padding:14px 4px 0;border-bottom:1px solid #eceae5;background:repeating-linear-gradient(to top,transparent 0,transparent 28px,#f0efeb 29px)}.bar-chart i,.trend-chart i{display:block;flex:1;min-width:5px;background:#b8dfca;border-radius:2px 2px 0 0}.axis{display:flex;justify-content:space-between;color:#9aa19e;font-size:8px;padding-top:7px}.donut-row{display:grid;grid-template-columns:150px 1fr;align-items:center;height:150px}.donut{width:128px;height:128px;border-radius:50%;background:conic-gradient(#0a6846 0 31%,#4d9a72 31% 78%,#d6b66d 78% 94%,#d8dcda 94% 100%);display:grid;place-items:center;position:relative}.donut:after{content:"";position:absolute;width:82px;height:82px;border-radius:50%;background:#fff}.donut span{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center}.donut b{font-size:22px}.donut small{font-size:7px;color:#7a8580}.quality-list{display:flex;flex-direction:column;gap:9px}.quality-list div{display:grid;grid-template-columns:8px 1fr 22px;gap:7px;align-items:center;font-size:9px}.quality-list i{width:7px;height:7px;border-radius:50%}.quality-list .q1{background:#0a6846}.quality-list .q2{background:#4d9a72}.quality-list .q3{background:#d6b66d}.quality-list .q4{background:#d8dcda}.dashboard-bottom{display:grid;grid-template-columns:2.05fr .75fr;gap:12px}.leads-panel,.next-panel{height:279px;padding:15px 16px}.data-table{width:100%;border-collapse:collapse;font-size:9px}.data-table thead th{text-align:left;color:#75807b;font-weight:620;padding:10px 8px;border-bottom:1px solid #e7e5df;white-space:nowrap}.data-table tbody td{padding:10px 8px;border-bottom:1px solid #efede8;white-space:nowrap}.data-table tbody tr:last-child td{border-bottom:0}.data-table.compact thead th{padding:8px 6px}.data-table.compact tbody td{padding:8px 6px}.person-cell{display:flex;align-items:center;gap:8px}.person-cell>div{display:flex;flex-direction:column;gap:2px}.person-cell b{font-size:9px}.person-cell span{font-size:7.5px;color:#7a8580}.score-cell b{font-size:12px}.score-cell span{font-size:7px;color:#7a8580}.muted{color:#8c9591}.task-list{margin-top:12px;display:flex;flex-direction:column}.task-list>div{display:grid;grid-template-columns:26px 1fr 16px;align-items:center;gap:10px;padding:14px 0;border-bottom:1px solid #eeece7}.task-list>div:last-child{border-bottom:0}.task-number{font-size:9px;color:#0a6a46;font-weight:750}.task-list div div{display:flex;flex-direction:column;gap:3px}.task-list b{font-size:10px}.task-list span{font-size:8px;color:#7b8681}.leads-toolbar{height:68px;padding:0 14px;display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.tab-row{display:flex;align-self:stretch}.tab{border:0;background:transparent;padding:0 14px;position:relative;color:#68736e;font:560 10px Inter}.tab b{font-size:8px;margin-left:4px}.tab.active{color:#17201d;font-weight:700}.tab.active:after{content:"";position:absolute;left:12px;right:12px;bottom:0;height:2px;background:#0a6a46}.toolbar-right{display:flex;gap:8px;align-items:center}.search-box{height:34px;border:1px solid #e3e1da;border-radius:6px;background:#fff;display:flex;align-items:center;gap:7px;padding:0 10px;color:#7b8581}.search-box input{border:0;outline:0;background:transparent;font:10px Inter;width:240px}.search-box.small input{width:160px}.active-filters{height:28px;display:flex;align-items:center;gap:7px;margin-bottom:8px}.active-filters span{height:24px;padding:0 8px;background:#eeefec;border-radius:4px;display:inline-flex;align-items:center;gap:5px;font-size:8px;color:#5d6863}.active-filters button{border:0;background:transparent;color:#0a6a46;font:600 8px Inter}.table-shell{height:692px;padding:0 16px 12px}.table-caption{height:62px;display:flex;align-items:center;justify-content:space-between}.table-caption h2{margin:0;font-size:16px}.table-caption p{margin:4px 0 0;font-size:9px;color:#7b8581}.view-controls{display:flex;gap:7px}.leads-table thead th,.leads-table tbody td{padding:12px 8px}.leads-table tbody tr:hover{background:#fafaf7}.pagination{height:54px;display:flex;align-items:center;justify-content:space-between;color:#7b8581;font-size:9px;border-top:1px solid #eceae5}.pagination>div{display:flex;gap:4px;align-items:center}.page{width:27px;height:27px;border:0;background:transparent;border-radius:5px;font:600 9px Inter}.page.active{background:#07553b;color:#fff}.lead-hero{height:94px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:0;border-radius:8px 8px 0 0}.lead-identity{display:flex;align-items:center;gap:13px}.lead-identity>div{display:flex;flex-direction:column}.back-link{font-size:8px;color:#68736e;display:flex;align-items:center;gap:4px;margin-bottom:4px}.lead-identity h2{font-size:18px;margin:0}.lead-identity p{font-size:9px;color:#7a8580;margin:4px 0 0}.lead-score{border-left:1px solid #e3e1da;padding-left:28px;display:grid;grid-template-columns:auto 160px;column-gap:14px;align-items:center}.lead-score strong{font-size:28px;line-height:1;grid-row:1/3}.lead-score strong span{font-size:11px}.lead-score b{font-size:10px;color:#157343}.lead-score small{font-size:8px;color:#77827d}.lead-tabs{height:42px;background:#fff;border:1px solid #e3e1da;border-top:0;display:flex;align-items:stretch;padding-left:18px;margin-bottom:12px}.lead-tabs button{border:0;background:transparent;padding:0 16px;font:600 9px Inter;color:#65706b;position:relative}.lead-tabs button:first-child{color:#17201d}.lead-tabs button:first-child:after{content:"";position:absolute;left:12px;right:12px;bottom:0;height:2px;background:#0a6a46}.lead-tabs span{font-size:7px;background:#edf0ed;padding:2px 4px;border-radius:999px}.lead-layout{display:grid;grid-template-columns:1.75fr .72fr;gap:12px;height:650px}.lead-main-col,.lead-side-col{display:flex;flex-direction:column;gap:12px}.summary-panel{padding:15px 16px}.summary-row{min-height:44px;display:grid;grid-template-columns:18px 106px 1fr;align-items:center;gap:9px;border-bottom:1px solid #eeece7;font-size:10px}.summary-row:last-child{border-bottom:0}.summary-row>span{color:#65706b}.summary-row b{font-weight:570}.files-panel{padding:15px 16px}.file-thumbs{display:flex;gap:10px;margin-top:12px}.room-thumb{width:138px;height:76px;border-radius:6px;border:1px solid #dad8d2;position:relative;overflow:hidden;background:#d9d1c4}.room-thumb:before{content:"";position:absolute;left:8px;right:8px;bottom:10px;height:28px;background:linear-gradient(90deg,#433f38 0 32%,#a58258 32% 65%,#ddd4c7 65%);box-shadow:0 -18px 0 rgba(240,236,229,.75)}.room-b:before{background:linear-gradient(90deg,#bbb0a1 0 30%,#504940 30% 70%,#b48e5f 70%)}.room-thumb span{position:absolute;left:7px;bottom:4px;color:#fff;font-size:7px;text-shadow:0 1px 2px #000}.file-doc{width:170px;height:76px;border:1px dashed #c9cdc9;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#68736e}.file-doc b{font-size:8px;color:#28342f}.file-doc span{font-size:7px}.timeline-panel{padding:15px 16px;flex:1}.timeline{margin-top:12px;padding-left:8px}.timeline>div{position:relative;border-left:1px solid #d9ddd9;padding:0 0 18px 22px;display:grid;grid-template-columns:1fr auto;gap:3px}.timeline i{position:absolute;left:-4px;top:2px;width:7px;height:7px;border-radius:50%;background:#0a6a46}.timeline b{font-size:9px}.timeline span,.timeline p{font-size:8px;color:#7b8581;margin:0}.contact-panel,.side-form,.technical-panel{padding:14px 15px}.contact-panel h3,.side-form h3,.technical-panel h3{font-size:12px;margin:0 0 12px}.contact-line{display:flex;align-items:center;gap:9px;padding:9px 0;border-bottom:1px solid #eeece7}.contact-line div{display:flex;flex-direction:column;gap:3px}.contact-line span{font-size:8px;color:#7a8580}.contact-line b{font-size:9px}.contact-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:11px}.side-form label,.settings-section label,.webhook-settings label,.clone-card label,.mobile-section label,.mobile-step-editor label{display:flex;flex-direction:column;gap:5px;font-size:8px;font-weight:650;color:#59645f;margin-bottom:10px}.select-input,.input-like{min-height:34px;border:1px solid #dddcd6;background:#fff;border-radius:6px;padding:0 10px;display:flex;align-items:center;justify-content:space-between;font-size:9px;color:#25312d}.input-like{justify-content:flex-start}.side-form textarea,.settings-section textarea,.mobile-section textarea,.mobile-step-editor textarea{width:100%;min-height:66px;border:1px solid #dddcd6;border-radius:6px;padding:9px;font:9px Inter;resize:none}.switch-row{display:flex!important;flex-direction:row!important;justify-content:space-between;align-items:center}.switch-row>span{display:flex;flex-direction:column;gap:2px}.switch-row b{font-size:9px;color:#25312d}.switch-row small{font-size:7px;color:#7b8581;font-weight:400}.switch{width:32px;height:18px;background:#d9dedb;border-radius:999px;padding:2px}.switch em{display:block;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.12)}.switch.on{background:#0b6a47}.switch.on em{margin-left:14px}.person-inline{display:flex;align-items:center;gap:6px}.technical-panel div{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eeece7}.technical-panel div:last-child{border-bottom:0}.technical-panel span{font-size:8px;color:#7b8581}.technical-panel b{font-size:8px}.builder-shot .app-main{padding:0}.builder-shot .app-topbar{height:66px}.save-state{font-size:9px;color:#64716b;display:flex;align-items:center;gap:4px}.device-toggle{display:flex;border:1px solid #deddd7;border-radius:6px;overflow:hidden;height:32px}.device-toggle button{width:34px;border:0;background:#fff;display:grid;place-items:center;color:#6f7a75}.device-toggle button.active{background:#e8f1ec;color:#07553b}.builder-layout{display:grid;grid-template-columns:278px 1fr 344px;height:834px}.builder-steps,.builder-inspector{border-radius:0;border-top:0;border-bottom:0;overflow:hidden}.builder-steps{border-left:0}.builder-inspector{border-right:0}.builder-side-head{height:66px;padding:0 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e7e5df}.builder-side-head h2{font-size:13px;margin:4px 0 0}.builder-tabs{height:38px;display:flex;border-bottom:1px solid #e7e5df}.builder-tabs button{flex:1;border:0;background:#fff;font:600 9px Inter;color:#69736f;position:relative}.builder-tabs button.active{color:#17201d}.builder-tabs button.active:after{content:"";position:absolute;left:18px;right:18px;bottom:0;height:2px;background:#0a6a46}.steps-list{height:608px;overflow:hidden;padding:8px}.builder-step{height:53px;border-radius:6px;display:grid;grid-template-columns:16px 28px 1fr 14px 16px;align-items:center;gap:5px;padding:0 6px;color:#64716b}.builder-step.active{background:#e7f1eb;color:#17372a}.drag{font-size:9px;color:#b0b7b3}.step-index{font-size:8px;color:#87908c}.builder-step div{display:flex;flex-direction:column;gap:3px}.builder-step b{font-size:9px}.builder-step small{font-size:7px}.step-warning{width:14px;height:14px;border-radius:50%;background:#f5e3bf;color:#955d17;font-size:9px;display:grid;place-items:center}.step-add{height:67px;padding:8px 12px;border-top:1px solid #e7e5df;display:flex;align-items:center;justify-content:space-between}.text-action{border:0;background:transparent;font:600 9px Inter;color:#66716c}.text-action.green{color:#0a6a46}.text-action.danger{color:#b84846}.validation-note{margin:8px 10px;background:#fbf2e4;border:1px solid #eed8b5;border-radius:6px;padding:9px;display:flex;align-items:center;gap:8px;color:#8c5b1b}.validation-note div{display:flex;flex-direction:column;gap:2px}.validation-note b{font-size:8px}.validation-note span{font-size:7px}.builder-canvas{background:#f2f1ed;position:relative;display:flex;flex-direction:column}.canvas-toolbar{height:50px;background:#faf9f6;border-bottom:1px solid #e1dfd9;display:flex;align-items:center;justify-content:space-between;padding:0 15px}.breadcrumbs{display:flex;align-items:center;gap:6px;font-size:8px;color:#7a8580}.breadcrumbs b{color:#2d3934}.preview-frame{width:570px;height:620px;background:#fff;border:1px solid #dcdad4;border-radius:11px;box-shadow:0 16px 50px rgba(17,44,31,.08);align-self:center;margin-top:38px;overflow:hidden}.preview-brand{height:60px;display:grid;grid-template-columns:22px 1fr auto;align-items:center;gap:8px;padding:0 22px;border-bottom:1px solid #eeece7;font-size:10px}.mini-logo{transform:scale(.7);transform-origin:left center}.preview-brand span:last-child{font-size:8px;color:#7b8581}.preview-progress{height:4px;background:#edf0ed}.preview-progress i{display:block;height:100%;background:#0c6a48}.preview-content{padding:62px 64px}.preview-kicker{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#0a6a46;font-weight:750}.preview-content h3{font-size:27px;line-height:1.12;letter-spacing:-.04em;margin:12px 0 10px}.preview-content p{font-size:11px;line-height:1.55;color:#68736e;margin:0 0 24px}.preview-choices{display:flex;flex-direction:column;gap:9px}.preview-choice{height:48px;border:1px solid #dddcd6;border-radius:7px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;font-size:10px}.preview-choice.selected{border-color:#0b6847;background:#eef6f1;color:#07553b;font-weight:650}.preview-footer{display:flex;justify-content:space-between;margin-top:28px}.preview-back,.preview-next{height:38px;border-radius:6px;padding:0 16px;font:600 10px Inter}.preview-back{border:1px solid #ced4d0;background:#fff;color:#48554f}.preview-next{border:1px solid #07553b;background:#07553b;color:#fff;display:flex;align-items:center;gap:8px}.canvas-help{height:34px;align-self:center;width:570px;display:flex;align-items:center;justify-content:space-between;font-size:8px;color:#7c8682}.canvas-help span{display:flex;gap:5px;align-items:center}.inspector-tabs{height:46px;display:flex;border-bottom:1px solid #e4e2dc;overflow-x:hidden}.inspector-tabs button{flex:1;border:0;background:#fff;font:600 8px Inter;color:#6c7772;position:relative}.inspector-tabs button.active{color:#17201d}.inspector-tabs button.active:after{content:"";position:absolute;left:10px;right:10px;bottom:0;height:2px;background:#0a6a46}.inspector-body{padding:16px;height:788px;overflow:hidden}.inspector-section{padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid #eceae5}.inspector-section h3{font-size:11px;margin:0 0 12px}.inspector-section label{display:flex;flex-direction:column;gap:5px;font-size:8px;font-weight:650;color:#59645f;margin-bottom:10px}.inspector-section textarea{border:1px solid #dddcd6;border-radius:6px;min-height:62px;padding:9px;font:9px/1.45 Inter;resize:none}.inline-alert{min-height:36px;border-radius:6px;padding:8px 9px;display:flex;align-items:center;gap:7px;font-size:8px;line-height:1.35}.inline-alert.success{background:#edf7f1;color:#176943;border:1px solid #d1eadb}.inline-alert.warning{background:#fbf2e4;color:#8a591d;border:1px solid #edd9b8}.inline-alert.neutral{background:#f2f4f2;color:#59645f;border:1px solid #e1e5e2}.rules-header{height:92px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.rules-header h2{font-size:19px;margin:5px 0 3px}.rules-header p{font-size:9px;color:#717c77;margin:0}.rules-tabs{display:flex;height:36px;border:1px solid #deddd7;border-radius:6px;overflow:hidden}.rules-tabs button{border:0;border-right:1px solid #e5e3de;background:#fff;padding:0 13px;font:600 9px Inter;color:#65706b}.rules-tabs button:last-child{border-right:0}.rules-tabs button.active{background:#e8f1ec;color:#07553b}.rules-layout{display:grid;grid-template-columns:1.55fr .8fr;gap:12px;height:676px}.rules-main,.rules-side{display:flex;flex-direction:column;gap:12px}.rule-card{padding:16px}.rule-head{display:flex;align-items:flex-start;justify-content:space-between}.rule-head>div{display:flex;gap:10px}.rule-index{font-size:9px;font-weight:750;color:#0a6a46}.rule-head h3{font-size:13px;margin:0}.rule-head p{font-size:8px;color:#79837f;margin:4px 0 0}.rule-builder{background:#fafaf7;border:1px solid #e6e4de;border-radius:7px;padding:11px;margin-top:13px}.rule-line{display:grid;grid-template-columns:42px 150px 145px 1fr 30px;gap:7px;align-items:center;margin-bottom:7px}.rule-line:last-child{margin-bottom:0}.rule-line.sub{grid-template-columns:42px 150px 1fr}.rule-keyword{font-size:9px;font-weight:800;color:#0a6a46}.rule-keyword.then{color:#985e16}.rule-line .select-input,.rule-line .input-like{height:34px;min-height:34px}.rule-line .wide{width:auto}.icon-only{width:30px;height:30px;border:1px solid #deddd7;background:#fff;border-radius:5px;display:grid;place-items:center}.rule-foot{display:flex;align-items:center;justify-content:space-between;margin-top:10px}.rule-foot>span{font-size:8px;color:#387758;display:flex;align-items:center;gap:5px}.add-rule{height:42px;border:1px dashed #9fb9ad;background:#f8fbf9;color:#0a6a46;border-radius:8px;font:650 10px Inter;display:flex;align-items:center;justify-content:center;gap:8px}.calculation-card,.score-card,.result-card{padding:15px}.calc-total{padding:14px;background:#edf6f1;border-radius:7px;margin-top:12px;display:flex;flex-direction:column}.calc-total span{font-size:8px;color:#5d6a64}.calc-total strong{font-size:22px;margin:5px 0;color:#07553b;letter-spacing:-.035em}.calc-total small{font-size:7px;color:#6c7872}.calc-breakdown{margin-top:9px}.calc-breakdown div{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eeece7;font-size:8px}.score-big{display:flex;align-items:center;justify-content:space-between;margin:12px 0}.score-big strong{font-size:30px}.score-big strong span{font-size:10px}.score-reasons div{display:grid;grid-template-columns:16px 1fr 25px;align-items:center;gap:6px;padding:6px 0;font-size:8px}.result-preview{margin-top:10px;border:1px solid #dce3de;border-radius:7px;padding:12px}.result-preview>span{font-size:8px;color:#66716c}.result-preview>b{display:block;font-size:18px;color:#07553b;margin:5px 0}.result-preview p{font-size:8px;line-height:1.45;color:#6c7772}.analytics-top{display:grid;grid-template-columns:1.15fr 1fr;gap:12px;margin-bottom:12px}.funnel-panel,.trend-panel{height:330px;padding:15px 16px}.funnel{margin-top:15px}.funnel-row{display:grid;grid-template-columns:130px 1fr 48px;align-items:center;gap:10px;margin:9px 0}.funnel-row>div:first-child{display:flex;justify-content:space-between;gap:8px}.funnel-row b{font-size:8px}.funnel-row span{font-size:8px;color:#7d8783}.funnel-row strong{font-size:8px;text-align:right}.funnel-bar{height:12px;background:#edf0ed;border-radius:3px;overflow:hidden}.funnel-bar i{display:block;height:100%;background:#75bd96}.trend-chart{height:210px;margin-top:10px}.analytics-bottom{display:grid;grid-template-columns:1.25fr .75fr .75fr;gap:12px}.source-panel,.device-panel,.no-data-panel{height:293px;padding:15px 16px}.device-list{margin-top:14px}.device-list>div{height:56px;display:grid;grid-template-columns:24px 1fr auto;align-items:center;gap:9px;border-bottom:1px solid #eeece7}.device-list span{display:flex;flex-direction:column;gap:3px}.device-list b{font-size:9px}.device-list small{font-size:7px;color:#7b8581}.device-list strong{font-size:11px}.empty-compact{height:205px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#68736e}.empty-compact b{font-size:11px;color:#2f3b36;margin-top:9px}.empty-compact span{font-size:8px;line-height:1.45;max-width:150px;margin:4px 0 12px}.template-intro{min-height:120px;padding:18px 20px;display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:12px}.template-intro>div:first-child{max-width:700px}.template-intro h2{font-size:24px;line-height:1.15;letter-spacing:-.035em;margin:8px 0 7px}.template-intro p{font-size:10px;line-height:1.5;color:#65706b;margin:0}.template-filter{display:flex;gap:8px}.template-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px}.template-card{background:#fff;border:1px solid #e3e1da;border-radius:10px;overflow:hidden}.template-cover{height:116px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;position:relative;background:#d8d4cb}.template-cover:before{content:"";position:absolute;left:0;right:0;bottom:0;height:68px;background:linear-gradient(180deg,transparent,rgba(10,40,28,.62))}.template-cover>b{position:relative;z-index:1;color:#fff;font-size:15px}.cover-meble{background:linear-gradient(135deg,#708173,#b5a38c)}.cover-ogrodzenia{background:linear-gradient(135deg,#68716d,#a7aaa1)}.cover-strony{background:linear-gradient(135deg,#40514b,#8da39a)}.cover-klima{background:linear-gradient(135deg,#c6cbc7,#939e99)}.cover-remont{background:linear-gradient(135deg,#a49485,#d1c8bd)}.template-body{padding:13px}.template-body p{font-size:9px;line-height:1.45;color:#65706b;min-height:39px;margin:0 0 10px}.template-meta{display:flex;justify-content:space-between;font-size:8px;color:#77827d;padding-bottom:10px;border-bottom:1px solid #eceae5}.template-meta span{display:flex;align-items:center;gap:4px}.template-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}.custom-template{height:106px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;background:#0a4e36;color:#fff}.custom-template h2{font-size:17px;margin:5px 0}.custom-template p{font-size:9px;color:#cbe1d7;margin:0}.custom-template .eyebrow-ui{color:#88d7af}.custom-template .btn-primary{background:#fff;color:#07553b;border-color:#fff}.install-status{height:72px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.install-status>div:first-child{display:flex;align-items:center;gap:10px}.status-led{width:9px;height:9px;border-radius:50%;display:block}.status-led.online{background:#2faf70;box-shadow:0 0 0 4px #e5f4ea}.install-status h2{font-size:15px;margin:3px 0}.install-status p{font-size:8px;color:#7a8580;margin:0}.domain-pill{height:32px;background:#f1f4f2;border-radius:6px;padding:0 10px;display:flex;align-items:center;gap:7px;font-size:9px}.install-layout{display:grid;grid-template-columns:1.45fr .65fr;gap:12px}.install-main,.install-side{display:flex;flex-direction:column;gap:12px}.embed-modes,.code-panel,.trigger-panel,.wordpress-card,.diagnostics-card,.webhook-mini{padding:15px}.mode-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:13px}.mode-card{height:100px;border:1px solid #deddd7;background:#fff;border-radius:7px;display:flex;flex-direction:column;align-items:flex-start;padding:13px;gap:5px;position:relative;color:#5e6964}.mode-card b{font-size:10px;color:#27332e;margin-top:3px}.mode-card span{font-size:7px}.mode-card.active{border-color:#0a6a46;background:#f0f7f3;color:#07553b}.mode-card i{position:absolute;right:8px;top:8px;width:18px;height:18px;border-radius:50%;background:#0a6a46;color:#fff;display:grid;place-items:center}.code-panel pre,.trigger-panel pre{background:#16251f;color:#d9eee4;border-radius:7px;padding:13px;font:8px/1.65 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;margin:12px 0}.wordpress-head{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:9px}.wp-mark{width:38px;height:38px;border-radius:50%;background:#1f342c;color:#fff;display:grid;place-items:center;font:bold 18px Georgia}.wordpress-head h3{font-size:12px;margin:0}.wordpress-head p{font-size:8px;color:#7a8580;margin:3px 0}.wp-status{margin:12px 0}.wp-status div{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eceae5;font-size:8px}.diagnostics-card{flex:1}.diag-item{display:grid;grid-template-columns:18px 1fr auto;align-items:center;gap:6px;padding:8px 0;border-bottom:1px solid #eceae5;font-size:8px}.diag-item.ok{color:#3f6f58}.diag-item.warn{color:#8d5b1d}.copy-field{height:34px;border:1px solid #dfded8;border-radius:6px;padding:0 9px;display:flex;align-items:center;justify-content:space-between;font-size:8px}.integrations-layout{display:grid;grid-template-columns:1fr .95fr;gap:12px;margin-bottom:12px}.connections,.webhook-settings{height:394px;padding:15px}.integration-row{height:74px;display:grid;grid-template-columns:36px 1fr auto auto;align-items:center;gap:10px;border-bottom:1px solid #eceae5}.integration-logo,.company-avatar{width:34px;height:34px;border-radius:7px;background:#edf1ee;color:#0a6a46;display:grid;place-items:center;font-weight:800;font-size:12px}.integration-row>div{display:flex;flex-direction:column;gap:3px}.integration-row b{font-size:10px}.integration-row span{font-size:8px;color:#7b8581}.webhook-settings label{display:flex;flex-direction:column;gap:5px;font-size:8px;font-weight:650;color:#59645f;margin:13px 0}.chips{display:flex;gap:6px}.chips span{height:25px;padding:0 8px;background:#edf1ee;border-radius:4px;display:flex;align-items:center;font-size:8px;color:#2d3b35}.secret-row{border:1px solid #e3e1da;border-radius:7px;padding:10px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.secret-row div{display:flex;flex-direction:column;gap:3px}.secret-row span{font-size:8px;color:#7a8580}.secret-row b{font-size:9px}.deliveries{height:350px;padding:15px}.agency-layout{display:grid;grid-template-columns:1.65fr .7fr;gap:12px}.clients-panel{height:610px;padding:15px}.agency-side{display:flex;flex-direction:column;gap:12px}.clone-card,.white-label-card{padding:15px}.clone-card{height:355px}.white-label-card{height:242px}.domain-row{height:45px;border-bottom:1px solid #eceae5;display:grid;grid-template-columns:18px 1fr auto;align-items:center;gap:7px;font-size:8px}.settings-layout{display:grid;grid-template-columns:230px 1fr;gap:12px;height:776px}.settings-nav{padding:12px}.settings-nav-title{font-size:10px;font-weight:750;padding:10px}.settings-nav-item{width:100%;height:39px;border:0;background:transparent;border-radius:6px;display:flex;align-items:center;gap:9px;padding:0 10px;font:570 9px Inter;color:#5d6963}.settings-nav-item.active{background:#e7f1eb;color:#07553b}.settings-content{display:flex;flex-direction:column;gap:12px;overflow:hidden}.settings-section{padding:18px}.settings-head{display:flex;justify-content:space-between;margin-bottom:15px}.settings-head h2{font-size:14px;margin:0}.settings-head p{font-size:9px;color:#77827d;margin:4px 0 0}.form-grid.two{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px}.settings-section input{height:36px;border:1px solid #dddcd6;border-radius:6px;padding:0 10px;font:9px Inter}.area-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:18px}.map-placeholder{height:200px;background:repeating-linear-gradient(45deg,#eef0ed 0,#eef0ed 14px,#f5f5f2 14px,#f5f5f2 28px);border:1px solid #e0dfda;border-radius:7px;position:relative;display:grid;place-items:center;overflow:hidden}.map-center{position:relative;z-index:2;background:#07553b;color:#fff;padding:6px 9px;border-radius:4px;font-size:8px}.radius-ring{position:absolute;width:150px;height:150px;border:1px solid #5e9e7d;border-radius:50%;background:rgba(82,178,126,.08)}.map-placeholder small{position:absolute;bottom:10px;left:10px;font-size:8px;color:#65706b}.number-input{display:flex}.number-input input{flex:1;border-radius:6px 0 0 6px}.number-input span{width:44px;border:1px solid #dddcd6;border-left:0;border-radius:0 6px 6px 0;display:grid;place-items:center;font-size:8px;background:#f7f7f4}.switch-row.boxed{border:1px solid #e3e1da;border-radius:7px;padding:10px}.danger-zone{display:flex;align-items:center;justify-content:space-between}.danger-zone h2{font-size:13px;margin:0}.danger-zone p{font-size:8px;color:#7a8580}.danger-zone>div:last-child{display:flex;gap:7px}.onboarding-shot{background:#fff}.onboarding-shell{display:grid;grid-template-columns:440px 1fr;width:100%;height:100%}.onboarding-side{background:#074c35;color:#fff;padding:34px 44px;display:flex;flex-direction:column}.onboarding-copy{margin-top:80px}.onboarding-copy h1{font-size:34px;line-height:1.1;letter-spacing:-.04em;margin:12px 0 14px}.onboarding-copy p{font-size:11px;line-height:1.55;color:#c7ded4}.light-text{color:#8fe0b6}.onboarding-checklist{margin-top:50px;display:flex;flex-direction:column;gap:10px}.checklist-item{height:42px;display:grid;grid-template-columns:25px 1fr;align-items:center;gap:9px;color:#bdd4ca;font-size:9px}.checklist-item>span:first-child,.checklist-item>.icon{width:24px;height:24px;border:1px solid rgba(255,255,255,.2);border-radius:50%;display:grid;place-items:center}.checklist-item.done{color:#d9ebe3}.checklist-item.done>.icon{background:#11704e;border-color:#11704e;padding:5px}.checklist-item.current{color:#fff}.checklist-item.current>span{background:#fff;color:#07553b;border-color:#fff}.onboarding-help{margin-top:auto;border-top:1px solid rgba(255,255,255,.15);padding-top:18px;display:flex;align-items:center;gap:10px}.onboarding-help div{display:flex;flex-direction:column;gap:3px}.onboarding-help b{font-size:9px}.onboarding-help span{font-size:8px;color:#bdd4ca}.onboarding-main{position:relative;padding:32px 84px;background:#faf9f6}.onboarding-top{display:flex;justify-content:space-between;color:#6b7671;font-size:9px}.onboarding-top button{border:0;background:transparent;font:600 9px Inter;color:#0a6a46}.onboarding-form{max-width:680px;margin:72px auto 0}.onboarding-form h2{font-size:30px;letter-spacing:-.04em;margin:10px 0}.onboarding-form>p{font-size:11px;line-height:1.55;color:#65706b}.onboard-options{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:22px 0 15px}.radio-tile{height:86px;background:#fff;border:1px solid #deddd7;border-radius:8px;padding:12px;display:flex;gap:8px;text-align:left}.radio-tile.active{border-color:#0a6a46;background:#f0f7f3}.radio-tile input{accent-color:#07553b}.radio-tile div{display:flex;flex-direction:column;gap:5px}.radio-tile b{font-size:9px}.radio-tile span{font-size:8px;color:#6e7974;line-height:1.4}.onboard-templates{display:flex;flex-direction:column;gap:8px}.onboard-template{height:68px;border:1px solid #deddd7;border-radius:8px;background:#fff;display:grid;grid-template-columns:48px 1fr 18px;align-items:center;gap:10px;padding:0 12px;text-align:left}.onboard-template.active{border-color:#0a6a46}.template-mini{width:46px;height:42px;border-radius:5px;background:linear-gradient(135deg,#66786e,#b2a38f)}.template-mini.ogrodzenia{background:linear-gradient(135deg,#626b68,#aeb1a8)}.template-mini.strony{background:linear-gradient(135deg,#3b5148,#88a197)}.onboard-template div{display:flex;flex-direction:column;gap:4px}.onboard-template b{font-size:10px}.onboard-template small{font-size:8px;color:#7b8581}.onboarding-actions{display:flex;justify-content:space-between;margin-top:22px}.onboarding-security{position:absolute;bottom:24px;left:84px;font-size:8px;color:#7b8581;display:flex;align-items:center;gap:5px}.widget-shot,.widget-result-shot{background:#f4f3ef;padding:44px}.widget-page{width:100%;height:100%;background:#fff;border:1px solid #deddd7;border-radius:12px;box-shadow:0 18px 50px rgba(18,43,31,.08);display:flex;flex-direction:column}.widget-header{height:78px;border-bottom:1px solid #e8e6e1;display:flex;align-items:center;justify-content:space-between;padding:0 30px}.client-brand{display:flex;align-items:center;gap:10px}.client-logo{width:38px;height:38px;border-radius:7px;background:#0a4e36;color:#fff;display:grid;place-items:center;font-size:11px;font-weight:800}.client-brand div{display:flex;flex-direction:column;gap:3px}.client-brand b{font-size:12px}.client-brand span{font-size:8px;color:#75807b}.widget-meta{display:flex;align-items:center;gap:18px;font-size:8px;color:#6f7a75}.widget-meta span{display:flex;align-items:center;gap:5px}.widget-meta button,.widget-header>button{border:0;background:transparent}.widget-stage{width:720px;margin:0 auto;flex:1;padding-top:42px}.widget-progress-head{display:flex;justify-content:space-between;font-size:9px;color:#65706b}.widget-progress{height:5px;background:#edf0ed;border-radius:3px;margin-top:9px}.widget-progress i{display:block;height:100%;background:#0a6a46;border-radius:3px}.widget-question{padding:62px 74px}.widget-question h1{font-size:34px;line-height:1.1;letter-spacing:-.04em;margin:12px 0}.widget-question p{font-size:11px;color:#66716c}.widget-options{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:25px}.widget-options button{height:52px;border:1px solid #dcdad4;border-radius:7px;background:#fff;text-align:left;padding:0 14px;font:600 10px Inter}.widget-options button.selected{border-color:#0a6a46;background:#edf6f1;color:#07553b;display:flex;align-items:center;justify-content:space-between}.widget-actions{display:flex;justify-content:space-between;margin-top:32px}.widget-back,.widget-next{height:42px;padding:0 18px;border-radius:6px;font:650 10px Inter;display:flex;align-items:center;gap:7px}.widget-back{border:1px solid #d4d8d4;background:#fff;color:#52605a}.widget-next{border:1px solid #07553b;background:#07553b;color:#fff}.widget-footer{height:54px;border-top:1px solid #e8e6e1;display:flex;align-items:center;justify-content:space-between;padding:0 30px;font-size:8px;color:#75807b}.widget-footer span{display:flex;align-items:center;gap:5px}.widget-footer a{color:#0a6a46}.result-page{padding:0}.result-stage{width:620px;flex:1;margin:0 auto;display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:38px}.result-check{width:56px;height:56px;border-radius:50%;background:#e1f1e7;color:#0a6a46;display:grid;place-items:center;margin-bottom:14px}.result-stage h1{font-size:31px;line-height:1.12;letter-spacing:-.04em;margin:10px 0}.result-stage>p{font-size:10px;color:#6d7873}.result-price{width:100%;background:#edf6f1;border:1px solid #d4e8dc;border-radius:9px;padding:16px;margin:16px 0;display:flex;flex-direction:column}.result-price span{font-size:9px}.result-price strong{font-size:28px;color:#07553b;margin:4px 0}.result-price small{font-size:7px;color:#6c7772}.result-summary{width:100%;display:grid;grid-template-columns:1fr 1fr;border:1px solid #e3e1da;border-radius:8px;overflow:hidden;text-align:left}.result-summary div{display:grid;grid-template-columns:20px 75px 1fr;align-items:center;gap:6px;padding:11px;border-right:1px solid #eceae5;border-bottom:1px solid #eceae5}.result-summary div:nth-child(2n){border-right:0}.result-summary div:nth-last-child(-n+2){border-bottom:0}.result-summary span{font-size:8px;color:#6f7a75}.result-summary b{font-size:8px}.next-contact{width:100%;display:flex;align-items:center;justify-content:space-between;margin-top:16px}.next-contact>div{display:flex;align-items:center;gap:8px;text-align:left}.next-contact span{display:flex;flex-direction:column}.next-contact b{font-size:9px}.next-contact small{font-size:8px;color:#6d7873}.mobile-shell{width:100%;height:100%;background:#f7f6f2;display:flex;flex-direction:column;position:relative}.mobile-app-header{height:58px;background:#fff;border-bottom:1px solid #e3e1da;display:grid;grid-template-columns:42px 1fr 42px;align-items:center;padding:0 10px;flex:0 0 auto}.mobile-app-header>button,.mobile-app-header>div{border:0;background:transparent;display:flex;align-items:center;justify-content:center}.mobile-app-header>b{text-align:center;font-size:12px}.mobile-mark i{background:#0a6a46}.mobile-main{flex:1;padding:18px 16px 80px;overflow:hidden}.mobile-title span{font-size:8px;color:#0a6a46;font-weight:700;text-transform:uppercase}.mobile-title h1{font-size:24px;letter-spacing:-.04em;margin:6px 0 4px}.mobile-title p{font-size:9px;color:#6f7a75;margin:0}.mobile-attention{background:#fff;border:1px solid #e3e1da;border-radius:8px;margin-top:16px}.mobile-attention>div{height:58px;display:grid;grid-template-columns:8px 1fr 16px;align-items:center;gap:9px;padding:0 12px;border-bottom:1px solid #eceae5}.mobile-attention>div:last-child{border-bottom:0}.mobile-attention i{width:7px;height:7px;border-radius:50%}.mobile-attention i.hot{background:#d65752}.mobile-attention i.warn{background:#d89c42}.mobile-attention span{display:flex;flex-direction:column;gap:3px}.mobile-attention b{font-size:9px}.mobile-attention small{font-size:7px;color:#7b8581}.mobile-metrics{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.mobile-metrics article{height:82px;background:#fff;border:1px solid #e3e1da;border-radius:7px;padding:11px;display:flex;flex-direction:column}.mobile-metrics span{font-size:8px;color:#6d7873}.mobile-metrics strong{font-size:20px;margin:7px 0 2px}.mobile-metrics small{font-size:7px;color:#19814c}.mobile-section{margin-top:17px}.mobile-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}.mobile-section-head h2{font-size:13px;margin:0}.mobile-section-head a,.mobile-section-head span{font-size:8px;color:#0a6a46}.mobile-leads-list{background:#fff;border:1px solid #e3e1da;border-radius:8px}.mobile-lead{height:58px;display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:9px;padding:0 10px;border-bottom:1px solid #eceae5}.mobile-lead:last-child{border-bottom:0}.mobile-lead div{display:flex;flex-direction:column;gap:3px}.mobile-lead b{font-size:9px}.mobile-lead span{font-size:7px;color:#7b8581}.mobile-lead strong{font-size:13px}.mobile-lead small{font-size:7px}.mobile-task{width:100%;height:60px;border:1px solid #e3e1da;border-radius:8px;background:#fff;display:grid;grid-template-columns:28px 1fr 16px;align-items:center;gap:8px;text-align:left;padding:0 11px}.mobile-task>span{font-size:8px;color:#0a6a46;font-weight:700}.mobile-task div{display:flex;flex-direction:column;gap:3px}.mobile-task b{font-size:9px}.mobile-task small{font-size:7px;color:#7b8581}.mobile-bottom{height:64px;background:#fff;border-top:1px solid #deddd7;position:absolute;bottom:0;left:0;right:0;display:grid;grid-template-columns:repeat(5,1fr);padding-bottom:4px}.mobile-bottom button{border:0;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#77817d;font:600 7px Inter}.mobile-bottom button.active{color:#0a6a46}.leads-mobile-main{padding-top:12px}.mobile-search-row{display:grid;grid-template-columns:1fr 38px;gap:7px}.mobile-search-row .search-box input{width:100%}.filter-square{border:1px solid #e3e1da;background:#fff;border-radius:6px;display:grid;place-items:center}.mobile-tabs{height:42px;display:flex;gap:18px;align-items:center;border-bottom:1px solid #e3e1da;overflow:hidden}.mobile-tabs button{height:100%;border:0;background:transparent;font:600 8px Inter;color:#6b7671;white-space:nowrap;position:relative}.mobile-tabs button.active{color:#17201d}.mobile-tabs button.active:after{content:"";position:absolute;bottom:0;left:0;right:0;height:2px;background:#0a6a46}.lead-mobile-list{display:flex;flex-direction:column;gap:8px;margin-top:10px}.lead-mobile-card{background:#fff;border:1px solid #e3e1da;border-radius:8px;padding:10px}.lead-card-top{display:grid;grid-template-columns:30px 1fr auto;gap:8px;align-items:center}.lead-card-top>div{display:flex;flex-direction:column;gap:3px}.lead-card-top b{font-size:9px}.lead-card-top span{font-size:7px;color:#7b8581}.lead-card-top strong{font-size:15px}.lead-card-top small{font-size:7px}.lead-card-meta{display:flex;align-items:center;justify-content:space-between;margin:9px 0;padding:7px 0;border-top:1px solid #eceae5;border-bottom:1px solid #eceae5}.lead-card-meta>span:first-child{font-size:8px;display:flex;align-items:center;gap:5px}.lead-card-actions{display:grid;grid-template-columns:1fr 1fr 34px;gap:6px}.lead-card-actions button{height:30px;border:1px solid #dcdad4;background:#fff;border-radius:5px;font:600 8px Inter;display:flex;align-items:center;justify-content:center;gap:5px}.detail-mobile-main{padding-bottom:92px}.mobile-lead-head{display:grid;grid-template-columns:52px 1fr auto;gap:10px;align-items:center}.mobile-lead-head h1{font-size:16px;margin:0}.mobile-lead-head p{font-size:8px;color:#7b8581;margin:3px 0}.mobile-score{text-align:right}.mobile-score strong{font-size:22px}.mobile-score small{font-size:8px}.mobile-score span{display:block;font-size:7px;color:#157343;font-weight:700}.mobile-reasons{background:#edf6f1;border:1px solid #d6eadd;border-radius:7px;padding:8px 10px;margin:13px 0}.mobile-reasons div{display:flex;align-items:center;gap:6px;font-size:8px;color:#2e6147;padding:4px 0}.mobile-summary{background:#fff;border:1px solid #e3e1da;border-radius:8px;padding:0 10px}.mobile-summary .summary-row{grid-template-columns:18px 72px 1fr;min-height:42px;font-size:8px}.mobile-files{display:flex;gap:7px}.mobile-files .room-thumb{width:92px;height:58px}.file-count{width:58px;height:58px;border:1px solid #deddd7;border-radius:6px;display:grid;place-items:center;font-size:9px;color:#65706b;background:#fff}.mobile-sticky-actions{position:absolute;left:0;right:0;bottom:0;height:68px;background:#fff;border-top:1px solid #deddd7;padding:10px 12px;display:grid;grid-template-columns:40px 40px 1fr;gap:7px}.mobile-sticky-actions button{border:1px solid #b9c9c2;background:#fff;color:#07553b;border-radius:6px;font:650 9px Inter}.mobile-sticky-actions button.primary{background:#07553b;color:#fff;border-color:#07553b}.mobile-sticky-actions button.full{grid-column:1/-1}.builder-mobile-main{padding:12px 12px 78px}.builder-mobile-shell .mobile-app-header{grid-template-columns:42px 1fr auto}.builder-mobile-shell .mobile-app-header .btn{height:28px;font-size:8px}.mobile-builder-status{height:38px;display:flex;align-items:center;gap:10px;font-size:8px;color:#66716c}.mobile-builder-status span{display:flex;align-items:center;gap:4px}.mobile-builder-status button{margin-left:auto;border:0;background:transparent;color:#0a6a46;font:650 8px Inter;display:flex;gap:4px}.mobile-builder-tabs{height:38px;background:#fff;border:1px solid #e3e1da;border-radius:7px;display:grid;grid-template-columns:repeat(3,1fr);overflow:hidden}.mobile-builder-tabs button{border:0;border-right:1px solid #eceae5;background:#fff;font:600 8px Inter;color:#6e7974}.mobile-builder-tabs button.active{background:#e8f1ec;color:#07553b}.mobile-steps{background:#fff;border:1px solid #e3e1da;border-radius:8px;margin-top:9px;padding:6px}.mobile-step{height:48px;display:grid;grid-template-columns:28px 1fr 18px;align-items:center;padding:0 8px;border-bottom:1px solid #eceae5}.mobile-step>span{font-size:8px;color:#7b8581}.mobile-step div{display:flex;flex-direction:column;gap:3px}.mobile-step b{font-size:8px}.mobile-step small{font-size:7px;color:#7b8581}.mobile-step.active{background:#eaf3ee;border-radius:6px;border-bottom:0;color:#07553b}.mobile-step.warning{color:#8d5b1d}.add-mobile-step{height:38px;width:100%;border:0;background:transparent;color:#0a6a46;font:650 8px Inter;display:flex;align-items:center;justify-content:center;gap:5px}.mobile-step-editor{background:#fff;border:1px solid #e3e1da;border-radius:8px;margin-top:9px;padding:12px}.mobile-step-editor h2{font-size:14px;margin:6px 0 11px}.mobile-step-editor textarea{min-height:55px}.mobile-editor-links{border-top:1px solid #eceae5;margin-top:8px}.mobile-editor-links button{height:39px;width:100%;border:0;background:#fff;border-bottom:1px solid #eceae5;display:grid;grid-template-columns:1fr auto 16px;align-items:center;text-align:left;font:600 8px Inter}.mobile-editor-links b{font-size:7px;color:#0a6a46}.onboarding-mobile{background:#faf9f6}.onboard-mobile-head{height:60px;background:#fff;border-bottom:1px solid #e3e1da;display:flex;align-items:center;justify-content:space-between;padding:0 16px}.onboard-mobile-head .brand-mark i{background:#0a6a46}.onboard-mobile-head button{border:0;background:transparent;color:#0a6a46;font:600 8px Inter}.onboarding-mobile main{padding:20px 18px}.onboard-progress{font-size:8px;color:#69746f;margin-bottom:28px}.onboard-progress>div{height:4px;background:#e6e8e5;border-radius:3px;margin-top:7px}.onboard-progress i{display:block;height:100%;background:#0a6a46}.onboarding-mobile h1{font-size:26px;line-height:1.08;letter-spacing:-.04em;margin:9px 0}.onboarding-mobile main>p{font-size:9px;line-height:1.5;color:#66716c}.mobile-onboard-list{display:flex;flex-direction:column;gap:8px;margin-top:18px}.mobile-onboard-card{height:72px;border:1px solid #deddd7;background:#fff;border-radius:8px;display:grid;grid-template-columns:46px 1fr 18px;gap:9px;align-items:center;padding:0 10px;text-align:left}.mobile-onboard-card.active{border-color:#0a6a46;background:#f2f7f4}.mobile-onboard-card div{display:flex;flex-direction:column;gap:4px}.mobile-onboard-card b{font-size:9px}.mobile-onboard-card small{font-size:7px;color:#7b8581}.onboard-callout{margin-top:16px;background:#edf6f1;border:1px solid #d5e9dd;border-radius:7px;padding:10px;display:flex;gap:8px}.onboard-callout div{display:flex;flex-direction:column;gap:3px}.onboard-callout b{font-size:8px}.onboard-callout span{font-size:7px;color:#5d6a64}.onboard-mobile-actions{position:absolute;left:0;right:0;bottom:0;height:70px;background:#fff;border-top:1px solid #e3e1da;padding:12px 16px;display:grid;grid-template-columns:1fr 1.35fr;gap:8px}.mobile-widget{width:100%;height:100%;background:#fff;display:flex;flex-direction:column}.mobile-widget>header{height:60px;border-bottom:1px solid #e3e1da;display:flex;align-items:center;justify-content:space-between;padding:0 14px}.mobile-widget>header button{border:0;background:transparent}.mobile-widget .client-logo{width:32px;height:32px}.mobile-widget-progress{padding:14px 16px 0;display:grid;grid-template-columns:1fr auto;gap:6px;font-size:8px;color:#68736e}.mobile-widget-progress i{grid-column:1/-1;height:4px;background:#edf0ed;border-radius:3px}.mobile-widget-progress em{display:block;height:100%;background:#0a6a46;border-radius:3px}.mobile-widget main{padding:34px 20px 10px;flex:1}.mobile-widget h1{font-size:26px;line-height:1.08;letter-spacing:-.04em;margin:10px 0}.mobile-widget main>p{font-size:9px;color:#68736e}.mobile-widget-options{display:flex;flex-direction:column;gap:9px;margin-top:22px}.mobile-widget-options button{height:48px;border:1px solid #deddd7;background:#fff;border-radius:7px;padding:0 12px;text-align:left;font:600 9px Inter}.mobile-widget-options button.selected{background:#edf6f1;border-color:#0a6a46;color:#07553b;display:flex;align-items:center;justify-content:space-between}.mobile-widget>footer{height:66px;border-top:1px solid #e3e1da;padding:10px 14px;display:flex;justify-content:space-between}.mobile-widget>footer button{height:42px;border-radius:6px;padding:0 15px;font:650 9px Inter;display:flex;align-items:center;gap:6px}.mobile-widget>footer .back{border:1px solid #d1d6d2;background:#fff}.mobile-widget>footer .next{border:1px solid #07553b;background:#07553b;color:#fff}.privacy-line{height:32px;background:#f7f7f4;display:flex;align-items:center;justify-content:center;gap:4px;font-size:7px;color:#77817d}
'''

# Add screen markup
screens = [
    dashboard_screen(),
    leads_screen(),
    lead_detail_screen(),
    builder_screen(),
    rules_screen(),
    analytics_screen(),
    templates_screen(),
    installation_screen(),
    integrations_screen(),
    agency_screen(),
    settings_screen(),
    onboarding_screen(),
    widget_screen(),
    mobile_dashboard(),
    mobile_leads(),
    mobile_detail(),
    mobile_builder(),
    mobile_onboarding(),
    mobile_widget(),
]

HTML = f'''<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>{CSS}</style></head><body>{''.join(screens)}</body></html>'''
(ROOT / 'screens.html').write_text(HTML, encoding='utf-8')
(ROOT / 'styles.css').write_text(CSS, encoding='utf-8')

CAPTURES = [
    ('dashboard-desktop', '#dashboard-desktop'),
    ('leads-desktop', '#leads-desktop'),
    ('lead-detail-desktop', '#lead-detail-desktop'),
    ('builder-desktop', '#flows-desktop'),
    ('rules-desktop', '#flows-desktop:nth-of-type(5)'),
]

# IDs must be unique; rules and builder currently share flow id from shell. Fix IDs in final HTML.
HTML = HTML.replace('id="flows-desktop"', 'id="builder-desktop"', 1)
HTML = HTML.replace('id="flows-desktop"', 'id="rules-desktop"', 1)
(ROOT / 'screens.html').write_text(HTML, encoding='utf-8')

capture_ids = [
    'dashboard-desktop','leads-desktop','lead-detail-desktop','builder-desktop','rules-desktop',
    'analytics-desktop','templates-desktop','integrations-desktop','clients-desktop','settings-desktop',
    'onboarding-desktop','widget-desktop','widget-result-desktop',
    'dashboard-mobile','leads-mobile','lead-detail-mobile','builder-mobile','onboarding-mobile','widget-mobile'
]
# Installation also shares integrations id; replace second occurrence.
HTML = (ROOT / 'screens.html').read_text(encoding='utf-8')
HTML = HTML.replace('id="integrations-desktop"', 'id="installation-desktop"', 1)
(ROOT / 'screens.html').write_text(HTML, encoding='utf-8')
capture_ids.insert(8, 'installation-desktop')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1500, 'height': 1000}, device_scale_factor=1)
    page.set_content((ROOT / 'screens.html').read_text(encoding='utf-8'), wait_until='load')
    page.evaluate('document.fonts.ready')
    for sid in capture_ids:
        loc = page.locator(f'#{sid}')
        if loc.count() != 1:
            raise RuntimeError(f'{sid}: count={loc.count()}')
        loc.screenshot(path=str(OUT / f'{sid}.png'))
    browser.close()

# Contact sheet boards in the same editorial-spec style as the accepted reference.
FONT_REG = '/usr/share/fonts/opentype/inter/Inter-Regular.otf'
FONT_MED = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
FONT_BOLD = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
font_title = ImageFont.truetype(FONT_BOLD, 18)
font_sub = ImageFont.truetype(FONT_REG, 10)
font_label = ImageFont.truetype(FONT_BOLD, 9)
font_small = ImageFont.truetype(FONT_REG, 8)
font_num = ImageFont.truetype(FONT_BOLD, 10)

BG = '#f7f6f2'
TEXT = '#17201d'
MUTED = '#65706b'
GREEN = '#07553b'
BORDER = '#dfddd7'


def fit_image(path: Path, box: tuple[int,int,int,int], canvas: Image.Image):
    x,y,w,h = box
    img = Image.open(path).convert('RGB')
    img.thumbnail((w,h), Image.Resampling.LANCZOS)
    # white card behind
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle([x-1,y-1,x+w+1,y+h+1], radius=9, fill='#ffffff', outline=BORDER, width=1)
    ix = x + (w-img.width)//2
    iy = y + (h-img.height)//2
    canvas.paste(img,(ix,iy))


def board(title: str, subtitle: str, items: list[tuple[str,str,str]], filename: str, layout: str='grid'):
    c = Image.new('RGB',(1536,1024),BG)
    d=ImageDraw.Draw(c)
    d.rectangle([0,0,180,1024], fill='#fbfaf7')
    d.line([180,0,180,1024], fill=BORDER, width=1)
    # logo mark
    d.text((28,25),'Lorum',font=font_title,fill=TEXT)
    d.text((28,58),'SPECYFIKACJA UI',font=font_label,fill=GREEN)
    d.text((205,25),title,font=font_title,fill=TEXT)
    d.text((205,51),subtitle,font=font_sub,fill=MUTED)
    d.line([205,72,1510,72],fill=BORDER,width=1)
    # index
    yy=105
    for idx,(label,desc,_) in enumerate(items,1):
        d.text((28,yy),f'{idx:02d}',font=font_num,fill=GREEN)
        d.text((57,yy),label,font=font_label,fill=TEXT)
        d.multiline_text((57,yy+15),desc,font=font_small,fill=MUTED,spacing=2)
        yy += 75
    if layout=='grid4':
        boxes=[(204,92,645,410),(866,92,645,410),(204,530,645,410),(866,530,645,410)]
    elif layout=='hero':
        boxes=[(204,92,830,510),(1050,92,461,510),(204,630,645,320),(866,630,645,320)]
    else:
        boxes=[(204,92,645,410),(866,92,645,410),(204,530,645,410),(866,530,645,410)]
    for (label,desc,file),box in zip(items,boxes):
        fit_image(OUT/file,box,c)
        x,y,w,h=box
        d.rounded_rectangle([x+12,y+12,x+110,y+34],radius=4,fill='#ffffff',outline=BORDER,width=1)
        d.text((x+20,y+18),label,font=font_label,fill=TEXT)
    c.save(BOARDS/filename,quality=96)

board('Operacje i obsługa leadów','Dashboard, kolejka leadów, szczegóły i układ mobilny — bez przypadkowych kart.',[
    ('Dashboard','Priorytety, metryki i\nnastępne kroki.','dashboard-desktop.png'),
    ('Lista leadów','Tabela, filtry, statusy\ni szybkie działania.','leads-desktop.png'),
    ('Szczegóły leada','Źródłowe odpowiedzi, pliki,\nhistoria i obsługa.','lead-detail-desktop.png'),
    ('Mobile','Kompaktowa lista i szybki\nkontakt bez ściskania tabel.','leads-mobile.png'),
],'board-01-core-operations.png','grid4')

board('Budowanie procesu i reguł','Najważniejszy ekran produktu: trzy kolumny, rzeczywisty podgląd i kontekstowe ustawienia.',[
    ('Edytor procesu','Lista kroków, podgląd i\ninspektor kontekstowy.','builder-desktop.png'),
    ('Reguły','Logika IF/THEN, wycena,\nscoring i wynik.','rules-desktop.png'),
    ('Mobile builder','Układ drill-down zamiast\nściśniętych trzech kolumn.','builder-mobile.png'),
    ('Widget','Publiczny proces klienta\nna telefonie.','widget-mobile.png'),
],'board-02-builder-rules.png','grid4')

board('Analityka, wdrożenie i skalowanie','Moduły operacyjne potrzebne po publikacji procesu.',[
    ('Analityka','Lejek, źródła, urządzenia\ni właściwe empty states.','analytics-desktop.png'),
    ('Szablony','Realna zawartość procesu,\nnie ozdobna galeria.','templates-desktop.png'),
    ('Instalacja','Inline, popup, hosted link\ni WordPress.','installation-desktop.png'),
    ('Agencja','Klienci, klonowanie, limity\ni white-label.','clients-desktop.png'),
],'board-03-growth-delivery.png','grid4')

board('System, konfiguracja i ścieżka klienta','Ustawienia, onboarding, integracje oraz finalny wynik procesu.',[
    ('Ustawienia','Organizacja, dane, obszar\ni bezpieczne akcje.','settings-desktop.png'),
    ('Onboarding','Postęp, wybór szablonu,\nbez marketingowej karuzeli.','onboarding-desktop.png'),
    ('Integracje','Połączenia i dostawy\nwebhooków z retry.','integrations-desktop.png'),
    ('Wynik klienta','Przedział, disclaimer i\njasny następny krok.','widget-result-desktop.png'),
],'board-04-system-onboarding.png','grid4')

# mobile-only strip
c=Image.new('RGB',(1536,1024),BG); d=ImageDraw.Draw(c)
d.text((32,26),'Lorum — kluczowe widoki mobilne',font=font_title,fill=TEXT)
d.text((32,52),'Osobne kompozycje mobilne; nie desktop zwężony do 390 px.',font=font_sub,fill=MUTED)
files=['dashboard-mobile.png','leads-mobile.png','lead-detail-mobile.png','builder-mobile.png','onboarding-mobile.png','widget-mobile.png']
labels=['Dashboard','Leady','Szczegóły','Builder','Onboarding','Widget']
for i,(f,lbl) in enumerate(zip(files,labels)):
    x=30+i*250
    fit_image(OUT/f,(x,92,220,795),c)
    d.text((x,910),f'{i+1:02d}  {lbl}',font=font_label,fill=TEXT)
c.save(BOARDS/'board-05-mobile-suite.png',quality=96)

print(f'Generated {len(capture_ids)} screenshots and 5 boards in {ROOT}')
