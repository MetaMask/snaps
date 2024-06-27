import type { BoxProps } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';
import type { MonacoEditorProps } from 'react-monaco-editor';
export declare type EditorProps = MonacoEditorProps & BoxProps;
/**
 * Editor component. This uses Monaco Editor to provide a JSON editor.
 *
 * @param props - The props.
 * @param props.border - The border.
 * @param props.borderRadius - The border radius.
 * @returns The editor component.
 */
export declare const Editor: FunctionComponent<EditorProps>;
