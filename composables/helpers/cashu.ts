import { type Token } from "@cashu/cashu-ts";

export function getTokenTotal(tokens: Token[]) {
  return tokens.reduce(
    (t, token) =>
      t +
      token.token.reduce(
        (t, entry) =>
          t + entry.proofs.reduce((t, proof) => t + proof.amount, 0),
        0,
      ),
    0,
  );
}
