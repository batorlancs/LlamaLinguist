import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConversationWithMessages } from "@/types/api/responses";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Markdown from "./Markdown";
import React from "react";
import { ChatInput } from "./ChatInput";

type Chat = {
    role: "user" | "assistant";
    content: string;
};

export const CustomKbd = ({ children }: { children: React.ReactNode }) => {
    return (
        <span className="bg-muted rounded-md px-1.5 py-0.5 text-muted-foreground">
            {children}
        </span>
    );
};

export const Chat = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const inputFromUrl = queryParams.get("input");

    const [conversation, setConversation] =
        useState<ConversationWithMessages | null>(null);
    const [chat, setChat] = useState<Chat[]>([]);
    const [input, setInput] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const { chatId: id } = useParams();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = async (
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            await handleSubmit(input);
        }
    };

    const handleSubmit = async (input: string) => {
        if (input.length === 0 || input.trim().length === 0 || isLoading)
            return;

        setInput("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.scrollTop = 0;
        }
        setIsLoading(true);

        console.log("input", input);
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

    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chat]);

    useEffect(() => {
        const fetchConversation = async () => {
            if (!id) return;
            // console.log("inputFromUrl", inputFromUrl);

            try {
                const response = await api<ConversationWithMessages>(
                    `/conversation/${id}`
                );
                setConversation(response.data);
                setChat(response.data.messages);
            } catch (error) {
                console.error("Error fetching conversation:", error);
            }
        };

        fetchConversation();
    }, [id]);

    /**
     * If the conversation is loaded and the chat is empty and there is an input from the url,
     * submit the input from the url to the chat.
     */
    useEffect(() => {
        if (conversation && chat && chat.length === 0 && inputFromUrl) {
            handleSubmit(inputFromUrl);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation, chat, inputFromUrl]);

    const addMessageToConversation = (message: Chat) => {
        if (!conversation) return;
        setChat((prevChat) => [...prevChat, message]);
    };

    const fetchChatResponse = async (message: string): Promise<string> => {
        try {
            const response = await api<string>("/chat", {
                method: "POST",
                body: {
                    message,
                    model: "llama3.2:3b",
                    conversation_id: id,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching:", error);
            return "Error fetching response :(";
        }
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
