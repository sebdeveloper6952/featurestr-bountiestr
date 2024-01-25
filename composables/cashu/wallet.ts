import { secp256k1 } from "@noble/curves/secp256k1";
import { type ProjPointType } from "@noble/curves/abstract/weierstrass";
import { bytesToHex, randomBytes } from "@noble/hashes/utils";
import {
  type BlindedMessageData,
  type MintKeys,
  type Proof,
  type SerializedBlindedMessage,
  type SerializedBlindedSignature,
  type ReceiveTokenEntryResponse,
  type AmountPreference,
  type TokenEntry,
  CashuMint,
  CashuWallet,
  getEncodedToken,
  getDecodedToken,
} from "@cashu/cashu-ts";
import {
  bytesToNumber,
  getDefaultAmountPreference,
  splitAmount,
} from "@cashu/cashu-ts/dist/lib/es6/utils";
import * as dhke from "@cashu/cashu-ts/dist/lib/es6/DHKE";
import { BlindedMessage } from "@cashu/cashu-ts/dist/lib/es6/model/BlindedMessage";

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

class P2PKCashuWallet extends CashuWallet {
  p2pkSendLock: string | null = null;

  p2pkCreateRandomBlindedMessages(
    amount: number,
    pubkey: string,
  ): BlindedMessageData & { amounts: Array<number> } {
    const amounts = splitAmount(amount);
    return this.p2pkCreateBlindedMessages(amounts, pubkey);
  }
  p2pkCreateBlindedMessages(
    amounts: Array<number>,
    pubkey: string,
  ): BlindedMessageData & { amounts: Array<number> } {
    const blindedMessages: Array<SerializedBlindedMessage> = [];
    const secrets: Array<Uint8Array> = [];
    const rs: Array<bigint> = [];
    for (let i = 0; i < amounts.length; i++) {
      let deterministicR = undefined;
      let secret = undefined;
      secret = textEncoder.encode(
        JSON.stringify([
          "P2PK",
          {
            // NOTE: the order is very important for the token to work with nutshell
            // This can be removed when nutshell no longer re-encodes the secret when checking the sig
            data: pubkey,
            nonce: bytesToHex(randomBytes(16)),
          },
        ])
          .replaceAll(/,/g, ", ")
          .replaceAll(/:/g, ": "),
      );
      secrets.push(secret);
      const { B_, r } = blindMessage(secret, deterministicR);
      rs.push(r);
      const blindedMessage = new BlindedMessage(amounts[i], B_);
      blindedMessages.push(blindedMessage.getSerializedBlindedMessage());
    }
    return { blindedMessages, secrets, rs, amounts };
  }

  async p2pkRequestTokens(
    amount: number,
    id: string,
    pubkey: string,
  ): Promise<{ proofs: Array<Proof>; newKeys?: MintKeys }> {
    const { blindedMessages, secrets, rs } =
      this.p2pkCreateRandomBlindedMessages(amount, pubkey);
    const payloads = { outputs: blindedMessages };
    const { promises } = await this.mint.mint(payloads, id);
    return {
      proofs: constructProofs(
        promises,
        rs,
        secrets,
        //@ts-ignore
        await this.getKeys(promises),
      ),
      //@ts-ignore
      newKeys: await this.changedKeys(promises),
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
      // @ts-ignore
      const { payload, blindedMessages } = this.createSplitPayload(
        amount,
        tokenEntry.proofs,
        preference,
        counter,
      );
      const { promises, error } = await CashuMint.split(
        tokenEntry.mint,
        payload,
      );
      const newProofs = constructProofs(
        promises,
        blindedMessages.rs,
        blindedMessages.secrets,
        // @ts-ignore
        await this.getKeys(promises, tokenEntry.mint),
      );
      proofs.push(...newProofs);
      newKeys =
        tokenEntry.mint === this.mint.mintUrl
          ? // @ts-ignore
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
}

//@ts-ignore
const wallet = new P2PKCashuWallet(new CashuMint("https://8333.space:3338"));

//@ts-ignore
window.wallet = wallet;
//@ts-ignore
window.getDecodedToken = getDecodedToken;
//@ts-ignore
window.getEncodedToken = getEncodedToken;

const mints = new Map<string, CashuMint>();

export async function getMint(url: string) {
  const formatted = new URL(url).toString();
  if (!mints.has(formatted)) {
    const mint = new CashuMint(formatted);
    mints.set(formatted, mint);
  }
  return mints.get(formatted)!;
}
