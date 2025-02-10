import * as React from "react";
import {
    AudioWaveform,
    Command,
    GalleryVerticalEnd,
    Loader2,
    Plus,
} from "lucide-react";
import { ConversationList } from "./components/ConversationList";
import { UserMenu } from "./components/UserMenu";
import { AssistantPicker } from "./components/AssistantPicker";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Conversation } from "@/types/api/responses";
import { api } from "@/utils/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const data = {
    assistants: [
        {
            name: "Acme Inc",
            logo: GalleryVerticalEnd,
            plan: "Enterprise",
        },
        {
            name: "Acme Corp.",
            logo: AudioWaveform,
            plan: "Startup",
        },
        {
            name: "Evil Corp.",
            logo: Command,
            plan: "Free",
        },
    ],
};

export type Project = {
    id: number;
    name: string;
    url: string;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [isLoading, setIsLoading] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const navigate = useNavigate();

    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            const response = await api<Conversation[]>("/conversations");
            setConversations(response.data);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const deleteConversation = async (id: number) => {
        await api<any>(`/conversation/${id}`, {
            method: "DELETE",
        });
        await fetchConversations();
    };

    const editConversation = async (id: number) => {
        console.log("editing project", id);
    };

    return (
        <Sidebar {...props} className="z-20">
            <SidebarHeader>
                <AssistantPicker assistants={data.assistants} />
            </SidebarHeader>
            <SidebarContent className="p-2">
                <SidebarGroup>
                    <SidebarMenuButton
                        asChild
                        variant="outline"
                        className="bg-transparent cursor-pointer"
                        onClick={() => navigate("/chat/new")}
                    >
                        <div>
                            <Plus />
                            <span>New Chat</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarGroup>
                {isLoading ? (
                    <div className="flex items-center justify-center mt-10">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : (
                    <ConversationList
                        conversations={conversations}
                        deleteConversation={deleteConversation}
                        editConversation={editConversation}
                    />
                )}
            </SidebarContent>
            <SidebarFooter>
                <UserMenu />
            </SidebarFooter>
        </Sidebar>
    );
}
