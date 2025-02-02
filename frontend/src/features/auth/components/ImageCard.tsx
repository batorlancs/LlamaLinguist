import { CustomAvatar } from "@/components/custom-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

type ImageCardProps = {
    label: string;
    content: React.ReactNode;
    onClick: () => void;
    hoverEffect?: boolean;
    className?: string;
    cardClassName?: string;
};

export function ImageCard({
    label,
    onClick,
    content,
    hoverEffect = true,
    className,
    cardClassName,
}: ImageCardProps) {
    return (
        <div className={cn("w-24 flex flex-col items-center", className)}>
            <Card
                className={cn(
                    "w-full h-24 overflow-hidden cursor-pointer group",
                    "transition-all duration-300 ease-in-out",
                    "hover:scale-105 hover:shadow-lg",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    cardClassName
                )}
                onClick={onClick}
                tabIndex={0}
                role="button"
                aria-label={`View ${label}`}
            >
                <CardContent className="p-0 h-full relative flex items-center justify-center">
                    {content}
                    {hoverEffect && (
                        <div
                            className={cn(
                                "absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 transition-all duration-300 ease-in-out",
                                "group-hover:opacity-20"
                            )}
                        />
                    )}
                </CardContent>
            </Card>
            <div className="w-full overflow-hidden">
                <p className="mt-2 text-sm font-medium text-center truncate">
                    {label}
                </p>
            </div>
        </div>
    );
}

type ImageCardAvatarProps = Omit<ImageCardProps, "content">;

export function ImageCardAvatar({ label, onClick }: ImageCardAvatarProps) {
    return (
        <ImageCard
            label={label}
            onClick={onClick}
            content={<CustomAvatar value={label} size={100} radius={10} />}
        />
    );
}

type ImageCardNewProps = Omit<ImageCardProps, "content" | "label">;

export function ImageCardNew({ onClick }: ImageCardNewProps) {
    return (
        <ImageCard
            label=""
            onClick={onClick}
            content={<PlusCircle className="size-6" />}
            hoverEffect={false}
            cardClassName="opacity-50"
        />
    );
}
