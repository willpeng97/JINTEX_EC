//準備參數
var addPeopleList

var DetailTable;
var masterSID;
var GridData;
var BindData = [];
var BindDataSID = [];
var AllGridData = [];
var FUN_SID_ORIGIN_BIND_LIST = [];
var FUN_SID_ALL_BIND_LIST = [];
var FUN_SID_DEL_LIST = [];
var FUN_SID_UNBIND_LIST = [];
var FUN_SID_BIND_LIST = [];
var enable_flag_num = 0;
// var default_ip = '10.0.20.155';
// var default_WebSiteName = 'DCMATE_1114';
var GroupName = '';
//DYNAMIC TABLE
var MD_Maintain_QR_SID = '301253699070550';
var MD_Maintain_Columns_QR_SID = '301253738820145';
var MD_Maintain_Data;
var MD_Columns_Data;
var MD_Columns_Master_Data = '';
var MD_Columns_Master_ColName = '';
var MD_Columns_Detail_Data = '';
var MD_Columns_Detail_ColName = '';
var MD_Columns_Detail_ColList = [];
var MD_Columns_Search_Data = '';
var CurrentRow = [];

var SID = '362764493233279' //Group User Setup EC
var currentGroupName = ''

$(document).ready(function () {
    //FROM BAS_MD_MAINTAIN
    $.ajax({
        type: 'GET',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+ MD_Maintain_QR_SID,
        async: false,
        success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                      jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                      jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
      
                      MD_Maintain_Data = jsonObj
        }
      });
      
      MD_Maintain_Data.MasterSql = MD_Maintain_Data.MasterSql.replace('[SID]',SID);
      
    $.ajax({
        type: 'post',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
        data: {SQL: MD_Maintain_Data.MasterSql,AddedSQL:MD_Maintain_Data.AddedSql, Conds: JSON.stringify(MD_Maintain_Data.Conditions), GridFieldType: JSON.stringify(MD_Maintain_Data.GridFieldType) ,
        SID:+ MD_Maintain_QR_SID ,rows:10000},
        async: false,
        success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg);
            MD_Maintain_Data = jsonObj;
            // $('#midtitle').html(GetLangDataV2(MD_Maintain_Data.rows[0].CAPTION));
        }
    });


    //FROM BAS_MD_MAINTAIN_COLUMNS
    $.ajax({
        type: 'GET',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+ MD_Maintain_Columns_QR_SID,
        async: false,
        success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                      jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                      jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
      
                      MD_Columns_Data = jsonObj
        }
      });   
      
    MD_Columns_Data.MasterSql = MD_Columns_Data.MasterSql.replace('[SID]',SID);
      
    $.ajax({
        type: 'post',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
        data: {SQL: MD_Columns_Data.MasterSql,AddedSQL:MD_Columns_Data.AddedSql, Conds: JSON.stringify(MD_Columns_Data.Conditions), GridFieldType: JSON.stringify(MD_Columns_Data.GridFieldType) ,
        SID:+ MD_Maintain_Columns_QR_SID ,rows:10000},
        async: false,
        success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg);
        MD_Columns_Data = jsonObj;
        }
    });
    for (var i = 0; i < MD_Columns_Data.rows.length; i++)
    {
        if (MD_Columns_Data.rows[i].MD_COLUMNS_TYPE == 'Master' && MD_Columns_Data.rows[i].HIDDEN == 'False')
        {
            MD_Columns_Master_Data += ',' + MD_Columns_Data.rows[i].COL_NAME;
        }
        if (MD_Columns_Data.rows[i].MD_COLUMNS_TYPE == 'Detail')
        {
            MD_Columns_Detail_Data += MD_Columns_Data.rows[i].COL_NAME + ',';
        }
        if (MD_Columns_Data.rows[i].MD_COLUMNS_TYPE == 'Search' && MD_Columns_Data.rows[i].HIDDEN == 'False')
        {
            MD_Columns_Search_Data += MD_Columns_Data.rows[i].COL_NAME + ',';
        }
        if (MD_Columns_Data.rows[i].MD_COLUMNS_TYPE == 'Detail' && MD_Columns_Data.rows[i].HIDDEN == 'False')
        {
            MD_Columns_Detail_ColList.push(MD_Columns_Data.rows[i].COL_NAME);
        }
    }
    MD_Columns_Master_ColName = MD_Columns_Master_Data.substring(1,MD_Columns_Master_Data.length).split(',');
    MD_Columns_Detail_Data = MD_Columns_Detail_Data.substring(0,MD_Columns_Detail_Data.length-1).split(',');
    MD_Columns_Search_Data = MD_Columns_Search_Data.substring(0,MD_Columns_Search_Data.length-1);
    for (var i = 0; i < MD_Columns_Detail_Data.length; i++)
    {
        MD_Columns_Detail_ColName += ',' + MD_Maintain_Data.rows[0].DETAIL_TABLE_NAME + '.' + MD_Columns_Detail_Data[i];
    }
    MD_Columns_Detail_ColName = MD_Maintain_Data.rows[0].RELATION_TABLE_NAME + '.' + MD_Maintain_Data.rows[0].RELATION_SID_FIELD + MD_Columns_Detail_ColName;

    group(); //插入群組列表
    
    $("#MMList").change(()=>{
        getBindDetailTable();
        getUnbindDetailTable();

        currentGroupName = $("#MMList option:selected").text()
        $(".group-name").text(currentGroupName)
    }).trigger('change')

    $("#addPeopleBtn").click(()=>addPeople())
});

//群組列表
function group(){
    $.ajax({
        type: 'POST',
        title: 'Group User Setup',
        footer: '#S148115013850673_MAIN_ft',
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/Handler/MasterSetProcessing.ashx',
        async: false,
        pagination: true,
        data: {
            ActionMode: '',
            _search: false,
            COLUMNS: MD_Maintain_Data.rows[0].MASTER_SID_FIELD + MD_Columns_Master_Data,// a.MASTER_SID_FIELD + b. COL_NAME
            defaultSort: ' order by ' + MD_Maintain_Data.rows[0].MASTER_SORT_NAME + ' ' + MD_Maintain_Data.rows[0].MASTER_SORT_ORDER, // order by " + a.MASTER_SORT_NAME a.MASTER_SORT_ORDER
            MasterTable: MD_Maintain_Data.rows[0].MASTER_TABLE_NAME, //a.MASTER_TABLE_NAME
            SIDFILED: MD_Maintain_Data.rows[0].MASTER_SID_FIELD, //a.MASTER_SID_FIELD
            UserName: 'ADMINV2',
            rows: 'BI_PAGE',
            page : '1'
        },
        singleSelect: true,
        multiSort: false,
        rownumbers: true,
        sortName: MD_Maintain_Data.rows[0].MASTER_SORT_NAME, // a.MASTER_SORT_NAME
        sortOrder: MD_Maintain_Data.rows[0].MASTER_SORT_ORDER, //a.MASTER_SORT_ORDER
        pageSize: parseInt(1000),
        pageList: [100],
        // columns: [[{ field: 'GROUP_NAME', title: 'Group Name', width: 200, align: 'right', sortable: true, }, { field: 'ENABLE_FLAG', title: 'Enable', width: 100, align: 'right', sortable: true, }, { field: 'DESCRIPTION', title: 'Description', width: 200, align: 'right', sortable: true, }
        // ]],
        success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg);
            GroupData = jsonObj;
        }, error: function (msg) {
            var jsonObj = msg;
        }
    });

    for(var i=0 ;i<GroupData.rows.length;i++){
        for (var j = 0; j < MD_Columns_Master_ColName.length; j++)
        {
            if (j == 0)
            {
                GroupName = GroupData.rows[i][MD_Columns_Master_ColName[j]];
            }
            else
            {
                if (GroupData.rows[i][MD_Columns_Master_ColName[j]] != '')
                {
                    GroupName += '-' + GroupData.rows[i][MD_Columns_Master_ColName[j]];
                }
            }
        };

        if(!['SUPER_ADMIN','QC','MFG','GGG','ADMIN_LIST','ADMIN'].includes(GroupName.split('-')[0])){ //客製過濾 用不到的群組
            GroupName = GroupName.split('-')[0] //只顯示群組名
            $("#MMList").append(`<option id="MMoption" value="${GroupData.rows[i][MD_Maintain_Data.rows[0].MASTER_SID_FIELD]}">${GroupName}</option>`);
        }

    };
}

//綁定
function bind(master_sid) {
    $.ajax({
        type: 'POST',
        title: 'Unassigned',
        footer: '#S148122421380739_QUERY_ft',
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
        async: false,
        pagination: true,
        data: {
            ActionMode: '',
            MasterTable: MD_Maintain_Data.rows[0].MASTER_TABLE_NAME, //a.MASTER_TABLE_NAME
            DetailTable: MD_Maintain_Data.rows[0].RELATION_TABLE_NAME, // a.RELATION_TABLE_NAME
            SearchTable: MD_Maintain_Data.rows[0].DETAIL_TABLE_NAME, // a.DETAIL_TABLE_NAME
            MasterSIDField: MD_Maintain_Data.rows[0].MASTER_SID_FIELD, //a.MASTER_SID_FIELD
            DetailSIDField: MD_Maintain_Data.rows[0].RELATION_SID_FIELD, //a.RELATION_SID_FIELD
            SearchSIDField: MD_Maintain_Data.rows[0].DELAIL_SID_FIELD, // a.DELAIL_SID_FIELD
            RelationMasterSIDField: MD_Maintain_Data.rows[0].RELATION_MASTER_SID_FIELD, //a.RELATION_MASTER_SID_FIELD
            RelationDetailSIDField: MD_Maintain_Data.rows[0].RELATION_DETAIL_SID_FIELD, //a.RELATION_DETAIL_SID_FIELD
            SearchMasterSID: master_sid,
            operType: 'QueryDetail',
            UserName: 'ADMINV2',
            rows: '1000',
            page: '1',
            _search: false,
            COLUMNS: MD_Columns_Detail_ColName,// a.RELATION_TABLE_NAME+ '.' + a.RELATION_SID_FIELD + ,a.DETAIL_TABLE_NAME+ '.' + 'c.COL_NAME'
            defaultSort: ' order by ' + MD_Maintain_Data.rows[0].DETAIL_SORT_NAME + ' ' + MD_Maintain_Data.rows[0].DETAIL_SORT_ORDER // order by " + a.DETAIL_SORT_NAME + a.DETAIL_SORT_ORDER
        },
        singleSelect: true,
        multiSort: false,
        rownumbers: true,
        sortName: MD_Maintain_Data.rows[0].DETAIL_SORT_NAME, //a.DETAIL_SORT_NAME
        sortOrder: MD_Maintain_Data.rows[0].DETAIL_SORT_ORDER, //a.DETAIL_SORT_ORDER
        singleSelect: false,
        pageSize: parseInt(1000),
        pageList: [10],
        // columns: [[{ field: 'ck', checkbox: true }, { field: 'FUN_SID', hidden: true, title: 'FUN_SID', width: 100, align: 'right', sortable: true, }, { field: 'ETEXT', title: 'FUNCTION_NAME', width: 200, align: 'right', sortable: true, }, { field: 'NAVIGATEURL', title: 'NavigateUrl', width: 200, align: 'right', sortable: true, }, { field: 'EDIT_TIME', hidden: true, title: 'EDIT_TIME', width: 100, align: 'right', sortable: true, }
        // ]],
        success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg);
            jsonObj.rows = jsonObj.rows.filter((row)=>row.CUSTOM_TYPE === 'N' && row.ACCOUNT_NO != 'IT') // 過濾掉客戶 保留福盈人員
            GridData = jsonObj;
        }, error: function (msg) {
            var jsonObj = msg;
        }
    });

    var ENABLE_FLAG_Y = ''
    var BindData = [];
    for(var i=0 ;i<GridData.rows.length;i++){
        // ENABLE_FLAG_Y = '<input type="checkbox" id = "enable_flag_bind'+ enable_flag_num +'" name = "enable_flag_bind" value = "Y">'
        ENABLE_FLAG_Y = `<button class="btn c-btn text-secondary fw-bold hover-red" onclick="removePeople('${GridData.rows[i].GROUP_LIST_SID}')"><i class="fa-solid fa-user-xmark"></i></button>`
        for (var j = 0; j < MD_Columns_Detail_ColList.length; j++)
        {
            CurrentRow.push(GridData.rows[i][MD_Columns_Detail_ColList[j]]);
        }
        CurrentRow.push(ENABLE_FLAG_Y);
        BindData.push(CurrentRow);
        AllGridData.push([GridData.rows[i][MD_Maintain_Data.rows[0].RELATION_SID_FIELD],GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]]);
        FUN_SID_ORIGIN_BIND_LIST.push(GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]);
        FUN_SID_ALL_BIND_LIST.push(GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]);
        enable_flag_num++;
        CurrentRow = [];
        //FUN_SID_DEL_LIST.push([GridData.rows[i].GROUP_FUN_LIST_SID,GridData.rows[i].FUN_SID]);
    };
    
    for (var j = 0; j < MD_Columns_Detail_ColList.length; j++)
    {
        $("#trDT").append('<th>'+ GetLangDataV2(MD_Columns_Detail_ColList[j]) +'</th>');
    }
    $("#trDT").append(`<th id="checkbox-column" style="width:5%"></th>`);//操作欄

    //var BindDataTable = $('#MasterMaintainDetail').DataTable()
    //BindDataTable.rows.add(BindData).draw();
    //DetailTable.destroy();
    DetailTable = $('#MasterMaintainDetail').DataTable({
        data: BindData,
        dom:'rtlip',
        // searching: false,
        columnDefs: [{
            orderable:false,
            target:[3]
        }],
        initComplete: function() {
            $('#search-user').on('keyup change', function() {
                DetailTable.search(this.value).draw();
            });
        },
        drawCallback: function(){
            // getDel_List();
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
};

//未綁定(需與bind()一起使用)
function unbind(master_sid) {
    $.ajax({
        type: 'POST',
        title: 'Unassigned',
        footer: '#S148122421380739_QUERY_ft',
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
        async: false,
        pagination: true,
        data: {
            ActionMode: '',
            MasterTable: MD_Maintain_Data.rows[0].MASTER_TABLE_NAME, //a.MASTER_TABLE_NAME
            DetailTable: MD_Maintain_Data.rows[0].RELATION_TABLE_NAME, //a.RELATION_TABLE_NAME
            SearchTable: MD_Maintain_Data.rows[0].DETAIL_TABLE_NAME, // a.DETAIL_TABLE_NAME
            MasterSIDField: MD_Maintain_Data.rows[0].MASTER_SID_FIELD, //a.MASTER_SID_FIELD
            DetailSIDField: MD_Maintain_Data.rows[0].RELATION_SID_FIELD, //a.RELATION_SID_FIELD
            SearchSIDField: MD_Maintain_Data.rows[0].DELAIL_SID_FIELD, // a.DELAIL_SID_FIELD
            RelationMasterSIDField: MD_Maintain_Data.rows[0].RELATION_MASTER_SID_FIELD, //a.RELATION_MASTER_SID_FIELD
            RelationDetailSIDField: MD_Maintain_Data.rows[0].RELATION_DETAIL_SID_FIELD, //a.RELATION_DETAIL_SID_FIELD
            SearchMasterSID: master_sid,
            operType: 'QuerySearch',
            UserName: 'ADMINV2',
            rows: '1000',
            page: '1',
            _search: false,
            COLUMNS: MD_Columns_Search_Data, // d.COL_NAME
            defaultSort: ' order by ' + MD_Maintain_Data.rows[0].DETAIL_SORT_NAME + ' ' + MD_Maintain_Data.rows[0].DETAIL_SORT_ORDER // order by " + a.DETAIL_SORT_NAME + a.DETAIL_SORT_ORDER
        },
        singleSelect: true,
        multiSort: false,
        rownumbers: true,
        sortName: MD_Maintain_Data.rows[0].DETAIL_SORT_NAME, //a.DETAIL_SORT_NAME
        sortOrder: MD_Maintain_Data.rows[0].DETAIL_SORT_ORDER, //a.DETAIL_SORT_ORDER
        singleSelect: false,
        pageSize: parseInt(1000),
        pageList: [10],
        // columns: [[{ field: 'ck', checkbox: true }, { field: 'FUN_SID', hidden: true, title: 'FUN_SID', width: 100, align: 'right', sortable: true, }, { field: 'ETEXT', title: 'FUNCTION_NAME', width: 200, align: 'right', sortable: true, }, { field: 'NAVIGATEURL', title: 'NavigateUrl', width: 200, align: 'right', sortable: true, }, { field: 'EDIT_TIME', hidden: true, title: 'EDIT_TIME', width: 100, align: 'right', sortable: true, }
        // ]],
        success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg);
            jsonObj.rows = jsonObj.rows.filter((row)=>row.CUSTOM_TYPE === 'N' && row.ACCOUNT_NO != 'IT') // 過濾掉客戶 保留福盈人員
            GridData = jsonObj;
        }, error: function (msg) {
            var jsonObj = msg;
        }
    });

    // var ENABLE_FLAG_N = '<input type="checkbox" id = "enable_flag" name = "enable_flag" value = "N">';
    //var BindData = [];
    for(var i=0 ;i < GridData.rows.length;i++){
        for (var j = 0; j < MD_Columns_Detail_ColList.length; j++)
        {
            CurrentRow.push(GridData.rows[i][MD_Columns_Detail_ColList[j]]);
        }
        // ENABLE_FLAG_N = '<input type="checkbox" id = "enable_flag'+ enable_flag_num +'" name = "enable_flag" value = "N">'
        // CurrentRow.push(ENABLE_FLAG_N);
        //BindData.push([ENABLE_FLAG_N,GridData.rows[i].ETEXT,GridData.rows[i].NAVIGATEURL]);
        BindData.push(CurrentRow);
        AllGridData.push(["NoData",GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]]);
        // FUN_SID_UNBIND_LIST.push(GridData.rows[i].FUN_SID);
        enable_flag_num++;
        CurrentRow = [];
    };
    var BindDataTable = $('#MasterMaintainDetail').DataTable()
    BindDataTable.rows.add(BindData).draw();
};

//新增
function add(func_sid, master_sid) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
            data: 'MasterTable=' + MD_Maintain_Data.rows[0].MASTER_TABLE_NAME + '&DetailTable=' + MD_Maintain_Data.rows[0].RELATION_TABLE_NAME + '&SearchTable=' + MD_Maintain_Data.rows[0].DETAIL_TABLE_NAME //a.MASTER_TABLE_NAME , a.RELATION_TABLE_NAME ,a.DETAIL_TABLE_NAME
                + '&MasterSIDField=' + MD_Maintain_Data.rows[0].MASTER_SID_FIELD + '&DetailSIDField=' + MD_Maintain_Data.rows[0].RELATION_SID_FIELD + '&SearchSIDField=' + MD_Maintain_Data.rows[0].DELAIL_SID_FIELD //a.MASTER_SID_FIELD,a.RELATION_SID_FIELD,a.DELAIL_SID_FIELD
                + '&RelationMasterSIDField=' + MD_Maintain_Data.rows[0].RELATION_MASTER_SID_FIELD //a.RELATION_MASTER_SID_FIELD
                + '&RelationDetailSIDField=' + MD_Maintain_Data.rows[0].RELATION_DETAIL_SID_FIELD //a.RELATION_DETAIL_SID_FIELD
                + '&oper=add&DetailSids=' + func_sid + '&MasterSid=' + master_sid + '&UserName=' + 'ADMINV2',
            success: function (msg) {
                resolve(msg); // 成功時調用 resolve
            },
            error: function (msg) {
                reject(msg); // 失敗時調用 reject
            }
        });
    });
}

//刪除
function del(group_func_list_sid, master_sid) {
    $.ajax({
        type: "POST",
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
        data: 'MasterTable=' + MD_Maintain_Data.rows[0].MASTER_TABLE_NAME + '&DetailTable=' + MD_Maintain_Data.rows[0].RELATION_TABLE_NAME + '&SearchTable=' + MD_Maintain_Data.rows[0].DETAIL_TABLE_NAME //a.MASTER_TABLE_NAME , a.RELATION_TABLE_NAME ,a.DETAIL_TABLE_NAME
            + '&MasterSIDField=' + MD_Maintain_Data.rows[0].MASTER_SID_FIELD + '&DetailSIDField=' + MD_Maintain_Data.rows[0].RELATION_SID_FIELD + '&SearchSIDField=' + MD_Maintain_Data.rows[0].DELAIL_SID_FIELD //a.MASTER_SID_FIELD,a.RELATION_SID_FIELD,a.DELAIL_SID_FIELD
            + '&RelationMasterSIDField=' + MD_Maintain_Data.rows[0].RELATION_MASTER_SID_FIELD  //a.RELATION_MASTER_SID_FIELD
            + '&RelationDetailSIDField=' + MD_Maintain_Data.rows[0].RELATION_DETAIL_SID_FIELD //a.RELATION_DETAIL_SID_FIELD
            + '&oper=del&DeleteSids=' + group_func_list_sid + '&MasterSid=' + master_sid + '&UserName=' + 'ADMINV2',
        success: function (msg) {
            var jsonObj = msg;
        }, error: function (msg) {
            var jsonObj = msg;
        }
    })
};

//只有未綁定
function onlyUnbind(master_sid) {
    $.ajax({
        type: 'POST',
        title: 'Unassigned',
        footer: '#S148122421380739_QUERY_ft',
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
        async: false,
        pagination: true,
        data: {
            ActionMode: '',
            MasterTable: MD_Maintain_Data.rows[0].MASTER_TABLE_NAME, //a.MASTER_TABLE_NAME
            DetailTable: MD_Maintain_Data.rows[0].RELATION_TABLE_NAME, //a.RELATION_TABLE_NAME
            SearchTable: MD_Maintain_Data.rows[0].DETAIL_TABLE_NAME, // a.DETAIL_TABLE_NAME
            MasterSIDField: MD_Maintain_Data.rows[0].MASTER_SID_FIELD, //a.MASTER_SID_FIELD
            DetailSIDField: MD_Maintain_Data.rows[0].RELATION_SID_FIELD, //a.RELATION_SID_FIELD
            SearchSIDField: MD_Maintain_Data.rows[0].DELAIL_SID_FIELD, // a.DELAIL_SID_FIELD
            RelationMasterSIDField: MD_Maintain_Data.rows[0].RELATION_MASTER_SID_FIELD, //a.RELATION_MASTER_SID_FIELD
            RelationDetailSIDField: MD_Maintain_Data.rows[0].RELATION_DETAIL_SID_FIELD, //a.RELATION_DETAIL_SID_FIELD
            SearchMasterSID: master_sid,
            operType: 'QuerySearch',
            UserName: 'ADMINV2',
            rows: '1000',
            page: '1',
            _search: false,
            COLUMNS: MD_Columns_Detail_ColName, // d.COL_NAME
            defaultSort: ' order by ' + MD_Maintain_Data.rows[0].DETAIL_SORT_NAME + ' ' + MD_Maintain_Data.rows[0].DETAIL_SORT_ORDER // order by " + a.DETAIL_SORT_NAME + a.DETAIL_SORT_ORDER
        },
        singleSelect: true,
        multiSort: false,
        rownumbers: true,
        sortName: MD_Maintain_Data.rows[0].DETAIL_SORT_NAME, //a.DETAIL_SORT_NAME
        sortOrder: MD_Maintain_Data.rows[0].DETAIL_SORT_ORDER, //a.DETAIL_SORT_ORDER
        singleSelect: false,
        pageSize: parseInt(1000),
        pageList: [10],
        // columns: [[{ field: 'ck', checkbox: true }, { field: 'FUN_SID', hidden: true, title: 'FUN_SID', width: 100, align: 'right', sortable: true, }, { field: 'ETEXT', title: 'FUNCTION_NAME', width: 200, align: 'right', sortable: true, }, { field: 'NAVIGATEURL', title: 'NavigateUrl', width: 200, align: 'right', sortable: true, }, { field: 'EDIT_TIME', hidden: true, title: 'EDIT_TIME', width: 100, align: 'right', sortable: true, }
        // ]],
        success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg);
            jsonObj.rows = jsonObj.rows.filter((row)=>row.CUSTOM_TYPE === 'N' && row.ACCOUNT_NO != 'IT') // 過濾掉客戶 保留福盈人員
            GridData = jsonObj;
        }, error: function (msg) {
            var jsonObj = msg;
        }
    });

    // var ENABLE_FLAG_N = '<input type="checkbox" id = "enable_flag" name = "enable_flag" value = "N">';
    //var BindData = [];
    for(var i=0 ;i < GridData.rows.length;i++){

        for (var j = 0; j < MD_Columns_Detail_ColList.length; j++)
        {
            CurrentRow.push(GridData.rows[i][MD_Columns_Detail_ColList[j]]);
        }
        ENABLE_FLAG_N = '<input type="checkbox" id = "enable_flag'+ enable_flag_num +'" name = "enable_flag" value = "N">'
        CurrentRow.push(ENABLE_FLAG_N);
        BindData.push(CurrentRow);
        AllGridData.push(["NoData",GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]]);
        FUN_SID_UNBIND_LIST.push(GridData.rows[i][MD_Maintain_Data.rows[0].DELAIL_SID_FIELD]);
        enable_flag_num++;
        CurrentRow = [];
    };

    for (var j = 0; j < MD_Columns_Detail_ColList.length; j++)
    {
        $("#trDT_addPeople").append('<th>'+ GetLangDataV2(MD_Columns_Detail_ColList[j]) +'</th>');
    }
    $("#trDT_addPeople").append('<th>'+GetLangDataV2('Check Bind')+'</th>');

    addPeopleList = $('#addPeopleList').DataTable({
        data: BindData,
        dom:'rtlip',
        // searching: false,
        initComplete: function() {
            $('#search-user-add').on('keyup change', function() {
                addPeopleList.search(this.value).draw();
            });
        },
        drawCallback: function(){
            getAdd_List();
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
    //$("#progress,#loading").fadeOut(2000);
};

//取得已綁定功能清單 (顯示在主畫面)
function getBindDetailTable(){
    BindData = [];
    AllGridData = [];
    FUN_SID_ORIGIN_BIND_LIST = [];
    FUN_SID_ALL_BIND_LIST = [];
    FUN_SID_BIND_LIST = [];
    FUN_SID_UNBIND_LIST = [];
    FUN_SID_DEL_LIST = [];

    masterSID = $("#MMList").val();

    if(!masterSID) return //若沒有選擇主體，則中斷執行
    if(DetailTable) DetailTable.destroy();

    $('#MasterMaintainDetail').empty();
    $('#MasterMaintainDetail').append('<thead><tr id="trDT"></tr></thead>');
    bind(masterSID);
    enable_flag_num = 0;
    $("#progress,#loading").fadeOut(2000);
};

//取得未綁定功能清單 (顯示在"加入用戶"彈出頁)
function getUnbindDetailTable(){
    var label = '';
    BindData = [];
    AllGridData = [];
    FUN_SID_ORIGIN_BIND_LIST = [];
    FUN_SID_ALL_BIND_LIST = [];
    FUN_SID_BIND_LIST = [];
    FUN_SID_UNBIND_LIST = [];
    FUN_SID_DEL_LIST = [];

    masterSID = $("#MMList").val();

    if(!masterSID) return //若沒有選擇主體，則中斷執行
    if(addPeopleList) addPeopleList.destroy();

    $('#addPeopleList').empty();
    $('#addPeopleList').append('<thead><tr id="trDT_addPeople"></tr></thead>');
    //console.log("document_text:",optLabel);
    onlyUnbind(masterSID);
    enable_flag_num = 0;
    $("#progress,#loading").fadeOut(2000);
    //getCheckSID();
};

//組成欲新增的清單
function getAdd_List(){
    var checkGroup = $("input[name='enable_flag']");
    console.log(checkGroup)
    //var pageNum = document.getElementsByClassName('paginate_button current')[0].innerText;
    checkGroup.each(function(i){
        $(this).click(function(){
            var ArrayNum = Number(this.id.replace('enable_flag',''));
            if (this.checked == true){
                FUN_SID_ALL_BIND_LIST.push(AllGridData[ArrayNum][1]);
            }
            else
            {
                for(var j = 0; j < FUN_SID_ALL_BIND_LIST.length; j++)
                {
                    if (FUN_SID_ALL_BIND_LIST[j] == AllGridData[ArrayNum][1])
                    {
                        FUN_SID_ALL_BIND_LIST.splice(j,1);
                    }
                }
            }
            FUN_SID_BIND_LIST = FUN_SID_ALL_BIND_LIST.filter((e)=>{
                return FUN_SID_ORIGIN_BIND_LIST.indexOf(e) === -1;
            });
        });
    })
};

//儲存選擇結果
async function addPeople() {
    const yes = await customConfirm("確定要儲存設定嗎?");
    if (yes) {
        try {
            // 等待所有 add() 請求完成
            await Promise.all(FUN_SID_BIND_LIST.map(item => add(item, masterSID)));

            // 所有 add() 完成後才會執行
            getBindDetailTable();
            getUnbindDetailTable();
            $("#addPeopleModal").modal('hide');
        } catch (error) {
            console.error("An error occurred in addSave:", error);
            // 處理錯誤，例如顯示錯誤訊息
        }
    }
}


async function removePeople(GROUP_LIST_SID) {
    var yes = await customConfirm("確定要將用戶移除嗎?");
    if (yes) {
        del(GROUP_LIST_SID, masterSID);
        
        getBindDetailTable();
        getUnbindDetailTable();
    }
}

function GetLangDataV2(str){
    // 暫時沒有套用多語系
    return str
}