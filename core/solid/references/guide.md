# Legacy Detailed Guide

This file preserves the previous detailed version of `SKILL.md` for deep reference.


# Clean Code Principles

> SOLID, DRY, KISS, and best practices for maintainable code.

## Principles Overview

| Principle | Meaning |
|-----------|---------|
| **S**ingle Responsibility | One class/function = one job |
| **O**pen/Closed | Open for extension, closed for modification |
| **L**iskov Substitution | Subtypes must be substitutable |
| **I**nterface Segregation | Many specific interfaces > one general |
| **D**ependency Inversion | Depend on abstractions, not concretions |
| **DRY** | Don't Repeat Yourself |
| **KISS** | Keep It Simple, Stupid |
| **YAGNI** | You Ain't Gonna Need It |

## Instructions

### 1. Single Responsibility Principle (SRP)

```typescript
// âŒ Bad - Multiple responsibilities
class UserService {
  createUser(data: CreateUserDto) { /* ... */ }
  sendWelcomeEmail(user: User) { /* ... */ }
  generateReport(users: User[]) { /* ... */ }
  validatePassword(password: string) { /* ... */ }
}

// âœ… Good - Separated concerns
class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async createUser(data: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(data);
    await this.emailService.sendWelcome(user);
    return user;
  }
}

class EmailService {
  sendWelcome(user: User) { /* ... */ }
  sendPasswordReset(user: User) { /* ... */ }
}

class ReportService {
  generateUserReport(users: User[]) { /* ... */ }
}
```

### 2. Open/Closed Principle (OCP)

```typescript
// âŒ Bad - Modifying existing code for new features
class PaymentProcessor {
  process(type: string, amount: number) {
    if (type === 'credit') {
      // process credit
    } else if (type === 'paypal') {
      // process paypal
    } else if (type === 'crypto') {
      // Adding new payment = modifying this class
    }
  }
}

// âœ… Good - Extend without modification
interface PaymentMethod {
  process(amount: number): Promise<PaymentResult>;
}

class CreditCardPayment implements PaymentMethod {
  async process(amount: number) { /* ... */ }
}

class PayPalPayment implements PaymentMethod {
  async process(amount: number) { /* ... */ }
}

class CryptoPayment implements PaymentMethod {
  async process(amount: number) { /* ... */ }
}

class PaymentProcessor {
  constructor(private paymentMethod: PaymentMethod) {}

  async process(amount: number) {
    return this.paymentMethod.process(amount);
  }
}
```

### 3. Liskov Substitution Principle (LSP)

```typescript
// âŒ Bad - Subtype changes behavior unexpectedly
class Rectangle {
  constructor(protected width: number, protected height: number) {}
  setWidth(w: number) { this.width = w; }
  setHeight(h: number) { this.height = h; }
  getArea() { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(w: number) {
    this.width = w;
    this.height = w; // Breaks LSP - unexpected behavior
  }
}

// âœ… Good - Use composition or proper abstraction
interface Shape {
  getArea(): number;
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  getArea() { return this.width * this.height; }
}

class Square implements Shape {
  constructor(private side: number) {}
  getArea() { return this.side * this.side; }
}
```

### 4. Interface Segregation Principle (ISP)

```typescript
// âŒ Bad - Fat interface
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  code(): void;
  manage(): void;
}

// Robot can't eat/sleep, Manager can't code

// âœ… Good - Segregated interfaces
interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

interface Codeable {
  code(): void;
}

interface Manageable {
  manage(): void;
}

class Developer implements Workable, Eatable, Codeable {
  work() { /* ... */ }
  eat() { /* ... */ }
  code() { /* ... */ }
}

class Robot implements Workable, Codeable {
  work() { /* ... */ }
  code() { /* ... */ }
}
```

### 5. Dependency Inversion Principle (DIP)

```typescript
// âŒ Bad - High-level depends on low-level
class UserService {
  private database = new MySQLDatabase(); // Concrete dependency

  getUser(id: string) {
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// âœ… Good - Depend on abstractions
interface Database {
  query<T>(sql: string): Promise<T>;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
}

class MySQLUserRepository implements UserRepository {
  constructor(private db: Database) {}

  async findById(id: string) {
    return this.db.query<User>(`SELECT * FROM users WHERE id = ?`, [id]);
  }
}

class UserService {
  constructor(private userRepo: UserRepository) {} // Abstraction

  async getUser(id: string) {
    return this.userRepo.findById(id);
  }
}

// Dependency injection
const userService = new UserService(new MySQLUserRepository(database));
```

### 6. DRY (Don't Repeat Yourself)

```typescript
// âŒ Bad - Repeated logic
function validateEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) throw new Error('Invalid email');
}

function validateUserEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) throw new Error('Invalid email');
}

// âœ… Good - Single source of truth
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function validateEmail(email: string): void {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email');
  }
}
```

### 7. KISS (Keep It Simple, Stupid)

```typescript
// âŒ Bad - Over-engineered
class UserNameFormatter {
  private strategies: Map<string, FormatterStrategy>;
  
  constructor() {
    this.strategies = new Map();
    this.strategies.set('full', new FullNameStrategy());
    this.strategies.set('initials', new InitialsStrategy());
  }
  
  format(user: User, type: string) {
    return this.strategies.get(type)?.format(user);
  }
}

// âœ… Good - Simple and clear
function formatUserName(user: User, format: 'full' | 'initials'): string {
  if (format === 'full') {
    return `${user.firstName} ${user.lastName}`;
  }
  return `${user.firstName[0]}. ${user.lastName[0]}.`;
}
```

### 8. YAGNI (You Ain't Gonna Need It)

```typescript
// âŒ Bad - Building for hypothetical future
interface User {
  id: string;
  name: string;
  email: string;
  // "We might need these later"
  socialSecurityNumber?: string;
  bloodType?: string;
  favoriteColor?: string;
  mothersMaidenName?: string;
}

// âœ… Good - Build what you need now
interface User {
  id: string;
  name: string;
  email: string;
}

// Add fields when actually needed
```

### 9. Clean Functions

```typescript
// âŒ Bad
function process(d: any, t: string, f: boolean) {
  // What do d, t, f mean?
}

// âœ… Good
function processPayment(
  paymentData: PaymentData,
  transactionType: TransactionType,
  shouldNotifyUser: boolean
): PaymentResult {
  // Clear intent
}

// âŒ Bad - Too many parameters
function createUser(name, email, age, role, department, manager, salary) {}

// âœ… Good - Use object parameter
interface CreateUserParams {
  name: string;
  email: string;
  age: number;
  role: Role;
  department?: string;
  managerId?: string;
}

function createUser(params: CreateUserParams): User {}
```

### 10. Composition Over Inheritance

```typescript
// âŒ Bad - Deep inheritance
class Animal { }
class Mammal extends Animal { }
class Dog extends Mammal { }
class GermanShepherd extends Dog { }

// âœ… Good - Composition
interface Walkable {
  walk(): void;
}

interface Swimmable {
  swim(): void;
}

class Dog implements Walkable {
  walk() { console.log('Walking'); }
}

class Duck implements Walkable, Swimmable {
  walk() { console.log('Waddling'); }
  swim() { console.log('Swimming'); }
}
```

## Quick Reference

| Principle | Question to Ask |
|-----------|-----------------|
| SRP | Does this class/function do only one thing? |
| OCP | Can I add features without modifying existing code? |
| LSP | Can I substitute a subtype without breaking anything? |
| ISP | Are my interfaces minimal and focused? |
| DIP | Am I depending on abstractions, not concretions? |
| DRY | Is there any duplicated logic? |
| KISS | Is this the simplest solution? |
| YAGNI | Do I actually need this right now? |

## References

- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)



