const API_URL = import.meta.env.BACKEND_URL || "http://localhost:8000";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
	method?: RequestMethod;
	body?: Record<string, unknown>;
	headers?: Record<string, string>;
}

export const api = async <T>(
	endpoint: string,
	options: RequestOptions = {}
): Promise<T> => {
	const { method = "GET", body, headers = {} } = options;

	const requestOptions: RequestInit = {
		method,
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": `Bearer ${localStorage.getItem("access_token")}`,
			...headers,
		},
		credentials: "include",
		mode: "cors",
	};

	if (body) {
		requestOptions.body = JSON.stringify(body);
	}

	try {
		const response = await fetch(`${API_URL}${endpoint}`, requestOptions);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data as T;
	} catch (error) {
		console.error("API request failed:", error);
		throw error;
	}
};
