import{c as g,j as e,a as u}from"./component-2bcf5de3.js";import{T as n}from"./Text-40e51ee1.js";import{B as E}from"./Bold-9e86656d.js";import{I as f}from"./Italic-970c90c5.js";const v="Tooltip",i=g(v),I={title:"Tooltip",component:i,argTypes:{content:{description:"The element to display in the tooltip.",table:{type:{summary:"TextElement | StandardFormattingElement | LinkElement | string"}}},children:{description:"The children to render outside the tooltip, which will trigger the tooltip when hovered over.",table:{type:{summary:"TextElement | StandardFormattingElement | LinkElement | ImageElement | boolean | null"}}}}},t={render:r=>e(i,{...r}),args:{content:e(n,{children:"Tooltip content."}),children:e(n,{children:"Hover me!"})}},o={render:r=>e(i,{...r}),args:{content:u(n,{children:["Tooltips can contain ",e(E,{children:"bold"})," and ",e(f,{children:"italic"})," text as well."]}),children:e(n,{children:"Hover me!"})}};var a,l,s,c,p;t.parameters={...t.parameters,docs:{...(a=t.parameters)==null?void 0:a.docs,source:{originalSource:`{
  render: props => <Tooltip {...props} />,
  args: {
    content: <Text>Tooltip content.</Text>,
    children: <Text>Hover me!</Text>
  }
}`,...(s=(l=t.parameters)==null?void 0:l.docs)==null?void 0:s.source},description:{story:`The tooltip component shows a tooltip when hovering over the children, like
text, a link, or an image.`,...(p=(c=t.parameters)==null?void 0:c.docs)==null?void 0:p.description}}};var d,m,h,T,x;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: props => <Tooltip {...props} />,
  args: {
    content: <Text>
        Tooltips can contain <Bold>bold</Bold> and <Italic>italic</Italic> text
        as well.
      </Text>,
    children: <Text>Hover me!</Text>
  }
}`,...(h=(m=o.parameters)==null?void 0:m.docs)==null?void 0:h.source},description:{story:`The tooltip component can contain text with formatting, like bold and italic
text.`,...(x=(T=o.parameters)==null?void 0:T.docs)==null?void 0:x.description}}};const S=["Default","Formatting"];export{t as Default,o as Formatting,S as __namedExportsOrder,I as default};
