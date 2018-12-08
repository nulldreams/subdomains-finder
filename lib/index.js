const { find } = require('./src')
const { colors, fonts } = require('./src/utils')
const program = require('commander')
const cfonts = require('cfonts')

cfonts.say('Subdomains-Finder', {
    font: fonts,
    align: 'left',
    colors: [colors],
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    maxLength: '0'
})

program.version('0.0.1').description('Simple way to find any subdomain from sites')

program.command('find').description('find sudomains').option('-d, --domain <domain>', 'domain name').action (async (options) => {
    find(options)
})

program.parse(process.argv)