import {
    HelpCircle,
    MessageCircle,
    MoreHorizontal,
    Pencil,
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
import { Conversation } from "@/types/api/responses";

type NavProjectsProps = {
    conversations: Conversation[];
    deleteConversation: (id: number) => void;
    editConversation: (id: number) => void;
};

export function ConversationList({
    conversations,
    deleteConversation,
    editConversation,
}: NavProjectsProps) {
    const { isMobile } = useSidebar();
    const navigate = useNavigate();
    const id = window.location.pathname.split("/").pop();

    return (
        <SidebarGroup>
            {conversations && conversations.length == 0 ? (
                <SidebarGroupLabel>No conversations</SidebarGroupLabel>
            ) : (
                <SidebarGroupLabel>Recent</SidebarGroupLabel>
            )}
            <SidebarMenu>
                {conversations?.map((item) => (
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
                                <span>{item.title}</span>
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
