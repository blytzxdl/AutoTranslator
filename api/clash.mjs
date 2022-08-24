import got from 'got';
class Options {
    constructor(method, path, opt) {
        let { port, secret } = opt
        this.url = `http://localhost:${port}${path}`
        this.method = method
        this.headers = {
            Authorization: `Bearer ${secret}`
        }
    }
    retry = {limit:2}
    timeout = {request: 3000}
}
export const getAllProxies = (opt) => {
    let opts = new Options('GET', '/proxies', opt)
    let { url } = opts
    return got(url, { ...opts })
}
export const testProxies = (opt, name) => {
    let opts = new Options('GET', `/proxies/${name}/delay`, opt)
    let { url } = opts
    return got(url, { ...opts })
}
export const selectProxies = (opt) => {
    let opts = new Options('PUT', `/proxies/${name}/delay`, opt)
    let { url } = opts
    return got(url, { ...opts })
}


    // getAllProxies({
    //     "port": 57174,
    //     "secret": "1f91f3d0-ce09-4c4c-b6b2-9544e625745a"
    // }).then((res) => {
    //     // console.log(res);
        
    // }).catch((err) => {
    //     console.log(err);
        
    // }); 


