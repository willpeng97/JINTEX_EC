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

let table1, table2

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
    });
});

function getGridDataOrder(TYPE,SID) {
    return new Promise((resolve, reject) => {
        // 定义 GetGrid API 的 URL
        let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetGrid';

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

            $("#orderContainer_A").append(orderHtml);
        }
    });

    //第一個Table(EC)
    table1 = new DataTable("#table1", {
        paging: true,
        scrollCollapse: true,
        pageLength: 10, // 預設每頁顯示10筆資料
        order: [[5, "desc" ]],
        // columnDefs: [{
        //     orderable:false,
        //     target:[7]
        // }],
        initComplete: function() {
            $("#table1_filter").hide() // 隱藏dataTable原生搜尋欄
            // 關鍵字搜尋
            $('#search-keyword_A').on('keyup change', function() {
                table1.search(this.value).draw();
            });
            // 日期搜尋
            $('#search-from_A').on('change', function() {
                table1.draw();
            });
            $('#search-to_A').on('change', function() {
                table1.draw();
            });
            $.fn.dataTable.ext.search.push( //為dataTable添加自定義的搜尋函數，用於搜尋日期範圍
                function(settings, data, dataIndex) {
                    var min = $('#search-from_A').val() ? $('#search-from_A').val() + " 00:00:00" : ""
                    var max = $('#search-to_A').val() ? $('#search-to_A').val() + " 23:59:59" : ""
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
        $('#search-keyword_A').val(today)
        $('#search-keyword_A').change()
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
    table2 = new DataTable("#table2", {
        paging: true,
        scrollCollapse: true,
        pageLength: 10, // 預設每頁顯示10筆資料
        order: [[ 4, "desc" ]],
        initComplete: function() {
            $("#table2_filter").hide() // 隱藏dataTable原生搜尋欄
            // 關鍵字搜尋
            $('#search-keyword_B').on('keyup change', function() {
                table2.search(this.value).draw();
            });
            // 日期搜尋
            $('#search-from_B').on('change', function() {
                table2.draw();
            });
            $('#search-to_B').on('change', function() {
                table2.draw();
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