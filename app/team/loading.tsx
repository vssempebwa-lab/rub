import { MarketingPage } from '@/components/layout/marketing-page';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeamLoading() {
  return (
    <MarketingPage>
      <section className="py-20 lg:py-28 bg-muted/20 border-b">
        <div className="max-w-4xl mx-auto px-4 text-center sm:px-6 lg:px-8">
          <Skeleton className="mx-auto mb-6 h-12 w-12 rounded-md" />
          <Skeleton className="mx-auto h-14 w-64 max-w-full" />
          <Skeleton className="mx-auto mt-6 h-6 w-full max-w-2xl" />
          <Skeleton className="mx-auto mt-3 h-6 w-4/5 max-w-xl" />
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-xl border bg-card">
                <Skeleton className="aspect-[4/5] w-full rounded-none" />
                <div className="space-y-3 p-6">
                  <Skeleton className="h-7 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
