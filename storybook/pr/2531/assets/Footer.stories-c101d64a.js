import{j as e}from"./component-2bcf5de3.js";import{F as s}from"./Footer-0ed44fe9.js";import{B as n}from"./Button-4359694e.js";const g={title:"Layout/Footer",component:s,argTypes:{children:{description:"The button(s) to render in the footer. If only one button is provided, a cancel button is added automatically.",table:{type:{summary:"Button | [Button, Button]"}}}}},t={render:r=>e(s,{...r}),args:{children:e(n,{children:"Submit"})}},o={render:r=>e(s,{...r}),args:{children:[e(n,{children:"First"}),e(n,{children:"Second"})]}};var a,d,c,i,u;t.parameters={...t.parameters,docs:{...(a=t.parameters)==null?void 0:a.docs,source:{originalSource:`{
  render: props => <Footer {...props} />,
  args: {
    children: <Button>Submit</Button>
  }
}`,...(c=(d=t.parameters)==null?void 0:d.docs)==null?void 0:c.source},description:{story:`The footer component one custom button. A cancel button is added
automatically if only one button is provided.

When the user clicks the first button, the \`onUserInput\` handler is called
with the name of the button (if provided).`,...(u=(i=t.parameters)==null?void 0:i.docs)==null?void 0:u.description}}};var p,m,l,h,f;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: props => <Footer {...props} />,
  args: {
    children: [<Button>First</Button>, <Button>Second</Button>]
  }
}`,...(l=(m=o.parameters)==null?void 0:m.docs)==null?void 0:l.source},description:{story:`The footer component with two custom buttons. If two buttons are provided,
no cancel button is added.`,...(f=(h=o.parameters)==null?void 0:h.docs)==null?void 0:f.description}}};const F=["Default","TwoButtons"];export{t as Default,o as TwoButtons,F as __namedExportsOrder,g as default};
