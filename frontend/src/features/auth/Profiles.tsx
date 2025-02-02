import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageCardList } from "./components/ImageCardList";
import { apiPublic } from "@/utils/api";
import { useEffect, useState } from "react";
import { HttpError } from "@/utils/errors";

export function Profiles({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [users, setUsers] = useState<string[] | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const users = (await apiPublic<string[]>("/auth/public/users"))
                .data;
            setUsers(users);
        } catch (error) {
            if (error instanceof HttpError) {
                setError(
                    `The server returned an error, please try again later. Details: ${error.status} ${error.message}`
                );
            } else {
                setError("An unknown error occurred, please try again later.");
            }
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <a
                            href="#"
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md">
                                <GalleryVerticalEnd className="size-6" />
                            </div>
                            <span className="sr-only">Acme Inc.</span>
                        </a>
                        <h1 className="text-xl font-bold">
                            Welcome to Llama Linguist!
                        </h1>
                        <div className="text-center text-sm text-muted-foreground">
                            Select an existing profile
                        </div>
                    </div>
                </div>
            </form>
            <div className="p-4">
                <ImageCardList users={users} fetchUsers={fetchUsers} />
            </div>
            {error && (
                <div className="text-balance text-center text-destructive">
                    {error}
                </div>
            )}
            <div className="text-balance text-center text-xs text-muted-foreground">
                Creating a password-protected profile is{" "}
                <span className="underline">recommended</span>.
                <br /> You may also use the{" "}
                <span className="font-bold">guest profile</span>, accessible to
                anyone on this device.
            </div>
        </div>
    );
}
