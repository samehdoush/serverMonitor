<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\Server;
use App\Services\SshService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecipeController extends Controller
{
    public function index()
    {
        return Inertia::render('Recipes/Index', [
            'recipes' => Recipe::orderBy('category')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'command' => 'required|string',
            'category' => 'required|string|max:255',
        ]);

        Recipe::create($validated);

        return back()->with('success', 'Recipe created successfully');
    }

    public function update(Request $request, Recipe $recipe)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'command' => 'required|string',
            'category' => 'required|string|max:255',
        ]);

        $recipe->update($validated);

        return back()->with('success', 'Recipe updated successfully');
    }

    public function destroy(Recipe $recipe)
    {
        $recipe->delete();

        return back()->with('success', 'Recipe deleted successfully');
    }

    public function getAll()
    {
        return response()->json(Recipe::all());
    }

    public function run(Server $server, Recipe $recipe, SshService $sshService)
    {
        $result = $sshService->executeRaw($server, $recipe->command);

        return response()->json([
            'success' => $result['success'],
            'output' => $result['output'],
            'exit_status' => $result['exit_status'] ?? null,
            'message' => $result['success'] ? 'Recipe executed successfully' : ($result['message'] ?? 'Execution failed'),
        ]);
    }
}
