import { useTabsContext } from '@chakra-ui/react';
import { DialogType } from '@metamask/rpc-methods';
import type { FunctionComponent } from 'react';
import { useEffect } from 'react';

import {
  AlertDialog,
  ConfirmationDialog,
  PromptDialog,
} from '../../../components';
import { useDispatch, useSelector } from '../../../hooks';
import { getUserInterface, resolveUserInterface } from '../../simulation';

export const UserInterface: FunctionComponent = () => {
  const dispatch = useDispatch();
  const ui = useSelector(getUserInterface);
  const tab = useTabsContext();

  useEffect(() => {
    tab.setSelectedIndex(1);
  }, [tab]);

  if (!ui) {
    return null;
  }

  const { snapName, snapId, type, node } = ui;

  switch (type) {
    case DialogType.Alert: {
      const handleClose = () => {
        dispatch(resolveUserInterface(null));
      };

      return (
        <AlertDialog
          snapName={snapName}
          snapId={snapId}
          node={node}
          onClose={handleClose}
        />
      );
    }
    case DialogType.Confirmation: {
      const handleCancel = () => {
        dispatch(resolveUserInterface(false));
      };

      const handleApprove = () => {
        dispatch(resolveUserInterface(true));
      };

      return (
        <ConfirmationDialog
          snapName={snapName}
          snapId={snapId}
          node={node}
          onCancel={handleCancel}
          onApprove={handleApprove}
        />
      );
    }
    case DialogType.Prompt: {
      const handleCancel = () => {
        dispatch(resolveUserInterface(null));
      };

      const handleSubmit = (value: string) => {
        dispatch(resolveUserInterface(value));
      };

      return (
        <PromptDialog
          snapName={snapName}
          snapId={snapId}
          node={node}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      );
    }
    default:
      return null;
  }
};
