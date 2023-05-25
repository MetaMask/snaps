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
  InputLeftAddon,
  InputGroup,
  Select,
} from '@chakra-ui/react';
import { FormEvent, useState } from 'react';

import { useDispatch, useSelector } from '../../hooks';
import {
  getOpen,
  getSesEnabled,
  getSnapId,
  getSrp,
  setOpen,
  setSnapId,
} from './slice';
import {
  SnapIdPrefixes,
  getSnapPrefix,
  stripSnapPrefix,
} from '@metamask/snaps-utils';

export const Configuration = () => {
  const dispatch = useDispatch();
  const snapUrl = useSelector(getSnapId);
  const srp = useSelector(getSrp);
  const sesEnabled = useSelector(getSesEnabled);
  const isOpen = useSelector(getOpen);

  const [snapIdInput, setSnapIdInput] = useState(stripSnapPrefix(snapUrl));
  const [snapIdPrefix, setSnapIdPrefix] = useState(getSnapPrefix(snapUrl));

  const handleClose = () => {
    dispatch(setSnapId(`${snapIdPrefix}:${snapIdInput}`));
    dispatch(setOpen(false));
  };

  const handleSnapPrefixChange = (event: FormEvent<HTMLSelectElement>) => {
    setSnapIdPrefix(event.currentTarget.value as SnapIdPrefixes);
  };

  const handleSnapUrlChange = (event: FormEvent<HTMLInputElement>) => {
    setSnapIdInput(event.currentTarget.value);
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
            <FormLabel>Snap location</FormLabel>
            <InputGroup>
              <InputLeftAddon px="0" bg="white" borderColor="border.default">
                <Select
                  border="none"
                  onChange={handleSnapPrefixChange}
                  value={snapIdPrefix}
                >
                  <option value="local">local</option>
                  <option value="npm">npm</option>
                </Select>
              </InputLeftAddon>
              <Input
                type="text"
                value={snapIdInput}
                onChange={handleSnapUrlChange}
              />
            </InputGroup>

            <FormLabel>Environment SRP</FormLabel>
            <Textarea
              value={srp}
              readOnly={true}
              color="text.muted"
              fontSize="sm"
              // onChange={handleSrpChange}
            />

            <HStack alignItems="center" justifyContent="space-between">
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
