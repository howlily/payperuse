"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function DocsPage() {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/DOCUMENTATION.md")
      .then((res) => res.text())
      .then((text) => {
        setMarkdown(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading documentation:", err);
        setMarkdown("# Documentation\n\nError loading documentation file.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-manrope">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-white/10 px-6 py-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src="/integrations/spectral logo.png" 
              alt="Spectral Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="ml-3 text-white font-semibold">Spectral 402</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/spectral" className="text-white/90 hover:text-purple-400 transition-colors font-manrope">
              App
            </Link>
            <a href="https://github.com/howlily/spectral402" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-purple-400 transition-colors font-manrope">
              GitHub
            </a>
            <Link href="/docs" className="text-white/90 hover:text-purple-400 transition-colors font-manrope">
              Documentation
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="pt-20 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                <p className="text-white/70">Loading documentation...</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert prose-lg max-w-none">
              <style jsx global>{`
                .prose {
                  color: rgba(255, 255, 255, 0.9);
                }
                .prose h1 {
                  color: white;
                  font-size: 2.5em;
                  font-weight: 700;
                  margin-top: 1.5em;
                  margin-bottom: 0.5em;
                  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                  padding-bottom: 0.5em;
                }
                .prose h2 {
                  color: white;
                  font-size: 2em;
                  font-weight: 600;
                  margin-top: 1.5em;
                  margin-bottom: 0.5em;
                  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                  padding-bottom: 0.5em;
                }
                .prose h3 {
                  color: rgba(255, 255, 255, 0.95);
                  font-size: 1.5em;
                  font-weight: 600;
                  margin-top: 1.25em;
                  margin-bottom: 0.5em;
                }
                .prose h4 {
                  color: rgba(255, 255, 255, 0.9);
                  font-size: 1.25em;
                  font-weight: 600;
                  margin-top: 1em;
                  margin-bottom: 0.5em;
                }
                .prose p {
                  color: rgba(255, 255, 255, 0.8);
                  line-height: 1.75;
                  margin-bottom: 1em;
                }
                .prose ul, .prose ol {
                  color: rgba(255, 255, 255, 0.8);
                  margin-bottom: 1em;
                  padding-left: 1.5em;
                }
                .prose li {
                  margin-bottom: 0.5em;
                }
                .prose code {
                  background: rgba(168, 85, 247, 0.2);
                  color: #c084fc;
                  padding: 0.2em 0.4em;
                  border-radius: 0.25rem;
                  font-size: 0.9em;
                }
                .prose pre {
                  background: rgba(0, 0, 0, 0.5);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  border-radius: 0.5rem;
                  padding: 1em;
                  overflow-x: auto;
                  margin-bottom: 1.5em;
                }
                .prose pre code {
                  background: transparent;
                  color: rgba(255, 255, 255, 0.9);
                  padding: 0;
                }
                .prose blockquote {
                  border-left: 4px solid rgba(168, 85, 247, 0.5);
                  padding-left: 1em;
                  margin: 1.5em 0;
                  color: rgba(255, 255, 255, 0.7);
                  font-style: italic;
                }
                .prose a {
                  color: #a855f7;
                  text-decoration: none;
                  border-bottom: 1px solid rgba(168, 85, 247, 0.3);
                  transition: all 0.2s;
                }
                .prose a:hover {
                  color: #c084fc;
                  border-bottom-color: #c084fc;
                }
                .prose table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 1.5em 0;
                }
                .prose th, .prose td {
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  padding: 0.75em;
                  text-align: left;
                }
                .prose th {
                  background: rgba(168, 85, 247, 0.2);
                  color: white;
                  font-weight: 600;
                }
                .prose hr {
                  border: none;
                  border-top: 1px solid rgba(255, 255, 255, 0.1);
                  margin: 2em 0;
                }
                .prose strong {
                  color: white;
                  font-weight: 600;
                }
              `}</style>
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

