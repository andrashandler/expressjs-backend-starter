import bcrypt from 'bcrypt';
import { db } from '.';
import { users } from './schema.js';

async function seed() {
  console.log('Seeding database...');

  try {
    // Hash the passwords
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('password456', 10);

    // Insert users into the database
    await db.insert(users).values([
      {
        name: 'John Smith',
        username: 'john',
        email: 'john@example.com',
        password: hashedPassword1,
      },
      {
        name: 'Jane Doe',
        username: 'jane',
        email: 'jane@example.com',
        password: hashedPassword2,
      },
    ]);

    console.log('Database seeded successfully.');
    console.table([
      {
        name: 'John Smith',
        username: 'john',
        email: 'john@example.com',
        password: 'password123',
      },
      {
        name: 'Jane Doe',
        username: 'jane',
        email: 'jane@example.com',
        password: 'password456',
      },
    ]);

    // Successful completion
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);

    // Exit with failure
    process.exit(1);
  }
}

seed();
