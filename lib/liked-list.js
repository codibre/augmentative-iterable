function getLinkedList(bootNode) {
  let first = bootNode;
  let last = bootNode;
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
        const result = first;
        first = first.next;
        if (!first) {
          last = first;
        }
        return result;
      }
    },
    first() {
      return first;
    },
    last() {
      return last;
    },
    pop() {
      if (last) {
        const result = last;
        last = last.previous;
        if (!last) {
          first = last;
        }
        return result;
      }
    },
  };
}

module.exports = {
  getLinkedList,
};
