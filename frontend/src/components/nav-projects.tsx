import {
    HelpCircle,
    MessageCircle,
    MoreHorizontal,
    Pencil,
    Plus,
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
import { Project } from "./app-sidebar";
import { Button } from "./ui/button";

type NavProjectsProps = {
    projects: Project[];
    deleteConversation: (id: number) => void;
    editConversation: (id: number) => void;
    createConversation: () => void;
};

export function NavProjects({
    projects,
    deleteConversation,
    editConversation,
    createConversation,
}: NavProjectsProps) {
    const { isMobile } = useSidebar();
    const navigate = useNavigate();
    const id = window.location.pathname.split("/").pop();

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
                Conversations
                <Button
                    onClick={createConversation}
                    className="h-5 w-5"
                    size="icon"
                    variant="outline"
                >
                    <Plus />
                </Button>
            </SidebarGroupLabel>
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
                                <DropdownMenuItem
                                    onClick={() => deleteConversation(item.id)}
                                >
                                    <Trash2 className="text-muted-foreground" />
                                    <span>Delete Conversation</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => editConversation(item.id)}
                                >
                                    <Pencil className="text-muted-foreground" />
                                    <span>Edit Conversation</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <HelpCircle className="text-muted-foreground" />
                                    <span>Help</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                ))}
                {/* <SidebarMenuItem>
                    <SidebarMenuButton className="text-sidebar-foreground/70">
                        <MoreHorizontal className="text-sidebar-foreground/70" />
                        <span>More</span>
                    </SidebarMenuButton>
                </SidebarMenuItem> */}
            </SidebarMenu>
        </SidebarGroup>
    );
}
