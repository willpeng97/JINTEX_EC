//準備參數
var productGridSID = '350919782130157'; //ZZ_PRODUCT_OVERVIEW
var productGrid;
var userDataSID = '350990892916491'; //SEC_USER
var userData;
var currentUser; //登入者資料

var currentFilteredProducts = [];
var itemsPerPage = 12;

var products = [];
var cartProducts = []
var formattedArray;

var subsidiary_code = localStorage.getItem('subsidiary_code') // 所選子公司

$('#searchInput').on('input', searchProducts);
$('#searchInput').on('keydown', handleSearchKeyPress);

$(document).ready(async function() {
  productGrid = await getGridDataV2(productGridSID)
  userData = await getGridDataV2(userDataSID)
  currentUser = userData.find(user => user.ORIGINAL_ACCOUNT_NO === localStorage.getItem(PROJECT_SAVE_NAME + '_BI_ORIGINAL_ACCOUNT_NO'))

  //載入公司選單
  switch(currentUser.ORDER_LEV){
    case 'Y': //同人下單
      var opts = []
      userData.forEach(co=>{
        if(currentUser.PMAA005 === co.PMAA005){
          opts.push(`<option data-address="${co.OOFB017.split(',')[0]}" data-receiver="${co.PMAJUA002}" value="${co.PMAA001}">${co.PMAAL004_A}</option>`)
        }
      })
      opts = Array.from(new Set(opts)).join(''); //去除重複項
      $("#select-subsidiary").html(opts);
      $("#select-subsidiary").change(function() {
        if(localStorage.getItem('cartProducts')){
          var yes = confirm('切換公司會清空購物車中的內容。確定要繼續嗎？');
          if (yes) {
            localStorage.removeItem('cartProducts')
            localStorage.setItem('subsidiary_code',$(this).val())
            localStorage.setItem('subsidiary_name',$(this).find("option:selected").text())
            $("#address").text($(this).find("option:selected").data('address'))
            $("#receiver").text($(this).find("option:selected").data('receiver'))

            loadProductsAndProceed();
          } else {
            $("#select-subsidiary").val(localStorage.getItem('subsidiary_code'))
          }
        }else{
          localStorage.setItem('subsidiary_code',$(this).val())
          localStorage.setItem('subsidiary_name',$(this).find("option:selected").text())
          $("#address").text($(this).find("option:selected").data('address'))
          $("#receiver").text($(this).find("option:selected").data('receiver'))
          loadProductsAndProceed();
        }

      })
      break;
    case 'N': //不同人下單
      $("#select-subsidiary").html(`<option value="${currentUser.PMAA001}">${currentUser.PMAAL004_A}</option>`)
      $("#address").text(currentUser.OOFB017.split(',')[0])
      $("#receiver").text(currentUser.PMAJUA002)
      break;
    default: //管理者
      var opts = []
      userData.forEach(co=>{
        if(co.PMAA005){
          opts.push(`<option data-address="${co.OOFB017.split(',')[0]}" data-receiver="${co.PMAJUA002}" value="${co.PMAA001}">${co.PMAAL004_A}</option>`)
        }
      })
      opts = Array.from(new Set(opts)).join(''); //去除重複項
      $("#select-subsidiary").html(opts);
      $("#select-subsidiary").change(function() {
        if(localStorage.getItem('cartProducts')){
          var yes = confirm('切換公司會清空購物車中的內容。確定要繼續嗎？');
          if (yes) {
            localStorage.removeItem('cartProducts')
            localStorage.setItem('subsidiary_code',$(this).val())
            localStorage.setItem('subsidiary_name',$(this).find("option:selected").text())
            $("#address").text($(this).find("option:selected").data('address'))
            $("#receiver").text($(this).find("option:selected").data('receiver'))

            loadProductsAndProceed();
          } else {
            $("#select-subsidiary").val(localStorage.getItem('subsidiary_code'))
          }
        }else{
          localStorage.setItem('subsidiary_code',$(this).val())
          localStorage.setItem('subsidiary_name',$(this).find("option:selected").text())
          $("#address").text($(this).find("option:selected").data('address'))
          $("#receiver").text($(this).find("option:selected").data('receiver'))
          loadProductsAndProceed();
        }

      })
      break;
  }

  // 將公司代碼存入session
  if(subsidiary_code){
    $('#select-subsidiary').val(subsidiary_code)
    $("#address").text($('#select-subsidiary').find("option:selected").data('address'))
    $("#receiver").text($('#select-subsidiary').find("option:selected").data('receiver'))
  }else{
    localStorage.setItem('subsidiary_code',$('#select-subsidiary option:first').val())
    localStorage.setItem('subsidiary_name',$('#select-subsidiary').find("option:selected").text())
    $('#select-subsidiary').val($('#select-subsidiary option:first').val())
    $("#address").text($('#select-subsidiary').find("option:selected").data('address'))
    $("#receiver").text($('#select-subsidiary').find("option:selected").data('receiver'))
  }
  // 產生商品一覽
  loadProductsAndProceed();
});

function loadProductsAndProceed() {
  products = productGrid.filter((item)=>{
    return item.PMAO001 === localStorage.getItem('subsidiary_code')
  })

  formattedArray = products.map(function(item) {
    return {
      sid: item.ZZ_PRODUCT_OVERVIEW_SID,
      item: item.CUSTOMER_ITEM_NO,
      name: item.ITEM_NATIVE_NAME,
      name_en: item.ITEM_ENG_NAME,
      unit: item.WEIGHT,
      price: item.PRICE||1,
    };
  });

  // 從本地存儲中檢索購物車數據
  var cartProductsJSON = localStorage.getItem('cartProducts');
  cartProducts = cartProductsJSON ? JSON.parse(cartProductsJSON) : [];

  // 根據需要使用 cartProducts
  updateCartItemCount(cartProducts);// 更新購物車商品數量
  displayProducts(1, formattedArray);// 顯示產品
  generatePaginationLinks(formattedArray);// 生成分頁
}

function updateCartItemCount(cartProducts) {
  $('#cartItemCount').text(cartProducts.length)
  // var totalQuantity = cartProducts.reduce(function (acc, product) {
  //   return acc + product.quantity;
  // }, 0);

  // cartItemCount.text(totalQuantity);
}

function addToCart(ZZ_PRODUCT_OVERVIEW_SID) {
  var selectedProduct = products.find(product => product.ZZ_PRODUCT_OVERVIEW_SID == ZZ_PRODUCT_OVERVIEW_SID);

  var quantityInput = $(`#quantity-${ZZ_PRODUCT_OVERVIEW_SID}`);
  var quantity = parseInt(quantityInput.val());

  if(quantity % selectedProduct.WEIGHT > 0){
    var yes = confirm('所選數量非整數桶包裝，仍要繼續嗎?')
    if(!yes) return
  }

  if (quantity > 0) {
    var existingProduct = cartProducts.find(product => product.sid === selectedProduct.ZZ_PRODUCT_OVERVIEW_SID);

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cartProducts.push({
        sid: selectedProduct.ZZ_PRODUCT_OVERVIEW_SID,
        item: selectedProduct.CUSTOMER_ITEM_NO,
        name: selectedProduct.ITEM_NATIVE_NAME,
        name_en: selectedProduct.ITEM_ENG_NAME,
        unit: selectedProduct.WEIGHT,
        price: selectedProduct.PRICE||1,
        quantity: quantity
      });
    }

    var cartProductsUpdatedJSON = JSON.stringify(cartProducts);
    localStorage.setItem('cartProducts', cartProductsUpdatedJSON);

    quantityInput.val(0);
    // quantityInput.next().text(`(已購: ${existingProduct ? existingProduct.quantity : quantity} kg)`)
    quantityInput.next().text(`(滿桶: ${existingProduct ? parseInt(existingProduct.quantity / existingProduct.unit) : parseInt(quantity / selectedProduct.WEIGHT)} 桶 / 未滿桶:${existingProduct ? existingProduct.quantity % existingProduct.unit : quantity % selectedProduct.WEIGHT} kg)`)
    updateCartItemCount(cartProducts);

    $('#addToCartModal').modal('show');
  } else {
    $('#quantityWarning').modal('show');
  }
}

function searchProducts() {
  var searchTerm = $('#searchInput').val().toLowerCase();

  var filteredProducts = searchTerm
    ? products.filter(product => product.ITEM_ENG_NAME.toLowerCase().includes(searchTerm)||product.ITEM_NATIVE_NAME.toLowerCase().includes(searchTerm))
    : products;

  formattedArray = filteredProducts.map(function(item) {
    return {
      sid: item.ZZ_PRODUCT_OVERVIEW_SID,
      item: item.CUSTOMER_ITEM_NO,
      name: item.ITEM_NATIVE_NAME,
      name_en: item.ITEM_ENG_NAME,
      unit: item.WEIGHT,
      price: item.PRICE||1,
    };
  });

  displayProducts(1, Array.from(formattedArray));
  generatePaginationLinks(Array.from(formattedArray));

  currentFilteredProducts = Array.from(formattedArray);
}

function generatePaginationLinks(productsToDisplay) {
  var paginationContainer = $('#pagination');
  paginationContainer.empty();

  var totalPages = Math.ceil(productsToDisplay.length / itemsPerPage);

  for (var i = 1; i <= totalPages; i++) {
    var liClass = i === 1 ? 'page-item active' : 'page-item';
    var pageLink = `<a class="page-link" href="#" onclick="changePage(${i}, event)">${i}</a>`;
    var liElement = `<li class="${liClass}">${pageLink}</li>`;
    paginationContainer.append(liElement);
  }
}

function updatePagination(productsToDisplay) {
  // 使用新數組更新 currentFilteredProducts
  currentFilteredProducts = productsToDisplay;

  generatePaginationLinks(productsToDisplay);
}

function displayProducts(pageNumber, productsToDisplay) {
  var startIndex = (pageNumber - 1) * itemsPerPage;
  var endIndex = startIndex + itemsPerPage;

  // 確保 productsToDisplay 是可迭代的
  var productsArray = typeof productsToDisplay[Symbol.iterator] === 'function'
    ? productsToDisplay
    : [productsToDisplay];

  // 在數組上使用 slice
  var currentPageProducts = productsArray.slice(startIndex, endIndex);
  var productsContainer = $('#products');
  productsContainer.empty();

  currentPageProducts.forEach(function(product) {
    var existingProduct = cartProducts.find(e => e.sid == product.sid) || {"quantity":0};

    var productHtml = `
      <tr>
      <td>${product.name_en}</td>
      <td>${product.name}</td>
      <td>${product.unit}kg</td>
      <td>
        <label for="quantity-${product.sid}">
          <input type="number" class="text-center" style="width:5rem" id="quantity-${product.sid}" value="0" min="0" step="${product.unit}" onfocus="removeZero(this)" onblur="showZero(this)">
          <div class="fw-light p-0" id="purchased-${product.sid}">(滿桶: ${parseInt(existingProduct.quantity / product.unit)} 桶 / 未滿桶:${existingProduct.quantity % product.unit} kg)</div>
        </label>
      </td>
      <td>
        <button onclick="addToCart('${product.sid}')" class="btn btn-primary">加入</button>
      </td>
      </tr>
    `;
    productsContainer.append(productHtml);
  });
  updatePagination(productsToDisplay);
}

function changePage(pageNumber, event) {
  if (event) {
    event.preventDefault();
  }

  displayProducts(pageNumber, currentFilteredProducts);
  $('#pagination li').removeClass('active');
  $('#pagination li:nth-child(' + pageNumber + ')').addClass('active');
}

function handleSearchKeyPress(event) {
  if (event && event.key === 'Enter') {
    if (event.preventDefault) {
      event.preventDefault();
    }
    searchProducts();
  }
}

function removeZero(item){
  if (item.value === '0') {
    item.value = '';
  }
}
function showZero(item){
  if (item.value === '') {
    item.value = '0';
  }
}
// getGridDataV2('350990892916491');

function changeAddress(){
  $("#changeAddressModal").modal('show')
}