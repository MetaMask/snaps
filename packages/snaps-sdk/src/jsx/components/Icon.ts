import { createSnapComponent } from '../component';

// Copied from https://github.com/MetaMask/metamask-extension/blob/main/ui/components/component-library/icon/icon.types.ts
// Currently requires manual syncing when new icon is added.
export enum IconName {
  AddSquare = 'add-square',
  Add = 'add',
  Arrow2Down = 'arrow-2-down',
  Arrow2Left = 'arrow-2-left',
  Arrow2Right = 'arrow-2-right',
  Arrow2Up = 'arrow-2-up',
  Arrow2UpRight = 'arrow-2-up-right',
  ArrowDoubleLeft = 'arrow-double-left',
  ArrowDoubleRight = 'arrow-double-right',
  ArrowDown = 'arrow-down',
  ArrowLeft = 'arrow-left',
  ArrowRight = 'arrow-right',
  ArrowUp = 'arrow-up',
  BankToken = 'bank-token',
  Bank = 'bank',
  Book = 'book',
  Bookmark = 'bookmark',
  Bridge = 'bridge',
  Calculator = 'calculator',
  CardPos = 'card-pos',
  CardToken = 'card-token',
  Card = 'card',
  Category = 'category',
  Chart = 'chart',
  CheckBold = 'check-bold',
  Check = 'check',
  Clock = 'clock',
  Close = 'close',
  CodeCircle = 'code-circle',
  Coin = 'coin',
  Confirmation = 'confirmation',
  Connect = 'connect',
  CopySuccess = 'copy-success',
  Copy = 'copy',
  Customize = 'customize',
  Danger = 'danger',
  Dark = 'dark',
  Data = 'data',
  Diagram = 'diagram',
  DocumentCode = 'document-code',
  DragDrop = 'drag-drop',
  DraggingAnimation = 'dragging-animation',
  PinningAnimation = 'pinning-animation',
  Edit = 'edit',
  Eraser = 'eraser',
  Ethereum = 'ethereum',
  Expand = 'expand',
  Explore = 'explore',
  Export = 'export',
  EyeSlash = 'eye-slash',
  Eye = 'eye',
  Filter = 'filter',
  Flag = 'flag',
  FlashSlash = 'flash-slash',
  Flash = 'flash',
  FullCircle = 'full-circle',
  Gas = 'gas',
  GlobalSearch = 'global-search',
  Global = 'global',
  Graph = 'graph',
  Hardware = 'hardware',
  Heart = 'heart',
  Hierarchy = 'hierarchy',
  Home = 'home',
  Import = 'import',
  Info = 'info',
  Key = 'key',
  Light = 'light',
  Link = 'link',
  Loading = 'loading',
  LockCircle = 'lock-circle',
  LockSlash = 'lock-slash',
  Lock = 'lock',
  Login = 'login',
  Logout = 'logout',
  Menu = 'menu',
  MessageQuestion = 'message-question',
  Messages = 'messages',
  MinusBold = 'minus-bold',
  MinusSquare = 'minus-square',
  Minus = 'minus',
  Mobile = 'mobile',
  Money = 'money',
  Monitor = 'monitor',
  MoreHorizontal = 'more-horizontal',
  MoreVertical = 'more-vertical',
  NotificationCircle = 'notification-circle',
  Notification = 'notification',
  PasswordCheck = 'password-check',
  People = 'people',
  Pin = 'pin',
  ProgrammingArrows = 'programming-arrows',
  Custody = 'custody',
  Question = 'question',
  Received = 'received',
  Refresh = 'refresh',
  Save = 'save',
  ScanBarcode = 'scan-barcode',
  ScanFocus = 'scan-focus',
  Scan = 'scan',
  Scroll = 'scroll',
  Search = 'search',
  SecurityCard = 'security-card',
  SecurityCross = 'security-cross',
  SecurityKey = 'security-key',
  SecuritySearch = 'security-search',
  SecuritySlash = 'security-slash',
  SecurityTick = 'security-tick',
  SecurityTime = 'security-time',
  SecurityUser = 'security-user',
  Security = 'security',
  Send1 = 'send-1',
  Send2 = 'send-2',
  Setting = 'setting',
  Slash = 'slash',
  SnapsMobile = 'snaps-mobile',
  SnapsPlus = 'snaps-plus',
  Snaps = 'snaps',
  Speedometer = 'speedometer',
  Star = 'star',
  Stake = 'stake',
  Student = 'student',
  SwapHorizontal = 'swap-horizontal',
  SwapVertical = 'swap-vertical',
  Tag = 'tag',
  Tilde = 'tilde',
  Timer = 'timer',
  Trash = 'trash',
  TrendDown = 'trend-down',
  TrendUp = 'trend-up',
  UserCircleAdd = 'user-circle-add',
  UserCircleLink = 'user-circle-link',
  UserCircleRemove = 'user-circle-remove',
  UserCircle = 'user-circle',
  User = 'user',
  WalletCard = 'wallet-card',
  WalletMoney = 'wallet-money',
  Wallet = 'wallet',
  Warning = 'warning',
  Twitter = 'twitter',
  QrCode = 'qr-code',
  UserCheck = 'user-check',
  Unpin = 'unpin',
  Ban = 'ban',
  Bold = 'bold',
  CircleX = 'circle-x',
  Download = 'download',
  FileIcon = 'file',
  Flask = 'flask',
  Plug = 'plug',
  Share = 'share',
  Square = 'square',
  Tint = 'tint',
  Upload = 'upload',
  Usb = 'usb',
  Wifi = 'wifi',
  PlusMinus = 'plus-minus',
}

/**
 * The props of the {@link Icon} component.
 *
 * @property name - The name of the icon to display from a pre-defined list.
 * @property color - The color of the displayed icon.
 * @property size - The size of the displayed icon. Use `inherit` to size it the same as the text.
 */
export type IconProps = {
  name: `${IconName}`;
  color?: 'default' | 'primary' | 'muted' | undefined;
  size?: 'md' | 'inherit' | undefined;
};

const TYPE = 'Icon';

/**
 * An icon component which is used to display an icon from a pre-defined list.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the icon to display from a pre-defined list.
 * @param props.color - The color of the displayed icon.
 * @param props.size - The size of the displayed icon. Use `inherit` to size it the same as the text.
 * @returns An icon element.
 * @example
 * <Icon name="warning" color="warning" size="md" />
 */
export const Icon = createSnapComponent<IconProps, typeof TYPE>(TYPE);

/**
 * An icon element.
 *
 * @see Icon
 */
export type IconElement = ReturnType<typeof Icon>;
