> ## Documentation Index
> Fetch the complete documentation index at: https://docs.myfundedperpetuals.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Sandbox and test keys

> Build and test your API integration against free paper accounts before pointing it at a real challenge account.

The sandbox is a test environment for the MyFundedPerps REST API. It runs
the same engine, endpoints, order types, rate limits, and trading rules as the
live API, against real market data, but every request is served on its own
hostname and can only reach dedicated sandbox accounts:

```text theme={null}
https://sandbox.myfundedperpetuals.com
```

Use it to develop and verify an integration without touching a challenge
account. A test order can never reach a real account: test keys are bound to
sandbox accounts, and live keys cannot see sandbox accounts.

## Who can use it

Sandbox access is included with a challenge purchase and stays active for 90
days after each purchase. Buying another challenge extends the window. Access
is checked continuously: when the window lapses, sandbox requests return `403`
with the error code `sandbox_access_expired` until a new purchase refreshes
it.

Temporary sandbox access may also be provided for a fixed period without a
challenge purchase. The same account and test-key limits apply. Access ends at
the stated expiry unless a recent challenge purchase still qualifies you.

## Set up

1. Open [API Key settings](https://myfundedperpetuals.com/settings?section=api-keys).
2. Select **Create API Key** and choose the **Test (Sandbox)** environment.
   Test keys begin with `fp_test_` and automatically cover every sandbox
   account you own.

If you have no active sandbox account, one is created for you when the test
key is created. Sandbox accounts start with a \$100,000 simulated balance and
follow the same trading rules as evaluation accounts, so they can breach. A
new account is created automatically the next time you create a test key
if none of your sandbox accounts are active and you have not reached the
ten-account lifetime limit. Existing accounts remain available.

Then point your client at the sandbox host:

```bash theme={null}
curl https://sandbox.myfundedperpetuals.com/v1/accounts \
  -H "Authorization: Bearer fp_test_..."
```

The response lists only your sandbox accounts. Every endpoint documented in
the [API reference](/api-reference) behaves the same way on both hosts.

## Create more sandbox accounts

In [API Key settings](https://myfundedperpetuals.com/settings?section=api-keys),
find **Sandbox Accounts** and select **Create Sandbox Account**. You can create
another account while your other sandbox accounts are still active, without
creating another API key. Each starts with a \$100,000 simulated balance.
The panel lists each account's name, account number, and status.

Every existing test key automatically gains access to the new account. Use the
account ID returned by `GET /v1/accounts` to select it in API requests.

The ten-account lifetime limit includes active, passed, failed, and closed
sandbox accounts. Creating more accounts requires the same active sandbox
access as creating test keys. When access lapses or the limit is reached,
**Create Sandbox Account** is unavailable and the panel explains why.

## Differences from live

* Test keys authenticate only on `sandbox.myfundedperpetuals.com`; live keys
  authenticate only on `developers.myfundedperpetuals.com`. Using a key on the
  wrong host returns `401` with a message naming the correct host.
* Sandbox accounts never appear in live API responses, and challenge accounts
  never appear in sandbox responses. This applies to direct position, order,
  TWAP/VWAP, and scaled-order IDs, client order IDs, modifications, cancellations,
  and idempotent retries. A known ID does not grant access across environments
  or outside the accounts selected for the credential. Inaccessible individual
  resources return `404`; a client order ID lookup returns an empty list.
* Archived accounts and their orders, positions, and strategy history are
  unavailable through trading endpoints in either API environment, including
  previously successful trading-request replays.
* Sandbox accounts are excluded from analytics, leaderboards, certificates,
  and payouts. They exist only for integration testing. In the web app they
  carry a **Sandbox** badge in the account switcher, and their dashboard
  never shows funded-stage progression because a sandbox account cannot
  become funded.
* Sandbox trading still enforces evaluation rules, so a sandbox account can
  breach. That is useful for testing how your integration handles rejections
  and account failure.

## Go live

When your integration works in the sandbox, create a live key with the same
access level, point your client at
`https://developers.myfundedperpetuals.com`, and select the challenge accounts
it should reach. No other code changes are needed.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.