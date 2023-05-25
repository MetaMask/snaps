import {ChangeEvent, FunctionComponent, useState} from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input, InputGroup,
  InputRightElement
} from "@chakra-ui/react";
import {useInstallSnapMutation} from "../store";
import {useDispatch, useSelector} from "../hooks";
import {getSnaps, setSnaps} from "../store/reducer";

export const InstallSnaps: FunctionComponent = () => {
  const [installSnap, { isLoading }] = useInstallSnapMutation();
  const amount = useSelector(getSnaps);
  const dispatch = useDispatch();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setSnaps(Math.trunc(Number(event.target.value))));
  }

  const handleClick = () => {
    installSnap(amount);
  }

  return (
    <FormControl marginBottom="4">
      <FormLabel>
        Number of Snaps
      </FormLabel>
      <InputGroup>
        <Input type='number' min={1} max={100} value={amount} onChange={handleChange} />
        <InputRightElement width='4rem'>
          <Button onClick={handleClick} isLoading={isLoading}>Install</Button>
        </InputRightElement>
      </InputGroup>
    </FormControl>
  );
}
