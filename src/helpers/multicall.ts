import { ethers } from 'ethers'
import MultiCallAbi from '../abi/Multicall.json'


const multiCall = {
    1: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
    4: '0x42Ad527de7d4e9d9d011aC45B31D8551f8Fe9821',
}

const getContract = (abi: any, address: string, signer?: ethers.Signer | ethers.providers.Provider) => {
  return new ethers.Contract(address, abi, signer)
}

// @ts-ignore
export const getMulticallContract = (signer?: ethers.Signer | ethers.providers.Provider, networkID) => {
    // @ts-ignore
    return getContract(MultiCallAbi, multiCall[networkID], signer)
}

export interface Call {
  address: string // Address of the contract
  name: string // Function name on the contract (example: balanceOf)
  params?: any[] // Function params
}

interface MulticallOptions {
  requireSuccess?: boolean
}

const multicall = async <T = any>(networkID: number, provider: any, abi: any[], calls: Call[]): Promise<T> => {
  try {
    const multi = getMulticallContract(provider, networkID)
    const itf = new ethers.utils.Interface(abi)

    const calldata = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)])
    const { returnData } = await multi.aggregate(calldata)

    const res = returnData.map((call: any, i: any) => itf.decodeFunctionResult(calls[i].name, call))

    return res
  } catch (error: any) {
    console.log(error);
    
    throw new Error(error)
  }
}

/**
 * Multicall V2 uses the new "tryAggregate" function. It is different in 2 ways
 *
 * 1. If "requireSuccess" is false multicall will not bail out if one of the calls fails
 * 2. The return inclues a boolean whether the call was successful e.g. [wasSuccessfull, callResult]
 */
export const multicallv2 = async <T = any>(
    networkID: number,
    provider: any,
    abi: any[],
    calls: Call[],
    options: MulticallOptions = { requireSuccess: true },
) => {
  const { requireSuccess } = options
  const multi = getMulticallContract(provider, networkID)
  const itf = new ethers.utils.Interface(abi)

  const calldata = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)])
  const returnData = await multi.tryAggregate(requireSuccess, calldata)
  const res = returnData.map((call: any, i: any) => {
    const [result, data] = call
    return result ? itf.decodeFunctionResult(calls[i].name, data) : null
  })

  return res
}

export default multicall
