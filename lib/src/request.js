const request = require('request')

async function get (url) {
  return new Promise((resolve, reject) => {
    request({ method: 'GET', url: 'https://crt.sh/', qs: { q: `%.${url}`, output: 'json' } }, (error, response, body) => {
      if (error) return reject(error)

      return resolve({ body, response })
    })
  })
}

async function post (url, data) {
  return new Promise((resolve, reject) => {
    request({ url, method: 'POST', data }, (error, response, body) => {
      if (error) return reject(error)

      return resolve({ body, response })
    })
  })
}

module.exports = {
  get,
  post
}
