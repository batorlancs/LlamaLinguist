import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Info, Send } from "lucide-react";
import React, { RefObject } from "react";
import { CustomKbd } from "./Chat";

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    textareaRef: RefObject<HTMLTextAreaElement>;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (input: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    input,
    setInput,
    textareaRef,
    handleKeyDown,
    handleSubmit,
}) => {
    return (
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
                        className="opacity-50 hover:opacity-100 rounded-lg hover:bg-transparent"
                        variant="ghost"
                        onClick={() => handleSubmit(input)}
                    >
                        <Send />
                    </Button>
                </div>
            </div>
            <div className="text-xs text-muted-foreground mt-3 opacity-80 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <p>
                    Hit <CustomKbd>Enter</CustomKbd> to send,{" "}
                    <CustomKbd>Shift + Enter</CustomKbd> for a new line
                </p>
            </div>
        </div>
    );
};
