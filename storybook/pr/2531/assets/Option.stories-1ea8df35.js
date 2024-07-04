import{j as e}from"./component-2bcf5de3.js";import{O as p,D as i}from"./Option-a39ddf61.js";const m={title:"Forms/Option",component:p,argTypes:{value:{description:"The default value of the option field. This is used as the state value of the field."},children:{description:"The label of the option field.",control:"text"}}},o={render:d=>e(i,{name:"dropdown-name",children:e(p,{...d})}),args:{value:"option-1",children:"Option 1"}};var n,r,t,a,s;o.parameters={...o.parameters,docs:{...(n=o.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: props => <Dropdown name="dropdown-name">
      <Option {...props} />
    </Dropdown>,
  args: {
    value: 'option-1',
    children: 'Option 1'
  }
}`,...(t=(r=o.parameters)==null?void 0:r.docs)==null?void 0:t.source},description:{story:`The option component renders an option field within a dropdown. It cannot be
used outside of a dropdown.`,...(s=(a=o.parameters)==null?void 0:a.docs)==null?void 0:s.description}}};const u=["Default"];export{o as Default,u as __namedExportsOrder,m as default};
