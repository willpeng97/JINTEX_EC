//準備參數
let newsGridSID = '351599528316128'; // ZZ_NEWS_HYPERLINK
let newsGrid;
let table;

async function fetchData(){
  newsGrid = await getGridDataV2(newsGridSID)
  displayNews(newsGrid)
}
fetchData()

function displayNews(newsGrid){
  newsGrid.forEach(function (news) {
    if(news.FILE_URL !== "NULL"){
      src = news.FILE_URL.match(/news\\.*$/);
      url = `${window.location.protocol}//${default_ip}/${default_Api_Name}/${src[0]}`
      titleHtml = `<a href="${url}" target="_blank">${news.TITLE}</a>`
    }else{
      titleHtml = `<a>${news.TITLE}</a>`
    }
    let newsHtml = `
      <tr>
        <td>${news.DATE.split('T')[0]}</td>
        <td>
          ${titleHtml}
          <button
            class="news-Item btn btn-danger p-0 d-none"
            onclick="openDeleteModal('${news.SID}')"
          >
          </button>
        </td>
      </tr>
    `;
    $("#newsContainer").append(newsHtml);
  });
  table = new DataTable("#newsTable", {
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
  // $('#newsTable_length').hide()
}