<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'test@example.com')->first();

        if ($user) {
            Task::factory(15)->create([
                'user_id' => $user->id,
            ]);
        }
    }
}
