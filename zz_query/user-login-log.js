//準備參數
let gridDataSID = '362165742130456'; //V_ZZ_BTB_ORDER_V_HEADER (ERP訂單 單頭)
let gridData;

let table

$(document).ready(async function() {
    gridData = await getGridData(gridDataSID)
    setTable(gridData)

    $("#exportBtnXlsx").click(()=>exportToXlsx());
    $("#exportBtnCsv").click(()=>exportToCsv());

});

function getGridData(SID) {
    return new Promise((resolve, reject) => {
        // 定义 GetGrid API 的 URL
        let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/ZZ_GetGrid';

        // 定义查詢条件参数对象
        let conditions = {
            // Field: [],
            // Oper: [],
            // Value: []
        };

        // 构建请求体
        let requestBody = JSON.stringify(conditions);

        $.ajax({
            url: getGridURL, // 替換為你的API端點
            type: 'POST',
            data: requestBody,
            dataType: 'json',
            contentType: 'application/json',
            headers: {
                'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'), // 替換為你的自訂Header
                'SID': SID
            },
            success: function(response) {
                if(response.result){
                    resolve(response.Grid_Data);
                } else {
                    Set_Clean();
                    reject('Error: No result in response');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error:', textStatus, errorThrown);
                $('#postDataResult').text('Error: ' + textStatus + ', ' + errorThrown);
                reject('Error: ' + textStatus + ', ' + errorThrown);
            }
        });
    });
}

function setTable(gridData){
    gridData.forEach(function (data) {
        let orderHtml = `
            <tr>
                <td>${data.ACCOUNT_NO}</td>
                <td>${data.USER_NAME}</td>
                <td>${data.START_TIME}</td>
                <td>${data.END_TIME}</td>
                <td>${data.TOTAL_TIME_SEC}</td>
            </tr>
        `;
        $("#grid-table").append(orderHtml);
    });

    table = new DataTable("#example", {
        paging: true,
        scrollCollapse: true,
        pageLength: 10, // 預設每頁顯示10筆資料
        order: [[ 2, "desc" ]],
        initComplete: function() {
            $(".dataTables_filter").hide() // 隱藏dataTable原生搜尋欄
            $("#searchBar").removeClass('d-none') // 顯示客製搜尋欄
            $('#search-keyword').on('keyup change', function() {
                table.search(this.value).draw();
            });
            $('#search-from').on('change', function() {
                table.draw();
            });
            $('#search-to').on('change', function() {
                table.draw();
            });

            $.fn.dataTable.ext.search.push( //為dataTable添加自定義的搜尋函數，用於搜尋日期範圍
                function(settings, data, dataIndex) {
                    let min = $('#search-from').val() ? $('#search-from').val() + " 00:00:00" : ""
                    let max = $('#search-to').val() ? $('#search-to').val() + " 23:59:59" : ""
                    let date = data[2]; // 下單時間在第 2 欄
        
                    if (
                        (min === "" && max === "") ||
                        (min === "" && date <= max) ||
                        (min <= date && max === "") ||
                        (min <= date && date <= max)
                    ) {
                        return true;
                    }
                    return false;
                }
            );
        },
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

function exportToXlsx(){
    // 從 DataTable 提取資料
    let data = [];
    let headerArray = []

    // 提取表頭
    table.columns().header().each(function (header) {
        headerArray.push($(header).text());
    });
    data.push(headerArray)
    
    // 提取表內容
    table.rows({ search: 'applied' }).every(function(rowIdx, tableLoop, rowLoop) {
        data.push(this.data()); // 將每列的資料加入
    });

    // 生成工作表
    let ws = XLSX.utils.aoa_to_sheet(data);

    // 建立工作簿
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "sheet1");

    // 匯出 Excel 檔案
    XLSX.writeFile(wb, "登入紀錄.xlsx");
}

function exportToCsv(){
    // 從 DataTable 提取資料
    let data = [];
    let headerArray = []

    // 提取表頭
    table.columns().header().each(function (header) {
        headerArray.push($(header).text());
    });
    data.push(headerArray)
    
    // 提取表內容
    table.rows({ search: 'applied' }).every(function(rowIdx, tableLoop, rowLoop) {
        data.push(this.data()); // 將每列的資料加入
    });


    // 生成 CSV 格式的內容
    let ws = XLSX.utils.aoa_to_sheet(data);
    let csv = XLSX.utils.sheet_to_csv(ws);

    // 添加 UTF-8 BOM (讓 Excel 正確識別編碼)
    let utf8BOM = '\uFEFF' + csv;

    // 建立並下載 CSV 檔案
    let blob = new Blob([utf8BOM], { type: "text/csv;charset=utf-8;" });
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "登入紀錄.csv";
    link.click();
}