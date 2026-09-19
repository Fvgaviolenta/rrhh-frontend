import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const signInMock = vi.fn();

vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => signInMock(...args),
}));

import GoogleSignInButton from "./GoogleSignInButton";

describe("GoogleSignInButton", () => {
  beforeEach(() => {
    signInMock.mockReset();
    signInMock.mockResolvedValue(undefined);
  });

  it("renderiza el texto oficial", () => {
    render(<GoogleSignInButton />);
    expect(screen.getByRole("button", { name: /continuar con google/i })).toBeTruthy();
  });

  it("llama signIn con identity_provider Google", async () => {
    const user = userEvent.setup();
    render(<GoogleSignInButton callbackUrl="/sesion" />);
    await user.click(screen.getByRole("button", { name: /continuar con google/i }));
    expect(signInMock).toHaveBeenCalledWith(
      "cognito",
      { callbackUrl: "/sesion" },
      { identity_provider: "Google" }
    );
  });
});
