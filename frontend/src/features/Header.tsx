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
        <header className="w-full flex sticky z-50 top-0 bg-background h-16 shrink-0 items-center justify-between px-4">
            <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-2">
                <ModeToggle />
            </div>
        </header>
    );
};
