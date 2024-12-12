import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ConversationDetails } from "@/types/api/responses";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

type Chat = {
    role: "user" | "assistant";
    content: string;
};

export const Chat = () => {
    const [conversation, setConversation] =
        useState<ConversationDetails | null>(null);
    const [chat, setChat] = useState<Chat[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { chatId: id } = useParams();

    if (!id) {
        return <Navigate to="/chat" replace />;
    }

    useEffect(() => {
        const fetchConversation = async () => {
            if (!id) return;

            try {
                const response = await api<ConversationDetails>(
                    `/conversation/${id}`
                );
                setConversation(response);
                setChat(response.messages);
            } catch (error) {
                console.error("Error fetching conversation:", error);
            }
        };

        fetchConversation();
    }, [id]);

    const addMessageToConversation = (message: Chat) => {
        if (!conversation) return;
        setChat((prevChat) => [...prevChat, message]);
    };

    const fetchChatResponse = async (message: string): Promise<string> => {
        try {
            const data = await api<{ response: string }>("/chat", {
                method: "POST",
                body: {
                    message,
                    model: "llama3.2:3b",
                    conversation_id: id,
                },
            });
            return data.response;
        } catch (error) {
            console.error("Error fetching:", error);
            return "Error fetching response :(";
        }
    };

    const handleSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;

        setInput("");
        setIsLoading(true);

        addMessageToConversation({
            role: "user",
            content: input,
        });

        const reply = await fetchChatResponse(input);
        addMessageToConversation({
            role: "assistant",
            content: reply,
        });

        setIsLoading(false);
    };

    return (
        <>
            <div className="h-full w-full max-w-4xl px-12 py-12">
                {chat?.map((message, index) =>
                    message.role === "user" ? (
                        <div key={index} className="flex justify-end mt-8">
                            <div className="max-w-[80%] px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg">
                                {message.content}
                            </div>
                        </div>
                    ) : (
                        <div key={index} className="flex justify-start mt-8">
                            <div className="flex gap-4">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage
                                        src="https://github.com/shadcn.png"
                                        alt="@shadcn"
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div className="max-w-[80%] bg-secondary rounded-lg px-4 py-2 text-sm">
                                    {message.content}
                                </div>
                            </div>
                        </div>
                    )
                )}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-4 items-center">
                            <Avatar className="w-8 h-8">
                                <AvatarImage
                                    src="https://github.com/shadcn.png"
                                    alt="@shadcn"
                                />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <Loader2 className="animate-spin" />
                        </div>
                    </div>
                )}
            </div>
            <div className="w-full max-w-4xl sticky bottom-0 bg-background px-12 py-8 rounded-b-xl">
                <Input
                    placeholder="Ask me anything"
                    className="h-12 rounded-xl"
                    onKeyDown={handleSubmit}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
            </div>
        </>
    );
};
