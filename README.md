# AutoTranslator
一个调用谷歌翻译公共api的机器翻译应用

编译：node pack.js

使用方法：将json格式的翻译源文件置于同目录下，用node运行index.mjs

说明：翻译源文件需命名为ManualTransFile.json，输出翻译结果为TrsData.json

配置项：
```
{
	"nums": 350,							//单次合并翻译数，实际翻译上限由maxLength决定，超过500一般无意义，过低会降低整体翻译速度
	"maxLength": 4000,						//单次翻译文本字符数上限，不建议超过5000，过高会导致漏翻
	"loopTime": 2000,						//翻译请求间隔，不建议低于2000ms,过低易导致封ip
	"proxy": "http://localhost:代理端口",	//代理地址，可避免开全局代理
	"suffix": "com",						//谷歌翻译网址,默认为com
	"origin": "auto",						//源语言
	"target": "zh-cn",						//目标语言
	"alias": {								//一般用于手动过滤和替换角色名，其它词亦可，受限于翻译机制，不保证准确性
		"原词": "替换词"
	},
	"clash": {
		"port": null,						//clash控制端口，见于配置文件或Clash Core后括号内数字
		"secret": null,						//clash的secret,见于配置文件或web ui设置
		"selector": [						//策略组
			""
		]
	}
}
```