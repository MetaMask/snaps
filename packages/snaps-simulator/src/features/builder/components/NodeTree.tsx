import { Box, Flex } from '@chakra-ui/react';
import type { Component } from '@metamask/snaps-ui';
import type {
  NodeModel,
  NodeRender,
  TreeMethods,
} from '@minoru/react-dnd-treeview';
import { Tree } from '@minoru/react-dnd-treeview';
import type { FunctionComponent } from 'react';
import { useEffect, useRef } from 'react';

import { Node } from './Node';
import { Start } from './Start';

export type NodeTreeProps = {
  items: NodeModel<Component>[];
  setItems: (items: NodeModel<Component>[]) => void;
};

/**
 * A node tree, which renders the UI components in the builder.
 *
 * @param props - The props of the component.
 * @param props.items - The items to render in the tree.
 * @param props.setItems - A function to set the items in the tree.
 * @returns A node tree component.
 */
export const NodeTree: FunctionComponent<NodeTreeProps> = ({
  items,
  setItems,
}) => {
  const ref = useRef<TreeMethods>(null);

  const handleChange = (node: NodeModel<Component>, value: string) => {
    // TODO: This code is a mess.
    const newItems: any = items.map((item) => {
      if (item.id === node.id) {
        return {
          ...item,
          data: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
            type: item.data!.type,
            value,
          },
          text: value,
        };
      }

      return item;
    });

    setItems(newItems);
  };

  const handleDrop = (newItems: NodeModel<Component>[]) => {
    setItems(newItems);
  };

  const handleClose = (node: NodeModel<Component>) => {
    const newItems = items.filter(
      (item) => item.id !== node.id && item.parent !== node.id,
    );

    setItems(newItems);
  };

  const handleRender: NodeRender<Component> = (node, { depth, isDragging }) => {
    if (items.length <= 1) {
      return <Start />;
    }

    return (
      <Node
        node={node}
        depth={depth}
        onChange={handleChange}
        onClose={handleClose}
        isDragging={isDragging}
      />
    );
  };

  const handleRenderPlaceholder = () => {
    return <Box width="100%" height="20px" />;
  };

  const handleCanDrag = (node?: NodeModel<Component>) => {
    if (node) {
      return node.id >= 2;
    }

    return false;
  };

  const handleCanDrop = (
    _tree: NodeModel<Component>[],
    {
      dropTarget,
      dropTargetId,
    }: {
      dropTarget?: NodeModel<Component> | undefined;
      dropTargetId?: string | number;
    },
  ) => {
    if (dropTargetId) {
      return dropTarget?.droppable && dropTargetId > 0;
    }

    return false;
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.openAll();
    }
  }, [items, ref]);

  return (
    <Flex
      border="1px solid"
      borderColor="border.default"
      borderRadius="lg"
      flex="1"
      sx={{
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '& > ul': {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          marginY: '4',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '& > li': {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            marginTop: '0',
          },
        },
        ul: { listStyleType: 'none' },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        li: { marginTop: '2' },
      }}
    >
      <Tree
        ref={ref}
        tree={items}
        rootId={0}
        render={handleRender}
        insertDroppableFirst={false}
        canDrag={handleCanDrag}
        canDrop={handleCanDrop}
        onDrop={handleDrop}
        initialOpen={true}
        sort={false}
        extraAcceptTypes={['template']}
        placeholderRender={handleRenderPlaceholder}
      />
    </Flex>
  );
};
