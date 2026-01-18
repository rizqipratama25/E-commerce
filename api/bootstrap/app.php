<?php

use App\Http\Middleware\RoleMiddleware;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Middleware\ValidatePostSize;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->use([
            TrustProxies::class,
            HandleCors::class,
            ValidatePostSize::class,
            EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation Error',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        // Handle Route Not Found
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                // Cek apakah ini Model Not Found (dari Route Model Binding)
                $previous = $e->getPrevious();

                if ($previous instanceof ModelNotFoundException) {
                    // Ambil nama model
                    $model = class_basename($previous->getModel());

                    return response()->json([
                        'success' => false,
                        'message' => 'Resource not found',
                        'error' => "{$model} not found with the given ID",
                    ], 404);
                }

                // Ini benar-benar Route Not Found
                return response()->json([
                    'success' => false,
                    'message' => 'Endpoint not found',
                    'error' => 'The requested endpoint does not exist',
                ], 404);
            }
        });

        // Handle Method Not Allowed
        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Method not allowed',
                    'error' => 'The HTTP method used is not allowed for this endpoint',
                ], 405);
            }
        });

        // Handle Authentication Error
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                    'error' => 'You must be authenticated to access this resource',
                ], 401);
            }
        });

        // Handle Authorization Error
        $exceptions->render(function (AuthorizationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden',
                    'error' => 'You do not have permission to access this resource',
                ], 403);
            }
        });

        // Handle Database Query Exception (Duplicate, Foreign Key, etc)
        $exceptions->render(function (QueryException $e, Request $request) {
            if ($request->is('api/*')) {
                $errorCode = $e->errorInfo[1] ?? null;

                // Duplicate Entry
                if ($errorCode == 1062) {
                    preg_match("/for key '(\w+)'/", $e->getMessage(), $matches);
                    $field = $matches[1] ?? 'field';

                    return response()->json([
                        'success' => false,
                        'message' => 'Duplicate Entry',
                        'error' => "The {$field} already exists in the database",
                    ], 409);
                }

                // Foreign Key Constraint
                if ($errorCode == 1451 || $errorCode == 1452) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Database Constraint Error',
                        'error' => 'Cannot perform this action due to related data',
                    ], 409);
                }

                // Generic Database Error
                return response()->json([
                    'success' => false,
                    'message' => 'Database Error',
                    'error' => config('app.debug') ? $e->getMessage() : 'A database error occurred',
                ], 500);
            }
        });
    })->create();
