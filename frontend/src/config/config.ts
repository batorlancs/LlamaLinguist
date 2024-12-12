export class Config {
    static readonly BACKEND_URL: string =
        import.meta.env.BACKEND_URL || "http://localhost:8000";
}
