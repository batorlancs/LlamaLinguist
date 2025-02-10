export type Conversation = {
    id: number;
    user_id: number;
    assistant_id: number;
    created_at: string;
    title: string;
    updated_at: string;
};

export type Message = {
    id: number;
    role: "user" | "assistant";
    content: string;
    created_at: string;
};

export type Assistant = {
    id: number;
    user_id: number;
    name: string;
    model: string;
    created_at: string;
};

export type ConversationWithMessages = Conversation & {
    messages: Message[];
};

export type User = {
    name: string;
    email: string | null;
    created_at: string;
    last_login: string;
    disabled: boolean;
    id: number;
};
