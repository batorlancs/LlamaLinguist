import { ModeToggle } from "@/components/mode-toggle";
import { Profiles } from "@/features/auth/Profiles";

const Login = () => {
    return (
        <div className="flex min-h-svh flex-col justify-center items-center gap-6 bg-background p-6 md:p-10">
            <div className="absolute top-6 right-6">
                <ModeToggle />
            </div>
            <div className="w-full max-w-2xl">
                <Profiles />
            </div>
        </div>
    );
};

export default Login;
