First test user: nsec1l9mn8473mrzxe5dp2az7wvfjg7090as9s8wya9aulhdly40znw3s94x2dv
anoter test user: 814fff2674370207afe2f581a78f0a4fd9949eb2239317a45217fbba2297e664

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
    - `p` tag of `thing.pubkey`
  - pledge for feature request
    - `kind`: 73002
    - `content`: human readable message describing the unlock conditions
    - `a` tag referncing k:37300
    - `p` tag of `thing.pubkey`
    - `p:trustee` optional pubkey of a user being trusted to hold the token
    - `cashu` tag containing token
    - `amount` tag containing amount (in sats)
  - comment on feature request
    - `kind`: 73003
    - `content`: message
    - `a:root` tag referencing k:37300
    - `p` tag of `thing.pubkey`
    - `e:root` and `e:reply` for threading, `NIP-10`
  - payout on solution
    - `kind`: 73004
    - `content`: optional message from author
    - `e` tag referencing solution
    - `cashu` tag containing P2PK token locked to `solution.pubkey`
    - `amount` tag containing stringified token about (in sats)
    - `p:payee` tag with pubkey of `solution.pubkey`

cashuAeyJ0b2tlbiI6W3sibWludCI6Imh0dHBzOi8vODMzMy5zcGFjZTozMzM4IiwicHJvb2ZzIjpbeyJpZCI6IjAwNzU5ZTNmOGIwNmIzNmYiLCJhbW91bnQiOjEsInNlY3JldCI6IltcIlAyUEtcIiwge1wiZGF0YVwiOiBcIjAyNWQwNDM5NDNhMDQwMGVlOGM5NTFlMjc3ZWI2NTlkNmFmZTdhZWU3Nzg0NTE4ZGNjYTMwYTk0ZGJmOGJjYWNlOVwiLCBcIm5vbmNlXCI6IFwiNTc4M2Y4YzMyOTgxYWUwMDZiMDNjNGU5NjNlYmViYTlcIn1dIiwiQyI6IjAzNWVjMzM1YzU5NjQwNDg1NzFlNDZlN2Y2YWQ4MDJlODM5MDVkOTExMzVkZmY0NjNmZDdhYmFjNTFkYzE2MjZhOSJ9XX1dfQ
