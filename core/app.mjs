import { AppEvents } from './event.mjs'

export class CoreApp {
  constructor() {
    this.instances = new Map() // Stores registered instances
    this.events = new AppEvents()
  }

  /**
   * Registers a new instance if it doesn't exist, or returns an existing one.
   * Automatically creates an instance from the provided class.
   * @param {Function} InstanceClass - The class to instantiate or retrieve.
   * @returns {object} - The registered or newly created instance.
   */
  async inject(InstanceClass) {
    const className = InstanceClass.name

    // Check if the instance already exists
    if (this.instances.has(className)) {
      return this.instances.get(className)
    }

    // Create a new instance and register it
    const instance = new InstanceClass(this)
    this.instances.set(className, instance)

    if (typeof instance.initialize === 'function') {
      await instance.initialize(this)
    }

    return instance
  }
}
