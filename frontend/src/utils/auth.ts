import { Config } from "@/config/config";
import { ApiResponse } from "./types";
import { HttpError, UnauthorizedError } from "./errors";
import { apiPublic } from "./api";

export type User = {
    username: string;
};

export class AuthService {
    static user: User | null = null;
    private static isRefreshing = false;
    private static refreshSubscribers: ((token: string) => void)[] = [];

    static goToLogin(): void {
        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }

    static async refreshToken(): Promise<string> {
        // If already refreshing, wait for that to complete
        if (this.isRefreshing) {
            return new Promise((resolve) => {
                this.refreshSubscribers.push(resolve);
            });
        }

        this.isRefreshing = true;

        try {
            const username = localStorage.getItem("username");
            const password = localStorage.getItem("password");

            if (!username || !password) {
                this.goToLogin();
                throw new Error("No credentials stored");
            }

            const response = await fetch(`${Config.BACKEND_URL}/auth/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new UnauthorizedError();
                } else {
                    throw new HttpError(response.status);
                }
            }

            const response_dict: ApiResponse<{ access_token: string }> =
                await response.json();

            const access_token = response_dict?.data?.access_token;

            if (access_token) {
                localStorage.setItem("access_token", access_token);
            }

            // Notify all subscribers about the new token
            this.refreshSubscribers.forEach((callback) =>
                callback(access_token)
            );
            this.refreshSubscribers = [];
            return access_token;
        } catch (error) {
            console.log("Error refreshing token", error);
            throw error;
        } finally {
            this.isRefreshing = false;
        }
    }

    static async login(username: string, password: string): Promise<void> {
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        await this.refreshToken();
    }

    static async register(username: string, password: string): Promise<void> {
        await apiPublic("/auth/register", {
            method: "POST",
            body: { username, password },
        });
    }

    static logout(): void {
        localStorage.removeItem("access_token");
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        sessionStorage.removeItem("projects");
        this.goToLogin();
    }
}
