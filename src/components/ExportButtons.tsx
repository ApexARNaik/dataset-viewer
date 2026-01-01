'use client';

import { useState } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

interface Dataset {
  id: string;
  instruction: string;
  input: string;
  output: string;
  createdAt: Date;
  uploadedBy: {
    name: string;
  };
}

interface ExportButtonsProps {
  datasets: Dataset[];
}

export default function ExportButtons({ datasets }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportToWord = async () => {
    setExporting('word');

    try {
      const children: Paragraph[] = [
        new Paragraph({
          text: 'Financial AI Training Datasets',
          heading: HeadingLevel.TITLE,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Total Datasets: ${datasets.length}`,
              bold: true,
            }),
            new TextRun({
              text: ` | Exported: ${new Date().toLocaleDateString('en-IN')}`,
            }),
          ],
          spacing: { after: 400 },
        }),
      ];

      datasets.forEach((dataset, index) => {
        children.push(
          new Paragraph({
            text: `Dataset ${index + 1}`,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Uploaded by: ', bold: true }),
              new TextRun({ text: dataset.uploadedBy.name }),
              new TextRun({ text: ' | ' }),
              new TextRun({ text: new Date(dataset.createdAt).toLocaleDateString('en-IN') }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: 'INSTRUCTION',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: dataset.instruction,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: 'USER PERSONA',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: dataset.input,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: 'AI RESPONSE',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: dataset.output,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: '─'.repeat(50),
            spacing: { after: 400 },
          })
        );
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `training-datasets-${new Date().toISOString().split('T')[0]}.docx`);
    } catch (error) {
      console.error('Word export failed:', error);
      alert('Failed to export as Word document');
    } finally {
      setExporting(null);
    }
  };

  const exportToPDF = async () => {
    setExporting('pdf');

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let y = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial AI Training Datasets', margin, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total: ${datasets.length} datasets | Exported: ${new Date().toLocaleDateString('en-IN')}`, margin, y);
      y += 15;

      datasets.forEach((dataset, index) => {
        // Check if we need a new page
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        // Dataset header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Dataset ${index + 1}`, margin, y);
        y += 7;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`By: ${dataset.uploadedBy.name} | ${new Date(dataset.createdAt).toLocaleDateString('en-IN')}`, margin, y);
        y += 10;

        // Instruction
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('INSTRUCTION', margin, y);
        y += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const instructionLines = doc.splitTextToSize(dataset.instruction, maxWidth);
        doc.text(instructionLines, margin, y);
        y += instructionLines.length * 5 + 8;

        // Check page
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        // Input
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('USER PERSONA', margin, y);
        y += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const inputLines = doc.splitTextToSize(dataset.input, maxWidth);
        doc.text(inputLines, margin, y);
        y += inputLines.length * 5 + 8;

        // Check page
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        // Output (truncated)
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('AI RESPONSE (Preview)', margin, y);
        y += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const truncatedOutput = dataset.output.slice(0, 1000) + (dataset.output.length > 1000 ? '...' : '');
        const outputLines = doc.splitTextToSize(truncatedOutput, maxWidth);
        const maxLines = Math.min(outputLines.length, 30);
        doc.text(outputLines.slice(0, maxLines), margin, y);
        y += maxLines * 4 + 15;

        // Separator
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
      });

      doc.save(`training-datasets-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export as PDF');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="btn-group">
      <button 
        className="btn btn-secondary" 
        onClick={exportToWord}
        disabled={exporting !== null || datasets.length === 0}
      >
        {exporting === 'word' ? (
          <><span className="spinner"></span> Exporting...</>
        ) : (
          '📄 Export as Word'
        )}
      </button>
      <button 
        className="btn btn-secondary" 
        onClick={exportToPDF}
        disabled={exporting !== null || datasets.length === 0}
      >
        {exporting === 'pdf' ? (
          <><span className="spinner"></span> Exporting...</>
        ) : (
          '📋 Export as PDF'
        )}
      </button>
    </div>
  );
}
