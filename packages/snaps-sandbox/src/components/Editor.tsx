import { Bleed, Box, Spinner } from '@chakra-ui/react';
import type { Monaco, EditorProps } from '@monaco-editor/react';
import MonacoEditor from '@monaco-editor/react';
import type { FunctionComponent } from 'react';

import { JSON_RPC_SCHEMA, JSON_RPC_SCHEMA_URL } from '../editor';

/**
 * A wrapper of the Monaco editor component, which sets some of the default
 * options and the JSON-RPC schema.
 *
 * @param props - The component props.
 * @param props.options - The options to pass to the Monaco editor.
 * @returns The Monaco editor component.
 */
export const Editor: FunctionComponent<EditorProps> = ({
  options,
  ...props
}) => {
  const handleMount = (monaco: Monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: JSON_RPC_SCHEMA_URL,
          schema: JSON_RPC_SCHEMA,
          fileMatch: ['*'],
        },
      ],
    });
  };

  return (
    <Bleed inlineStart="4" asChild={true}>
      <Box
        flex="1"
        data-testid="editor"
        css={{
          '& .monaco-editor': {
            position: 'absolute',
          },
        }}
      >
        <MonacoEditor
          height="40rem"
          language="json"
          beforeMount={handleMount}
          loading={<Spinner />}
          options={{
            automaticLayout: true,
            contextmenu: false,
            folding: false,
            glyphMargin: false,
            hideCursorInOverviewRuler: true,
            lineNumbersMinChars: 3,
            lineNumbers: 'on',
            minimap: {
              enabled: false,
            },
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            scrollBeyondLastLine: false,
            scrollbar: {
              verticalScrollbarSize: 4,
            },
            renderLineHighlight: 'none',
            tabSize: 2,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            ...options,
          }}
          {...props}
        />
      </Box>
    </Bleed>
  );
};
