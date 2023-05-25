import {FunctionComponent} from "react";
import {useGetSnapsQuery} from "../store";
import {Button} from "@chakra-ui/react";
import {useEthereumProvider, useSelector} from "../hooks";
import {getSnaps} from "../store/reducer";

export const RunSnaps: FunctionComponent = () => {
  const { data } = useGetSnapsQuery(undefined);
  const provider = useEthereumProvider();
  const amount = useSelector(getSnaps);

  const handleClick = () => {
    if (!data) {
      return;
    }

    console.time('runSnaps');

    const snapIds = Object.keys(data).reverse().slice(0, amount);
    const promises = snapIds.map(async (snapId) => await provider?.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId,
          request: {
            method: 'run',
          }
        }
      }));

    Promise.all(promises).then((results) => {
      results.forEach((result, index) => {
        console.log(`Snap ${snapIds[index]} result:`, result);
      });

      console.timeEnd('runSnaps');
    });
  }

  return (
    <Button onClick={handleClick} disabled={!data} marginBottom="8">Run Snaps</Button>
  );
}
