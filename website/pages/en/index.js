/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const CompLibrary = require('../../core/CompLibrary.js')

const MarkdownBlock = CompLibrary.MarkdownBlock /* Used to read markdown */
const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

class HomeSplash extends React.Component {
  render() {
    const { siteConfig, language = '' } = this.props
    const { baseUrl, docsUrl } = siteConfig
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`
    const langPart = `${language ? `${language}/` : ''}`
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    )

    const Logo = props => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    )

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        {siteConfig.title}
        <small>{siteConfig.tagline}</small>
      </h2>
    )

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    )

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    )

    return (
      <SplashContainer>
        {/* <Logo img_src={`${baseUrl}img/undraw_monitor.svg`} /> */}
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href={docUrl('motivation')}>Why?</Button>
            <Button href={docUrl('installation')}>Try it out</Button>
            <Button href={docUrl('api_rj')}>Read the docs</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    )
  }
}

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = '' } = this.props
    const { baseUrl } = siteConfig

    const Example = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}
      >
        <div style={{ display: 'flex' }}>
          <GridBlock
            align="left"
            contents={[
              {
                title: 'Search GitHub Users',
                content: 'A basic ..',
              },
            ]}
            layout={props.layout}
          />
          <iframe
            src="https://codesandbox.io/embed/lucid-mclean-q6k6c?fontsize=13&editorsize=60&hidenavigation=1&codemirror=1"
            title="react-rocketjump-exapmple-1"
            style={{
              flex: 1,
              marginLeft: 20,
              height: 500,
              border: 0,
              borderRadius: 4,
              overflow: 'hidden',
            }}
            sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
          />
        </div>
      </Container>
    )

    const Example2 = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}
      >
        <div style={{ display: 'flex' }}>
          <GridBlock
            align="left"
            contents={[
              {
                title: 'Pokèdex',
                content: 'A basic ..',
              },
            ]}
            layout={props.layout}
          />
          <iframe
            src="https://codesandbox.io/embed/reactrocketjumpexapmple1-tndoi?fontsize=13&editorsize=60&hidenavigation=1&codemirror=1"
            title="react-rocketjump-exapmple-1"
            style={{
              flex: 1,
              marginLeft: 20,
              height: 500,
              border: 0,
              borderRadius: 4,
              overflow: 'hidden',
            }}
            sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
          />
        </div>
      </Container>
    )

    const Block = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}
      >
        <GridBlock
          align="center"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    )

    const FeatureCallout = () => (
      <div
        className="productShowcaseSection paddingBottom"
        style={{ textAlign: 'center' }}
      >
        <h2>Feature Callout</h2>
        <MarkdownBlock>These are features of this project</MarkdownBlock>
      </div>
    )

    const TryOut = () => (
      <Block id="try">
        {[
          {
            content:
              'To make your landing page more attractive, use illustrations! Check out ' +
              '[**unDraw**](https://undraw.co/) which provides you with customizable illustrations which are free to use. ' +
              'The illustrations you see on this page are from unDraw.',
            image: `${baseUrl}img/undraw_code_review.svg`,
            imageAlign: 'left',
            title: 'Wonderful SVG Illustrations',
          },
        ]}
      </Block>
    )

    const Description = () => (
      <Block background="dark">
        {[
          {
            content:
              'This is another description of how this project is useful',
            image: `${baseUrl}img/undraw_note_list.svg`,
            imageAlign: 'right',
            title: 'Description',
          },
        ]}
      </Block>
    )

    const LearnHow = () => (
      <Block background="light">
        {[
          {
            content:
              'Each new Docusaurus project has **randomly-generated** theme colors.',
            image: `${baseUrl}img/undraw_youtube_tutorial.svg`,
            imageAlign: 'right',
            title: 'Randomly Generated Theme Colors',
          },
        ]}
      </Block>
    )

    const Features = () => (
      <Block layout="fourColumn">
        {[
          {
            content: `The power and beauty of redux wrapped into a reusable container with a declarative syntax.`,
            // image: `${baseUrl}img/undraw_react.svg`,
            // imageAlign: 'top',
            title: 'What is ReactRocketJump?',
          },
          {
            content: `Rocketjump has no implicit dependencies except React>=16.8. State and side effects are bound locally to your Component,
            so you can use rocketjump without having to rewrite your entire app.
            \nYou can use it side-by-side to something like redux and maybe reuse stuff like selectors, reducers and api calls.
            `,
            // image: `${baseUrl}img/undraw_operating_system.svg`,
            // imageAlign: 'top',
            title: 'Flexible',
          },
          {
            content: `Rocketjump uses composition in order to let you build a reusable api.
            Rocketjump objects are reusable blueprint so you can easy share your behaviors with no effort`,
            // image: `${baseUrl}img/undraw_operating_system.svg`,
            // imageAlign: 'top',
            title: 'Reusable',
          },
        ]}
      </Block>
    )

    const Showcase = () => {
      if ((siteConfig.users || []).length === 0) {
        return null
      }

      const showcase = siteConfig.users
        .filter(user => user.pinned)
        .map(user => (
          <a href={user.infoLink} key={user.infoLink}>
            <img src={user.image} alt={user.caption} title={user.caption} />
          </a>
        ))

      const pageUrl = page => baseUrl + (language ? `${language}/` : '') + page

      return (
        <div className="productShowcaseSection paddingBottom">
          <h2>Who is Using This?</h2>
          <p>This project is used by all these people</p>
          <div className="logos">{showcase}</div>
          <div className="more-users">
            <a className="button" href={pageUrl('users.html')}>
              More {siteConfig.title} Users
            </a>
          </div>
        </div>
      )
    }

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />

          {/* <iframe
            src="https://codesandbox.io/embed/reactrocketjumpexapmple1-tndoi?fontsize=13&editorsize=60&hidenavigation=1&codemirror=1"
            title="react-rocketjump-exapmple-1"
            style={{ width:'100%', height: 500, border:0, borderRadius: 4, overflow: 'hidden' }}
            sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
          <iframe
            src="https://codesandbox.io/embed/lucid-mclean-q6k6c?fontsize=13&editorsize=60&hidenavigation=1&codemirror=1"
            title="react-rocketjump-exapmple-1"
            style={{ width:'100%', height: 500, border:0, borderRadius: 4, overflow: 'hidden' }}
            sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe> */}
          {/* <FeatureCallout />
          <LearnHow />
          <TryOut />
          <Description />
          <Showcase /> */}
          <Example />
          <Example2 />
        </div>
      </div>
    )
  }
}

module.exports = Index
