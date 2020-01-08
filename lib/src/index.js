const request = require('./request')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const ora = require('ora')
const spinner = ora('')
const AsciiTable = require('ascii-table')
const textColors = require('colors')

async function find ({ domain, output }) {
  console.log('\r\n\r\n')
  spinner.start()
  spinner.color = 'yellow'
  spinner.text = 'Searching subdomains...'

  const { response, body } = await request.get(`${domain}`)

  if (response.statusCode !== 200) {
    console.log(response.statusMessage)
  }
  await urls({ domain, obj: body, output })
}

async function urls ({ domain, obj, output }) {
  const prepared = prepareObj(obj)
  const [order] = _.orderBy(prepared, ['name_value'], ['asc'])

  const urls = []

  _.filter(order, (o) => {
    urls.push(o.name_value)
  })

  await listDomains({ domain, urls, output })
}

function prepareObj (obj) {
  const result = `[${obj.replace(/}{/g, '},{')}]`
  return JSON.parse(result)
}

async function listDomains ({ domain, urls, output }) {
  const fixexUrls = _.uniq(urls)

  if (!output) return table({ domain, subdomains: fixexUrls })

  const next = await succeed(`${fixexUrls.length} subdomains found`)

  const filepath = output

  const file = `${output}/${domain}.txt`.replace(/\/\//g, '/')

  if (!await fs.existsSync(filepath)) {
    await fs.mkdirSync(filepath)
  }
  console.log('aaaaaaa', await fs.existsSync(filepath), filepath)
  if (!await fs.existsSync(filepath)) {
    return table({ domain, subdomains: fixexUrls })
  }

  if (next) {
    const outputText = fixexUrls.join(',').replace(/,/g, '\r\n')
    await fs.writeFileSync(file, outputText, 'utf-8')
    console.log('\r\n')
    table({ domain, subdomains: fixexUrls, file })
  }
}

const tail = ([, ...xs]) => xs

async function table ({ domain, subdomains, file }) {
  const { check } = require('./status')

  const table = new AsciiTable(domain)

  table.setHeading('Subdomain', 'Status')

  spinner.start()
  spinner.color = 'green'
  spinner.text = 'Checking subdomains status...'

  let i = 0

  for (const subdomain of subdomains) {
    i++
    try {
      const status = await check(subdomain)

      spinner.text = `Checking [${i}/${subdomains.length}] ${subdomain} status...`

      table.addRow(subdomain, status)
    } catch (e) {
      console.log(e)
    }
  }

  spinner.succeed('All subdomains checked')

  console.log(table.toString())
  console.log('\r\n')
  if (file) return console.log(`Output created at ${file}`.green)
}

async function succeed (text) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      spinner.succeed(text)

      return resolve(true)
    }, 3000)
  })
}

module.exports = {
  find
}
