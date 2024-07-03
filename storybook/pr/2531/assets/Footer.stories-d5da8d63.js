import{c as f,j as e}from"./component-2bcf5de3.js";import{B as r}from"./Button-4359694e.js";const B="Footer",s=f(B),F={title:"Footer",component:s,argTypes:{children:{description:"The button(s) to render in the footer. If only one button is provided, a cancel button is added automatically.",table:{type:{summary:"Button | [Button, Button]"}}}}},t={render:n=>e(s,{...n}),args:{children:e(r,{children:"Submit"})}},o={render:n=>e(s,{...n}),args:{children:[e(r,{children:"First"}),e(r,{children:"Second"})]}};var a,c,d,i,u;t.parameters={...t.parameters,docs:{...(a=t.parameters)==null?void 0:a.docs,source:{originalSource:`{
  render: props => <Footer {...props} />,
  args: {
    children: <Button>Submit</Button>
  }
}`,...(d=(c=t.parameters)==null?void 0:c.docs)==null?void 0:d.source},description:{story:`The footer component one custom button. A cancel button is added
automatically if only one button is provided.

When the user clicks the first button, the \`onUserInput\` handler is called
with the name of the button (if provided).`,...(u=(i=t.parameters)==null?void 0:i.docs)==null?void 0:u.description}}};var p,m,l,h,b;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: props => <Footer {...props} />,
  args: {
    children: [<Button>First</Button>, <Button>Second</Button>]
  }
}`,...(l=(m=o.parameters)==null?void 0:m.docs)==null?void 0:l.source},description:{story:`The footer component with two custom buttons. If two buttons are provided,
no cancel button is added.`,...(b=(h=o.parameters)==null?void 0:h.docs)==null?void 0:b.description}}};const S=["Default","TwoButtons"];export{t as Default,o as TwoButtons,S as __namedExportsOrder,F as default};
