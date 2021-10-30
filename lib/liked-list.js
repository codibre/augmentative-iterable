function getLinkedList() {
  let first;
  let last;
  return {
    hasSomething() {
      return !!first;
    },
    unshift(value) {
      const node = { value };
      if (!first) {
        last = first = node;
      } else {
        node.next = first;
        first.previous = node;
        first = node;
      }
    },
    push(value) {
      const node = { value };
      if (!last) {
        first = last = node;
      } else {
        node.previous = last;
        last = last.next = node;
      }
    },
    next() {
      if (first) {
        const { value } = first;
        first = first.next;
        if (!first) {
          last = first;
        }
        return value;
      }
    },
    peek() {
      if (last) {
        const { value } = last;
        return value;
      }
    },
    pop() {
      if (last) {
        const { value } = last;
        last = last.previous;
        if (!last) {
          first = last;
        }
        return value;
      }
    },
  };
}

module.exports = {
  getLinkedList,
};
