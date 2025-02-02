import { useState } from "react";
import { LoginCredentials, LoginModal } from "../LoginModal";
import { ImageCardAvatar, ImageCardNew } from "./ImageCard";
import { GuestUser } from "@/config/guest-user";
import { SkeletonImageCard } from "./SkeletonImageCard";
import { RegisterModal } from "../RegisterModal";

interface ImageCardListProps {
    users: string[] | undefined;
    fetchUsers: () => Promise<void>;
}

export function ImageCardList({ users, fetchUsers }: ImageCardListProps) {
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
        username: "",
        password: undefined,
    });

    const showLoginDialog = (credentials: LoginCredentials) => {
        setLoginCredentials(credentials);
        setLoginOpen(true);
    };

    return (
        <>
            <div className="flex flex-wrap gap-4 justify-center">
                {!users ? (
                    <>
                        <SkeletonImageCard />
                        <SkeletonImageCard />
                        <SkeletonImageCard />
                    </>
                ) : (
                    <>
                        <ImageCardAvatar
                            label="Guest User"
                            onClick={() => {
                                showLoginDialog({
                                    // These are safe credentials, do not change them
                                    username: GuestUser.username,
                                    password: GuestUser.password,
                                });
                            }}
                        />
                        {users?.map((user, index) => (
                            <ImageCardAvatar
                                key={index}
                                label={user}
                                onClick={() =>
                                    showLoginDialog({
                                        username: user,
                                        password: undefined,
                                    })
                                }
                            />
                        ))}
                        <ImageCardNew
                            onClick={() => {
                                setRegisterOpen(true);
                            }}
                        />
                    </>
                )}
            </div>
            <LoginModal
                credentials={loginCredentials}
                open={loginOpen}
                setOpen={setLoginOpen}
            />
            <RegisterModal
                open={registerOpen}
                setOpen={setRegisterOpen}
                onSuccess={fetchUsers}
            />
        </>
    );
}
