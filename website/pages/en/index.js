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
        <div>
          <h2>Search GitHub Users</h2>
          <p>
            <i>
              Application example: a simple client to do a GitHub user search.
              This example uses the core features of React RocketJump to manage
              async operations plus the debounce plugin not to flood Github with
              requests
            </i>
          </p>
          <iframe
            src="https://codesandbox.io/embed/lucid-mclean-q6k6c?fontsize=13&editorsize=60&hidenavigation=1&codemirror=1"
            title="react-rocketjump-exapmple-1"
            style={{
              width: '100%',
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
        <div>
          <h2>A simple Pokèdex</h2>
          <p>
            <i>
              Classic PokèDex application build upon the PokéAPI. This example
              uses the core features of React RocketJump to deal with the REST
              API that exposes the data, the debounce plugin to make interaction
              fluid and responsive and the list plugin, which is a real must
              when dealing with paginated lists
            </i>
          </p>
          <iframe
            src="https://codesandbox.io/embed/reactrocketjumpexapmple1-tndoi?fontsize=13&editorsize=60&hidenavigation=1&codemirror=1"
            title="react-rocketjump-exapmple-1"
            style={{
              width: '100%',
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
      <Container id={props.id} background={props.background}>
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

    const Presentation = () => (
      <Container background="light">
        <h2 className="text-center">What is React-RocketJump?</h2>
        <p>
          React RocketJump is a flexible, customizable, extensible tool to help
          developers dealing with side effects and asynchronous code in React
          Applications
          <br />
        </p>
        <p>
          Benefits of using React RocketJump
          <ul className="custom-ul">
            <li>
              asynchronous code is managed locally in your components, without
              the need of a global state
            </li>
            <li>you can start a task and then cancel it before it completes</li>
            <li>
              the library detects when components are mounted or unmounted, so
              that no asynchronous code is run on unmounted components
            </li>
            <li>
              extensible (but already powerful) and composable ecosystem of
              plugins to manage the most common and challenging tasks
            </li>
          </ul>
          At the end, React-RocketJump is the power of redux enriched with
          side-effects management in the scope of a component
          <br />
        </p>
      </Container>
    )

    const Features = () => (
      <Block>
        {[
          {
            title: 'Flexible',
            content: `React-Rocketjump has no explicit dependencies except React>=16.8. Since it works locally, inside components, 
              you can add it to your app without any compatibility issue, and you can use it just where you need it.
              You can use it side-by-side to other libraries, like Redux-RocketJump.
            `,
          },
          {
            title: 'Reusable',
            content: `React-Rocketjump is built around the concept of composition in order to let you build a reusable api.
            React-Rocketjump Objects are reusable blueprints so you can easily insert them in different components without worries`,
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
          <Presentation />
          <Features />
          <Example />
          <Example2 />
        </div>
      </div>
    )
  }
}

module.exports = Index
