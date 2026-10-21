import { describe, expect, it } from "vitest";
import { orderFormInput, parseOrderForm } from "./order-form-schema";

const valid = {
  name: "  Ana García ",
  email: " ana@example.com ",
  phone: "+34 600 000 000",
  street: "Calle Mayor 1",
  postalCode: "28013",
  city: "Madrid",
  province: "Madrid",
  notes: "",
  privacyConsent: "on",
  bikeTypeId: "road",
  selections: { frame: "frame-road-endurance", wheels: "wheels-alloy" },
};

function omit<T extends object>(value: T, key: keyof T) {
  const copy = { ...value };
  delete copy[key];
  return copy;
}

describe("parseOrderForm", () => {
  it("turns valid input into a trimmed customer and a configuration", () => {
    expect(parseOrderForm(valid)).toEqual({
      ok: true,
      data: {
        customer: {
          name: "Ana García",
          email: "ana@example.com",
          phone: "+34 600 000 000",
          address: { street: "Calle Mayor 1", postalCode: "28013", city: "Madrid", province: "Madrid" },
          notes: "",
        },
        configuration: { bikeTypeId: "road", selections: { frame: "frame-road-endurance", wheels: "wheels-alloy" } },
      },
    });
  });

  it("treats missing notes as empty", () => {
    const result = parseOrderForm(omit(valid, "notes"));
    expect(result.ok && result.data.customer.notes).toBe("");
  });

  it("reports every empty required field", () => {
    const result = parseOrderForm({
      ...valid,
      name: " ",
      email: "",
      phone: "",
      street: "",
      postalCode: "",
      city: "",
      province: "",
    });
    expect(result).toEqual({
      ok: false,
      fieldErrors: {
        name: "required",
        email: "required",
        phone: "required",
        street: "required",
        postalCode: "required",
        city: "required",
        province: "required",
      },
    });
  });

  it("reports a missing field as required", () => {
    expect(parseOrderForm(omit(valid, "name"))).toEqual({ ok: false, fieldErrors: { name: "required" } });
  });

  it("rejects an invalid email, phone and postal code", () => {
    expect(parseOrderForm({ ...valid, email: "ana@", phone: "abc", postalCode: "99999" })).toEqual({
      ok: false,
      fieldErrors: { email: "invalid-email", phone: "invalid-phone", postalCode: "invalid-postal-code" },
    });
  });

  it("accepts Spanish phone numbers with or without prefix and spacing", () => {
    for (const phone of ["600000000", "+34600000000", "+34 600 00 00 00", "(+34) 91-123-45-67"]) {
      expect(parseOrderForm({ ...valid, phone }).ok, phone).toBe(true);
    }
  });

  it("requires the privacy consent", () => {
    expect(parseOrderForm(omit(valid, "privacyConsent"))).toEqual({ ok: false, fieldErrors: { privacyConsent: "consent-required" } });
  });

  it("rejects text that is too long", () => {
    expect(parseOrderForm({ ...valid, notes: "x".repeat(1001) })).toEqual({
      ok: false,
      fieldErrors: { notes: "too-long" },
    });
  });

  it("reports a malformed configuration under one key", () => {
    expect(parseOrderForm({ ...valid, bikeTypeId: "", selections: "frame" })).toEqual({
      ok: false,
      fieldErrors: { configuration: "invalid" },
    });
  });
});

describe("orderFormInput", () => {
  it("reads the fields and the selection.* entries from form data", () => {
    const form = new FormData();
    form.set("$ACTION_ID_abc", "");
    form.set("name", "Ana");
    form.set("email", "ana@example.com");
    form.set("privacyConsent", "on");
    form.set("bikeTypeId", "road");
    form.set("selection.frame", "frame-road-endurance");
    form.set("selection.wheels", "wheels-alloy");

    expect(orderFormInput(form)).toEqual({
      name: "Ana",
      email: "ana@example.com",
      phone: undefined,
      street: undefined,
      postalCode: undefined,
      city: undefined,
      province: undefined,
      notes: undefined,
      privacyConsent: "on",
      bikeTypeId: "road",
      selections: { frame: "frame-road-endurance", wheels: "wheels-alloy" },
    });
  });

  it("ignores files", () => {
    const form = new FormData();
    form.set("name", new Blob(["x"]), "x.txt");
    expect(orderFormInput(form).name).toBeUndefined();
  });
});
