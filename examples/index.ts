import { Database } from './database.ts';

const path: string = `${Runtime.cwd()}/examples/test.db`;
const db = new Database(path);

db.set('user', {
  name: 'John Doe',
  age: 42,
});

console.log('Saved', db.get('user'));

console.log('Delete', db.delete('user'));

console.log('Get after delete', db.get('user'));

console.log('Delete non-existent', db.delete('user'));
