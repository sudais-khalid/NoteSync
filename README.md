# NoteSync

> Record a lecture, get an NLP-annotated transcript and detailed study notes. Built as an NLP semester project.

[![CI/CD](https://github.com/sudais-khalid/NoteSync/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/sudais-khalid/NoteSync/actions/workflows/ci-cd.yml)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.txt)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)

NoteSync transcribes lectures live in the browser (English, Urdu, or code-mixed), runs the transcript through a **classical NLP pipeline built from scratch in Node.js**, and presents the result as an annotated manuscript: the raw transcript with entities and key terms highlighted inline, alongside sectioned study notes, definitions, exam topics, and flashcards.

The NLP analysis is **not just an LLM API call**: every core technique is implemented with classical/statistical methods, with Google Gemini available only as an optional polish pass on top.

## The NLP pipeline

Each stage lives in its own module under [`backend/services/nlp/`](backend/services/nlp/):

| Stage | Technique | Module |
| --- | --- | --- |
| Tokenization & sentence segmentation | wink-nlp with offset reconstruction; Urdu sentence marks (`۔ ؟`) normalized in a same-length copy so highlight offsets never desync | `tokenizer.js` |
| POS tagging | wink-nlp English model (sample exposed via API) | `posTagger.js` |
| Term & sentence salience | TF-IDF over sentences with a **bilingual tokenizer** (Latin + Urdu script) and English + Urdu + Roman-Urdu stopword filtering | `tfidf.js`, `urduSupport.js` |
| Summarization | Extractive: top-K TF-IDF-ranked sentences, restored to document order | `summarizer.js` |
| Named entity recognition | wink-nlp statistical NER + compromise supplemental pass, deduplicated, with character offsets for inline highlighting | `nerExtractor.js` |
| Definition extraction | Rule-based patterns (`X is/means/refers to Y`) with pronoun-subject filtering | `definitionExtractor.js` |
| Sentiment | AFINN lexicon scoring (wink-sentiment) mapped to positive/neutral/critical/mixed | `sentimentAnalyzer.js` |
| Readability | Flesch-Kincaid grade + Reading Ease, implemented by hand (syllable-cluster heuristic) | `readability.js` |
| Study-note composition | Topic-seeded sentence grouping into readable sections (Overview → topic sections → definitions → exam prep) | `notesComposer.js` |
| Flashcards | Template-based Q/A generation from definitions and key sentences | `flashcardGenerator.js` |
| Optional LLM enrichment | Gemini polishes summary/notes/flashcards **only**; entities, sentiment, topics, readability stay classical. Falls back cleanly if unconfigured or failing | `geminiEnrichment.js` |

**Urdu / code-mixed support**: script detection, an embedded Urdu + Roman-Urdu stopword list, offset-safe sentence segmentation, and RTL rendering with Noto Nastaliq Urdu in the UI. (Known limitation: NER and sentiment are English-trained, so Urdu-only passages degrade. Documented as future work.)

## Features

- **Live transcription** via the Web Speech API: free, in-browser, with a language selector (English / اردو / Mixed) and automatic restart so long lectures record through pauses.
- **Annotated manuscript view**: the raw transcript with teal dotted underlines (entities) and amber highlights (key terms); clicking a highlight opens a margin note showing what the pipeline detected.
- **Detailed study notes**: sectioned, readable prose composed from the transcript, not just bullet points.
- **Flashcards** styled as physical index cards, plus per-lecture summary, key points, definitions, exam topics, topic clusters, sentiment, and readability grade.
- **Lecture library** with category/tag filtering, backed by JWT-authenticated per-user storage.

## Tech stack

**Backend**: Node.js 20, Express, MongoDB/Mongoose, JWT + bcrypt auth. NLP: wink-nlp, natural (TF-IDF), compromise, wink-sentiment.
**Frontend**: React 18 (CRA), Tailwind CSS, React Router 7, Web Speech API.
**Testing**: Jest + Supertest + mongodb-memory-server (backend, 66 tests), React Testing Library (frontend, 15 tests).
**Ops**: Docker (multi-stage, non-root), docker-compose, GitHub Actions CI/CD publishing images to GHCR.

## Getting started

### Prerequisites

- Node.js 20+
- Either Docker (easiest) or a MongoDB instance

### Option A: Docker (production-style)

```bash
cp .env.example .env         # set a real JWT_SECRET
docker compose up --build
```

Open <http://localhost:3000>. MongoDB runs internally (not exposed to the host); data persists in a named volume. See [DEPLOYMENT.md](DEPLOYMENT.md) for details.

### Option B: Local development

```bash
# Backend
cd backend
npm install
cp .env.example .env         # set MONGODB_URI, JWT_SECRET; GEMINI_API_KEY optional
npm run dev                  # http://localhost:5000

# Frontend (second terminal)
cd frontend
npm install
npm start                    # http://localhost:3000, proxies /api to :5000
```

On Windows, `start-dev.bat` at the repo root launches Docker MongoDB + both dev servers in one go.

### Running tests

```bash
cd backend && npm test       # 66 tests: NLP pipeline units + API integration (in-memory MongoDB)
cd frontend && npm test      # 15 tests: span highlighting, components, auth flow
```

## API overview

All lecture routes require `Authorization: Bearer <token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register`, `/api/auth/login` | Create account / log in (returns JWT) |
| GET | `/api/auth/me` | Current user profile |
| POST | `/api/summarize` | Run the NLP pipeline on a transcript → notes + annotation spans |
| POST/GET | `/api/lectures` | Create / list lectures (filter by `category`, `tag`) |
| GET/PUT/DELETE | `/api/lectures/:id` | Fetch / update / delete an owned lecture |
| GET | `/api/lectures/stats/categories-tags` | Category and tag counts |
| GET | `/api/health` | Health check |

The `/api/summarize` response includes `annotations.entitySpans` and `annotations.keyTermSpans`: character offsets into the raw transcript that power the inline highlighting without any client-side re-tokenization.

## Project structure

```text
NoteSync/
├── backend/
│   ├── app.js                 # Express app (side-effect free, testable)
│   ├── server.js              # Entry point: DB connect + listen
│   ├── services/nlp/          # The NLP pipeline (see table above)
│   ├── controllers/ routes/ models/ middleware/ config/
│   └── tests/                 # Jest: nlp/ units + api/ integration
├── frontend/
│   └── src/
│       ├── pages/             # Landing, Login, Register, Dashboard, Record, LectureDetail
│       ├── components/        # manuscript/ (annotated view), record/, dashboard/, layout/, common/
│       ├── hooks/             # useSpeechRecognition (multilingual + auto-restart), data hooks
│       ├── utils/spanHighlighter.js   # offset spans → non-overlapping render segments
│       ├── context/ api/
│       └── ...
├── docker-compose.yml         # mongo + backend + frontend
├── .github/workflows/ci-cd.yml
├── DEPLOYMENT.md
└── start-dev.bat              # Windows dev launcher
```

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | backend | MongoDB connection string |
| `JWT_SECRET` | backend | Token signing secret (set a long random value) |
| `GEMINI_API_KEY` | backend | *Optional*: enables the LLM polish pass; app is fully functional without it |
| `FRONTEND_URL` | backend | Allowed CORS origin |
| `PORT` | backend | API port (default 5000) |

Never commit `.env`. Templates live in `.env.example` files.

## License

MIT. See [LICENSE.txt](LICENSE.txt).

## Author

**Sudais Khalid**
GitHub: [@sudais-khalid](https://github.com/sudais-khalid) · Email: <msudaiskhalid.ai@gmail.com>
