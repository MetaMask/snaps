import assert from 'assert';

import { packageJsonRecommendedFields } from './package-json-recommended-fields';
import { getMockExtendableSnapFiles, getPackageJson } from '../../test-utils';

describe('packageJsonRecommendedFields', () => {
  it('does nothing if fields exist', async () => {
    const files = getMockExtendableSnapFiles();

    const report = jest.fn();

    assert(packageJsonRecommendedFields.semanticCheck);
    await packageJsonRecommendedFields.semanticCheck(files, { report });

    expect(report).toHaveBeenCalledTimes(0);
  });

  it('reports if "repository" is missing', async () => {
    const packageJson = getPackageJson();
    delete packageJson.repository;
    const files = getMockExtendableSnapFiles({ packageJson });

    const report = jest.fn();

    assert(packageJsonRecommendedFields.semanticCheck);
    await packageJsonRecommendedFields.semanticCheck(files, { report });

    expect(report).toHaveBeenCalledWith(
      'package-json-recommended-fields-repository',
      'Missing recommended package.json property: "repository".',
    );
  });
});
