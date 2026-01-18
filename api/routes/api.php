<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\MeController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CategoryProductController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\DashboardAdminController;
use App\Http\Controllers\DashboardPartnerController;
use App\Http\Controllers\DistrictController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PartnerAddressController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\Payment\MidtransWebhookController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductImageController;
use App\Http\Controllers\ProvinceController;
use App\Http\Controllers\ShippingServiceController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\UrbanVillageController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\Xendit\XenditWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Publik
Route::apiResource('/categories', CategoryController::class)->only('index');
Route::get('/categories/resolve/{path}', [CategoryController::class, 'resolve'])->where('path', '.*');

Route::apiResource('/products', ProductController::class)->only(['index', 'show']);
Route::get('/c/products/{path}', [CategoryProductController::class, 'index'])->where('path', '.*');

Route::apiResource('/statuses', StatusController::class)->only(['index']);
Route::apiResource('/provinces', ProvinceController::class)->only(['index']);
Route::apiResource('/cities', CityController::class)->only(['index']);
Route::apiResource('/districts', DistrictController::class)->only(['index']);
Route::apiResource('/urban-villages', UrbanVillageController::class)->only(['index']);
Route::apiResource('/shipping-services', ShippingServiceController::class)->only(['index', 'show']);

Route::apiResource('/partners', PartnerController::class)->only(['index']);

Route::post('/payments/midtrans/webhook', [MidtransWebhookController::class, 'handle']);

// Auth
Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [MeController::class, 'me']);
        Route::post('/logout', [LogoutController::class, 'logout']);
    });
});

Route::middleware(['auth:sanctum', 'role:Buyer'])->group(function () {
    Route::apiResource('/addresses', AddressController::class)->except(['show']);

    Route::post('/checkout/buy-now', [CheckoutController::class, 'buyNow']);
    Route::post('/checkout/from-cart', [CheckoutController::class, 'fromCart']);
    Route::get('/checkout/{checkoutId}', [CheckoutController::class, 'show']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders/from-checkout', [OrderController::class, 'fromCheckout']);
    Route::post('/orders/{order}/complete', [OrderController::class, 'completedByBuyer']);

    Route::post('/orders/{order}/pay', [OrderController::class, 'payWithMidtrans']);
    Route::get('/orders/{order}/payment', [OrderController::class, 'paymentInfo']);
    Route::get('/orders/{order}/summary', [OrderController::class, 'summary']);
    Route::post('/order-items/{orderItem}/receive', [OrderController::class, 'receiveItemByBuyer']);

    Route::post('/orders/{order}/pay/va', [OrderController::class, 'payVA']);     // pilih bank VA
    Route::post('/orders/{order}/pay/qris', [OrderController::class, 'payQRIS']); // generate QR
    
    Route::post('/cart/items', [CartController::class, 'store']);
    Route::put('/cart/items/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/items/{cartItem}', [CartController::class, 'destroy']);
    Route::get('/cart', [CartController::class, 'index']);
    Route::get('/cart/mini', [CartController::class, 'mini']);
    Route::delete('/cart', [CartController::class, 'clear']);
});

Route::middleware(['auth:sanctum', 'role:Admin'])->group(function () {
    Route::apiResource('/partners', PartnerController::class)->only(['store', 'destroy']);
    Route::apiResource('/statuses', StatusController::class)->only(['store', 'update', 'destroy']);
    Route::apiResource('/categories', CategoryController::class)->only(['store', 'update', 'destroy']);
    Route::get('/admin/categories', [CategoryController::class, 'indexAdmin']);
    Route::apiResource('/provinces', ProvinceController::class)->only(['store', 'update', 'destroy']);
    Route::apiResource('/cities', CityController::class)->only(['store', 'update', 'destroy']);
    Route::apiResource('/districts', DistrictController::class)->only(['store', 'update', 'destroy']);
    Route::apiResource('/urban-villages', UrbanVillageController::class)->only(['store', 'update', 'destroy']);
    Route::apiResource('/shipping-services', ShippingServiceController::class)->only(['store', 'update', 'destroy']);

    Route::get('/admin/orders', [OrderController::class, 'indexAdmin']);

    Route::post('/orders/{order}/complete/a', [OrderController::class, 'completedByAdmin']);

    Route::get('/admin/summary', [DashboardAdminController::class, 'summary']);

    Route::post('/admin/shipments/{shipment}/delivered', [OrderController::class, 'deliveredShipmentByAdmin']);
});

Route::middleware(['auth:sanctum', 'role:Partner'])->group(function () {
    Route::apiResource('/products', ProductController::class)->only(['store', 'destroy']);
    Route::put('/products/{product:slug}', [ProductController::class, 'update']);
    Route::get('/partner/products', [ProductController::class, 'indexPartner']);
    Route::apiResource('/product-image', ProductImageController::class)->only('store');

    Route::get('/partner/address', [PartnerAddressController::class, 'show']);
    Route::put('/partner/address', [PartnerAddressController::class, 'update']);

    Route::get('/partner/orders', [OrderController::class, 'indexPartner']);
    Route::post('/orders/{order}/complete/p', [OrderController::class, 'completedByPartner']);

    Route::get('/partner/summary', [DashboardPartnerController::class, 'summary']);

    Route::post('/partner/shipments/{shipment}/ship', [OrderController::class, 'shipByPartner']);
});
