class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  
  insert(data) {
    const node = new Node(data);
    if (this.head === null) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;//instead of going through the whole list, just go th the end (tail and add there)
      node.prev = this.tail;
      this.tail = node;
    }
    this.size++;
   // console.log(`Inserted: ${data}`);
  }

 
  traverse(callback) {// callback is the instance
    let current = this.head;
    while (current !== null) {
      callback(current.data);
      current = current.next;
    }
  }


  search(huntingtarget) {
    let current = this.head;
    while (current !== null) {
      if (huntingtarget(current.data)) {
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
      if (this.head) {
        this.head.prev = null;
      } else {
        this.tail = null;
      }
      this.size--;
      return true;
    }

    let prev = this.head;
    let current = this.head.next;
    while (current !== null) {
      if (remove(current.data)) {
        prev.next = current.next;
        if (current.next) {
          current.next.prev = prev;
        } else {
          this.tail = prev;
        }
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

