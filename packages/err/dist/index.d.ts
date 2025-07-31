type Result<T, E> = {
    success: true;
    data: T;
    error: undefined;
} | {
    success: false;
    data: undefined;
    error: E;
};
declare const catchErrTyped: <T, E extends new (message?: string) => Error>(promise: Promise<T>, errorsToCatch?: E[]) => Promise<Result<T, InstanceType<E>>>;
declare class ExternalServerError extends Error {
    constructor(message?: string);
}

export { ExternalServerError, type Result, catchErrTyped };
