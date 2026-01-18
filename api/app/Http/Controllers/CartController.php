<?php

namespace App\Http\Controllers;

use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $cart = $this->getOrCreateActiveCart($request->user()->id);

            $cart->load([
                'items.product.thumbnail',
            ]);

            return $this->successResponse(new CartResource($cart), "Cart retrieved successfully");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve cart", 500, $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'qty' => ['required', 'integer', 'min:1'],
        ]);

        $userId = $request->user()->id;

        try {
            $resultCart = DB::transaction(function () use ($data, $userId) {
                $cart = $this->getOrCreateActiveCart($userId);

                $product = Product::query()
                    ->where('id', $data['product_id'])
                    ->where('is_active', true)
                    ->whereNull('deleted_at')
                    ->lockForUpdate()
                    ->first();

                if (!$product) {
                    abort(404, "Product not found or inactive");
                }

                // cek stok
                if ($product->stock < $data['qty']) {
                    abort(422, "Stock is not enough");
                }

                // upsert item
                $item = CartItem::query()
                    ->where('cart_id', $cart->id)
                    ->where('product_id', $product->id)
                    ->lockForUpdate()
                    ->first();

                if ($item) {
                    $newQty = $item->qty + (int) $data['qty'];
                    if ($newQty > $product->stock) {
                        abort(422, "Stock is not enough for requested quantity");
                    }

                    $item->update([
                        'qty' => $newQty,
                        'price_snapshot' => $item->price_snapshot ?? $product->price,
                    ]);
                } else {
                    CartItem::create([
                        'cart_id' => $cart->id,
                        'product_id' => $product->id,
                        'qty' => (int) $data['qty'],
                        'price_snapshot' => $product->price,
                    ]);
                }

                $cart->load(['items.product.thumbnail']);
                return $cart;
            });

            return $this->successResponse(new CartResource($resultCart), "Item added to cart");
        } catch (Exception $e) {
            // abort(422/404) akan jadi HttpException, tapi karena kamu pakai try-catch umum,
            // kita balikin 500 kalau message bukan dari abort.
            // Kalau kamu mau presisi, kita bisa refine catch HttpException.
            return $this->errorResponse("Failed to add item", 500, $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(CartItem $cartItem)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CartItem $cartItem)
    {
        $data = $request->validate([
            'qty' => ['sometimes', 'integer', 'min:1'],
            'note' => ['sometimes', 'nullable', 'string', 'max:140'],
        ]);

        $userId = $request->user()->id;

        try {
            $resultCart = DB::transaction(function () use ($data, $userId, $cartItem) {
                $cart = $this->getOrCreateActiveCart($userId);

                if ((int) $cartItem->cart_id !== (int) $cart->id) {
                    abort(404, "Cart item not found");
                }

                if (array_key_exists('qty', $data)) {
                    $product = Product::query()
                        ->where('id', $cartItem->product_id)
                        ->where('is_active', true)
                        ->whereNull('deleted_at')
                        ->lockForUpdate()
                        ->first();

                    if (!$product) abort(404, "Product not found or inactive");

                    $qty = (int) $data['qty'];
                    if ($qty > $product->stock) abort(422, "Stock is not enough");

                    $cartItem->update([
                        'qty' => $qty,
                        'price_snapshot' => $cartItem->price_snapshot ?? $product->price,
                    ]);
                }

                if (array_key_exists('note', $data)) {
                    $cartItem->update([
                        'note' => $data['note'],
                    ]);
                }

                $cart->load(['items.product.thumbnail']);
                return $cart;
            });

            return $this->successResponse(new CartResource($resultCart), "Cart item updated");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to update item", 500, $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, CartItem $cartItem)
    {
        $userId = $request->user()->id;

        try {
            $cart = $this->getOrCreateActiveCart($userId);

            if ((int)$cartItem->cart_id !== (int)$cart->id) {
                return $this->notFoundResponse("Cart item not found");
            }

            $cartItem->delete();

            $cart->load(['items.product.thumbnail']);
            return $this->successResponse(new CartResource($cart), "Cart item deleted");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to delete item", 500, $e->getMessage());
        }
    }

    public function clear(Request $request)
    {
        $userId = $request->user()->id;

        try {
            $cart = $this->getOrCreateActiveCart($userId);

            CartItem::query()
                ->where('cart_id', $cart->id)
                ->delete();

            $cart->load(['items.product.thumbnail']);
            return $this->successResponse(new CartResource($cart), "Cart cleared");
        } catch (Exception $e) {
            return $this->errorResponse("Failed to clear cart", 500, $e->getMessage());
        }
    }

    public function mini(Request $request)
    {
        try {
            $limit = (int) $request->query('limit', 3);
            $limit = max(1, min(10, $limit));

            $cart = $this->getOrCreateActiveCart($request->user()->id);

            $items = $cart->items()
                ->with(['product.thumbnail'])
                ->latest()
                ->take($limit)
                ->get();

            $totalQty = (int) $cart->items()->sum('qty');

            $subtotal = 0;
            $mapped = $items->map(function ($item) use (&$subtotal) {
                $price = (float) ($item->price_snapshot ?? ($item->product?->price ?? 0));
                $lineTotal = $price * (int) $item->qty;
                $subtotal += $lineTotal;

                return [
                    'id' => $item->id,
                    'qty' => (int) $item->qty,
                    'note' => $item->note,
                    'price' => number_format($price, 2, '.', ''),
                    'line_total' => number_format($lineTotal, 2, '.', ''),
                    'product' => $item->product ? [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'slug' => $item->product->slug,
                        'thumbnail' => $item->product->thumbnail ? [
                            'id' => $item->product->thumbnail->id,
                            'image' => $item->product->thumbnail->image,
                        ] : null,
                    ] : null,
                ];
            })->values();

            return $this->successResponse([
                'cart_id' => $cart->id,
                'total_qty' => $totalQty,
                'items' => $mapped,
                'subtotal' => number_format((float) $subtotal, 2, '.', ''),
            ], 'Mini cart retrieved successfully');
        } catch (Exception $e) {
            return $this->errorResponse("Failed to retrieve mini cart", 500, $e->getMessage());
        }
    }

    private function getOrCreateActiveCart(int $userId): Cart
    {
        return Cart::query()
            ->active()
            ->where('user_id', $userId)
            ->firstOrCreate([
                'user_id' => $userId,
                'status' => 'active',
            ]);
    }
}
