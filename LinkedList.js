class LinkedList {
  constructor() {
    this.head = null;
        this.size=0;
  }
  listdisplay()
  {
if (this.head===null)
  {
    return
  }
    else{
      let prev=null;
      let current= this.head;
      for(let i=0; i<this.size; i++)
        {
          while(current.data!==i)
            {
               prev=current;
               //prev.isdeleverd=true;
              current=current.next;
            }
          if(current.data==i)
            current.display();
        }
    }
  }

  insert(data) {
    // STUDENTS IMPLEMENT
    
    let link = data;
    if (this.head === null) {
    this.head = link;}
    else{  
   let current=this.head;
      while(current.next!==null)
        {
          current=current.next;
        }
      current.next=link;
    }
    this.size++;
      //courier.assignDelivery(link);
    //console.log("yo deliveru",this.size);
  

  }

  delete(data) {
    // STUDENTS IMPLEMENT
  }

  search(predicate) {
    // STUDENTS IMPLEMENT
  }

  traverse(callback) {
    // STUDENTS IMPLEMENT
  }
}
