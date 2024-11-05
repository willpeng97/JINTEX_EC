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
      let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/ZZ_GetGrid';

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