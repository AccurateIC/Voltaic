// src/Err.ts
var catchErrTyped = async (promise, errorsToCatch) => {
  return promise.then((data) => ({ success: true, data, error: void 0 })).catch((error) => {
    if (!errorsToCatch) {
      return { success: false, data: void 0, error };
    }
    if (errorsToCatch.some((e) => error instanceof e)) {
      return { success: false, data: void 0, error };
    }
    throw error;
  });
};
var ExternalServerError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ExternalServerError";
  }
};

export { ExternalServerError, catchErrTyped };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map