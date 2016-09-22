# ethernet

Decodes Ethernet headers

Install

```bash
npm install --save ethernet
```

Use

```js
import decode from "ethernet";

let rawData = getRawFrameSomeHow();
let headers = decode(rawData);

console.log(headers);
// 
```
