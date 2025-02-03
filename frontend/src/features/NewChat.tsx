import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/utils/api";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatInput } from "./ChatInput";
import { Conversation } from "@/types/api/responses";

export const NewChat = () => {
    const [input, setInput] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = async (
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            await handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (input.length === 0 || input.trim().length === 0 || isLoading)
            return;

        setIsLoading(true);
        try {
            const response = await api<Conversation>("/conversation", {
                method: "POST",
                body: { message: input, title: "New Chat", assistant_id: 1 },
            });
            const queryParams = new URLSearchParams();
            queryParams.set("input", input);
            navigate(`/chat/${response.data.id}?${queryParams.toString()}`, {
                replace: true,
            });
        } catch (error) {
            console.error("Error creating conversation:", error);
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="h-full w-full max-w-4xl px-12 pt-12 pb-12">
                {/* Optional: Add welcome message or suggestions here */}
                <div className="flex justify-start mt-8">
                    <div className="flex gap-4">
                        <Avatar className="w-8 h-8">
                            <AvatarImage
                                src="https://github.com/shadcn.png"
                                alt="@shadcn"
                            />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="max-w-[100%] bg-secondary rounded-lg px-4 py-2 text-sm">
                            How can I help you today?
                        </div>
                    </div>
                </div>
            </div>
            <ChatInput
                input={input}
                setInput={setInput}
                textareaRef={textareaRef}
                handleKeyDown={handleKeyDown}
                handleSubmit={handleSubmit}
            />
        </>
    );
};
