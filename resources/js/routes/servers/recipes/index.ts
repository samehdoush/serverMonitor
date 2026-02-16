import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\RecipeController::run
 * @see app/Http/Controllers/RecipeController.php:60
 * @route '/servers/{server}/recipes/{recipe}/run'
 */
export const run = (args: { server: number | { id: number }, recipe: number | { id: number } } | [server: number | { id: number }, recipe: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: run.url(args, options),
    method: 'post',
})

run.definition = {
    methods: ["post"],
    url: '/servers/{server}/recipes/{recipe}/run',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RecipeController::run
 * @see app/Http/Controllers/RecipeController.php:60
 * @route '/servers/{server}/recipes/{recipe}/run'
 */
run.url = (args: { server: number | { id: number }, recipe: number | { id: number } } | [server: number | { id: number }, recipe: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    server: args[0],
                    recipe: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        server: typeof args.server === 'object'
                ? args.server.id
                : args.server,
                                recipe: typeof args.recipe === 'object'
                ? args.recipe.id
                : args.recipe,
                }

    return run.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace('{recipe}', parsedArgs.recipe.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipeController::run
 * @see app/Http/Controllers/RecipeController.php:60
 * @route '/servers/{server}/recipes/{recipe}/run'
 */
run.post = (args: { server: number | { id: number }, recipe: number | { id: number } } | [server: number | { id: number }, recipe: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: run.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\RecipeController::run
 * @see app/Http/Controllers/RecipeController.php:60
 * @route '/servers/{server}/recipes/{recipe}/run'
 */
    const runForm = (args: { server: number | { id: number }, recipe: number | { id: number } } | [server: number | { id: number }, recipe: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: run.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\RecipeController::run
 * @see app/Http/Controllers/RecipeController.php:60
 * @route '/servers/{server}/recipes/{recipe}/run'
 */
        runForm.post = (args: { server: number | { id: number }, recipe: number | { id: number } } | [server: number | { id: number }, recipe: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: run.url(args, options),
            method: 'post',
        })
    
    run.form = runForm
const recipes = {
    run: Object.assign(run, run),
}

export default recipes