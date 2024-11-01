// menu的群組權限管理
let username = localStorage.getItem(PROJECT_SAVE_NAME+"_BI_userName")
let TokenKey = localStorage.getItem(PROJECT_SAVE_NAME+"_BI_TokenKey")
let functionKey = localStorage.getItem(PROJECT_SAVE_NAME+'_BI_Functionkey').split(',')
// 暫時使用 可改成API撈CUSTOM_TYPE值(Y/N)
let showMenu;

// 功能選單資料
let Menudata_list = [
  {
    "label": "商品一覽",
    "link": "/zz_query/product.html",
    "img": "img/weyu/btnGoods.svg",
    "fnKey":'342975302766084'
  },
  {
    "label": "訂單查詢",
    "link": "/zz_query/orderQuery.html",
    "img": "img/weyu/btnGoods.svg",
    "fnKey":'362922892413760'
  },
  {
    "label": "EC訂單",
    "link": "/zz_query/orderMaintain.html",
    "img": "img/weyu/btnGoods.svg",
    "fnKey":'362923018316488'
  },
  {
    "label": "ERP訂單",
    "link": "/zz_query/orderMaintain-ERP.html",
    "img": "img/weyu/btnGoods.svg",
    "fnKey":'362923040996286'
  },
  {
    "label": "最新消息",
    "link": "/zz_query/news.html",
    "img": "img/weyu/btnNews.svg",
    "fnKey":'362923073246431'
  },
  {
    "label": "最新消息維護",
    "link": "/zz_query/newsMaintain.html",
    "img": "img/weyu/btnNews.svg",
    "fnKey":'362923093363190'
  },
  {
    "label": "客戶帳號維護",
    "link": "/zz_query/accountMaintain-custom.html",
    "img": "img/weyu/btnPeople.svg",
    "fnKey":'362923114156236'
  },
  {
    "label": "員工帳號維護",
    "link": "/zz_query/accountMaintain-staff.html",
    "img": "img/weyu/btnPeople.svg",
    "fnKey":'362923151300829'
  },
  {
    "label": "官方網站",
    "link": '/https://zh-tw.jintex-chemical.com/news.html" target="_blank',
    "img": "img/weyu/btnPeople.svg",
    "fnKey":'362923191016754'
  },
  {
    "label": "用戶登入紀錄",
    "link":  "/zz_query/user-login-log.html",
    "img": "img/weyu/btnPeople.svg",
    "fnKey":'362923212130406'
  },
  {
    "label": "群組權限管理",
    "link":  "/zz_query/user-group.html",
    "img": "img/weyu/btnPeople.svg",
    "fnKey":'362923233980783'
  }
]

// 跑迴圈長出按鈕

let menu = document.querySelector('#menu');

let htmlContent = '';

for (let item of Menudata_list) {
  if(functionKey.includes(item.fnKey)){
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