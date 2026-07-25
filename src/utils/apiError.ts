export function apiError(
    statusCode: number = 500,
    message: string = "Something went wrong",
    errors: any[] = []
) {
    const err = new Error(message) as any;
    err.statusCode = statusCode;
    err.errors = errors;
    err.success = false;
    return err;
}
