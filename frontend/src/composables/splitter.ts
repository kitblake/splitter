import { reactive, ref } from "vue";
import artifact from "@splitter/contracts/artifacts/contracts/Splitter.sol/Splitter.json";
import { Splitter } from "@splitter/contracts/typechain/Splitter";
import { BigNumber, ethers } from "ethers";
import useConfig from "@/config";

const { rpcURL } = useConfig();

const splitterAddress: Readonly<Record<string, string>> = {
  localhost: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
};

type Payee = {
  address: string;
  share: number;
  available: number;
};

export default function useSplitter() {
  const state = reactive({
    address: "",
    owner: "",
    totalReceived: 0,
    state: "",
    totalPayees: 0,
    totalShares: 1,
    payees: <Payee[]>[],
  });

  async function fetch(address: string) {
    const provider = new ethers.providers.JsonRpcProvider(rpcURL);
    const splitter = new ethers.Contract(address, artifact.abi, provider) as Splitter;

    const owner = await splitter.owner();
    const totalPayees = await splitter.totalPayees();
    const totalShares = await splitter.totalShares();

    const stateNum = await splitter.state();

    const balance = await provider.getBalance(address);
    const totalRelease = await splitter.totalReleased();
    const totalReceived = balance.add(totalRelease);

    for (let i = 0; i < totalPayees.toNumber(); i++) {
      const address = await splitter.payee(BigNumber.from(i));
      const share = await splitter.shares(address);
      const available = totalReceived.mul(share).div(totalShares);

      const payee: Payee = {
        address,
        share: share.toNumber(),
        available: available.toNumber(),
      };

      state.payees.push(payee);
    }

    state.address = address;
    state.owner = owner;
    state.totalPayees = totalPayees.toNumber();
    state.totalShares = totalShares.toNumber();
    state.totalReceived = totalRelease.toNumber();
    switch (stateNum) {
      case 0:
        state.state = "Opening";
        break;
      case 1:
        state.state = "Finalized";
        break;
    }
  }

  return {
    state,
    fetch,
  };
}