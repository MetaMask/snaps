import{j as o}from"./component-2bcf5de3.js";import{D as i,O as n}from"./Option-a39ddf61.js";import{F as w}from"./Field-6d270c9c.js";const y={title:"Forms/Dropdown",component:i,argTypes:{value:{description:"The selected value of the dropdown.",control:"text",table:{type:{summary:"string"}}},name:{description:"The name of the dropdown field. This is used to identify the state in the form data.",control:"text",table:{type:{summary:"string"}}},children:{description:"The dropdown options.",table:{type:{summary:"OptionElement | OptionElement[]"}}}}},e={render:r=>o(i,{...r}),args:{name:"dropdown-name",children:[o(n,{value:"option-1",children:"Option 1"}),o(n,{value:"option-2",children:"Option 2"}),o(n,{value:"option-3",children:"Option 3"})]}},t={render:r=>o(w,{label:"Dropdown",children:o(i,{...r})}),args:{name:"dropdown-name",children:[o(n,{value:"option-1",children:"Option 1"}),o(n,{value:"option-2",children:"Option 2"}),o(n,{value:"option-3",children:"Option 3"})]}};var p,a,d,s,l;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: props => <Dropdown {...props} />,
  args: {
    name: 'dropdown-name',
    children: [<Option value="option-1">Option 1</Option>, <Option value="option-2">Option 2</Option>, <Option value="option-3">Option 3</Option>]
  }
}`,...(d=(a=e.parameters)==null?void 0:a.docs)==null?void 0:d.source},description:{story:`The dropdown component renders a dropdown input field, which allows users to
select an option from a list of options.`,...(l=(s=e.parameters)==null?void 0:s.docs)==null?void 0:l.description}}};var c,m,u,O,h;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: props => <Field label="Dropdown">
      <Dropdown {...props} />
    </Field>,
  args: {
    name: 'dropdown-name',
    children: [<Option value="option-1">Option 1</Option>, <Option value="option-2">Option 2</Option>, <Option value="option-3">Option 3</Option>]
  }
}`,...(u=(m=t.parameters)==null?void 0:m.docs)==null?void 0:u.source},description:{story:`The dropdown component can be used within a field component to render a
dropdown input field with a label, and optional error message.`,...(h=(O=t.parameters)==null?void 0:O.docs)==null?void 0:h.description}}};const D=["Default","WithinField"];export{e as Default,t as WithinField,D as __namedExportsOrder,y as default};
