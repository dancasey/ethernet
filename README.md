# ethernet

[![Build Status](https://travis-ci.org/dancasey/ethernet.svg?branch=master)](https://travis-ci.org/dancasey/ethernet)
[![codecov](https://codecov.io/gh/dancasey/ethernet/branch/master/graph/badge.svg)](https://codecov.io/gh/dancasey/ethernet)

**Decodes Ethernet headers**

Supports:

- Plain Ethernet (`destination`, `source`, `ethertype`, `payload`)
- 802.1Q tag (above properties, plus `tag`)
- 802.1ad and QinQ double tag (`stag` and `ctag`)

## Usage

Install:

```bash
npm install --save ethernet
```

Use (ES6 or TypeScript):

```js
import decode from "ethernet";

let rawData = getRawFrameSomehow();
let headers = decode(rawData);

console.log(headers);

// { 
//   destination: '010203040506',
//   source: '0a0b0c0d0e0f',
//   tag: { tpid: 33024, tci: { pcp: 0, dei: 0, vid: 16 } }
//   ethertype: 2048,
//   payload: ...,
// }
```

## Notes

Bugs? Please, [file an issue](https://github.com/dancasey/ethernet/issues/new), or submit a pull request!

License: [PDDL-1.0](https://spdx.org/licenses/PDDL-1.0)
