import { Account, GlittrSDK, txBuilder } from "@glittr-sdk/sdk";

// Function to create a new meme token contract
async function createMemeToken(
  account: Account,
  tokenData: {
    name: string;
    symbol: string;
    description: string;
    memeUrl: string;
    totalSupply: number;
    amountPerMint: number;
  }
) {
  const NETWORK = "regtest";
  
  const client = new GlittrSDK({
    network: NETWORK,
    electrumApi: "https://hackathon-electrum.glittr.fi",
    glittrApi: "https://hackathon-core-api.glittr.fi",
  });

  // Get public key for initial allocation
  const creatorPublicKey = Array.from(account.p2pkh().keypair.publicKey);

  // Create contract with initial allocation and free mint
  const tx = txBuilder.preallocatedContractInstantiate({
    simple_asset: {
      supply_cap: BigInt(tokenData.totalSupply).toString(),
      divisibility: 18,
      live_time: 0,
    },
    preallocated: {
      allocations: {
        // Allocate 20% to creator
        [Math.floor(tokenData.totalSupply * 0.2).toString()]: [creatorPublicKey]
      },
      vesting_plan: {
        scheduled: [
          [[100, 100], -1] // 100% unlocked after 1 block
        ]
      }
    },
    // 80% for free mint
    free_mint: {
      supply_cap: BigInt(Math.floor(tokenData.totalSupply * 0.8)).toString(),
      amount_per_mint: BigInt(tokenData.amountPerMint).toString(),
    },
  });

  // Create and broadcast transaction
  const txid = await client.createAndBroadcastTx({
    account: account.p2pkh(),
    tx,
    outputs: [{ address: account.p2pkh().address, value: 546 }] // Required dust output
  });

  return txid;
}

// Function to mint tokens from free mint allocation
async function mintMemeTokens(
  account: Account,
  contract: [number, number] // BlockTxTuple
) {
  const client = new GlittrSDK({
    network: "regtest",
    electrumApi: "https://hackathon-electrum.glittr.fi",
    glittrApi: "https://hackathon-core-api.glittr.fi",
  });

  const tx = txBuilder.mint({
    contract,
    pointer: 0,
  });

  const txid = await client.createAndBroadcastTx({
    account: account.p2pkh(),
    tx,
    outputs: [{ address: account.p2pkh().address, value: 546 }]
  });

  return txid;
}

// Function to check token balance
async function checkTokenBalance(
  contractId: string,
  vout: number = 0
) {
  try {
    const result = await fetch(
      `https://hackathon-core-api.glittr.fi/assets/${contractId}/${vout}`
    );
    return await result.text();
  } catch (error) {
    console.error('Error checking balance:', error);
    throw error;
  }
}

export { createMemeToken, mintMemeTokens, checkTokenBalance };