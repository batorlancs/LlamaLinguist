export interface CreateConversationRequest {
	assistant_id: number;
	title: string;
	model: string;
}

export interface GenerateRequest {
	prompt: string;
	model: string;
}

export interface ChatRequest {
	conversation_id: number;
	message: string;
}

