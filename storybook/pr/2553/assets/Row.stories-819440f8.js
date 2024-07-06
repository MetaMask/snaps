import{c as O,j as e}from"./component-2bcf5de3.js";import{A as P}from"./Address-cdc79eeb.js";import{T as c}from"./Text-40e51ee1.js";import{V as U}from"./Value-4e6178bf.js";const Y="Row",a=O(Y),K={title:"UI/Row",component:a,argTypes:{label:{description:"The label of the row, shown on the left.",table:{type:{summary:"string"}}},children:{description:"The children of the row, shown on the right. This can be an address, an image, value, or text.",table:{type:{summary:"AddressElement | ImageElement | TextElement | ValueElement"}}},variant:{description:"The variant of the row.",options:["default","warning","critical"],control:{type:"select"},table:{type:{summary:'"default" | "warning" | "critical"'},defaultValue:{summary:'"default"'}}},tooltip:{description:"The tooltip text to show on hover.",control:{type:"text"},table:{type:{summary:"string"}}}}},t={render:r=>e(a,{...r}),args:{label:"Label",children:e(c,{children:"Row text"})}},o={render:r=>e(a,{...r}),args:{label:"Label",children:e(c,{children:"Warning text"}),variant:"warning"}},n={render:r=>e(a,{...r}),args:{label:"Label",children:e(c,{children:"Critical text"}),variant:"critical"}},s={render:r=>e(a,{...r}),args:{label:"Label",children:e(c,{children:"Row text"}),tooltip:"Tooltip text"}},i={name:"Address",render:r=>e(a,{...r}),args:{label:"Label",children:e(P,{address:"0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520"})}},l={name:"Value",render:r=>e(a,{...r}),args:{label:"Label",children:e(U,{value:"$1200.00",extra:"0.12 ETH"})}};var d,p,m,h,u;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: props => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Text>Row text</Text>
  }
}`,...(m=(p=t.parameters)==null?void 0:p.docs)==null?void 0:m.source},description:{story:"The default row, with a label and children.",...(u=(h=t.parameters)==null?void 0:h.docs)==null?void 0:u.description}}};var w,b,g,x,T;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: props => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Text>Warning text</Text>,
    variant: 'warning'
  }
}`,...(g=(b=o.parameters)==null?void 0:b.docs)==null?void 0:g.source},description:{story:`A warning row, which indicates a warning. It renders the row with a yellow
background.`,...(T=(x=o.parameters)==null?void 0:x.docs)==null?void 0:T.description}}};var y,f,E,A,v;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: props => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Text>Critical text</Text>,
    variant: 'critical'
  }
}`,...(E=(f=n.parameters)==null?void 0:f.docs)==null?void 0:E.source},description:{story:`A critical row, which indicates a critical issue. It renders the row with a
red background.`,...(v=(A=n.parameters)==null?void 0:A.docs)==null?void 0:v.description}}};var R,L,V,W,S;s.parameters={...s.parameters,docs:{...(R=s.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: props => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Text>Row text</Text>,
    tooltip: 'Tooltip text'
  }
}`,...(V=(L=s.parameters)==null?void 0:L.docs)==null?void 0:V.source},description:{story:`A row with a tooltip, which shows the tooltip text on hover. It shows a
different icon depending on the variant.`,...(S=(W=s.parameters)==null?void 0:W.docs)==null?void 0:S.description}}};var D,C,I,B,F;i.parameters={...i.parameters,docs:{...(D=i.parameters)==null?void 0:D.docs,source:{originalSource:`{
  name: 'Address',
  render: props => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Address address="0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520" />
  }
}`,...(I=(C=i.parameters)==null?void 0:C.docs)==null?void 0:I.source},description:{story:"A row with an address.",...(F=(B=i.parameters)==null?void 0:B.docs)==null?void 0:F.description}}};var j,k,H,_,$;l.parameters={...l.parameters,docs:{...(j=l.parameters)==null?void 0:j.docs,source:{originalSource:`{
  name: 'Value',
  render: props => <Row {...props} />,
  args: {
    label: 'Label',
    children: <Value value="$1200.00" extra="0.12 ETH" />
  }
}`,...(H=(k=l.parameters)==null?void 0:k.docs)==null?void 0:H.source},description:{story:"A row with a value and extra description.",...($=(_=l.parameters)==null?void 0:_.docs)==null?void 0:$.description}}};const M=["Default","Warning","Critical","Tooltip","WithAddress","WithValue"];export{n as Critical,t as Default,s as Tooltip,o as Warning,i as WithAddress,l as WithValue,M as __namedExportsOrder,K as default};
