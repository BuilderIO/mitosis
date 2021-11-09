load("@npm//@bazel/typescript:index.bzl", "ts_project")

package(default_visibility = ["//visibility:public"])

ts_project(
    name = "core",
    srcs = glob(
        [
            "src/**/*.ts",
            "src/**/*.tsx",
        ],
        exclude = [
            "**/__tests__/**",
            "**/*.test.ts",
        ],
    ),
    declaration = True,
    preserve_jsx = True,
    # supports_workers = True, # TODO(misko): unclear why enabling this causes tsc to write to source folder
    tsc = "@npm_core//typescript/bin:tsc", # TODO(misko): unclear why this is needed here, but not in other places.
    tsconfig = "//:tsconfig.bazel.json",
    deps = [
        # "@npm_core//:node_modules",
        "@npm_core//acorn",
        "@npm_core//dedent",
        "@npm_core//prettier",
        "@npm_core//lodash",
        "@npm_core//@types/node",
        "@npm_core//@types/babel__core",
        "@npm_core//@types/json5",
        "@npm_core//@types/dedent",
        "@npm_core//@types/prettier",
        "@npm_core//@types/lodash",
        "@npm_core//@types/object-hash",
        "@npm_core//@types/traverse",
        "@npm_core//@types/rollup__plugin-virtual",
        "@npm_core//@builder.io/sdk",
        "@npm_core//@builder.io/react",
        "@npm_core//@babel/core",
        "@npm_core//@babel/generator",
        "@npm_core//@rollup/plugin-virtual",
        "@npm_core//@angular/compiler",
        "@npm_core//json5",
        "@npm_core//traverse",
        "@npm_core//rollup",
        "@npm_core//csstype",
        "@npm_core//object-hash",
        "@npm_core//axios",
        "@npm_core//liquidjs",
        "@npm_core//vue-template-compiler",
    ],
)
