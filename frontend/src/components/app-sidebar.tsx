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

const data = {
	navMain: [
		{
			title: "Getting Started",
			url: "#",
			items: [
				{
					title: "Installation",
					url: "#",
				},
				{
					title: "Project Structure",
					url: "#",
				},
			],
		},
		{
			title: "Building Your Application",
			url: "#",
			items: [
				{
					title: "Routing",
					url: "#",
				},
				{
					title: "Data Fetching",
					url: "#",
					isActive: true,
				},
				{
					title: "Rendering",
					url: "#",
				},
				{
					title: "Caching",
					url: "#",
				},
				{
					title: "Styling",
					url: "#",
				},
				{
					title: "Optimizing",
					url: "#",
				},
				{
					title: "Configuring",
					url: "#",
				},
				{
					title: "Testing",
					url: "#",
				},
				{
					title: "Authentication",
					url: "#",
				},
				{
					title: "Deploying",
					url: "#",
				},
				{
					title: "Upgrading",
					url: "#",
				},
				{
					title: "Examples",
					url: "#",
				},
			],
		},
		{
			title: "API Reference",
			url: "#",
			items: [
				{
					title: "Components",
					url: "#",
				},
				{
					title: "File Conventions",
					url: "#",
				},
				{
					title: "Functions",
					url: "#",
				},
				{
					title: "next.config.js Options",
					url: "#",
				},
				{
					title: "CLI",
					url: "#",
				},
				{
					title: "Edge Runtime",
					url: "#",
				},
			],
		},
		{
			title: "Architecture",
			url: "#",
			items: [
				{
					title: "Accessibility",
					url: "#",
				},
				{
					title: "Fast Refresh",
					url: "#",
				},
				{
					title: "Next.js Compiler",
					url: "#",
				},
				{
					title: "Supported Browsers",
					url: "#",
				},
				{
					title: "Turbopack",
					url: "#",
				},
			],
		},
		{
			title: "Community",
			url: "#",
			items: [
				{
					title: "Contribution Guide",
					url: "#",
				},
			],
		},
	],
};

// type Conversation = {
// 	id: number;
// 	title: string;
// 	created_at: string;
// 	updated_at: string;
// 	assistant: {
// 		id: number;
// 		name: string;
// 		model: string;
// 	};
// };


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

	React.useEffect(() => {
		const fetchConversations = async () => {
			try {
				const response = await fetch("http://localhost:8000/conversations", {
					method: "GET",
                    headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
					credentials: "include",
					mode: "cors",
				});
				const data = await response.json();
				console.log(`data: ${JSON.stringify(data)}`);
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
