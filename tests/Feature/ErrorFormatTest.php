<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErrorFormatTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_returns_401_json()
    {
        $res = $this->getJson('/api/tasks');

        $res->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_not_found_returns_404_json()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $res = $this->withToken($token)->getJson('/api/tasks/99999');

        $res->assertStatus(404)
            ->assertJson(['message' => 'Not found.']);
    }

    public function test_validation_returns_422_with_errors()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $res = $this->withToken($token)->postJson('/api/tasks', [
            'title' => '',
        ]);

        $res->assertStatus(422)
            ->assertJsonValidationErrors('title');
    }

    public function test_forbidden_returns_403_json()
    {
        $user = User::factory()->create(['is_admin' => false]);
        $other = User::factory()->create();
        $task = Task::factory()->create([
            'user_id' => $other->id,
            'title' => 'Other task',
            'status' => 'pending',
        ]);

        $token = $user->createToken('test')->plainTextToken;
        $res = $this->withToken($token)->getJson("/api/tasks/{$task->id}");

        $res->assertStatus(403);
    }
}
