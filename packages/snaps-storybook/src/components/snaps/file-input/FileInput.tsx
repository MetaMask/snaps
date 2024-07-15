import { Box, Text, useStyleConfig } from '@chakra-ui/react';
import { dataAttr } from '@chakra-ui/utils';
import type { FileInputProps } from '@metamask/snaps-sdk/jsx';
import type { ChangeEvent, FunctionComponent, DragEvent } from 'react';
import { useRef, useState } from 'react';

import { ImportIcon } from '../../icons';
import type { RenderProps } from '../../Renderer';

/**
 * The file input component renders a drop zone for users to upload files. It
 * can also be clicked to open a file picker dialog.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the file input field. This is used to
 * identify the state in the form data.
 * @param props.accept - The types of files that the file input can accept. This is
 * used to filter the files that the user can select when the input field is
 * clicked.
 * @param props.compact - Whether to render the file input in compact mode.
 * @returns The file input element.
 */
export const FileInput: FunctionComponent<RenderProps<FileInputProps>> = ({
  name,
  accept,
  compact,
}) => {
  const styles = useStyleConfig('FileInput', {
    variant: compact ? 'compact' : 'default',
  });

  const ref = useRef<HTMLInputElement>(null);
  const [isActive, setActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleClick = () => {
    ref.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFileName(file?.name ?? null);
  };

  const handleDragOver = (event: DragEvent<HTMLSpanElement>) => {
    event.preventDefault();
    setActive(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLSpanElement>) => {
    event.preventDefault();
    setActive(false);
  };

  const handleDrop = (event: DragEvent<HTMLSpanElement>) => {
    event.preventDefault();
    setActive(false);

    const file = event.dataTransfer?.files?.[0] ?? null;
    setFileName(file?.name ?? null);
  };

  return (
    <Box
      __css={styles}
      data-active={dataAttr(isActive)}
      data-selected={dataAttr(Boolean(fileName))}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={ref}
        type="file"
        name={name}
        onChange={handleChange}
        accept={accept?.join(',')}
        hidden
      />
      <ImportIcon />
      {!compact &&
        (fileName ? (
          <Text isTruncated>{fileName}</Text>
        ) : (
          <Text>Drop your file here</Text>
        ))}
    </Box>
  );
};
