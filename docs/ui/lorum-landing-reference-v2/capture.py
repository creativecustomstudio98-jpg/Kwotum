from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'screenshots'
OUT.mkdir(exist_ok=True)
html = (ROOT / 'index.html').read_text(encoding='utf-8')
css = (ROOT / 'styles.css').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="styles.css" />', f'<style>{css}</style>')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for name, width, height in [
        ('desktop', 1536, 1000),
        ('mobile', 390, 844),
    ]:
        page = browser.new_page(viewport={'width': width, 'height': height}, device_scale_factor=1)
        page.set_content(html, wait_until='load')
        page.evaluate('document.fonts.ready')
        page.screenshot(path=str(OUT / f'lorum-landing-{name}-full.png'), full_page=True)
        for board in range(1, 5):
            locator = page.locator(f'.board-group-{board}')
            locator.screenshot(path=str(OUT / f'lorum-board-{board}-{name}.png'))
        page.close()
    browser.close()
