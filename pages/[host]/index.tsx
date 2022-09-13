import { css } from '@emotion/react'
import { Banner } from 'common/Banner'
import { FooterSlim } from 'common/FooterSlim'
import { Browse } from 'components/Browse'
import { Collections } from 'components/Collections'
import { Manage } from 'components/Manage'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useProjectConfig } from 'providers/ProjectConfigProvider'
import { useEffect, useState } from 'react'

export default function Home() {
  const { config, setProjectConfig } = useProjectConfig()
  const router = useRouter()
  const [tab, setTab] = useState<string>()

  useEffect(() => {
    const anchor = router.asPath.split('#')[1]
    if (anchor !== tab) setTab(anchor || '')
  }, [router, tab])

  useEffect(() => {
    if (
      config.name !== 'default' &&
      !router.query.host?.includes(config.name)
    ) {
      setProjectConfig('default')
    }
  }, [router.query.host, config.name])

  return (
    <div
      className="relative z-0 min-h-screen bg-dark-5"
      // style={{ backgroundColor: config.colors.main }}
    >
      <div
        className="blur-4xl absolute left-8 top-52 -z-10 h-[120px] w-[400px] -rotate-[60deg] bg-glow blur-[100px]"
        css={css`
          background: ${config.colors.glow} !important;
        `}
      />
      <Head>
        <title>Cardinal</title>
        <link rel="icon" href="/favicon.ico" />

        <link
          href="https://fonts.googleapis.com/css2?family=Roboto&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@100&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:ital@0;1&family=Oswald:wght@200;300;400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Karla:wght@600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Banner />
      {config.name !== 'default' || router.query.host?.includes(config.name) ? (
        <>
          <div style={{ minHeight: 'calc(100vh - 337px)' }}>
            {(() => {
              switch (tab) {
                case 'manage':
                  return <Manage />
                default:
                  return <Browse />
              }
            })()}
          </div>
          <FooterSlim />
        </>
      ) : (
        <Collections />
      )}
    </div>
  )
}
