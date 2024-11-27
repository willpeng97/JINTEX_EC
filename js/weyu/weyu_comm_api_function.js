// 取得 grid API
async function getGridData(SID) {
    // 定义 GetGrid API 的 URL
    let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetData';
  
    // 定义要传递的参数对象
    let params = {
        SID: SID,
        TokenKey: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
        // TokenKey: '302e24cbG8xfcHU/Z/vTzA1zYjVFHLfUNtqsWonT'
    };
  
    // 定义查詢条件参数对象
    let conditions = {
        // 每個SID 要塞的條件皆不同,塞錯會掛
        // Field: ["INSPECT_BIG_ITEM_CODE", "INSPECT_DATE"],
        // Oper: ["like", "between"],
        // Value: ["WEEK", "2021-12-06 00:00:00~2021-12-07 00:00:00"]
    };
  
    // 构建请求头
    let headers = new Headers({
        'Content-Type': 'application/json',
        'SID': params.SID,
        'TokenKey': params.TokenKey
        // 可以添加其他必要的请求头信息
    });
  
    // 构建请求体
    let requestBody = JSON.stringify(conditions);
  
    // 构建请求配置
    let requestOptions = {
        method: 'POST', // 将请求方法设置为 "POST"
        headers: headers,
        body: requestBody // 将条件参数放入请求体
    };
  
    try {
        // 发送请求并等待响应
        let response = await fetch(getGridURL, requestOptions);
  
        if (response.ok) {
            // 解析响应为 JSON
            let data = await response.json();
            // console.log("获取Grid数据成功:", data);
            if(data.result){
                return data;
            }
            else{
                Set_Clean();
            }
        } else {
             throw new Error('获取Grid数据失败，状态码：' + response.status);
            
        }
    } catch (error) {
        console.error(error);
    }
}
function getGridDataV2(SID) {
    return new Promise((resolve, reject) => {
        // 定义 GetGrid API 的 URL
        let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetData';

        // 定义查詢条件参数对象
        let conditions = {
            // 每個SID 要塞的條件皆不同,塞錯會掛
            // Field: ["INSPECT_BIG_ITEM_CODE", "INSPECT_DATE"],
            // Oper: ["like", "between"],
            // Value: ["WEEK", "2021-12-06 00:00:00~2021-12-07 00:00:00"]
        };

        // 构建请求体
        let requestBody = JSON.stringify(conditions);

        $.ajax({
            url: getGridURL, // 替換為你的API端點
            type: 'POST',
            data: requestBody,
            dataType: 'json',
            contentType: 'application/json',
            headers: {
                'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'), // 替換為你的自訂Header
                'SID': SID
            },
            success: function(response) {
                if(response.result){
                    resolve(response.Grid_Data);
                } else {
                    Set_Clean();
                    reject('Error: No result in response');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error:', textStatus, errorThrown);
                $('#postDataResult').text('Error: ' + textStatus + ', ' + errorThrown);
                reject('Error: ' + textStatus + ', ' + errorThrown);
            }
        });
    });
}

// 取得 Chart API
async function getChartData(SID) {
    // 定义 GetGrid API 的 URL
    let getChartURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetChart';

    // 定义要传递的参数对象
    let params = {
        SID: SID,
        TokenKey: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')

        // TokenKey: '302e24cbG8xfcHU/Z/vTzA1zYjVFHLfUNtqsWonT'
    };

    // 定义查詢条件参数对象
    let conditions = {
        // 每個SID 要塞的條件皆不同,塞錯會掛 , 沒有條件就不用塞
        // Field: ["INSPECT_BIG_ITEM_CODE", "INSPECT_DATE"],
        // Oper: ["like", "between"],
        // Value: ["WEEK", "2021-12-06 00:00:00~2021-12-07 00:00:00"]
    };

    // 构建请求头
    let headers = new Headers({
        'Content-Type': 'application/json',
        'SID': params.SID,
        'TokenKey': params.TokenKey
    });

    // 构建请求体
    let requestBody = JSON.stringify(conditions);

    // 构建请求配置
    let requestOptions = {
        method: 'POST', // 将请求方法设置为 "POST"
        headers: headers,
        body: requestBody // 将条件参数放入请求体
    };

    try {
        // 发送请求并等待响应
        let response = await fetch(getChartURL, requestOptions);

        if (response.ok) {
            // 解析响应为 JSON
            let data = await response.json();
            // console.log("获取chart数据成功:", data);
            if(data.result){
                return data;
            }
            else{
                Set_Clean();
            }
        } else {
            throw new Error('获取chart数据失败，状态码：' + response.status);
        }
    } catch (error) {
        console.error(error);
    }
}

//取得語系關鍵字
//let value = GetKeyWord('ALM_ACCOUNT'); //使用範例
//console.log(value);
//關鍵字查找
function GetKeyWord(keyword){
    try {
        var foundObject = findObjectByKeyword(keyword);

        if (foundObject) {
            return foundObject.VALUE; //console.log("找到匹配的对象:", foundObject);
        } else {
            console.log("未找到匹配的对象。"+keyword);
        }
    } catch (error) {
        // 异常处理代码块
        console.error("发生异常：" + error.message);
    }
}

// 查找包含指定关键字的对象
function findObjectByKeyword(keyword) {
  // 从 localStorage 中获取存储的 JSON 字符串
  var storedData = localStorage.getItem(PROJECT_SAVE_NAME+'_v1_langDic');
  // 解析 JSON 字符串为 JavaScript 数组
  var retrievedArray = JSON.parse(storedData);

  for (var i = 0; i < retrievedArray.length; i++) {
      var object = retrievedArray[i];
      if (object.KEYWORDS === keyword) {
          return object;
      }
  }
  return null; // 如果未找到匹配的对象，则返回 null
}

//取得翻譯 API *第一次登入後決定語系
async function GetLang() {
  // 定义 GetLang API 的 URL
  var getLangURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetLang';

  // 构建请求头
  var headers = new Headers({
      'Content-Type': 'application/json',
      LangCode : localStorage.getItem(PROJECT_SAVE_NAME+'_v1_lng'),
      TokenKey : localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
      // 可以添加其他必要的请求头信息
  });

  // 构建请求配置
  var requestOptions = {
      method: 'POST', // 使用 POST 请求方式
      headers: headers,
  };

  try {
      // 发送请求并等待响应
      var response = await fetch(getLangURL, requestOptions);

      if (response.ok) {
          // 解析响应为 JSON
          var data = await response.json();
        //   console.log("获取翻译包数据成功:", data);
          // 在这里处理获取到的翻译包数据
          // 将数组转换为 JSON 字符串
          var jsonString = JSON.stringify(data.data);
          // 存储 JSON 字符串到 localStorage
          localStorage.setItem(PROJECT_SAVE_NAME+'_v1_langDic', jsonString);

      } else {
          throw new Error('获取翻译包数据失败，状态码：' + response.status);
      }
  } catch (error) {
      console.error(error);
  }
}

// 调用函数以获取翻译包数据
GetLang();

//過濾 特殊字元
function TransSpecialChar(str){
    if(str!=undefined && str!= "" && str !='null'){
        str = str.replaceAll(/\t/g," "); //TAB
        str = str.replaceAll(/ /g," "); //半形空白
        str = str.replaceAll(/　/g," "); //全形空白
    }
    return str;
  }


  // 持續 更新 tokenkey
function Get_tokenkey(){
    //僅限前景
    // if (document.visibilityState === 'visible') {

        // 定义 Refresh TokenKey API 的 URL
        var refreshTokenURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/RefreshToken';

        // 构建请求头
        var headers = new Headers({
            'Content-Type': 'application/json',
            'UID': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_accountNo'),
            'Refresh_TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_Refresh_TokenKey')
        });

        // 构建请求配置
        var requestOptions = {
            method: 'GET',
            headers: headers,
        };

    // 发送请求
    fetch(refreshTokenURL, requestOptions)
        .then(response => {
            if (response.ok) {
                return response.json(); // 解析响应为 JSON
            } else {
                throw new Error('Refresh Token 失败，状态码：' + response.status);
            }
        })
        .then(data => {
          if(data.result){
            // 更新 Refresh_tokenkey 避免過期
            localStorage.setItem(PROJECT_SAVE_NAME+'_BI_TokenKey', data.TokenKey);
            // console.log(localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'));
            }
            else{
              Set_Clean();
            }            
            
        })
        .catch(error => {
            console.error(error);
            Set_Clean();
        });


    // }
console.log("refresh")


}

// 定時执行Get_tokenkey
setInterval(Get_tokenkey, 30 * 1000);
Get_tokenkey(); // 畫面載入 只執行第一次

//只要撈資料的 AJAX回傳 false 就要 清空 導回登入頁
function Set_Clean(){

  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_Refresh_TokenKey');
  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_TokenKey');
  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_userName');
  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_accountNo');
  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_ORIGINAL_ACCOUNT_NO');
  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_Functionkey');
  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_ORDER_LEV');
  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_PMAA001');
  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_PMAA005');
  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_ISMEMBER');
  localStorage.removeItem('cartProducts');
  localStorage.removeItem('subsidiary_code');
  localStorage.removeItem('subsidiary_name');

  // 失敗後導回 登入頁
  window.location.href = window.location.protocol+'//'+location.hostname + (location.port ? ':' + location.port : '')+'/'+PROJECT_NAME+'/login.html';

}
function GetShowLngText(){

    switch (localStorage.getItem(PROJECT_SAVE_NAME+'_v1_lng')){

      case "en_us":
        return "English";
        break;
      case "zh_CHT":
        return "正體中文";
        break;
      case "zh_CHS":
        return "簡體中文";
        break;
      default:
        return "N/A";
        break;

    }

}


var getUrlParameter = function getUrlParameter() {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    var par = {};
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        par[sParameterName[0]] = decodeURI(sParameterName[1])
    }
    return par;
};
Request = getUrlParameter();

// QC客製用連結
// key = 計畫SID 和 value = Back的Url
var QCBackUrl = [
    { key: '339952188840318', value: window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+'/query/grid-smart-query.html?SID=337710329736303&QC_INSPECTION_PLAN_SID=339952188840318&LEVEL=L4&MODULE_NAME=QC&BUTTON=B' },
    { key: '340629801423508', value: window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+'/query/grid-smart-query.html?SID=337710329736303&QC_INSPECTION_PLAN_SID=340629801423508&LEVEL=L4&MODULE_NAME=QC&BUTTON=B' },
    { key: '339939455610574', value: window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+'/query/grid-smart-query.html?SID=337710329736303&QC_INSPECTION_PLAN_SID=339939455610574&LEVEL=L4&MODULE_NAME=QC&BUTTON=B' },
    { key: '341063226356399', value: window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+'/query/grid-smart-query.html?SID=337710329736303&QC_INSPECTION_PLAN_SID=341063226356399&LEVEL=L4&MODULE_NAME=QC&BUTTON=B' },
    { key: '341159099113860', value: window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+'/query/grid-smart-query.html?SID=337710329736303&QC_INSPECTION_PLAN_SID=341159099113860&LEVEL=L4&MODULE_NAME=QC&BUTTON=B' }
  
];


function GoBack(Level,MOUDLE_NAME,Button){

    switch(Level){
        case "L1":
            window.location.href = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/index.html";
            break;
        case "ZZ": //目前QC用 客製URL , 簡化設定用
            let QC_INSPECTION_PLAN_SID = Request["QC_INSPECTION_PLAN_SID"]; //先抓計畫SID
            window.location.href = GetZZUrl(QC_INSPECTION_PLAN_SID);
            break;
        default:
            window.location.href = GetUrl(Level,MOUDLE_NAME,Button);
            break;
    }
    

}

function GetUrl(Level,MOUDLE_NAME,Button){
    for (var i = 0; i < BackurlMappings.length; i++) {
        var mapping = BackurlMappings[i];
        if (
          mapping.LV === Level &&
          mapping.MODULE_NAME === MOUDLE_NAME &&
          mapping.BUTTON === Button
        ) {
          return mapping.URL;
        }
      }
}

function GetZZUrl(key) {
    let tmpurl=window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/query/grid-smart-query.html?MODULE_NAME=QC&SID=337703789526626&LEVEL=L3&BUTTON=B";
    for (var i = 0; i < QCBackUrl.length; i++) {
        if (QCBackUrl[i].key === key) {
            return QCBackUrl[i].value;
        }
    }
    // 如果找不到對應的 key，預設值返回QC查詢的L1位置
    return tmpurl;
}

//最後更新資料時間
async function updateTime(ElementID){
    let getTimeData = await getGridData('252236119093442');
    let lastUpdateTime = new Date(getTimeData.Grid_Data[0].TIMESPAN)
    let hour = lastUpdateTime.getHours();
    let minute = lastUpdateTime.getMinutes();
    document.getElementById(ElementID).textContent = (`${hour}:${minute < 10 ? '0' : ''}${minute}`)
}

// 修改密碼
function openChangePwdModal(){
    // 添加modal到網頁中
    if($("#changePwdModal").length === 0){
        $("body").append(`
            <div class="modal fade" id="changePwdModal" data-bs-backdrop="static" tabindex="-1" aria-labelledby="changePwdModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="changePwdModalLabel">修改密碼</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-1 ps-0">
                        <label for="newPassword" class="col-3 text-end">新密碼:</label>
                        <input type="password" id="newPassword" class="col-6">
                    </div>
                    <div class="row ps-0">
                        <label for="newPassword_Check" class="col-3 text-end">確認新密碼:</label>
                        <input type="password" id="newPassword_Check" class="col-6">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">返回</button>
                    <button type="button" class="btn btn-primary" id="savePwdChange">保存</button>
                </div>
                </div>
            </div>
            </div>
        `)
        $("#savePwdChange").click(()=>{
            let yes = confirm('確定要修改登入密碼嗎?')
            if(yes){
                if($("#newPassword").val().toUpperCase() === 'DEMO'){
                    alert('請使用"DEMO"以外的密碼!')
                }else if($("#newPassword").val().toUpperCase() === 'JINTEX'){
                    alert('請使用"JINTEX"以外的密碼!')
                }else if($("#newPassword").val() !== $("#newPassword_Check").val()){
                    alert('輸入密碼不一致!')
                }else{
                    // alert('密碼修改成功!')
                    var account = localStorage.getItem(PROJECT_SAVE_NAME + '_BI_accountNo')
                    var is_go = true;
                    var sid = "";
                    $.ajax({
                        type: 'POST',
                        url: window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/MasterSet/ResetPassword.ashx',
                        data: { action: 'GetAccountNo', account: account },
                        async: false,
                        success: function (msg) {
                            resultJson = JSON.parse(msg);
                            if (resultJson.result == "true") {
                                sid = resultJson.sid;
                            }
                            else {
                                is_go = false;
                                alert("密碼修改失敗")
                            }
                        }
                    });
                    if(is_go){
                        $.ajax({
                            type: 'POST',
                            url: window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/MasterSet/ResetPassword.ashx',
                            data: { action: 'ResetPassword', sid: sid, password: $('#newPassword').val() },
                            async: false,
                            success: function (msg) {
                                resultJson = JSON.parse(msg);
                                if (resultJson.result == "true") {
                                    $('#newPassword,#newPassword_Check').val('')
                                    alert('密碼修改成功!')
                                    $("#changePwdModal").modal('hide')
                                }
                                else {
                                    alert('密碼修改失敗!!')
                                }
                            }
                        });
                    }
                }
            }
        })
    }
    //打開modal
    $("#changePwdModal").modal('show')
}

// 加入LINE會員
function openLineMenberModal(){
    if(localStorage.getItem(PROJECT_SAVE_NAME + '_BI_ISMEMBER') === 'Y'){
        customAlertSuccess('您已經是LINE會員')
        return
    }

    if($("#lineMenberModal").length === 0){
        $("body").append(`
            <div class="modal fade" id="lineMenberModal" data-bs-backdrop="static" tabindex="-1" aria-labelledby="lineMenberModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="lineMenberdModalLabel">啟用LINE BOT</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h3>1.加入福盈LINE官方會員</h3>
                        <p class="fw-light">請使用您的手機或行動裝置掃描QR碼</p>
                        <div class="d-flex justify-content-center">
                            <img src="${window.location.protocol}//${default_ip}/${PROJECT_NAME}/img/comm/QRCode.jpg" class="w-75">
                        </div>
                        <h3>2.驗證帳號</h3>
                        <p class="fw-light">請於聊天室輸入以下六位數驗證碼:</p>
                        <div class="fw-bold text-center">
                            <p id="pinCode" style="font-size: 4rem;color:#438dcb"><p>
                            <div class="d-flex justify-content-center">
                                <p>請於 <span id="countDown">10:00</span> 內輸入</p>
                                <img 
                                    src="${window.location.protocol}//${default_ip}/${PROJECT_NAME}/img/weyu/icons-change.png"
                                    style="width:1.2rem; height:100%; margin-left:3px; cursor:pointer"
                                    onclick="generatePinCode()"
                                >
                            </div>
                        </div>

                    </div>
                    <div class="modal-footer d-flex justify-content-center">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
                    </div>
                    </div>
                </div>
            </div>
        `)
    }
    
    //打開modal
    $("#lineMenberModal").modal('show')

    //產生驗證碼
    if(!$("#pinCode").text()){
        generatePinCode();
    }
}

// 產生驗證碼
let intervalId;
async function generatePinCode() {
    let pinCode = Math.floor(100000 + Math.random() * 900000);

    let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/SEC_USER_PIN';

    let conditions = {
        "PIN_CODE": [ //SEC_USER中
            {
                "ACCOUNT_NO": localStorage.getItem(PROJECT_SAVE_NAME+'_BI_ORIGINAL_ACCOUNT_NO'),
                "PIN": pinCode
            }
        ]
    };

    // 构建请求头
    let headers = new Headers({
        'Content-Type': 'application/json',
        'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
    });

    // 构建请求体
    let requestBody = JSON.stringify(conditions);

    // 构建请求配置
    let requestOptions = {
        method: 'POST', // 将请求方法设置为 "POST"
        headers: headers,
        body: requestBody // 将条件参数放入请求体
    };

    try {
        // 发送请求并等待响应
        let response = await fetch(getGridURL, requestOptions);

        if (response.ok) {
            // 解析响应为 JSON
            let data = await response.json();
            if(data.result){
                $("#pinCode").text(pinCode)
                $("#countDown").text("10:00");
                let timer = 60 * 10 - 1 // 驗證碼有效時間 10分鐘
                let minutes, seconds;
                clearInterval(intervalId);
                intervalId = setInterval(function () {
                    if (timer >= 0) {
                        minutes = Math.floor(timer / 60);
                        seconds = timer % 60;

                        minutes = minutes < 10 ? "0" + minutes : minutes;
                        seconds = seconds < 10 ? "0" + seconds : seconds;

                        $("#countDown").text(minutes + ":" + seconds);
                        timer--;
                    } else {
                        clearInterval(intervalId);
                    }
                }, 1000);
            }
            else{
                alert('伺服器忙碌中，請聯絡服務人員')
            }
        } else {
            throw new Error('获取Grid数据失败，状态码：' + response.status);
        }
    } catch (error) {
        console.error(error);
    }
}

// 聯絡我們
function openContactModal(){
    if($("#contactModal").length === 0){
        $("body").append(`
            <div class="modal fade" id="contactModal" data-bs-backdrop="static" tabindex="-1" aria-labelledby="contactModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="contactdModalLabel">聯絡我們</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>若有任何問題請洽業務秘書</p>
                        <p>電話: (03)3869968 分機:405 / 422</p>
                    </div>
                    <div class="modal-footer d-flex justify-content-center">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
                    </div>
                    </div>
                </div>
            </div>
        `)
    }
    
    //打開modal
    $("#contactModal").modal('show')
}