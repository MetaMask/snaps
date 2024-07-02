import{c as E,a as s,j as e}from"./component-2bcf5de3.js";import{H as c}from"./Heading-3ecdf840.js";import{T as d}from"./Text-40e51ee1.js";const P="Box",i=E(P),Y="Button",l=E(Y),$={title:"Box",component:i,argTypes:{direction:{description:"The direction in which to lay out the children.",options:["vertical","horizontal"],control:{type:"inline-radio"},table:{defaultValue:{summary:"vertical"}}},alignment:{description:"The alignment of the children in the box.",options:["start","center","end","space-between"],control:{type:"select"},table:{defaultValue:{summary:"start"}}}}},t={name:"Vertical direction",render:n=>s(i,{...n,children:[e(c,{children:"Box"}),e(d,{children:"A box with some text, and a"}),e(l,{children:"Button"})]}),args:{direction:"vertical"}},o={name:"Horizontal direction",render:n=>s(i,{...n,children:[e(c,{children:"Box"}),e(d,{children:"A box with some text, and a"}),e(l,{children:"Button"})]}),args:{direction:"horizontal"}},r={name:"Center alignment",render:n=>s(i,{...n,children:[e(c,{children:"Box"}),e(d,{children:"A box with some text, and a"}),e(l,{children:"Button"})]}),args:{alignment:"center"}},a={name:"Space between alignment",render:n=>s(i,{...n,children:[e(c,{children:"Box"}),e(d,{children:"A box with some text, and a"}),e(l,{children:"Button"})]}),args:{direction:"horizontal",alignment:"space-between"}};var p,h,m,x,u;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  name: 'Vertical direction',
  render: props => <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>,
  args: {
    direction: 'vertical'
  }
}`,...(m=(h=t.parameters)==null?void 0:h.docs)==null?void 0:m.source},description:{story:"The default box, which renders its children in a vertical layout.",...(u=(x=t.parameters)==null?void 0:x.docs)==null?void 0:u.description}}};var B,g,w,b,T;o.parameters={...o.parameters,docs:{...(B=o.parameters)==null?void 0:B.docs,source:{originalSource:`{
  name: 'Horizontal direction',
  render: props => <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>,
  args: {
    direction: 'horizontal'
  }
}`,...(w=(g=o.parameters)==null?void 0:g.docs)==null?void 0:w.source},description:{story:`The box with horizontal layout, which renders its children in a horizontal
layout (i.e., next to each other instead of on top of each other).`,...(T=(b=o.parameters)==null?void 0:b.docs)==null?void 0:T.description}}};var y,H,z,f,S;r.parameters={...r.parameters,docs:{...(y=r.parameters)==null?void 0:y.docs,source:{originalSource:`{
  name: 'Center alignment',
  render: props => <Box {...props}>
      <Heading>Box</Heading>
      <Text>A box with some text, and a</Text>
      <Button>Button</Button>
    </Box>,
  args: {
    alignment: 'center'
  }
}`,...(z=(H=r.parameters)==null?void 0:H.docs)==null?void 0:z.source},description:{story:"The box with center alignment, which centers its children.",...(S=(f=r.parameters)==null?void 0:f.docs)==null?void 0:S.description}}};var A,v,V,C,j;a.parameters={...a.parameters,docs:{...(A=a.parameters)==null?void 0:A.docs,source:{originalSource:`{
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

This only works with horizontal direction.`,...(j=(C=a.parameters)==null?void 0:C.docs)==null?void 0:j.description}}};const q=["Vertical","Horizontal","Center","SpaceBetween"];export{r as Center,o as Horizontal,a as SpaceBetween,t as Vertical,q as __namedExportsOrder,$ as default};
