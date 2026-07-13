<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'due_date' => fake()->boolean(70) ? fake()->dateTimeBetween('-1 week', '+2 weeks')->format('Y-m-d') : null,
            'status' => fake()->randomElement(['pending', 'in_progress', 'completed']),
        ];
    }
}
