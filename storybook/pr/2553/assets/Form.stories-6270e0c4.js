import{c as l,j as e}from"./component-2bcf5de3.js";import{H as c}from"./Heading-3ecdf840.js";import{T as u}from"./Text-40e51ee1.js";import{F as n}from"./Field-6d270c9c.js";import{I as o}from"./Input-44881b40.js";const f="Form",p=l(f),b={title:"Forms/Form",component:p,argTypes:{name:{description:"The name of the form. This is used to identify form in the `onUserInput` event.",control:"text",table:{type:{summary:"string"}}},children:{description:"The form children.",table:{type:{summary:"JSXElement | JSXElement[]"}}}}},r={render:i=>e(p,{...i}),args:{name:"form-name",children:[e(c,{children:"Log in"}),e(u,{children:"Enter your username and password to proceed."}),e(n,{label:"Username",children:e(o,{name:"username",type:"text"})}),e(n,{label:"Password",children:e(o,{name:"password",type:"password"})})]}};var t,s,a,m,d;r.parameters={...r.parameters,docs:{...(t=r.parameters)==null?void 0:t.docs,source:{originalSource:`{
  render: props => <Form {...props} />,
  args: {
    name: 'form-name',
    children: [<Heading>Log in</Heading>, <Text>Enter your username and password to proceed.</Text>, <Field label="Username">
        <Input name="username" type="text" />
      </Field>, <Field label="Password">
        <Input name="password" type="password" />
      </Field>]
  }
}`,...(a=(s=r.parameters)==null?void 0:s.docs)==null?void 0:a.source},description:{story:`The form component does not render anything by itself, but it can be used to
group form elements together.`,...(d=(m=r.parameters)==null?void 0:m.docs)==null?void 0:d.description}}};const x=["Default"];export{r as Default,x as __namedExportsOrder,b as default};
