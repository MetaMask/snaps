# PermissionController

The `PermissionController` is the heart of an object capability-inspired permission system.
It is the successor of the original MetaMask permission system, [`rpc-cap`](https://github.com/MetaMask/rpc-cap).

## Conceptual Overview

The permission system itself belongs to a **host**, and it mediates the access to resources – called **targets** – of distinct **subjects**.
A target can belong to the host itself, or another subject.

When a subject requests access to a target, we say that they **invoke** it.
The system ensures that subjects can only invoke a target if they have the **permission** to do so.
Permissions are associated with a subject and target, and they are part of the state of the permission system.

Permissions can have **caveats**, which are host-defined attenuations of the authority a permission grants over a particular target.

## Implementation Overview

Permission system concepts correspond to components of the MetaMask stack as follows:

| Concept           | Implementation                                                                           |
| :---------------- | :--------------------------------------------------------------------------------------- |
| Host              | The MetaMask application                                                                 |
| Subjects          | Websites, Snaps, or other extensions                                                     |
| Targets           | JSON-RPC methods                                                                         |
| Invocations       | JSON-RPC requests                                                                        |
| Permissions       | Permission objects                                                                       |
| Caveats           | Caveat objects                                                                           |
| Permission system | The `PermissionController`, `PermissionEnforcer`, and their `json-rpc-engine` middleware |

For the time being, JSON-RPC methods are the only kind of permission target that exists.
Therefore, our implementation of the permission system revolves around JSON-RPC requests and MetaMask's `json-rpc-engine` stack.
To use the permission system, every JSON-RPC method must be enumerated and designated as either "restricted" or "unrestricted".
Unrestricted methods can always be called by anyone.
Restricted methods require the requisite permission in order to be called.

At any given moment, the `PermissionController` state tree describes the complete state of the permissions of all subjects known to the current MetaMask instance.
The `PermissionController` also provides methods for adding, updating, and removing permissions.
The controller has a sibling module, the `PermissionEnforcer`, which furnishes methods for applying the rules described by the controller state to incoming JSON-RPC requests.
The also provides a `json-rpc-engine` middleware so that we can apply its logic to incoming JSON-RPC requests.

Once the permission middleware is injected into our middleware stack, every JSON-RPC request will be handled in one of the following ways:

- If the requested method is neither restricted nor unrestricted, the request will be rejected with a `methodNotFound` error.
- If the requested method is unrestricted, it will pass through the middleware unmodified.
- If the requested method is restricted, the enforcer will attempt to get the permission corresponding to the subject and target, and:
  - If a permission is found, call the corresponding method with the request parameters.
  - If a permission is not found, reject the request with an `unauthorized` error.

### Caveats

Caveats are objects associated with permissions that impose arbitrary restrictions on restricted method requests.
Every permission has a `caveats` field, which is either an array of caveats or `null`.
Every caveat has a string `type`, and every type has an associated function that is used to apply the caveat to a restricted method request.
When the `PermissionController` is constructed, the consumer specifies the available caveat types and their implementations.

> In `rpc-cap`, caveat types were specified by `rpc-cap` itself, and the consumer had to choose from the available types.
> This did not end up being easy to reason about or work with in practice.
> Now, caveat types and their implementations are provided by the consumer, just like the restricted methods and their implementations.

## Examples

### Construction

```typescript
// To construct a permission controller, we first need to define the caveat
// types and restricted methods

const caveatSpecifications = {
  filterArrayResponse: {
    type: 'filterArrayResponse',
    // If a permission has any caveats, its corresponding restricted method
    // implementation is decorated / wrapped with the implementations of its
    // caveats, using the caveat's decorator function.
    decorator: ((
        // Restricted methods and other caveats can be async, so we have to
        // assume that the method is async.
        method: AsyncRestrictedMethodImplementation<Json, string[]>,
        caveat: { type: 'filterArrayResponse'; value: string[] },
      ) =>
      async (args: RestrictedMethodArgs<Json>) => {
        const result = await method(args);
        return Array.isArray(result)
          ? result.filter(caveat.value.includes)
          : result;
      }) as CaveatDecorator<Json>,
  },
};

const permissionSpecifications = {
  wallet_getSecretArray: {
    // i.e. the restricted method name
    target: 'wallet_getSecretArray',
    methodImplementation: (_args: RestrictedMethodArgs<Json>) => {
      return ['secret1', 'secret2', 'secret3'];
    },
  },
};

const permissionController = new PermissionController({
  caveatSpecifications,
  messenger: controllerMessenger, // assume this was given
  permissionSpecifications,
  unrestrictedMethods: ['wallet_unrestrictedMethod'],
});

const permissionEnforcer = permissionController.enforcer;
```

### Adding the Permission Middleware

```typescript
// This should take place where a middleware stack is created for a particular
// subject.

// The subject could be a port, stream, socket, etc.
const origin = getOrigin(subject);

const engine = new JsonRpcEngine();
engine.push(/* your various middleware*/);
engine.push(permissionEnforcer.createPermissionMiddleware({ origin }));
// Your middleware stack is now permissioned
```

### Calling a Restricted Method Internally

```typescript
// Sometimes, we need to call a restricted method internally, as a particular subject.
permissionEnforcer.executeRestrictedMethod(origin, 'wallet_getSecretArray');

// If the restricted method has any parameters, they are given as the third
// argument to executeRestrictedMethod().
permissionEnforcer.executeRestrictedMethod(origin, 'wallet_getSecret', {
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
