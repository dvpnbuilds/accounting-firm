import { describe, expect, it } from "vitest";
import { getRedirectPath } from "./route-guard";

describe("getRedirectPath", () => {
  it("blocks CLIENT role from staff routes", () => {
    expect(getRedirectPath("/dashboard", "CLIENT")).toBe("/login");
    expect(getRedirectPath("/clients", "CLIENT")).toBe("/login");
  });

  it("blocks unauthenticated users from staff routes", () => {
    expect(getRedirectPath("/dashboard", undefined)).toBe("/login");
  });

  it("allows STAFF role through staff routes", () => {
    expect(getRedirectPath("/dashboard", "STAFF")).toBeNull();
    expect(getRedirectPath("/clients", "STAFF")).toBeNull();
  });

  it("blocks STAFF role from portal routes", () => {
    expect(getRedirectPath("/portal", "STAFF")).toBe("/login");
  });

  it("allows CLIENT role through portal routes", () => {
    expect(getRedirectPath("/portal", "CLIENT")).toBeNull();
  });

  it("leaves public routes untouched", () => {
    expect(getRedirectPath("/login", undefined)).toBeNull();
  });
});
