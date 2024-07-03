import{a as s,j as e}from"./component-2bcf5de3.js";import{B as i}from"./Box-21020479.js";import{H as c}from"./Heading-3ecdf840.js";import{T as d}from"./Text-40e51ee1.js";import{B as l}from"./Button-4359694e.js";const D={title:"Box",component:i,argTypes:{direction:{description:"The direction in which to lay out the children.",options:["vertical","horizontal"],control:{type:"inline-radio"},table:{defaultValue:{summary:"vertical"}}},alignment:{description:"The alignment of the children in the box.",options:["start","center","end","space-between"],control:{type:"select"},table:{defaultValue:{summary:"start"}}}}},t={name:"Vertical direction",render:n=>s(i,{...n,children:[e(c,{children:"Box"}),e(d,{children:"A box with some text, and a"}),e(l,{children:"Button"})]}),args:{direction:"vertical"}},r={name:"Horizontal direction",render:n=>s(i,{...n,children:[e(c,{children:"Box"}),e(d,{children:"A box with some text, and a"}),e(l,{children:"Button"})]}),args:{direction:"horizontal"}},o={name:"Center alignment",render:n=>s(i,{...n,children:[e(c,{children:"Box"}),e(d,{children:"A box with some text, and a"}),e(l,{children:"Button"})]}),args:{alignment:"center"}},a={name:"Space between alignment",render:n=>s(i,{...n,children:[e(c,{children:"Box"}),e(d,{children:"A box with some text, and a"}),e(l,{children:"Button"})]}),args:{direction:"horizontal",alignment:"space-between"}};var p,h,m,x,u;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  name: 'Vertical direction',
  render: props => <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>,
  args: {
    direction: 'vertical'
  }
}`,...(m=(h=t.parameters)==null?void 0:h.docs)==null?void 0:m.source},description:{story:"The default box, which renders its children in a vertical layout.",...(u=(x=t.parameters)==null?void 0:x.docs)==null?void 0:u.description}}};var B,g,w,b,T;r.parameters={...r.parameters,docs:{...(B=r.parameters)==null?void 0:B.docs,source:{originalSource:`{
  name: 'Horizontal direction',
  render: props => <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>,
  args: {
    direction: 'horizontal'
  }
}`,...(w=(g=r.parameters)==null?void 0:g.docs)==null?void 0:w.source},description:{story:`The box with horizontal layout, which renders its children in a horizontal
layout (i.e., next to each other instead of on top of each other).`,...(T=(b=r.parameters)==null?void 0:b.docs)==null?void 0:T.description}}};var y,H,f,z,A;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  name: 'Center alignment',
  render: props => <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>,
  args: {
    alignment: 'center'
  }
}`,...(f=(H=o.parameters)==null?void 0:H.docs)==null?void 0:f.source},description:{story:"The box with center alignment, which centers its children.",...(A=(z=o.parameters)==null?void 0:z.docs)==null?void 0:A.description}}};var S,v,V,C,j;a.parameters={...a.parameters,docs:{...(S=a.parameters)==null?void 0:S.docs,source:{originalSource:`{
  name: 'Space between alignment',
  render: props => <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>,
  args: {
    direction: 'horizontal',
    alignment: 'space-between'
  }
}`,...(V=(v=a.parameters)==null?void 0:v.docs)==null?void 0:V.source},description:{story:`The box with space-between alignment, which spaces its children evenly.

This only works with horizontal direction.`,...(j=(C=a.parameters)==null?void 0:C.docs)==null?void 0:j.description}}};const F=["Vertical","Horizontal","Center","SpaceBetween"];export{o as Center,r as Horizontal,a as SpaceBetween,t as Vertical,F as __namedExportsOrder,D as default};
