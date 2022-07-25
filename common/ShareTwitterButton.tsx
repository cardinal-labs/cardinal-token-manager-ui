import { css } from '@emotion/react'
import type { TokenData } from 'api/api'
import type { ProjectConfig } from 'config/config'

type Props = {
  children: string | JSX.Element
  className?: string
  disabled?: boolean
  shareLink: string
}

export const shareTwitterClaimedLink = (
  tokenData: TokenData,
  config: ProjectConfig,
  issuerName?: string
) => {
  return [
    `https://twitter.com/intent/tweet?text=`,
    encodeURIComponent(
      `I just rented ${
        tokenData.metaplexData?.data.data.name
          ? `${config.twitterHandle ? `${config.twitterHandle} ` : ''}${
              tokenData.metaplexData?.data.data.name
            }`
          : `a ${config.twitterHandle ? `${config.twitterHandle} ` : ''}NFT`
      }${
        issuerName ? ` from ${issuerName}` : ''
      } using @cardinal_labs rental UI! Check it out at https://rent.cardinal.so/claim/${tokenData.tokenManager?.pubkey.toString()}.`
    ),
  ].join('')
}

export const shareTwitterListedLink = (
  tokenDatas: TokenData[],
  config: ProjectConfig
) => {
  return [
    `https://twitter.com/intent/tweet?text=`,
    encodeURIComponent(
      tokenDatas.length === 1
        ? `I just listed ${
            tokenDatas[0]!.metaplexData?.data.data.name
              ? `${config.twitterHandle ? `${config.twitterHandle} ` : ''}${
                  tokenDatas[0]!.metaplexData?.data.data.name
                }`
              : `a ${config.twitterHandle ? `${config.twitterHandle} ` : ''}NFT`
          } for rent using @cardinal_labs rental UI! Check it out at https://rent.cardinal.so/claim/${tokenDatas[0]!.tokenManager?.pubkey.toString()}.`
        : `I just listed ${tokenDatas.length} ${
            config.twitterHandle ? `${config.twitterHandle} ` : ''
          }NFTs! Check it out at https://rent.cardinal.so/${config.name}.`
    ),
  ].join('')
}

export const ShareTwitterButton: React.FC<Props> = ({
  children,
  className,
  disabled,
  shareLink,
  ...rest
}: Props) => {
  return (
    <a
      {...rest}
      className={`flex items-center justify-center gap-5 rounded-xl transition-all ${className} ${
        disabled ? 'cursor-default bg-medium-4' : 'cursor-pointer bg-twitter'
      }`}
      css={css`
        &:hover {
          filter: brightness(115%);
        }
      `}
      target="_blank"
      rel="noreferrer"
      href={shareLink}
    >
      <div className="flex items-center justify-center gap-1">
        {children && (
          <div
            className={`py-3 ${disabled ? 'text-medium-3' : 'text-light-0'}`}
          >
            {children}
          </div>
        )}
      </div>
    </a>
  )
}
