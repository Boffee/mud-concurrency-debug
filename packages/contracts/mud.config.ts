import { mudConfig } from "@latticexyz/world/register";
import "@latticexyz/world/snapsync";

export default mudConfig({
  snapSync: true,
  tables: {
    Counter: {
      keySchema: {},
      schema: "uint32",
    },
    Owner: "bytes32",
  },
});
