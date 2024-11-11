//準備參數
let accountGridSID = '356104687500810'; // SEC_USER_CUSTOM
let accountGrid;
let table;

async function fetchData(){
  accountGrid = await getGridDataV2(accountGridSID)
  console.log(accountGrid)
  displayAccounts(accountGrid)
}
fetchData()

function displayAccounts(accountGrid){
  accountGrid.forEach(function (account) {
    let accountHtml = `
      <tr>
        <td>${account.ACCOUNT_NO}<img src="../img/weyu/icons-edit-40.png" class="edit-account-Img" onclick="editAccount('${account.ACCOUNT_NO}','${account.USER_SID}')"></td>
        <td>${account.USER_NAME}</td>
        <td>${account.PMAA001}</td>
        <td>${account.PMAAL003}</td>
        <td>${account.PMAAL004_A}</td>
        <td>${account.PMAA005}</td>
        <td>${account.PMAAL004_B}</td>
        <td>
          <a href="mailto:${account.OOFC012_B}">${account.OOFC012_B}</a>
        </td>
        <td>${account.ORDER_LEV}</td>
        <td>${account.OOFB017}</td>
        <td>${account.PMAJUA002}</td>
        <td>${account.PMABUAL005}</td>
        <td>
          <img src="../img/weyu/icons-change.png" class="reset-password-Img" onclick="misResetPassword('${account.USER_SID}')">
        </td>
      </tr>
    `;
    $("#accountsContainer").append(accountHtml);
  });
  table = new DataTable("#accountsTable", {
    // paging: false,
    info: false,
    scrollCollapse: true,
    scrollX: true,
    scrollY: "60vh",
    iDisplayLength: 10,
    // order: [[ 0, "desc" ]], //照日期排序
    language: {
        "sProcessing": "處理中...",
        "sLengthMenu": "每頁顯示 _MENU_ 項結果",
        "sZeroRecords": "沒有匹配結果",
        "sInfo": "顯示第 _START_ 至 _END_ 項結果，共 _TOTAL_ 項",
        "sInfoEmpty": "顯示第 0 至 0 項結果，共 0 項",
        "sInfoFiltered": "(由 _MAX_ 項結果過濾)",
        "sInfoPostFix": "",
        "sSearch": "搜尋:",
        "sUrl": "",
        "sEmptyTable": "表中資料為空",
        "sLoadingRecords": "載入中...",
        "sInfoThousands": ",",
        "oPaginate": {
            "sFirst": "首頁",
            "sPrevious": "上一頁",
            "sNext": "下一頁",
            "sLast": "末頁"
        },
        "oAria": {
            "sSortAscending": ": 以升序排列此列",
            "sSortDescending": ": 以降序排列此列"
        }
    }
  });
}

function misResetPassword(USER_SID){
  let yes = confirm("確定要重設密碼嗎?")
  if(yes){
    $.ajax({
        type: 'POST',
        url: window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/MasterSet/ResetPassword.ashx',
        data: { action: 'ResetPassword', sid: USER_SID, password: "JINTEX" },
        async: false,
        success: function (msg) {
            resultJson = JSON.parse(msg);
            if (resultJson.result == "true") {
                alert('密碼修改成功!')
            }
            else {
                alert('密碼修改失敗!!')
            }
        }
    });
  }
}

// 修改密碼
function editAccount(ACCOUNT_NO,USER_SID){
  $("#newAccount").val('')
  $("#oldAccount").text(ACCOUNT_NO)
  $("#editAccountModal").data('USER_SID',USER_SID)
  $("#editAccountModal").modal('show')
}

function editSave(){
  let USER_SID = $("#editAccountModal").data('USER_SID')
  let newAccount = $("#newAccount").val()

  //判斷帳號是否可用
  if(newAccount == '') {
    alert('不可輸入空白!')
    return
  }else if ([' ', '@', '&', '%'].some(char => newAccount.includes(char))) {
    alert("不可含有以下字元: 空白、'@'、'&'、'%'");
    return;
  }
  
  let yes = confirm("確定要修改帳號嗎?")
  if(yes){
    let EditSID =  `USER_SID=${USER_SID}`
    let EditVal = `ACCOUNT_NO=N'${newAccount}',`
    $.ajax({
      type: 'post',
      url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
      data: { funcName: "UpdGridData", TableName: 'SEC_USER', SID: EditSID, EditVal: EditVal, USER: 'ADMIN',SID_VAL:"304100717100290",log_val : EditVal },
      dataType: 'json',
      async: false,
      success: function (result) {
        alert('修改帳號成功!')
        location.reload()
      },
      error: function (xhr, ajaxOptions, thrownError) {
        alert("該帳號已有人使用，請重新輸入!");
      }
    });
  }

}