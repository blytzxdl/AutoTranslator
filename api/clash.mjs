//https://clash.gitbook.io/doc/restful-api
import got from 'got';
class Options {
    constructor(method, path, opt, data = null) {
        let { port, secret } = opt
        this.url = `http://localhost:${port}${path}`
        this.method = method
        this.headers = {
            Authorization: `Bearer ${secret}`
        }
        if (data) {
            this.body = `${data}`
            this.headers['Content-Type'] = 'application/json'
        }

    }
    retry = { limit: 2 }
    // timeout = {request: 3000}
}
export const getAllProxies = (opt) => {
    let opts = new Options('GET', '/proxies', opt)
    let { url } = opts
    return got(url, { ...opts })
}
export const testProxies = (opt, name, suffix = 'com') => {
    let opts = new Options('GET', `/proxies/${encodeURIComponent(name)}/delay?timeout=5000&url=https://translate.google.${suffix}`, opt)
    let { url } = opts
    return got(url, { ...opts })
}
export const selectProxies = (opt, selector, name) => {
    let opts = new Options('PUT', `/proxies/${encodeURIComponent(selector)}`, opt, JSON.stringify({ name }))
    let { url } = opts
    return got(url, { ...opts }).catch(res => console.log(res))
}
