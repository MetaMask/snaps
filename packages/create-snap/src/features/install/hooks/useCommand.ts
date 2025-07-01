import { execa } from 'execa';
import { useCallback, useEffect, useState } from 'react';

export type CommandOutput = {
  type: 'stdout' | 'stderr' | 'other';
  data: string;
};

/**
 *
 * @param command
 * @param args
 */
export function useCommand(command: string, args: string[] = []) {
  const [output, setOutput] = useState<CommandOutput[]>([
    {
      type: 'other',
      data: `${command} ${args.join(' ')}`,
    },
  ]);

  const run = useCallback(async () => {
    const execution = execa({ reject: false })`${command} ${args.join(' ')}`;
    execution.stdout?.on('data', (data: string) => {
      setOutput((prev) => [
        ...prev,
        { type: 'stdout', data: data.toString().trim() },
      ]);
    });

    execution.stderr?.on('data', (data: string) => {
      setOutput((prev) => [
        ...prev,
        { type: 'stderr', data: data.toString().trim() },
      ]);
    });

    const result = await execution;
    setOutput((previousOutput) => [
      ...previousOutput,
      {
        type: 'other',
        data: `Command completed with code ${result.exitCode}.`,
      },
    ]);
  }, [command, args]);

  return {
    output,
    run,
  };
}
