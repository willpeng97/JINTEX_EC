
$(document).ready(function () {
  togglePasswordVisible()
});

const login = document.querySelector('#login');

let ApiURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/WeyuLoginV2/';

let LoginURL = ApiURL+ 'Weyu_Login';

//如果已經登入 則返回 index頁
if(localStorage.getItem(PROJECT_SAVE_NAME+'_BI_userName') === null&&localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey') === null&&localStorage.getItem(PROJECT_SAVE_NAME+'_BI_Refresh_TokenKey') === null){

}
else{
      //轉址
      // 指定要导航到的新URL
      var newUrl = window.location.protocol+'//'+location.hostname + (location.port ? ':' + location.port : '')+'/'+PROJECT_NAME+'/index.html'; // 替换为您想要导航的URL
      // 使用window.location.href来在同一页面内导航
      window.location.href = newUrl;
}

// 按鈕登入
login.addEventListener('click', userLogin);
// ENTER
document.getElementById('pw').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    // 如果用户按下ENTER键，执行登录
    userLogin();
  }
});

function userLogin() {
  var inputUID = document.getElementById('id').value;
  var inputPWD = document.getElementById('pw').value;
  if (inputUID === '' || inputPWD === '') {
    alert('Please enter your account and password.')
    return;
  }

  let body = {
    'UID': inputUID,
    'PWD': inputPWD
  }

  $.ajax({
    url: window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/WeyuLogin', // 替換為你的API端點
    type: 'POST',
    data: body,
    dataType: 'json',
    success: async function(response) {
        // console.log(response)
        if(response.result){
          //判斷是否為首次登入
          if(inputPWD==='DEMO'||inputPWD==='JINTEX'){
            $("#changePwdModal").modal('show')
            return
          }

          // 儲存 第一次的 TokenKey
          localStorage.setItem(PROJECT_SAVE_NAME + '_BI_TokenKey', response.TokenKey);
          // 儲存 Refresh_tokenkey *只存這一次
          localStorage.setItem(PROJECT_SAVE_NAME + '_BI_Refresh_TokenKey', response.Refresh_TokenKey);

          // 從SEC_USER 取得必要資料
          let userData = await getUserData(inputUID)
          localStorage.setItem(PROJECT_SAVE_NAME + '_BI_accountNo', userData.ACCOUNT_NO);
          localStorage.setItem(PROJECT_SAVE_NAME + '_BI_ORIGINAL_ACCOUNT_NO', userData.ORIGINAL_ACCOUNT_NO);
          localStorage.setItem(PROJECT_SAVE_NAME + '_BI_userName', userData.USER_NAME);
          localStorage.setItem(PROJECT_SAVE_NAME + '_BI_PMAA005', userData.PMAA005);
          localStorage.setItem(PROJECT_SAVE_NAME + '_BI_ORDER_LEV', userData.ORDER_LEV);
          localStorage.setItem(PROJECT_SAVE_NAME + '_BI_PMAA001', userData.PMAA001);
          localStorage.setItem(PROJECT_SAVE_NAME + '_BI_ISMEMBER', userData.MEMBER);

          let keys = ''
          switch(userData.CUSTOM_TYPE){
            case 'Y':
              keys = '342975302766084,362922892413760,362923073246431,362923191016754'
              break;
            case 'N':
              keys = await GetMEMSMenu(inputUID)
              break;
          }
          localStorage.setItem(PROJECT_SAVE_NAME+'_BI_Functionkey', keys);

          // 轉址
          // 指定要导航到的新URL
          var newUrl = window.location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/' + PROJECT_NAME + '/index.html'; // 替换为您想要导航的URL
          // 使用window.location.href来在同一页面内导航
          window.location.href = newUrl;
        }else{
          alert('Account or password input failed !')
        }
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.error('Error:', textStatus, errorThrown);
        $('#postDataResult').text('Error: ' + textStatus + ', ' + errorThrown);
    }
  });
}

async function getUserData(ACCOUNT_NO,isForget) {
  // 定义 GetGrid API 的 URL
  let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetData';

  // 定义要传递的参数对象
  let params = {
      SID: "350990892916491",
      TokenKey: isForget ? 'WEYU54226552' : localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
      // TokenKey: '302e24cbG8xfcHU/Z/vTzA1zYjVFHLfUNtqsWonT'
  };

  // 定义查詢条件参数对象
  let conditions = {
      // 每個SID 要塞的條件皆不同,塞錯會掛
      Field: ["ACCOUNT_NO"],
      Oper: ["="],
      Value: [ACCOUNT_NO]
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
              return data.Grid_Data[0];
          }
          else{
              // Set_Clean();
          }
      } else {
           throw new Error('获取Grid数据失败，状态码：' + response.status);
          
      }
  } catch (error) {
      console.error(error);
  }
}

$("#savePwdChange").click(()=>{
  let account = $("#id").val()
  let newAccount = $("#newAccount").val()
  let newPassword = $("#newPassword").val()
  let newPassword_check = $("#newPassword_Check").val()
  let yes = confirm('確定保存帳號設定嗎?')
  if(yes){
      if(newPassword.toUpperCase() === 'DEMO'){
          alert('請使用"DEMO"以外的密碼!')
      }else if(newPassword.toUpperCase() === 'JINTEX'){
        alert('請使用"JINTEX"以外的密碼!')
      }else if(newPassword !== newPassword_check){
          alert('輸入密碼不一致!')
      }else{
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
                      alert("發生錯誤，請聯絡客服人員")
                  }
              }
          });
          if(is_go){
            // 保存帳號
            let EditSID = `USER_SID=${sid}`
            let EditVal = `ACCOUNT_NO=N'${newAccount}',`
            $.ajax({
              type: 'post',
              url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
              data: { funcName: "UpdGridData", TableName: 'SEC_USER', SID: EditSID, EditVal: EditVal, USER: 'ADMIN',SID_VAL:"304100717100290",log_val : EditVal },
              dataType: 'json',
              async: false,
              success: function (result) {
                // 保存密碼
                $.ajax({
                  type: 'POST',
                  url: window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/MasterSet/ResetPassword.ashx',
                  data: { action: 'ResetPassword', sid: sid, password: newPassword },
                  async: false,
                  success: function (msg) {
                      resultJson = JSON.parse(msg);
                      if (resultJson.result == "true") {
                          $('#id').val(newAccount)
                          $('#pw').val(newPassword)
                          alert('帳號密碼設定完成!')
                          userLogin()
                      }
                      else {
                          alert('修改失敗!!')
                      }
                  }
                });
              },
              error: function (xhr, ajaxOptions, thrownError) {
                alert("該帳號已有人使用，請重新輸入!");
              }
            });
            
          }
      }
  }
})

async function GetMEMSMenu(ACCOUNT_NO) {
  // 定义 GetLang API 的 URL
  let getLangURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetMEMSMenu?ACCOUNT_NO=' + ACCOUNT_NO;

  // 构建请求头
  let headers = new Headers({
      'Content-Type': 'application/json',
      TokenKey : 'WEYU54226552', // 不檢查過期
      // 可以添加其他必要的请求头信息
  });

  // 构建请求配置
  let requestOptions = {
      method: 'GET', // 使用 POST 请求方式
      headers: headers,
  };

  try {
      // 发送请求并等待响应
      let response = await fetch(getLangURL, requestOptions);

      if (response.ok) {
          // 解析响应为 JSON
          let data = await response.json();
          let keys = data.data.map((e) => e.FUN_SID)

          // 判斷是否為業務群組
          if(keys.includes("365349533000391")){
            localStorage.setItem('isSalesman', "Y");
          }

          // 返回 可使用的功能權限
          return keys
      } else {
          throw new Error('获取翻译包数据失败，状态码：' + response.status);
      }
  } catch (error) {
      console.error(error);
  }
}


async function forgetPwd(){
  let ACCOUNT_NO = $("#forgetAccount").val()
  let userData = await getUserData(ACCOUNT_NO, 'forget')

  let account = $("#forgetAccount").val()
  let sendMail = userData.OOFC012_B
  let resetLink = `https://cloud.weyutech.com/JINTEX_EC/resetPassword.html?account=${account}`
  let AddVal = ` N'email', N'福盈 重設密碼通知信', N'請點以下連結進行密碼重設: \r\n${resetLink}', N'${sendMail}',`
  $.ajax({
      type: 'post',
      url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
      data: { funcName: "AddSingleRowData", TableName: "MSG_QUEUED_NOTIFY", AddVal: AddVal, AddTitle: "TYPE,TITLE,MESSAGE,SEND_KEY, MSG_QUEUED_NOTIFY_SID", USER: "ADMINV2",SID_VAL : "364756631183302" ,log_val: AddVal },
      dataType: 'json',
      async: false,
      success: async function (result) {
          alert(`重設密碼郵件已寄送至以下信箱:\r\n${sendMail}`)
          $("#forgetPwdModal").modal('hide')
      },
      error: function (xhr, ajaxOptions, thrownError) {
          if (xhr.status = 500)
              alert("資料格式錯誤!");
          alert(thrownError);
      }
  });

}

function togglePasswordVisible() {
  $('#togglePassword').on('click', function () {
    const $passwordInput = $('#pw');
    const $eyeIcon = $('#eyeIcon');

    // 切换密码输入框的类型
    const type = $passwordInput.attr('type') === 'password' ? 'text' : 'password';
    $passwordInput.attr('type', type);

    // 切换图标
    $eyeIcon.toggleClass('fa-eye-slash fa-eye');
  });
}
