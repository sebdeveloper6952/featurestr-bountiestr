import NDK, { NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import { useStorage } from "@vueuse/core";
import { wallet } from "../cashu/wallet";

const dexieAdapter = new NDKCacheAdapterDexie({ dbName: "ndk-cache" });
let ndk = new NDK({
  cacheAdapter: dexieAdapter,
  explicitRelayUrls: ["wss://nostrue.com"],
});
const activeUser = ref<NDKUser | undefined>();

export const useNdk = () => {
  const setSk = async (sk: string) => {
    if (ndk !== null && sk !== "") {
      ndk.signer = new NDKPrivateKeySigner(sk);
      const user = await ndk.signer.blockUntilReady();
      user.ndk = ndk;
      await user.fetchProfile();
      ndk.activeUser = user;
      activeUser.value = ndk.activeUser;

      const nsec = useStorage("nsec", "");
      nsec.value = sk;

      // set wallet unlock key
      wallet.p2pkReceiveSecretKey = sk;
    }
  };

  const logout = () => {
    if (ndk !== null) {
      ndk.signer = undefined;
      activeUser.value = undefined;
    }

    const nsec = useStorage("nsec", "");
    const npub = useStorage("npub", "");

    nsec.value = null;
    npub.value = null;
  };

  const connect = async () => {
    if (ndk !== null) {
      await ndk.connect();
    }
  };

  const init = async () => {
    await connect();
    const nsec = useStorage("nsec", "");
    if (nsec.value !== "") setSk(nsec.value);
  };

  return {
    ndk,
    init,
    connect,
    setSk,
    logout,
    activeUser,
  };
};
