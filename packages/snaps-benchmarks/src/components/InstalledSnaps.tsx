import {FunctionComponent} from "react";
import {useGetSnapsQuery} from "../store";
import {UnorderedList, ListItem, Text, Heading, Box} from "@chakra-ui/react";

export const InstalledSnaps: FunctionComponent = () => {
  const { data } = useGetSnapsQuery(undefined);

  if (!data) {
    return (
      <Text>No snaps installed.</Text>
    )
  }

  return (
    <Box>
      <Heading as='h3' fontSize='xl' marginBottom='2'>Installed Snaps</Heading>
      <UnorderedList>
        {Object.keys(data).map((snapId) => (
          <ListItem key={snapId}>{snapId}</ListItem>
        ))}
      </UnorderedList>
    </Box>
  )
}
