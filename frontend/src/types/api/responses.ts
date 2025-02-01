export interface Conversation {
    id: number;
    user_id: number;
    assistant_id: number;
    created_at: string;
    title: string;
    updated_at: string;
}

export interface Message {
    id: number;
    role: "user" | "assistant";
    content: string;
    created_at: string;
}

export interface Assistant {
    id: number;
    user_id: number;
    name: string;
    model: string;
    created_at: string;
}

export interface ConversationWithMessages extends Conversation {
    messages: Message[];
}
