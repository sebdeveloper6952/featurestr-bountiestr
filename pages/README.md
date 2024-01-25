https://c02a-62-48-217-8.ngrok-free.app

First test user: nsec1l9mn8473mrzxe5dp2az7wvfjg7090as9s8wya9aulhdly40znw3s94x2dv

### TODO

- create feature request page

  - `kind`: 37300
  - `d` tag with identifier
  - `title` tag containing title
  - `content`: description
  - `t` hashtags for categorizing

- pledge details page
  - solution for feature request
    - `kind`: 73001
    - `content`: human readable message describing how the author as forfilled the feature request
    - `a` tag referncing k:37300
    - `p` tag of `thing.pubkey`\
  - comment on feature request
    - `kind`: 73003
    - `content`: message
    - `a:root` tag referncing k:37300
    - `p` tag of `thing.pubkey`
    - `e:root` and `e:reply` for threading, `NIP-10`
  - payout on solution
    - `kind`: 73004
    - `content`: optional message from author
    - `e` tag referencing solution
    - `cashu` tag containing P2PK token locked to `solution.pubkey`
    - `amount` tag containing stringified token about (in sats)
    - `p` tag with pubkey of `solution.pubkey`
