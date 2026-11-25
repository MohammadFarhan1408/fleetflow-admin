import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderInConsole } from "@/test/render";
import { PermissionGate } from "./PermissionGate";

describe("PermissionGate", () => {
  it("shows its children to a user with the permission", () => {
    renderInConsole(
      <PermissionGate permission="customers.manage">
        <button>Add customer</button>
      </PermissionGate>,
      { permissions: ["customers.view", "customers.manage"] },
    );

    expect(screen.getByRole("button", { name: "Add customer" })).toBeInTheDocument();
  });

  it("renders nothing without the permission", () => {
    renderInConsole(
      <PermissionGate permission="customers.manage">
        <button>Add customer</button>
      </PermissionGate>,
      { permissions: ["customers.view"] },
    );

    expect(screen.queryByRole("button", { name: "Add customer" })).not.toBeInTheDocument();
  });
});
