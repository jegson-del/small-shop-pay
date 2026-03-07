<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('address_line1')->nullable()->after('privacy_accepted_at');
            $table->string('address_city')->nullable()->after('address_line1');
            $table->string('address_postcode')->nullable()->after('address_city');
            $table->string('address_country', 2)->nullable()->after('address_postcode');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'address_line1',
                'address_city',
                'address_postcode',
                'address_country',
            ]);
        });
    }
};
