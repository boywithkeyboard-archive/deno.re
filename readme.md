## deno.re(gistry)

### Usage

- #### Minify files

  When you request a `*.min.js`, `*.min.mjs` or `*.min.jsx` file and the release does not contain such a file, deno.re will automatically minify the file.

- #### Import the latest tag

  ```ts
  import { encodeHex } from 'https://deno.re/denoland/deno_std/encoding/hex.ts'
  ```

- #### Import a specific commit

  ```ts
  import { encodeHex } from 'https://deno.re/denoland/deno_std@6cc097b6212eaba083634b0e826c0916a49a3148/encoding/hex.ts'
  ```

- #### Import a specific tag

  ```ts
  import { encodeHex } from 'https://deno.re/denoland/deno_std@0.220.0/encoding/hex.ts'
  ```

- #### Automatic entry point

  ```ts
  import { crypto } from 'https://deno.re/denoland/deno_std@0.221.0/crypto'
  // ▼
  import { crypto } from 'https://deno.re/denoland/deno_std@0.221.0/crypto/mod.ts'
  ```

  The order of priority can be found [here](https://github.com/boywithkeyboard/deno.re/blob/main/registry/get_entry_point.ts#L6).

### Terms of Use

deno.re is designed to be a permanent caching layer for Deno modules stored on GitHub. If you decide to abuse our service in whatever way, we reserve the right to blacklist your GitHub account.

No guarantee of availability is assumed for this service.
