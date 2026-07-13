<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user_and_returns_token()
    {
        $res = $this->postJson('/api/auth/register', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password123',
        ]);

        $res->assertStatus(201)
            ->assertJsonStructure(['data' => ['token', 'user']]);
        $this->assertDatabaseHas('users', ['email' => 'new@example.com', 'is_admin' => false]);
    }

    public function test_register_with_existing_email_returns_422()
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $res = $this->postJson('/api/auth/register', [
            'name' => 'Dup',
            'email' => 'existing@example.com',
            'password' => 'password123',
        ]);

        $res->assertStatus(422);
    }

    public function test_register_with_short_password_returns_422()
    {
        $res = $this->postJson('/api/auth/register', [
            'name' => 'Short',
            'email' => 'short@example.com',
            'password' => '123',
        ]);

        $res->assertStatus(422);
    }

    public function test_login_with_valid_credentials_returns_token()
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $res = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $res->assertStatus(200)
            ->assertJsonStructure(['data' => ['token', 'user']]);
    }

    public function test_login_with_invalid_credentials_returns_401()
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $res = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrong',
        ]);

        $res->assertStatus(401);
    }

    public function test_logout_ends_session()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $res = $this->withToken($token)->postJson('/api/auth/logout');

        $res->assertStatus(200);
    }

    public function test_unauthenticated_access_returns_401()
    {
        $res = $this->getJson('/api/tasks');

        $res->assertStatus(401);
    }
}
