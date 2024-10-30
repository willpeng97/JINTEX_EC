// menu的群組權限管理
let username = localStorage.getItem(PROJECT_SAVE_NAME+"_BI_userName")
// let ACCOUNT_NO = localStorage.getItem(PROJECT_SAVE_NAME+"_BI_accountNo")
let Account_Type = localStorage.getItem(PROJECT_SAVE_NAME+"_BI_Account_Type")
let TokenKey = localStorage.getItem(PROJECT_SAVE_NAME+"_BI_TokenKey")
// let Menudata_list = GetMenuData(username,TokenKey);
// 暫時使用 可改成API撈CUSTOM_TYPE值(Y/N)
let showMenu;
switch(Account_Type){
  case "IT":
    showMenu = ['商品一覽','EC訂單','ERP訂單','最新消息','最新消息維護','客戶帳號維護','員工帳號維護','官方網站','用戶登入紀錄']
    break;
  case "stuff":
    showMenu = ['EC訂單','ERP訂單','最新消息維護','客戶帳號維護','員工帳號維護','官方網站']
    break;
  case "custom":
    showMenu = ['商品一覽','訂單查詢','最新消息','官方網站']
    break;
  default:
    showMenu = []
}

// 測試用寫死資料
let Menudata_list = [
  {
    "label": "商品一覽",
    "link": "/zz_query/product.html",
    "img": "img/weyu/btnGoods.svg"
  },
  {
    "label": "訂單查詢",
    "link": "/zz_query/orderQuery.html",
    "img": "img/weyu/btnGoods.svg"
  },
  {
    "label": "EC訂單",
    "link": "/zz_query/orderMaintain.html",
    "img": "img/weyu/btnGoods.svg"
  },
  {
    "label": "ERP訂單",
    "link": "/zz_query/orderMaintain-ERP.html",
    "img": "img/weyu/btnGoods.svg"
  },
  {
    "label": "最新消息",
    "link": "/zz_query/news.html",
    "img": "img/weyu/btnNews.svg"
  },
  {
    "label": "最新消息維護",
    "link": "/zz_query/newsMaintain.html",
    "img": "img/weyu/btnNews.svg"
  },
  {
    "label": "客戶帳號維護",
    "link": "/zz_query/accountMaintain-custom.html",
    "img": "img/weyu/btnPeople.svg"
  },
  {
    "label": "員工帳號維護",
    "link": "/zz_query/accountMaintain-staff.html",
    "img": "img/weyu/btnPeople.svg"
  },
  {
    "label": "官方網站",
    "link": '/https://zh-tw.jintex-chemical.com/news.html" target="_blank',
    "img": "img/weyu/btnPeople.svg"
  },
  {
    "label": "用戶登入紀錄",
    "link":  "/zz_query/user-login-log.html",
    "img": "img/weyu/btnPeople.svg"
  },
  {
    "label": "群組權限管理",
    "link":  "/zz_query/user-group.html",
    "img": "img/weyu/btnPeople.svg"
  }
]

// 跑迴圈長出按鈕

let menu = document.querySelector('#menu');

let htmlContent = '';

for (let item of Menudata_list) {
  if(showMenu.includes(item.label)){
    htmlContent += `
      <div class="col p-3">
        <a href="${item.link.substring(1,)}" class="text-decoration-none ">
          <div class="btnItem border-opacity-20 rounded-3 bg-opacity-10 pt-3 pb-3 hover-effect">
            <div class="text-light text-decoration-none text-center d-block">
              <img src="${item.img}" class="cover" alt="default" />
            </div>
            <h3 class="text-center">${GetLangDataV2(item.label)}</h3>
          </div>
        </a>
      </div>
    `
  }
}

menu.innerHTML = htmlContent;


function GetMenuData(account,TokenKey){
  jsonMenu = null;
  $.ajax({
      method: 'GET',
      async: false,
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      url:  window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetMenu',
      headers: {
        UID: account,
        TokenKey: TokenKey
      },
      success: function (response) {
        jsonMenu = Object.values(response);
        jsonMenu = jsonMenu[1].find(item=>item.label==='JINTEX')['children'][0]['children']
        // jsonMenu = jsonMenu[1].find(item=>item.label==='JINTEX')['children']
      },
      error: function (jqXHR, exception) {
          return jsonMenu ;
      }
  })

  return jsonMenu ; 
}