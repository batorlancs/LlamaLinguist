import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConversationDetails } from "@/types/api/responses";
import { api } from "@/utils/api";
import { Info, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Markdown from "./Markdown";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import React from "react";

type Chat = {
    role: "user" | "assistant";
    content: string;
};

export const Chat = () => {
    const [conversation, setConversation] =
        useState<ConversationDetails | null>(null);
    const [chat, setChat] = useState<Chat[]>([]);
    const [input, setInput] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const { chatId: id } = useParams();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const lastMessageRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chat]);

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

        setInput("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.scrollTop = 0;
        }
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
            <div className="h-full w-full max-w-4xl px-12 pt-12 pb-12">
                {chat?.map((message, index) =>
                    message.role === "user" ? (
                        <div
                            key={index}
                            className="flex justify-end mt-8"
                            ref={
                                index === chat.length - 1
                                    ? lastMessageRef
                                    : null
                            }
                        >
                            <div className="max-w-[80%] px-4 py-2 bg-primary rounded-lg">
                                <div className="prose text-primary-foreground text-sm whitespace-pre-wrap">
                                    {message.content &&
                                    message.content.trim() !== "" ? (
                                        <span>{message.content}</span>
                                    ) : (
                                        <span className="opacity-60">
                                            {"( empty )"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            key={index}
                            className="flex justify-start mt-8"
                            ref={
                                index === chat.length - 1
                                    ? lastMessageRef
                                    : null
                            }
                        >
                            <div className="flex gap-4">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage
                                        src="https://github.com/shadcn.png"
                                        alt="@shadcn"
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div className="max-w-[100%] bg-secondary rounded-lg px-4 py-2 text-sm">
                                    <Markdown message={message.content} />
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
            <div className="w-full max-w-4xl sticky bg-background bottom-0 px-12 pb-6">
                <div className="bg-secondary rounded-lg ring-1 ring-secondary-foreground/10 ring-offset-4 ring-offset-background">
                    <div className="flex flex-row items-start p-2">
                        <Textarea
                            placeholder="Ask me anything"
                            className="rounded-none p-0 m-2 min-h-12 max-h-96 resize-none ring-0 shadow-none ring-transparent border-0 border-transparent focus:ring-transparent focus-visible:ring-transparent scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent"
                            value={input}
                            ref={textareaRef}
                            onChange={(e) => {
                                e.target.style.height = "auto";
                                e.target.style.height =
                                    e.target.scrollHeight + "px";
                                setInput(e.target.value);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        <Button
                            size="icon"
                            className="opacity-50 hover:bg-opacity-10 hover:opacity-100 rounded-lg"
                            variant="ghost"
                            onClick={handleSubmit}
                        >
                            <Send />
                        </Button>
                    </div>
                </div>
                <div className="text-xs text-muted-foreground mt-3 opacity-80 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <p>
                        Hit <kbd>Enter</kbd> to send, <kbd>Shift</kbd> +{" "}
                        <kbd>Enter</kbd> for a new line
                    </p>
                </div>
            </div>
        </>
    );
};
