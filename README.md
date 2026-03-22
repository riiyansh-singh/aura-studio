# ✦ AURA Studio

> **Your personal AI fashion house — styled by Riyaah & Riyansh**

AURA Studio is a full-featured AI fashion styling app featuring two distinct AI stylist personas — **Riyaah** (feminine, romantic, bold) and **Riyansh** (minimal, sharp, structured) — who discuss, debate, and collaborate to give you personalised style advice.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Home / Today's Look** | Daily outfit picks from both stylists, fresh every visit |
| 📸 **Scan My Look** | Live camera capture or photo upload — get real AI feedback on your outfit |
| 💬 **Group Chat** | Talk to Riyaah & Riyansh together — they respond, debate, and fire back at each other |
| 👗 **Outfit Builder** | Generate complete AI-styled outfits with debate, accessory picks, and confetti score reveal |
| 🎨 **Mood Board** | Build visual aesthetic boards with palettes, keywords, textures & brand picks |
| 👚 **Wardrobe** | Manage your clothing, get AI tips from the duo on your existing pieces |
| 🧬 **Style DNA** | Discover your personal style archetype — analyzed by both stylists |
| 📈 **Trend Report** | Spring 2026 trends with individual hot takes and agree/debate badges |
| 🎨 **Color Matcher** | Analyze color harmony with both stylists giving separate verdicts |

---

## 🤖 Meet the Stylists

### Riyaah ♀
- Feminine · Romantic · Bold
- Loves florals, draped fabrics, statement accessories
- References: Zimmermann, Jacquemus, Valentino, & Other Stories
- Personality: warm, enthusiastic, playfully competitive

### Riyansh ♂
- Minimal · Sharp · Structured
- Loves clean lines, tailoring, understated luxury
- References: COS, Toteme, A.P.C., Lemaire, Loro Piana
- Personality: calm, dry wit, quietly confident

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed → [nodejs.org](https://nodejs.org)
- A free Anthropic API key → [console.anthropic.com](https://console.anthropic.com)

### 1. Install & Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173/aura-studio/](http://localhost:5173/aura-studio/)

---

## 🌐 Deploy to GitHub Pages

### Step 1 — Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Name your repo (e.g. `aura-studio`)
3. Set to **Public**, click **Create repository**

### Step 2 — Update the repo name in `vite.config.js`
Open `vite.config.js` and change the `base` to match your repo name:
```js
base: '/your-repo-name/',
```

### Step 3 — Upload files to GitHub
1. On your new repo page, click **"uploading an existing file"**
2. Drag and drop **all project files** (except `node_modules/`)
3. Click **Commit changes**

### Step 4 — Enable GitHub Pages + Auto Deploy

#### Option A: Manual deploy (easiest)
```bash
npm install
npm run deploy
```
This builds and pushes to the `gh-pages` branch automatically.

#### Option B: GitHub Actions (auto-deploy on every push)
1. In your repo → **Settings** → **Pages**
2. Set Source to **"GitHub Actions"**
3. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Step 5 — Your site is live! 🎉
Visit: `https://your-github-username.github.io/your-repo-name/`

---

## 🔑 API Key

This app calls the Anthropic API directly from the browser (for demo purposes). For production use, you should proxy API calls through a backend server to keep your key secure.

The API key is handled by the Claude.ai artifact environment for preview — when self-hosting, you'll need to add your key to the fetch calls in `src/App.jsx`.

---

## 🛠 Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool & dev server
- **Claude API** (claude-sonnet-4) — AI backbone for both stylists
- **CSS-in-JS** — All styles inline, zero external CSS deps
- **Web Camera API** — Live photo capture
- **FileReader API** — Image upload & base64 encoding

---

## 📁 Project Structure

```
aura-studio/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx          # React entry point
│   └── App.jsx           # Full application (all tabs & components)
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

---

## 📄 License

MIT — free to use, modify, and deploy.

---

*Built with ✦ by AURA Studio*
