import { GatsbyNode } from 'gatsby';
import { NormalModuleReplacementPlugin } from 'webpack';

export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({
  actions,
}) =>
  actions.setWebpackConfig({
    resolve: {
      fallback: {
        crypto: false,
      },
    },
    plugins: [
      new NormalModuleReplacementPlugin(/node:/u, (resource) => {
        resource.request = resource.request.replace(/^node:/u, '');
      }),
    ],
  });
