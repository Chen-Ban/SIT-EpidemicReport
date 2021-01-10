const axios = require('axios')
const utils = require('util') 
const schedule = require('node-schedule')


const requset = axios.create({
    method : "GET",
    baseURL : "http://qcsh.h5yunban.com/youth-learning/cgi-bin",
    headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36 QBCore/4.0.1301.400 QQBrowser/9.0.2524.400 Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2875.116 Safari/537.36 NetType/WIFI MicroMessenger/7.0.5 WindowsWechat",
    }
})


const cardNoList = {
	'okMqsjjQxqSOR8LukID35aCS5hss' : '陈鑫',
    'okMqsjhiFeis9b28-rLwHWBHk1bo' : '王智',
    'okMqsjn2dd2cvGvRYRAsQuTMDPog' : '黄日宇',   
    'okMqsjqaX8u2o1jEqXr60HGOQNK8' : '宋安邦',
    'okMqsjiN9bmo8CYEbY8Q4tTeD8Xo' : '王佳龙',
    'okMqsjl4KQxhIXbw4n43hqVNfR3o' : '彭天琦',
    'okMqsjoLRaoh4OecONgN6QTh2_MI' : '李鹏鑫',
    'okMqsjmhjo9WBk52_E64FuzpGkJU' : '王书田',
    'okMqsjivo8Y96c4HKjuIzvR_uzvE' : '应捷',
    'okMqsjlrvW2Xfp39m-N-zG9n_Ccs' : '王浩洋',
    'okMqsjk4OEisYk9aqSNaRh_aU50M' : '贺婧佩',
    'okMqsjqhiRaA9JWUnaebu9fhZBlE' : '方静',
    'okMqsjqruQfdIbeg8DItOAUBW2TI' : '王锦华',
    'okMqsjgiiy0rgYHg3SaNQ-LwOf9I' : '赵培任',
    'okMqsjiDH1ieOaEPmnFkPPiBRSBU' : '王清',
    'okMqsjtdye1N_WXHhRWuaGsMB96g' : '刘雨璇',
    'okMqsjkzRAAwAg5f_4RjJApFlF98' : '刘疆泉',
    'okMqsjo55TQhGAJeTygh2DMHneVc' : '严如刚',
    'okMqsjjUTc_zq_mcuMGiuUrdhg-I' : '王彪',
    'okMqsjqEhbRnnELirhjLlFMaDrJ8' : '衷涛',
    'okMqsjgqGWpLLfTruPoPX4qadWT4' : '张万垚',
    'okMqsjq5kZK_nUiIGDtv2zx93eaQ' : '何佳旺',
    'okMqsjpKGQZ0DYCNhPYRCKn_TQ0s' : '陈凯文'
}
console.log(`${Object.keys(cardNoList).length}人`)
    



async function getEachUserConfig(){

    const joinConfigResult =[]

    let currentConfig = {
        url:`/common-api/course/current`,
    }

    let result1 = await requset(currentConfig)
    const courseId = result1.data.result.id
    console.log(`第${courseId.slice(-2)*1+1}期`)
    
    for (const [key , value] of Object.entries(cardNoList)) {
        
        let url = '/login/we-chat/callback?callback=http%3A%2F%2Fqcsh.h5yunban.com%2Fyouth-learning%2Findex.php&scope=snsapi_userinfo&appid=wxa693f4127cc93fad&openid=%s&nickname=%25E9%2599%2588ban&headimg=https%3A%2F%2Fthirdwx.qlogo.cn%2Fmmopen%2Fvi_32%2FIydG4iaw1BsK71SHQDI0wPIRHPPicQLPCnMZcut5OHWrGzEYib5z7YEJcia9TpAxHENaSkNCptesggMNU3Tkh0XSaQ%2F132&time=%s&source=common'
        const time = parseInt(new Date().getTime() / 1000)
        url = utils.format(url,key,time)
        let tokenConfig = {
            url,
          };
    
        let result = await requset(tokenConfig)
        const accessToken = result.data.match(/'accessToken'\, '\w+-\w+-\w+-\w+-\w+'/)[0].split('\'')[3]
        console.log(accessToken)

        let joinConfig = {
            url: `/user-api/course/join?accessToken=${accessToken}`,
            method: "POST",
            data: {
                course: courseId,
                subOrg: '181042Y1',
                nid: 'N000100250006',
                cardNo:value
            }
        }

        joinConfigResult.push(joinConfig)
        // const result3 = await requset(joinConfig)
        // console.log(result3.data.result.cardNo)
    }
    return joinConfigResult
}

const eachUserReporterGen = async (config) =>{
    return new Promise(async (resolve,reject)=>{
        const delay = Math.random()*20*1000+10
        setTimeout(async()=>{
            const result = await requset(config)
            // console.log(result.data.result.cardNo)
            resolve(result.data.result.cardNo)
        },delay)
    })
} 

const reporter = async ()=>{
    const joinConfigResult =await getEachUserConfig()
    const arr = []
    for (const config of joinConfigResult) {
        arr.push(eachUserReporterGen(config))
    }
    for await (let item of arr){
        console.log(`${item}已上报`)
    }
}

schedule.scheduleJob('0 0 9 * * 1',()=>{
    reporter()
})
