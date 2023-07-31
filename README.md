# Problem

mud2 transactions fail when multiple clients send transactions to the same function at the same time.

# Test Setup

A single line was added to the template `IncrementSystem.increment()` function:

```
contract IncrementSystem is System {
    function increment() public returns (uint32) {
        uint32 counter = Counter.get();
        uint32 newValue = counter + 1;
        Counter.set(newValue);

        // NOTE: comment out this line and async test will run successfully
        Owner.set(bytes32(uint256(newValue)), bytes32(uint256(0xdeadbeef)));

        return newValue;
    }
}
```

The test script (`packages/contracts/run.ts`):

1. creates and funds 100 accounts
2. calls `increment()` on every account concurrently
3. waits for all transactions to complete
4. calls `increment()` again sequentially one account at a time.

# Result

Sequentially calling `increment()` works as expected. Concurrently calling `increment()` fails silently ([doesn't throw error as expected](https://viem.sh/docs/actions/public/waitForTransactionReceipt.html#waitfortransactionreceipt)) after the first successful call.

Foundry test which calls `increment()` multiple times on multiple accounts within the same block succeeds.

Removing `Owner.set(bytes32(uint256(newValue)), bytes32(uint256(0xdeadbeef)));` or snap sync makes concurrent calls succeed.

# Run Script

```sh
pnpm i
# deploy contract to anvil
pnpm dev
```

```sh
# runs test on deployed contract in separate shell
pnpm --filter contracts mud-concurrency-debug
```
