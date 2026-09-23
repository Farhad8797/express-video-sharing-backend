interface ApiResponse {
    statusCode: number;
    message: string;
    success?: boolean;
    data?: any;
}

export function apiResponse({
    statusCode,
    message,
    success = true,
    data
}: ApiResponse) {
    return { statusCode, message, success, data };
}
