class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  /**
   * Add a new element to the end of the list. The value can be any object
   * (Driver, Customer, primitive, etc.). Internally we always wrap it in a
   * Node instance so that consumers don't have to know about the list
   * representation.
   */
  insert(data) {
    const node = new Node(data);
    if (this.head === null) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next !== null) {
        current = current.next;
      }
      current.next = node;
    }
    this.size++;
    console.log(`Inserted: ${data}`);
  }

  /**
   * Walks the list and calls `callback` for each item. The item passed is the
   * original value supplied to `insert` (not the internal Node).
   */
  traverse(callback) {
    let current = this.head;
    while (current !== null) {
      callback(current.data);
      current = current.next;
    }
  }

  /**
   * Returns the first element for which `predicate(element)` returns true, or
   * null if none match.
   */
  search(predicate) {
    let current = this.head;
    while (current !== null) {
      if (predicate(current.data)) {
        return current.data;
      }
      current = current.next;
    }
    return null;
  }

  /**
   * Remove the first element satisfying the predicate. Returns true if an
   * element was removed, false otherwise.
   */
  delete(predicate) {
    if (!this.head) return false;

    if (predicate(this.head.data)) {
      this.head = this.head.next;
      this.size--;
      return true;
    }

    let prev = this.head;
    let current = this.head.next;
    while (current !== null) {
      if (predicate(current.data)) {
        prev.next = current.next;
        this.size--;
        return true;
      }
      prev = current;
      current = current.next;
    }
    return false;
  }

  /**
   * Convenience debug renderer; if stored items have a `display()` method it
   * will be invoked for each one.
   */
  listdisplay() {
    this.traverse((item) => {
      if (item && typeof item.display === "function") {
        item.display();
      }
    });
  }
}

