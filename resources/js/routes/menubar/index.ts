import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\MenuBarController::index
 * @see app/Http/Controllers/MenuBarController.php:12
 * @route '/menubar'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/menubar',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MenuBarController::index
 * @see app/Http/Controllers/MenuBarController.php:12
 * @route '/menubar'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MenuBarController::index
 * @see app/Http/Controllers/MenuBarController.php:12
 * @route '/menubar'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MenuBarController::index
 * @see app/Http/Controllers/MenuBarController.php:12
 * @route '/menubar'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MenuBarController::index
 * @see app/Http/Controllers/MenuBarController.php:12
 * @route '/menubar'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MenuBarController::index
 * @see app/Http/Controllers/MenuBarController.php:12
 * @route '/menubar'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MenuBarController::index
 * @see app/Http/Controllers/MenuBarController.php:12
 * @route '/menubar'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\MenuBarController::focus
 * @see app/Http/Controllers/MenuBarController.php:28
 * @route '/menubar/focus'
 */
export const focus = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: focus.url(options),
    method: 'get',
})

focus.definition = {
    methods: ["get","head"],
    url: '/menubar/focus',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MenuBarController::focus
 * @see app/Http/Controllers/MenuBarController.php:28
 * @route '/menubar/focus'
 */
focus.url = (options?: RouteQueryOptions) => {
    return focus.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MenuBarController::focus
 * @see app/Http/Controllers/MenuBarController.php:28
 * @route '/menubar/focus'
 */
focus.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: focus.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MenuBarController::focus
 * @see app/Http/Controllers/MenuBarController.php:28
 * @route '/menubar/focus'
 */
focus.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: focus.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MenuBarController::focus
 * @see app/Http/Controllers/MenuBarController.php:28
 * @route '/menubar/focus'
 */
    const focusForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: focus.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MenuBarController::focus
 * @see app/Http/Controllers/MenuBarController.php:28
 * @route '/menubar/focus'
 */
        focusForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: focus.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MenuBarController::focus
 * @see app/Http/Controllers/MenuBarController.php:28
 * @route '/menubar/focus'
 */
        focusForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: focus.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    focus.form = focusForm
/**
* @see \App\Http\Controllers\MenuBarController::openServer
 * @see app/Http/Controllers/MenuBarController.php:33
 * @route '/menubar/servers/{server}'
 */
export const openServer = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: openServer.url(args, options),
    method: 'get',
})

openServer.definition = {
    methods: ["get","head"],
    url: '/menubar/servers/{server}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MenuBarController::openServer
 * @see app/Http/Controllers/MenuBarController.php:33
 * @route '/menubar/servers/{server}'
 */
openServer.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return openServer.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MenuBarController::openServer
 * @see app/Http/Controllers/MenuBarController.php:33
 * @route '/menubar/servers/{server}'
 */
openServer.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: openServer.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MenuBarController::openServer
 * @see app/Http/Controllers/MenuBarController.php:33
 * @route '/menubar/servers/{server}'
 */
openServer.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: openServer.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MenuBarController::openServer
 * @see app/Http/Controllers/MenuBarController.php:33
 * @route '/menubar/servers/{server}'
 */
    const openServerForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: openServer.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MenuBarController::openServer
 * @see app/Http/Controllers/MenuBarController.php:33
 * @route '/menubar/servers/{server}'
 */
        openServerForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: openServer.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MenuBarController::openServer
 * @see app/Http/Controllers/MenuBarController.php:33
 * @route '/menubar/servers/{server}'
 */
        openServerForm.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: openServer.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    openServer.form = openServerForm
/**
* @see \App\Http\Controllers\MenuBarController::openSettings
 * @see app/Http/Controllers/MenuBarController.php:43
 * @route '/menubar/settings'
 */
export const openSettings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: openSettings.url(options),
    method: 'get',
})

openSettings.definition = {
    methods: ["get","head"],
    url: '/menubar/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MenuBarController::openSettings
 * @see app/Http/Controllers/MenuBarController.php:43
 * @route '/menubar/settings'
 */
openSettings.url = (options?: RouteQueryOptions) => {
    return openSettings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MenuBarController::openSettings
 * @see app/Http/Controllers/MenuBarController.php:43
 * @route '/menubar/settings'
 */
openSettings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: openSettings.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MenuBarController::openSettings
 * @see app/Http/Controllers/MenuBarController.php:43
 * @route '/menubar/settings'
 */
openSettings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: openSettings.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MenuBarController::openSettings
 * @see app/Http/Controllers/MenuBarController.php:43
 * @route '/menubar/settings'
 */
    const openSettingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: openSettings.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MenuBarController::openSettings
 * @see app/Http/Controllers/MenuBarController.php:43
 * @route '/menubar/settings'
 */
        openSettingsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: openSettings.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MenuBarController::openSettings
 * @see app/Http/Controllers/MenuBarController.php:43
 * @route '/menubar/settings'
 */
        openSettingsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: openSettings.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    openSettings.form = openSettingsForm
const menubar = {
    index: Object.assign(index, index),
focus: Object.assign(focus, focus),
openServer: Object.assign(openServer, openServer),
openSettings: Object.assign(openSettings, openSettings),
}

export default menubar