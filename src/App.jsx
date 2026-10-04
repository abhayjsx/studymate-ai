/**
 * StudyMate AI — Main Application
 * AI-powered study assistant built with Gemma (open-source AI)
 * for Hacktoberfest 2026 "Build for a Friend" challenge.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Upload, FileText, BookOpen, HelpCircle, Brain,
  ClipboardList, Lightbulb, Calendar, Send, X,
  Sparkles, MessageSquare, Loader2, GraduationCap
} from 'lucide-react';

import { initAI, isAIReady, summarizeText, generateMCQs, generateVivaQuestions, explainTopic, createRevisionPlan, askQuestion, chat } from './services/ai.js';
import { extractTextFromPDF } from './services/pdf.js';

const TOOLS = [
  { id: 'summarize', label: 'Summarize', icon: BookOpen, color: '#6366f1', description: 'Get a clear summary' },
  { id: 'mcq', label: 'MCQs', icon: ClipboardList, color: '#a855f7', description: 'Generate quiz questions' },
  { id: 'viva', label: 'Viva Qs', icon: HelpCircle, color: '#ec4899', description: 'Oral exam prep' },
  { id: 'explain', label: 'Explain', icon: Lightbulb, color: '#f59e0b', description: 'Simplify hard topics' },
  { id: 'revision', label: 'Revision Plan', icon: Calendar, color: '#22d3ee', description: 'Study schedule' },
  { id: 'ask', label: 'Ask AI', icon: MessageSquare, color: '#34d399', description: 'Ask anything' },
];

const FEATURES = [
  { icon: '📄', title: 'PDF Upload', desc: 'Drop your study notes, textbooks, or lecture slides', bg: 'rgba(99,102,241,0.12)' },
  { icon: '📝', title: 'Smart Summaries', desc: 'Get concise, organized chapter summaries instantly', bg: 'rgba(168,85,247,0.12)' },
  { icon: '🧠', title: 'MCQ Generator', desc: 'Auto-generate quiz questions to test yourself', bg: 'rgba(236,72,153,0.12)' },
  { icon: '🎤', title: 'Viva Prep', desc: 'Practice oral exam questions with AI answers', bg: 'rgba(245,158,11,0.12)' },
  { icon: '💡', title: 'Topic Explainer', desc: 'Complex topics explained in simple language', bg: 'rgba(34,211,238,0.12)' },
  { icon: '📅', title: 'Revision Planner', desc: 'AI-crafted study plan tailored to your material', bg: 'rgba(52,211,153,0.12)' },
];

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatInputRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Handle API key submission
  const handleSetup = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    try {
      initAI(apiKey.trim());
      setIsSetup(true);
      showToast('Connected to Gemma AI successfully!', 'success');
    } catch (err) {
      showToast('Failed to initialize AI: ' + err.message, 'error');
    }
  };

  // Handle PDF upload
  const handleFileUpload = useCallback(async (file) => {
    if (!file || file.type !== 'application/pdf') {
      showToast('Please upload a PDF file', 'error');
      return;
    }

    setIsLoadingPdf(true);
    try {
      const result = await extractTextFromPDF(file);
      setPdfFile(file);
      setPdfText(result.text);
      setPageCount(result.pageCount);
      showToast(`Loaded "${file.name}" (${result.pageCount} pages)`, 'success');
    } catch (err) {
      showToast('Failed to read PDF: ' + err.message, 'error');
    } finally {
      setIsLoadingPdf(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  // Remove uploaded file
  const removePdf = () => {
    setPdfFile(null);
    setPdfText('');
    setPageCount(0);
  };

  // Handle tool action
  const handleToolAction = async (toolId) => {
    if (!pdfText && toolId !== 'ask') {
      showToast('Please upload a PDF first', 'error');
      return;
    }

    setActiveTool(toolId);
    setIsGenerating(true);

    const tool = TOOLS.find(t => t.id === toolId);
    const userMsg = {
      role: 'user',
      content: `Use **${tool.label}** on my study material`,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      let response;
      switch (toolId) {
        case 'summarize':
          response = await summarizeText(pdfText);
          break;
        case 'mcq':
          response = await generateMCQs(pdfText, 5);
          break;
        case 'viva':
          response = await generateVivaQuestions(pdfText, 8);
          break;
        case 'explain':
          response = await explainTopic(pdfText);
          break;
        case 'revision':
          response = await createRevisionPlan(pdfText);
          break;
        default:
          return;
      }

      const aiMsg = {
        role: 'ai',
        content: response,
        tool: toolId,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      showToast('AI error: ' + err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle free-form question
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    const question = inputText.trim();
    setInputText('');
    setIsGenerating(true);

    const userMsg = {
      role: 'user',
      content: question,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      let response;
      if (pdfText) {
        response = await askQuestion(pdfText, question);
      } else {
        response = await chat(question);
      }

      const aiMsg = {
        role: 'ai',
        content: response,
        tool: 'ask',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      showToast('AI error: ' + err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle quick action from empty state
  const handleQuickAction = (prompt) => {
    setInputText(prompt);
    chatInputRef.current?.focus();
  };

  // ── LANDING PAGE ───────────────────────────────────────────
  if (!isSetup) {
    return (
      <>
        <div className="app-bg" />
        <div className="app">
          <header className="header">
            <div className="header-inner">
              <div className="logo">
                <div className="logo-icon">S</div>
                <div className="logo-text">
                  StudyMate <span>AI</span>
                </div>
              </div>
              <div className="header-badge">
                <span className="dot" />
                Powered by Gemma (Open Source)
              </div>
            </div>
          </header>

          <main className="main">
            <section className="hero" id="hero">
              <div className="hero-badge">
                <Sparkles size={14} />
                Built with Open-Source AI
              </div>
              <h1>
                Your AI-Powered<br />
                <span className="gradient">Study Companion</span>
              </h1>
              <p>
                Upload your study materials and let Gemma AI help you learn smarter —
                summaries, MCQs, viva prep, and more.
              </p>

              <div className="api-key-section">
                <form className="api-key-form" onSubmit={handleSetup}>
                  <input
                    id="api-key-input"
                    type="password"
                    className="api-key-input"
                    placeholder="Enter your Gemini API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" disabled={!apiKey.trim()}>
                    <Sparkles size={16} />
                    Start
                  </button>
                </form>
                <p className="api-key-note">
                  Free API key from{' '}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                    Google AI Studio
                  </a>
                  {' '}— uses the open-source Gemma model
                </p>
              </div>
            </section>

            <section className="features-grid" id="features">
              {FEATURES.map((f, i) => (
                <div className="feature-card" key={i}>
                  <div className="feature-card-icon" style={{ background: f.bg }}>
                    {f.icon}
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </section>
          </main>

          <footer className="footer">
            <p>
              StudyMate AI — Built with ❤️ using{' '}
              <a href="https://ai.google.dev/gemma" target="_blank" rel="noopener noreferrer">Gemma</a>
              {' '}(Open-Source AI) for Hacktoberfest 2026
            </p>
          </footer>
        </div>
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  // ── WORKSPACE ──────────────────────────────────────────────
  return (
    <>
      <div className="app-bg" />
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <div className="logo">
              <div className="logo-icon">S</div>
              <div className="logo-text">
                StudyMate <span>AI</span>
              </div>
            </div>
            <div className="header-badge">
              <span className="dot" />
              Gemma AI Connected
            </div>
          </div>
        </header>

        <main className="main">
          <div className="workspace">
            {/* ── Sidebar ── */}
            <aside className="sidebar">
              {/* Upload Section */}
              <div className="sidebar-card">
                <div className="sidebar-card-header">
                  <h2>
                    <Upload size={16} />
                    Study Material
                  </h2>
                  {pdfFile && (
                    <button className="btn btn-ghost btn-sm" onClick={removePdf}>
                      <X size={14} /> Remove
                    </button>
                  )}
                </div>
                <div className="sidebar-card-body">
                  {isLoadingPdf ? (
                    <div className="upload-zone">
                      <Loader2 size={32} className="upload-zone-icon" style={{ animation: 'spin 1s linear infinite' }} />
                      <p>Extracting text...</p>
                    </div>
                  ) : pdfFile ? (
                    <div className="uploaded-file">
                      <div className="uploaded-file-icon">
                        <FileText size={20} />
                      </div>
                      <div className="uploaded-file-info">
                        <div className="uploaded-file-name">{pdfFile.name}</div>
                        <div className="uploaded-file-meta">
                          {pageCount} pages • {(pdfFile.size / 1024).toFixed(0)} KB
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      id="upload-zone"
                    >
                      <Upload size={32} className="upload-zone-icon" />
                      <p>Drop your PDF here</p>
                      <span className="hint">or click to browse</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    id="file-input"
                  />
                </div>
              </div>

              {/* Tools Section */}
              <div className="sidebar-card">
                <div className="sidebar-card-header">
                  <h2>
                    <Brain size={16} />
                    AI Tools
                  </h2>
                </div>
                <div className="sidebar-card-body">
                  <div className="tools-grid">
                    {TOOLS.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
                          onClick={() => handleToolAction(tool.id)}
                          disabled={isGenerating || (!pdfText && tool.id !== 'ask')}
                          id={`tool-${tool.id}`}
                        >
                          <span className="tool-btn-icon" style={{ color: tool.color }}>
                            <Icon size={18} />
                          </span>
                          {tool.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Chat Area ── */}
            <div className="chat-area">
              <div className="chat-header">
                <h2>
                  <GraduationCap size={18} />
                  Study Session
                </h2>
                <span className="chat-header-model">gemma-3-27b-it</span>
              </div>

              <div className="chat-messages" id="chat-messages">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">🎓</div>
                    <h3>Ready to study?</h3>
                    <p>
                      {pdfText
                        ? 'Your PDF is loaded! Use the AI tools on the left, or ask a question below.'
                        : 'Upload a PDF to get started, or ask me anything about your studies.'}
                    </p>
                    <div className="quick-actions">
                      {pdfText ? (
                        <>
                          <button className="quick-action-btn" onClick={() => handleToolAction('summarize')}>
                            <BookOpen size={14} /> Summarize
                          </button>
                          <button className="quick-action-btn" onClick={() => handleToolAction('mcq')}>
                            <ClipboardList size={14} /> Generate MCQs
                          </button>
                          <button className="quick-action-btn" onClick={() => handleToolAction('explain')}>
                            <Lightbulb size={14} /> Explain Topics
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="quick-action-btn" onClick={() => handleQuickAction('Explain the concept of neural networks in simple terms')}>
                            💡 Neural Networks
                          </button>
                          <button className="quick-action-btn" onClick={() => handleQuickAction('What are the key differences between TCP and UDP?')}>
                            🌐 TCP vs UDP
                          </button>
                          <button className="quick-action-btn" onClick={() => handleQuickAction('Help me understand Big O notation')}>
                            📊 Big O Notation
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => (
                      <div className="message" key={i}>
                        <div className={`message-avatar ${msg.role}`}>
                          {msg.role === 'user' ? 'Y' : '✦'}
                        </div>
                        <div className="message-content">
                          <div className="message-sender">
                            {msg.role === 'user' ? 'You' : 'StudyMate AI'}
                            {msg.role === 'ai' && <span className="tag gemma">Gemma</span>}
                          </div>
                          <div className="message-body">
                            {msg.role === 'ai' ? (
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            ) : (
                              <p>{msg.content}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="message">
                        <div className="message-avatar ai">✦</div>
                        <div className="message-content">
                          <div className="message-sender">
                            StudyMate AI <span className="tag gemma">Gemma</span>
                          </div>
                          <div className="thinking">
                            <div className="thinking-dot" />
                            <div className="thinking-dot" />
                            <div className="thinking-dot" />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="chat-input-area">
                <form className="chat-input-form" onSubmit={handleSend}>
                  <div className="chat-input-wrapper">
                    <input
                      ref={chatInputRef}
                      type="text"
                      className="chat-input"
                      placeholder={pdfText ? 'Ask about your study material...' : 'Ask me anything about your studies...'}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={isGenerating}
                      id="chat-input"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-icon"
                    disabled={!inputText.trim() || isGenerating}
                    id="send-btn"
                  >
                    {isGenerating ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>

        <footer className="footer">
          <p>
            StudyMate AI — Built with ❤️ using{' '}
            <a href="https://ai.google.dev/gemma" target="_blank" rel="noopener noreferrer">Gemma</a>
            {' '}(Open-Source AI) for Hacktoberfest 2026
          </p>
        </footer>
      </div>
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

function Toast({ toast, onClose }) {
  return (
    <div className={`toast ${toast.type}`} onClick={onClose}>
      {toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : 'ℹ️'}
      {toast.message}
    </div>
  );
}
