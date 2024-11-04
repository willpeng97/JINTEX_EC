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
      </tr>
    `;
    $("#gridContainer").append(userHtml);
  });
  table = new DataTable("#gridTable", {
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