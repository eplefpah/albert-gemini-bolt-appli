import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { AttachedDocument } from '../types';

// Configuration du worker PDF.js (utilisation de CDN sécurisé pour éviter les problèmes de worker bundler)
try {
  if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch {
  // Ignorer si déjà configuré
}

/**
 * Extrait le texte d'un fichier PDF
 */
async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const textPieces: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter(Boolean);
      textPieces.push(`--- Page ${pageNum}/${numPages} ---\n` + pageStrings.join(' '));
    }

    return textPieces.join('\n\n');
  } catch (err) {
    console.warn('PDF.js parsing failed, fallback extraction:', err);
    // Fallback basique d'extraction de chaînes lisibles depuis le buffer
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const raw = decoder.decode(arrayBuffer);
    const matches = raw.match(/\(([^()]{2,})\)Tj|\[([^\[\]]+)\]TJ/g);
    if (matches && matches.length > 0) {
      return matches
        .map((m) => m.replace(/[\(\)\[\]]|Tj|TJ/g, ' ').trim())
        .filter((s) => s.length > 2)
        .join(' ');
    }
    throw new Error('Impossible d’extraire le texte de ce fichier PDF.');
  }
}

/**
 * Extrait le texte d'un document Word (.docx)
 */
async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || '';
}

/**
 * Parse n'importe quel fichier supporté (TXT, MD, CSV, JSON, XML, PDF, DOCX...)
 */
export async function parseDocumentFile(file: File): Promise<AttachedDocument> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  let content = '';

  if (extension === 'pdf' || file.type === 'application/pdf') {
    const buffer = await file.arrayBuffer();
    content = await extractTextFromPdf(buffer);
  } else if (
    extension === 'docx' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const buffer = await file.arrayBuffer();
    content = await extractTextFromDocx(buffer);
  } else {
    // Par défaut, lecture en texte brut UTF-8 (TXT, MD, CSV, JSON, LOG, HTML, XML, YAML, etc.)
    try {
      content = await file.text();
    } catch {
      // Fallback FileReader
      content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || '');
        reader.onerror = () => reject(new Error('Erreur de lecture du fichier texte.'));
        reader.readAsText(file, 'utf-8');
      });
    }
  }

  // Nettoyage sommaire
  const cleanContent = content.trim();
  const words = cleanContent ? cleanContent.split(/\s+/).filter(Boolean) : [];

  return {
    id: 'doc_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
    name: file.name,
    size: file.size,
    type: file.type || `application/${extension || 'octet-stream'}`,
    content: cleanContent,
    charCount: cleanContent.length,
    wordCount: words.length,
  };
}

/**
 * Formate la taille d'un fichier en chaîne lisible (Ko, Mo)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
