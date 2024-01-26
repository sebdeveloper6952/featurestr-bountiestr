import { secp256k1 } from "@noble/curves/secp256k1";
import { type ProjPointType } from "@noble/curves/abstract/weierstrass";
import { bytesToHex, randomBytes } from "@noble/hashes/utils";
import { sha256 } from "@noble/hashes/sha256";
import {
  type BlindedMessageData,
  type MintKeys,
  type Proof,
  type SerializedBlindedMessage,
  type SerializedBlindedSignature,
  type ReceiveTokenEntryResponse,
  type AmountPreference,
  type TokenEntry,
  type SendResponse,
  type PayLnInvoiceResponse,
  type SplitPayload,
  type BlindedTransaction,
  type Token,
  CashuMint,
  CashuWallet,
  getEncodedToken,
  getDecodedToken,
} from "@cashu/cashu-ts";
import {
  deriveBlindingFactor,
  deriveSecret,
} from "@cashu/cashu-ts/dist/lib/es6/secrets.js";
import {
  bytesToNumber,
  getDefaultAmountPreference,
} from "@cashu/cashu-ts/dist/lib/es6/utils";
import * as dhke from "@cashu/cashu-ts/dist/lib/es6/DHKE";
import { BlindedMessage } from "@cashu/cashu-ts/dist/lib/es6/model/BlindedMessage";
import { schnorr } from "@noble/curves/secp256k1";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/** Copied from @cashu/cashu-ts/src/DHKE and modified to use textDecoder instead of encodeUint8toBase64 */
function blindMessage(
  secret: Uint8Array,
  r?: bigint,
): { B_: ProjPointType<bigint>; r: bigint } {
  const secretMessageBase64 = textDecoder.decode(secret); //encodeUint8toBase64(secret);
  const secretMessage = new TextEncoder().encode(secretMessageBase64);
  const Y = dhke.hashToCurve(secretMessage);
  if (!r) {
    r = bytesToNumber(secp256k1.utils.randomPrivateKey());
  }
  const rG = secp256k1.ProjectivePoint.BASE.multiply(r);
  const B_ = Y.add(rG);
  return { B_, r };
}

/** Copied from @cashu/cashu-ts/src/DHKE and modified to use textDecoder instead of encodeUint8toBase64 */
function constructProofs(
  promises: Array<SerializedBlindedSignature>,
  rs: Array<bigint>,
  secrets: Array<Uint8Array>,
  keys: MintKeys,
): Array<Proof> {
  return promises.map((p: SerializedBlindedSignature, i: number) => {
    const C_ = dhke.pointFromHex(p.C_);
    const A = dhke.pointFromHex(keys[p.amount]);
    const C = dhke.unblindSignature(C_, rs[i], A);
    const proof = {
      id: p.id,
      amount: p.amount,
      secret: textDecoder.decode(secrets[i]), // encodeUint8toBase64(secrets[i]),
      C: C.toHex(true),
    };
    return proof;
  });
}

// @ts-expect-error
export class P2PKCashuWallet extends CashuWallet {
  p2pkReceiveSecretKey: string | null = null;
  p2pkSendLockPubkey: string | null = null;

  async payLnInvoice(
    invoice: string,
    proofsToSend: Array<Proof>,
    feeReserve?: number,
    counter?: number,
  ): Promise<PayLnInvoiceResponse> {
    const paymentPayload = this.createPaymentPayload(invoice, proofsToSend);
    if (!feeReserve) {
      feeReserve = await this.getFee(invoice);
    }
    // @ts-expect-error
    const { blindedMessages, secrets, rs } = this.createBlankOutputs(
      feeReserve,
      counter,
    );
    const payData = await this.mint.melt({
      ...paymentPayload,
      outputs: blindedMessages,
    });
    const constructProofsMethod = this.p2pkSendLockPubkey
      ? constructProofs
      : dhke.constructProofs;
    return {
      isPaid: payData.paid ?? false,
      preimage: payData.preimage,
      change: payData?.change
        ? constructProofsMethod(
            payData.change,
            rs,
            secrets,
            // @ts-expect-error
            await this.getKeys(payData.change),
          )
        : [],
      // @ts-expect-error
      newKeys: await this.changedKeys(payData?.change),
    };
  }

  async receiveTokenEntry(
    tokenEntry: TokenEntry,
    preference?: Array<AmountPreference>,
    counter?: number,
  ): Promise<ReceiveTokenEntryResponse> {
    const proofsWithError: Array<Proof> = [];
    const proofs: Array<Proof> = [];
    let newKeys: MintKeys | undefined;
    try {
      const amount = tokenEntry.proofs.reduce(
        (total, curr) => total + curr.amount,
        0,
      );
      if (!preference) {
        preference = getDefaultAmountPreference(amount);
      }
      const { payload, blindedMessages } = this.createSplitPayload(
        amount,
        tokenEntry.proofs,
        preference,
        counter,
      ) as {
        payload: SplitPayload;
        blindedMessages: BlindedTransaction;
      };

      const { promises, error } = await CashuMint.split(
        tokenEntry.mint,
        payload,
      );
      const constructProofsMethod = this.p2pkSendLockPubkey
        ? constructProofs
        : dhke.constructProofs;
      const newProofs = constructProofsMethod(
        promises,
        blindedMessages.rs,
        blindedMessages.secrets,
        // @ts-expect-error
        await this.getKeys(promises, tokenEntry.mint),
      );
      proofs.push(...newProofs);
      newKeys =
        tokenEntry.mint === this.mint.mintUrl
          ? // @ts-expect-error
            await this.changedKeys([...(promises || [])])
          : undefined;
    } catch (error) {
      console.error(error);
      proofsWithError.push(...tokenEntry.proofs);
    }
    return {
      proofs,
      proofsWithError: proofsWithError.length ? proofsWithError : undefined,
      newKeys,
    };
  }

  async send(
    amount: number,
    proofs: Array<Proof>,
    preference?: Array<AmountPreference>,
    counter?: number,
  ): Promise<SendResponse> {
    if (preference) {
      amount = preference?.reduce(
        (acc, curr) => acc + curr.amount * curr.count,
        0,
      );
    }

    let amountAvailable = 0;
    const proofsToSend: Array<Proof> = [];
    const proofsToKeep: Array<Proof> = [];
    proofs.forEach((proof) => {
      if (amountAvailable >= amount) {
        proofsToKeep.push(proof);
        return;
      }
      amountAvailable = amountAvailable + proof.amount;
      proofsToSend.push(proof);
    });

    if (amount > amountAvailable) {
      throw new Error("Not enough funds available");
    }
    if (amount < amountAvailable || preference) {
      // @ts-expect-error
      const { amountKeep, amountSend } = this.splitReceive(
        amount,
        amountAvailable,
      );
      const { payload, blindedMessages } = this.createSplitPayload(
        amountSend,
        proofsToSend,
        preference,
        counter,
      );
      const { promises } = await this.mint.split(payload);
      const constructProofsMethod = this.p2pkSendLockPubkey
        ? constructProofs
        : dhke.constructProofs;
      const proofs = constructProofsMethod(
        promises,
        blindedMessages.rs,
        blindedMessages.secrets,
        // @ts-expect-error
        await this.getKeys(promises),
      );
      // sum up proofs until amount2 is reached
      const splitProofsToKeep: Array<Proof> = [];
      const splitProofsToSend: Array<Proof> = [];
      let amountKeepCounter = 0;
      proofs.forEach((proof) => {
        if (amountKeepCounter < amountKeep) {
          amountKeepCounter += proof.amount;
          splitProofsToKeep.push(proof);
          return;
        }
        splitProofsToSend.push(proof);
      });
      return {
        returnChange: [...splitProofsToKeep, ...proofsToKeep],
        send: splitProofsToSend,
        // @ts-expect-error
        newKeys: await this.changedKeys([...(promises || [])]),
      };
    }
    return { returnChange: proofsToKeep, send: proofsToSend };
  }

  async requestTokens(
    amount: number,
    id: string,
    AmountPreference?: Array<AmountPreference>,
    counter?: number,
  ): Promise<{ proofs: Array<Proof>; newKeys?: MintKeys }> {
    // @ts-expect-error
    const { blindedMessages, secrets, rs } = this.createRandomBlindedMessages(
      amount,
      AmountPreference,
      counter,
    );
    const payloads = { outputs: blindedMessages };
    const { promises } = await this.mint.mint(payloads, id);
    const constructProofsMethod = this.p2pkSendLockPubkey
      ? constructProofs
      : dhke.constructProofs;
    return {
      proofs: constructProofsMethod(
        promises,
        rs,
        secrets,
        // @ts-expect-error
        await this.getKeys(promises),
      ),
      // @ts-expect-error
      newKeys: await this.changedKeys(promises),
    };
  }

  async restore(
    start: number,
    count: number,
    keysetId?: string,
  ): Promise<{ proofs: Array<Proof>; newKeys?: MintKeys }> {
    // @ts-expect-error
    if (!this._seed) {
      throw new Error(
        "CashuWallet must be initialized with mnemonic to use restore",
      );
    }
    // create blank amounts for unknown restore amounts
    const amounts = Array(count).fill(0);
    const { blindedMessages, rs, secrets } = this.createBlindedMessages(
      amounts,
      start,
      keysetId,
    );

    const { outputs, promises } = await this.mint.restore({
      outputs: blindedMessages,
    });

    // Collect and map the secrets and blinding factors with the blinded messages that were returned from the mint
    const validRs = rs.filter((r, i) =>
      outputs.map((o) => o.B_).includes(blindedMessages[i].B_),
    );
    const validSecrets = secrets.filter((s, i) =>
      outputs.map((o) => o.B_).includes(blindedMessages[i].B_),
    );

    const constructProofsMethod = this.p2pkSendLockPubkey
      ? constructProofs
      : dhke.constructProofs;
    return {
      proofs: constructProofsMethod(
        promises,
        validRs,
        validSecrets,
        // @ts-expect-error
        await this.getKeys(promises),
      ),
      // @ts-expect-error
      newKeys: await this.changedKeys(promises),
    };
  }

  private createSplitPayload(
    amount: number,
    proofsToSend: Array<Proof>,
    preference?: Array<AmountPreference>,
    counter?: number,
  ): {
    payload: SplitPayload;
    blindedMessages: BlindedTransaction;
  } {
    const totalAmount = proofsToSend.reduce(
      (total, curr) => total + curr.amount,
      0,
    );
    // @ts-expect-error
    const keepBlindedMessages = this.createRandomBlindedMessages(
      totalAmount - amount,
      undefined,
      counter,
    );
    // @ts-expect-error
    if (this._seed && counter) {
      counter = counter + keepBlindedMessages.secrets.length;
    }
    // @ts-expect-error
    const sendBlindedMessages = this.createRandomBlindedMessages(
      amount,
      preference,
      counter,
    );

    // join keepBlindedMessages and sendBlindedMessages
    const blindedMessages: BlindedTransaction = {
      blindedMessages: [
        ...keepBlindedMessages.blindedMessages,
        ...sendBlindedMessages.blindedMessages,
      ],
      secrets: [...keepBlindedMessages.secrets, ...sendBlindedMessages.secrets],
      rs: [...keepBlindedMessages.rs, ...sendBlindedMessages.rs],
      amounts: [...keepBlindedMessages.amounts, ...sendBlindedMessages.amounts],
    };

    const payload = {
      proofs: proofsToSend,
      outputs: [...blindedMessages.blindedMessages],
    };

    this.signSplitPayload(payload);

    return { payload, blindedMessages };
  }

  private signSplitPayload(payload: SplitPayload) {
    if (
      this.p2pkReceiveSecretKey &&
      payload.proofs.some((p: Proof) => p.secret.startsWith("["))
    ) {
      console.log("Signing for inputs");
      let signForOutputs = false;
      for (const proof of payload.proofs as Proof[]) {
        try {
          const parsed = JSON.parse(proof.secret) as [
            "P2Pk",
            { data: string; nonce: string; tags?: [string, string][] },
          ];

          const pubkey = bytesToHex(
            schnorr.getPublicKey(this.p2pkReceiveSecretKey),
          );
          if (!parsed[1].data.endsWith(pubkey)) continue;

          if (
            parsed[1].tags?.some(
              (t) => t[0] === "sigflag" && t[1] === "SIG_ALL",
            )
          )
            signForOutputs = true;

          const signature = schnorr.sign(
            sha256(proof.secret),
            this.p2pkReceiveSecretKey,
          );

          // @ts-expect-error
          proof.witness = JSON.stringify({
            signatures: [bytesToHex(signature)],
          });
        } catch (e) {
          console.warn("Failed to sign for", proof);
          console.log(e);
        }
      }

      if (signForOutputs) {
        console.log("Signing for outputs");
        for (const output of payload.outputs) {
          const signature = schnorr.sign(
            sha256(output.B_),
            this.p2pkReceiveSecretKey,
          );
          // @ts-expect-error
          output.witness = JSON.stringify({
            signatures: [bytesToHex(signature)],
          });
        }
      }
    }
  }

  override createBlindedMessages(
    amounts: Array<number>,
    counter?: number,
    keysetId?: string,
  ): BlindedMessageData & { amounts: Array<number> } {
    // if we atempt to create deterministic messages without a _seed, abort.
    // @ts-expect-error
    if (counter != undefined && !this._seed) {
      throw new Error(
        "Cannot create deterministic messages without seed. Instantiate CashuWallet with a mnemonic, or omit counter param.",
      );
    }
    const blindedMessages: Array<SerializedBlindedMessage> = [];
    const secrets: Array<Uint8Array> = [];
    const rs: Array<bigint> = [];
    for (let i = 0; i < amounts.length; i++) {
      let deterministicR = undefined;
      let secret = undefined;
      if (this.p2pkSendLockPubkey) {
        secret = textEncoder.encode(
          JSON.stringify([
            "P2PK",
            {
              // NOTE: the order is very important for the token to work with nutshell
              // This can be removed when nutshell no longer re-encodes the secret when checking the sig
              data: this.p2pkSendLockPubkey,
              nonce: bytesToHex(randomBytes(16)),
            },
          ])
            .replaceAll(/,/g, ", ")
            .replaceAll(/:/g, ": "),
        );
        // @ts-expect-error
      } else if (this._seed && counter != undefined) {
        secret = deriveSecret(
          // @ts-expect-error
          this._seed,
          keysetId ?? this.keysetId,
          counter + i,
        );
        deterministicR = bytesToNumber(
          deriveBlindingFactor(
            // @ts-expect-error
            this._seed,
            keysetId ?? this.keysetId,
            counter + i,
          ),
        );
      } else {
        secret = randomBytes(32);
      }
      secrets.push(secret);
      const { B_, r } = this.p2pkSendLockPubkey
        ? blindMessage(secret, deterministicR)
        : dhke.blindMessage(secret, deterministicR);
      rs.push(r);
      const blindedMessage = new BlindedMessage(amounts[i], B_);
      blindedMessages.push(blindedMessage.getSerializedBlindedMessage());
    }
    return { blindedMessages, secrets, rs, amounts };
  }
}

const mints = new Map<string, CashuMint>();

export async function getMint(url: string) {
  const formatted = new URL(url).toString();
  if (!mints.has(formatted)) {
    const mint = new CashuMint(formatted);
    mints.set(formatted, mint);
  }
  return mints.get(formatted)!;
}

/** takes an array of tokens and filters out the invalid ones */
export async function filterValidTokens(tokens: Token[]) {
  const validTokens: Token[] = [];

  const secretsByMint: Record<string, string[]> = {};
  for (const token of tokens) {
    for (const entry of token.token) {
      const mint = await getMint(entry.mint);
      const firstProof = entry.proofs[0];

      secretsByMint[entry.mint] = secretsByMint[entry.mint] || [];
      secretsByMint[entry.mint].push(firstProof.secret);
    }
  }

  const validSecrets = new Set<string>();
  for (const [mintURL, secrets] of Object.entries(secretsByMint)) {
    const mint = await getMint(mintURL);
    const { spendable } = await mint.check({
      proofs: secrets.map((secret) => ({ secret })),
    });
    for (let i = 0; i < secrets.length; i++) {
      if (spendable[i]) validSecrets.add(secrets[i]);
    }
  }

  for (const token of tokens) {
    for (const entry of token.token) {
      const firstProof = entry.proofs[0];
      if (validSecrets.has(firstProof.secret)) {
        validTokens.push(token);
        break;
      }
    }
  }

  return validTokens;
}

export const wallet = new P2PKCashuWallet(
  // new CashuMint("https://8333.space:3338"),
  new CashuMint("https://mint.gwoq.com"),
);

//@ts-expect-error
window.wallet = wallet;
//@ts-expect-error
window.getDecodedToken = getDecodedToken;
//@ts-expect-error
window.getEncodedToken = getEncodedToken;
