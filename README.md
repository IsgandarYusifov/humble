# Humble

A complete frontend-only pre-launch website. The current experimental visual direction combines muted lavender and charcoal editorial composition, a custom chrome sculpture, an interactive idea field, origin context, and creator onboarding. No invented projects, creators, badges, mint addresses, metrics, or testimonials are included.

## Run

Run `npm run build`, `npm run check`, then `npm start`. Preview: http://127.0.0.1:3000/. No dependency installation is required; Inter and the licensed Three.js r186 renderer are self-hosted.

## Pages

- `/`: hero, pre-launch registry, idea field, manifesto, FAQ, and application invitation.
- `/origin/`: the intended origin registry, evidence context, and limits.
- `/creators/`: first-wave creator guidance, the actual email-draft application flow, and FAQ.
- `/about/`: the broad Humble thesis, current stage, and longer-term direction.
- `/apply/`: full-page creator application, category prefill, email/text drafts, and inline clear confirmation.
- `/data/`: factual notes on application drafts, local effects preference, and current interface behavior.
- `/404.html`: a way back to Humble. The local preview also serves it for unknown routes.

Inner pages share the shell from index.html; scripts/pages.mjs provides their page content and metadata. scripts/build.mjs renders the static output to out/. scripts/check.mjs validates internal routes, fragment links, assets, document IDs/headings, and source syntax.

## Behavior and scope

Every Apply link opens the standalone /apply/ page. Its form prepares an email draft for liquify.support@gmail.com or downloads a text draft. The visitor reviews and sends it through their own email app. There is no application backend or persistent submission storage. Choosing a creative category in the idea field prefills the application category via a whitelisted query key. Application entries are not included in navigation URLs. Native FAQ disclosures and navigation work independently of the WebGL artwork.

The registry is preparing its first cohort. This site does not execute token launches, trading, wallets, or origin verification. Current-state notes distinguish the intended registry from live product capabilities. Data notes describe this interface; they do not invent a company-wide privacy policy.

Effects: Full / Calm is available in every page header. Calm stops decorative motion and pointer effects and hides CRT texture. Device reduced-motion preferences automatically select Calm. The effects preference is the only value this interface writes to local browser storage. The WebGL scene pauses when hidden or offscreen, caps painting at 60 fps, and caps pixel ratios. Pointer tilt applies only in Full mode on fine-pointer devices. The hero has a CSS sculpture fallback.

The existing Site identity and private audience are retained in .openai/hosting.json. Build output and review artifacts are ignored by Git.

## GitHub Pages

The public GitHub repository keeps all editable source and the self-hosted assets. The Pages workflow builds and verifies `out/` on every push to `main`, then deploys it. Enable Settings > Pages > GitHub Actions once. `HUMBLE_BASE_PATH` uses the Pages configuration output, so both project URLs and root-domain hosting work. For a local project-path build, set `HUMBLE_BASE_PATH=/humble` before `npm run build`; normal local and Sites builds omit it. No credentials or paid services are required by this frontend.
