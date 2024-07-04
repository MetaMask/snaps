import{c as j,j as e}from"./component-2bcf5de3.js";import{A as k}from"./Address-cdc79eeb.js";import{T as c}from"./Text-40e51ee1.js";const V="Row",t=j(V),U={title:"UI/Row",component:t,argTypes:{label:{description:"The label of the row, shown on the left.",table:{type:{summary:"string"}}},children:{description:"The children of the row, shown on the right. This can be an address, an image, value, or text.",table:{type:{summary:"AddressElement | ImageElement | TextElement | ValueElement"}}},variant:{description:"The variant of the row.",options:["default","warning","critical"],control:{type:"select"},table:{type:{summary:'"default" | "warning" | "critical"'},defaultValue:{summary:'"default"'}}},tooltip:{description:"The tooltip text to show on hover.",control:{type:"text"},table:{type:{summary:"string"}}}}},a={render:r=>e(t,{...r}),args:{label:"Label",children:e(c,{children:"Row text"})}},o={render:r=>e(t,{...r}),args:{label:"Label",children:e(c,{children:"Warning text"}),variant:"warning"}},n={render:r=>e(t,{...r}),args:{label:"Label",children:e(c,{children:"Critical text"}),variant:"critical"}},s={name:"With tooltip",render:r=>e(t,{...r}),args:{label:"Label",children:e(c,{children:"Row text"}),tooltip:"Tooltip text"}},i={name:"With address",render:r=>e(t,{...r}),args:{label:"Label",children:e(k,{address:"0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520"})}};var l,d,p,h,m;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: props => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Text>Row text</Text>
  }
}`,...(p=(d=a.parameters)==null?void 0:d.docs)==null?void 0:p.source},description:{story:"The default row, with a label and children.",...(m=(h=a.parameters)==null?void 0:h.docs)==null?void 0:m.description}}};var w,b,g,u,x;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: props => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Text>Warning text</Text>,
    variant: 'warning'
  }
}`,...(g=(b=o.parameters)==null?void 0:b.docs)==null?void 0:g.source},description:{story:`A warning row, which indicates a warning. It renders the row with a yellow
background.`,...(x=(u=o.parameters)==null?void 0:u.docs)==null?void 0:x.description}}};var T,y,f,E,A;n.parameters={...n.parameters,docs:{...(T=n.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: props => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Text>Critical text</Text>,
    variant: 'critical'
  }
}`,...(f=(y=n.parameters)==null?void 0:y.docs)==null?void 0:f.source},description:{story:`A critical row, which indicates a critical issue. It renders the row with a
red background.`,...(A=(E=n.parameters)==null?void 0:E.docs)==null?void 0:A.description}}};var R,v,L,W,D;s.parameters={...s.parameters,docs:{...(R=s.parameters)==null?void 0:R.docs,source:{originalSource:`{
  name: 'With tooltip',
  render: props => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Text>Row text</Text>,
    tooltip: 'Tooltip text'
  }
}`,...(L=(v=s.parameters)==null?void 0:v.docs)==null?void 0:L.source},description:{story:`A row with a tooltip, which shows the tooltip text on hover. It shows a
different icon depending on the variant.`,...(D=(W=s.parameters)==null?void 0:W.docs)==null?void 0:D.description}}};var S,C,I,B,F;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  name: 'With address',
  render: props => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Address address="0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520" />
  }
}`,...(I=(C=i.parameters)==null?void 0:C.docs)==null?void 0:I.source},description:{story:"A row with an address.",...(F=(B=i.parameters)==null?void 0:B.docs)==null?void 0:F.description}}};const Y=["Default","Warning","Critical","Tooltip","WithAddress"];export{n as Critical,a as Default,s as Tooltip,o as Warning,i as WithAddress,Y as __namedExportsOrder,U as default};
