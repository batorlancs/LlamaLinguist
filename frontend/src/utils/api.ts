import { AuthService } from "./auth";
import { HttpError, NoAccessTokenError, UnauthorizedError } from "./errors";
import { RequestOptions } from "./types";

const API_URL = import.meta.env.BACKEND_URL || "http://localhost:8000";

export const api = async <T>(
    endpoint: string,
    options: RequestOptions = {},
    retry: boolean = true
): Promise<T> => {
    const { method = "GET", body, headers = {} } = options;

    async function executeRequest(): Promise<Response> {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            throw new NoAccessTokenError();
        }

        const requestOptions: RequestInit = {
            method,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${accessToken}`,
                ...headers,
            },
            credentials: "include",
            mode: "cors",
        };

        if (body) {
            requestOptions.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, requestOptions);
        // Handle errors
        if (response.status === 401) throw new UnauthorizedError();
        if (!response.ok) throw new HttpError(response.status);
        return response.json();
    }

    try {
        return (await executeRequest()) as T;
    } catch (error) {
        if (
            error instanceof NoAccessTokenError ||
            error instanceof UnauthorizedError
        ) {
            if (retry) {
                await AuthService.refreshToken();
                return await api(endpoint, options, retry);
            }
            throw error;
        }
        throw error;
    }
};
