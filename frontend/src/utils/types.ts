export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export type RequestOptions = {
    method?: RequestMethod;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
};

export type ApiResponseStatus = "success" | "error";

export type ApiResponse<T> = {
    status: ApiResponseStatus;
    message: string;
    data: T;
};
