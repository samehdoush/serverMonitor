import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ServerController::index
 * @see app/Http/Controllers/ServerController.php:27
 * @route '/servers'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/servers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ServerController::index
 * @see app/Http/Controllers/ServerController.php:27
 * @route '/servers'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::index
 * @see app/Http/Controllers/ServerController.php:27
 * @route '/servers'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::index
 * @see app/Http/Controllers/ServerController.php:27
 * @route '/servers'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::index
 * @see app/Http/Controllers/ServerController.php:27
 * @route '/servers'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::index
 * @see app/Http/Controllers/ServerController.php:27
 * @route '/servers'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::index
 * @see app/Http/Controllers/ServerController.php:27
 * @route '/servers'
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
* @see \App\Http\Controllers\ServerController::create
 * @see app/Http/Controllers/ServerController.php:38
 * @route '/servers/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/servers/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ServerController::create
 * @see app/Http/Controllers/ServerController.php:38
 * @route '/servers/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::create
 * @see app/Http/Controllers/ServerController.php:38
 * @route '/servers/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::create
 * @see app/Http/Controllers/ServerController.php:38
 * @route '/servers/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::create
 * @see app/Http/Controllers/ServerController.php:38
 * @route '/servers/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::create
 * @see app/Http/Controllers/ServerController.php:38
 * @route '/servers/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::create
 * @see app/Http/Controllers/ServerController.php:38
 * @route '/servers/create'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\ServerController::store
 * @see app/Http/Controllers/ServerController.php:45
 * @route '/servers'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/servers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::store
 * @see app/Http/Controllers/ServerController.php:45
 * @route '/servers'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::store
 * @see app/Http/Controllers/ServerController.php:45
 * @route '/servers'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::store
 * @see app/Http/Controllers/ServerController.php:45
 * @route '/servers'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::store
 * @see app/Http/Controllers/ServerController.php:45
 * @route '/servers'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\ServerController::show
 * @see app/Http/Controllers/ServerController.php:67
 * @route '/servers/{server}'
 */
export const show = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/servers/{server}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ServerController::show
 * @see app/Http/Controllers/ServerController.php:67
 * @route '/servers/{server}'
 */
show.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::show
 * @see app/Http/Controllers/ServerController.php:67
 * @route '/servers/{server}'
 */
show.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::show
 * @see app/Http/Controllers/ServerController.php:67
 * @route '/servers/{server}'
 */
show.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::show
 * @see app/Http/Controllers/ServerController.php:67
 * @route '/servers/{server}'
 */
    const showForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::show
 * @see app/Http/Controllers/ServerController.php:67
 * @route '/servers/{server}'
 */
        showForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::show
 * @see app/Http/Controllers/ServerController.php:67
 * @route '/servers/{server}'
 */
        showForm.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\ServerController::edit
 * @see app/Http/Controllers/ServerController.php:82
 * @route '/servers/{server}/edit'
 */
export const edit = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/servers/{server}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ServerController::edit
 * @see app/Http/Controllers/ServerController.php:82
 * @route '/servers/{server}/edit'
 */
edit.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return edit.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::edit
 * @see app/Http/Controllers/ServerController.php:82
 * @route '/servers/{server}/edit'
 */
edit.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::edit
 * @see app/Http/Controllers/ServerController.php:82
 * @route '/servers/{server}/edit'
 */
edit.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::edit
 * @see app/Http/Controllers/ServerController.php:82
 * @route '/servers/{server}/edit'
 */
    const editForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::edit
 * @see app/Http/Controllers/ServerController.php:82
 * @route '/servers/{server}/edit'
 */
        editForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::edit
 * @see app/Http/Controllers/ServerController.php:82
 * @route '/servers/{server}/edit'
 */
        editForm.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
* @see \App\Http\Controllers\ServerController::update
 * @see app/Http/Controllers/ServerController.php:89
 * @route '/servers/{server}'
 */
export const update = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/servers/{server}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\ServerController::update
 * @see app/Http/Controllers/ServerController.php:89
 * @route '/servers/{server}'
 */
update.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::update
 * @see app/Http/Controllers/ServerController.php:89
 * @route '/servers/{server}'
 */
update.put = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\ServerController::update
 * @see app/Http/Controllers/ServerController.php:89
 * @route '/servers/{server}'
 */
update.patch = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ServerController::update
 * @see app/Http/Controllers/ServerController.php:89
 * @route '/servers/{server}'
 */
    const updateForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::update
 * @see app/Http/Controllers/ServerController.php:89
 * @route '/servers/{server}'
 */
        updateForm.put = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\ServerController::update
 * @see app/Http/Controllers/ServerController.php:89
 * @route '/servers/{server}'
 */
        updateForm.patch = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\ServerController::destroy
 * @see app/Http/Controllers/ServerController.php:135
 * @route '/servers/{server}'
 */
export const destroy = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/servers/{server}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ServerController::destroy
 * @see app/Http/Controllers/ServerController.php:135
 * @route '/servers/{server}'
 */
destroy.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::destroy
 * @see app/Http/Controllers/ServerController.php:135
 * @route '/servers/{server}'
 */
destroy.delete = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ServerController::destroy
 * @see app/Http/Controllers/ServerController.php:135
 * @route '/servers/{server}'
 */
    const destroyForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::destroy
 * @see app/Http/Controllers/ServerController.php:135
 * @route '/servers/{server}'
 */
        destroyForm.delete = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\ServerController::testConnection
 * @see app/Http/Controllers/ServerController.php:143
 * @route '/servers/test-connection'
 */
export const testConnection = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: testConnection.url(options),
    method: 'post',
})

testConnection.definition = {
    methods: ["post"],
    url: '/servers/test-connection',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::testConnection
 * @see app/Http/Controllers/ServerController.php:143
 * @route '/servers/test-connection'
 */
testConnection.url = (options?: RouteQueryOptions) => {
    return testConnection.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::testConnection
 * @see app/Http/Controllers/ServerController.php:143
 * @route '/servers/test-connection'
 */
testConnection.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: testConnection.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::testConnection
 * @see app/Http/Controllers/ServerController.php:143
 * @route '/servers/test-connection'
 */
    const testConnectionForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: testConnection.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::testConnection
 * @see app/Http/Controllers/ServerController.php:143
 * @route '/servers/test-connection'
 */
        testConnectionForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: testConnection.url(options),
            method: 'post',
        })
    
    testConnection.form = testConnectionForm
/**
* @see \App\Http\Controllers\ServerController::getMetrics
 * @see app/Http/Controllers/ServerController.php:174
 * @route '/servers/{server}/metrics'
 */
export const getMetrics = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getMetrics.url(args, options),
    method: 'get',
})

getMetrics.definition = {
    methods: ["get","head"],
    url: '/servers/{server}/metrics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ServerController::getMetrics
 * @see app/Http/Controllers/ServerController.php:174
 * @route '/servers/{server}/metrics'
 */
getMetrics.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return getMetrics.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::getMetrics
 * @see app/Http/Controllers/ServerController.php:174
 * @route '/servers/{server}/metrics'
 */
getMetrics.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getMetrics.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::getMetrics
 * @see app/Http/Controllers/ServerController.php:174
 * @route '/servers/{server}/metrics'
 */
getMetrics.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getMetrics.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::getMetrics
 * @see app/Http/Controllers/ServerController.php:174
 * @route '/servers/{server}/metrics'
 */
    const getMetricsForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getMetrics.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::getMetrics
 * @see app/Http/Controllers/ServerController.php:174
 * @route '/servers/{server}/metrics'
 */
        getMetricsForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getMetrics.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::getMetrics
 * @see app/Http/Controllers/ServerController.php:174
 * @route '/servers/{server}/metrics'
 */
        getMetricsForm.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getMetrics.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getMetrics.form = getMetricsForm
/**
* @see \App\Http\Controllers\ServerController::fetchLive
 * @see app/Http/Controllers/ServerController.php:189
 * @route '/servers/{server}/fetch-live'
 */
export const fetchLive = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fetchLive.url(args, options),
    method: 'get',
})

fetchLive.definition = {
    methods: ["get","head"],
    url: '/servers/{server}/fetch-live',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ServerController::fetchLive
 * @see app/Http/Controllers/ServerController.php:189
 * @route '/servers/{server}/fetch-live'
 */
fetchLive.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return fetchLive.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::fetchLive
 * @see app/Http/Controllers/ServerController.php:189
 * @route '/servers/{server}/fetch-live'
 */
fetchLive.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fetchLive.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::fetchLive
 * @see app/Http/Controllers/ServerController.php:189
 * @route '/servers/{server}/fetch-live'
 */
fetchLive.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: fetchLive.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::fetchLive
 * @see app/Http/Controllers/ServerController.php:189
 * @route '/servers/{server}/fetch-live'
 */
    const fetchLiveForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: fetchLive.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::fetchLive
 * @see app/Http/Controllers/ServerController.php:189
 * @route '/servers/{server}/fetch-live'
 */
        fetchLiveForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fetchLive.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::fetchLive
 * @see app/Http/Controllers/ServerController.php:189
 * @route '/servers/{server}/fetch-live'
 */
        fetchLiveForm.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fetchLive.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    fetchLive.form = fetchLiveForm
/**
* @see \App\Http\Controllers\ServerController::startStream
 * @see app/Http/Controllers/ServerController.php:16
 * @route '/servers/{server}/stream'
 */
export const startStream = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startStream.url(args, options),
    method: 'post',
})

startStream.definition = {
    methods: ["post"],
    url: '/servers/{server}/stream',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::startStream
 * @see app/Http/Controllers/ServerController.php:16
 * @route '/servers/{server}/stream'
 */
startStream.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return startStream.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::startStream
 * @see app/Http/Controllers/ServerController.php:16
 * @route '/servers/{server}/stream'
 */
startStream.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startStream.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::startStream
 * @see app/Http/Controllers/ServerController.php:16
 * @route '/servers/{server}/stream'
 */
    const startStreamForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: startStream.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::startStream
 * @see app/Http/Controllers/ServerController.php:16
 * @route '/servers/{server}/stream'
 */
        startStreamForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: startStream.url(args, options),
            method: 'post',
        })
    
    startStream.form = startStreamForm
/**
* @see \App\Http\Controllers\ServerController::serviceAction
 * @see app/Http/Controllers/ServerController.php:237
 * @route '/servers/{server}/service-action'
 */
export const serviceAction = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: serviceAction.url(args, options),
    method: 'post',
})

serviceAction.definition = {
    methods: ["post"],
    url: '/servers/{server}/service-action',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::serviceAction
 * @see app/Http/Controllers/ServerController.php:237
 * @route '/servers/{server}/service-action'
 */
serviceAction.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return serviceAction.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::serviceAction
 * @see app/Http/Controllers/ServerController.php:237
 * @route '/servers/{server}/service-action'
 */
serviceAction.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: serviceAction.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::serviceAction
 * @see app/Http/Controllers/ServerController.php:237
 * @route '/servers/{server}/service-action'
 */
    const serviceActionForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: serviceAction.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::serviceAction
 * @see app/Http/Controllers/ServerController.php:237
 * @route '/servers/{server}/service-action'
 */
        serviceActionForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: serviceAction.url(args, options),
            method: 'post',
        })
    
    serviceAction.form = serviceActionForm
/**
* @see \App\Http\Controllers\ServerController::fetchLog
 * @see app/Http/Controllers/ServerController.php:249
 * @route '/servers/{server}/fetch-log'
 */
export const fetchLog = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fetchLog.url(args, options),
    method: 'post',
})

fetchLog.definition = {
    methods: ["post"],
    url: '/servers/{server}/fetch-log',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::fetchLog
 * @see app/Http/Controllers/ServerController.php:249
 * @route '/servers/{server}/fetch-log'
 */
fetchLog.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return fetchLog.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::fetchLog
 * @see app/Http/Controllers/ServerController.php:249
 * @route '/servers/{server}/fetch-log'
 */
fetchLog.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fetchLog.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::fetchLog
 * @see app/Http/Controllers/ServerController.php:249
 * @route '/servers/{server}/fetch-log'
 */
    const fetchLogForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: fetchLog.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::fetchLog
 * @see app/Http/Controllers/ServerController.php:249
 * @route '/servers/{server}/fetch-log'
 */
        fetchLogForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: fetchLog.url(args, options),
            method: 'post',
        })
    
    fetchLog.form = fetchLogForm
/**
* @see \App\Http\Controllers\ServerController::executeTerminal
 * @see app/Http/Controllers/ServerController.php:261
 * @route '/servers/{server}/terminal'
 */
export const executeTerminal = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: executeTerminal.url(args, options),
    method: 'post',
})

executeTerminal.definition = {
    methods: ["post"],
    url: '/servers/{server}/terminal',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::executeTerminal
 * @see app/Http/Controllers/ServerController.php:261
 * @route '/servers/{server}/terminal'
 */
executeTerminal.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return executeTerminal.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::executeTerminal
 * @see app/Http/Controllers/ServerController.php:261
 * @route '/servers/{server}/terminal'
 */
executeTerminal.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: executeTerminal.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::executeTerminal
 * @see app/Http/Controllers/ServerController.php:261
 * @route '/servers/{server}/terminal'
 */
    const executeTerminalForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: executeTerminal.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::executeTerminal
 * @see app/Http/Controllers/ServerController.php:261
 * @route '/servers/{server}/terminal'
 */
        executeTerminalForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: executeTerminal.url(args, options),
            method: 'post',
        })
    
    executeTerminal.form = executeTerminalForm
/**
* @see \App\Http\Controllers\ServerController::discoverServices
 * @see app/Http/Controllers/ServerController.php:272
 * @route '/servers/{server}/discover-services'
 */
export const discoverServices = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: discoverServices.url(args, options),
    method: 'post',
})

discoverServices.definition = {
    methods: ["post"],
    url: '/servers/{server}/discover-services',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::discoverServices
 * @see app/Http/Controllers/ServerController.php:272
 * @route '/servers/{server}/discover-services'
 */
discoverServices.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return discoverServices.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::discoverServices
 * @see app/Http/Controllers/ServerController.php:272
 * @route '/servers/{server}/discover-services'
 */
discoverServices.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: discoverServices.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::discoverServices
 * @see app/Http/Controllers/ServerController.php:272
 * @route '/servers/{server}/discover-services'
 */
    const discoverServicesForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: discoverServices.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::discoverServices
 * @see app/Http/Controllers/ServerController.php:272
 * @route '/servers/{server}/discover-services'
 */
        discoverServicesForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: discoverServices.url(args, options),
            method: 'post',
        })
    
    discoverServices.form = discoverServicesForm
/**
* @see \App\Http\Controllers\ServerController::getCaddyfile
 * @see app/Http/Controllers/ServerController.php:283
 * @route '/servers/{server}/caddyfile'
 */
export const getCaddyfile = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getCaddyfile.url(args, options),
    method: 'get',
})

getCaddyfile.definition = {
    methods: ["get","head"],
    url: '/servers/{server}/caddyfile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ServerController::getCaddyfile
 * @see app/Http/Controllers/ServerController.php:283
 * @route '/servers/{server}/caddyfile'
 */
getCaddyfile.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return getCaddyfile.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::getCaddyfile
 * @see app/Http/Controllers/ServerController.php:283
 * @route '/servers/{server}/caddyfile'
 */
getCaddyfile.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getCaddyfile.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::getCaddyfile
 * @see app/Http/Controllers/ServerController.php:283
 * @route '/servers/{server}/caddyfile'
 */
getCaddyfile.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getCaddyfile.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::getCaddyfile
 * @see app/Http/Controllers/ServerController.php:283
 * @route '/servers/{server}/caddyfile'
 */
    const getCaddyfileForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getCaddyfile.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::getCaddyfile
 * @see app/Http/Controllers/ServerController.php:283
 * @route '/servers/{server}/caddyfile'
 */
        getCaddyfileForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getCaddyfile.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::getCaddyfile
 * @see app/Http/Controllers/ServerController.php:283
 * @route '/servers/{server}/caddyfile'
 */
        getCaddyfileForm.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getCaddyfile.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getCaddyfile.form = getCaddyfileForm
/**
* @see \App\Http\Controllers\ServerController::saveCaddyfile
 * @see app/Http/Controllers/ServerController.php:289
 * @route '/servers/{server}/caddyfile'
 */
export const saveCaddyfile = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveCaddyfile.url(args, options),
    method: 'post',
})

saveCaddyfile.definition = {
    methods: ["post"],
    url: '/servers/{server}/caddyfile',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::saveCaddyfile
 * @see app/Http/Controllers/ServerController.php:289
 * @route '/servers/{server}/caddyfile'
 */
saveCaddyfile.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return saveCaddyfile.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::saveCaddyfile
 * @see app/Http/Controllers/ServerController.php:289
 * @route '/servers/{server}/caddyfile'
 */
saveCaddyfile.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: saveCaddyfile.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::saveCaddyfile
 * @see app/Http/Controllers/ServerController.php:289
 * @route '/servers/{server}/caddyfile'
 */
    const saveCaddyfileForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: saveCaddyfile.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::saveCaddyfile
 * @see app/Http/Controllers/ServerController.php:289
 * @route '/servers/{server}/caddyfile'
 */
        saveCaddyfileForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: saveCaddyfile.url(args, options),
            method: 'post',
        })
    
    saveCaddyfile.form = saveCaddyfileForm
/**
* @see \App\Http\Controllers\ServerController::selectSshKey
 * @see app/Http/Controllers/ServerController.php:163
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
 * @see app/Http/Controllers/ServerController.php:163
 * @route '/select-ssh-key'
 */
selectSshKey.url = (options?: RouteQueryOptions) => {
    return selectSshKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::selectSshKey
 * @see app/Http/Controllers/ServerController.php:163
 * @route '/select-ssh-key'
 */
selectSshKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: selectSshKey.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::selectSshKey
 * @see app/Http/Controllers/ServerController.php:163
 * @route '/select-ssh-key'
 */
    const selectSshKeyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: selectSshKey.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::selectSshKey
 * @see app/Http/Controllers/ServerController.php:163
 * @route '/select-ssh-key'
 */
        selectSshKeyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: selectSshKey.url(options),
            method: 'post',
        })
    
    selectSshKey.form = selectSshKeyForm
const ServerController = { index, create, store, show, edit, update, destroy, testConnection, getMetrics, fetchLive, startStream, serviceAction, fetchLog, executeTerminal, discoverServices, getCaddyfile, saveCaddyfile, selectSshKey }

export default ServerController