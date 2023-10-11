import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";
import { BigNumberish, ethers } from "ethers";
import masterchefabi from "../src/masterchefabi.json";
import tokenabi from "../src/erc20abi.json";
const masterChefAddr = "0xF304173835243F18Be7634B5394b53108a2De990";
const web3provider = async () => {
  const [account] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: custom(window.ethereum),
  });
  return client;
};
const convertToEth = async (type: string, value: BigNumberish) => {
  if (type == "reward") {
    return Number(ethers.utils.formatEther(value)).toFixed(8);
  } else {
    return Number(ethers.utils.formatEther(value)).toFixed(2);
  }
};
const covertToWei = async (value: string) => {
  return ethers.utils.parseEther(value);
};
export async function connectWallet() {
  const connection = await web3provider();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const masterchef = new ethers.Contract(
    "0xF304173835243F18Be7634B5394b53108a2De990",
    masterchefabi,
    signer
  );
  return {
    connection,
    signer,
    masterchef,
    masterchefAddr: "0xF304173835243F18Be7634B5394b53108a2De990",
  };
}
export const fetchTokenBalance = async (
  tokenaddress: string,
  userwallet: any
) => {
  const web3connection = await connectWallet();
  const tokencontract = new ethers.Contract(
    tokenaddress,
    tokenabi,
    web3connection.signer
  );
  let poolBalance = await tokencontract.balanceOf(masterChefAddr);
  let pool = await convertToEth("", poolBalance);
  let userBalance = await tokencontract.balanceOf(userwallet);
  let user = await convertToEth("", userBalance);
  return { pool, user };
};
export const getPoolDetails = async () => {
  console.log("poolll");
  let web3connection = await connectWallet();
  let userwallet = web3connection.connection.account.address;
  let masterchef = web3connection.masterchef;
  let poolLength = Number((await masterchef.poolLength()).toString());
  let poolArray = [];
  for (let i = 0; i < poolLength; i++) {
    let poolInfo = await masterchef.poolInfo(i);
    let tokenAddress = poolInfo[0];
    let rewardPerTokenRaw = poolInfo[3].toString();
    let rewardPerToken = Number(
      await convertToEth("reward", rewardPerTokenRaw)
    );
    let tokenbalances = await fetchTokenBalance(tokenAddress, userwallet);
    let userStakedArray = await masterchef.userInfo(i, userwallet);
    console.log(userStakedArray);
    let userRewRaw = (await masterchef.pendingReward(i, userwallet)).toString();
    let bonus = (await masterchef.BONUS_MULTIPLIER()).toString();
    let userReward = Number(await convertToEth("reward", userRewRaw)).toFixed(
      2
    );
    let userStaked = Number(
      await convertToEth("reward", userStakedArray["amount"].toString())
    ).toFixed(2);
    let APR = (1000 * rewardPerToken * 100).toFixed(3);
    let poolstats = {
      totalstaked: tokenbalances.pool,
      apy: APR,
      userstaked: userStaked,
      reward: userReward,
      multiplier: bonus,
      userbalance: tokenbalances.user,
      tokenaddr: tokenAddress,
    };
    poolArray.push(poolstats);
  }
  return poolArray;
};
export const action = async (
  i: number,
  amount: number,
  tokenaddress: string,
  action: string
) => {};
export const autoCompound = async () => {
  let web3connection = await connectWallet();
  let masterchef = web3connection.masterchef;
  let result = await masterchef.autoCompound().then(() => {
    return true;
  });
  return result;
};
