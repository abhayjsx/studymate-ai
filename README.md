# 🎓 StudyMate AI

> **AI-powered study assistant built with Gemma (open-source AI) for Hacktoberfest 2026 — "Build for a Friend" challenge.**

StudyMate AI helps students learn smarter by transforming study materials into interactive learning experiences. Upload a PDF — lecture notes, textbook chapters, or study guides — and let Gemma AI generate summaries, MCQs, viva questions, topic explanations, and personalized revision plans.

## 🚀 Live Demo

🔗 **[Try StudyMate AI →](https://studymate-ai.vercel.app)**

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **PDF Upload** | Drop your study notes, textbooks, or lecture slides |
| 📝 **Smart Summaries** | Get concise, organized chapter summaries instantly |
| 🧠 **MCQ Generator** | Auto-generate multiple-choice questions to test yourself |
| 🎤 **Viva Prep** | Practice oral exam questions with suggested answers |
| 💡 **Topic Explainer** | Complex topics explained in simple, easy language |
| 📅 **Revision Planner** | AI-crafted study plan tailored to your material |
| 💬 **Ask AI** | Ask any question about your study material |

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **AI Model**: [Gemma](https://ai.google.dev/gemma) (open-source) via [Gemini API](https://ai.google.dev/)
- **PDF Parsing**: [pdf.js](https://mozilla.github.io/pdf.js/)
- **Markdown**: react-markdown
- **Icons**: lucide-react
- **Deployment**: Vercel

## 🤖 Why Open-Source AI?

StudyMate AI uses **Gemma** — Google's open-source AI model — because:

1. **Transparency**: Students and educators can trust an open model where the weights and methodology are public
2. **Privacy**: Open-source models can be self-hosted, keeping student data private
3. **Accessibility**: Free API access means every student can use it, regardless of budget
4. **Customizability**: The model can be fine-tuned for specific educational domains
5. **No Vendor Lock-in**: Open-source means the tool isn't dependent on any single company's decisions

## 👤 Who I Built This For

I built StudyMate AI for my friend who's a fellow CSE/Data Science student. During exam season, they spend hours manually:
- Re-reading chapters to find key points
- Creating practice questions from scratch
- Trying to organize revision schedules

StudyMate AI automates all of this in seconds, giving them more time to actually *learn* the material.

## 🏗️ How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Upload PDF │────▶│ pdf.js Parse │────▶│ Extract Text    │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                                                   ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Display   │◀────│  Render MD   │◀────│ Gemma AI (API)  │
│  Response   │     │  Response    │     │ Process & Gen   │
└─────────────┘     └──────────────┘     └─────────────────┘
```

1. **Upload**: User drops a PDF study material
2. **Parse**: pdf.js extracts text content from all pages
3. **Process**: Text is sent to Gemma (via Gemini API) with specialized prompts
4. **Generate**: Gemma generates summaries, MCQs, explanations, etc.
5. **Display**: Responses are rendered as beautiful markdown

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- A free [Gemini API key](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/studymate-ai.git
cd studymate-ai

# Install dependencies
npm install

# Run development server
npm run dev
```

### Usage

1. Open `http://localhost:5173` in your browser
2. Enter your free Gemini API key
3. Upload a PDF study material
4. Use any of the 6 AI tools to study!

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to [Vercel](https://vercel.com) for automatic deployments.

## 📸 Screenshots

*Coming soon — see live demo above*

## 📄 License

MIT — feel free to use, modify, and share!

## 🏆 Hacktoberfest 2026

This project was built for the **Hacktoberfest Weekend Challenge: Build for a Friend** on [DEV Community](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01).

- **Challenge**: Build for a Friend
- **Open-Source AI**: Gemma (via Gemini API)
- **Category**: Best Use of Gemma

---

Made with ❤️ for Hacktoberfest 2026
