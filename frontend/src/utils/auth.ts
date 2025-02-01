import { Config } from "@/config/config";

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

            console.log("username", username);
            console.log("password", password);

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
                throw new Error("Failed to refresh token");
            }

            const { access_token } = await response.json();
            localStorage.setItem("access_token", access_token);

            // Notify all subscribers about the new token
            this.refreshSubscribers.forEach((callback) =>
                callback(access_token)
            );
            this.refreshSubscribers = [];

            return access_token;
        } catch (error) {
            console.error("Error refreshing token", error);
            this.goToLogin();
            throw error;
        } finally {
            this.isRefreshing = false;
        }
    }

    static login(username: string, password: string): void {
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        this.refreshToken();
    }

    static logout(): void {
        localStorage.removeItem("access_token");
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        sessionStorage.removeItem("projects");
        this.goToLogin();
    }
}
