// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {System} from "@latticexyz/world/src/System.sol";
import {Counter, Owner} from "../codegen/Tables.sol";

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
