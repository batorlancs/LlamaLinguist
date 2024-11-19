import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Chat = {
	role: "user" | "assistant";
	content: string;
};

export const Chat = () => {
	const [chat, setChat] = useState<Chat[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const fetchChatResponse = async (messages: Chat[]): Promise<Chat[]> => {
		try {
			const response = await fetch("http://localhost:8000/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({ 
					messages,
					model: "llama3.2:3b" 
				}),
				credentials: "include",
				mode: "cors",
			});

			const data = await response.json();

            console.log(data);

			if (!response.ok || !data) {
				throw new Error("Failed to get response");
			}

			return [...messages, { 
				role: "assistant", 
				content: data.response 
			}];
		} catch (error) {
			console.error("Error fetching:", error);
			return [...messages, { 
				role: "assistant", 
				content: "Error fetching response :(" 
			}];
		}
	};

	const handleSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== "Enter") return;

		const userMessage = { 
			role: "user" as const, 
			content: input 
		};

		setInput("");
		setIsLoading(true);
		
		const currChat = [...chat, userMessage];
        setChat(currChat);
        const newChat = await fetchChatResponse(currChat);
        setChat(newChat);
        setIsLoading(false);
	};

	return (
		<div className="h-full max-w-full flex flex-col justify-between items-center p-12">
			<div className="w-[60%] max-w-3xl h-full flex flex-col justify-between mb-12">
                <ScrollArea className="h-[70%] mb-12 p-4 rounded-md border">
                    {chat.map((message, index) => (
                        message.role === "user" ? (
                            <div key={index} className="flex justify-end mt-4">
                                <div className="max-w-[80%] px-2 py-1 bg-secondary rounded-lg">{message.content}</div>
                            </div>
                        ) : (
                            <div key={index} className="flex justify-start mt-2">
                                <div className="flex gap-4">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <div className="max-w-[80%]">{message.content}</div>
                                </div>
                            </div>
                        )
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-4 items-center">
                                <Avatar className="w-8 h-8">
                                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                            <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                <Loader2 className="animate-spin" />
                            </div>
                        </div>
                    )}
                </ScrollArea>
                <div className="w-full">
                    <Input 
                        placeholder="Ask me anything" 
                        className="w-full"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleSubmit}
                    />
                </div>
            </div>
		</div>
	);
};
