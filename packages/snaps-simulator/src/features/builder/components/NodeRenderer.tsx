import { Box } from '@chakra-ui/react';
import { Component } from '@metamask/snaps-ui';
import { NodeModel } from '@minoru/react-dnd-treeview';
import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Delineator, Window } from '../../../components';
import { Renderer } from '../../renderer';
import { DEFAULT_SNAP_ID, getSnapName } from '../../simulation';
import { nodeModelsToComponent } from '../utils';

export type NodeRendererProps = {
  items: NodeModel<Component>[];
};

/**
 * A node renderer, which renders the result of a node tree. The tree is
 * converted to a component, which is then rendered in the MetaMask window.
 *
 * @param props - The props of the component.
 * @param props.items - The items to render in the tree.
 * @returns A node renderer component.
 */
export const NodeRenderer: FunctionComponent<NodeRendererProps> = ({
  items,
}) => {
  const snapName = useSelector(getSnapName) ?? 'Unknown';
  const node = useMemo(() => nodeModelsToComponent(items), [items]);

  return (
    <Window snapName={snapName} snapId={DEFAULT_SNAP_ID}>
      <Box margin="4" marginTop="0" flex="1">
        <Delineator snapName={snapName}>
          <Renderer node={node} />
        </Delineator>
      </Box>
    </Window>
  );
};
