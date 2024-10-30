$(document).ready(function () {
    let allBindData = getAllBindData('342985347550285')
    console.log(allBindData)
    
    setFunctionList(allBindData)
})

//取得功能清單資料
function getAllBindData(master_sid) {
    let bindData,unbindData
    // 已綁定清單
    $.ajax({
        type: 'POST',
        title: 'Unassigned',
        footer: '#S362920901330737_QUERY_ft',
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
        async: false,
        pagination: true,
        data: {
            ActionMode: '',
            MasterTable: "SEC_USERGROUP", //a.MASTER_TABLE_NAME
            DetailTable: "SEC_USERGROUP_FUNCTION_LIST", // a.RELATION_TABLE_NAME
            SearchTable: "V_SEC_SITEMAP_EC", // a.DETAIL_TABLE_NAME
            MasterSIDField: "GROUP_SID", //a.MASTER_SID_FIELD
            DetailSIDField: "GROUP_FUN_LIST_SID", //a.RELATION_SID_FIELD
            SearchSIDField: "FUN_SID", // a.DELAIL_SID_FIELD
            RelationMasterSIDField: "GROUP_SID", //a.RELATION_MASTER_SID_FIELD
            RelationDetailSIDField: "FUN_SID", //a.RELATION_DETAIL_SID_FIELD
            SearchMasterSID: master_sid,
            operType: 'QueryDetail',
            UserName: 'ADMINV2',
            rows: '1000',
            page: '1',
            _search: false,
            COLUMNS: "SEC_USERGROUP_FUNCTION_LIST.GROUP_FUN_LIST_SID,V_SEC_SITEMAP_EC.FUN_SID,V_SEC_SITEMAP_EC.ETEXT,V_SEC_SITEMAP_EC.NAVIGATEURL,V_SEC_SITEMAP_EC.EDIT_TIME",// a.RELATION_TABLE_NAME+ '.' + a.RELATION_SID_FIELD + ,a.DETAIL_TABLE_NAME+ '.' + 'c.COL_NAME'
            defaultSort: ' order by EDIT_TIME Desc'
        },
        singleSelect: true,
        multiSort: false,
        rownumbers: true,
        sortName: "EDIT_TIME", //a.DETAIL_SORT_NAME
        sortOrder: "Desc", //a.DETAIL_SORT_ORDER
        singleSelect: false,
        pageSize: parseInt(1000),
        pageList: [10],
        success: function (msg) {
            let jsonObj = jQuery.parseJSON(msg);
            bindData = jsonObj.rows;
        }, error: function (msg) {
            let jsonObj = msg;
            console.log('error:',jsonObj)
        }
    });
    // 未綁定清單
    $.ajax({
        type: 'POST',
        title: 'Unassigned',
        footer: '#S148122421380739_QUERY_ft',
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterSet/MasterDetailMaintainDataHandle.ashx',
        async: false,
        pagination: true,
        data: {
            ActionMode: '',
            MasterTable: "SEC_USERGROUP", //a.MASTER_TABLE_NAME
            DetailTable: "SEC_USERGROUP_FUNCTION_LIST", // a.RELATION_TABLE_NAME
            SearchTable: "V_SEC_SITEMAP_EC", // a.DETAIL_TABLE_NAME
            MasterSIDField: "GROUP_SID", //a.MASTER_SID_FIELD
            DetailSIDField: "GROUP_FUN_LIST_SID", //a.RELATION_SID_FIELD
            SearchSIDField: "FUN_SID", // a.DELAIL_SID_FIELD
            RelationMasterSIDField: "GROUP_SID", //a.RELATION_MASTER_SID_FIELD
            RelationDetailSIDField: "FUN_SID", //a.RELATION_DETAIL_SID_FIELD
            SearchMasterSID: master_sid,
            operType: 'QuerySearch',
            UserName: 'ADMINV2',
            rows: '1000',
            page: '1',
            _search: false,
            COLUMNS: "GROUP_FUN_LIST_SID,GROUP_SID,FUN_SID,CREATE_USER,CREATE_TIME,EDIT_USER,EDIT_TIME,M_FLAG,D_FLAG", // d.COL_NAME
            defaultSort: ' order by EDIT_TIME Desc' // order by " + a.DETAIL_SORT_NAME + a.DETAIL_SORT_ORDER
        },
        singleSelect: true,
        multiSort: false,
        rownumbers: true,
        sortName: "EDIT_TIME", //a.DETAIL_SORT_NAME
        sortOrder: "Desc", //a.DETAIL_SORT_ORDER
        singleSelect: false,
        pageSize: parseInt(1000),
        pageList: [10],
        success: function (msg) {
            let jsonObj = jQuery.parseJSON(msg);
            unbindData = jsonObj.rows;
        }, error: function (msg) {
            let jsonObj = msg;
            console.log('error:',jsonObj)
        }
    });

    return [...bindData,...unbindData]
};

function setFunctionList(allBindData){
    //排序
    allBindData.sort((a, b) => {
        return a.EDIT_TIME.localeCompare(b.EDIT_TIME);
    });

    let functionListHtml = ''
    allBindData.forEach((fun,index) => {
        let FUN_SID = fun.FUN_SID
        let GROUP_FUN_LIST_SID = fun.GROUP_FUN_LIST_SID || ""
        let isBind = fun.GROUP_FUN_LIST_SID ? true : false;

        functionListHtml += `
            <div class="col-6 mb-2">
                <div class="form-check">
                    <input
                        class="form-check-input"
                        type="checkbox"
                        id="fun${index}"
                        data-fun-sid="${FUN_SID}"
                        data-group-fun-list-sid="${GROUP_FUN_LIST_SID}"
                        ${isBind ? 'checked' : ''}
                    >
                    <label class="form-check-label" for="fun${index}">
                        ${fun.ETEXT}
                    </label>
                </div>
            </div>
        `
    });

    $("#functionList").html(functionListHtml)
}