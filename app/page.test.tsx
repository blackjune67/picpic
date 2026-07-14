import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home bootstrap smoke", () => {
  it("shows the bootstrap readiness heading when the app renders", () => {
    // Given: the top-level App Router page
    // When: it is rendered in the component harness
    render(<Home />);

    // Then: the scaffold exposes its readiness contract
    expect(
      screen.getByRole("heading", { name: "PicPic bootstrap is ready" }),
    ).toBeInTheDocument();
  });
});
