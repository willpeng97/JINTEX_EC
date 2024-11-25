//準備API參數
var orderDetailGridSID = '351521969063605'; //V_ZZ_ORDER_RECORD_DETAIL
var orderDetailGrid;
var cartProducts;

// URL取參
var currentURL = new URL(window.location.href);
var URLparams = new URLSearchParams(currentURL.search);
var ORDER_NUMBER = URLparams.get('order');
var ZZ_ORDER_RECORD_SID = URLparams.get('sid');

async function fetchData() {
  orderDetailGrid = await getGridDataOrderDetail(orderDetailGridSID,ZZ_ORDER_RECORD_SID)

  //組table資料
  cartProducts = orderDetailGrid.map(function(detail) {
    return {
      sid: detail.ZZ_PRODUCT_OVERVIEW_SID,
      item: detail.CUSTOMER_ITEM_NO,
      name: detail.ITEM_NATIVE_NAME,
      name_en: detail.ITEM_ENG_NAME,
      unit: detail.WEIGHT,
      price: detail.PRICE||1,
      quantity: detail.QUANTITY_ORDERED,
      INVAIL_FLAG: detail.INVAIL_FLAG,
      deliveryDate: detail.DELIVERY_DATE.split('T')[0],
      SUTS: detail.SUTS,
    };
  });
  displayCartProducts();

  //判斷是否已列印
  if(orderDetailGrid[0].EXPORT_LOCK_FLAG === 'Y'){
    $('#cancelBtn').hide()
    $('#editBtn').hide()
    // $('td button').css('visibility', 'hidden');
    $('td button').attr("disabled",true)
  }else{
    $('.ERP_SUTS').remove()
  }
};
fetchData()

// Function to display cart products, update total items, and calculate total price
function displayCartProducts() {
  // Clear the previous content
  $('#cartProducts').empty();

  // 在数据加载完成后执行其他逻辑
  cartProducts.forEach(function (cartProduct) {
    // var productHtml = `
    //   <tr style="height:1.5rem">
    //     <td>${cartProduct.deliveryDate}</td>
    //     <td>${cartProduct.name_en}</td>
    //     <td>${cartProduct.name}</td>
    //     <td>${cartProduct.quantity}kg</td>
    //     <td class="text-end">$${formatNumber(cartProduct.quantity * cartProduct.price)}</td>
    //   </tr>
    // `;
    var productHtml = `
      <tr style="height:1.5rem">
        <td>${cartProduct.deliveryDate}</td>
        <td>${cartProduct.name_en}</td>
        <td>${cartProduct.name}</td>
        <td>${cartProduct.quantity}kg</td>
        <td class="ERP_SUTS">${cartProduct.SUTS}</td>
      </tr>
    `;
    $('#cartProducts').append(productHtml);
  });


  // Update the total number of items
  $('#totalItems').text(getTotalItems(cartProducts));

  // Calculate the total price of items in the cart
  // var total = getTotalPrice(cartProducts);

  // Update the total price display
  // $('#totalPrice').text(formatNumber(total));
}

// Function to get the total number of items in the cart
function getTotalItems(products) {
  return products.reduce(function (acc, product) {
    return acc + product.quantity;
  }, 0);
}

// Function to calculate the total price of items in the cart
function getTotalPrice(products) {
  return products.reduce(function (acc, product) {
    return acc + product.price * product.quantity;
  }, 0);
}

function getGridDataOrderDetail(SID,ZZ_ORDER_RECORD_SID) {
  return new Promise((resolve, reject) => {
      // 定义 GetGrid API 的 URL
      let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetData';

      // 定义查詢条件参数对象
      let conditions = {
          Field: ["ZZ_ORDER_RECORD_SID","INVAIL_FLAG"],
          Oper: ["=","="],
          Value: [ZZ_ORDER_RECORD_SID,"N"]
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