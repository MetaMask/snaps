import{a as s,j as e}from"./component-2bcf5de3.js";import{B as i}from"./Box-21020479.js";import{H as c}from"./Heading-3ecdf840.js";import{T as d}from"./Text-40e51ee1.js";import{B as l}from"./Button-4359694e.js";const q={title:"Layout/Box",component:i,argTypes:{direction:{description:"The direction in which to lay out the children.",options:["vertical","horizontal"],control:{type:"inline-radio"},table:{defaultValue:{summary:"vertical"}}},alignment:{description:"The alignment of the children in the box.",options:["start","center","end","space-between"],control:{type:"select"},table:{defaultValue:{summary:"start"}}}}},n={render:t=>s(i,{...t,children:[e(c,{children:"Box"}),e(d,{children:"A box with some text, and a"}),e(l,{children:"Button"})]}),args:{direction:"vertical"}},r={render:t=>s(i,{...t,children:[e(c,{children:"Box"}),e(d,{children:"A box with some text, and a"}),e(l,{children:"Button"})]}),args:{direction:"horizontal"}},o={render:t=>s(i,{...t,children:[e(c,{children:"Box"}),e(d,{children:"A box with some text, and a"}),e(l,{children:"Button"})]}),args:{alignment:"center"}},a={render:t=>s(i,{...t,children:[e(c,{children:"Box"}),e(d,{children:"A box with some text, and a"}),e(l,{children:"Button"})]}),args:{direction:"horizontal",alignment:"space-between"}};var p,h,m,x,u;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: props => <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>,
  args: {
    direction: 'vertical'
  }
}`,...(m=(h=n.parameters)==null?void 0:h.docs)==null?void 0:m.source},description:{story:"The default box, which renders its children in a vertical layout.",...(u=(x=n.parameters)==null?void 0:x.docs)==null?void 0:u.description}}};var B,g,w,b,T;r.parameters={...r.parameters,docs:{...(B=r.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: props => <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>,
  args: {
    direction: 'horizontal'
  }
}`,...(w=(g=r.parameters)==null?void 0:g.docs)==null?void 0:w.source},description:{story:`The box with horizontal layout, which renders its children in a horizontal
layout (i.e., next to each other instead of on top of each other).`,...(T=(b=r.parameters)==null?void 0:b.docs)==null?void 0:T.description}}};var y,f,H,z,A;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: props => <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>,
  args: {
    alignment: 'center'
  }
}`,...(H=(f=o.parameters)==null?void 0:f.docs)==null?void 0:H.source},description:{story:"The box with center alignment, which centers its children.",...(A=(z=o.parameters)==null?void 0:z.docs)==null?void 0:A.description}}};var v,S,V,j,C;a.parameters={...a.parameters,docs:{...(v=a.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: props => <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>,
  args: {
    direction: 'horizontal',
    alignment: 'space-between'
  }
}`,...(V=(S=a.parameters)==null?void 0:S.docs)==null?void 0:V.source},description:{story:`The box with space-between alignment, which spaces its children evenly.

This only works with horizontal direction.`,...(C=(j=a.parameters)==null?void 0:j.docs)==null?void 0:C.description}}};const D=["Vertical","Horizontal","Centered","SpaceBetween"];export{o as Centered,r as Horizontal,a as SpaceBetween,n as Vertical,D as __namedExportsOrder,q as default};
