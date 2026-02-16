import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ServerController::save
 * @see app/Http/Controllers/ServerController.php:353
 * @route '/servers/{server}/crontab'
 */
export const save = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: save.url(args, options),
    method: 'post',
})

save.definition = {
    methods: ["post"],
    url: '/servers/{server}/crontab',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::save
 * @see app/Http/Controllers/ServerController.php:353
 * @route '/servers/{server}/crontab'
 */
save.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { server: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { server: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    server: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        server: typeof args.server === 'object'
                ? args.server.id
                : args.server,
                }

    return save.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::save
 * @see app/Http/Controllers/ServerController.php:353
 * @route '/servers/{server}/crontab'
 */
save.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: save.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::save
 * @see app/Http/Controllers/ServerController.php:353
 * @route '/servers/{server}/crontab'
 */
    const saveForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: save.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::save
 * @see app/Http/Controllers/ServerController.php:353
 * @route '/servers/{server}/crontab'
 */
        saveForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: save.url(args, options),
            method: 'post',
        })
    
    save.form = saveForm
const crontab = {
    save: Object.assign(save, save),
}

export default crontab