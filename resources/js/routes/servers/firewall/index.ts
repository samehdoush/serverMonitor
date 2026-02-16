import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import ruleB78c8c from './rule'
/**
* @see \App\Http\Controllers\ServerController::rule
 * @see app/Http/Controllers/ServerController.php:371
 * @route '/servers/{server}/firewall/rule'
 */
export const rule = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rule.url(args, options),
    method: 'post',
})

rule.definition = {
    methods: ["post"],
    url: '/servers/{server}/firewall/rule',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::rule
 * @see app/Http/Controllers/ServerController.php:371
 * @route '/servers/{server}/firewall/rule'
 */
rule.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return rule.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::rule
 * @see app/Http/Controllers/ServerController.php:371
 * @route '/servers/{server}/firewall/rule'
 */
rule.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rule.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::rule
 * @see app/Http/Controllers/ServerController.php:371
 * @route '/servers/{server}/firewall/rule'
 */
    const ruleForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: rule.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::rule
 * @see app/Http/Controllers/ServerController.php:371
 * @route '/servers/{server}/firewall/rule'
 */
        ruleForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: rule.url(args, options),
            method: 'post',
        })
    
    rule.form = ruleForm
/**
* @see \App\Http\Controllers\ServerController::toggle
 * @see app/Http/Controllers/ServerController.php:396
 * @route '/servers/{server}/firewall/toggle'
 */
export const toggle = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

toggle.definition = {
    methods: ["post"],
    url: '/servers/{server}/firewall/toggle',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::toggle
 * @see app/Http/Controllers/ServerController.php:396
 * @route '/servers/{server}/firewall/toggle'
 */
toggle.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return toggle.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::toggle
 * @see app/Http/Controllers/ServerController.php:396
 * @route '/servers/{server}/firewall/toggle'
 */
toggle.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::toggle
 * @see app/Http/Controllers/ServerController.php:396
 * @route '/servers/{server}/firewall/toggle'
 */
    const toggleForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: toggle.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::toggle
 * @see app/Http/Controllers/ServerController.php:396
 * @route '/servers/{server}/firewall/toggle'
 */
        toggleForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: toggle.url(args, options),
            method: 'post',
        })
    
    toggle.form = toggleForm
/**
* @see \App\Http\Controllers\ServerController::install
 * @see app/Http/Controllers/ServerController.php:407
 * @route '/servers/{server}/firewall/install'
 */
export const install = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: install.url(args, options),
    method: 'post',
})

install.definition = {
    methods: ["post"],
    url: '/servers/{server}/firewall/install',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ServerController::install
 * @see app/Http/Controllers/ServerController.php:407
 * @route '/servers/{server}/firewall/install'
 */
install.url = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return install.definition.url
            .replace('{server}', parsedArgs.server.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ServerController::install
 * @see app/Http/Controllers/ServerController.php:407
 * @route '/servers/{server}/firewall/install'
 */
install.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: install.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ServerController::install
 * @see app/Http/Controllers/ServerController.php:407
 * @route '/servers/{server}/firewall/install'
 */
    const installForm = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: install.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ServerController::install
 * @see app/Http/Controllers/ServerController.php:407
 * @route '/servers/{server}/firewall/install'
 */
        installForm.post = (args: { server: number | { id: number } } | [server: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: install.url(args, options),
            method: 'post',
        })
    
    install.form = installForm
const firewall = {
    rule: Object.assign(rule, ruleB78c8c),
toggle: Object.assign(toggle, toggle),
install: Object.assign(install, install),
}

export default firewall