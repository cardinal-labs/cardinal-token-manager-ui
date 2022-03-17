import {
  CreateMasterEditionV3,
  CreateMetadataV2,
  DataV2,
  MasterEdition,
  Metadata,
} from '@metaplex-foundation/mpl-token-metadata'
import { BN } from '@project-serum/anchor'
import type {
  Wallet} from '@saberhq/solana-contrib';
import {
  SignerWallet,
  SolanaProvider,
  TransactionEnvelope
} from '@saberhq/solana-contrib'
import * as splToken from '@solana/spl-token'
import type { Connection} from '@solana/web3.js';
import * as web3 from '@solana/web3.js'
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'

/**
 * Pay and create mint and token account
 * @param connection
 * @param creator
 * @returns
 */
export const createMint = async (
  connection: web3.Connection,
  creator: web3.Keypair,
  recipient: web3.PublicKey,
  amount = 1,
  freezeAuthority: web3.PublicKey = recipient
): Promise<[web3.PublicKey, splToken.Token]> => {
  const mint = await splToken.Token.createMint(
    connection,
    creator,
    creator.publicKey,
    freezeAuthority,
    0,
    splToken.TOKEN_PROGRAM_ID
  )
  const tokenAccount = await mint.createAssociatedTokenAccount(recipient)
  await mint.mintTo(tokenAccount, creator.publicKey, [], amount)
  return [tokenAccount, mint]
}

type SimpleMetadata = { name: string; symbol: string; uri: string }
const airdropMetadata: SimpleMetadata[] = [
  {
    name: 'Portals',
    symbol: 'PRTL',
    uri: 'https://arweave.net/-QsrbBfmFy4Fxp-BtSnSFiajm_KECo5ctRXR6uSBS5k',
  },
  {
    name: 'Portals',
    symbol: 'PRTL',
    uri: 'https://arweave.net/RewRYM3lf-1Ry1hitgsiXuqsuERSujlTAChgl9S483c',
  },
  {
    name: 'Portals',
    symbol: 'PRTL',
    uri: 'https://arweave.net/6ZcTxyREtg0WsOSGSBq-CSyQ3DPlU1k4R_A7mrgehRE',
  },
]
export async function airdropNFT(
  connection: Connection,
  wallet: Wallet
): Promise<string> {
  const randInt = Math.round(Math.random() * (airdropMetadata.length - 1))
  const metadata: SimpleMetadata = airdropMetadata[randInt]!
  const tokenCreator = Keypair.generate()
  const fromAirdropSignature = await connection.requestAirdrop(
    tokenCreator.publicKey,
    LAMPORTS_PER_SOL
  )
  await connection.confirmTransaction(fromAirdropSignature)

  const [_masterEditionTokenAccountId, masterEditionMint] = await createMint(
    connection,
    tokenCreator,
    wallet.publicKey,
    1,
    tokenCreator.publicKey
  )

  const masterEditionMetadataId = await Metadata.getPDA(
    masterEditionMint.publicKey
  )
  const metadataTx = new CreateMetadataV2(
    { feePayer: tokenCreator.publicKey },
    {
      metadata: masterEditionMetadataId,
      metadataData: new DataV2({
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        sellerFeeBasisPoints: 10,
        creators: null,
        collection: null,
        uses: null,
      }),
      updateAuthority: tokenCreator.publicKey,
      mint: masterEditionMint.publicKey,
      mintAuthority: tokenCreator.publicKey,
    }
  )

  const masterEditionId = await MasterEdition.getPDA(
    masterEditionMint.publicKey
  )
  const masterEditionTx = new CreateMasterEditionV3(
    {
      feePayer: tokenCreator.publicKey,
      recentBlockhash: (await connection.getRecentBlockhash('max')).blockhash,
    },
    {
      edition: masterEditionId,
      metadata: masterEditionMetadataId,
      updateAuthority: tokenCreator.publicKey,
      mint: masterEditionMint.publicKey,
      mintAuthority: tokenCreator.publicKey,
      maxSupply: new BN(1),
    }
  )

  const txEnvelope = new TransactionEnvelope(
    SolanaProvider.init({
      connection: connection,
      wallet: new SignerWallet(tokenCreator),
      opts: {
        commitment: 'singleGossip',
      },
    }),
    [...metadataTx.instructions, ...masterEditionTx.instructions]
  )
  const pendingTX = await txEnvelope.send({
    commitment: 'singleGossip',
  })
  console.log(
    `Master edition (${masterEditionId.toString()}) created with metadata (${masterEditionMetadataId.toString()})`
  )
  return pendingTX.signature
}

export async function getATokenAccountInfo(
  connection: Connection,
  mint: web3.PublicKey,
  owner: web3.PublicKey
): Promise<splToken.AccountInfo> {
  const aTokenAccount = await splToken.Token.getAssociatedTokenAddress(
    splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
    splToken.TOKEN_PROGRAM_ID,
    mint,
    owner
  )
  const token = new splToken.Token(
    connection,
    mint,
    splToken.TOKEN_PROGRAM_ID,
    // @ts-ignore
    null
  )
  return token.getAccountInfo(aTokenAccount)
}

export const tryPublicKey = (
  publicKeyString: string | string[] | undefined
): web3.PublicKey | null => {
  if (!publicKeyString) return null
  try {
    return new web3.PublicKey(publicKeyString)
  } catch (e) {
    return null
  }
}
