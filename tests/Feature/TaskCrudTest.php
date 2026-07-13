<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;
    }

    public function test_can_list_tasks()
    {
        Task::factory(3)->create(['user_id' => $this->user->id]);

        $res = $this->withToken($this->token)->getJson('/api/tasks');

        $res->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_can_create_task()
    {
        $res = $this->withToken($this->token)->postJson('/api/tasks', [
            'title' => 'New task',
            'description' => 'Description',
            'due_date' => '2026-08-01',
            'status' => 'in_progress',
        ]);

        $res->assertStatus(201)
            ->assertJsonPath('data.title', 'New task');
    }

    public function test_create_with_empty_title_returns_422()
    {
        $res = $this->withToken($this->token)->postJson('/api/tasks', [
            'title' => '',
        ]);

        $res->assertStatus(422)
            ->assertJsonValidationErrors('title');
    }

    public function test_can_show_task()
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $res = $this->withToken($this->token)->getJson("/api/tasks/{$task->id}");

        $res->assertStatus(200)
            ->assertJsonPath('data.id', $task->id);
    }

    public function test_can_update_task()
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $res = $this->withToken($this->token)->putJson("/api/tasks/{$task->id}", [
            'title' => 'Updated title',
            'status' => 'completed',
        ]);

        $res->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated title')
            ->assertJsonPath('data.status', 'completed');
    }

    public function test_can_delete_task()
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $res = $this->withToken($this->token)->deleteJson("/api/tasks/{$task->id}");

        $res->assertStatus(200);
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_show_non_existent_task_returns_404()
    {
        $res = $this->withToken($this->token)->getJson('/api/tasks/99999');

        $res->assertStatus(404);
    }
}
