import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ServerController::transfer
 * @see app/Http/Controllers/ServerController.php:454
 * @route '/servers/{server}/databases/transfer'
 */
export const transfer = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transfer.url(args, options),
    method: 'post',
})

transfer.definition = {
    methods: ["post"],
    url: '/servers/{server}/databases/transfer',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::transfer
 * @see app/Http/Controllers/ServerController.php:454
 * @route '/servers/{server}/databases/transfer'
 */
transfer.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return transfer.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::transfer
 * @see app/Http/Controllers/ServerController.php:454
 * @route '/servers/{server}/databases/transfer'
 */
transfer.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: transfer.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::transfer
 * @see app/Http/Controllers/ServerController.php:454
 * @route '/servers/{server}/databases/transfer'
 */
    const transferForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: transfer.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::transfer
 * @see app/Http/Controllers/ServerController.php:454
 * @route '/servers/{server}/databases/transfer'
 */
        transferForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: transfer.url(args, options),
            method: 'post',
        })
    
    transfer.form = transferForm
const databases = {
    transfer: Object.assign(transfer, transfer),
}

export default databases