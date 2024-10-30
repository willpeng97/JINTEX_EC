// // 設置語系
// let langue = GetShowLngText();
// let langueStatus = document.getElementById('langueStatus');
// langueStatus.textContent = langue;
// 設置使用者
let account = localStorage.getItem(PROJECT_SAVE_NAME+'_BI_userName');
let accountStatus = document.getElementById('accountStatus');
accountStatus.innerHTML = account;
let welcomeAccount = document.getElementById('welcomeAccount');
welcomeAccount.innerHTML = account;

// 登出功能
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector('#logout').addEventListener("click", function() {
    Set_Clean();
  });
});
