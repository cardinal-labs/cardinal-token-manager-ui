import * as amplitude from '@amplitude/analytics-browser'
import { css } from '@emotion/react'
import { Card } from 'common/Card'
import { Stats } from 'common/Stats'
import type { ProjectConfig } from 'config/config'
import { queryId, useGlobalStats } from 'hooks/useGlobalStats'
import { useRouter } from 'next/router'
import { transparentize } from 'polished'

export const CollectionsGrid = ({ configs }: { configs: ProjectConfig[] }) => {
  const router = useRouter()
  const stats = useGlobalStats()

  return (
    <div className="grid grid-cols-1 flex-wrap gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {configs.map((config) => (
        <Card
          key={config.name}
          className="bg-opacity-1 cursor-pointer transition-colors"
          css={css`
            &:hover {
              background: ${transparentize(0.8, config.colors.glow)};
            }
          `}
          onClick={() => {
            amplitude.logEvent('marketplace: click collection', {
              id: config.name,
              name: config.displayName,
              type: config.type,
            })
            router.push(`/${config.name}${location.search}`)
          }}
          badges={config.badges}
          hero={
            <div
              className={`flex h-full w-full items-center justify-center ${
                config.logoPadding && 'p-8'
              }`}
              css={css`
                background: ${transparentize(0.8, config.colors.glow)};
              `}
            >
              <img
                className={`max-h-full rounded-xl ${
                  config.logoPadding && 'p-3'
                }`}
                src={config.logoImage}
                alt={config.name}
              />
            </div>
          }
          header={
            <div className="overflow-hidden text-ellipsis whitespace-nowrap">
              {config.displayName}
            </div>
          }
          content={
            <Stats
              stats={[
                {
                  header: 'Total rentals',
                  value:
                    stats.data &&
                    !!stats.data[queryId(config.name, true)]?.aggregate
                      .count !== undefined ? (
                      stats.data[
                        queryId(config.name, true)
                      ]!.aggregate.count.toString()
                    ) : (
                      <div className="mt-1 h-5 w-12 animate-pulse rounded-md bg-border" />
                    ),
                },
                {
                  header: 'Listed rentals',
                  value:
                    stats.data &&
                    !!stats.data[queryId(config.name, false)]?.aggregate
                      .count !== undefined ? (
                      stats.data[
                        queryId(config.name, false)
                      ]!.aggregate.count.toString()
                    ) : (
                      <div className="mt-1 h-5 w-12 animate-pulse rounded-md bg-border" />
                    ),
                },
              ]}
            />
          }
        />
      ))}
    </div>
  )
}
