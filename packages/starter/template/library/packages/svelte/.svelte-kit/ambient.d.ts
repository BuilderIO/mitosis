
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#kit-env-publicprefix).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const NX_CLI_SET: string;
	export const FIG_PID: string;
	export const LC_FIG_SET_PARENT: string;
	export const NX_LOAD_DOT_ENV_FILES: string;
	export const MANPATH: string;
	export const SPACESHIP_VERSION: string;
	export const COREPACK_ROOT: string;
	export const TERM_PROGRAM: string;
	export const PROJECT_CWD: string;
	export const INIT_CWD: string;
	export const ASDF_DIR: string;
	export const SHELL: string;
	export const TERM: string;
	export const FIGTERM_SESSION_ID: string;
	export const HOMEBREW_REPOSITORY: string;
	export const TMPDIR: string;
	export const TERM_PROGRAM_VERSION: string;
	export const NODE_OPTIONS: string;
	export const MallocNanoZone: string;
	export const ORIGINAL_XDG_CURRENT_DESKTOP: string;
	export const ZDOTDIR: string;
	export const FIG_SET_PARENT_CHECK: string;
	export const ZSH: string;
	export const USER: string;
	export const PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: string;
	export const COMMAND_MODE: string;
	export const NX_TASK_HASH: string;
	export const PUPPETEER_EXECUTABLE_PATH: string;
	export const HUSKY_SKIP_INSTALL: string;
	export const SSH_AUTH_SOCK: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const npm_execpath: string;
	export const PAGER: string;
	export const LSCOLORS: string;
	export const NX_TASK_TARGET_PROJECT: string;
	export const PATH: string;
	export const NX_INVOKED_BY_RUNNER: string;
	export const NX_WORKSPACE_ROOT: string;
	export const NPM_CONFIG_PREFIX: string;
	export const _: string;
	export const USER_ZDOTDIR: string;
	export const __CFBundleIdentifier: string;
	export const PWD: string;
	export const TTY: string;
	export const npm_lifecycle_event: string;
	export const LANG: string;
	export const npm_package_name: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const XPC_FLAGS: string;
	export const YARN_IGNORE_CWD: string;
	export const FORCE_COLOR: string;
	export const SPACESHIP_ROOT: string;
	export const XPC_SERVICE_NAME: string;
	export const npm_package_version: string;
	export const VSCODE_INJECTION: string;
	export const HOME: string;
	export const SHLVL: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const HOMEBREW_PREFIX: string;
	export const TSC_WATCHFILE: string;
	export const FIG_SET_PARENT: string;
	export const LESS: string;
	export const LOGNAME: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const BERRY_BIN_FOLDER: string;
	export const LERNA_PACKAGE_NAME: string;
	export const npm_config_user_agent: string;
	export const GIT_ASKPASS: string;
	export const HOMEBREW_CELLAR: string;
	export const INFOPATH: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const COLORTERM: string;
	export const FIG_TERM: string;
	export const npm_node_execpath: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#kit-env-publicprefix) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {

}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/master/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#kit-env-publicprefix).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		NX_CLI_SET: string;
		FIG_PID: string;
		LC_FIG_SET_PARENT: string;
		NX_LOAD_DOT_ENV_FILES: string;
		MANPATH: string;
		SPACESHIP_VERSION: string;
		COREPACK_ROOT: string;
		TERM_PROGRAM: string;
		PROJECT_CWD: string;
		INIT_CWD: string;
		ASDF_DIR: string;
		SHELL: string;
		TERM: string;
		FIGTERM_SESSION_ID: string;
		HOMEBREW_REPOSITORY: string;
		TMPDIR: string;
		TERM_PROGRAM_VERSION: string;
		NODE_OPTIONS: string;
		MallocNanoZone: string;
		ORIGINAL_XDG_CURRENT_DESKTOP: string;
		ZDOTDIR: string;
		FIG_SET_PARENT_CHECK: string;
		ZSH: string;
		USER: string;
		PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: string;
		COMMAND_MODE: string;
		NX_TASK_HASH: string;
		PUPPETEER_EXECUTABLE_PATH: string;
		HUSKY_SKIP_INSTALL: string;
		SSH_AUTH_SOCK: string;
		__CF_USER_TEXT_ENCODING: string;
		npm_execpath: string;
		PAGER: string;
		LSCOLORS: string;
		NX_TASK_TARGET_PROJECT: string;
		PATH: string;
		NX_INVOKED_BY_RUNNER: string;
		NX_WORKSPACE_ROOT: string;
		NPM_CONFIG_PREFIX: string;
		_: string;
		USER_ZDOTDIR: string;
		__CFBundleIdentifier: string;
		PWD: string;
		TTY: string;
		npm_lifecycle_event: string;
		LANG: string;
		npm_package_name: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		XPC_FLAGS: string;
		YARN_IGNORE_CWD: string;
		FORCE_COLOR: string;
		SPACESHIP_ROOT: string;
		XPC_SERVICE_NAME: string;
		npm_package_version: string;
		VSCODE_INJECTION: string;
		HOME: string;
		SHLVL: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		HOMEBREW_PREFIX: string;
		TSC_WATCHFILE: string;
		FIG_SET_PARENT: string;
		LESS: string;
		LOGNAME: string;
		VSCODE_GIT_IPC_HANDLE: string;
		BERRY_BIN_FOLDER: string;
		LERNA_PACKAGE_NAME: string;
		npm_config_user_agent: string;
		GIT_ASKPASS: string;
		HOMEBREW_CELLAR: string;
		INFOPATH: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		COLORTERM: string;
		FIG_TERM: string;
		npm_node_execpath: string;
		[key: string]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#kit-env-publicprefix) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: string]: string | undefined;
	}
}
