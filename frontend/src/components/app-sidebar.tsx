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
    const [projects, setProjects] = React.useState<Project[]>([]);

    React.useEffect(() => {
        const fetchConversations = async () => {
            try {
                // Check session storage first
                const cachedProjects = sessionStorage.getItem("projects");
                if (cachedProjects) {
                    try {
                        const parsedProjects = JSON.parse(cachedProjects);
                        setProjects(parsedProjects);
                        console.log("cachedProjects", parsedProjects);
                        return;
                    } catch (parseError) {
                        console.error(
                            "Error parsing cached projects:",
                            parseError
                        );
                        // Continue to fetch fresh data if parsing fails
                        sessionStorage.removeItem("projects");
                    }
                }

                const conversations =
                    await api<Conversation[]>("/conversations");
                console.log("conversations", conversations);
                const projects = conversations.map((conversation) => ({
                    id: conversation.id,
                    name: conversation.title,
                    url: `/chat/${conversation.id}`,
                    icon: MessageCircle,
                }));

                // Save to session storage
                sessionStorage.setItem("projects", JSON.stringify(projects));
                setProjects(projects);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        fetchConversations();
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
