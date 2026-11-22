# Changelog

## 1.0.0 - 2026-11-21

First stable release of CR45H HUD for Sauce for Zwift.

- Metric HUD with Stacked, Inline and Side layouts; Plate, Cards and Open surfaces; configurable arrangement, labels, corners and opacity.
- Adjustable card spacing and metric widths, independent of text size.
- Draft watts-saved metric with an optional ride-average second line.
- Circular power-up countdown driven by Sauce's active power-up timer.
- More clearance between power-zone stripes and second lines; corrected clipped text descenders.
- Standalone or docked Ride Progress Bar with route progress, segment markers and configurable labels.

The experimental Ride On sender feature is not included.

Install by extracting the cr45h-hud folder into Documents/SauceMods. Fully quit Sauce, including the system tray, and restart it after updating.

Development history follows. Older 0.1.x entries are chronological.

## 0.2.0

Cleanup and the segment approach cue. Removed settings and code nothing used (old compact-text, name-length and segment-display keys still migrate from saved settings), moved the browser mockups to design-history/ so they no longer ship in pages/, swap distance follows the Units setting, a free ride without a route shows "No route", new Lap label ("Lap 2", or "Lap 2/3" in events using Sauce getEventSubgroup laps), and Highlight upcoming segment (pulse in the last 500 m, solid tag while riding the segment, brighter marker). User-facing README; history moved here.

## 0.4.0

Metric HUD layout engine and settings rework. Sizing: every normal cell is one unit wide on both sides of a split, the large first metric is Large size units wide and scales only its number and unit, and all cells in a row share one height (label at the top, number and second line at the bottom). The Power-up cell is a square as tall as the row and never takes the large slot. Rows that do not fit split into balanced rows. Settings: Style and Boxes became Layout (Stacked, Inline, Side) and Surface (Plate, Cards, Open); Open draws no surface and no lines in every layout. Tiles are now Inline + Cards, Rail is Inline + Plate without the blue top edge, Open is Side + Open. Saved settings migrate once (Boxes off becomes the Open surface). New installs start on Stacked + Plate. The HUD has its own Corners setting, so rounded corners no longer reach the docked progress bar; the bar keeps its own. Second lines: one master switch plus one switch per metric (W/kg and "to go" stay on, averages off); Ride time shows the clock time. Added tests (tests/config.test.mjs, tests/layout/).

## 0.3.11

First metric large is now its own box. It scales as a whole (text, icon, padding, width) by the new Large size setting (1 to 3, default 1.6), instead of taking two equal columns. The other metrics keep their normal size and sit centered beside it, or in rows beside it with Rows. This also makes the Power-up icon grow properly when Power-up is first.

## 0.3.10

First metric large now enlarges the Power-up icon (and the placeholder bolt) when Power-up is the first metric. Before, the cell got wider but the icon stayed the same size. The icon scales per look and arrangement, in step with the large number in the other cells.

## 0.3.9

Rail and Tiles were still too tall when the Power-up cell showed its placeholder bolt: the bolt's height was measured in its own enlarged font (about 4 em). It now has a plain size, and the row height matches a row with no Power-up cell in all four looks.

## 0.3.8

Fixed extra height in every box style. The Power-up cell's placeholder bolt (shown when no power-up is held) had a minimum height measured in its own enlarged font, about 77 px, and every cell in the row stretched to match it. The power-up icon is now a fixed 3 em, so the cell no longer sets the row height.

## 0.3.7

Arrangement rework, separate docked-bar size, cleaner text outline. Arrangement is now One row, Rows or Column. "Two groups with a gap", "Split to the window edges" (One row only) and "First metric large" (any arrangement) are options; saved old arrangements convert once. A large first metric takes two columns and counts toward fitting the window. Two groups share the width in proportion to their columns. The zone stripe no longer touches the W/kg line in Cells and Open. New Progress bar text size sets the docked bar on its own; Text size now sizes the metrics only. The text outline is a stroke behind the letters with a soft glow instead of eight offset shadows, thinner on small text, so letter edges stay clean. Open cells need a wider minimum (9 em) and other cells 7.2 em before rows split.

## 0.3.6

Mod id changed from farrow-cohesive-overlay to cr45h-hud. Sauce treats this as a new mod: enable CR45H HUD under Mods and add its windows again (the old entry can be removed). Served at /mods/cr45h-hud/. Settings are stored by each window's settings key, not the id, so they should carry over; check after updating.

## 0.3.5

Renamed to CR45H HUD (author cr45hmurphy). The internal mod id is unchanged, so saved windows and settings carry over. Test package is now dist/cr45h-hud-<version>.zip with a cr45h-hud folder.

## 0.3.4

Metric HUD cleanup. Averages are off by default: the single Second line checkbox became three (W/kg under power, Averages, "To go"), and a second line only takes room when something has data. New Boxes checkbox removes the backgrounds and their outlines in Cells, Tiles and Rail (text gets the outline setting; Rail keeps its dividers); a saved box opacity of 0 converts to Boxes off. The docked progress bar now has every setting the Ride Progress Bar window has (same generated form, shown only while a bar is docked). Settings tidied: Box opacity, Corners, Text outline, FTP fallback and the extra-line options appear only when they apply. Rail keeps a wider minimum cell so labels no longer clip.

## 0.3.3

Metric HUD Power-up cell is icon-only: the icon fills the box, with no title, name or "Ready". A green outline shows while a power-up is in use. New Power-up name setting (off by default) adds the name, plus seconds left while active. Dim bolt when nothing is held or there is no Game Connection.

## 0.3.2

Metric HUD Power-up cell now reads what Sauce's own PowerUp grid field reads (gameState): the power-up you are holding ("Ready", with its icon) and the one in use ("Active" with seconds left). Requires Game Connection on in Sauce's settings; without it the cell shows a dash. Replaces the 0.3.1 version, which read only the active power-up and could not show the held one.

## 0.3.1

Metric HUD: a Power-up cell (the power-up you are using right now; Zwift does not report the one you are holding) and narrow-window handling. Cells keep a minimum width; when a row does not fit it splits into balanced rows, and two groups or split-to-the-edges stack instead of squeezing. Tiles wrap on their own.

## 0.3.0

Quiet Strip becomes the Metric HUD (same window id, so saved windows and metric lists carry over). Four looks (Cells, Open, Tiles, Rail), six arrangements (one row, two groups, split to the window edges, rows, first metric large, column), labels as text, icons or none, an optional second line (W/kg, averages, "to go" for the route or event), power zone color as a stripe or on the number (Zwift FTP first, setting as fallback), box opacity and corners. The Ride Progress Bar can be docked above or below the metrics; it stays available as its own window. Text size no longer follows window size in the HUD.

Ride Progress Bar: a Middle label (Route name, Next segment, Lap or Nothing), centered between Left and Right, so route, lap and next can show together; the swap applies to every slot and a label never shows twice. In the compact bar the in-segment highlight is colored text with a small square instead of a solid tag, so it no longer covers the segment markers. Fixed the compact bar collapsing after the HUD change.


Original prototype: one Sauce mod, three configurable metric layouts and a standalone Power Zone Bar. No community implementation was copied.

## Preview

From this folder run `python -m http.server 8765`, then open http://localhost:8765/pages/demo.html. Each style has its own Customize panel and saved choices. Demo settings are separate from live settings. Synthetic data is explicitly marked DEMO.

## Test in Sauce

Copy this entire folder into Documents/SauceMods/cohesive-overlay (use the Documents folder your Sauce installation actually uses). Restart Sauce, enable Cohesive Overlay Lab under Mods, then add Quiet Strip, Focus Dashboard, Metric Clusters, or Power Zone Bar. This prototype has not been installed or live-tested. Windows follow the watched rider.

## Controls and limits

Select/reorder fields, change metric/imperial units, text size, background opacity, FTP, and optional bars. Live preferences use Sauce window-scoped storage. Browser mockups retain their independent demo-only localStorage. Opacity affects the background only. Live windows use Sauce common.css, standard titlebar/hintbar markup and initInteractionListeners: right-click reveals native controls. The gear opens a Sauce child settings window through the standard child-window link. Settings use Sauce settingsStore and initSettingsForm with a matching data-settings-key on parent and child; separate window IDs receive separate settings. The original browser mockups remain under mock-*.html for design comparison only.

Current power zones use explicit editable FTP (initially 250 W) and boundaries 55/75/90/105/120/150 percent, not Sauce's configured zones. Time observed in zones is window-local, not full-ride time: it excludes intervals over 5 seconds and resets on watched rider change, ride-time rollback, FTP change, or window reload. Independent windows opened at different times can have different totals. A missing fresh sample shows unavailable values. No timestamps from different clock domains are combined.

The optional progress bar is an explicit total-ride-distance goal (initially 40 km). It does not detect event/route finishes. Event progress and Sauce zone integration are future work after live payload validation. No game controls or athlete writes are used.

## Validation

Run `node --test tests/model.test.mjs`. Use browser preview to review the layouts. Live API and transparent native-window behavior still require testing in Sauce.

## 0.1.1 framework correction

Reviewed O101 Live Data, Hill Radar and the running Sauce installation at localhost:1080 (common.mjs, common.css, watching.html), plus SETTINGS-AND-STATE.md and IMPLEMENTATION-PATTERNS.md. Removed the live modal and custom header. No global injection or game actions added. Seven model/settings tests and structural checks pass. Native drag, child settings and restart persistence still need UI validation; the computer-use app approval timed out. Existing raw-localStorage prototype preferences are not migrated into Sauce window settings.

## 0.1.2 independent pieces

Metrics, Ride Progress Bar and Power Zone Bar are separate Sauce windows in one mod. Metric windows no longer display either bar, even when old preferences enabled them. Add Ride Progress Bar from the window menu after restarting Sauce to refresh its manifest. Progress remains a ride-distance goal. Metric settings include Columns per row and up/down field ordering, giving explicit row-major positions instead of width-dependent wrapping. Existing field selections remain intact. Browser-only mockups still illustrate the original visual exploration and are not the current native test build.

## 0.1.3 standard Window Settings

The parent project MOD-WINDOW-FRAMEWORK-REQUIREMENTS.md is the required baseline. Live windows now use theme override, fontScale (migrated from scale), standard solidBackground/backgroundColor/backgroundAlpha controls, and keepControlsVisible (on by default for testing). Removed the full-window themed background and custom dark container; individual cards follow Sauce theme variables. Earlier opacity settings no longer control live panels. Native visual verification remains pending.

## 0.1.4 auto-hide clarification

Removed the keep-controls-visible setting and adapter behavior; the user clarified that comment was unrelated. Standard Sauce right-click/blur visibility is restored. Old saved keepControlsVisible values are ignored.

## 0.1.5 text cleanup

Fixed mojibake introduced by a Windows-codepage read/write in earlier edits. Removed the normal-riding LIVE/watched rider status; waiting/error messages remain. JavaScript UI symbols use Unicode escapes.

## 0.1.6 opaque settings pages

All five native settings pages now load dedicated settings.css instead of overlay.css. Their Sauce theme backgrounds stay opaque and settings content scrolls independently of the transparent riding overlay. Native visual confirmation remains pending.

## 0.1.7 compact responsive metrics

Replaced stretched grid cells with intrinsic-width pills and resize-driven font fitting. Focus keeps its emphasized first metric. Removed all footer status text, including waiting/error messages; missing data remains a placeholder and diagnostics go to console. Added a read-only watched-rider snapshot on startup alongside the existing subscription; this does not establish the cause of missing live samples. Native visual and telemetry confirmation remain pending.

## 0.1.8 route progress

Replaced manual distance-goal progress with state.routeDistance/routeEnd, computed native route geometry and route.segments offsets. Prelude is route.meta.leadinDistance on the first lap or weldDistance on subsequent laps. Shows lead-in/connector, remaining route distance, segment ranges/start/end and optional names. No custom segmentData dependency. Async route loads discard outdated responses and retry failed metadata after 15 seconds. Current-lap display is not a full event-distance model. Marker alignment still needs live visual confirmation. Reduced rounding; see DESIGN-HANDOFF.md for the future visual pass.

## 0.1.9 native bar sizing

Fixed inherited Sauce flex-direction: column combined with align-items: center, which made the progress panel shrink to its text width. Explicit row axis and bar stretch now fill the native content area in both dimensions, leaving 4px padding. Applies to progress and zone windows; settings stylesheet stays separate. Native visual confirmation pending.

## 0.1.10 bar scaling

Progress/zone text now uses fontScale and both viewport dimensions. Bar thickness is an independent setting (2–40px, capped to window height). Internal padding/spacing follows text size. Shared 4px native-content inset remains explicit for all riding windows. Lead-in visibility and multiple-segment routes are noted for the next live test; geometry was not exaggerated.

## 0.1.11 cell progress bar

Progress bar redrawn after O101's cell structure: an optional prelude cell (hatched lead-in or lap connector) plus one route cell for the current lap, each filled independently, labels inside the cells, remaining distance as the heading figure, amber segment strips along the bottom of the route cell, white rider and finish marks, square corners. Segment names sit below, aligned to segment starts. Lap cells for a multi-lap event are NOT drawn: the total lap count is not part of routeEnd. Bar thickness is now a minimum (cells grow to fit their label). All riding windows now inherit Sauce's font (Saira) instead of Segoe UI. Design source: the Sauce Mods design canvas, direction D. Native visual confirmation pending.

## 0.1.12 progress appearance options

Ride Progress Bar settings: corners (square default, soft, rounded), density (standard default, compact one-row), rider marker (bar default, notch, fill edge only), segment display (next only default, below, inside the bar, off), segment text (type: Sprint/Climb/Loop, or shortened name with adjustable length), and segment colors (game, lifted, colorblind-safe). Segment type is inferred in pages/segment-types.mjs from Sauce's segment `loop` flag and name keywords (sprint/prime, KOM/climb/etc.); anything unrecognized is a neutral Segment. Loops draw as a thin strip along the top; sprints and climbs along the bottom. "Next only" shows the next segment, or how far is left in the current one. Old showSegments=false saves map to segment display Off. Native visual confirmation pending.

## 0.1.13 legibility and sizing

Text outline setting (off, light, normal default, heavy) adds a dark outline to all progress text and a thin dark edge to the bar, for transparent backgrounds over bright scenery. Next only shows the full segment name; name length applies to Below and Inside only. Progress text size now comes from Font scaling alone (16 px x scale) instead of window width/height, and the panel hugs the top of the window: resizing the window adds or removes empty space without rescaling text. Short segments draw at least about half a character wide so 200 m sprints stay visible on long routes. Secondary text sizes increased. Checked in a browser harness with synthetic data, not yet in Sauce.
Segment types (0.1.13): Sauce getSegments and Zenmaster's exported segmentData both carry name, id and archId but no type. Name keywords plus the loop flag classify all but eight segments across courses 2-18; archId did not resolve those, so 23rd St. (climb), Broad St. (sprint), Fuego Flats (sprint) and UCI Worlds (loop) are listed explicitly. Bologna TT stays neutral.

## 0.1.14 segment display simplified

Segment display is now Next only (default), Indicators only, or Off. Names below or inside the bar were removed; saved Below/Inside choices become Indicators only. Next only shows the full segment name or its type. Name length setting removed. Thin-line and compact-with-Next layouts are being designed on the canvas (section G) and are not built yet.

## 0.1.15 progress styles

Style setting: Standard, Compact (one row) or Thin line. Compact keeps text inside the bar so long route names never narrow it, with three text options: route name; route name and Next; or route name that swaps to Next once a segment starts within 2 km (canvas H: C, D, E). Thin line has six layouts: bare, text at the ends, text above, raised segment blocks, tick rider, and no loops (canvas G). Next now prefers sprints and climbs over loops, because a loop can span the whole lap and hide them. Checked in a browser harness with synthetic data, not yet in Sauce.
Compact text starts inside the route cell, after the lead-in or connector cell.

## 0.1.16 compact text and distance readout

Compact text options: route name; route name left with Next right; Next left with route name right; Next only; none; or the swap option (route name, switching to Next within 2 km of a segment). New Distance shown setting for every style: distance left (km or mi), percent complete, both, or none. With none, the compact bar takes the full width. Percent is of the current route/lap including the lead-in, matching the bar fill. Checked in a browser harness with synthetic data, not yet in Sauce.

## 0.1.17 one text model for every style

Settings regrouped into Style, Text and Segments, and the same Text settings now drive Standard (heading above the bar), Compact (inside the bar) and Thin line (beside or above the line): Left text and Right text (Route name, Next segment or nothing), Swap route name for Next near a segment with an adjustable swap distance (default 2 km; also applies while inside a segment), and Distance shown at the far right. Segments: "Next and indicators" (Both, Next only, Indicators only, Off), Next text color (segment color or white), Show loops. The plain "Route" label inside the Standard bar is gone; Lead-in, Connector and Lap N labels remain. The thin-line rider now follows the Rider marker setting (bar, notch, none); the separate Tick rider and No loops line layouts were folded into Rider marker and Show loops. Old saved settings migrate (Next only -> Both, compact text choices -> left/right text, tick -> beside, no loops -> Show loops off). Sauce caches mod code: fully quit and restart Sauce after updating.

## 0.1.18 Show indicators

"Next and indicators" replaced by a Show indicators checkbox (the colored marks on the bar). Next text now appears only where Left text or Right text (or the swap) asks for it. Old choices migrate once: Off -> indicators off and Next slots cleared; Next only -> indicators off; Indicators only -> Next slots cleared; Both -> unchanged.

## 0.1.19 Text position

Text position setting for Standard and for Thin line with text on its own row: Above the bar (default, unchanged), Below the bar, or Split (left text and distance above, right text below; with the default text this is route name and distance above, Next below, the original Standard layout). Compact always keeps text inside the bar.

## 0.1.20 settings cleanup

Ride Progress Bar settings rewritten for plain language and regrouped as Window, Bar, Labels and Segments. Renames (stored keys unchanged, so saved settings carry over): Font scaling -> Text size, Style options -> Full bar / Compact bar / Thin line, Rider marker -> Your position, Bar thickness -> Minimum bar height, Left/Right text -> Left/Right label, Text position -> Label row, Distance shown -> Progress readout, Show indicators -> Segment markers, Indicator colors -> Marker colors, Show loops -> Include loops, Next text -> Next segment shows. Settings that do not apply to the current choices are hidden (data-show-when in progress-settings.html, evaluated in settings.mjs): line layout only for Thin line, bar height and corners only for bars, label row only for Full bar or a line with labels on their own row, Next options only when a label shows the next segment, marker colors only with markers on. The unused metric picker heading no longer appears on this page.

## 0.1.21 thin-line position bar

Fixed: with Thin line set to Line only or Labels on their own row, the line collapsed to 0 px tall, so the Bar and Notch position markers (which span the line's height) disappeared while the fixed-height finish mark still showed. Labels beside the line were unaffected.

## HUD sizing and spacing

Added Card spacing (0-40 px) and Card / plate cell width (0-400 px; 0 keeps automatic sizing) under Look alongside the Surface settings. Width is independent of text size, applies to each metric, and preserves the large-metric multiplier and narrow-window wrapping. Plates follow the combined metric widths and keep continuous dividers. Increased space below second lines so the power zone stripe clears W/kg text in Stacked and Side layouts.

## Power-up countdown

Replaced the green active-power-up highlight with Sauce's circular white-to-grey countdown sweep, using the same activePowerUpEnd timestamp as its PowerUpField. The animation keeps its original start across HUD redraws and works with the optional power-up name hidden or shown. Updated the settings description and added deadline/reset tests.

## Draft metric and second-line spacing

Added Draft to the selectable Metrics list, showing current watts saved from Sauce state.draft. Added an optional Draft (average) second line, off by default, including valid zero-watt averages. Existing metric selections stay unchanged. Increased second-line line height and vertical padding so descenders such as the g in avg and W/kg are not clipped.
