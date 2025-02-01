import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Chat } from "./features/Chat";
import { Header } from "./features/Header";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";

// Layout component for routes that need sidebar
const SidebarLayout = () => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="w-full h-full flex flex-col items-center justify-between">
                    <Header />
                    <Routes>
                        <Route path="/chat/:chatId" element={<Chat />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route
                            index
                            element={<Navigate to="/chat" replace />}
                        />
                    </Routes>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={<SidebarLayout />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
