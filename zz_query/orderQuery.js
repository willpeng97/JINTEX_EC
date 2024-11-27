//準備參數
let orderGridSID_A = '351511835020401'; //V_ZZ_ORDER_RECORD (EC訂單)
let orderGrid_A;
let orderGridSID_B = '356089579733373'; //V_ZZ_BTB_ORDER_V_HEADER (ERP訂單 單頭)
let orderGrid_B;

let ORIGINAL_ACCOUNT_NO = localStorage.getItem(PROJECT_SAVE_NAME + '_BI_ORIGINAL_ACCOUNT_NO')
let ORDER_LEV = localStorage.getItem(PROJECT_SAVE_NAME + '_BI_ORDER_LEV')
let PMAA005 = localStorage.getItem(PROJECT_SAVE_NAME + '_BI_PMAA005')
let PMAA001 = localStorage.getItem(PROJECT_SAVE_NAME + '_BI_PMAA001')

// URL取參
let currentURL = new URL(window.location.href);
let URLparams = new URLSearchParams(currentURL.search);
let filter = URLparams.get('filter');
// 取得日期 用於過濾訂單日期
let today = (new Date()).toLocaleDateString('en-CA'); // ex: 2024-01-01

let tableA1, tableA2, tableB

$(document).ready(async function() {
    orderGrid_A = await getGridDataOrder('EC',orderGridSID_A)
    orderGrid_B = await getGridDataOrder('ERP',orderGridSID_B)
    displayOrders_A(orderGrid_A)
    displayOrders_B(orderGrid_B)

    // 監聽滑動事件
    $('.carousel-bar div').click(function () {
        // 移除所有按鈕的 active 樣式
        $('.carousel-bar div').removeClass('active');
        // 添加 active 樣式到當前選中的按鈕
        $(this).addClass('active');
        // 是否顯示匯出按鈕
        $(this).data('bs-slide-to') == 2 ? $("#exportBtnXlsx").show() : $("#exportBtnXlsx").hide()
    });
    
    $("#exportBtnXlsx").click(()=>exportToXlsx());
});

function getGridDataOrder(TYPE,SID) {
    return new Promise((resolve, reject) => {
        // 定义 GetGrid API 的 URL
        let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetData';

        // 定义查詢条件参数对象
        let conditions;
        switch(TYPE){
            case "EC":
                conditions = {
                    Field: ["PMAJ012"],
                    Oper: ["="],
                    Value: [ORIGINAL_ACCOUNT_NO]
                };
                break;
            case "ERP":
                if(ORDER_LEV==='Y'){
                    conditions = {
                        Field: ["PMAA005"],
                        Oper: ["="],
                        Value: [PMAA005]
                    };
                }else{
                    conditions = {
                        Field: ["XMDA004"],
                        Oper: ["="],
                        Value: [PMAA001]
                    };
                }
                break;
        }


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

function displayOrders_A(orderGrid_A){
    orderGrid_A.forEach(function (order) {
        if(order.EXPORT_LOCK_FLAG === 'N'){
            // 訂單送出
            let orderHtml = `
                <tr>
                    <td>${order.ORDER_NUMBER}</td>
                    <td>${order.PMAAL004_A}</td>
                    <td>${order.USER_NAME}</td>
                    <td>${order.ADDRESS}</td>
                    <td>${order.PURCHASE_ORDER||''}</td>
                    <td>${order.ORDER_DATE.split('T')[0]}</td>
                    <td>
                        <button class="btn btn-success" onclick="viewDetail_EC('${order.ORDER_NUMBER}','${order.ZZ_ORDER_RECORD_SID}')">
                            <img src="../img/comm/FontAwesome/document.svg" alt="edit">
                        </button>
                    </td>
                </tr>
            `;

            $("#orderContainer_A1").append(orderHtml.trim());
        }
        else if(order.EXPORT_LOCK_FLAG === 'Y' && !order.XMDADOCNO){
            // 審核中
            let orderHtml = `
                <tr>
                    <td>${order.ORDER_NUMBER}</td>
                    <td>${order.PMAAL004_A}</td>
                    <td>${order.USER_NAME}</td>
                    <td>${order.ADDRESS}</td>
                    <td>${order.PURCHASE_ORDER||''}</td>
                    <td>${order.ORDER_DATE.split('T')[0]}</td>
                    <td>
                        <button class="btn btn-success" onclick="viewDetail_EC('${order.ORDER_NUMBER}','${order.ZZ_ORDER_RECORD_SID}')">
                            <img src="../img/comm/FontAwesome/document.svg" alt="edit">
                        </button>
                    </td>
                </tr>
            `;

            $("#orderContainer_A2").append(orderHtml.trim());
        }
    });

    //第一個Table(EC訂單送出)
    tableA1 = new DataTable("#tableA1", {
        stateSave: true,
        stateSaveParams: function (settings, data) {
            // 只保存排序和分頁，不保存搜尋
            data.search = {};
            data.columns.forEach(column => {
                column.search = {};
            });
        },
        paging: true,
        scrollCollapse: true,
        autoWidth: false,
        columns: [
            { width: "10%" }, // 第一列寬度
            { width: "15%" },
            { width: "15%" },
            { width: "25%" },
            { width: "15%" },
            { width: "15%" },
            { width: "5%" }
        ],
        pageLength: 10, // 預設每頁顯示10筆資料
        order: [[5, "desc" ]],
        columnDefs: [{
            orderable:false,
            target:[6]
        }],
        initComplete: function() {
            $("#tableA1_filter").hide() // 隱藏dataTable原生搜尋欄
            // 關鍵字搜尋
            $('#search-keyword_A1').on('keyup change', function() {
                tableA1.search(this.value).draw();
            });
            // 日期搜尋
            $('#search-from_A1').on('change', function() {
                tableA1.draw();
            });
            $('#search-to_A1').on('change', function() {
                tableA1.draw();
            });
            $.fn.dataTable.ext.search.push( //為dataTable添加自定義的搜尋函數，用於搜尋日期範圍
                function(settings, data, dataIndex) {
                    var min = $('#search-from_A1').val() ? $('#search-from_A1').val() + " 00:00:00" : ""
                    var max = $('#search-to_A1').val() ? $('#search-to_A1').val() + " 23:59:59" : ""
                    var date = data[5]; // 下單時間在第 6 欄
        
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
    
    //第二個Table(EC審核中)
    tableA2 = new DataTable("#tableA2", {
        stateSave: true,
        stateSaveParams: function (settings, data) {
            // 只保存排序和分頁，不保存搜尋
            data.search = {};
            data.columns.forEach(column => {
                column.search = {};
            });
        },
        paging: true,
        scrollCollapse: true,
        autoWidth: false,
        columns: [
            { width: "10%" }, // 第一列寬度
            { width: "15%" },
            { width: "15%" },
            { width: "25%" },
            { width: "15%" },
            { width: "15%" },
            { width: "5%" }
        ],
        pageLength: 10, // 預設每頁顯示10筆資料
        order: [[5, "desc" ]],
        columnDefs: [{
            orderable:false,
            target:[6]
        }],
        initComplete: function() {
            $("#tableA2_filter").hide() // 隱藏dataTable原生搜尋欄
            // 關鍵字搜尋
            $('#search-keyword_A2').on('keyup change', function() {
                tableA2.search(this.value).draw();
            });
            // 日期搜尋
            $('#search-from_A2').on('change', function() {
                tableA2.draw();
            });
            $('#search-to_A2').on('change', function() {
                tableA2.draw();
            });
            $.fn.dataTable.ext.search.push( //為dataTable添加自定義的搜尋函數，用於搜尋日期範圍
                function(settings, data, dataIndex) {
                    var min = $('#search-from_A2').val() ? $('#search-from_A2').val() + " 00:00:00" : ""
                    var max = $('#search-to_A2').val() ? $('#search-to_A2').val() + " 23:59:59" : ""
                    var date = data[5]; // 下單時間在第 6 欄
        
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

    if(filter === 'today'){
        $('#search-keyword_A1').val(today)
        $('#search-keyword_A1').change()
    }
}
function displayOrders_B(orderGrid_B){
    orderGrid_B.forEach(function (order) {
        let orderHtml = `
            <tr>
                <td>${order.XMDADOCNO}</td>
                <td>${order.PMAAL004_A}</td>
                <td>${order.XMDA033}</td>
                <td>${order.XMDA008}</td>
                <td>${order.XMDADOCDT}</td>
                <td>${order.XMDA007.replace("A0","電商")}</td>
                <td>
                    <button class="btn btn-success" onclick="viewDetail_ERP('${order.XMDA008}','${order.XMDADOCNO}')">
                        <img src="../img/comm/FontAwesome/document.svg" alt="edit">
                    </button>
                </td>
            </tr>
        `;
        $("#orderContainer_B").append(orderHtml);
    });

    //第二個Table(ERP)
    tableB = new DataTable("#tableB", {
        stateSave: true,
        stateSaveParams: function (settings, data) {
            // 只保存排序和分頁，不保存搜尋
            data.search = {};
            data.columns.forEach(column => {
                column.search = {};
            });
        },
        paging: true,
        scrollCollapse: true,
        pageLength: 10, // 預設每頁顯示10筆資料
        order: [[ 4, "desc" ]],
        initComplete: function() {
            $("#tableB_filter").hide() // 隱藏dataTable原生搜尋欄
            // 關鍵字搜尋
            $('#search-keyword_B').on('keyup change', function() {
                tableB.search(this.value).draw();
            });
            // 日期搜尋
            $('#search-from_B').on('change', function() {
                tableB.draw();
            });
            $('#search-to_B').on('change', function() {
                tableB.draw();
            });
            $.fn.dataTable.ext.search.push( //為dataTable添加自定義的搜尋函數，用於搜尋日期範圍
                function(settings, data, dataIndex) {
                    var min = $('#search-from_B').val() ? $('#search-from_B').val() + " 00:00:00" : ""
                    var max = $('#search-to_B').val() ? $('#search-to_B').val() + " 23:59:59" : ""
                    var date = data[4]; // 下單時間在第 5 欄
        
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

function viewDetail_EC(ORDER_NUMBER,ZZ_ORDER_RECORD_SID){
    let url = window.location.protocol+"//"+ default_ip +"/"+PROJECT_NAME+"/zz_query/orderQueryDetail-EC.html?order=" + ORDER_NUMBER + "&sid=" + ZZ_ORDER_RECORD_SID
    // window.open(url)
    window.location.href = url
}
function viewDetail_ERP(ORDER_NUMBER,XMDADOCNO){
    let url  = window.location.protocol+"//" + default_ip +"/"+PROJECT_NAME+"/zz_query/orderQueryDetail-ERP.html?order=" + ORDER_NUMBER + "&erp=" + XMDADOCNO;
    // window.open(url)
    window.location.href = url
}


async function exportToXlsx(){
    let exportViewSID = '363449281123416' //V_ZZ_BTB_ORDER_V_EXPORT_XLSX
    let exportData = await getGridDataOrder('ERP',exportViewSID)

    // 過濾
    let erpOrderNumber = tableB.column(0, { search: 'applied' }).data().toArray();
    exportData = exportData.filter((row) => erpOrderNumber.includes(row.XMDADOCNO))

    // 初始化資料陣列，包含表頭列
    let data = [];
    let headerArray = ["客戶","ERP單號","訂單日期","項次","英文品名","中文品名","總訂購數量","約定交貨日期","已出貨量","訂單合併狀態","資料來源","EC單號"];
    data.push(headerArray);
    
    // 定義要忽略的欄位
    const ignoredFields = ["PMAA005", "PMAAL004_B", "XMDA004", "XMDC027"];

    // 處理每筆資料
    exportData.forEach((item) => {
        let row = [];
        for (let key in item) {
            if (!ignoredFields.includes(key)) {
                row.push(item[key]);
            }
        }
        data.push(row);
    });

    // 建立工作表和工作簿
    let ws = XLSX.utils.aoa_to_sheet(data);
    let wb = XLSX.utils.book_new();
    // 指定單元格為數字
    for (let row = 1; row < data.length; row++) {  // 從第一行數據開始（跳過標題行）
        // 處理 G 欄位
        const cellAddressA = `G${row + 1}`;
        if (ws[cellAddressA]) {
            ws[cellAddressA].t = 'n';
        }
        // 處理 I 欄位
        const cellAddressG = `I${row + 1}`;
        if (ws[cellAddressG]) {
            ws[cellAddressG].t = 'n';
        }
    }

    XLSX.utils.book_append_sheet(wb, ws, "sheet1");

    // 匯出 Excel 檔案
    XLSX.writeFile(wb, "已成立訂單.xlsx");
}
