import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BackupController::index
 * @see app/Http/Controllers/BackupController.php:11
 * @route '/backup'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/backup',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BackupController::index
 * @see app/Http/Controllers/BackupController.php:11
 * @route '/backup'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BackupController::index
 * @see app/Http/Controllers/BackupController.php:11
 * @route '/backup'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BackupController::index
 * @see app/Http/Controllers/BackupController.php:11
 * @route '/backup'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BackupController::index
 * @see app/Http/Controllers/BackupController.php:11
 * @route '/backup'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BackupController::index
 * @see app/Http/Controllers/BackupController.php:11
 * @route '/backup'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BackupController::index
 * @see app/Http/Controllers/BackupController.php:11
 * @route '/backup'
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
* @see \App\Http\Controllers\BackupController::exportMethod
 * @see app/Http/Controllers/BackupController.php:16
 * @route '/backup/export'
 */
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: exportMethod.url(options),
    method: 'post',
})

exportMethod.definition = {
    methods: ["post"],
    url: '/backup/export',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BackupController::exportMethod
 * @see app/Http/Controllers/BackupController.php:16
 * @route '/backup/export'
 */
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BackupController::exportMethod
 * @see app/Http/Controllers/BackupController.php:16
 * @route '/backup/export'
 */
exportMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: exportMethod.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BackupController::exportMethod
 * @see app/Http/Controllers/BackupController.php:16
 * @route '/backup/export'
 */
    const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: exportMethod.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BackupController::exportMethod
 * @see app/Http/Controllers/BackupController.php:16
 * @route '/backup/export'
 */
        exportMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: exportMethod.url(options),
            method: 'post',
        })
    
    exportMethod.form = exportMethodForm
/**
* @see \App\Http\Controllers\BackupController::importMethod
 * @see app/Http/Controllers/BackupController.php:52
 * @route '/backup/import'
 */
export const importMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/backup/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BackupController::importMethod
 * @see app/Http/Controllers/BackupController.php:52
 * @route '/backup/import'
 */
importMethod.url = (options?: RouteQueryOptions) => {
    return importMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BackupController::importMethod
 * @see app/Http/Controllers/BackupController.php:52
 * @route '/backup/import'
 */
importMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BackupController::importMethod
 * @see app/Http/Controllers/BackupController.php:52
 * @route '/backup/import'
 */
    const importMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: importMethod.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BackupController::importMethod
 * @see app/Http/Controllers/BackupController.php:52
 * @route '/backup/import'
 */
        importMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: importMethod.url(options),
            method: 'post',
        })
    
    importMethod.form = importMethodForm
const BackupController = { index, exportMethod, importMethod, export: exportMethod, import: importMethod }

export default BackupController