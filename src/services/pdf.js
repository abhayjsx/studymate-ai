/**
 * StudyMate AI — PDF Text Extraction
 * Uses pdf.js to extract text content from uploaded PDF files.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extract text content from a PDF file.
 * @param {File} file - The PDF file to extract text from.
 * @returns {Promise<{text: string, pageCount: number}>}
 */
export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  const pageCount = pdf.numPages;

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += `\n--- Page ${i} ---\n${pageText}\n`;
  }

  return {
    text: fullText.trim(),
    pageCount,
  };
}
