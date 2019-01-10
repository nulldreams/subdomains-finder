let request = require('request')

exports.check = (url) => {
    return new Promise((resolve, reject) => {
        request.get(`http://${url}`, (error, response, body) => {
            if (error) return resolve(404)

            resolve(response.statusCode)
        })
    })
}