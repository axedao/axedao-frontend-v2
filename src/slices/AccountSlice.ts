import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as sOHMv2 } from "../abi/sOhmv2.json";
import { setAll } from "../helpers";
import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { Bond, NetworkID } from "src/lib/Bond"; // TODO: this type definition needs to move out of BOND.
import { RootState } from "src/store";
import { IBaseAddressAsyncThunk, ICalcUserBondDetailsAsyncThunk } from "./interfaces";
import multicall from '../helpers/multicall'
import { abi as calculateUserBondDetailsABI } from "../abi/custom/calculateUserBondDetails.json";

export const getBalances = createAsyncThunk(
  "account/getBalances",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk) => {
    // const axeContract = new ethers.Contract(addresses[networkID].AXE_ADDRESS as string, ierc20Abi, provider);
    // const axeBalance = await axeContract.balanceOf(address);
    // const saxeContract = new ethers.Contract(addresses[networkID].SAXE_ADDRESS as string, ierc20Abi, provider);
    // const saxeBalance = await saxeContract.balanceOf(address);

    const calls = [
      { address: addresses[networkID].DAI_ADDRESS, name: 'balanceOf', params: [address] },
      { address: addresses[networkID].AXE_ADDRESS, name: 'balanceOf', params: [address] },
      { address: addresses[networkID].SAXE_ADDRESS, name: 'balanceOf', params: [address] }
    ];
    const rawBalance = await multicall(networkID, provider, ierc20Abi, calls)
    // console.log(rawBalance);
    const daiBalance = rawBalance[0][0];
    const axeBalance = rawBalance[1][0];
    const saxeBalance = rawBalance[2][0];
    

    return {
      balances: {
        dai: ethers.utils.formatUnits(daiBalance, "gwei"),
        ohm: ethers.utils.formatUnits(axeBalance, "gwei"),
        sohm: ethers.utils.formatUnits(saxeBalance, "gwei"),
      },
    };
  },
);

export const loadAccountDetails = createAsyncThunk(
  "account/loadAccountDetails",
  async ({ networkID, provider, address }: IBaseAddressAsyncThunk, { dispatch }) => {
    let axeBalance = 0;
    let saxeBalance = 0;
    let stakeAllowance = 0;
    let unstakeAllowance = 0;
    let daiBondAllowance = 0;

    const axeContract = new ethers.Contract(addresses[networkID].AXE_ADDRESS as string, ierc20Abi, provider);
    stakeAllowance = await axeContract.allowance(address, addresses[networkID].STAKING_HELPER_ADDRESS);

    const saxeContract = new ethers.Contract(addresses[networkID].SAXE_ADDRESS as string, sOHMv2, provider);
    unstakeAllowance = await saxeContract.allowance(address, addresses[networkID].STAKING_ADDRESS);

    await dispatch(getBalances({ address, networkID, provider }));

    return {
      staking: {
        ohmStake: +stakeAllowance,
        ohmUnstake: +unstakeAllowance,
      }
    };
  },
);

export interface IUserBondDetails {
  allowance: number;
  interestDue: number;
  bondMaturationTime: number;
  pendingPayout: string; //Payout formatted in gwei.
}
export const calculateUserBondDetails = createAsyncThunk(
  "account/calculateUserBondDetails",
  async ({ address, bond, networkID, provider }: ICalcUserBondDetailsAsyncThunk) => {
    if (!address) {
      return {
        bond: "",
        displayName: "",
        bondIconSvg: "",
        isLP: false,
        allowance: 0,
        balance: "0",
        interestDue: 0,
        bondMaturationTime: 0,
        pendingPayout: "",
      };
    }
    // dispatch(fetchBondInProgress());

    // Calculate bond details.
    // const bondContract = bond.getContractForBond(networkID, provider);
    // const reserveContract = bond.getContractForReserve(networkID, provider);

    let interestDue, pendingPayout, bondMaturationTime;
    const bondAddress = bond.getAddressForBond(networkID)
    const reserveAddress = bond.getAddressForReserve(networkID)
    const calls = [
      { address: bondAddress, name: 'bondInfo', params: [address] },
      { address: bondAddress, name: 'pendingPayoutFor', params: [address] },
      { address: reserveAddress, name: 'allowance', params: [address, bondAddress] },
      { address: reserveAddress, name: 'balanceOf', params: [address] },
    ];
    const rawBond = await multicall(networkID, provider, calculateUserBondDetailsABI, calls)
    
    const bondDetails = rawBond[0];
    
    interestDue = bondDetails.payout / Math.pow(10, 9);
    bondMaturationTime = +bondDetails.vesting + +bondDetails.lastTimestamp;
    pendingPayout = rawBond[1][0];

    let allowance,
      balance = 0;
    allowance = rawBond[2][0];
    balance = rawBond[3][0];
    // formatEthers takes BigNumber => String
    // const balanceVal = ethers.utils.formatEther(balance);
    // balanceVal should NOT be converted to a number. it loses decimal precision
    let deciamls = 18;
    if (bond.name == "usdc" || bond.name == "usdt") {
      deciamls = 6;
    }
    const balanceVal = balance / Math.pow(10, deciamls);
    return {
      bond: bond.name,
      displayName: bond.displayName,
      bondIconSvg: bond.bondIconSvg,
      isLP: bond.isLP,
      allowance: Number(allowance),
      balance: balanceVal.toString(),
      interestDue,
      bondMaturationTime,
      pendingPayout: ethers.utils.formatUnits(pendingPayout, "gwei"),
    };
  },
);

interface IAccountSlice {
  bonds: { [key: string]: IUserBondDetails };
  balances: {
    ohm: string;
    sohm: string;
    dai: string;
  };
  loading: boolean;
}
const initialState: IAccountSlice = {
  loading: false,
  bonds: {},
  balances: { ohm: "", sohm: "", dai: "" },
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    fetchAccountSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAccountDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAccountDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAccountDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(getBalances.pending, state => {
        state.loading = true;
      })
      .addCase(getBalances.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getBalances.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(calculateUserBondDetails.pending, state => {
        state.loading = true;
      })
      .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
        if (!action.payload) return;
        const bond = action.payload.bond;
        state.bonds[bond] = action.payload;
        state.loading = false;
      })
      .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      });
  },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
