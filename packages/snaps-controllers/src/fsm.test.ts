import { AssertionError } from '@metamask/utils';
import type { StateMachine } from '@xstate/fsm';
import { createMachine, interpret } from '@xstate/fsm';
import type { InitEvent } from '@xstate/fsm/lib/types';

import { forceStrict, validateMachine } from './fsm';

type Context = Record<string, never>;

type Events = { type: 'toA' | 'toB' | 'toC'; guardTrap?: true };

type States = {
  value: 'A' | 'B' | 'C' | 'Empty';
  context: Context;
};

const mockGuard = (_: Context, event: Events | InitEvent) =>
  event.type !== 'xstate.init' && !event.guardTrap;

const mockAction = () => {
  /* do nothing */
};

const MOCK_CONFIG: StateMachine.Config<Context, Events, States> = {
  initial: 'A',
  context: {},
  states: {
    A: {
      entry: [mockAction, 'mockEffect', 'mockEffect2'],
      exit: 'mockEffect',
      on: {
        toB: 'B',
        toC: { target: 'C', cond: mockGuard },
      },
    },
    B: {
      entry: ['mockEffect'],
      exit: [mockAction],
      on: {
        toA: { target: 'A', actions: mockAction },
        toC: { target: 'C', cond: mockGuard, actions: [mockAction] },
      },
    },
    C: {
      on: {
        toB: { target: 'B', actions: ['mockEffect', mockAction] },
      },
    },
    Empty: {},
  },
};

const MOCK_MACHINE = createMachine(MOCK_CONFIG, {
  actions: { mockEffect: mockAction, mockEffect2: mockAction },
});

describe('validateMachine', () => {
  it("doesn't throw on success", () => {
    const machine = createMachine(MOCK_CONFIG, {
      actions: { mockEffect: mockAction, mockEffect2: mockAction },
    });
    expect(() => validateMachine(machine)).not.toThrow();
  });

  it('throws on no implementation', () => {
    const machine = createMachine(MOCK_CONFIG, {
      actions: { mockEffect2: mockAction },
    });
    expect(() => validateMachine(machine)).toThrow(
      'Action "mockEffect" doesn\'t have an implementation',
    );
  });
});

describe('forceStrict', () => {
  let interpreter: StateMachine.Service<Context, Events, States>;

  beforeEach(() => {
    interpreter = interpret(MOCK_MACHINE);
    forceStrict(interpreter);
  });

  it('throws when not started', () => {
    expect(() => interpreter.send('toB')).toThrow(AssertionError);
  });

  it("doesn't throw on valid transition", () => {
    interpreter.start();
    expect(() => interpreter.send('toB')).not.toThrow();
  });

  it('throws on invalid transition', () => {
    interpreter.start();
    interpreter.send('toC');
    expect(() => interpreter.send('toA')).toThrow(
      new AssertionError({ message: 'Invalid state transition' }),
    );
  });

  it('throws on guard fail', () => {
    interpreter.start();
    expect(() => interpreter.send({ type: 'toC', guardTrap: true })).toThrow(
      AssertionError,
    );
  });
});
