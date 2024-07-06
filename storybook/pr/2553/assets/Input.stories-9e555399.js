import{j as r}from"./component-2bcf5de3.js";import{F as E}from"./Field-6d270c9c.js";import{I as t}from"./Input-44881b40.js";const z={title:"Forms/Input",component:t,argTypes:{name:{description:"The name of the input field. This is used to identify the input field in the form data."},type:{description:"The type of the input field.",options:["text","password","number"],control:"select"},value:{description:"The default value of the input field.",control:"text"},placeholder:{description:"The placeholder text of the input field.",control:"text"}}},s={render:e=>r(t,{...e}),args:{name:"input",placeholder:"This is the placeholder text"}},n={render:e=>r(t,{...e}),args:{name:"input",type:"number",placeholder:"This input only accepts numbers"}},a={render:e=>r(t,{...e}),args:{name:"input",type:"password",placeholder:"This is a password input"}},o={render:e=>r(t,{...e}),args:{name:"input",value:"Default value",placeholder:"This input has a default value"}},p={render:e=>r(E,{label:"Input",children:r(t,{...e})}),args:{name:"input",placeholder:"This is the placeholder text"}};var i,d,c,l,u;s.parameters={...s.parameters,docs:{...(i=s.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: props => <Input {...props} />,
  args: {
    name: 'input',
    placeholder: 'This is the placeholder text'
  }
}`,...(c=(d=s.parameters)==null?void 0:d.docs)==null?void 0:c.source},description:{story:"The input component renders an input field.",...(u=(l=s.parameters)==null?void 0:l.docs)==null?void 0:u.description}}};var m,h,f,T,g;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: props => <Input {...props} />,
  args: {
    name: 'input',
    type: 'number',
    placeholder: 'This input only accepts numbers'
  }
}`,...(f=(h=n.parameters)==null?void 0:h.docs)==null?void 0:f.source},description:{story:"Number inputs only accept numbers.",...(g=(T=n.parameters)==null?void 0:T.docs)==null?void 0:g.description}}};var y,b,x,I,v;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: props => <Input {...props} />,
  args: {
    name: 'input',
    type: 'password',
    placeholder: 'This is a password input'
  }
}`,...(x=(b=a.parameters)==null?void 0:b.docs)==null?void 0:x.source},description:{story:"Password inputs hide the entered text.",...(v=(I=a.parameters)==null?void 0:I.docs)==null?void 0:v.description}}};var w,F,D,S,N;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: props => <Input {...props} />,
  args: {
    name: 'input',
    value: 'Default value',
    placeholder: 'This input has a default value'
  }
}`,...(D=(F=o.parameters)==null?void 0:F.docs)==null?void 0:D.source},description:{story:`It's possible to set a default value for the input. The value can be changed
by the user.`,...(N=(S=o.parameters)==null?void 0:S.docs)==null?void 0:N.description}}};var P,j,V,W,_;p.parameters={...p.parameters,docs:{...(P=p.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: props => <Field label="Input">
      <Input {...props} />
    </Field>,
  args: {
    name: 'input',
    placeholder: 'This is the placeholder text'
  }
}`,...(V=(j=p.parameters)==null?void 0:j.docs)==null?void 0:V.source},description:{story:`The input component can be used within a field component to render an input
field with a label, and optional error message.`,...(_=(W=p.parameters)==null?void 0:W.docs)==null?void 0:_.description}}};const A=["Default","Number","Password","DefaultValue","WithinField"];export{s as Default,o as DefaultValue,n as Number,a as Password,p as WithinField,A as __namedExportsOrder,z as default};
