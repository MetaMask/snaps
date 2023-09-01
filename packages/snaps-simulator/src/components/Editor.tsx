import type { BoxProps } from '@chakra-ui/react';
import { Box, useColorMode } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';
import type { monaco, MonacoEditorProps } from 'react-monaco-editor';
import MonacoEditor from 'react-monaco-editor';

import {
  JSON_RPC_SCHEMA,
  JSON_RPC_SCHEMA_URL,
  SAMPLE_JSON_RPC_REQUEST,
} from '../features/handlers/json-rpc/schema';

export type EditorProps = MonacoEditorProps & BoxProps;

/**
 * Editor component. This uses Monaco Editor to provide a JSON editor.
 *
 * @param props - The props.
 * @param props.border - The border.
 * @param props.borderRadius - The border radius.
 * @returns The editor component.
 */
export const Editor: FunctionComponent<EditorProps> = ({
  border = '1px solid',
  ...props
}) => {
  const { colorMode } = useColorMode();

  const handleMount = (editor: typeof monaco) => {
    // Define a theme with the proper background
    editor.editor.defineTheme('vs-dark-custom', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'editor.background': '#24272A',
      },
    });
    editor.languages.json?.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: JSON_RPC_SCHEMA_URL,
          fileMatch: ['*'],
          schema: JSON_RPC_SCHEMA,
        },
      ],
    });
  };

  return (
    <Box
      width="100%"
      padding="4"
      border={border}
      borderColor="gray.muted"
      borderRadius="md"
      flex="1"
    >
      <MonacoEditor
        language="json"
        editorWillMount={handleMount}
        value={SAMPLE_JSON_RPC_REQUEST}
        theme={colorMode === 'light' ? 'vs-light' : 'vs-dark-custom'}
        {...props}
        options={{
          tabSize: 2,
          scrollBeyondLastLine: false,
          renderLineHighlight: 'none',
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: 'visible',
            verticalScrollbarSize: 5,
          },
          minimap: {
            enabled: false,
          },
          lineNumbers: 'off',
          automaticLayout: true,
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 0,
          ...props.options,
        }}
      />
    </Box>
  );
};
