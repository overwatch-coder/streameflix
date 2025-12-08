import { Skeleton } from "@/components/ui/skeleton";

export default function MovieCardSkeleton() {
  return (
    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/50 to-transparent">
        <Skeleton className="h-4 w-3/4 mb-1" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/6" />
        </div>
      </div>
    </div>
  );
}
