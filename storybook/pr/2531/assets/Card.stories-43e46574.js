import{c as C,j as s}from"./component-2bcf5de3.js";const b="Card",a=C(b),E={title:"UI/Card",component:a,argTypes:{title:{description:"The title of the card."},description:{description:"The description to show below the title."},value:{description:"The value to show on the right side."},extra:{description:"An additional value to show below the value."},image:{description:"The image to show as part of the card. If provided, this must be an SVG string.",table:{type:{summary:"string"}}}}};function n(e){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(e)}const t={render:e=>s(a,{...e}),args:{title:"Title",description:"This is a description.",value:n(1200),extra:"0.12 ETH"}},r={render:e=>s(a,{...e}),args:{title:"Title",value:n(1200)}},i={render:e=>s(a,{...e}),args:{title:"Title",description:"This is a description.",value:n(1200),extra:"0.12 ETH",image:`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <rect width="32" height="32" fill="#cccccc"></rect>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="8px" fill="#333333">32x32</text>
      </svg>
    `}};var o,c,d,p,l;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: props => <Card {...props} />,
  args: {
    title: 'Title',
    description: 'This is a description.',
    value: formatCurrency(1200),
    extra: '0.12 ETH'
  }
}`,...(d=(c=t.parameters)==null?void 0:c.docs)==null?void 0:d.source},description:{story:"The card component renders a card with a title, description, and value.",...(l=(p=t.parameters)==null?void 0:p.docs)==null?void 0:l.description}}};var m,h,u,g,w;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: props => <Card {...props} />,
  args: {
    title: 'Title',
    value: formatCurrency(1200)
  }
}`,...(u=(h=r.parameters)==null?void 0:h.docs)==null?void 0:u.source},description:{story:"A basic card, with just a title and value.",...(w=(g=r.parameters)==null?void 0:g.docs)==null?void 0:w.description}}};var x,f,v,T,y;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: props => <Card {...props} />,
  args: {
    title: 'Title',
    description: 'This is a description.',
    value: formatCurrency(1200),
    extra: '0.12 ETH',
    image: \`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <rect width="32" height="32" fill="#cccccc"></rect>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="8px" fill="#333333">32x32</text>
      </svg>
    \`
  }
}`,...(v=(f=i.parameters)==null?void 0:f.docs)==null?void 0:v.source},description:{story:"A card with an image.",...(y=(T=i.parameters)==null?void 0:T.docs)==null?void 0:y.description}}};const I=["Default","Basic","WithImage"];export{r as Basic,t as Default,i as WithImage,I as __namedExportsOrder,E as default};
