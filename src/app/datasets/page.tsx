import prisma from '@/lib/prisma';
import DatasetCard from '@/components/DatasetCard';
import ExportButtons from '@/components/ExportButtons';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ uploader?: string }>;
}

async function getDatasets(uploaderFilter?: string) {
  const where = uploaderFilter ? { uploadedBy: { name: uploaderFilter } } : {};
  
  return await prisma.dataset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { uploadedBy: true }
  });
}

async function getTeammates() {
  return await prisma.teammate.findMany({
    select: { name: true }
  });
}

export default async function DatasetsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const uploaderFilter = params.uploader;
  const [datasets, teammates] = await Promise.all([
    getDatasets(uploaderFilter),
    getTeammates()
  ]);

  // Serialize dates for client component
  const serializedDatasets = datasets.map(d => ({
    ...d,
    createdAt: d.createdAt
  }));

  return (
    <div className="container">
      <div className="page-header">
        <h1>📚 Browse Datasets</h1>
        <p>View all uploaded financial advisor training datasets</p>
      </div>

      {/* Export Section */}
      <section className="export-section">
        <h3>Download Combined Datasets</h3>
        <ExportButtons datasets={serializedDatasets} />
      </section>

      {/* Filters */}
      <div className="filters">
        <Link 
          href="/datasets" 
          className={`filter-select ${!uploaderFilter ? 'active' : ''}`}
          style={{ 
            textDecoration: 'none',
            background: !uploaderFilter ? 'var(--accent-primary)' : undefined,
            color: !uploaderFilter ? 'white' : undefined
          }}
        >
          All Uploaders
        </Link>
        {teammates.map((t) => (
          <Link 
            key={t.name}
            href={`/datasets?uploader=${t.name}`}
            className="filter-select"
            style={{ 
              textDecoration: 'none',
              background: uploaderFilter === t.name ? 'var(--accent-primary)' : undefined,
              color: uploaderFilter === t.name ? 'white' : undefined
            }}
          >
            {t.name}
          </Link>
        ))}
      </div>

      {/* Results Info */}
      <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
        Showing {datasets.length} dataset{datasets.length !== 1 ? 's' : ''}
        {uploaderFilter && ` by ${uploaderFilter}`}
      </p>

      {/* Dataset Cards */}
      {datasets.length === 0 ? (
        <div className="empty-state">
          <h3>No datasets found</h3>
          <p>
            {uploaderFilter 
              ? `No datasets uploaded by ${uploaderFilter} yet.`
              : 'Be the first to upload a dataset!'}
          </p>
          <Link href="/upload" className="btn btn-primary" style={{ marginTop: '20px' }}>
            Upload Dataset
          </Link>
        </div>
      ) : (
        <div className="datasets-grid">
          {datasets.map((dataset) => (
            <DatasetCard key={dataset.id} dataset={dataset} />
          ))}
        </div>
      )}
    </div>
  );
}
