class ListNode {
  //Linked List implementation
  constructor(val, next) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

const createLinkedList = (arr) => {
  //create linked list from array
  let head = new ListNode(arr[0]);
  let curr = head;
  for (let i = 1; i < arr.length; i++) {
    curr.next = new ListNode(arr[i]);
    curr = curr.next;
  }
  return head;
};

const findLastNode = (head) => {
  //find last node in linked list
  let curr = head;
  while (curr.next !== null) {
    curr = curr.next;
  }
  return curr;
};

export { ListNode, createLinkedList, findLastNode };
