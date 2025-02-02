import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircleIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogHeader,
    DialogDescription,
} from "@/components/ui/dialog";
import { AuthService } from "@/utils/auth";
import { useNavigate } from "react-router";
import { HttpError } from "@/utils/errors";
import { UnauthorizedError } from "@/utils/errors";

export type LoginCredentials = {
    username: string;
    password?: string;
};

type LoginModalProps = {
    credentials: LoginCredentials;
    open: boolean;
    setOpen: (open: boolean) => void;
};

export function LoginModal({ credentials, open, setOpen }: LoginModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [password, setPassword] = useState<string>("");

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            await AuthService.login(username, password);
            await navigate("/chat/1");
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                setError("Invalid username or password");
            } else if (error instanceof HttpError) {
                setError("Unable to connect to server, please try again later");
            } else {
                setError("An unknown error occurred");
            }
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open && credentials.username && credentials.password) {
            login(credentials.username, credentials.password);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [credentials, open]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!password) {
            setError("Password is required");
            return;
        }

        login(credentials.username, password);
    };

    /**
     * Handles the open state change of the dialog.
     * @param open - The new open state of the dialog.
     */
    const onOpenChange = (open: boolean) => {
        if (!isLoading) {
            setPassword("");
            setError(null);
            setOpen(open);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{credentials.username}</DialogTitle>
                    {!isLoading ? (
                        <DialogDescription>
                            Please enter your password to log in.
                        </DialogDescription>
                    ) : null}
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center space-x-2">
                        <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                        <p className="text-sm">Logging in...</p>
                    </div>
                ) : (
                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <Input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            required
                            className="h-9 mb-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && (
                            <p className="text-destructive text-sm">{error}</p>
                        )}
                        <Button type="submit">Login</Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
