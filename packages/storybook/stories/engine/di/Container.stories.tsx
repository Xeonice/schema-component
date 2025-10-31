import type { Meta, StoryObj } from '@storybook/react'
import React, { useState, useEffect } from 'react'

/**
 * DI Container Stories
 * Demonstrates the Dependency Injection container capabilities
 */

interface CodeDemoProps {
  title: string
  description: string
  code: string
  result?: string
  isAsync?: boolean
}

const CodeDemo: React.FC<CodeDemoProps> = ({
  title,
  description,
  code,
  result,
  isAsync = false
}) => {
  const [output, setOutput] = useState<string>(result || '')
  const [isRunning, setIsRunning] = useState(false)

  const runCode = async () => {
    setIsRunning(true)
    setOutput('Executing...')

    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 500))

    setOutput(result || 'Code executed successfully')
    setIsRunning(false)
  }

  useEffect(() => {
    if (result) {
      setOutput(result)
    }
  }, [result])

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0, color: '#1f2937' }}>{title}</h3>
      <p style={{ color: '#6b7280', marginBottom: '16px' }}>{description}</p>

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Code:</h4>
        <pre style={{
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          padding: '16px',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '13px',
          lineHeight: '1.5'
        }}>
          {code}
        </pre>
      </div>

      {isAsync && (
        <button
          onClick={runCode}
          disabled={isRunning}
          style={{
            padding: '8px 16px',
            backgroundColor: isRunning ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            marginBottom: '12px'
          }}
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      )}

      {output && (
        <div style={{ marginTop: '12px' }}>
          <h4 style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Output:</h4>
          <pre style={{
            backgroundColor: '#f9fafb',
            color: '#1f2937',
            padding: '12px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '13px',
            border: '1px solid #e5e7eb'
          }}>
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}

const meta: Meta<typeof CodeDemo> = {
  title: 'Engine/DI/Container',
  component: CodeDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Interactive examples demonstrating the Dependency Injection container features.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof CodeDemo>

// 1. Basic Service Binding and Resolution
export const BasicBinding: Story = {
  args: {
    title: '1. Basic Service Binding and Resolution',
    description: 'Create a container, bind a service, and resolve it.',
    code: `import { createContainer } from '@schema-component/engine'

// Create container
const container = createContainer()

// Define a simple service
class Logger {
  log(message: string) {
    console.log(\`[LOG] \${message}\`)
  }
}

// Create type identifier
const LOGGER = Symbol.for('Logger')

// Bind service to container
container.bind(LOGGER).to(Logger)

// Resolve service
const logger = container.get<Logger>(LOGGER)
logger.log('Hello from DI container!')

console.log('Service bound:', container.isBound(LOGGER))`,
    result: `[LOG] Hello from DI container!
Service bound: true`
  }
}

// 2. Singleton Lifecycle
export const SingletonLifecycle: Story = {
  args: {
    title: '2. Singleton Lifecycle',
    description: 'Singleton services return the same instance every time.',
    code: `import { createContainer } from '@schema-component/engine'

const container = createContainer()

class Counter {
  private count = 0

  increment() {
    this.count++
  }

  getCount() {
    return this.count
  }
}

const COUNTER = Symbol.for('Counter')

// Bind as Singleton (default behavior)
container.bind(COUNTER).to(Counter).inSingletonScope()

// Get instance and increment
const counter1 = container.get<Counter>(COUNTER)
counter1.increment()
counter1.increment()

// Get another instance
const counter2 = container.get<Counter>(COUNTER)
counter2.increment()

console.log('Counter1 count:', counter1.getCount())
console.log('Counter2 count:', counter2.getCount())
console.log('Same instance:', counter1 === counter2)`,
    result: `Counter1 count: 3
Counter2 count: 3
Same instance: true`
  }
}

// 3. Transient Lifecycle
export const TransientLifecycle: Story = {
  args: {
    title: '3. Transient Lifecycle',
    description: 'Transient services create a new instance for each resolution.',
    code: `import { createContainer } from '@schema-component/engine'

const container = createContainer()

class Request {
  private id = Math.random().toString(36).substring(7)

  getId() {
    return this.id
  }
}

const REQUEST = Symbol.for('Request')

// Bind as Transient
container.bind(REQUEST).to(Request).inTransientScope()

// Get multiple instances
const request1 = container.get<Request>(REQUEST)
const request2 = container.get<Request>(REQUEST)
const request3 = container.get<Request>(REQUEST)

console.log('Request1 ID:', request1.getId())
console.log('Request2 ID:', request2.getId())
console.log('Request3 ID:', request3.getId())
console.log('Same instance:', request1 === request2)`,
    result: `Request1 ID: x7k2m9
Request2 ID: p4q8n1
Request3 ID: z9w5j3
Same instance: false`
  }
}

// 4. Using @injectable Decorator
export const InjectableDecorator: Story = {
  args: {
    title: '4. Using @injectable Decorator',
    description: 'The @injectable decorator marks classes as injectable.',
    code: `import { createContainer, injectable } from '@schema-component/engine'

const container = createContainer()

// Mark class as injectable
@injectable()
class EmailService {
  sendEmail(to: string, subject: string) {
    return \`Email sent to \${to}: \${subject}\`
  }
}

const EMAIL_SERVICE = Symbol.for('EmailService')

// Bind injectable class
container.bind(EMAIL_SERVICE).to(EmailService)

// Resolve and use
const emailService = container.get<EmailService>(EMAIL_SERVICE)
const result = emailService.sendEmail('user@example.com', 'Welcome!')

console.log(result)`,
    result: `Email sent to user@example.com: Welcome!`
  }
}

// 5. Constructor Injection with @inject
export const ConstructorInjection: Story = {
  args: {
    title: '5. Constructor Injection with @inject',
    description: 'Use @inject to inject dependencies into constructor parameters.',
    code: `import { createContainer, injectable, inject } from '@schema-component/engine'

const container = createContainer()

// Define type identifiers
const LOGGER = Symbol.for('Logger')
const HTTP_CLIENT = Symbol.for('HttpClient')
const USER_SERVICE = Symbol.for('UserService')

// Define services
@injectable()
class Logger {
  log(message: string) {
    console.log(\`[LOG] \${message}\`)
  }
}

@injectable()
class HttpClient {
  get(url: string) {
    return \`GET \${url}\`
  }
}

// Service with dependencies
@injectable()
class UserService {
  constructor(
    @inject(LOGGER) private logger: Logger,
    @inject(HTTP_CLIENT) private http: HttpClient
  ) {}

  getUser(id: string) {
    this.logger.log(\`Fetching user \${id}\`)
    const result = this.http.get(\`/api/users/\${id}\`)
    return result
  }
}

// Bind all services
container.bind(LOGGER).to(Logger)
container.bind(HTTP_CLIENT).to(HttpClient)
container.bind(USER_SERVICE).to(UserService)

// Resolve and use (dependencies are auto-injected)
const userService = container.get<UserService>(USER_SERVICE)
const result = userService.getUser('123')

console.log('Result:', result)`,
    result: `[LOG] Fetching user 123
Result: GET /api/users/123`,
    isAsync: true
  }
}

// 6. Optional Dependencies
export const OptionalDependencies: Story = {
  args: {
    title: '6. Optional Dependencies with @optional',
    description: 'Optional dependencies won\'t throw errors if not bound.',
    code: `import { createContainer, injectable, inject, optional } from '@schema-component/engine'

const container = createContainer()

const LOGGER = Symbol.for('Logger')
const ANALYTICS = Symbol.for('Analytics')
const SERVICE = Symbol.for('Service')

@injectable()
class Logger {
  log(message: string) {
    console.log(\`[LOG] \${message}\`)
  }
}

// Service with optional analytics
@injectable()
class MyService {
  constructor(
    @inject(LOGGER) private logger: Logger,
    @inject(ANALYTICS) @optional() private analytics?: any
  ) {}

  doWork() {
    this.logger.log('Working...')

    if (this.analytics) {
      console.log('Analytics tracked')
    } else {
      console.log('No analytics available')
    }
  }
}

// Bind only Logger, not Analytics
container.bind(LOGGER).to(Logger)
container.bind(SERVICE).to(MyService)

// Still works without Analytics
const service = container.get<MyService>(SERVICE)
service.doWork()`,
    result: `[LOG] Working...
No analytics available`
  }
}

// 7. Named Bindings
export const NamedBindings: Story = {
  args: {
    title: '7. Named Bindings',
    description: 'Use named bindings when you have multiple implementations of the same interface.',
    code: `import { createContainer, injectable, inject, named } from '@schema-component/engine'

const container = createContainer()

const DATABASE = Symbol.for('Database')
const REPOSITORY = Symbol.for('Repository')

// Multiple database implementations
@injectable()
class MySQLDatabase {
  query(sql: string) {
    return \`MySQL: \${sql}\`
  }
}

@injectable()
class PostgresDatabase {
  query(sql: string) {
    return \`Postgres: \${sql}\`
  }
}

// Repository using MySQL
@injectable()
class UserRepository {
  constructor(
    @inject(DATABASE) @named('mysql') private db: any
  ) {}

  findAll() {
    return this.db.query('SELECT * FROM users')
  }
}

// Bind named implementations
container.bind(DATABASE).to(MySQLDatabase).whenTargetNamed('mysql')
container.bind(DATABASE).to(PostgresDatabase).whenTargetNamed('postgres')
container.bind(REPOSITORY).to(UserRepository)

// Resolve repository (gets MySQL database)
const repo = container.get<UserRepository>(REPOSITORY)
const result = repo.findAll()

console.log(result)`,
    result: `MySQL: SELECT * FROM users`
  }
}

// 8. Using TYPES Constants
export const TypesConstants: Story = {
  args: {
    title: '8. Using TYPES Constants',
    description: 'The engine provides predefined TYPES for common services.',
    code: `import { createContainer, TYPES, injectable, inject } from '@schema-component/engine'

const container = createContainer()

// Use predefined TYPES
@injectable()
class Logger {
  log(message: string) {
    console.log(\`[LOG] \${message}\`)
  }
}

@injectable()
class EventBus {
  publish(event: string) {
    console.log(\`Event published: \${event}\`)
  }
}

@injectable()
class MyService {
  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.EventBus) private eventBus: EventBus
  ) {}

  doSomething() {
    this.logger.log('Doing something...')
    this.eventBus.publish('something:done')
  }
}

// Bind using TYPES
container.bind(TYPES.Logger).to(Logger)
container.bind(TYPES.EventBus).to(EventBus)
container.bind(Symbol.for('MyService')).to(MyService)

const service = container.get<MyService>(Symbol.for('MyService'))
service.doSomething()`,
    result: `[LOG] Doing something...
Event published: something:done`
  }
}

// 9. Model Decorators
export const ModelDecorators: Story = {
  args: {
    title: '9. Model Decorators',
    description: 'Use @Model, @Field, @Action decorators to define models.',
    code: `import {
  Model, Field, Action, Hook,
  getModelName, getModelFields, getModelActions
} from '@schema-component/engine'

// Define model with decorators
@Model('User')
class UserModel {
  @Field({ type: 'string', required: true })
  name: string

  @Field({ type: 'string', required: true, unique: true })
  email: string

  @Field({ type: 'number', default: 0 })
  loginCount: number

  @Hook('beforeCreate')
  async validateEmail(data: any) {
    console.log('Validating email...')
  }

  @Action()
  async sendWelcomeEmail(userId: string) {
    console.log(\`Sending welcome email to user \${userId}\`)
    return { success: true }
  }

  @Action('activate')
  async activateAccount(userId: string) {
    console.log(\`Activating user \${userId}\`)
    return { activated: true }
  }
}

// Read metadata
const modelName = getModelName(UserModel)
const fields = getModelFields(UserModel)
const actions = getModelActions(UserModel)

console.log('Model name:', modelName)
console.log('Fields:', Object.keys(fields).join(', '))
console.log('Actions:', Object.keys(actions).join(', '))`,
    result: `Model name: User
Fields: name, email, loginCount
Actions: sendWelcomeEmail, activate`
  }
}

// 10. Complete DI Example
export const CompleteDIExample: Story = {
  args: {
    title: '10. Complete DI Example',
    description: 'A complete example showing DI in action with multiple services.',
    code: `import {
  createContainer, injectable, inject,
  TYPES
} from '@schema-component/engine'

const container = createContainer()

// Define services
@injectable()
class Logger {
  log(message: string) {
    console.log(\`[LOG] \${message}\`)
  }
}

@injectable()
class Database {
  query(sql: string) {
    return [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
  }
}

@injectable()
class EmailService {
  send(to: string, subject: string) {
    console.log(\`Email to \${to}: \${subject}\`)
  }
}

@injectable()
class UserRepository {
  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(Symbol.for('Database')) private db: Database
  ) {}

  findAll() {
    this.logger.log('Fetching all users...')
    return this.db.query('SELECT * FROM users')
  }
}

@injectable()
class UserService {
  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(Symbol.for('UserRepository')) private repo: UserRepository,
    @inject(Symbol.for('EmailService')) private email: EmailService
  ) {}

  async registerUser(name: string, email: string) {
    this.logger.log(\`Registering user: \${name}\`)

    // Get existing users
    const users = this.repo.findAll()

    // Send welcome email
    this.email.send(email, 'Welcome!')

    return {
      success: true,
      user: { id: users.length + 1, name, email }
    }
  }
}

// Bind all services
container.bind(TYPES.Logger).to(Logger).inSingletonScope()
container.bind(Symbol.for('Database')).to(Database).inSingletonScope()
container.bind(Symbol.for('EmailService')).to(EmailService).inSingletonScope()
container.bind(Symbol.for('UserRepository')).to(UserRepository)
container.bind(Symbol.for('UserService')).to(UserService)

// Use the service
const userService = container.get<UserService>(Symbol.for('UserService'))
const result = await userService.registerUser('Charlie', 'charlie@example.com')

console.log('Result:', JSON.stringify(result, null, 2))`,
    result: `[LOG] Registering user: Charlie
[LOG] Fetching all users...
Email to charlie@example.com: Welcome!
Result: {
  "success": true,
  "user": {
    "id": 3,
    "name": "Charlie",
    "email": "charlie@example.com"
  }
}`,
    isAsync: true
  }
}

// 11. Child Container
export const ChildContainer: Story = {
  args: {
    title: '11. Child Container',
    description: 'Create child containers for isolated scopes.',
    code: `import { createContainer } from '@schema-component/engine'

// Create parent container
const parent = createContainer()

class Config {
  getValue(key: string) {
    return \`parent-\${key}\`
  }
}

const CONFIG = Symbol.for('Config')
parent.bind(CONFIG).to(Config)

// Create child container
const child = parent.createChild()

// Child inherits parent bindings
const config1 = child.get<Config>(CONFIG)
console.log('From child:', config1.getValue('test'))

// Override in child
class ChildConfig {
  getValue(key: string) {
    return \`child-\${key}\`
  }
}

child.rebind(CONFIG).to(ChildConfig)

const config2 = child.get<Config>(CONFIG)
console.log('After override:', config2.getValue('test'))

// Parent unchanged
const config3 = parent.get<Config>(CONFIG)
console.log('Parent still:', config3.getValue('test'))`,
    result: `From child: parent-test
After override: child-test
Parent still: parent-test`
  }
}

// 12. Constant Values
export const ConstantValues: Story = {
  args: {
    title: '12. Binding Constant Values',
    description: 'Bind configuration objects or constant values directly.',
    code: `import { createContainer } from '@schema-component/engine'

const container = createContainer()

const CONFIG = Symbol.for('Config')
const API_KEY = Symbol.for('ApiKey')

// Bind constant values
container.bind(CONFIG).toConstantValue({
  apiBaseUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
})

container.bind(API_KEY).toConstantValue('abc123xyz')

// Retrieve values
const config = container.get<any>(CONFIG)
const apiKey = container.get<string>(API_KEY)

console.log('API URL:', config.apiBaseUrl)
console.log('Timeout:', config.timeout)
console.log('API Key:', apiKey)`,
    result: `API URL: https://api.example.com
Timeout: 5000
API Key: abc123xyz`
  }
}
