# Jeugdland 75 jaar — Zomerfeest

Deelbare, mobile-first event-site voor het 75-jarig jubileum van Jeugdland.

**Zaterdag 22 augustus 2026 · 14.00–19.00 · Theemsplein 22, Haarlem**

🔗 Live (staging): https://dspbrg.github.io/jeugdland-zomerfeest/

## Stack
Statische site — HTML + CSS + vanilla JS, geen build-stap.

- `index.html` — de pagina
- `assets/css/style.css` — styling (mobile-first, kleur-fade, diamant-animaties)
- `assets/js/main.js` — countdown, .ics-agendaknop, parallax + random diamant-float
- `assets/img/` — brand-SVG's uit Figma + `og-image.png` (WhatsApp-preview)
- `assets/fonts/` — Block Berthold Condensed (display-font)
- `og.html` — template waaruit `og-image.png` wordt gerenderd

## Lokaal draaien
```bash
python3 -m http.server 8000
# open http://localhost:8000
```
