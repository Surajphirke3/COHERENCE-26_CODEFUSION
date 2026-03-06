// src/app/(dashboard)/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton variant="text" className="w-64 h-8" />
        <Skeleton variant="text" className="w-96 h-5" />
      </div>

      {/* Main Content Skeleton Area */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-[120px]" />
        ))}
      </div>

      <div className="space-y-4 pt-6">
        <Skeleton variant="text" className="w-48 h-6" />
        <Skeleton variant="card" className="h-[300px]" />
      </div>
    </div>
  );
}
