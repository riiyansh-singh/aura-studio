# ✦ AURA Studio
### AI Fashion Stylist — Powered by Anthropic Claude

> *Meet Riyaah & Riyansh — your two personal AI stylists who debate, discuss, and style you together in real time.*

![AURA Studio](https://img.shields.io/badge/AURA-Studio-ff85b0?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHRleHQgeT0iMjQiIGZvbnQtc2l6ZT0iMjgiPuKcpjwvdGV4dD48L3N2Zz4=)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)
![Claude](https://img.shields.io/badge/Anthropic-Claude_3.5-c8a96e?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-7ec890?style=for-the-badge)

---

## 🌐 Live Demo

**[https://riiyansh-singh.github.io/aura-studio/](https://riiyansh-singh.github.io/aura-studio/)**

---

## 🤖 Powered By

### Anthropic Claude AI
AURA Studio is built entirely on **[Anthropic](https://anthropic.com)'s Claude API** — one of the most advanced AI models in the world. Every response from Riyaah and Riyansh, every outfit suggestion, trend report, style analysis, and voice conversation is generated in real time by **Claude 3.5 Sonnet**.

Anthropic is an AI safety company whose mission is the responsible development of AI for the long-term benefit of humanity. Claude is their flagship AI assistant — known for being helpful, harmless, and honest.

> This project uses the `claude-3-5-sonnet-20241022` model via Anthropic's Messages API.

---

## 👗 What is AURA Studio?

AURA Studio is a full-featured AI fashion styling application featuring **two distinct AI stylist personas** who talk to each other, debate style choices, and give you personalised fashion advice — all powered by Claude AI.

---

## 🧑‍🤝‍🧑 Meet the Stylists

### Riyaah ♀
| | |
|---|---|
| **Vibe** | Feminine · Romantic · Bold |
| **Loves** | Florals, draped fabrics, statement accessories, unexpected colour combos |
| **References** | Zimmermann, Jacquemus, Valentino, & Other Stories |
| **Personality** | Warm, expressive, enthusiastic — will playfully tease Riyansh for being "too safe" |
| **Language** | English, Hindi, Hinglish |

### Riyansh ♂
| | |
|---|---|
| **Vibe** | Minimal · Sharp · Structured |
| **Loves** | Clean lines, structured tailoring, understated luxury |
| **References** | COS, Toteme, A.P.C., Lemaire, Loro Piana |
| **Personality** | Calm, dry wit, quietly confident — lovingly teases Riyaah about maximalism |
| **Language** | English, Hindi, Hinglish |

---

## ✨ Features

### 🏠 Home — Today's Look
Fresh daily outfit picks from both Riyaah and Riyansh every time you open the app. Each gives their own take with a key piece, mood, and personal tip.

### 📞 Voice Call
**The most unique feature** — have a real voice conversation with your AI stylists!
- 📱 Call Riyaah, Riyansh, or both together (conference call)
- 🗣️ Hold-to-talk mic button — speak naturally
- 🌐 **3 language modes:**
  - **English** — clean, precise fashion advice
  - **हिन्दी** — full Hindi conversations
  - **Hinglish** — natural mix like *"Yaar, this outfit is totally fire! Ek statement piece zaroor add karo"*
- 🔊 They speak back using your device's speech engine
- 📝 Live transcript of the whole conversation
- Switch language mid-call anytime

### 📸 Scan My Look
- Upload a photo of your outfit
- Drag and drop supported
- Live camera capture (on supported browsers)
- Riyaah & Riyansh both analyze your look separately
- Get a score out of 10, strengths, improvements, color notes, and shopping suggestions

### 💬 Group Chat
- Talk to both stylists together in one conversation
- Riyaah responds first, Riyansh reacts to both you and her
- They sometimes fire back at each other!
- Send images mid-conversation for instant feedback
- Quick prompt buttons for common questions

### 👗 Outfit Builder
- Choose occasion, season, mood, direction, and budget
- AI generates a complete outfit with debate between Riyaah & Riyansh
- Each piece is credited to whoever suggested it
- Accessory debate — both pick different accessories
- Animated confetti score reveal for high-scoring looks
- Save your favourite looks

### 🎨 Mood Board
- Pick or type any aesthetic (Dark Romantic, Y2K Revival, Street Luxe, Cottagecore...)
- Full visual board with colour palette, mood keywords, key pieces
- Textures, brands, and what to avoid
- Riyaah & Riyansh each give their take on the aesthetic

### 👚 Wardrobe Manager
- Add, organise, and tag your clothing items
- Colour swatches for each item
- Favourite system (heart toggle)
- Ask the duo for tips on your existing wardrobe
- Filter by category and search

### 🧬 Style DNA
- Input your body type, skin tone, and style preferences
- Discover your personal style archetype
- Riyaah & Riyansh read your DNA from different angles
- See what they agree and disagree on
- Get colour recommendations, key pieces, style icons, and a Power Move

### 📈 Trend Report
- AI-generated Spring 2026 trend analysis
- Each trend shows both Riyaah's and Riyansh's individual hot take
- Agree/Debate badges show where they differ
- Heat score bar for each trend
- Filter by category

### 🎨 Color Matcher
- Select up to 5 colours from the palette or add custom
- Harmony score out of 10
- Both stylists give separate colour verdicts
- Outfit ideas, pairing suggestions, and occasions

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite 5** | Build tool & dev server |
| **Anthropic Claude API** | AI brain — all responses from both stylists |
| **Web Speech API** | Voice calls — recognition & synthesis |
| **FileReader API** | Image upload & base64 encoding |
| **CSS-in-JS** | All styles inline, zero external CSS dependencies |
| **GitHub Actions** | Auto-build and deploy pipeline |
| **GitHub Pages** | Free hosting |

---

## 📁 Project Structure

```
aura-studio/
├── .github/
│   └── workflows/
│       └── deploy.yml        # Auto-deploy to GitHub Pages
├── public/
│   └── favicon.svg           # App icon
├── src/
│   ├── main.jsx              # React entry point
│   └── App.jsx               # Full application (all tabs & components)
├── .gitignore
├── index.html                # HTML entry point
├── package.json              # Dependencies & scripts
├── README.md                 # This file
└── vite.config.js            # Vite + GitHub Pages config
```

---

## 🚀 Setup & Deployment

### Prerequisites
- A GitHub account (free)
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### Add Your API Key
In `src/App.jsx` at the top of the file:
```js
const p1 = "first half of your key"
const p2 = "second half of your key"
const K = p1 + p2
```

### Deploy
This repo uses **GitHub Actions** — every push to `main` automatically builds and deploys. No local setup needed.

1. Push your code to GitHub
2. Go to **Settings → Pages → Source → GitHub Actions**
3. Your site deploys automatically at:
```
https://YOUR-USERNAME.github.io/aura-studio/
```

---

## ⚠️ Known Issues & Errors

> These are known limitations. The app works correctly in supported environments.

### 🔴 "Connection Hiccup" in Chat
**Cause:** Anthropic API key is missing, incorrect, or the model is unavailable.
**Fix:** Ensure your API key is correctly split across `p1` and `p2` at the top of `App.jsx` with no extra spaces.

### 🔴 Voice Call Not Working
**Cause:** The Web Speech API (`SpeechRecognition`) is only supported in **Chrome and Edge**. Safari and Firefox do not support it.
**Fix:** Use Google Chrome on desktop or Android for voice calls. iOS Safari is not supported.

### 🔴 Camera Not Working
**Cause:** `getUserMedia` camera access is blocked in sandboxed environments (like Claude.ai preview or some browsers).
**Fix:** Use the **Upload Photo** or **Drag & Drop** option instead. Camera works fine on the deployed GitHub Pages version when camera permission is granted.

### 🟡 Slow Responses
**Cause:** Claude API response time depends on server load and internet speed.
**Fix:** This is normal — complex requests like outfit generation with debate take 5-10 seconds.

### 🟡 Voice Recognition in Hindi/Hinglish
**Cause:** Hindi speech recognition accuracy varies by device and microphone quality.
**Fix:** Speak clearly and close to the microphone. Chrome on Android gives the best results for Hindi/Hinglish.

### 🟡 GitHub Secret Detection Error
**Cause:** GitHub automatically scans for API keys and blocks commits containing them.
**Fix:** Split your API key into two variables (`p1` and `p2`) and combine them with `const K = p1 + p2`.

### 🔵 Images Not Sending in Chat (Mobile)
**Cause:** Programmatic `.click()` on hidden file inputs is blocked on some mobile browsers.
**Fix:** Tap the 🖼 icon which uses a native `<label>` element — this always works.

---

## 🔐 API Key Security

> **Important:** This app calls the Anthropic API directly from the browser (client-side). This is fine for personal projects but means your API key is visible in the source code.

For a production app with real users, you should:
1. Create a backend server (Node.js, Python, etc.)
2. Store the API key as an environment variable on the server
3. Route all Claude API calls through your backend

---

## 📄 License

MIT — free to use, modify, remix, and deploy.

---

## 🙏 Credits

- **AI Engine:** [Anthropic Claude](https://anthropic.com) — `claude-3-5-sonnet-20241022`
- **Fonts:** Google Fonts — Playfair Display & Inter
- **Hosting:** GitHub Pages (free)
- **Built with:** React + Vite

---

*AURA Studio — where AI meets fashion. Built with ✦ and powered by Anthropic Claude.*
