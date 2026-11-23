import { setupServer } from "msw/node";

/** fleetflow-api base URL in tests (vitest.config.mts sets FLEETFLOW_API_URL). */
export const TEST_API = "http://api.test/api/v1";

/** Mock network for every test. Handlers are added per test with `server.use(...)`; unhandled requests fail the test. */
export const server = setupServer();

/** A JWT-shaped token whose payload expires `secondsFromNow` from now (signature is irrelevant to the BFF). */
export const fakeJwt = (secondsFromNow: number, label = "token") => {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode({ exp: Math.floor(Date.now() / 1000) + secondsFromNow, label })}.sig`;
};
