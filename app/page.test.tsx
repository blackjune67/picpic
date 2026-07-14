import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { fixtureCatalogRepository } from "@/lib/catalog";
import { DiscoveryClient } from "./discovery-client";

describe("Home discovery smoke", () => {
  it("shows the neutral discovery controls and catalog results", async () => {
    const catalog = await fixtureCatalogRepository.list();
    render(<DiscoveryClient catalog={catalog} />);
    expect(screen.getByRole("button", { name: /^전체$/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "대림국수" })).toBeInTheDocument();
  });
});
