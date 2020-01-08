const request = require('./request')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const ora = require('ora')
const spinner = ora('')
const AsciiTable = require('ascii-table')
const textColors = require('colors')

async function find ({ domain }) {
    console.log('\r\n\r\n')
    spinner.start()
    spinner.color = 'yellow'
    spinner.text = `Searching subdomains...`

    let { response, body } = await request.get(`${domain}`)

    if (response.statusCode !== 200) {
        console.log(response.statusMessage)
    }
    await urls({ domain, obj: body })
}

async function urls({ domain, obj}) {
    let prepared = prepareObj(obj)

    let [order] = _.orderBy(prepared, ['name_value'], ['asc'])

    let urls = []

    _.filter(order, (o) => {
        urls.push(o.name_value)
    })


    await saveFile({ domain, urls })
}

function prepareObj(obj) {
    let result = `[${obj.replace(/}{/g, '},{')}]`
    return JSON.parse(result)
}

async function saveFile({ domain, urls }) {
    let fixexUrls = _.uniq(urls)

    let next = await succeed(`${fixexUrls.length} subdomains found`)

    let filepath = path.join(__dirname + `../../../outputs/`)

    let file = path.join(__dirname + `../../../outputs/${domain}.txt`)

    if (!await fs.existsSync(filepath)) {
        await fs.mkdirSync(filepath)
    }

    if (next) {
        let output = fixexUrls.join(',').replace(/,/g, '\r\n')
        await fs.writeFileSync(file, output, 'utf-8')
        console.log('\r\n')
        table({ domain, subdomains: fixexUrls, file})
    }
}

async function table({ domain, subdomains, file }) {
    // const ProgressBar = require('ascii-progress')
    const { check } = require('./status')

    // var bar = new ProgressBar({
    //     schema: ':bar',
    //     total : subdomains.length
    // })

    let table = new AsciiTable(domain)

    table.setHeading('Subdomain', 'Status')

    spinner.start()
    spinner.color = 'green'
    spinner.text = `Checking subdomains status...`

    let i = 0

    for (let subdomain of subdomains) {
        i++
        try {
            let status = await check(subdomain)

            spinner.text = `Checking [${i}/${subdomains.length}] ${subdomain} status...`

            table.addRow(subdomain, status)

            // bar.tick()
        } catch (e) {
            console.log(e)
        }
    }

    spinner.succeed('All subdomains checked')

    console.log(table.toString())
    console.log('\r\n')
    console.log(`Output created at ${file}`.green)
}

async function succeed(text) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            spinner.succeed(text)

            return resolve(true)
        }, 3000);
    })
}

module.exports = {
    find
}