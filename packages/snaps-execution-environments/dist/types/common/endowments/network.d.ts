declare const endowmentModule: {
    names: readonly ["fetch", "Request", "Headers", "Response"];
    factory: () => {
        fetch: typeof fetch;
        Request: {
            new (input: URL | RequestInfo, init?: RequestInit | undefined): Request;
            prototype: Request;
        };
        Headers: {
            new (init?: HeadersInit | undefined): Headers;
            prototype: Headers;
        };
        Response: {
            new (body?: BodyInit | null | undefined, init?: ResponseInit | undefined): Response;
            prototype: Response;
            error(): Response;
            redirect(url: string | URL, status?: number | undefined): Response;
        };
        teardownFunction: () => Promise<void>;
    };
};
export default endowmentModule;
