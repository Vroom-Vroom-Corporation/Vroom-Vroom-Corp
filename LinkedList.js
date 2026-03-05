class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  
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

  
  traverse(callback) {
    let current = this.head;
    while (current !== null) {
      callback(current.data);
      current = current.next;
    }
  }


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

  
  delete(remove) {
    if (!this.head) return false;

    if (remove(this.head.data)) {
      this.head = this.head.next;
      this.size--;
      return true;
    }

    let prev = this.head;
    let current = this.head.next;
    while (current !== null) {
      if (remove(current.data)) {
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

