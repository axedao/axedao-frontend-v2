import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { NetworkID } from "src/lib/Bond";
import { abi as BondCalcContract } from "src/abi/AxeBondCalcContract.json";
import { ethers } from "ethers";
import { addresses } from "src/constants";

export function getBondCalculator(networkID: NetworkID, provider: StaticJsonRpcProvider) {
  return new ethers.Contract(addresses[networkID].BONDINGCALC_ADDRESS as string, BondCalcContract, provider);
}

export function getBondCalculator1(networkID: NetworkID, provider: StaticJsonRpcProvider) {
  return new ethers.Contract(addresses[networkID].BONDINGCALC_ADDRESS1 as string, BondCalcContract, provider);
}
