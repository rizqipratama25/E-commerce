<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Wallet;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\Request;

class DashboardAdminController extends Controller
{
    use ApiResponse;

    public function summary(Request $request)
    {
        try {
            $user = $request->user();

            return $this->successResponse([
                'total_partner' => User::where('role', 'Partner')->count(),
                'product_active'  => Product::where('is_active', true)->count(),
                'order' => Order::where('status', 'shipping')->count(),
                'wallet' => Wallet::where('user_id', $user->id)->firstOrFail()->balance,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve summary", 500, $e->getMessage());
        }
    }
}
