<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'xendit' => [
        'secret_key' => env('XENDIT_SECRET_KEY'),
        'webhook_token' => env('XENDIT_WEBHOOK_TOKEN'),
        'base_url' => env('XENDIT_BASE_URL', 'https://api.xendit.co'),
        'success_redirect_url' => env('XENDIT_SUCCESS_REDIRECT_URL', 'http://localhost:5173/payment/success'),
        'failure_redirect_url' => env('XENDIT_FAILURE_REDIRECT_URL', 'http://localhost:5173/payment/failed'),
        'invoice_duration_seconds' => env('XENDIT_INVOICE_DURATION_SECONDS', 7200),
    ],

    'midtrans' => [
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'client_key' => env('MIDTRANS_CLIENT_KEY'),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
        'snap_url' => env('MIDTRANS_SNAP_URL', 'https://app.sandbox.midtrans.com/snap/v1/transactions'),
        'finish_url' => env('MIDTRANS_FINISH_URL', 'http://localhost:5173/menu/riwayat-transaksi'),
        'unfinish_url' => env('MIDTRANS_UNFINISH_URL', 'http://localhost:5173/checkout'),
        'error_url' => env('MIDTRANS_ERROR_URL', 'http://localhost:5173/checkout'),
    ],

];
