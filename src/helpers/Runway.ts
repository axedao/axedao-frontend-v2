import { ethers } from "ethers";
import { addresses } from "../constants";
import { IBaseAsyncThunk } from "../slices/interfaces";
import { eth, axe_dai } from "./AllBonds";

const balanceOf = {
  inputs: [{ internalType: "address", name: "", type: "address" }],
  name: "balanceOf",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  stateMutability: "view",
  type: "function",
};
const assetPrice = {
  inputs: [],
  name: "assetPrice",
  outputs: [{ internalType: "int256", name: "", type: "int256" }],
  stateMutability: "view",
  type: "function",
};
const getTotalValue = {
  inputs: [{ internalType: "address", name: "_pair", type: "address" }],
  name: "getTotalValue",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  stateMutability: "view",
  type: "function",
};
const decimals = {
  inputs: [],
  name: "decimals",
  outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
  stateMutability: "view",
  type: "function",
};
const circulatingSupply = {
  inputs: [],
  name: "circulatingSupply",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  stateMutability: "view",
  type: "function",
};
const info = {
  inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  name: "info",
  outputs: [
    { internalType: "uint256", name: "rate", type: "uint256" },
    { internalType: "address", name: "recipient", type: "address" },
  ],
  stateMutability: "view",
  type: "function",
};

export async function calcRunway(circulatingSupply: number, stakingRebase: number, { networkID, provider }: IBaseAsyncThunk) {
  const reserves = [
    addresses[networkID].DAI_ADDRESS,
    addresses[networkID].USDC_ADDRESS,
    // eth.networkAddrs[networkID].reserveAddress,
  ];
  
  const lps = [axe_dai.networkAddrs[networkID].reserveAddress];
  // const wftmBondContract = new ethers.Contract(eth.networkAddrs[networkID].bondAddress, [assetPrice], provider);
  const bondCalContract = new ethers.Contract(
    addresses[networkID].BONDINGCALC_ADDRESS as string,
    [getTotalValue],
    provider,
  );
  // const distributorContract = new ethers.Contract(addresses[networkID].DISTRIBUTOR_ADDRESS as string, [info], provider);
  let totalValue = 0;

  for (const reserve of reserves) {
    const reserveContract = new ethers.Contract(reserve, [balanceOf, decimals], provider);
    const balance = await reserveContract.balanceOf(addresses[networkID].TREASURY_ADDRESS);
    const decimal = await reserveContract.decimals();
    const price = 1;
      // reserve == eth.networkAddrs[networkID].bondAddress ? (await wftmBondContract.assetPrice()) / 10 ** 8 : 1;
    const assetValue = (balance / 10 ** decimal) * price;

    totalValue += assetValue;
  }

  for (const lp of lps) {
    totalValue += (await bondCalContract.getTotalValue(lp)) / 10 ** 9;
  }
  
  return Math.log(totalValue / circulatingSupply) / Math.log(1 + stakingRebase) / 3;
}
