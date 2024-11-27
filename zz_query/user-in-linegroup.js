//準備參數
let userGridSID = '363359616773438'; // V_ZZ_USER_IN_LINE_GROUP
let userGrid;
let table;

async function fetchData(){
  userGrid = await getGridDataV2(userGridSID)
  displayUser(userGrid)
}
fetchData()

function displayUser(userGrid){
  userGrid.forEach(function (user) {
    let userHtml = `
      <tr>
        <td>${user.USER_NAME}</td>
        <td>${user.PMAAL004_B}</td>
        <td>${user.PMAAL004_A}</td>
        <td>${user.LINE_ID}</td>
        <td>
          <button onclick="removeMember('${user.USER_SID}')">移除會員</button>
        </td>
      </tr>
    `;
    $("#gridContainer").append(userHtml);
  });
  table = new DataTable("#gridTable", {
    stateSave: true,
    stateSaveParams: function (settings, data) {
      // 只保存排序和分頁，不保存搜尋
      data.search = {};
      data.columns.forEach(column => {
          column.search = {};
      });
    },
    // paging: false,
    info: false,
    scrollCollapse: true,
    scrollY: "60vh",
    iDisplayLength: 10,
    order: [[ 0, "desc" ]], //照日期排序
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

function removeMember(USER_SID){
  let yes = confirm('確定要將用戶移除LINE會員嗎?')
  if(yes){
    let EditSID = `USER_SID=${USER_SID}`
    let EditVal = `MEMBER=NULL,LINE_ID=NULL,`
    $.ajax({
      type: 'post',
      url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
      data: { funcName: "UpdGridData", TableName: 'SEC_USER', SID: EditSID, EditVal: EditVal, USER: 'ADMIN',SID_VAL:"304100717100290",log_val : EditVal },
      dataType: 'json',
      async: false,
      success: function (result) {
        alert('移除會員成功!')
        location.reload()
      }
    });

  }

}