# Path Router

![Path Router](assets/path-router.svg "Path Router")

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
    resolves: [() => true],
    callback: () => {
        console.log(true);
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
