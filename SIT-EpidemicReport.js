const axios = require('axios')
const md5  = require('js-md5')
const schedule = require('node-schedule')

const url_historyRepoter = "http://210.35.96.114/report/report/getMyReport"
const url_todayRepoter = 'http://210.35.96.114/report/report/todayReport'

headers = {
    "Content-Type": "application/json",
    "Origin": "http://xgfy.sit.edu.cn",
    "Host": "210.35.96.114"
}


const user = {
    '181042Y102':'陈鑫',
    '1810300127':'文琪',
    '181021Y136':'刘妍',
    '181012Y120':'赵晓莹',
    '1810300122' : '宋佳琪'
}

const genearteMD5 = (val)=>{
    return md5.hex(val)
}

const decode = (userCode , t)=>{
    const prefix = "Unifri"
    const timeStamp = t
    let hashed = genearteMD5(userCode + prefix + timeStamp)  
    return (hashed.slice(16) + hashed.slice(0,16)).toUpperCase()
}

const initHistoryRepoterRequestDataArray = ()=>{
    let historyRepoterRequestDataArray = []
    for(const userCode of Object.keys(user)){
        let historyRepoterRequestData = {
            "usercode" : "", 
            "batchno" : ""
        }
        historyRepoterRequestData.usercode = userCode
        historyRepoterRequestDataArray.push(historyRepoterRequestData)
    }
    return historyRepoterRequestDataArray
}

const getHistoryRepoter = async (historyRepoterRequestDataArray)=>{
    let historyRepoterConfig = {
        method: 'post',
        url: url_historyRepoter,
        headers,
    }
    let yesterdayInfoArray = []
    
    const t = new Date().getTime().toString()
    for (const historyRepoterRequestData of historyRepoterRequestDataArray) {
        historyRepoterConfig.data = JSON.stringify(historyRepoterRequestData)
        historyRepoterConfig.headers.decodes = decode(historyRepoterRequestData.usercode , t)
        historyRepoterConfig.headers.ts = t
        try{
            let result = await axios(historyRepoterConfig)
            console.log(`获取学号为${user[historyRepoterRequestData.usercode]}同学前一天的上报信息成功`)
            yesterdayInfoArray.push(result.data.data[0])
        }catch(error){
            throw new Error(`${user[historyRepoterRequestData.usercode]}同学的信息上报出错`)          
        }
    }
    return yesterdayInfoArray
}


const todayReport = async (yesterdayInfoArray)=>{
    let todayRepoterConfig = {
        method: 'post',
        url: url_todayRepoter,
        headers,
    }
    const t = new Date().getTime().toString()
    const today = new Date().getFullYear().toString()+(new Date().getMonth()+1).toString().padStart(2,'0')+new Date().getDate().toString().padStart(2,'0')
    
    if(!yesterdayInfoArray){
        throw Error('获取信息出错')
    }

    for (const yesterdayInfo of yesterdayInfoArray) {
        console.log(yesterdayInfo.batchno != today?`${ user[yesterdayInfo.usercode]}${today}日未上报`:`${ user[yesterdayInfo.usercode]  }${today}日已上报`)
        if(yesterdayInfo.batchno != today){
            delete yesterdayInfo.ksfl2
            delete yesterdayInfo.jttw2
            delete yesterdayInfo.id
            delete yesterdayInfo.currentsituation2
            delete yesterdayInfo.wendu2
            delete yesterdayInfo.studentclass
            delete yesterdayInfo.auditor
            delete yesterdayInfo.mobile
            delete yesterdayInfo.remarks
            delete yesterdayInfo.creattime
            todayRepoterConfig.data = JSON.stringify(yesterdayInfo)
            todayRepoterConfig.headers.decodes = decode(yesterdayInfo.usercode , t)
            todayRepoterConfig.headers.ts = t
            try {
                const result = await axios(todayRepoterConfig)   
                if(result.data.code == 0){
                    console.log(`${ user[yesterdayInfo.usercode]  }同学的信息上报成功`)
                }else{
                    throw new Error(`${ user[yesterdayInfo.usercode]  }同学的信息上报出错`)          
                }        
            } catch (error) {
                throw new Error(`${ user[yesterdayInfo.usercode]  }同学的信息上报出错`)          
            }
            
        }
    }
    
}

const main = async (id=0)=>{
    try {
        const historyRepoterRequestDataArray =  initHistoryRepoterRequestDataArray()
        const yesterdayInfoArray = await getHistoryRepoter(historyRepoterRequestDataArray)
        await todayReport(yesterdayInfoArray)
        if(id){
            clearTimeout(id)
        }
    } catch (error) {
        console.log(error)
        const id = setTimeout(()=>{
            main (id)
        },1000*30)
        
    }
}

schedule.scheduleJob('1 * * * * *',()=>{
    main()
})