# Data Science with Python - Word Search (React)

Finished game in one file: `standalone/index.html` (double-click to play, no install).

## Put it online for free, with a shared leaderboard
1. **Backend (Google Sheet, free)**
   - Create a Google Sheet -> Extensions > Apps Script.
   - Paste everything from `backend/Code.gs`, Save.
   - Deploy > New deployment > Web app: Execute as *Me*, Who has access *Anyone*. Authorize.
   - Copy the Web app URL (ends with `/exec`).
2. **Connect the game**
   - Open `standalone/index.html` in Notepad / VS Code.
   - Near the top find `scoreApiUrl: ""` and paste the URL between the quotes. Save.
   - (Optional) change `requireRollNo: false` to `true`.
3. **Publish (GitHub Pages, free)**
   - New public repository -> upload `index.html` -> Settings > Pages > Deploy from branch `main` / root.
   - Share the link it shows (https://YOUR-NAME.github.io/REPO-NAME/).

Every finished puzzle becomes a row in the Sheet (name, roll no, unit, score, time...).
To clear the leaderboard, delete the rows under the header row.

## Run / edit the source code
    npm install
    npm run dev        # open the address it prints
    npm run build      # production files go to dist/

For the single-file build used above, the settings block sits in `index.html`
(and in the template inside `build.mjs`).

## Where things are
- `src/data.js`        units, keywords, scores, colours
- `src/puzzle.js`      puzzle generator
- `src/api.js`         shared leaderboard client (Apps Script) + offline queue
- `src/board.js`       best score per player, overall totals
- `src/components/`    NameScreen, UnitList, PuzzleBoard, Grid, KeywordPanel, CompletionModal, Leaderboard
- `backend/Code.gs`    Google Apps Script backend
