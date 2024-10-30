// 是否需要 Loading 畫面 ( true開 / false關 )
var ifLoadMask = true;

// 儲存 token資訊命名開頭
var PROJECT_SAVE_NAME = 'JINTEX';
//等同畫面 左上標題

// 網站名稱
var PROJECT_NAME = 'JINTEX_EC';
// 本機開發要改成空白 platformDev2023B

// api 預設 參數
var default_ip = location.hostname + (location.port ? ':' + location.port : '');

// var default_Api_Name = 'ESG_BIAPIV2';
var default_Api_Name = 'JTEK_ECWEB_API';
// 舊 api 預設 參數
var default_WebSiteName = 'JINTEX';

//報工 & 語系參數
var OPU_NAME = "ESG_APP";

//预设语系
var default_lng = localStorage.getItem(PROJECT_SAVE_NAME + '_v1_lng') || "en_us";
var ClientName = PROJECT_SAVE_NAME + "_v1"
//必須命名
var ClientVer = "1.0.0"
//網頁SERVER模式(自動偵測API的網址)
var WebServerMode = false;

//單語系
var LongType = 'GetDic4APPOneLan';
//
//雙語系
// var LongType = 'GetDic4APP';