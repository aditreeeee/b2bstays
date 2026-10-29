# B2BStays – Business Growth Platform Website

Marketing site for the B2BStays Hotel Portal (hotel and travel business management software). It is **not** a consumer booking site.

**Stack:** HTML5, CSS3, vanilla JavaScript, Bootstrap 5.3.3 and Bootstrap Icons (CDN), inline SVG. Optional enquiry backend in core PHP + MySQL. No build step, no Node.

## Run it
Open `index.html` in a browser, or serve the folder (`php -S localhost:8000` if PHP is installed). Bootstrap, icons and the Inter font load from CDNs, so an internet connection is needed (self-host them for production).

## Pages
| File | Content |
|---|---|
| `index.html` | Hero + CTAs, module overview, **interactive SVG capability map** (accordion cards on mobile), **three clickable SVG flows**, calculator teaser, claim policy |
| `modules.html` | 8 module sections: Business problem → Software capability → Improved workflow → Business outcome → Measurement; "Shown in portal" vs "Proposed" lists |
| `solutions.html` | Six stakeholder sections + three before/after workflow comparisons |
| `calculator.html` | Illustrative revenue scenario calculator (3 business types), formulas, definitions, limitations |
| `contact.html` | Enquiry form (Request a Demo / Explore Modules / Discuss Requirements / revenue). `?topic=` pre-selects the purpose |

Code: `assets/css/style.css`; `assets/js/` – `data.js` (module + flow content), `mindmap.js`, `flows.js`, `calculator.js`, `form.js`, `main.js`; `api/` – `enquiry.php`, `config.sample.php`, `schema.sql`, `.htaccess`.

## Accuracy policy
- **No screenshots were available in the project folder when this was built.** Module names come only from the module list in the brief. Everything marked "Shown in portal" is a name from that list; nothing else is claimed as existing.
- Ideas not in that list (e.g. receivables ageing report, supplier scorecard) are labelled **Proposed**.
- Outcomes are phrased as possibilities ("potentially"). No testimonials, customer counts or growth percentages. No private data.
- Hero panel and chart are decorative shapes with no data.
- **Please verify in the live portal** the items flagged "To confirm" (e.g. whether a quote records confirmed/lost, utilization report, overdue report, Vendor Management screens, corporate-travel fit).

## Calculator model (per month)
`GBV = bookings × avg value` → `Pass-through = GBV × %` → `Recognized revenue` = GBV − pass-through (principal) or gross-margin amount only (agent/net basis) → `Gross margin = revenue − cost borne` → `Contribution = gross margin − GBV × commission %` → `Net profit = contribution − fixed overhead`. Money collected for others (taxes, supplier money on net basis) is shown separately and excluded from revenue. Default inputs are placeholders, not benchmarks. All maths runs in the browser.

## Enquiry backend (optional)
1. Run `api/schema.sql` in MySQL.
2. Copy `api/config.sample.php` → `api/config.php`, fill DB credentials (optionally `notify_email`).
3. Serve over PHP (Apache/nginx). Validation is server-side too, uses PDO prepared statements, a honeypot field and a 5/hour/IP throttle.
Without this, the form validates but shows a "service not reachable" message on submit.

## Tests performed
- Calculator logic in headless Edge: 37 checks (revenue + on-behalf = GBV, margin chain identities, known hotel net profit, 100% caps, agent net-basis revenue) – all pass.
- Rendered every page headless: 8 map nodes, 8 mobile accordion cards, flow nodes, calculator table/KPIs/chart present; no script errors in console.
- Static link/anchor check across all pages: 0 broken.
- Visual check of desktop and 390px layouts; found and fixed horizontal overflow on home/contact and clipped calculator buttons.
- **Not done:** PHP/MySQL endpoint (no PHP installed here – untested), real-device and cross-browser testing, screen-reader testing, Lighthouse.

## Integrations still to connect
- PHP + MySQL (and optional mail) for the enquiry form; spam protection (e.g. CAPTCHA) for production.
- Real contact details, domain, canonical/OG URLs and OG image, favicon, privacy policy.
- Analytics, and live portal demo link/screens (sanitised, no customer data).
- Self-hosted Bootstrap/fonts with SRI hashes.
