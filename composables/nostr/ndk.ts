import NDK, { NDKPrivateKeySigner, NDKUser } from "@nostr-dev-kit/ndk";
import { useStorage } from "@vueuse/core";

let ndk = new NDK({
  explicitRelayUrls: ["wss://nostrue.com"],
});
const activeUser = ref<NDKUser | undefined>();

export const useNdk = () => {
  const setSk = async (sk: string) => {
    if (ndk !== null && sk !== "") {
      ndk.signer = new NDKPrivateKeySigner(sk);
      await ndk.signer.blockUntilReady();

      const nsec = useStorage("nsec", "");
      nsec.value = sk;

      await ndk.activeUser?.fetchProfile();
      activeUser.value = ndk.activeUser;
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
