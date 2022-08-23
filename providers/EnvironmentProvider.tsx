import type { Cluster } from '@solana/web3.js'
import { Connection } from '@solana/web3.js'
import { useRouter } from 'next/router'
import React, { useContext, useMemo, useState } from 'react'

export interface Environment {
  label: Cluster
  primary: string
  secondary?: string
  api?: string
  index?: string
}

export interface EnvironmentContextValues {
  environment: Environment
  setEnvironment: (newEnvironment: Environment) => void
  connection: Connection
  secondaryConnection: Connection
}

const INDEX_ENABLED = true

export const ENVIRONMENTS: Environment[] = [
  {
    label: 'mainnet-beta',
    primary:
      [
        process.env.SYNDICA_MAINNET_PRIMARY,
        process.env.ALCHEMY_MAINNET_PRIMARY,
      ][Math.round(Math.random())] || 'https://ssc-dao.genesysgo.net',
    secondary: 'https://ssc-dao.genesysgo.net',
    index: INDEX_ENABLED
      ? 'https://prod-holaplex.hasura.app/v1/graphql'
      : undefined,
    // api: '/api',
  },
  {
    label: 'testnet',
    primary: 'https://api.testnet.solana.com',
  },
  {
    label: 'devnet',
    primary: 'https://api.devnet.solana.com',
  },
]

const EnvironmentContext: React.Context<null | EnvironmentContextValues> =
  React.createContext<null | EnvironmentContextValues>(null)

export function EnvironmentProvider({
  children,
  defaultCluster,
}: {
  children: React.ReactChild
  defaultCluster: string
}) {
  const { query } = useRouter()
  const cluster = (query.project || query.host)?.includes('dev')
    ? 'devnet'
    : query.host?.includes('test')
    ? 'testnet'
    : query.cluster || defaultCluster || process.env.BASE_CLUSTER
  const foundEnvironment = ENVIRONMENTS.find((e) => e.label === cluster)
  const [environment, setEnvironment] = useState<Environment>(
    foundEnvironment ?? ENVIRONMENTS[0]!
  )

  useMemo(() => {
    const foundEnvironment = ENVIRONMENTS.find((e) => e.label === cluster)
    setEnvironment(foundEnvironment ?? ENVIRONMENTS[0]!)
  }, [cluster])

  const connection = useMemo(
    () => new Connection(environment.primary, { commitment: 'recent' }),
    [environment]
  )

  const secondaryConnection = useMemo(
    () =>
      new Connection(environment.secondary ?? environment.primary, {
        commitment: 'recent',
      }),
    [environment]
  )

  return (
    <EnvironmentContext.Provider
      value={{
        environment,
        setEnvironment,
        connection,
        secondaryConnection,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  )
}

export function useEnvironmentCtx(): EnvironmentContextValues {
  const context = useContext(EnvironmentContext)
  if (!context) {
    throw new Error('Missing connection context')
  }
  return context
}
