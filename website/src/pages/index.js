import React, { Fragment } from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

function DescriptionForReusable() {
  return (
    <>
      React Rocketjump is built around the concept of composition in order to
      let you build a reusable api. RjObjects are reusable blueprints so you can
      easily insert them in different components without worries.
      <br />
      Plus React Rocketjump comes with some handy{' '}
      <Link to={useBaseUrl('/docs/plugins')}>plugins</Link> to achieve most
      common task with less code possible.
    </>
  )
}

function NoWrapTitle({ children }) {
  const pieces = children.split(' ')
  return pieces.map((world, i) => (
    <Fragment key={i}>
      <span className="no-wrap">
        {world}
      </span>
      {i !== pieces.length - 1 ? ' ' : null}
    </Fragment>
  ))
}

const features = [
  {
    title: 'Flexible',
    description: (
      <>
        Since it works locally, inside components, you can add it to your app
        without any compatibility issue, and you can use it just where you need
        it.
      </>
    ),
  },
  {
    title: 'Reusable',
    description: <DescriptionForReusable />,
  },
  {
    title: 'Powered by RxJS',
    description: (
      <>
        React Rocketjump handle your side effect using{' '}
        <a href="https://rxjs.dev">rxjs</a>. Out of the box you don't need to
        write any rxjs code at all. But you can tune your configuration to
        handle complex scenarios such websocket, timers and anything you can
        done with rx!
      </>
    ),
  },
]

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl)
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function Home() {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context
  return (
    <Layout
      title={`Manage state and side effects like a breeze`}
      description="Description will go into a meta tag in <head />"
    >
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <div className="rj-logo">
            <img alt="rj logo" src="img/rj_logo.svg" />
          </div>
          <h1 className="hero__title">
            <NoWrapTitle>{siteConfig.title}</NoWrapTitle>
          </h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted
              )}
              to={useBaseUrl('docs/')}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  )
}

export default Home
