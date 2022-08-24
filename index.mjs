import fs from 'fs';
import { promisify } from 'util';
import { createGlobalProxyAgent } from 'global-agent';
import translate from 'translation-google';
import { getAllProxies, testProxies, selectProxies } from './api/clash.mjs';

const readFile = promisify(fs.readFile)//读写操作promise化
const writeFile = promisify(fs.writeFile)
let settings//配置项
let nums = 350 //单次合并翻译数，实际翻译上限由maxLength决定，超过500一般无意义，过低会降低整体翻译速度
let loopTime = 2000//翻译请求间隔，不建议低于2000ms,过低易导致封ip
let alias = { '原词': '替换词' }//一般用于手动过滤和替换角色名，其它词亦可，受限于翻译机制，不保证准确性
let list = {}//翻译源文件
let trans = {}//已翻译内容
let proxy = 'http://localhost:代理端口'//代理地址，可避免开全局代理
let suffix = 'com'//谷歌翻译网址,默认为com
let loop//请求定时器
let globalProxyAgent//全局代理
let maxLength = 4000//单次翻译文本上限，不建议超过5000，过高会导致漏翻
let tryNum//重试合并数量
let clash = {
    port: null,//clash控制端口，见于配置文件或Clash Core后括号内数字
    secret: null//clash的secret,见于配置文件或web ui设置
}
let proxies//代理节点列表

//初始化
async function init() {
    let res
    try {
        res = await readFile('./ManualTransFile.json', 'utf-8')
        list = Object.keys(JSON.parse(res))
    } catch (error) {
        console.log('翻译源文件错误或不存在')
        process.exit(0)
    }
    try {
        res = await readFile('./TrsData.json', 'utf-8')
        trans = JSON.parse(res)
    } catch (error) {
        try {
            res = await writeFile('./TrsData.json', '{}')
            console.log('新建翻译');
        } catch (error) {
            console.log('新建翻译失败');
        }
    }
    try {
        res = await readFile('./settings.json', 'utf-8')
        settings = JSON.parse(fs.readFileSync('./settings.json'))
        console.log('按自定义配置运行');
        if (!settings.alias['原词']) {
            alias = Object.keys(settings.alias)
            console.log(`过滤词汇：${alias}`);
        } else {
            alias = []
            console.log(`无过滤词汇`);
        }
        if (settings.loopTime) {
            loopTime = settings.loopTime
        }
        if (settings.nums) {
            nums = settings.nums
            tryNum = nums
        }
        if (settings.proxy != 'http://localhost:代理端口') {
            console.log('已启用固定代理');
            globalProxyAgent = createGlobalProxyAgent()
            globalProxyAgent.HTTP_PROXY = settings.proxy
            globalProxyAgent.HTTPS_PROXY = settings.proxy
        } else {
            console.log('未设定代理，请确保网络通畅\n长时间无响应请重启');
        }
        if (settings.suffix) {
            translate.suffix = settings.suffix
        }
        if (settings.clash.port&&settings.clash.secret) {
            clash.port = settings.clash.port
            clash.secret = settings.clash.secret
            try {
                res = await getAllProxies(clash)
                proxies = res.body
                console.log('clash连接成功');
            } catch (error) {
                console.log('clash配置错误，按默认配置运行,请确保网络通畅\n长时间无响应请重启');
            }
        }
        console.log(`最大合并${nums}条,翻译间隔${loopTime}秒`);
    } catch (error) {
        // console.log(error);
        if (error.message.includes('Unexpected token')) {
            console.log('配置错误');
            process.exit(0)
        } else {
            settings = {
                nums,
                loopTime,
                maxLength,
                proxy,
                suffix,
                alias,
                clash
            }
            try {
                res = await writeFile('./settings.json', JSON.stringify(settings, '', '\t'))
                console.log('已生成默认配置文件settings.json,本次按默认配置运行,请确保网络通畅\n长时间无响应请重启');
                alias = []
                console.log(`最大合并${nums}条,翻译间隔${loopTime}秒`);
            } catch (error) {
                console.log('写入配置失败,按默认配置运行,请确保网络通畅\n长时间无响应请重启');
            }
        }
    }
    fun(trans)
}
init()


//测试用
function test() {
    let text = ''
    // for (let i = 0;text.length<7000 ; i++) {
    //     text+=`${text}\n`
    // }
    console.log(test);
    let enc = encode(text)
    let dec = decode(enc)
    // console.log(enc, '.............');
    // console.log(dec, '.............');
    translate(enc, { to: 'zh-cn' }).then((res) => {
        // console.log(res, '.............');
        // console.log(decode(res.text), '<.............>');
    }).catch(err => {
        console.log('错误' + err);
    })
}


//编解码减少翻译错误
function encode(line) {
    // console.log(line);
    if (alias[0]) {
        alias.forEach((v, i) => {
            let name = new RegExp(v, 'g')
            line = line.replace(name, `<+${i}+>`)
        })
    }
    //之后再精简正则
    return line.replace(/\n/g, 'Ń\\nŃ').replace(/\r/g, '<Ŕ>').replace(/\t/g, '<Ţ>').replace(/\\"/g, '<ɷ>').replace(/\\\\/g, '<§>')
}
function decode(line) {
    let ind
    let str = line.match(/<+.{0,3}\+.{0,5}\+.{0,3}>+/g) || line.match(/〈+.{0,3}\+.{0,5}\+.{0,3}〉+/g)
    if (str) {
        str.forEach((v, i) => {
            ind = Number(v.match(/\d+/))
            line = line.replace(v, settings.alias[alias[ind]])
        })
    }
    return line.replace(/Ń/g, '').replace(/\\n/g, '\n').replace(/(<|〈).{0,2}Ŕ.{0,2}(>|〉)/g, '\r').replace(/(<|〈).{0,2}Ţ.{0,2}(>|〉)/g, '\t').replace(/(<|〈).{0,2}ɷ.{0,2}(>|〉)/g, '\"').replace(/(<|〈).{0,2}§.{0,2}(>|〉)/g, '\\\\')
}

//文本合并处理
function handleText(trans, retry) {
    let start = Object.keys(trans).length
    let i = start
    let end
    let jump = false
    if (start >= list.length) {
        fs.writeFile('./TrsData.json', JSON.stringify(trans, '', '\t'), () => {
            console.log('翻译已完成');
            process.exit(0)
        })
    }
    if (retry) {
        end = start + tryNum
    } else {
        end = start + nums
    }
    if (end > list.length) {
        end = list.length
    }
    let txt = []//翻译文本组
    //合并翻译文本
    for (; start < end;) {
        let addText = encode(list[start])
        if (start == end - 1) {
            txt.push(addText)
        } else {
            txt.push(`${addText}\n`)
        }
        start++
    }
    let upload = txt.length
    txt = txt.join('')
    let res = { txt, start, end, upload, i, done: true }
    if (txt.length > maxLength) {
        res.done = false
        if (tryNum > 20) {
            tryNum -= 20
        } else if (tryNum > 1) {
            tryNum -= 1
        } else {
            jump = true
            console.log('出现过长文本,可能出现少量漏翻');
        }
    }
    if (jump) {
        res.done = true
    }
    if (res.done) {
        tryNum = nums
    }
    return res
}

//翻译及写入
function fun(trans) {
    for (let retry; done != true;) {
        if (tryNum == nums) {
            retry = false
        }
        var { txt, start, end, upload, i, done } = handleText(trans, retry)
        if (!done) {
            retry = true
        }
    }
    // console.log(txt.length, start);
    translate(txt, { to: 'zh-cn' }).then((res) => {
        res = res.text.split('\n')
        // console.log(res.length);
        if (upload != res.length) {
            new Error('check')
        }
        res.forEach((ite, ind) => {
            // console.log(ite);
            trans[list[i + ind]] = decode(ite)
        });
        if (end < list.length) {
            fs.writeFile('./TrsData.json', JSON.stringify(trans, '', '\t'), err => {
                console.log(`已翻译:${end}/${list.length},本次翻译${res.length}条`);
                loop = setTimeout(() => {
                    fun(trans)
                }, loopTime);
            })
        } else {
            fs.writeFile('./TrsData.json', JSON.stringify(trans, '', '\t'), err => {
                console.log('翻译完成');
                clearTimeout(loop)
            })
        }
    }).catch((err) => {
        console.log(err);
        console.log('请检查网络，尝试更换ip');
        clearTimeout(loop)
        fs.writeFile('./TrsData.json', JSON.stringify(trans, '', '\t'), err => { })
    });
}

