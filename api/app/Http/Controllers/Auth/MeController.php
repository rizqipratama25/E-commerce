<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\UnauthorizedException;

class MeController extends Controller
{
    use ApiResponse;

    public function me(Request $request) {
        try {
            if (!$request->user()) {
                return $this->unauthorizedResponse('Unauthorized');
            }

            return $this->successResponse($request->user(), 'User data retrieved successfully');
        } catch (Exception $e) {
            return $this->errorResponse('Failed to retrieve user data', 500, $e->getMessage());
        }
    }
}
