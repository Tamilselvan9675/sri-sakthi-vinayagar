import * as migration_20261017_162816_initial_cms from './20261017_162816_initial_cms';
import * as migration_20261018_171007_media_storage_fields from './20261018_171007_media_storage_fields';
import * as migration_20261107_184500_finance_files from './20261107_184500_finance_files';
import * as migration_20261108_020000_contact_messages from './20261108_020000_contact_messages';
import * as migration_20261108_023000_contact_replies from './20261108_023000_contact_replies';

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
  {
    up: migration_20261107_184500_finance_files.up,
    down: migration_20261107_184500_finance_files.down,
    name: '20261107_184500_finance_files',
  },
  {
    up: migration_20261108_020000_contact_messages.up,
    down: migration_20261108_020000_contact_messages.down,
    name: '20261108_020000_contact_messages',
  },
  {
    up: migration_20261108_023000_contact_replies.up,
    down: migration_20261108_023000_contact_replies.down,
    name: '20261108_023000_contact_replies',
  },
];


