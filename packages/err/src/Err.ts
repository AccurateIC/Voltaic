// err/src/Err.ts
export type Result<T, E> =
  | { success: true; data: T; error: undefined }
  | { success: false; data: undefined; error: E };

export const catchErrTyped = async <
  T,
  E extends new (message?: string) => Error,
>(
  promise: Promise<T>,
  errorsToCatch?: E[]
): Promise<Result<T, InstanceType<E>>> => {
  return promise
    .then((data) => ({ success: true as const, data, error: undefined }))
    .catch((error) => {
      if (!errorsToCatch) {
        return {
          success: false,
          data: undefined,
          error: error as InstanceType<E>,
        };
      }
      if (errorsToCatch.some((e) => error instanceof e)) {
        return {
          success: false,
          data: undefined,
          error: error as InstanceType<E>,
        };
      }
      throw error;
    });
};

export class ExternalServerError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "ExternalServerError";
  }
}
