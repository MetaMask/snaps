export function fib(n: i32): i32 {
    var a = 0, b = 1
    if (n > 0) {
      while (--n) {
        let t = a + b
        a = b
        b = t
      }
      return b
    }
    return a
  }