export class NoAccessTokenError extends Error {
    constructor() {
        super("No access token found");
    }
}

export class UnauthorizedError extends Error {
    constructor() {
        super("Unauthorized");
    }
}

export class HttpError extends Error {
    constructor(public status: number) {
        super(`HTTP error! status: ${status}`);
    }
}
