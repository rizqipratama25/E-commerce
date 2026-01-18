<?php
    return [
        'admin_user_id' => (int) env('PLATFORM_ADMIN_USER_ID', 1),
        'fee_percent' => (float) env('PLATFORM_FEE_PERCENT', 5)
    ];