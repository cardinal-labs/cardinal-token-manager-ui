import type { AccountData } from '@cardinal/common'
import type { PaidClaimApproverData } from '@cardinal/token-manager/dist/cjs/programs/claimApprover'
import type { TimeInvalidatorData } from '@cardinal/token-manager/dist/cjs/programs/timeInvalidator'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type { UseInvalidatorData } from '@cardinal/token-manager/dist/cjs/programs/useInvalidator'
import type * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import type * as spl from '@solana/spl-token'
import type { IndexedData } from 'hooks/indexData'
import type { ParsedTokenAccountData } from 'hooks/useTokenAccounts'

export interface TokenData {
  tokenAccount?: AccountData<ParsedTokenAccountData>
  mint?: AccountData<spl.Mint> | null
  indexedData?: IndexedData
  tokenManager?: AccountData<TokenManagerData>
  metaplexData?: AccountData<metaplex.Metadata>
  metadata?: AccountData<{
    image?: string
    attributes?: { trait_type: string; value: string }[]
  }> | null
  editionData?: AccountData<metaplex.Edition | metaplex.MasterEditionV2>
  claimApprover?: AccountData<PaidClaimApproverData> | null
  useInvalidator?: AccountData<UseInvalidatorData> | null
  timeInvalidator?: AccountData<TimeInvalidatorData> | null
  recipientTokenAccount?: AccountData<spl.Account>
}