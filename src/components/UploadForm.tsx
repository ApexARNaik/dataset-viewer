'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Teammate {
  id: string;
  name: string;
}

interface UploadFormProps {
  teammates: Teammate[];
}

interface DatasetEntry {
  instruction: string;
  input: string;
  output: string;
}

export default function UploadForm({ teammates }: UploadFormProps) {
  const router = useRouter();
  const [selectedTeammate, setSelectedTeammate] = useState('');
  const [passcode, setPasscode] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedTeammate || !passcode || !jsonInput) {
      setError('Please fill in all fields');
      return;
    }

    // Parse JSON
    let datasets: DatasetEntry[];
    try {
      const parsed = JSON.parse(jsonInput);
      // Support both single object and array of objects
      datasets = Array.isArray(parsed) ? parsed : [parsed];
      
      // Validate structure
      for (const ds of datasets) {
        if (!ds.instruction || !ds.input || !ds.output) {
          throw new Error('Each dataset must have instruction, input, and output fields');
        }
      }
    } catch (err) {
      setError(`Invalid JSON format: ${err instanceof Error ? err.message : 'Parse error'}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teammateId: selectedTeammate,
          passcode,
          datasets
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setSuccess(`Successfully uploaded ${result.count} dataset(s)!`);
      setJsonInput('');
      
      // Refresh page after short delay
      setTimeout(() => {
        router.refresh();
        router.push('/datasets');
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const sampleJson = `{
  "instruction": "I am a 29-year-old software engineer in Bengaluru earning ₹15 Lakhs per annum...",
  "input": "User persona: [Age: 29, Income: ₹15 LPA, City: Tier 1 (Bengaluru), Risk Appetite: Moderate-Aggressive, Goal: Home Down Payment (7 years)]",
  "output": "Namaste. Let us break down your financial journey..."
}`;

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <h2 className="form-title">📤 Upload Dataset</h2>

      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ✅ {success}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Select Your Name</label>
        <select
          className="form-select"
          value={selectedTeammate}
          onChange={(e) => setSelectedTeammate(e.target.value)}
          required
        >
          <option value="">-- Choose teammate --</option>
          {teammates.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Passcode</label>
        <input
          type="password"
          className="form-input"
          placeholder="Enter your passcode"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          required
        />
        <p className="form-help">Your assigned passcode (pass1, pass2, etc.)</p>
      </div>

      <div className="form-group">
        <label className="form-label">Dataset JSON</label>
        <textarea
          className="form-textarea"
          placeholder={sampleJson}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          required
        />
        <p className="form-help">
          Paste your JSON dataset. Supports single object or array of objects.
          Each must have: instruction, input, output fields.
        </p>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={loading}
        style={{ width: '100%' }}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Uploading...
          </>
        ) : (
          '🚀 Upload Dataset'
        )}
      </button>
    </form>
  );
}
