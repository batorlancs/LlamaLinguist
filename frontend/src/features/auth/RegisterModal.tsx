import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { AuthService } from "@/utils/auth";
import { HttpError } from "@/utils/errors";
import { LoaderCircle } from "lucide-react";

const validationSchema = Yup.object({
    username: Yup.string()
        .min(3, "Username must be at least 3 characters")
        .max(15, "Username must not exceed 15 characters")
        .required("Username is required"),
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm Password is required"),
});

type RegisterModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    onSuccess: () => void;
};

type FormValues = {
    username: string;
    password: string;
    confirmPassword: string;
};

export function RegisterModal({
    open,
    setOpen,
    onSuccess,
}: RegisterModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>("sdfsdf");

    const formik = useFormik<FormValues>({
        initialValues: {
            username: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            setError(null);

            try {
                await AuthService.register(values.username, values.password);
                setOpen(false);
                onSuccess();
            } catch (error) {
                if (error instanceof HttpError) {
                    if (error.status === 400) {
                        setError("Username already exists");
                    } else {
                        setError(error.message);
                    }
                } else {
                    setError(
                        "Unable to connect to server, please try again later"
                    );
                }
            } finally {
                setIsLoading(false);
            }
        },
    });

    useEffect(() => {
        if (open) {
            setIsLoading(false);
            setError(null);
            formik.resetForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const onOpenChange = (open: boolean) => {
        setOpen(open);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>New Profile</DialogTitle>
                    <DialogDescription>
                        Create a password-protected profile for secure access
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={formik.handleSubmit}>
                    <div className="grid w-full items-center gap-4 mt-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="Enter your username"
                                {...formik.getFieldProps("username")}
                            />
                            {formik.submitCount > 0 &&
                            formik.errors.username ? (
                                <div className="text-sm text-destructive">
                                    {formik.errors.username}
                                </div>
                            ) : null}
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                {...formik.getFieldProps("password")}
                            />
                            {formik.submitCount > 0 &&
                            formik.errors.password ? (
                                <div className="text-sm text-destructive">
                                    {formik.errors.password}
                                </div>
                            ) : null}
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="confirmPassword">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                {...formik.getFieldProps("confirmPassword")}
                            />
                            {formik.submitCount > 0 &&
                            formik.errors.confirmPassword ? (
                                <div className="text-sm text-destructive">
                                    {formik.errors.confirmPassword}
                                </div>
                            ) : null}
                        </div>
                    </div>
                    {error ? (
                        <div className="text-sm text-destructive mt-4">
                            {error}
                        </div>
                    ) : null}
                    <DialogFooter className={`${error ? "mt-2" : "mt-6"}`}>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                    Registering
                                </>
                            ) : (
                                "Register"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
