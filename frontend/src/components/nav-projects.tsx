import {
    Folder,
    Forward,
    MessageCircle,
    MoreHorizontal,
    Trash2,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

export function NavProjects({
    projects,
}: {
    projects: {
        id: number;
        name: string;
        url: string;
    }[];
}) {
    const { isMobile } = useSidebar();
    const navigate = useNavigate();
    const id = window.location.pathname.split("/").pop();

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Conversations</SidebarGroupLabel>
            <SidebarMenu>
                {projects.map((item) => (
                    <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                            asChild
                            isActive={item.id.toString() === id}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(`/chat/${item.id}`);
                            }}
                            className="cursor-pointer"
                        >
                            <div>
                                <MessageCircle />
                                <span>{item.name}</span>
                            </div>
                        </SidebarMenuButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuAction showOnHover>
                                    <MoreHorizontal />
                                    <span className="sr-only">More</span>
                                </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-48 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align={isMobile ? "end" : "start"}
                            >
                                <DropdownMenuItem>
                                    <Folder className="text-muted-foreground" />
                                    <span>View Project</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Forward className="text-muted-foreground" />
                                    <span>Share Project</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Trash2 className="text-muted-foreground" />
                                    <span>Delete Project</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                    <SidebarMenuButton className="text-sidebar-foreground/70">
                        <MoreHorizontal className="text-sidebar-foreground/70" />
                        <span>More</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}
