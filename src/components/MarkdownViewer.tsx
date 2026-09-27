import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownViewerProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

// Configurer marked pour GitHub Flavored Markdown avec retours à la ligne
marked.setOptions({
  gfm: true,
  breaks: true,
});

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  isStreaming,
  className = '',
}) => {
  const sanitizedHtml = useMemo(() => {
    if (!content) return '';
    try {
      // Parse markdown to HTML
      const rawHtml = marked.parse(content, { async: false }) as string;
      // Sanitize against XSS
      return DOMPurify.sanitize(rawHtml, {
        ADD_ATTR: ['target', 'rel'],
      });
    } catch (err) {
      console.error('Erreur parsing markdown', err);
      return content;
    }
  }, [content]);

  return (
    <div className={`albert-markdown-content relative ${className}`}>
      <div
        className="albert-prose leading-relaxed text-slate-800 break-words"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
      {isStreaming && (
        <span className="inline-block w-1.5 h-3.5 ml-1 bg-blue-600 animate-pulse align-middle" />
      )}
    </div>
  );
};
