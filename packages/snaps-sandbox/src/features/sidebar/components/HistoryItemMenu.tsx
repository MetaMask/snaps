import { IconButton, Menu, Portal } from '@chakra-ui/react';
import type { MenuTriggerProps } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';
import type { FunctionComponent } from 'react';
import { FiMoreHorizontal, FiStar, FiTrash } from 'react-icons/fi';

import type { HistoryEntry } from '../../../state';
import { historyAtom } from '../../../state';

export type HistoryItemMenuProps = Omit<MenuTriggerProps, 'asChild'> & {
  /**
   * The history entry to display.
   */
  entry: HistoryEntry;
};

export const HistoryItemMenu: FunctionComponent<HistoryItemMenuProps> = ({
  entry,
  ...props
}) => {
  const dispatch = useSetAtom(historyAtom);

  const handleClickFavorite = () => {
    dispatch({
      type: 'update',
      payload: {
        ...entry,
        favorite: !entry.favorite,
      },
    });
  };

  const handleClickDelete = () => {
    dispatch({
      type: 'remove',
      payload: entry,
    });
  };

  return (
    <Menu.Root>
      <Menu.Trigger {...props} asChild={true}>
        <IconButton
          variant="plain"
          aria-label="More options"
          height="auto"
          padding="1"
        >
          <FiMoreHorizontal />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content
            zIndex={2}
            borderRadius="lg"
            boxShadow="md"
            padding={2}
            backgroundColor="white"
            width="fit-content"
          >
            <Menu.Item value="favorite" onClick={handleClickFavorite}>
              <FiStar />
              Favorite
            </Menu.Item>
            <Menu.Item value="edit" onClick={handleClickDelete}>
              <FiTrash />
              Delete
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};
