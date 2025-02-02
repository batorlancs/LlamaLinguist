import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonImageCard() {
    return (
        <div className="flex flex-col items-center">
            <Skeleton className="h-24 w-24 bg-muted" />
            <Skeleton className="h-5 w-12 mt-2 bg-muted" />
        </div>
    );
}
