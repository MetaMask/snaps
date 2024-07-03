import{c as C,j as t}from"./component-2bcf5de3.js";const f="Copyable",o=C(f),D={title:"Copyable",component:o,argTypes:{value:{description:"The value to display.",table:{type:{summary:"string"}}},sensitive:{description:"Whether the value is sensitive and should be obscured.",control:{type:"boolean"},table:{defaultValue:{summary:"false"},type:{summary:"boolean"}}}}},a={render:e=>t(o,{...e}),args:{value:"This is a copyable value."}},s={render:e=>t(o,{...e}),args:{sensitive:!0,value:"This is a copyable value."}},r={render:e=>t(o,{...e}),args:{value:`0x${"4bbeEB066eD09B7AEd07bF39EEe0460DFa261520".repeat(20)}`}};var n,p,c,i,l;a.parameters={...a.parameters,docs:{...(n=a.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: props => <Copyable {...props} />,
  args: {
    value: 'This is a copyable value.'
  }
}`,...(c=(p=a.parameters)==null?void 0:p.docs)==null?void 0:c.source},description:{story:`The copyable component renders a value which can be copied to the clipboard.
It can also be used to display raw data.`,...(l=(i=a.parameters)==null?void 0:i.docs)==null?void 0:l.description}}};var u,d,m,b,v;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: props => <Copyable {...props} />,
  args: {
    sensitive: true,
    value: 'This is a copyable value.'
  }
}`,...(m=(d=s.parameters)==null?void 0:d.docs)==null?void 0:m.source},description:{story:`Values can be sensitive, in which case they are obscured until the user
reveals them.`,...(v=(b=s.parameters)==null?void 0:b.docs)==null?void 0:v.description}}};var y,h,g,E,T;r.parameters={...r.parameters,docs:{...(y=r.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: props => <Copyable {...props} />,
  args: {
    value: \`0x\${'4bbeEB066eD09B7AEd07bF39EEe0460DFa261520'.repeat(20)}\`
  }
}`,...(g=(h=r.parameters)==null?void 0:h.docs)==null?void 0:g.source},description:{story:`For long values, the copyable component will truncate the value and show a
"more" button to expand the value.`,...(T=(E=r.parameters)==null?void 0:E.docs)==null?void 0:T.description}}};const S=["Default","Sensitive","LongValue"];export{a as Default,r as LongValue,s as Sensitive,S as __namedExportsOrder,D as default};
