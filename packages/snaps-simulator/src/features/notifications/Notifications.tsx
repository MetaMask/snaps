import { useToast } from '@chakra-ui/react';
import { FunctionComponent, useEffect } from 'react';

import { useDispatch, useSelector } from '../../hooks';
import { getNotifications, removeNotification } from './slice';

export const Notifications: FunctionComponent = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(getNotifications);
  const toast = useToast();

  useEffect(() => {
    for (const notification of notifications) {
      toast({
        position: 'top',
        description: notification.message,
      });

      dispatch(removeNotification(notification.id));
    }
  }, [notifications, dispatch, toast]);

  return null;
};
