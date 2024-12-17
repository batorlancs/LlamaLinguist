import * as React from "react";
import {
    AudioWaveform,
    Command,
    GalleryVerticalEnd,
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
    navMain: [],
};

type Project = {
    id: number;
    name: string;
    url: string;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [projects, setProjects] = React.useState<Project[]>(() => {
        const cached = sessionStorage.getItem("projects");
        try {
            return cached ? JSON.parse(cached) : [];
        } catch (error) {
            console.error(
                "Error parsing projects from session storage:",
                error
            );
            return [];
        }
    });

    React.useEffect(() => {
        const fetchConversations = async () => {
            try {
                // Only fetch if we don't have projects
                if (projects.length === 0) {
                    const conversations =
                        await api<Conversation[]>("/conversations");
                    const newProjects = conversations.map((conversation) => ({
                        id: conversation.id,
                        name: conversation.title,
                        url: `/chat/${conversation.id}`,
                        icon: MessageCircle,
                    }));

                    sessionStorage.setItem(
                        "projects",
                        JSON.stringify(newProjects)
                    );
                    setProjects(newProjects);
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        fetchConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                {/* <NavMain items={data.navMain} /> */}
                <NavProjects projects={projects} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    );
}
