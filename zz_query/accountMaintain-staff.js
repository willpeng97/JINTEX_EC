//準備參數
let accountGridSID = '356105238123090'; // SEC_USER_STAFF
let accountGrid;
let table;

async function fetchData(){
  accountGrid = await getGridDataV2(accountGridSID)
  displayAccounts(accountGrid)
}
fetchData()

function displayAccounts(accountGrid){
  accountGrid.forEach(function (account) {
    let accountHtml = `
      <tr>
        <td>${account.ACCOUNT_NO}</td>
        <td>${account.SITE}</td>
        <td>${account.OOAGSTUS}</td>
        <td>${account.OOAGENT}</td>
        <td>${account.COD_EMP}</td>
        <td>${account.NAM_EMP}</td>
        <td>${account.COD_DEPT}</td>
        <td>${account.NAM_DEPT}</td>
        <td>${account.OOFC001}</td>
        <td>${account.MAIL}<img src="../img/weyu/icons-edit-40.png" class="edit-account-Img" onclick="editMail('${account.USER_SID}')"></td></td>
        <td>${account.MANAGER}</td>
        <td>${account.NAM_MANAGER}</td>
        <td>${account.MAIL_MANAGER}</td>
        <td>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox" ${account.IS_SEND_LINE === 'Y' ? "checked" : ""}
              onChange="toggleFlag('line',this,'${account.USER_SID}')"
            />
          </div>
        </td>
        <td>
          <div class="form-check form-switch">
            <input
            class="form-check-input"
            type="checkbox" ${account.IS_SEND_MAIL === 'Y' ? "checked" : ""}
            onChange="toggleFlag('mail',this,'${account.USER_SID}')"
            />
          </div>
        </td>
        <td>
          <img src="../img/weyu/icons-change.png" class="reset-password-Img" onclick="misResetPassword('${account.USER_SID}')">
        </td>
      </tr>
    `;
    $("#accountsContainer").append(accountHtml);
  });
  table = new DataTable("#accountsTable", {
    stateSave: true,
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
    },
    columnDefs: [
      {
          targets: [13,14,15],
          orderable: false
      }
    ],
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


function toggleFlag(type,target,USER_SID){
  let username = localStorage.getItem(PROJECT_SAVE_NAME+'_BI_ORIGINAL_ACCOUNT_NO');
  let SIDArray = `USER_SID=${USER_SID}`;
  let EditVal;
  switch(type){
    case 'line':
      EditVal = `IS_SEND_LINE=N'${target.checked ? 'Y' : 'N'}',`
      break;
    case 'mail':
      EditVal = `IS_SEND_MAIL=N'${target.checked ? 'Y' : 'N'}',`
      break;
  }

  $.ajax({
    type: 'post',
    url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
    data: { funcName: "UpdGridData", TableName: "SEC_USER", SID: SIDArray, EditVal: EditVal, USER: username,SID_VAL:304100717100290,log_val : EditVal },
    dataType: 'json',
    async: false
  });
}


// 修改信箱
function editMail(USER_SID){
  $("#editMailModal").data('USER_SID',USER_SID)
  $("#editMailModal").modal('show')
}

function editMailSave(){
  let USER_SID = $("#editMailModal").data('USER_SID')
  let newMail = $("#newMail").val()

  let EditSID =  `USER_SID=${USER_SID}`
  let EditVal = `MAIL=N'${newMail}',`
  $.ajax({
    type: 'post',
    url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
    data: { funcName: "UpdGridData", TableName: 'SEC_USER', SID: EditSID, EditVal: EditVal, USER: 'ADMIN',SID_VAL:"304100717100290",log_val : EditVal },
    dataType: 'json',
    async: false,
    success: function (result) {
      alert('修改信箱成功!')
      location.reload()
    }
  });
}