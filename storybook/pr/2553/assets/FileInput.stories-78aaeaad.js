import{c as j,j as o}from"./component-2bcf5de3.js";import{F as A}from"./Field-6d270c9c.js";const D="FileInput",s=j(D),W={title:"Forms/FileInput",component:s,argTypes:{name:{description:"The name of the file input field. This is used to identify the state in the form data.",control:"text",table:{type:{summary:"string"}}}}},n={render:e=>o(s,{...e}),args:{name:"file-input-name"}},r={render:e=>o(s,{...e}),args:{name:"file-input-name",compact:!0}},a={render:e=>o(A,{label:"Upload file",children:o(s,{...e})}),args:{name:"file-input-name"}},t={render:e=>o(s,{...e}),args:{name:"file-input-name",accept:["image/*"]}};var i,p,c,l,m;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: props => <FileInput {...props} />,
  args: {
    name: 'file-input-name'
  }
}`,...(c=(p=n.parameters)==null?void 0:p.docs)==null?void 0:c.source},description:{story:`The file input component renders a drop zone for users to upload files. It
can also be clicked to open a file picker dialog.

It shows the file name when a file is selected.`,...(m=(l=n.parameters)==null?void 0:l.docs)==null?void 0:m.description}}};var d,u,f,g,h;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: props => <FileInput {...props} />,
  args: {
    name: 'file-input-name',
    compact: true
  }
}`,...(f=(u=r.parameters)==null?void 0:u.docs)==null?void 0:f.source},description:{story:`The file input component in compact mode renders a button with an icon for
users to upload files. It can also be clicked to open a file picker dialog.`,...(h=(g=r.parameters)==null?void 0:g.docs)==null?void 0:h.description}}};var F,I,b,y,T;a.parameters={...a.parameters,docs:{...(F=a.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: props => <Field label="Upload file">
      <FileInput {...props} />
    </Field>,
  args: {
    name: 'file-input-name'
  }
}`,...(b=(I=a.parameters)==null?void 0:I.docs)==null?void 0:b.source},description:{story:`The file input component with a label renders a label above the file input
field.`,...(T=(y=a.parameters)==null?void 0:y.docs)==null?void 0:T.description}}};var k,S,w,x,C;t.parameters={...t.parameters,docs:{...(k=t.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: props => <FileInput {...props} />,
  args: {
    name: 'file-input-name',
    accept: ['image/*']
  }
}`,...(w=(S=t.parameters)==null?void 0:S.docs)==null?void 0:w.source},description:{story:`The file input component can be configured to accept only files of a certain
type, like images.`,...(C=(x=t.parameters)==null?void 0:x.docs)==null?void 0:C.description}}};const _=["Default","Compact","WithinField","AcceptImages"];export{t as AcceptImages,r as Compact,n as Default,a as WithinField,_ as __namedExportsOrder,W as default};
