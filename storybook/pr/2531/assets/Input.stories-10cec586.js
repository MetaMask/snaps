import{j as o}from"./component-2bcf5de3.js";import{I as n}from"./Input-44881b40.js";const V={title:"Forms/Input",component:n,argTypes:{name:{description:"The name of the input field. This is used to identify the input field in the form data."},type:{description:"The type of the input field.",options:["text","password","number"],control:"select"},value:{description:"The default value of the input field.",control:"text"},placeholder:{description:"The placeholder text of the input field.",control:"text"}}},r={render:e=>o(n,{...e}),args:{name:"input",placeholder:"This is the placeholder text"}},t={render:e=>o(n,{...e}),args:{name:"input",type:"number",placeholder:"This input only accepts numbers"}},s={render:e=>o(n,{...e}),args:{name:"input",type:"password",placeholder:"This is a password input"}},a={render:e=>o(n,{...e}),args:{name:"input",value:"Default value",placeholder:"This input has a default value"}};var p,i,d,u,c;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: props => <Input {...props} />,
  args: {
    name: 'input',
    placeholder: 'This is the placeholder text'
  }
}`,...(d=(i=r.parameters)==null?void 0:i.docs)==null?void 0:d.source},description:{story:"The input component renders an input field.",...(c=(u=r.parameters)==null?void 0:u.docs)==null?void 0:c.description}}};var l,m,h,f,y;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: props => <Input {...props} />,
  args: {
    name: 'input',
    type: 'number',
    placeholder: 'This input only accepts numbers'
  }
}`,...(h=(m=t.parameters)==null?void 0:m.docs)==null?void 0:h.source},description:{story:"Number inputs only accept numbers.",...(y=(f=t.parameters)==null?void 0:f.docs)==null?void 0:y.description}}};var T,g,b,v,x;s.parameters={...s.parameters,docs:{...(T=s.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: props => <Input {...props} />,
  args: {
    name: 'input',
    type: 'password',
    placeholder: 'This is a password input'
  }
}`,...(b=(g=s.parameters)==null?void 0:g.docs)==null?void 0:b.source},description:{story:"Password inputs hide the entered text.",...(x=(v=s.parameters)==null?void 0:v.docs)==null?void 0:x.description}}};var w,I,D,S,N;a.parameters={...a.parameters,docs:{...(w=a.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: props => <Input {...props} />,
  args: {
    name: 'input',
    value: 'Default value',
    placeholder: 'This input has a default value'
  }
}`,...(D=(I=a.parameters)==null?void 0:I.docs)==null?void 0:D.source},description:{story:`It's possible to set a default value for the input. The value can be changed
by the user.`,...(N=(S=a.parameters)==null?void 0:S.docs)==null?void 0:N.description}}};const _=["Default","Number","Password","DefaultValue"];export{r as Default,a as DefaultValue,t as Number,s as Password,_ as __namedExportsOrder,V as default};
