import{c as T,j as n}from"./component-2bcf5de3.js";import{B as u}from"./Box-21020479.js";import{F as f}from"./Footer-0ed44fe9.js";import{T as B}from"./Text-40e51ee1.js";import{B as g}from"./Button-4359694e.js";const y="Container",r=T(y),w={title:"Layout/Container",component:r,argTypes:{children:{description:"The children of the container.",table:{type:{summary:"BoxElement | [BoxElement, FooterElement]"}}}}},e={render:t=>n(r,{...t}),args:{children:[n(u,{children:n(B,{children:"This is a box containing the main content."})}),n(f,{children:n(g,{children:"Action"})})]}},o={render:t=>n(r,{...t}),args:{children:n(u,{children:n(B,{children:"This is a box containing the main content."})})}};var a,i,s,c,p;e.parameters={...e.parameters,docs:{...(a=e.parameters)==null?void 0:a.docs,source:{originalSource:`{
  render: props => <Container {...props} />,
  args: {
    children: [<Box>
        <Text>This is a box containing the main content.</Text>
      </Box>, <Footer>
        <Button>Action</Button>
      </Footer>]
  }
}`,...(s=(i=e.parameters)==null?void 0:i.docs)==null?void 0:s.source},description:{story:"The container component does not render anything itself, but it is used to\ngroup other components, namely the `Box` and `Footer` components.\n\nIt can contain a `Box` and a `Footer` or just a `Box`.",...(p=(c=e.parameters)==null?void 0:c.docs)==null?void 0:p.description}}};var d,m,l,h,x;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: props => <Container {...props} />,
  args: {
    children: <Box>
        <Text>This is a box containing the main content.</Text>
      </Box>
  }
}`,...(l=(m=o.parameters)==null?void 0:m.docs)==null?void 0:l.source},description:{story:`A container with only a box. In this case the footer will be populated
automatically with the default footer.`,...(x=(h=o.parameters)==null?void 0:h.docs)==null?void 0:x.description}}};const A=["Default","BoxOnly"];export{o as BoxOnly,e as Default,A as __namedExportsOrder,w as default};
