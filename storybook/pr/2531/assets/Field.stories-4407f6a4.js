import{j as e}from"./component-2bcf5de3.js";import{B as E}from"./Button-4359694e.js";import{F as a}from"./Field-6d270c9c.js";import{I as l}from"./Input-44881b40.js";const D={title:"Forms/Field",component:a,argTypes:{label:{description:"The label of the field.",control:"text"},error:{description:"The error message of the field.",control:"text"},children:{description:"The form component to render inside the field.",table:{type:{summary:"[InputElement, ButtonElement] | DropdownElement | FileInputElement | InputElement | CheckboxElement"}}}}},t={render:r=>e(a,{...r}),args:{label:"Field label",children:e(l,{name:"input",type:"text",placeholder:"Input placeholder"})}},n={render:r=>e(a,{...r}),args:{label:"Field label",error:"Field error",children:e(l,{name:"input",type:"text",placeholder:"Input placeholder"})}},o={render:r=>e(a,{...r}),args:{label:"Field label",children:[e(l,{name:"input",type:"text",placeholder:"Input placeholder"}),e(E,{type:"submit",children:"Submit"})]}};var p,s,i,d,c;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: props => <Field {...props} />,
  args: {
    label: 'Field label',
    children: <Input name="input" type="text" placeholder="Input placeholder" />
  }
}`,...(i=(s=t.parameters)==null?void 0:s.docs)==null?void 0:i.source},description:{story:`The field component wraps an input element with a label and optional error
message.`,...(c=(d=t.parameters)==null?void 0:d.docs)==null?void 0:c.description}}};var m,u,h,b,f;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: props => <Field {...props} />,
  args: {
    label: 'Field label',
    error: 'Field error',
    children: <Input name="input" type="text" placeholder="Input placeholder" />
  }
}`,...(h=(u=n.parameters)==null?void 0:u.docs)==null?void 0:h.source},description:{story:"The field component can display an error message.",...(f=(b=n.parameters)==null?void 0:b.docs)==null?void 0:f.description}}};var I,F,y,g,x;o.parameters={...o.parameters,docs:{...(I=o.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: props => <Field {...props} />,
  args: {
    label: 'Field label',
    children: [<Input name="input" type="text" placeholder="Input placeholder" />, <Button type="submit">Submit</Button>]
  }
}`,...(y=(F=o.parameters)==null?void 0:F.docs)==null?void 0:y.source},description:{story:`Inputs can be combined with a button, for example, to submit a form, or to
perform some action.`,...(x=(g=o.parameters)==null?void 0:g.docs)==null?void 0:x.description}}};const j=["Default","Error","InputWithButton"];export{t as Default,n as Error,o as InputWithButton,j as __namedExportsOrder,D as default};
