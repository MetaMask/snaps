import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalOverlay,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Switch,
  HStack,
  Textarea,
  Text,
  Divider,
} from '@chakra-ui/react';
import { FormEvent } from 'react';

import { useDispatch, useSelector } from '../../hooks';
import {
  getOpen,
  getSesEnabled,
  getSnapUrl,
  getSrp,
  setOpen,
  setSnapUrl,
} from './slice';

export const Configuration = () => {
  const dispatch = useDispatch();
  const snapUrl = useSelector(getSnapUrl);
  const srp = useSelector(getSrp);
  const sesEnabled = useSelector(getSesEnabled);
  const isOpen = useSelector(getOpen);

  const handleClose = () => {
    dispatch(setOpen(false));
  };

  const handleSnapUrlChange = (event: FormEvent<HTMLInputElement>) => {
    dispatch(setSnapUrl(event.currentTarget.value));
  };

  // const handleSrpChange = (event: FormEvent<HTMLTextAreaElement>) => {
  //   dispatch(setSrp(event.currentTarget.value));
  // };
  //
  // const handleSesToggle = () => {
  //   dispatch(setSesEnabled(!sesEnabled));
  // };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader pb="0">
          <Text fontSize="md">Configure environment</Text>
          <Text fontSize="sm" color="#535A61" fontWeight="400">
            Settings and variables to setup the simulation context.
          </Text>
        </ModalHeader>
        <Divider my="4" />
        <ModalBody pt="0">
          <FormControl>
            <FormLabel>Local server location</FormLabel>
            <Input type="text" value={snapUrl} onChange={handleSnapUrlChange} />

            <FormLabel mt="4">Environment SRP</FormLabel>
            <Textarea
              value={srp}
              readOnly={true}
              color="text.muted"
              fontSize="sm"
              // onChange={handleSrpChange}
            />

            <HStack mt="6" alignItems="center" justifyContent="space-between">
              <FormLabel mb="0" htmlFor="ses-switch">
                Secure EcmaScript (SES)
              </FormLabel>
              <Switch
                id="ses-switch"
                size="lg"
                isChecked={sesEnabled}
                // onChange={handleSesToggle}
                readOnly={true}
                colorScheme="gray"
              />
            </HStack>
          </FormControl>
        </ModalBody>
        <Divider my="4" />
        <ModalFooter pb="6" pt="2">
          <Button
            fontFamily="default"
            fontWeight="semibold"
            fontSize="sm"
            width="100%"
            onClick={handleClose}
          >
            Apply config
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
