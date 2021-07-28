workspace(
    name = "mitosis",
    managed_directories = {
        "@npm": ["node_modules"],
        "@npm_core": ["packages/core/node_modules"],
    },
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Fetch rules_nodejs so we can install our npm dependencies
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "4a5d654a4ccd4a4c24eca5d319d85a88a650edf119601550c95bf400c8cc897e",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/3.5.1/rules_nodejs-3.5.1.tar.gz"],
)

# Check the rules_nodejs version and download npm dependencies
# Note: bazel (version 2 and after) will check the .bazelversion file so we don't need to
# assert on that.
load("@build_bazel_rules_nodejs//:index.bzl", "check_rules_nodejs_version", "node_repositories", "npm_install")

check_rules_nodejs_version(minimum_version_string = "2.2.0")

# Setup the Node.js toolchain
node_repositories(
    node_version = "12.21.0",
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
