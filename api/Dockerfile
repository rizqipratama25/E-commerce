FROM php:8.4-fpm as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libicu-dev \
    libxml2-dev \
    pkg-config \
    postgresql-client \
    libpq-dev \
    git \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1

# Install PHP extensions including sockets
RUN docker-php-ext-install \
    pdo \
    pgsql \
    pdo_pgsql \
    gd \
    bcmath \
    zip \
    intl \
    soap \
    exif \
    pcntl \
    sockets \
    && pecl install redis swoole \
    && docker-php-ext-enable redis swoole

# ============================================
# Stage: Composer dependencies
# ============================================
FROM base as composer-deps

WORKDIR /usr/share/nginx/html/

COPY composer.json composer.lock ./

RUN composer install \
    --ignore-platform-req=php \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist

# ============================================
# Stage: Final application
# ============================================
FROM base as final

# Install Node.js for asset building
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/share/nginx/html/

# Copy vendor from composer-deps stage
COPY --from=composer-deps /usr/share/nginx/html/vendor ./vendor

# Copy application files
COPY . ./

# Remove any existing storage symlink
RUN rm -f public/storage

# Finalize composer
RUN composer dump-autoload --optimize --no-dev \
    && composer clear-cache

# Install Octane
RUN composer require laravel/octane --with-all-dependencies \
    && php artisan octane:install --server="swoole" --no-interaction

# Discover packages
RUN php artisan package:discover --ansi

# Setup storage and permissions
RUN mkdir -p \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache/data \
    storage/logs \
    storage/app/public \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Copy and setup entrypoint
COPY ./scripts/php-fpm-entrypoint /usr/local/bin/php-entrypoint
RUN chmod +x /usr/local/bin/php-entrypoint

ENTRYPOINT ["/usr/local/bin/php-entrypoint"]

CMD ["php", "artisan", "octane:start", "--server=swoole", "--host=0.0.0.0", "--port=9000"]