import { literal, object, optional, string } from '@metamask/superstruct';

import { nullUnion, type Describe, type EnumToUnion } from '../../../internals';

/**
 * A note about the existence of both singular and plural variable names here:
 * When dealing with a literal property name, e.g. AlignItems, the constant
 * should match the property. When detailing a collection of things, it should
 * match the plural form of the thing. e.g. Color, TextVariant, Size
 */

/* eslint-disable @typescript-eslint/naming-convention */
export enum Color {
  backgroundDefault = 'background-default',
  backgroundAlternative = 'background-alternative',
  textDefault = 'text-default',
  textAlternative = 'text-alternative',
  textMuted = 'text-muted',
  iconDefault = 'icon-default',
  iconAlternative = 'icon-alternative',
  iconMuted = 'icon-muted',
  borderDefault = 'border-default',
  borderMuted = 'border-muted',
  overlayDefault = 'overlay-default',
  overlayInverse = 'overlay-inverse',
  primaryDefault = 'primary-default',
  primaryAlternative = 'primary-alternative',
  primaryMuted = 'primary-muted',
  primaryInverse = 'primary-inverse',
  errorDefault = 'error-default',
  errorAlternative = 'error-alternative',
  errorMuted = 'error-muted',
  errorInverse = 'error-inverse',
  warningDefault = 'warning-default',
  warningMuted = 'warning-muted',
  warningInverse = 'warning-inverse',
  successDefault = 'success-default',
  successMuted = 'success-muted',
  successInverse = 'success-inverse',
  infoDefault = 'info-default',
  infoMuted = 'info-muted',
  infoInverse = 'info-inverse',
  mainnet = 'mainnet',
  goerli = 'goerli',
  sepolia = 'sepolia',
  lineaGoerli = 'linea-goerli',
  lineaGoerliInverse = 'linea-goerli-inverse',
  lineaSepolia = 'linea-sepolia',
  lineaSepoliaInverse = 'linea-sepolia-inverse',
  lineaMainnet = 'linea-mainnet',
  lineaMainnetInverse = 'linea-mainnet-inverse',
  transparent = 'transparent',
  localhost = 'localhost',
  inherit = 'inherit',
  goerliInverse = 'goerli-inverse',
  sepoliaInverse = 'sepolia-inverse',
}

export enum BackgroundColor {
  backgroundDefault = 'background-default',
  backgroundAlternative = 'background-alternative',
  overlayDefault = 'overlay-default',
  overlayAlternative = 'overlay-alternative',
  primaryDefault = 'primary-default',
  primaryAlternative = 'primary-alternative',
  primaryMuted = 'primary-muted',
  errorDefault = 'error-default',
  errorAlternative = 'error-alternative',
  errorMuted = 'error-muted',
  warningDefault = 'warning-default',
  warningMuted = 'warning-muted',
  successDefault = 'success-default',
  successMuted = 'success-muted',
  infoDefault = 'info-default',
  infoMuted = 'info-muted',
  mainnet = 'mainnet',
  goerli = 'goerli',
  sepolia = 'sepolia',
  lineaGoerli = 'linea-goerli',
  lineaSepolia = 'linea-sepolia',
  lineaMainnet = 'linea-mainnet',
  transparent = 'transparent',
  localhost = 'localhost',
}

export enum BorderColor {
  borderDefault = 'border-default',
  borderMuted = 'border-muted',
  primaryDefault = 'primary-default',
  primaryAlternative = 'primary-alternative',
  primaryMuted = 'primary-muted',
  errorDefault = 'error-default',
  errorAlternative = 'error-alternative',
  errorMuted = 'error-muted',
  warningDefault = 'warning-default',
  warningMuted = 'warning-muted',
  successDefault = 'success-default',
  successMuted = 'success-muted',
  infoDefault = 'info-default',
  infoMuted = 'info-muted',
  mainnet = 'mainnet',
  goerli = 'goerli',
  sepolia = 'sepolia',
  lineaGoerli = 'linea-goerli',
  lineaSepolia = 'linea-sepolia',
  lineaMainnet = 'linea-mainnet',
  transparent = 'transparent',
  localhost = 'localhost',
  backgroundDefault = 'background-default', // exception for border color when element is meant to look "cut out"
}

export enum TextColor {
  textDefault = 'text-default',
  textAlternative = 'text-alternative',
  textMuted = 'text-muted',
  overlayInverse = 'overlay-inverse',
  primaryDefault = 'primary-default',
  primaryInverse = 'primary-inverse',
  errorDefault = 'error-default',
  errorAlternative = 'error-alternative',
  errorInverse = 'error-inverse',
  successDefault = 'success-default',
  successInverse = 'success-inverse',
  warningDefault = 'warning-default',
  warningInverse = 'warning-inverse',
  infoDefault = 'info-default',
  infoInverse = 'info-inverse',
  inherit = 'inherit',
  goerli = 'goerli',
  sepolia = 'sepolia',
  lineaGoerli = 'linea-goerli',
  lineaGoerliInverse = 'linea-goerli-inverse',
  lineaSepolia = 'linea-sepolia',
  lineaSepoliaInverse = 'linea-sepolia-inverse',
  lineaMainnet = 'linea-mainnet',
  lineaMainnetInverse = 'linea-mainnet-inverse',
  goerliInverse = 'goerli-inverse',
  sepoliaInverse = 'sepolia-inverse',
  transparent = 'transparent',
}

export enum IconColor {
  iconDefault = 'icon-default',
  iconAlternative = 'icon-alternative',
  iconMuted = 'icon-muted',
  overlayInverse = 'overlay-inverse',
  primaryDefault = 'primary-default',
  primaryInverse = 'primary-inverse',
  errorDefault = 'error-default',
  errorInverse = 'error-inverse',
  successDefault = 'success-default',
  successInverse = 'success-inverse',
  warningDefault = 'warning-default',
  warningInverse = 'warning-inverse',
  infoDefault = 'info-default',
  infoInverse = 'info-inverse',
  inherit = 'inherit',
  goerli = 'goerli',
  sepolia = 'sepolia',
  lineaGoerli = 'linea-goerli',
  lineaGoerliInverse = 'linea-goerli-inverse',
  lineaSepolia = 'linea-sepolia',
  lineaSepoliaInverse = 'linea-sepolia-inverse',
  lineaMainnet = 'linea-mainnet',
  lineaMainnetInverse = 'linea-mainnet-inverse',
  goerliInverse = 'goerli-inverse',
  sepoliaInverse = 'sepolia-inverse',
  transparent = 'transparent',
}

export enum TypographyVariant {
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
  H7 = 'h7',
  H8 = 'h8',
  H9 = 'h9',
  paragraph = 'p',
  span = 'span',
}

export enum TextVariant {
  displayMd = 'display-md',
  headingLg = 'heading-lg',
  headingMd = 'heading-md',
  headingSm = 'heading-sm',
  bodyLgMedium = 'body-lg-medium',
  bodyMd = 'body-md',
  bodyMdMedium = 'body-md-medium',
  bodyMdBold = 'body-md-bold',
  bodySm = 'body-sm',
  bodySmMedium = 'body-sm-medium',
  bodySmBold = 'body-sm-bold',
  bodyXs = 'body-xs',
  bodyXsMedium = 'body-xs-medium',
  inherit = 'inherit',
}

export enum Size {
  XXS = 'xxs',
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  inherit = 'inherit', // Used for Text, Icon, and Button components to inherit the parent elements font-size
  auto = 'auto',
}

export enum BorderStyle {
  dashed = 'dashed',
  solid = 'solid',
  dotted = 'dotted',
  double = 'double',
  none = 'none',
}

export enum BorderRadius {
  /**
   * 2px
   */
  XS = 'xs',
  /**
   * 4px
   */
  SM = 'sm',
  /**
   * 6px
   */
  MD = 'md',
  /**
   * 8px
   */
  LG = 'lg',
  /**
   * 12px
   */
  XL = 'xl',
  /**
   * 0
   */
  none = 'none',
  /**
   * 9999px
   */
  pill = 'pill',
  /**
   * 50%
   */
  full = 'full',
}

// NOTE: The name of this enum is plural due to the name of property in css is `align-items`,
// which is for aligning all items not one
export enum AlignItems {
  flexStart = 'flex-start',
  flexEnd = 'flex-end',
  center = 'center',
  baseline = 'baseline',
  stretch = 'stretch',
}

export enum JustifyContent {
  flexStart = 'flex-start',
  flexEnd = 'flex-end',
  center = 'center',
  spaceAround = 'space-around',
  spaceBetween = 'space-between',
  spaceEvenly = 'space-evenly',
}

export enum FlexDirection {
  Row = 'row',
  RowReverse = 'row-reverse',
  Column = 'column',
  ColumnReverse = 'column-reverse',
}

export enum FlexWrap {
  Wrap = 'wrap',
  WrapReverse = 'wrap-reverse',
  NoWrap = 'nowrap',
}

export enum Display {
  Block = 'block',
  Flex = 'flex',
  Grid = 'grid',
  InlineBlock = 'inline-block',
  Inline = 'inline',
  InlineFlex = 'inline-flex',
  InlineGrid = 'inline-grid',
  ListItem = 'list-item',
  None = 'none',
}

export enum BlockSize {
  Zero = '0',
  Half = '1/2',
  OneThird = '1/3',
  TwoThirds = '2/3',
  OneFourth = '1/4',
  TwoFourths = '2/4',
  ThreeFourths = '3/4',
  OneFifth = '1/5',
  TwoFifths = '2/5',
  ThreeFifths = '3/5',
  FourFifths = '4/5',
  OneSixth = '1/6',
  TwoSixths = '2/6',
  ThreeSixths = '3/6',
  FourSixths = '4/6',
  FiveSixths = '5/6',
  OneTwelfth = '1/12',
  TwoTwelfths = '2/12',
  ThreeTwelfths = '3/12',
  FourTwelfths = '4/12',
  FiveTwelfths = '5/12',
  SixTwelfths = '6/12',
  SevenTwelfths = '7/12',
  EightTwelfths = '8/12',
  NineTwelfths = '9/12',
  TenTwelfths = '10/12',
  ElevenTwelfths = '11/12',
  Screen = 'screen',
  Max = 'max',
  Min = 'min',
  Full = 'full',
}

export enum TextAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right',
  Justify = 'justify',
  End = 'end',
  Start = 'start',
}

export enum TextTransform {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Uppercase = 'uppercase',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Lowercase = 'lowercase',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Capitalize = 'capitalize',
}

export enum FontWeight {
  Bold = 'bold',
  Medium = 'medium',
  Normal = 'normal',
}

export enum OverflowWrap {
  BreakWord = 'break-word',
  Anywhere = 'anywhere',
  Normal = 'normal',
}

export enum FontStyle {
  Italic = 'italic',
  Normal = 'normal',
}

export enum Severity {
  Danger = 'danger',
  Warning = 'warning',
  Info = 'info',
  Success = 'success',
}

export type SizeNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | null;

export type SizeNumberAndAuto = SizeNumber | 'auto';

/**
 * Copied from MetaMask extension's design system.
 * Includes all style utility props. This should be used to extend the props of a component.
 */
export type StyleUtilityProps = {
  /**
   * The flex direction of the component.
   *
   *
   */
  flexDirection?: EnumToUnion<FlexDirection>;
  /**
   * The flex wrap of the component.
   *
   *
   */
  flexWrap?: EnumToUnion<FlexWrap>;
  /**
   * The gap between the component's children.
   * Use 1-12 for a gap of 4px-48px.
   *
   */
  gap?: SizeNumber | undefined;
  /**
   * The margin of the component.
   * Use 1-12 for 4px-48px or 'auto'.
   *
   */
  margin?: SizeNumberAndAuto;
  /**
   * The margin-top of the component.
   * Use 1-12 for 4px-48px or 'auto'.
   *
   */
  marginTop?: SizeNumberAndAuto;
  /**
   * The margin-bottom of the component.
   * Use 1-12 for 4px-48px or 'auto'.
   *
   */
  marginBottom?: SizeNumberAndAuto;
  /**
   * The margin-right of the component.
   * Use 1-12 for 4px-48px or 'auto'.
   *
   */
  marginRight?: SizeNumberAndAuto;
  /**
   * The margin-left of the component.
   * Use 1-12 for 4px-48px or 'auto'.
   *
   */
  marginLeft?: SizeNumberAndAuto;
  /**
   * The margin-inline of the component.
   * Use 1-12 for 4px-48px or 'auto'.
   *
   */
  marginInline?: SizeNumberAndAuto;
  /**
   * The margin-inline-start of the component.
   * Use 1-12 for 4px-48px or 'auto'.
   *
   */
  marginInlineStart?: SizeNumberAndAuto;
  /**
   * The margin-inline-end of the component.
   * Use 1-12 for 4px-48px or 'auto'.
   *
   */
  marginInlineEnd?: SizeNumberAndAuto;
  /**
   * The padding of the component.
   * Use 1-12 for 4px-48px.
   *
   */
  padding?: SizeNumber;
  /**
   * The padding-top of the component.
   * Use 1-12 for 4px-48px.
   *
   */
  paddingTop?: SizeNumber;
  /**
   * The padding-bottom of the component.
   * Use 1-12 for 4px-48px.
   *
   */
  paddingBottom?: SizeNumber;
  /**
   * The padding-right of the component.
   * Use 1-12 for 4px-48px.
   *
   */
  paddingRight?: SizeNumber;
  /**
   * The padding-left of the component.
   * Use 1-12 for 4px-48px.
   *
   */
  paddingLeft?: SizeNumber;
  /**
   * The padding-inline of the component.
   * Use 1-12 for 4px-48px.
   *
   */
  paddingInline?: SizeNumber;
  /**
   * The padding-inline-start of the component.
   * Use 1-12 for 4px-48px.
   *
   */
  paddingInlineStart?: SizeNumber;
  /**
   * The padding-inline-end of the component.
   * Use 1-12 for 4px-48px.
   *
   */
  paddingInlineEnd?: SizeNumber;
  /**
   * The border-color of the component.
   *
   */
  borderColor?: EnumToUnion<BorderColor>;
  /**
   * The border-width of the component.
   * Use 1-12 for 1px-12px.
   *
   */
  borderWidth?: SizeNumber;
  /**
   * The border-radius of the component.
   *
   */
  borderRadius?: EnumToUnion<BorderRadius>;
  /**
   * The border-style of the component.
   *
   */
  borderStyle?: EnumToUnion<BorderStyle>;
  /**
   * The align-items of the component.
   *
   */
  alignItems?: EnumToUnion<AlignItems>;
  /**
   * The justify-content of the component.
   *
   */
  justifyContent?: EnumToUnion<JustifyContent>;
  /**
   * The text-align of the component.
   *
   */
  textAlign?: EnumToUnion<TextAlign>;
  /**
   * The display of the component.
   *
   */
  display?: EnumToUnion<Display>;
  /**
   * The width of the component.
   *
   *
   */
  width?: EnumToUnion<BlockSize>;
  /**
   * The min-width of the component.
   *
   *
   */
  minWidth?: EnumToUnion<BlockSize>;
  /**
   * The height of the component.
   *
   *
   */
  height?: EnumToUnion<BlockSize>;
  /**
   * The background-color of the component.
   *
   *
   */
  backgroundColor?: EnumToUnion<BackgroundColor>;
  /**
   * The text-color of the component.
   *
   *
   */
  color?: EnumToUnion<TextColor | IconColor>;
  /**
   * An optional data-testid to apply to the component.
   * TypeScript is complaining about data- attributes which means we need to explicitly define this as a prop.
   * TODO: Allow data- attributes.
   */
  'data-testid'?: string;
};

export const FlexDirectionStruct = nullUnion([
  literal('row'),
  literal('row-reverse'),
  literal('column'),
  literal('column-reverse'),
]);

export const FlexWrapStruct = nullUnion([
  literal('wrap'),
  literal('wrap-reverse'),
  literal('nowrap'),
]);

export const SizeNumberStruct = nullUnion([
  literal(0),
  literal(1),
  literal(2),
  literal(3),
  literal(4),
  literal(5),
  literal(6),
  literal(7),
  literal(8),
  literal(9),
  literal(10),
  literal(11),
  literal(12),
  literal(null),
]);

export const SizeNumberAndAutoStruct = nullUnion([
  SizeNumberStruct,
  literal('auto'),
]);

export const BorderColorStruct = nullUnion([
  literal('border-default'),
  literal('border-muted'),
  literal('primary-default'),
  literal('primary-alternative'),
  literal('primary-muted'),
  literal('error-default'),
  literal('error-alternative'),
  literal('error-muted'),
  literal('warning-default'),
  literal('warning-muted'),
  literal('success-default'),
  literal('success-muted'),
  literal('info-default'),
  literal('info-muted'),
  literal('mainnet'),
  literal('goerli'),
  literal('sepolia'),
  literal('linea-goerli'),
  literal('linea-sepolia'),
  literal('linea-mainnet'),
  literal('transparent'),
  literal('localhost'),
  literal('background-default'),
]);

export const BorderRadiusStruct = nullUnion([
  literal('xs'),
  literal('sm'),
  literal('md'),
  literal('lg'),
  literal('xl'),
  literal('none'),
  literal('pill'),
  literal('full'),
]);

export const BorderStyleStruct = nullUnion([
  literal('dashed'),
  literal('solid'),
  literal('dotted'),
  literal('double'),
  literal('none'),
]);

export const AlignItemsStruct = nullUnion([
  literal('flex-start'),
  literal('flex-end'),
  literal('center'),
  literal('baseline'),
  literal('stretch'),
]);

export const JustifyContentStruct = nullUnion([
  literal('flex-start'),
  literal('flex-end'),
  literal('center'),
  literal('space-around'),
  literal('space-between'),
  literal('space-evenly'),
]);

export const TextAlignStruct = nullUnion([
  literal('left'),
  literal('center'),
  literal('right'),
  literal('justify'),
  literal('end'),
  literal('start'),
]);

export const DisplayStruct = nullUnion([
  literal('block'),
  literal('flex'),
  literal('grid'),
  literal('inline-block'),
  literal('inline'),
  literal('inline-flex'),
  literal('inline-grid'),
  literal('list-item'),
  literal('none'),
]);

export const BlockSizeStruct = nullUnion([
  literal('0'),
  literal('1/2'),
  literal('1/3'),
  literal('2/3'),
  literal('1/4'),
  literal('2/4'),
  literal('3/4'),
  literal('1/5'),
  literal('2/5'),
  literal('3/5'),
  literal('4/5'),
  literal('1/6'),
  literal('2/6'),
  literal('3/6'),
  literal('4/6'),
  literal('5/6'),
  literal('1/12'),
  literal('2/12'),
  literal('3/12'),
  literal('4/12'),
  literal('5/12'),
  literal('6/12'),
  literal('7/12'),
  literal('8/12'),
  literal('9/12'),
  literal('10/12'),
  literal('11/12'),
  literal('screen'),
  literal('max'),
  literal('min'),
  literal('full'),
]);

export const BackgroundColorStruct = nullUnion([
  literal('background-default'),
  literal('background-alternative'),
  literal('overlay-default'),
  literal('overlay-alternative'),
  literal('primary-default'),
  literal('primary-alternative'),
  literal('primary-muted'),
  literal('error-default'),
  literal('error-alternative'),
  literal('error-muted'),
  literal('warning-default'),
  literal('warning-muted'),
  literal('success-default'),
  literal('success-muted'),
  literal('info-default'),
  literal('info-muted'),
  literal('mainnet'),
  literal('goerli'),
  literal('sepolia'),
  literal('linea-goerli'),
  literal('linea-sepolia'),
  literal('linea-mainnet'),
  literal('transparent'),
  literal('localhost'),
]);

export const TextColorStruct = nullUnion([
  literal('text-default'),
  literal('text-alternative'),
  literal('text-muted'),
  literal('overlay-inverse'),
  literal('primary-default'),
  literal('primary-inverse'),
  literal('error-default'),
  literal('error-alternative'),
  literal('error-inverse'),
  literal('success-default'),
  literal('success-inverse'),
  literal('warning-default'),
  literal('warning-inverse'),
  literal('info-default'),
  literal('info-inverse'),
  literal('inherit'),
  literal('goerli'),
  literal('sepolia'),
  literal('linea-goerli'),
  literal('linea-goerli-inverse'),
  literal('linea-sepolia'),
  literal('linea-sepolia-inverse'),
  literal('linea-mainnet'),
  literal('linea-mainnet-inverse'),
  literal('goerli-inverse'),
  literal('sepolia-inverse'),
  literal('transparent'),
]);

export const IconColorStruct = nullUnion([
  literal('icon-default'),
  literal('icon-alternative'),
  literal('icon-muted'),
  literal('overlay-inverse'),
  literal('primary-default'),
  literal('primary-inverse'),
  literal('error-default'),
  literal('error-inverse'),
  literal('success-default'),
  literal('success-inverse'),
  literal('warning-default'),
  literal('warning-inverse'),
  literal('info-default'),
  literal('info-inverse'),
  literal('inherit'),
  literal('goerli'),
  literal('sepolia'),
  literal('linea-goerli'),
  literal('linea-goerli-inverse'),
  literal('linea-sepolia'),
  literal('linea-sepolia-inverse'),
  literal('linea-mainnet'),
  literal('linea-mainnet-inverse'),
  literal('goerli-inverse'),
  literal('sepolia-inverse'),
  literal('transparent'),
]);

export const STYLE_UTILITY_PROPS = {
  flexDirection: optional(FlexDirectionStruct),
  flexWrap: optional(FlexWrapStruct),
  gap: optional(nullUnion([SizeNumberStruct, literal(undefined)])),
  margin: optional(SizeNumberAndAutoStruct),
  marginTop: optional(SizeNumberAndAutoStruct),
  marginBottom: optional(SizeNumberAndAutoStruct),
  marginRight: optional(SizeNumberAndAutoStruct),
  marginLeft: optional(SizeNumberAndAutoStruct),
  marginInline: optional(SizeNumberAndAutoStruct),
  marginInlineStart: optional(SizeNumberAndAutoStruct),
  marginInlineEnd: optional(SizeNumberAndAutoStruct),
  padding: optional(SizeNumberStruct),
  paddingTop: optional(SizeNumberStruct),
  paddingBottom: optional(SizeNumberStruct),
  paddingRight: optional(SizeNumberStruct),
  paddingLeft: optional(SizeNumberStruct),
  paddingInline: optional(SizeNumberStruct),
  paddingInlineStart: optional(SizeNumberStruct),
  paddingInlineEnd: optional(SizeNumberStruct),
  borderColor: optional(BorderColorStruct),
  borderWidth: optional(SizeNumberStruct),
  borderRadius: optional(BorderRadiusStruct),
  borderStyle: optional(BorderStyleStruct),
  alignItems: optional(AlignItemsStruct),
  justifyContent: optional(JustifyContentStruct),
  textAlign: optional(TextAlignStruct),
  display: optional(DisplayStruct),
  width: optional(BlockSizeStruct),
  minWidth: optional(BlockSizeStruct),
  height: optional(BlockSizeStruct),
  backgroundColor: optional(BackgroundColorStruct),
  color: optional(nullUnion([TextColorStruct, IconColorStruct])),
  'data-testid': optional(string()),
};

export const StyleUtilityPropsStruct: Describe<StyleUtilityProps> =
  object(STYLE_UTILITY_PROPS);
