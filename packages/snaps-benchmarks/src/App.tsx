import {
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { FunctionComponent } from 'react';

import {
  InstalledSnaps,
  InstallSnaps,
  RunSnaps,
  SourceCodeForm,
} from './components';

export const App: FunctionComponent = () => {
  return (
    <Container paddingY="8">
      <Tabs>
        <TabList>
          <Tab>Benchmark</Tab>
          <Tab>Settings</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <InstallSnaps />
            <RunSnaps />
            <InstalledSnaps />
          </TabPanel>
          <TabPanel>
            <SourceCodeForm />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};
