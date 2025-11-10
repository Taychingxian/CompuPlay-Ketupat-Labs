<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ClassroomController extends Controller
{
	public function index(Request $request)
	{
		$user = Auth::user();

		if (!$user) {
			return response()->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
		}

		if ($user->role === 'teacher') {
			$query = Classroom::query()->where('teacher_id', $user->id)->orderByDesc('created_at');
		} else {
			$query = Classroom::query()
				->whereHas('students', function ($q) use ($user) {
					$q->where('users.id', $user->id);
				})
				->orderByDesc('created_at');
		}

		return response()->json($query->get());
	}

	public function show(Classroom $class)
	{
		$user = Auth::user();
		if (!$user) {
			return response()->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
		}

		$this->authorize('view', $class);
		return response()->json($class);
	}

	public function store(Request $request)
	{
		$user = Auth::user();
		if (!$user) {
			return response()->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
		}
		$this->authorize('create', Classroom::class);

		$validated = $request->validate([
			'name' => ['required', 'string', 'max:200'],
			'subject' => ['nullable', 'string', 'max:200'],
			'year' => ['nullable', 'integer'],
		]);

		$classroom = Classroom::create([
			'teacher_id' => $user->id,
			'name' => $validated['name'],
			'subject' => $validated['subject'] ?? null,
			'year' => $validated['year'] ?? null,
		]);

		return response()->json($classroom, Response::HTTP_CREATED);
	}

	public function update(Request $request, Classroom $class)
	{
		$user = Auth::user();
		if (!$user) {
			return response()->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
		}
		$this->authorize('update', $class);

		$validated = $request->validate([
			'name' => ['required', 'string', 'max:200'],
			'subject' => ['nullable', 'string', 'max:200'],
			'year' => ['nullable', 'integer'],
		]);

		$class->update($validated);

		return response()->json($class);
	}

	public function destroy(Classroom $class)
	{
		$user = Auth::user();
		if (!$user) {
			return response()->json(['message' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
		}
		$this->authorize('delete', $class);

		$class->delete();
		return response()->json(['success' => true]);
	}
}


