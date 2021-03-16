module.exports = {
  title: 'React RocketJump',
  tagline: 'Manage state and side effects like a breeze',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'inmagik', // Usually your GitHub org/user name.
  projectName: 'react-rocketjump', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'React RocketJump',
      items: [
        {
          type: 'docsVersionDropdown',
          position: 'left'
        },
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'right',
        },
        {
          href: 'https://github.com/inmagik/react-rocketjump',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'INMAGIK Logo',
        src: 'img/inmagik_logo_circle.svg',
        href: 'https://inmagik.com',
      },
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Style Guide',
              to: 'docs/',
            },
            {
              label: 'Second Doc',
              to: 'docs/doc2/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/inmagik/react-rocketjump',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} INMAGIK srl`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          lastVersion: 'current',
          versions: {
            'current': {
              label: '3.x',
              path: '',
            },
            '2.x': {
              label: '2.x',
              path: '2.x',
            },
          },
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
}
