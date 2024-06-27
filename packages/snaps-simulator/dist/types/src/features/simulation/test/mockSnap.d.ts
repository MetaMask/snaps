import { VirtualFile } from '@metamask/snaps-utils';
export declare const MOCK_SNAP_SOURCE = "\nmodule.exports.onRpcRequest = ({ request }) => {\n  console.log(\"Hello, world!\");\n\n  const { method, id } = request;\n  return method + id;\n};\n";
export declare const MOCK_SNAP_SOURCE_FILE: VirtualFile<string>;
export declare const MOCK_SNAP_ICON = "foo";
export declare const MOCK_SNAP_ICON_FILE: VirtualFile<string>;
