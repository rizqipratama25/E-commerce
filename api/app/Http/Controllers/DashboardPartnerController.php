<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Wallet;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\Request;

class DashboardPartnerController extends Controller
{
    use ApiResponse;

    public function summary(Request $request)
    {
        try {
            $user = $request->user();

            $order = Order::whereHas('orderItems.product', function ($q) use ($user) {
                $q->where('partner_id', $user->id);
            })->count();

            $orderToday = Order::whereHas('orderItems.product', function ($q) use ($user) {
                $q->where('partner_id', $user->id);
            })->whereDate('paid_at', today())->count();

            return $this->successResponse([
                'order_today' => $orderToday,
                'order' => $order,
                'wallet' => Wallet::where('user_id', $user->id)->firstOrFail()->balance,
                'product_active'  => Product::where('partner_id', $user->id)->where('is_active', true)->count(),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve summary", 500, $e->getMessage());
        }
    }
}
