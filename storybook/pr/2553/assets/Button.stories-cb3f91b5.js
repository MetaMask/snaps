import{j as a}from"./component-2bcf5de3.js";import{B as o}from"./Button-4359694e.js";const x={title:"Forms/Button",component:o,argTypes:{type:{description:'The type of the button. If set to "submit", the button will submit the form.',options:["button","submit"],control:"select",table:{type:{summary:'"button" | "submit"'},defaultValue:{summary:'"button"'}}},variant:{description:"The variant of the button.",options:["primary","destructive"],control:"select",table:{type:{summary:'"primary" | "destructive"'},defaultValue:{summary:'"primary"'}}},disabled:{description:"Whether the button is disabled.",control:"boolean",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}}},children:{description:"The label of the button.",control:"text"}}},e={render:t=>a(o,{...t}),args:{name:"button-name",children:"Button"}},r={render:t=>a(o,{...t}),args:{name:"button-name",variant:"destructive",children:"Button"}},n={render:t=>a(o,{...t}),args:{name:"button-name",disabled:!0,children:"Button"}};var s,i,c,u,d;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: props => <Button {...props} />,
  args: {
    name: 'button-name',
    children: 'Button'
  }
}`,...(c=(i=e.parameters)==null?void 0:i.docs)==null?void 0:c.source},description:{story:"The button component renders a clickable button. When clicked, the button\nemits an event that can be handled by the `onUserInput` handler.",...(d=(u=e.parameters)==null?void 0:u.docs)==null?void 0:d.description}}};var m,p,l,b,h;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: props => <Button {...props} />,
  args: {
    name: 'button-name',
    variant: 'destructive',
    children: 'Button'
  }
}`,...(l=(p=r.parameters)==null?void 0:p.docs)==null?void 0:l.source},description:{story:`The button component has a destructive variant, which can be used to indicate
that the action triggered by the button is destructive or irreversible, or to
indicate that the user should proceed with caution.`,...(h=(b=r.parameters)==null?void 0:b.docs)==null?void 0:h.description}}};var y,v,f,g,B;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: props => <Button {...props} />,
  args: {
    name: 'button-name',
    disabled: true,
    children: 'Button'
  }
}`,...(f=(v=n.parameters)==null?void 0:v.docs)==null?void 0:f.source},description:{story:"The button component can be disabled.",...(B=(g=n.parameters)==null?void 0:g.docs)==null?void 0:B.description}}};const w=["Default","Destructive","Disabled"];export{e as Default,r as Destructive,n as Disabled,w as __namedExportsOrder,x as default};
