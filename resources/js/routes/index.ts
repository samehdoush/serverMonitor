import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../wayfinder'
/**
* @see \App\Http\Controllers\DashboardController::dashboard
 * @see app/Http/Controllers/DashboardController.php:10
 * @route '/'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DashboardController::dashboard
 * @see app/Http/Controllers/DashboardController.php:10
 * @route '/'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DashboardController::dashboard
 * @see app/Http/Controllers/DashboardController.php:10
 * @route '/'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DashboardController::dashboard
 * @see app/Http/Controllers/DashboardController.php:10
 * @route '/'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DashboardController::dashboard
 * @see app/Http/Controllers/DashboardController.php:10
 * @route '/'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DashboardController::dashboard
 * @see app/Http/Controllers/DashboardController.php:10
 * @route '/'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DashboardController::dashboard
 * @see app/Http/Controllers/DashboardController.php:10
 * @route '/'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
/**
* @see \App\Http\Controllers\ServerController::selectSshKey
 * @see app/Http/Controllers/ServerController.php:182
 * @route '/select-ssh-key'
 */
export const selectSshKey = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: selectSshKey.url(options),
    method: 'post',
})

selectSshKey.definition = {
    methods: ["post"],
    url: '/select-ssh-key',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::selectSshKey
 * @see app/Http/Controllers/ServerController.php:182
 * @route '/select-ssh-key'
 */
selectSshKey.url = (options?: RouteQueryOptions) => {
    return selectSshKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::selectSshKey
 * @see app/Http/Controllers/ServerController.php:182
 * @route '/select-ssh-key'
 */
selectSshKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: selectSshKey.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::selectSshKey
 * @see app/Http/Controllers/ServerController.php:182
 * @route '/select-ssh-key'
 */
    const selectSshKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: selectSshKey.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::selectSshKey
 * @see app/Http/Controllers/ServerController.php:182
 * @route '/select-ssh-key'
 */
        selectSshKeyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: selectSshKey.url(options),
            method: 'post',
        })
    
    selectSshKey.form = selectSshKeyForm