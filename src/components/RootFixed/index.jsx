import { RootPortal } from '@tarojs/components';
import { isSkyline } from '../../utils/env';

export default function RootFixed({ children }) {
  if (isSkyline()) {
    return <RootPortal>{children}</RootPortal>;
  }
  return children;
}
