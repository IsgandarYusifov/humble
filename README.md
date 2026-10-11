# Humble

The home of all ideas. A frontend MVP for a curated, pre-launch creator registry on Solana: original memecoin narratives, internet culture, art, agents and products.

This repository does not execute token launches, trading, wallet connections or on-chain origin verification. No fictional projects or verified listings are presented as live.

## Run locally

Requires Node.js. No package installation is needed.

```sh
npm run build
npm run check
npm start
```

Preview: http://127.0.0.1:3000/. Build output is in `out/`.

## Pages and visual editions

The original experimental edition is at `/`. The Horizon edition is at `/v2/`: a cinematic, independently animated horizon; warm neutral canvas; forest green and graphite story panels; consistent pill controls. Both editions provide Origin, For creators, About, Apply and Data pages. Footer links switch editions while keeping the current page.

Horizon references Solana and launch platforms as ecosystem context. A set of four illustrated ecosystem cards links to Solana, pump.fun, Raydium LaunchLab and Meteora using official brand artwork. These references do not imply partnerships, integrations or support for executing launches.

## Creator applications

Apply opens a full page with four steps: identity, story, launch and review. It requests:

- A PNG, JPG or WebP image, up to 5 MB, with local preview.
- Coin/project name, launch kind, ticker when planning a token, Solana network and category.
- One-line premise, narrative, public origin evidence and the creator's connection to the concept.
- Launch stage, canonical mint when one exists, optional timing and launch platform.
- Creator/team name, contact email, optional social links and an accuracy/authority confirmation.

The review shows the applicant's actual entries. Local validation checks image type/dimensions, ticker format, required fields and a 32-byte Base58 Solana address where applicable. It does not prove creator identity or mint authenticity.

The native multipart form forwards the image and application through [FormSubmit](https://formsubmit.co/documentation) to liquify.support@gmail.com. The provider's security check remains enabled. A branded return screen is not a signed delivery receipt. There is no Humble-owned application database. FormSubmit documents 30-day text archives; attachments are forwarded but not retained in its archive.

Values and uploads stay in memory while completing the form; no application data is written to browser storage or navigation URLs. A downloadable text copy excludes the image and does not submit the application. The only stored browser preference is Full/Calm decorative motion.

## Source structure

- `index.html`: shared shell and original homepage.
- `scripts/pages.mjs`: shared page content and application markup.
- `scripts/horizon-page.mjs`: Horizon homepage and edition rendering.
- `assets/horizon.css`: edition-scoped styling; original edition remains separate.
- `assets/horizon-scene.js`: ambient canvas animation, with reduced-motion support, offscreen pausing and a static fallback. No mouse interaction drives it.
- `assets/application.js` and `assets/application.css`: intake behavior and styling.
- `scripts/build.mjs` and `scripts/check.mjs`: static build and route/asset/syntax validation.

The project uses self-hosted fonts and Three.js for the original hero. Licensing files accompany those assets. The Nouns pixel artwork is a [CC0 culture reference](https://nouns.wtf/brand), credited in `assets/ASSET-CREDITS.txt`; it is not a Humble launch or partner. No Phantom media is copied.

## Deployment

The GitHub Pages workflow builds and checks the site on pushes to main. `HUMBLE_BASE_PATH` supports the `/humble` project path; local and Sites builds omit it. Example project-path check in PowerShell:

```powershell
$env:HUMBLE_BASE_PATH = '/humble'
npm run build
npm run check
Remove-Item Env:HUMBLE_BASE_PATH
```

Managed Sites hosting metadata lives in `.openai/hosting.json`. Build output, review captures and credentials are excluded from the public source.
