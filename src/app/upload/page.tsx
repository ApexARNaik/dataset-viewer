import prisma from '@/lib/prisma';
import UploadForm from '@/components/UploadForm';

export const dynamic = 'force-dynamic';

async function getTeammates() {
  return await prisma.teammate.findMany({
    select: { id: true, name: true }
  });
}

export default async function UploadPage() {
  const teammates = await getTeammates();

  return (
    <div className="container">
      <div className="form-container">
        <UploadForm teammates={teammates} />
      </div>
    </div>
  );
}
