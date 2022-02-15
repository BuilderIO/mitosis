workspace(
    name = "mitosis",
    managed_directories = {
        "@npm": ["node_modules"],
        "@npm_core": ["packages/core/node_modules"],
    },
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "d63ecec7192394f5cc4ad95a115f8a6c9de55c60d56c1f08da79c306355e4654",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/4.6.1/rules_nodejs-4.6.1.tar.gz"],
)

# fetches nodejs, npm, and yarn
load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "npm_install")
node_repositories(
    node_version = "16.6.2", # This version is much higher, but it is needed to make bazel work for Apple M1
)

npm_install(
    name = "npm",
    args = ["--legacy-peer-deps"], # TODO(misko): Fix this by removing the flag and fixing the underlying dependency.
    package_json = "//:package.json",
    package_lock_json = "//:package-lock.json",
)

npm_install(
    name = "npm_core",
    args = ["--legacy-peer-deps"], # TODO(misko): Fix this by removing the flag and fixing the underlying dependency.
    package_json = "//packages/core:package.json",
    package_lock_json = "//packages/core:package-lock.json",
)
