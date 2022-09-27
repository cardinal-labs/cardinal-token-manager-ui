import type { Keypair } from '@solana/web3.js'
import type { TokenData } from 'apis/api'
import { Alert } from 'common/Alert'
import { Button } from 'common/Button'
import { getRentalRateDisplayText } from 'common/NFTIssuerInfo'
import { RentalSummary, secondsToStringForDisplay } from 'common/RentalSummary'
import { useHandleClaimRental } from 'handlers/useHandleClaimRental'
import { usePaymentMints } from 'hooks/usePaymentMints'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'
import { useModal } from 'providers/ModalProvider'
import { useProjectConfig } from 'providers/ProjectConfigProvider'
import { useState } from 'react'
import { LoadingSpinner } from 'rental-components/common/LoadingSpinner'
import { PoweredByFooter } from 'rental-components/common/PoweredByFooter'
import { RentalClaimCardTokenHeader } from 'rental-components/common/RentalCardTokenHeader'

import { RentalSuccessCard } from './RentalSuccessCard'

export type RentalFixedCardParams = {
  tokenData: TokenData
  otpKeypair?: Keypair
}

export const RentalFixedText = ({ tokenData }: { tokenData: TokenData }) => {
  const { durationSeconds } = tokenData.timeInvalidator?.parsed || {}
  if (!durationSeconds) return <></>
  return (
    <div className="mb-8 px-8 text-center text-base text-medium-3">
      This NFT can be rented for a fixed duration of{' '}
      {secondsToStringForDisplay(durationSeconds?.toNumber() ?? 0, {
        fullSuffix: true,
        delimiter: ' ',
        showTrailingZeros: false,
      })}
    </div>
  )
}

export const RentalFixedInfo = ({ tokenData }: { tokenData: TokenData }) => {
  const paymentMints = usePaymentMints()
  const { configFromToken } = useProjectConfig()
  const config = configFromToken(tokenData)
  const { durationSeconds } = tokenData.timeInvalidator?.parsed || {}
  return (
    <div className="flex justify-between gap-4">
      <div>
        <div className="mb-1 text-base text-light-0">Rental duration</div>
        <div className="text-base text-medium-3">
          {secondsToStringForDisplay(durationSeconds?.toNumber() ?? 0, {
            fullSuffix: true,
            delimiter: ' ',
            showTrailingZeros: false,
          })}
        </div>
      </div>
      <div>
        <div className="mb-1 text-base text-light-0">Fixed price</div>
        <div className="text-base text-medium-3">
          {getRentalRateDisplayText(
            config,
            tokenData,
            paymentMints.data,
            'text-medium-3'
          )}
        </div>
      </div>
    </div>
  )
}

export const RentalFixedCard = ({
  tokenData,
  otpKeypair,
}: RentalFixedCardParams) => {
  const [error, setError] = useState<string>()
  const [txid, setTxid] = useState<string>()
  const handleClaimRental = useHandleClaimRental()
  const { environment } = useEnvironmentCtx()

  if (txid) return <RentalSuccessCard tokenData={tokenData} txid={txid} />
  return (
    <div className="rounded-lg bg-dark-6 p-8">
      <RentalClaimCardTokenHeader tokenData={tokenData} />
      <RentalFixedText tokenData={tokenData} />
      <div className="flex flex-col gap-4">
        <RentalFixedInfo tokenData={tokenData} />
        <RentalSummary tokenData={tokenData} />
        {txid && (
          <Alert variant="success">
            Congratulations! You have succesfully claimed your rental with
            transaction shown{' '}
            <a
              className="text-blue-500"
              href={`https://explorer.solana.com/tx/${txid}?cluster=${
                environment.label?.toString() ?? ''
              }`}
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>
          </Alert>
        )}
        {error && (
          <Alert variant="error" showClose onClick={() => setError(undefined)}>
            {error}
          </Alert>
        )}
        <Button
          variant="primary"
          className="h-12"
          onClick={() =>
            handleClaimRental.mutate(
              {
                tokenData,
                otpKeypair,
                rentalType: 'duration',
              },
              {
                onSuccess: (txid) => {
                  setTxid(txid)
                },
                onError: (e) => {
                  setTxid(undefined)
                  setError(`${e}`)
                },
              }
            )
          }
        >
          {handleClaimRental.isLoading ? (
            <LoadingSpinner height="25px" />
          ) : (
            <div
              style={{ gap: '5px' }}
              className="flex items-center justify-center text-base"
            >
              Rent NFT
            </div>
          )}
        </Button>
      </div>
      <PoweredByFooter />
    </div>
  )
}
export const useRentalFixedCard = () => {
  const { showModal } = useModal()
  return {
    showModal: (params: RentalFixedCardParams) =>
      showModal(<RentalFixedCard {...params} />),
  }
}
