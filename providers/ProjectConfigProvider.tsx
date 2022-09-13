import type { TokenData } from 'apis/api'
import type { ProjectConfig, TokenFilter } from 'config/config'
import { projectConfigs } from 'config/config'
import type { NextPageContext } from 'next'
import type { ReactChild } from 'react'
import React, { useContext, useState } from 'react'

export const getInitialProps = async ({
  ctx,
}: {
  ctx: NextPageContext
}): Promise<{ config: ProjectConfig }> => {
  const projectParams =
    ctx.query.collection || ctx.req?.headers.host || ctx.query.host
  const project =
    projectParams &&
    (typeof projectParams === 'string' ? projectParams : projectParams[0])
      ?.split('.')[0]
      ?.replace('dev-', '')

  return {
    config: project
      ? projectConfigs[project] ||
        Object.values(projectConfigs).find(
          (config) => config.hostname && projectParams.includes(config.hostname)
        ) ||
        projectConfigs['default']!
      : projectConfigs['default']!,
  }
}

export const filterTokens = (
  tokens: TokenData[],
  filter?: {
    type: 'creators' | 'issuer' | 'state' | 'claimer' | 'owner'
    value: string[]
  },
  cluster?: string | undefined
): TokenData[] => {
  return tokens.filter((token) => {
    // filter tokens with no URI
    if (
      (!token.metaplexData?.parsed.data.uri ||
        token.metaplexData?.parsed.data.uri.length <= 0) &&
      (!token.indexedData?.mint_address_nfts?.uri ||
        token.indexedData?.mint_address_nfts?.uri?.length <= 0)
    ) {
      return false
    }
    // if (
    //   token.indexedData?.mint_address_nfts?.metadata_json &&
    //   token.indexedData?.mint_address_nfts &&
    //   (token.indexedData.mint_address_nfts.metadatas_attributes?.length ?? 0) <=
    //     0
    // ) {
    //   return false
    // }
    if (!filter) return true
    switch (filter.type) {
      case 'creators':
        return (
          token.metaplexData?.parsed?.data?.creators?.some(
            (creator) =>
              filter.value.includes(creator.address.toString()) &&
              ((cluster && cluster === 'devnet') || creator.verified)
          ) ||
          token.indexedData?.mint_address_nfts?.metadatas_metadata_creators?.some(
            (creator) =>
              filter.value.includes(creator.creator_address) &&
              ((cluster && cluster === 'devnet') || creator.verified)
          )
        )
      case 'issuer':
        return filter.value.includes(
          token.tokenManager?.parsed.issuer.toString() ?? ''
        )
      case 'state':
        return (
          token.tokenManager?.parsed &&
          filter.value.includes(token.tokenManager?.parsed.state.toString())
        )
      case 'claimer':
        return (
          token.recipientTokenAccount &&
          filter.value.includes(
            token.recipientTokenAccount.parsed.owner.toString()
          )
        )
      case 'owner':
        return (
          token.tokenAccount &&
          !token.tokenManager &&
          filter.value.includes(token.tokenAccount?.parsed.owner.toString())
        )
      default:
        return false
    }
  })
}

export function getLink(path: string, withParams = true) {
  return `${window.location.origin}${path}${
    withParams
      ? path.includes('?') && window.location.search
        ? `${window.location.search.replace('?', '&')}`
        : window.location.search ?? ''
      : ''
  }`
}

export interface ProjectConfigValues {
  config: ProjectConfig
  setProjectConfig: (s: string) => void
  configFromToken: (tokenData?: TokenData, issuer?: string) => ProjectConfig
  subFilter?: TokenFilter
  setSubFilter: (arg: TokenFilter) => void
}

const ProjectConfigValues: React.Context<ProjectConfigValues> =
  React.createContext<ProjectConfigValues>({
    config: projectConfigs['default']!,
    setProjectConfig: () => {},
    configFromToken: () => projectConfigs['default']!,
    setSubFilter: () => {},
  })

export function ProjectConfigProvider({
  children,
  defaultConfig,
}: {
  children: ReactChild
  defaultConfig: ProjectConfig
}) {
  const [config, setConfig] = useState<ProjectConfig>(defaultConfig)
  const [subFilter, setSubFilter] = useState<TokenFilter | undefined>(
    config.subFilters ? config.subFilters[0]?.filter : undefined
  )
  return (
    <ProjectConfigValues.Provider
      value={{
        config: config,
        setProjectConfig: (project: string) => {
          if (projectConfigs[project]) {
            setConfig(projectConfigs[project]!)
            if (projectConfigs[project]?.subFilters) {
              setSubFilter(projectConfigs[project]!.subFilters![0]?.filter)
            } else {
              setSubFilter(undefined)
            }
          }
        },
        configFromToken: (tokenData?: TokenData, issuer?: string) => {
          let newConfig
          if (tokenData) {
            newConfig = Object.values(projectConfigs).find(
              (c) => filterTokens([tokenData], c.filter).length > 0
            )
          }
          if (issuer) {
            newConfig = Object.values(projectConfigs).find(
              (c) =>
                c.filter?.type === 'issuer' && c.filter?.value.includes(issuer)
            )
          }
          return newConfig ?? config
        },
        subFilter,
        setSubFilter,
      }}
    >
      {children}
    </ProjectConfigValues.Provider>
  )
}

export function useProjectConfig(): ProjectConfigValues {
  return useContext(ProjectConfigValues)
}
