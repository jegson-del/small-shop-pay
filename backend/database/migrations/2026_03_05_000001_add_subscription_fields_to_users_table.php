<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('stripe_customer_id')->nullable()->after('stripe_account_id');
            $table->string('subscription_id')->nullable()->after('stripe_customer_id');
            $table->string('subscription_status')->default('none')->after('subscription_id');
            $table->timestamp('trial_end')->nullable()->after('subscription_status');
            $table->boolean('app_access')->default(false)->after('trial_end');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_customer_id',
                'subscription_id',
                'subscription_status',
                'trial_end',
                'app_access',
            ]);
        });
    }
};
