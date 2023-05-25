import {
  ChangeEvent,
  FormEvent,
  FunctionComponent,
  useEffect,
  useState
} from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Spinner,
  Textarea
} from "@chakra-ui/react";
import {useGetSourceCodeQuery, useSetSourceCodeMutation} from "../store";

export const SourceCodeForm: FunctionComponent = () => {
  const { data } = useGetSourceCodeQuery(undefined);
  const [setSourceCode, { isLoading: isSubmitting }] = useSetSourceCodeMutation();

  const [value, setValue] = useState(data);

  useEffect(() => {
    setValue(data);
  }, [data]);

  if (!data) {
    return <Spinner />;
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSourceCode(value);
  }

  return (
        <form onSubmit={handleSubmit}>
          <FormControl marginBottom="2">
            <FormLabel>
              Source Code
            </FormLabel>
            <Textarea value={value} onChange={handleChange} />
          </FormControl>
          <Button type='submit' isLoading={isSubmitting}>Submit</Button>
        </form>
    )
};
