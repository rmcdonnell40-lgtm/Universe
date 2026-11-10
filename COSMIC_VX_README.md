# COSMIC VX — Genesis Development Branch

COSMIC VX is a **separate desktop-first experimental build** expanding the existing V20 simulator.

## Branch
`feature/cosmic-vx-genesis`

## Launcher
`Universe_Masterclass_VX.html` (must be served through an HTTP server on the same origin as all assets; not directly as `file://`).

## Implemented foundations
- New Game, Load Game and Developer menu layered over the existing COSMIC masterclass artwork.
- Multiple Explorer saves with distinct profile, resources, laboratory and mission state.
- Local autosave on important actions, save exports and validated imports. LocalStorage is the initial persistence backend; larger saves may later move to IndexedDB.
- A separate Developer save and workbench for sterile, seeding and microbial life plus ingredient/culture testing.
- Existing 1000-planet galaxy, ASTRA-01, 6 continents, Laboratory, Species 001 Life page, 4 male and 2 female portraits.
- Planet scan and resource progress persist per Explorer. Last view and galaxy seed restore; planets can be bookmarked and searched.
- Seven event-driven Chapter 1 missions that reflect **actual** scans, ingredients, Laboratory creations, seeding and Life-page visits.
- Cinematic three-part introductory prologue, replayable from Journal.
- The Genesis Directive (natural vs guided research) with a corresponding change to the fictional microbial-growth calculation.
- Expanded Journal entries and mission checklist. Initial cell population is estimated using time and carrying-capacity limits.

## Unfinished / known limitations
- This is **not** a completed V21/VX release: still requires live desktop browser playthroughs and compatibility testing.
- The full story, advanced ecological systems, cloud accounts, and future chapters are not built.
- Browser-local save storage can be cleared by the user/browser. Use Export Save as a backup.
- New games do **not** silently import progress from older V20 saves, by design.
- The Developer button is not a security boundary; this development branch is not intended as a public restricted administrative interface.
- GitHub Pages currently serves the `main` branch. This development branch's files are **not yet live on Pages**.
- The first environmental model is a simple deterministic **gameplay approximation**, not a real biological simulation.

## Manual desktop QA
1. Start VX at `Universe_Masterclass_VX.html`; confirm the menu and its three options appear.
2. Create a New Game, register a male or female Explorer, and verify the Profile tab displays a locked card.
3. Survey and collect resources on a planet. Verify the Journal and inventory update, then reload the page and use Load Game.
4. Collect all seven ingredients, place each in the petri dish, cultivate First Life Culture and seed ASTRA-01.
5. Confirm seeding remains 10 minutes across reload and Life unlocks only on completion.
6. Open the Life page, choose a Genesis Directive, and verify Journal records the choice.
7. Start a second New Game and confirm the planet is sterile and the first Explorer's progress remains unaffected.
8. Test Developer controls without modifying regular saves; export/import a slot.
9. Bookmark a planet, switch systems, reload, search bookmarks and revisit.
10. Inspect browser console for errors and watch for unexpected render-loop/iframe behaviour.

Run static checks (Node.js only): `node COSMIC_VX_SelfTest.mjs`.

## Release discipline
Older V20 files and the public `index.html` are **not changed** on main. Review and test VX in a development environment before merging. Do not point the public homepage to an untested VX build.
