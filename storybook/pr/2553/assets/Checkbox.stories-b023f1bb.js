import{c as C,j as t}from"./component-2bcf5de3.js";const T="Checkbox",c=C(T),S={title:"Forms/Checkbox",component:c,argTypes:{name:{description:"The name of the checkbox field. This is used to identify the state in the form data.",control:"text",table:{type:{summary:"string"}}},label:{description:"The label of the checkbox.",table:{type:{summary:"string"}}},checked:{description:"Whether the checkbox is checked or not.",control:"boolean",table:{type:{summary:"boolean"}}},variant:{description:"The variant of the checkbox.",options:["default","toggle"],control:{type:"select"},table:{type:{summary:"string"},defaultValue:{summary:'"default"'}}}}},o={render:e=>t(c,{...e}),args:{name:"checkbox-name",label:"Checkbox"}},r={render:e=>t(c,{...e}),args:{name:"checkbox-name",label:"Checkbox",checked:!0}},a={render:e=>t(c,{...e}),args:{name:"checkbox-name",label:"Checkbox",variant:"toggle"}};var s,n,p,h,d;o.parameters={...o.parameters,docs:{...(s=o.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: props => <Checkbox {...props} />,
  args: {
    name: 'checkbox-name',
    label: 'Checkbox'
  }
}`,...(p=(n=o.parameters)==null?void 0:n.docs)==null?void 0:p.source},description:{story:`The checkbox component renders a checkbox input field, which allows users to
select an option from a list of options.`,...(d=(h=o.parameters)==null?void 0:h.docs)==null?void 0:d.description}}};var i,l,m,b,k;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: props => <Checkbox {...props} />,
  args: {
    name: 'checkbox-name',
    label: 'Checkbox',
    checked: true
  }
}`,...(m=(l=r.parameters)==null?void 0:l.docs)==null?void 0:m.source},description:{story:"The checkbox can be checked by default.",...(k=(b=r.parameters)==null?void 0:b.docs)==null?void 0:k.description}}};var x,u,g,f,y;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: props => <Checkbox {...props} />,
  args: {
    name: 'checkbox-name',
    label: 'Checkbox',
    variant: 'toggle'
  }
}`,...(g=(u=a.parameters)==null?void 0:u.docs)==null?void 0:g.source},description:{story:"The checkbox can be rendered as a toggle switch.",...(y=(f=a.parameters)==null?void 0:f.docs)==null?void 0:y.description}}};const w=["Default","Checked","Toggle"];export{r as Checked,o as Default,a as Toggle,w as __namedExportsOrder,S as default};
