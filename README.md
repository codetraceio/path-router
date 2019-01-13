# Path Router

![Path Router](https://raw.github.com/codetraceio/path-router/master/assets/path-router.svg?sanitize=true "Path Router")

## Install

```
yarn add path-router-web
// or
npm install path-router-web
```

## Usage

```
import { setHistoryOptions } from "path-router-web";

setHistoryOptions({
    baseUrl: "https://test.com/",
});

addRouter([{
    path: "something/:key1/:key2",
    resolves: [() => "resolve value"],
    loadingCallback: () => {
        console.log("Loading started");
    },
    callback: (firstResolve: string) => {
        console.log("Page loaded", firstResolve);
    },
}]);
```

## Contribute

**Install dependencies**

```
yarn install
```

**Lint**

```
yarn lint
```

**Test**

```
yarn test
```
