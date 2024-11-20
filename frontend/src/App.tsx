import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Chat } from "./features/Chat";
import { Header } from "./features/Header";

const App = () => {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="flex flex-col items-center">
                <Header />
                <Chat />
			</SidebarInset>
		</SidebarProvider>
	);
};

export default App;
