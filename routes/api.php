<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClassroomController;
use App\Http\Controllers\Api\AuthController;

// Auth endpoints for SPA (Sanctum, session-based)
Route::get('/user', [AuthController::class, 'me'])->middleware('auth:sanctum');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Protected API routes for the Class module
Route::middleware('auth:sanctum')->group(function () {
	Route::apiResource('classes', ClassroomController::class);
});


