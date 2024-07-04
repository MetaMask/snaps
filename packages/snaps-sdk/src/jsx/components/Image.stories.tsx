import type { Meta, Story } from '@metamask/snaps-storybook';

import type { ImageProps } from './Image';
import { Image } from './Image';

const meta: Meta<typeof Image> = {
  title: 'UI/Image',
  component: Image,
  argTypes: {
    src: {
      description: 'The image to display as SVG string.',
      table: {
        type: {
          summary: 'string',
        },
      },
    },
    alt: {
      description: 'The alternative text for the image.',
      table: {
        type: {
          summary: 'string',
        },
      },
    },
  },
};

export default meta;

export const Default: Story<ImageProps> = {
  render: (props) => <Image {...props} />,
  args: {
    src: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
        <rect width="400" height="300" fill="#cccccc"></rect>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="26px" fill="#333333">400x300</text>
      </svg>
    `.trim(),
    alt: 'Image',
  },
};

/**
 * Image components only accept SVG images as strings, but you can use the
 * SVG `image` tag to embed raster images, using `data:image/png;base64` or
 * `data:image/jpeg;base64`.
 *
 * It's not possible to load remote images.
 */
export const Embedded: Story<ImageProps> = {
  render: (props) => <Image {...props} />,
  args: {
    src: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
        <image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAByUExURUdwTOJ3FcOwoMKvoOV3FOJ3FOV3FHc7D+Z4FOZ2FPaGFHc6DuV3FM5hDuN3FMGvn9jCtQ4ODuV2GR4xRZ+Qg+N1FOt9FNpsEeV4FON2FK9cEcy4q91yFKZWEc1rE8y4quJ1FOx8GOF+Ge5/F+Z4FMx2HzIxdYQAAAAKdFJOUwDfhIb7+tW/M3CCnofEAAABoklEQVRYw+3W13qDMAwGUDrTWgq4oVnd8/1fsYDxkJBsaO/6RTeJbP0nJruqTvWvCv44DACI89J13Q1LQCfgdSl9Vg95GRgIzD+4i08BgChoRl3H/EQAKuAlT1/VNK8CgTCkeJwDAHlhmmcCCMIUAB1gAkgA5PIcYIKQLwHAAVgKdEQCCNsMWOUEKb+qykcAD0D5APlrwBmAlI/ArwRMAVx+CUgBXAg8IQfwpQBUwsdp5/K7sZ2bHx8xHsF3h/QFVYQHkmCAa5+VfCeQS5aA8KTIPwF+96ADX34mC+x1YJ8Dwkdvsw7lFmK/MRnBCAIDYr4AbGggtFkg/QbshbZtI9A3JC8IFDAfHPg2CwDjRlsPtMmiBhgBkG8UwUglJxcA7+7mcw4Q3mxvwyuG0wAOG9swqAFuDidC2FCAGyrw38Z03dVtpR5h6wdpHskFTP/EIDmCu3M3FlsuAugmrfWAtXFVBVLhuO7jKdAT62M2T49gLQesLRygIpvNELkfa2gaPiMLvjlvXrvMWNY+NhfiGANI25DKTWql5ufXH+OnOtX8+gGrBlvUffT1HQAAAABJRU5ErkJggg==" width="64" height="64"></image>
      </svg>
    `.trim(),
    alt: 'Image',
  },
};
