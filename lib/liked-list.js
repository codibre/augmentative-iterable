function getStack(bootNode) {
  let first = bootNode;
  let last = bootNode;
  return {
    hasSomething() {
      return !!first;
    },
    push(value) {
      const node = { value };
      if (!last) {
        first = last = node;
      } else {
        node.previous = last;
      }
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
  getStack,
};
