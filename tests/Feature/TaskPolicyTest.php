<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_user_sees_only_own_tasks()
    {
        $user = User::factory()->create(['is_admin' => false]);
        $other = User::factory()->create();
        Task::factory(3)->create(['user_id' => $user->id]);
        Task::factory(5)->create(['user_id' => $other->id]);

        $token = $user->createToken('test')->plainTextToken;
        $res = $this->withToken($token)->getJson('/api/tasks');

        $res->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_sees_all_tasks()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $other = User::factory()->create();
        Task::factory(2)->create(['user_id' => $admin->id]);
        Task::factory(4)->create(['user_id' => $other->id]);

        $token = $admin->createToken('test')->plainTextToken;
        $res = $this->withToken($token)->getJson('/api/tasks');

        $res->assertStatus(200)
            ->assertJsonCount(6, 'data');
    }

    public function test_regular_user_cannot_access_others_task()
    {
        $user = User::factory()->create(['is_admin' => false]);
        $other = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $other->id]);

        $token = $user->createToken('test')->plainTextToken;
        $res = $this->withToken($token)->getJson("/api/tasks/{$task->id}");

        $res->assertStatus(403);
    }

    public function test_regular_user_cannot_delete_others_task()
    {
        $user = User::factory()->create(['is_admin' => false]);
        $other = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $other->id]);

        $token = $user->createToken('test')->plainTextToken;
        $res = $this->withToken($token)->deleteJson("/api/tasks/{$task->id}");

        $res->assertStatus(403);
    }

    public function test_admin_can_delete_any_task()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $other = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $other->id]);

        $token = $admin->createToken('test')->plainTextToken;
        $res = $this->withToken($token)->deleteJson("/api/tasks/{$task->id}");

        $res->assertStatus(200);
    }
}
