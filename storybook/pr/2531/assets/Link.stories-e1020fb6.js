import{j as n,a as f}from"./component-2bcf5de3.js";import{L as a}from"./Link-9243ebd4.js";import{I as u}from"./Italic-970c90c5.js";import{B as g}from"./Bold-9e86656d.js";const I={title:"Link",component:a,argTypes:{href:{description:"The URL to link to.",control:"text"},children:{description:"The text to display in the link. This can contain formatting components.",control:"text"}}},t={render:r=>n(a,{...r}),args:{href:"https://metamask.io",children:"MetaMask"}},e={render:r=>n(a,{...r}),args:{href:"https://metamask.io",children:f(g,{children:["Formatted ",n(u,{children:"link"})]})}};var o,s,i,c,p;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: props => <Link {...props} />,
  args: {
    href: 'https://metamask.io',
    children: 'MetaMask'
  }
}`,...(i=(s=t.parameters)==null?void 0:s.docs)==null?void 0:i.source},description:{story:`The link component renders a hyperlink, and an icon to indicate that the link
will open in a new tab.`,...(p=(c=t.parameters)==null?void 0:c.docs)==null?void 0:p.description}}};var d,m,l,h,k;e.parameters={...e.parameters,docs:{...(d=e.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: props => <Link {...props} />,
  args: {
    href: 'https://metamask.io',
    children: <Bold>
        Formatted <Italic>link</Italic>
      </Bold>
  }
}`,...(l=(m=e.parameters)==null?void 0:m.docs)==null?void 0:l.source},description:{story:"Links can contain the usual formatting components, such as `Bold` and\n`Italic`.",...(k=(h=e.parameters)==null?void 0:h.docs)==null?void 0:k.description}}};const T=["Default","Formatting"];export{t as Default,e as Formatting,T as __namedExportsOrder,I as default};
