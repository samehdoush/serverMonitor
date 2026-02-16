import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\FileSyncController::index
 * @see app/Http/Controllers/FileSyncController.php:13
 * @route '/file-sync'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/file-sync',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FileSyncController::index
 * @see app/Http/Controllers/FileSyncController.php:13
 * @route '/file-sync'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FileSyncController::index
 * @see app/Http/Controllers/FileSyncController.php:13
 * @route '/file-sync'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\FileSyncController::index
 * @see app/Http/Controllers/FileSyncController.php:13
 * @route '/file-sync'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\FileSyncController::index
 * @see app/Http/Controllers/FileSyncController.php:13
 * @route '/file-sync'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\FileSyncController::index
 * @see app/Http/Controllers/FileSyncController.php:13
 * @route '/file-sync'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\FileSyncController::index
 * @see app/Http/Controllers/FileSyncController.php:13
 * @route '/file-sync'
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
* @see \App\Http\Controllers\FileSyncController::create
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/file-sync/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FileSyncController::create
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FileSyncController::create
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\FileSyncController::create
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\FileSyncController::create
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\FileSyncController::create
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\FileSyncController::create
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/create'
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
* @see \App\Http\Controllers\FileSyncController::store
 * @see app/Http/Controllers/FileSyncController.php:21
 * @route '/file-sync'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/file-sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FileSyncController::store
 * @see app/Http/Controllers/FileSyncController.php:21
 * @route '/file-sync'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FileSyncController::store
 * @see app/Http/Controllers/FileSyncController.php:21
 * @route '/file-sync'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\FileSyncController::store
 * @see app/Http/Controllers/FileSyncController.php:21
 * @route '/file-sync'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\FileSyncController::store
 * @see app/Http/Controllers/FileSyncController.php:21
 * @route '/file-sync'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\FileSyncController::show
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/{file_sync}'
 */
export const show = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/file-sync/{file_sync}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FileSyncController::show
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/{file_sync}'
 */
show.url = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { file_sync: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    file_sync: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        file_sync: args.file_sync,
                }

    return show.definition.url
            .replace('{file_sync}', parsedArgs.file_sync.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FileSyncController::show
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/{file_sync}'
 */
show.get = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\FileSyncController::show
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/{file_sync}'
 */
show.head = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\FileSyncController::show
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/{file_sync}'
 */
    const showForm = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\FileSyncController::show
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/{file_sync}'
 */
        showForm.get = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\FileSyncController::show
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/{file_sync}'
 */
        showForm.head = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\FileSyncController::edit
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/{file_sync}/edit'
 */
export const edit = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/file-sync/{file_sync}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FileSyncController::edit
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/{file_sync}/edit'
 */
edit.url = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { file_sync: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    file_sync: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        file_sync: args.file_sync,
                }

    return edit.definition.url
            .replace('{file_sync}', parsedArgs.file_sync.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FileSyncController::edit
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/{file_sync}/edit'
 */
edit.get = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\FileSyncController::edit
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/{file_sync}/edit'
 */
edit.head = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\FileSyncController::edit
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/{file_sync}/edit'
 */
    const editForm = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\FileSyncController::edit
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/{file_sync}/edit'
 */
        editForm.get = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\FileSyncController::edit
 * @see app/Http/Controllers/FileSyncController.php:0
 * @route '/file-sync/{file_sync}/edit'
 */
        editForm.head = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\FileSyncController::update
 * @see app/Http/Controllers/FileSyncController.php:37
 * @route '/file-sync/{file_sync}'
 */
export const update = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/file-sync/{file_sync}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\FileSyncController::update
 * @see app/Http/Controllers/FileSyncController.php:37
 * @route '/file-sync/{file_sync}'
 */
update.url = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { file_sync: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    file_sync: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        file_sync: args.file_sync,
                }

    return update.definition.url
            .replace('{file_sync}', parsedArgs.file_sync.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FileSyncController::update
 * @see app/Http/Controllers/FileSyncController.php:37
 * @route '/file-sync/{file_sync}'
 */
update.put = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\FileSyncController::update
 * @see app/Http/Controllers/FileSyncController.php:37
 * @route '/file-sync/{file_sync}'
 */
update.patch = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\FileSyncController::update
 * @see app/Http/Controllers/FileSyncController.php:37
 * @route '/file-sync/{file_sync}'
 */
    const updateForm = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\FileSyncController::update
 * @see app/Http/Controllers/FileSyncController.php:37
 * @route '/file-sync/{file_sync}'
 */
        updateForm.put = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\FileSyncController::update
 * @see app/Http/Controllers/FileSyncController.php:37
 * @route '/file-sync/{file_sync}'
 */
        updateForm.patch = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\FileSyncController::destroy
 * @see app/Http/Controllers/FileSyncController.php:53
 * @route '/file-sync/{file_sync}'
 */
export const destroy = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/file-sync/{file_sync}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\FileSyncController::destroy
 * @see app/Http/Controllers/FileSyncController.php:53
 * @route '/file-sync/{file_sync}'
 */
destroy.url = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { file_sync: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    file_sync: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        file_sync: args.file_sync,
                }

    return destroy.definition.url
            .replace('{file_sync}', parsedArgs.file_sync.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FileSyncController::destroy
 * @see app/Http/Controllers/FileSyncController.php:53
 * @route '/file-sync/{file_sync}'
 */
destroy.delete = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\FileSyncController::destroy
 * @see app/Http/Controllers/FileSyncController.php:53
 * @route '/file-sync/{file_sync}'
 */
    const destroyForm = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\FileSyncController::destroy
 * @see app/Http/Controllers/FileSyncController.php:53
 * @route '/file-sync/{file_sync}'
 */
        destroyForm.delete = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\FileSyncController::run
 * @see app/Http/Controllers/FileSyncController.php:60
 * @route '/file-sync/{file_sync}/run'
 */
export const run = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: run.url(args, options),
    method: 'post',
})

run.definition = {
    methods: ["post"],
    url: '/file-sync/{file_sync}/run',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FileSyncController::run
 * @see app/Http/Controllers/FileSyncController.php:60
 * @route '/file-sync/{file_sync}/run'
 */
run.url = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { file_sync: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    file_sync: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        file_sync: args.file_sync,
                }

    return run.definition.url
            .replace('{file_sync}', parsedArgs.file_sync.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FileSyncController::run
 * @see app/Http/Controllers/FileSyncController.php:60
 * @route '/file-sync/{file_sync}/run'
 */
run.post = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: run.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\FileSyncController::run
 * @see app/Http/Controllers/FileSyncController.php:60
 * @route '/file-sync/{file_sync}/run'
 */
    const runForm = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: run.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\FileSyncController::run
 * @see app/Http/Controllers/FileSyncController.php:60
 * @route '/file-sync/{file_sync}/run'
 */
        runForm.post = (args: { file_sync: string | number } | [file_sync: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: run.url(args, options),
            method: 'post',
        })
    
    run.form = runForm
const FileSyncController = { index, create, store, show, edit, update, destroy, run }

export default FileSyncController