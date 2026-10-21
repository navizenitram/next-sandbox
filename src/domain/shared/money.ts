/** ISO 4217 currency code, e.g. "EUR". */
export type Currency = string;

/** A non-negative amount in integer minor units (cents). */
export type Money = Readonly<{ cents: number; currency: Currency }>;

export function money(cents: number, currency: Currency): Money {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new RangeError(`Money must be a non-negative integer number of cents, got ${cents}`);
  }
  return { cents, currency };
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a.currency, b.currency);
  return money(a.cents + b.cents, a.currency);
}

export function sum(amounts: readonly Money[], currency: Currency): Money {
  return amounts.reduce(add, money(0, currency));
}

/** Tax on a net amount for a rate in basis points (2100 = 21%), rounded half up to the cent. */
export function taxAt(net: Money, rateBps: number): Money {
  if (!Number.isSafeInteger(rateBps) || rateBps < 0) {
    throw new RangeError(`Tax rate must be a non-negative integer of basis points, got ${rateBps}`);
  }
  return money(Math.floor((net.cents * rateBps + 5000) / 10000), net.currency);
}

function assertSameCurrency(a: Currency, b: Currency) {
  if (a !== b) throw new Error(`Currency mismatch: ${a} vs ${b}`);
}
