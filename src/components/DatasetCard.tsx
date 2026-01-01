'use client';

import ReactMarkdown from 'react-markdown';

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

interface DatasetCardProps {
  dataset: Dataset;
}

function parsePersona(input: string): { key: string; value: string }[] {
  // Extract content between brackets: [Age: 29, Income: ₹15 LPA, ...]
  const match = input.match(/\[(.*?)\]/);
  if (!match) return [];

  const content = match[1];
  const pairs = content.split(',').map(pair => {
    const [key, ...valueParts] = pair.split(':');
    return {
      key: key?.trim() || '',
      value: valueParts.join(':').trim()
    };
  }).filter(p => p.key && p.value);

  return pairs;
}

export default function DatasetCard({ dataset }: DatasetCardProps) {
  const personaPills = parsePersona(dataset.input);

  return (
    <article className="dataset-card">
      {/* Header */}
      <div className="dataset-header">
        <div className="dataset-meta">
          <span className="uploader-badge">
            👤 {dataset.uploadedBy.name}
          </span>
          <span className="date-badge">
            {new Date(dataset.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Instruction Section */}
      <div className="dataset-section">
        <div className="section-label">
          📋 Instruction
        </div>
        <p className="instruction-text">{dataset.instruction}</p>
      </div>

      {/* Input/Persona Section */}
      <div className="dataset-section">
        <div className="section-label">
          👤 User Persona
        </div>
        <div className="persona-pills">
          {personaPills.length > 0 ? (
            personaPills.map((pill, index) => (
              <span key={index} className="persona-pill">
                <strong>{pill.key}:</strong> {pill.value}
              </span>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>{dataset.input}</p>
          )}
        </div>
      </div>

      {/* Output Section */}
      <div className="dataset-section">
        <div className="section-label">
          🤖 AI Response
        </div>
        <div className="output-content">
          <ReactMarkdown>{dataset.output}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
