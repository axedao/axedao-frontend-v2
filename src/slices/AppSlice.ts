import { BigNumber, ethers } from 'ethers';
import { addresses } from "../constants";
import { abi as OlympusStakingv2 } from "../abi/OlympusStakingv2.json";
import { abi as sOHM } from "../abi/sOHM.json";
import { abi as ohmDAI } from "../abi/reserves/OhmDai.json";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as sOHMv2 } from "../abi/sOhmv2.json";
import { abi as AxeCirculatingSupply } from "../abi/AxeCirculatingSupply.json";
import { setAll, getTokenPrice, getMarketPrice } from "../helpers";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAsyncThunk } from "./interfaces";
import { calcRunway } from "src/helpers/Runway";
import multicall from '../helpers/multicall'
import { abi as loadAppDetailsABI } from "../abi/custom/loadAppDetails.json";

const initialState = {
  loading: false,
  loadingMarketPrice: false,
};

const circulatingSupply = {
  inputs: [],
  name: "circulatingSupply",
  outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  stateMutability: "view",
  type: "function",
};

export const loadAppDetails = createAsyncThunk(
  "app/loadAppDetails",
  async ({ networkID, provider }: IBaseAsyncThunk, { dispatch }) => {

    // NOTE (appleseed): marketPrice from Graph was delayed, so get CoinGecko price
    // const marketPrice = parseFloat(graphData.data.protocolMetrics[0].ohmPrice);
    let marketPrice;
    try {
      const originalPromiseResult = await dispatch(
        loadMarketPrice({ networkID: networkID, provider: provider }),
      ).unwrap();
      marketPrice = originalPromiseResult?.marketPrice;
    } catch (rejectedValueOrSerializedError) {
      // handle error here
      console.error("Returned a null response from dispatch(loadMarketPrice)");
      return;
    }

    const calls = [
      { address: addresses[networkID].AXE_ADDRESS, name: 'balanceOf', params: [addresses[networkID].STAKING_ADDRESS] },
      { address: addresses[networkID].AXE_ADDRESS, name: 'balanceOf', params: ["0x000000000000000000000000000000000000dead"] },
      { address: addresses[networkID].SAXE_ADDRESS, name: 'circulatingSupply', params: [] },
      { address: addresses[networkID].AXE_CIRCULATING_SUPPLY, name: 'AXECirculatingSupply', params: [] },
      { address: addresses[networkID].AXE_ADDRESS, name: 'totalSupply', params: [] },
      { address: addresses[networkID].STAKING_ADDRESS, name: 'epoch', params: [] },
      { address: addresses[networkID].AXE_DAI_LP, name: 'totalSupply', params: [] },
      { address: addresses[networkID].AXE_DAI_LP, name: 'balanceOf', params: [addresses[networkID].TREASURY_ADDRESS] },
      { address: addresses[networkID].STAKING_ADDRESS, name: 'index', params: [] },
    ];
    const rawAppDetails = await multicall(networkID, provider, loadAppDetailsABI, calls)

    const axeBalance = rawAppDetails[0][0];
    const sAxeDAOBalance = rawAppDetails[1][0];
    const sAxeCirc = rawAppDetails[2][0] / 1e9;
    const circ = rawAppDetails[3][0];
    const total = rawAppDetails[4][0];
    const epoch = rawAppDetails[5];
    const total_lp = rawAppDetails[6][0];
    const axeDAIBalance = rawAppDetails[7][0];
    const currentIndex = rawAppDetails[8][0];

    const stakingTVL = (axeBalance * marketPrice) / 1e9;
    const circSupply = circ / 1e9;
    const totalSupply = total / 1e9;
    const marketCap = marketPrice * circSupply;
    const pol = axeDAIBalance.mul(100).div(total_lp).toNumber() / 100;

    const sAxeDAO = (circ - sAxeDAOBalance) / 1e9;
    // Calculating staking
    const stakingReward = (epoch.distribute / 1e9);
    const stakingRebase = stakingReward / sAxeCirc;
    const fiveDayRate = Math.pow(1 + stakingRebase, 5 * 3) - 1;
    let stakingAPY = Math.pow(1 + stakingRebase, 365 * 3) - 1;
    const stakingRatio = sAxeCirc / circSupply;
    const nextRebase = epoch.endTime.toNumber();

    const runway = await calcRunway(circSupply, stakingRebase, { networkID, provider });

    if (!provider) {
      console.error("failed to connect to provider, please connect your wallet");
      return {
        stakingTVL,
        stakingRatio,
        marketPrice,
        marketCap,
        circSupply,
        totalSupply,
        runway,
        pol,
      };
    }
    const currentBlock = await provider.getBlockNumber();
    const currentBlockTime = (await provider.getBlock(currentBlock)).timestamp;

    return {
      currentIndex: ethers.utils.formatUnits(currentIndex, "gwei"),
      currentBlock,
      currentBlockTime,
      fiveDayRate,
      stakingAPY,
      stakingTVL,
      stakingRatio,
      stakingRebase,
      marketCap,
      marketPrice,
      circSupply,
      totalSupply,
      // treasuryMarketValue,
      nextRebase,
      runway,
      pol,
    } as IAppData;
  },
);

/**
 * checks if app.slice has marketPrice already
 * if yes then simply load that state
 * if no then fetches via `loadMarketPrice`
 *
 * `usage`:
 * ```
 * const originalPromiseResult = await dispatch(
 *    findOrLoadMarketPrice({ networkID: networkID, provider: provider }),
 *  ).unwrap();
 * originalPromiseResult?.whateverValue;
 * ```
 */
export const findOrLoadMarketPrice = createAsyncThunk(
  "app/findOrLoadMarketPrice",
  async ({ networkID, provider }: IBaseAsyncThunk, { dispatch, getState }) => {
    const state: any = getState();
    let marketPrice;
    // check if we already have loaded market price
    if (state.app.loadingMarketPrice === false && state.app.marketPrice) {
      // go get marketPrice from app.state
      marketPrice = state.app.marketPrice;
    } else {
      // we don't have marketPrice in app.state, so go get it
      try {
        const originalPromiseResult = await dispatch(
          loadMarketPrice({ networkID: networkID, provider: provider }),
        ).unwrap();
        marketPrice = originalPromiseResult?.marketPrice;
      } catch (rejectedValueOrSerializedError) {
        // handle error here
        console.error("Returned a null response from dispatch(loadMarketPrice)");
        return;
      }
    }
    return { marketPrice };
  },
);

/**
 * - fetches the OHM price from CoinGecko (via getTokenPrice)
 * - falls back to fetch marketPrice from ohm-dai contract
 * - updates the App.slice when it runs
 */
const loadMarketPrice = createAsyncThunk("app/loadMarketPrice", async ({ networkID, provider }: IBaseAsyncThunk) => {
  let marketPrice: number;
  try {
    marketPrice = await getMarketPrice({ networkID, provider });
    marketPrice = marketPrice / Math.pow(10, 9);
  } catch (e) {
    marketPrice = await getTokenPrice("axedao");
  }
  return { marketPrice };
});

interface IAppData {
  readonly circSupply: number;
  readonly currentIndex?: string;
  readonly currentBlock?: number;
  readonly currentBlockTime?: number;
  readonly fiveDayRate?: number;
  readonly marketCap: number;
  readonly marketPrice: number;
  readonly stakingAPY?: number;
  readonly stakingRebase?: number;
  readonly stakingTVL: number;
  readonly stakingRatio?: number;
  readonly totalSupply: number;
  readonly treasuryBalance?: number;
  readonly nextRebase?: number;
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    fetchAppSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAppDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAppDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAppDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.name, error.message, error.stack);
      })
      .addCase(loadMarketPrice.pending, (state, action) => {
        state.loadingMarketPrice = true;
      })
      .addCase(loadMarketPrice.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loadingMarketPrice = false;
      })
      .addCase(loadMarketPrice.rejected, (state, { error }) => {
        state.loadingMarketPrice = false;
        console.error(error.name, error.message, error.stack);
      });
  },
});

const baseInfo = (state: RootState) => state.app;

export default appSlice.reducer;

export const { fetchAppSuccess } = appSlice.actions;

export const getAppState = createSelector(baseInfo, app => app);
