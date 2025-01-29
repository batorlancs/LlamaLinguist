import { ModeToggle } from "@/components/mode-toggle";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

export const Header = () => {
    const [id, setId] = useState(window.location.pathname.split("/").pop());
    useEffect(() => {
        // Update ID when URL changes
        const handleLocationChange = () => {
            setId(window.location.pathname.split("/").pop());
        };
        // Listen for URL changes
        window.addEventListener("popstate", handleLocationChange);

        // Cleanup listener
        return () => {
            window.removeEventListener("popstate", handleLocationChange);
        };
    }, []);

    return (
        <header className="w-full flex sticky z-10 top-0 h-16 shrink-0 items-center justify-between px-4">
            <div className="absolute top-0 h-16 w-full bg-background" />
            <div className="absolute inset-x-0 -bottom-6 h-6 z-5 pointer-events-none bg-gradient-to-b from-background to-transparent" />
            <div className="flex items-center gap-2 z-20">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href="#">
                                Conversation
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{id}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex items-center gap-2 z-20">
                <ModeToggle />
            </div>
        </header>
    );
};
