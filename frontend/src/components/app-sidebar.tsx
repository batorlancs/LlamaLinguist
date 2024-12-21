import * as React from "react";
import {
    AudioWaveform,
    Command,
    GalleryVerticalEnd,
    Loader2,
    MessageCircle,
} from "lucide-react";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { Conversation } from "@/types/api/responses";
import { api } from "@/utils/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    teams: [
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
    const [projects, setProjects] = useState<Project[]>([]);
    const navigate = useNavigate();

    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            const conversations = await api<Conversation[]>("/conversations");
            const newProjects = conversations.map((conversation) => ({
                id: conversation.id,
                name: conversation.title,
                url: `/chat/${conversation.id}`,
                icon: MessageCircle,
            }));

            sessionStorage.setItem("projects", JSON.stringify(newProjects));
            setProjects(newProjects);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const createConversation = async () => {
        const conversation = await api<Conversation>("/conversation", {
            method: "POST",
            body: {
                title: "New Conversation",
                assistant_id: 1,
            },
        });
        await fetchConversations();
        navigate(`/chat/${conversation.id}`);
    };

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
        <Sidebar {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                {isLoading ? (
                    <div className="flex items-center justify-center mt-10">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : (
                    <NavProjects
                        projects={projects}
                        deleteConversation={deleteConversation}
                        editConversation={editConversation}
                        createConversation={createConversation}
                    />
                )}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    );
}
