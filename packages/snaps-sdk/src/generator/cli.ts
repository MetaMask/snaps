#!/usr/bin/env node

import { generateSnapFiles } from './generator';

// eslint-disable-next-line no-console
generateSnapFiles().catch(console.error);
