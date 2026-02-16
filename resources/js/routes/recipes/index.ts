import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\RecipeController::index
 * @see app/Http/Controllers/RecipeController.php:13
 * @route '/recipes'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/recipes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RecipeController::index
 * @see app/Http/Controllers/RecipeController.php:13
 * @route '/recipes'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipeController::index
 * @see app/Http/Controllers/RecipeController.php:13
 * @route '/recipes'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\RecipeController::index
 * @see app/Http/Controllers/RecipeController.php:13
 * @route '/recipes'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\RecipeController::index
 * @see app/Http/Controllers/RecipeController.php:13
 * @route '/recipes'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\RecipeController::index
 * @see app/Http/Controllers/RecipeController.php:13
 * @route '/recipes'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\RecipeController::index
 * @see app/Http/Controllers/RecipeController.php:13
 * @route '/recipes'
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
* @see \App\Http\Controllers\RecipeController::create
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/recipes/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RecipeController::create
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipeController::create
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\RecipeController::create
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\RecipeController::create
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\RecipeController::create
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\RecipeController::create
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/create'
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
* @see \App\Http\Controllers\RecipeController::store
 * @see app/Http/Controllers/RecipeController.php:20
 * @route '/recipes'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/recipes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\RecipeController::store
 * @see app/Http/Controllers/RecipeController.php:20
 * @route '/recipes'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipeController::store
 * @see app/Http/Controllers/RecipeController.php:20
 * @route '/recipes'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\RecipeController::store
 * @see app/Http/Controllers/RecipeController.php:20
 * @route '/recipes'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\RecipeController::store
 * @see app/Http/Controllers/RecipeController.php:20
 * @route '/recipes'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\RecipeController::show
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/{recipe}'
 */
export const show = (args: { recipe: string | number } | [recipe: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/recipes/{recipe}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RecipeController::show
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/{recipe}'
 */
show.url = (args: { recipe: string | number } | [recipe: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { recipe: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    recipe: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        recipe: args.recipe,
                }

    return show.definition.url
            .replace('{recipe}', parsedArgs.recipe.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipeController::show
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/{recipe}'
 */
show.get = (args: { recipe: string | number } | [recipe: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\RecipeController::show
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/{recipe}'
 */
show.head = (args: { recipe: string | number } | [recipe: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\RecipeController::show
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/{recipe}'
 */
    const showForm = (args: { recipe: string | number } | [recipe: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\RecipeController::show
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/{recipe}'
 */
        showForm.get = (args: { recipe: string | number } | [recipe: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\RecipeController::show
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/{recipe}'
 */
        showForm.head = (args: { recipe: string | number } | [recipe: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\RecipeController::edit
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/{recipe}/edit'
 */
export const edit = (args: { recipe: string | number } | [recipe: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/recipes/{recipe}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RecipeController::edit
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/{recipe}/edit'
 */
edit.url = (args: { recipe: string | number } | [recipe: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { recipe: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    recipe: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        recipe: args.recipe,
                }

    return edit.definition.url
            .replace('{recipe}', parsedArgs.recipe.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipeController::edit
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/{recipe}/edit'
 */
edit.get = (args: { recipe: string | number } | [recipe: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\RecipeController::edit
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/{recipe}/edit'
 */
edit.head = (args: { recipe: string | number } | [recipe: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\RecipeController::edit
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/{recipe}/edit'
 */
    const editForm = (args: { recipe: string | number } | [recipe: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\RecipeController::edit
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/{recipe}/edit'
 */
        editForm.get = (args: { recipe: string | number } | [recipe: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\RecipeController::edit
 * @see app/Http/Controllers/RecipeController.php:0
 * @route '/recipes/{recipe}/edit'
 */
        editForm.head = (args: { recipe: string | number } | [recipe: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\RecipeController::update
 * @see app/Http/Controllers/RecipeController.php:34
 * @route '/recipes/{recipe}'
 */
export const update = (args: { recipe: number | { id: number } } | [recipe: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/recipes/{recipe}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\RecipeController::update
 * @see app/Http/Controllers/RecipeController.php:34
 * @route '/recipes/{recipe}'
 */
update.url = (args: { recipe: number | { id: number } } | [recipe: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { recipe: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { recipe: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    recipe: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        recipe: typeof args.recipe === 'object'
                ? args.recipe.id
                : args.recipe,
                }

    return update.definition.url
            .replace('{recipe}', parsedArgs.recipe.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipeController::update
 * @see app/Http/Controllers/RecipeController.php:34
 * @route '/recipes/{recipe}'
 */
update.put = (args: { recipe: number | { id: number } } | [recipe: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\RecipeController::update
 * @see app/Http/Controllers/RecipeController.php:34
 * @route '/recipes/{recipe}'
 */
update.patch = (args: { recipe: number | { id: number } } | [recipe: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\RecipeController::update
 * @see app/Http/Controllers/RecipeController.php:34
 * @route '/recipes/{recipe}'
 */
    const updateForm = (args: { recipe: number | { id: number } } | [recipe: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\RecipeController::update
 * @see app/Http/Controllers/RecipeController.php:34
 * @route '/recipes/{recipe}'
 */
        updateForm.put = (args: { recipe: number | { id: number } } | [recipe: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\RecipeController::update
 * @see app/Http/Controllers/RecipeController.php:34
 * @route '/recipes/{recipe}'
 */
        updateForm.patch = (args: { recipe: number | { id: number } } | [recipe: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\RecipeController::destroy
 * @see app/Http/Controllers/RecipeController.php:48
 * @route '/recipes/{recipe}'
 */
export const destroy = (args: { recipe: number | { id: number } } | [recipe: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/recipes/{recipe}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\RecipeController::destroy
 * @see app/Http/Controllers/RecipeController.php:48
 * @route '/recipes/{recipe}'
 */
destroy.url = (args: { recipe: number | { id: number } } | [recipe: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { recipe: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { recipe: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    recipe: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        recipe: typeof args.recipe === 'object'
                ? args.recipe.id
                : args.recipe,
                }

    return destroy.definition.url
            .replace('{recipe}', parsedArgs.recipe.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipeController::destroy
 * @see app/Http/Controllers/RecipeController.php:48
 * @route '/recipes/{recipe}'
 */
destroy.delete = (args: { recipe: number | { id: number } } | [recipe: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\RecipeController::destroy
 * @see app/Http/Controllers/RecipeController.php:48
 * @route '/recipes/{recipe}'
 */
    const destroyForm = (args: { recipe: number | { id: number } } | [recipe: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\RecipeController::destroy
 * @see app/Http/Controllers/RecipeController.php:48
 * @route '/recipes/{recipe}'
 */
        destroyForm.delete = (args: { recipe: number | { id: number } } | [recipe: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\RecipeController::all
 * @see app/Http/Controllers/RecipeController.php:55
 * @route '/api/recipes'
 */
export const all = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: all.url(options),
    method: 'get',
})

all.definition = {
    methods: ["get","head"],
    url: '/api/recipes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\RecipeController::all
 * @see app/Http/Controllers/RecipeController.php:55
 * @route '/api/recipes'
 */
all.url = (options?: RouteQueryOptions) => {
    return all.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\RecipeController::all
 * @see app/Http/Controllers/RecipeController.php:55
 * @route '/api/recipes'
 */
all.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: all.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\RecipeController::all
 * @see app/Http/Controllers/RecipeController.php:55
 * @route '/api/recipes'
 */
all.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: all.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\RecipeController::all
 * @see app/Http/Controllers/RecipeController.php:55
 * @route '/api/recipes'
 */
    const allForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: all.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\RecipeController::all
 * @see app/Http/Controllers/RecipeController.php:55
 * @route '/api/recipes'
 */
        allForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: all.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\RecipeController::all
 * @see app/Http/Controllers/RecipeController.php:55
 * @route '/api/recipes'
 */
        allForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: all.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    all.form = allForm
const recipes = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
show: Object.assign(show, show),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
all: Object.assign(all, all),
}

export default recipes