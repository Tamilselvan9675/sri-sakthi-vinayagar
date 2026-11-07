import * as migration_20261017_162816_initial_cms from './20261017_162816_initial_cms';
import * as migration_20261018_171007_media_storage_fields from './20261018_171007_media_storage_fields';

export const migrations = [
  {
    up: migration_20261017_162816_initial_cms.up,
    down: migration_20261017_162816_initial_cms.down,
    name: '20261017_162816_initial_cms',
  },
  {
    up: migration_20261018_171007_media_storage_fields.up,
    down: migration_20261018_171007_media_storage_fields.down,
    name: '20261018_171007_media_storage_fields'
  },
];
