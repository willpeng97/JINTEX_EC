//準備API參數
var orderDetailGridSID = '356095609733132'; // V_ZZ_BTB_ORDER_V_BODY
var orderDetailGrid;

// URL取參
var currentURL = new URL(window.location.href);
var URLparams = new URLSearchParams(currentURL.search);
var ORDER_NUMBER = URLparams.get('order');
var XMDADOCNO = URLparams.get('erp');
$("#ec-no").text(ORDER_NUMBER)
$("#erp-no").text(XMDADOCNO)

async function fetchData() {
  orderDetailGrid = await getGridDataOrderDetail(orderDetailGridSID,XMDADOCNO)
  displayCartProducts(orderDetailGrid);
};
fetchData()

// Function to display cart products, update total items, and calculate total price
function displayCartProducts(orderDetailGrid) {
  // Clear the previous content
  $('#cartProducts').empty();

  orderDetailGrid.forEach(function (detail) {
    var productHtml = `
      <tr>
        <td>${detail.XMDADOCDT}</td>
        <td>${detail.XMDDSEQ}</td>
        <td>${detail.PMAO009}</td>
        <td>${detail.PMAO010}</td>
        <td>${detail.XMDD005}kg</td>
        <td>${detail.XMDD011}</td>
        <td>${detail.XMDD014}kg</td>
        <td>${detail.SUTS}</td>
        <td>
          ${detail.IS_CANCEL_REQUEST === 'Y'
            ? "已申請取消"
            : detail.SUTS === '已出貨' || detail.XMDA007 !== 'A0'
            ? ""
            : `<button class="w-100 m-0" style="height:1.8rem !important" onclick="cancelErpBody('${detail.ZZ_BTB_ORDER_V_SID}')">申請取消</button>`
          }
        </td>
      </tr>
    `;
    $('#cartProducts').append(productHtml);
  });

  // Update the total number of items
  $('#totalItems').text(getTotalItems(orderDetailGrid));
}

// Function to get the total number of items in the cart
function getTotalItems(products) {
  return products.reduce(function (acc, product) {
    return acc + parseInt(product.XMDD005);
  }, 0);
}

function getGridDataOrderDetail(SID,XMDADOCNO) {
  return new Promise((resolve, reject) => {
      // 定义 GetGrid API 的 URL
      let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetData';

      // 定义查詢条件参数对象
      let conditions = {
          Field: ["XMDADOCNO"],
          Oper: ["="],
          Value: [XMDADOCNO]
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
                  // Set_Clean();
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

function cancelErpBody(ZZ_BTB_ORDER_V_SID){
  let yes = confirm("確定要申請取消嗎?")
  if(yes){
    let body = {
      "ZZ_BTB_ORDER_V_SID": ZZ_BTB_ORDER_V_SID,
      "LOGIN_USER": localStorage.getItem(PROJECT_SAVE_NAME+'_BI_ORIGINAL_ACCOUNT_NO')
    };
  
    $.ajax({
        url: window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/DELETE_ERP',
        type: 'DELETE',
        data: JSON.stringify(body), // 将body对象转换为JSON字符串
        dataType: 'json',
        contentType: 'application/json',
        headers: {
          'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'), // 替換為你的自訂Header
        },
        success: function(response) {
          // alert('取消申請已送出!')
          location.reload()
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.error('Error:', textStatus, errorThrown);
          location.reload()
        }
    });
  }
}