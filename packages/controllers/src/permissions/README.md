# PermissionController

The `PermissionController` is the heart of an object capability-inspired permission system.
It is the successor of the original MetaMask permission system, [`rpc-cap`](https://github.com/MetaMask/rpc-cap).

## Conceptual Overview

The permission system itself belongs to a **host**, and it mediates the access to resources – called **targets** – of distinct **subjects**.
A target can belong to the host itself, or another subject.

When a subject attempts to access a target, we say that they **invoke** it.
The system ensures that subjects can only invoke a target if they have the **permission** to do so.
Permissions are associated with a subject and target, and they are part of the state of the permission system.

Permissions can have **caveats**, which are host-defined attenuations of the authority a permission grants over a particular target.

## Implementation Overview

Permission system concepts correspond to components of the MetaMask stack as follows:

| Concept           | Implementation                                                  |
| :---------------- | :-------------------------------------------------------------- |
| Host              | The MetaMask application                                        |
| Subjects          | Websites, Snaps, or other extensions                            |
| Targets           | JSON-RPC methods                                                |
| Invocations       | JSON-RPC requests                                               |
| Permissions       | Permission objects                                              |
| Caveats           | Caveat objects                                                  |
| Permission system | The `PermissionController` and its `json-rpc-engine` middleware |

For the time being, JSON-RPC methods are the only kind of permission target that exists.
Therefore, our implementation of the permission system revolves around JSON-RPC requests and MetaMask's `json-rpc-engine` stack.
To use the permission system, every JSON-RPC method must be enumerated and designated as either "restricted" or "unrestricted".
Unrestricted methods can always be called by anyone.
Restricted methods require the requisite permission in order to be called.

At any given moment, the `PermissionController` state tree describes the complete state of the permissions of all subjects known to the current MetaMask instance.
The `PermissionController` also provides methods for adding, updating, and removing permissions, and a `json-rpc-engine` middleware function factory so that the permissioning logic can be applied to incoming JSON-RPC requests.

Once the permission middleware is injected into our middleware stack, every JSON-RPC request will be handled in one of the following ways:

- If the requested method is neither restricted nor unrestricted, the request will be rejected with a `methodNotFound` error.
- If the requested method is unrestricted, it will pass through the middleware unmodified.
- If the requested method is restricted, the middleware will attempt to get the permission corresponding to the subject and target, and:
  - If the request is authorized, call the corresponding method with the request parameters.
  - If the request is not authorized, reject the request with an `unauthorized` error.

### Target Keys and Target Names

When consuming or reading the `PermissionController`, you will encounter the concepts of "target keys" and "target names".
As described in the previous section, a permission grants a subject access to a restricted resource, called a _target_, which is some string.
Targets are referred to by consumers by their _names_, and internally (in the `PermissionController`) by their _keys_.
This distinction exists to enable namespaced targets, specifically namespaced JSON-RPC methods.

All targets have a single key.
If a target _is not_ namespaced, the key is identical to its name.
If a target _is_ namespaced, it may have any number of names, all of which are distinct from its key.
Permissions are always requested and invoked by their target name(s).

For example, for the non-namespaced restricted method `eth_accounts`, both the key and the name is `eth_accounts`.
On the other hand, the namespaced restricted method `wallet_getSecret_*` has the key `wallet_getSecret_*`, and any number of names where the `*` wildcard character is substituted for some valid string per the method implementation.

See [below](#construction) for a concrete example.

### Caveats

Caveats are arbitrary restrictions on restricted method requests.
Every permission has a `caveats` field, which is either an array of caveats or `null`.
Every caveat has a string `type`, and every type has an associated function that is used to apply the caveat to a restricted method request.
When the `PermissionController` is constructed, the consumer specifies the available caveat types and their implementations.

> In `rpc-cap`, caveat types were specified by `rpc-cap` itself, and the consumer had to choose from the available types.
> This did not end up being easy to reason about or work with in practice.
> Now, caveat types and their implementations are provided by the consumer, just like the restricted methods and their implementations.

## Examples

In addition to the below examples, the [`PermissionController` unit tests](./PermissionController.test.ts) show how to set up the controller.

### Construction

```typescript
// To construct a permission controller, we first need to define the caveat
// types and restricted methods.

const caveatSpecifications = {
  filterArrayResponse: {
    type: 'filterArrayResponse',
    // If a permission has any caveats, its corresponding restricted method
    // implementation is decorated / wrapped with the implementations of its
    // caveats, using the caveat's decorator function.
    decorator:
      (
        // Restricted methods and other caveats can be async, so we have to
        // assume that the method is async.
        method: AsyncRestrictedMethod<RestrictedMethodParameters, Json>,
        caveat: FilterArrayCaveat,
      ) =>
      async (args: RestrictedMethodOptions<RestrictedMethodParameters>) => {
        const result = await method(args);
        if (!Array.isArray(result)) {
          throw Error('not an array');
        }

        return result.filter((resultValue) =>
          caveat.value.includes(resultValue),
        );
      },
  },
};

// The property names of this object must be target keys.
const permissionSpecifications = {
  wallet_getSecretArray: {
    // i.e. the restricted method name
    target: 'wallet_getSecretArray',
    allowedCaveats: [
      'filterArrayResponse',
    ],
    methodImplementation: (
      _args: RestrictedMethodOptions<RestrictedMethodParameters>,
    ) => {
      return ['secret1', 'secret2', 'secret3'];
    },
  },

  // This is a namespaced restricted method.
  wallet_getSecret_*: {
    target: 'wallet_getSecret_*',
    methodImplementation: (
      args: RestrictedMethodOptions<RestrictedMethodParameters>,
    ) => {
      // The "method" is the string method name that was externally requested,
      // and the "*" in the target key for this method will be replaced with
      // some string whose value should affect the behavior of this method.
      //
      // "context" contains the origin of the requester and anything attached
      // by the host during permission request processing.
      const { method, context } = args;

      const secretName = method.replace('wallet_getSecret_', '');
      return context.getSecret(secretName);
    },
  },
};

const permissionController = new PermissionController({
  caveatSpecifications,
  messenger: controllerMessenger, // assume this was given
  permissionSpecifications,
  unrestrictedMethods: ['wallet_unrestrictedMethod'],
});
```

### Adding the Permission Middleware

```typescript
// This should take place where a middleware stack is created for a particular
// subject.

// The subject could be a port, stream, socket, etc.
const origin = getOrigin(subject);

const engine = new JsonRpcEngine();
engine.push(/* your various middleware*/);
engine.push(permissionController.createPermissionMiddleware({ origin }));
// Your middleware stack is now permissioned
engine.push(/* your other various middleware*/);
```

### Calling a Restricted Method Internally

```typescript
// Sometimes, we need to call a restricted method internally, as a particular subject.
permissionController.executeRestrictedMethod(origin, 'wallet_getSecretArray');

// If the restricted method has any parameters, they are given as the third
// argument to executeRestrictedMethod().
permissionController.executeRestrictedMethod(origin, 'wallet_getSecret', {
  secretType: 'array',
});
```

### Requesting and Getting Permissions

```typescript
// From the perspective of subjects, requesting and getting permissions
// works the same as it does with `rpc-cap`.
const approvedPermissions = await ethereum.request({
  method: 'wallet_requestPermissions',
  params: [{
    wallet_getSecretArray: {},
  }]
})

const existingPermissions = await ethereum.request({
  method: 'wallet_getPermissions',
)
```

### Caveat Decorators

Here follows some more example caveat decorator implementations.

```typescript
// Validation / passthrough
export function onlyArrayParams(
  method: AsyncRestrictedMethod<RestrictedMethodParameters, Json>,
  _caveat: Caveat<'PassthroughCaveat', never>,
) {
  return async (args: RestrictedMethodOptions<RestrictedMethodParameters>) => {
    if (!Array.isArray(args.params)) {
      throw new EthereumJsonRpcError();
    }

    return method(args);
  };
}

// "Return handler" example
export function eth_accounts(
  method: AsyncRestrictedMethod<RestrictedMethodParameters, Json>,
  caveat: Caveat<'RestrictAccountCaveat', string[]>,
) {
  return async (args: RestrictedMethodOptions<RestrictedMethodParameters>) => {
    const accounts: string[] | Json = await method(args);
    if (!Array.isArray(args.params)) {
      throw new EthereumJsonRpcError();
    }

    return (
      accounts.filter((account: string) => caveat.value.includes(account)) ?? []
    );
  };
}
```
