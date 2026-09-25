import { registerUnauthorizedHandler, triggerUnauthorized } from "../authEvents";

describe("auth event bridge", () => {
  it("invokes the currently registered unauthorized handler", () => {
    const handler = jest.fn();
    registerUnauthorizedHandler(handler);
    triggerUnauthorized();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("replaces a previous handler", () => {
    const first = jest.fn();
    const second = jest.fn();
    registerUnauthorizedHandler(first);
    registerUnauthorizedHandler(second);
    triggerUnauthorized();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
