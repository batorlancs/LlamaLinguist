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
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { Conversation as ConversationType } from "@/types/api/responses";

type ConversationProps = {
    item: ConversationType;
    id: string;
    deleteConversation: (id: number) => void;
    editConversation: (id: number) => void;
};

export function Conversation({
    item,
    id,
    deleteConversation,
    editConversation,
}: ConversationProps) {
    const { isMobile } = useSidebar();
    const navigate = useNavigate();

    return (
        <SidebarMenuItem key={item.id}>
            {/* Sidebar menu button */}
            <SidebarMenuButton
                asChild
                isActive={item.id.toString() === id}
                onClick={(e) => {
                    e.preventDefault();
                    navigate(`/chat/${item.id}`);
                }}
                className="cursor-pointer"
            >
                <MessageCircle />
                {item.title}
            </SidebarMenuButton>

            {/* Dropdown menu */}
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
                    <DropdownMenuItem onClick={() => editConversation(item.id)}>
                        <Pencil className="text-muted-foreground" />
                        Edit Conversation
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <HelpCircle className="text-muted-foreground" />
                        Help
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
}
