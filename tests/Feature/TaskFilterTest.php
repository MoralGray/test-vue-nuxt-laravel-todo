<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskFilterTest extends TestCase
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

    public function test_filter_by_status()
    {
        Task::factory(3)->create(['user_id' => $this->user->id, 'status' => 'completed']);
        Task::factory(2)->create(['user_id' => $this->user->id, 'status' => 'pending']);

        $res = $this->withToken($this->token)->getJson('/api/tasks?filter[status]=completed');

        $res->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_search_by_title()
    {
        Task::factory()->create(['user_id' => $this->user->id, 'title' => 'Unique search term']);
        Task::factory(5)->create(['user_id' => $this->user->id]);

        $res = $this->withToken($this->token)->getJson('/api/tasks?search=Unique');

        $res->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_sort_by_due_date()
    {
        Task::factory()->create(['user_id' => $this->user->id, 'due_date' => '2026-03-01']);
        Task::factory()->create(['user_id' => $this->user->id, 'due_date' => '2026-01-01']);
        Task::factory()->create(['user_id' => $this->user->id, 'due_date' => '2026-06-01']);

        $res = $this->withToken($this->token)->getJson('/api/tasks?sort=due_date');
        $data = $res->json('data');

        $res->assertStatus(200);
        $this->assertEquals('2026-01-01', substr($data[0]['due_date'], 0, 10));
    }

    public function test_pagination_returns_meta()
    {
        Task::factory(15)->create(['user_id' => $this->user->id]);

        $res = $this->withToken($this->token)->getJson('/api/tasks?page=1');

        $res->assertStatus(200)
            ->assertJsonStructure(['meta' => ['total', 'per_page', 'current_page', 'last_page']])
            ->assertJsonCount(10, 'data');
    }

    public function test_empty_page_returns_empty_data()
    {
        Task::factory(15)->create(['user_id' => $this->user->id]);

        $res = $this->withToken($this->token)->getJson('/api/tasks?page=999');

        $res->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }
}
