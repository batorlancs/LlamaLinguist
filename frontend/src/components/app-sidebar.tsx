import * as React from "react";
import { GalleryVerticalEnd, Minus, Plus } from "lucide-react";
import { SearchForm } from "./search-form";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { api } from "@/utils/api";
import { Conversation } from "@/types/api/responses";

interface NavItem {
	title: string;
	url: string;
    isActive: boolean;
}

interface NavSection {
	title: string;
	url: string;
	items: NavItem[];
}

interface NavData {
	navMain: NavSection[];
}

// const data: NavData = {
// 	navMain: [
// 		{
// 			title: "Getting Started",
// 			url: "#",
// 			items: [
// 				{
// 					title: "Installation",
// 					url: "#",
// 				},
// 				{
// 					title: "Project Structure", 
// 					url: "#",
// 				},
// 			],
// 		},
// 	],
// };


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const [data, setData] = React.useState<NavData>({
        navMain: []
    });

	React.useEffect(() => {
		const fetchConversations = async () => {
			try {
				const conversations = await api<Conversation[]>("/conversations");
                console.log(conversations)
                
                // group the conversations by assistant_id
                const groupedConversations = conversations.reduce<Record<number, Conversation[]>>((acc, conversation) => {
                    if (!acc[conversation.assistant_id]) {
                        acc[conversation.assistant_id] = [];
                    }
                    acc[conversation.assistant_id].push(conversation);
                    return acc;
                }, {});

                console.log(groupedConversations)

                // Convert the grouped conversations into the NavData format
                const navMain = Object.entries(groupedConversations).map(([assistantId, conversations]) => ({
                    title: `Assistant ${assistantId}`,
                    url: "#",
                    items: conversations.map((conv) => ({
                        title: conv.title,
                        url: `/chat/${conv.id}`,
                        isActive: false,
                    })),
                }));

                setData({ navMain });

			} catch (error) {
				console.error("Error fetching conversations:", error);
			}
		};

		fetchConversations();
	}, []);


	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<a href="#">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<GalleryVerticalEnd className="size-4" />
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-semibold">
										Documentation
									</span>
									<span className="">v1.0.0</span>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				<SearchForm />
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						{data.navMain.map((item, index) => (
							<Collapsible
								key={item.title}
								defaultOpen={index === 1}
								className="group/collapsible"
							>
								<SidebarMenuItem>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton>
											{item.title}{" "}
											<Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
											<Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									{item.items?.length ? (
										<CollapsibleContent>
											<SidebarMenuSub>
												{item.items.map((item) => (
													<SidebarMenuSubItem
														key={item.title}
													>
														<SidebarMenuSubButton
															asChild
															isActive={
																item.isActive
															}
														>
															<a href={item.url}>
																{item.title}
															</a>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												))}
											</SidebarMenuSub>
										</CollapsibleContent>
									) : null}
								</SidebarMenuItem>
							</Collapsible>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
