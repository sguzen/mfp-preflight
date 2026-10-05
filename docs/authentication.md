> ## Documentation Index
> Fetch the complete documentation index at: https://docs.myfundedperpetuals.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Authentication

> Authenticate requests with a MyFundedPerps API key.

Send your API key in the HTTP `Authorization` header with the `Bearer` scheme:

```http theme={null}
Authorization: Bearer fp_live_...
```

Each API key has an access level and account boundary:

| Access level | Allowed requests |
| - | - |
| Read Only | Accounts, markets, quotes, positions, orders, and fills |
| Read And Trade | Read requests plus order and position changes |

Account access can cover every account you own or one selected challenge
account. Requests for an account outside the key's boundary return `404`, the
same response used for an account you do not own. Read-only keys receive `403`
when they attempt a trading request.

Copy trading follows the same account boundary. A lead order requires access to
its lead and every configured follower in the same environment. A key limited
to the lead account cannot place the lead trade while that copy group is
enabled. The request returns `404` with `account_not_found` before any order is
created; followers are never silently omitted. Use a key covering the complete
group or manage the trade on the website.

Modifications, cancellations, and protective-exit changes also require access
to every copied account they would affect. This includes outstanding copied
orders from a group that has since been disabled. A live key never grants
access to a sandbox follower, even when the website configuration includes it.

Keys created before scoped access was introduced retain read and trading access
to every owned account until they are revoked. The API information and
tradable-market catalog endpoints are public; account state, quotes, positions,
and orders require a key.

## Environments

Every key belongs to one environment, named by its prefix and served on its
own hostname:

| Environment | Key prefix | Base URL | Reaches |
| - | - | - | - |
| Live | `fp_live_` | `https://developers.myfundedperpetuals.com` | Your challenge accounts |
| Test | `fp_test_` | `https://sandbox.myfundedperpetuals.com` | Your sandbox accounts only |

A key presented on the other environment's host returns `401` with a message
naming the correct host. Test keys and sandbox accounts are covered in
[Sandbox and test keys](/sandbox).

## CLI sessions

The `fperp` command-line tool can sign in without a manually created API key.
Running `fperp login` opens your browser to an approval page; approving mints
an expiring CLI session credential that authenticates exactly like a live API
key with trading access to every account you own. The credential is stored in
your operating system keychain by default.

CLI sessions differ from API keys in three ways:

* They expire automatically 90 days after sign-in. An expired session returns
  `401` and `fperp login` mints a new one.
* `fperp logout` revokes the session server-side immediately.
* They exist only in the live environment. Use a test API key with
  `fperp login --api-key` for the sandbox host.

You can hold up to five CLI sessions at once (one per machine, for example);
signing in past that limit revokes the oldest session. On a remote or headless
machine, `fperp login --manual` shows a one-time code in the browser to paste
into the terminal instead of using a local callback.

## Keep keys server-side

API keys are long-lived credentials. Store them in a secret manager or an
encrypted environment registry. Do not commit a key, print it in logs, include
it in a URL, or ship it in frontend code.

Treat test keys with the same care: a leaked test key still exposes your
sandbox trading activity and consumes your request budgets.

## Rotate a key

Create a replacement key, update your client, confirm it can make an
authenticated read, and then revoke the old key in
[API Key Settings](https://myfundedperpetuals.com/settings?section=api-keys).
Revocation takes effect for new requests immediately; a request already in
flight may still finish.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.