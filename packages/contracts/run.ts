import {
  HDAccount,
  Hex,
  createPublicClient,
  createWalletClient,
  fallback,
  getContract,
  http,
  parseEther,
  webSocket,
} from "viem";
import { mnemonicToAccount, privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import { IWorld__factory } from "./types/ethers-contracts/factories/IWorld__factory.js";
import worldsJson from "./worlds.json";

const ANVIL_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const MNEMONIC = "legal winner thank year wave sausage worth useful legal winner thank yellow";

const publicClient = createPublicClient({
  chain: foundry,
  transport: fallback([webSocket(), http()]),
});

const walletClient = createWalletClient({
  chain: foundry,
  transport: fallback([webSocket(), http()]),
});

const contract = getContract({
  address: worldsJson[31337].address as Hex,
  abi: IWorld__factory.abi,
  publicClient,
  walletClient,
});

const anvilAccount = privateKeyToAccount(ANVIL_PRIVATE_KEY);

const accounts: HDAccount[] = [];
const awaitTxs: Promise<any>[] = [];

console.log("Creating 100 accounts and dripping 10 ETH to each");
for (let i = 0; i < 100; i++) {
  const account = mnemonicToAccount(MNEMONIC, {
    accountIndex: i,
  });
  accounts.push(account);

  const hash = await walletClient.sendTransaction({
    account: anvilAccount,
    chain: foundry,
    to: account.address,
    value: parseEther("10"),
  });
  awaitTxs.push(publicClient.waitForTransactionReceipt({ hash }));
}

console.log("Waiting for drip transactions to be mined");
await Promise.all(awaitTxs);

console.log("Checking balances");
for (const account of accounts) {
  const balance = await publicClient.getBalance(account);
  if (balance < parseEther("10")) {
    throw new Error(`Expected balance of ${account.address} to be at least 10 ETH`);
  }
}

let succeeded = 0;
let failedSilently = 0;
let failed = 0;
console.log("increment concurrently");
await Promise.all(
  accounts.map(async (account) => {
    const hash = await contract.write.increment({ account });
    try {
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === "reverted") {
        console.error(++failedSilently, `transaction silently failed, viem did not throw as expected`);
      } else {
        console.log(++succeeded, "succeeded");
      }
    } catch (e) {
      console.error(++failed, `transaction failed`);
    }
  })
);

succeeded = 0;
failedSilently = 0;
failed = 0;
console.log("increment sequentially");
for (const account of accounts) {
  const hash = await contract.write.increment({ account });
  try {
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status === "reverted") {
      console.error(++failedSilently, `transaction silently failed, viem did not throw as expected`);
    } else {
      console.log(++succeeded, "succeeded");
    }
  } catch (e) {
    console.error(++failed, `transaction failed`);
  }
}
