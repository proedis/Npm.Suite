/**
 * A counting lock that many independent holders may acquire at the same time.
 *
 * Every holder is identified by an opaque string key: the gate is paused while at least one
 * key is held, and open again once the last one has been released. It carries no knowledge of
 * what it is gating — the caller decides what "paused" means for its own resource.
 */
export default class PauseGate {

  // ----
  // Private properties
  // ----

  /** The keys currently holding this gate closed */
  private readonly _holders: Set<string> = new Set<string>();


  // ----
  // Public methods
  // ----

  /**
   * Acquire the gate for the given key.
   *
   * @param key - The identifier of the holder acquiring the gate.
   * @returns `true` when the key has been added, `false` when it was already holding the gate.
   */
  public acquire(key: string): boolean {
    if (this._holders.has(key)) {
      return false;
    }

    this._holders.add(key);

    return true;
  }


  /**
   * Release the gate for the given key.
   *
   * @param key - The identifier of the holder releasing the gate.
   * @returns `true` when the gate has no holders left — the signal to flush whatever was queued
   *  while it was closed. `false` when other holders remain, or when the key was not holding it.
   */
  public release(key: string): boolean {
    if (!this._holders.has(key)) {
      return false;
    }

    this._holders.delete(key);

    return this._holders.size === 0;
  }


  /**
   * Check if a specific key is currently holding the gate.
   *
   * @param key - The identifier to look for.
   */
  public isLocked(key: string): boolean {
    return this._holders.has(key);
  }


  /**
   * Check if the gate is closed, whoever is holding it.
   */
  public isPaused(): boolean {
    return this._holders.size > 0;
  }


  /**
   * Drop every holder at once, reopening the gate.
   *
   * Reserved for teardown: releasing a gate somebody else still believes it is holding will let
   * through exactly the work that holder was suppressing.
   */
  public reset(): void {
    this._holders.clear();
  }

}
