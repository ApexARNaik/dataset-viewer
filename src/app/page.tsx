import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getStats() {
  const teammates = await prisma.teammate.findMany({
    include: {
      _count: {
        select: { datasets: true }
      }
    }
  });

  const totalDatasets = await prisma.dataset.count();

  const recentDatasets = await prisma.dataset.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { uploadedBy: true }
  });

  return { teammates, totalDatasets, recentDatasets };
}

export default async function HomePage() {
  const { teammates, totalDatasets, recentDatasets } = await getStats();
  const maxCount = Math.max(...teammates.map(t => t._count.datasets), 1);

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
        <h1>Dataset Viewer</h1>
        <p>Visualize and track your financial advisor AI training datasets</p>
      </section>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalDatasets}</div>
          <div className="stat-label">Total Datasets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{teammates.length}</div>
          <div className="stat-label">Team Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {totalDatasets > 0 ? Math.round(totalDatasets / teammates.length) : 0}
          </div>
          <div className="stat-label">Avg per Member</div>
        </div>
        <div className="stat-card">
          <Link href="/upload" className="btn btn-primary" style={{ width: '100%' }}>
            ➕ Upload New
          </Link>
        </div>
      </div>

      {/* Team Stats */}
      <section className="teammate-stats">
        <h2>📊 Upload Statistics by Teammate</h2>
        {teammates.map((teammate) => (
          <div key={teammate.id} className="teammate-bar">
            <span className="teammate-name">{teammate.name}</span>
            <div className="bar-container">
              <div 
                className="bar-fill" 
                style={{ width: `${Math.max((teammate._count.datasets / maxCount) * 100, 5)}%` }}
              >
                <span className="bar-count">{teammate._count.datasets}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Datasets */}
      <section style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>🕐 Recent Uploads</h2>
          <Link href="/datasets" className="btn btn-secondary">View All →</Link>
        </div>

        {recentDatasets.length === 0 ? (
          <div className="empty-state">
            <h3>No datasets yet</h3>
            <p>Be the first to upload a dataset!</p>
            <Link href="/upload" className="btn btn-primary" style={{ marginTop: '20px' }}>
              Upload Dataset
            </Link>
          </div>
        ) : (
          <div className="datasets-grid">
            {recentDatasets.map((dataset) => (
              <article key={dataset.id} className="dataset-card">
                <div className="dataset-header">
                  <div className="dataset-meta">
                    <span className="uploader-badge">
                      👤 {dataset.uploadedBy.name}
                    </span>
                    <span className="date-badge">
                      {new Date(dataset.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="dataset-section">
                  <div className="section-label">📋 Instruction</div>
                  <p className="instruction-text">
                    {dataset.instruction.length > 200 
                      ? dataset.instruction.slice(0, 200) + '...' 
                      : dataset.instruction}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
