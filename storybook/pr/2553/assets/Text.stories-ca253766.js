import{j as o,a as y}from"./component-2bcf5de3.js";import{L as I}from"./Link-9243ebd4.js";import{T as n}from"./Text-40e51ee1.js";import{B as b}from"./Bold-9e86656d.js";import{I as B}from"./Italic-970c90c5.js";const D={title:"Text/Text",component:n,argTypes:{children:{description:"The text to render.",table:{type:{summary:"SnapsChildren<string | StandardFormattingElement | LinkElement>"}}}}},t={render:e=>o(n,{...e}),args:{children:"This is some text."}},r={render:e=>y(n,{...e,children:["This is some ",o(b,{children:"bold"})," and ",o(B,{children:"italic"})," text."]}),args:{}},s={render:e=>y(n,{...e,children:["This is some text with a link:"," ",o(I,{href:"https://metamask.io",children:"metamask.io"}),"."]}),args:{}};var a,i,c,m,d;t.parameters={...t.parameters,docs:{...(a=t.parameters)==null?void 0:a.docs,source:{originalSource:`{
  render: props => <Text {...props} />,
  args: {
    children: 'This is some text.'
  }
}`,...(c=(i=t.parameters)==null?void 0:i.docs)==null?void 0:c.source},description:{story:`The text component renders text. It can be used in combination with other
formatting components to create rich text.`,...(d=(m=t.parameters)==null?void 0:m.docs)==null?void 0:d.description}}};var p,l,h,x,T;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: props => <Text {...props}>
      This is some <Bold>bold</Bold> and <Italic>italic</Italic> text.
    </Text>,
  args: {}
}`,...(h=(l=r.parameters)==null?void 0:l.docs)==null?void 0:h.source},description:{story:"Text can contain formatting components (like `Bold` and `Italic`) to create\nrich text.",...(T=(x=r.parameters)==null?void 0:x.docs)==null?void 0:T.description}}};var g,k,u,f,L;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: props => <Text {...props}>
      This is some text with a link:{' '}
      <Link href="https://metamask.io">metamask.io</Link>.
    </Text>,
  args: {}
}`,...(u=(k=s.parameters)==null?void 0:k.docs)==null?void 0:u.source},description:{story:"Text can contain links.",...(L=(f=s.parameters)==null?void 0:f.docs)==null?void 0:L.description}}};const W=["Default","Formatting","WithLink"];export{t as Default,r as Formatting,s as WithLink,W as __namedExportsOrder,D as default};
