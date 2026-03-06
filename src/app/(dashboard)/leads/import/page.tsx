// src/app/(dashboard)/leads/import/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { LeadImporter } from '@/components/leads/LeadImporter';

export default function LeadImportPage() {
  const router = useRouter();

  return (
    <div>
      <PageHeader title="Import Leads" subtitle="Upload a CSV or XLSX file to import leads">
        <Button variant="secondary" icon={<ArrowLeft size={16} />} onClick={() => router.push('/leads')}>
          Back to Leads
        </Button>
      </PageHeader>

      <div className="p-6 max-w-3xl">
        <LeadImporter />
      </div>
    </div>
  );
}
