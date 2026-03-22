import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import caddyfile249244 from './caddyfile'
import crontabB3b63b from './crontab'
import firewall2ef6dc from './firewall'
import databases544202 from './databases'
import recipes from './recipes'
/**
* @see \App\Http\Controllers\ServerController::index
 * @see app/Http/Controllers/ServerController.php:30
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
 * @see app/Http/Controllers/ServerController.php:30
 * @route '/servers'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::index
 * @see app/Http/Controllers/ServerController.php:30
 * @route '/servers'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::index
 * @see app/Http/Controllers/ServerController.php:30
 * @route '/servers'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::index
 * @see app/Http/Controllers/ServerController.php:30
 * @route '/servers'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::index
 * @see app/Http/Controllers/ServerController.php:30
 * @route '/servers'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::index
 * @see app/Http/Controllers/ServerController.php:30
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
 * @see app/Http/Controllers/ServerController.php:42
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
 * @see app/Http/Controllers/ServerController.php:42
 * @route '/servers/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::create
 * @see app/Http/Controllers/ServerController.php:42
 * @route '/servers/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::create
 * @see app/Http/Controllers/ServerController.php:42
 * @route '/servers/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::create
 * @see app/Http/Controllers/ServerController.php:42
 * @route '/servers/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::create
 * @see app/Http/Controllers/ServerController.php:42
 * @route '/servers/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::create
 * @see app/Http/Controllers/ServerController.php:42
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
 * @see app/Http/Controllers/ServerController.php:49
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
 * @see app/Http/Controllers/ServerController.php:49
 * @route '/servers'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::store
 * @see app/Http/Controllers/ServerController.php:49
 * @route '/servers'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::store
 * @see app/Http/Controllers/ServerController.php:49
 * @route '/servers'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::store
 * @see app/Http/Controllers/ServerController.php:49
 * @route '/servers'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\ServerController::show
 * @see app/Http/Controllers/ServerController.php:83
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
 * @see app/Http/Controllers/ServerController.php:83
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
 * @see app/Http/Controllers/ServerController.php:83
 * @route '/servers/{server}'
 */
show.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::show
 * @see app/Http/Controllers/ServerController.php:83
 * @route '/servers/{server}'
 */
show.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::show
 * @see app/Http/Controllers/ServerController.php:83
 * @route '/servers/{server}'
 */
    const showForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::show
 * @see app/Http/Controllers/ServerController.php:83
 * @route '/servers/{server}'
 */
        showForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::show
 * @see app/Http/Controllers/ServerController.php:83
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
 * @see app/Http/Controllers/ServerController.php:96
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
 * @see app/Http/Controllers/ServerController.php:96
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
 * @see app/Http/Controllers/ServerController.php:96
 * @route '/servers/{server}/edit'
 */
edit.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::edit
 * @see app/Http/Controllers/ServerController.php:96
 * @route '/servers/{server}/edit'
 */
edit.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::edit
 * @see app/Http/Controllers/ServerController.php:96
 * @route '/servers/{server}/edit'
 */
    const editForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::edit
 * @see app/Http/Controllers/ServerController.php:96
 * @route '/servers/{server}/edit'
 */
        editForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::edit
 * @see app/Http/Controllers/ServerController.php:96
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
 * @see app/Http/Controllers/ServerController.php:103
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
 * @see app/Http/Controllers/ServerController.php:103
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
 * @see app/Http/Controllers/ServerController.php:103
 * @route '/servers/{server}'
 */
update.put = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\ServerController::update
 * @see app/Http/Controllers/ServerController.php:103
 * @route '/servers/{server}'
 */
update.patch = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ServerController::update
 * @see app/Http/Controllers/ServerController.php:103
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
 * @see app/Http/Controllers/ServerController.php:103
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
 * @see app/Http/Controllers/ServerController.php:103
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
 * @see app/Http/Controllers/ServerController.php:154
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
 * @see app/Http/Controllers/ServerController.php:154
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
 * @see app/Http/Controllers/ServerController.php:154
 * @route '/servers/{server}'
 */
destroy.delete = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ServerController::destroy
 * @see app/Http/Controllers/ServerController.php:154
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
 * @see app/Http/Controllers/ServerController.php:154
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
 * @see app/Http/Controllers/ServerController.php:162
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
 * @see app/Http/Controllers/ServerController.php:162
 * @route '/servers/test-connection'
 */
testConnection.url = (options?: RouteQueryOptions) => {
    return testConnection.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::testConnection
 * @see app/Http/Controllers/ServerController.php:162
 * @route '/servers/test-connection'
 */
testConnection.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: testConnection.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::testConnection
 * @see app/Http/Controllers/ServerController.php:162
 * @route '/servers/test-connection'
 */
    const testConnectionForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: testConnection.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::testConnection
 * @see app/Http/Controllers/ServerController.php:162
 * @route '/servers/test-connection'
 */
        testConnectionForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: testConnection.url(options),
            method: 'post',
        })
    
    testConnection.form = testConnectionForm
/**
* @see \App\Http\Controllers\ServerController::reorder
 * @see app/Http/Controllers/ServerController.php:311
 * @route '/servers/reorder'
 */
export const reorder = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(options),
    method: 'post',
})

reorder.definition = {
    methods: ["post"],
    url: '/servers/reorder',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::reorder
 * @see app/Http/Controllers/ServerController.php:311
 * @route '/servers/reorder'
 */
reorder.url = (options?: RouteQueryOptions) => {
    return reorder.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::reorder
 * @see app/Http/Controllers/ServerController.php:311
 * @route '/servers/reorder'
 */
reorder.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::reorder
 * @see app/Http/Controllers/ServerController.php:311
 * @route '/servers/reorder'
 */
    const reorderForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reorder.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::reorder
 * @see app/Http/Controllers/ServerController.php:311
 * @route '/servers/reorder'
 */
        reorderForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reorder.url(options),
            method: 'post',
        })
    
    reorder.form = reorderForm
/**
* @see \App\Http\Controllers\ServerController::metrics
 * @see app/Http/Controllers/ServerController.php:193
 * @route '/servers/{server}/metrics'
 */
export const metrics = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: metrics.url(args, options),
    method: 'get',
})

metrics.definition = {
    methods: ["get","head"],
    url: '/servers/{server}/metrics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ServerController::metrics
 * @see app/Http/Controllers/ServerController.php:193
 * @route '/servers/{server}/metrics'
 */
metrics.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return metrics.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::metrics
 * @see app/Http/Controllers/ServerController.php:193
 * @route '/servers/{server}/metrics'
 */
metrics.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: metrics.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::metrics
 * @see app/Http/Controllers/ServerController.php:193
 * @route '/servers/{server}/metrics'
 */
metrics.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: metrics.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::metrics
 * @see app/Http/Controllers/ServerController.php:193
 * @route '/servers/{server}/metrics'
 */
    const metricsForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: metrics.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::metrics
 * @see app/Http/Controllers/ServerController.php:193
 * @route '/servers/{server}/metrics'
 */
        metricsForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: metrics.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::metrics
 * @see app/Http/Controllers/ServerController.php:193
 * @route '/servers/{server}/metrics'
 */
        metricsForm.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: metrics.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    metrics.form = metricsForm
/**
* @see \App\Http\Controllers\ServerController::fetchLive
 * @see app/Http/Controllers/ServerController.php:208
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
 * @see app/Http/Controllers/ServerController.php:208
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
 * @see app/Http/Controllers/ServerController.php:208
 * @route '/servers/{server}/fetch-live'
 */
fetchLive.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fetchLive.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::fetchLive
 * @see app/Http/Controllers/ServerController.php:208
 * @route '/servers/{server}/fetch-live'
 */
fetchLive.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: fetchLive.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::fetchLive
 * @see app/Http/Controllers/ServerController.php:208
 * @route '/servers/{server}/fetch-live'
 */
    const fetchLiveForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: fetchLive.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::fetchLive
 * @see app/Http/Controllers/ServerController.php:208
 * @route '/servers/{server}/fetch-live'
 */
        fetchLiveForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fetchLive.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::fetchLive
 * @see app/Http/Controllers/ServerController.php:208
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
* @see \App\Http\Controllers\ServerController::stream
 * @see app/Http/Controllers/ServerController.php:16
 * @route '/servers/{server}/stream'
 */
export const stream = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stream.url(args, options),
    method: 'post',
})

stream.definition = {
    methods: ["post"],
    url: '/servers/{server}/stream',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::stream
 * @see app/Http/Controllers/ServerController.php:16
 * @route '/servers/{server}/stream'
 */
stream.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return stream.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::stream
 * @see app/Http/Controllers/ServerController.php:16
 * @route '/servers/{server}/stream'
 */
stream.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stream.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::stream
 * @see app/Http/Controllers/ServerController.php:16
 * @route '/servers/{server}/stream'
 */
    const streamForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: stream.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::stream
 * @see app/Http/Controllers/ServerController.php:16
 * @route '/servers/{server}/stream'
 */
        streamForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: stream.url(args, options),
            method: 'post',
        })
    
    stream.form = streamForm
/**
* @see \App\Http\Controllers\ServerController::serviceAction
 * @see app/Http/Controllers/ServerController.php:262
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
 * @see app/Http/Controllers/ServerController.php:262
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
 * @see app/Http/Controllers/ServerController.php:262
 * @route '/servers/{server}/service-action'
 */
serviceAction.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: serviceAction.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::serviceAction
 * @see app/Http/Controllers/ServerController.php:262
 * @route '/servers/{server}/service-action'
 */
    const serviceActionForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: serviceAction.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::serviceAction
 * @see app/Http/Controllers/ServerController.php:262
 * @route '/servers/{server}/service-action'
 */
        serviceActionForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: serviceAction.url(args, options),
            method: 'post',
        })
    
    serviceAction.form = serviceActionForm
/**
* @see \App\Http\Controllers\ServerController::fetchLog
 * @see app/Http/Controllers/ServerController.php:274
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
 * @see app/Http/Controllers/ServerController.php:274
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
 * @see app/Http/Controllers/ServerController.php:274
 * @route '/servers/{server}/fetch-log'
 */
fetchLog.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fetchLog.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::fetchLog
 * @see app/Http/Controllers/ServerController.php:274
 * @route '/servers/{server}/fetch-log'
 */
    const fetchLogForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: fetchLog.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::fetchLog
 * @see app/Http/Controllers/ServerController.php:274
 * @route '/servers/{server}/fetch-log'
 */
        fetchLogForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: fetchLog.url(args, options),
            method: 'post',
        })
    
    fetchLog.form = fetchLogForm
/**
* @see \App\Http\Controllers\ServerController::terminal
 * @see app/Http/Controllers/ServerController.php:286
 * @route '/servers/{server}/terminal'
 */
export const terminal = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: terminal.url(args, options),
    method: 'post',
})

terminal.definition = {
    methods: ["post"],
    url: '/servers/{server}/terminal',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::terminal
 * @see app/Http/Controllers/ServerController.php:286
 * @route '/servers/{server}/terminal'
 */
terminal.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return terminal.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::terminal
 * @see app/Http/Controllers/ServerController.php:286
 * @route '/servers/{server}/terminal'
 */
terminal.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: terminal.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::terminal
 * @see app/Http/Controllers/ServerController.php:286
 * @route '/servers/{server}/terminal'
 */
    const terminalForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: terminal.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::terminal
 * @see app/Http/Controllers/ServerController.php:286
 * @route '/servers/{server}/terminal'
 */
        terminalForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: terminal.url(args, options),
            method: 'post',
        })
    
    terminal.form = terminalForm
/**
* @see \App\Http\Controllers\ServerController::discoverServices
 * @see app/Http/Controllers/ServerController.php:297
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
 * @see app/Http/Controllers/ServerController.php:297
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
 * @see app/Http/Controllers/ServerController.php:297
 * @route '/servers/{server}/discover-services'
 */
discoverServices.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: discoverServices.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::discoverServices
 * @see app/Http/Controllers/ServerController.php:297
 * @route '/servers/{server}/discover-services'
 */
    const discoverServicesForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: discoverServices.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::discoverServices
 * @see app/Http/Controllers/ServerController.php:297
 * @route '/servers/{server}/discover-services'
 */
        discoverServicesForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: discoverServices.url(args, options),
            method: 'post',
        })
    
    discoverServices.form = discoverServicesForm
/**
* @see \App\Http\Controllers\ServerController::reboot
 * @see app/Http/Controllers/ServerController.php:502
 * @route '/servers/{server}/reboot'
 */
export const reboot = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reboot.url(args, options),
    method: 'post',
})

reboot.definition = {
    methods: ["post"],
    url: '/servers/{server}/reboot',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::reboot
 * @see app/Http/Controllers/ServerController.php:502
 * @route '/servers/{server}/reboot'
 */
reboot.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return reboot.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::reboot
 * @see app/Http/Controllers/ServerController.php:502
 * @route '/servers/{server}/reboot'
 */
reboot.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reboot.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::reboot
 * @see app/Http/Controllers/ServerController.php:502
 * @route '/servers/{server}/reboot'
 */
    const rebootForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reboot.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::reboot
 * @see app/Http/Controllers/ServerController.php:502
 * @route '/servers/{server}/reboot'
 */
        rebootForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reboot.url(args, options),
            method: 'post',
        })
    
    reboot.form = rebootForm
/**
* @see \App\Http\Controllers\ServerController::caddyfile
 * @see app/Http/Controllers/ServerController.php:327
 * @route '/servers/{server}/caddyfile'
 */
export const caddyfile = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: caddyfile.url(args, options),
    method: 'get',
})

caddyfile.definition = {
    methods: ["get","head"],
    url: '/servers/{server}/caddyfile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ServerController::caddyfile
 * @see app/Http/Controllers/ServerController.php:327
 * @route '/servers/{server}/caddyfile'
 */
caddyfile.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return caddyfile.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::caddyfile
 * @see app/Http/Controllers/ServerController.php:327
 * @route '/servers/{server}/caddyfile'
 */
caddyfile.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: caddyfile.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::caddyfile
 * @see app/Http/Controllers/ServerController.php:327
 * @route '/servers/{server}/caddyfile'
 */
caddyfile.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: caddyfile.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::caddyfile
 * @see app/Http/Controllers/ServerController.php:327
 * @route '/servers/{server}/caddyfile'
 */
    const caddyfileForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: caddyfile.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::caddyfile
 * @see app/Http/Controllers/ServerController.php:327
 * @route '/servers/{server}/caddyfile'
 */
        caddyfileForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: caddyfile.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::caddyfile
 * @see app/Http/Controllers/ServerController.php:327
 * @route '/servers/{server}/caddyfile'
 */
        caddyfileForm.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: caddyfile.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    caddyfile.form = caddyfileForm
/**
* @see \App\Http\Controllers\ServerController::crontab
 * @see app/Http/Controllers/ServerController.php:345
 * @route '/servers/{server}/crontab'
 */
export const crontab = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: crontab.url(args, options),
    method: 'get',
})

crontab.definition = {
    methods: ["get","head"],
    url: '/servers/{server}/crontab',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ServerController::crontab
 * @see app/Http/Controllers/ServerController.php:345
 * @route '/servers/{server}/crontab'
 */
crontab.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return crontab.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::crontab
 * @see app/Http/Controllers/ServerController.php:345
 * @route '/servers/{server}/crontab'
 */
crontab.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: crontab.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::crontab
 * @see app/Http/Controllers/ServerController.php:345
 * @route '/servers/{server}/crontab'
 */
crontab.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: crontab.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::crontab
 * @see app/Http/Controllers/ServerController.php:345
 * @route '/servers/{server}/crontab'
 */
    const crontabForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: crontab.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::crontab
 * @see app/Http/Controllers/ServerController.php:345
 * @route '/servers/{server}/crontab'
 */
        crontabForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: crontab.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::crontab
 * @see app/Http/Controllers/ServerController.php:345
 * @route '/servers/{server}/crontab'
 */
        crontabForm.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: crontab.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    crontab.form = crontabForm
/**
* @see \App\Http\Controllers\ServerController::firewall
 * @see app/Http/Controllers/ServerController.php:363
 * @route '/servers/{server}/firewall'
 */
export const firewall = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: firewall.url(args, options),
    method: 'get',
})

firewall.definition = {
    methods: ["get","head"],
    url: '/servers/{server}/firewall',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ServerController::firewall
 * @see app/Http/Controllers/ServerController.php:363
 * @route '/servers/{server}/firewall'
 */
firewall.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return firewall.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::firewall
 * @see app/Http/Controllers/ServerController.php:363
 * @route '/servers/{server}/firewall'
 */
firewall.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: firewall.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::firewall
 * @see app/Http/Controllers/ServerController.php:363
 * @route '/servers/{server}/firewall'
 */
firewall.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: firewall.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::firewall
 * @see app/Http/Controllers/ServerController.php:363
 * @route '/servers/{server}/firewall'
 */
    const firewallForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: firewall.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::firewall
 * @see app/Http/Controllers/ServerController.php:363
 * @route '/servers/{server}/firewall'
 */
        firewallForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: firewall.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::firewall
 * @see app/Http/Controllers/ServerController.php:363
 * @route '/servers/{server}/firewall'
 */
        firewallForm.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: firewall.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    firewall.form = firewallForm
/**
* @see \App\Http\Controllers\ServerController::databases
 * @see app/Http/Controllers/ServerController.php:447
 * @route '/servers/{server}/databases'
 */
export const databases = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: databases.url(args, options),
    method: 'get',
})

databases.definition = {
    methods: ["get","head"],
    url: '/servers/{server}/databases',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ServerController::databases
 * @see app/Http/Controllers/ServerController.php:447
 * @route '/servers/{server}/databases'
 */
databases.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return databases.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::databases
 * @see app/Http/Controllers/ServerController.php:447
 * @route '/servers/{server}/databases'
 */
databases.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: databases.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ServerController::databases
 * @see app/Http/Controllers/ServerController.php:447
 * @route '/servers/{server}/databases'
 */
databases.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: databases.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ServerController::databases
 * @see app/Http/Controllers/ServerController.php:447
 * @route '/servers/{server}/databases'
 */
    const databasesForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: databases.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ServerController::databases
 * @see app/Http/Controllers/ServerController.php:447
 * @route '/servers/{server}/databases'
 */
        databasesForm.get = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: databases.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ServerController::databases
 * @see app/Http/Controllers/ServerController.php:447
 * @route '/servers/{server}/databases'
 */
        databasesForm.head = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: databases.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    databases.form = databasesForm
const servers = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
show: Object.assign(show, show),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
testConnection: Object.assign(testConnection, testConnection),
reorder: Object.assign(reorder, reorder),
metrics: Object.assign(metrics, metrics),
fetchLive: Object.assign(fetchLive, fetchLive),
stream: Object.assign(stream, stream),
serviceAction: Object.assign(serviceAction, serviceAction),
fetchLog: Object.assign(fetchLog, fetchLog),
terminal: Object.assign(terminal, terminal),
discoverServices: Object.assign(discoverServices, discoverServices),
reboot: Object.assign(reboot, reboot),
caddyfile: Object.assign(caddyfile, caddyfile249244),
crontab: Object.assign(crontab, crontabB3b63b),
firewall: Object.assign(firewall, firewall2ef6dc),
databases: Object.assign(databases, databases544202),
recipes: Object.assign(recipes, recipes),
}

export default servers